# Revisão independente — rig local de pixel art e animação (Fase 7, Etapa 6)

- **Revisor:** game-art (GAME-ART-DIRECTOR) — sessão separada da que produziu o material (ADR-012 §3; AGENTS.md §6 "pronto quando... avaliação feita por sessão diferente da que produziu").
- **Produtor avaliado:** game-studio (exceção pontual pedida pelo fundador, registrada em `PESQUISA_E_TESTE_PRODUCAO_DIGIMON.md`).
- **Data:** 13/11/2026.
- **Custo desta revisão:** 0 gerações PixelLab (nenhuma foi feita — proibido no brief). Para enxergar detalhe de quadro a quadro, usei recorte/zoom **local** (Pillow, do venv já existente em `shared/tools/sd-local/.venv`, nenhuma rede) sobre os PNGs já existentes no projeto; nada foi enviado a serviço externo, nenhum código do laboratório foi alterado, nenhum commit foi feito.
- Marcação: **[E]** medido/observado por mim nesta sessão (arquivo citado) · **[H]** julgamento de direção de arte.

## Veredito resumido

| Item avaliado | Classificação |
|---|---|
| Rig do estúdio (`rig.py`/`anims.py`/`cutrig.py`) como **motor de animação** | **Candidato com ressalva** |
| Agumon **desenhado do zero** pelo rig (`agumon_s.py`) como **arte de produção** | **Reprovado** (serve só como prova técnica do motor) |
| Agumon do **ChatGPT recortado e animado pelo rig** (Método A + rig) | **Candidato com ressalva** |
| Pipeline completo proposto para o elenco (§4 abaixo) | **Candidato**, com duas etapas que só o fundador pode fazer (D12) |

Nenhum item recebe "aprovado": nenhum chega à régua do Style Bible (§8, nota ≥ 8 e zero falha crítica) sem mais uma rodada de ajuste manual, e — ponto mais importante — **nenhum dos dois Agumon novos deveria substituir o Agumon oficial do DS**, que já existe e já é mandatório pelo Style Bible §2.2. Isto é detalhado em §5.

---

## 1. Método desta revisão

Li: `PESQUISA_E_TESTE_PRODUCAO_DIGIMON.md`; o código em `tool/` (`rig.py`, `agumon_s.py`, `agumon_en.py`, `anims.py`, `cutrig.py`, `mock_agumon.py`, `scene.py`, `compare.py`, `contact.py`); as 9 animações em `out/` (gif + sheet + preview de cada) e as 8 de `out/mock_chatgpt/`; as pranchas de contato; e, para comparação, os três arquivos que `compare.py` já usa como referência (`fase1-pixellab/referencias/agumon_ds_south.png` = DS oficial, `metodo-a-v2/.../agumon_retrato_A.png` = ChatGPT Método A, `fase1-pixellab/v2/.../Idle/rotations/south.png` = PixelLab v2, já reprovado por D11). Também li `DIGIMON_STYLE_GUIDE.md` inteiro (§2 escala, §3 paleta, §8 matriz) para aplicar a régua oficial.

Para ver os quadros de maior deslocamento em detalhe (onde "buracos" apareceriam) ampliei localmente (nearest-neighbor, sem suavizar) alguns recortes de `_sheet.png` e medi caixa delimitadora (bbox de pixel não-transparente) e contagem de cor com Pillow — script efêmero em `/tmp`, fora do repositório, apagável a qualquer momento.

---

## 2. (A) Arte — avaliação visual

### 2.1 O rig como ferramenta de produção

**Pontos fortes confirmados:**
- **Pixel 1:1 de verdade** — sem upscale/downscale com interpolação em nenhum dos dois pipelines; nearest-neighbor nos GIFs/preview. Cumpre a regra dura §1.1 do Style Bible.
- **Paleta fechada e estável entre quadros** — medi **[E]**: o Agumon do zero usa **10 cores** em todo o sheet de idle (`agumon_idle_sheet.png`); o Agumon ChatGPT+rig preserva as **17 cores** originais da prancha (`agumonA_idle_sheet.png` = 17, igual ao arquivo-fonte `agumon_retrato_A.png` = 17) sem introduzir ruído — isto é muito próximo do DS oficial (**15 cores**, `agumon_ds_south.png`). Os dois pipelines respeitam a regra "6–8 a ~15–17 cores por criatura" do Style Bible §3.1, nada de paleta explodida típica de IA generativa sem controle.
- **9 animações (idle, andar×4 direções, feliz, triste, bravo, ataque de frente, ataque de perfil, dano, derrota) saindo de 1 desenho, custo zero, determinístico** — isto é real e é o maior ganho prático: hoje, sem isto, cada emoção/ataque seria uma geração paga por direção.
- **Contorno automático consistente** (`outline()` em `rig.py`) e sombreamento em banda com luz fixa superior-esquerda (`shade()`/`blob()`) — coerente com a regra de luz do Style Bible §6 para arte desenhada do zero (não se aplica a rip oficial, que não é o caso aqui).

**Limitação confirmada — "buracos" nas emendas:**
Medi quantos pixels transparentes ficam **presos** dentro da silhueta (não conectados à borda do quadro) em poses de maior deslocamento:

| Pipeline | Pose | Pixels de buraco "fechado" | Visível a olho nu (zoom 10–14×)? |
|---|---|---:|---|
| ChatGPT + rig (corte e translação) | `derrota` quadro 3 | 1 px | **Sim** — não como "buraco fechado" grande, mas como uma fresta de fundo entre o braço estendido e o ombro/tronco (ver `agumonA_derrota_sheet.png`, quadro 2–3): o braço parece "flutuar" solto do corpo por 1–3px nessa pose. |
| ChatGPT + rig | `feliz`, `bravo`, `walk` | 0–1 px | Não perceptível em jogo; só visível em zoom de revisão. |
| Agumon do zero (redesenho por quadro) | `feliz` quadro 3 | 16 px | Não é uma fresta entre peças — é o espaço negativo dentro da boca/olhos aberto por quadro (próprio do desenho, não um defeito de emenda). |
| Agumon do zero | `derrota` quadro 0 | 16 px | Idem — vão entre perna e cauda na pose de "caído", mas como o corpo inteiro é redesenhado (blobs sobrepostos), a fresta é parte da pose e não lê como erro visual a distância de jogo. |

**Leitura [H]:** a técnica de **recortar e transladar pedaços de uma imagem já pronta** (`cutrig.py`) tem um risco estrutural que a técnica de **redesenhar cada quadro com formas sobrepostas** (`agumon_s.py`/`rig.py`) não tem: quando a peça se afasta do ponto onde foi desenhada, aparece fundo entre ela e o corpo, porque a arte original não tinha "sobra"/manga nessa junta. É pequeno (1–3px) nos exemplos testados e **aceitável na escala final de jogo** (32px de tile, visto de longe), mas **fica visível em close-up/marketing** e cresce se o deslocamento entre quadros crescer (ex.: um ataque mais amplo, uma queda mais dramática). Recomendo documentar um limite prático — por exemplo, não deslocar uma peça recortada mais do que ~15% da sua própria largura sem redesenhar a borda da emenda — e inspecionar cada animação nova com zoom antes de aprovar, não só o preview em tamanho de jogo.

**Legibilidade de emoções e do ataque:** boa nos dois pipelines. `feliz` (braços para cima, olhos fechados de alegria), `triste` (cabeça baixa), `bravo` (olhos franzidos, rosnado, tremor) e `dano` (flash branco + recuo) se leem bem à distância de jogo nos dois. A exceção é `derrota` no Agumon ChatGPT+rig: como a prancha-base já é uma pose de ação dinâmica (agachada, boca aberta, braço à frente) e não uma pose neutra, a "queda" vira um deslocamento pequeno sobre uma pose que já parecia "derrota"/ataque — os 4 quadros de `agumonA_derrota_sheet.png` ficam parecidos demais entre si e com `idle`/`walk`, e a leitura de "foi derrotado" é mais fraca que no Agumon do zero (que tem pose neutra própria e consegue deitar a cabeça e cair de verdade). Isto é uma limitação do **material de origem** (uma única pose dinâmica), não do rig.

### 2.2 Comparação com DS oficial e com o PixelLab v2 (já reprovado)

Medi **[E]**, com Pillow, a caixa delimitadora real (pixel não-transparente) de cada um, south/retrato padrão:

| Fonte | Canvas | Caixa real (W×H) | Cores (fundo removido) | Status |
|---|---:|---:|---:|---|
| **DS oficial** (`agumon_ds_south.png`) | 30×30 | **20×27** | 15 | Referência mandatória (Style Bible §2.2) |
| **ChatGPT (A)** + rig (`agumonA_idle_sheet.png`, quadro 0) | 52×46 | **32×34** | 17 | Candidato com ressalva |
| **PixelLab v2** (`.../Idle/rotations/south.png`) | 36×36 | 24×32 | — | **Já reprovado** (D11), não reavaliado aqui |
| **Game-studio, do zero** (`agumon_idle_sheet.png`, quadro 0) | 40×44 | **30×40** | 10 | Reprovado como arte final |

**Fidelidade ao design do Agumon oficial [H]:** ChatGPT (A) > DS oficial (é a própria referência) > PixelLab v2 (já reprovado por outros motivos) > game-studio do zero. O desenho do zero não tem o chifre/crista da cabeça nem as luvas/botas vermelhas que são parte da identidade visual do Agumon (DS e anime); fica mais "sapo/bonequinho genérico" com olhos verdes, como o próprio game-studio já havia reconhecido na pesquisa. O ChatGPT (A) acerta a anatomia (corpo de dinossauro, cauda, garras, crista), mas também **não tem** as luvas/botas vermelhas — ou seja, nenhum dos dois novos bate 100% com o Agumon canônico; o DS é o único realmente fiel, porque **é** o oficial.

**Escala — confirma e precisa o número do brief:** o do zero mede **40px de altura real** de desenho (bate com o "~40px" citado no brief) contra uma meta de 33–35px — **18 a 36% maior** que o teto da meta, dependendo da régua usada. O ChatGPT (A) mede **34px** — **dentro da meta 33–35px**, e muito próximo dos 34px que o próprio Style Bible §2.2 mediu para os Rookies oficiais Guilmon/Gabumon (ainda que maior que os 27px desta Agumon DS específica — espécies diferentes do catálogo DS têm proporções um pouco diferentes entre si, isso é esperado). **Na escala, o ChatGPT (A) + rig já está no alvo; o desenho do zero não está.**

### 2.3 Limitações, como pedido no brief

1. **A prancha do ChatGPT só tem a vista 3/4 (uma pose de ação).** Confirmado: `cutrig.py`/`mock_agumon.py` só usam `agumon_retrato_A.png`; não existe vista de perfil nem de costas do Método A. Toda a "animação" dessa vista é translação de peças da mesma imagem — funciona bem para `walk_leste/oeste` (o rig já espelha, grátis) mas **não produz** uma vista norte/sul verdadeira nem perfil leste/oeste "de verdade" (anatomicamente distintos) — produz a mesma pose 3/4 deslocada, o que é aceitável para idle/emoções em jogo top-down mas é uma limitação real para andar nas 4 direções cardeais com leitura correta de perfil.
2. **Animação por partes é mais rígida que quadro a quadro.** Confirmado em §2.1: cria a fresta/buraco de emenda (pequena, mas real) e, no caso de `derrota`, não consegue se afastar o suficiente da pose-base para comunicar a emoção com a mesma clareza do redesenho por quadro.
3. **Escala do "do zero" ~40px vs meta 33–35px.** Confirmado e medido com precisão em §2.2 (30×40 real, contra os 32×34 do ChatGPT+rig, que já acerta a meta).

---

## 3. (B) Técnica — avaliação do código/pipeline

- `rig.py`: motor pequeno e legível (classe `C`, `blob()` com sombreamento por produto escalar da direção da luz, `outline()` por adjacência, `shade()` por banda). Sem dependência externa além dos utilitários já existentes do workspace (`pxpng`, `gifenc`). Determinístico (mesma entrada → mesma saída), o que é bom para reprodutibilidade e QA.
- `anims.py`/`agumon_s.py`: biblioteca de poses por parâmetro (bob, hdy, ll/rl, la/ra, tdx/tdy) + bibliotecas de olhos/boca por grade de caracteres — é uma abordagem de rig de verdade (esqueleto simplificado por parâmetros), não só composição de cliparte; é reaproveitável para outra espécie **somente se** ela tiver uma anatomia parecida (bípede, cauda, 2 braços, 2 pernas) — não serve, por exemplo, para uma espécie quadrúpede ou alada sem reescrever as funções de parte.
- `cutrig.py`/`mock_agumon.py`: a técnica de corte por retângulo (`cut()`) é simples e funcionou aqui porque as peças do Agumon do ChatGPT têm pouca sobreposição visual entre si; para uma pose mais compacta ou uma espécie com partes que se tocam mais (ex.: sem pescoço visível), os retângulos de corte vão exigir ajuste manual caso a caso — não é uma função que generaliza sozinha para qualquer prancha nova, precisa de alguém decidindo as regiões a cada espécie (apontado corretamente como etapa manual na proposta do próprio game-studio).
- `scene.py`: útil como prova de conceito de como os dois ficariam lado a lado num mapa real (`cena_floresta_dois_agumons.gif`) — confirma visualmente a diferença de fidelidade entre os dois Agumons já relatada em §2.2.
- Bug observado e já citado pelo próprio game-studio, confirmado por mim com zoom: a bola de fogo do ataque de perfil do Agumon do zero (`agumon_ataque_e_sheet.png`, quadro 2) **sai cortada pela borda direita do canvas** — precisa de margem extra no canvas ou a bola precisa nascer mais perto do focinho.

---

## 4. Recomendação — pipeline só com ferramentas gratuitas, para o elenco inteiro

Para espécies que **não existem** no catálogo DS (o problema real que motivou este teste — ver §5 sobre Agumon especificamente):

1. **Referência de design (feita pelo fundador, nunca por agente/API — D12):** prompt ao ChatGPT (gratuito) pedindo a espécie em pixel art, pose 3/4 parada (não de ação, para servir de base neutra a mais poses depois — ponto a pedir explicitamente no prompt, já que a pose dinâmica do Método A atual é o que mais limita a emoção `derrota`/triste). Pedir também, numa segunda mensagem, a visão de perfil e a visão de costas da **mesma** criatura, para reduzir a lacuna do item 2.1 do brief — aceitando que a consistência entre as 3 vistas vai precisar de checagem humana.
2. **Pixel Art Fixer da Retro Diffusion, gratuito no navegador, feito pelo fundador** (como já está registrado na pesquisa) sobre cada uma das vistas — corrige a grade falsa do ChatGPT para pixel 1:1 de verdade. Isto já é o que torna o resultado "ChatGPT (A)" medido em §2.2 bom o bastante em escala e paleta; sem o Fixer, a arte do ChatGPT normalmente não tem grade real.
3. **Editor gratuito (Piskel, Pixelorama ou LibreSprite — rodam local ou no navegador, sem custo):**
   - ajustar manualmente a paleta para 12–17 cores fechadas, igual ao medido em §2.1;
   - adicionar manga/sobreposição nas juntas (ombro, quadril, base da cauda) antes de recortar, para reduzir a fresta de emenda de §2.1;
   - desenhar/corrigir a mão a vista de costas quando o ChatGPT não a entregar de forma consistente com a frente — é o ponto mais fraco deste pipeline e o mais provável de precisar de olho humano.
4. **Recorte e animação pelo rig do estúdio** (`cutrig.py`/`anims.py`), com as regiões de corte ajustadas por espécie (não é automático — ver §3) e, antes de aprovar, **inspeção com zoom** (como fiz nesta revisão) especificamente nas poses de maior deslocamento (`derrota`, `ataque`, `bravo`) para pegar frestas de emenda e corrigi-las no editor do item 3 se passarem de ~2–3px.
5. **Checar a escala**: bbox real da pose neutra deve cair em 33–35px de altura (medição simples com qualquer um dos editores gratuitos ou com o próprio `bbox_opaque` já existente em `pxpng.py`) — não "por volta de", medir e registrar como fiz em §2.2.
6. **Passar pela matriz do Style Bible §8** antes de qualquer uso em jogo, numa sessão de revisão separada da que produziu (como esta).

Este pipeline **não precisa do rig do zero (`agumon_s.py`) para o desenho em si** — o papel do rig do estúdio aqui é só o motor de animação (corte + translação), não o desenhista. O "do zero" fica útil só como ferramenta de prototipagem rápida/placeholder interno, não como arte de produção (§2.2).

---

## 5. Conflito em aberto que este teste toca (não resolvido aqui — é da Etapa 6)

O Style Bible (`DIGIMON_STYLE_GUIDE.md` §2.2, decisão do fundador de 11/11) manda que **Digimon que já existem no catálogo DS usem o sprite oficial, sem redesenho nem re-escala por IA** — e Agumon **já tem** sprite DS oficial (`agumon_ds_south.png`, 20×27px reais). Isto significa que **nenhum dos dois Agumons testados aqui (do zero ou ChatGPT+rig) deveria substituir o Agumon oficial em jogo** — o valor deste teste é só como **prova de método** para espécies que não têm sprite DS, usando Agumon como cobaia por já ter uma referência para medir fidelidade contra. Se este ponto não estiver claro para quem decidir os próximos passos, o risco é a Etapa 6 acabar usando um Agumon redesenhado para uma espécie que já tinha solução pronta e gratuita (o rip oficial). Não é a mim que cabe decidir se o pipeline do §4 vale a pena financeiramente ou de calendário — só registrar que ele é **metodologicamente válido apenas para a lacuna (espécies fora do DS)**, não para Agumon em si.

Os outros conflitos abertos da Etapa 6 (Endesga-32 × v13/v15, escala Tamer/Digimon, critério unificado de qualidade, composição/densidade de mapa, convenções da Database) não são tocados por este teste específico de Agumon/rig e continuam em aberto, como já registrado em AGENTS.md §2.

---

## 6. O que falta para o fundador decidir

1. Autorizar (ou não) o pipeline do §4 como caminho oficial para espécies fora do DS — e, dentro dele, confirmar que os passos 1 e 2 (ChatGPT + Fixer) continuam sendo feitos **pessoalmente pelo fundador**, nunca por agente/API (D12).
2. Decidir se vale trazer um artista humano de pixel art para os passos 3–4 (hoje adiado por decisão do fundador, citada no brief) ou se Piskel/LibreSprite por um agente/o próprio fundador bastam no curto prazo.
3. Confirmar o entendimento de §5 — este teste não qualifica nenhum Agumon novo para substituir o sprite DS oficial.
