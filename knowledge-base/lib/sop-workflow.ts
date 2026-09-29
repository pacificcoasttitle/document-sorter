import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireUser,AccessError,workflowError } from '@/lib/server-user';

const fields=['title','purpose','scope','responsible_party','trigger_event','steps','exceptions','related_policies','effective_date','review_date','department_id'] as const;
export async function sopMutation(request:NextRequest,action:'create'|'update'|'submit'|'approve'|'delete',id?:string){
 let client;
 try{
  const user=await requireUser(request);
  if(!['admin','department_head'].includes(user.role))throw new AccessError('Editing requires a reviewer account.',403);
  const origin=request.headers.get('origin');if(origin&&origin!==request.nextUrl.origin)throw new AccessError('Cross-origin request rejected.',403);
  let body:Record<string,unknown>={};
  if(action==='create'||action==='update'){try{body=await request.json();if(!body||Array.isArray(body)||typeof body!=='object')throw new Error();}catch{throw new AccessError('Invalid request.',400);}}
  for(const field of fields){const value=body[field];if(value!=null&&field!=='department_id'&&(typeof value!=='string'||value.length>100000))throw new AccessError('Invalid '+field,400);}
  if(body.department_id!=null&&(!Number.isInteger(Number(body.department_id))||Number(body.department_id)<1))throw new AccessError('Invalid department.',400);
  for(const field of ['effective_date','review_date'])if(body[field]==='')body[field]=null;
  if(body.title!==undefined&&(typeof body.title!=='string'||!body.title.trim()))throw new AccessError('A title is required.',400);
  client=await pool.connect();await client.query('BEGIN');
  let result;
  if(action==='create'){
   if(!body.title)throw new AccessError('A title is required.',400);
   const status=body.status||'draft';if(!['draft','pending'].includes(String(status)))throw new AccessError('New SOPs must be drafts or submitted for review.',400);
   const workspace=(await client.query("SELECT id FROM workspaces WHERE slug='operations'")).rows[0];
   if(!workspace||Number(body.workspace_id)!==workspace.id)throw new AccessError('SOPs belong in Operations.',400);
   if(!Number.isInteger(Number(body.department_id))||!(await client.query('SELECT id FROM departments WHERE id=$1 AND workspace_id=$2',[body.department_id,workspace.id])).rowCount)throw new AccessError('Choose an Operations department.',400);
   result=(await client.query(`INSERT INTO sops(workspace_id,${fields.join(',')},status,owner_id) VALUES(${Array.from({length:14},(_,i)=>'$'+(i+1)).join(',')}) RETURNING *`,[workspace.id,...fields.map(f=>body[f]||null),status,user.id])).rows[0];
  }else{
   if(!id||!/^\d+$/.test(id))throw new AccessError('Invalid procedure.',400);
   const sop=(await client.query('SELECT * FROM sops WHERE id=$1 FOR UPDATE',[id])).rows[0];
   if(!sop)throw new AccessError('SOP not found.',404);
   const allowed=user.role==='admin'||sop.owner_id===user.id;
   if(action==='approve'){
    if(user.role!=='admin')throw new AccessError('Only admins can approve SOPs.',403);
    if(sop.status!=='pending')throw new AccessError('Only pending SOPs can be approved.',409);
    result=(await client.query("UPDATE sops SET status='approved',approved_by=$1,approved_at=NOW(),updated_at=clock_timestamp() WHERE id=$2 RETURNING *",[user.id,id])).rows[0];
   }else{
    if(!allowed)throw new AccessError('You cannot change this procedure.',403);
    if(action==='submit'){
     if(sop.status!=='draft')throw new AccessError('Only drafts can be submitted.',409);
     result=(await client.query("UPDATE sops SET status='pending',updated_at=clock_timestamp() WHERE id=$1 RETURNING *",[id])).rows[0];
    }else if(action==='delete'){
     if(sop.status!=='draft')throw new AccessError('Only drafts can be deleted.',409);
     await client.query('DELETE FROM sops WHERE id=$1',[id]);result=sop;
    }else{
     if(sop.status==='pending')throw new AccessError('This SOP is awaiting approval and cannot be edited.',409);
     if(sop.status==='approved'&&user.role!=='admin')throw new AccessError('Only admins can revise approved SOPs.',403);
     if(body.department_id!=null&&!(await client.query('SELECT id FROM departments WHERE id=$1 AND workspace_id=$2',[body.department_id,sop.workspace_id])).rowCount)throw new AccessError('Choose a department in this workspace.',400);
     result=(await client.query(`UPDATE sops SET ${fields.map((f,i)=>f+'=COALESCE($'+(i+1)+','+f+')').join(',')},status='draft',approved_by=NULL,approved_at=NULL,updated_at=clock_timestamp() WHERE id=$12 RETURNING *`,[...fields.map(f=>body[f]??null),id])).rows[0];
    }
   }
  }
  const verbs={create:'created',update:'updated',submit:'submitted',approve:'approved',delete:'deleted'};
  await client.query(`INSERT INTO activity_log(action,entity_type,entity_id,details,user_name,workspace_id) VALUES($1,'sop',$2,$3,$4,$5)`,['sop_'+verbs[action],result.id,action+': '+result.title,user.name,result.workspace_id]);
  await client.query('COMMIT');return NextResponse.json({success:true,...(action!=='delete'?{sop:result}:{})});
 }catch(error){if(client)await client.query('ROLLBACK');return workflowError(error);}finally{client?.release();}
}
