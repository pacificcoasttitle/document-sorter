// Source-only approval authorized by the project owner. Never approves guidance.
// Dry-run by default; requires the exact dry-run digest, actor and backup folder to apply.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const args=process.argv.slice(2), option=name=>args[args.indexOf(name)+1];
const apply=args.includes('--apply');
const dependencyRoot=process.env.PCT_TEST_DEPENDENCIES;
const require=createRequire(dependencyRoot?path.join(dependencyRoot,'package.json'):import.meta.url);
const {Client}=require('pg');
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required.');
const url=new URL(process.env.DATABASE_URL);
for(const key of ['sslmode','sslcert','sslkey','sslrootcert'])url.searchParams.delete(key);
const client=new Client({connectionString:url.toString(),ssl:{rejectUnauthorized:true}});
const actor=args.includes('--actor')?option('--actor'):'';
const backupDir=args.includes('--backup-dir')?option('--backup-dir'):'';
if(apply&&(!actor.trim()||!path.isAbsolute(backupDir)||!args.includes('--expected-digest')))throw new Error('Apply requires actor, absolute backup directory and expected digest.');
try{
 await client.connect();
 await client.query(apply?'BEGIN':'BEGIN READ ONLY');
 await client.query("SET LOCAL lock_timeout='5s'");
 await client.query("SET LOCAL statement_timeout='60s'");
 const parents=(await client.query("SELECT * FROM prelim_references WHERE import_key LIKE 'codebook-2017:%' ORDER BY id"+(apply?' FOR UPDATE':''))).rows;
 const records=(await client.query("SELECT r.* FROM prelim_reference_revisions r JOIN prelim_references p ON p.id=r.reference_id WHERE p.import_key LIKE 'codebook-2017:%' ORDER BY r.id"+(apply?' FOR UPDATE OF r':''))).rows;
 const events=(await client.query("SELECT e.* FROM prelim_reference_events e JOIN prelim_reference_revisions r ON r.id=e.revision_id JOIN prelim_references p ON p.id=r.reference_id WHERE p.import_key LIKE 'codebook-2017:%' ORDER BY e.id")).rows;
 if(parents.length!==1393||records.length!==1393)throw new Error('Unexpected code-book count or additional versions. Manual review required.');
 const completed=records.every(r=>r.status==='source_approved')&&events.filter(e=>e.action==='approve_source_wording').length===1393;
 if(completed){await client.query('ROLLBACK');console.log(JSON.stringify({alreadySourceApproved:1393,changed:0}));}
 else{
  for(const r of records){
   const history=events.filter(e=>e.revision_id===r.id);
   if(r.status!=='draft'||r.version!==1||r.content.wording!==r.source_text||!r.source_text.trim()||!r.content.source.startsWith('PCTC Code Book 5-30-2017.pdf')||history.length!==1||history[0].action!=='import'||JSON.stringify(history[0].snapshot.content)!==JSON.stringify(r.content))throw new Error('A code-book record changed or is not an untouched import. No bulk approval performed.');
  }
  const digest=createHash('sha256').update(JSON.stringify({parents,records,events})).digest('hex');
  console.log(JSON.stringify({mode:apply?'apply':'dry-run',sourceWordingCandidates:records.length,pilotExamplesExcluded:true,guidanceApproval:false,digest}));
  if(!apply)await client.query('ROLLBACK');
  else{
   if(option('--expected-digest')!==digest)throw new Error('Dry-run digest changed. Run a new review.');
   await fs.mkdir(backupDir,{recursive:true});
   const backup=path.join(backupDir,'codebook-before-source-approval-'+Date.now()+'.json');
   await fs.writeFile(backup,JSON.stringify({scope:'codebook-2017 source-only approval',digest,parents,records,events},null,2),{flag:'wx'});
   // Additive schema change and publication happen in the same transaction.
   const migration=await fs.readFile(new URL('../migrations/002_source_wording_approval.sql',import.meta.url),'utf8');
   await client.query(migration.replace(/^BEGIN;\s*$/m,'').replace(/^COMMIT;\s*$/m,''));
   const changed=(await client.query("UPDATE prelim_reference_revisions SET status='source_approved',approved_by=$1,approved_at=NOW(),updated_at=clock_timestamp() WHERE id=ANY($2::int[]) AND status='draft' RETURNING *",[actor,records.map(r=>r.id)])).rows;
   if(changed.length!==1393)throw new Error('Approval count mismatch.');
   for(const r of changed)await client.query('INSERT INTO prelim_reference_events(revision_id,action,actor,snapshot) VALUES($1,$2,$3,$4)',[r.id,'approve_source_wording',actor,r]);
   await client.query('COMMIT');
   console.log(JSON.stringify({sourceWordingApproved:changed.length,backup,unchangedContent:true,guidanceAndFormattingNotApproved:true}));
  }
 }
}catch(error){await client.query('ROLLBACK').catch(()=>{});console.error('Source approval stopped:',error.code||error.message);process.exitCode=1;}finally{await client.end();}
