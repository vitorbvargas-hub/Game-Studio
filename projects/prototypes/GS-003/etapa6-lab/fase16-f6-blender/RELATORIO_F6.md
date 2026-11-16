# RELATÓRIO F6: Blender 3D → pixel art (Comando 12)

**Digital Odyssey (GS-003) · game-art · 2026-11-14 · custo zero · PixelLab: 0 gerações, nenhuma ferramenta chamada**
Brief: `etapa6-lab/BRIEF_COMANDO_12_F6.md` (seção RETOMADA) · Legenda: **[E]** medido ou visto nesta sessão · **[L]** lido de relatório anterior · **[H]** hipótese ou opinião minha.
**Prova de conceito. Não integrado ao jogo, não homologado.** As notas do §7 são autoavaliação; só valem depois do game-qa em sessão separada.

> Este arquivo substitui o relatório das 16:13, que registrava a parada na etapa 1 (proxy bloqueava o download do Blender). A instalação foi resolvida fora desta sessão; o diagnóstico antigo continua em `scripts/check_egress.sh`.

## 1. Resultado

**O pipeline funciona de ponta a ponta e é barato, mas o Agumon que ele entrega hoje não alcança o F2b em fidelidade de desenho.**

- **O que o 3D resolve bem [E]:** anatomia igual nas 4 direções por construção; cabeça idêntica nos 8 quadros da caminhada em S, E e N; pé de apoio recuando 3,0 px por quadro, constante; 15 cores, todas do F2b; 3 a 5 pixels de cor isolados por quadro contra 33 a 94 do F2b/C10; reconstrução completa em 10 s.
- **O que ele não resolve [E]:** o rosto. Falta o sorriso largo e a expressão do F2b; a cabeça ficou mais quadrada; há uma faixa escura sob o queixo que lê como coleira no S; a nuca escura e a mancha da cauda não aparecem no N; o sombreado segue a geometria das esferas e tem cara de 3D pré-renderizado.
- **Recomendação: combinar** (§8). Sozinho, não adotar.

## 2. Reference report

| Item | Conteúdo |
|---|---|
| Espécie e forma | Agumon, Child/Rookie, Reptile, Vaccine, Pepper Breath [L] (Knowledge Base; nível e atributo `reused_unverified`) |
| Fontes | `fase11-fichas-anatomia/FICHA_AGUMON.md` (lida inteira); `fase12-comando9/f1/imagens/oficiais/ds_dawndusk/sr40907_agumon.png` (olhada, proporção e cores); F2b, C10 e F4 como régua. **Nenhum pixel e nenhum modelo de terceiros entrou**: os scripts não abrem a pasta das oficiais, e o modelo é feito só de elipsoides e cones gerados por código |
| Obrigatório (ficha) | bípede ereto; cabeça ≈ 1/3 e do mesmo tamanho em toda direção; focinho em cunha; olhos verdes; 3 garras brancas por mão e por pé; cauda curta e grossa; laranja único, barriga um pouco mais clara; costas lisas, só nuca escura e mancha na base da cauda |
| Proibido | listras, crista, espinho, barriga branca, acessório, quatro patas |
| Checklist da ficha (§9) × F6 [E] | 1 cabeça igual nas 4 direções: **sim** (20 px de largura no S e no N; perfil 25 com o focinho). 2 N sem listras: **sim**, mas nuca e mancha **não aparecem**. 3 barriga laranja clara: **sim**. 4 focinho em cunha, 1 olho, cauda curta e grossa no perfil: **sim**, focinho mais curto e rombudo que o do F2b. 5 bípede, pés no chão, braços pendentes: **sim**. 6 garras brancas: **sim** nos pés e nas mãos (3 modeladas; a 60 px viram 1 a 3 px brancos). 7 sem acessório: **em risco**, a linha escura sob o queixo no S parece coleira |
| Licença | modelo, rig e scripts: `original` (do estúdio). Espécie de terceiros: fangame não oficial, sem licença, sem monetização |
| Regra "nada de 3D" do Reference Gate | resolvida pelo fundador na RETOMADA do brief: 3D pode entrar **como ferramenta**, desde que a saída seja pixel art [L] |

## 3. Passo a passo reproduzível

```
cd etapa6-lab/fase16-f6-blender
scripts/build_all.sh --blend     # Blender (modelo, rig, poses, 108 passes) + pixelização   ~10 s
python3 scripts/metricas_f6.py   # métricas de F2b, B (C10) e F6                            ~1 s
python3 scripts/entregas_f6.py   # folhas PNG e GIFs lado a lado                            ~16 s
```

| Etapa | Como foi feita | Arquivo |
|---|---|---|
| 1. Blender | já instalado: **4.5.16 LTS** oficial em `assets/tools/blender/`, sha256 `23432b06…b10c11` (do `.sha256` oficial [L]). Rodado por `run_blender.sh -b --factory-startup` | — |
| 2. Modelo | 48 peças (elipsoides, caixas arredondadas e cones), 4.996 vértices, 5.536 faces, tudo por código a partir da ficha. Unidade do modelo ≈ pixel final | `scripts/agumon_blender.py`, `modelo/agumon_f6.blend` |
| 3. Rig e animação | armature de 19 ossos; peças presas rígidas aos ossos; pernas com IK analítica de 2 ossos; caminhada de 8 quadros (apoio em 5, voo em 3 por perna); ataque de 9 quadros; câmera ortográfica a 20° (low top-down); as direções são o personagem girando | idem |
| 4. Pixelização | Workbench, sem luz, sem AA e **sem dither**, 240×240. Dois passes por pose: cor chapada por peça, e N·L + profundidade gravados em cor de vértice. Fora do Blender: voto 4×4→1, tom em 3 faixas por voto, linha interna onde há degrau de profundidade entre membros, contorno externo de 1 px, cores da tabela do F2b, limpeza de pixel isolado | `scripts/pixelize.py` |
| 5. Medidas | as do C10, estendidas para S, E e N e para os três pacotes | `scripts/metricas_f6.py`, `metricas_f6.json` |

Dependências: só o Blender e o Python do sistema com `pxpng.py` e `gifenc.py` (próprios, em `workspaces/game-art/tools/`). Nada instalado.

## 4. Entregas

| Caminho (em `fase16-f6-blender/`) | O quê |
|---|---|
| `pacote_agumon_f6/` | mesmo formato do F2b: `rotations/{S,N,E,W}.png`, `walk/{S,E,N,W}/frame_000…007.png`, `attack/{S,E,N,W}/frame_000…008.png`, canvas 60×60, `pacote.json`. W = espelho exato de E. `_W_3d_real/` guarda o W renderizado de verdade, só para comparar |
| `comparacao/rotacoes_S_N_E_W_{1x,4x,6x}.png` | rotações: F2b × B (C10) × D (F4, só S) × F6 |
| `comparacao/walk_S_N_E_W_{1x,4x}.gif` | caminhada: F2b × B × F6 nas 4 direções, 110 ms por quadro para todos |
| `comparacao/walk_{S,E,N}_folha_3x.png`, `walk_S_E_N_folha_1x.png` | os 8 quadros, lado a lado; a de 1× é a escala de jogo |
| `comparacao/ataque_S_E_{1x,4x}.gif`, `ataque_S_E_folha_3x.png` | ataque: F2b × D (F4 com saída do C10, só S) × F6 |
| `comparacao/F6_*.{png,gif}` | só o F6; `F6_W_espelho_x_W_3d_3x.png` mostra o espelho contra o W de verdade |
| `metricas_f6.json`, `raw/meta.json` | números brutos |
| `scripts/`, `modelo/agumon_f6.blend` (1,1 MB) | tudo para reproduzir |
| `PROGRESS.md` | linha do tempo |

Nas comparações todos os sprites estão em painéis de 64 px, ancorados pela base, sem reescala. O N do F2b é 56×56 e foi encaixado 3 linhas acima para a sola coincidir. O híbrido D não tem caminhada nem outras direções: só entra no S (rotação e ataque). Os GIFs do D usam aqui 110 ms fixos, não os tempos próprios dele.

## 5. Métricas [E] (`metricas_f6.json`)

**Caminhada, 8 quadros.** B (C10) só difere do F2b no E.

| Medida | F2b S / E / N | B (C10) E | **F6 S / E / N** |
|---|---|---|---|
| Oscilação do centróide (px) | 2,0 / 1,5 / 0,8 | 1,5 | **0,8 / 1,9 / 1,2** |
| Topo da cabeça, amplitude (px) | 3 / 2 / 1 | 2 | **2 / 2 / 2**, ritmo regular 0, +1, 0, −1 |
| Cabeça idêntica ao q0 (só translação) | 8 / 1 / 1 de 8 | 8 de 8 | **8 / 8 / 8 de 8** |
| Pixel mais baixo, amplitude (px) | 1 / 1 / 0 | 0 | **2 / 3 / 2** (ver limite 1) |
| Pé de apoio no modelo, vista E | não mensurável | 4 px por quadro [L] | **3,0 px por quadro nos 4 passos; tornozelo a altura constante** |
| Pixels de cor isolados, média por quadro | 94 / 40 / 46 | 33 | **5,3 / 3,3 / 5,1** |
| Cores no ciclo | 55 / 39 / 37 | 24 | **11 / 12 / 8** |
| Cores fora da paleta do F2b | 0 | 0 | **0** |
| Semitransparentes / px na borda / pedaços soltos | 0 / 0 / 0 | 0 / 0 / 0 | **0 / 0 / 0** |
| W = espelho exato de E | sim | sim | **sim** |

**Rotações e escala (G-2).**

| | F2b | F6 |
|---|---|---|
| Altura S / N / E (px) | 35 / 39 / 41 | **36 / 34 / 38** |
| Largura S / E (px) | 22 / 36 | **22 / 36** |
| Largura da cabeça S / N (12 linhas do topo) | 18 / 18 | **20 / 20** |
| Cores por rotação | 32 a 59 | **8 a 11** |
| Pacote inteiro | 254 cores | **15 cores** |

- **Escala [E]:** Agumon (Rookie) com 36 px no S, cerca de 1,1 tile de 32. Tamer e Champion não fazem parte desta tarefa e não foram medidos. O conflito de escala continua **aberto**.
- **Paleta [E]:** as 15 cores do F6 vêm todas do F2b. Contra as pranchas `paletas/P-i_endesga32.png` e `P-ii_v15b_real.png`: **0 de 15 cores exatas em qualquer uma das duas**. A mais próxima da Endesga-32 fica entre 5 e 59 de distância RGB; a v15b é paleta de floresta e não tem laranjas. O conflito G-1 continua **aberto**; não escolhi lado. Trocar a paleta é editar uma tabela em `pixelize.py`.

## 6. Tempo e limites

**Tempo de agente [E], pelo relógio da máquina:** início 17:40; primeiro render 17:46; primeira comparação lado a lado 17:56; build final 17:59; relatório fechado 18:01. Cerca de **21 min**, contra o teto de 3 h.

| Etapa | Tempo de agente (aprox.) | Tempo de máquina |
|---|---|---|
| Leitura e medidas do F2b | ~4 min | — |
| 2 e 3: modelo, rig, animação (1ª versão) | ~3 min | Blender 2,4 s (54 poses, 108 renders) |
| 4: pixelização (1ª versão) | ~2 min | 6 s |
| Iterações: 7 rodadas de forma e 3 defeitos de pipeline | ~9 min | ~10 s por rodada |
| 5: métricas e folhas/GIFs | ~3 min | 1 s + 16 s |
| Relatório | ~2 min | — |

Disco: 3,8 MB na pasta. RAM: sem pressão. O EEVEE não foi usado. O Blender imprime `EGL_BAD_MATCH` no início e segue normalmente.

**Limites encontrados [E]:**

1. **Âncora do pé.** Com a câmera a 20°, o pé de trás fica até 2,7 px acima do da frente na tela, e no S o pé que avança desce 2 px. É a perspectiva correta, mas a medida "pixel mais baixo constante" do C10 piora (amplitude 2 a 3 contra 0 a 1). No jogo a âncora teria de ser o ponto sob o quadril (linha 46), não o pixel mais baixo.
2. **Fogo no S.** A bola sai em direção à câmera e fica desenhada sobre o peito. Em 2D se trapaceia a trajetória; no 3D honesto, não. No E a origem na boca está certa.
3. **Rosto.** A 60 px, sorriso, narinas e brilho do olho são de 1 px e saem do voto de amostras, não de uma decisão de artista. O resultado é correto e sem graça.
4. **Sombreado.** As faixas de tom acompanham as esferas. Risco real de virar um **quarto estilo** ao lado do F2b.
5. **Linhas internas.** Dependem de um limiar de profundidade (2,0 unidades). Funciona para braço sobre tronco; some entre a cauda e o corpo no N e engrossa sob o queixo no S.
6. **Dither do Blender.** Vem ligado e mexia 1 a 2 níveis por pixel, fazendo a cabeça piscar entre quadros. Desligado em `agumon_blender.py`; sem isso a cabeça não fica idêntica.
7. **W espelhado** (regra do brief) inverte o lado da luz. O 3D entrega o W verdadeiro de graça; a diferença está em `F6_W_espelho_x_W_3d_3x.png`.
8. **Cada espécie nova é um modelo novo escrito à mão.** O Agumon são ~60 linhas de formas. Um Champion com chifres, placas ou asas custa bem mais [H].
9. **Sombra de contato:** não incluída no sprite, como no F2b; fica para o jogo.

**Não verificado:** não assisti aos GIFs em movimento, só olhei as folhas quadro a quadro. A fluidez da caminhada é inferida dos números e das folhas [H].

## 7. Autoavaliação nos 6 critérios (Comando 11 §5)

Opinião minha [H], apoiada nas evidências acima. Não é nota de homologação. Não dei nota a B nem a D: já têm QA próprio.

| Critério | Peso | F6 | Por quê |
|---|---:|---:|---|
| Fidelidade ao Digimon | 25% | 5 | reconhecível pela cor, olhos, garras e cauda; perde o rosto do F2b; nuca e mancha ausentes no N; risco de "coleira" |
| Qualidade visual GBA Plus | 20% | 5 | contorno duro, 15 cores, sem AA e quase sem pixel solto; mas sombreado de 3D e pouco desenho |
| Qualidade da animação | 20% | 7 | pé sem deslizar, cabeça estável, cauda com atraso por segmento, braços em oposição, igual nas 4 direções; não vista em movimento |
| Consistência anatômica | 15% | 9 | mesma malha em toda direção e todo quadro |
| Legibilidade no jogo | 10% | 6 | silhueta clara a 1×; rosto lê menos que o do F2b; fogo do S confuso |
| Tempo e custo | 10% | 9 | zero gerações, 21 min, 10 s para refazer; desconta o custo por espécie |
| **Média ponderada** | | **6,5** | abaixo do mínimo 8 da matriz |

## 8. Recomendação: **combinar**

- **Não adotar sozinho.** O F6 perde justamente no critério de maior peso, e polir o rosto dentro do 3D é brigar com a ferramenta.
- **Não descartar.** Ele acerta o que o PixelLab erra e o que o C10 consertou à mão: mesma anatomia em toda direção, cabeça que não muda, pé que não desliza.
- **Como combinar [H]:** usar o F6 como **guia de movimento e proporção**. As silhuetas e a posição de cada membro por quadro servem de base para o polimento manual (método B) ou de quadro inicial e final para o PixelLab. O rosto e o acabamento continuam vindo do sprite aprovado. Isso não foi testado aqui: seria uma tarefa nova, e a via PixelLab gasta gerações.
- **Se o fundador preferir não abrir essa frente:** reservar. O custo de manter é zero e os scripts ficam prontos.

## 9. Não feito e decisões do fundador

- **Não feito:** F7; integração ao jogo; teste da combinação do §8; Tamer e Champion; visualização dos GIFs em movimento; QA independente.
- **Não tocado [E]:** F2b (`rotations/S.png` sha256 `3385f9fb…b14c`, igual ao registrado), C10, F4, worktree `kb-gs003`, configuração do OpenClaw.
- **Para o fundador:** (1) vale abrir o teste de combinação do §8? (2) a âncora pelo ponto sob o quadril (limite 1) é aceitável no jogo? (3) W espelhado ou W verdadeiro, se o 3D for usado?
- **Para o game-qa:** conferir as notas do §7 em sessão separada, olhando os GIFs de 1× e 4×.
