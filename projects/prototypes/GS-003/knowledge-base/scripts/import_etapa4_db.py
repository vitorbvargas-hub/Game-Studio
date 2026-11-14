#!/usr/bin/env python3
"""Copia para a KB um SUBCONJUNTO da Digimon Database da Etapa 4 (projects/prototypes/GS-003/database/),
para a KB não depender de arquivos que ainda não estão versionados.

Reaproveita ids (sp., sk., ctx., src.), visão resolvida das 81 espécies e as arestas cujas duas pontas
estão na Database. Dado reaproveitado mantém a data original (2026-11-12) e o status original;
na KB ele é marcado como reused_unverified até ser relido.

Uso: python3 -I scripts/import_etapa4_db.py <caminho/da/database>
"""
import json, sys, pathlib

KB = pathlib.Path(__file__).resolve().parent.parent
OUT = KB / 'sources' / 'index_extracts' / 'etapa4_db_subset.json'


def main():
    db = pathlib.Path(sys.argv[1]) / 'data'
    sp = json.loads((db / 'species.json').read_text(encoding='utf-8'))
    sk = json.loads((db / 'skills.json').read_text(encoding='utf-8'))
    ev = json.loads((db / 'evolutions.json').read_text(encoding='utf-8'))
    src = json.loads((db / 'sources.json').read_text(encoding='utf-8'))
    skills = {s['id']: s['name_en_official'] for s in sk['skills']}
    species = []
    for s in sp['species']:
        species.append({
            'id': s['id'], 'canonical_name': s['canonical_name'],
            'names': s['names'], 'level': s['level'],
            'attribute': {'normalized': s['attribute']['normalized'], 'en_official': s['attribute']['en_official'],
                          'alternatives': [{k: a[k] for k in ('value', 'context_id')} for a in s['attribute']['alternatives']]},
            'type_en_official': s['types']['en_official'],
            'family_groups': [f['name'] for f in s['family_groups']],
            'variants': s['variants'],
            'description_pt': s['description_pt'], 'description_status': s['description_status'],
            'appearances': s['appearances'], 'appearances_status': s['appearances_status'],
            'signature_skills': [{'id': i, 'name_en_official': skills.get(i)} for i in s['signature_skill_ids']],
            'external_keys': s['external_keys'],
        })
    edges = [{'id': e['id'], 'from': e['from'], 'to': e['to'], 'kind': e['kind'],
              'contexts': [c['context_id'] for c in e['contexts']],
              'attestation_count': e.get('attestation_count'), 'only_weak_contexts': e.get('only_weak_contexts')}
             for e in ev['edges']]
    meta = {'origin': 'projects/prototypes/GS-003/database (Etapa 4, gerada em ' + sp['_meta']['generated'] + ')',
            'db_version': sp['_meta']['version'], 'original_accessed_at': '2026-11-12',
            'reuse_status': 'reused_unverified',
            'note': 'Visão resolvida; as afirmações individuais (cl.) ficam na Database original e não são copiadas.'}
    OUT.write_text(json.dumps({'_meta': meta, 'species': species, 'edges': edges,
                               'sources': src['sources'], 'contexts': src['contexts']},
                              ensure_ascii=False, indent=1), encoding='utf-8')
    print(len(species), 'espécies,', len(edges), 'arestas')


if __name__ == '__main__':
    main()
