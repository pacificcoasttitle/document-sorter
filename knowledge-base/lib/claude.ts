import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function processDocument(content: string, filename: string) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are a legal document analyzer for a title insurance underwriting team. Your job is to read uploaded documents and extract structured guidance that underwriters can use.

Analyze the document and extract EVERY distinct rule, requirement, or guidance into separate entries.

For EACH piece of guidance, extract:

1. topic: One of "Bankruptcy", "Probate", or "Trusts". Choose the best fit.
2. subtopic: A specific category (e.g., "Trust Certification", "Trustee Powers", "Power of Attorney")
3. scenario: When does this apply? Write as a clear situation or question. (1-2 sentences)
4. required_documents: What documents are needed? List them. If none specified, write "See trust documentation requirements"
5. decision_steps: What should the underwriter do? Write as numbered steps.
6. risk_level: "Low", "Medium", or "High" based on complexity
7. exception_language: If an exception or special wording is needed, include it. Otherwise write "N/A"

IMPORTANT:
- Extract MULTIPLE entries if the document covers multiple topics
- For Q&A formatted documents, convert each Q&A into a scenario + decision_steps
- Be thorough — don't skip any guidance
- Return ONLY a valid JSON array, no markdown, no explanation

Example output format:
[
  {
    "topic": "Trusts",
    "subtopic": "Trust Certification",
    "scenario": "When a trustee holds title to property as part of a trust",
    "required_documents": "1. Certification of trust containing: date of execution, identity of trustor/trustee, powers of trustee, signature authority, legal description of property",
    "decision_steps": "1. Request certification of trust\\n2. Verify all 8 required elements are present\\n3. Confirm trust has not been revoked or modified\\n4. Verify all current trustees have signed",
    "risk_level": "Medium",
    "exception_language": "N/A"
  }
]`,
    messages: [
      {
        role: 'user',
        content: `Please analyze this document and extract ALL structured guidance:\n\nFilename: ${filename}\n\nContent:\n${content}`
      }
    ]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  console.log('Raw Claude response:', responseText);
  
  try {
    const parsed = JSON.parse(responseText);
    console.log('Parsed entries:', JSON.stringify(parsed, null, 2));
    return parsed;
  } catch {
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('Extracted JSON entries:', JSON.stringify(parsed, null, 2));
      return parsed;
    }
    throw new Error('Failed to parse Claude response as JSON');
  }
}

