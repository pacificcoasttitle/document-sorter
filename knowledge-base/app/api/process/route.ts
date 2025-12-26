import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/lib/claude';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userName = formData.get('user_name') as string || 'System';
    const workspaceId = formData.get('workspace_id') as string || '1';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const content = await file.text();
    const entries = await processDocument(content, file.name);

    // Log the upload with workspace
    await pool.query(
      `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name, workspace_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['document_uploaded', 'document', null, `Uploaded: ${file.name}`, userName, parseInt(workspaceId)]
    );

    return NextResponse.json({ 
      entries,
      source_reference: file.name,
      workspace_id: parseInt(workspaceId)
    });
  } catch (error) {
    console.error('Process error:', error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}
