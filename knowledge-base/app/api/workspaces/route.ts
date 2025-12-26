import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT w.*, 
        COALESCE(json_agg(d.*) FILTER (WHERE d.id IS NOT NULL), '[]') as departments
      FROM workspaces w
      LEFT JOIN departments d ON d.workspace_id = w.id
      GROUP BY w.id
      ORDER BY w.name
    `);

    console.log('Workspaces fetched:', result.rows.length);

    return NextResponse.json({ workspaces: result.rows });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

