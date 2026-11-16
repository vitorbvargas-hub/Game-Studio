# QA independente do Hawkmon v2 (estilo ChatGPT) no build isolado 5197

**Data:** 2026-11-15, 21:40–22:10 · **Autor:** game-qa (subagente, sessão separada de quem produziu a arte e o build) · **Status:** QA concluído, build **não homologado** para produção.
Fan game não oficial e não licenciado; uso local, nada publicado. Hawkmon e Agumon são espécies oficiais de Digimon (Bandai/Toei); os sprites são adaptação do estúdio. A base do Hawkmon v2 vem do C15a (referência gerada no ChatGPT, sob direção do Vitor) e a animação do C15b (PixelLab + limpeza local).

Legenda: **[E]** executado por mim nesta auditoria · **[L]** relatório anterior (game-dev/game-art), não reverificado por mim · **[H]** hipótese ou leitura minha · **NÃO VALIDADO** com motivo.

## 0. Build testado [E]

| Item | Valor |
|---|---|
| Link | http://127.0.0.1:5197/?novo=1&time=dia |
| Worktree / branch / commit | `workspaces/game-dev/lab-hawkmon`, `lab/hawkmon-v1b`, `01f82b8` (confirmado via `git log`/`git status`: só `node_modules` não versionado, igual ao relatado) |
| Serviço | `gs003-lab-hawkmon-5197.service`, `active (running)`, HTTP 200 |
| Ambiente | `chrome-headless-shell-1243` (mesmo binário usado pelo game-dev e pelo QA anterior), 1280×720, sem GPU. **Medidas de tempo são indicativas.** |
| Achado de ambiente | As variáveis `HTTP_PROXY`/`HTTPS_PROXY` da minha sessão interceptavam o `fetch` ao DevTools local (127.0.0.1), fazendo o lançador do Chromium "nunca responder". Contornado com `env -u HTTP_PROXY -u HTTPS_PROXY ... NO_PROXY='*'` nas minhas próprias chamadas Node. Não é um problema do jogo; registro para o caso de outro agente/sessão tropeçar na mesma coisa. |
| Database | `projects/prototypes/GS-003/database/data/*.json` → md5 `8b71f53e42eec53bd184a5b6947dd960`, **igual** ao valor relatado no C14.4-A/B. (Nota: essa pasta não existe dentro do worktree `lab-hawkmon`; é o caminho central do estúdio — consistente com "a Database não é fonte do jogo hoje", §5.6 do contexto comum.) |
| Isolamento | `5196` (`lab-f7v2`) ativo, HTTP 200, worktree limpo (só `node_modules`). `5191` não está ativo (HTTP 000) — **já não estava rodando antes desta tarefa** (confirmado pelo C14.4-A); não é regressão minha nem desta leva. `lab-etapa6` limpo. |

Não havia QA desta tarefa específica (Hawkmon v2) antes; a referência é o QA do v1b (`fase21-build-hawkmon/QA_BUILD_HAWKMON_INDEPENDENTE.md`), mesma régua de 8 critérios.

## 1. Resumo

1. **Cadência (critério pedido): atendida e bem resolvida.** Mediana de 50 ms/quadro nas 4 direções, 5 px/quadro, 88–92 px/s, **0 quadros pulados**, confirmado de forma independente [E]. Os quadros q5–q6 (o "pulinho" do v1b) ficaram **100% estáveis em 50 ms** nas minhas amostras — melhor que o v1b no mesmo passo (que tinha 1 ocorrência de 83 ms em 44 trocas, por relato anterior).
2. **Achado novo, o mais importante desta rodada: cintilação de identidade no idle [E/H].** A faixa/visor sobre os olhos **aparece e desaparece entre quadros da mesma animação**, de forma mais nítida em **idle E** (olho visível em q0 e q3, totalmente coberto por um visor escuro em q1 e q2) — um ciclo de 4 quadros a 180 ms (~720 ms totais), lento o bastante para o olho perceber a troca como "pisca-pisca" e não como uma escolha de pose. Em **idle S**, a massa do corpo salta visivelmente entre quadros (bbox 25×38 em q0/q1 para 29×41 em q2/q3) — dentro da faixa pedida de 37–42 px de altura, mas com um salto abrupto a cada ciclo. Em **idle N**, a largura cai de 26 para 21 px em q2. Isso **não aparece nos relatórios C15b/C15b-2**, que mediram altura (massa) e cor mas não a presença/ausência do visor nem variação de largura entre quadros do idle. Ver §3.
3. **Pé de apoio (escorregamento) confirmado como irregular, medição própria corrobora o C14.4-B qualitativamente, não em magnitude exata** [E]. Minha medição automática (rastreio do bloco de contato mais próximo entre quadros) dá: E recuo médio 1,67 px (escorrega 66,7% a 5 px/quadro), W recuo médio 3,92 px (escorrega 21,7%), com um salto de +8 px em W entre q3→q4 — a mesma irregularidade que o C14.4-B relatou manualmente no trecho q3→q5, embora os números absolutos divirjam (rastreio automático de identidade do pé é ambíguo por natureza; ver §4).
4. **Agumon de comparação andando em N/S: confirmado corrigido** [E]. 21–27 quadros de walk por direção nas minhas medições — o Q2 da fase21 (Agumon de comparação travado em N/S) está resolvido, como relatado pelo C14.4-A.
5. **0 erros de console e 0 falhas de rede** em 11 sessões próprias (padrão + 4 modos de URL + rota de profundidade + 4 direções de screencast real) [E].
6. **Regressão/isolamento intactos** [E]: Database, 5196, worktrees limpos, Agumon/Tamer/`WORLD` sem mudança de comportamento.
7. **Notas (régua da fase21, 8 critérios), build v2 como entregue (50 ms): média 7,78.** Abaixo de 8 em dois critérios (fidelidade 7,0; consistência anatômica 6,5), por causa do achado do item 2. **GS-010: não.**
8. **Achado levantado, não resolvido por mim: fidelidade do "visor/óculos" ao Hawkmon oficial** [H]. Não encontrei, nos relatórios C15a/C15b, menção ao protocolo `GS-003-DIGIMON-REFERENCE-GATE` (GD-072) nem a um `DIGIMON-REFERENCE-REPORT` formal antes da geração; a base é descrita só como "referência gerada no ChatGPT sob direção do Vitor". Isso pode já ser a aprovação que o protocolo prevê, mas não está documentado explicitamente no que recebi. Registro a lacuna; não decido.

## 2. Cadência da walk [E]

Reexecutei os roteiros do game-dev (`tools/h143/walk.mjs` + `analisa.mjs`, só leitura, sem alterar o jogo) com `QA_OUT` próprio, tag `qa_v2_padrao`.

| Direção | ms/quadro (mediana) | px/quadro | Velocidade | Pulos | q5–q6 (cada) |
|---|---|---|---|---|---|
| E | 50 | 5 | 92 px/s | 0/49 | 50 ms, todas as 12 ocorrências |
| W | 50 | 5 | 91 px/s | 0/46 | 50 ms, todas |
| N | 50 | 5 | 89 px/s | 0/33 | 50 ms, todas as 8 ocorrências |
| S | 50 | 5 | 91 px/s | 0/47 | 50 ms, todas |

- Manifesto confirmado no jogo: ficha "v2 PixelLab", `walkPxPerFrame: 5`, 8 quadros de 50 ms cada, nas 4 direções — bate com `pacote.json`/`links_c14_4b.json`.
- No lento (Shift): 117–150 ms por quadro, consistente com o passo fixo de 5 px (mesmo efeito colateral já registrado no C14.4-A, não é bug novo).
- **Agumon de comparação:** 21–27 quadros de walk por direção, incluindo N e S — o defeito da fase21 (Q2, Tamer de comparação travado) está corrigido. Agumon como parceiro ativo (`&parceiro=agumon`): manifesto com `walkMs` de 110 ms (≈116,6 reportado), igual ao histórico.
- **0 erros, 0 falhas de rede**, 1 aviso (o já conhecido "Tamers: cores de cabelo idênticas no disco").

## 3. Cintilação de identidade no idle — achado novo [E/H]

### O que medi
- Gerei pranchas ampliadas dos 4 quadros de cada direção do idle (`qa_v2/full_idle_{S,E,N,W}.png`, corpo inteiro a 12×) e recortes da região da faixa/olho (`qa_v2/zoom_idle_*.png`), lendo os PNG do próprio `pacote_hawkmon_v2/idle/`. Também medi o bounding box opaco de cada quadro (altura/largura) com um script próprio.

### Massa (bbox), medição independente

| | q0 | q1 | q2 | q3 |
|---|---|---|---|---|
| idle S | w25 h38 (y12-49) | w27 h38 (y12-49) | **w29 h41** (y9-49) | w28 h41 (y9-49) |
| idle E | w26 h38 | w26 h38 | w26 h38 | w26 h38 |
| idle N | w26 h38 (y12-49) | w26 h40 (y10-49) | **w21 h40** (y10-49) | w22 h38 (y12-49) |
| idle W | w26 h39 | w25 h40 | w26 h38 | w29 h36 (y14-49) |

- Altura: 36–41 px em todos os 16 quadros de idle — **dentro** da faixa pedida de 37–42 px (só o idle/W q3 fica 1 px abaixo, em 36, irrelevante).
- **Mas há um salto abrupto dentro do próprio ciclo**, não uma variação suave: em idle S, a largura cresce 4 px e a altura 3 px exatamente entre q1→q2, depois volta; em idle N, a largura cai 5 px entre q1→q2. Num ciclo de 4 quadros a 180 ms (720 ms totais), isso se repete a cada ~1,4 ciclos por segundo — devagar o bastante para ler como "respirar fundo de repente", não como erro de pulo de quadro, mas rápido o bastante para incomodar num personagem parado (é o estado mais visto pelo jogador).

### Visor/olho visível, leitura visual

- **idle E (a mais clara):** q0 e q3 mostram o olho azul visível por baixo da faixa; q1 e q2 mostram a faixa totalmente escura, cobrindo o olho por completo. A troca é abrupta, não gradual.
- **idle S:** q0/q1 sem olho visível (faixa fechada); q2 (o quadro que também cresce de massa) e q3 mostram uma pequena fresta azul na borda inferior da faixa.
- **idle N:** de costas, não há olho a mostrar (esperado); a variação é só de massa/largura, descrita acima.
- **idle W:** olho visível com clareza em q0, pouco visível nos outros três (o corpo vira mais de perfil) — aqui a variação é mais explicável pela pose (virar a cabeça) do que um erro, mas ainda contribui para a sensação de inconsistência quando comparado a E.
- **walk E (8 quadros, para contraste):** o mesmo tipo de variação aparece, mas mais diluída (ex.: um reflexo azulado aparece só em q6) — a 50 ms por quadro, o efeito tende a se perder no borrão do movimento; não critico a walk por isso.

### Por que isso não apareceu nos relatórios de arte
O `RELATORIO_C15B.md` (§6) mede massa (altura do bbox) e conclui "variação de até 4 px... atribuída à extensão natural da perna/respiração... não há... tendência de deriva" — isso é verdade para a métrica que eles mediram (só altura, só comparando contra os 38 px da C15a), mas não cobre a largura nem a presença/ausência do elemento do visor, que é o que faz o olho sumir e reaparecer. A auditoria de cor do C15b confirma que as cores do olho (`#1C6279` etc.) existem no conjunto aprovado — o problema não é cor fora de paleta, é **em qual quadro o pixel do olho é desenhado por cima pelo visor**.

### Severidade e correção sugerida
**P1** (decisão de qualidade, não trava nada tecnicamente, mas é o achado mais visível desta rodada e muda a nota de aptidão). Não é um bug de pixel isolado (teria sido P3); é uma inconsistência de pose dentro do próprio ciclo de animação, visível a olho nu no idle, que é o estado em que o jogador mais tempo olha para o personagem.
- **Correção de arte, sem regenerar do zero** [H]: ajustar manualmente (ou com 1 `edit_image`/`correct_pixelart` dirigido) os quadros onde o visor cobre totalmente o olho, para que ele fique parcialmente visível em todos os 4 quadros do idle (ou totalmente coberto em todos — qualquer das duas opções, desde que **consistente**). Para a massa, suavizar a curva de respiração entre os 4 quadros (reduzir o salto de q1→q2 em S e N). Custo estimado: baixo, dentro da mesma ordem de grandeza da correção da fivela já registrada como risco pelo C15a (0,1–0,3 gerações, ou ajuste manual local gratuito).

## 4. Pé de apoio e escorregamento — reconfirmação com método próprio [E]

Rodei meu próprio script de leitura dos PNG (bloco de contato mais próximo entre quadros consecutivos, sem intervenção humana na identidade do pé — diferente do C14.4-B, que atribuiu a identidade à mão).

| | Recuo médio | Escorrega (a 5 px/quadro) | Observação |
|---|---|---|---|
| v2 E (meu método) | 1,67 px | 66,7% | Trocas de pé detectadas em q4→q5 e q7→q0 |
| v2 W (meu método) | 3,92 px | 21,7% | **Salto de +8 px em q3→q4**, não marcado como troca de pé pelo meu critério — é o mesmo trecho irregular que o C14.4-B descreveu manualmente em q3→q5 |
| v2 E (C14.4-B, manual) | 2,2 px | 56% | — |
| v2 W (C14.4-B, manual) | 3,1 px | 38% | — |
| v1b, mesmo passo (meu método) | 1,3 px | 74% | — |
| v1b, mesmo passo (C14.4-B) | 2,0 px | 60% | — |

**Leitura:** os números absolutos de "escorregamento %" divergem entre o meu método (automático) e o do C14.4-B (manual) — esperado, porque identificar qual bloco de pixel é "o mesmo pé" de um quadro para o outro é ambíguo por natureza quando os pés se cruzam ou há duplo apoio, e os dois métodos resolvem essa ambiguidade de forma diferente. **O que os dois métodos concordam** é o essencial: (a) o v2 tem recuo maior e mais irregular que o v1b no mesmo passo, (b) há um trecho de salto grande e anômalo no W entre q3 e q5 (meu q3→q4), não visto no E. Trato isso como **confirmado qualitativamente, não um novo número definitivo**.

**Severidade:** P2, mesma do C14.4-B §9 — decisão do fundador/game-art entre aceitar, pedir passada mais longa e uniforme, ou aceitar passo menor (~25–30 ms). Não é meu papel escolher.

## 5. Profundidade, sombra, âncora, rótulo (regressão) [E]

Rodei minha rota de 16 paradas (`qa_scripts/c143/prof.mjs`) perto de árvores, moitas, grama alta e flores, com o Tamer de comparação e o Agumon ligados.

- **Ordem de desenho correta** nos casos vistos: Tamer na frente do Hawkmon quando está mais perto da câmera (quadros 0, 1, 2); Hawkmon na frente do Tamer quando está mais perto (quadros 9, 13, 14); grama alta com pés/corpo coerentes com os tufos (quadro 6).
- **Sombra** elíptica de contato visível e centrada sob os pés, igual ao relatado (`pivô 30,49`, `rx19/ry7`).
- **P3 reconfirmado (igual ao Q4 da fase21):** o rótulo "Kaio Nv.12" do Tamer cai sobre o corpo do Hawkmon quando ele está logo atrás (visível nos quadros 0 e 12 da minha rota, e também nas minhas capturas reais de tela — ver §6).
- **NÃO VALIDADO:** Hawkmon passando atrás de uma copa de árvore cheia. Nem minhas 16 paradas nem as 16 do C14.4-B pegaram esse caso. Mesma limitação da fase21.
- **0 erros, 0 falhas de rede** na rota.

### Modos de URL (regressão funcional)

Testei `&parceiro=agumon`, `&comparar=0`, `&parceiro=agumon&comparar=0`, `&hawkms=73` e padrão — em cada um: carga, 1,5 s andando, `Tab`, nova leitura.

| Modo | HUD depois do Tab | Erros | Rede |
|---|---|---|---|
| padrão | Ativo: Agumon Nv.20 · Reserva: Hawkmon Nv.8 | 0 | 0 |
| `&parceiro=agumon` | Ativo: Hawkmon Nv.20 · Reserva: Agumon Nv.8 | 0 | 0 |
| `&comparar=0` | Ativo: Agumon Nv.20 · Reserva: Hawkmon Nv.8 (1 jogador só) | 0 | 0 |
| `&parceiro=agumon&comparar=0` | Ativo: Hawkmon Nv.20 · Reserva: Agumon Nv.8 | 0 | 0 |
| `&hawkms=73` | Ativo: Agumon Nv.20 · Reserva: Hawkmon Nv.8; faixa mostra "walk ~73 ms/quadro (URL)" | 0 | 0 |

- **`Tab` troca o parceiro ativo corretamente** (HUD inferior muda) em todos os modos.
- **P3 reconfirmado (igual ao Q3 da fase21):** a faixa roxa do topo **não** atualiza o texto "parceiro X" depois do `Tab` — continua mostrando o parceiro de antes da troca, mesmo com o HUD já correto. Confirmado nos 5 modos.
- `&hawkms=73` muda a cadência e o texto da faixa corretamente.

## 6. Capturas reais de tela (screencast, não reconstrução) [E]

Rodei o roteiro de screencast real do game-dev (`capturas_b.mjs`, só leitura, sem tocar no jogo) nas 4 direções, com tag própria `qa_v2_independente`: 209–211 quadros de screencast por direção, 0 erros, 0 falhas de rede.

Evidências salvas em `qa_v2/`:
- `tela_inicio_qa_v2_independente.png`, `tela_juntos_parados_qa_v2_independente.png` — telas inteiras reais do jogo, Hawkmon v2 ao lado do Tamer, do Tamer de comparação e do Agumon F7v2.
- `walk{E,W,N,S}_qa_v2_independente.gif` — recorte 3× em volta do Hawkmon e do Agumon, tempos reais do screencast (~19 ms por quadro de captura).
- `cena_walk{E,W,N,S}_qa_v2_independente.gif` — cena larga do mapa real, 2×.
- `walk{E,W,N,S}_meio_qa_v2_independente.png` — uma tela do meio de cada clipe.

**Leitura visual destas capturas [H]:** confirmo que o Hawkmon v2 lê como uma ave vermelha/branca/amarela, reconhecível e distinta do Agumon (laranja) e do Tamer, com a sombra visível. **A escala relativa** (Hawkmon visivelmente menor que o Agumon e do tamanho/abaixo do Tamer) é visível nestas capturas — é o G-2 já aberto no contexto comum, não um problema novo desta arte, só reconfirmado com a arte v2 também.

## 7. Fidelidade do visor/óculos ao Hawkmon oficial — questão levantada, não resolvida [H]

Na minha leitura das rotações e animações, a área dos olhos do Hawkmon v2 tem um elemento que leio como um **visor/óculos escuro**, cobrindo total ou parcialmente os olhos conforme o quadro (§3). Pelo meu conhecimento geral da espécie, o Hawkmon oficial (Digimon Adventure 02) não usa óculos ou visor — tem olhos grandes expressivos, sem esse elemento. Não tive acesso nesta tarefa às fichas de anatomia (`etapa6-lab/fase11-fichas-anatomia/`) nem às referências REF-01 a REF-05 do protocolo `GS-003-DIGIMON-REFERENCE-GATE` para comparar lado a lado — então isto fica como **leitura [H], não comparação pixel a pixel**.

Não encontrei, no `RELATORIO_C15A.md` nem no `RELATORIO_C15B.md`, nenhuma citação ao protocolo GD-072 nem a um `DIGIMON-REFERENCE-REPORT`. A base é descrita como "referência gerada no ChatGPT sob direção do Vitor" — o que **pode** já ser a aprovação do fundador prevista pelo protocolo (uma decisão do fundador tem precedência sobre o protocolo padrão, por regra do próprio estúdio), mas isso não está documentado explicitamente nos relatórios que recebi para esta auditoria.

**Não decido isso.** Registro como pergunta para o fundador/game-studio: (a) confirmar se o visor é intencional e aprovado como parte da nova direção visual "estilo ChatGPT", ou (b) se é uma leitura errada minha, ou (c) se precisa de correção para se aproximar mais do Hawkmon oficial. Severidade: **P2** (decisão, não bug técnico).

## 8. Notas (8 critérios da régua da fase21; paleta fora, G-1 aberto; escala Tamer/Digimon, G-2 aberto)

Régua idêntica à usada no `QA_BUILD_HAWKMON_INDEPENDENTE.md` (fase21), para permitir comparação direta. Notas [H], apoiadas nas medições [E] dos §2–7.

| # | Critério | v1b a 50 ms (fase21, projeção) | **v2 a 50 ms (como entregue)** | Motivo |
|---|---|---:|---:|---|
| 1 | Fidelidade ao Hawkmon | 8,25 | **7,0** | Topete, leque, bico e faixa presentes e reconhecíveis (como a nota indicativa do game-art). Reduzo por causa do visor/óculos de fidelidade não confirmada (§7) e por ele cintilar entre quadros (§3), o que prejudica a leitura "é sempre o mesmo Hawkmon" |
| 2 | Qualidade GBA Plus | 8,0 | **7,75** | Pixel art limpo, 0 semitransparência (conferido pelo C15a/C15b, não reverifiquei pixel a pixel), estilo coerente com Agumon/Tamer no mapa real (§6). Leve desconto pela mesma cintilação |
| 3 | Fluidez | 8,0 | **8,25** | 50 ms confirmado 100% estável nos q5-q6 (nenhuma oscilação, melhor que o v1b no mesmo passo) |
| 4 | Consistência anatômica | 8,5 | **6,5** | Âncora fixa (pé sempre em y=49, 0 tremor vertical — confirmo isso), mas dentro do próprio ciclo do idle há salto de massa (S, N) e troca de visibilidade do olho (E, S) entre quadros — o achado novo do §3 |
| 5 | Legibilidade no jogo | 8,0 (projeção) | **7,75** | Lê bem no mapa real, cores distintas do Agumon/Tamer (capturas reais, §6); escala pequena frente ao Agumon/Tamer (G-2, aberto, não é culpa desta arte) |
| 6 | Custo e tempo | 8,5 | **8,25** | C15a 0,8 + C15b/C15b-2 13,75 geração — dentro dos tetos de cada brief, com retrabalho documentado (ordem errada de filtros, idle por template reprovado) mas sem desperdício fora do previsto |
| 7 | Transições | 7,75 | **7,75** | Mesmo motor, mesmo comportamento conhecido (entrada/saída no meio do ciclo) — não achei motivo para mudar a nota |
| 8 | Ausência de regressões | 8,75 | **8,75** | Isolamento total confirmado (Database, 5196, worktrees), 0 erros em 11 sessões próprias, Agumon/Tamer/`WORLD` sem mudança, Q2 da fase21 (Agumon travado em N/S) confirmado corrigido |
| | **Média** | 8,22 (projeção) | **7,78** (62,25/8) | Meta ≥8 na média: **não**. Critérios abaixo de 8: quatro (1, 2, 4, 5). GS-010: **não** |

Segunda régua (Style Bible v13/v15 + refs do fundador): **NÃO VALIDADO** — não reabri as referências formais nesta sessão; minha leitura do §7 é conhecimento geral da espécie, não comparação contra as fichas de anatomia do estúdio.

## 9. Pronto?

- **Para o ChatGPT e o Vitor verem: sim**, mas **não** como "pronto, só falta confirmar" — como um build com uma pergunta central nova além da cadência. Recomendo enviar junto com este QA e os GIFs/pranchas de `qa_v2/`, destacando:
  1. **A cadência de 50 ms está resolvida e boa** — não precisa mais discutir isso para o v2.
  2. **A cintilação do idle (§3)** é o ponto que eles devem olhar primeiro, de preferência no jogo real (não só nas pranchas), porque é mais perceptível ao vivo, no personagem parado, do que em quadros estáticos.
  3. **O visor/óculos (§7)** — perguntar diretamente se é intencional/aprovado.
  4. O escorregamento do pé (§4) já estava registrado como pergunta aberta pelo C14.4-B; meu método próprio confirma a irregularidade, sem mudar a decisão pendente.
- **Não homologado para produção.** A média da régua (7,78) ficou abaixo de 8, com quatro critérios abaixo de 8 (um deles, consistência anatômica, caiu de 8,5 para 6,5 por causa do achado novo). Isso não significa "rejeitar a direção v2" — a base visual (topete, leque, bico, cores) está bem encaminhada e a cadência está resolvida; significa que **a animação do idle precisa de um ajuste de arte antes de uma nova rodada de nota**, que deve ser barata (mesma ordem de grandeza da correção da fivela já prevista pelo C15a).

## 10. O que não foi feito

- Não alterei código, arte nem assets do jogo. Não usei o PixelLab. Não publiquei nada.
- Não comparei a arte v2 pixel a pixel contra as fichas de anatomia oficiais (REF-01 a REF-05) nem contra o Style Bible/v13/v15 — não tive esses arquivos abertos nesta sessão; o achado do §7 é leitura [H], não medição.
- Não testei monitor de 120/144 Hz (ambiente headless).
- Não capturei o caso de Hawkmon atrás de copa de árvore cheia (mesma limitação da fase21).
- Não reexecutei a rota de profundidade nem as capturas para o v1b (`&hawk=v1b`) nesta sessão — confio no que o C14.4-B já mediu para a comparação v2×v1b de pivô/sombra/canvas (valores idênticos reportados), e verifiquei só o v2 de forma completa, que é o objeto desta tarefa.
- Não investiguei a fundo por que meu método automático de rastreio do pé diverge em magnitude do método manual do C14.4-B — registrei a divergência e o que os dois concordam (§4), sem tentar decidir qual método é "mais certo": ambos têm limitações conhecidas (atribuição manual vs. ambiguidade de pareamento automático).
- Corrigi, para mim mesmo, um problema de ambiente (proxy HTTP interceptando o DevTools local) que não é do jogo; registrei em §0 para não se repetir.

## 11. Decisões do fundador / ChatGPT

1. Confirmar ou pedir correção da cintilação do idle (§3) — correção de arte, custo baixo, não precisa regenerar do zero.
2. Confirmar se o visor/óculos é intencional e aprovado para o Hawkmon (§7), ou se precisa ajuste de fidelidade.
3. Escolha já registrada pelo C14.4-B sobre o escorregamento do pé (§4): aceitar como está, pedir passada mais longa/uniforme, ou aceitar passo menor.
4. Itens já conhecidos, sem mudança: rótulo do Tamer sobre o Hawkmon (P3), faixa que não atualiza após o Tab (P3), escala Tamer/Digimon (G-2, aberto), paleta Endesga-32 (G-1, aberto, não se aplica a sprite de criatura segundo o Style Bible).

## 12. Evidências e roteiros

**Pasta:** `fase23-c14-4-f5/qa_v2/`:
- `walk_qa_v2_padrao.json`, `walk_log_qa_v2_padrao.json`, `walk_analise_qa_v2_padrao.json` — cadência medida (§2).
- `pe_apoio_arte.json` — recuo/escorregamento do pé, v2 e v1b, meu método (§4).
- `pes_walk_EW_8x.png` — pés ampliados 8×, v2 e v1b, E/W, régua de x.
- `full_idle_{S,E,N,W}.png`, `zoom_idle_{S,E,N,W}.png`, `full_walk_E.png`, `zoom_walk_{S,E}.png` — pranchas que embasam o achado do §3.
- `prof.json`, `prof_folha.png`, `prof/*.png` — rota de profundidade e 5 modos de URL (§5).
- `tela_inicio_qa_v2_independente.png`, `tela_juntos_parados_qa_v2_independente.png`, `walk{E,W,N,S}_meio_qa_v2_independente.png` — telas reais.
- `walk{E,W,N,S}_qa_v2_independente.gif`, `cena_walk{E,W,N,S}_qa_v2_independente.gif` — screencast real, 4 direções (§6).

**Roteiros usados** (fora do jogo, só leitura, reexecutáveis):
- `workspaces/game-dev/tools/h143/{walk,analisa,pe_v2,pe_zoom,capturas_b}.mjs` — do game-dev, lidos e executados com `QA_OUT` próprio, sem alteração.
- `workspaces/game-qa/qa_scripts/c143/prof.mjs` — meu, da fase21, reexecutado contra o build v2.
- Scripts de medição de bbox e de zoom da cabeça (§3) foram escritos ad-hoc nesta sessão e descartados após gerar as imagens; os PNG gerados ficaram em `qa_v2/` (os de zoom da cabeça, mais pesados de regenerar, foram movidos deste workspace para lá — ver nota abaixo).

**Nota sobre os arquivos de apoio em `workspaces/game-qa/qa_scripts/c143/_view/`:** usei essa subpasta só para carregar imagens no meu visualizador durante a auditoria (o visualizador não enxerga caminhos fora do meu workspace). As imagens finais citadas acima já estão copiadas para `qa_v2/`; a pasta `_view/` pode ser apagada sem perda.
