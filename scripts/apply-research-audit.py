#!/usr/bin/env python3
"""Apply reviewed research packets to the canonical oil-first registry.

This is a one-time, deterministic integration tool, not a runtime data source.
Pass the source-audit packet directory explicitly; published data never includes
private audit paths. The canonical JSON remains the only editable app source.
"""
import argparse, copy, hashlib, importlib.util, json, re, unicodedata
from pathlib import Path

DATE = '2026-10-18'
parser = argparse.ArgumentParser()
parser.add_argument('master', type=Path)
parser.add_argument('audit_directory', type=Path)
args = parser.parse_args()
def read(name):
    return json.loads((args.audit_directory / name).read_text())
M = json.loads(args.master.read_text())
BEFORE = copy.deepcopy(M)
P = read('functional-evidence-scoped-patch.json')
NEW = read('functional-evidence-verified-additions.json')['records']
DEPTH = read('functional-evidence-verification-depth.json')
PACKETS = [read('functional-evidence-' + name + '.json') for name in ['citrus-skin', 'leaf-wood', 'spice-grass']]
R = M['registries']
STUDIES = {x['id']: x for x in R['studies']}
OILS = {x['id']: x for x in M['oils']}
NODES = {x['id']: x for x in R['useNodes']}
ORIGINAL_STUDIES = {x['id']: copy.deepcopy(x) for x in R['studies']}
ORIGINAL_ASSERTIONS = {x['id']: copy.deepcopy(x) for x in R['evidenceAssertions']}
PRIMARY_EDGES = {tuple(x) for x in DEPTH['sourceReverifiedExistingEdges']}
MAPS = {}
for packet in PACKETS:
    for oil in packet['oils']:
        for mapping in oil.get('mappings', []):
            for sid in mapping.get('studyIds', [mapping.get('studyId')]):
                if sid:
                    MAPS.setdefault((oil['oilId'], sid), []).append(mapping)

def unique(items):
    return list(dict.fromkeys(x for x in items if x is not None))
def parts(category):
    return [category[k] for k in ['type', 'subcategory', 'topic'] if category.get(k)]
def node_parts(node):
    bindings = node.get('legacyBindings', [])
    if bindings:
        return parts(bindings[0])
    return [node['id']]
def slug(value):
    return re.sub('[^a-z0-9]+', '-', unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode().lower()).strip('-')
def ensure_node(path):
    if isinstance(path, str): path = path.split('/')
    if path[0] == 'pest' and len(path) > 1 and path[1] == 'mosquito': path[1] = 'mosquitoes'
    for n in R['useNodes']:
        if [slug(x) for x in path] == [slug(x) for x in node_parts(n)]:
            n['aliases']=unique(n.get('aliases',[])+['/'.join(path),':'.join(path)])
            return n['id']
    parent = ensure_node(path[:-1]) if len(path) > 1 else None
    nid = slug('-'.join(path))
    if len(nid) > 64 or nid in NODES:
        nid = nid[:47].rstrip('-') + '-' + hashlib.sha256(json.dumps(path, separators=(',', ':')).encode()).hexdigest()[:16]
    label = path[-1].replace('-', ' ').capitalize()
    n = {'id': nid, 'label': label, 'parentId': parent, 'aliases': unique([nid, ':'.join(path), '/'.join(path)]),
         'legacyBindings': [dict(zip(['type', 'subcategory', 'topic'], path))], 'declared': True}
    if nid == 'botanical-bioactivity':
        n.update(displayLabel='Cellular and preclinical research', navigationRoot=True)
    R['useNodes'].append(n); NODES[nid] = n
    return nid

def source_urls(sid):
    s = STUDIES[sid]
    return unique([s.get('url'), s.get('fullTextUrl')])
def source_ids(sid):
    return [s['id'] for s in R['sources'] if s.get('studyRef') == sid]
def add_link(oil_id, study_id):
    if any(x['studyId'] == study_id for x in OILS[oil_id]['studyLinks']): return
    used = [x['order'] for o in M['oils'] for x in o['studyLinks'] if x['studyId'] == study_id]
    OILS[oil_id]['studyLinks'].append({'studyId': study_id, 'order': max(used, default=-1) + 1})

# Corrections with unambiguous primary-source metadata; IDs intentionally stay stable.
STUDY_PATCHES = {
 'nialeila-2020-myrrh-frankincense-wound': {
  'authors': 'Faraji A, Aghdaki M, Hessami K, et al.',
  'title': 'Episiotomy wound healing by Commiphora myrrha (Nees) Engl. and Boswellia carteri Birdw. in primiparous women: A randomized controlled trial',
  'material': 'Separate myrrh and frankincense botanical-extract sitz baths, not essential oils.',
  'finding': 'Among 90 women, myrrh-extract sitz baths improved episiotomy REEDA healing scores more than frankincense extract or betadine. Frankincense and betadine did not differ significantly.',
  'limitations': 'Specific extract preparations and postpartum clinical setting; no whole-oil or spray inference. Frankincense was Boswellia carteri, not the catalog Boswellia serrata.'},
 'commercial-eo-antibiofilm-2023': {
  'authors': 'Neagu R, Popovici V, Ionescu LE, Ordeanu V, Popescu DM, Ozon EA, Gird CE', 'doi': '10.3390/antibiotics12071191',
  'limitations': 'In-vitro sample- and concentration-dependent effects, often weak or undetected at lower dilutions. Biofilm-formation testing does not establish mature-biofilm removal, cleaning or disinfection.'},
 'cannabis-terpenes-review-2020': {'pubmedId': '33859287', 'url': 'https://pubmed.ncbi.nlm.nih.gov/33859287/'},
 'moss-2008-peppermint-cognition': {
  'finding': 'In 144 healthy adults, peppermint aroma improved memory and subjective alertness. Ylang-ylang aroma increased calmness but reduced alertness, impaired memory and slowed processing.',
  'limitations': 'Single acute laboratory exposure with expectancy and scent-masking limitations; no treatment or finished-product performance claim.'},
 'alqareer-alyahya-andersson-2006': {
  'material': 'Homemade ground-clove and glycerin gel; not distilled clove essential oil.',
  'finding': 'In 73 healthy volunteers, ground-clove gel and benzocaine reduced dental needle-insertion pain relative to placebo; the active groups did not differ significantly.',
  'limitations': 'A single buccal-mucosa application before a needle insertion. No essential-oil analgesia, toothache treatment or arbitrary topical formulation claim.'},
 'mahboubi-2016-myrrh-dermatophyte': {
  'finding': 'Commiphora molmol oil and a separate ethanol extract inhibited tested dermatophytes in vitro. Furanoeudesma-1,3-diene and menthofuran were major oil components; curzerene was described among major extract components.',
  'limitations': 'Oil and extract are separate materials. Laboratory fungal inhibition is not clinical skin treatment or wound-healing evidence.'},
 'frank-2009-frankincense-bladder-cancer': {
  'limitations': 'Boswellia carteri oil in bladder-cell cultures, not the catalog Boswellia serrata. Cell cytotoxicity is neither immune support nor clinical cancer or skin efficacy.'},
 'fikry-2025-niaouli-lung-cancer': {
  'limitations': 'Cell-culture and computational research; no in-vivo or human efficacy. Cytotoxicity does not establish immune support or a therapeutic blend use.'},
 'han-2006-dysmenorrhea': {
  'limitations': 'Topical lavender, clary sage and rose blend; individual oil contributions were not isolated. No arbitrary spray or single-oil efficacy inference.'},
 'schulze-2011-ticks': {
  'studyType': 'field-study',
  'limitations': 'Field-plot tick-drag evaluation. Isolated nootkatone and carvacrol are distinct from grapefruit and oregano essential oils; no arbitrary spray protection claim.'},
 'chaves-campos-2026': {
  'limitations': 'Off-animal filter-paper assays; no pet treatment, host safety or field validation. The lemongrass arm was Cymbopogon flexuosus, not the catalog C. citratus. Each oil and geraniol arm must remain distinct.'},
 'moridpour-2024-cinnamon': {
  'material': 'Oral cinnamon supplements in a systematic review; not cinnamon bark essential oil.',
  'limitations': 'Heterogeneous oral cinnamon preparations and doses across trials. Secondary evidence does not support metabolic effects of cinnamon essential oil or a spray.'},
 'fradin-day-2002': {
  'limitations': 'Small human arm-exposure comparison of commercial products; short protection under these conditions is retained. Citronella-containing products do not authenticate a C. nardus-only oil or establish long-lasting protection.'}
}
for sid, fields in STUDY_PATCHES.items(): STUDIES[sid].update(fields)

# Enrich existing composition papers; never add a duplicate publication.
ENRICH = {
 'composition-cx12': ('The same commercial oil also showed variable antimicrobial/biofilm effects and laboratory insecticidal activity against Oxycarenus lavaterae; isolated caryophyllene was tested separately.',
  'Single commercial sample and laboratory/food models; constituent results are not whole-oil results. No clinical benefit, finished-product effect or safe pest application established.'),
 'composition-cx13': ('The same commercial oil also showed sample-specific antibacterial and biofilm effects, and laboratory mortality of Harmonia axyridis.',
  'One producer/sample and laboratory/food models; biofilm effects and insect mortality do not establish household disinfection, safe exposure or field control.'),
 'composition-peppermint-2012': ('The same hydrodistilled oil inhibited tested fungi and Candida biofilm formation in laboratory assays.',
  'One characterized hydrodistilled sample differs from the catalog steam-distillation label. No human fungal treatment or disinfection claim.'),
 'composition-eucalyptus-2023': ('The same commercial oil was tested in bacterial, fungal, biofilm and vapor-phase food-model assays.',
  'One commercial sample; laboratory and food matrices do not establish human skin treatment or cleaning. 1,8-cineole is a cyclic ether, not an epoxide.'),
 'composition-lemongrass-2014': ('The same oil inhibited fungal growth in culture and reduced experimentally induced mouse-ear edema.',
  'Fresh/dried feedstock reporting is inconsistent. Fungal cultures and topical mouse experiments are separate models; neither establishes human skin benefit or safe inhalation.'),
 'composition-citronella-2016': ('The same C. nardus oil inhibited many Candida isolates and mature biofilms, with variable susceptibility and mammalian-cell cytotoxicity.',
  'C. nardus differs from C. winterianus; sample preparation differs from the catalog label. Cytotoxicity occurred below some antifungal MICs; no clinical skin treatment or topical safety inference.'),
 'composition-cinnamon-2022': ('The same bark oil showed antistaphylococcal and antibiofilm effects against canine-otitis isolates in vitro.',
  'C. zeylanicum is a synonym of C. verum. Canine-source cultures are not treated dogs; bark oil differs from leaf/root oils. No veterinary treatment or dermal suitability claim.'),
 'composition-cx16': ('The same palmarosa oil inhibited several cultured clinical isolates; P. aeruginosa was inactive at the tested range, and HepG2 viability declined at the highest oil concentration.',
  'Supplier composition was not independently remeasured. Clinical isolates are not a clinical trial. No wound, skin, respiratory or safety benefit established.')
}
for sid, (finding, limitation) in ENRICH.items():
    base = ORIGINAL_STUDIES[sid]['finding']
    STUDIES[sid]['finding'] = base + ' ' + finding
    STUDIES[sid]['limitations'] = limitation
    STUDIES[sid]['studyType'] = 'laboratory-study'

for s in NEW:
    if s['id'] in STUDIES: raise ValueError('Addition already exists; avoid duplicate canonical publication: ' + s['id'])
    fields = {k: copy.deepcopy(v) for k, v in s.items() if k not in ['oilIds','categories','verification','verifiedSections','materialRelevance','outcome','supportsResearchTopic','supportsDirectCatalogOilSuggestion','supportsFinishedBlendEfficacy','speciesMatch']}
    fields['useNodeIds'] = [ensure_node(parts(c)) for c in s['categories']]
    R['studies'].append(fields); STUDIES[s['id']] = fields
    for oid in s['oilIds']: add_link(oid, s['id'])
for oid, sid in [('ylang-ylang','moss-2008-peppermint-cognition'), ('clary-sage','han-2006-dysmenorrhea'), ('bergamot','graham-browne-cox-2003')]: add_link(oid, sid)

# Replace misleading endpoint categories without removing oil-study relationships.
def corrected_path(sid, path):
    if isinstance(path, str): path = path.split('/')
    p = '/'.join(path)
    if sid == 'washing-liquids-eo-2011' and path[0] == 'cleaning': return ['microbial','bacteria','formulation-preservation']
    if sid == 'farouk-2022' and path[0] == 'cleaning': return ['microbial','bacteria','textile-finishing']
    if sid == 'hur-park-2007' and path[0] == 'cleaning': return ['health','oral-dental','oral-malodor']
    if sid == 'guo-2024-oregano-listeria' and path[0] == 'cleaning': return ['microbial','biofilms']
    if sid == 'sateriale-forgione-2024' and path[0] == 'cleaning':
        return ['microbial', 'environmental-counts', 'air' if path[1] == 'air' else 'surfaces']
    if sid in ['frank-2009-frankincense-bladder-cancer','fikry-2025-niaouli-lung-cancer'] and path[0] == 'health':
        return ['botanical','bioactivity','cellular-cytotoxicity']
    if sid == 'mahboubi-2016-myrrh-dermatophyte' and p == 'health/skin': return ['microbial','fungi','dermatophytes']
    if sid == 'sienkiewicz-2014-geranium-wound-bacteria' and p == 'health/wound': return ['microbial','bacteria','gram-negative']
    if sid == 'alqareer-alyahya-andersson-2006': return ['health','oral-dental','needle-insertion-pain']
    if sid == 'tea-tree-acne-2007' and p == 'health/skin': return ['health','skin','acne']
    if sid == 'tea-tree-dandruff-2002' and p == 'health/skin': return ['health','skin','dandruff']
    if sid == 'hongratanaworakit-2006-ylang-ylang-transdermal':
        if p == 'health/mental-health': return ['health','mental-health','calm']
        if p == 'health/cardiovascular': return ['health','cardiovascular','acute-physiology']
    if sid in ['halder-2011-clove-memory','halder-2012-clove-acute-cognition'] and path[0] == 'health': return ['botanical','bioactivity','animal-cognition']
    if sid == 'carvacrol-safety-2021': return ['botanical','bioactivity','oral-tolerability']
    if path[0] == 'pest' and len(path)>1 and path[1] == 'mosquito': path[1] = 'mosquitoes'
    return path

# Index both existing and new scoped edges by semantic key, preserving existing IDs.
ASSERTIONS = {}
for a in R['evidenceAssertions']:
    if a['kind'] != 'study-use': continue
    old_path = node_parts(NODES[a['useNodeId']])
    nid = ensure_node(corrected_path(a['studyId'], old_path))
    key = (a['oilId'], a['studyId'], nid)
    a['useNodeId'] = nid
    if key not in ASSERTIONS: ASSERTIONS[key] = a

def get_assertion(oid, sid, path):
    nid = ensure_node(corrected_path(sid, path))
    key = (oid, sid, nid)
    if key not in ASSERTIONS:
        digest = hashlib.sha256(json.dumps(list(key), separators=(',',':')).encode()).hexdigest()[:24]
        ASSERTIONS[key] = {'id': 'use-' + digest, 'kind':'study-use', 'oilId':oid, 'studyId':sid, 'useNodeId':nid,
                          'finding':None, 'limitations':None, 'route':None, 'species':None}
    return ASSERTIONS[key]

def selected_mapping(oid, sid, path):
    candidates = MAPS.get((oid,sid), [])
    for mapping in candidates:
        cats = mapping.get('recommendedTags', mapping.get('recommendedCategories', []))
        if any(corrected_path(sid,parts(c)) == path for c in cats): return mapping
    return candidates[0] if candidates else {}

def classify_material(relevance, label, sid):
    txt = (label or '').lower()
    if relevance == 'isolated-compound': return 'isolated-compound'
    if relevance == 'review': return 'review'
    if re.search(r'\bextracts?\b',txt) and 'separate' not in txt: return 'botanical-extract'
    if any(x in txt for x in ['ground-clove','ground clove']): return 'botanical-preparation'
    if any(x in txt for x in ['mouthwash blend','three-oil','multi-ingredient','essential-oil-blend','pmd plus']): return 'combination'
    if sid in ['kasper-2010-silexan','khanna-macdonald-levesque-2014','moridpour-2024-cinnamon']: return 'oral-preparation'
    if relevance in ['related-species','related-species/preparation']: return 'related-preparation'
    if sid in ['tea-tree-acne-2007','tea-tree-dandruff-2002']: return 'single-oil-topical-formulation'
    if relevance == 'related-preparation': return 'related-preparation'
    return 'essential-oil'

# Prefer detailed mappings over broad copied study facets. A library value is never
# presented as an independently verified outcome.
for row in sorted(P['assertions'], key=lambda a: (corrected_path(a['studyId'],parts(a['use'])) == parts(a['use']), bool(a.get('material')))):
    oid,sid = row['oilId'],row['studyId']
    path=corrected_path(sid,parts(row['use'])); a=get_assertion(oid,sid,path)
    mapping=selected_mapping(oid,sid,path)
    checked = row['verificationDepth'].startswith('primary') and ((oid,sid) in PRIMARY_EDGES or (oid,sid)==('ylang-ylang','moss-2008-peppermint-cognition'))
    relevance=row['materialRelevance']
    rawlabel=mapping.get('material') or row.get('material') or STUDIES[sid].get('material')
    label=rawlabel or ('Named whole-oil sample; preparation details were not independently recorded.' if relevance in ['whole-oil','whole-oil-direct'] else 'Preparation needs primary-source verification.')
    model_label=mapping.get('model') or row.get('model') or STUDIES[sid].get('context','Not reported')
    model_kind=row.get('model') or 'unverified'
    if path[:2] == ['botanical','composition']: model_kind='analytical'; model_label='Chemical composition analysis of the cited sample.'
    if sid=='composition-lemongrass-2014':
        if path[0]=='health': model_kind='animal'; model_label='Croton-oil-induced mouse-ear edema and histology.'
        elif path[0]=='microbial': model_kind='in-vitro'; model_label='Candida and Aspergillus culture assays.'
    if sid.startswith('halder-'): model_kind='animal'
    kind=classify_material(relevance,label,sid)
    direct = relevance in ['whole-oil','whole-oil-direct'] and kind in ['essential-oil','single-oil-topical-formulation']
    if row.get('speciesMatch') == 'different-species' or sid=='chen-2020-ravintsara-mrsa': direct=False
    if sid=='chaves-campos-2026' and oid=='lemongrass': direct=False
    if sid in ['gertsch-2008-caryophyllene','eugenol-2021-memory-neurogenesis','carvacrol-asthma-2021','carvacrol-asthma-phase2-2018','carvacrol-safety-2021','schulze-2011-ticks','cannabis-terpenes-review-2020','menthol-migraine-2010']:
        kind='isolated-compound'; direct=False
    if sid in ['nialeila-2020-myrrh-frankincense-wound','composition-thyme-extract-2022','composition-oregano-extract-2021','composition-lemongrass-infusion-2014']:
        kind='botanical-extract'; direct=False
    direction=row['reportedOutcome'] if checked else 'unverified'
    if checked and path[:2]==['botanical','composition']: direction='analytical-not-efficacy'
    outcome={'direction':direction, 'label': ('Analytical composition; no efficacy endpoint.' if direction=='analytical-not-efficacy' else direction.replace('-',' ')), 'verification':'source-checked' if checked else 'library-reported-unverified'}
    if not checked: outcome['reportedDirection']=row['reportedOutcome']
    match=bool(checked and direct and row['eligibleForSuggestion'])
    if path[0]=='botanical' and path[1]!='composition': match=False
    if sid=='sateriale-forgione-2024' and path[:2]==['microbial','environmental-counts']: match=bool(checked and direct)
    if kind=='oral-preparation' or sid in ['halder-2011-clove-memory','halder-2012-clove-acute-cognition']: match=False
    urls=unique(([row.get('sourceUrl')] + mapping.get('sourceUrls', []) + [mapping.get('verifiedPrimaryUrl')]) if checked else source_urls(sid))
    if sid=='cannabis-terpenes-review-2020': urls=source_urls(sid)
    qualifier=STUDIES[sid]['limitations'] if sid in STUDY_PATCHES or sid in ENRICH else row.get('qualifier')
    notes=unique([row['verificationDepth'], qualifier, mapping.get('limitations')] + row.get('eligibilityReasons', []))
    if path != parts(row['use']): notes.append('Original category corrected to the measured endpoint; oil-study relationship retained.')
    a.update(material={'kind':kind,'label':label,'relevance':relevance,'speciesMatch':row.get('speciesMatch','unverified')},
             model={'kind':model_kind,'label':model_label}, outcome=outcome,
             route=None, species=(OILS[oid]['record'].get('latinName') if row.get('speciesMatch')=='same-named-species' else 'not-independently-authenticated'),
             relevance='direct' if direct and checked else ('contextual' if checked or relevance not in ['whole-oil','whole-oil-direct'] else 'unreviewed'),
             researchMatch=match, supportsFunctionalUse=bool(match and path[0]!='botanical'),
             verification={'status':'source-checked' if checked else 'library-reviewed','sourceIds':source_ids(sid),'urls':urls,'checkedAt':DATE if checked else None,'notes':' '.join(notes)},
             finding=None,limitations=None)
    # Distinct intervention arms must never inherit another oil's result.
    if sid=='nialeila-2020-myrrh-frankincense-wound':
        a['finding']='Myrrh-extract sitz baths improved REEDA healing scores relative to frankincense extract and betadine.' if oid=='myrrh' else 'Frankincense-extract sitz baths did not significantly differ from betadine in REEDA healing scores.'
        a['material']['label']='Commiphora myrrha extract sitz bath' if oid=='myrrh' else 'Boswellia carteri extract sitz bath'
        a['species']='Commiphora myrrha' if oid=='myrrh' else 'Boswellia carteri'
        a['route']='topical-sitz-bath'
        a['outcome']['direction']='positive' if oid=='myrrh' else 'null'
    if sid=='moss-2008-peppermint-cognition':
        a['route']='inhalation'
        if oid=='peppermint':
            a['finding']='Peppermint aroma improved memory and increased subjective alertness in the acute experiment.'
            a['outcome'].update(direction='positive-in-studied-model',label='Memory or alertness improved in the acute experiment.')
        elif path[:2]==['health','cognitive']:
            a['finding']='Ylang-ylang aroma impaired memory, slowed processing and reduced subjective alertness.'
            a['outcome'].update(direction='negative',label='Measured cognition or alertness worsened.');a['researchMatch']=False;a['supportsFunctionalUse']=False
        else:
            a['finding']='Ylang-ylang aroma increased calmness, alongside reduced alertness and worse cognitive performance.'
            a['outcome'].update(direction='mixed',label='Calmness increased; alertness and cognition worsened.')
    if sid=='composition-lemongrass-2014' and path[0]=='health':
        a['finding']='Topical oil reduced experimentally induced mouse-ear edema and inflammatory histological changes.'
        a['limitations']='Animal experiment, not human skin or cosmetic benefit; no treatment or formulation recommendation.'

# Add precise missing same-paper endpoints checked in the primary publications.
for oid,sid,path,model in [
 ('clary-sage','composition-cx12','pest/plant-bugs/oxycarenus-lavaterae','Oxycarenus lavaterae in sealed Petri-dish laboratory exposure.'),
 ('geranium','composition-cx13','pest/beetles/harmonia-axyridis','Harmonia axyridis in sealed Petri-dish laboratory exposure.')]:
    a=get_assertion(oid,sid,path)
    a.update(material={'kind':'essential-oil','label':STUDIES[sid]['material'],'relevance':'whole-oil','speciesMatch':'same-named-species'},
             model={'kind':'environmental','label':model},outcome={'direction':'positive-in-studied-model','label':'Laboratory insect mortality was observed.','verification':'source-checked'},
             route='laboratory-vapor-exposure',species=OILS[oid]['record']['latinName'],relevance='direct',researchMatch=True,supportsFunctionalUse=True,
             finding=None,limitations=None,
             verification={'status':'source-checked','sourceIds':source_ids(sid),'urls':['https://pmc.ncbi.nlm.nih.gov/articles/'+('PMC10049179/' if oid=='clary-sage' else 'PMC10778218/')],'checkedAt':DATE,
                           'notes':'Primary abstract and experimental insect section checked. Laboratory mortality does not establish field efficacy, repellency, human/pet safety or a safe use concentration.'})

for oid,sid in [('clary-sage','han-2006-dysmenorrhea'),('bergamot','graham-browne-cox-2003')]:
    for nid in STUDIES[sid]['useNodeIds']:
        a=get_assertion(oid,sid,node_parts(NODES[nid]))
        a.update(material={'kind':'combination','label':'Lavender, clary sage and rose topical blend.' if oid=='clary-sage' else 'Lavender, bergamot and cedarwood inhalation blend.','relevance':'related-preparation','speciesMatch':'not-independently-authenticated'},
                 model={'kind':'human','label':'Human randomized trial of a multi-oil blend.'}, outcome={'direction':'unverified','reportedDirection':'positive' if oid=='clary-sage' else 'null','label':'Reported blend-level result; individual oil contribution not isolated.','verification':'library-reported-unverified'},
                 route='topical' if oid=='clary-sage' else 'inhalation', species='not-independently-authenticated',relevance='contextual',researchMatch=False,supportsFunctionalUse=False,
                 finding=None,limitations='Blend results cannot be attributed to this individual oil.',
                 verification={'status':'library-reviewed','sourceIds':source_ids(sid),'urls':source_urls(sid),'checkedAt':None,'notes':'Recovered contextual blend component from the canonical paper; no independent source recheck of this arm in this pass.'})

for s in NEW:
    for oid in s['oilIds']:
        for cat in s['categories']:
            a=get_assertion(oid,s['id'],parts(cat)); is_citrus=s['id']=='yang-2021-citrus-cleaning'
            a.update(material={'kind':'essential-oil' if is_citrus else 'related-preparation','label':('Cold-pressed '+OILS[oid]['record']['latinName']+' crude peel oil; molecular-distillation fractions were separate arms.' if is_citrus else s['material']),
                               'relevance':'whole-oil' if is_citrus else s['materialRelevance'],'speciesMatch':'same-named-species' if is_citrus else 'unverified'},
                     model={'kind':s['context'],'label':s['model']},outcome={'direction':s['outcome'],'label':s['outcome'].replace('-',' '),'verification':'source-checked'},
                     route='bench-soil-removal' if is_citrus else ('in-vitro-exposure' if oid=='frankincense' else 'topical'),
                     species=OILS[oid]['record']['latinName'] if is_citrus else 'not-independently-authenticated',relevance='direct' if is_citrus else 'contextual',
                     researchMatch=is_citrus,supportsFunctionalUse=is_citrus,finding=None,limitations=None,
                     verification={'status':'source-checked','sourceIds':source_ids(s['id']),'urls':source_urls(s['id']),'checkedAt':DATE,'notes':s['verification']+'. Sections: '+ '; '.join(s['verifiedSections'])+'. '+s['precaution']})

# Study-level category navigation is a union of the actual scoped assertions.
for s in R['studies']:
    s['useNodeIds']=unique(a['useNodeId'] for a in ASSERTIONS.values() if a['studyId']==s['id'])
R['evidenceAssertions']=[a for a in R['evidenceAssertions'] if a['kind']!='study-use']+list(ASSERTIONS.values())
for oil in M['oils']:
    oil['uses']=[]; branches={}
    def insert(nid):
        if nid in branches: return branches[nid]
        branch={'useNodeId':nid,'evidenceIds':[],'children':[]};branches[nid]=branch
        parent=NODES[nid]['parentId']
        (insert(parent)['children'] if parent else oil['uses']).append(branch)
        return branch
    for a in ASSERTIONS.values():
        if a['oilId']==oil['id']: insert(a['useNodeId'])['evidenceIds'].append(a['id'])
    oil['precautions']['reviewStatus']='unreviewed'
    oil['legacy']['usesVerification']='unverified-legacy'
    # The old eight-oil prose is retained only as an explicitly inactive historical record.
    if 'blend' in oil['legacy']:
        oil['legacy']['blend']['activeEvidenceSource']=False

# Exposure routes are curated by study and endpoint. Never infer a route from
# words in a taxon, preparation, limitation, or another experiment in the paper.
# Each tuple is (route, model kind, endpoint-specific model description).
ENDPOINT_FACETS = {
 'alqareer-alyahya-andersson-2006': ('oral-mucosal','human','73 healthy volunteers; buccal-mucosa gel before dental needle insertion.'),
 'moore-darling-sihuincha-2007': (None,'human','Human volunteer mosquito landing-count trials of a multi-ingredient formulation.'),
 'pinto-2009-clove-antifungal': ('in-vitro-exposure','in-vitro','Candida, Aspergillus and dermatophyte cultures; oil and eugenol arms tested separately.'),
 'firmino-2018-cinnamon-biofilm': ('in-vitro-exposure','in-vitro','Bacterial culture, biofilm biomass and viable-cell assays; distinct oils and cinnamaldehyde arms.'),
 'obistioiu-2023-boswellia': (None,'laboratory','Laboratory assays of a mixed-Boswellia oil; no single exposure route is assigned across assay types.'),
 'mahboubi-2016-myrrh-dermatophyte': ('in-vitro-exposure','in-vitro','Trichophyton and Microsporum dermatophyte cultures; separate oil and ethanol-extract arms.'),
 'guo-2024-oregano-listeria': ('in-vitro-exposure','in-vitro','Listeria monocytogenes cultures and biofilms, including glass-slide assays.'),
 'mori-kawanami-2016': ('topical','animal','Experimentally created rat skin wounds; topical lavender-oil treatment.'),
 'lee-kim-2017': ('in-vitro-exposure','in-vitro','Uropathogenic E. coli biofilm formation measured in culture with microscopy and crystal-violet assays.'),
 'tea-tree-dandruff-2002': ('topical','human','126 participants; four-week randomized trial of a rinse-off tea-tree-oil shampoo.'),
 'tea-tree-acne-2007': ('topical','human','60 patients; randomized placebo-controlled acne trial of a tea-tree-oil gel.'),
 'commercial-eo-antibiofilm-2023': ('in-vitro-exposure','in-vitro','S. aureus, E. coli and P. aeruginosa microplate bacterial-growth and biofilm-formation assays.'),
 'washing-liquids-eo-2011': ('in-vitro-formulation-challenge','laboratory','Microbial preservative-challenge assays in washing-liquid and balm formulations.'),
 'akula-2021-lemongrass': ('oral-mucosal','human','21-day mouthwash trial in 60 children; plaque and gingival indices.'),
 'jurado-2023': ('in-vitro-exposure','in-vitro','N. gonorrhoeae and S. suis bacterial cultures and biofilm assays.'),
 'gilling-2014': ('in-vitro-exposure','in-vitro','Murine-norovirus infectivity assays; oregano oil and isolated carvacrol were separate materials.'),
 'farouk-2022': ('textile-treatment','laboratory','Antibacterial assays of oil-complex-treated cotton before and after washing.'),
 'chaves-campos-2026': ('laboratory-filter-paper-exposure','environmental','Off-animal cat-flea life-stage assays on treated filter paper; separate oil and geraniol arms.'),
 'fang-2016-scabies': ('laboratory-contact-and-vapor','environmental','Contact and fumigation assays on scabies mites removed from experimentally infected pigs.'),
 'cai-2025-dustmite': ('laboratory-contact-and-vapor','environmental','Dust-mite contact, fumigant fabric-disc and repellency assays.'),
 'chandrasekaran-2019-vitex': ('laboratory-larval-exposure','environmental','Aedes aegypti and Culex quinquefasciatus larval assays; V. negundo arm distinguished from V. trifolia.'),
 'gaudet-2024-tickseeking': (None,'environmental','Adult female Ixodes scapularis electrophysiology and Y-tube responses; distinct experimental systems.'),
 'hongratanaworakit-2006-ylang-ylang-transdermal': ('topical','human','40 healthy volunteers; transdermal oil exposure and acute self-report/physiological measurements.'),
 'sienkiewicz-2014-geranium-wound-bacteria': ('in-vitro-exposure','in-vitro','Gram-negative bacterial isolates from wounds grown and tested in culture.'),
 'fikry-2025-niaouli-lung-cancer': ('in-vitro-cell-exposure','in-vitro','A549 lung-cancer and comparator cell cultures; computational analyses are separate from the measured cell endpoints.'),
 'chen-2020-ravintsara-mrsa': ('in-vitro-exposure','in-vitro','Bacterial culture screening and MRSA membrane/metabolomics experiments.'),
 'hovijitra-2016-cinnamon-candida': ('in-vitro-exposure','in-vitro','Planktonic and biofilm-associated Candida albicans cultures.'),
 'moss-2008-peppermint-cognition': ('inhalation','human','144 healthy adults in randomized peppermint, ylang-ylang and no-aroma conditions.'),
 'nialeila-2020-myrrh-frankincense-wound': ('topical-sitz-bath','human','90 postpartum women; separate extract sitz-bath arms and REEDA episiotomy-healing measurements.'),
 'cannabis-terpenes-review-2020': (None,'mixed-preclinical','Mouse behavioral experiments and cell receptor assays; separate experimental systems with no single assigned route.'),
 'composition-peppermint-2012': ('in-vitro-exposure','in-vitro','Candida, Cryptococcus and Aspergillus cultures; separate Candida biofilm-formation assay.'),
 'composition-eucalyptus-2023': (None,'laboratory','Culture and vapor-phase microbial assays; a single exposure route is not assigned across methods.'),
 'composition-citronella-2016': ('in-vitro-exposure','in-vitro','Candida standard/clinical cultures and mature biofilm assays; mammalian-cell toxicity was a separate endpoint.'),
 'composition-lemongrass-2014': ('laboratory-contact-and-vapor','in-vitro','Candida and Aspergillus fungal-growth assays in liquid and vapor phases.'),
 'composition-cinnamon-2022': ('in-vitro-exposure','in-vitro','Staphylococcus isolates from canine otitis; planktonic and biofilm culture assays, not treated dogs.'),
 'composition-cx12': (None,'laboratory','Laboratory microbial cultures and food-model assays; no single route assigned across methods.'),
 'composition-cx13': (None,'laboratory','Laboratory bacterial cultures and food-model assays; no single route assigned across methods.'),
 'composition-cx16': ('in-vitro-exposure','in-vitro','Human clinical bacterial isolates grown in broth; HepG2 toxicity was a separate endpoint.'),
 'sateriale-forgione-2024': (None,'mixed-laboratory','Laboratory culture assays plus environmental microbial counts; no single route assigned across these systems.'),
 'yang-2021-citrus-cleaning': ('bench-soil-removal','laboratory','Oil-soiled gauze bench assay; crude oils and distillation fractions were tested separately.'),
 'han-2017-frankincense-fibroblasts': ('in-vitro-cell-exposure','in-vitro','Cytokine-stimulated human neonatal dermal fibroblast cultures.'),
 'panahi-2015-rosemary-alopecia': ('topical','human','Single-blind six-month scalp-lotion comparison in 100 men with androgenetic alopecia.')
}
ENDPOINT_OVERRIDES = {
 ('pinto-2009-clove-antifungal','microbial-fungi-yeast'): ('in-vitro-exposure','in-vitro','Candida yeast cultures; oil and isolated-eugenol arms were distinct.'),
 ('pinto-2009-clove-antifungal','microbial-fungi-mold'): ('in-vitro-exposure','in-vitro','Aspergillus mold cultures; oil and isolated-eugenol arms were distinct.'),
 ('pinto-2009-clove-antifungal','microbial-fungi-dermatophytes'): ('in-vitro-exposure','in-vitro','Dermatophyte fungal isolates tested in culture; oil and isolated-eugenol arms were distinct.'),
 ('commercial-eo-antibiofilm-2023','microbial-bacteria'): ('in-vitro-exposure','in-vitro','S. aureus, E. coli and P. aeruginosa bacterial-growth microplate assays.'),
 ('commercial-eo-antibiofilm-2023','microbial-biofilms'): ('in-vitro-exposure','in-vitro','S. aureus, E. coli and P. aeruginosa biofilm-formation microplate assays.'),
 ('composition-peppermint-2012','microbial-fungi'): ('in-vitro-exposure','in-vitro','Candida, Cryptococcus and Aspergillus laboratory fungal cultures.'),
 ('composition-peppermint-2012','microbial-biofilms'): ('in-vitro-exposure','in-vitro','XTT assay of Candida biofilm formation.'),
 ('composition-eucalyptus-2023','microbial-fungi'): (None,'laboratory','Yeast culture and vapor-phase mold-growth assays; multiple exposure methods.'),
 ('composition-eucalyptus-2023','microbial-biofilms'): (None,'in-vitro','Laboratory bacterial biofilm assays; exact endpoint-specific exposure method not separately extracted.'),
 ('composition-citronella-2016','microbial-fungi'): ('in-vitro-exposure','in-vitro','Candida standard and clinical-isolate fungal growth assays.'),
 ('composition-citronella-2016','microbial-biofilms'): ('in-vitro-exposure','in-vitro','Mature Candida biofilm assays.'),
 ('composition-cx12','microbial-bacteria'): (None,'laboratory','Bacterial culture and food-model assays with variable exposure methods.'),
 ('composition-cx12','microbial-fungi'): (None,'laboratory','Laboratory fungal assays; no single exposure method assigned.'),
 ('composition-cx12','microbial-biofilms'): (None,'in-vitro','Pseudomonas fluorescens biofilm protein-profile assays on steel and plastic.'),
 ('composition-cx13','microbial-bacteria'): (None,'laboratory','Bacterial culture and food-model assays with variable exposure methods.'),
 ('composition-cx13','microbial-biofilms'): (None,'in-vitro','Salmonella enterica biofilm protein-profile assays on plastic and stainless steel.'),
 ('sateriale-forgione-2024','microbial-environmental-counts-surfaces'): ('laboratory-surface-contact','environmental','Indoor surface-swab culturable microbial counts after direct experimental treatment.'),
 ('sateriale-forgione-2024','microbial-environmental-counts-air'): ('experimental-nebulization','environmental','Culturable airborne microbial counts in an unoccupied laboratory after experimental nebulization.'),
 ('composition-lemongrass-2014','health-skin-inflammation'): ('topical','animal','Croton-oil-induced mouse-ear edema and histological inflammation measurements.'),
 ('composition-lemongrass-2014','health-pain-inflammation'): ('topical','animal','Croton-oil-induced mouse-ear edema and histological inflammation measurements.'),
 ('composition-cx12','pest-plant-bugs-oxycarenus-lavaterae'): ('laboratory-vapor-exposure','environmental','Oxycarenus lavaterae in sealed Petri dishes with treated filter paper in the lid.'),
 ('composition-cx13','pest-beetles-harmonia-axyridis'): ('laboratory-vapor-exposure','environmental','Harmonia axyridis in sealed Petri dishes with treated filter paper in the lid.')
}
def apply_endpoint_facets(master):
    changes={'routes':0,'models':0,'routeNull':0,'routeNotApplicable':0}
    for a in master['registries']['evidenceAssertions']:
        if a['kind']!='study-use': continue
        before_route=a.get('route');before_model=copy.deepcopy(a.get('model'))
        analytical=a['useNodeId'].startswith('botanical-composition') or a['useNodeId'].startswith('botanical-nonvolatile-chemistry')
        checked=a['verification']['status'] in ['source-checked','source-verified']
        if analytical:
            a['route']='not-applicable'
            a['routeVerification']={'status':'not-applicable','notes':'Chemical-analysis endpoint; biological administration routes do not apply.'}
            a['model']={'kind':'analytical','label':'Chemical analysis of the cited sample.','verification':'source-checked' if checked else 'library-reported-unverified','scope':'endpoint'}
        elif not checked:
            a['route']=None
            a['routeVerification']={'status':'unverified','notes':'No independently checked endpoint-specific exposure route is assigned.'}
            a['model']['verification']='library-reported-unverified'
            a['model']['scope']='reported-study-context'
        else:
            key=(a['studyId'],a['useNodeId'])
            if a['studyId'] not in ENDPOINT_FACETS and key not in ENDPOINT_OVERRIDES:
                raise ValueError('Missing explicit checked endpoint facets: '+repr(key))
            route,kind,label=ENDPOINT_OVERRIDES.get(key,ENDPOINT_FACETS[a['studyId']])
            a['route']=route
            a['routeVerification']={'status':'source-checked' if route is not None else 'unresolved-or-multiple',
                'notes':'Endpoint-specific method from the checked publication.' if route is not None else 'The scoped record spans methods or lacks a separately verified route; no route is inferred.'}
            a['model']={'kind':kind,'label':label,'verification':'source-checked','scope':'mixed' if kind.startswith('mixed-') else 'endpoint'}
        if a['route']!=before_route: changes['routes']+=1
        if a['model']!=before_model: changes['models']+=1
        if a['route'] is None: changes['routeNull']+=1
        elif a['route']=='not-applicable': changes['routeNotApplicable']+=1
    return changes

def apply_research_topic_semantics(master):
    changes=0
    for a in master['registries']['evidenceAssertions']:
        if a['kind']!='study-use': continue
        checked=a['verification']['status'] in ['source-checked','source-verified']
        direct=a['relevance']=='direct' and a['material']['kind'] in ['essential-oil','single-oil-topical-formulation']
        if checked and direct:
            if not a['researchMatch']: changes+=1
            a['researchMatch']=True
        if a['studyId']=='fikry-2025-niaouli-lung-cancer':
            a['outcome']={'direction':'mechanistic','label':'Cell viability, migration, apoptosis and cell-cycle changes; no clinical benefit established.','verification':'source-checked'}
        if a['useNodeId'].startswith('botanical-') or a['outcome']['direction'] in ['negative','null','mechanistic','mechanistic-mixed','analytical-not-efficacy']:
            a['supportsFunctionalUse']=False
        if checked and direct and a['outcome']['direction'] in ['negative','null','mechanistic','mechanistic-mixed']:
            clarification='Direct research-topic match includes this unfavorable or mechanistic result; it is not a positive functional-use recommendation.'
            if clarification not in a['verification']['notes']: a['verification']['notes']+=' '+clarification
    return changes

apply_endpoint_facets(M)
apply_research_topic_semantics(M)

# Stable backward aliases preserve old saved blend selections without a fixed UI list.
for alias, nid in {'calm':'health-mental-health','focus':'health-cognitive','sleep':'health-mental-health-sleep','uplifting':'health-mental-health-mood'}.items():
    NODES[nid]['aliases']=unique(NODES[nid].get('aliases',[])+[alias])
M['blendDefaults']={'enabled':True,'availability':'unconfirmed','qualityMappings':[],
 'dermalMaxPercent':None,'dermalMaxSource':None,'cautionThresholds':[],'phototoxic':None,
 'sensitizationNotes':'No verified sensitization assessment yet for this oil in the proposed leave-on spray. Legacy profile notes are unaudited and do not establish formulation safety.',
 'petSafer':None,'petSource':None,'interactions':[],'safetyReviewStatus':'unverified',
 'legacySafetyNotesVerified':False,'researchGaps':[],'relatedStudyIds':[]}

# Record the exact reversible compatibility-projection diff, not duplicated
# active findings. After-values are represented by stable hashes in the ledger.
spec=importlib.util.spec_from_file_location('canonical_builder',Path(__file__).with_name('build-data.py'))
builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)
legacy_before=builder.project(BEFORE,metadata=False)
legacy_after=builder.project(M,metadata=False)
def digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
def delta(before, after, path):
    out=[]
    if isinstance(before,dict) and isinstance(after,dict):
        for k in unique(list(before)+list(after)):
            if k not in before: out.append({'path':path+[k],'beforePresent':False,'afterPresent':True,'afterDigest':digest(after[k])})
            elif k not in after: out.append({'path':path+[k],'beforePresent':True,'before':before[k],'afterPresent':False})
            else: out+=delta(before[k],after[k],path+[k])
    elif isinstance(before,list) and isinstance(after,list) and before and after and all(isinstance(x,dict) and 'id' in x for x in before+after):
        bb={x['id']:x for x in before};aa={x['id']:x for x in after}
        for k in unique(list(bb)+list(aa)):
            if k not in bb: out.append({'path':path+[k],'beforePresent':False,'afterPresent':True,'afterDigest':digest(aa[k])})
            elif k not in aa: out.append({'path':path+[k],'beforePresent':True,'before':bb[k],'beforeIndex':list(bb).index(k),'afterPresent':False})
            else: out+=delta(bb[k],aa[k],path+[k])
    elif before!=after: out.append({'path':path,'beforePresent':True,'before':before,'afterPresent':True,'afterDigest':digest(after)})
    return out
changes=delta(legacy_before,legacy_after,[])
research_changes=[c for c in changes if not (c['path'][0]=='oils' and len(c['path'])>2 and c['path'][2]=='blend')]
config_changes=[c for c in changes if c not in research_changes]
ledger=M['migration'].setdefault('correctionLedger',[])
if any(x.get('id')=='source-audit-2026-10-18' for x in ledger):
    raise ValueError('Research audit already applied; edit the master directly after integration.')
ledger.append({'id':'source-audit-2026-10-18','kind':'research','date':DATE,
 'reason':'Targeted primary-source audit and scoped library review correct citation metadata, preparation identity and measured endpoints, preserve per-oil outcomes, enrich existing publications and add three verified gaps without deleting baseline oil-study links.',
 'sourceUrls':unique(u for a in ASSERTIONS.values() if a.get('verification',{}).get('status')=='source-checked' for u in a['verification']['urls']),
 'changes':research_changes,
 'instructions':[{'studyId':c['studyId'],'oilId':c.get('oilId'),
                  'reason':c['auditInstruction'].get('reason') or c['auditInstruction'].get('action') or c['auditInstruction'].get('replaceWith'),
                  'sourceUrl':STUDIES[c['studyId']]['url'] if c['studyId']=='cannabis-terpenes-review-2020' else c['sourceUrl']}
                 for c in P['canonicalCorrectionInstructions']]})
ledger.append({'id':'all-oil-exploration-defaults-2026-10-18','kind':'configuration','provenance':'user-request',
 'reason':'User-requested exploration support for all 28 oils with unknown inventory and safety defaults. Existing product, price and variant configuration is unchanged; legacy summaries are explicitly inactive as evidence.',
 'sourceUrls':[],'changes':config_changes})
M['migration']['audit']={'checkedAt':DATE,'scope':'Library-first mapping with targeted primary-source verification; not an exhaustive literature review.',
 'baselineOilStudyRelations':214,'primaryCheckedExistingRelations':45,'libraryReviewedOnlyExistingRelations':169,
 'recoveredExistingStudyRelations':3,'newPrimaryPublications':3,
 'researchMatchMeaning':'Verified matching of the named oil to the exact research topic, including negative, null, mixed and mechanistic findings. It does not assert positive clinical benefit, safe dosing, finished-product efficacy or formulation compatibility.',
 'outcomeMeaning':'Verification, material, model and outcome are independent facets. Unverified means unknown, never a negative result.'}
M['migration']['note']='Canonical oil-first registry. Legacy free-text uses, safety and eight-oil blend prose remain unverified historical records and are not the source for evidence matching.'
serialized=json.dumps(M,ensure_ascii=False,indent=2)+'\n'
if any(x in serialized for x in ['/workspace/', '/agent_notes/', 'provenancePacket']): raise ValueError('Private provenance path leaked into published data')
args.master.write_text(serialized)
print(json.dumps({'studies':len(R['studies']),'sources':len(R['sources']),'studyAssertions':len(ASSERTIONS),'researchMatches':sum(a['researchMatch'] for a in ASSERTIONS.values()),'oilStudyRelations':sum(len(o['studyLinks']) for o in M['oils']),'nodes':len(R['useNodes'])},indent=2))
