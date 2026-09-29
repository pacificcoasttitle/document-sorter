import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireUser, workflowError } from '@/lib/server-user';
import { sopMutation } from '@/lib/sop-workflow';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requireUser(request);
    const { id } = await params;

    const result = await pool.query(
      `SELECT s.*, 
        d.name as department_name,
        u.name as owner_name,
        a.name as approved_by_name
      FROM sops s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN users a ON s.approved_by = a.id
      WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
    }

    if(!['admin','department_head'].includes(actor.role)&&result.rows[0].status!=='approved')return NextResponse.json({error:'This procedure is not approved.'},{status:403});
    return NextResponse.json({ sop: result.rows[0] });
  } catch (error) {
    return workflowError(error);
  }
}


export async function PUT(request:NextRequest,{params}:{params:Promise<{id:string}>}){return sopMutation(request,'update',(await params).id);}
export async function DELETE(request:NextRequest,{params}:{params:Promise<{id:string}>}){return sopMutation(request,'delete',(await params).id);}

