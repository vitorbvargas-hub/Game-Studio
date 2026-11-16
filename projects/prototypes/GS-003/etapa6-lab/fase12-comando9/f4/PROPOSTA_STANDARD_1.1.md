# Sprite Production Standard 1.1 — Digital Odyssey (PROPOSTA)

**Status: PROPOSTA do game-art, 2026-11-14 (Comando 9, F4). Quem homologa é o fundador.** Substitui o 1.0 (`../../SPRITE_PRODUCTION_STANDARD_1.0.md`) só depois da homologação. Não resolve os conflitos abertos da Etapa 6 (paleta Endesga-32 × v13/v15, escala Tamer/Digimon, critério unificado de qualidade): padroniza só o **como produzir**.

**Base em evidência:** comparação A/B/C/D em `RELATORIO_F4.md` e os QAs independentes `../f2/QA_F2_INDEPENDENTE.md` e `../f3/QA_F3_INDEPENDENTE.md`. As médias QA do Agumon foram: A (PixelLab cru) 5,75 · B (A + polimento) 7,25 · C (rig) 6,5 · D (híbrido) ainda sem QA.

**O que muda em relação ao 1.0:**
- entram o passo 0 (pixel art pronta), a ficha de anatomia e o rig 2D;
- o polimento passa a ter checklist e métrica;
- o v3 fica só para o que o rig não faz (andar, miolo do golpe, emoção de corpo inteiro);
- o QA independente vira passo obrigatório, com régua fixa.

---

## Passo 0 — Procurar pixel art pronta (antes de gerar qualquer coisa)

1. Procure a espécie, nesta ordem:
   - **The Spriters Resource**: folhas oficiais (DW3, DW Dawn/Dusk, WonderSwan Digital Partner e Medley, DW Championship). Se o Cloudflare pedir verificação, **não contorne**: use a cópia do Internet Archive ou deixe só o link.
   - **DeviantArt**: buscas "\<espécie\> sprite", "pixel", "overworld", "rpg maker". Leia a licença na página.
   - **Pinterest**: rendimento baixo (quase só padrão de miçanga e pin sem fonte); use só para achar pistas da fonte original.
   - **Reddit e ArtStation**: só leitura, sem conta nova e sem postar.
   - **GitHub (Digimon Up)**: só link; o repositório não tem licença.
2. Classifique cada achado no catálogo da espécie (modelo: `../f1/CATALOGO_REFERENCIAS.md`): URL, autor, tipo (`oficial`, `fã`, `fã-derivado?`), direções, resolução e licença lida na página, com data.
3. Use conforme a licença:
   - **Oficial** (Bandai/Bandai Namco): uso interno de estudo e entrada de ferramenta (D12). Não vai para o jogo nem é redistribuído. Guarde em `imagens/oficiais/` com `FONTE.txt`.
   - **Fã com licença que permite derivação** (raro; até hoje nenhuma das achadas permite): pode ser adaptada, com crédito e a camada `licensed`.
   - **Fã sem licença ou com ND/NC que impeça o uso**: só link de estudo. **Peça permissão** com o texto de `../f1/PEDIDOS_PERMISSAO.md`. Quem envia é o fundador, pela conta dele. Não peça a quem parece ter extraído sprite oficial: essa permissão não vale.
4. Se houver arte pronta com permissão escrita, no formato do jogo (4 direções, chibi de mapa): leve ao fundador **antes** de gerar. Mesmo com a permissão do artista, o uso continua sujeito à regra de IP (fangame não licenciado, sem monetização, publicação só com aprovação).
5. **Pronto quando:** existe o catálogo da espécie com licença por item e a lista de pedidos sugeridos. Nada foi enviado sem o fundador.

Custo: 0 gerações. ~20–40 min de pesquisa por espécie [H, pela F1: 6 espécies num comando].

## Passo 1 — Ficha de anatomia

1. Preencha `fase11-fichas-anatomia/MODELO_FICHA.md` para a espécie: fontes (Wikimon/Reference Book, folha de modelo, costas), postura, membros (número de garras e dedos), marcas e cores que **existem** e a **lista negativa** (o que NÃO existe: crista, listras, barriga branca, rabo de peixe...).
2. Use a ficha em dois lugares:
   - no **prompt**: as frases "keep …" e as negativas viram texto da descrição;
   - na **conferência**: o polimento e o QA checam quadro a quadro contra a lista negativa.
3. Marque [E] ou [H] em cada item. Um item [H] não reprova sprite; vira pergunta ao fundador.

Custo: 0 gerações.

## Passo 2 — Método A (geração PixelLab)

Igual ao 1.0, com dois cortes: **não gere idle** (vem do rig) e gere só o **miolo** do golpe.

1. Referência oficial de design + âncora de estilo (um Digimon já aprovado de tamanho parecido).
2. `create_image_pro` com 2 `reference_images`, sem fundo, "facing the viewer straight on". Baby 32 px, Rookie 48 px, Champion 64 px. **10 gerações.** Guarde todos os candidatos em `cand/` (os de emoção são bônus).
3. Rotação: `create_character` v3 com o candidato neutro de frente, 4 direções. **1 geração.**
4. Andar: `animate_character` v3 custom, 8 quadros, S/E/N; o oeste é `mirror_animation` (grátis). **3 gerações.** A descrição termina com "same size in every frame" e com as frases da ficha.
5. Ataque assinatura: v3 custom, S/E/N. **3 gerações.** Só os quadros do golpe interessam (disparo, efeito, recuo); a antecipação e a volta saem do rig.
6. Emoção de corpo inteiro (feliz com pulo, tristeza, susto): v3 custom, **1 geração por direção**, começando pela S. Alternativa: `animate_image` sobre um candidato de emoção já aprovado.
7. **Antes de cada geração:** `get_balance` antes e depois, confira se o asset já existe na conta e registre o custo no `CONSUMO_PIXELLAB_ETAPA6.md`.

Não usar: template genérico (`walking`, `fireball`), `skeleton-v3`, geração de Digimon pelo ChatGPT, `image_to_pixelart` sobre arte branca em fundo branco, arte de fã sem autorização escrita.

## Passo 3 — Polimento obrigatório (custo 0)

Por script (biblioteca `../f2/scripts/f2lib.py`) e, quando necessário, à mão em LibreSprite/Pixelorama. Só se reorganizam pixels do próprio sprite.

1. **Alfa binário** (0 ou 255) e **nenhuma cor fora do pacote da espécie**.
2. **Lista negativa da ficha**, quadro a quadro: apague a peça, troque a cor por uma cor do próprio sprite ou recole a peça de um quadro bom (ex.: cabeça do q0 recolada, seguindo o rosto).
3. **Ruído de cor:** unifique cores a até 10 RGB umas das outras, por animação (invisível a 1×).
4. **Linha do pé:** alinhe pela **sola** (linha mais baixa com ≥ 4 px opacos), nunca pelo pixel mais baixo, com a **trava de oscilação**: o centróide e o topo não podem oscilar mais que no original (lição F2-2/F2-3).
5. **Margem do canvas:** nenhum pixel nas linhas 0 e última; efeito não pode ser cortado pela borda (lição F2-1).
6. **Oeste = espelho exato do leste** depois das correções.
7. **Quadros do ataque:** selecione e reordene; corte o quadro deformado em vez de consertar à mão.
8. **Métricas antes e depois** (`metrics.py`, `oscilacao.py`): altura, sola, centróide, cores. Sem medida, não conta como polido.

Custo: 0 gerações. Referência: ~5 min de agente por espécie (F2) + rodada de correção pós-QA.

## Passo 4 — Rig 2D: idle, antecipação e volta (custo 0)

Motor: `../f3/rig_agumon/rig_s.py` (compor, deslocar, costurar fresta, fechar contorno, boca e piscar parametrizados).

1. **Recorte** das partes da rotação (bípede S: cabeça, tronco, 2 braços, 2 pernas; E: parte de cima, pernas, cauda em 2 segmentos). ~5–10 min de agente por direção.
2. **Idle:** respiração de 1 px (tronco e cabeça), braços com atraso de 1 quadro, pés travados e piscar. Loop de 6 quadros, ~1,2 s.
3. **Antecipação do golpe:** **no máximo 2 quadros**: agachar 1 px; agachado com braços 1 px para fora e boca nível 1. Nada de "inclinar para trás" de frente (não lê; QA F3 5,5).
4. **Volta ao neutro:** 1–2 quadros (braços 1 px para fora e boca nível 1 → neutro = idle q0).
5. **Regras:** só translação inteira. Giro de 90° e espelho de peça **não** entram enquanto o fundador não decidir (QA F3 §7, item 1); se entrarem, a peça precisa ser redesenhada com a luz correta. Nada de reescala ou interpolação. As cores da boca vêm do `attack/S` do mesmo pacote.
6. **Não use o rig** para pulo, emoção de corpo inteiro, andar ou qualquer animação de quadrúpede que mova as patas.

## Passo 5 — Montagem híbrida

Script de referência: `scripts/build_hibrido.py`.

1. **Canvas comum** por espécie, grande o bastante para o pulo da emoção (Rookie: 64×64), e **âncora única na sola**. Meça os deslocamentos pelo casamento de pixels com a rotação; não chute.
2. Monte:
   - **idle** = rig;
   - **ataque** = antecipação do rig + miolo v3 polido + volta do rig;
   - **emoção** = v3 polido + volta ao neutro (q final = rotação).
3. Polimento da emoção: unifique a boca com a do ataque (a mesma espécie tem uma boca só) e leve cada cor fora do pacote à cor mais próxima do pacote.
4. **Checagem da emenda:** a largura do crânio é igual em todos os quadros; a sola é igual nos quadros de chão; há 0 cores fora do pacote. Registre os pixels mudados na emenda e compare com o maior corte interno do v3 (Agumon: 604 contra 406 na entrada e 493 contra 393 na saída). Se a emenda passar de 2× o maior corte interno, desenhe à mão um quadro intermediário.

## Passo 6 — QA independente (obrigatório)

1. **Quem avalia:** o `game-qa`, ou outra sessão que não produziu. O game-art não aprova o próprio trabalho; a autoavaliação vai ao relatório marcada como tal.
2. **Régua:**
   - ficha da espécie (lista negativa);
   - critérios fidelidade, estabilidade, limpeza e legibilidade;
   - leitura a 1× e a 4×, **em movimento** (GIF ou página) e sobre o fundo do mapa.
   - Paleta: medida contra o Style Bible e contra v13/v15, e fora da nota enquanto o conflito G-1 estiver aberto.
3. **Aprovação:**
   - 8 = pronto para integração de teste;
   - homologação = régua GS-010 (média ≥ 9 e nenhuma categoria < 8);
   - P0/P1 reprova; P2 novo introduzido pelo polimento bloqueia até a correção.
4. **Depois do QA:** rodada de correção (como a F2b) e **nova checagem do QA**. Correção sem recheck não fecha o ciclo.

## Passo 7 — Empacotar e integrar

1. Pacote: `rotations/{S,E,N,W}`, `walk/…`, `attack/…`, `idle/…`, `emocao_<nome>/…`, com `delays_ms.txt`, `origem.txt` por animação e `pacote.json` com o log de polimento.
2. Camada de licença no pacote (`private-prototype` para PixelLab nesta fase) e créditos.
3. O game-dev integra 1:1, sem reescalar, ancorando pela sola. Só com OK do fundador.

---

## Custo por espécie (proposto)

| Item | Gerações | Observação |
|---|---|---|
| Passo 0 (pesquisa) e passo 1 (ficha) | 0 | tempo de pesquisa |
| Base: `create_image_pro` + rotação v3 | 11 | |
| Andar S/E/N (+ W espelho) | 3 | |
| Miolo do ataque S/E/N (+ W espelho) | 3 | |
| Emoção de corpo inteiro | 1 por direção | S primeiro (1); 4 direções = 3 |
| Idle, antecipação e volta (rig) | 0 | economiza 3 gerações de idle v3 por espécie |
| Polimento, montagem e QA | 0 | tempo de agente: ~30–45 min por espécie [H] |
| **Total por espécie** | **18** (só a emoção S) a **20** (emoção em S/E/N) | o Agumon real custou 23 com as iterações |
| **Linha de 3 formas** | **~54–60** | contra ~45–50 do 1.0, que não contava idle nem emoção |
| Teto de regeneração | +3 a +6 por espécie | ver regra abaixo |

## Quando gerar de novo em vez de polir

**Polir** (custo 0) quando o defeito é de **peça ou acabamento**:
- peça que aparece ou some (crista, chama solta, rosto nas costas);
- cor errada em parte do corpo (pé marrom, garra vermelha, barriga branca);
- artefato, pixel solto, ruído de cor;
- pé desalinhado, oscilação, efeito cortado pela borda;
- quadro deformado que pode ser substituído por outro quadro da mesma animação.

**Gerar de novo** quando o defeito é de **desenho**, ou seja, qualquer um destes:
1. **O corpo é outro:** proporção, cabeça ou silhueta diferente da rotação em metade ou mais dos quadros (ex.: ataques do Gomamon vindos do v1).
2. **Anatomia errada em todos os quadros e contra a ficha** (ex.: cauda longa do Ikkakumon, se o fundador confirmar o item da ficha; costas em "X" do Gomamon).
3. **A pose não comunica a ação** e não há quadro aproveitável para reordenar (ex.: fogo saindo do peito, se o fundador exigir o Pepper Breath saindo da boca).
4. **O conserto exige redesenhar à mão mais de 3 quadros** da animação, ou passa de ~30 min de agente por animação.
5. **Depois do polimento, o QA dá fidelidade < 7** na animação (o teto prático do polimento medido foi ~7,5).

**Limite:** no máximo **2 regenerações por animação**. Se a segunda também falhar no QA, pare e leve ao fundador com as duas tentativas, em vez de gastar mais.

## Decisões pendentes do fundador (antes de homologar)

1. Homologar o pipeline D (híbrido) e este documento como Standard 1.1.
2. Giro de 90°, espelho e cisalhamento inteiros no rig: aceitar ou não (QA F3).
3. "Paleta do sprite" = paleta da direção ou do pacote (QA F3).
4. Emenda rig ↔ v3: aceitar como está ou exigir um quadro intermediário à mão (~10–15 min por espécie).
5. Conflitos da Etapa 6 (Endesga-32 × v13/v15, escala Tamer/Digimon, critério unificado): continuam abertos e fora deste documento.
6. Envio dos pedidos de permissão do passo 0: pela conta do fundador.
