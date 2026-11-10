# GS-003 · Quality Overhaul fase 3 · Feedback 1 do fundador (itens 2, 3, 4 e 7)

Branch `quality-overhaul`, worktree `workspaces/game-dev/qo` (com `git merge master` feito antes). Servidor de teste: **5190**, que continua servindo esta branch. Data: 2026-11-10.

Não mexi no HUD v2 do outro game-dev (`src/ui/hud-v2.ts`, `src/ui/hud.ts`). Nos arquivos compartilhados (`main.ts`, `view.ts`, `style.css`), as mudanças são pontuais. Para a troca pela faixa da equipe, usei listeners delegados no `#hud`, sem editar o `hud.ts`.

## Links na 5190

| O quê | URL |
|---|---|
| Tudo junto (floresta v9, encontros, anim v2) | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&anim=v2&encounters=1 |
| Mesmo sem anim v2 (look padrão) | http://127.0.0.1:5190/?map=digimon-forest-01&look=v9&dpr=1&encounters=1 |
| Mapa-múndi a partir do mapa padrão | http://127.0.0.1:5190/ (tecla **M** ou botão "Mapa-múndi" do minimapa) |
| AUTO antigo (só luta, sem explorar) | acrescente `&autoexplorar=0` |
| Capturas sem o criador de Tamer (equipe de exemplo com 4 Digimon) | acrescente `&criador=0&novo=1&seed=7` |

## 1. Mapa-múndi (item 2): reproduzido e corrigido

Reproduzi no Chromium headless na 5190 (M, botão do minimapa, viajar e voltar, em 1920×1080 e 1366×768, com `?dpr=1` e sem):

| # | Bug [E] | Causa | Correção |
|---|---|---|---|
| 1 | Um troféu amarelo gigante cobria o mapa inteiro | A regra `.worldmap svg {position:absolute; inset:0; width/height:100%}`, feita para o SVG das rotas, também pegava o ícone SVG do botão "Arena" | Seletor restrito a `.wm-canvas > svg`, e o SVG das rotas com `pointer-events:none` |
| 2 | "Viajar" da Vila e dos outros nós não respondia ao clique | O troféu gigante (bug 1) ficava por cima e interceptava o clique; o Playwright acusou "`.wm-arena svg` intercepts pointer events" | Resolvido pelo 1 |
| 3 | Botão "Arena" branco e vazio, sem estilo | Não havia CSS para `.wm-arena` | Estilo próprio (pílula escura, borda, ícone de 14 px) |
| 4 | Ir para a Vila a partir da floresta v9 (`digimon-forest-01`) e voltar levava ao **forest-proof**, outro mapa | `mapOfRegion()` pega o primeiro mapa da região | `travelTarget(região, últimoMapaPorRegião)`: volta ao último mapa visitado na região |
| 5 | Nós com texto longo ("Bloqueada: Tamer Nv.40 e…") esticavam e encostavam nos vizinhos | Nó sem largura máxima | `max-width:172px` e o nó "você está aqui" por cima |

Evidência: `fb1_mapa_mundi_{floresta,na_vila,volta}[_1366].png`. No `fb1_report_mapa.json`, o ícone tem 14×14 px e `backTo = digimon-forest-01` nas duas resoluções. Com `?dpr=1` não encontrei bug de escala próprio do mapa-múndi: ele é DOM e não depende da escala do canvas.

## 2. Pose parada com os pés juntos (item 3)

**Causa [E]:** o `idle` dos rips e dos Tamers aponta para `walk_<dir>_01`, que é um quadro de **passada**. O ciclo do walk é `00, 01, 00, 02`, e o `00` é o neutro. Conferi nos PNGs do Guilmon (CREATURE-0003) e do TAMER-0003.

**Correção:** `src/render/standpose.ts` escolhe, por direção desenhada, o quadro de repouso:
1. o quadro que se repete no ciclo do walk (A,B,A,C → A);
2. senão, o `idle`, se ele for desenhado de verdade (fora do walk);
3. senão, o quadro do walk com a menor abertura das pernas, medida na faixa inferior de 20% do bbox opaco.

A view troca o quadro de passada do idle por esse quadro sempre que a entidade está parada, no look padrão (`frameFor` v1) e no `anim=v2` (`ctlFrame`). Idle de vários quadros (respiração) e idle desenhado ficam como estão. `view.standPoseOff = true` desliga a troca, para as capturas "antes".

Evidência: `fb1_parado_comparacao.png` (4 direções × v1/v2 × antes/depois, ampliado 3×) e os recortes `fb1_parado_*`. O teste "Tamers e Digimon do jogo" confirma o quadro neutro em todos os manifests com walk por direção (mais de 10 direções remapeadas).

## 3. AUTO explorador (item 4)

`src/sim/explore.ts` roda **dentro da sim** (determinístico, `w.rng`) e só decide o `dest` do Tamer:

- **Destino:** selvagem visível a até 9 tiles, de nível ≤ ao da parceira e com a parceira acima de 60% do PV. Senão, um tile de **grama alta** (área de encontro da `EncounterAuthority`); já na grama, prefere destinos próximos para continuar pisando nela. Sem encontros (`encounters` desligado), vale qualquer ponto livre até 14 tiles.
- **Caminho:** BFS de 8 vizinhos na colisão, sem cortar quina. Destinos inalcançáveis ficam de fora; se o Tamer travar no caminho, troca de destino.
- **Luta:** com a parceira em combate ou um selvagem saltando da grama, o Tamer para. O AUTO da parceira engaja como antes.
- **Cura:** PV < 35% → vai ao ponto de cura (`heal_point`; a cura é a interação de sempre ao chegar perto). Sem ponto alcançável, descansa parado e regenera. Volta a explorar com 95%.
- **Fuga:** PV < 32% no meio de um encontro → foge uma vez desse encontro (mesma regra do botão Fugir) e vai se curar. Isso corrigiu a sequência "revive → apanha → cai" que apareceu na 1ª gravação.
- **Evita:** a arena do chefe (com margem de 1 tile) e as saídas do mapa (a saída não é atravessada; a margem de 3 tiles não vira destino). Assim o AUTO nunca troca de mapa sozinho.
- **Regras preservadas:** cada encontro continua sendo a `EncounterAuthority` testando o tile pisado (carência, chance, teto). A recompensa continua saindo uma vez por encontro (`settle` idempotente).
- **Controle do jogador:** WASD ou clique pausa a exploração. Ela volta depois de 6 s sem input, com o AUTO ainda ligado. Desligar o AUTO para o explorador na hora. `?autoexplorar=0` volta ao AUTO antigo.
- **Log do HUD:** "AUTO: explorando a grama alta", "indo atrás de um Digimon selvagem", "PV baixo, indo ao ponto de cura", "você assumiu o controle…".

Passeio automatizado [E]:
- **Teste de unidade:** 2400 ticks (4 min de jogo) na floresta v9, seed 7. O Tamer anda mais de 4 tiles, há ≥ 1 encontro aleatório e ≥ 1 recompensa, a recompensa é ≤ o número de derrotados, ele não entra na arena e o passeio é determinístico.
- **Navegador:** com o botão AUTO do HUD, o 1º encontro natural na grama saiu aos **31 s** (`fb1_report_auto.json`; na rodada anterior, 62 s) e a luta seguiu (`fb1_auto_*`).

## 4. Troca de Digimon (item 7)

- **Sim:** intent `swap_partner`. A entidade da parceira (mesmo id) vira a espécie da equipe ou do Box. Posição, alvo e encontro são mantidos, então a troca **funciona em combate** e a recompensa continua indo uma vez para a parceira do encontro. O evento `partner_swap` devolve quem saiu com o estado completo (XP, golpes, AUTO e % de PV), que volta para o lugar de onde veio a nova. A recusa vem com motivo.
- **Recarga:** 5 s depois de trocar em combate, 1,5 s fora de combate. A nova parceira espera 0,8 s antes do 1º golpe.
- **Recusas:** durante a recarga, a derrota ou a evolução, ou com a mesma espécie e nível já ativa.
- **Mapa:** quem sai vira silhueta branca e **recua até o Tamer** por um feixe de pontos de luz, com anel ciano, e some. Quem entra aparece como silhueta que se revela, com anel dourado no chão e o **estouro de impacto do elemento da espécie** (`fx.drawImpact`, o mesmo FX dos golpes). Duração de 0,94 s (`presenter.swapFrame`).
- **Controles:** **Shift+1–5** pela posição na faixa da equipe (1 = o ativo); **clique no retrato** de um membro da equipe na faixa do HUD (o ativo continua abrindo a Equipe & Box); **duplo clique** em qualquer card da Equipe & Box, incluindo o **Box**. Durante a recarga, os outros retratos da faixa ficam acinzentados. O log mostra "Tokomon, volte! Vai, Tsunomon! (troca em combate)" ou "Não dá: troca em recarga (5 s)".

Evidência: `fb1_troca_fora_{1_recuo,2_recuo_fim,3_entrada,4_pronto}.png`, `fb1_troca_combate_{recuo,entrada,recarga}.png` e `fb1_report_troca.json`. Antes e depois da troca em combate, o alvo é `wild-3` e o encontro `enc-1`, com `swapCd` 42 e a segunda troca recusada.

## Vídeo

`fb1_feedback1.webm` (1280×720, VP8, 58 s, 11 MB), sem o carregamento: anda e para (pés juntos) → mapa-múndi com M, viagem à Vila e volta → troca fora de combate (Shift+2) → AUTO ligado pelo botão: explora a grama → encontro natural (salto) → troca em combate (Shift+3) → troca recusada na recarga. Os marcos estão em `fb1_report_video.json`.

## Verificação [E]

- `npm test`: **41 arquivos, 393 testes verdes**. 17 deles são novos, em `tests/feedback1.test.ts`.
- `npm run build`: ok.
- `map:validate`: 6/6 PASS, mais o arquivo do v9 PASS.
- `node scripts/encounters/sim.mjs --check`: ok (19 entradas, 7 áreas).
- As capturas e o vídeo são reproduzíveis com `node scripts/fb1-capture.mjs [mapa|parado|auto|troca|video|all]`, usando as mesmas variáveis de ambiente do `qo3-capture.mjs`.

## Limitações

- **Atalho 1–5:** as teclas 1–4 já usam os golpes, então a troca ficou em **Shift+1–5**. Para trocar pelo número puro, alguém precisa decidir em que teclas ficam os golpes.
- **Botão "Trocar" na Equipe & Box:** o Box troca por **duplo clique** no card. Um botão "Trocar" visível na ficha exigiria editar o `hud.ts`, que fica com o outro game-dev; dá para colocar quando o HUD v2 fechar.
- **Mesmo id na troca:** a troca reaproveita a entidade da parceira, que é o mais simples para o combate e a recompensa. A sim não tem um segundo Digimon real no mapa; o recuo e a entrada são só apresentação.
- **Ponto de cura no forest-proof:** o explorador vai ao `heal_point` do Map Factory. No forest-proof, que não tem esse ponto, ele descansa parado até regenerar (1% do PV por tick fora de combate).
- **AUTO da parceira:** o explorador caça só selvagens de nível ≤ ao da parceira, mas o AUTO da parceira continua aceitando até +2 níveis quando o selvagem chega perto. Uma parceira fraca ainda pode cair; a fuga com PV < 32% reduz isso.
- **Fallback por bbox:** com os assets atuais ele não é acionado, porque todo walk por direção tem o quadro neutro repetido. Em diagonais, a medida pode escolher um quadro com as pernas cruzadas (o TAMER-0003 SE/SW `_01` mede mais estreito que o `_00`).
- **Tempo do 1º encontro:** depende da carência, da chance da tabela e de quantos pontos visíveis houver perto. Medi 31 s e 62 s em duas rodadas.
- **Vídeo:** são 58 s em um corte contínuo. O ffmpeg do Playwright não tem `select`/`concat`, então não consegui tirar a caminhada na grama do meio.
- **Escala com `?dpr=1`:** além do layout, não achei nada específico do mapa-múndi. A Vila (`vila-v5`) continua com props grandes em relação ao Tamer; isso é arte, fora do escopo.
