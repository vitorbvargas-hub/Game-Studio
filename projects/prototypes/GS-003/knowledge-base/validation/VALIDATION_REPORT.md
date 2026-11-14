# Validação do lote-piloto GD-066 — 2026-11-14

## Resultado

| Verificação | Comando | Resultado |
|---|---|---|
| JSON válido + JSON Schema + relações | `python3 -I scripts/validate.py` | **0 erros estruturais**, 1 aviso |
| Testes automatizados | `python3 -I -m unittest discover -s validation -p 'test_*.py' -v` | **8 de 8 OK** |
| Reexecução idempotente | teste 01 (hash dos 9 arquivos gerados antes e depois de `build_kb` + `export_csv` + `dedupe`) | igual |
| CSV | leitura com `csv` e contagem de colunas por linha | 3 arquivos; 1.628 + 95 + 54 linhas; 0 linhas com número de colunas errado; linhas iguais às do JSON |
| Duplicidade | `python3 -I scripts/dedupe.py` → `dedupe_report.json` | 0 nomes normalizados iguais; 28 grupos de kana igual; 4 grupos de imagem igual; 10 nomes de dublagem (ou grafias alternativas da dublagem) iguais ao nome de outra espécie (ver abaixo) |
| URLs por amostragem | `url_sample.json` | 75 páginas/arquivos da Wikimon confirmados pela API; 4 de 4 URLs externas de amostra OK; 2 bloqueadas por Cloudflare; 0 quebradas |
| Segredos | regex para chaves AWS/GitHub/OpenAI/Slack, chave privada, `password=`, `token=`, `Bearer`, e-mail pessoal, caminho de configuração do OpenClaw | 0 ocorrências |
| Arquivos do jogo | `git status` no worktree | só `projects/prototypes/GS-003/knowledge-base/` é novo; nenhum asset, código, mapa ou sprite tocado |
| Imagens | teste 07 | nenhuma imagem na KB |

**Aviso:** o mesmo repositório (Digimon Up) é REF-04 de 5 espécies. Não é erro (cada espécie tem sua pasta `baked/<nome>`), mas quem usar deve abrir a pasta certa.

## O que a validação confere

- ids únicos e no padrão (`sp.`, `vr.`, `ep.`, `wd.`, `do.area.`, `src.`);
- todo `species_id`, `region_id`, `parent_id` e `evolves_*` citado existe;
- os 19 do P0 têm ficha e exatamente cinco slots de referência;
- REF-01: o nome do arquivo de arte bate com a espécie (detecta troca de espécie); a mesma arte em duas espécies é erro;
- nível preenchido nunca com status `pending`; nível com status sempre com fonte;
- nenhum dado do Digital Odyssey (`src.gs003*`) no catálogo; mapa do jogo nunca `canonical`;
- nenhum campo com cara de balanceamento (`hp`, `atk`, `base_stats`…);
- CSV com os mesmos ids e a mesma contagem do JSON.

## Duplicidades e semelhanças que o dedupe achou (não fundidas)

- **Kana igual (28 grupos):** quase todos são versões de anime ou de jogo da mesma espécie com página própria na Wikimon (ex.: `sp.beelzebumon` × `sp.beelzebumon_2010_anime_version`). São variantes registradas separadamente pela fonte; ficaram separadas.
- **Imagem igual (4 grupos):** `digimon_noimage.jpg` (18 espécies sem arte; é a imagem-padrão da wiki), `numemon.jpg` (Numemon e Gigantic Numemon), `goldnumemon.jpg` (Gold Numemon e a versão Ultimate) e `nüwashou.jpg` (duas grafias de Nüwashou; **conferir no lote C1**).
- **Nome da dublagem igual ao de outra espécie (10):** 5 no nome principal da dublagem (`dub_en`) e 5 nas grafias alternativas (`dub_en_variants`, campo `a` da lista, de sentido ambíguo). Exemplos: o Gargomon da dublagem é `sp.galgomon`, e existe outro `sp.gargomon`; o Scorpiomon da dublagem é `sp.anomalocarimon`, e o Scorpiomon japonês é outro; o Mercurymon da dublagem é `sp.mercuremon`, e existe `sp.mercurymon`. Isso está no protocolo como armadilha de identificação.
