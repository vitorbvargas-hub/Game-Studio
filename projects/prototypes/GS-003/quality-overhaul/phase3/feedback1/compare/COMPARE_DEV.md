# GS-003 · `?team=compare` — Guilmon 64 px (PixelLab) × Gabumon 64 px (à mão)

Pedido do fundador: jogar com os dois Digimon 64 px na equipe e trocar entre eles para ver a diferença entre PixelLab e arte à mão. Branch `quality-overhaul`, depois do `git merge master`, que trouxe o Gabumon do commit 88fde9e. Data: 2026-11-10.

**Link (5190):** http://127.0.0.1:5190/?team=compare&map=digimon-forest-01&look=v9&dpr=1&anim=v2

Sem `&anim=v2`, o look padrão também funciona. Shift+1/2 ou um clique no retrato da equipe troca o Digimon.

## O que entrou

| Item | Como |
|---|---|
| **Guilmon PixelLab** → `assets/GAME-ASSETS/01-creatures/CREATURE-0017-guilmon-pl64/` (0017 é o próximo id livre na faixa 00NN; 0004 já existe) | `scripts/build-guilmon-pl64.mjs` copia e renomeia os PNGs **sem alterar nenhum pixel**. Origem: `scale-proof-v3-reanim/fixed`, com start frame e paleta travada (melhor versão, REANIM_REPORT.md). **idle S**: 5 quadros (a âncora parada mais a respiração). **walk S**: ciclo dos 8 quadros gerados; a âncora parada fica de fora do ciclo. **idle SW**: só a rotação parada de `scale-proof-v3-fix/pipeline-m1-fixed/rotations/south-west.png`, porque não existe walk SW em nenhuma prova. O `creature.json` segue o formato do jogo: 64×64, pivô no pé da âncora (x 33, y 47), corpo de 32 px, `mapScale` 1, `anatomy` biped, hitbox medida. Também há `license.json` e o bbox de cada quadro em `source/metrics.json`. |
| **Gabumon à mão** `CREATURE-0119-gabumon-hand64` (game-art) | Usado como veio. Mudei só duas coisas no `creature.json`, ambas aditivas: `"fallback": "nearest"` nas duas direções e `"anatomy": "biped"`, que um teste exige de toda criatura `CREATURE-00/01*`. |
| **Modo `?team=compare`** (`src/save/compare.ts`) | **Save:** slot separado (`gs003.save.team-compare`), no mesmo padrão do `?partner=`; o save normal nunca é escrito. **Equipe:** o Guilmon começa ativo, nível 8 (entrada do estágio Criança), com Auto-evoluir desligado; o Gabumon fica no slot 2. **Troca:** é a troca de Digimon do feedback 1 (Shift+1–2, clique no retrato, duplo clique na Equipe & Box), e funciona também em combate, com recarga. Um selo "COMPARAÇÃO · Guilmon PixelLab × Gabumon à mão" fica no HUD. |
| **Espécies na sim** | Continuam sendo as do jogo: Guilmon `CREATURE-0003` e Gabumon `CREATURE-0009`, com os mesmos stats, golpes e elementos. A diferença é **só de arte**. A view troca o visual da **parceira local**, e os retratos da equipe e do painel do Digimon, pelo da criatura de comparação (`COMPARE_VISUALS`). Os selvagens Guilmon/Gabumon do mapa seguem com a arte rip. |
| **Direções que faltam** | `fallback: "nearest"` no `creature.json` (`resolveFacing` → `nearestFacing` em `src/render/anim.ts`): usa a direção desenhada de menor distância angular, contando também o espelho de cada uma; em empate, prefere a versão sem espelho. **Gabumon (S, SW):** W → SW; E e SE → SW espelhado; N e NW → SW; NE → SW espelhado. **Guilmon walk (só S):** todas as direções → S. **Guilmon idle (S, SW):** parado igual ao Gabumon. As criaturas do roster (sem o campo) não mudam; há teste para isso. |
| **Mesma escala** | Os dois têm canvas de 64 px, corpo de 32–33 px e `mapScale` 1. Com `?dpr=1` (escala unificada) ficam na mesma densidade de pixel do Tamer e dos rips. Os pés ficam na mesma linha: pivô y 47 (Guilmon) e 49 (Gabumon), cada um no pé do próprio desenho. |
| **Pés juntos parados** | Os dois têm idle desenhado de vários quadros (respiração), fora do ciclo do walk. Por isso a pose parada é sempre o idle, e o `standpose` do feedback 1 não precisa remapear nada (há teste). |
| Correção de carregamento | Criaturas só com PNG por quadro (sem folha) carregavam apenas o **primeiro** quadro no boot. Agora `main.ts` carrega todos (`imageUrlsOf`). |

## Capturas (`phase3/feedback1/compare/`)

- `cmp_lado_a_lado_{v2,v1}_tela.png` (1920×1080) e os recortes `cmp_lado_a_lado_{v2,v1}[_x3].png`: Guilmon PixelLab (ativo) e Gabumon à mão lado a lado no mapa, na mesma escala, parados. Para as capturas, o Digimon que não está ativo aparece como **modelo parado**: entidade `npc` `compare-show`, via `__gs003.compareShowcase(espécie, tiles)`. A sim não move nem ataca esse modelo.
- `cmp_troca_sequencia.png` e `cmp_troca_{0..4}*.png`: troca com Shift+2 (Guilmon recua branco até o Tamer, Gabumon entra com anel e estouro do elemento). `cmp_troca_5_volta_guilmon_tela.png`: volta clicando no retrato da equipe. O log registra "Guilmon, volte! Vai, Gabumon!" e o inverso (`cmp_report_troca.json`).
- `cmp_compare.webm` (1280×720, 24 s, 4,5 MB): os dois lado a lado → anda com o Guilmon (S, E, W, N) e para → troca → anda com o Gabumon e para → troca de volta pelo retrato → lado a lado de novo. Marcos em `cmp_report_video.json`.
- Para refazer: `node scripts/compare-capture.mjs [lado|troca|video|all]`, com as mesmas variáveis de ambiente do `qo3-capture.mjs`.

## Verificação [E]

- `npm test`: **41 arquivos, 397 testes verdes**. Há 4 testes novos de `?team=compare` em `tests/feedback1.test.ts`: catálogo e escala, fallback de direção, pose parada, e equipe/troca/modelo.
  - Duas rodadas tiveram falhas, todas **timeout de 5 s** sob carga da máquina (load ~9, com outros agentes rodando). Uma delas (4 falhas) rodou em paralelo com minhas capturas e incluía a falha de anatomia, já corrigida. A rodada seguinte, sem carga, ficou 397/397. O R2 já registrava esse flaky.
- `npm run build`: ok.
- `map:validate`: 6/6, mais o v9 PASS.
- `sim.mjs --check`: ok.

## Limitações

- **Guilmon PixelLab:** só a direção S tem animação. O walk em W, E e N usa os quadros S (anda "de frente" para os lados). Parado de lado, usa a rotação SW, que é estática, sem respiração. Faltam gerações no PixelLab para as outras direções (REANIM_REPORT.md: saldo esgotado), e não comprei nada.
- **Gabumon à mão:** N e NW usam o SW (não existe costas desenhadas).
- **Sem animação de ataque ou dano** nos dois: o golpe usa o efeito procedural (lunge/knockback) sobre o idle. Os tempos do golpe vêm do manifest de comparação, porque o presenter usa o mesmo catálogo trocado.
- **Arte só na parceira local:** os selvagens Guilmon/Gabumon continuam rip. No `?team=compare`, o Digivice também mostra o retrato de comparação para essas duas espécies.
- **Pivô do Guilmon:** fica no pé da âncora (y 47). Alguns quadros gerados variam ±1–2 px (o idle 02 sobe 2 px), como mede o REANIM_REPORT. Isso aparece como um leve "pulo" do idle; não mexi nos pixels.
- **O "lado a lado" é um modelo parado só de captura** (`compareShowcase`). No jogo, só um Digimon fica ativo por vez.
