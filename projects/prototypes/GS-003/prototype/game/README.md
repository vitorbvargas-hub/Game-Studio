# GS-003 — protótipo (motor + content packs)

Idle de monstros no navegador: batalha automática 3v3, pausas de decisão, XP/nível,
evolução ramificada, viagem entre áreas, save versionado e progresso offline.

**Motor e conteúdo são separados.** Todo monstro, nome, evolução, texto de interface, paleta,
sprite e número de balanceamento fica em um *content pack* (`packs/<id>/`). O código em `src/`
não contém conteúdo. Trocar, adicionar ou remover um pacote não exige mexer em código.

Fan game **não oficial e sem fins comerciais** (ADR-007). Sem monetização, anúncios ou telemetria.
Uso local; publicação só com aprovação do fundador.

Arquitetura e decisões: [`TECHNICAL_SPEC.md`](./TECHNICAL_SPEC.md).

## Requisitos
- Node.js ≥ 20 (testado com v24.19.0)

## Comandos

```bash
npm install          # neste host: npm install --offline (registro npm bloqueado; deps vêm do cache)
npm run dev          # servidor local em http://127.0.0.1:5173/
npm test             # testes (vitest): motor, todos os packs, guarda sem rede, smoke test do shell
npm run build        # typecheck (tsc) + build de produção em dist/
npm run preview      # serve dist/ localmente
```

URLs no `npm run dev`:
- `http://127.0.0.1:5173/`: pacote padrão (`digimon-fan`)
- `http://127.0.0.1:5173/?pack=original-b`: mesmo motor com os monstros originais do GDD
- `http://127.0.0.1:5173/?pack=original-a`: stub da Linha A

O seletor "Pacote" no HUD troca entre os pacotes descobertos. Em dev, `gs.state` no console mostra o estado.

## Content packs

| Pacote | O que é |
|---|---|
| `packs/digimon-fan/` | Linha B com Digimon oficiais (padrão). Veja `packs/digimon-fan/README.md` |
| `packs/original-b/` | Linha B com monstros originais do GDD (Pixelume, Ferrolim, Aquabit…) |
| `packs/original-a/` | stub da Linha A (criaturas originais placeholder) |

Arquivos de um pacote: `pack.json` (manifesto), `strings.json` (textos), `theme.json`,
`balance.json`, `creatures.json`, `skills.json`, `enemies.json`, `areas.json`, `dungeons.json`
e, opcionalmente, `sprites/*.png`.

- **Novo pacote:** copie uma pasta, troque o `id` em `pack.json` e edite os dados. `npm test` valida e roda o pacote no motor automaticamente.
- **Fan pack** (`"kind": "fan"`): exige `"nonCommercial": true` e `"disclaimer"`, que aparece sempre no rodapé.
- **Sprites:** coloque o PNG em `packs/<id>/sprites/` e use `"sprite": "sprites/x.png"` na criatura ou inimigo. Para animação idle em loop, passe a lista de frames: `"sprite": ["sprites/x_idle_01.png", "sprites/x_idle_02.png"]` (opcional `"spriteFrameMs"`, padrão 500 ms). Sprites são desenhados no tamanho nativo (até 48×48 cabem sem sobreposição), ancorados pelos pés no slot. Sem sprite, o jogo mostra um bloco colorido. Nunca use arquivos extraídos de jogos, ROMs ou sites oficiais.
- **Versão com monstros originais:** remova `packs/*-fan/` e marque um pacote original com `"default": true`. O build não leva nenhum conteúdo de terceiros.

## Como jogar
1. Escolha o parceiro inicial (se o pacote oferecer `starterOptions`). O time caça sozinho na área inicial.
   - **Varredura:** a cada poucas vitórias aparecem 2 grupos selvagens; escolha qual enfrentar (sem escolha, o 1º entra em alguns segundos). Cada encontro soma % de Varredura; em 100%, a próxima vitória recruta a espécie para o time (até 3).
   - **Treino:** cada level-up dá 1 Ponto de Treino; aloque em ATK, DEF ou VEL no card da criatura.
2. Quando uma área nova libera, use **Ir para** para viajar até ela.
3. Depois de N vitórias numa área com chefe, **Desafiar chefe** fica ativo. A luta pausa em limiares de HP para você escolher uma habilidade de Sincronia.
4. Ao atingir o nível de evolução, escolha o ramo (no Digimon pack: modo ofensivo ou defensivo do Adulto).
5. Se ficar ≥ 1 min fora, aparece o relatório offline (o teto vem do pacote).
6. **Vel.** x4/x16 acelera a simulação para teste. **Novo jogo** apaga o save do pacote atual.

## Estrutura
```
packs/        content packs (descobertos automaticamente)
src/sim/      simulação determinística (sem DOM): regras do jogo, validação de pacote, save, offline
src/render/   cena de batalha em Canvas 2D 320×180, escala inteira, sprites do pacote ou placeholder
src/ui/       HUD/menus em DOM (todo texto vem de strings.json)
src/packs.ts  descoberta de pacotes
src/main.ts   loop rAF com tick fixo, autosave, offline
tests/        vitest
docs/screens/ capturas do renderer real (line-b_* = digimon-fan; original-b_wave; line-a_boss = original-a)
scripts/      capture-screens.ts: regenera docs/screens/ (instruções no topo do arquivo)
```
