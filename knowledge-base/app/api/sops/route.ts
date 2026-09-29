import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireUser, workflowError } from '@/lib/server-user';
import { sopMutation } from '@/lib/sop-workflow';

export async function GET(request: NextRequest) {
  try {
    const actor = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');
    const departmentId = searchParams.get('department_id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = `
      SELECT s.*, 
        d.name as department_name,
        u.name as owner_name,
        a.name as approved_by_name
      FROM sops s
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN users a ON s.approved_by = a.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (workspaceId) {
      params.push(parseInt(workspaceId));
      query += ` AND s.workspace_id = $${params.length}`;
    }

    if (departmentId && departmentId !== 'all') {
      params.push(parseInt(departmentId));
      query += ` AND s.department_id = $${params.length}`;
    }

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND s.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND s.title ILIKE $${params.length}`;
    }

    if(!['admin','department_head'].includes(actor.role))query += " AND s.status='approved'";
    query += ' ORDER BY s.updated_at DESC';

    const result = await pool.query(query, params);
    
    return NextResponse.json({ sops: result.rows });
  } catch (error) {
    return workflowError(error);
  }
}


export async function POST(request:NextRequest){return sopMutation(request,'create');}

