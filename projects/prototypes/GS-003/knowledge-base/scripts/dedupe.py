#!/usr/bin/env python3
"""Relatório de possíveis duplicidades no catálogo (somente leitura).

Procura: (1) mesmo kana em ids diferentes; (2) mesmo nome normalizado (sem espaço, hífen, dois-pontos);
(3) nome da dublagem igual ao nome principal de outra espécie; (4) mesmo arquivo de imagem.
Escreve validation/dedupe_report.json. Não funde nada: duplicidade é decisão de pesquisa.
Variantes genuínas (X-Antibody, cores, modos) aparecem como 'mesmo_kana' só se o kana for idêntico.
Uso: python3 -I scripts/dedupe.py
"""
import json, pathlib, re

KB = pathlib.Path(__file__).resolve().parent.parent


def norm(s):
    return re.sub(r'[^a-z0-9]', '', (s or '').lower())


def main():
    cat = json.loads((KB / 'digimondex' / 'catalog.json').read_text(encoding='utf-8'))['species']
    groups = {'same_kana': {}, 'same_normalized_name': {}, 'same_image': {}}
    by_name = {}
    for c in cat:
        k = (c['names']['ja_kana'] or '').replace(' ', '')
        if k:
            groups['same_kana'].setdefault(k, []).append(c['id'])
        groups['same_normalized_name'].setdefault(norm(c['name']), []).append(c['id'])
        f = c['links']['visual_list_image_file']
        if f:
            groups['same_image'].setdefault(f.lower().replace(' ', '_'), []).append(c['id'])
        by_name[norm(c['name'])] = c['id']
    out = {k: {kk: vv for kk, vv in v.items() if len(vv) > 1} for k, v in groups.items()}
    dub_clash = []
    for c in cat:
        for field in ('dub_en', 'dub_en_variants'):
            for d in c['names'].get(field, []):
                o = by_name.get(norm(d))
                if o and o != c['id']:
                    dub_clash.append({'species': c['id'], 'field': field, 'dub_name': d, 'is_main_name_of': o})
    out['dub_name_equals_other_species'] = dub_clash
    out['_summary'] = {k: len(v) for k, v in out.items() if k != '_summary'}
    (KB / 'validation' / 'dedupe_report.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(json.dumps(out['_summary'], ensure_ascii=False))


if __name__ == '__main__':
    main()
