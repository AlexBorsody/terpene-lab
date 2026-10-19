'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {loadGenerated}=require('./master-data.cjs');
const d=loadGenerated(require('node:path').join(__dirname,'../data.js'));
const m=JSON.parse(fs.readFileSync(require('node:path').join(__dirname,'../master-data.json')));
const r=require('../research.js').create(d);
const nodes=m.registries.useNodes, assertions=m.registries.evidenceAssertions.filter(a=>a.kind==='study-use');
const within=(child,parent)=>{while(child){if(child===parent)return true;child=nodes.find(n=>n.id===child)?.parentId;}return false;};
const expected=new Map(nodes.map(n=>[n.id,new Set(assertions.filter(a=>within(a.useNodeId,n.id)).map(a=>a.oilId))]));
let pairs=0;
for(const node of nodes){
 assert.equal(r.label(node.id),node.displayLabel||node.label);
 assert.deepEqual(r.matchingOilIds(node.id,{eligibleOnly:false}).sort(),[...expected.get(node.id)].sort());
 for(const oil of m.oils){
  const ids=assertions.filter(a=>a.oilId===oil.id && within(a.useNodeId,node.id)).map(a=>a.studyId);
  assert.deepEqual(r.studiesForOil(oil.id,node.id).map(s=>s.id).sort(),[...new Set(ids)].sort(),oil.id+'/'+node.id);
 }
}
for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
 const ids=[nodes[i].id,nodes[j].id],a=expected.get(ids[0]),b=expected.get(ids[1]);
 for(const match of ['all','any'])assert.deepEqual(r.matchingOilIds(ids,{eligibleOnly:false,match}).sort(),m.oils.filter(o=>match==='all'?a.has(o.id)&&b.has(o.id):a.has(o.id)||b.has(o.id)).map(o=>o.id).sort());
 pairs++;
}
assert.deepEqual(r.matchingOilIds('unknown-topic',{eligibleOnly:false}),[]);
assert.ok(r.matchingOilIds('health-cognitive',{eligibleOnly:false}).includes('clove'));
assert.ok(r.matchingOilIds('health-cognitive-attention',{eligibleOnly:false}).includes('rosemary'));
assert.deepEqual(r.matchingOilIds('cleaning-surface-disinfection',{eligibleOnly:false}).sort(),['oregano','thyme']);
assert.equal(r.label('sensory'),'Scent chemistry');
assert.ok(!assertions.some(a=>a.studyId==='kumar-mishra-2011' && a.useNodeId==='pest-ticks'));
assert.match(d.studies.find(s=>s.id==='francisconi-2020').finding,/Tea tree oil/);
assert.ok(assertions.filter(a=>a.studyId==='holloway-2024-argentineant' && a.oilId==='rosemary').every(a=>a.material.kind==='plant-material' && !a.researchMatch));
console.log(`catalog-consistency: ${nodes.length} topics × ${m.oils.length} oils; ${pairs} topic pairs checked in both all/any modes`);
