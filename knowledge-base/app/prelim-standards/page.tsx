'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { emptyReference, emphasisRuns, referenceStatusLabel, ReferenceContent, ReferenceRevision } from '@/lib/prelim-reference';
import { searchReferences, starterQuestions } from '@/lib/reference-search';

const fields: [Exclude<keyof ReferenceContent,'boldPhrases'>,string][] = [
 ['code','Code / identifier'],['title','Reference heading'],['topic','Topic'],['matterType','Matter type'],
 ['scenario','When this applies'],['guidance','Guidance / answer'],['documents','Documents to obtain'],
 ['steps','Steps to follow'],['wording','Report wording'],['formatNotes','How to format it'],['source','Source and page'],
];

const button='rounded-lg bg-[#10213A] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40';
const published=(r:ReferenceRevision)=>['approved','source_approved'].includes(r.status);
const viewNames:Record<string,string>={published:'Published',draft:'Drafts',pending:'Pending',source_approved:'Source wording',approved:'Reviewed guidance',retired:'Retired',all:'All versions'};
const chipLabels=['Property taxes','Easements','Trusts','Deed of trust','Statement of Information','Bold wording'];
const statusText=(r:ReferenceRevision)=>r.status==='source_approved'?'Source wording approved · guidance pending':referenceStatusLabel[r.status];
export default function PrelimStandardsPage(){
 const [rows,setRows]=useState<ReferenceRevision[]>([]),[chosen,setChosen]=useState<ReferenceRevision|null>(null);
 const [query,setQuery]=useState(''),[topic,setTopic]=useState('all'),[view,setView]=useState('published');
 const [canEdit,setCanEdit]=useState(false),[canApprove,setCanApprove]=useState(false),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[edit,setEdit]=useState<ReferenceContent|null>(null);
 const [history,setHistory]=useState<{action:string;actor:string;at:string;version:number}[]>([]),[historyLoaded,setHistoryLoaded]=useState(false);
 const [suggesting,setSuggesting]=useState(false),[activeSuggestion,setActiveSuggestion]=useState(-1),[limit,setLimit]=useState(50);
 const requestNumber=useRef(0);
 const matches=useMemo(()=>searchReferences(rows,query,topic),[rows,query,topic]);
 const found=matches.filter(r=>view==='all'||(view==='published'?published(r):r.status===view));
 const selected=edit?chosen:found.find(r=>r.id===chosen?.id)||found[0]||null;
 const content=edit||selected?.content;
 const sourceOnly=selected?.status==='source_approved';
 const suggestions=found.slice(0,6);
 useEffect(()=>{setLimit(50);setActiveSuggestion(-1);},[query,topic,view]);
 useEffect(()=>{setHistory([]);setHistoryLoaded(false);},[selected?.id]);
 function discard(){return !edit||window.confirm('Discard your unsaved draft edits?');}
 function focusResults(){
  requestAnimationFrame(()=>{
   const target=document.getElementById(window.matchMedia('(max-width: 767px)').matches?'reference-detail':'reference-results');
   target?.focus({preventScroll:true});
   if(target && (window.matchMedia('(max-width: 767px)').matches||target.getBoundingClientRect().top<150||target.getBoundingClientRect().top>window.innerHeight-80))target.scrollIntoView({block:'start'});
  });
 }
 function choose(r:ReferenceRevision){if(!discard())return;setChosen(r);setEdit(null);setMessage('');setSuggesting(false);setActiveSuggestion(-1);focusResults();}
 function switchView(mode:string){if(!discard())return;setView(mode);setChosen(null);setEdit(null);setSuggesting(false);setMessage('');}
 function search(value:string,reset=false){if(!discard())return;setEdit(null);setChosen(null);setQuery(value);if(reset){setTopic('all');setView('published');}setSuggesting(false);setMessage('');focusResults();}
 async function showHistory(){
  const id=selected?.reference_id;if(!id)return;
  try{const r=await fetch('/api/prelim-references?history='+id);const data=await r.json();if(!r.ok)throw new Error(data.error);setHistory(data.events);setHistoryLoaded(true);}catch(e){setError((e as Error).message);}
 }
 async function load(){
  const request=++requestNumber.current;setLoading(true);setError('');
  try{const r=await fetch('/api/prelim-references?view=all');const data=await r.json();if(!r.ok)throw new Error(data.error);
   if(request!==requestNumber.current)return;
   setRows(data.revisions);setCanEdit(data.canEdit);setCanApprove(data.canApprove);
  }catch(e){if(request===requestNumber.current)setError((e as Error).message);}finally{if(request===requestNumber.current)setLoading(false);}
 }
 useEffect(()=>{load();},[]);
 async function act(action:string){
  setBusy(true);setError('');setMessage('');
  try{
   const r=await fetch('/api/prelim-references',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,id:selected?.id,updatedAt:selected?.updated_at,content:edit?{...edit,boldPhrases:edit.boldPhrases.map(p=>p.trim()).filter(Boolean)}:null})});
   const data=await r.json();if(!r.ok)throw new Error(data.error);
   setChosen(data.revision);setEdit(null);setQuery('');setTopic('all');setView(data.revision.status);
   setMessage('Reference '+({create:'created',save:'saved',submit:'submitted for review',return:'returned to draft',approve:'approved',retire:'retired',revise:'revision created'}[action]||'updated')+'.');
   await load();
  }catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 async function copy(){try{await navigator.clipboard.writeText(selected!.content.wording);setMessage('Wording copied.');}catch{setError('Clipboard unavailable. Select and copy the wording directly.');}}
 return <main className="min-h-screen bg-slate-50 text-[#10213A]">
  <div className="mx-auto max-w-[1500px] px-4 sm:px-6 py-5">
   <div className="flex items-center justify-between gap-3 mb-4"><h1 className="font-bold">Prelim help &amp; wording</h1>
    {canEdit&&<button disabled={busy} className={button} onClick={()=>{if(discard()){setChosen(null);setEdit({...emptyReference});}}}>New reference</button>}
   </div>
   <div className="sticky top-16 z-20 bg-slate-50 py-2" aria-label="Reference search controls">
    <div className="flex flex-wrap gap-2">
     <div className="relative flex-1 min-w-0 basis-52" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setSuggesting(false);}}>
      <label htmlFor="reference-search" className="sr-only">Search references</label>
      <input id="reference-search" role="combobox" aria-autocomplete="list" aria-controls="reference-suggestions" aria-expanded={suggesting&&!!query.trim()&&!loading} aria-activedescendant={activeSuggestion>=0?'suggestion-'+activeSuggestion:undefined}
       value={query} onFocus={()=>setSuggesting(true)} onChange={e=>{if(!discard())return;setEdit(null);setChosen(null);setQuery(e.target.value);setSuggesting(true);setMessage('');}}
       onKeyDown={e=>{if(e.key==='Escape'){setSuggesting(false);setActiveSuggestion(-1);}if(e.key==='ArrowDown'){e.preventDefault();setSuggesting(true);setActiveSuggestion(i=>Math.min(i+1,suggestions.length-1));}if(e.key==='ArrowUp'){e.preventDefault();setActiveSuggestion(i=>Math.max(0,i-1));}if(e.key==='Enter'){e.preventDefault();if(suggesting&&activeSuggestion>=0&&suggestions[activeSuggestion])choose(suggestions[activeSuggestion]);else search(query);}}}
       placeholder="Search a code, topic, or question…" className="w-full rounded-lg bg-white p-3 shadow-sm"/>
      {suggesting&&query.trim()&&!loading&&<div id="reference-suggestions" role="listbox" aria-label="Matching references" className="absolute z-30 top-full mt-1 w-full rounded-xl bg-white p-2 shadow-xl max-h-64 overflow-auto">
       {suggestions.length?suggestions.map((r,i)=><button id={'suggestion-'+i} role="option" aria-selected={activeSuggestion===i} key={r.id} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(r)} className={'block w-full text-left rounded-lg p-3 '+(activeSuggestion===i?'bg-slate-100':'hover:bg-slate-50')}><span className="block font-semibold text-sm">{r.content.title}</span><span className="text-xs text-slate-500">{statusText(r)}</span></button>):<p className="p-3 text-sm">No matches in {viewNames[view].toLowerCase()}.</p>}
      </div>}
     </div>
     <button disabled={loading||busy} className={button} onClick={()=>search(query)}>Search</button>
     <select aria-label="Topic" value={topic} onChange={e=>{if(discard()){setEdit(null);setChosen(null);setTopic(e.target.value);}}} className="rounded-lg p-3 bg-white max-w-full"><option value="all">All topics</option>{Array.from(new Set(rows.flatMap(r=>r.content.topic.split(',').map(t=>t.trim()).filter(Boolean)))).sort().map(t=><option key={t}>{t}</option>)}</select>
     {(query||topic!=='all')&&<button className="text-sm px-2" onClick={()=>search('',true)}>Clear</button>}
    </div>
   </div>
   {!query.trim()&&<div aria-label="Suggested questions" className="flex items-center gap-2 overflow-x-auto py-2 text-sm"><span className="text-slate-500 shrink-0">Try:</span>{starterQuestions.map((q,i)=><button key={q.search} aria-label={q.question} disabled={loading||busy} onClick={()=>search(q.search,true)} className="shrink-0 rounded-full bg-white px-3 py-1.5 hover:bg-orange-50">{chipLabels[i]}</button>)}</div>}
   <details className="text-xs text-slate-500 my-2"><summary className="cursor-pointer w-fit">About approval labels</summary><p className="mt-2 max-w-3xl">Source wording approval covers the imported text only—not current applicability, guidance, or formatting. Reviewed guidance has completed those additional checks. Drafts and pending records are not published instructions.</p></details>
   {error&&<div role="alert" className="p-3 mb-3 bg-red-50 text-red-800 rounded-lg">{error} <button className="underline" onClick={load}>Retry</button></div>}
   <div className="grid md:grid-cols-[290px_minmax(0,1fr)] gap-4 items-start mt-3">
    <aside id="reference-results" tabIndex={-1} aria-label="Reference results" className="min-w-0 scroll-mt-40">
     <div className="flex flex-wrap gap-1.5 mb-3" aria-label="Library views">
      {['published',...(canEdit?['draft','pending']:[])].map(mode=><button key={mode} aria-pressed={view===mode} className={'rounded-lg px-3 py-2 text-xs font-semibold '+(view===mode?'bg-[#10213A] text-white':'bg-white text-slate-600')} onClick={()=>switchView(mode)}>{viewNames[mode]} ({matches.filter(r=>mode==='published'?published(r):r.status===mode).length})</button>)}
      <select aria-label="Review status" className="rounded-lg bg-white p-2 text-xs max-w-full" value={view} onChange={e=>switchView(e.target.value)}>{['published','source_approved','approved',...(canEdit?['draft','pending','retired','all']:[])].map(s=><option key={s} value={s}>{viewNames[s]}</option>)}</select>
     </div>
     <p aria-live="polite" className="text-sm text-slate-500 mb-2">{loading?'Loading…':found.length+' results'+(query?' · '+query:'')}</p>
     <div className="max-h-44 md:max-h-[calc(100vh-290px)] overflow-y-auto space-y-2 pr-1">
      {!loading&&!found.length&&<p className="rounded-lg bg-white p-4 text-sm">No matching references. Try another topic or filter.</p>}
      {!loading&&found.slice(0,limit).map(r=><button key={r.id} aria-pressed={selected?.id===r.id} onClick={()=>choose(r)} className={'w-full text-left rounded-xl p-4 '+(selected?.id===r.id?'bg-[#10213A] text-white':'bg-white hover:bg-slate-100')}>
       <span className="font-bold text-sm">{r.content.code||'Reference'} <span className="font-normal opacity-60">· v{r.version}</span></span>
       <span className="block text-sm my-1 line-clamp-2">{r.content.title}</span>
       <span className="block text-xs opacity-75">{statusText(r)}</span>
      </button>)}
      {found.length>limit&&<button className={button} onClick={()=>setLimit(n=>n+50)}>Show 50 more</button>}
     </div>
    </aside>
    <section id="reference-detail" tabIndex={-1} aria-label="Reference wording" className="min-w-0 scroll-mt-48">
     {loading?<p className="p-6 bg-white rounded-xl">Loading wording…</p>:content?<>
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
       <div className="flex flex-wrap items-center justify-between gap-2 mb-3"><span className="text-sm font-bold">{content.code||'New reference'}{selected?' · v'+selected.version:''}</span>
        <span className={'rounded-full px-3 py-1 text-xs '+(selected&&published(selected)?'bg-blue-50 text-blue-900':'bg-amber-50 text-amber-900')} title={sourceOnly?'Approval covers source text only; guidance and formatting are not reviewed.':selected?.status==='approved'?'Guidance and formatting approved. Confirm applicability.':'Unpublished review material; not approved instructions.'}>{selected?statusText(selected):'Draft'}</span>
       </div>
       <h2 className="text-lg font-semibold mb-4 break-words">{content.title||'New reference'}</h2>
       {!edit&&<><article aria-label="Report wording" className="whitespace-pre-wrap break-words text-base leading-relaxed" style={{fontFamily:'Arial, sans-serif'}}>{emphasisRuns(content.wording,content.boldPhrases).map((r,i)=>r.bold?<strong key={i}>{r.text}</strong>:<span key={i}>{r.text}</span>)}</article>
        <div className="flex flex-wrap items-center gap-3 mt-5">{selected&&published(selected)&&<button className={button} onClick={copy}>{sourceOnly?'Copy source wording':'Copy approved wording'}</button>}<span role="status" className="text-sm text-green-700">{message}</span></div>
        {selected&&published(selected)&&<p className="mt-2 text-xs text-slate-500">Placeholders preserved — confirm applicability with your title lead.</p>}
       </>}
      </div>
     {edit?<div className="bg-white rounded-xl p-6 space-y-4">
      {fields.map(([key,label])=><label key={key} className="block"><span className="block font-semibold text-sm mb-2">{label}</span>{key==='matterType'?<select value={edit[key]} onChange={e=>setEdit({...edit,[key]:e.target.value})} className="w-full bg-slate-100 p-3 rounded">{['Unclassified','Exception','Requirement','Note','Disclosure'].map(v=><option key={v}>{v}</option>)}</select>:<textarea rows={['wording','guidance','steps','formatNotes'].includes(key)?5:2} value={edit[key]} onChange={e=>setEdit({...edit,[key]:e.target.value})} className="w-full bg-slate-100 p-3 rounded text-sm"/>}</label>)}
      <label className="block font-semibold text-sm">Bold these exact phrases (one per line)<textarea rows={4} value={edit.boldPhrases.join('\n')} onChange={e=>setEdit({...edit,boldPhrases:e.target.value.split('\n')})} className="block w-full bg-slate-100 p-3 rounded mt-2"/></label>
      <article className="rounded-xl bg-slate-50 p-6"><h3 className="font-bold mb-3">Live formatting preview — draft</h3><div className="whitespace-pre-wrap break-words" style={{fontFamily:'Arial, sans-serif',fontSize:'12pt',lineHeight:1.45}}>{emphasisRuns(edit.wording,edit.boldPhrases.map(p=>p.trim()).filter(Boolean)).map((r,i)=>r.bold?<strong key={i}>{r.text}</strong>:<span key={i}>{r.text}</span>)}</div></article>
      <div className="flex gap-3"><button disabled={busy} className={button} onClick={()=>act(selected?'save':'create')}>Save draft</button><button disabled={busy} className="p-2" onClick={()=>setEdit(null)}>Cancel</button></div>

     </div>:<>
      <details key={'guidance-'+selected?.id} className="rounded-xl bg-white p-4 mt-3"><summary className="font-semibold cursor-pointer text-sm">Guidance &amp; formatting{selected?.status!=='approved'?' — not yet reviewed':''}</summary>
       <div className="mt-4 space-y-4">{([['scenario','When this applies'],['guidance','Guidance / answer'],['documents','Documents to obtain'],['steps','Steps to follow'],['formatNotes','How to format it']] as const).filter(([key])=>content[key].trim()).map(([key,label])=><div key={key}><h3 className="font-semibold text-sm mb-1">{label}</h3><p className="whitespace-pre-wrap text-sm text-slate-600">{content[key]}</p></div>)}</div>
      </details>
      <details key={'source-'+selected?.id} className="rounded-xl bg-white p-4 mt-3"><summary className="font-semibold cursor-pointer text-sm">Source &amp; approval</summary><p className="text-sm mt-3 whitespace-pre-wrap">{content.source}</p>{selected?.approved_by&&<p className="mt-3 text-sm text-slate-500">{sourceOnly?'Source approval':'Approval'}: {selected.approved_by} · {new Date(selected.approved_at!).toLocaleDateString()}</p>}<details className="mt-3"><summary className="text-sm cursor-pointer">Original source text</summary><p className="whitespace-pre-wrap text-sm mt-2">{selected?.source_text}</p></details></details>
     </>}
     {!edit&&canEdit&&selected&&<details key={'review-'+selected.id} className="rounded-xl bg-white p-4 mt-3"><summary className="font-semibold cursor-pointer text-sm">Review tools &amp; history</summary>
      <div className="mt-4 flex flex-wrap gap-2">{selected.status==='draft'&&<><button className={button} onClick={()=>{setChosen(selected);setEdit({...selected.content});}}>Edit draft</button><button disabled={busy} className={button} onClick={()=>act('submit')}>Submit for review</button></>}{selected.status==='pending'&&<><button disabled={busy} className={button} onClick={()=>act('return')}>Return to draft</button>{canApprove&&<button disabled={busy} className={button} onClick={()=>act('approve')}>Approve reference</button>}</>}{['approved','source_approved','retired'].includes(selected.status)&&<button disabled={busy} className={button} onClick={()=>act('revise')}>Create revision</button>}{published(selected)&&canApprove&&<button disabled={busy} className={button} onClick={()=>act('retire')}>Retire reference</button>}</div>
      <button className="mt-4 text-sm font-semibold" onClick={showHistory}>Show review history</button>{historyLoaded&&!history.length&&<p className="text-sm mt-2">No history recorded.</p>}<ul className="mt-3 space-y-2 text-sm">{history.map((e,i)=><li key={i}>v{e.version} · {e.action} · {e.actor} · {new Date(e.at).toLocaleString()}</li>)}</ul>
     </details>}
     </>:<p className="bg-white rounded-xl p-6 text-sm text-slate-500">Select a result to see its wording.</p>}
    </section>
   </div>
  </div>
 </main>;
}
