export type ReferenceStatus = 'draft' | 'pending' | 'source_approved' | 'approved' | 'retired';
export const referenceStatusLabel:Record<ReferenceStatus,string>={draft:'Draft',pending:'Awaiting approval',source_approved:'Approved source wording',approved:'Approved guidance & formatting',retired:'Retired'};
export interface ReferenceContent {
  code: string; title: string; topic: string; matterType: string;
  scenario: string; guidance: string; documents: string; steps: string;
  wording: string; formatNotes: string; source: string; boldPhrases: string[];
}
export interface ReferenceRevision {
  id: number; reference_id: number; version: number; status: ReferenceStatus;
  content: ReferenceContent; source_text: string;
  created_by: string; updated_at: string; approved_by: string | null; approved_at: string | null;
}
export const emptyReference: ReferenceContent = {
  code: '', title: '', topic: 'Other', matterType: 'Unclassified', scenario: '',
  guidance: '', documents: '', steps: '', wording: '', formatNotes: '', source: '', boldPhrases: [],
};
export function validateContent(value: unknown): ReferenceContent {
  if (!value || typeof value !== 'object') throw new Error('Reference content is required.');
  const v = value as Record<string, unknown>;
  const result = { ...emptyReference };
  for (const key of Object.keys(emptyReference).filter(k => k !== 'boldPhrases') as (Exclude<keyof ReferenceContent,'boldPhrases'>)[]) {
    if (typeof v[key] !== 'string' || (v[key] as string).length > 50000) throw new Error(`Invalid ${key}.`);
    result[key] = (v[key] as string).trim();
  }
  if (!result.title || !result.wording || !result.source) throw new Error('Title, wording and source are required.');
  if (!Array.isArray(v.boldPhrases) || v.boldPhrases.length > 60 || v.boldPhrases.some(p => typeof p !== 'string' || !p.trim() || p.length > 200)) throw new Error('Invalid emphasis phrases.');
  result.boldPhrases = [...new Set((v.boldPhrases as string[]).map(s => s.trim()))];
  if (result.boldPhrases.some(p => !result.wording.includes(p))) throw new Error('Each emphasis phrase must occur exactly in the wording.');
  return result;
}
export function canTransition(from: ReferenceStatus, action: string, role: string) {
  if (!['admin', 'department_head'].includes(role)) return false;
  if (action === 'submit') return from === 'draft';
  if (action === 'return') return from === 'pending';
  if (action === 'approve') return from === 'pending' && role === 'admin';
  if (action === 'retire') return ['approved','source_approved'].includes(from) && role === 'admin';
  return false;
}
// Split into safe text runs. Never interpret source wording as HTML.
export function emphasisRuns(text: string, phrases: string[]) {
  const sorted = [...phrases].filter(Boolean).sort((a,b) => b.length-a.length);
  const runs: { text: string; bold: boolean }[] = [];
  let at=0;
  while(at<text.length) {
    let pos=text.length, phrase='';
    for(const candidate of sorted) {const i=text.indexOf(candidate,at); if(i>=0 && i<pos){pos=i;phrase=candidate;}}
    if(pos>at) runs.push({text:text.slice(at,pos),bold:false});
    if(!phrase) break;
    runs.push({text:phrase,bold:true});at=pos+phrase.length;
  }
  return runs;
}
