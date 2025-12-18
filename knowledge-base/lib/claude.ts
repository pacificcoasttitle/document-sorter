import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function processDocument(content: string, filename: string) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are a legal document analyzer for a title insurance underwriting team. Your job is to read uploaded documents and extract structured guidance that underwriters can use.

For each distinct scenario or rule in the document, extract:

1. Topic: One of [Bankruptcy, Probate, Trusts] or suggest a new topic if none fit
2. Subtopic: The specific type (e.g., "Chapter 7", "Limited Authority", "Revocable Living Trust")
3. Scenario: When does this guidance apply? (1-2 sentences)
4. Required Documents: What documents are needed? (bullet list)
5. Decision Steps: What should the underwriter do? (numbered steps)
6. Risk Level: Low, Medium, or High
7. Exception Language: If an exception is needed, what approved wording should be used?

Return your response as a JSON array of objects. If the document contains multiple scenarios, return multiple objects.

Be precise. Do not invent information. If something is unclear in the source document, note it in the relevant field.

Return ONLY valid JSON, no markdown or explanation.`,
    messages: [
      {
        role: 'user',
        content: `Please analyze this document and extract structured guidance:\n\nFilename: ${filename}\n\nContent:\n${content}`
      }
    ]
  });

  // Log raw Claude response
  console.log('Raw Claude response:', JSON.stringify(message.content, null, 2));
  
  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  console.log('Response text:', responseText);
  
  let entries;
  try {
    entries = JSON.parse(responseText);
  } catch {
    // Try to extract JSON from the response
    console.log('Direct JSON parse failed, trying regex extraction...');
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      entries = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse Claude response as JSON');
    }
  }
  
  // Log parsed entries
  console.log('Parsed entries:', JSON.stringify(entries, null, 2));
  console.log('Number of entries extracted:', Array.isArray(entries) ? entries.length : 'not an array');
  
  return entries;
}

