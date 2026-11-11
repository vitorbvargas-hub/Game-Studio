# P2 — padrões que faltavam + as 4 abas bloqueadas do Digivice

- **Autor:** game-dev · **Data:** 2026-11-11 · **Branch:** `quality-overhaul` (worktree `workspaces/game-dev/qo`)
- **Gatilho:** o fundador abriu `/?map=digimon-forest-01` e disse que "nada mudou"; pedido de 10/11: "Termine os itens do painel, as abas guilds e etc".
- **Commits:** `303cfee` (padrões), `bd2d0b0` (abas), e o commit das capturas e deste documento.

## 1. O que virou padrão (URL sem flags)

| Entrega | Antes | Agora | Opt-out |
|---|---|---|---|
| Controlador de animação v2 (idle de pés juntos, 11 estados) | `?anim=v2` | padrão | `?anim=v1` |
| Encontros GS-012 (grama alta, 5 pontos visíveis, selvagens da tabela) | `?encounters=1` | padrão nos mapas com tabela (`digimon-forest-01`) | `?encounters=0` (`?encdebug=1` sempre liga) |

`src/save/flags.ts` + `tests/flags.test.ts`. Já eram padrão (eb1f016): HUD v2/Digivice, look v9, Digimon oficiais, dpr=1, AUTO explorador (`?autoexplorar=0` desliga).
Outras flags que sobram são de comparação/teste, não entregas: `size=table`, `v12night=swap`, `demo`, `partner`, `team=compare`, `monscale`, `zoom`, `charh`, `time`, `seed`.

**[E] Prova na URL padrão** (`scripts/p2-probe.mjs`, 2026-11-11): `animV2=true`, 5 selvagens visíveis, AUTO ligado pelo botão → o Tamer andou de (408,584) para (667,517) em 8 s com `autoExplore=true`, Shift+2 trocou a parceira (CREATURE-0003 → CREATURE-0011), 0 erros de página.

## 2. Abas (PANELS_SPEC §1–§4), kit circuit-kit-v1

Código: `src/ui/digivice-panels.ts` (lógica pura + HTML), `src/ui/digivice.ts` (controlador), `src/style.css` (bloco "Digivice — Guilda, Correio…", tudo escopado em `.hud-v2`). Estado na chave separada `gs003…digivice` do save. Nenhum atalho do hub tem mais cadeado.

- **Guilda (§1):** fundar (nome ≤ 18, 1 de 12 emblemas) ou entrar numa das 4 guildas-bot da região, todas com o selo **"simulada — sem servidor ainda"** na lista e depois de entrar. Gate: Tamer Nv.5 (botões desabilitados com o motivo). Membros: só você (sem tela de "promover"). Rota atual: dominante nos últimos 7 dias + barra sua × 2ª colocada. Seus pontos = XP do evento `reward` já emitido; pontos das bots = relógio local determinístico. Sair pede confirmação. A dominante só aparece no painel.
- **Correio (§2):** carta de boas-vindas 1× por save (1 Potinho de Energia); marco/história completo e não coletado há 48 h vira carta; janela do Chefe que fechou com o jogo fechado vira carta; níveis do Passe não coletados no fim da temporada viram carta. Limite 20: expira a mais antiga sem anexo pendente, nunca uma com recompensa. Não-lido = `read === false`, persiste. **Coletar** usa o caminho das Missões: o clique de coleta das Missões virou `claimQuest()`/`grantReward()` no `main.ts`, e o Correio chama os mesmos.
- **Passe de Temporada (§3):** 14 dias ancorados no 1º login, 20 níveis, 40 Pontos de Passe por nível [H]. Pontos = XP da missão diária coletada (1:1) + 30 por participação no Chefe Mundial [H]. Recompensas: bits (pelo `add_bits`) e Cristal Digital (fica no save, sem loja). Níveis 10/20 são cosméticos marcados "em produção" e não podem ser coletados. **Sem compra, preço ou moeda real** (teste negativo no código e no DOM).
- **Fonte dos Desejos (§4):** +1% por vitória confirmada e +1% a cada 10 min com a aba visível, teto 100, sem decaimento. Em 100%, "Fazer um pedido" zera a Fonte e abre 15 min de **varredura ×1,5 por vitória** (25% → 38%). O jogo não tem a fórmula `modDados` do GDD §6.1; o equivalente real é o `scanPerDefeat`, então ele recebe o multiplicador pelo intent novo `set_scan_mult` (não é evento novo). Sem 2º pedido em paralelo. A explicação fica sempre visível no painel. Com `?encdebug=1` o painel mostra "varredura por vitória 38% (Fonte dos Desejos ×1,5)".
- **Conquistas:** a categoria Social, que estava bloqueada esperando Guilda e Correio, ganhou `guild_join` e `mail_read_3`. O hub ganhou indicadores para carta não lida, Fonte pronta e nível do Passe a coletar.

Testes: `tests/digivice-panels.test.ts` (18, critérios de aceite de cada seção), `tests/scan-mult.test.ts`, `tests/digivice.test.ts` ajustado. **476 testes, tsc, build, map:validate 6/6, `encounters/sim.mjs --check` ok.**

## 3. Capturas (1920×1080, URL padrão, dia)

`node scripts/p2-capture.mjs` → `p2_*.png` + `p2_capture.json` (estado de cada tela: animV2, encontros, 0 cadeados, painel aberto, scanMult). Também copiadas para `workspaces/game-studio/review/`.
Cada URL leva só `criador=0&novo=1&seed=7&auto=0&time=day`, para ser reproduzível. **Estados injetados pelo script** (rotulados no JSON): `p2_passe_progresso` (150 pontos = 3 diárias), `p2_fonte_pronta` (100%) e o encontro (forçado ao lado do Tamer, que foi movido para a clareira).
Arquivos: `p2_digivice_aberto`, `p2_guilda`, `p2_guilda_fundada`, `p2_correio`, `p2_passe`, `p2_passe_progresso`, `p2_fonte`, `p2_fonte_pronta`, `p2_fonte_ativa`, `p2_encontro_selvagem`, `p2_pes_juntos`, `p2_pes_juntos_zoom4x` (recorte 480×270 ampliado 4×).

## Limitações

- **A porta 5190 passou a servir o checkout principal (`master`), não este worktree** (reiniciada por outro processo às 07:17). Quem abrir a 5190 agora não vê nada desta branch. Eu não derrubei esse servidor: as capturas foram feitas num vite próprio do worktree na 5191, encerrado depois. O coordenador precisa decidir qual checkout a 5190 deve servir.
- Os números [H] (nível 5, 20 níveis × 40 pontos, +30 do Chefe, +1%/vitória, ×1,5, 15 min, recompensas do Passe) são a primeira proposta da spec, não foram calibrados jogando. Os nomes das guildas-bot e "Cristal Digital" não foram validados com o fundador.
- Hoje só a diária "Derrote N selvagens" tem XP no `quests.json`. Por isso o Passe avança devagar: ~50 pontos por dia mais o Chefe.
- Os cosméticos do Passe (níveis 10 e 20) não têm arte e ficam "em produção". Não há loja para gastar Cristal.
- Os emblemas da Guilda reaproveitam ícones do `icons.ts` com cor; não há arte própria. O retrato da guilda-bot é um desses emblemas.
- Pose parada: o quadro de pés juntos vem do `standpose.ts` (o quadro neutro do walk do DS). No zoom, o Tamer em diagonal ainda mostra um pé um pouco à frente, que é o desenho original do sprite.
