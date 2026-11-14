#!/usr/bin/env python3
"""Validador somente leitura da Knowledge Base. Sai com código 1 se houver erro estrutural.

Checa: JSON válido, JSON Schema, ids únicos, relações (episódio → espécie/região, referência → espécie,
ficha → referência), separação de camadas (nada do Digital Odyssey no catálogo; mapa do jogo marcado),
CSV coerente com o JSON, cinco slots de referência por espécie P0, troca de espécie por nome de arquivo
e imagens repetidas entre espécies. Uso: python3 -I scripts/validate.py
"""
import csv, json, pathlib, re, sys

try:
    import jsonschema
except ImportError:  # pragma: no cover
    jsonschema = None

KB = pathlib.Path(__file__).resolve().parent.parent
errors, warnings = [], []


def load(rel):
    return json.loads((KB / rel).read_text(encoding='utf-8'))


def schema(name):
    return load('schemas/' + name)


def check(objs, sch, label):
    if jsonschema is None:
        warnings.append('jsonschema ausente: validação de schema pulada (%s)' % label)
        return
    v = jsonschema.Draft202012Validator(sch)
    for o in objs:
        for e in v.iter_errors(o):
            errors.append('%s %s: %s' % (label, o.get('id') or o.get('ref_id'), e.message))


def main():
    for p in KB.rglob('*.json'):
        try:
            json.loads(p.read_text(encoding='utf-8'))
        except Exception as e:
            errors.append('JSON inválido %s: %s' % (p.relative_to(KB), e))
    if errors:
        report()
        return

    cat = load('digimondex/catalog.json')['species']
    ids = [c['id'] for c in cat]
    if len(ids) != len(set(ids)):
        errors.append('ids repetidos no catálogo')
    cat_ids = set(ids)
    check(cat, schema('catalog_entry.schema.json'), 'catalog')
    for c in cat:
        if c['level']['normalized'] and c['level']['status'] == 'pending':
            errors.append('%s: nível preenchido com status pending' % c['id'])
        if c['level']['status'] not in ('pending',) and not c['level']['source_id']:
            errors.append('%s: nível sem fonte' % c['id'])

    p0 = load('digimondex/p0_definition.json')
    p0_ids = {i for g in p0['groups'] for i in g['species_ids']}
    for i in p0_ids:
        if i not in cat_ids:
            errors.append('P0 %s fora do catálogo' % i)
        f = KB / 'digimondex' / 'species' / (i[3:] + '.json')
        if not f.exists():
            errors.append('ficha P0 ausente: %s' % i)

    refs = load('digimondex/visual-references/p0_visual_references.json')['references']
    check(refs, schema('visual_reference.schema.json'), 'vref')
    rid = [r['ref_id'] for r in refs]
    if len(rid) != len(set(rid)):
        errors.append('ref_id repetido')
    per = {}
    for r in refs:
        if r['species_id'] not in cat_ids:
            errors.append('referência %s aponta para espécie inexistente' % r['ref_id'])
        per.setdefault(r['species_id'], set()).add(r['category'])
        # possível troca de espécie: arquivo de arte oficial deve ter o nome da espécie
        if r['category'] == 'REF-01' and r['status'] == 'present':
            fn = (r.get('url_original') or '').rsplit('/', 1)[-1].lower()
            if r['species_id'][3:].replace('_', '') not in re.sub(r'[^a-z0-9]', '', fn):
                errors.append('REF-01 de %s com arquivo de outra espécie? %s' % (r['species_id'], fn))
    for i in p0_ids:
        if per.get(i) != {'REF-01', 'REF-02', 'REF-03', 'REF-04', 'REF-05'}:
            errors.append('%s sem os cinco slots de referência' % i)
    # mesma imagem em espécies diferentes (folha compartilhada é aviso, não erro)
    seen = {}
    for r in refs:
        u = r.get('local_path') or r.get('url_original')
        if r['status'] == 'present' and u:
            seen.setdefault((r['category'], u), set()).add(r['species_id'])
    for (k, u), s in seen.items():
        if len(s) > 1 and k == 'REF-01':
            errors.append('mesma arte oficial em espécies diferentes: %s %s' % (u, sorted(s)))
        elif len(s) > 1:
            warnings.append('mesma fonte em %d espécies (%s, %s): folha compartilhada, conferir recorte' % (len(s), k, u))

    for f in (KB / 'digimondex' / 'species').glob('*.json'):
        prof = json.loads(f.read_text(encoding='utf-8'))
        check([prof], schema('species_profile.schema.json'), 'ficha')
        for r in prof['visual_reference_ids']:
            if r not in rid:
                errors.append('%s cita referência inexistente %s' % (prof['id'], r))
        for k in ('evolves_from', 'evolves_to'):
            for x in prof[k]:
                if x not in cat_ids:
                    errors.append('%s %s → espécie fora do catálogo %s' % (prof['id'], k, x))

    eps = load('animedex/episodes/adventure_01.json')['episodes']
    check(eps, schema('episode.schema.json'), 'episode')
    regions = load('worlddex/regions/adventure_01_file_island.json')['regions']
    check(regions, schema('region.schema.json'), 'region')
    reg_ids = {r['id'] for r in regions}
    nums = [e['number'] for e in eps]
    if sorted(nums) != list(range(1, len(nums) + 1)):
        errors.append('numeração de episódios com buraco ou repetição')
    for e in eps:
        for i in e['digimon_ids']:
            if i not in cat_ids:
                errors.append('%s cita espécie fora do catálogo %s' % (e['id'], i))
        for r in e['location_ids']:
            if r not in reg_ids:
                errors.append('%s cita região inexistente %s' % (e['id'], r))
    for r in regions:
        for i in r.get('digimon_found') or []:
            if i not in cat_ids:
                errors.append('região %s cita espécie fora do catálogo %s' % (r['id'], i))
        if r['parent_id'] and r['parent_id'] not in reg_ids:
            errors.append('região %s com pai inexistente' % r['id'])

    gm = load('worlddex/maps/costa_do_despertar.json')
    check([gm], schema('game_map.schema.json'), 'game_map')
    if gm['map']['classification'] == 'canonical':
        errors.append('mapa do Digital Odyssey marcado como canônico')
    for a in gm['subareas']:
        for anc in a.get('canonical_anchors') or []:
            if anc.get('region_id') and anc['region_id'] not in reg_ids:
                errors.append('subárea %s com âncora inexistente' % a['id'])
        for i in a.get('species_ids') or []:
            if i not in cat_ids:
                errors.append('subárea %s cita espécie fora do catálogo' % a['id'])

    srcs = load('sources/sources.json')['sources']
    check(srcs, schema('source.schema.json'), 'source')
    src_ids = {s['id'] for s in srcs}
    for c in cat:
        for k in ('level', 'attribute'):
            if c[k]['source_id'] and c[k]['source_id'] not in src_ids:
                errors.append('%s: fonte desconhecida %s' % (c['id'], c[k]['source_id']))
        for s in c['origin_indexes']:
            if s not in src_ids:
                errors.append('%s: índice de origem desconhecido %s' % (c['id'], s))
        # camada A: nada do Digital Odyssey
        if any(x.startswith('src.gs003') for x in c['origin_indexes']):
            errors.append('%s: dado do Digital Odyssey no catálogo (camada A)' % c['id'])

    # CSV coerente com o JSON
    csvp = KB / 'digimondex' / 'catalog.csv'
    if csvp.exists():
        with csvp.open(encoding='utf-8', newline='') as fh:
            rows = list(csv.DictReader(fh))
        if [r['id'] for r in rows] != ids:
            errors.append('catalog.csv não bate com catalog.json')
    else:
        errors.append('catalog.csv ausente (rode scripts/export_csv.py)')
    for rel, n in (('animedex/episodes/adventure_01.csv', len(eps)), ('digimondex/visual-references/p0_visual_references.csv', len(refs))):
        p = KB / rel
        if not p.exists():
            errors.append('%s ausente' % rel)
            continue
        with p.open(encoding='utf-8', newline='') as fh:
            if len(list(csv.DictReader(fh))) != n:
                errors.append('%s com número de linhas diferente do JSON' % rel)

    # nenhum número de balanceamento
    for p in KB.rglob('*.json'):
        if re.search(r'"(hp|atk|attack_power|defense|base_stats|xp_curve|drop_rate)"\s*:', p.read_text(encoding='utf-8'), re.I):
            errors.append('possível número de balanceamento em %s' % p.relative_to(KB))
    report()


def report():
    for w in warnings:
        print('AVISO', w)
    for e in errors:
        print('ERRO ', e)
    print('%d erros estruturais, %d avisos' % (len(errors), len(warnings)))
    sys.exit(1 if errors else 0)


if __name__ == '__main__':
    main()
