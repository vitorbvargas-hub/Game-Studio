#!/usr/bin/env python3
"""Extrai FATOS curtos das páginas de episódio de Digimon Adventure (1999) na Wikimon:
número, título japonês, tradução literal da wiki, título da dublagem americana, data de
exibição no Japão, personagens humanos, Digimon listados, cadeias de evolução, locais
linkados no resumo e entradas do Digimon Analyzer (nível, tipo, atributo, golpe).

NÃO copia o resumo, as citações nem o perfil do Analyzer.

Uso: python3 -I scripts/extract_wikimon_episodes.py <dir_cache_bruto> <data_consulta>
"""
import json, re, sys, pathlib

KB = pathlib.Path(__file__).resolve().parent.parent
OUT = KB / 'sources' / 'index_extracts' / 'wikimon_digimon_adventure_episodes.json'
FILES = ['wikimon_batch1.raw', 'wikimon_episodes_02_27.raw', 'wikimon_episodes_28_54.raw']


def pages(path):
    raw = path.read_text(encoding='utf-8')
    s = raw.index('{', raw.index('---'))
    e = raw.rindex('}', 0, raw.index('<<<END_EXTERNAL')) + 1
    d = json.loads(raw[s:e])
    return {p['title']: p['revisions'][0]['slots']['main']['content']
            for p in d['query']['pages'] if 'revisions' in p}


def field(t, k):
    m = re.search(r'^\|' + k + r'=(.*)$', t, re.M)
    if not m:
        return None
    v = m.group(1).strip()
    v = re.sub(r'\{\{Ch2?\|([^|}]*)\|([^}]*)\}\}', r'\2', v)
    v = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]]*)\]\]', r'\1', v)
    return v.strip() or None


def section(t, start_pat, end_pat):
    i = t.find(start_pat)
    if i < 0:
        return ''
    j = t.find(end_pat, i + len(start_pat))
    return t[i:j if j > 0 else len(t)]


def main():
    cache, date = pathlib.Path(sys.argv[1]), sys.argv[2]
    P = {}
    for f in FILES:
        P.update({k: v for k, v in pages(cache / f).items() if k.startswith('Digimon Adventure - Episode')})
    eps = []
    for title in sorted(P):
        t = P[title]
        num = int(title.rsplit(' ', 1)[1])
        chars = section(t, '=Characters=', '=Summary=')
        humans = sorted(set(re.findall(r'\{\{Ch\|([^}|]+)\}\}', chars)))
        digimon = []
        for n in re.findall(r'\{\{[Cc]h2\|([^}|]+)(?:\|[^}]*)?\}\}', chars):
            n = n.strip()
            if n not in digimon:
                digimon.append(n)
        summ = section(t, '=Summary=', '=Main Events=')
        links = []
        for l in re.findall(r'\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]', summ):
            l = l.strip()
            if l not in links:
                links.append(l)
        evo = []
        for raw in re.findall(r'\{\{Evolution\|([^}]*)\}\}', t):
            parts = [p.strip() for p in raw.split('|')]
            chain = [p for p in parts if '=' not in p and p]
            evo.append({'chain': chain, 'debut': 'debut=y' in raw})
        analyzer = []
        for blk in re.findall(r'\{\{DigiAnalyzer(.*?)\n\}\}', t, re.S):
            g = lambda k: (re.search(r'^\|' + k + r'=(.*)$', blk, re.M) or [None, None])[1]
            analyzer.append({'name': (g('nj') or '').strip() or None, 'level': (g('l') or '').strip() or None,
                             'type': (g('t') or '').strip() or None, 'attribute': (g('fm') or '').strip() or None,
                             'special_move_wiki': (g('sm') or '').strip() or None})
        eps.append({
            'number': num,
            'wikimon_title': title,
            'url': 'https://wikimon.net/' + title.replace(' ', '_'),
            'title_ja': field(t, 'tj'),
            'title_romaji': field(t, 'r'),
            'title_literal_wiki': field(t, 'trj'),
            'title_us_dub': field(t, 'ten'),
            'air_date_jp': field(t, 'aj'),
            'humans_listed': humans,
            'digimon_listed': digimon,
            'summary_links': links,
            'evolutions': evo,
            'analyzer': analyzer,
        })
    meta = {'source_id': 'src.wikimon_episode_pages', 'series': 'Digimon Adventure (1999)',
            'accessed_at': date, 'category': 3, 'requests': 4,
            'note': 'Fatos extraídos do wikitext (infobox Ep, Characters, Evolution, DigiAnalyzer, links do resumo). '
                    'Resumo, citações e perfis NÃO copiados. Títulos literais são tradução da wiki, não oficiais.'}
    OUT.write_text(json.dumps({'_meta': meta, 'episodes': eps}, ensure_ascii=False, indent=1), encoding='utf-8')
    print(len(eps), 'episódios')


if __name__ == '__main__':
    main()
