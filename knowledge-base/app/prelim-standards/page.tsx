'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { emptyReference, emphasisRuns, ReferenceContent, ReferenceRevision } from '@/lib/prelim-reference';
import { searchReferences, starterQuestions } from '@/lib/reference-search';

const fields: [Exclude<keyof ReferenceContent,'boldPhrases'>,string][] = [
 ['code','Code / identifier'],['title','Reference heading'],['topic','Topic'],['matterType','Matter type'],
 ['scenario','When this applies'],['guidance','Guidance / answer'],['documents','Documents to obtain'],
 ['steps','Steps to follow'],['wording','Report wording'],['formatNotes','How to format it'],['source','Source and page'],
];
const button='rounded-lg bg-[#10213A] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40';
export default function PrelimStandardsPage(){
 const [rows,setRows]=useState<ReferenceRevision[]>([]),[selected,setSelected]=useState<ReferenceRevision|null>(null);
 const [query,setQuery]=useState(''),[topic,setTopic]=useState('all'),[view,setView]=useState('approved');
 const [canEdit,setCanEdit]=useState(false),[canApprove,setCanApprove]=useState(false),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[edit,setEdit]=useState<ReferenceContent|null>(null);
 const [history,setHistory]=useState<{action:string;actor:string;at:string;version:number}[]>([]);
 const [suggesting,setSuggesting]=useState(false),[activeSuggestion,setActiveSuggestion]=useState(-1),[limit,setLimit]=useState(50);
 const requestNumber=useRef(0);
 const viewNames:Record<string,string>={approved:'Approved answers',draft:'Draft review',pending:'Awaiting approval',retired:'Retired',all:'All versions'};
 useEffect(()=>{if(selected&&window.matchMedia('(max-width: 1023px)').matches)document.getElementById('reference-detail')?.scrollIntoView({behavior:'smooth',block:'start'});},[selected]);
 useEffect(()=>{setLimit(50);setActiveSuggestion(-1);},[query,topic,view]);
 function choose(r:ReferenceRevision){if(edit&&!window.confirm('Discard your unsaved draft edits?'))return;setSelected(r);setEdit(null);setMessage('');setSuggesting(false);setActiveSuggestion(-1);}
 function switchView(mode:string){if(edit&&!window.confirm('Discard your unsaved draft edits?'))return;setView(mode);setSelected(null);setEdit(null);setSuggesting(false);}
 function startQuestion(search:string){if(edit&&!window.confirm('Discard your unsaved draft edits?'))return;setEdit(null);setQuery(search);setTopic('all');setSuggesting(true);setSelected(null);}
 useEffect(()=>{setHistory([]);},[selected?.id]);
 async function showHistory(){
  try{const r=await fetch('/api/prelim-references?history='+selected!.reference_id);const data=await r.json();if(!r.ok)throw new Error(data.error);setHistory(data.events);}catch(e){setError((e as Error).message);}
 }
 async function load(mode:string){
   const request=++requestNumber.current;
   setLoading(true);setError('');setRows([]);
   try{const r=await fetch('/api/prelim-references?view='+mode);const data=await r.json();if(!r.ok)throw new Error(data.error);
    if(request!==requestNumber.current)return;
    setRows(data.revisions);setCanEdit(data.canEdit);setCanApprove(data.canApprove);
   }catch(e){if(request===requestNumber.current)setError((e as Error).message);}finally{if(request===requestNumber.current)setLoading(false);}
 }
 useEffect(()=>{load(view);},[view]);
 async function act(action:string){
   setBusy(true);setError('');setMessage('');
   try{
    const r=await fetch('/api/prelim-references',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,id:selected?.id,updatedAt:selected?.updated_at,content:edit?{...edit,boldPhrases:edit.boldPhrases.map(p=>p.trim()).filter(Boolean)}:null})});
    const data=await r.json();if(!r.ok)throw new Error(data.error);
    setSelected(data.revision);setEdit(null);setMessage('Reference '+({create:'created',save:'saved',submit:'submitted for review',return:'returned to draft',approve:'approved',retire:'retired',revise:'revision created'}[action]||'updated')+'.');
    const nextView=action==='approve'?'approved':data.revision.status;
    if(nextView===view)await load(view);else setView(nextView);
   }catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 const found=searchReferences(rows,query,topic);
 const suggestions=found.slice(0,6);
 const content=edit||selected?.content;
 async function copy(){try{await navigator.clipboard.writeText(selected!.content.wording);setMessage('Wording copied as plain text. Use the formatting example alongside it.');}catch{setError('Clipboard unavailable. Select and copy the wording directly.');}}
 return <main className="min-h-screen bg-slate-50 text-[#10213A]">
  <div className="mx-auto max-w-[1500px] px-6 py-8">
   <Link href="/" className="text-sm text-slate-500">← Knowledge base</Link>
   <div className="my-5 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold text-orange-600">TESSA / PRELIM STANDARDS</p><h1 className="text-3xl font-bold mt-2">Prelim help & wording</h1><p className="mt-2 text-slate-600">What are you working on? Start with a question, a topic, or a code.</p></div>
    {canEdit&&<button className={button} onClick={()=>{setSelected(null);setEdit({...emptyReference});}}>New reference</button>}
   </div>
   <div className="rounded-xl bg-[#10213A] text-white p-5 mb-6"><b>Find it → Read the guidance → See the formatting</b><p className="mt-1 text-sm text-slate-200">This searches your reference library—not an AI chat. Suggestions open existing records; only approved references are ready for team use.</p></div>
   <section aria-label="Suggested questions" className="mb-6"><h2 className="font-bold mb-3">Not sure what to type? Start here.</h2><div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">{starterQuestions.map(q=><button key={q.search} className="text-left rounded-xl bg-white p-4 text-sm font-medium shadow-sm hover:bg-orange-50" onClick={()=>startQuestion(q.search)}>{q.question} <span aria-hidden="true">→</span></button>)}</div></section>
   {canEdit&&<div aria-label="Library views" className="flex flex-wrap gap-2 mb-4">{['approved','draft','pending'].map(mode=><button key={mode} aria-pressed={view===mode} className={`rounded-lg px-4 py-2 text-sm font-semibold ${view===mode?'bg-[#10213A] text-white':'bg-white text-slate-600'}`} onClick={()=>switchView(mode)}>{viewNames[mode]}</button>)}</div>}
   {!loading&&!error&&view==='approved'&&rows.length===0&&<div className="rounded-xl bg-amber-50 p-5 mb-5"><h2 className="font-bold">No approved answers have been published yet.</h2><p className="mt-1 text-sm">Your search is working. Imported material stays out of approved results until it has been reviewed.</p>{canEdit?<div className="flex flex-wrap gap-3 mt-3"><button className={button} onClick={()=>switchView('draft')}>Browse imported drafts</button><button className="font-semibold text-sm" onClick={()=>{setQuery('PILOT');setTopic('all');switchView('draft');}}>Start with the 8 pilot examples →</button></div>:<p className="mt-2 text-sm">Ask your title lead for help while the reference library is being reviewed.</p>}</div>}
   {view!=='approved'&&<p className="mb-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900"><b>{viewNames[view]}:</b> These records may be incomplete or historical. Do not use draft wording as approved instructions.</p>}
   {error&&<p role="alert" className="p-4 mb-4 bg-red-50 text-red-800 rounded-lg">{error}</p>}
   {message&&<p role="status" className="p-4 mb-4 bg-green-50 text-green-800 rounded-lg">{message}</p>}
   <div className="flex flex-wrap gap-3 mb-5">
    <div className="relative flex-1 min-w-64" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setSuggesting(false);}}>
     <label htmlFor="reference-search" className="sr-only">Search references</label><input id="reference-search" role="combobox" aria-autocomplete="list" aria-controls="reference-suggestions" aria-expanded={suggesting&&!!query.trim()&&!loading} aria-activedescendant={activeSuggestion>=0?`suggestion-${activeSuggestion}`:undefined} value={query} onFocus={()=>setSuggesting(true)} onChange={e=>{setQuery(e.target.value);setSuggesting(true);}} onKeyDown={e=>{if(e.key==='Escape'){setSuggesting(false);setActiveSuggestion(-1);}if(e.key==='ArrowDown'){e.preventDefault();setSuggesting(true);setActiveSuggestion(i=>Math.min(i+1,suggestions.length-1));}if(e.key==='ArrowUp'){e.preventDefault();setActiveSuggestion(i=>Math.max(0,i-1));}if(e.key==='Enter'&&suggesting&&suggestions.length){e.preventDefault();choose(suggestions[Math.min(suggestions.length-1,Math.max(0,activeSuggestion))]);}}} placeholder="Try trust, property taxes, an easement, or a code…" className="w-full rounded-lg bg-white p-3 shadow-sm"/>
     {suggesting&&query.trim()&&!loading&&<div id="reference-suggestions" role="listbox" aria-label="Matching references" className="absolute z-20 top-full mt-2 w-full rounded-xl bg-white p-2 shadow-xl max-h-80 overflow-auto">{suggestions.length?suggestions.map((r,i)=><button id={`suggestion-${i}`} role="option" aria-selected={activeSuggestion===i} key={r.id} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(r)} className={`block w-full text-left rounded-lg p-3 ${activeSuggestion===i?'bg-slate-100':'hover:bg-slate-50'}`}><span className="block font-semibold text-sm">{r.content.title}</span><span className="text-xs text-slate-500">{r.content.code} · {r.status} · v{r.version}</span></button>):<p className="p-3 text-sm text-slate-600">No matches in {viewNames[view].toLowerCase()}. Try a shorter topic{canEdit&&view==='approved'?' or open Draft review':''}.</p>}</div>}
    </div>
    <select aria-label="Topic" value={topic} onChange={e=>setTopic(e.target.value)} className="rounded-lg p-3 bg-white"><option value="all">All topics</option>{Array.from(new Set(rows.flatMap(r=>r.content.topic.split(',').map(t=>t.trim()).filter(Boolean)))).sort().map(t=><option key={t}>{t}</option>)}</select>
    {canEdit&&<details className="rounded-lg bg-white p-3 text-sm"><summary className="cursor-pointer font-semibold">More views</summary><select aria-label="Review status" className="rounded-lg p-3 bg-white" value={view} onChange={e=>switchView(e.target.value)}>{['approved','draft','pending','retired','all'].map(s=><option key={s} value={s}>{viewNames[s]}</option>)}</select></details>}
    {(query||topic!=='all')&&<button className="text-sm font-semibold px-3" onClick={()=>{setQuery('');setTopic('all');setSuggesting(false);}}>Clear search</button>}
   </div>
   <div className="grid lg:grid-cols-[320px_1fr] gap-6">
    <aside className="space-y-3 lg:max-h-[75vh] overflow-auto"><p aria-live="polite" className="text-sm text-slate-500">{loading?'Loading…':`${found.length} matches · ${viewNames[view]}`}</p>
    {!loading&&!found.length&&<p className="bg-white rounded-xl p-5 text-slate-600">No matching references. {canEdit&&view==='approved'?'Use Draft review to search unapproved imported material.':'Try another topic or clear your search.'}</p>}
    {found.slice(0,limit).map(r=><button key={r.id} onClick={()=>choose(r)} className={`w-full text-left rounded-xl p-4 shadow-sm ${selected?.id===r.id?'bg-[#10213A] text-white':'bg-white'}`}><span className="text-xs uppercase tracking-wide">{r.content.code||r.content.topic} · v{r.version} · {r.status}</span><h2 className="font-bold mt-2">{r.content.title}</h2><p className="text-sm mt-2 opacity-75 line-clamp-2">{r.content.scenario||'Guidance awaiting review'}</p></button>)}
    {found.length>limit&&<button className={button} onClick={()=>setLimit(n=>n+50)}>Show 50 more</button>}
    </aside>
    <section id="reference-detail" className="scroll-mt-20">{content?<>
     <div className="bg-white rounded-xl p-6 mb-4 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-2xl font-bold">{content.title||'New reference'}</h2><span className="text-sm font-semibold">{selected?`${selected.status.toUpperCase()} · VERSION ${selected.version}`:'DRAFT'}</span></div>
      {selected?.status!=='approved'&&<p className="mt-3 text-amber-800 text-sm">Review material: wording and guidance are not approved for team use.</p>}
      {selected?.approved_by&&<p className="mt-2 text-sm text-slate-600">Approved by {selected.approved_by} · {new Date(selected.approved_at!).toLocaleDateString()}</p>}
     </div>
     {edit?<div className="bg-white rounded-xl p-6 space-y-4">
      {fields.map(([key,label])=><label key={key} className="block"><span className="block font-semibold text-sm mb-2">{label}</span>{key==='matterType'?<select value={edit[key]} onChange={e=>setEdit({...edit,[key]:e.target.value})} className="w-full bg-slate-100 p-3 rounded">{['Unclassified','Exception','Requirement','Note','Disclosure'].map(v=><option key={v}>{v}</option>)}</select>:<textarea rows={['wording','guidance','steps','formatNotes'].includes(key)?5:2} value={edit[key]} onChange={e=>setEdit({...edit,[key]:e.target.value})} className="w-full bg-slate-100 p-3 rounded text-sm"/>}</label>)}
      <label className="block font-semibold text-sm">Bold these exact phrases (one per line)<textarea rows={4} value={edit.boldPhrases.join('\n')} onChange={e=>setEdit({...edit,boldPhrases:e.target.value.split('\n')})} className="block w-full bg-slate-100 p-3 rounded mt-2"/></label>
      <article className="rounded-xl bg-slate-50 p-6"><h3 className="font-bold mb-3">Live formatting preview — draft</h3><div className="whitespace-pre-wrap break-words" style={{fontFamily:'Arial, sans-serif',fontSize:'12pt',lineHeight:1.45}}>{emphasisRuns(edit.wording,edit.boldPhrases.map(p=>p.trim()).filter(Boolean)).map((r,i)=>r.bold?<strong key={i}>{r.text}</strong>:<span key={i}>{r.text}</span>)}</div></article>
      <div className="flex gap-3"><button disabled={busy} className={button} onClick={()=>act(selected?'save':'create')}>Save draft</button><button disabled={busy} className="p-2" onClick={()=>setEdit(null)}>Cancel</button></div>
     </div>:<div className="grid xl:grid-cols-2 gap-5">
       <div className="bg-white rounded-xl p-6 space-y-5">{([['scenario','When this applies'],['guidance','Guidance / answer'],['documents','Documents to obtain'],['steps','Steps to follow'],['formatNotes','How to format it'],['source','Source']] as const).map(([key,label])=><div key={key}><h3 className="font-bold mb-2">{label}</h3><p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">{content[key]||'Not yet specified.'}</p></div>)}
        <details><summary className="cursor-pointer font-semibold">Original source wording</summary><p className="whitespace-pre-wrap text-sm leading-6 mt-3">{selected?.source_text}</p></details>
       </div>
       <div className="space-y-4"><article className="bg-white rounded-xl p-7 shadow-sm"><p className="text-xs tracking-wide uppercase text-orange-600 mb-5">Formatting example · {content.matterType}</p><h3 className="font-bold text-lg mb-5">{content.title}</h3><div style={{fontFamily:'Arial, sans-serif',fontSize:'12pt',lineHeight:1.45,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{emphasisRuns(content.wording,content.boldPhrases).map((r,i)=>r.bold?<strong key={i}>{r.text}</strong>:<span key={i}>{r.text}</span>)}</div></article>
        {selected?.status==='approved'&&<button className={button} onClick={copy}>Copy approved wording</button>}
        <p className="text-sm text-slate-500">The heading is shown separately from the report wording. Paragraph breaks and bold phrases follow this reference.</p>
       </div>
      </div>}
      {!edit&&canEdit&&selected&&<div className="mt-5 flex flex-wrap gap-3">{selected.status==='draft'&&<><button className={button} onClick={()=>setEdit({...selected.content})}>Edit draft</button><button disabled={busy} className={button} onClick={()=>act('submit')}>Submit for review</button></>}{selected.status==='pending'&&<><button disabled={busy} className={button} onClick={()=>act('return')}>Return to draft</button>{canApprove&&<button disabled={busy} className={button} onClick={()=>act('approve')}>Approve reference</button>}</>}{['approved','retired'].includes(selected.status)&&<button disabled={busy} className={button} onClick={()=>act('revise')}>Create revision</button>}{selected.status==='approved'&&canApprove&&<button disabled={busy} className={button} onClick={()=>act('retire')}>Retire reference</button>}</div>}
      {canEdit&&selected&&<div className="mt-5 bg-white p-5 rounded-xl"><button className="font-semibold" onClick={showHistory}>Show review history</button><ul className="mt-3 space-y-2 text-sm">{history.map((e,i)=><li key={i}>v{e.version} · {e.action} · {e.actor} · {new Date(e.at).toLocaleString()}</li>)}</ul></div>}
    </>:<div className="bg-white rounded-xl p-8 text-slate-600"><h2 className="text-xl font-bold text-[#10213A]">Your answer opens here</h2><ol className="list-decimal pl-5 space-y-4 mt-5"><li><b>Choose a question or type a topic.</b> Matching records appear as you type. Use ↑ / ↓ and Enter, or click a suggestion.</li><li><b>Open a matching reference.</b> Read when it applies, what documents are needed, and the source.</li><li><b>Check the formatting example.</b> See the paragraph breaks and bold wording. Only approved records have a copy button.</li></ol>{canEdit&&<p className="mt-5 bg-slate-50 p-4 rounded-lg text-sm"><b>Reviewing the code book?</b> Open Draft review first. Start with the pilot examples to see the proposed presentation style.</p>}</div>}</section>
   </div>
  </div>
 </main>;
}
