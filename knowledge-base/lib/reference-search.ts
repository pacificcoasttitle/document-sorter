import type { ReferenceRevision } from './prelim-reference';

export const starterQuestions = [
  { question: 'How should property taxes be shown?', search: 'property tax' },
  { question: 'What should an easement exception look like?', search: 'easement' },
  { question: 'What documents are needed for a trust?', search: 'trust' },
  { question: 'How do I present a deed of trust?', search: 'deed of trust' },
  { question: 'When is a Statement of Information needed?', search: 'statement of information' },
  { question: 'What should I bold in the report?', search: 'bold' },
];
const normalize = (value:string) => value.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const filler = new Set('a an the how what when where should do does i we is are be for in on of to and with needed need documents document shown show present format formatting look like report please'.split(' '));
const aliases:Record<string,string[]> = {
  tax:['tax','taxes','installment'], taxes:['tax','taxes','installment'],
  bold:['bold','emphasis'], lien:['lien','liens'], owner:['owner','ownership','vesting'],
};

// Keyword assistance only: rank stored references; never invent an answer.
export function searchReferences(rows:ReferenceRevision[],query:string,topic='all') {
  const normalized=normalize(query);
  const preset=starterQuestions.find(q=>normalize(q.question)===normalized);
  const effective=normalize(preset?.search||query);
  const tokens=effective.split(' ').filter(t=>t&&!filler.has(t));
  return rows.filter(r=>topic==='all'||r.content.topic.split(',').map(t=>t.trim()).includes(topic))
    .map(r=>{
      const c=r.content, title=normalize(c.title), code=normalize(c.code);
      const haystack=normalize(Object.values(c).join(' '));
      const phrase=effective && haystack.includes(effective);
      const matches=!effective||phrase||(tokens.length>0&&tokens.every(t=>(aliases[t]||[t]).some(word=>haystack.includes(word))));
      const score=effective===code?1000:code.startsWith(effective)&&effective?500:phrase&&title.includes(effective)?100:phrase?50:10;
      return {r,matches,score};
    }).filter(x=>x.matches).sort((a,b)=>b.score-a.score||a.r.content.title.localeCompare(b.r.content.title)).map(x=>x.r);
}
