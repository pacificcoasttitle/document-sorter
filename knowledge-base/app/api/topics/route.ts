import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  console.log('[API] GET /api/topics called');
  
  try {
    console.log('[API] Executing topics query...');
    const topicsResult = await pool.query('SELECT * FROM topics ORDER BY name');
    console.log('[API] Topics found:', topicsResult.rows.length);
    
    console.log('[API] Executing subtopics query...');
    const subtopicsResult = await pool.query('SELECT * FROM subtopics ORDER BY name');
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

