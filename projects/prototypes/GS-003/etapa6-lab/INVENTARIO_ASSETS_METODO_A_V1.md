# INVENTARIO_ASSETS_METODO_A_V1 — Etapa 6, Comando 3, passo 4 de 7

- **Autor:** game-art (subagente) · **Data:** 2026-11-13.
- **Prevalece sobre este documento:** `COMANDO_ETAPA6_C3_ADENDO_PORTAO.md` §2/§3/§7 (o ZIP consolidado ainda não chegou; o Método A não começa com o pacote antigo de 4 folhas; nenhuma avaliação deve presumir conteúdo que não foi recebido).
- **Base lida:** `INVENTARIO_ASSETS_CHATGPT.md` (registro do pacote de 13/11, `digital_odyssey_assets_fase4.zip`); `RELATORIO_AVALIACAO_ASSETS_FASE0.md` (avaliação (A) do game-art + revisão (B)/independente do game-qa); `COMANDO_ETAPA6_C3_ADENDO_PORTAO.md` §2 (lista do que o fundador declarou que virá no ZIP consolidado).
- **Regra respeitada:** nenhuma inspeção inventada — tudo que não foi recebido está marcado **PENDENTE — não recebido**, sem presumir conteúdo. Nenhuma geração PixelLab, nenhum código/mapa/Database alterado, nenhum outro agente acionado.

---

## 1. O que já existe — pacote de 13/11 (4 folhas, F0-001 a F0-004)

| ID | Espécie | Arquivo | md5 | Dimensões/modo | Avaliação (A) — fidelidade/craft | Avaliação (B) — prontidão técnica |
|---|---|---|---|---|---|---|
| F0-001 | Guilmon (Rookie) | `fase0-chatgpt/extraido/digital_odyssey_assets_fase4/references/guilmon_concept.png` | `07f876678cbab78c5dc1d9237f65f229` | 1536×1024, RGB sem alfa | **3,4/10** — candidato aproveitável (referência de direção/pose), grade de pixel falsa domina a banda | **FALHOU** o portão técnico (I-01 a I-16) — sem alfa, sem pivô, sem manifesto/licença |
| F0-002 | ExVeemon (Champion) | `.../exveemon_concept.png` | `ce3c13dc6a488f9fe05d1b2a08c1eedf` | 1536×1024, RGB sem alfa | **3,9/10** — candidato aproveitável (melhor fidelidade bruta dos 4), 2 escalas na mesma folha | **FALHOU** — idem, mais a inconsistência de escala interna |
| F0-003 | Agumon (Rookie) | `.../agumon_concept.png` | `accf6ea1d2508f1f5528818fac1ef7fe` | 1536×1024, RGB sem alfa | **4,25/10** — candidato aproveitável; **é reaproveitamento, NÃO é resultado do Método A no experimento controlado** (separação obrigatória, `INVENTARIO_ASSETS_CHATGPT.md` §4.2) | **FALHOU** — idem |
| F0-004 | Gabumon (Rookie) | `.../gabumon_concept.png` | `bb627a4b3dc8fbd8243caca0a0c615f6` | 1536×1024, RGB sem alfa | **4,25/10*** — candidato aproveitável (2ª melhor fidelidade) | **FALHOU** — idem |

*\*Nota não corrigida no documento original: o `RELATORIO_AVALIACAO_ASSETS_FASE0.md` publica "4,0", mas a própria fórmula do autor (3×0,583+6×0,25+6×0,167) dá 4,25 — erro aritmético confirmado pela revisão do game-qa, não corrigido no documento-fonte. Reportado aqui de novo, não corrigido por este agente (regra de revisão: não reescrever o texto do autor sem instrução).*

**Achado transversal (confirmado por 2 sessões independentes, game-art e game-qa):** as 4 folhas têm **grade de pixel falsa** (sombreamento em degradê redondo, sem blocos N×N reais) — são ilustrações "pixel-styled", não pixel art 1:1. Nenhuma tem transparência real (RGB sem canal alfa, quadriculado pintado). Nenhuma nota chega perto do mínimo de homologação (8,0) — e não precisa: é Fase 0 de referência, não produção final.

**Separação obrigatória:** Guilmon, ExVeemon e Gabumon estão **fora** do elenco do briefing A/B/C (`BRIEFING_UNICO_LAB_A_B_C.md` §1). Agumon (F0-003) está no elenco prioritário, mas esta avaliação de reaproveitamento **não substitui** o resultado que o Método A deve produzir no experimento controlado.

---

## 2. O que o fundador declarou que virá no ZIP consolidado (`COMANDO_ETAPA6_C3_ADENDO_PORTAO.md` §2)

**Todos os itens abaixo: PENDENTE — não recebido.** Nenhuma inspeção foi feita, porque o arquivo não existe no estúdio. O README do pacote de 13/11 já avisa que os 4 itens recebidos são "RASCUNHO / NÃO IMPORTAR" — o pacote novo, mesmo quando chegar, não deve ser presumido como spritesheet ou tileset tecnicamente pronto (regra explícita do adendo §2).

| Categoria | Conteúdo declarado | Status |
|---|---|---|
| Elenco prioritário | Koromon, Agumon, Greymon, MetalGreymon, WarGreymon | **PENDENTE — não recebido** |
| Elenco complementar | Betamon, Kunemon, Palmon, Kuwagamon | **PENDENTE — não recebido** |
| Referências anteriores | Guilmon, ExVeemon, Gabumon (atualizadas ou substitutas das já recebidas) | **PENDENTE — não recebido** (as 4 folhas de 13/11 continuam sendo as únicas existentes) |
| Tamer e personalização | Conceitos de Tamer, camadas/opções de customização | **PENDENTE — não recebido** |
| Poses e animações | Pranchas de poses e animações (walk, idle, attack etc.) | **PENDENTE — não recebido** |
| Floresta e terreno | Floresta de File Island, referências de terreno | **PENDENTE — não recebido** |
| Árvores e vegetação | Árvores, vegetação variada | **PENDENTE — não recebido** |
| Água | Rio, lago, água em geral | **PENDENTE — não recebido** |
| Ponte | Ponte sobre o rio | **PENDENTE — não recebido** |
| Cachoeira | Cachoeira | **PENDENTE — não recebido** |
| Estruturas digitais | Santuário, elementos/estruturas digitais | **PENDENTE — não recebido** |
| NPCs | NPCs, interações, diálogos, ambientação | **PENDENTE — não recebido** |
| UI | Conceitos de interface | **PENDENTE — não recebido** |
| VFX | Conceitos de efeitos visuais | **PENDENTE — não recebido** |
| Manifestos | Documentos de direção artística e manifestos técnicos | **PENDENTE — não recebido** |

**Nenhum destes itens foi inventado, presumido ou antecipado.** O Método A, por instrução direta do adendo (§2/§3), **não começa** com o pacote antigo de 4 folhas — e a ausência do pacote novo **não autoriza** recriar os itens acima do zero.

---

## 3. Checklist de recepção (a aplicar quando o ZIP chegar)

Esta checklist não foi aplicada a nada ainda — é o procedimento que o `game-studio` (recepção) e o `game-art` (avaliação) seguem assim que o arquivo chegar, na mesma estrutura já usada para o pacote de 13/11 (`INVENTARIO_ASSETS_CHATGPT.md` §3).

| # | Item | O que verificar |
|---|---|---|
| 1 | Hash | md5 (ou sha256) de cada arquivo, registrado junto com a data de recebimento, para rastreabilidade e para detectar duplicidade com o pacote já recebido |
| 2 | Formato | Extensão real (PNG/JPEG/ZIP/PDF?), modo de cor (RGB/RGBA), se há canal alfa real ou quadriculado pintado |
| 3 | Dimensão | Largura × altura em px; se há múltiplos tamanhos/escala dentro do mesmo arquivo (achado já visto no ExVeemon F0-002: 2 escalas na mesma folha) |
| 4 | Prancha conceitual × sprite técnico | A imagem é uma ilustração/concept art (sem grade de pixel real, sem contrato de quadro) ou já é um sprite recortável (grade real, canvas constante)? Usar o mesmo método de verificação de grade já aplicado na Fase 0 (ampliação nearest-neighbor 4×, detecção de blocos N×N) |
| 5 | Transparência e grade 1:1 | Fundo com alfa 0 real (não halo, não chroma pintado); se há grade, confirmar que é pixel art nativa e não upscale (blocos N×N idênticos) |
| 6 | Fidelidade | Comparação com o design oficial da espécie/elemento (anatomia, cores, proporções) — mesmo critério já usado nas fichas F0-001..004 |
| 7 | Quadros por estado | Quantos quadros existem por animação/estado (idle, walk, attack, hurt, victory); se cobrem o mínimo exigido pelo briefing (`BRIEFING_UNICO_LAB_A_B_C.md` §1) |
| 8 | Consistência | Entre poses/quadros da mesma folha (proporção, paleta, contorno) — e entre arquivos diferentes do mesmo elenco (um Digimon não pode mudar de estilo entre a folha de idle e a de walk) |
| 9 | Necessidade de redesenho | Se a grade for falsa ou a fidelidade for baixa, registrar se o item é "candidato aproveitável" (referência), "precisa de retrabalho" (parcial) ou "fraco como referência" (descartar como base, manter só como inspiração) — nunca "aprovado" nesta fase |
| 10 | Export em PNG transparente | Se o arquivo final, depois de qualquer conversão, sai como PNG RGBA com alfa 0 no fundo — pré-requisito do item I-01 da checklist técnica (`COMPARATIVO_FERRAMENTAS_VISUAIS.md` §6.5) |

**Separação obrigatória de sempre:** (A) qualidade artística/fidelidade e (B) prontidão técnica nunca se misturam numa nota única (regra do fundador, já aplicada na Fase 0, confirmada em `AJUSTES_RUBRICA_VISUAL_V1.md` §6.5).

---

## 4. Mapeamento "item do briefing → arquivo esperado do ZIP"

Cruza o elenco/mapa do `BRIEFING_UNICO_LAB_A_B_C.md` (§1–§2) com o que o adendo declara que virá (§2 deste documento), para mostrar exatamente onde ficam as lacunas quando o ZIP for avaliado.

| Item do briefing | Categoria declarada no ZIP (§2) | Status hoje |
|---|---|---|
| Tamer base + 2 variações | "Tamer e personalização" | **PENDENTE** — nada recebido; só a especificação de contrato (`ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md`) existe, sem arte |
| Koromon | "Elenco prioritário" | **PENDENTE** |
| Agumon | "Elenco prioritário" + já existe F0-003 (reaproveitamento, não substitui) | **PARCIAL** — 1 folha de reaproveitamento (grade falsa, nota 4,25/10), zero do pacote novo |
| Greymon | "Elenco prioritário" | **PENDENTE** |
| MetalGreymon | "Elenco prioritário" | **PENDENTE** |
| WarGreymon | "Elenco prioritário" | **PENDENTE** |
| Betamon | "Elenco complementar" | **PENDENTE** — mas já existe sprite oficial DS no projeto (`world-species.json`), fora do escopo deste ZIP |
| Kunemon | "Elenco complementar" | **PENDENTE** — e sem nenhuma fonte visual própria no estúdio (fora da Database, sem rip) |
| Palmon | "Elenco complementar" | **PENDENTE** — mas já existe sprite oficial DS no projeto, fora do escopo deste ZIP |
| Kuwagamon | "Elenco complementar" | **PENDENTE** — e sem nenhuma fonte visual própria no estúdio |
| Guilmon, ExVeemon, Gabumon (referências de linha) | "Referências anteriores" | **PARCIAL** — já existem as 3 folhas de 13/11 (notas 3,4 / 3,9 / 4,25), mas o adendo fala em "referências anteriores" como item do ZIP novo — não está claro se são as mesmas ou substitutas; **pendência a esclarecer com o fundador** |
| Poses/animações (idle, walk, attack, hurt) de qualquer espécie do elenco | "Poses e animações" | **PENDENTE** — as 4 folhas já recebidas têm poses soltas (~44–58 quadros cada), mas sem contrato de direção/quadro; o ZIP novo poderia (ou não) trazer isso formalizado |
| Mapa 40×30 — floresta-piloto (chão, caminhos) | "Floresta de File Island" + "referências de terreno" | **PENDENTE** — nenhuma referência de mapa/bioma chegou do ChatGPT até hoje (`ADR_ETAPA6_DECISOES_FUNDADOR.md`, "Estado verificado pelo game-studio": "não chegaram referências de mapa, pranchas de bioma nem animações") |
| Árvores, vegetação (≥3 espécies, item 6 da legibilidade) | "Árvores, vegetação variada" | **PENDENTE** |
| Rio/água | "Água" | **PENDENTE** |
| Ponte | "Ponte" | **PENDENTE** |
| Cachoeira | "Cachoeira" | **PENDENTE** |
| Santuário / elementos digitais | "Estruturas digitais" | **PENDENTE** |
| NPC-guia (clareira de descanso) | "NPCs, interações, diálogos" | **PENDENTE** |
| — (fora do escopo do briefing visual, mas listado no ZIP) | "UI" | **PENDENTE** — fora do elenco/mapa deste briefing, mas declarado no pacote |
| — (fora do escopo do briefing visual, mas listado no ZIP) | "VFX" | **PENDENTE** — idem |
| Manifestos de licença/fonte (ADR-015, I-12) | "Manifestos técnicos" | **PENDENTE** — se o ZIP trouxer manifestos prontos, substitui parte do trabalho A8 (`BRIEFING_UNICO_LAB_A_B_C.md` §6.1); se não trouxer, o `game-dev` continua tendo que criar `creature.json`/`license.json` do zero |

### 4.1 Leitura das lacunas

- **Nenhum item do elenco prioritário tem arte nova confirmada** — o único dado real é o reaproveitamento do Agumon (F0-003), que **não** é resultado do Método A no teste controlado.
- **Nenhum item do mapa (floresta, água, ponte, cachoeira, estruturas) tem referência do ChatGPT recebida até hoje** — isso é consistente com o que o `game-studio` já havia verificado no passo 1 do Comando 3 (`ADR_ETAPA6_DECISOES_FUNDADOR.md`, tabela "Estado verificado").
- **O elenco complementar (Kunemon, Kuwagamon) tem uma lacuna dupla**: nem o ZIP chegou, nem existe fonte visual própria no estúdio para essas duas espécies — qualquer produção (A, B ou C) depende de resolver isso primeiro (mesma pendência registrada em `BRIEFING_UNICO_LAB_A_B_C.md` §6.2.1).
- **O Método A não pode começar hoje** — por instrução do adendo (§3: "não iniciar o Método A utilizando apenas o pacote antigo") e porque não há arte suficiente do elenco/mapa do briefing para produzir a comparação controlada.

---

## 5. O que este documento NÃO faz

- Não avalia nenhum conteúdo do ZIP consolidado — porque ele não existe no estúdio.
- Não presume formato, qualidade ou cobertura do ZIP antes de ele chegar.
- Não decide se as "referências anteriores" do ZIP (item §4) são as mesmas 3 folhas já recebidas ou substitutas — fica registrado como pergunta ao fundador.
- Não inicia o Método A.
- Não gera, converte ou integra nenhum asset.

## 6. Limitações

1. Esta avaliação depende inteiramente dos 2 documentos-fonte já produzidos por outras sessões (`INVENTARIO_ASSETS_CHATGPT.md`, `RELATORIO_AVALIACAO_ASSETS_FASE0.md`) — nenhuma nova inspeção de arquivo foi feita aqui, porque não há arquivo novo para inspecionar.
2. A tabela §4 ("item do briefing → arquivo esperado") é um mapeamento de **expectativa**, não de conteúdo real — ela existe para que a avaliação, quando o ZIP chegar, tenha uma lista objetiva do que procurar, não para prever o que o pacote vai conter.
3. Nenhuma geração PixelLab, nenhum código/mapa/sprite/Database alterado; nenhum commit; nenhum outro agente acionado.
