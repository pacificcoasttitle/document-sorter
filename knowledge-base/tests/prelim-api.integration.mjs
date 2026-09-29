// Isolated test dependencies: @electric-sql/pglite and esbuild. No external DB used.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { PGlite } from '@electric-sql/pglite';
import { build } from 'esbuild';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server.js';
import { emptyReference } from '../lib/prelim-reference.ts';

test('database-backed reference lifecycle and access controls',async()=>{
 const db=new PGlite();
 const dir=await fs.mkdtemp(path.join(process.cwd(),'.prelim-test-'));
 try{
  await db.exec(await fs.readFile(new URL('../migrations/001_prelim_references.sql',import.meta.url),'utf8'));
  await db.exec("CREATE TABLE users(id INTEGER PRIMARY KEY,name TEXT,role TEXT); INSERT INTO users VALUES(1,'Reviewer','admin'),(2,'Head','department_head'),(3,'Reader','viewer');");
  const pool={query:async(sql,values)=>{const r=await db.query(sql,values);return {rows:r.rows,rowCount:r.rows.length||r.affectedRows||0};},connect:async()=>({...pool,release(){}})};
  globalThis.__prelimTestPool=pool;
  const outfile=path.join(dir,'route.cjs');
  await build({entryPoints:['app/api/prelim-references/route.ts'],outfile,bundle:true,platform:'node',format:'cjs',packages:'external',plugins:[{name:'test-db',setup(b){b.onResolve({filter:/^@\/lib\/db$/},()=>({path:'mock-db',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export default globalThis.__prelimTestPool;'}));}}]});
  process.env.DATABASE_URL='isolated-test';process.env.JWT_SECRET='isolated-test-only-not-a-deployment-secret';
  const route=createRequire(import.meta.url)(outfile);
  const request=(id,body,query='')=>new NextRequest('http://localhost/api/prelim-references'+query,{method:body?'POST':'GET',headers:{cookie:'auth-token='+jwt.sign({userId:id},process.env.JWT_SECRET),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const change=async(id,action,r,content)=>route.POST(request(id,{action,id:r?.id,updatedAt:r?.updated_at,content}));
  const content={...emptyReference,title:'Test reference',wording:'Amount: [AMOUNT]',source:'Test fixture',scenario:'Test only',guidance:'Test only',matterType:'Exception',formatNotes:'Bold the field label.',boldPhrases:['Amount:']};
  assert.equal((await route.GET(new NextRequest('http://localhost/api/prelim-references'))).status,401);
  assert.equal((await change(3,'create',null,content)).status,403);
  let response=await change(2,'create',null,content);assert.equal(response.status,200);
  let r=(await response.json()).revision;
  assert.equal((await (await route.GET(request(3,null,'?view=all'))).json()).revisions.length,0);
  const stale={...r,updated_at:'2000-01-01T00:00:00.000Z'};
  assert.equal((await change(2,'save',stale,content)).status,409);
  r=(await (await change(2,'submit',r)).json()).revision;
  assert.equal((await change(2,'approve',r)).status,403);
  assert.equal((await change(1,'save',r,content)).status,409);
  r=(await (await change(1,'approve',r)).json()).revision;
  assert.equal(r.status,'approved');assert.match(r.approved_by,/Reviewer/);
  let draft=(await (await change(2,'revise',r)).json()).revision;
  assert.equal(draft.version,2);
  assert.equal((await change(2,'revise',r)).status,409);
  let visible=(await (await route.GET(request(3,null,'?view=all'))).json()).revisions;
  assert.equal(visible.length,1);assert.equal(visible[0].version,1);
  draft=(await (await change(2,'submit',draft)).json()).revision;
  draft=(await (await change(1,'approve',draft)).json()).revision;
  visible=(await (await route.GET(request(3,null))).json()).revisions;
  assert.equal(visible.length,1);assert.equal(visible[0].version,2);
  assert.equal((await route.GET(request(3,null,'?history='+r.reference_id))).status,403);
  const events=(await (await route.GET(request(1,null,'?history='+r.reference_id))).json()).events;
  assert.ok(events.some(e=>e.action==='superseded'));
  assert.equal((await change(1,'retire',draft)).status,200);
  assert.equal((await (await route.GET(request(3,null))).json()).revisions.length,0);
 }finally{await db.close();delete globalThis.__prelimTestPool;await fs.rm(dir,{recursive:true,force:true});}
});
