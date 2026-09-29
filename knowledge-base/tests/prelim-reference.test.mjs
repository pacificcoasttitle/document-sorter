import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyReference, validateContent, emphasisRuns, canTransition } from '../lib/prelim-reference.ts';
const sample={...emptyReference,title:'Example',wording:'Amount: $10\nNOTE: <script>sample</script>',source:'Sample p1',boldPhrases:['Amount:']};
test('validation requires provenance and exact emphasis',()=>{
 assert.equal(validateContent(sample).source,'Sample p1');
 assert.throws(()=>validateContent({...sample,source:''}));
 assert.throws(()=>validateContent({...sample,boldPhrases:['Not in wording']}));
 assert.throws(()=>validateContent({...sample,wording:7}));
});
test('formatting preserves every character, including literal markup',()=>{
 const runs=emphasisRuns(sample.wording,['Amount:','Amount']);
 assert.equal(runs.map(r=>r.text).join(''),sample.wording);
 assert.equal(runs[0].text,'Amount:');assert.equal(runs[0].bold,true);
 assert.deepEqual(emphasisRuns('',[]),[]);
 assert.equal(emphasisRuns('xx xx',['xx']).filter(r=>r.bold).length,2);
});
test('staff cannot mutate; heads submit; only admins publish',()=>{
 for(const status of ['draft','pending','approved','retired']) for(const action of ['submit','return','approve','retire']) assert.equal(canTransition(status,action,'user'),false);
 assert.equal(canTransition('draft','submit','department_head'),true);
 assert.equal(canTransition('pending','approve','department_head'),false);
 assert.equal(canTransition('pending','approve','admin'),true);
 assert.equal(canTransition('draft','approve','admin'),false);
 assert.equal(canTransition('approved','submit','admin'),false);
});
