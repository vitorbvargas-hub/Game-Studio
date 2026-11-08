# GS-002 — ReplyDraft: Assets para a Chrome Web Store (lista + prompts)

- **Status:** PRÉ-APROVAÇÃO — planejamento de assets, nada produzido ou publicado. Ver `shared/decisions/ADR-002-gs002-sem-aprovacao.md`.
- **Nota:** nenhum provider de geração de imagem está configurado ou contratado nesta sessão. Os prompts abaixo são texto preparado para uso futuro — nenhuma imagem foi gerada.

## 1. Tamanhos oficiais exigidos pela Chrome Web Store

| Asset | Tamanho | Formato | Obrigatório? |
|---|---|---|---|
| Ícone da extensão | 16×16, 32×32, 48×48, 128×128px | PNG | Sim **[E]** — tamanhos múltiplos exigidos pelo manifesto MV3 e pela listagem da loja |
| Screenshot da listagem | 1280×800px (ou 640×400px) | PNG/JPEG | Sim, pelo menos 1 **[H]** — quantidade exata e se 1280×800 é o único tamanho aceito deve ser confirmado na documentação oficial vigente da Chrome Web Store antes da submissão, pois a Google altera esses requisitos periodicamente |
| Promo tile pequeno | 440×280px | PNG/JPEG | **[H]** — era um requisito comum em versões anteriores do Developer Dashboard; confirmar se ainda é obrigatório ou passou a opcional antes de produzir |
| Promo tile grande/marquee | 1400×560px | PNG/JPEG | **[H]** — opcional em versões anteriores; confirmar atual |
| Favicon do painel web (fora da loja, mas mesma identidade) | 32×32px | ICO/PNG | Sim para o painel de opções/billing |

**Limitação explícita:** os tamanhos 16/32/48/128 (ícone) e 1280×800 (screenshot) e 440×280 (promo tile) foram fornecidos no brief da tarefa e são consistentes com o que o VISUAL_PROPOSALS.md já registrou; os marcados **[H]** acima não foram reverificados ao vivo na documentação da Chrome Web Store nesta tarefa — confirmar antes de produzir os assets finais, já que a política e os tamanhos aceitos mudam com o tempo.

## 2. Ícone da extensão (16/32/48/128px)

Base: `app/extension/src/ui/icon.svg` (seta de resposta + traço de lápis, petróleo `#1D4E5F` + verde `#2F6E48`), exportado para PNG em cada tamanho a partir do SVG vetorial — não redesenhar manualmente em cada resolução; simplificar o traço do lápis apenas no 16px se o detalhe ficar ilegível (reduzir a 1 forma sólida, sem a quebra em dois tons).

**Prompt de geração (uso futuro, caso se opte por uma versão ilustrada em vez do SVG geométrico):**
> "minimal flat vector icon, curved reply arrow combined with a small pencil stroke overlapping the tail, petrol blue (#1D4E5F) and dark green (#2F6E48) color blocks, simple geometric line work, browser extension toolbar icon style, no text, no gradients, no stars or sparkles, transparent background, optimized for clarity at 16px"

## 3. Screenshots da listagem (1280×800px)

Mínimo recomendado: 3 screenshots, cada um ilustrando um passo da jornada (ver `PROTOTYPES.md` §2.2):

1. Botão "Gerar rascunho" dentro de um e-mail aberto no Gmail (mockup, nunca captura de uma conta Gmail real de terceiros).
2. Popover de preview do rascunho editável, com o aviso "Gerado por IA — revise antes de enviar" visível.
3. Popup da extensão mostrando cota do mês e seletor de tom de voz.

**Prompts de geração (como mockup de UI, não como captura real):**
> 1. "clean UI mockup screenshot, browser extension button labeled with a reply arrow icon placed next to native email reply buttons, minimal professional productivity tool aesthetic, petrol blue accent color, light neutral background, no real brand logos, 1280x800 composition"
> 2. "clean UI mockup screenshot, editable draft preview popover with a text area, a discreet AI-generated disclaimer line, insert and discard buttons, petrol blue and green accents, minimal B2B SaaS style, 1280x800 composition"
> 3. "clean UI mockup screenshot, small browser extension popup panel showing a monthly usage counter and a tone-of-voice selector with radio options, minimal flat design, petrol blue palette, 1280x800 composition"

**Nota de conformidade:** nenhum screenshot deve conter a interface real do Gmail capturada diretamente (risco de marca/trademark); devem ser mockups estilizados que sugerem o contexto (um cliente de e-mail genérico) sem reproduzir o layout exato, cores ou logotipo do Gmail.

## 4. Promo tile pequeno (440×280px) — se confirmado como necessário

**Prompt de geração:**
> "flat vector promotional banner, 440x280 composition, ReplyDraft wordmark placeholder with the reply-arrow-and-pencil icon, petrol blue (#1D4E5F) background, ice white text, minimal professional SaaS tool branding, no gradients, no stock photography, no third-party logos"

## 5. Logo (painel web + marketing, 512×512px base)

**Prompt de geração:**
> "flat vector app logo, rounded square badge, curved reply arrow with a small overlapping pencil stroke, petrol blue (#1D4E5F) primary shape with dark green (#2F6E48) pencil accent, ice white background, minimal geometric B2B SaaS icon style, no gradients, no mascot, no text, 512x512 square composition"

## 6. Ilustração de estado vazio (onboarding, até 400×300px)

**Prompt de geração:**
> "flat vector illustration, empty state for a tone-of-voice management panel, abstract speech bubble shape with a small waveform line inside, muted petrol blue and ice white palette, no characters, no mascot, clean B2B SaaS onboarding style, transparent background"

## 7. Limitações

- Nenhuma imagem foi gerada — todos os itens acima são prompts preparados, condicionados à aprovação do fundador antes de qualquer contratação de serviço pago de geração de imagem.
- Os requisitos de quantidade/obrigatoriedade de promo tiles e número mínimo de screenshots estão marcados **[H]** e precisam de confirmação na documentação oficial vigente da Chrome Web Store antes da submissão — políticas de loja mudam e não foram reverificadas ao vivo nesta tarefa.
- Nenhum nome, logo ou elemento visual de produto existente (Google/Gmail/Gemini ou qualquer outra marca) foi referenciado ou reproduzido nos prompts ou nos assets descritos.
