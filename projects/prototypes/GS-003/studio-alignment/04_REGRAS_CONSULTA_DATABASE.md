# 04 — Regras de consulta à Digimon Database (brief §5, sem runtime)

- **Data:** 2026-11-12 · **Base:** `database/README.md`, `02_ARQUITETURA.md`, `RELATORIO_EXECUTIVO_ETAPA4.md` §F, `01_INVENTARIO_E_CONTRADICOES.md`. Status da Etapa 4: **arquitetura homologada com ressalvas**.
- **Escopo:** como os agentes **leem e citam** a Database e como pedem mudança. Não liga a Database ao jogo, não cria migration, não altera dados.

## 1. O que a Database é e não é

| É | Não é |
|---|---|
| Base de **conhecimento** da franquia (Camada A) + propostas e mapeamentos do Digital Odyssey (Camada B), em JSON com JSON Schema, gerador e validador | Banco de produção; fonte de dados do jogo (isso é a decisão **D7**, pendente) |
| Rastreável: 2.521 afirmações com fonte, URL, data, continuidade, categoria, confiança e status | "Verdade oficial": 64% da base estendida vem do Wikimon, e **nenhuma aresta de evolução tem fonte oficial** |
| Piloto revisado (23 espécies, 35 habilidades, 82 arestas) + base estendida (81/105/452) | Balanceamento: não há (nem pode haver) número de jogo nela |

## 2. As sete regras (brief §5)

| # | Regra | Como aplicar | Exemplo de erro a evitar |
|---|---|---|---|
| R1 | **Camada A = conhecimento da franquia; Camada B = proposta ou decisão do Digital Odyssey** | Cite o arquivo: `species/skills/evolutions/sources/claims.json` = A; `gs003_proposals.json` e `gs003_mapping.json` = B | Citar `prop.mounts` como "a franquia tem montaria" |
| R2 | **Proposta não vira regra aprovada** | Na Camada B, só é aprovada a regra com `status` aprovado **e** ADR existente citado. Todo o resto se escreve "proposta" | Spec de design que trata "confiança" ou "cuidados" como regra decidida |
| R3 | **Fonte comunitária não equivale a oficial** | Diga a categoria (1–6) e o status. `verified_secondary` = "lido no Wikimon, obra não conferida" | Escrever "evolução oficial Agumon → GeoGreymon" (é aresta de wiki) |
| R4 | **Não misturar estágios japoneses e ocidentais** | Use `level.normalized` (`baby_i`, `baby_ii`, `child`, `adult`, `perfect`, `ultimate`) e, se precisar, `level.en_official` entre parênteses. "Ultimate" EN = `perfect` | Chamar MetalGreymon de "Ultimate" num doc em JP-normalizado e WarGreymon de "Ultimate" em outro |
| R5 | **Não confundir Drimogemon com Digmon** | São `sp.drimogemon` (Champion/`adult`, Data) e Digmon (Armor). O id de jogo `SP-DRIMOGEMON` hoje aponta para sprite de Digmon (erro conhecido, decisão **D4**) | Gerar ou aprovar arte de "Drimogemon" a partir do sprite atual |
| R6 | **Preservar a proveniência** | Ao copiar um valor da Database para outro documento, leve junto `claim_id` (ou fonte + continuidade + categoria). Nunca "limpe" a ressalva | Tabela de design com atributos sem dizer que Penmon diverge (jogo Data × oficial Vaccine) |
| R7 | **O piloto revisado é a referência prioritária** | Use `pilot_catalog.json`/`07_CATALOGO_PILOTO.md` primeiro. Base estendida só para espécie fora do piloto, citando que não foi revisada | Usar a base estendida como "qualidade de referência" |

## 3. Leitura por agente

| Agente | Lê | Pode escrever na Database? | Uso típico |
|---|---|---|---|
| `game-research` | tudo | **Sim** (dono). Só via `sources_cache/` + gerador + validador com 0 erros estruturais | manter, expandir (com autorização), responder consultas |
| `game-design` | `07`, `08`, `10`, `species/evolutions/skills.json`, `gs003_proposals.json` | **Não.** Propõe na Camada B por documento; o `game-research` registra | regras de evolução e vínculo; checar se uma proposta contradiz a franquia |
| `game-art` | `07` (espécie certa, estágio, nome oficial), `01` (contradições) | Não | conferir identidade da espécie antes de produzir ou aprovar sprite |
| `game-dev` | `README`, `gs003_mapping.json`, `02` | Não. **Nada no runtime lê a Database** até D7 | estimar integração futura; nunca importar agora |
| `game-qa` | `07`, `gs003_mapping.json`, `01`, `tools/validate.py` (só leitura) | Não | conferir no jogo nome, estágio, atributo e espécie; rodar o validador como evidência |
| `game-studio` | `README`, relatório executivo, `09` (matriz de qualidade) | Não (registra ADR quando uma proposta é aprovada) | decidir prioridades, levar D1–D10 ao fundador |
| `game-growth` | — | Não | — |

## 4. Como citar um dado da Database em qualquer documento

Formato mínimo:

```
Agumon — estágio child (Rookie), atributo Vaccine [cat. 1, verified_primary, Reference Book EN, 2026-11-12, ctx.reference_book]
ev.agumon__geo_greymon__natural [cat. 3, verified_secondary, Wikimon; requisito "LV 20, Friendship 60%+, Defense 90+" só em ctx.digimon_story_sunburst_digimon_story_moonlight, status reused_unverified]
```

- Sem categoria e status, o dado não pode sustentar decisão.
- Ids `cl.*` mudam a cada geração: cite o `sp.`/`sk.`/`ev.` estável + fonte, não o `cl.` sozinho, em documentos de longa vida.

## 5. Pedido de mudança (fluxo)

1. Quem encontrou o problema (ex.: QA vê atributo errado no jogo) **registra** com evidência e manda ao `game-studio`.
2. O `game-studio` classifica:
   - **Erro de dado da Camada A** → tarefa para o `game-research` (relê a fonte, corrige `sources_cache/`, regenera, valida).
   - **Divergência jogo × Database** → registro em `gs003_mapping.json` pelo `game-research`; a correção **no jogo** é decisão do fundador (ex.: D3, D4) e depois tarefa do `game-dev`.
   - **Nova regra do Digital Odyssey** → proposta do `game-design` na Camada B; vira aprovada só com ADR do fundador.
3. Nada de editar `data/*.json` à mão (o gerador sobrescreve).
4. Toda mudança termina com `validate.py` em 0 erros estruturais e a lacuna atualizada em `04_VALIDACAO.md`.

## 6. Ressalvas da Etapa 4 que todo agente deve conhecer

- Efeitos de habilidade e reversão de evolução: **pendentes em tudo**.
- 63 das 82 arestas do piloto não têm requisito com texto; requisitos existentes são `reused_unverified`.
- Só a versão EN do Reference Book foi lida (a JP, só para Agumon).
- Descrições são paráfrases não revisadas.
- Dado de Dawn/Dusk obtido por proxy na fase anterior (decisão **D6**).
- Três intervalos ao Wikimon abaixo do `Crawl-delay` (falha registrada; não repetir).

## 7. Decisões do fundador que destravam a Database

D1 homologação (feita, com ressalvas) · **D2** convenção de nome do jogo · **D3** atributos (Penmon, bebês) · **D4** Drimogemon × Digmon no catálogo de sprites · **D5** coleta do catálogo inteiro · **D6** dado por proxy · **D7** Database como fonte do jogo · **D8** as cinco perguntas do ADR-013 · **D9** propostas da Camada B · **D10** os seis conceitos do ADR-013 como "aprovados em existência".
Recomendação desta etapa: D2, D3 e D4 antes de qualquer sprite novo de Digimon na Etapa 6; D7 só depois da Etapa 6.
