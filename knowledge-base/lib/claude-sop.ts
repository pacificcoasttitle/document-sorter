import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface SOPInterviewAnswers {
  responsible_party: string;
  trigger_event: string;
  steps: string;
  exceptions: string;
  related_policies: string;
}

export interface GeneratedSOP {
  purpose: string;
  scope: string;
  responsible_party: string;
  trigger_event: string;
  steps: string;
  exceptions: string;
  related_policies: string;
  review_date: string;
}

const generateSOPPrompt = `You are an expert at creating Standard Operating Procedures (SOPs) for businesses.

Based on the interview answers provided, create a formal, well-structured SOP.

Format the output as JSON with these fields:
- purpose: 2-3 sentences explaining why this procedure exists
- scope: Who does this apply to? When does it apply?
- responsible_party: Who performs this procedure
- trigger_event: What initiates this process
- steps: Numbered step-by-step instructions (be detailed and clear, use \\n for line breaks)
- exceptions: When does this procedure NOT apply, or what variations exist
- related_policies: Any related procedures or policies (if mentioned)
- review_date: Suggest a review date in YYYY-MM-DD format (typically 1 year from now)

Guidelines:
- Use clear, actionable language
- Each step should be specific and unambiguous
- Include any warnings or important notes within relevant steps
- Be thorough but concise
- Format steps as a numbered list with line breaks

Return ONLY valid JSON, no explanation.`;

export async function generateSOP(
  title: string,
  department: string,
  answers: SOPInterviewAnswers
): Promise<GeneratedSOP> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: generateSOPPrompt,
    messages: [
      {
        role: 'user',
        content: `Please create an SOP for the following:

Title: ${title}
Department: ${department}

Interview Answers:
1. Who is responsible for performing this task?
   "${answers.responsible_party}"

2. What triggers this process? When does it start?
   "${answers.trigger_event}"

3. Walk me through the steps from start to finish:
   "${answers.steps}"

4. Are there any exceptions? When does this process NOT apply?
   "${answers.exceptions || 'None specified'}"

5. Are there any related procedures or policies?
   "${answers.related_policies || 'None specified'}"

Please generate a formal SOP based on these answers.`
      }
    ]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  console.log('Claude SOP response:', responseText);
  
  try {
    return JSON.parse(responseText);
  } catch {
    // Try to extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse Claude response as JSON');
  }
}

