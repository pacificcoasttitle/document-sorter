import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET single entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await pool.query(
      `SELECT e.*, t.name as topic_name, s.name as subtopic_name
       FROM entries e
       JOIN topics t ON e.topic_id = t.id
       JOIN subtopics s ON e.subtopic_id = s.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ entry: result.rows[0] });
  } catch (error) {
    console.error('Entry fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch entry' }, { status: 500 });
  }
}

// UPDATE entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { entry, user_name = 'System' } = await request.json();

    const result = await pool.query(
      `UPDATE entries 
       SET scenario = $1, required_documents = $2, decision_steps = $3, 
           risk_level = $4, exception_language = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [entry.scenario, entry.required_documents, entry.decision_steps, 
       entry.risk_level, entry.exception_language, id]
    );

    // Log update
    await pool.query(
      `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name)
       VALUES ($1, $2, $3, $4, $5)`,
      ['entry_updated', 'entry', id, `Updated entry: ${entry.scenario.substring(0, 50)}...`, user_name]
    );

    return NextResponse.json({ success: true, entry: result.rows[0] });
  } catch (error) {
    console.error('Entry update error:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}

// DELETE entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user_name = 'System' } = await request.json();

    // Get entry details before deleting
    const entryResult = await pool.query('SELECT * FROM entries WHERE id = $1', [id]);
    
    if (entryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    await pool.query('DELETE FROM entries WHERE id = $1', [id]);

    // Log deletion
    await pool.query(
      `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name)
       VALUES ($1, $2, $3, $4, $5)`,
      ['entry_deleted', 'entry', id, `Deleted entry ID: ${id}`, user_name]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Entry delete error:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}


