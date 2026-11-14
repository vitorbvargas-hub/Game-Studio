#!/usr/bin/env python3
"""Exporta CSV (UTF-8, vírgula, cabeçalho) a partir dos JSON gerados. Uso: python3 -I scripts/export_csv.py"""
import csv, json, pathlib

KB = pathlib.Path(__file__).resolve().parent.parent


def load(rel):
    return json.loads((KB / rel).read_text(encoding='utf-8'))


def write(rel, header, rows):
    with (KB / rel).open('w', encoding='utf-8', newline='') as fh:
        w = csv.writer(fh, lineterminator='\n')
        w.writerow(header)
        w.writerows(rows)


def j(x):
    return '; '.join(x) if isinstance(x, list) else ('' if x is None else str(x))


def main():
    cat = load('digimondex/catalog.json')['species']
    write('digimondex/catalog.csv',
          ['id', 'name', 'page_title', 'ja_kana', 'dub_en', 'dub_en_variants', 'alternatives', 'level_normalized', 'level_en_official', 'level_status',
           'attribute_normalized', 'attribute_en_official', 'attribute_status', 'type_en_official', 'debut_year', 'debut_media',
           'wikimon_url', 'visual_list_image_file', 'refbook_en_url', 'in_etapa4_database', 'priority', 'record_status',
           'identity_status', 'origin_indexes', 'last_checked'],
          [[c['id'], c['name'], j(c['page_title']), j(c['names']['ja_kana']), j(c['names']['dub_en']), j(c['names'].get('dub_en_variants')), j(c['names']['alternatives']),
            j(c['level']['normalized']), j(c['level']['en_official']), c['level']['status'],
            j(c['attribute']['normalized']), j(c['attribute']['en_official']), c['attribute']['status'], j(c['type_en_official']),
            j(c['debut']['year']), j(c['debut']['media']), j(c['links']['wikimon']), j(c['links']['visual_list_image_file']),
            j(c['links']['refbook_en']), c['in_etapa4_database'], c['priority'], c['record_status'], c['identity_status'],
            j(c['origin_indexes']), c['last_checked']] for c in cat])
    eps = load('animedex/episodes/adventure_01.json')['episodes']
    write('animedex/episodes/adventure_01.csv',
          ['id', 'number', 'title_ja', 'title_romaji', 'title_literal_wiki', 'title_us_dub', 'air_date_jp', 'synopsis_pt',
           'synopsis_status', 'digimon_ids', 'location_ids', 'characters', 'source_url'],
          [[e['id'], e['number'], j(e['title_ja']), j(e['title_romaji']), j(e['title_literal_wiki']), j(e['title_us_dub']),
            j(e['air_date_jp']), j(e['synopsis_pt']), e['synopsis_status'], j(e['digimon_ids']), j(e['location_ids']),
            j(e['characters']), e['sources'][0]['url']] for e in eps])
    refs = load('digimondex/visual-references/p0_visual_references.json')['references']
    write('digimondex/visual-references/p0_visual_references.csv',
          ['ref_id', 'species_id', 'category', 'status', 'url_original', 'page_url', 'source', 'author', 'resolution',
           'license_status', 'availability', 'verification_status', 'local_path', 'checked_at'],
          [[r['ref_id'], r['species_id'], r['category'], r['status'], j(r.get('url_original')), j(r.get('page_url')),
            j(r.get('source')), j(r.get('author')), j(r.get('resolution')), j(r.get('license_status')), j(r.get('availability')),
            j(r.get('verification_status')), j(r.get('local_path')), r['checked_at']] for r in refs])
    print('CSV: %d espécies, %d episódios, %d referências' % (len(cat), len(eps), len(refs)))


if __name__ == '__main__':
    main()
