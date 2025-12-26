import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  console.log('[API] GET /api/topics called');
  
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace_id');

    console.log('[API] Topics params:', { workspaceId });

    let topicsQuery = 'SELECT * FROM topics';
    let subtopicsQuery = 'SELECT * FROM subtopics';
    const params: (string | number)[] = [];

    if (workspaceId) {
      params.push(parseInt(workspaceId));
      topicsQuery += ` WHERE workspace_id = $1`;
      // Subtopics are linked via topics, so we need a join
      subtopicsQuery = `
        SELECT s.* FROM subtopics s
        JOIN topics t ON s.topic_id = t.id
        WHERE t.workspace_id = $1
      `;
    }

    topicsQuery += ' ORDER BY name';
    subtopicsQuery += ' ORDER BY name';

    console.log('[API] Executing topics query...');
    const topicsResult = await pool.query(topicsQuery, params);
    console.log('[API] Topics found:', topicsResult.rows.length);
    
    console.log('[API] Executing subtopics query...');
    const subtopicsResult = await pool.query(subtopicsQuery, params);
    console.log('[API] Subtopics found:', subtopicsResult.rows.length);

    return NextResponse.json({
      topics: topicsResult.rows,
      subtopics: subtopicsResult.rows
    });
  } catch (error) {
    console.error('[API] Topics fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch topics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
