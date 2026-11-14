# Digital Odyssey (GS-003) — Knowledge Base

Base de referência permanente sobre o universo Digimon para os agentes do Digital Odyssey: espécies, referências visuais, locais e episódios, cada dado com fonte, data, categoria e status.

- **Versão:** 0.1.0-pilot · **Lote:** piloto do GD-066 · **Gerada em:** 2026-11-14 · **Autor:** game-research
- **Comece por:** `reports/RELATORIO_LOTE_PILOTO.md` (o que foi feito e o que falta) e `manifest.json` (cobertura em números).
- **O que não é:** não é banco de produção, não está ligada ao motor, não define regra de jogo nem número de balanceamento, não autoriza publicação. O Digital Odyssey é um fangame **não oficial e não licenciado**; usar Digimon oficiais é decisão específica deste projeto (ADR-007, ADR-009, ADR-014) e não é autorização jurídica.

## Estrutura

```
knowledge-base/
  README.md                 este arquivo
  manifest.json             versão, data, cobertura, lista de arquivos (gerado)
  PLANEJAMENTO_GD-066.md    GD-066 a GD-075
  schemas/                  JSON Schema (draft 2020-12) de cada tipo de registro
  sources/
    sources.json            fontes (ids da Etapa 4 + novas) e continuidades (ctx.)
    index_extracts/         extratos curtos das fontes (nunca texto de perfil, nunca imagem)
    REQUESTS_LOG.md         cada requisição externa, com hora e intervalo
  digimondex/
    catalog.json / .csv     catálogo mestre (1.628 espécies)
    p0_definition.json      quem é P0 e por quê
    species/                fichas completas do P0 (19)
    evolutions/             arestas com uma ponta no P0, com continuidade
    visual-references/      REF-01 a REF-05 do P0 (JSON, CSV e a semente local)
  worlddex/
    regions/                regiões canônicas (File Island, Adventure 01)
    maps/                   mapas do Digital Odyssey, com canônico/inspirado/original
    environments/           pendente
  animedex/
    seasons/                temporada e sinopses próprias
    episodes/               54 episódios de Adventure 01 (JSON e CSV)
    events/                 pendente
  validation/               testes, conflitos, dedupe, amostragem de URLs
  reports/                  relatório do lote e proposta dos próximos
  scripts/                  extração, importação, geração, CSV, dedupe, validação
  agent-rules/              protocolo GS-003-DIGIMON-REFERENCE-GATE
```

## Como regenerar e validar

Na pasta `knowledge-base/`:

```
# 1. (só quando houver fonte nova) extratos a partir do cache bruto fora do repo
python3 -I scripts/extract_wikimon_indexes.py <cache> <data>
python3 -I scripts/extract_wikimon_episodes.py <cache> <data>
python3 -I scripts/import_etapa4_db.py ../database
# 2. sempre
python3 -I scripts/build_kb.py
python3 -I scripts/export_csv.py
python3 -I scripts/dedupe.py
python3 -I scripts/validate.py          # precisa sair com "0 erros estruturais"
python3 -I -m unittest discover -s validation -p 'test_*.py' -v
```

`build_kb.py` não acessa a rede e é idempotente (o teste 01 confere que uma segunda execução não muda nenhum arquivo). Não edite à mão os arquivos gerados (`catalog.*`, `species/`, `evolutions/`, `p0_visual_references.*`, `episodes/`, `regions/*.json` sem `.seed`, `conflicts.json`, `dedupe_report.json`, `manifest.json`): mude a semente ou o extrato e regenere.

**SQLite:** não foi necessário. 1.628 espécies cabem em ~1 MB de JSON, legível e versionável. Reavaliar se a KB passar de ~50 MB ou precisar de consulta cruzada pesada.

## Regras de leitura

1. **Ids estáveis.** `sp.` + slug do título japonês da Wikimon, a mesma regra da Database da Etapa 4 (`sp.pukamon` é o Bukamon da dublagem). Os ids da Etapa 4 foram preservados. Caracteres não ASCII somem do slug (`Nüwashou` → `sp.n_washou`); é feio, mas estável.
2. **Estágio:** convenção japonesa normalizada (`baby_i`, `baby_ii`, `child`, `adult`, `perfect`, `ultimate`). **"Ultimate" em inglês = `perfect`.** O inglês oficial fica em `en_official`.
3. **Status:** `verified_primary` = lido hoje na fonte oficial · `verified_secondary` = lido hoje numa wiki · `reused_unverified` = veio da Etapa 4 (2026-11-12) e não foi relido · `verified_metadata` = existência e metadados confirmados, conteúdo não inspecionado · `pending` / `missing` = não há dado. Nunca leia "verificado" sem o sufixo.
4. **Categorias de fonte:** 1 oficial · 2 oficial de continuidade específica · 3 wiki · 4 fã · 5 inferência · 6 documento ou proposta do Digital Odyssey. Wiki que cita o oficial continua categoria 3.
5. **Camadas:** o catálogo e as fichas são dados da franquia (camada A). Mapas, subáreas e escolhas do jogo ficam em `worlddex/maps/` com a classificação `canonical` / `inspired` / `original`; a Costa do Despertar é `original`.
6. **Evolução tem contexto.** Uma aresta de um jogo não é evolução universal. Nenhuma aresta tem fonte oficial ainda.
7. **Imagens:** a KB não guarda imagens. REF-01 aponta para a arte oficial hospedada na Wikimon; sprites oficiais extraídos de jogos são "uso interno" (estudo e entrada do PixelLab), não vão para o jogo nem são redistribuídos.

## Relação com a Database da Etapa 4

A Database (`projects/prototypes/GS-003/database/`) tem as afirmações individuais (`claims.json`) das 81 espécies do roster. A KB reaproveita a visão resolvida delas (`sources/index_extracts/etapa4_db_subset.json`) e as fontes, sem duplicar ids. **Atenção:** em 2026-11-14 a pasta `database/` existe no checkout principal mas **não está versionada** na `master`; por isso a KB guarda o subconjunto que usa.
