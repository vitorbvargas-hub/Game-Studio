# QA independente do build isolado Hawkmon v1b (Comando 14.3, porta 5197)

**Data:** 2026-11-15, 19:30–20:10 · **Autor:** game-qa (Opus 5.5) · **Status:** QA concluído, build **não homologado** para produção.
Fan game não oficial e não licenciado; uso local, nada publicado. Hawkmon e Agumon são espécies oficiais de Digimon (Bandai/Toei); os sprites são adaptação do estúdio.

Legenda: **[E]** executado nesta auditoria · **[L]** relatório anterior não reverificado · **[H]** hipótese ou leitura minha · **NÃO VALIDADO** com motivo.

## 0. Build testado [E]

| Item | Valor |
|---|---|
| Link | http://127.0.0.1:5197/?novo=1 (serviço `gs003-lab-hawkmon-5197` ativo; religado pelo game-studio às 19:30 após o reboot, mesmo dist) |
| Worktree / branch / commit | `workspaces/game-dev/lab-hawkmon`, `lab/hawkmon-v1b`, `34327c7`; `git status`: só `node_modules` (symlink, não versionado) |
| Dist | `dist-lab-hawkmon/index.html` de 2026-11-15 07:07 (não recompilado) |
| Ambiente | Chromium headless shell 1243, sem GPU, 1280×720, rAF ~60 Hz. **Medidas de tempo são indicativas.** |
| Observação de ambiente | O reboot apagou `/tmp/chromelibs` (libs do Chromium). Reextraí `libnss3`, `libnspr4` e `libasound2t64` de `.deb` locais (só leitura, para `/tmp`); nada do jogo foi tocado |

Não havia QA parcial anterior desta tarefa (`QA_BUILD_HAWKMON_INDEPENDENTE.md` não existia).

## 1. Resumo

1. **Cadência (prioridade 1). Recomendo uma terceira via: ~50 ms por quadro** (5 px andados por quadro; no build, `&hawkms=50`). O padrão do build (2 px, ~17–20 ms) **não serve** como andar: cada quadro dura 1 atualização de tela, o tempo oscila 17/33 ms e as pernas viram um tremor de ~11 passos por segundo. Os 73 ms são a alternativa coerente com o Agumon (escorregam na **mesma proporção** que ele, 73%), mas o passo fica arrastado para uma ave pequena. Detalhes no §2.
2. **Nada impede a revisão do ChatGPT. O build está pronto para o Vitor**, desde que ele compare três links: padrão, `&hawkms=50` e `&hawkms=73`. Mudar o padrão para 50 é decisão do fundador ou do ChatGPT, e o game-dev aplica (eu não altero código).
3. **0 erros de console e 0 falhas de rede** em 10 sessões (4 medições de walk, 1 rota de profundidade, 5 modos de URL) [E].
4. **Isolamento intacto** [E]: 5191, 5196 e 5197 ativos; dists e worktrees da 5191 e da 5196 sem mudança; Database com md5 `8b71f53e…`, igual ao do game-dev.
5. **Notas (régua do C12 §5), build como entregue (2 px): média 8,06.** Meta ≥ 8 na média atingida, mas fluidez (7,0), legibilidade (7,75) e transições (7,75) ficam abaixo de 8. **Com 50 ms [H], a média estimada sobe para 8,22**, e só as transições continuam abaixo de 8. GS-010: não.

## 2. Prioridade 1: cadência da walk

### 2.1 O que limita a escolha [E]
- Nos PNG do pacote (`qa_scripts/c143/pes.mjs`), o pé de apoio do Hawkmon E recua **2 px por quadro** no desenho (linha 49: 32 → 30 → 28 → 26). O ciclo tem 8 quadros, que somam 2 passos.
- O Agumon F7v2 recua **3 px por quadro** no desenho (linha 49: 32–35 → 29 → 26 → 23). A walk E dele repete as poses q0–q3 em q4–q7, ou seja, 1 passo a cada 4 quadros.
- **No jogo**, o Agumon troca de quadro a cada **11 px** (mediana de 116,7 ms a 88 px/s) [E]. O pé de apoio dele **já escorrega 8 px por quadro, 73% da velocidade**. É a convenção que o F7v2 aprovou.
- A parceira anda a **88–92 px/s** [E]. Para o pé do Hawkmon ficar travado, o quadro precisa durar 2000/91 ≈ 22 ms, o que dá menos de 2 atualizações de tela a 60 Hz.

### 2.2 As opções medidas no jogo [E]
Arquivos: `qa_independente/walk_analise_qa_{padrao,ms40,ms50,ms73}.json`; roteiro `workspaces/game-dev/tools/h143/walk.mjs` + `analisa.mjs`, executados por mim com `QA_OUT` próprio.

| Hawkmon | ms por quadro no jogo, normal (mediana, faixa) | Quadros de tela por quadro | Ciclo / passos por s | Escorrega por quadro (% da velocidade) | q5–q6 na tela (cada) | Lento (Shift) | Pulos |
|---|---|---|---|---|---|---|---|
| **2 px (padrão do build)** | 16,7 (16,5–50); varia 17/33 | ~1 | ~165 ms / ~11–12 | 0 (0%) | 17 ou 33 ms | 50 ms | 0 |
| 4 px (`hawkms=40`) | 33,4 (33–83); varia 33/50 | ~2–3 | ~350 ms / ~5,7 | 2 px (50%) | 33 ou 50 ms | 100 ms | 0 |
| **5 px (`hawkms=50`)** | **50 (33,5–100), estável** | **3** | **~440 ms / ~4,5** | **3 px (60%)** | **50 ms** | 117–133 ms | 0 |
| 7,3 px (`hawkms=73`) | 66,7 (66,6–116,6); varia 67/83 | 4–5 | ~640 ms / ~3,1 | 5,3 px (73%) | 67 ou 83 ms | 183 ms | 0 |
| Agumon F7v2 (referência) | 116,7 | ~7 | ~970 ms / ~2,1 | 8 px (73%) | — | — | 0 |

**Notas sobre a tabela:**
- O motor usa **passo fixo** (o quadro troca a cada N px andados). Por isso o tempo de quadro cai quando a parceira corre para alcançar o Tamer (até 160 px/s, segundo o game-dev). Com 2 px, isso dá 12,5 ms por quadro, menos de um rAF: a 160 px/s, **pular quadro é inevitável**, embora não tenha ocorrido nas minhas rodadas. Com 5 px, o quadro dura ~31 ms e não pula.
- O tempo de 2 px **oscila entre 1 e 2 rAF** (q5–q6: 17, 17, 33, 17…) [E]. Em 120/144 Hz o resultado muda: **NÃO VALIDADO** (sem monitor desse tipo).

### 2.3 Comparação visual lado a lado
- **Arquivos:** `qa_independente/cadencias_E.gif` (3×), `cadencias_E_2x.gif` e `cadencias_E_folha.png`; roteiro `workspaces/game-qa/qa_scripts/c143/cadencias.mjs`.
- **O que mostram:** as cinco faixas (Hawkmon 2, 4, 5 e 7,3 px; Agumon 11 px), andando a 91 px/s sobre o mesmo chão, com régua fixa a cada 4 px.
- **Como foram feitos:** desenhei os PNG reais, sem alterar nenhum pixel, em posição inteira, com a regra de passo fixo do motor. **É uma reconstrução**, com passo de 20 ms, e não um screencast.

### 2.4 Leitura
Não há como "assistir" o movimento num ambiente sem tela. A leitura abaixo [H] vem das folhas quadro a quadro, das medições e da regra de tempo de pixel art. **Quem decide olhando os GIFs e o jogo são o ChatGPT e o Vitor.**

- **2 px / ~20 ms: não lê como ave andando ao lado do Agumon.**
  - Cada pose fica 1 rAF, às vezes 2. As 8 poses passam em ~165 ms, então o olho não fixa nenhuma. O que se vê é a parte de baixo do corpo vibrando, um "tremor de pernas", e não passos.
  - Ao lado do Agumon, que dá ~2 passos por segundo, o Hawkmon dá ~11–12: cinco vezes mais rápido, numa criatura do mesmo estágio.
  - O pé travado, que é o mérito técnico dessa opção, **não aparece** nessa velocidade. Ninguém percebe escorregamento quando a pose dura 17 ms.
  - Ainda há a oscilação de 17/33 ms e o risco de pular quadros quando a parceira corre.
- **73 ms: coerente com o Agumon, mas pesada para uma ave.**
  - Escorrega na mesma proporção que o Agumon (73%), então o par fica "na mesma convenção".
  - Com ~3 passos por segundo e o passo desenhado de só 8 px por pé, o Hawkmon parece patinar arrastado. O pé de apoio corre 5 px por quadro debaixo de um corpo pequeno.
  - O pulinho dos q5–q6 fica visível (67–83 ms cada).
- **~50 ms (terceira via, recomendada).**
  - É o primeiro valor em que cada pose fica **3 atualizações de tela estáveis** (no trecho E enquanto a tecla está apertada: 43 de 44 trocas com 50 ms e 1 com 83 ms).
  - Dá ~4,5 passos por segundo: um "trotinho" rápido, que é o ritmo plausível de uma ave pequena e se distingue do passo pesado do Agumon sem destoar dele.
  - Escorrega 3 px por quadro (60%), **menos que o Agumon ao lado (73%)**. Por isso não deve chamar mais atenção que o escorregamento que já foi aceito no F7v2.
  - Não pula quadro nem a 160 px/s.
- **Faixa aceitável [H]: 45–55 ms** (4,5–5,5 px por quadro). Os 40 ms (4 px) já oscilam 33/50 ms, o que deixa a cadência irregular a 60 Hz.

**Passada desenhada mais longa (arte):** não recomendo agora [H].
- O Re-QA v1b (R1 do §5) já mostrou que 3 px por quadro exigiria pés de 9 px com pernas de 4 px, numa passada arrastada.
- Mesmo com 3 px a 50 ms, o pé escorregaria 40%. O ganho visual é pequeno diante de uma arte nova.
- Só vale se, a 50 ms, o escorregamento incomodar o Vitor.

**Causa de fundo [H]:** a parceira anda a ~100 px/s, uma velocidade de "corrida" para um Rookie de pernas curtas. Reduzir a velocidade da parceira resolveria na raiz, mas é regra de jogo (congelada) e decisão do fundador.

## 3. Prioridade 2

### 3.1 Pulinho do pé E/W nos q5–q6 [E/H]
- [E] Tempo na tela de cada quadro: **17–33 ms** no padrão, **50 ms** a 50 ms, **67–83 ms** a 73 ms e **50 ms** no lento com 2 px.
- [H] No padrão, o pulinho é imperceptível porque tudo é imperceptível (§2.4). A 50 ms ele aparece por ~100 ms a cada passada, o mesmo que o game-dev descreveu no lento.
- [H] É um P3: o pé levantado sobe 3 px sobre o de apoio e há o arranque de 6 px (Re-QA R4). Se, a 50 ms, o Vitor ou o ChatGPT acharem que incomoda, a correção é de arte (pé levantado mais curto, curva 3, 4, 4, 3, 2), com 0 gerações.

### 3.2 Transições [L/E]
- [L] `capturas/transicoes_padrao.json` do game-dev: a walk entra e sai no meio do ciclo, e às vezes entra por um quadro de outra direção (`idleanim_E_00 > walk_N_04`), por causa da curva do "seguir". É o mesmo motor do Agumon F7v2 (B5 da 12.2). **P3.**
- [E] Nos meus registros, as entradas e saídas seguem o mesmo padrão (`walk_analise_qa_*.json`, campos `entrada`/`saida`).

### 3.3 Âncora e sombra [E/H]
- [E] 0 quadros pulados e 0 trocas fora de ordem nas 4 variantes. O passo medido bate com o pedido (2,0; 3,9–4,0; 4,7–5,0; 6,8–7,3 px).
- [E] Na rota (`prof_folha.png`), o Hawkmon fica de pé na sombra em todas as 16 paradas, sem tremor de âncora visível entre paradas.
- [H] A sombra é a elipse do motor, mais larga que o Hawkmon visto de frente e de costas (H4 do game-dev, **P3**). Ainda lê como contato com o chão.

### 3.4 Profundidade com árvores e objetos [E/H]
- **Arquivos:** `qa_independente/prof_folha.png` e `prof/NN_*.png` (16 paradas numa rota S, A, W, D por grama alta, árvores, flores e moita; `comparar=0`).
- [E] A ordem pela linha do chão está certa nos casos vistos:
  - o Tamer abaixo do Hawkmon é desenhado por cima (`00_s`, `12_w`);
  - o Hawkmon abaixo do Tamer é desenhado por cima (`13_w`, `14_w`);
  - na grama alta (`05_w`, `06_w`), os pés e o corpo ficam coerentes com os tufos.
- [E] O rótulo "Kaio Nv.12" do Tamer cai sobre o corpo do Hawkmon quando ele está logo atrás do Tamer (`00_s`, `12_w`). É camada de UI, igual para qualquer parceira. **P3**.
- **NÃO VALIDADO:** o Hawkmon passando **atrás de uma copa** de árvore. Nenhuma das minhas 16 paradas nem das 26 do game-dev pegou esse caso. A regra é a mesma do Agumon, mas não reverifiquei.

### 3.5 Console [E]
- **0 erros e 0 falhas de rede** em todas as sessões.
- Único aviso: `Tamers: cores de cabelo idênticas no disco…`, que já vem do lab.
- Modos testados (`prof.json`): padrão, `parceiro=agumon`, `comparar=0`, `parceiro=agumon&comparar=0` e `hawkms=73`, todos com andar e `Tab`.

### 3.6 Isolamento [E]
- `systemctl --user`: 5191, 5196 e 5197 `active running`.
- Dists sem mudança:
  - `dist-lab-a/index.html`: 2026-11-14 09:04;
  - `dist-lab-f7v2/index.html`: 2026-11-14 22:54.
- Worktrees:
  - `lab-f7v2` em `415825a` e `lab-etapa6` em `b4b6cc2`, sem mudanças versionadas. Em `lab-f7v2` e `lab-hawkmon`, o único item não versionado é o `node_modules`, já existente;
  - o jogo principal (`prototype/world`) tem o último commit em 2026-11-13.
- Database: `md5sum database/data/*.json | md5sum` = `8b71f53e42eec53bd184a5b6947dd960`, igual ao valor do game-dev.
- As minhas rodadas usaram `?novo=1` só na 5197 e não gravaram nada no repositório.

### 3.7 Achados novos
| # | Sev. [H] | Achado | Evidência |
|---|---|---|---|
| Q1 | **P2 (decisão)** | Padrão de 2 px lê como tremor, não como andar; recomendação: ~50 ms (5 px) | §2 |
| Q2 | P2 (ferramenta de teste) | **O Agumon de comparação não andou em N/S em 4 de 4 rodadas minhas**: ficou em idle, parado na mesma posição durante todo o trecho `normal:w` e `normal:s`. Na rodada do game-dev ele andou. O Vitor pode não ver a comparação em N/S. Contorno: comparar em E/W ou trocar com `Tab`/`parceiro=agumon` | `walk_analise_qa_*.json` (agumon `normal_N`/`normal_S`: 0 quadros de walk) |
| Q3 | P3 | A faixa roxa do topo não muda depois do `Tab` (continua "parceiro Hawkmon"); o HUD de baixo muda certo | `prof.json` (`faixa` vs `hud`) |
| Q4 | P3 | Rótulo do Tamer sobre o Hawkmon quando ele está logo atrás | `prof/00_s.png`, `12_w.png` |
| Q5 | Informativo | Com `parceiro=agumon`, os níveis seguem o slot, não a espécie (Agumon Nv.8, Hawkmon Nv.20) | `prof.json` |

## 4. Notas (8 critérios do C12 §5, mesma régua do QA E2b; paleta fora, G-1 aberto)

As notas são [H], apoiadas nas medições [E].

| # | Critério | Pacote v1b (E2b) | **Build, como entregue (2 px)** | Build a 50 ms [H, projeção] | Motivo |
|---|---|---:|---:|---:|---|
| 1 | Fidelidade ao Hawkmon | 8,25 | **8,25** | 8,25 | Lê como Hawkmon no mapa, ao lado do Tamer e do Agumon |
| 2 | Qualidade GBA Plus | 8,0 | **8,0** | 8,0 | Mesma arte; entra bem no mapa. Descontos: pé E q5–q6, sombra genérica |
| 3 | Fluidez | 8,0 | **7,0** | 8,0 | 2 px: poses de 1 rAF, oscilação 17/33 ms, ~11 passos/s, risco de pulo ao correr. 50 ms: 3 rAF estáveis, sem pulo |
| 4 | Consistência anatômica | 8,5 | **8,5** | 8,5 | Âncora fixa, 0 pulos, 0 tremor, sombra centrada |
| 5 | Legibilidade no jogo | 7,5 (teto sem mapa) | **7,75** | 8,0 | Agora no mapa: lê bem parado e na profundidade. Andando a 2 px, as pernas não leem; escala (G-2) aberta |
| 6 | Custo e tempo | 8,0 | **8,5** | 8,5 | 0 gerações; build isolado reaproveitando o F7v2, dentro do teto |
| 7 | Transições | 8,25 | **7,75** | 7,75 | No jogo, entrada e saída no meio do ciclo e quadro de outra direção (motor, P3, igual ao Agumon) |
| 8 | Ausência de regressões | 8,25 | **8,75** | 8,75 | Isolamento total verificado, 0 erros em 10 sessões, Database igual |
| | **Média** | 8,09 | **8,06** (64,5/8) | **8,22** (65,75/8) | Meta ≥ 8 na média: **sim**. Critérios < 8: três no padrão (3, 5, 7), um a 50 ms (7). GS-010: não |

Segunda régua (v13/v15 + refs do fundador): **NÃO VALIDADO**, porque não reabri as referências. G-1 (paleta) e G-2 (escala Tamer/Digimon: o Hawkmon fica visivelmente menor que o Agumon e abaixo do Tamer, `tela_juntos_parados_padrao.png`) seguem **abertos** e não foram julgados.

## 5. Pronto?
- **Para o ChatGPT: sim.** Enviar este QA, `qa_independente/cadencias_E.gif` e a folha. A pergunta central é a cadência: 2 px, 50 ms ou 73 ms.
- **Para o Vitor: sim, como teste**, com o roteiro do game-dev (§1 do relatório dele) e três links:
  - http://127.0.0.1:5197/?novo=1 (padrão, 2 px);
  - http://127.0.0.1:5197/?novo=1&hawkms=50 (recomendação do QA);
  - http://127.0.0.1:5197/?novo=1&hawkms=73 (coerente com o Agumon).

  Avisos para ele:
  - comparar com o Agumon de preferência andando para E/W (Q2);
  - o resultado do padrão depende da taxa do monitor.
- **Não homologado para produção.**

## 6. O que não foi feito
- Não alterei código, assets nem serviços. Não gerei nada no PixelLab.
- Não assisti o movimento em tela real. A leitura do §2.4 vem de folhas, medições e da reconstrução lado a lado (headless sem GPU).
- Não testei monitor de 120/144 Hz, nem o Hawkmon atrás de copa de árvore (§3.4).
- Não refiz o screencast real do game-dev (`capturas/walk*.gif`); usei as minhas medições e a reconstrução.
- Segunda régua visual: NÃO VALIDADO.

## 7. Decisões do fundador / ChatGPT
1. **Cadência do Hawkmon:** 50 ms (recomendação do QA, faixa 45–55), 73 ms (coerente com o Agumon) ou 2 px (padrão atual). O game-dev aplica a escolhida no `walkPxPerFrame` do manifesto.
2. Se a 50 ms o pulinho dos q5–q6 ou o escorregamento incomodarem: redesenho do pé levantado ou passada de 3 px (arte, 0 gerações).
3. Velocidade da parceira (~100 px/s) como causa de fundo: regra de jogo congelada, fica registrada.
4. Corrigir o Tamer de comparação travando em N/S (Q2), se a comparação for usada pelo Vitor.
5. Abertas, sem julgamento: G-1, G-2, régua de massa, sombra por espécie.

## 8. Evidências e roteiros
- **Pasta:** `fase21-build-hawkmon/qa_independente/`:
  - `walk_{qa_padrao,qa_ms40,qa_ms50,qa_ms73}.json`, `walk_log_*.json` (brutos), `walk_analise_*.json` e `run_*.txt`;
  - `cadencias.json`, `cadencias_E.gif`, `cadencias_E_2x.gif`, `cadencias_E_folha.png`;
  - `prof.json`, `prof_folha.png`, `prof/*.png` (16 paradas e 5 telas de modos).
- **Roteiros do QA** (fora do jogo, reexecutáveis): `workspaces/game-qa/qa_scripts/c143/`:
  - `pes.mjs`: mede os pés nos PNG;
  - `cadencias.mjs`: comparação lado a lado. Uso: `node cadencias.mjs <saida>`;
  - `prof.mjs`: rota de profundidade e modos. Uso: `QA_OUT=<saida> NO_PROXY=127.0.0.1 node prof.mjs`.
- **Medição** com os roteiros do game-dev (`tools/h143/walk.mjs` e `analisa.mjs`, só lidos e executados), com `QA_OUT` apontando para a pasta do QA.
