# QA — Prova de escala Guilmon v3 (`phase2/art/scale-proof-v3/`, commit `53f6c5d`)

- **Autor:** game-qa, papel VISUAL-QA (GS-010 §9) · **Data:** 2026-11-10
- **Revisão independente** de `phase2/art/scale-proof-v3/` (README, `pipeline-m1/` — rotações south/south-west, idle-S 4 quadros, walk-S 6 quadros, 64×64, Pro Flash por texto). Este QA não aprova nem reprova — registra evidência para a decisão do fundador (ADR-012 §3). **Nenhum arquivo de arte foi alterado.** Zooms/crops usados nesta revisão foram gravados só em `workspaces/game-qa/scratch/` (fora da árvore de arte).
- **Comparado com:** M2 (`phase2/art/scale-proof-v2/pipeline-m2/`), o rip (`board/ref/guilmon_rip_idle_30x34.png`), `evidence/drakantos-video/` + `docs/DRAKANTOS_VISUAL_STUDY.md` (referência de linguagem de sombreamento/luz — é material de mapa/ambiente, não tem um sprite de criatura equivalente para diff direto), e meus QAs anteriores (`QA_GUILMON_PROTO.md`, `QA_SCALE_PROOF.md`).
- **Metodologia:** decoder PNG puro-stdlib próprio (`workspaces/game-qa/scratch/analyze_v3.py`, mesmo padrão do `compose_board.py` da própria prova) para medir bounding box de pixels visíveis (alpha>0), contagem exata de cores e diff entre quadros — zero custo, zero chamada ao PixelLab. `web_search` indisponível nesta sessão: **não consegui verificar contra arte oficial canônica do Guilmon** (mesma limitação do autor da prova); a avaliação de identidade usa o rip como âncora de projeto + conhecimento geral de treinamento, marcado [H] onde não há fonte verificável nesta sessão.

---

## 1. Achado novo, não reportado no README: a altura do corpo **cai** da rotação estática para os quadros animados

A hipótese do pedido era que o corpo ocupa "~40px" do canvas de 64. **Não ocupa — e o número muda conforme o estado:**

| Arquivo | bbox altura | bbox largura | px visíveis | Nº cores |
|---|---:|---:|---:|---:|
| `rotations/south.png` (estática) | **32px** | 25px | 479 | 17 |
| `rotations/south-west.png` (estática) | 35px | 35px | 529 | 31 |
| `idle-s/frame_000..003.png` (média) | **24–28px** | 15–16px | 253–293 | 23–25 |
| `walk-s/frame_000..005.png` (média) | **27–29px** | 17px | 295–307 | 25–28 |

O corpo animado ocupa só **53–64% da área de pixels** da rotação estática (idle: 253–293/479; walk: 295–307/479), e a largura cai quase pela metade (25px→15-17px). Comparei com o M2 (v2) para saber se isso é normal do `animate_character` em geral: lá a queda é muito menor — idle fica em 78% da área estática, walk em 87–88% (`rotations/south.png` 1544px → `idle-s` ~1209px médio, `walk-s` ~1354px médio). **No M1 a queda é quase o dobro da do M2.** Ambas as chamadas de animação usaram `ai_freedom=0` (confirmado em `pixellab_cost_log.csv`), então não é "liberdade criativa" explicando a diferença — é um comportamento do próprio `animate_character` template sobre este personagem específico, consistente nos 10 quadros (variância interna pequena: idle 24–28px, walk 27–29px). **Risco direto de produção:** se `south.png` for usado como referência de tamanho (ex. tela de seleção de personagem, ícone), o sprite em jogo (idle/walk) vai aparecer visivelmente menor — um "pulo" de escala ao entrar em movimento. O README não testou nem mencionou essa discrepância; só mediu cor em `south.png`/`south-west.png` (§4 do README), nunca nos quadros animados.

## 2. Clusters e sombreamento — ganho real e verificável, a parte mais forte da prova

Zoom ×8 em `south.png` e `south-west.png` confirma as contagens do README (17 cores no south, 31 no south-west — bati os números de forma independente, exatos). Inspeção visual do crop ampliado mostra: rampa de vermelho em 3 tons reais no corpo (`#e55538`→`#b6381d`→`#86230f`, não blocos chapados), orelhas com sombra própria separando-as da cabeça, olho com pupila visível (não mancha de 1-2px, defeito que persistia desde o piloto e a v2), garras com 2-3 tons de cinza, cauda com faixas escuras legíveis. Isso é uma melhora clara e mensurável sobre o M2 (4 cores no south, chapado) e sobre o piloto original (`QA_GUILMON_PROTO.md`: olhos nunca formaram cluster legível em nenhuma via testada até agora — **aqui formam**). Ainda não chega ao padrão Drakantos completo (`DRAKANTOS_VISUAL_STUDY.md`: luz ambiente colorida, múltiplas fontes de luz) porque é 1 sprite isolado sem cena/iluminação de mapa — mas no nível "banda de sombreamento por material", a meta foi atingida pela primeira vez nas 3 provas.

## 3. Identidade — reconhecível, mas com desvios reais, inclusive em relação ao próprio rip do projeto

Comparei lado a lado (zoom ×8) o M1 contra o rip nativo (`guilmon_rip_idle_30x34.png`, a âncora de projeto, já que não há arte oficial canônica disponível nesta sessão):

- **Mantido:** paleta (vermelho/creme/preto/amarelo), silhueta bípede com cauda grossa, marcas pretas triangulares no corpo e cauda, garras claras nas patas.
- **Desviado:** as orelhas do rip são achatadas/tipo "barbatana" inclinada para trás; no M1 elas ficam eretas e pontudas, lendo mais como orelha de raposa/gato do que o formato do rip. O focinho/snout do rip (ainda que ruidoso) é mais alongado; no M1 a face é redonda, sem focinho saliente — reforça a leitura "chibi" que o próprio README admite na Seção 4. A marca do peito é um círculo preto com uma abertura/ponto claro — legível como elemento de design, mas é uma aproximação de texto, não derivada de nenhum pixel do rip ou de referência oficial; **não consigo confirmar [E] se bate com o símbolo "Digital Hazard" canônico** porque não tive acesso a imagem de referência oficial nesta sessão (mesma limitação que o README já admite ter).
- **Veredito desta seção:** reconhecível como "um Guilmon", não genérico — mas a fidelidade a traços de design específicos (orelha, focinho, símbolo exato) é menor do que a do M2 (que herdava pixels do rip no south) e **não pode ser certificada como fiel ao canon** sem uma referência oficial, que eu não consegui buscar nesta revisão.

## 4. Consistência entre quadros — estável quadro-a-quadro, mas a paleta continua sem trava (3ª prova seguida com o mesmo defeito)

Inspeção visual de `walk-s/frame_000`, `frame_002` e `frame_005`: pose de caminhada plausível (pernas alternando), sem membro sumindo ou cabeça se deslocando, sem deriva de silhueta grave — nisso, igual ao que a QA da v2 já tinha confirmado para o pipeline-b64. **Mas a paleta cresce por clipe sem corte:** a união de cores de `idle-s` (4 quadros) tem **26 cores**, a de `walk-s` (6 quadros) tem **28 cores** — **10–11 cores novas em cada clipe que não existem no `south.png` estático** (verifiquei: 16/17 e 17/17 cores do south aparecem nos clipes, mas cada clipe soma dezenas de tons extras). Esse é exatamente o mesmo achado da `QA_GUILMON_PROTO.md` §5 (30→42→43 cores) e da `QA_SCALE_PROOF.md` §3 ("paleta continua crescendo sem trava — mesmo risco do piloto anterior, não resolvido") — **recomendação repetida pela 3ª vez, ainda não aplicada em nenhuma prova**: travar com `palette=`/`reduce_colors` antes de qualquer produção em escala.

---

## 5. Notas (0–10)

| Critério | Nota | Evidência principal |
|---|---:|---|
| **Identidade fiel ao Guilmon oficial** | 6/10 | Paleta/silhueta/marcas do corpo batem com o rip (§3); mas orelha, focinho e proporção "chibi" desviam visivelmente, e o símbolo do peito não pôde ser conferido contra arte oficial (sem acesso a referência canônica nesta sessão — limitação real, não nota de reprovação). |
| **Clusters / sombreamento** | 8/10 | Rampa de 3 tons real, olho com pupila, garras com gradiente, orelha com sombra própria — confirmado por zoom e contagem de cor independente (§2). Melhor resultado das 3 provas nesta métrica especificamente. Não chega ao padrão Drakantos completo (luz de cena), mas essa comparação não é 1:1 possível com um sprite isolado. |
| **Animação idle/walk** | 4/10 | Queda de 36–47% na área de pixels entre a rotação estática e os quadros animados, quase o dobro da queda equivalente no M2 (§1) — achado novo, não reportado no README, com risco real de "pulo" de escala em jogo. Só 1 de 8 direções animada (S), sem orçamento para SW (limitação já admitida). |
| **Consistência entre quadros** | 5/10 | Sem deriva de pose/silhueta grave dentro de cada clipe (§4) — ponto positivo. Mas paleta cresce 10–11 cores por clipe sem trava, 3º QA seguido a reportar o mesmo defeito não endereçado. |

**Nenhum critério atinge a meta de 9/10 (GS-010 §8).**

## 6. O método (Pro Flash por texto + animate template) serve como pipeline do piloto?

**Ainda não, como está.** O ganho em sombreamento/clusters (§2) é real e resolve a queixa original do coordenador sobre a v2. Mas dois defeitos quantificáveis e não reportados pelo README bloqueiam produção: (a) o corpo encolhe 36–47% ao animar, quase o dobro do que o M2 já tinha como problema conhecido (§1); (b) a paleta por clipe continua sem trava, 3ª vez seguida (§4). Some a isso o custo (6 gerações fixas só para o personagem completo, deixando orçamento só para 1 direção × 2 estados dentro do teto de 8) e o risco do filtro de conteúdo (mitigável, mas real) — **o pipeline não escala para um roster de 8 direções × 4 estados sem um recálculo formal de orçamento**, que nem o README nem este QA fizeram além de extrapolação.

**Para chegar a 9 em todos os critérios, falta:** (1) investigar e corrigir a queda de escala estática→animada (talvez fixar `custom_start_frame` ou testar se o problema é específico do template `breathing-idle`/`walking` vs outros templates); (2) travar paleta com `reduce_colors` pós-geração, recomendação repetida 3x; (3) comparação formal com arte oficial do Guilmon (não só o rip) antes de qualquer alegação de fidelidade — bloqueado nesta sessão por falta de acesso a busca; (4) testar em uma 2ª criatura (Dorumon/Tentomon, como o próprio README já recomenda) para confirmar que o ganho de sombreamento generaliza e não é específico do Guilmon; (5) orçar formalmente o custo de um personagem completo (8 direções × 4 estados) neste método antes de decidir se substitui o M2 como padrão de escala do roster.

---

## 7. Limitações deste QA

- Medi altura/largura/cor por **bounding box de alpha e contagem exata de pixel**, não por inspeção subjetiva — método determinístico, mas só cobre as 20 saídas desta prova (2 rotações + 4 idle + 6 walk = 12 arquivos analisados numericamente; os outros 8 quadros do board/HTML não foram recontados pixel a pixel).
- `web_search` estava indisponível nesta sessão — **não consegui comparar contra arte oficial canônica do Guilmon** (Bandai/Toei), só contra o rip do projeto (ele mesmo uma extração de terceiros, não a arte original) e contra conhecimento geral sem fonte verificável nesta revisão. A nota de Identidade (§3, 6/10) carrega essa incerteza; recomendo reconferir quando houver acesso a referência oficial.
- Não testei SW animado (não existe — sem orçamento, como o README já documenta) nem attack/hurt, nem outras 6 direções, nem outra criatura.
- A comparação com Drakantos (§2) é qualitativa, de linguagem de sombreamento — `evidence/drakantos-video/` não tem um sprite de criatura isolado no mesmo enquadramento para um diff numérico direto; não inventei um número aqui.
- Não revisei `board/compare_scale_v3.html` nem `proportion_board_v3.png` quanto a exatidão de alinhamento de pixel/escala entre as 5 peças da prancha — só quanto ao conteúdo de arte que `pipeline-m1/` entrega, que é o escopo pedido.
