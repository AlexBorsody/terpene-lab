#!/usr/bin/env python3
"""Build the browser compatibility projection from the one canonical oil-first JSON.

No network, clocks, random IDs, or input other than --master are used. The original
recipe/configuration fields remain a projection; never hand-edit data.js.
"""
import argparse
import copy
import hashlib
import json
import math
from pathlib import Path
import re
import sys
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parent.parent
ID = re.compile(r'^[a-z0-9][a-z0-9-]{0,63}$')
HEADER = ('/* Generated from master-data.json by scripts/build-data.py. Do not edit.\n'
          ' * Legacy blend.qualityMappings are compatibility-only and inactive for research matching.\n'
          ' * Active matches require audited evidenceAssertions.researchMatch === true. */\nconst TERPENE_DATA = ')


def require(condition, message):
    if not condition:
        raise ValueError(message)


def unique(values, label):
    require(len(values) == len(set(values)), f'{label}: duplicate reference or ID')


def registry(records, label):
    require(isinstance(records, list), f'{label}: expected array')
    require(all(isinstance(record, dict) and isinstance(record.get('id'), str) and record['id'] for record in records), f'{label}: every record needs an ID')
    unique([record['id'] for record in records], label)
    return {record['id']: record for record in records}


def refs(values, target, label):
    require(isinstance(values, list), f'{label}: expected reference array')
    unique(values, label)
    for value in values:
        require(value in target, f'{label}: unknown reference {value!r}')


def https_url(value, label, allow_empty=False):
    if allow_empty and value == '':
        return
    require(isinstance(value, str) and value and not any(char.isspace() for char in value), f'{label}: expected a valid HTTPS URL')
    try:
        parsed = urlsplit(value)
        hostname = parsed.hostname
        port = parsed.port
    except ValueError:
        raise ValueError(f'{label}: expected a valid HTTPS URL')
    require(parsed.scheme == 'https' and hostname and '.' in hostname and
            not parsed.username and not parsed.password and not any(char in hostname for char in '<>\\'),
            f'{label}: expected a valid HTTPS URL')
    try:
        labels = hostname.rstrip('.').encode('idna').decode('ascii').split('.')
    except UnicodeError:
        raise ValueError(f'{label}: expected a valid HTTPS URL')
    require(len(labels) >= 2 and all(re.fullmatch(r'[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?', part) for part in labels),
            f'{label}: expected a valid HTTPS URL')


def source_reference(value, sources, label):
    if value is None:
        return
    if isinstance(value, str):
        require(value in sources, f'{label}: unknown source reference {value!r}')
        return
    require(isinstance(value, dict) and isinstance(value.get('label'), str) and value['label'], f'{label}: invalid source reference')
    https_url(value.get('url'), label)


def citation_fields(source, studies):
    result = copy.deepcopy(source)
    study_id = result.pop('studyRef', None)
    inherited = result.pop('inheritedFields', [])
    if study_id:
        study = studies[study_id]
        for key in inherited:
            result[key] = copy.deepcopy(study[key])
    return result


def normalized_doi(value):
    value = re.sub(r'^doi:\s*', '', str(value or '').strip(), flags=re.IGNORECASE)
    value = re.sub(r'^https?://(?:dx\.)?doi\.org/', '', value, flags=re.IGNORECASE)
    return unquote(value).lower()


def validate_citation_identity(study):
    """Catch internal drift; external bibliographic verification remains research work."""
    sid = study['id']
    parsed = urlsplit(study['url'])
    path = unquote(parsed.path).strip('/')
    if parsed.hostname == 'pubmed.ncbi.nlm.nih.gov':
        require(path.isdigit() and str(int(path)) == str(study.get('pubmedId')),
                f'{sid}: citation URL and PubMed ID disagree')
    if parsed.hostname in ('doi.org', 'dx.doi.org'):
        require(normalized_doi(path) == normalized_doi(study.get('doi')),
                f'{sid}: citation URL and DOI disagree')
    review = study.get('citationReview')
    if review is not None:
        require(review.get('status') == 'identity-checked', f'{sid}: invalid citation review status')
        https_url(review.get('sourceUrl'), f'{sid}.citationReview.sourceUrl')
        require(normalized_doi(review.get('doi')) == normalized_doi(study.get('doi')) and
                (review.get('pubmedId') or None) == (study.get('pubmedId') or None),
                f'{sid}: citation identifiers differ from reviewed source')
        require(isinstance(review.get('sourceTitle'), str) and review['sourceTitle'], f'{sid}: reviewed source title required')
    summary = study.get('summaryReview')
    if summary is not None:
        require(summary.get('status') in ('abstract-screened', 'abstract-unavailable', 'full-text-screened'), f'{sid}: invalid summary review status')
        https_url(summary.get('sourceUrl'), f'{sid}.summaryReview.sourceUrl')


def validate(master):
    require(master.get('schemaVersion') == 1, 'Unsupported master schemaVersion')
    require(isinstance(master.get('taxonomyVersion'), int), 'taxonomyVersion must be an integer')
    regs = master['registries']
    oils = registry(master['oils'], 'oils')
    compounds = registry(regs['compounds'], 'compounds')
    studies = registry(regs['studies'], 'studies')
    sources = registry(regs['sources'], 'sources')
    nodes = registry(regs['useNodes'], 'useNodes')
    assertions = registry(regs['evidenceAssertions'], 'evidenceAssertions')
    groups = registry(regs['chemicalGroups'], 'chemicalGroups')
    chemical_nodes = registry(regs['chemicalTaxonomy'], 'chemicalTaxonomy')
    for node in chemical_nodes.values():
        cid = node['id']
        require(len(cid) <= 128 and not any(ord(char) < 32 for char in cid), f'{cid}: invalid chemical category ID')
        require(isinstance(node.get('label'), str) and node['label'], f'{cid}: chemical category label required')
        require(isinstance(node.get('selectable'), bool), f'{cid}: chemical category selectable must be boolean')
        require(node.get('parentId') is None or node['parentId'] in chemical_nodes, f'{cid}: orphan chemical category parent')
        if 'groupId' in node:
            require(node['groupId'] in groups, f'{cid}: unknown chemical groupId')
        match = node.get('match')
        require(isinstance(match, dict), f'{cid}: chemical category match object required')
        require(set(match) <= {'chemicalClasses', 'functionalGroups', 'compoundIds', 'includeDescendants'}, f'{cid}: unknown chemical match rule')
        for field in ('chemicalClasses', 'functionalGroups', 'compoundIds'):
            values = match.get(field, [])
            require(isinstance(values, list) and all(isinstance(value, str) and value for value in values), f'{cid}: {field} match must be a string array')
            unique(values, f'{cid}.match.{field}')
        refs(match.get('functionalGroups', []), groups, f'{cid}.match.functionalGroups')
        refs(match.get('compoundIds', []), compounds, f'{cid}.match.compoundIds')
        require('includeDescendants' not in match or isinstance(match['includeDescendants'], bool), f'{cid}: includeDescendants must be boolean')
        seen, ancestor = set(), node
        while ancestor is not None:
            require(ancestor['id'] not in seen, f'Chemical taxonomy cycle at {cid}')
            seen.add(ancestor['id'])
            ancestor = chemical_nodes.get(ancestor['parentId'])
    editorial = regs['editorialReferences']
    require(isinstance(editorial, dict), 'editorialReferences must be an object')
    for key, values in editorial.items():
        require(key.endswith('SourceIds'), f'Unknown editorial reference type: {key}')
        refs(values, sources, f'editorialReferences.{key}')
    aliases = {}
    bindings = {}
    for node in nodes.values():
        require(bool(ID.fullmatch(node['id'])), f'Invalid use node ID: {node["id"]}')
        require(isinstance(node.get('label'), str) and node['label'], f'{node["id"]}: missing label')
        require(node.get('parentId') is None or node['parentId'] in nodes, f'{node["id"]}: orphan parent')
        require(isinstance(node.get('declared'), bool), f'{node["id"]}: declared must be boolean')
        require(isinstance(node.get('legacyBindings'), list), f'{node["id"]}: legacyBindings must be an array')
        node_aliases = [node['id']] + node.get('aliases', [])
        for alias in node_aliases:
            require(isinstance(alias, str) and alias, f'{node["id"]}: invalid alias')
            require(alias not in aliases or aliases[alias] == node['id'], f'Ambiguous taxonomy alias: {alias}')
            aliases[alias] = node['id']
        for binding in node['legacyBindings']:
            require(isinstance(binding, dict) and binding.get('type'), f'{node["id"]}: invalid legacy binding')
            require(set(binding) <= {'type', 'subcategory', 'topic'}, f'{node["id"]}: invalid legacy binding fields')
            require(all(isinstance(value, str) and value for value in binding.values()), f'{node["id"]}: legacy binding values must be nonempty strings')
            require('topic' not in binding or 'subcategory' in binding, f'{node["id"]}: topic binding lacks subcategory')
            key = json.dumps(binding, sort_keys=True)
            require(key not in bindings or bindings[key] == node['id'], f'Ambiguous legacy category binding: {binding}')
            bindings[key] = node['id']
            parts = [binding[field] for field in ('type', 'subcategory', 'topic') if field in binding]
            for separator in (':', '/'):
                alias = separator.join(parts)
                require(alias not in aliases or aliases[alias] == node['id'], f'Ambiguous taxonomy alias: {alias}')
                aliases[alias] = node['id']
        visited = set()
        ancestor = node
        while ancestor is not None:
            require(ancestor['id'] not in visited, f'Taxonomy cycle at {node["id"]}')
            visited.add(ancestor['id'])
            ancestor = nodes.get(ancestor['parentId'])
    for source in sources.values():
        if 'studyRef' in source:
            require(source['studyRef'] in studies, f'{source["id"]}: unknown studyRef')
            inherited = source.get('inheritedFields', [])
            unique(inherited, f'{source["id"]}.inheritedFields')
            require(set(inherited) <= {'url', 'doi', 'pubmedId'}, f'{source["id"]}: invalid inherited citation field')
            for field in inherited:
                require(field not in source, f'{source["id"]}: duplicate canonical citation field {field}')
                require(field in studies[source['studyRef']], f'{source["id"]}: missing inherited citation field {field}')
        else:
            require(not source.get('inheritedFields'), f'{source["id"]}: inherited citation fields need studyRef')
        https_url(citation_fields(source, studies).get('url'), f'{source["id"]}.url', allow_empty=True)
    publication_identities = {'doi': {}, 'pubmedId': {}, 'url': {}}
    for study in studies.values():
        https_url(study.get('url'), f'{study["id"]}.url')
        for field in ('doi', 'pubmedId', 'url'):
            value = study.get(field)
            if value is None or value == '':
                continue
            normalized = str(value).strip()
            if field == 'doi':
                normalized = re.sub(r'^doi:\s*', '', normalized, flags=re.IGNORECASE)
                if re.match(r'^https?://(?:dx\.)?doi\.org/', normalized, flags=re.IGNORECASE):
                    normalized = urlsplit(normalized).path.lstrip('/')
                normalized = unquote(normalized).lower()
            elif field == 'pubmedId':
                require(normalized.isdigit() and int(normalized) > 0, f'{study["id"]}: invalid PubMed ID')
                normalized = str(int(normalized))
            previous = publication_identities[field].get(normalized)
            require(previous is None, f'Duplicate publication {field}: {study["id"]} and {previous}')
            publication_identities[field][normalized] = study['id']
        refs(study.get('sourceIds', []), sources, f'{study["id"]}.sourceIds')
        refs(study['useNodeIds'], nodes, f'{study["id"]}.useNodeIds')
        require(not any(key in study for key in ('oilIds', 'compoundIds', 'categories')), f'{study["id"]}: duplicated reverse associations')
        refs(study.get('chemicalGroups', []), groups, f'{study["id"]}.chemicalGroups')
    for study in studies.values():
        validate_citation_identity(study)
    link_orders = {'oil': {}, 'compound': {}}
    for kind, records in [('oil', oils), ('compound', compounds)]:
        for record in records.values():
            links = record['studyLinks']
            refs([link['studyId'] for link in links], studies, f'{record["id"]}.studyLinks')
            for link in links:
                order = link.get('order')
                require(isinstance(order, int) and not isinstance(order, bool) and order >= 0, f'{record["id"]}: invalid study link order')
                link_orders[kind].setdefault(link['studyId'], []).append(order)
            if kind == 'compound':
                refs(record.get('sourceIds', []), sources, f'{record["id"]}.sourceIds')
                refs(record.get('functionalGroups', []), groups, f'{record["id"]}.functionalGroups')
                identity = record.get('identityReview')
                if identity is not None:
                    require(identity.get('status') == 'formula-checked' and identity.get('formula') == record.get('formula'),
                            f'{record["id"]}: formula differs from reviewed identity')
                    https_url(identity.get('sourceUrl'), f'{record["id"]}.identityReview.sourceUrl')
    for kind, links in link_orders.items():
        for study_id, positions in links.items():
            require(sorted(positions) == list(range(len(positions))), f'{study_id}: {kind} study link order must be unique and contiguous')
    for group in groups.values():
        refs(group.get('compoundIds', []), compounds, f'{group["id"]}.compoundIds')
        refs(group.get('sourceIds', []), sources, f'{group["id"]}.sourceIds')
    for assertion in assertions.values():
        aid = assertion['id']
        require(assertion.get('oilId') in oils, f'{aid}: unknown oilId')
        require(isinstance(assertion.get('researchMatch'), bool), f'{aid}: explicit boolean researchMatch required')
        verification = assertion.get('verification')
        require(isinstance(verification, dict) and isinstance(verification.get('status'), str), f'{aid}: verification status required')
        refs(verification.get('sourceIds', []), sources, f'{aid}.verification.sourceIds')
        require(isinstance(verification.get('urls', []), list), f'{aid}: verification.urls must be an array')
        for url in verification.get('urls', []):
            https_url(url, f'{aid}.verification.urls')
        if assertion.get('kind') == 'study-use':
            require(assertion.get('studyId') in studies, f'{aid}: unknown studyId')
            require(assertion.get('useNodeId') in nodes, f'{aid}: unknown useNodeId')
            require(assertion['studyId'] in [link['studyId'] for link in oils[assertion['oilId']]['studyLinks']], f'{aid}: assertion has no oil study link')
            require(assertion['useNodeId'] in studies[assertion['studyId']]['useNodeIds'], f'{aid}: assertion endpoint is not a study tag')
            for field in ('material', 'model', 'outcome'):
                require(field in assertion and (assertion[field] is None or isinstance(assertion[field], dict)), f'{aid}: {field} must be object or null')
            for field in ('finding', 'limitations', 'route', 'species'):
                require(field in assertion and (assertion[field] is None or isinstance(assertion[field], str)), f'{aid}: {field} must be string or null')
            require(assertion.get('relevance') in ('unreviewed', 'direct', 'contextual', 'excluded'), f'{aid}: invalid relevance')
            if assertion['researchMatch']:
                require(verification['status'] in ('source-checked', 'source-verified'), f'{aid}: researchMatch needs source verification')
                require(assertion['relevance'] == 'direct', f'{aid}: researchMatch needs direct relevance')
                require(all(assertion[field] is not None for field in ('material', 'model', 'outcome')), f'{aid}: researchMatch needs explicit material/model/outcome facets')
                require(assertion['material'].get('kind') in ('essential-oil', 'single-oil-topical-formulation'), f'{aid}: researchMatch needs whole-oil material')
                require(assertion['material'].get('relevance') in ('whole-oil', 'whole-oil-direct'), f'{aid}: researchMatch needs compatible material relevance')
                require(assertion['material'].get('speciesMatch') != 'different-species', f'{aid}: researchMatch cannot cross species')
                require(assertion.get('route') not in ('oral', 'injection'), f'{aid}: oral or injected preparations are contextual')
                direction = assertion['outcome'].get('direction')
                require(isinstance(direction, str) and direction and direction != 'unverified', f'{aid}: researchMatch needs a verified outcome')
        elif assertion.get('kind') == 'chemical-observation':
            require(assertion['researchMatch'] is False, f'{aid}: chemical observations cannot be efficacy matches')
            observation = assertion['observation']
            require(observation['group'] in groups, f'{aid}: unknown chemical group')
            refs(observation.get('compoundIds', []), compounds, f'{aid}.compoundIds')
            refs(observation.get('sourceIds', []), sources, f'{aid}.sourceIds')
        else:
            raise ValueError(f'{aid}: unknown assertion kind')
    for oil in oils.values():
        oid = oil['id']
        require('id' not in oil['record'], f'{oid}: duplicated profile ID')
        require(isinstance(oil.get('precautions'), dict) and 'legacySafety' in oil['precautions'], f'{oid}: precautions required')
        require(isinstance(oil.get('legacy', {}).get('uses'), list), f'{oid}: unaudited legacy uses required')
        refs([entry['compoundId'] for entry in oil['constituents']], compounds, f'{oid}.constituents')
        for constituent in oil['constituents']:
            refs(constituent.get('sourceIds', []), sources, f'{oid}/{constituent["compoundId"]}.sourceIds')
        refs(oil['chemicalEvidenceIds'], assertions, f'{oid}.chemicalEvidenceIds')
        for aid in oil['chemicalEvidenceIds']:
            require(assertions[aid]['kind'] == 'chemical-observation' and assertions[aid]['oilId'] == oid, f'{oid}: chemical evidence type or oil mismatch')
        used_nodes, used_assertions = set(), set()
        def visit(branches, parent_id):
            require(isinstance(branches, list), f'{oid}: use children must be an array')
            refs([branch['useNodeId'] for branch in branches], nodes, f'{oid}: use siblings')
            for branch in branches:
                node_id = branch['useNodeId']
                require(node_id not in used_nodes, f'{oid}: duplicate nested use node {node_id}')
                used_nodes.add(node_id)
                require(nodes[node_id]['parentId'] == parent_id, f'{oid}: nested use ancestry differs from registry for {node_id}')
                refs(branch['evidenceIds'], assertions, f'{oid}/{node_id}.evidenceIds')
                for aid in branch['evidenceIds']:
                    require(aid not in used_assertions, f'{oid}: duplicated nested evidence {aid}')
                    used_assertions.add(aid)
                    assertion = assertions[aid]
                    require(assertion['kind'] == 'study-use' and assertion['oilId'] == oid and assertion['useNodeId'] == node_id, f'{oid}: nested evidence endpoint/type mismatch for {aid}')
                visit(branch['children'], node_id)
        visit(oil['uses'], None)
        expected_uses = {aid for aid, assertion in assertions.items() if assertion['kind'] == 'study-use' and assertion['oilId'] == oid}
        require(used_assertions == expected_uses, f'{oid}: use tree and evidence registry differ')
        expected_chemicals = {aid for aid, assertion in assertions.items() if assertion['kind'] == 'chemical-observation' and assertion['oilId'] == oid}
        require(set(oil['chemicalEvidenceIds']) == expected_chemicals, f'{oid}: chemical evidence references and registry differ')
        blend = oil['legacy'].get('blend')
        if blend:
            refs(blend.get('relatedStudyIds', []), studies, f'{oid}.legacy.blend.relatedStudyIds')
            quality_ids = {quality['id'] for quality in master['blendBuilder']['qualities']}
            for quality in blend.get('qualityMappings', []):
                require(quality.get('qualityId') in quality_ids, f'{oid}: unknown legacy quality ID')
                if quality.get('studyId'):
                    require(quality['studyId'] in studies, f'{oid}: unknown legacy quality study')
                if quality.get('url'):
                    https_url(quality['url'], f'{oid}.legacy.quality.url')
            for field in ('dermalMaxSource', 'petSource'):
                source_reference(blend.get(field), sources, f'{oid}.legacy.blend.{field}')
            for caution in blend.get('cautionThresholds', []):
                source_reference(caution.get('source'), sources, f'{oid}.legacy.blend.cautionThresholds.source')
            for interaction in blend.get('interactions', []):
                require(interaction.get('withOilId') in oils, f'{oid}: unknown interaction oil reference')
                source_reference(interaction.get('source'), sources, f'{oid}.legacy.blend.interactions.source')
    defaults = master.get('blendDefaults')
    if defaults is not None:
        require(isinstance(defaults, dict), 'blendDefaults must be an object')
        require(defaults.get('availability') == 'unconfirmed', 'Default inventory must remain unconfirmed')
        refs(defaults.get('relatedStudyIds', []), studies, 'blendDefaults.relatedStudyIds')
        for interaction in defaults.get('interactions', []):
            require(interaction.get('withOilId') in oils, 'blendDefaults: unknown interaction oil reference')
            source_reference(interaction.get('source'), sources, 'blendDefaults.interactions.source')
        for caution in defaults.get('cautionThresholds', []):
            source_reference(caution.get('source'), sources, 'blendDefaults.cautionThresholds.source')
        require(defaults.get('safetyReviewStatus') == 'unverified', 'Default safety review must remain unverified')
        require(defaults.get('qualityMappings') == [], 'Default quality mappings must be empty; research uses assertions')
        require(defaults.get('legacySafetyNotesVerified') is False, 'Legacy safety notes must remain unaudited by default')
        for field in ('dermalMaxPercent', 'dermalMaxSource', 'phototoxic', 'petSafer', 'petSource'):
            require(field in defaults and defaults[field] is None, f'Default {field} must explicitly remain unknown')
    refs(master['blendBuilder'].get('starterOilIds', []), oils, 'blendBuilder.starterOilIds')
    registry(master['blendBuilder'].get('qualities', []), 'blendBuilder.qualities')
    product = master['blendBuilder'].get('product')
    require(isinstance(product, dict), 'blendBuilder.product: object required')
    for field, maximum in (('name', 120), ('size', 80)):
        value = product.get(field)
        require(isinstance(value, str) and value.strip() and len(value) <= maximum and not re.search(r'[\x00-\x1f\x7f]', value), f'blendBuilder.product.{field}: invalid text')
    price = product.get('price')
    require(isinstance(price, (int, float)) and not isinstance(price, bool) and math.isfinite(price) and price > 0, 'blendBuilder.product.price: positive finite number required')
    require(isinstance(product.get('currency'), str) and re.fullmatch(r'[A-Z]{3}', product['currency']), 'blendBuilder.product.currency: three-letter currency code required')
    for field in ('totalOilLoadSource', 'totalOilMaxSource'):
        source_reference(master['blendBuilder']['product'].get(field), sources, f'blendBuilder.product.{field}')
    return aliases


def project(master, metadata=True):
    aliases = validate(master)
    regs = master['registries']
    nodes = {node['id']: node for node in regs['useNodes']}
    studies = {study['id']: study for study in regs['studies']}
    assertions = {assertion['id']: assertion for assertion in regs['evidenceAssertions']}
    categories = []
    # This legacy view intentionally keeps original declaration order and labels.
    # Arbitrary-depth navigation is driven by taxonomy.nodes, never this adapter.
    for node in regs['useNodes']:
        if not node['declared']:
            continue
        for binding in node['legacyBindings']:
            if set(binding) == {'type'}:
                category = {'type': binding['type'], 'label': node['label'], 'subcategories': []}
                for child in regs['useNodes']:
                    if not child['declared']:
                        continue
                    for cb in child['legacyBindings']:
                        if set(cb) == {'type', 'subcategory'} and cb['type'] == binding['type']:
                            topics = []
                            for leaf in regs['useNodes']:
                                if leaf['declared']:
                                    for lb in leaf['legacyBindings']:
                                        if set(lb) == {'type', 'subcategory', 'topic'} and lb['type'] == cb['type'] and lb['subcategory'] == cb['subcategory']:
                                            topics.append(lb['topic'])
                            category['subcategories'].append({'id': cb['subcategory'], 'label': child['label'], 'topics': topics})
                categories.append(category)
    result = {'version': master['version'], 'blendBuilder': copy.deepcopy(master['blendBuilder']), 'categories': categories,
              'oils': [], 'compounds': [], 'studies': [], 'sources': [], 'chemicalGroups': copy.deepcopy(regs['chemicalGroups'])}
    for oil in master['oils']:
        record = {'id': oil['id'], **copy.deepcopy(oil['record']), 'uses': copy.deepcopy(oil['legacy']['uses']),
                  'safety': oil['precautions']['legacySafety'], 'constituents': copy.deepcopy(oil['constituents']),
                  'chemicalEvidence': [copy.deepcopy(assertions[aid]['observation']) for aid in oil['chemicalEvidenceIds']]}
        if 'blendDefaults' in master or 'blend' in oil['legacy']:
            record['blend'] = copy.deepcopy(master.get('blendDefaults', {}))
            if 'blendDefaults' in master:
                record['blend']['legacySafetyNotes'] = oil['precautions']['legacySafety']
            record['blend'].update(copy.deepcopy(oil['legacy'].get('blend', {})))
        if metadata:
            record['useTree'] = copy.deepcopy(oil['uses'])
            record['evidenceIds'] = [assertion['id'] for assertion in regs['evidenceAssertions'] if assertion['oilId'] == oil['id']]
            record['precautions'] = copy.deepcopy(oil['precautions'])
        result['oils'].append(record)
    for compound in regs['compounds']:
        record = copy.deepcopy(compound)
        record.pop('studyLinks')
        result['compounds'].append(record)
    for study in regs['studies']:
        record = copy.deepcopy(study)
        use_ids = record.pop('useNodeIds')
        record['oilIds'] = [oid for _, oid in sorted((link['order'], oil['id']) for oil in master['oils'] for link in oil['studyLinks'] if link['studyId'] == study['id'])]
        record['compoundIds'] = [cid for _, cid in sorted((link['order'], compound['id']) for compound in regs['compounds'] for link in compound['studyLinks'] if link['studyId'] == study['id'])]
        record['categories'] = [copy.deepcopy(nodes[node_id]['legacyBindings'][0]) for node_id in use_ids if nodes[node_id]['legacyBindings']]
        if metadata:
            record['useNodeIds'] = copy.deepcopy(use_ids)
        result['studies'].append(record)
    result['sources'] = [citation_fields(source, studies) for source in regs['sources']]
    if metadata:
        result['taxonomy'] = {'version': master['taxonomyVersion'], 'nodes': copy.deepcopy(regs['useNodes']), 'aliases': aliases}
        result['evidenceAssertions'] = copy.deepcopy(regs['evidenceAssertions'])
        result['schemaVersion'] = master['schemaVersion']
        result['chemicalTaxonomy'] = {'version': 1, 'nodes': copy.deepcopy(regs['chemicalTaxonomy'])}
        result['editorialReferences'] = copy.deepcopy(regs['editorialReferences'])
    return result


def render(master):
    return HEADER + json.dumps(project(master), ensure_ascii=False, indent=2) + ';\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--master', type=Path, default=ROOT / 'master-data.json')
    parser.add_argument('--output', type=Path, default=ROOT / 'data.js')
    parser.add_argument('--check', action='store_true', help='Fail if the output is missing or differs byte-for-byte; do not write.')
    parser.add_argument('--validate-only', action='store_true')
    parser.add_argument('--legacy-json', type=Path, help='Write an unaugmented legacy projection for lossless comparison.')
    args = parser.parse_args()
    try:
        master = json.loads(args.master.read_text(encoding='utf-8'))
        validate(master)
        if args.legacy_json:
            args.legacy_json.write_text(json.dumps(project(master, metadata=False), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        if args.validate_only:
            print('Canonical data references, hierarchy, and assertions are valid.')
            return
        generated = render(master).encode('utf-8')
        if args.check:
            require(args.output.exists() and args.output.read_bytes() == generated,
                    f'Generated data drift: run python3 scripts/build-data.py --output {args.output}')
            print(f'Generated data is current: {args.output}')
        else:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_bytes(generated)
            print(f'Generated {args.output} ({len(generated)} bytes).')
    except (ValueError, KeyError, TypeError, OSError) as error:
        print(f'Data build failed: {error}', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
