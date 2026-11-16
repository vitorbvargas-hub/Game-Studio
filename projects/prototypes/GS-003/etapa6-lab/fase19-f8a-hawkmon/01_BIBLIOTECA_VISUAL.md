# 01 · Biblioteca visual do Hawkmon

**Digital Odyssey (GS-003) · Comando 13, F8A · game-research (Opus 5.5) · 2026-11-14**
Fangame independente, não oficial e não licenciado. Arte oficial aqui é só **referência interna de estudo** (D12). Nada desta pasta vai para o jogo.

**Legenda:** **[E]** visto ou medido na fonte, na data indicada · **[L]** lido de documento anterior do estúdio, não refeito · **[H]** hipótese ou opinião minha.
**Categorias de fonte (AGENTS.md §5):** 1 oficial · 2 oficial de continuidade · 3 wiki · 4 material de fã / extração · 5 inferência · 6 proposta do Digital Odyssey.

## 0. Como está organizada

| Pasta / arquivo | O que tem |
|---|---|
| `biblioteca/oficiais/ds_dawndusk/sr40896_hawkmon.png` | Digimon World: Dawn/Dusk (DS) — batalha + **minis de campo** |
| `biblioteca/oficiais/dw_ds/sr48517_hawkmon.png` | Digimon World DS (DS) — mesma arte de batalha + minis em células 32×32 |
| `biblioteca/oficiais/wsc_digitalpartner/sr483619_hawkmon.png` | Digimon Adventure 02: Digital Partner (WonderSwan) — **44 poses de emoção**, frente/lado/costas + minis de andar em 3 vistas |
| `biblioteca/oficiais/wsc_medley/sr64825_hawkmon.png` | Digimon Tamers: Digimon Medley (WonderSwan Color) — batalha em cor + minis + retratos |
| `biblioteca/oficiais/FONTE.txt`, `sha256.txt` | origem, ripper, URL, hash |
| `estudos/prancha_direcoes_oficial_x6.png` | recortes oficiais agrupados por direção (S, N, E/W), com linha do chão (verde) e topo com topete (vermelho tracejado) |
| `estudos/prancha_escala_opcoes_x4.png` | Tamer A (S, 41 px), Agumon F7v2 (S 35 px, E 41 px), Hawkmon DS oficial em tamanho nativo e as caixas das opções de escala A/B/C (ver `05_PROPOSTA_DE_ESCALA.md`) |
| `scripts/` | `medir_folhas.py`, `altura_sem_sombra.py`, `perfil_linhas.py`, `recorte.py`, `pngidx.py`, `pranchas.py` (todos só leem e medem; nenhum gera sprite) |

As 4 folhas **já estavam no disco do estúdio** desde 2026-11-08 (`assets/GAME-ASSETS/10-source-files/spriters-resource/`, manifesto `_manifest.json`). Copiei sem alterar. Não houve download novo do Spriters Resource: hoje ele responde com verificação Cloudflare, e não a contornei [E, 2026-11-14 23:22].

## 1. Onde o Hawkmon aparece de fato (confirmado)

Regra do comando: não presumir. Cada linha diz **como** foi confirmado.

| Obra | Hawkmon aparece? | Como confirmei | Serve para sprite? |
|---|---|---|---|
| **Digimon Reference Book** (oficial) | Sim: Child/Rookie, Bird, Free; Beak Pecker, Feather Slash | [E] digimon.net JP e EN, lido 23:21 | Arte de design (REF-01) |
| **Anime Digimon Adventure 02** | Sim (parceiro da Miyako/Yolei) | [E] Wikimon (cat. 3) + **duas folhas de modelo oficiais do anime** vistas | Folha de modelo frente/costas/3/4 e a coreografia da Feather Slash |
| **Digimon World DS** (2006; JP: *Digimon Story*) | Sim; mapa e batalha | [E] folha 48517 no disco; [E] Wikimon "Digimon Story" (obtido por regressão do Aquilamon; galeria "(battle)" e "(map)") | **Sim**: minis de campo coloridos, 3/4 frente e 3/4 costas |
| **Digimon World: Dawn/Dusk** (2007; JP: *Sunburst/Moonlight*) | Sim; escaneável em Login Mountain | [E] folha 40896 no disco; [E] Wikimon | **Sim**: mesma arte do DS, com sombra |
| **Digimon Adventure 02: Digital Partner** (WonderSwan) | Sim | [E] folha 483619 no disco (Bandai / Tom Create). O Wikimon **não** tem seção desse jogo na página do Hawkmon [E] | **Sim**: emoções e rotação frente/lado/costas |
| **Digimon Tamers: Digimon Medley** (WSC) | Sim | [E] folha 64825 + seção na Wikimon | Batalha em cor; pouco útil para campo |
| **Digimon UP** (mobile, 2026) | Sim, parceiro criável | [E] Wikimon + repositório de fã com `baked/hawkmon/{idle,walking,attack,faint}`; walking = 13 quadros, 1 direção (3/4) | Referência de **pixel art oficial moderna** e de ciclo de andar. Só link (repo sem licença) |
| **Digimon ReArise** | Sim (dot) | [E] galeria da Wikimon: `Hawkmon_dot.png`, legenda "Digimon ReArise (dot)" | Leitura mínima a 16×16 |
| Digimon Super Rumble, Encounters, Soul Chaser, Masters, Linkz | Sim (modelos 3D ou retratos) | [E] galeria da Wikimon | Volume 3D (pose T no Super Rumble) |
| Digimon Story: Lost Evolution, Super Xros Wars, Time Stranger | Sim | [E] Wikimon (texto) | Não verificado se há sprite extraído. Pendente |
| Tag Tamers, D1 Tamers, Brave Tamer, Digital Card Arena, Digimon RPG | Sim (texto ou ícone na Wikimon) | [E] Wikimon | Baixo valor para campo |
| **Digimon World 3** | **Só como carta** ("collectable red card with 2/3 stats") | [E] Wikimon, seção DW3 | **Não**: não há sprite de campo no DW3. A pasta DW3 do estúdio (43 folhas) não tem Hawkmon [E, `_manifest.json`] |
| Digimon World -next 0rder- | Só carta colecionável | [E] Wikimon | Não |
| Digimon World 1 e 2 (PS1) | **Não confirmado** | O manifesto local de DW1 (137 folhas) e DW2 (47) não tem Hawkmon; "GoldenHawk" no DW2 é um cenário, não a espécie [E] | Não |
| Digimon Battle Spirit 1/2 (GBA/WSC) | **Não** oficialmente | [E] a descrição do fã TailsPrower13 (2011) diz que fez o Hawkmon porque **não existe** no Battle Spirit; manifesto local de digibat/digibat2 sem Hawkmon | Não |
| Virtual pets (D-3, D-Terminal, D-Ark 2.0, Pendulum Progress 3.0, Pendulum Z Wind Guardians, Vital Bracelet BE, D-3 25th) | Sim | [E] Wikimon | Sprites 16×16 mono, só silhueta mínima |

**Resumo:** os únicos sprites oficiais de **campo em várias direções** são os do **DW DS / Dawn-Dusk** (3/4 frente, 3/4 costas, frente, salto) e os minis do **Digital Partner** (frente, lado, costas, 2 quadros cada). Não existe sprite oficial top-down em 4 direções puras com ciclo completo.

## 2. Referências oficiais — fichas

### O1. Digimon Reference Book (REF-01) [E, cat. 1, verified_primary]
- URL: https://digimon.net/reference/detail.php?directory_name=hawkmon (JP) e `/reference_en/` (EN). Lido 2026-11-14 23:21.
- Nível 成長期 / Rookie; tipo 鳥型 / Bird; atributo フリー / Free. Técnicas: ビークペッカー (EN "Pecking Beak", nome do Wikimon "Beak Pecker") e フェザースラッシュ (Feather Slash).
- Perfil (paráfrase minha): ave muito educada e calma; descende de uma espécie antiga especial, como o V-mon, e por isso usa a Digimental para a Armor-evolução; o golpe de bico é uma bicada rápida como a de um pica-pau; o **golpe especial usa o enfeite de pena da cabeça como um bumerangue**.
- Arte (vista em https://wikimon.net/images/7/7f/Hawkmon.jpg, cat. 3 hospedando arte oficial): pose no ar, asas abertas, sombra no chão abaixo, vermelho vivo.

### O2. Folha de modelo do anime Adventure 02 (REF-02) [E, cat. 2]
- https://wikimon.net/images/9/9d/Hawkmon_adv02_reference_art.jpg (vista 23:24).
- **Costas, frente e 3/4.** É a referência mais completa de anatomia: faixa da cabeça dá a volta inteira; costas cobertas por penas vermelhas em pontas sobrepostas; pontas das asas com 3 penas cinza-escuro que funcionam como dedos; pés com 3 dedos e garras brancas.

### O3. Folha "決定稿" (versão final) da Feather Slash, anime [E, cat. 2]
- https://wikimon.net/images/1/1d/Hawkmon_adv02_reference_art_2.jpg (vista 23:27).
- Coreografia anotada pela produção: ① segura o enfeite de pena da cabeça **com as duas mãos (asas)**; ② lança de uma vez, e a pena **voa girando** como um disco (as listras vermelhas do disco são a cor da ponta da pena); ③ corta um galho; ④ volta e é pega de novo com as duas mãos. O braço faz um arco como o Eye Slugger do Ultraseven (citação da própria folha).
- **Consequência de animação:** durante o golpe a cabeça fica **sem topete** (ver `06_PLANO_DE_ANIMACAO.md`).

### O4. Sprites DS / Dawn-Dusk (REF-03) [E, cat. 4: extração de material oficial]
Medidas minhas (`scripts/medir_folhas.py`, `altura_sem_sombra.py`, `perfil_linhas.py`):

| Pose | bbox sem sombra | Observação |
|---|---|---|
| Frente parado (S) | 16×29 px | 6 px de topete + **23 px do alto da cabeça ao pé** |
| 3/4 frente, andar (3 quadros) | 16–19 × 25–26 px (célula 22×29–31) | asa oposta ao passo se abre um pouco |
| 3/4 costas, andar (3 quadros) | 16–17 × 24–26 px | faixa e topete dominam a leitura de costas |
| Salto | 21×25 px | asas abertas, pés recolhidos, **sombra descolada** |
| Batalha (5 poses) | 57–86 × 58–89 px | idle com asas batendo (3 quadros), ataque de asas abertas, dano (cabeça para trás), defesa (asas cruzadas na frente) |
| Agumon DS, frente parado (comparação) | 27 px de altura | mesma folha-irmã 40907 |

- Paleta do mini: **13 cores + sombra**: contorno `#181818`; cabeça `#ffffff #c6c6c6 #949494 #525252`; vermelhos `#ff1800 #b50800 #730000`; amarelos `#ffef00 #e79c00 #c65a00`; olho azul na arte de batalha `#b5cee7 #94a5ce`.
- **Divergência dentro do próprio jogo:** a arte de batalha tem cabeça branca-azulada e topete laranja-amarelo; o mini usa cinzas neutros.

### O5. Digital Partner, WonderSwan (REF-03/REF-05) [E, cat. 4]
- 44 poses de 48×48 (mono, 4 tons) + 6 minis de 16×32.
- Emoções identificadas a olho [H na leitura de cada uma]: neutro, falando, alegria (salto com asas para cima), riso, choro, raiva (penas eriçadas), susto, vergonha (asa na nuca), tontura (estrelas), derrota (X nos olhos), sono (deitado), comer, pose de perfil olhando para trás.
- Minis: **frente, lado (olhando para oeste) e costas, 2 quadros cada** (passo alternado). Altura 27–28 px na célula de 32.
- Costas a 48 px: faixa com a tira atravessando a nuca, cabeça branca, asas dobradas cobrindo as costas com penas longas para baixo, pés brancos (mono).

### O6. Digimon Medley, WSC (REF-05) [E, cat. 4]
- Batalha em cor com paleta curta (vermelho, creme, contorno), minis de 32 px (frente e lado) e 4 retratos. A folha mistura Holsmon, Shurimon e Aquilamon (**não usar** as outras formas como referência do Hawkmon).

### O7. Modelo 3D, Super Rumble (REF-04 de volume) [E, cat. 3 hospedando oficial]
- https://wikimon.net/images/f/fb/Hawkmon_Model_DSR.png (vista 23:29). Pose T: as asas saem dos ombros, logo abaixo da gola; 3 penas pretas na ponta; leque de penas vermelhas atrás do corpo (cauda); topete preso no alto-trás da cabeça; pequenos tufos brancos dos lados da cabeça, acima da faixa.

### O8. Dot oficial (ReArise) [E, cat. 3 hospedando oficial]
- https://wikimon.net/images/f/f0/Hawkmon_dot.png (16×16 ampliado ×8). Prova que a espécie lê em 16 px com 5 elementos: topete, faixa, bico amarelo, corpo vermelho com asas, pés amarelos.

### O9. Digimon UP (REF-04 de movimento) [E, cat. 4, só link]
- https://github.com/dannyphang/digimon-up-sprites/tree/main/baked/hawkmon — pastas `attack`, `faint`, `idle`, `walking` (13 quadros, `f_000`–`f_012`, ~4,4 KB cada). 1 direção (3/4 frente-direita).
- Mesmo risco já registrado no C9 F1: repositório sem licença, arte da Bandai Namco, muito recente. **Não baixei.**

## 3. Referências de fã (só link; detalhes e licenças em `02_ARTISTAS_E_PERMISSOES.md`)

| Para quê | Melhor candidato |
|---|---|
| Separar andar de voo, ciclo lateral | Neroesaurus 2022 (idle 6, walking 8, **flying 4**, ataques, hit, win, lose; base de paburo1) |
| Feather Slash como objeto que sai da cabeça | Neoweegee 2015 ("Feather Throw", "Feather Boomerang", hover, glide, land) |
| Relação de escala humano × Hawkmon em pixel art moderna | **Fenrimon 2023, "Digimon Pixels: Miyako and Hawkmon"** (única com licença CC BY-NC 3.0) |
| Acabamento estilo DS em pose única | Sellionrb 2019 (72×96) |
| Leitura em ~30 px | maximus237 2019 (pose única, ~25×30, grade visível) |

## 4. Aves com anatomia parecida (quando necessário)

Só para **mecânica de movimento**, nunca para identidade (regra do gate: slot `missing` não se preenche com espécie parecida):
- **Biyomon / Piyomon** (ave bípede com asas-braço). Já no disco do estúdio [E, `_manifest.json`]: DW DS 48423, Dawn/Dusk 40894, Medley 64803, Digital Partner 483612. Útil para comparar como os jogos oficiais resolvem asa-braço no andar. **Não abri** essas folhas nesta tarefa.
- **Falcomon** (ave bípede de Savers): DW DS 48587 no disco [E]; e o fã Neroesaurus tem folha no mesmo formato da dele do Hawkmon (RSS do DeviantArt, 2022). Só link.
- **Aquilamon** (forma seguinte do Hawkmon): DW DS 46749 no disco [E]. **Não usar** como referência de anatomia do Hawkmon (outra forma).
- Aves reais (pombo, galinha) para o passo: cabeça que avança e para, pés que trocam rápido. [H] Não procurei vídeo; não é necessário para o C14, que não pede voo.

## 5. Lacunas

1. **Nenhum sprite oficial em 4 direções puras** (S/N/E/W). O DS só tem diagonais; o WSC tem S/W/N em 2 quadros, mono.
2. **Lateral pura colorida oficial: não achei.** Existe o mini lateral mono do WSC e a lateral de fã (Neroesaurus, Neoweegee).
3. Spriters Resource bloqueado: não consegui verificar se há Hawkmon em Lost Evolution, Super Xros Wars ou Time Stranger. DuckDuckGo e Bing não retornaram páginas dessas folhas. Pendente.
4. Fandom (Gallery:Hawkmon) bloqueado por Cloudflare; o resumo da busca diz que tem "Sprite from Japanese D-3 (Walk 1/Walk 2/Attack/Happy)" — não aberto.
