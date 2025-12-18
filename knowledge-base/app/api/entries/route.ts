import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  console.log('[API] GET /api/entries called');
  
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const riskLevel = searchParams.get('risk_level');
    const search = searchParams.get('search');

    console.log('[API] Entries params:', { topic, riskLevel, search });

    let query = `
      SELECT e.*, t.name as topic_name, s.name as subtopic_name
      FROM entries e
      JOIN topics t ON e.topic_id = t.id
      JOIN subtopics s ON e.subtopic_id = s.id
      WHERE 1=1
    `;
    const params: string[] = [];

    if (topic && topic !== 'All') {
      params.push(topic);
      query += ` AND t.name = $${params.length}`;
    }

    if (riskLevel && riskLevel !== 'All') {
      params.push(riskLevel);
      query += ` AND e.risk_level = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (e.scenario ILIKE $${params.length} OR s.name ILIKE $${params.length})`;
    }

    query += ' ORDER BY e.created_at DESC';

    console.log('[API] Executing entries query...');
    const result = await pool.query(query, params);
    console.log('[API] Entries query success, found:', result.rows.length, 'entries');

    return NextResponse.json({ entries: result.rows });
  } catch (error) {
    console.error('[API] Entries fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch entries',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

