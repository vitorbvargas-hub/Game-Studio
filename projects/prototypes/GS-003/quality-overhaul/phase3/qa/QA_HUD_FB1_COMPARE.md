# QA — HUD v2 P0, Digivice Radial Alt A + abas P0, Feedback 1, `?team=compare`

- **Autor:** game-qa · **Data:** 2026-11-10 · **Custo:** 0 gerações PixelLab, 0 código de jogo alterado.
- **Revisado (read-only):** worktree `workspaces/game-dev/qo` (branch `quality-overhaul`), commits `3ffbe55` (P8 HUD v2), `e4c1a2a` (Digivice), `33e7dc0` (`?team=compare`) e o estado atual de `feedback1`/`compare`. **Não toquei** no worktree compartilhado nem no trabalho não commitado de outro agente (`src/main.ts`, `src/render/view.ts`, `src/style.css`, `v10/`). Não rodei `npm test`/build neste worktree para não interferir no trabalho em andamento; os números de teste citados abaixo são os dos relatórios de dev, não verificação independente minha — ver Limitações.
- **Método:** leitura dos 4 relatórios de dev + specs-fonte, e inspeção visual de 15 capturas PNG já existentes (copiadas para um diretório temporário fora do worktree só para visualização, nada alterado na origem).
- **Legenda:** **[E]** evidência (arquivo/captura citada) · **[H]** hipótese/julgamento meu.

---

## 1. HUD v2 P0 (`?hud=v2`)

### Nota: **7/10**

| Critério | Nota | Observação |
|---|---|---|
| Legibilidade | 7 | Moldura nível 1 chanfrada lê bem contra o fundo escuro do painel [E, `p8_hud_v2_dia_barra.png`/`_noite_barra.png`]. A placa de alvo com fundo 0,72 e borda de raridade ciano é legível de dia e de noite [E, `p8_hud_v2_encontro_dia_2_placa.png`]. O combate mostra `-4`/`-35` como número flutuante sobre o selvagem com bom contraste [E, `fb1_auto_encontro_luta.png`, `p8_hud_v2_encontro_dia_3_combate.png`]. |
| Consistência visual | 8 | Mesma família de moldura chanfrada em Tamer, parceiro, hotbar e placa; cores de categoria (laranja físico, azul especial) distintas no hotbar [E, `p8_hud_v2_dia_barra.png`]. v1×v2 lado a lado confirma que o HUD antigo não muda sem a flag [E, `p8_hud_v1_dia_barra.png` vs `p8_hud_v2_dia_barra.png`]. |
| Reatividade de PV (crítico/aviso) | 9 | Confirmado visualmente: borda do Tamer vermelha em `tamer_crit_barra.png` e dourada em `tamer_warn_barra.png`, exatamente como a spec pede (2.1) [E]. |
| Aderência à spec P8 | 6 | Itens (a)(b)(c)(d) batem com a spec. Item (e) (grama alta) é parcial por desenho (o próprio relatório de dev admite que a saturação +10% não foi feita — §3 do `P8_HUD_V2_DEV.md`); não dá para confirmar visualmente a saturação numa captura estática [H, dependeria de comparação lado a lado antes/depois que não existe nas capturas disponíveis]. |
| Regressões | 9 | Nenhuma regressão visual encontrada nas capturas v1 (sem flag) comparadas ao HUD anterior — `p8_hud_v1_*` continuam idênticas ao padrão antigo. |

### Achados

- **[P1]** O bloco do Tamer mede 136 px em vez dos 120 px da spec (`P8_HUD_V2_DEV.md` §1, "Bloco TAMER"). Visualmente não quebra nada (as capturas mostram boa integração), mas é um desvio de medida não corrigido — a spec deveria ser atualizada ou o bloco revisto, antes de a medida virar critério de regressão em revisões futuras.
- **[P2]** A saturação da grama alta (+10%, critério 10.4/§8.3 do `P8_HUD_V2_SPEC.md`) não foi implementada, conforme o próprio relatório de dev admite. Item (e) do P0 fica **parcialmente atendido**, não "atendido".
- **[P2]** A condição 1 do QA anterior (`QA_P8_AND_V3FIX.md` §1.4) pedia resolver a ambiguidade de escala do Tamer antes de produzir retrato recortado — o retrato do Tamer continua placeholder listrado (não recortado), então a condição está **tecnicamente satisfeita por adiamento**, não por resolução; não é regressão, mas segue em aberto.
- **Positivo:** o critério 10.3 reescrito pelo QA anterior ("dentro da janela da sequência, sem atrasar o combate") foi adotado corretamente pelo dev (`P8_HUD_V2_DEV.md` §2), com medição em capturas (1660ms/2460ms) — boa resposta ao achado anterior.

---

## 2. Digivice Radial Alt A + abas P0 (commit `e4c1a2a`)

### Nota: **7/10**

| Critério | Nota | Observação |
|---|---|---|
| Legibilidade | 8 | Hub fechado é limpo e discreto: ribbon fina + círculo com duplo contorno ciano, sem poluição [E, `dg_fechado_chefe_ativo_dia_canto.png`]. Painéis (Chefe Mundial, Conquistas) têm hierarquia de texto clara, barras e abas bem demarcadas [E, `dg_chefe_2_ativo_dia.png`, `dg_conquistas_dia.png`]. |
| Consistência visual | 8 | Linguagem "circuito digital" (moldura chanfrada, borda ciano dupla, linhas de circuito no cabeçalho) é coerente entre o hub, o arco e os modais — mesma gramática visual do P8. |
| Identidade Digimon/Digivice | 8 | Resolve bem o achado original (clone do IdleDex): a pilha de 6 caixas retangulares virou 1 objeto central com emblema e pips só quando há novidade real [E, comparar `p8_hud_v2_encontro_dia_2_placa.png` — ainda com o `.hud-tr` antigo — contra `dg_fechado_chefe_ativo_dia_canto.png`]. É visivelmente "um instrumento", não uma planilha. |
| Aderência à spec (`HUD_IDENTITY_V3.md` Alt A + `PANELS_SPEC.md`) | 6 | Ver achados abaixo — 2 desvios relevantes (raio do arco, forma do arco) e 1 conflito já sinalizado pelo próprio dev (ranking com bots). |
| Regressões | 9 | Nenhuma regressão aparente; `?team=compare` e o P8 antigo continuam intocados (commit isolado por cima do anterior). |

### Achados

- **[P1]** **O "arco" de 6 ícones não lê como arco.** A spec (`HUD_IDENTITY_V3.md` §2.2) pede um arco curvo de raio 72px no quadrante inferior-esquerdo. Na captura `dg_aberto_dia_canto.png` **[E]**, os 6 ícones aparecem como uma formação quase diagonal/retangular (2 colunas desalinhadas descendo), não uma curva perceptível. O raio foi ajustado para 120px pelo dev para evitar sobreposição (`DIGIVICE_DEV.md`, tabela de checklist, linha "Raio de 72 px"), mas isso não resolve a legibilidade de "arco": com 120px de raio e só 6 ícones num quadrante de 90°, o resultado visual é mais parecido com um menu em grade do que com um leque. Recomendo ao game-design revisar se o raio maior ainda cumpre a intenção "arco", ou se vale abrir o ângulo (ex. 120-140°) para a curvatura ficar visível.
- **[P1]** **Conflito já sinalizado pelo dev, não resolvido:** `PANELS_SPEC.md` §5 diz explicitamente "nunca mostrar nomes de outros jogadores no ranking" do Chefe Mundial, mas o ranking exibido usa nomes tipo "BOT-Cobalto" rotulados "BOT · simulado" [E, `dg_chefe_2_ativo_dia.png`]. Visualmente a rotulagem é clara e honesta (não engana o jogador), mas **diverge da letra da spec**. Precisa de decisão do fundador/game-design (já pedida pelo próprio `DIGIVICE_DEV.md`, "Limitações"); eu concordo que a execução visual, *se* o ranking com bots for aprovado, está bem feita (rótulo visível, nunca escondido).
- **[P2]** A tecla **H** é um gesto novo de input que a spec explicitamente pedia para não ter ("Sem gesto novo de input", `HUD_IDENTITY_V3.md` §2.2). O dev documentou a divergência corretamente; funcionalmente é aditivo (clique continua funcionando), risco baixo.
- **[P2]** O pip de Correio nunca acende (Correio é P1/não implementado) e o pip do Passe foi substituído pelo pip do Chefe Mundial — não é erro, mas um leitor só das capturas pode achar que falta um pip; está documentado no relatório.
- **Positivo:** as abas de Conquistas mostram claramente os 4 estados (bloqueada/progresso/completa com "Coletar"/coletada) na mesma captura, e o critério "sem ícone de cadeado em item com progresso 0" é respeitado visualmente [E, `dg_conquistas_dia.png`, item "Chamado do Chefão" em cinza sem cadeado].

---

## 3. Feedback 1 (`FEEDBACK1_DEV.md`)

### Nota: **8/10**

| Critério | Nota | Observação |
|---|---|---|
| Mapa-múndi (5 bugs) | 8 | Verifiquei visualmente os bugs 1, 3 e 4: **nenhum troféu gigante cobrindo o mapa** [E, `fb1_mapa_mundi_floresta.png`, `fb1_mapa_mundi_na_vila.png` — comparado à descrição do bug, que não reproduzo porque a captura "antes" não está entre os arquivos entregues]; **botão "Arena" com estilo próprio** (pílula escura, borda, ícone) visível e não mais "branco e vazio" [E, mesmas capturas]; **o nó "Vila dos Bebês" aparece corretamente destacado como "você está aqui" ao viajar até lá** [E, `fb1_mapa_mundi_na_vila.png`]. Não tenho captura "antes" para comparar os bugs 2 e 5 lado a lado — aceito a correção com base no relatório de causa/correção, não reproduzi o defeito original [H, mas o comportamento atual nas capturas não mostra nenhum sintoma residual: nós com texto longo não parecem esticar sobre vizinhos]. |
| Pose parada (pés juntos) | 9 | A grade `fb1_parado_comparacao.png` é a evidência mais forte da entrega inteira: nas 4 direções (E, S, W, N), "antes" mostra uma perna à frente (pose de passada) e "depois" mostra os pés juntos/neutros, em v1 e em `anim=v2` [E]. Correção visualmente clara e consistente. |
| AUTO explorador | 7 | A captura de combate mostra o Tamer presente na cena com a parceira lutando e o log richiesto ("Combate: Guilmon x Gigimon", dano, XP) [E, `fb1_auto_encontro_luta.png`]. Não tenho como verificar visualmente a lógica de exploração/cura/fuga em si (é comportamento ao longo do tempo, não uma imagem estática) — aceito a descrição do dev como não verificada por mim [H]. |
| Troca de Digimon | 8 | A captura de combate mostra claramente o anel de entrada e o indicador "pronto"/recarga nos retratos da equipe [E, `fb1_troca_combate_entrada.png` — anel dourado pontilhado no retrato ainda não ativo]. Boa legibilidade do estado de recarga. |
| Regressões | 8 | Nada quebrado aparente nas capturas; o HUD antigo (`.hud-tr`) nessas capturas é o esperado, porque este trabalho antecede o commit do Digivice — não é regressão, é ordem de commits (ver nota abaixo). |

### Achados

- **[P2]** Nota de ordem, não é bug: as capturas de `feedback1` (`fb1_*`) e de `compare` (`cmp_*`) foram feitas **antes** do commit do Digivice (`e4c1a2a`), então mostram o `.hud-tr` antigo (pilha de caixas), não o hub novo. Isso é esperado dado o histórico de commits, mas significa que **feedback1/compare nunca foram verificados visualmente junto com o Digivice ativo** — se houver alguma interação (z-index, espaço de tela) entre o hub e os elementos de combate/troca, ela não está coberta por nenhuma captura existente. Recomendo uma rodada de captura com `?hud=v2` ativo simultaneamente ao `?team=compare` antes do fechamento da fase.
- **[P2]** Não há captura "antes" dos bugs 2 e 5 do mapa-múndi entre os arquivos entregues (só "depois"), então minha confirmação desses dois itens específicos é parcial — me baseei na ausência de sintoma na versão atual, não numa comparação direta.

---

## 4. `?team=compare` (Guilmon PixelLab 64px × Gabumon à mão)

### Nota: **6/10**

| Critério | Nota | Observação |
|---|---|---|
| Legibilidade | 8 | Nameplates, barras de PV e o selo "COMPARAÇÃO · Guilmon PixelLab × Gabumon à mão" são claramente legíveis na tela cheia [E, `cmp_lado_a_lado_v2_tela.png`]. |
| Consistência de escala | 8 | Os dois ficam na mesma densidade de pixel lado a lado, pés na mesma linha aproximada de solo — confirma a alegação do dev de "mesma escala" [E, `cmp_lado_a_lado_v2_x3.png`]. |
| **Identidade/paridade visual Guilmon × Gabumon** | **3** | **Achado mais importante desta QA.** Na comparação ampliada (`cmp_lado_a_lado_v2_x3.png`) [E], o Guilmon (PixelLab) tem shading definido, cores saturadas corretas (vermelho/laranja, barriga clara, símbolo no peito, olhos amarelos nítidos) e lê imediatamente como o personagem oficial. O Gabumon (à mão) aparece como uma forma arredondada branca/cinza quase sem padrão, sem o pelo azul-marinho característico nem os espinhos escuros que definem visualmente a espécie — lê mais como "uma bola branca com chifre" do que como Gabumon. A diferença de qualidade/legibilidade entre os dois é grande e vai pular aos olhos de qualquer jogador que troque entre eles, que é exatamente o teste que o fundador pediu para fazer. Isso não é um bug de implementação (a troca, a escala e a UI funcionam corretamente) — é um achado de **qualidade de arte-fonte** no asset `CREATURE-0119-gabumon-hand64`, fora do escopo de código desta entrega. |
| Troca visual (VFX) | 8 | A sequência `cmp_troca_sequencia.png` mostra o recuo em silhueta branca com anel ciano e a entrada com anel dourado, nitidamente diferenciados e legíveis [E]. |
| Regressões | 7 | Nenhuma regressão encontrada; ver nota de ordem de commits acima (§3) sobre não ter sido testado junto ao Digivice. |

### Achados

- **[P1]** **Gap de qualidade de arte entre Guilmon (PixelLab) e Gabumon (à mão), confirmado visualmente** [E, `cmp_lado_a_lado_v2_x3.png`]. Recomendo repassar ao game-art como item de revisão do asset `CREATURE-0119-gabumon-hand64` — não é um problema desta entrega de dev (que apenas trouxe os dois para comparação lado a lado, como pedido), mas é exatamente o resultado que a comparação deveria revelar, e o resultado aponta para a arte à mão precisar de retrabalho (cores de pelagem, definição dos espinhos) para ficar à altura do Guilmon.
- **[P2]** O relatório já documenta como limitação que só o Guilmon tem animação completa em S (demais direções usam fallback), e que ambos têm pés juntos corretamente parados por idle dedicado — confirmei isso visualmente no frame único disponível (idle parado), mas não vi o walk/animação em si (não há GIF/sequência de frames entre os arquivos entregues, só o WebM, que não inspecionei quadro a quadro).

---

## 5. Resumo de notas

| Item | Nota |
|---|---|
| HUD v2 P0 | 7/10 |
| Digivice Radial Alt A + abas P0 | 7/10 |
| Feedback 1 | 8/10 |
| `?team=compare` | 6/10 |

## 6. Achados por prioridade

- **P0:** nenhum achado bloqueante de regressão ou quebra visual.
- **P1:**
  1. Arco de 6 ícones do Digivice não lê como arco curvo (raio 120px, ângulo de abertura estreito) — `dg_aberto_dia_canto.png`.
  2. Ranking do Chefe Mundial com bots nomeados diverge da letra do `PANELS_SPEC.md` §5 ("nunca mostrar nomes") — já sinalizado pelo dev, precisa de decisão do fundador/game-design.
  3. Gap de qualidade visual Guilmon × Gabumon, confirmado na comparação lado a lado — repassar ao game-art.
- **P2:**
  1. Saturação da grama alta (+10%) não implementada — item (e) do P0 do P8 fica parcial.
  2. Bloco do Tamer com 136px em vez de 120px (desvio de medida documentado, não corrigido).
  3. Tecla H como gesto novo de input, contra a letra da spec do Digivice.
  4. Feedback1/compare nunca foram capturados com o Digivice ativo ao mesmo tempo — lacuna de cobertura visual, não bug confirmado.
  5. Bugs 2 e 5 do mapa-múndi sem captura "antes" para comparação direta.

## 7. Limitações desta QA

- **Não rodei `npm test`/`npm run build`/capturas próprias.** O worktree compartilhado tem trabalho não commitado de outro agente; para não arriscar interferir ou gastar tempo irrelevante, me restringi a leitura de spec/relatórios e inspeção das capturas PNG já entregues (copiadas para fora do worktree só para visualização, sem alterar a origem). Os números de teste citados pelos relatórios de dev (ex. "397 testes verdes") são autoatestados, não verificados por mim nesta rodada.
- **Não abri o jogo ao vivo.** Toda a avaliação de legibilidade/consistência é sobre as capturas estáticas já existentes, não uma sessão interativa minha.
- **Não inspecionei os WebM quadro a quadro** (`dg_digivice.webm`, `fb1_feedback1.webm`, `cmp_compare.webm`) — só as capturas PNG estáticas citadas acima.
- **Bugs 2 e 5 do mapa-múndi:** aceitei a correção com base na ausência de sintoma residual nas capturas atuais, não numa comparação direta antes/depois (não há captura "antes" entre os arquivos entregues).
- **Saturação da grama alta:** não há par de capturas antes/depois que isole esse parâmetro visualmente; a avaliação de que está "parcial" se baseia no relatório de dev admitindo a lacuna, não em medição minha de pixel.
