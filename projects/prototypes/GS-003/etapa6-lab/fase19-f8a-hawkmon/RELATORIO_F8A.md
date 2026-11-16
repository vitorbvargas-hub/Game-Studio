# RELATÓRIO F8A — Hawkmon: pesquisa e direção de arte (Comando 13)

**Digital Odyssey (GS-003) · game-research (Opus 5.5) · 2026-11-14 23:16 – 2026-11-15 ~02:20 (com queda por limite de 5 h às ~23:58 e retomada às 02:05)**
**Custo: zero.** PixelLab: 0 gerações, nenhuma ferramenta chamada (nem o saldo). Retro Diffusion: não usado. Nenhuma mensagem a artista, nenhum login, nenhum comentário. Fable 5.2 não foi acionado (os estudos de direção são escritos e pranchas de medida, sem sprite).
Fangame independente, não oficial e não licenciado. Arte oficial usada só como referência interna de estudo (D12).

## 1. Entregáveis (§7 do comando)

| # | Entregável | Caminho |
|---|---|---|
| 1 | Biblioteca visual organizada | `01_BIBLIOTECA_VISUAL.md` + `biblioteca/oficiais/` (4 folhas oficiais com `FONTE.txt` e `sha256.txt`) |
| 2 | Lista de artistas e permissões | `02_ARTISTAS_E_PERMISSOES.md` |
| 3 | Ficha anatômica | `03_FICHA_ANATOMICA_HAWKMON.md` |
| 4 | Quatro estudos de direção | `04_ESTUDOS_DE_DIRECAO.md` + `estudos/prancha_direcoes_oficial_x6.png` |
| 5 | Proposta de escala (e GBA Plus: paleta, contorno, luz, silhueta, quadros) | `05_PROPOSTA_DE_ESCALA.md` + `estudos/prancha_escala_opcoes_x4.png` |
| 6 | Plano de animação | `06_PLANO_DE_ANIMACAO.md` |
| 7 | Estimativa de créditos e tempo | `07_ESTIMATIVA_CREDITOS_E_TEMPO.md` |
| 8 | Riscos técnicos | `08_RISCOS_TECNICOS.md` |
| 9 | Recomendação artística (com o plano de produção A–F do §6) | `09_RECOMENDACAO_ARTISTICA.md` |
| — | Registro de requisições | `REQUESTS_LOG.md` |
| — | Progresso | `PROGRESS.md` |
| — | Scripts de medida (só leem e medem) | `scripts/` |

Pasta: `projects/prototypes/GS-003/etapa6-lab/fase19-f8a-hawkmon/`.

## 2. Achados principais

1. **[E] Não existe sprite pronto do Hawkmon no formato do jogo** (top-down, 4 direções puras, idle + walk, ~35–45 px), nem oficial nem de fã. O mais perto são os minis oficiais do **DW DS / Dawn-Dusk** (3/4 frente e costas, 3 quadros, ~29 px, cor) e do **Digital Partner** (WonderSwan: frente, lado e costas, 2 quadros, mono, mais 44 poses de emoção). Só para estudo interno.
2. **[E] Onde o Hawkmon aparece foi confirmado jogo a jogo.** Está em DW DS, Dawn/Dusk, Digital Partner, Digimon Medley, Digimon UP, ReArise e outros. **No Digimon World 3 é só carta** (sem sprite de campo); **não está** no Battle Spirit; **não confirmado** em DW1/DW2.
3. **[E] Relação oficial de escala medida no DS:** Hawkmon ÷ Agumon = **0,85** até o alto da cabeça e **1,07** com o topete. É a base da proposta de escala.
4. **[E] Arte de fã:** 22 obras avaliadas; só 4 com Creative Commons e só **1 que permite adaptar** (Fenrimon, CC BY-NC 3.0). Fã serve como referência de movimento (Neroesaurus separa andar de voo; Neoweegee tem o topete como bumerangue), não como asset.
5. **[E] Feather Slash (folha oficial do anime):** o topete é lançado com as duas asas, gira como disco e **volta**. Durante o golpe, a cabeça fica **sem topete**. Por isso o topete deve ser **peça separada** desde o primeiro sprite.
6. **[H] Os traços mais frágeis na geração:** topete (pode sumir, duplicar ou virar crista), faixa (pode virar óculos), pontas escuras das asas (fundem com o contorno), costas (rosto no N) e walk (asa balançando lê como voo).
7. **[L] O saldo bloqueia o C14:** último saldo registrado 573,95 com piso 570 (folga ≈ 4 gerações); o cenário mínimo custa 14.

## 3. Proposta de escala (opções; G-2 continua aberto)

| Opção | Altura total (corpo + topete) | Relação | Leitura |
|---|---|---|---|
| **A (recomendada [H])** | **38 px** (30 + 8) | 0,85 do Agumon no corpo, como no DS; 0,93 do Tamer no total | Única opção baseada numa relação oficial medida; fica abaixo do Tamer; o topete passa 3 px do Agumon S |
| B | 35 px (28 + 7) | topete dentro da altura do Agumon | Nenhum parceiro passa do Agumon; rosto mais apertado |
| C | 43 px (34 + 9) | corpo igual ao Agumon | Viola "não aumentar só para detalhe" e passa do Tamer (41). Só para comparação |

Paleta: **P1** (rampas do pacote do Agumon, ~24 cores) recomendada pela coerência com o Agumon F7v2; **P2** (Endesga-32) só se o Vitor migrar os dois. G-1 continua aberto.

## 4. Recomendação de pipeline (§6 do comando)

**A → B → C → F, com D de reserva e E fora** (`09` §2–3):
- **A** (PixelLab Método A): pose base com 25 candidatos, rotação v3, walk S/E/N. É o único que cria a identidade a partir da arte oficial; o gasto está aqui.
- **B** (polimento): conserta topete, faixa, pontas das asas e costas sem gastar.
- **C** (rig 2D): idle nas 4 direções; cabeça travada e topete com atraso de 1 quadro por construção.
- **F** (híbrido F7): montagem, pé plantado 3 px/quadro, W espelho, `pacote.json` 60×60.
- **D** (Blender): só se a walk S/N do v3 falhar.
- **E** (Retro Diffusion): fora do C14 (saldo grátis esgotado, resultado 6,4 na F5, risco de galeria pública).

**Créditos e tempo do C14 (rotação + walk 4 dir. + idle 4 dir.):** mínimo 14, realista 17, pessimista 34 gerações. **Teto sugerido: 22**, com parada depois da pose base. 2 h 30 a 4 h de agente + ~40 min de QA.

## 5. Evidências, em números

| Fonte | O que foi lido | Categoria |
|---|---|---|
| digimon.net Reference Book (JP e EN) | 2 páginas: nível, tipo, atributo, técnicas, perfil | **1, oficial (verified_primary)** |
| Wikimon | **6 requisições** (W1–W6), ≥ 65 s entre elas: 1 página + 5 imagens (2 folhas de modelo do anime, arte do Reference Book, dot do ReArise, modelo 3D do Super Rumble) | 3 hospedando material oficial (cat. 2 para as folhas do anime) |
| Folhas oficiais extraídas (Spriters Resource, já no disco desde 2026-11-08) | 4 folhas: DW DS, Dawn/Dusk, Digital Partner, Medley; medidas por script | 4 (extração de material oficial) |
| DeviantArt | RSS com 59 itens + 7 páginas oEmbed; 22 obras avaliadas | 4 (fã) |
| GitHub (Digimon UP) | 1 repositório; 4 quadros vistos, sem cópia local | 4 |
| DuckDuckGo | 6 buscas (depois limite de taxa 202; parei) | — |

Todas as requisições estão em `REQUESTS_LOG.md`. Na retomada de hoje **não houve nenhuma requisição externa nova**: 07–09 e este relatório foram escritos com o que já estava no disco e nos relatórios do estúdio.

## 6. Limitações e o que ficou pendente

- **Spriters Resource e Fandom bloqueados por Cloudflare**: não contornei. Não consegui confirmar se há sprite do Hawkmon em Lost Evolution, Super Xros Wars ou Time Stranger.
- O **curl do exec** foi bloqueado pelo proxy de saída (CONNECT 403); não usei `--noproxy`. Por isso as imagens da Wikimon foram só **vistas**, sem cópia local.
- A relação humano × Hawkmon do Fenrimon foi medida **a olho** [H].
- A paleta P1 é **proposta**, não medida de arte final.
- O saldo PixelLab de 573,95 é de 2026-11-14 21:25 e **não foi reconferido** (o brief proíbe usar o PixelLab nesta fase).
- Não verifiquei se as referências enviadas ao PixelLab ficam privadas (R27).
- Pesquisa em comunidades de pixel art além do DeviantArt e do Reddit ficou rasa por limite de taxa das buscas.

## 7. O que NÃO foi feito (de propósito)

- Nenhum sprite gerado ou desenhado; nenhuma chamada ao PixelLab nem ao Retro Diffusion.
- Nenhuma mensagem, nota ou comentário a artista; nenhum login.
- Nenhuma arte de fã baixada (só links); nenhuma imagem oficial copiada para a Database.
- Escala e paleta **não foram decididas**: há opções com recomendação.
- Nenhuma regra de jogo tocada (voo, Feather Slash, colisão).
- Nada escrito na Knowledge Base nem no `PROJECT_LOG.md`.

## 8. Decisões que dependem do Vitor (com recomendação)

1. Escala A, B ou C → **A**.
2. Paleta P1 ou P2 → **P1**; vermelho intermediário; cabeça creme.
3. Pipeline → **A → B → C → F** (D reserva, E fora).
4. **Orçamento do C14** → teto de 22 gerações, com parada depois da pose base. **Exige baixar o piso de 570 ou comprar créditos.**
5. Pedidos de permissão ou encomenda (nada enviado): Karasupx, Fenrimon, Neroesaurus + paburo1. Encomenda paga está fora da autorização atual.
6. Pontos controversos para o ChatGPT/Vitor: Hawkmon 3 px mais alto que o Agumon na opção A; cabeça creme × branca; walk sem balanço de cabeça de ave.

**Encerrado.** Próximo passo (do game-studio): levar o material ao ChatGPT. O Comando 14 só começa com a direção aprovada pelo Vitor e o orçamento de créditos explícito.
