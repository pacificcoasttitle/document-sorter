import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { user_name } = body;

    // Check if SOP exists
    const existing = await pool.query('SELECT * FROM sops WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'SOP not found' }, { status: 404 });
    }

    const sop = existing.rows[0];

    if (sop.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft SOPs can be submitted' }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE sops SET status = 'pending', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name, workspace_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['sop_submitted', 'sop', id, `Submitted SOP for approval: ${sop.title}`, user_name || 'System', sop.workspace_id]
    );

    return NextResponse.json({ success: true, sop: result.rows[0] });
  } catch (error) {
    console.error('Error submitting SOP:', error);
    return NextResponse.json({ error: 'Failed to submit SOP' }, { status: 500 });
  }
}

