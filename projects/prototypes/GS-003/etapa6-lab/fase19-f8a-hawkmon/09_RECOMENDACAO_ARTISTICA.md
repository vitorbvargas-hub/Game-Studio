# 09 · Recomendação artística e plano de produção (A–F)

**Digital Odyssey (GS-003) · F8A · game-research (Opus 5.5) · 2026-11-15**
É uma **recomendação**, não uma decisão. Escala (G-2) e paleta (G-1) continuam **conflitos abertos da Etapa 6**; a escolha é do Vitor, depois da revisão do ChatGPT. O C14 só começa com a direção aprovada e o orçamento de créditos aprovado.
**[E]** visto ou medido · **[L]** lido em relatório ou QA do estúdio · **[H]** opinião minha.

## 1. Direção de arte em uma página

| Tema | Recomendação [H] | Alternativa | Onde está o detalhe |
|---|---|---|---|
| **Escala** | **A — proporção oficial do DS:** corpo 30 px + topete 8 = **38 px** (Tamer 41, Agumon S 35) | B: 35 px, nunca passa do Agumon | `05` §2 |
| **Paleta** | **P1** (~24 cores, rampas do pacote do Agumon) | P2 Endesga-32, só se os dois parceiros migrarem | `05` §4 |
| Vermelho | intermediário (entre o bordô do anime e o vivo do Reference Book) | bordô (anime) ou vivo (Reference Book) | `05` §4 |
| Cabeça | creme quente (anime) | branco-azulado (Reference Book / batalha do DS) | `05` §4 |
| Contorno | 1 px, escuro quente; contorno interno seletivo | — | `05` §3 |
| Luz | de cima e de frente, sem lado preferido; sombra feita pelo jogo | — | `05` §5 |
| Detalhe | 3–4 tons por material, sem antisserrilhado semitransparente, sem dithering | — | `05` §3 |
| Direções | S, N, E desenhados; **W = espelho de E** (espécie simétrica; a fivela não aparece de lado) | desenhar W se surgir assimetria | `04` |
| Quadros | rotação 1 · idle 6 (~150–200 ms) · walk 8 (~110 ms), como o Agumon | — | `05` §7, `06` |

**Os 8 traços que não podem sumir** (`03` §9): topete único; faixa com fivela (tira na nuca nas costas); olhos azuis com marcas vermelhas; bico amarelo curvo; gola branca em zigue-zague; 3 pontas escuras em cada asa; pés amarelos com garras brancas; cabeça do mesmo tamanho em todas as direções.

**O que muda em relação ao Agumon [H]:**
1. O topete é a peça mais frágil do sprite e a mais importante para reconhecer a espécie. Tratar como **peça separada** desde o início (serve também para a Feather Slash no futuro).
2. Os braços são asas: a walk tem que ser **mais contida** que a do Agumon, senão lê como voo (R12).
3. De lado, o Hawkmon quase não alonga (cabeça e corpo redondos). A silhueta E/W depende do **bico em gancho, do topete para trás e da cauda curta**.

## 2. Comparação dos 6 métodos para a anatomia do Hawkmon

Notas do Agumon são **[L]** (QAs independentes). A coluna "Hawkmon" é **[H]**: como cada método se comporta com topete fino, faixa pequena e asa no lugar de braço.

| Método | No Agumon [L] | Ponto forte para o Hawkmon [H] | Ponto fraco para o Hawkmon [H] | Gerações (C14) | Uso recomendado |
|---|---|---|---|---|---|
| **A** PixelLab Método A | 5,75 (QA F2 "antes") | Único que cria a pose base e as direções a partir da arte oficial; 25 candidatos dão escolha | Inventa peças (crista, rosto nas costas, barriga branca); redesenha o topete a cada quadro | 14–20 | **Base:** pose, rotação e walk S/E/N |
| **B** A + polimento | 7,25 (QA F2 "depois") | Conserta exatamente os riscos R4–R10 sem gastar: topete, faixa, pontas das asas | Teto ~7,5 sem gerar de novo [L]; diagnóstico por espécie | 0 | **Obrigatório** depois de A |
| **C** Rig 2D | 6,5 (idle S 7,5) | Cabeça travada e topete com atraso **por construção**; idle de respiração é o ponto forte do rig | Asa girada com luz errada (R16); recorte manual de 5–10 min por direção | 0 | **Idle** nas 4 direções; peça "topete" |
| **D** Blender como referência | F6: fidelidade 4,5, consistência e custo 8,5 | Gabarito de pé plantado e de oposição asa/perna; corpo esférico é fácil de modelar | Asas com 3 penas e topete custam modelagem; **não serve como asset** [L] | 0 | **Opcional:** só se a walk S/N do v3 falhar |
| **E** Retro Diffusion | F5: 6,4, "reservar" | — | Saldo grátis esgotado; cabeça instável e pé deslizando no teste; exposição em galeria pública (R27) | US$ 5 mín. | **Não usar** no C14 |
| **F** Híbrido F7 | F7v2: 7,78 ponderado; 7,63 no jogo | Junta o melhor de cada um; scripts prontos (pé plantado 3 px/quadro, âncora, pacote.json) | Recortes e máscaras são por espécie; ainda não chegou a 8 no Agumon | 0 | **Montagem final** |

**Por que não escolhi pelo custo:** o caminho mais barato seria só C + D (0 gerações), mas nenhum dos dois cria a identidade da espécie: o rig precisa de um sprite pronto para recortar e o Blender ficou em 4,5 de fidelidade [L]. O A é o único que gera a pose base fiel; o gasto está nele e é inevitável se o sprite for nosso.

## 3. Pipeline recomendado (A → B → C → F, D de reserva)

| Passo | Método | O quê | Saída | Ponto de controle |
|---|---|---|---|---|
| 1 | A | `create_image_pro` 48 px, 2 referências: arte oficial de frente (uso interno, D12) + Agumon F7v2 S (estilo); prompt da ficha (`03` §10) | 25 candidatos | **Parada 1:** checklist `03` §11 em cada candidato; altura total 36–40 px; sem candidato bom → volta ao Vitor (não gastar a 2ª rodada sem ok) |
| 2 | B | Limpar o candidato escolhido; mapear à paleta P1 (ou à aprovada); conferir faixa ≠ óculos, pontas das asas ≠ contorno | pose base S | ChatGPT/QA olha a pose base antes de seguir (C14 §1) |
| 3 | A | `create_character` v3 com a pose base, 4 direções | S, N, E (+W) | **Parada 2:** N sem rosto, E sem postura horizontal; refazer no máximo 1 vez |
| 4 | B | Polir rotações: **mesma cabeça** nas 4 direções (só o desenho muda com a vista), topete como peça separada colada no mesmo ponto | 4 rotações | Medir: cabeça do mesmo tamanho; topete no mesmo ponto de fixação |
| 5 | A | Walk v3 custom S, E, N, 8 quadros ("wings stay folded close to the body, feet always touch the ground, same size in every frame, head feather stays on the head") | walk bruta | Se S/N vier em "marcha no lugar" ou com pernas iguais → passo 5b |
| 5b | D (reserva) | Gabarito de pernas do Blender para a walk S/N | pose por quadro | — |
| 6 | B + F | Cabeça da rotação colada em 8/8 quadros; topete com atraso de 1 quadro; E/W com pé plantado 3 px/quadro (scripts da F7); W espelho | walk 4 direções | Cabeça idêntica 8/8; pé de apoio fixo; âncora estável |
| 7 | C | Idle por rig: respiração 1 px, piscar (S/E/W), topete e cauda com atraso, pontas das asas 1 px | idle 4 direções | Sem olho no N |
| 8 | F | `pacote.json` no formato do Agumon (60×60, âncora 29,5; 49, tempos) | pacote | Validação do QA |
| 9 | — | QA independente (game-qa) → ChatGPT → Vitor | — | Régua do C14 §6 |

Créditos e tempo deste pipeline: `07` §3 e §4 (realista 17 gerações; teto sugerido 22; 2 h 30 a 4 h de agente).

## 4. O que fica fora do C14, mas já está decidido no plano

- **Ataque simples = Beak Pecker** antes da Feather Slash (`06` §9).
- **Feather Slash** depois, com projétil separado no padrão do Pepper Breath; o topete-peça do passo 4 já resolve a cabeça sem topete.
- **Voo** só como animação; voar no mapa é mecânica e as regras estão congeladas.
- **Arte pronta:** não existe sprite do Hawkmon no formato do jogo (`02` §0). Se o Vitor quiser seguir pelo caminho do artista, a prioridade é o **Karasupx** (único no formato exato), mas isso pode envolver pagamento e está fora da autorização atual.

## 5. Decisões para o Vitor (com recomendação)

| # | Decisão | Recomendação [H] |
|---|---|---|
| 1 | Escala A, B ou C | **A** (38 px, proporção oficial do DS) |
| 2 | Paleta P1 ou P2 | **P1** (coerência com o Agumon) |
| 3 | Vermelho e cor da cabeça | intermediário; creme quente |
| 4 | Pipeline | **A → B → C → F**, D de reserva, E fora |
| 5 | Orçamento do C14 | teto de **22 gerações** com parada depois da pose base; exige baixar o piso de 570 ou comprar (folga atual ≈ 4) |
| 6 | Pedidos a artistas (nenhum enviado) | Karasupx (encomenda/permissão), Fenrimon, Neroesaurus + paburo1; texto em `02` §4 |
| 7 | Digimon UP (repositório de fã com arte oficial, sem licença) | Só link, como já decidido no C9 F1 |

## 6. Pontos controversos (para escalar ao Vitor, se o ChatGPT discordar)

1. **O Hawkmon fica 3 px mais alto que o Agumon** na opção A, por causa do topete. É fiel ao DS, mas muda a "ordem" visual do grupo.
2. **Cabeça creme** em vez de branca: aproxima do anime e do Agumon, afasta do Reference Book.
3. **Walk de ave sem balanço de cabeça** (sem o "pombo"): menos naturalista, mas mantém a regra da cabeça travada que fez o Agumon subir de nota.
