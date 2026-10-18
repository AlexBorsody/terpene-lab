const assert = require('node:assert/strict');
const Research = require('../research.js');

const fixture = () => ({
  taxonomy: {version: 1, nodes: [
    {id:'health',label:'Health research',parentId:null,legacyBindings:[{type:'health'}]},
    {id:'skin',label:'Skin',parentId:'health',legacyBindings:[{type:'health',subcategory:'skin'}]},
    {id:'skin-barrier',label:'Barrier',parentId:'skin'},
    {id:'skin-barrier-model',label:'Experimental model',parentId:'skin-barrier'},
    {id:'microbial',label:'Microbial',parentId:null},
    {id:'bacteria',label:'Bacteria',parentId:'microbial'},
    {id:'empty',label:'Empty topic',parentId:'microbial'},
    {id:'botanical',label:'Botanical chemistry',parentId:null,navigationRoot:false},
    {id:'composition',label:'Composition',displayLabel:'Composition analysis',parentId:'botanical',navigationRoot:true,aliases:['botanical:composition']}
  ], aliases: {'legacy-skin':'skin'}},
  oils: [{id:'alpha'}, {id:'beta'}, {id:'gamma'}],
  studies: [
    {id:'s1',oilIds:['alpha','beta'],useNodeIds:['skin','bacteria']},
    {id:'s2',oilIds:['alpha'],useNodeIds:['skin-barrier-model','skin']},
    {id:'s3',oilIds:['gamma'],useNodeIds:['composition']},
    {id:'s4',oilIds:['gamma'],useNodeIds:['unknown']}
  ],
  evidenceAssertions: [
    {id:'a1',kind:'study-use',oilId:'alpha',studyId:'s1',useNodeId:'skin',researchMatch:true,outcome:'mixed'},
    {id:'a2',kind:'study-use',oilId:'beta',studyId:'s1',useNodeId:'bacteria',researchMatch:true},
    {id:'a3',kind:'study-use',oilId:'alpha',studyId:'s2',useNodeId:'skin-barrier-model',researchMatch:false},
    {id:'a4',kind:'study-use',oilId:'alpha',studyId:'s2',useNodeId:'skin',researchMatch:false},
    {id:'a5',kind:'study-use',oilId:'gamma',studyId:'s3',useNodeId:'composition'},
    {id:'c1',kind:'chemical-observation',oilId:'alpha',studyId:'s1',useNodeId:'bacteria',researchMatch:true}
  ]
});
const data = fixture(), before = JSON.stringify(data), r = Research.create(data);
assert.equal(r.resolve({type:'health',subcategory:'skin'}),'skin');
assert.equal(r.resolve('health:skin'),'skin');
assert.equal(r.resolve('legacy-skin'),'skin');
assert.equal(r.resolve('botanical:composition'),'composition');
assert.equal(r.resolve('missing'),null);
assert.equal(r.resolve({type:'health',subcategory:'skin',topic:'unknown'}),null,'Unknown child must not silently resolve to a supported parent');
assert.deepEqual(r.roots().map(n=>n.id),['health','microbial','composition']);
assert.equal(r.label('composition'),'Composition analysis');
assert.equal(r.breadcrumb('skin-barrier-model'),'Health research › Skin › Barrier › Experimental model');
assert.deepEqual(r.ancestors('skin-barrier-model').map(n=>n.id),['health','skin','skin-barrier']);
assert.deepEqual(r.descendants('health'),['health','skin','skin-barrier','skin-barrier-model']);
assert.deepEqual(r.descendants('health',false),['skin','skin-barrier','skin-barrier-model']);
assert.equal(r.countStudies('health'),2,'Ancestor counts deduplicate a study attached to several descendants');
assert.equal(r.countStudies(['skin','bacteria']),2,'Multiple selected tags are an OR union, not repeated papers');
assert.equal(r.countStudies('skin',{oilId:'alpha'}),2);
assert.equal(r.countStudies('skin',{oilId:'alpha',eligibleOnly:true}),1);
assert.equal(r.countStudies('bacteria',{oilId:'alpha'}),0,'Never cross-product global study tags and oil IDs');
assert.deepEqual(r.matchingOilIds('bacteria'),['beta']);
assert.deepEqual(r.matchingOilIds('skin'),['alpha']);
assert.equal(r.countOils('composition'),0,'Missing eligibility is not approval');
assert.equal(r.countOils('composition',{eligibleOnly:false}),1);
assert.equal(r.countStudies('empty'),0);
assert.equal(r.countStudies('missing'),0);
assert.equal(r.matchesStudy(data.studies[0],'missing'),false);
assert.deepEqual(r.unknownStudyTags(data.studies[3]),['unknown']);
assert.deepEqual(r.studiesForOil('gamma').map(s=>s.id),['s3','s4'],'Unresolved bibliography stays visible contextually');
assert.equal(r.assertions('alpha','s1','bacteria').length,0,'Chemical observations cannot create use assertions');
assert.equal(r.assertions('alpha','s1','skin')[0].outcome,'mixed','Mixed outcome remains independent from research-topic matching');
assert.equal(JSON.stringify(data),before,'Indexes do not mutate the canonical snapshot');

// A new branch only in data, at arbitrary depth, propagates without UI code lists.
const extra = fixture();
extra.taxonomy.nodes.push({id:'new-root',label:'New research',parentId:null},
  {id:'new-child',label:'Child',parentId:'new-root'},
  {id:'new-grandchild',label:'Grandchild',parentId:'new-child'},
  {id:'new-leaf',label:'Leaf',parentId:'new-grandchild'});
extra.studies.push({id:'new-study',oilIds:['beta'],useNodeIds:['new-leaf']});
extra.evidenceAssertions.push({id:'new-edge',kind:'study-use',oilId:'beta',studyId:'new-study',useNodeId:'new-leaf',researchMatch:true});
let changed = Research.create(extra);
assert.ok(changed.roots().some(n=>n.id==='new-root'));
assert.equal(changed.countStudies('new-root'),1);
assert.deepEqual(changed.matchingOilIds('new-child'),['beta']);
extra.taxonomy.nodes.find(n=>n.id==='new-leaf').label='Renamed leaf';
extra.taxonomy.nodes.find(n=>n.id==='new-leaf').parentId='health';
changed=Research.create(extra);
assert.equal(changed.resolve('new-leaf'),'new-leaf','Labels/reparenting never regenerate stable IDs');
assert.equal(changed.countStudies('new-root'),0);
assert.equal(changed.countStudies('health'),3);
assert.equal(changed.breadcrumb('new-leaf'),'Health research › Renamed leaf');
console.log('PASS: dynamic arbitrary-depth taxonomy, aliases, scoped evidence joins, distinct counts, contextual gaps and data-only additions');
