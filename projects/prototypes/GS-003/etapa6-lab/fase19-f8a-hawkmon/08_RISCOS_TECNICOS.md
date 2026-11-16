# 08 · Riscos técnicos do Hawkmon (para o Comando 14)

**Digital Odyssey (GS-003) · F8A · game-research (Opus 5.5) · 2026-11-15**
Probabilidade e impacto são **[H]** (opinião minha) salvo indicação. A base de cada risco vem de um defeito que **já aconteceu** no Agumon, no Gomamon ou no Ikkakumon **[L]**, ou de um traço da anatomia do Hawkmon **[E]** (`03_FICHA_ANATOMICA_HAWKMON.md`).
Escala: P = probabilidade (B baixa, M média, A alta) · I = impacto (1 cosmético, 2 exige retrabalho, 3 bloqueia a homologação).

## 1. Orçamento e processo

| # | Risco | P | I | Base | Mitigação |
|---|---|---|---|---|---|
| R1 | **Saldo abaixo do piso** antes de terminar a pose base | A | 3 | [L] 573,95 com piso 570 (folga ≈ 4) | Orçamento explícito antes do C14 (`07` §3: teto sugerido de 22), com parada obrigatória depois da pose base |
| R2 | Segunda rodada de pose base (+10) porque nenhum dos 25 candidatos passa | M | 2 | [L] Agumon v5→v6→v7; 23 contra 18 do padrão | Prompt positivo e negativo da ficha (`03` §10); 2 referências (oficial de frente + Agumon F7v2 S como estilo); triagem pelo checklist (`03` §11) antes de qualquer outra chamada |
| R3 | Cair por limite de 5 h no meio do C14 | M | 1 | [E] esta própria F8A caiu às ~23:58 | `PROGRESS.md` por etapa; guardar candidatos e jobs no disco logo que saírem |

## 2. Identidade (o que a geração tende a errar)

| # | Risco | P | I | Base | Mitigação |
|---|---|---|---|---|---|
| R4 | **Topete some, duplica ou vira crista** (várias penas, crista de galo) | A | 3 | [L] o Agumon A ganhou crista inventada; [E] o topete é uma pena só, fina, de 1–2 px na escala A | Negativa "crest, multiple head feathers"; no polimento, o topete vira **peça separada** e é colado no mesmo ponto em todas as direções e quadros |
| R5 | **Faixa vira óculos** (goggles) ou some | A | 3 | [E] faixa escura de 3 px na altura dos olhos; o modelo "conhece" muito mais personagem com óculos do que com faixa [H] | Faixa cinza-escuro **distinta do contorno**, fivela clara no centro, olhos azuis abaixo dela (`05` §3); negativa "goggles, glasses lenses" |
| R6 | **Rosto nas costas** (N com olhos ou bico) ou costas lisas genéricas | A | 3 | [L] Agumon A: "rosto nas costas" (QA F2) | Checklist N: tira da faixa na nuca, penas vermelhas em ponta, leque da cauda, zero rosto (`04` estudo 2). Corrigir à mão se vier errado (0 geração) |
| R7 | **Pontas escuras das asas fundem com o contorno** e a asa vira braço vermelho | A | 2 | [E] 3 penas finas; [E] o DS usa `#525252`/`#181818`, separados do contorno | Rampa própria para as pontas (`05` §3, P1: `#5d5c68 #3a3944 #24232c`); no polimento, garantir ≥ 1 px de cinza entre as penas e o contorno |
| R8 | **Cabeça muda de tamanho** ao virar ou ao andar | M | 3 | [L] regra da ficha do Agumon; F2b trocava o rosto ao começar a andar (103 px na cabeça S) | Cabeça travada: mesma imagem em todos os quadros de uma direção, só deslocada (como F7: 8/8 idênticas [L]) |
| R9 | **Postura horizontal de ave** no E/W (corpo deitado, pescoço esticado) | M | 2 | [E] o Hawkmon oficial é bípede ereto, cabeça sobre o corpo; [H] modelos genéricos de "bird" puxam para a postura de ave real | Negativa "horizontal bird posture, quadruped"; referência lateral = mini do WSC (só como guia de proporção, uso interno) |
| R10 | Barriga branca, penas pretas no corpo, listras | M | 2 | [L] Agumon A: barriga branca inventada | Lista negativa da ficha (`03` §6) |
| R11 | **Escala errada na saída** (o PixelLab entrega o corpo maior ou menor que 30 px) | M | 2 | [L] D13: **não reescalar** pixel art; [H] o pro a 48 px não garante o tamanho do corpo dentro do canvas | Escolher candidato que já esteja entre 36 e 40 px de altura total; se nenhum estiver, a correção é regenerar, não reescalar. Conta para R2 |

## 3. Animação

| # | Risco | P | I | Base | Mitigação |
|---|---|---|---|---|---|
| R12 | **Walk parece voo**: as asas balançam demais e leem como bater de asas | A | 2 | [L] V2-QA-3: no Agumon F7v2, os braços abertos da walk S já lembravam "bater de asas"; no Hawkmon os braços **são** asas | Amplitude máxima de 1–2 px na ponta; asas recolhidas junto ao corpo; pés sempre no chão (`06` §0, princípio 1) |
| R13 | **Pé deslizando** na walk E/W | M | 2 | [L] QA-B7 do Agumon ainda aberto (o jogo desliza ~7–8 px por quadro na 12.2b) | Pé plantado com passo fixo de 3 px por quadro no sprite (F7); avisar o game-dev que a velocidade de deslocamento no jogo tem que bater com o passo |
| R14 | **Walk S/N "marcha no lugar"** ou pernas iguais (agachar) | M | 2 | [L] F2b: pernas iguais; F7: walk N foi a parte mais fraca | Passo alternado (um pé chato, outro em ponta); Blender (D) como gabarito se o v3 falhar |
| R15 | **Topete balança demais ou se descola** na walk e no idle | M | 2 | [H] peça fina no alto, o v3 tende a redesenhar a cada quadro | Topete por rig: atraso de 1 quadro, ±1 px (`06` §0, princípio 3) |
| R16 | **Rig das asas com luz errada** quando a peça gira ou é espelhada | M | 2 | [L] QA F3: "braço girado/espelhado com luz errada" (P2) | Não girar a asa mais que ~15°; para poses diferentes, desenhar 2–3 variações da asa em vez de girar uma |
| R17 | Piscar no N (que não tem olho) ou em quadros em que o olho é de 3 px | B | 1 | [E] olho de 3×3 a 3×4 na escala A | Piscar = linha de 1 px; só S/E/W (`06` §1) |
| R18 | Quadros com contagens de cor muito diferentes (traço do v3 ≠ traço da rotação) | M | 1 | [L] RELATORIO_F4 §5: idle 59, ataque 98, feliz 73 cores | `reduce_colors` só em conjunto (todas as animações juntas) ou mapear à paleta P1 por script (0 geração) |

## 4. Integração no jogo

| # | Risco | P | I | Base | Mitigação |
|---|---|---|---|---|---|
| R19 | **Topete passa da âncora e da colisão**, o sprite "salta" ao virar | M | 2 | [E] topete de 8 px acima da cabeça; inclina no E/W | Âncora no pé (29,5; 49), igual ao Agumon; topete fora da colisão (`05` §2) |
| R20 | **Hawkmon mais alto que o Agumon** chama atenção no grupo | M | 1 | [E] opção A: 38 px contra 35 do Agumon S (pelo topete) | É fiel ao DS (1,07 com topete [E]); se o Vitor não quiser, opção B (`05` §2) |
| R21 | Nome do Tamer ou efeito por cima do Hawkmon | M | 1 | [L] pendências da F7v2 no jogo | Herdar a correção do Agumon quando sair |

## 5. Decisões abertas que podem gerar retrabalho

| # | Risco | P | I | Base | Mitigação |
|---|---|---|---|---|---|
| R22 | **Paleta (G-1) muda depois** do Hawkmon pronto | M | 2 | [L] G-1 aberto; Agumon F7v2 com 0 cores Endesga-32 | P1 é mapeável para Endesga-32 por script se o Vitor migrar os dois (0 geração) |
| R23 | **Escala (G-2) muda depois** | M | 3 | [L] G-2 aberto | Escala A é relativa ao Agumon (0,85): se o Agumon mudar, o Hawkmon acompanha. Mas mudar a altura exige **regerar** (D13 proíbe reescalar) |
| R24 | Feather Slash no futuro exige cabeça sem topete em 4 direções e projétil com ida e volta | A (se pedido) | 2 | [E] folha do anime e Reference Book: o topete é lançado e volta | Fora do C14. Desenhar o topete como peça separada **desde o C14** já deixa a cabeça sem topete pronta (é só não colar a peça) |

## 6. Propriedade intelectual e fontes

| # | Risco | P | I | Base | Mitigação |
|---|---|---|---|---|---|
| R25 | Usar **arte de fã sem permissão** como referência direta de geração (ex.: subir a folha do Neroesaurus no PixelLab) | B | 3 | [L] Standard: "Arte de fã de terceiros sem autorização escrita do autor" está proibida | Fã só como estudo visual; a única CC BY-NC (Fenrimon) também só como estudo até o Vitor decidir (`02` §3) |
| R26 | **Sprite oficial extraído entrar no jogo** (DS, WSC, Digimon UP) | B | 3 | [L] D12: arte oficial só como referência interna | Nunca usar oficial em `direction_images` do v3 (o v3 cola a imagem como está); só como referência de estilo ou proporção |
| R27 | Imagem de referência oficial **exposta em galeria pública** de um serviço | M | 2 | [L] F5: as 2 imagens do Agumon foram para a galeria pública do Retro Diffusion (risco aceito pelo fundador, retirada pendente) | Não usar Retro Diffusion no C14; no PixelLab, conferir com o game-studio se a referência fica privada antes de subir [H, não verifiquei a política] |
| R28 | Encomenda ao Karasupx com pagamento | — | 3 | [L] nenhuma autorização de gasto | Só com aprovação do Vitor; nada enviado nesta fase |

## 7. Os 5 riscos que mais pesam

1. **R1** saldo: sem orçamento, o C14 não começa.
2. **R4** topete e **R5** faixa: são os dois traços que fazem o Hawkmon ser o Hawkmon; se a geração erra, o resto não salva.
3. **R12** walk que parece voo: o Hawkmon é o primeiro parceiro com asa no lugar de braço.
4. **R6** costas: o N já foi o ponto fraco do Agumon.
5. **R23** escala: se a decisão vier depois da produção, o custo é regerar.
