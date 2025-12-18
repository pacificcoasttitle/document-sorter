export interface Topic {
  id: number;
  name: string;
}

export interface Subtopic {
  id: number;
  topic_id: number;
  name: string;
}

export interface Entry {
  id?: number;
  topic_id: number;
  subtopic_id: number;
  scenario: string;
  required_documents: string;
  decision_steps: string;
  risk_level: 'Low' | 'Medium' | 'High';
  exception_language: string;
  source_reference: string;
  owner: string;
  last_reviewed: string;
}

export interface ExtractedEntry {
  topic: string;
  subtopic: string;
  scenario: string;
  required_documents: string;
  decision_steps: string;
  risk_level: 'Low' | 'Medium' | 'High';
  exception_language: string;
  confidence?: 'High' | 'Medium' | 'Low';
}

export interface DocumentClassification {
  format: string;
  topics: string[];
  estimated_entries?: number;
  quality_notes?: string;
}

