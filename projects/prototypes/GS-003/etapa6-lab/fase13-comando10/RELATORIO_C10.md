# RELATÓRIO C10: polimento final do Agumon v7, vista lateral

**Digital Odyssey (GS-003) · game-art · 2026-11-14 · custo PixelLab: 0 gerações** (saldo 573,95 depois da tarefa; nenhuma ferramenta de geração chamada)
Brief: `etapa6-lab/BRIEF_COMANDO_10.md` · Comando: `COMANDO_10_POLIMENTO_AGUMON.md`
Legenda: **[E]** medido ou visto nesta sessão · **[L]** lido de relatório anterior · **[H]** hipótese.
**Não integrado ao jogo. Nada do jogo, do F2b ou da Knowledge Base foi alterado.** Esta é uma autoavaliação; a nota vale só depois do game-qa (sessão separada).

---

## 0. DIGIMON-REFERENCE-REPORT

| Item | Conteúdo |
|---|---|
| Espécie e forma | Agumon, Child/Rookie, réptil, Vaccine. Sprite do jogo: Agumon v7 (F2b), personagem PixelLab `4afbc5c8-198b-48ce-948d-f87fce747e96` |
| Fontes consultadas | `fase11-fichas-anatomia/FICHA_AGUMON.md`; oficiais em `fase12-comando9/f1/imagens/oficiais/`: `dw3/dw3_agumon_13315.gif` (DW3, lado), `ds_dawndusk/sr40907_agumon.png`, `wsc_digitalpartner/sr121215_agumon.png` (perfil); QAs `f2/QA_F2_INDEPENDENTE.md` e `f4/QA_F4_INDEPENDENTE.md`. As oficiais foram só olhadas; nenhum pixel delas entrou no sprite (os scripts não abrem essa pasta) |
| Obrigatório (lado) | bípede ereto em "S"; focinho em cunha; 1 olho verde; cabeça do mesmo tamanho em todo quadro; braços curtos pendendo à frente do corpo, mão aberta com garras brancas; pés grandes e chatos com garras brancas; cauda curta-grossa saindo para trás; laranja único, barriga só um pouco mais clara |
| Proibido | listras, crista, espinho, barriga branca/cinza, acessório, postura quadrúpede |
| Riscos | criar um "quarto estilo" ao redesenhar membros; mexer na cabeça/olhos aprovados; deslocar âncora/escala; abrir diferença de desenho entre caminhada, rotação e ataque laterais |
| Critérios | cabeça idêntica nos 8 quadros; sola única; oscilação ≤ F2b; 0 cor nova; 0 semitransparência; 0 pixel na borda; O = espelho exato de L; braço que sai do contorno do tronco; pés distintos nos quadros de apoio duplo; passagem com um pé no ar |

## 1. O que mudou

**Pacote novo:** `fase13-comando10/pacote_agumon_c10/` (mesmo formato, nomes e canvas do F2b). **Backup do F2b:** `fase13-comando10/backup_f2b/` (+ `backup_f2b_sha256.txt`; conferi: backup e F2b original intactos [E]).

| Arquivo | Mudança |
|---|---|
| `walk/E` (8 quadros) | **Recomposta.** Cabeça, pescoço e cauda = pixels do próprio F2b walk/E q0. Tronco, braço e pernas redesenhados em pixel (script `scripts/walk_e_c10.py`, formas definidas à mão, cores só da paleta do pacote) |
| `walk/W` | espelho exato da nova E |
| `rotations/E` e `W` | pose de pé com o mesmo tronco/braço/pernas da caminhada (antes: braço colado e outro desenho de cabeça, 88% igual). **Opcional**, ver §5 |
| `attack/*`, `walk/S`, `walk/N`, `rotations/S`, `rotations/N` | inalterados, cópia byte a byte do F2b [E] |
| `hibrido_agumon_S_c10/ataque_A_saida_q8/` | híbrido D (F4) com a saída pelo F2b q8, como o QA F4 sugeriu. Pasta nova; o F4 não foi tocado |

**Por item do comando:**
- **Braços:** o braço próximo agora é um membro com contorno, 3 px de espessura, ombro, cotovelo e mão com 2 garras brancas, que sai 2 a 4 px à frente da barriga. Três poses (atrás/meio/frente) balançam em oposição à perna próxima. O braço de longe aparece atrás do corpo, em tom de sombra, com só a mão à mostra quando o próximo está recuado.
- **Pernas:** ciclo clássico de 8 quadros: contato, descida, passagem, subida, para cada perna. O pé plantado recua **4 px por quadro, constante** (37→33→29→25→21), o que dá deslocamento real. O pé no ar passa 3 px acima do chão e à frente do pé de apoio. Coxa grossa e pé grande com garras, como a ficha pede. Perna próxima no laranja do corpo; perna de longe no laranja de sombra.
- **Tronco:** peito avançado 1 px e barriga arredondada. O degrau entre o queixo e o peito caiu de 6 px para 4 px. Fechado um furo de contorno no pescoço (x35, y31 no F2b).
- **Cauda:** mesmo desenho do F2b q0 nos 8 quadros, presa ao corpo. Só acompanha o sobe-e-desce (antes trocava de forma entre quadros: ponta em 36/34/33/35/37/35/35/33).
- **Saída do ataque (F4-1):** testada e adotada (§3).
- **Fogo perto da boca:** testado e **rejeitado** (§3).

## 2. Métricas (walk E, F2b × C10) [E] (`scripts/metricas_c10.py`, `metricas_c10.json`)

| Medida | F2b | C10 |
|---|---|---|
| Canvas, quadros | 60×60, 8 | 60×60, 8 |
| Oscilação: amplitude do centróide | 1,5 px | **1,5 px** (igual) |
| Oscilação: topo da cabeça | 9/9/11/11/10/9/10/9 (amp 2) | 9/10/9/8/9/10/9/8 (amp 2, ritmo regular de 4 quadros) |
| Pixel mais baixo (âncora) | 49 ou 50 | **49 em todos os 8** |
| Cabeça idêntica ao q0 (só translação) | 1 de 8 | **8 de 8** |
| Pés distintos no chão nos quadros de apoio duplo (q0, q3, q4, q7) | 1 grupo em q0/q3/q4 (pés fundidos) | **2 grupos** em q0/q3/q4/q7; 1 grupo em q1/q2/q5/q6 porque um pé está no ar |
| Corte entre quadros (px mudados) | 234–424 (irregular) | 374–410 (regular) |
| Cores no walk E | 39 | **24** |
| Cores fora da paleta do pacote F2b | 0 | **0** |
| Semitransparentes / px na borda / componentes soltos | 0 / 0 / 1 corpo | 0 / 0 / 1 corpo |
| O = espelho exato de L | sim | **sim** |
| Altura das rotações (G-2) | S 35, N 39, E 41 px | S 35, N 39, E 41 px (inalterada) |

**Escala (G-2) [E]:** Agumon (Rookie) 35 px de altura no S, 39 no N, 41 no E (com a cauda). Tile 32: ~1,1 a 1,3 tile. Tamer e Champion não fazem parte desta tarefa e não foram medidos. Conflito de escala continua **aberto**.
**Paleta [L]:** nenhuma cor nova entrou; a medição Endesga-32 × v13/v15 não foi refeita (o conflito G-1 continua aberto e fora da nota).

## 3. Ataque S (híbrido D): saída e fogo [E] (`scripts/hibrido_saida_c10.py`)

| Variante | Cortes q5→q6→q7→q8 | Topo q6/q7/q8 | Leitura |
|---|---|---|---|
| F4 (antes) | 191 → **493** → 141 | 13 / 11 / 11 | estalo: troca de traço e sobe 2 px de uma vez |
| **C10 A: sai pelo F2b q8** | 191 → **393 → 354** | 13 / 11 / 11 | a troca se divide em dois passos, os dois abaixo do maior corte interno do v3 (406). Os números batem com a previsão do QA F4 §1.4 |
| C10 B: A + bola do q3 subida 5 px | — | — | **rejeitada**: a bola fica emaranhada com o queixo e a boca; subir o fogo borra a boca e o queixo (`REJEITADO_ataque_B_fogo_boca/`). Sem gerar nada não dá para separar o fogo do corpo de forma limpa |

Registro conferido: o D q3–q6 é o F2b q4–q7 deslocado (+3, −5), 0 px de diferença. **A subida de 2 px continua** (vem do próprio v3, F2b q7→q8); o C10 só divide a troca de traço. O q7 novo tem a sobrancelha franzida do v3. Precisa ser visto em movimento pelo QA.

## 4. Notas (autoavaliação, régua do QA F2/F4: fidelidade, animação, consistência anatômica, legibilidade; paleta fora)

| | Fidelidade | Animação | Consistência | Legibilidade | Média |
|---|---|---|---|---|---|
| Walk lateral F2b (antes) | 7,5 | 7,0 | 7,0 | 7,5 | **7,25** (fundador: 7,8 preliminar) |
| **Walk lateral C10** | 8,0 | 8,5 | 8,5 | 8,0 | **8,25** |
| Ataque S híbrido D, saída (F4 7,4 [L]) | = | +0,25 [H] | +0,25 [H] | = | **~7,6** [H], sem ver no QA |

**Meta 8,5: não chego pela minha conta (8,25).** Por quê:
- **Pernas mais simples que o resto do sprite.** São desenhadas por forma (coxa e canela arredondadas, pé em degraus), com sombreado de um tom. Leem bem a 1× e a 2×, mas a 4× ficam mais "lisas" que a cabeça do v7. Em alguns quadros a coxa de trás cola visualmente na base da cauda.
- **O braço tem contorno marrom fechado por dentro do tronco**, que a 4× lê como um laço. A 1× lê como braço. O realce interno quase não aparece.
- **Ataque lateral (attack/E e W) continua com o braço colado e o tronco antigo.** No jogo, ao atacar de lado, o desenho do tronco muda. É a maior inconsistência que sobra.
- A passada ficou um pouco menor e mais "metódica" que a do F2b, que era mais larga e mais irregular.

## 5. Regressões e riscos

| ID | Sev. | O quê |
|---|---|---|
| C10-R1 | P2 | attack/E e W com tronco/braço antigos, diferentes do walk e da rotação E novos |
| C10-R2 | P3 | Rotação E/W trocada: a cabeça agora é a da caminhada (era 88% igual). O idle E do rig (F3) foi montado sobre a rotação **antiga** e não foi refeito. Se o fundador preferir, o pacote volta a usar a rotação F2b (cópia no backup) e só a caminhada muda |
| C10-R3 | P3 | Braço: laço de contorno escuro a 4×; realce fraco |
| C10-R4 | P3 | Quadros de contato: a perna de trás (dedo apoiado) fica perto da base da cauda e as duas massas se aproximam a 1× |
| C10-R5 | P3 | Linha de sola em 2 a 3 linhas nos quadros de calcanhar ou ponta (contato e empurrão); o pixel mais baixo é sempre 49 |

Nenhuma cor nova, nenhuma mudança de canvas, de quadro, de escala ou de âncora (pixel mais baixo = 49, como no F2b).

## 6. Arquivos

`etapa6-lab/fase13-comando10/`
- `pacote_agumon_c10/`: pacote completo, drop-in no lugar do F2b (não integrado)
- `antes_depois_lateral_4x.png` (walk E q0–q7 + rotação E, antes e depois), `antes_depois_lateral_2x.png`, `antes_depois_lateral_1x.png` (escala de jogo)
- `walk_lateral_antes_depois_4x.gif` e `_1x.gif` (lado a lado, 110 ms)
- `walkE_F2b_1x.gif`, `walkE_F2b_4x.gif`, `walkE_C10_1x.gif`, `walkE_C10_4x.gif`, `walkW_C10_4x.gif`
- `comparacao_S_N_E_W_walk_4x.gif` e `_1x.gif` (as quatro caminhadas juntas, âncora pela base), `comparacao_rotacoes_S_N_E_W_6x.png` (S, N, E C10, W C10, E F2b)
- `hibrido_agumon_S_c10/ataque_A_saida_q8/` (9 PNG + delays), `hibrido_ataqueS_saida_antes_depois_4x.gif`, `_3x.png`; `REJEITADO_ataque_B_fogo_boca/`
- `metricas_c10.json`; `scripts/` (reexecutáveis: `build_pacote_c10.py`, `walk_e_c10.py`, `hibrido_saida_c10.py`, `metricas_c10.py`, `entregas_c10.py`)
- `backup_f2b/`, `backup_f2b_sha256.txt`

## 7. O que não foi feito

- **Não integrei** e não abri o jogo. Âncora e desempenho no jogo: NÃO VALIDADO.
- attack/E e W não foram tocados (fora do foco do brief; ver C10-R1).
- Não vi os GIFs em movimento: o visualizador mostra quadro parado. A fluidez foi julgada por folha quadro a quadro e por métrica.
- Não refiz Endesga-32 nem `pixelart_workbench score`.
- Nenhum outro agente foi acionado; nada da Knowledge Base do game-research foi tocado.

## 8. Alternativas para chegar a ≥ 8,5 (antes de qualquer geração)

1. **Custo 0, ~1 h:** aplicar o mesmo tronco/braço aos quadros neutros do attack/E (q0, q1, q8) e retocar à mão as pernas (2 tons de sombra, dedos separados), além de abrir o laço do braço. Estimo +0,25 a +0,4 [H].
2. **Custo 0:** decidir C10-R2 (rotação nova ou antiga) e, se for a nova, refazer o idle E do rig sobre ela.
3. **Com geração (precisa de autorização):** usar a rotação E C10 como quadro inicial para um `animate_character`/v3 de caminhada lateral e polir por cima. Estimo 1 a 2 gerações por direção [H]; o resultado volta para o mesmo polimento manual.

## 9. Decisões do fundador

1. Aceitar a rotação E/W nova (coerente com a caminhada) ou manter a do F2b (C10-R2).
2. Autorizar a alternativa 1 (custo 0) para o attack lateral e o acabamento das pernas.
3. Saída do ataque S pelo F2b q8: adotar depois do QA em movimento.
4. Fogo do Pepper Breath no peito (S): sem gerar, não dá para levá-lo à boca de forma limpa (variante B rejeitada).
5. Conflitos abertos da Etapa 6 (paleta, escala, critério unificado) continuam abertos, sem decisão nesta tarefa.
