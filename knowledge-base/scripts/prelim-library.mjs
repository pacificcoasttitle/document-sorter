// Node 22.18+; read-only dry run unless --apply is explicitly supplied.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { validateContent, emptyReference } from '../lib/prelim-reference.ts';

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const option = name => { const i=args.indexOf(name); return i<0?null:args[i+1]; };
const codebook=option('--codebook'), pilot=option('--pilot');
const records=[];
if(codebook) for(const r of JSON.parse(fs.readFileSync(codebook,'utf8').replace(/^\uFEFF/,''))) {
  records.push({key:`codebook-2017:${r.sequence}`,source:r.body,content:validateContent({
    ...emptyReference,code:r.code,title:`${r.code} — ${r.body.slice(0,90)}${r.body.length>90?'…':''}`,
    topic:r.topic_tags||'Other',wording:r.body,
    source:`PCTC Code Book 5-30-2017.pdf · pages ${r.source_page_start}–${r.source_page_end} · source row ${r.source_row}`,
    formatNotes:`DRAFT: presentation standards require review. Preserve original placeholders and legal wording.${r.internal_notes?' Source audit: '+r.internal_notes:''}`,
  })});
}
const labels=['Tax Identification No.:','Fiscal Year:','1st Installment:','2nd Installment:','Exemption:','Land:','Improvements:','Personal Property:','Granted to:','Purpose:','Recording Date:','Recording No:','Recording No.:','Affects:','Amount:','Dated:','Trustor:','Trustee:','Beneficiary:','Lender:','Loan No.:','Party(s):','NOTE:','Name of Trust:'];
if(pilot) for(const [i,r] of JSON.parse(fs.readFileSync(pilot,'utf8').replace(/^\uFEFF/,'')).entries()) {
  let wording=r.source_text;
  const boldPhrases=labels.filter(label=>wording.includes(label));
  for(const label of boldPhrases) wording=wording.split(label).join('\n'+label);
  records.push({key:`presentation-pilot:${i+1}`,source:r.source_text,content:validateContent({
    ...emptyReference,code:`PILOT-${i+1}`,title:r.proposed_heading,topic:'Presentation pilot',
    matterType:r.proposed_heading.split(' ')[0],wording,boldPhrases,
    scenario:'Case-specific formatting example only. A reviewer must define when this wording applies before publication.',
    guidance:'Review the cited source and confirm applicability. Names, amounts and recording information belong to the sample transaction; they are not reusable instructions.',
    formatNotes:'DRAFT recommendation: '+r.review_decision,
    source:`${path.win32.basename(r.source)} · page ${r.page} · case-specific example; not a universal code`,
  })});
}
if(!codebook&&!pilot&&!args.includes('--migrate')) throw new Error('Supply --codebook PATH, --pilot PATH or --migrate. Nothing is written without --apply.');
if(new Set(records.map(r=>r.key)).size!==records.length) throw new Error('Duplicate import keys.');
console.log(JSON.stringify({mode:apply?'apply':'dry-run',drafts:records.length,sourceDigest:createHash('sha256').update(JSON.stringify(records)).digest('hex')},null,2));
if(apply) {
  if(!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required. No database was changed.');
  const {default:pg}=await import('pg');
  const client=new pg.Client({connectionString:process.env.DATABASE_URL});
  await client.connect();
  try {
    if(args.includes('--migrate')) await client.query(fs.readFileSync(new URL('../migrations/001_prelim_references.sql',import.meta.url),'utf8'));
    await client.query('BEGIN'); let inserted=0;
    for(const r of records) {
      const parent=await client.query('INSERT INTO prelim_references(import_key) VALUES($1) ON CONFLICT(import_key) DO NOTHING RETURNING id',[r.key]);
      if(!parent.rowCount) continue; // Never overwrite reviewed or edited material on reimport.
      const rev=await client.query(`INSERT INTO prelim_reference_revisions(reference_id,version,content,source_text,created_by) VALUES($1,1,$2,$3,'Source import — unapproved') RETURNING *`,[parent.rows[0].id,r.content,r.source]);
      await client.query(`INSERT INTO prelim_reference_events(revision_id,action,actor,snapshot) VALUES($1,'import','Source import — unapproved',$2)`,[rev.rows[0].id,rev.rows[0]]);
      inserted++;
    }
    await client.query('COMMIT');console.log(`Inserted ${inserted} drafts; skipped ${records.length-inserted} existing references.`);
  } catch(e) {await client.query('ROLLBACK');throw e;} finally {await client.end();}
}
