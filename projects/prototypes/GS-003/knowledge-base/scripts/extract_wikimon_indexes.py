#!/usr/bin/env python3
"""Extrai fatos curtos (nome, kana, ano, estreia, arquivo de imagem, nomes da dublagem)
das páginas-índice da Wikimon, salvas pelo web_fetch, para sources/index_extracts/.

Uso: python3 -I scripts/extract_wikimon_indexes.py <dir_cache_bruto> <data_consulta>
O cache bruto (wikitext completo) NÃO é versionado; só os extratos.
"""
import json, re, sys, pathlib

KB = pathlib.Path(__file__).resolve().parent.parent
OUT = KB / 'sources' / 'index_extracts'


def load_wikitext(path):
    raw = pathlib.Path(path).read_text(encoding='utf-8')
    start = raw.index('{', raw.index('---'))
    end = raw.rindex('}', 0, raw.index('<<<END_EXTERNAL')) + 1
    return json.loads(raw[start:end])['parse']['wikitext']


def blocks(wt, tpl):
    out = []
    for m in re.finditer(r'\{\{' + tpl + r'\s*\n(.*?)\n\}\}', wt, re.S):
        rec = {}
        for line in m.group(1).split('\n'):
            line = line.strip()
            if line.startswith('|') and '=' in line:
                k, v = line[1:].split('=', 1)
                rec[k.strip()] = v.strip()
        out.append(rec)
    return out


def clean_link(s):
    if s is None:
        return None
    s = re.sub(r'\[\[([^\]|]*)\|([^\]]*)\]\]', r'\2', s)
    s = re.sub(r'\[\[([^\]]*)\]\]', r'\1', s)
    return s.replace("''", '').strip()


def main():
    cache, date = pathlib.Path(sys.argv[1]), sys.argv[2]
    OUT.mkdir(parents=True, exist_ok=True)
    wt = load_wikitext(cache / 'wikimon_list_of_digimon.raw')
    count = re.search(r'there are ([\d,]+) Digimon listed', wt)
    lst = [{'name': b['n'], 'kana': b.get('k', '').strip() or None,
            'debut_year': int(b['yr']) if b.get('yr', '').isdigit() else None,
            'debut_raw': clean_link(b.get('d'))} for b in blocks(wt, 'DlistJ')]
    meta = {'source_id': 'src.wikimon_list_of_digimon', 'url': 'https://wikimon.net/List_of_Digimon',
            'api_url': 'https://wikimon.net/api.php?action=parse&page=List_of_Digimon&prop=wikitext&format=json',
            'accessed_at': date, 'category': 3, 'page_declared_count': count.group(1) if count else None,
            'parsed_count': len(lst), 'note': 'Fatos de índice (nome, kana, ano e mídia de estreia). Sem texto de perfil.'}
    (OUT / 'wikimon_list_of_digimon.json').write_text(json.dumps({'_meta': meta, 'entries': lst}, ensure_ascii=False, indent=1), encoding='utf-8')

    wt = load_wikitext(cache / 'wikimon_visual_list.raw')
    count = re.search(r'there are ([\d,]+) Digimon listed', wt)
    vis = [{'name': b['n'], 'image_file': b.get('i')} for b in blocks(wt, 'DlistI')]
    meta = {'source_id': 'src.wikimon_visual_list', 'url': 'https://wikimon.net/Visual_List_of_Digimon',
            'accessed_at': date, 'category': 3, 'page_declared_count': count.group(1) if count else None,
            'parsed_count': len(vis), 'note': 'Só o nome do arquivo de imagem (link). Nenhuma imagem baixada. A própria página avisa que algumas variantes usam recolorização não oficial.'}
    (OUT / 'wikimon_visual_list.json').write_text(json.dumps({'_meta': meta, 'entries': vis}, ensure_ascii=False, indent=1), encoding='utf-8')

    wt = load_wikitext(cache / 'wikimon_english_dub_names.raw')
    dub = [{'dub_name': b['n'], 'ja_title': b.get('j'), 'alt': b.get('a'), 'points_to': b.get('p')} for b in blocks(wt, 'DlistE')]
    meta = {'source_id': 'src.wikimon_dub_names', 'url': 'https://wikimon.net/List_of_English_Dub_Names',
            'accessed_at': date, 'category': 3, 'parsed_count': len(dub),
            'note': 'n = nome da dublagem; j = título japonês (romanização Wikimon); a = grafia alternativa; p = aponta para outro nome.'}
    (OUT / 'wikimon_english_dub_names.json').write_text(json.dumps({'_meta': meta, 'entries': dub}, ensure_ascii=False, indent=1), encoding='utf-8')
    print(len(lst), len(vis), len(dub))


if __name__ == '__main__':
    main()
