import test from 'node:test';
import assert from 'node:assert/strict';
import { searchReferences, starterQuestions } from '../lib/reference-search.ts';
import { emptyReference } from '../lib/prelim-reference.ts';
const make=(id,code,title,wording,topic='Other')=>({id,content:{...emptyReference,code,title,wording,topic}});
const rows=[make(1,'A1','Water rights','Water rights'),make(2,'T1','Property taxes','Both installments','Taxes, Assessments'),make(3,'PILOT-1','Trust documentation','Documents for trustees','Trusts')];
test('exact code wins; prefixes produce suggestions',()=>{
 assert.equal(searchReferences(rows,'A1')[0].id,1);
 assert.equal(searchReferences(rows,'PILOT')[0].id,3);
});
test('question shortcuts, punctuation and natural-language fillers',()=>{
 assert.equal(searchReferences(rows,starterQuestions[0].question)[0].id,2);
 assert.equal(searchReferences(rows,'What documents do I need for a trust?')[0].id,3);
 assert.equal(searchReferences(rows,'property tax')[0].id,2);
});
test('topic filters split multiple tags; no match stays empty',()=>{
 assert.equal(searchReferences(rows,'','Assessments').length,1);
 assert.equal(searchReferences(rows,'unrelated quasar').length,0);
 assert.equal(searchReferences([],'trust').length,0);
 assert.equal(searchReferences(rows,'').length,3);
});
