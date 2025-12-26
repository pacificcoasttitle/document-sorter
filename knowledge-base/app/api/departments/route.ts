import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    let query = 'SELECT * FROM departments';
    const params: number[] = [];

    if (workspaceId) {
      params.push(parseInt(workspaceId));
      query += ' WHERE workspace_id = $1';
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    
    return NextResponse.json({ departments: result.rows });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

