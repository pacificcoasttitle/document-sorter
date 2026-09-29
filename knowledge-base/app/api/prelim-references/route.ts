import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import { canTransition, validateContent, ReferenceRevision } from '@/lib/prelim-reference';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
class RequestError extends Error { constructor(message:string,public status:number){super(message);} }
async function actor(req: NextRequest) {
  if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) throw new RequestError('Reference library needs the application database and login configuration.',503);
  let id: number;
  try {
    const token=jwt.verify(req.cookies.get('auth-token')?.value || '',process.env.JWT_SECRET) as jwt.JwtPayload;
    id=token.userId;
    if(!Number.isInteger(id)) throw new Error();
  } catch { throw new RequestError('Please sign in.',401); }
  const result=await pool.query('SELECT id,name,role FROM users WHERE id=$1',[id]);
  if(!result.rows[0]) throw new RequestError('Please sign in.',401);
  return result.rows[0] as {id:number; name:string; role:string};
}
function failure(e:unknown) {
  if(e instanceof RequestError) return NextResponse.json({error:e.message},{status:e.status});
  if((e as {code?:string}).code==='23505') return NextResponse.json({error:'A conflicting revision already exists. Reload the reference.'},{status:409});
  if((e as {code?:string}).code==='42P01') return NextResponse.json({error:'Reference library setup is not complete. Apply its database migration.'},{status:503});
  console.error('Prelim reference operation failed', (e as {code?:string}).code || 'unknown');
  return NextResponse.json({error:'Unable to complete the reference request.'},{status:500});
}
export async function GET(req:NextRequest) {
  try {
    const user=await actor(req), editor=['admin','department_head'].includes(user.role);
    const history=req.nextUrl.searchParams.get('history');
    if(history) {
      if(!editor) throw new RequestError('History requires reviewer access.',403);
      const id=Number(history);
      if(!Number.isInteger(id)||id<1) throw new RequestError('Invalid reference.',400);
      const events=await pool.query(`SELECT e.action,e.actor,e.at,r.version FROM prelim_reference_events e
        JOIN prelim_reference_revisions r ON r.id=e.revision_id WHERE r.reference_id=$1 ORDER BY e.id DESC`,[id]);
      return NextResponse.json({events:events.rows},{headers:{'Cache-Control':'no-store'}});
    }
    const view=req.nextUrl.searchParams.get('view') || 'published';
    const result=await pool.query(`SELECT * FROM prelim_reference_revisions
      WHERE ($1::boolean OR status IN ('approved','source_approved'))
      AND ($2='all' OR ($2='published' AND status IN ('approved','source_approved')) OR status=$2)
      ORDER BY reference_id,version DESC`,[editor,editor?view:((view==='all'||view==='published')?'published':view)]);
    return NextResponse.json({revisions:result.rows,canEdit:editor,canApprove:user.role==='admin'}, {headers:{'Cache-Control':'no-store'}});
  }catch(e){return failure(e);}
}
export async function POST(req:NextRequest) {
  let client;
  try {
    const origin=req.headers.get('origin');
    if(origin && origin!==req.nextUrl.origin) throw new RequestError('Cross-origin changes are not permitted.',403);
    const user=await actor(req);
    if(!['admin','department_head'].includes(user.role)) throw new RequestError('Editing requires an administrator or department head.',403);
    let body;
    try{body=await req.json();}catch{throw new RequestError('Invalid request.',400);}
    if(!body || typeof body!=='object') throw new RequestError('Invalid request.',400);
    const action=body.action;
    const actions=['create','save','revise','submit','return','approve','retire'];
    if(!actions.includes(action)) throw new RequestError('Unknown action.',400);
    let content;
    if(action==='create' || action==='save') {
      try{content=validateContent(body.content);}catch(e){throw new RequestError((e as Error).message,400);}
    }
    client=await pool.connect();await client.query('BEGIN');
    let record:ReferenceRevision;
    const identity=`${user.name} (user ${user.id})`;
    if(action==='create') {
      const parent=await client.query('INSERT INTO prelim_references DEFAULT VALUES RETURNING id');
      const result=await client.query(`INSERT INTO prelim_reference_revisions(reference_id,version,content,source_text,created_by)
        VALUES($1,1,$2,$3,$4) RETURNING *`,[parent.rows[0].id,content,content!.wording,identity]);
      record=result.rows[0];
    } else {
      if(!Number.isInteger(body.id)) throw new RequestError('Invalid revision.',400);
      // Serialize operations across all versions of the same reference.
      const parent=await client.query('SELECT reference_id FROM prelim_reference_revisions WHERE id=$1',[body.id]);
      if(!parent.rows[0]) throw new RequestError('Reference not found.',404);
      await client.query('SELECT id FROM prelim_references WHERE id=$1 FOR UPDATE',[parent.rows[0].reference_id]);
      const old=(await client.query('SELECT * FROM prelim_reference_revisions WHERE id=$1',[body.id])).rows[0] as ReferenceRevision;
      if(!body.updatedAt || new Date(old.updated_at).toISOString()!==body.updatedAt) throw new RequestError('This reference changed. Reload it before editing.',409);
      if(action==='revise') {
        if(!['approved','source_approved','retired'].includes(old.status)) throw new RequestError('Only published or retired references can be revised.',409);
        const working=await client.query("SELECT id FROM prelim_reference_revisions WHERE reference_id=$1 AND status IN ('draft','pending')",[old.reference_id]);
        if(working.rowCount) throw new RequestError('A working revision already exists.',409);
        record=(await client.query(`INSERT INTO prelim_reference_revisions(reference_id,version,content,source_text,created_by)
          SELECT $1,MAX(version)+1,$2,$3,$4 FROM prelim_reference_revisions WHERE reference_id=$1 RETURNING *`,[old.reference_id,old.content,old.source_text,identity])).rows[0];
      } else if(action==='save') {
        if(old.status!=='draft') throw new RequestError('Only drafts can be edited.',409);
        record=(await client.query('UPDATE prelim_reference_revisions SET content=$1,updated_at=clock_timestamp() WHERE id=$2 RETURNING *',[content,old.id])).rows[0];
      } else {
        if(!canTransition(old.status,action,user.role)) throw new RequestError('This action is not available for this status or role.',403);
        if(action==='submit' || action==='approve') {
          const v=old.content;
          if(!v.scenario.trim() || !v.guidance.trim() || !v.formatNotes.trim() || v.matterType==='Unclassified') throw new RequestError('Complete the scenario, guidance, matter type and formatting notes before review.',400);
        }
        const status={submit:'pending',return:'draft',approve:'approved',retire:'retired'}[action as 'submit'|'return'|'approve'|'retire'];
        if(action==='approve') {
          const retired=await client.query("UPDATE prelim_reference_revisions SET status='retired',updated_at=clock_timestamp() WHERE reference_id=$1 AND status IN ('approved','source_approved') RETURNING *",[old.reference_id]);
          for(const previous of retired.rows) await client.query('INSERT INTO prelim_reference_events(revision_id,action,actor,snapshot) VALUES($1,$2,$3,$4)',[previous.id,'superseded',identity,previous]);
        }
        record=(await client.query(`UPDATE prelim_reference_revisions SET status=$1,updated_at=clock_timestamp(),
          approved_by=CASE WHEN $1='approved' THEN $3 ELSE approved_by END,
          approved_at=CASE WHEN $1='approved' THEN NOW() ELSE approved_at END WHERE id=$2 RETURNING *`,[status,old.id,identity])).rows[0];
      }
    }
    await client.query('INSERT INTO prelim_reference_events(revision_id,action,actor,snapshot) VALUES($1,$2,$3,$4)',[record.id,action,identity,record]);
    await client.query('COMMIT');return NextResponse.json({revision:record});
  }catch(e){if(client)await client.query('ROLLBACK');return failure(e);}finally{client?.release();}
}
