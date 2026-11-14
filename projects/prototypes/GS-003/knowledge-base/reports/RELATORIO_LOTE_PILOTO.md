# Relatório do lote-piloto — GD-066 Knowledge Base Global

**Digital Odyssey (GS-003) · game-research · 2026-11-14**
Brief: `knowledge-base-cmd/BRIEF_GD-066_LOTE_PILOTO.md` · Comando: `knowledge-base-cmd/COMANDO_KB_GLOBAL_GD-066.md`

> **[E]** evidência lida hoje, com fonte · **[H]** hipótese ou estimativa · `reused_unverified` = dado da Etapa 4 (2026-11-12) que não foi relido.
> **O lote-piloto está entregue; a Knowledge Base NÃO está completa.** Os números abaixo dizem exatamente o que ficou de fora.

## Resumo em 8 linhas

1. A estrutura da Fase 5 existe em `projects/prototypes/GS-003/knowledge-base/`, com schemas, scripts idempotentes, testes e exportação CSV.
2. O catálogo mestre tem **1.628 espécies** importadas das páginas-índice da Wikimon (nome, kana, ano e mídia de estreia, arquivo de arte, nomes da dublagem).
3. Só **82** espécies têm estágio e atributo: 81 reaproveitadas da Database da Etapa 4 e o Shellmon, lido hoje no oficial. As outras 1.546 estão `pending`.
4. O P0 tem **19 espécies** com ficha. A lista dos "12 parceiros candidatos" não existe no repositório; o P0 foi montado com o que tem fonte.
5. Referências visuais do P0: **49 de 95** slots preenchidos; **nenhum** Digimon tem as cinco referências verificadas.
6. WorldDex: 19 regiões canônicas de File Island; a Costa do Despertar está classificada como criação do Digital Odyssey, subárea por subárea.
7. AnimeDex: os **54 episódios** de Adventure 01 com títulos, Digimon, evoluções e Analyzer; **13** com sinopse própria.
8. Validação com 0 erros estruturais, 8 de 8 testes OK. Houve **dois desvios** de ritmo/rede no início, descritos no item 9.

## Os 15 itens do relatório obrigatório

### 1. Repositório e branch

- Repositório `vitorbvargas-hub/Game-Studio`, remoto `origin` (alias SSH `github-gamestudio`).
- Worktree `~/projects/GameStudio/workspaces/game-research/kb-gs003`, branch **`feat/gs003-knowledge-base`**, saindo da `master` em `f02fbab`.
- As 399+ alterações locais da `master` no checkout principal **não foram tocadas nem incluídas**.

### 2. Total de espécies identificadas

**1.630** [E]: 1.628 importadas mais 2 nomes da Visual List que podem ser duplicatas e não foram fundidos (`Digimon Slingshot` × `Pickmons Slingshot`; `Shoutmon X2 (Incomplete X3)` × `(Incomplete X4)`).

- A List of Digimon declara "1.614 as of July 25th 2026", mas o parser leu 1.623 blocos. A Visual List declara 1.606 e o parser leu 1.626. **Os contadores das páginas estão desatualizados** (registrado em `validation/conflicts.json`).
- O índice oficial (`digimon.net/reference_en/`) depende de JavaScript e não traz lista no HTML: **não foi importado**.
- A Digimon Wiki (Fandom) está atrás do Cloudflare: **não foi usada**.

### 3. Total de espécies importadas

**1.628** em `digimondex/catalog.json` e `.csv`:

- 1.623 da List of Digimon, das quais 1.619 também estão na Visual List;
- 5 só na Visual List (os modos "G" Erosion/Fusion), com identidade `unverified`;
- 1.596 com kana, 554 com nome da dublagem, 1.623 com ano e mídia de estreia, 1.623 com arquivo de arte.
- P0 = 19; **P1 = 117** (espécies listadas em algum episódio de Adventure 01); as demais estão `unassigned` (P2/P3 não classificados).

### 4. Total de espécies validadas

Depende do que se chama de validada:

| Nível | Quantidade |
|---|---|
| Identidade (nome, kana, estreia) lida hoje na Wikimon (`verified_secondary`) | 1.623 |
| Estágio, tipo e atributo lidos **hoje** no oficial (`verified_primary`) | **1** (Shellmon) |
| Estágio e atributo vindos da Etapa 4 (lidos no oficial em 2026-11-12, hoje `reused_unverified`) | 81 |
| Sem estágio nem atributo (`pending`) | 1.546 |

### 5. Total de referências visuais verificadas

P0: 95 slots (19 × 5).

| Situação | Slots |
|---|---|
| REF-01 com existência, tamanho e URL confirmados pela API (`verified_metadata`); a imagem não foi aberta | 19 |
| REF-02: página do episódio confirmada, frame não escolhido (`unverified`) | 13 |
| REF-03, 04 e 05 vindos do catálogo do Comando 9 e das fichas de anatomia (`reused_unverified`) | 17 |
| `missing` | 46 |

**Verificadas de ponta a ponta (imagem aberta e conferida): 0.** Nenhuma imagem foi baixada.

### 6. Quantidade de Digimon com cinco referências

- **5 com os cinco slots preenchidos:** Agumon, Greymon, Gomamon, Ikkakumon e Koromon.
- **0 com os cinco verificados.** Em todos eles REF-02 ainda é `unverified`.
- Bukamon (`sp.pukamon`) tem 4. Tunomon, Tokomon, Gabumon, Garurumon, Patamon, Angemon e Shellmon têm 2. Gigimon, Guilmon, Growmon, Dorimon, Dorumon e Dorugamon têm 1, só a arte oficial.

### 7. Total de regiões e mapas

- **19 regiões canônicas** de File Island (Adventure 01): 7 com descrição e episódio (`verified_secondary`) e 12 só com nome e hierarquia (`pending`).
- **1 mapa do jogo** (Costa do Despertar, `original`) com 6 subáreas: Praia e Bosque `inspired`; Vila, Gruta, Farol e Recife de Shellmon `original`.
- **Achados:**
  - a praia canônica é a das **cabines telefônicas** (ep. 2, onde Shellmon ataca);
  - **não achei farol** em Adventure 01 (eps. 1-13);
  - o habitat oficial do Shellmon é "o fundo" do Net Ocean, enquanto a tradução da Wikimon diz "fundo raso". O recife raso é escolha do Digital Odyssey.

### 8. Total de episódios catalogados

- **54 de 54** de Digimon Adventure (1999), com título japonês, romaji, tradução literal da wiki, título da dublagem americana, data de exibição, personagens, Digimon (1.070 ligações a espécies, nenhum nome sem correspondência), 83 eventos de evolução e o Analyzer.
- **13 sinopses próprias** (eps. 1-13): 6 com confiança alta e 7 média.
- Ainda `pending` nos 54 episódios: sinopses dos eps. 14-54, eventos, batalhas e objetos.

### 9. Fontes utilizadas

| Fonte | Categoria | Uso | Requisições |
|---|---|---|---|
| Wikimon (List of Digimon, Visual List, English Dub Names, File Island, Shellmon, 54 episódios, imageinfo) | 3 | catálogo, P0, WorldDex, AnimeDex | 9 de API + 2 de robots.txt |
| Digimon Encyclopedia oficial (digimon.net) | 1 | Shellmon; amostragem de Agumon e Gomamon; índice (sem lista) | 6 |
| Database da Etapa 4 (`projects/prototypes/GS-003/database/`) | 1 e 3 (reuso) | estágio, atributo, descrição, arestas de 81 espécies | local |
| Catálogo de sprites do Comando 9 e fichas de anatomia da Etapa 6 | 6 (interno) | REF-03, REF-04 e REF-05 de 6 espécies | local |
| GitHub `dannyphang/digimon-up-sprites` | 4 | REF-04 (só link) | 1 |
| Fandom e Spriters Resource | — | bloqueados por Cloudflare; não contornados | 2 |

Detalhes, horários e intervalos: `sources/REQUESTS_LOG.md`. Custo pago: zero.

**Desvios:**

- **(a) Crawl-delay:** a Wikimon pede 60 s entre requisições; nas duas primeiras chamadas da API o intervalo foi de ~20-27 s e de 37 s. Corrigi com um portão de 65 s, e todas as chamadas seguintes ficaram em 68 s ou mais.
- **(b) Proxy de saída:** uma requisição de teste (`curl --noproxy`) ao robots.txt da Wikimon saiu fora do proxy de saída do sandbox. Não foi repetida.

### 10. Erros, duplicidades e divergências

- **Erros estruturais:** 0.
- **Conflitos registrados:** 20 em `validation/conflicts.json`, 12 abertos.
  - **9 de cobertura de índice**: 5 espécies só na Visual List e 4 só na List of Digimon.
  - **2 possíveis duplicatas**, não fundidas.
  - **1 contador desatualizado.**
  - **8 resolvidos com nota**:
    - grafias Grottemon/Grottomon e Jiko Chuumon/Tyumon;
    - Gallantmon = Dukemon: Chaos Mode;
    - 5 nomes exibidos que apontam para outra página, como Chibi Kamemon → página Kamemon.
- **Dedupe** (`validation/dedupe_report.json`):
  - 0 nomes normalizados iguais;
  - 28 grupos de kana igual (versões de anime ou de jogo com página própria);
  - 4 grupos de imagem igual, incluindo duas grafias de Nüwashou, que preciso conferir;
  - **10 nomes da dublagem iguais ao nome de outra espécie.** Exemplos: o Gargomon da dublagem é `sp.galgomon`, não `sp.gargomon`; o Scorpiomon da dublagem é `sp.anomalocarimon`; o Mercurymon da dublagem é `sp.mercuremon`.
- **Divergências do Shellmon:**
  - golpe "Hydro Blaster" no oficial × "Hydro Pressure" na tradução da wiki;
  - habitat no fundo × no fundo raso;
  - tipo Mollusk no oficial × Aquatic no Analyzer do anime e na carta Bo-9.
- **Contradição com o jogo:** o `GDD_MMO_V1.md` descreve a "Praia dos Postes" como "postes saindo do mar na praia, ep. 1". Nos resumos, as cabines telefônicas estão na praia (ep. 2) e os **postes** numa planície quente (ep. 4). **Não corrigi o GDD**; a divergência fica para o game-design conferir no anime.
- **Lacuna de escopo:** não existe lista dos 12 parceiros candidatos nem layout-brief da Costa do Despertar.

### 11. Agentes que receberam o protocolo obrigatório

**Nenhum, por este agente.** A instalação (Fase 6, GD-073) é do game-studio. Entreguei o texto único em `agent-rules/GS-003-DIGIMON-REFERENCE-GATE.md`, com o trecho pronto para os AGENTS.md.

### 12. Evidências de que o protocolo está sendo carregado

**Nenhuma ainda.** Só existe depois que o game-studio instalar e conferir o carregamento em cada agente.

### 13. Testes realizados

- `scripts/validate.py`: 0 erros estruturais, 1 aviso (repositório Digimon Up compartilhado por 5 espécies).
- `unittest`: 8 de 8 OK. Cobre idempotência, ids estáveis da Etapa 4, fatos conhecidos, nome da dublagem que não vira espécie, episódios, cinco slots, nenhuma imagem e mapa do jogo que não é canônico.
- CSV: 3 arquivos sem linha quebrada.
- Amostragem de URLs: 75 páginas e arquivos da Wikimon pela API, 4 de 4 URLs externas OK, 2 bloqueadas e 0 quebradas.
- Varredura de segredos: 0.
- `git status`: só a pasta `knowledge-base/` nova.

Detalhes em `validation/VALIDATION_REPORT.md`.

### 14. Commits e link do Pull Request

- Commit na branch `feat/gs003-knowledge-base`: o hash, o resultado do push e o link do PR estão em `reports/GIT_RESULTADO.md` (escrito depois do push) e na resposta ao game-studio.
- **Sem merge** e sem push na `master`.

### 15. Próximos lotes recomendados

Ver `reports/PROXIMOS_LOTES.md`. A recomendação é aprovar **R1** (fechar as referências do P0), **C1** (estágio, atributo e tipo do catálogo inteiro pela Wikimon) e **C2** (conferir no oficial). São ~5,5 h de agente, ~110 requisições à Wikimon e ~200 ao digimon.net, custo zero e menos de 5 MB.

## O que NÃO foi feito

- Fase 6 (instalar o protocolo): é do game-studio.
- P1, P2 e P3 das referências; P2/P3 do catálogo; estágio e atributo de 1.546 espécies.
- Sinopses dos eps. 14-54; eventos, batalhas e objetos de todos os episódios; outras temporadas; ambientes da WorldDex; 12 regiões com campos ambientais.
- Escolha de frames do anime; abertura das imagens de arte; reler as 81 fichas oficiais da Etapa 4.
- Nenhuma mudança em gameplay, motor, sprites, mapas, GDD ou PROJECT_LOG.

## Decisões que dependem do fundador

1. Quais são os 12 parceiros candidatos.
2. Aprovar (ou mudar) o nível mínimo de evidência do protocolo.
3. Aprovar os próximos lotes e o orçamento de requisições e tempo.
4. Merge da branch.
5. Versionar a Database da Etapa 4.
6. Como registrar o desvio (b), a requisição fora do proxy.
