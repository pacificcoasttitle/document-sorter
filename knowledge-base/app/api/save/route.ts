import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { entries, user_name = 'System' } = await request.json();

    const savedEntries = [];

    for (const entry of entries) {
      // Get or create topic
      const topicResult = await pool.query('SELECT id FROM topics WHERE name = $1', [entry.topic]);
      let topicId;
      
      if (topicResult.rows.length === 0) {
        const newTopic = await pool.query('INSERT INTO topics (name) VALUES ($1) RETURNING id', [entry.topic]);
        topicId = newTopic.rows[0].id;

        // Log new topic
        await pool.query(
          `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name)
           VALUES ($1, $2, $3, $4, $5)`,
          ['topic_added', 'topic', topicId, `New topic: ${entry.topic}`, user_name]
        );
      } else {
        topicId = topicResult.rows[0].id;
      }

      // Get or create subtopic
      const subtopicResult = await pool.query('SELECT id FROM subtopics WHERE name = $1 AND topic_id = $2', [entry.subtopic, topicId]);
      let subtopicId;
      
      if (subtopicResult.rows.length === 0) {
        const newSubtopic = await pool.query('INSERT INTO subtopics (topic_id, name) VALUES ($1, $2) RETURNING id', [topicId, entry.subtopic]);
        subtopicId = newSubtopic.rows[0].id;

        // Log new subtopic
        await pool.query(
          `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name)
           VALUES ($1, $2, $3, $4, $5)`,
          ['subtopic_added', 'subtopic', subtopicId, `New subtopic: ${entry.subtopic}`, user_name]
        );
      } else {
        subtopicId = subtopicResult.rows[0].id;
      }

      // Insert entry
      const result = await pool.query(
        `INSERT INTO entries (topic_id, subtopic_id, scenario, required_documents, decision_steps, risk_level, exception_language, source_reference, owner, last_reviewed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [topicId, subtopicId, entry.scenario, entry.required_documents, entry.decision_steps, entry.risk_level, entry.exception_language, entry.source_reference, entry.owner, entry.last_reviewed]
      );

      const savedEntry = result.rows[0];
      savedEntries.push(savedEntry);

      // Log entry creation
      await pool.query(
        `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name)
         VALUES ($1, $2, $3, $4, $5)`,
        ['entry_created', 'entry', savedEntry.id, `Created entry: ${entry.subtopic} - ${entry.scenario.substring(0, 50)}...`, user_name]
      );
    }

    return NextResponse.json({ success: true, entries: savedEntries });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Failed to save entries' }, { status: 500 });
  }
}
