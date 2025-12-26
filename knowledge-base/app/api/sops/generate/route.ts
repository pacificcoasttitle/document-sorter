import { NextRequest, NextResponse } from 'next/server';
import { generateSOP, SOPInterviewAnswers } from '@/lib/claude-sop';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, department, answers } = body as {
      title: string;
      department: string;
      answers: SOPInterviewAnswers;
    };

    if (!title || !department || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const generatedSOP = await generateSOP(title, department, answers);

    return NextResponse.json({ success: true, sop: generatedSOP });
  } catch (error) {
    console.error('Error generating SOP:', error);
    return NextResponse.json({ error: 'Failed to generate SOP' }, { status: 500 });
  }
}

