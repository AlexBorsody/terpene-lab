const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync('data.js','utf8') + '\n' + fs.readFileSync('chemistry.js','utf8') + '\nthis.data = TERPENE_DATA; this.rules = CHEMISTRY;',ctx);
const {data:d,rules:r} = ctx;
for (const kind of ['oils','compounds','studies','sources']) assert.equal(new Set(d[kind].map(x=>x.id)).size,d[kind].length, `${kind} IDs unique`);
const compounds = Object.fromEntries(d.compounds.map(c=>[c.id,c]));
for(const [id,cls,group] of [['citral','Monoterpenoid','aldehyde'],['citronellal','Monoterpenoid','aldehyde'],['cinnamaldehyde','Phenylpropanoid','aldehyde'],['linalyl-acetate','Monoterpenoid','ester']]) {
 assert.equal(compounds[id].chemicalClass,cls); assert.ok(r.matches(compounds[id],'',cls,group));
}
assert.ok(r.matches(compounds.citral,'neral'));
assert.ok(r.matches(compounds.prenylthiol,'thiol'));
assert.ok(r.matches(compounds['cannflavin-a'],'','Flavonoid','flavonoid'));
assert.ok(!r.matches(compounds['linalyl-acetate'],'','Phenylpropanoid','ester'));
assert.equal(new Set(r.compoundCategories.map(c=>c.id)).size,r.compoundCategories.length);
assert.equal(new Set(r.compoundCategories.map(c=>c.label)).size,r.compoundCategories.length);
assert.equal(r.compoundCategories.filter(c=>c.label==='Flavonoids').length,1);
for(const category of r.compoundCategories) assert.ok(d.compounds.some(c=>r.matchesCategory(c,category.id)),category.label);
for(const compound of d.compounds) assert.ok(r.compoundCategories.some(category=>r.matchesCategory(compound,category.id)),compound.name);
for(const category of ['terpenes','class:Monoterpenoid','group:aldehyde']) assert.ok(r.matchesCategory(compounds.citral,category));
for(const category of ['terpenes','class:Monoterpenoid','group:ester']) assert.ok(r.matchesCategory(compounds['linalyl-acetate'],category));
assert.ok(r.matchesCategory(compounds.cinnamaldehyde,'group:aldehyde'));
assert.ok(!r.matchesCategory(compounds.cinnamaldehyde,'terpenes'));
assert.ok(r.matchesCategory(compounds.nobiletin,'group:flavonoid'));
assert.ok(!r.matchesCategory(compounds.nobiletin,'terpenes'));
assert.ok(!r.matchesCategory(compounds.citral,'unknown'));
// A new canonical chemical category requires no handwritten class or label list.
{
 const fixture=JSON.parse(JSON.stringify(d));
 fixture.compounds.push({id:'fixture-chemical',name:'Fixture molecule',chemicalClass:'Fixture class',functionalGroups:[],aliases:[]});
 fixture.chemicalTaxonomy.nodes.push(
  {id:'fixture-family',label:'Fixture family',parentId:null,selectable:true,match:{includeDescendants:true}},
  {id:'class:Fixture class',label:'Fixture classes',parentId:'fixture-family',selectable:true,match:{chemicalClasses:['Fixture class']}},
  {id:'fixture-compound-list',label:'Fixture compound list',parentId:null,selectable:true,match:{compoundIds:['fixture-chemical']}}
 );
 const dynamic=vm.createContext({TERPENE_DATA:fixture});
 vm.runInContext(fs.readFileSync('chemistry.js','utf8')+'\nthis.rules=CHEMISTRY;',dynamic);
 for(const id of ['fixture-family','class:Fixture class','fixture-compound-list']) {
  assert.ok(dynamic.rules.compoundCategories.some(node=>node.id===id));
  assert.ok(dynamic.rules.matchesCategory(fixture.compounds.at(-1),id));
  assert.ok(!dynamic.rules.matchesCategory(fixture.compounds[0],id));
 }
 assert.ok(!dynamic.rules.matchesCategory(fixture.compounds.at(-1),'terpenes'));
}
assert.ok(!r.quantified({range:{min:1,max:3}}));
for (const range of [null,{}, {min:null,max:5},{min:0,max:NaN},{min:-1,max:2},{min:10,max:2},{min:1,max:101}]) assert.ok(!r.validRange(range));
const complete = {range:{min:1,max:3},sourceIds:['oswald-2021'],material:'test fixture',sample:'fixture',extraction:'fixture',method:'fixture',basis:'fixture'};
assert.ok(r.quantified(complete));
for(const key of ['sourceIds','material','sample','extraction','method','basis']) {const row={...complete};delete row[key];assert.ok(!r.quantified(row),key);}
for(const oil of d.oils) {
 assert.ok(Array.isArray(oil.chemicalEvidence));
 for(const entry of oil.chemicalEvidence) {
  assert.ok(d.chemicalGroups.some(g=>g.id===entry.group));
  assert.ok(entry.material && entry.method && entry.finding && entry.extraction);
  assert.ok(r.hasSources(entry), `${oil.id} evidence source`);
  for(const id of entry.compoundIds || []) assert.ok(compounds[id]);
  if(entry.status==='quantified') assert.ok(r.quantified(entry));
 }
 for(const c of oil.constituents) assert.ok(compounds[c.compoundId]);
 assert.ok(!oil.constituents.some(c=>c.compoundId==='cannflavin-a'));
}
for(const study of d.studies) {
 for(const id of study.compoundIds) assert.ok(compounds[id],id);
 for(const cat of study.categories) assert.ok(d.categories.some(c=>c.type===cat.type),cat.type);
}
// Verified observations outrank unsourced legacy constituent placeholders.
for (const [compound,oil,value] of [['citronellal','citronella',27.87],['cinnamaldehyde','cinnamon',77.42],['linalyl-acetate','clary-sage',49.1],['linalyl-acetate','bergamot',36.3]]) {
 const relationship=r.oilRelationships(compound).find(x=>x.oil.id===oil);
 assert.ok(r.quantified(relationship.record));assert.equal(relationship.range.min,value);
 assert.ok(relationship.record.sample && relationship.record.method && relationship.record.basis && relationship.record.extraction);
 assert.equal(relationship.kind,'oil-observation');
}
for(const compound of ['menthyl-acetate','geranyl-acetate','grapefruit-thiol','nobiletin']) assert.ok(r.oilRelationships(compound).length,compound);
assert.equal(r.oilRelationships('prenylthiol').length,0,'Plant/extract reports do not create oil relationships');
assert.equal(r.oilRelationships('cannflavin-a').length,0);
assert.equal(r.oilRelationships('nobiletin').length,3);
assert.ok(r.oilRelationships('nobiletin').every(x=>x.kind==='nonvolatile-oil' && !r.quantified(x.record)));
const aroma=d.studies.find(s=>s.id==='cannabis-aroma-chemistry-2023');
assert.equal(aroma.pubmedId,'37901519');assert.equal(aroma.categories[0].type,'sensory');
assert.equal(fs.readFileSync('CNAME','utf8').trim(),'lab.sunnysshield.com');
console.log(`PASS: schema, overlapping filters, aliases, missing-value guards, ${d.oils.length} oil evidence collections and citation regression`);
