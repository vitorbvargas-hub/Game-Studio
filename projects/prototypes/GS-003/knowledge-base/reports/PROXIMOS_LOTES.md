# Próximos lotes recomendados — GD-066 (para aprovação do fundador)

**game-research · 2026-11-14.** Nada abaixo começa sem aprovação (Fase 9 do comando). Estimativas são **[H]**, baseadas no que o piloto mediu: a API da Wikimon devolve até 50 páginas por requisição, e o portão de 65 s entre chamadas funcionou.

## Limites que proponho para todos os lotes

- **Ritmo:** Wikimon no máximo 1 requisição a cada 65 s (robots.txt pede 60). digimon.net no máximo 1 a cada 10 s (o site não declara limite; é margem de educação). Nada de Fandom nem Spriters Resource enquanto estiverem atrás do Cloudflare.
- **Custo pago:** zero. Nenhum crédito do PixelLab.
- **Armazenamento:** só JSON, CSV e MD; nenhuma imagem; teto de 20 MB para a pasta `knowledge-base/`.
- **Tempo:** até ~2 h de agente por lote, um lote por vez (regra de concorrência até a Etapa 6 ser homologada).
- **Entrega de cada lote:** extratos, regeneração, `validate.py` com 0 erros estruturais, testes, relatório curto e um commit na `feat/gs003-knowledge-base`.

## Lotes

| Ordem | Lote | O quê | Requisições (estimativa) | Tempo de agente | Armazenamento extra | Por que agora |
|---|---|---|---|---|---|---|
| 1 | **R1 — fechar as referências do P0** | os 46 slots `missing`: arte e sprites para as linhas Gigimon, Dorimon, Tunomon e Tokomon; frame do anime (REF-02) dos 13 com aparição em Adventure; Shellmon em sprite | ~15 Wikimon + ~10 GitHub/Wayback | ~2 h | < 0,5 MB | o P0 é o que a arte usa primeiro; hoje nenhum Digimon tem as cinco referências verificadas |
| 2 | **C1 — estágio, atributo e tipo do catálogo inteiro (Wikimon)** | infobox das 1.546 espécies sem estágio | ~78 Wikimon (20 páginas por chamada) | ~2 h (o relógio é o crawl-delay) | ~3 MB | sem estágio, o catálogo não serve para buscar "todos os Criança aquáticos" |
| 3 | **C2 — conferir no oficial (digimon.net)** | reler as 81 fichas da Etapa 4 (tira o `reused_unverified`) e ler as do P1 | ~200 digimon.net | ~1,5 h | < 0,5 MB | transforma wiki em `verified_primary` onde existe ficha oficial |
| 4 | **P1-R — referências do P1 (117 espécies de Adventure 01)** | REF-01 por imageinfo; REF-02 já sai dos episódios; REF-03/04 pelo `digimon.json` do repositório Digimon Up | ~5 Wikimon + 1 GitHub | ~1,5 h | ~1 MB | as próximas espécies que os mapas vão pedir |
| 5 | **A1 — sinopses e eventos de Adventure 01** | sinopses dos eps. 14-54; eventos, batalhas e objetos dos 54 | 0 (as páginas já estão no cache) | ~2 h | < 0,3 MB | fecha a AnimeDex da primeira temporada |
| 6 | **W1 — completar File Island e abrir o Server Continent** | campos ambientais das 12 regiões `pending`; regiões do arco 14-28 | ~3 Wikimon | ~1,5 h | < 0,3 MB | base canônica para o game-design desenhar a Costa e os mapas seguintes |
| 7 | **A2 / P2 — Adventure 02, Tamers, Frontier** | episódios e referências da P2 | ~10 Wikimon por temporada | ~2 h por temporada | ~1 MB por temporada | depois que P0 e P1 estiverem fechados |

**Recomendação:** aprovar **R1, C1 e C2** como próximo pacote (~5,5 h de agente em três lotes, ~110 requisições à Wikimon, ~200 ao digimon.net, custo zero, < 5 MB).

## Decisões que dependem do fundador

1. **A lista dos "12 parceiros candidatos".** Não existe no repositório. O P0 deste lote usa 19 espécies com fonte (5 starters, suas linhas, as espécies do laboratório e o Shellmon). Quem define os 12?
2. **O nível mínimo de evidência do protocolo** (proposta: REF-01 + uma referência de corpo inteiro em outro ângulo ou em movimento).
3. **Merge da branch** `feat/gs003-knowledge-base` (não fiz e não farei).
4. **Versionar a Database da Etapa 4** (`projects/prototypes/GS-003/database/` está fora do Git na `master`).
5. **Layout-brief da Costa do Despertar** (game-design): a KB só classifica o que é canônico; a Vila da Costa e a Vila dos Bebês podem disputar a mesma âncora (Village of Beginnings).
