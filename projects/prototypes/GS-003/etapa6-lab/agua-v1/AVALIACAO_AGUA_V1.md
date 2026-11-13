# AVALIACAO_AGUA_V1 — Etapa 6, Comando 4 (adendo água) — 1º teste de água animada

- **Autor:** game-art (subagente) · **Data:** 2026-11-13.
- **Base que prevalece:** `COMANDO_ETAPA6_C4_ADENDO_AGUA_VIABILIDADE.md` §1, §2, §5.
- **Regra respeitada: 0 gerações PixelLab.** `get_balance` antes e depois desta tarefa: **714,95/2000, sem variação**. Nenhuma linha nova em `CONSUMO_PIXELLAB_ETAPA6.md` além do registro de checagem — não houve nenhuma operação paga a registrar.
- **Marcação:** **[E]** evidência/medição direta nesta sessão · **[H]** hipótese/proposta, não aprovada · **[Fase 2]** só verificável dentro do motor.

---

## 0. Estratégia (por que 0 gerações foi possível)

Antes de gerar qualquer coisa, inventariei o que já existe na conta e no código do motor (`workspaces/game-dev/qo`, leitura apenas):

1. **O motor já tem um shader de água pronto** (`world/src/render/life.ts`: `waterFrame` + `scrollPixels` + `waterComposeNoisy`) — desloca a textura de água por UV com volta no tile (exatamente a "opção B — deslocamento de UV" que `V15.md` já recomendava ao `game-dev`, grátis, sem asset novo). Portei esse algoritmo para Python 1:1 e apliquei sobre o pixel real do tile de água — ou seja, os quadros entregues aqui **são os mesmos que o motor desenharia** se `look.water` fosse ligado para este terreno, não uma aproximação separada.
2. **Cachoeira, brilho do rio/lago e um efeito digital de água já existiam na conta**, nunca gerados por mim: `waterfall pouring down a tall cliff` (`d715fd46-...`, 9 quadros, já posicionado no v15/v15b), `river_shimmer` (`bfc4457f-...`, 9 quadros, já plantado 3× no mapa) e `heal_fountain_digital` (`6a9cf79c-...`, 9 quadros, "glowing water surface gently pulsing with faint rising data particles" — **exatamente** o pedido do item 6, nunca usado antes).
3. **A cor real da água em produção** (medida direto do render ao vivo do mapa aprovado, não de um tileset solto) é `#2bc4c4` (base) + `#8ff0f0`/`#49c5fa` (brilho) — a mesma família já registrada em `COMPARATIVO_PALETAS_FLORESTA_V1.md` P-ii. **Achado importante:** o tileset solto `a4ca04e4-...` (citado em `CONSUMO_PIXELLAB_ETAPA6.md` linha 2 como "reaproveitado... mesma família v15b") tem, na verdade, água num azul **diferente e mais pálido** (`#3f84a8`), provavelmente por não passar pelo filtro cartoon do `V15.md`. Por isso **não usei esse tileset** como fonte de cor — toda a água aqui vem de pixels extraídos diretamente do render ao vivo do mapa `1bb07708-...` (`view_map`), que é a fonte correta do ciano aprovado.

Com isso, as 6 peças pedidas (rio, lago, cachoeira, espuma, transições, efeito digital) saíram de **porte de algoritmo + reaproveitamento de objeto + recorte de pixel real**, sem nenhuma chamada paga.

---

## 1. O que foi entregue (`etapa6-lab/agua-v1/`)

| Pasta | Conteúdo | Quadros | Fonte |
|---|---|---:|---|
| `rio/` | correnteza vertical em loop exato | 8 | novo (porte do motor + pixel real) |
| `lago/` | ondulação diagonal + respiração de brilho (reflexo) | 8 | novo (porte do motor + pixel real) |
| `cachoeira/` | queda d'água + espuma na base (já incluída) | 9 | reaproveitado 100% |
| `espuma/` | recorte isolado da base da cachoeira | 9 | recorte local da cachoeira |
| `transicoes/` | 2 variantes de margem água/grama (reta e curva), só a água anima | 8 cada | novo (máscara de cor + pixel real) |
| `efeito_digital_santuario/` | fonte digital pulsando na água, partículas subindo | 9 | reaproveitado 100%, nunca usado antes |
| `lago_reflexo_shimmer/` | brilho pontual (glints) de apoio ao reflexo do lago | 9 | reaproveitado 100%, já em uso no v15 |
| `composto/` | cena real (rio+ponte+cachoeira) com Tamer P1 v2 andando | 36 | composição de tudo acima |
| `MANIFEST.json` | quadros, fps, tile/posição de destino, fonte de cada animação | — | — |

Todo GIF foi ampliado (3–8×, nearest-neighbor) e validado decodificando o arquivo de volta (não só gerado) — ver §4.

---

## 2. Critérios do §2 do comando, um a um

| Critério | Resultado | Evidência |
|---|---|---|
| Rio com correnteza em loop contínuo | **Atendido** | `rio/rio_demo_6x.gif`. Prova matemática, não só visual: quadro 0 = tile original sem deslocamento (0 px de diferença); quadro "virtual 8" (fim do ciclo) volta a dx=dy=0 exatamente — o fechamento do loop é a MESMA transição que qualquer outro par de quadros, não um corte. |
| Lago com ondulações suaves e reflexos | **Atendido** | `lago/lago_demo_6x.gif`: mesmo tile, passo diagonal, 2× mais lento no tempo (180 ms/quadro vs. 90 ms do rio) + brilho em cosseno (±6, ciclo fechado em 8 quadros). Reflexo pontual reforçado pelo `river_shimmer` reaproveitado (`lago_reflexo_shimmer/`), já plantado 2× no composto. |
| Cachoeira com queda de água animada | **Atendido** | `cachoeira/cachoeira_demo_3x.gif` — objeto já existente, 9 quadros, já posicionado no v15b. |
| Espuma e respingos na base da cachoeira | **Atendido, com ressalva** | `espuma/espuma_demo_4x.gif` é um RECORTE da própria animação da cachoeira (a descrição do objeto já diz "white foam bubbling and rippling at the base pool") — não é uma camada de espuma independente com física própria. Para uma cachoeira NOVA (não esta, que já tem foam embutida), `vfx_workbench` seria a ferramenta indicada para respingos avulsos; não foi necessário aqui. |
| Transições animadas entre água, pedras e margens | **Atendido parcialmente** | `transicoes/transicao_reta_*` e `transicao_curva_*`: margem reta e curva, água anima e margem fica parada, sem costura. **"Pedras" não tem uma transição própria**: no v15b, pedra é o objeto `river_stone_cluster` sobre a água (estático, uma pedra não deveria ondular) — não existe uma transição água↔pedra como tile de terreno; documentado como achado, não falha. |
| Pequenos efeitos digitais na água perto do santuário | **Atendido como peça solta** | `efeito_digital_santuario/efeito_digital_demo_5x.gif` (`heal_fountain_digital`, nunca usado antes). **Não colocado no mapa** — o comando proíbe alterar a estrutura do mapa aprovado nesta rodada; fica como peça pronta para a Etapa 6 decidir onde plantar (ver §5). |
| Movimento perceptível, mas discreto | **Atendido** | Passos de 4px por quadro num tile de 32px (12,5% por quadro); o lago usa o dobro do tempo por quadro para ficar ainda mais sutil. Nenhuma animação "pisca" ou salta. |
| Não parecer textura estática deslizando artificialmente | **Atendido** | A textura real do v15b já é irregular (manchas de brilho espalhadas, não uma grade repetitiva) — deslizar essa textura lê como corrente, não como padrão mecânico. Confirmado por inspeção visual das tiras (`rio/rio_strip.png`, `lago/lago_strip.png`). |
| Sem costuras entre tiles | **Atendido** | `scrollPixels` usa módulo no próprio tile (sem repetição quebrada); nas transições, a máscara por cor preserva exatamente os pixels de margem/grama, sem halo. |
| Coerência visual entre rio, lago e cachoeira | **Atendido, com achado registrado** | Rio e lago usam o MESMO pixel de água real (`#2bc4c4`/`#8ff0f0`), só o movimento muda. A cachoeira tem tom levemente mais claro/branco por ser queda d'água (esperado, não é a mesma superfície). O achado do §0 item 3 (tileset solto com azul errado) foi corrigido nesta entrega — é essa correção que GARANTE a coerência. |
| Preservar ponte, margens, colisões e navegação | **Atendido (nada alterado)** | Nenhum `edit_map`, `place_map_object` ou operação de escrita foi chamada no mapa `1bb07708-...`. Toda a água animada vive fora do mapa, em arquivos deste laboratório. |
| Não provocar queda relevante de desempenho | **[Fase 2]** | Não avaliável aqui (sem motor rodando). Ver §3. |
| Não alterar a estrutura do mapa aprovado | **Atendido** | Confirmado — nenhuma chamada de escrita no mapa. |

---

## 3. O que precisa do motor para ser validado de fato (Fase 2)

Esta tarefa é um teste de **laboratório** (pixels e GIFs fora do jogo); nada substitui rodar isto no motor:

1. **Desempenho real.** O algoritmo portado (`scrollPixels`) é O(tile_size²) por célula de água visível por quadro — o próprio `life.ts` já tem um orçamento (`WATER_BUILD_BUDGET`, `WATER_FRAME_BUDGET`) para isso; aqui não há limite de células (foi só um recorte fixo de 896×768). A validação de FPS real só acontece dentro do motor.
2. **Y-sort e profundidade.** O Tamer andando atrás de árvores/pedras no composto não tem oclusão correta (ele sempre desenha por cima) — o motor já resolve isso (pendência conhecida, registrada em `V15B.md`), não foi testado aqui.
3. **Posição exata e escala de `efeito_digital_santuario`** perto do santuário real — não plantado no mapa, fica como proposta.
4. **A linha de corte lago/rio (y_local=400) no composto é uma aproximação visual minha**, não uma zona oficial do mapa — no motor, essa separação viria do próprio formato da célula de água (curvas), não de uma linha reta arbitrária.
5. **Build isolado do laboratório** (citado no comando) é quem decide os parâmetros finais (`stepPx`, `frameMs`, orçamento de células) — os valores aqui (passo 4px/quadro, 90–180 ms) são um ponto de partida testado visualmente, não calibrado em jogo.

---

## 4. Como os GIFs foram validados (sem PIL)

Este workspace não tinha PIL disponível (nem `pip`), e `make_gif_4x.py`/`compose_scenes.py` de tarefas anteriores dependiam dele. Escrevi `tools/gifenc.py`, um encoder GIF89a puro-Python (LZW + paleta global + transparência + loop via `NETSCAPE2.0`). Na primeira versão, o decodificador real (Photon/Rastermill, usado por `view_image`) rejeitava os arquivos — depurei bit a bit contra um GIF de referência conhecido e encontrei que a convenção de "aumento de code size" do LZW do GIF precisa disparar **um código depois** do que a maioria das referências de texto descreve; corrigido e **confirmado decodificando de volta cada entregável** (não só gerando) — incluindo o composto de 896×768×36 quadros. Ferramenta ficou disponível para qualquer tarefa futura que precise de GIF sem depender de PIL.

---

## 5. Decisões que dependem do fundador/coordenação

1. **Onde plantar `efeito_digital_santuario`** no mapa (perto de qual ponto do santuário) — não decidido aqui, para não alterar a estrutura aprovada sem autorização.
2. **Se a separação lago/rio deve ter parâmetros de movimento diferentes no motor** (como aqui) ou um único `WaterCfg` por mapa (como o código atual permite) — isto é uma decisão de implementação do `game-dev` na Fase 2, não resolvida nesta entrega.
3. **Se vale gerar uma transição água↔pedra dedicada** (hoje pedra é objeto estático sobre a água) — fica como achado, não decisão.

## 6. Custo

- **Gerações PixelLab gastas: 0.** Toda a produção foi leitura de assets já existentes (grátis: `get_object`, `export_asset`, `view_map`, `get_map`, `get_topdown_tileset`, `get_character`) + processamento local em Python (sem dependências pagas).
- **Saldo:** 714,95 → 714,95 (sem variação). Piso de 650 preservado com folga de 64,95.
- **Teto desta tarefa (10 gerações): não usado — 0/10.**
