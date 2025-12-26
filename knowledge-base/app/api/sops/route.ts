import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
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

    query += ' ORDER BY s.updated_at DESC';

    const result = await pool.query(query, params);
    
    return NextResponse.json({ sops: result.rows });
  } catch (error) {
    console.error('Error fetching SOPs:', error);
    return NextResponse.json({ error: 'Failed to fetch SOPs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workspace_id,
      department_id,
      title,
      purpose,
      scope,
      responsible_party,
      trigger_event,
      steps,
      exceptions,
      related_policies,
      effective_date,
      review_date,
      status = 'draft',
      owner_id,
      user_name
    } = body;

    const result = await pool.query(
      `INSERT INTO sops (
        workspace_id, department_id, title, purpose, scope, 
        responsible_party, trigger_event, steps, exceptions, 
        related_policies, effective_date, review_date, status, owner_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        workspace_id, department_id, title, purpose, scope,
        responsible_party, trigger_event, steps, exceptions,
        related_policies, effective_date, review_date, status, owner_id
      ]
    );

    const sop = result.rows[0];

    // Log activity
    await pool.query(
      `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name, workspace_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['sop_created', 'sop', sop.id, `Created SOP: ${title}`, user_name || 'System', workspace_id]
    );

    return NextResponse.json({ success: true, sop });
  } catch (error) {
    console.error('Error creating SOP:', error);
    return NextResponse.json({ error: 'Failed to create SOP' }, { status: 500 });
  }
}

