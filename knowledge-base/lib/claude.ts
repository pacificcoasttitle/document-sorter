import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Step 1: Classify the document
async function classifyDocument(content: string, filename: string) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You are a document classifier for a title insurance underwriting team.

Analyze the document and return a JSON object with:
1. format: One of "qa" (question and answer), "narrative" (flowing text/paragraphs), "bulletin" (numbered updates/announcements), "legal_code" (statutes/regulations), "form" (fillable or structured form), "table" (primarily tabular data)
2. topics: Array of topics covered. Choose from: "Bankruptcy", "Probate", "Trusts", "Liens", "Foreclosure", "Power of Attorney", "Entity Documents", "Other"
3. estimated_entries: How many distinct pieces of guidance can be extracted (number)
4. quality_notes: Any concerns about document quality or clarity

Return ONLY valid JSON, no explanation.`,
    messages: [
      {
        role: 'user',
        content: `Classify this document:\n\nFilename: ${filename}\n\nContent:\n${content.substring(0, 3000)}`
      }
    ]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  try {
    return JSON.parse(responseText);
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { format: 'narrative', topics: ['Other'], estimated_entries: 1, quality_notes: '' };
  }
}

// Format-specific extraction instructions
function getFormatInstructions(format: string): string {
  const instructions: Record<string, string> = {
    qa: `This is a Q&A formatted document.
- Each question represents a SCENARIO
- Each answer contains the DECISION STEPS
- Convert each Q&A pair into a separate entry
- The question becomes the scenario (rephrase as "When..." or "If..." statement)
- The answer becomes the decision steps (convert to numbered steps)`,
    
    narrative: `This is a narrative document with flowing text.
- Break into logical sections by topic or concept
- Each distinct rule, requirement, or procedure becomes a separate entry
- Look for paragraph breaks, topic shifts, and transitional phrases`,
    
    bulletin: `This is a bulletin or announcement.
- Each numbered item or announcement may be a separate entry
- Focus on action items, new requirements, and policy changes
- Note effective dates if mentioned`,
    
    legal_code: `This is legal code or regulation.
- Each code section or subsection may be a separate entry
- Preserve exact legal language in exception_language field
- Note the specific code citations in source_reference`,
    
    form: `This is a structured form.
- Extract the requirements and conditions from the form
- Each section or requirement block becomes an entry
- Note any checkboxes or conditional logic`,
    
    table: `This document contains tabular data.
- Each row or logical grouping may represent a separate entry
- Preserve the relationships between columns
- Convert table structure into narrative decision steps`
  };

  return instructions[format] || instructions.narrative;
}

interface Classification {
  format: string;
  topics: string[];
  estimated_entries?: number;
  quality_notes?: string;
}

// Main extraction function
async function extractEntries(content: string, filename: string, classification: Classification) {
  const formatInstructions = getFormatInstructions(classification.format);
  
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: `You are a legal document analyzer for a title insurance underwriting team. Your job is to extract structured guidance that underwriters can use.

## DOCUMENT FORMAT
${formatInstructions}

## EXTRACTION RULES

For EACH distinct piece of guidance, extract:

1. topic: One of "Bankruptcy", "Probate", "Trusts", "Liens", "Foreclosure", "Power of Attorney", "Entity Documents", or suggest a new topic
2. subtopic: Specific category (e.g., "Trust Certification", "Chapter 7", "Limited Authority")
3. scenario: When does this apply? Write as a clear "When..." or "If..." statement
4. required_documents: List specific documents needed. 
5. decision_steps: Numbered steps for what the underwriter should do
6. risk_level: "Low", "Medium", or "High"
7. exception_language: Specific approved wording if needed
8. confidence: "High", "Medium", or "Low" based on clarity of source material

## CRITICAL: WHEN INFORMATION IS UNCLEAR

- If a field cannot be determined from the document, use: "NOT SPECIFIED - requires manual review"
- Do NOT guess or infer information that isn't stated
- Do NOT make up document requirements that aren't mentioned
- It is BETTER to leave a field as "NOT SPECIFIED" than to be wrong
- If the entire document is unclear, return fewer entries with "NOT SPECIFIED" fields rather than many bad entries

## EXAMPLES OF GOOD EXTRACTIONS

Example 1 - From a Q&A document about trusts:

Source text: "What will the title company require if a trustee holds the title to the property which is part of the trust? A certification of trust containing the following information: 1) date of execution of the trust instrument, 2) identity of the trustor and trustee, 3) powers of the trustee, 4) identity of person with power to revoke trust, if any, 5) signature authority of the trustees, 6) manner in which title to the trust assets should be taken, 7) legal description of any interest in the property held by the trust, and 8) a statement that the trust has not been revoked, modified, or amended."

Extracted entry:
{
  "topic": "Trusts",
  "subtopic": "Trust Certification Requirements",
  "scenario": "When a trustee holds title to property as part of a trust and needs to transact",
  "required_documents": "Certification of trust containing:\\n1. Date of execution of trust instrument\\n2. Identity of trustor and trustee\\n3. Powers of the trustee\\n4. Identity of person with power to revoke trust (if any)\\n5. Signature authority of trustees\\n6. Manner in which title should be taken\\n7. Legal description of property held by trust\\n8. Statement that trust has not been revoked, modified, or amended",
  "decision_steps": "1. Request certification of trust from trustee\\n2. Verify all 8 required elements are present\\n3. Confirm certification is signed by all currently acting trustees\\n4. Verify trust has not been revoked or modified",
  "risk_level": "Medium",
  "exception_language": "N/A",
  "confidence": "High"
}

Example 2 - From a Q&A document with ambiguity:

Source text: "If there is more than one trustee, can just one sign? Maybe. The trust must specifically provide for less than all to sign."

Extracted entry:
{
  "topic": "Trusts",
  "subtopic": "Trustee Signature Authority",
  "scenario": "When a trust has multiple trustees and only one is available to sign",
  "required_documents": "Trust document or certification showing signature authority provisions",
  "decision_steps": "1. Review trust document for signature authority provisions\\n2. Determine if trust allows less than all trustees to sign\\n3. If trust is silent, require all trustees to sign\\n4. If trust permits single signature, document which provision allows it",
  "risk_level": "Medium",
  "exception_language": "N/A",
  "confidence": "High"
}

Example 3 - When information is incomplete:

Source text: "Court approval may be required in certain probate situations."

Extracted entry:
{
  "topic": "Probate",
  "subtopic": "Court Approval",
  "scenario": "When determining if court approval is required for a probate transaction",
  "required_documents": "NOT SPECIFIED - requires manual review",
  "decision_steps": "1. Determine the type of probate authority\\n2. NOT SPECIFIED - specific situations requiring court approval not detailed in source",
  "risk_level": "Medium",
  "exception_language": "NOT SPECIFIED - requires manual review",
  "confidence": "Low"
}

## OUTPUT FORMAT

Return ONLY a valid JSON array of entries. No markdown, no explanation.
Extract ALL distinct pieces of guidance - do not combine unrelated topics into one entry.`,
    messages: [
      {
        role: 'user',
        content: `Extract all guidance from this document:\n\nFilename: ${filename}\n\nContent:\n${content}`
      }
    ]
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  console.log('Raw Claude extraction response:', responseText);
  
  try {
    return JSON.parse(responseText);
  } catch {
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse Claude response as JSON');
  }
}

interface ExtractedEntry {
  topic: string;
  subtopic: string;
  scenario: string;
  required_documents: string;
  decision_steps: string;
  risk_level: string;
  exception_language: string;
  confidence?: string;
  _classification?: Classification;
}

// Main export function - orchestrates the two-step process
export async function processDocument(content: string, filename: string) {
  console.log('Step 1: Classifying document...');
  const classification = await classifyDocument(content, filename);
  console.log('Classification:', JSON.stringify(classification, null, 2));
  
  console.log('Step 2: Extracting entries...');
  const entries = await extractEntries(content, filename, classification);
  console.log('Extracted entries count:', entries.length);
  
  // Add classification metadata to each entry
  return entries.map((entry: ExtractedEntry) => ({
    ...entry,
    _classification: classification
  }));
}
