#!/usr/bin/env python3
"""Testes automatizados da Knowledge Base. Uso (na pasta knowledge-base):
    python3 -I -m unittest discover -s validation -p 'test_*.py' -v
"""
import hashlib, json, pathlib, subprocess, sys, unittest

KB = pathlib.Path(__file__).resolve().parent.parent
GENERATED = ['digimondex/catalog.json', 'digimondex/catalog.csv', 'digimondex/evolutions/p0_edges.json',
             'digimondex/visual-references/p0_visual_references.json', 'animedex/episodes/adventure_01.json',
             'worlddex/regions/adventure_01_file_island.json', 'validation/conflicts.json', 'validation/dedupe_report.json',
             'manifest.json']


def run(script):
    return subprocess.run([sys.executable, '-I', str(KB / 'scripts' / script)], capture_output=True, text=True)


def digest():
    return {f: hashlib.sha256((KB / f).read_bytes()).hexdigest() for f in GENERATED}


def load(rel):
    return json.loads((KB / rel).read_text(encoding='utf-8'))


class TestKB(unittest.TestCase):
    def test_01_rebuild_is_idempotent(self):
        before = digest()
        for s in ('build_kb.py', 'export_csv.py', 'dedupe.py'):
            r = run(s)
            self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual(before, digest(), 'reexecução mudou arquivos gerados (não é idempotente)')

    def test_02_validator_zero_structural_errors(self):
        r = run('validate.py')
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn('0 erros estruturais', r.stdout)

    def test_03_catalog_ids_unique_and_stable(self):
        cat = load('digimondex/catalog.json')['species']
        ids = [c['id'] for c in cat]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertGreaterEqual(len(ids), 1600)
        db = load('sources/index_extracts/etapa4_db_subset.json')['species']
        self.assertTrue({s['id'] for s in db} <= set(ids), 'ids da Etapa 4 precisam continuar no catálogo')

    def test_04_known_facts(self):
        cat = {c['id']: c for c in load('digimondex/catalog.json')['species']}
        self.assertEqual(cat['sp.agumon']['level']['normalized'], 'child')
        self.assertEqual(cat['sp.shellmon']['level']['en_official'], 'Champion')
        self.assertEqual(cat['sp.shellmon']['level']['normalized'], 'adult')
        self.assertEqual(cat['sp.shellmon']['level']['status'], 'verified_primary')
        self.assertIn('Bukamon', cat['sp.pukamon']['names']['dub_en'])
        self.assertIn('Tsunomon', cat['sp.tunomon']['names']['dub_en'])

    def test_05_languages_do_not_duplicate(self):
        names = {c['name'] for c in load('digimondex/catalog.json')['species']}
        for dub in ('Bukamon', 'Tsunomon', 'Growlmon', 'Gallantmon'):
            self.assertNotIn(dub, names, '%s é nome da dublagem e não pode virar espécie separada' % dub)

    def test_06_episodes(self):
        eps = {e['number']: e for e in load('animedex/episodes/adventure_01.json')['episodes']}
        self.assertEqual(sorted(eps), list(range(1, 55)))
        self.assertIn('sp.shellmon', eps[2]['digimon_ids'])
        self.assertIn('wd.file_island_phone_booth_beach', eps[2]['location_ids'])
        chains = [e['chain_ids'] for e in eps[2]['evolutions']]
        self.assertIn(['sp.agumon', 'sp.greymon', 'sp.agumon'], chains)
        for n in range(1, 14):
            self.assertTrue(eps[n]['synopsis_pt'])
            self.assertLessEqual(len(eps[n]['synopsis_pt']), 500)

    def test_07_p0_has_five_slots_and_no_downloaded_images(self):
        refs = load('digimondex/visual-references/p0_visual_references.json')['references']
        self.assertEqual(len(refs), 19 * 5)
        imgs = [p for p in KB.rglob('*') if p.suffix.lower() in ('.png', '.jpg', '.jpeg', '.gif', '.webp')]
        self.assertEqual(imgs, [], 'a KB não pode guardar imagens')

    def test_08_game_map_is_not_canonical(self):
        gm = load('worlddex/maps/costa_do_despertar.json')
        self.assertEqual(gm['map']['classification'], 'original')
        farol = [a for a in gm['subareas'] if a['name'] == 'Farol'][0]
        self.assertEqual(farol['classification'], 'original')


if __name__ == '__main__':
    unittest.main()
