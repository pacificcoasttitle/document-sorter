import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  console.log('[API] GET /api/activity called');
  
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter');
    const limit = searchParams.get('limit') || '50';

    console.log('[API] Activity params:', { filter, limit });

    let query = `
      SELECT * FROM activity_log
      WHERE 1=1
    `;
    const params: (string[] | number)[] = [];

    if (filter && filter !== 'All Activity') {
      const actionMap: Record<string, string[]> = {
        'Uploads': ['document_uploaded'],
        'Edits': ['entry_updated'],
        'Deletions': ['entry_deleted'],
        'Created': ['entry_created', 'topic_added', 'subtopic_added']
      };
      
      if (actionMap[filter]) {
        params.push(actionMap[filter]);
        query += ` AND action = ANY($${params.length})`;
      }
    }

    params.push(parseInt(limit));
    query += ` ORDER BY created_at DESC LIMIT $${params.length}`;

    console.log('[API] Executing activity query...');
    const result = await pool.query(query, params);
    console.log('[API] Activity query success, found:', result.rows.length, 'activities');

    return NextResponse.json({ activities: result.rows });
  } catch (error) {
    console.error('[API] Activity fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, entity_type, entity_id, details, user_name } = await request.json();

    const result = await pool.query(
      `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [action, entity_type, entity_id, details, user_name]
    );

    return NextResponse.json({ success: true, activity: result.rows[0] });
  } catch (error) {
    console.error('Activity log error:', error);
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
  }
}

