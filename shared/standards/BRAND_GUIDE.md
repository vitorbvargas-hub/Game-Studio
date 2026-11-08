# Brand Guide — Nação Games (marca-mãe)

> **Autor:** game-art (Art Director) · **Data:** 2026-11-08 · **Status:** rascunho para aprovação do fundador
>
> **Escopo:** este guia cobre apenas a identidade da **marca-mãe do estúdio** (o "guarda-chuva" institucional — site do portfólio, decks, documentos, assinatura em comunicações, página "sobre"). **Cada produto (GS-001 Loopwright, C07 ReplyDraft, etc.) tem sua própria identidade visual**, definida em seus próprios documentos (ver `projects/discovery/GS-001/VISUAL_PROPOSALS.md`). Não misture a paleta/tipografia do estúdio com a de um produto lançado.
>
> Marcação: **[E]** evidência (fonte + data) · **[H]** hipótese/decisão de design não testada com usuários · **[PROPOSTA]** decisão que depende de aprovação do fundador.

---

## 1. Nome de marca — **Nação Games** (decidido pelo fundador em 2026-11-08, ADR-005)

Nome oficial: **Nação Games**. As propostas abaixo ficam só como registro histórico. Nenhum domínio foi comprado e nenhuma marca foi registrada; isso exige aprovação.

| # | Nome proposto | Racional |
|---|---|---|
| 1 | **Pivô Studio** | Remete ao princípio nº1 do estúdio — "validar antes de construir" (`VISION.md`) — um pivô é a decisão ágil de mudar de direção com base em evidência. Curto, memorável, soa bem em PT-BR e EN ("Pivot Studio"). |
| 2 | **Forjaria Studio** | Metáfora de "forjar" produtos pequenos e bem feitos, um de cada vez. Transmite ofício e cuidado artesanal, sem soar infantil. |
| 3 | **Capivara Labs** | Nome com personalidade local (capivara = mascote em potencial, amigável, memorável), cria abertura para um mascote-símbolo do estúdio sem depender da estética de nenhum produto específico. |

**Nota de segurança de marca:** nenhuma opção usa a raiz "Norte/Sharp" ou se aproxima de nomes de empresas-irmãs do fundador (Norteo, Sharp), para evitar confusão de marca entre projetos distintos — conforme regra de escopo do `GOVERNANCE.md`.

Até decisão do fundador, toda documentação interna continua usando "Game Studio" como placeholder.

---

## 2. Paleta — marca-mãe

Paleta institucional, deliberadamente **neutra e distinta** das paletas de produto (ex.: âmbar/grafite do Loopwright, petróleo/gelo do ReplyDraft) para que a marca-mãe nunca seja confundida com um produto específico.

| Cor | Hex | Papel |
|---|---|---|
| Índigo profundo | `#1F2A44` | Cor primária institucional — headers, rodapé do portfólio, capa de decks |
| Branco-areia | `#F7F5F2` | Fundo principal, superfícies claras |
| Grafite-texto | `#15181D` | Texto principal sobre fundos claros |
| Coral | `#F2654A` | Accent — CTAs do site do portfólio, destaques, nunca como cor de produto |
| Verde-validação | `#3C8A5B` | Status "validado"/"aprovado" em documentos internos (ex.: Opportunity Score) |
| Âmbar-atenção | `#E8B23D` | Status "pendente"/"em revisão" |

### Checagem de contraste WCAG AA (calculada, não estimada)

| Par | Contraste | Resultado |
|---|---|---|
| Grafite `#15181D` sobre Branco-areia `#F7F5F2` | **16.4:1** | Passa AA e AAA (texto normal e pequeno) |
| Branco-areia `#F7F5F2` sobre Índigo `#1F2A44` | **13.1:1** | Passa AA e AAA |
| Texto branco sobre Coral `#F2654A` | **3.1:1** | **Não passa AA** para texto normal (precisa 4.5:1); só serve para texto grande/bold (≥24px) |
| Grafite `#15181D` sobre Coral `#F2654A` | **5.7:1** | Passa AA para texto normal — **usar grafite, não branco, como texto sobre coral** |
| Branco sobre Verde-validação `#3C8A5B` | **4.2:1** | **Não passa AA** para texto normal (marginal); usar só em texto grande/bold ou trocar para grafite |
| Grafite `#15181D` sobre Âmbar `#E8B23D` | **9.2:1** | Passa AA e AAA |

**Regra prática:** nunca usar texto branco sobre coral ou verde em corpo de texto normal — usar grafite `#15181D` como texto nessas duas cores.

---

## 3. Tipografia — apenas fontes livres (Google Fonts / licença OFL)

| Uso | Fonte | Licença | Fonte da info |
|---|---|---|---|
| Display / títulos institucionais | **Space Grotesk** | OFL 1.1 | Catálogo Google Fonts, verificado 2026-11-08 **[E]** |
| Corpo / UI / documentos | **Inter** | OFL 1.1 | Catálogo Google Fonts, verificado 2026-11-08 **[E]** — mesma fonte já usada nos dois produtos finalistas do GS-001, o que é aceitável para corpo de texto (fonte utilitária comum), mas o **display/títulos deve diferenciar a marca-mãe** dos produtos. |

Nunca usar fontes proprietárias ou com licença incerta. Antes de adotar qualquer fonte nova, confirmar licença OFL/CC0 no próprio Google Fonts.

---

## 4. Tom de voz — marca-mãe

- **Direto e baseado em evidência.** Afirmações sobre o estúdio (no site do portfólio, em decks) devem poder ser verificadas; evitar hype ("revolucionário", "disruptivo").
- **Transparente sobre estágio.** Comunicar claramente quando um produto está em discovery, MVP ou validado — nunca inflar status.
- **Confiante, não vendedor.** Fala como um parceiro técnico que mostra o trabalho, não como um pitch de investidor.
- **Sem mascote de produto na voz institucional.** A marca-mãe fala em texto neutro; personalidade lúdica (ex.: Loopwright) fica só na camada de produto.

---

## 5. Uso do símbolo/logo

Três propostas de símbolo foram geradas como ponto de partida visual (ver seção 7 — Propostas de símbolo). Regras gerais, válidas para a opção final que o fundador escolher:

- **Área de respiro mínima:** altura de um "x" do próprio símbolo em todos os lados.
- **Tamanho mínimo:** não reduzir abaixo de 24px de altura (digital) ou 10mm (impresso) — abaixo disso, usar só o nome em texto.
- **Não distorcer, não rotacionar, não aplicar sombra/gradiente** fora da paleta institucional da seção 2.
- **Não recolorir** o símbolo com paletas de produto (ex.: nunca em âmbar do Loopwright).
- **Fundos permitidos:** Branco-areia `#F7F5F2` ou Índigo `#1F2A44` apenas — garante contraste previsível.
- **Co-marca com produtos:** quando um produto precisar citar o estúdio (ex.: "by Game Studio" no rodapé de um app), usar apenas texto em Inter, nunca o símbolo completo ao lado do logo do produto, para não competir visualmente.

---

## 6. Grid e espaçamento

- **Grid base:** 8px.
- **Escala de espaçamento:** 4 · 8 · 16 · 24 · 32 · 48 · 64 (px) — usar sempre múltiplos dessa escala em layouts institucionais (site do portfólio, decks, documentos visuais).
- **Raio de borda padrão:** 8px (componentes pequenos), 16px (cards/painéis grandes) — cantos levemente arredondados, consistente com o tom "confiante, não corporativo frio".

---

## 7. Propostas de símbolo (teste de geração — não aprovado)

Três propostas geradas via Recraft (pipeline descrito em `ASSET_SOURCING.md`) como ponto de partida para discussão com o fundador. **Nenhuma foi escolhida ou aprovada.** Arquivos em `assets/branding/proposals/`:

| Arquivo | Conceito |
|---|---|
| `symbol-01-loop-gem.svg` | Selo quadrado arredondado com uma gema geométrica fundida a um pequeno entalhe de "play" — remete a "produto validado" + jogo. |
| `symbol-02-controller-spark.svg` | Silhueta simplificada de controle de jogo com uma pequena faísca/estrela saindo do botão central — remete a "criar/faiscar ideias". |
| `symbol-03-pixel-leaf.svg` | Broto/folha pixelada crescendo de uma base de joystick — remete a crescimento de produtos a partir de validação (pixel = jogos, folha = crescimento). |

**Limitação importante [E]:** o script de geração usado (`ilustra-gen.mjs`, modo `vetor`) injeta no prompt a paleta oficial da Sharp (navy `#101b2f`, dourado `#c99430`, creme `#fbfaf5`) independentemente da cena pedida — ver `ASSET_SOURCING.md` seção 1 para detalhes. **As 3 imagens geradas saíram nas cores da Sharp, não na paleta do Game Studio definida na seção 2 deste guia.** Servem apenas para avaliar a *forma/composição* do símbolo, não a cor final — a versão aprovada precisará ser recolorida manualmente ou gerada por um pipeline próprio do estúdio (proposta registrada em `ASSET_SOURCING.md`).

---

## 8. Acessibilidade — regras gerais

- Toda combinação de cor/texto usada em material institucional deve atingir **AA (4.5:1 texto normal, 3:1 texto grande)** — ver tabela da seção 2.
- Nunca comunicar status (validado/pendente/erro) **só por cor** — sempre acompanhar de texto ou ícone (ex.: "✓ Validado", não só uma bolinha verde).
- Documentos e slides institucionais devem ser legíveis em escala de cinza (teste informal: imprimir em P&B e checar se a hierarquia ainda é clara).
