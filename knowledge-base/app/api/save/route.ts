import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { entries, user_name = 'System', workspace_id = 1 } = await request.json();

    const savedEntries = [];

    for (const entry of entries) {
      // Get or create topic (with workspace_id)
      const topicResult = await pool.query(
        'SELECT id FROM topics WHERE name = $1 AND workspace_id = $2', 
        [entry.topic, workspace_id]
      );
      let topicId;
      
      if (topicResult.rows.length === 0) {
        const newTopic = await pool.query(
          'INSERT INTO topics (name, workspace_id) VALUES ($1, $2) RETURNING id', 
          [entry.topic, workspace_id]
        );
        topicId = newTopic.rows[0].id;

        // Log new topic
        await pool.query(
          `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name, workspace_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          ['topic_added', 'topic', topicId, `New topic: ${entry.topic}`, user_name, workspace_id]
        );
      } else {
        topicId = topicResult.rows[0].id;
      }

      // Get or create subtopic
      const subtopicResult = await pool.query(
        'SELECT id FROM subtopics WHERE name = $1 AND topic_id = $2', 
        [entry.subtopic, topicId]
      );
      let subtopicId;
      
      if (subtopicResult.rows.length === 0) {
        const newSubtopic = await pool.query(
          'INSERT INTO subtopics (topic_id, name) VALUES ($1, $2) RETURNING id', 
          [topicId, entry.subtopic]
        );
        subtopicId = newSubtopic.rows[0].id;

        // Log new subtopic
        await pool.query(
          `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name, workspace_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          ['subtopic_added', 'subtopic', subtopicId, `New subtopic: ${entry.subtopic}`, user_name, workspace_id]
        );
      } else {
        subtopicId = subtopicResult.rows[0].id;
      }

      // Insert entry (with workspace_id)
      const result = await pool.query(
        `INSERT INTO entries (topic_id, subtopic_id, scenario, required_documents, decision_steps, risk_level, exception_language, source_reference, owner, last_reviewed, workspace_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [topicId, subtopicId, entry.scenario, entry.required_documents, entry.decision_steps, entry.risk_level, entry.exception_language, entry.source_reference, entry.owner, entry.last_reviewed, workspace_id]
      );

      const savedEntry = result.rows[0];
      savedEntries.push(savedEntry);

      // Log entry creation
      await pool.query(
        `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name, workspace_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        ['entry_created', 'entry', savedEntry.id, `Created entry: ${entry.subtopic} - ${entry.scenario.substring(0, 50)}...`, user_name, workspace_id]
      );
    }

    return NextResponse.json({ success: true, entries: savedEntries });
  } catch (error) {
    console.error('Save error:', error);
    return NextResponse.json({ error: 'Failed to save entries' }, { status: 500 });
  }
}
