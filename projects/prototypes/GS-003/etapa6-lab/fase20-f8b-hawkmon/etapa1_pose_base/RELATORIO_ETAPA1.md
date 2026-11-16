# RELATÓRIO · Comando 14 · F8B Hawkmon · ETAPA 1 (pose base S)

**Digital Odyssey (GS-003) · game-art (Fable 5.2) · 2026-11-15** · Brief: `etapa6-lab/BRIEF_COMANDO_14_F8B_HAWKMON_ETAPA1.md`
**[E]** medido ou visto por mim · **[H]** opinião minha. Esta é a entrega do produtor: **não é aprovação**. Quem avalia é o game-qa, depois o ChatGPT e o Vitor.

## 1. Resumo
- 1 chamada paga: `create_image_pro` 64×64, 16 candidatos, **10 gerações**. Saldo **573,95 → 563,95** [E]. Teto da etapa (12) e piso (562) respeitados. Nenhuma segunda geração (não cabia no piso).
- Os 16 candidatos reconhecem a espécie, mas **todos saíram com 59–62 px de altura** [E]: o modelo ignorou os "38 px" do texto e preencheu o canvas.
- Top 3: **cand_00**, cand_08, cand_09.
- Base polida: **redução manual, pixel a pixel, do cand_00 para 22×38** (30 de corpo + 8 de topete), 100% na paleta P1, topete em camada separada. Custo: 0 gerações.
- Nada de rotação, animação ou integração. Parei aqui.

## 2. DIGIMON-REFERENCE-REPORT (antes de gerar)
1. **Espécie e forma:** `sp.hawkmon` · Hawkmon · Child/Rookie · Bird · Free · sem variante (nada de Armor, Aquilamon ou versões de fã).
2. **Fontes consultadas:** `fase19-f8a-hawkmon/03_FICHA_ANATOMICA_HAWKMON.md`, `05_PROPOSTA_DE_ESCALA.md`, `09_RECOMENDACAO_ARTISTICA.md` (game-research; citam Reference Book, folha do anime e DS). A KB não tem ficha do Hawkmon (registrado na F8A); não abri a KB.
3. **Referências visuais abertas por mim:** folhas oficiais DS Dawn/Dusk (`sr40896`) e Digimon World DS (`sr48517`), mais as duas pranchas da F8A. Não abri o Reference Book nem a folha do anime (só link na F8A).
4. **Obrigatórias (ficha §9):** topete único vermelho/amarelo; faixa escura com fivela prata; olhos azuis com V vermelho e traços na bochecha; bico amarelo curvo; gola branca em zigue-zague; corpo vermelho sem barriga clara; 3 pontas escuras por asa; pés amarelos com garras brancas.
5. **Divergências conhecidas entre fontes:** cor do vermelho e da cabeça (ficha §5). Direção aprovada para o protótipo: P1, vermelho intermediário, cabeça creme quente.
6. **Direção de arte:** escala A (38 px), P1, topete separado: a do brief, sem nada novo.
7. **Animações:** nenhuma nesta etapa.
8. **Riscos:** IP (fangame sem licença; arte oficial só como referência interna, enviada ao PixelLab conforme o brief e o ADR-011); paleta (G-1) e escala (G-2) seguem **abertas** na Etapa 6, aqui só vale "aprovado para o protótipo".
9. **Critério:** checklist `03` §11, itens da vista S (2, 5, 6, 7).

## 3. Geração
| Item | Valor |
|---|---|
| Ferramenta | PixelLab `create_image_pro`, job `71cced11-2425-4080-a99f-5abe8893173f`, asset `c7f6928a-fd7e-5fbb-abd6-5f00aefaa910` |
| Canvas | 64×64, fundo transparente, 16 candidatos |
| Custo | 10 gerações (recibo e saldo conferem) |
| Paleta | P1 travada (24 cores do `05` §4) |
| Referências (upload por `get_upload_url` + `curl -F`, funcionou) | `refs_enviadas/ref1…` sprite de batalha DS Dawn/Dusk, 78×80 (anatomia e cores) · `ref2…` mini DS 28×37 (proporção em escala pequena) · `ref3…` Agumon F7v2 S 60×60 (só estilo) |
| Prompt | o da ficha §10, com pose de frente, asas recolhidas, "about 38 pixels tall" e a lista negativa embutida (texto completo no recibo do job) |

Desvio do brief, para registro: o brief fala em "uma folha oficial"; enviei **dois recortes da mesma folha** (um sprite por imagem), porque uma folha inteira com várias poses confunde o modelo [H]. Nenhuma arte de fã foi enviada.

## 4. Candidatos (`candidatos/folha_candidatos_1x.png` e `_4x.png`; ordem 0–15, linha a linha)
| Cand. | Altura × largura [E] | Leitura [E, a olho] |
|---|---|---|
| **00** | 61 × 36 | Frente, olhos abertos, asas recolhidas, pés no chão. Todos os traços. |
| 01, 02 | 61 × 36 / 32 | Frente, mas **olhos fechados**. |
| 03 | 60 × 36 | Cabeça em 3/4, topete inclinado. |
| 04 | 61 × 46 | 3/4, uma asa aberta. |
| 05, 06 | 61 × 33 | 3/4 inteiro. |
| 07 | 61 × 44 | Frente, acenando. |
| **08** | 61 × 40 | Frente, olhos abertos, asas um pouco afastadas. |
| **09** | 60 × 38 | Frente, olhos abertos, **pés pendurados** (pose de voo). |
| 10 | 61 × 56 | Frente, asas abertas, olhos fechados. |
| 11 | 61 × 40 | Frente, olhos fechados. |
| 12, 13 | 61 / 59 × 31 | 3/4. |
| 14 | 62 × 30 | 3/4, cabeça baixa, olhos fechados. |
| 15 | 59 × 33 | Quase de costas (sem rosto). |

Todos [E]: 21–24 cores, todas da P1; 0 pixels semitransparentes. Nenhum com óculos, barriga clara, crista múltipla ou rosto errado. Em todos, o V vermelho ficou **acima** da faixa (a ficha aceita) e a cauda não aparece de frente (a ficha prevê).

## 5. Top 3 (`top3/`)
1. **cand_00** — único que cumpre a pose pedida inteira: frente pura, olhos azuis abertos, asas recolhidas com pontas escuras para baixo, dois pés no chão com garras claras, fivela centrada, gola em zigue-zague, topete reto de 2 cores.
2. **cand_08** — mesma leitura de rosto, mas as asas afastam do corpo (silhueta mais larga, 40 px) e os ombros caem mais. Serve de segunda opção.
3. **cand_09** — rosto e faixa bons, olhos abertos; os pés ficam soltos no ar, então é pose de salto, não de parado. Entrou no lugar dos de olhos fechados porque olho azul é traço obrigatório.

Úteis depois (não são top 3): cand_01/02 (olhos fechados, para o piscar do idle) e cand_15 (ideia de costas). São referência, não asset.

## 6. Base polida (`base_polida/`)
- `base_S_corpo.png`, `base_S_topete.png`, `base_S_composto.png` (22×38, origem comum, 1×) e os três em `_4x.png`.
- Fonte editável: `scripts/base.py` (grade de texto, uma letra por cor da P1; `scripts/pal.py`).
- **Como foi feita:** não há redução automática. Redesenhei o cand_00 pixel a pixel em 22×38, mantendo desenho, cores e posição das peças. É honesto chamar de **redesenho guiado pelo candidato**, não de "limpeza".

| Medida [E] | Valor |
|---|---|
| Tamanho | 22 × 38 px (corpo 30, topete 8) |
| Cabeça | 12 px de altura (40% do corpo), 18 de largura com contorno |
| Cores | 19, **todas da P1**; 0 semitransparentes |
| Contra a Endesga-32 (Style Bible) | **0 de 19** cores exatas (o conflito G-1 segue aberto; a P1 foi a aprovada para o protótipo) |
| Simetria | espelhada, exceto 4 pares (sombra do topete) |
| Escala (G-2) | Tamer 41 px · Agumon (Rookie) 35 · **Hawkmon (Rookie) 38 (30 sem topete)** · Champion: não existe ainda. Razão para o tile 32: 1,28 / 1,09 / 1,19 |

Comparações: `comparacao/antes_cand00_depois_base_*.png` (candidato × base) e `comparacao/escala_tamer_agumon_hawkmon_*.png` (Tamer A cabelo preto 41 px, Agumon F7v2 S, Hawkmon, sobre faixas de tile 32).

## 7. Problemas e limites (para o game-qa)
1. **Escala do gerador:** nenhum candidato veio em 38 px. A base é trabalho manual meu; a fidelidade ao candidato é a olho.
2. **Proporção mudou na redução [H]:** a base ficou mais atarracada que o cand_00 (cabeça proporcionalmente mais larga, pernas com só 2 linhas visíveis, ombros menos caídos). Está mais perto do mini do DS que do candidato.
3. **Bico:** de frente, lê como triângulo para baixo; o gancho só vai aparecer de lado.
4. **Olhos:** 3×3 px; azul visível a 1×, mas menos expressivos que no candidato.
5. **Pontas das asas:** 3 penas separadas por contorno, com 4 linhas de altura; leem como "dedos" curtos. A ficha pede penas longas.
6. **Fivela:** 4×3 px com centro escuro. A 1× é um ponto claro na faixa; o risco de "óculos" me parece baixo [H], mas é o QA que decide.
7. **Tufos laterais e cauda:** tufos de 1 px (quase não leem); cauda ausente na vista S.
8. **Largura 22 px**, 1 acima da faixa 18–21 da proposta (igual à do Agumon S).
9. **Não medido:** leitura dentro do jogo, sobre cenário real, e sombra de contato (é o jogo que desenha).
10. **Contagem de "pixels soltos":** 85 pixels sem vizinho da mesma cor, quase todos detalhes de 1 px desenhados de propósito (garras, olhos, separadores das penas). Não é ruído de geração, mas o QA pode achar o rosto carregado.

## 8. Não feito (de propósito)
Rotação N/E/W, walk, idle, pacote.json, integração, Retro Diffusion, qualquer outra geração.

## 9. Depende de decisão
- game-qa → ChatGPT → Vitor: aprovar ou não a base antes da Etapa 2.
- Se a proporção atarracada não agradar, dá para ajustar à mão sem custo (afinar a cabeça para 16 px ou subir as pernas 1 px).
- Orçamento restante do C14: 12 de 22 gerações; saldo 563,95, piso 552.

---

## 10. Correções E1b (2026-11-15, após o QA independente)

Origem: `QA_ETAPA1_INDEPENDENTE.md` §5 (nota 7,0; veredito "ajuste pequeno e gratuito antes da rotação"). **Custo: 0 gerações. PixelLab não foi usado.** A v1 (`base_polida/`) não foi alterada (hashes de `sha256.txt` conferem para os PNG).

- Saída: `base_polida_v2/` — `base_S_corpo.png`, `base_S_topete.png`, `base_S_composto.png` (tela 22×38, mesma origem da v1) e os três em `_4x.png`; `grade_v2.txt`; `metricas_v2.json`; `sha256_v2.txt`.
- Fonte editável: `scripts/base_v2.py` (meia grade espelhada, importa o topete de `base.py`); comparações e métricas: `scripts/entrega_v2.py`.
- Comparações: `base_polida_v2/comparacao_v1_v2_cand00_agumon_{1x,4x}.png`, `silhuetas_v1_v2_cand00_agumon_4x.png`, `escala_tamer_agumon_v2_v1_{1x,4x}.png` (Tamer, Agumon, v2, v1 sobre tile 32).

### 10.1 O que mudou, por item do QA

| # QA | Sev. | Feito na v2 | Status |
|---|---|---|---|
| 1 Pernas | P1 | Tronco vermelho encurtado (de 11 para 7 linhas abaixo da gola); **4 linhas de haste amarela** (linhas 31–34), 2 px por perna, afastadas 2 px. Total continua 38. | Feito |
| 2 Silhueta em trapézio | P1 | Cabeça 14 px; gola 16; ombros 18; pontas das asas 20 (**largura máxima 20**). Quadris afunilam; as penas escuras descem abaixo do tronco, ao lado das pernas, como no cand_00. | Feito |
| 3 Olhos | P1 | 3×3 com pupila no centro, brilho de 1 px no canto de fora, **pálpebra escura de 3 px em cima**. Sem azul em diagonal. Expressão neutra/determinada. | Feito |
| 4 Volume | P2 | Sombra sob a gola e nas laterais do tronco (`#b82a2a`, `#7e1b1f`), `#4a1015` entre as pontas da gola e na borda da asa, `#7a7066` no queixo, `#24232c` na ponta da pena, `#b9bdc6` na garra interna. **24 de 24 tons da P1 em uso.** | Feito |
| 5 Bico em gancho | P2 | Bico de 5 linhas que afina para baixo, com **2 px `#7c4512` na ponta**. Narina: não coube sem sujar. | Feito (sem narina) |
| 6 Tufos | P2 | Pixels soltos removidos; cada tufo = 2 px brancos com contorno, colados ao canto da cabeça. | Feito |
| 7 V vermelho | P3 | V de 4 px (2 em cima, 2 no vértice) acima da fivela. | Feito |
| 8 Gola | P3 | 5 pontas brancas separadas por contorno escuro; o zigue-zague aparece a 1×. | Feito |

Mantidos: paleta P1, topete em camada separada (idêntico ao da v1), faixa com fivela, 3 pontas escuras por asa, pés amarelos com 3 garras.

### 10.2 Métricas [E] (definições do QA; também conferidas com `qa_independente/medir.py` sobre uma cópia da v2)

| Medida | v1 | **v2** | Alvo do QA |
|---|---|---|---|
| Altura × largura | 38 × 22 | **38 × 20** | 38 × ≤ 21 |
| Corpo / topete | 30 / 8 | 30 / 8 | 30 / 8 |
| Cabeça: largura ÷ largura máxima | 18/22 = 0,82 | **14/20 = 0,70** | cand_00: 0,69 |
| Perfil (largura por linha, corpo) | 22 constante por 10 linhas | 14 (cabeça) → 16 → 18 → 20 (asas) | trapézio |
| Linhas de haste de perna | 1–2 | **4** (31–34) | ≥ 3 |
| Área opaca | 572 | **484** | — |
| Área ÷ Agumon F7v2 S (582) | 0,98 | **0,83** | 0,80–0,90 |
| Cores | 19, todas P1 | **24, todas P1**, 0 semitransparentes | P1 |
| Tons da P1 sem uso | 5 | **0** | — |
| Cores exatas da Endesga-32 | 0 | 0 (G-1 segue aberto; não julgado) | — |
| Pixels sem vizinho da mesma cor | 85 | 103 | — |
| Simetria | 4 pares diferentes (topete) | 4 pares diferentes (topete) | — |

Escala (G-2, aberta): Tamer 41 px · Agumon (Rookie) 35 · Hawkmon (Rookie) 38 (30 sem topete) · Champion: não existe. Razão para o tile 32: 1,28 / 1,09 / 1,19. Sem mudança em relação à v1.

### 10.3 Limites da v2 (para o re-QA)
1. **Das 4 linhas de perna, só 1 (linha 34) fica sem nada ao lado**; nas linhas 31–33 as pontas das asas descem ao lado das pernas (como no cand_00), separadas por 1 px vazio nas linhas 32–33. A perna lê, mas o "vão" entre asa e perna é estreito.
2. **Pixels isolados subiram de 85 para 103**: são os tons de volume e o detalhe do rosto. O rosto está carregado (V, faixa, pálpebra, bochecha em 14 px de largura) [H].
3. **Cabeça ainda quadrada** [H]: 14 px constantes por 9 linhas; os tufos nos cantos podem ler como "orelhas" a 1×.
4. **Bico mais estreito e alto** que o da v1 (4 px de largura); a narina ficou de fora.
5. Pontas das asas continuam curtas (3–4 linhas), leitura de "dedos" não foi resolvida por completo.
6. Volume: melhor que a v1, ainda abaixo da densidade do Agumon F7v2 (24 cores contra 59).
7. Não validado: leitura no jogo, sobre cenário real, sombra de contato.
8. Esta seção é autoavaliação do produtor. **Não vale como aprovação**: falta o re-QA independente.

### 10.4 Não feito
Rotação, animação, pacote, integração, qualquer geração. `sha256.txt` não foi regenerado (os hashes de `PROGRESS.md` e `RELATORIO_ETAPA1.md` nele ficaram desatualizados por esta edição; os da v2 estão em `base_polida_v2/sha256_v2.txt`).

### 10.5 Depende de decisão
- game-qa: re-QA rápido da v2 (alvos da §7 do QA).
- Fundador (via game-studio): qual base segue para a Etapa 2 (v1 ou v2); massa visual 0,83 do Agumon (parte de G-2).
