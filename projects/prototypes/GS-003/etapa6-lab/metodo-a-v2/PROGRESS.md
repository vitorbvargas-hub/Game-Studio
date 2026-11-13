# PROGRESS — C5 Link A, passo de ARTE (game-art)

- Ferramentas: Python puro (sem PIL), scripts em `workspaces/game-art/tools/c5/` (c5lib, proc, seg, contact, ruler, common, terrain...). **0 créditos PixelLab.**
- Achado-base: pranchas são ilustração IA com pseudo-pixel ~2 px, sem grade uniforme (células do tileset da 06 variam 42–60 px). Redução por moda (sem interpolação) para a grade alvo.

## Etapas
- [x] Leitura C5, ADR, E5, FASE2, pranchas 01–08.
- [x] terreno/ (32 tiles, prancha 06) — grama com rampa P-ii, demais P-ii ∪ P-iii-sem-verdes.
- [x] vegetacao/ (06 escala do tileset; 08 árvores grandes)
- [x] agua/ (água A da prancha 06, rio/lago/cachoeira/espuma, GIFs)
- [x] objetos/ (06, 03, 08)
- [x] tamer/ (06 presets 6 e 2, só sul, 41 px, lab-character.json M2)
- [x] digimon/ (retratos E5 da 04 e 06; rotações O/S/L + walk candidato da 05 p/ Agumon e Koromon)
- [x] terreno/transicao_grama_agua_wang16 (derivado por código)
- [x] manifest.json (125 assets), _comparacoes/ (Tamer A×B, Agumon A×DS×v2, escala E5, água A×B, Wang, cena teste), LACUNAS_METODO_A.md

## Estado: CONCLUÍDO (passo de arte). get_balance 714,95 = sem gasto. qo 3289e32 limpo; lab-etapa6 a944e80 limpo.
## Retomada: rodar de novo, na ordem, em tools/c5: terrain, veg06, veg08, water, wang, objects, tamer, digi_portrait, digi_comp, digi_walk, digi_rot, compare, scene, manifest.
