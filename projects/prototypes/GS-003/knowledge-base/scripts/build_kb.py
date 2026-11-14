#!/usr/bin/env python3
"""Gera a Knowledge Base do Digital Odyssey (GS-003) a partir dos extratos em sources/index_extracts/
e das sementes escritas à mão (p0_definition, sinopses, WorldDex, referências locais).

Determinístico e idempotente: rodar de novo produz os mesmos arquivos, sem duplicar registros.
Não acessa a rede. Uso: python3 -I scripts/build_kb.py
"""
import json, re, pathlib, datetime

KB = pathlib.Path(__file__).resolve().parent.parent
EX = KB / 'sources' / 'index_extracts'
BUILD_DATE = '2026-11-14'
KB_VERSION = '0.1.0-pilot'


def load(p):
    return json.loads(pathlib.Path(p).read_text(encoding='utf-8'))


def dump(p, obj):
    p = pathlib.Path(p)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


def clean(s):
    return (s or '').replace('‎', '').replace('​', '').strip()


def slug(s):
    return re.sub(r'[^a-z0-9]+', '_', clean(s).lower()).strip('_')


def unlink(s):
    return re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', clean(s))


def sid(name):
    return 'sp.' + slug(name)


# Grafias diferentes entre a List of Digimon e a Visual List que são a MESMA espécie.
# Cada fusão vira um registro em conflicts (não é resolvida em silêncio).
VISUAL_ALIASES = {
    'grottomon': ('grottemon', 'romanização diferente (Grottemon na lista, Grottomon na Visual List)', 'media'),
    'jiko_tyumon': ('jiko_chuumon', 'romanização diferente (Chuumon × Tyumon)', 'alta'),
    'gallantmon_chaos_mode': ('dukemon_chaos_mode', 'a Visual List usa o nome da dublagem (Gallantmon = Dukemon)', 'alta'),
}
# Pares que NÃO dá para fundir sem ler as páginas: ficam como conflito aberto.
UNRESOLVED_VISUAL = {
    'digimon_slingshot': 'pickmons_slingshot',
    'shoutmon_x2_incomplete_x3': 'shoutmon_x2_incomplete_x4',
}

SOURCES_NEW = [
    {'id': 'src.wikimon_list_of_digimon', 'name': 'Wikimon — List of Digimon', 'category': 3, 'url': 'https://wikimon.net/List_of_Digimon', 'accessed_at': BUILD_DATE, 'access': 'API MediaWiki (action=parse, wikitext), 1 requisição', 'robots': 'Crawl-delay: 60; /Special: e /index.php? proibidos; api.php permitido'},
    {'id': 'src.wikimon_visual_list', 'name': 'Wikimon — Visual List of Digimon', 'category': 3, 'url': 'https://wikimon.net/Visual_List_of_Digimon', 'accessed_at': BUILD_DATE, 'access': 'API MediaWiki, 1 requisição'},
    {'id': 'src.wikimon_dub_names', 'name': 'Wikimon — List of English Dub Names', 'category': 3, 'url': 'https://wikimon.net/List_of_English_Dub_Names', 'accessed_at': BUILD_DATE, 'access': 'API MediaWiki, 2 requisições (redirect + página)'},
    {'id': 'src.wikimon_episode_pages', 'name': 'Wikimon — páginas de episódio de Digimon Adventure (1999)', 'category': 3, 'url': 'https://wikimon.net/Digimon_Adventure_-_Episode_01', 'accessed_at': BUILD_DATE, 'access': 'API MediaWiki (prop=revisions, várias páginas por requisição), 3 requisições para 54 episódios'},
    {'id': 'src.wikimon_file_island', 'name': 'Wikimon — File Island', 'category': 3, 'url': 'https://wikimon.net/File_Island', 'accessed_at': BUILD_DATE, 'access': 'mesma requisição do Shellmon'},
    {'id': 'src.wikimon_imageinfo', 'name': 'Wikimon — metadados de imagem (imageinfo) do P0', 'category': 3, 'url': 'https://wikimon.net/api.php?action=query&prop=imageinfo', 'accessed_at': BUILD_DATE, 'access': 'API MediaWiki, 1 requisição para 19 arquivos'},
    {'id': 'src.etapa6_comando9_catalogo', 'name': 'Catálogo de referências de sprites (Comando 9, F1)', 'category': 6, 'url': None, 'local_path': 'projects/prototypes/GS-003/etapa6-lab/fase12-comando9/f1/CATALOGO_REFERENCIAS.md', 'accessed_at': BUILD_DATE, 'access': 'documento interno, não versionado na master'},
    {'id': 'src.etapa6_fichas_anatomia', 'name': 'Fichas de anatomia (Etapa 6, fase 11)', 'category': 6, 'url': None, 'local_path': 'projects/prototypes/GS-003/etapa6-lab/fase11-fichas-anatomia/', 'accessed_at': BUILD_DATE, 'access': 'documento interno, não versionado na master'},
    {'id': 'src.fandom_digimon', 'name': 'Digimon Wiki (Fandom)', 'category': 3, 'url': 'https://digimon.fandom.com/wiki/Digimon_Wiki', 'accessed_at': BUILD_DATE, 'access': 'BLOQUEADO: robots.txt devolveu 403 com desafio Cloudflare ("Just a moment..."). Não contornado.'},
]


def build_catalog(db, p0_ids, p1_ids):
    lst = load(EX / 'wikimon_list_of_digimon.json')
    vis = load(EX / 'wikimon_visual_list.json')
    dub = load(EX / 'wikimon_english_dub_names.json')
    conflicts = []

    entries = {}
    order = []
    for e in lst['entries']:
        raw = clean(e['name'])
        page = raw
        if '{{!}}' in raw:
            # [[Página|Nome exibido]]: o nome exibido é a espécie; a página é o alvo do link na Wikimon
            page, raw = [clean(x) for x in raw.split('{{!}}', 1)]
            conflicts.append({'kind': 'link_target_differs', 'id': sid(raw), 'names': [raw, page], 'reason': 'na List of Digimon o nome exibido aponta para outra página da Wikimon', 'resolution': 'id pelo nome exibido; page_title = alvo do link', 'status': 'resolved_with_note'})
        i = sid(raw)
        if i in entries:
            conflicts.append({'kind': 'duplicate_in_index', 'id': i, 'names': [entries[i]['name'], raw], 'source_id': 'src.wikimon_list_of_digimon', 'status': 'open'})
            continue
        alts = [page] if page != raw else []
        entries[i] = {
            'id': i, 'name': raw, 'page_title': page,
            'names': {'ja_kana': (clean(e.get('kana')) if clean(e.get('kana')) not in ('', 'N/A') else None), 'dub_en': [], 'dub_en_variants': [], 'alternatives': alts},
            'debut': {'year': e.get('debut_year'), 'media': e.get('debut_raw')},
            'origin_indexes': ['src.wikimon_list_of_digimon'],
            'wikimon_url': 'https://wikimon.net/' + page.replace(' ', '_'),
            'visual_list_image_file': None,
        }
        order.append(i)
        if page != raw:
            entries[i]['_page_slug'] = slug(page)

    display_map = {v['_page_slug']: k for k, v in entries.items() if '_page_slug' in v and 'sp.' + v['_page_slug'] not in entries}
    visual_only = []
    for e in vis['entries']:
        n = clean(e['name'])
        if '{{!}}' in n:
            n = clean(n.split('{{!}}', 1)[1])
        s = slug(n)
        target = None
        if 'sp.' + s in entries:
            target = 'sp.' + s
        elif s in display_map:
            target = display_map[s]
        elif s in VISUAL_ALIASES:
            to, why, conf = VISUAL_ALIASES[s]
            target = 'sp.' + to
            conflicts.append({'kind': 'name_spelling', 'id': target, 'names': [entries[target]['name'], n], 'resolution': 'fundido', 'reason': why, 'confidence': conf, 'source_ids': ['src.wikimon_list_of_digimon', 'src.wikimon_visual_list'], 'status': 'resolved_with_note'})
            entries[target]['names']['alternatives'].append(n)
        elif s in UNRESOLVED_VISUAL:
            other = 'sp.' + UNRESOLVED_VISUAL[s]
            conflicts.append({'kind': 'possible_duplicate', 'id': other, 'names': [entries[other]['name'] if other in entries else UNRESOLVED_VISUAL[s], n], 'resolution': 'não fundido; só o nome da List of Digimon foi importado', 'reason': 'nomes diferentes demais para fundir sem ler as páginas', 'source_ids': ['src.wikimon_list_of_digimon', 'src.wikimon_visual_list'], 'status': 'open'})
            continue
        if target:
            if entries[target]['visual_list_image_file'] is None:
                entries[target]['visual_list_image_file'] = clean(e.get('image_file'))
            if 'src.wikimon_visual_list' not in entries[target]['origin_indexes']:
                entries[target]['origin_indexes'].append('src.wikimon_visual_list')
        else:
            i = 'sp.' + s
            entries[i] = {'id': i, 'name': n, 'page_title': None,
                          'names': {'ja_kana': None, 'dub_en': [], 'dub_en_variants': [], 'alternatives': []},
                          'debut': {'year': None, 'media': None},
                          'origin_indexes': ['src.wikimon_visual_list'],
                          'wikimon_url': None, 'visual_list_image_file': clean(e.get('image_file'))}
            order.append(i)
            visual_only.append(i)
            conflicts.append({'kind': 'index_coverage', 'id': i, 'names': [n], 'reason': 'aparece só na Visual List, não na List of Digimon', 'source_ids': ['src.wikimon_visual_list'], 'status': 'open'})

    for k, v in entries.items():
        if 'src.wikimon_visual_list' not in v['origin_indexes']:
            conflicts.append({'kind': 'index_coverage', 'id': k, 'names': [v['name']], 'reason': 'aparece só na List of Digimon, sem imagem na Visual List', 'source_ids': ['src.wikimon_list_of_digimon'], 'status': 'open'})
        v.pop('_page_slug', None)

    # nomes da dublagem (n) ligados ao título japonês (j); grafia alternativa (a)
    for d in dub['entries']:
        cands = [unlink(x) for x in re.split(r'<br\s*/?>', d.get('ja_title') or '') if unlink(x)]
        hits = [sid(x) for x in cands if sid(x) in entries]
        if not hits:
            continue
        i = hits[-1]
        name = unlink((d.get('dub_name') or '').split('{{!}}')[-1])
        if name and name != entries[i]['name'] and name not in entries[i]['names']['dub_en']:
            entries[i]['names']['dub_en'].append(name)
        # 'a' na lista da dublagem = grafia alternativa ou nome usado em outra mídia; ambíguo, fica separado
        for alt in re.split(r'<br\s*/?>', d.get('alt') or ''):
            alt = unlink(alt)
            if alt and alt != entries[i]['name'] and alt not in entries[i]['names']['dub_en_variants']:
                entries[i]['names']['dub_en_variants'].append(alt)

    dbsp = {s['id']: s for s in db['species']}
    for i in dbsp:
        if i not in entries:
            conflicts.append({'kind': 'database_vs_index', 'id': i, 'names': [dbsp[i]['canonical_name']], 'reason': 'espécie da Database da Etapa 4 sem entrada nos índices da Wikimon', 'status': 'open'})

    declared = lst['_meta'].get('page_declared_count')
    conflicts.append({'kind': 'count_mismatch', 'id': None, 'names': [], 'reason': 'A List of Digimon declara %s espécies ("as of July 25th 2026"); o parser leu %d blocos. A Visual List declara %s ("as of April 9, 2026") e o parser leu %d. Os contadores das páginas estão desatualizados em relação ao conteúdo.' % (declared, lst['_meta']['parsed_count'], vis['_meta'].get('page_declared_count'), vis['_meta']['parsed_count']), 'status': 'open'})

    catalog = []
    for i in order:
        e = entries[i]
        d = dbsp.get(i)
        rec = {
            'id': i, 'name': e['name'], 'page_title': e['page_title'], 'names': e['names'],
            'level': {'normalized': None, 'en_official': None, 'status': 'pending', 'source_id': None, 'accessed_at': None},
            'attribute': {'normalized': None, 'en_official': None, 'status': 'pending', 'source_id': None, 'accessed_at': None},
            'type_en_official': None,
            'debut': e['debut'],
            'links': {'wikimon': e['wikimon_url'], 'visual_list_image_file': e['visual_list_image_file'],
                      'refbook_en': None},
            'in_etapa4_database': bool(d),
            'priority': 'P0' if i in p0_ids else ('P1' if i in p1_ids else 'unassigned'),
            'record_status': 'imported_index',
            'identity_status': 'verified_secondary' if 'src.wikimon_list_of_digimon' in e['origin_indexes'] else 'unverified',
            'origin_indexes': e['origin_indexes'],
            'last_checked': BUILD_DATE,
        }
        if d:
            lv = d['level']
            rec['level'] = {'normalized': lv['normalized'], 'en_official': lv['en_official'],
                            'status': 'reused_unverified', 'original_status': 'verified_primary' if lv['en_official'] else 'verified_secondary',
                            'source_id': 'src.refbook_en' if lv['en_official'] else 'src.wikimon', 'accessed_at': '2026-11-12'}
            at = d['attribute']
            rec['attribute'] = {'normalized': at['normalized'], 'en_official': at['en_official'],
                                'status': 'reused_unverified', 'original_status': 'verified_primary' if d['external_keys'].get('refbook_directory_name') else 'verified_secondary',
                                'source_id': 'src.refbook_en' if d['external_keys'].get('refbook_directory_name') else 'src.wikimon', 'accessed_at': '2026-11-12'}
            rec['type_en_official'] = d['type_en_official']
            rec['links']['refbook_en'] = d['external_keys'].get('refbook_url_en')
        catalog.append(rec)
    return catalog, conflicts, visual_only


def episode_species(name, catalog_ids):
    n = clean(name)
    n = re.sub(r'\s*\((Adventure|Adventure 02|Tri)\)$', '', n)
    i = sid(n)
    return i if i in catalog_ids else None


def main():
    db = load(EX / 'etapa4_db_subset.json')
    p0def = load(KB / 'digimondex' / 'p0_definition.json')
    p0_ids = []
    for g in p0def['groups']:
        for i in g['species_ids']:
            if i not in p0_ids:
                p0_ids.append(i)
    eps_raw = load(EX / 'wikimon_digimon_adventure_episodes.json')

    # ids conhecidos, para resolver os nomes dos episódios antes do catálogo final
    lst_ids = set()
    for e in load(EX / 'wikimon_list_of_digimon.json')['entries']:
        lst_ids.add(sid(clean(e['name']).split('{{!}}')[-1]))
    p1_ids = set()
    for ep in eps_raw['episodes']:
        for n in ep['digimon_listed']:
            i = episode_species(n, lst_ids)
            if i and i not in p0_ids:
                p1_ids.add(i)

    catalog, conflicts, visual_only = build_catalog(db, set(p0_ids), p1_ids)
    cat_ids = {c['id'] for c in catalog}
    by_id = {c['id']: c for c in catalog}

    # ---------- Shellmon (lido hoje no oficial) ----------
    sh = load(EX / 'shellmon_gd066.json')
    c = by_id['sp.shellmon']
    c['level'] = {'normalized': 'adult', 'en_official': sh['official']['level_en'], 'status': 'verified_primary', 'source_id': 'src.refbook_en', 'accessed_at': BUILD_DATE}
    c['attribute'] = {'normalized': 'data', 'en_official': sh['official']['attribute_en'], 'status': 'verified_primary', 'source_id': 'src.refbook_en', 'accessed_at': BUILD_DATE}
    c['type_en_official'] = sh['official']['type_en']
    c['links']['refbook_en'] = sh['official']['url']

    # ---------- AnimeDex ----------
    syn = load(KB / 'animedex' / 'seasons' / 'adventure_01_synopses_pt.json')['synopses']
    regions_seed = load(KB / 'worlddex' / 'regions' / 'adventure_01_file_island.seed.json')
    region_by_title = {r['wikimon_title']: r['id'] for r in regions_seed['regions'] if r.get('wikimon_title')}
    episodes = []
    unresolved_ep_names = set()
    for ep in eps_raw['episodes']:
        dig, unres = [], []
        for n in ep['digimon_listed']:
            i = episode_species(n, cat_ids)
            if i:
                if i not in dig:
                    dig.append(i)
            elif clean(n) != 'Digitama':
                unres.append(clean(n))
                unresolved_ep_names.add(clean(n))
        locs = []
        for l in ep['summary_links']:
            if l in region_by_title and region_by_title[l] not in locs:
                locs.append(region_by_title[l])
        for r in regions_seed['regions']:
            if ep['number'] in r.get('anchor_episodes', []) and r['id'] not in locs:
                locs.append(r['id'])
        evo = []
        for e in ep['evolutions']:
            chain = [episode_species(x, cat_ids) or ('digitama' if x == 'Digitama' else None) for x in e['chain']]
            evo.append({'chain_names': e['chain'], 'chain_ids': chain, 'first_time_in_series': e['debut']})
        s = syn.get(str(ep['number']))
        episodes.append({
            'id': 'ep.da1999.%02d' % ep['number'], 'season_id': 'anime.digimon_adventure_1999', 'number': ep['number'],
            'title_ja': ep['title_ja'], 'title_romaji': ep['title_romaji'],
            'title_literal_wiki': ep['title_literal_wiki'], 'title_us_dub': ep['title_us_dub'],
            'air_date_jp': ep['air_date_jp'],
            'synopsis_pt': s['text'] if s else None,
            'synopsis_status': 'verified_secondary' if s else 'pending',
            'synopsis_confidence': s['confidence'] if s else None,
            'characters': ep['humans_listed'],
            'digimon_ids': dig, 'digimon_unresolved_names': unres,
            'evolutions': evo,
            'analyzer': ep['analyzer'],
            'location_ids': locs,
            'events': None, 'battles': None, 'relevant_objects': None, 'environmental_refs': None,
            'events_status': 'pending',
            'sources': [{'source_id': 'src.wikimon_episode_pages', 'url': ep['url'], 'accessed_at': BUILD_DATE, 'category': 3}],
        })
    if unresolved_ep_names:
        conflicts.append({'kind': 'episode_name_unresolved', 'id': None, 'names': sorted(unresolved_ep_names), 'reason': 'nome listado na página do episódio sem correspondência exata no catálogo (personagem com nome próprio, forma especial ou grafia diferente)', 'status': 'open'})

    season = {'id': 'anime.digimon_adventure_1999', 'name': 'Digimon Adventure', 'name_ja': 'デジモンアドベンチャー',
              'media': 'anime (série de TV)', 'episodes_total': len(episodes),
              'first_air_jp': episodes[0]['air_date_jp'], 'last_air_jp': episodes[-1]['air_date_jp'],
              'arcs': [{'name': 'File Island', 'episodes': [1, 13]}, {'name': 'Server Continent', 'episodes': [14, 28]},
                       {'name': 'Tokyo', 'episodes': [29, 39]}, {'name': 'Dark Masters', 'episodes': [40, 54]}],
              'arcs_source': {'source_id': 'src.wikimon', 'url': 'https://wikimon.net/Digimon_Adventure', 'accessed_at': BUILD_DATE, 'category': 3},
              'synopses_written': sum(1 for e in episodes if e['synopsis_pt'])}
    dump(KB / 'animedex' / 'seasons' / 'adventure_01.json', {'_meta': {'generated': BUILD_DATE, 'generator': 'scripts/build_kb.py'}, 'season': season})
    dump(KB / 'animedex' / 'episodes' / 'adventure_01.json', {'_meta': {'generated': BUILD_DATE, 'generator': 'scripts/build_kb.py', 'note': 'Títulos literais e sinopses não são oficiais. Eventos, batalhas e objetos ficam pendentes neste lote.'}, 'episodes': episodes})

    # aparições em Adventure 01 por espécie
    appear = {}
    for e in episodes:
        for i in e['digimon_ids']:
            appear.setdefault(i, []).append(e['number'])

    # ---------- WorldDex ----------
    regions = []
    ep_by_region = {}
    for e in episodes:
        for r in e['location_ids']:
            ep_by_region.setdefault(r, []).append(e['number'])
    fields = ['narrative_location', 'biome', 'topography', 'climate', 'day_night_cycle', 'architecture', 'vegetation', 'water',
              'environmental_objects', 'special_structures', 'digimon_found', 'npcs', 'important_events', 'nostalgic_elements',
              'visual_refs', 'sound_refs', 'game_adaptation_ideas']
    for r in regions_seed['regions']:
        rec = {'id': r['id'], 'name': r['name'], 'name_ja': r.get('name_ja'), 'layer': 'canonical', 'parent_id': r.get('parent_id'),
               'media': r.get('media', ['anime.digimon_adventure_1999']), 'episode_numbers': sorted(set(ep_by_region.get(r['id'], []))),
               'wikimon_url': ('https://wikimon.net/' + r['wikimon_title'].replace(' ', '_')) if r.get('wikimon_title') else None}
        for f in fields:
            rec[f] = r.get(f)
        rec['pending_fields'] = [f for f in fields if rec[f] in (None, [])]
        rec['status'] = r['status']
        rec['notes'] = [x for x in (r.get('note'), r.get('naming_note')) if x]
        rec['sources'] = [{'source_id': 'src.wikimon_file_island', 'url': 'https://wikimon.net/File_Island', 'accessed_at': BUILD_DATE, 'category': 3}]
        regions.append(rec)
    dump(KB / 'worlddex' / 'regions' / 'adventure_01_file_island.json', {'_meta': {'generated': BUILD_DATE, 'generator': 'scripts/build_kb.py', 'layer': 'canonical'}, 'regions': regions})

    # ---------- referências visuais P0 ----------
    imginfo = {f['file_title'].split(':', 1)[1].replace('_', ' '): f for f in load(EX / 'wikimon_p0_imageinfo.json')['files']}
    local = load(KB / 'digimondex' / 'visual-references' / 'p0_local_refs.seed.json')['refs']
    refs = []
    for i in p0_ids:
        c = by_id[i]
        f = c['links']['visual_list_image_file']
        ii = imginfo.get(f.replace('_', ' ')) if f else None
        slots = {}
        if ii and not ii['missing']:
            slots['REF-01'] = {'url_original': ii['url'], 'page_url': ii['description_url'], 'source': 'Wikimon (arte oficial hospedada na wiki)',
                               'source_id': 'src.wikimon_imageinfo', 'author': 'Bandai (arte oficial); enviado à wiki por ' + (ii['uploader'] or '?'),
                               'official_page_url': c['links']['refbook_en'],
                               'visual_description': None, 'visual_description_status': 'pending (imagem não aberta neste lote)',
                               'resolution': '%sx%s' % (ii['width'], ii['height']), 'license_status': 'oficial_protegida_so_link',
                               'availability': 'available', 'verification_status': 'verified_metadata',
                               'quality_notes': 'arquivo confirmado pela API em %s; nome do arquivo bate com a espécie' % BUILD_DATE}
        else:
            slots['REF-01'] = {'status': 'missing'}
        ap = appear.get(i)
        if ap:
            n = ap[0]
            slots['REF-02'] = {'url_original': None, 'page_url': 'https://wikimon.net/Digimon_Adventure_-_Episode_%02d' % n,
                               'source': 'Wikimon (página do episódio)', 'source_id': 'src.wikimon_episode_pages', 'author': 'Toei Animation (anime)',
                               'visual_description': 'aparição em Digimon Adventure ep. %d (primeiro episódio da lista de personagens); nenhum frame escolhido' % n,
                               'episodes_in_adventure_01': ap, 'resolution': None, 'license_status': 'oficial_protegida_so_link',
                               'availability': 'page_available', 'verification_status': 'unverified',
                               'quality_notes': 'falta escolher o frame (galeria de screenshots da página)'}
        else:
            slots['REF-02'] = {'status': 'missing', 'note': 'espécie não listada em nenhum episódio de Digimon Adventure (1999); outras séries não pesquisadas neste lote'}
        for k in ('REF-03', 'REF-04', 'REF-05'):
            s = local.get(i, {}).get(k)
            if s:
                slots[k] = {'url_original': s.get('url'), 'page_url': s.get('url'), 'source': s['source'], 'source_id': 'src.etapa6_fichas_anatomia' if 'Ficha' in s['source'] else 'src.etapa6_comando9_catalogo',
                            'author': s['author'], 'visual_description': s['description'], 'resolution': s.get('resolution'),
                            'license_status': s['license_status'], 'local_path': s.get('local_path'), 'catalog_row': s.get('catalog_row'),
                            'availability': 'local_file' if s.get('local_path') else 'link_only',
                            'verification_status': 'reused_unverified', 'original_accessed_at': '2026-11-14',
                            'quality_notes': None}
            else:
                slots[k] = {'status': 'missing'}
        for k, v in slots.items():
            v['ref_id'] = 'vr.%s.%s' % (i[3:], k.lower().replace('-', ''))
            v['species_id'] = i
            v['category'] = k
            v.setdefault('status', 'present')
            v['checked_at'] = BUILD_DATE
            refs.append(v)
    dump(KB / 'digimondex' / 'visual-references' / 'p0_visual_references.json', {'_meta': {'generated': BUILD_DATE, 'generator': 'scripts/build_kb.py', 'scope': 'P0', 'rule': 'nenhuma imagem baixada; links e metadados'}, 'references': refs})

    # ---------- fichas P0 e arestas ----------
    dbsp = {s['id']: s for s in db['species']}
    p0_edges = [e for e in db['edges'] if e['from'] in p0_ids or e['to'] in p0_ids]
    for i in p0_ids:
        c = by_id[i]
        d = dbsp.get(i)
        prof = {
            'id': i, 'name': c['name'], 'names': c['names'],
            'level': c['level'], 'attribute': c['attribute'], 'type_en_official': c['type_en_official'],
            'family_groups': d['family_groups'] if d else None,
            'description_pt': d['description_pt'] if d else None,
            'description_status': ('reused_unverified (original: %s, 2026-11-12)' % d['description_status']) if d else None,
            'techniques': d['signature_skills'] if d else None,
            'physical_traits': None, 'personality_documented': None, 'habitat': None,
            'first_appearance': c['debut'],
            'anime_adventure_01_episodes': appear.get(i, []),
            'games_and_media_contexts': d['appearances'] if d else None,
            'evolves_from': sorted({e['from'] for e in p0_edges if e['to'] == i}),
            'evolves_to': sorted({e['to'] for e in p0_edges if e['from'] == i}),
            'evolution_edges_file': 'digimondex/evolutions/p0_edges.json',
            'alternative_forms': [v['name'] for v in d['variants']] if d else None,
            'evolution_requirements': 'pending',
            'visual_reference_ids': [r['ref_id'] for r in refs if r['species_id'] == i],
            'links': c['links'],
            'p0_groups': [g['group'] for g in p0def['groups'] if i in g['species_ids']],
            'sources': ['src.refbook_en', 'src.wikimon', 'src.wikimon_list_of_digimon', 'src.wikimon_episode_pages'],
            'last_checked': BUILD_DATE,
            'validation_status': 'reused_unverified' if d else 'verified_primary',
            'divergences': [],
            'pending': [],
        }
        if i == 'sp.shellmon':
            o, w = sh['official'], sh['wikimon']
            prof['description_pt'] = 'Digimon parecido com um ermitão (bernardo-eremita): parece uma tartaruga dentro da concha, mas tem corpo mole de molusco. Cresce trocando de casca até o tamanho de um morro pequeno.'
            prof['description_status'] = 'verified_primary (paráfrase própria do perfil oficial, lido em 2026-11-14)'
            prof['techniques'] = [{'id': 'sk.hydro_blaster', 'name_en_official': 'Hydro Blaster', 'name_wiki_translation': 'Hydro Pressure', 'source_id': 'src.refbook_en'}]
            prof['habitat'] = {'text_pt': o['habitat_paraphrase_pt'], 'source_id': 'src.refbook_en', 'status': 'verified_primary'}
            prof['personality_documented'] = {'text_pt': o['personality_paraphrase_pt'], 'source_id': 'src.refbook_en', 'status': 'verified_primary'}
            prof['family_groups'] = None
            prof['alternative_forms'] = w['subspecies']
            prof['types_wikimon'] = w['types']
            prof['fields_wikimon'] = w['fields']
            prof['wikimon_evolves_from_names'] = [x['target'] for x in w['evolves_from'] if x.get('target')]
            prof['wikimon_evolves_to_names'] = [x['target'] for x in w['evolves_to'] if x.get('target')]
            prof['wikimon_generic_evolution_rules'] = [x['raw_generic'] for x in w['evolves_from'] + w['evolves_to'] if not x.get('target')]
            prof['evolves_from'] = sorted(sid(n) for n in prof['wikimon_evolves_from_names'] if sid(n) in p0_ids)
            prof['evolves_to'] = sorted(sid(n) for n in prof['wikimon_evolves_to_names'] if sid(n) in p0_ids)
            prof['evolution_contexts_note'] = 'Gomamon → Shellmon só em Digimon Survive; Patamon → Shellmon só em Digimon Fortune (segundo a Wikimon). Nenhuma das duas é evolução universal.'
            prof['divergences'] = [
                {'field': 'special_move', 'official': 'Hydro Blaster', 'wiki': 'Hydro Pressure', 'note': 'nome oficial em inglês × tradução da wiki'},
                {'field': 'habitat', 'official': 'fundo (depths) do Net Ocean', 'wiki': 'fundo raso (shallower seabeds)', 'note': 'tradução diferente do mesmo perfil japonês'},
                {'field': 'type', 'official': 'Mollusk', 'wiki': 'Mollusk (DRB) e Aquatic (carta Bo-9; Analyzer do anime)', 'note': 'Aquatic é de outras continuidades'},
            ]
            prof['sources'] = ['src.refbook_en', 'src.wikimon', 'src.wikimon_episode_pages']
        if not prof['physical_traits']:
            prof['pending'].append('physical_traits (há só a descrição curta)')
        if not prof['personality_documented']:
            prof['pending'].append('personality_documented')
        if not prof['habitat']:
            prof['pending'].append('habitat')
        prof['pending'].append('evolution_requirements')
        if d and d['description_status'] == 'verified_primary':
            prof['pending'].append('reler a ficha oficial para tirar o status reused_unverified')
        dump(KB / 'digimondex' / 'species' / (i[3:] + '.json'), prof)
    sh_edges = []
    for n in sh['wikimon']['evolves_from']:
        if n.get('target') and sid(n['target']) in p0_ids:
            sh_edges.append({'id': 'ev.%s__shellmon__natural' % sid(n['target'])[3:], 'from': sid(n['target']), 'to': 'sp.shellmon', 'kind': 'evk.natural',
                             'contexts_raw': n['contexts'], 'source_id': 'src.wikimon', 'accessed_at': BUILD_DATE, 'status': 'verified_secondary'})
    dump(KB / 'digimondex' / 'evolutions' / 'p0_edges.json', {
        '_meta': {'generated': BUILD_DATE, 'generator': 'scripts/build_kb.py',
                  'note': 'Arestas da Database da Etapa 4 com uma ponta no P0 (reused_unverified, lidas no Wikimon em 2026-11-12) mais as arestas do Shellmon lidas hoje. Contexto é obrigatório: aresta de um jogo não é evolução universal. Nenhuma aresta tem fonte oficial.'},
        'edges_etapa4': p0_edges, 'edges_gd066': sh_edges})

    # ---------- catálogo, fontes, conflitos, manifesto ----------
    for c in catalog:
        if c['id'] in p0_ids:
            c['record_status'] = 'enriched_p0'
            c['profile_file'] = 'digimondex/species/%s.json' % c['id'][3:]
    dump(KB / 'digimondex' / 'catalog.json', {'_meta': {'generated': BUILD_DATE, 'generator': 'scripts/build_kb.py', 'version': KB_VERSION,
                                                       'id_rule': 'sp. + slug do título japonês da Wikimon (o mesmo build_db.py da Etapa 4); estável',
                                                       'layer': 'A (dados da franquia); nada do Digital Odyssey aqui'},
                                              'species': catalog})
    srcs = [s for s in db['sources']] + SOURCES_NEW
    seen, out = set(), []
    for s in srcs:
        if s['id'] in seen:
            continue
        seen.add(s['id'])
        out.append(s)
    dump(KB / 'sources' / 'sources.json', {'_meta': {'generated': BUILD_DATE, 'note': 'Fontes da Etapa 4 (mesmos ids) + fontes novas do GD-066.'}, 'sources': out, 'contexts': db['contexts']})
    dump(KB / 'validation' / 'conflicts.json', {'_meta': {'generated': BUILD_DATE, 'note': 'Conflitos e divergências encontrados. Nada foi resolvido em silêncio.'}, 'conflicts': conflicts})

    n_lv = sum(1 for c in catalog if c['level']['normalized'])
    vref_present = [r for r in refs if r['status'] == 'present']
    five = [i for i in p0_ids if sum(1 for r in refs if r['species_id'] == i and r['status'] == 'present') == 5]
    manifest = {
        'name': 'Digital Odyssey (GS-003) Knowledge Base', 'version': KB_VERSION, 'generated': BUILD_DATE,
        'project': 'GD-066', 'batch': 'lote-piloto', 'branch': 'feat/gs003-knowledge-base',
        'coverage': {
            'species_identified_in_indexes': len(catalog) + sum(1 for x in conflicts if x['kind'] == 'possible_duplicate'),
            'species_imported': len(catalog),
            'species_visual_list_only': len(visual_only),
            'species_with_level_and_attribute': n_lv,
            'species_level_verified_primary_this_batch': sum(1 for c in catalog if c['level']['status'] == 'verified_primary'),
            'species_reused_from_etapa4': sum(1 for c in catalog if c['in_etapa4_database']),
            'p0_species': len(p0_ids), 'p1_species': sum(1 for c in catalog if c['priority'] == 'P1'),
            'visual_reference_slots_p0': len(refs), 'visual_reference_present_p0': len(vref_present),
            'visual_reference_metadata_verified': sum(1 for r in refs if r.get('verification_status') == 'verified_metadata'),
            'species_with_5_refs_present': len(five), 'species_with_5_refs_verified': 0,
            'regions_canonical': len(regions), 'game_maps': 1, 'game_map_subareas': 6,
            'episodes': len(episodes), 'episodes_with_synopsis': season['synopses_written'],
            'open_conflicts': sum(1 for x in conflicts if x['status'] == 'open'),
        },
        'files': sorted(str(p.relative_to(KB)) for p in KB.rglob('*') if p.is_file() and p.suffix in ('.json', '.csv', '.md', '.py')),
    }
    dump(KB / 'manifest.json', manifest)
    print(json.dumps(manifest['coverage'], ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()
