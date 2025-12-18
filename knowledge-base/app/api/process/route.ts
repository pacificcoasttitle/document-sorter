import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/lib/claude';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userName = formData.get('user_name') as string || 'System';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const content = await file.text();
    const entries = await processDocument(content, file.name);

    // Log the upload
    await pool.query(
      `INSERT INTO activity_log (action, entity_type, entity_id, details, user_name)
       VALUES ($1, $2, $3, $4, $5)`,
      ['document_uploaded', 'document', null, `Uploaded: ${file.name}`, userName]
    );

    return NextResponse.json({ 
      entries,
      source_reference: file.name 
    });
  } catch (error) {
    console.error('Process error:', error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}
