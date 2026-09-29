'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { emptyReference, emphasisRuns, ReferenceContent, ReferenceRevision } from '@/lib/prelim-reference';

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
 useEffect(()=>{setHistory([]);},[selected?.id]);
 async function showHistory(){
  try{const r=await fetch('/api/prelim-references?history='+selected!.reference_id);const data=await r.json();if(!r.ok)throw new Error(data.error);setHistory(data.events);}catch(e){setError((e as Error).message);}
 }
 async function load(mode:string){
   setLoading(true);setError('');
   try{const r=await fetch('/api/prelim-references?view='+mode);const data=await r.json();if(!r.ok)throw new Error(data.error);
    setRows(data.revisions);setCanEdit(data.canEdit);setCanApprove(data.canApprove);
   }catch(e){setError((e as Error).message);}finally{setLoading(false);}
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
 const found=rows.filter(r=>(topic==='all'||r.content.topic===topic)&&Object.values(r.content).join(' ').toLowerCase().includes(query.toLowerCase()));
 const content=edit||selected?.content;
 async function copy(){try{await navigator.clipboard.writeText(selected!.content.wording);setMessage('Wording copied as plain text. Use the formatting example alongside it.');}catch{setError('Clipboard unavailable. Select and copy the wording directly.');}}
 return <main className="min-h-screen bg-slate-50 text-[#10213A]">
  <div className="mx-auto max-w-[1500px] px-6 py-8">
   <Link href="/" className="text-sm text-slate-500">← Knowledge base</Link>
   <div className="my-5 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold text-orange-600">TESSA / TITLE TEAM REFERENCE</p><h1 className="text-3xl font-bold mt-2">Prelim standards</h1><p className="mt-2 text-slate-600">Find the guidance. Read the wording. See how to present it in SoftPro.</p></div>
    {canEdit&&<button className={button} onClick={()=>{setSelected(null);setEdit({...emptyReference});}}>New reference</button>}
   </div>
   <div className="rounded-xl bg-[#10213A] text-white p-5 mb-6"><b>A consistent answer, with a clear example.</b><p className="mt-1 text-sm text-slate-200">Approved references are ready for team use. Drafts and pending items remain in the review queue.</p></div>
   {error&&<p role="alert" className="p-4 mb-4 bg-red-50 text-red-800 rounded-lg">{error}</p>}
   {message&&<p role="status" className="p-4 mb-4 bg-green-50 text-green-800 rounded-lg">{message}</p>}
   <div className="flex flex-wrap gap-3 mb-5">
    <label className="flex-1 min-w-64"><span className="sr-only">Search references</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search a code, title matter, or question…" className="w-full rounded-lg bg-white p-3 shadow-sm"/></label>
    <select aria-label="Topic" value={topic} onChange={e=>setTopic(e.target.value)} className="rounded-lg p-3 bg-white"><option value="all">All topics</option>{Array.from(new Set(rows.map(r=>r.content.topic))).sort().map(t=><option key={t}>{t}</option>)}</select>
    {canEdit&&<select aria-label="Review status" className="rounded-lg p-3 bg-white" value={view} onChange={e=>{setView(e.target.value);setSelected(null);setEdit(null);}}>{['approved','draft','pending','retired','all'].map(s=><option key={s} value={s}>{s==='all'?'All versions':s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select>}
   </div>
   <div className="grid lg:grid-cols-[320px_1fr] gap-6">
    <aside className="space-y-3 lg:max-h-[75vh] overflow-auto"><p className="text-sm text-slate-500">{loading?'Loading…':`${found.length} reference versions`}</p>
    {!loading&&!found.length&&<p className="bg-white rounded-xl p-5 text-slate-600">No matching references. {canEdit?'Select Draft to review imported items, or create a reference.':'Approved guidance will appear here once reviewed.'}</p>}
    {found.map(r=><button key={r.id} onClick={()=>{setSelected(r);setEdit(null);setMessage('');}} className={`w-full text-left rounded-xl p-4 shadow-sm ${selected?.id===r.id?'bg-[#10213A] text-white':'bg-white'}`}><span className="text-xs uppercase tracking-wide">{r.content.code||r.content.topic} · v{r.version} · {r.status}</span><h2 className="font-bold mt-2">{r.content.title}</h2><p className="text-sm mt-2 opacity-75 line-clamp-2">{r.content.scenario||'Guidance awaiting review'}</p></button>)}
    </aside>
    <section>{content?<>
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
    </>:<div className="bg-white rounded-xl p-12 text-slate-500">Select a reference to see its guidance and formatting example.</div>}</section>
   </div>
  </div>
 </main>;
}
