import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    return NextResponse.json({ sop: result.rows[0] });
  } catch (error) {
    console.error('Error fetching SOP:', error);
    return NextResponse.json({ error: 'Failed to fetch SOP' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
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
      department_id,
      user_name,
      user_id,
      user_role
    } = body;

    // Check if SOP exists and get current state
    const existing = await pool.query('SELECT * FROM sops WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
    }

    const sop = existing.rows[0];

    // Check permissions
    const isOwner = sop.owner_id === user_id;
    const isAdmin = user_role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to edit this SOP' }, { status: 403 });
    }

    if (sop.status === 'approved' && !isAdmin) {
      return NextResponse.json({ error: 'Only admins can edit approved SOPs' }, { status: 403 });
    }

    const result = await pool.query(
      `UPDATE sops SET
        title = COALESCE($1, title),
        purpose = COALESCE($2, purpose),
        scope = COALESCE($3, scope),
        responsible_party = COALESCE($4, responsible_party),
        trigger_event = COALESCE($5, trigger_event),
        steps = COALESCE($6, steps),
        exceptions = COALESCE($7, exceptions),
        related_policies = COALESCE($8, related_policies),
        effective_date = COALESCE($9, effective_date),
        review_date = COALESCE($10, review_date),
        department_id = COALESCE($11, department_id),
        updated_at = NOW()
      WHERE id = $12
      RETURNING *`,
      [
        title, purpose, scope, responsible_party, trigger_event,
        steps, exceptions, related_policies, effective_date, review_date,
        department_id, id
      ]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name, workspace_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['sop_updated', 'sop', id, `Updated SOP: ${result.rows[0].title}`, user_name || 'System', sop.workspace_id]
    );

    return NextResponse.json({ success: true, sop: result.rows[0] });
  } catch (error) {
    console.error('Error updating SOP:', error);
    return NextResponse.json({ error: 'Failed to update SOP' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const userRole = searchParams.get('user_role');
    const userName = searchParams.get('user_name');

    // Check if SOP exists
    const existing = await pool.query('SELECT * FROM sops WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
    }

    const sop = existing.rows[0];

    // Check permissions
    const isOwner = sop.owner_id === parseInt(userId || '0');
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Not authorized to delete this SOP' }, { status: 403 });
    }

    if (sop.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft SOPs can be deleted' }, { status: 403 });
    }

    await pool.query('DELETE FROM sops WHERE id = $1', [id]);

    // Log activity
    await pool.query(
      `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name, workspace_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['sop_deleted', 'sop', id, `Deleted SOP: ${sop.title}`, userName || 'System', sop.workspace_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting SOP:', error);
    return NextResponse.json({ error: 'Failed to delete SOP' }, { status: 500 });
  }
}

