# QA INDEPENDENTE: Comando 10, polimento lateral do Agumon v7

**Digital Odyssey (GS-003) · game-qa · 2026-11-14 · custo PixelLab: 0** (nenhuma ferramenta de geração chamada)
Objeto: `fase13-comando10/pacote_agumon_c10/` × `backup_f2b/pacote_agumon_f2/`, `hibrido_agumon_S_c10/ataque_A_saida_q8/` × `fase12-comando9/f4/hibrido_agumon_S/ataque/`, e os PNG/GIF entregues.
Legenda: **[E]** executado nesta auditoria · **[L]** relatório anterior, não reverificado · **[H]** hipótese · **NÃO VALIDADO** com motivo.
**Nada fora deste arquivo foi alterado.** Os scripts e as saídas ficam fora do jogo e do laboratório e podem ser reexecutados: `workspaces/game-qa/tools/qa_c10/` (`met.py`, `feet.py`, `mkpage.py`, `cap.mjs`, `mksheet.py`, `cap_sheet.mjs`, `strip.py`), com saídas em `workspaces/game-qa/tmp/qa_c10/` (`met.json`, `feet.json`, `cap/`, `sheet/`, `*_run_strip.png`).

## 0. Veredito

| | Média QA | Autoavaliação | Meta |
|---|---|---|---|
| Caminhada lateral C10 | **8,0** | 8,25 | 8,5 |
| Ataque S (híbrido D, saída por q8) | **~7,5** | ~7,6 [H] | — |

- A caminhada **melhorou de verdade** em relação ao F2b. Os pés agora ficam plantados, as pernas alternam sem se sobrepor, a cabeça está estável e a âncora é fixa. Atinge a régua 8 (pronto para integração de teste), mas **não atinge a meta de 8,5**.
- **Recomendação: integrar só em build de teste do laboratório, depois de 3 pré-requisitos (§5).** Não homologar como final.

## 1. Método e ambiente [E]

- **Chromium headless-shell 1243** (Playwright), com `LD_LIBRARY_PATH=/tmp/chromelibs/ex/usr/lib/x86_64-linux-gnu`, `NODE_USE_ENV_PROXY=0 NO_PROXY='*'` e `--no-proxy-server`. Resultado: 0 exceções JS, 0 erros de console e nenhuma requisição além do próprio `file://`.
- A página própria (`tmp/qa_c10/view.html`, quadros embutidos em data URL a partir dos PNG do pacote) toca F2b E, C10 E e C10 W a 1×, 2× e 4×; a rotação E F2b × C10; attack/E, walk S e N; e o ataque S F4 × C10A a 1× e 4×. A caminhada usa 110 ms por quadro, como nos GIFs entregues; o ataque usa `delays_ms.txt`.
- **Tempo observado (rAF, 3 s):** walk 100–117 ms por quadro; ataque com 116–200 ms, que batem com `200 140 120 160 120 120 160 140 200` dentro de ±17 ms (um quadro a 60 Hz).
- Também gravei 30 capturas em movimento (`cap/run_*`), um passo a passo dos quadros 0–8 sobre fundo verde e cinza (`cap/step_*`), folhas a 5× e 3× desenhadas em canvas com vizinho mais próximo (`sheet/`) e tiras a 1× tiradas das capturas em movimento (`walk1x_run_strip.png`, `atk1x_run_strip.png`).
- **Pista de deslocamento:** avancei o sprite 4 px por quadro e medi o contato com o chão em coordenada de mundo (`feet.py`).
- **Limites:** headless sem GPU, então o tempo medido é indicativo. Não houve fundo de mapa real nem velocidade real do jogo. Os GIFs entregues foram conferidos por tamanho e número de quadros (240×240×8, 122×60×8, 528×272×9) e os PNG entregues foram vistos. Quem tocou a animação foi a minha página, a partir dos PNG-fonte, e não os GIFs.

## 2. Integridade do pacote [E] (`met.py`)

| Item | Resultado |
|---|---|
| Backup F2b × F2b original (`fase12-comando9/f2/pacote_agumon_f2`) | 73 arquivos, **todos iguais** por sha256; `backup_f2b_sha256.txt` confere 72/72 |
| Arquivos alterados no C10 em relação ao backup | `walk/E` 8, `walk/W` 8, `rotations/E`, `rotations/W`, `pacote.json`. **Todo o resto é igual byte a byte** (attack S/N/E/W, walk S/N, rotações S/N) |
| Canvas e quadros | 60×60 × 8, como no F2b; rotações em 48×48, como no F2b |
| Semitransparentes / px na borda / componentes | 0 / 0 / **1 componente por quadro** (sem pixel solto) |
| Cores no walk E / fora da paleta do pacote F2b | 24 / **0** (a paleta do pacote tem 254 cores, então esse critério restringe pouco: [L] QA F4 §3.2) |
| W = espelho de E | **0 px de diferença** nos 8 quadros; rotação W = espelho da E: 0 px |
| Cabeça (17 linhas do topo) igual ao q0 | **8 de 8** (F2b: 1 de 8, até 15 px de diferença) |
| Rotação E × walk q0 (cabeça) | **0 px** (F2b: 29 px) |
| Pixel mais baixo (âncora) | **49 em todos** (F2b alternava 49/50) |
| Bbox | esquerda 11 e direita 46 fixas; largura 36 nos 8 quadros |
| Oscilação | topo 9/10/9/8/9/10/9/8 (amp. 2, ritmo regular); centróide y amp. 1,54 (F2b 1,56) |
| Cortes entre quadros | 374–410 px (F2b: 234–424, irregular) |

Os números do `metricas_c10.json` conferem com os meus.

## 3. Caminhada E/W em movimento

| Critério | Status | Evidência e leitura |
|---|---|---|
| **Pernas, alternância** | **Funciona** [E] | A perna próxima (laranja do corpo) e a de longe (sombra) trocam de lado: x médio da perna clara 34→31→29→26→24→27→31→34. q0/q4 e q3/q7 são poses espelhadas com a cor trocada |
| **Pés sem sobreposição** | **Funciona** [E] | No apoio duplo (q0/q4) há 2 grupos de contato distintos ([22–25] e [34–38]); nos quadros de passagem há 1 pé no chão e o outro no ar. Nenhum quadro funde os pés como no F2b q0/q3/q4 |
| **Deslocamento real** | **Funciona** [E] | Com avanço de 4 px por quadro, o pé de apoio fica **parado no mundo**: borda 34 em q0–q2, ponta 38–41 em q3–q4, novo pé 50 em q4–q6, ponta 54–57 em q7. A passada é de 16 px. O F2b nas mesmas condições **escorrega** (23→25→31→38→41→45→46→59). No jogo, isso só vale se o personagem andar ~36 px/s (4 px a cada 110 ms): **NÃO VALIDADO no jogo** |
| **Braços** | **Parcial** [E] | O braço sai do contorno do tronco e tem garras brancas. A oposição à perna próxima está **correta** (garras em x 36 com a perna à frente e em 38–39 com a perna atrás), mas a amplitude é de **só 2–3 px**: a 1× o braço quase não balança e lê como "parado à frente da barriga". A 4–5× é um laço marrom fechado (C10-R3 confirmado) |
| **Silhueta e tronco** | **Funciona, com ressalva** [E] | A ligação queixo-peito ficou mais suave, e o tronco é estável e coerente com a rotação. Ressalva: o quadril e as coxas ficaram mais volumosos, e a parte de baixo pesa mais que no F2b e na rotação S. Fica dentro da ficha ("coxa grossa"), mas a 1× o boneco lê um pouco "atarracado" |
| **Cauda contínua** | **Funciona** [E] | Mesma forma, presa ao corpo, acompanhando só o sobe-e-desce, sem a troca de ponta do F2b. Por outro lado, fica **rígida**: zero ondulação, o que contribui para o ar "metódico" |
| **Escala e âncora** | **Funciona** [E] | Bbox lateral fixa, pixel mais baixo 49 em 8/8, cabeça idêntica |
| **Pixels soltos** | **Funciona** [E] | 1 componente por quadro, 0 semitransparentes |
| **Oeste como espelho** | **Funciona** [E] | Espelho exato, braço e pernas sem artefato. Ressalva conhecida: num espelho, o braço "próximo" passa a ser o outro lado do corpo, o que é aceito no F2b e no restante do pacote |
| **Leitura a 1× em movimento** | **Funciona** [E] | Na tira tirada das capturas em movimento, o C10 lê como um passo regular de dinossauro bípede. O F2b, ao lado, "dança" (pés mudando de lugar e cabeça mudando de desenho). A melhora é visível na escala do jogo |

## 4. Regressões declaradas (C10-R1 a R5) e achados novos

| ID | Sev. | Status QA | Evidência |
|---|---|---|---|
| **C10-R1** attack/E e W com tronco e braço antigos | **P2** | **Confirmado** [E] | A cabeça do attack/E q0 difere da walk q0 em 19 px; braço colado; tronco mais fino. **Achado novo:** o pixel mais baixo do attack/E é 50 nos 9 quadros, contra 49 fixo na walk C10, ou seja, um **pulo de 1 px na âncora** ao começar o ataque lateral (no F2b ficava mascarado pela walk alternar 49/50). Ao atacar de lado, o boneco troca de corpo e desce 1 px |
| **C10-R2** rotação E/W nova | P3 | **Confirmado** [E] | A rotação agora tem cabeça igual à walk (0 px) e o mesmo braço, o que é coerente. O idle E do rig F3 sobre a rotação antiga é [L], não aberto nesta auditoria: **NÃO VALIDADO** |
| **C10-R3** braço em laço | P3 | **Confirmado** [E] | Laço de contorno escuro a 4–5× (`sheet/E_F2b_vs_C10_*`), realce quase invisível. A 1× lê como braço |
| **C10-R4** coxa de trás perto da base da cauda | P3 | **Confirmado** [E] | Em q0/q4 a coxa de sombra encosta na cauda e a 1× forma uma massa só. É o ponto mais confuso da silhueta |
| **C10-R5** sola em 2–3 linhas | P3 | **Confirmado, sem efeito visível** [E] | As linhas 46–49 aparecem por causa do calcanhar e da ponta (contato e empurrão). O pixel mais baixo é 49 sempre e, em movimento, não há patinação na pista de 4 px |
| Novo: amplitude do braço | P3 | [E] | 2–3 px; quase imperceptível a 1× |
| Novo: cauda rígida | P3 | [E] | 0 px de ondulação própria |
| Pé "ferrugem" (antigo F2-4) | — | **Sem regressão** [E] | 0–7 px a ≤12 RGB de #cd6624 em y ≥ 41, contra 0–12 no F2b |

## 5. Ataque S: saída pelo q8 [E]

- Registro conferido: o C10A difere do F4 **só no q7** (363 px), e o q7 é o F2b attack/S q8 deslocado (+3, −5) com **0 px de diferença**. 0 semitransparentes, 0 px na borda, 0 cores fora do pacote.
- Cortes q5→q8: F4 191 → **493** → 141; C10A 191 → **393 → 354**. Os números conferem com o relatório e com o QA F4 §1.4.
- **Em movimento (1× e 4×):** o estalo **diminuiu, mas não sumiu**. Os braços agora descem em dois passos (horizontal → baixados no traço v3 → rig), e isso ajuda. Por outro lado:
  1. a **subida de 2 px** da cabeça (topo 13 → 11) continua acontecendo de uma vez em q6 → q7;
  2. o q7 mostra por 140 ms o **rosto e o sombreado do v3** (sobrancelha franzida, manchas mais escuras na cabeça) e, no q8, volta ao traço da rotação. A 1× isso lê como uma "careta" rápida antes de relaxar. É aceitável como fim de esforço, mas ainda é uma troca de família de traço.
- **Leitura:** melhor que o F4, por uma margem pequena. Animação 7,0 → ~7,25; consistência continua em 7,0 (são as mesmas duas famílias de traço). **Média ~7,5.** Adotar a variante A: **sim**, porque é melhor que o F4 e tem custo 0. A variante B (fogo na boca) não foi testada em movimento: o próprio relatório a rejeita, e eu não a avaliei.

## 6. Notas 0–10 (caminhada lateral C10)

**Régua:** a mesma do QA F2 e F4: referência aprovada v13/v15 + `FICHA_AGUMON.md`, leitura a 1× e 4× em movimento, **paleta fora da nota** (G-1 aberto). Contra o Style Bible (Endesga-32) não medi; continua [L] e fora da nota.

| Critério | F2b (auto) | C10 auto | **C10 QA** | Justificativa |
|---|---|---|---|---|
| Fidelidade | 7,5 | 8,0 | **8,0** | Cabeça, olho, focinho, garras e cauda da ficha, sem crista e sem barriga branca. Desconta o braço em laço e a metade de baixo mais pesada que a rotação S |
| Animação | 7,0 | 8,5 | **8,0** | Pés plantados de verdade, alternância correta e oscilação regular de 2 px: é o maior ganho. Não chega a 8,5 porque o braço balança só 2–3 px (quase parado a 1×), a cauda é rígida e a passada é curta e mecânica |
| Consistência anatômica | 7,0 | 8,5 | **8,0** | Cabeça 8/8, âncora e bbox fixas, rotação coerente. Desconta: o attack/E e W ainda tem outro tronco e a âncora 1 px abaixo (R1); e há dois níveis de acabamento no mesmo quadro (cabeça v7 detalhada × pernas e tronco em forma lisa com um tom de sombra) |
| Legibilidade | 7,5 | 8,0 | **8,0** | A 1× lê bem como passo. Desconta a coxa de trás fundida à cauda em q0/q4 (R4) |
| **Média** | 7,25 | 8,25 | **8,0** | |

- **Meta 8,5: não atingida** (8,0 no QA; 8,25 na autoavaliação). Diferença de −0,25 em relação à autoavaliação, concentrada em animação e consistência.
- **Régua 8 (integração de teste): atingida**, com média 8,0 e nenhuma categoria abaixo de 8. **GS-010** (média ≥ 9, nenhuma < 8): não atingida.
- **[H] O que levaria a ≥ 8,5:** (a) braço com amplitude de 4–5 px e laço aberto; (b) 1 px de atraso ou ondulação na ponta da cauda; (c) coxa de trás separada da cauda em q0/q4 por um pixel de contorno ou de sombra; (d) attack/E e W com o mesmo tronco e a âncora em 49. Tudo isso é a alternativa 1 do relatório (custo 0), e eu concordo com ela.

## 7. Recomendação

**Integrar: sim, mas só em build de teste do laboratório**, e não como asset aprovado. Antes:

1. **Fundador decide C10-R2** (rotação nova ou a do F2b). Recomendo a nova: é coerente com a caminhada, com 0 px de diferença de cabeça. Se for a nova, o idle E do rig F3 precisa ser refeito sobre ela, ou o idle E fica com outro corpo.
2. **Corrigir C10-R1 no mínimo nos quadros neutros do attack/E e W (q0, q1, q8) e a âncora em 49.** Sem isso, no jogo o Agumon troca de tronco e desce 1 px toda vez que ataca de lado, uma regressão perceptível que antes ficava mascarada.
3. **No build de teste, medir a velocidade real de deslocamento.** O ciclo só fica sem patinação a ~4 px por quadro de 110 ms (~36 px/s). Se o jogo andar mais rápido ou mais devagar, ajustar o delay da walk, não o desenho.

Depois disso, aplicar o acabamento (a)–(c) do §6 e repetir este QA para tentar 8,5. Ataque S: adotar a variante A.

## 8. Não feito / NÃO VALIDADO

- **Não integrado**, e o jogo não foi aberto: âncora no mapa, velocidade e desempenho reais **NÃO VALIDADOS**.
- Fundo de mapa real **NÃO VALIDADO** (só verde #7fa65a e cinza #9a9a9a).
- Idle E do rig F3 e attack N/W em movimento não foram abertos.
- Paleta Endesga-32 e escala Tamer/Digimon: **conflitos abertos da Etapa 6, não resolvidos aqui.** Escala lateral medida apenas de forma indireta: a altura da rotação E não mudou (o relatório dá 41 px [L]; nas minhas medidas, a bbox da rotação E vai de y 4 a 44).
- Os GIFs entregues não foram reproduzidos como arquivo; toquei os PNG-fonte numa página própria. Dimensões e número de quadros dos GIFs conferem.

## 9. Decisões do fundador

1. Rotação E/W nova × F2b (C10-R2), e se o idle E do rig deve ser refeito.
2. Autorizar a alternativa 1 (custo 0): attack lateral + acabamento de braço, cauda e coxa.
3. Adotar a saída do ataque S pelo q8 (variante A); o QA recomenda **sim**.
4. Fogo do Pepper Breath no peito (S): continua aberto e limita a fidelidade do ataque.
