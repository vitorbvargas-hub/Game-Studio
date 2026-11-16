# Retro Diffusion — documentação atualizada (2026-11-15)

**Digital Odyssey (GS-003) · game-research · 2026-11-15, 22:25–23:10 · custo PixelLab: 0 gerações · custo Retro Diffusion: US$ 0**
Nenhuma ferramenta PixelLab foi chamada. Nenhuma conta foi criada, nenhum login foi feito, nenhuma chave de API foi usada e nenhuma imagem foi enviada ao Retro Diffusion. Fan game não oficial, sem licença; nada é publicado.
Legenda: **[E]** evidência lida nesta tarefa, com URL e data · **[L]** lido do relatório de 14/11 (`fase15-f5-retro-diffusion/RELATORIO_F5.md`), não reverificado · **[H]** hipótese · **NÃO VALIDADO**.

Base de comparação: `fase15-f5-retro-diffusion/RELATORIO_F5.md` (lido em 2026-11-14). Este documento marca explicitamente **o que mudou** desde então.

## 1. Fontes lidas em 2026-11-15

- F1: `https://retrodiffusion.ai/` (home)
- F2: `https://retrodiffusion.ai/pricing`
- F3: `https://retrodiffusion.ai/app/guide` (user guide; a mesma página que em 14/11 estava em `/app/guide`, agora com o conteúdo bem mais extenso — ver §2)
- F4: `https://raw.githubusercontent.com/Retro-Diffusion/api-examples/main/llms.txt` ("verified 2026-09" no próprio arquivo — ou seja, mais recente que a leitura de 14/11, que também citava "verified 2026-09"; o conteúdo mudou mesmo com a mesma data de verificação declarada, ver §3)
- F5: `https://github.com/Retro-Diffusion/api-examples` (README)
- F6: `https://astropulse.itch.io/retrodiffusion` (extensão Aseprite)
- F7: `https://api.retrodiffusion.ai/v2/status` (sem autenticação)
- F8: `https://retrodiffusion.ai/terms` e `https://retrodiffusion.ai/privacy` (tentativa; ver §6)
- F9: Internet Archive (`archive.org/wayback/available` + snapshot de 2026-09-18) — tentativa, ver §6

## 2. O que mudou desde 14/11 (resumo)

| Mudança | Antes (14/11, `RELATORIO_F5.md`) | Agora (15/11) | Fonte |
|---|---|---|---|
| **Modelo padrão do site** | RD Fast era descrito como "rascunho"; RD Core existia mas não era destacado como padrão | **RD Core é agora o modelo padrão do site**: "about 90% of RD Pro's quality... about 4x faster than RD Pro", até 512 px, US$ 0,10/imagem | [E] F1, F3 |
| **RD Plus saiu do site** | RD Plus era listado como "só API" entre os modelos | **Confirmado e explícito**: "RD Plus has left the website: RD Core covers the same ground... The RD Plus styles... are still available through the API and MCP at $0.06 per image, with the same style ids as before" | [E] F3 |
| **Servidor MCP** | Não mencionado no relatório de 14/11 | **Existe e está documentado**: `https://mcp.retrodiffusion.ai/mcp` (HTTP, `Authorization: Bearer <key>`), **33 ferramentas** (geração, Low-Poly 3D, Pixel Fixer, estimativa de custo grátis, jobs assíncronos, ferramentas de edição, estilos próprios, saúde do serviço). Guias de configuração para Claude Code, Cursor, VS Code, Windsurf, Claude Desktop em `github.com/Retro-Diffusion/retro-diffusion-mcp` | [E] F4, F5 |
| **Animações só-por-texto saíram do site** | 14/11: ferramentas como `four_angle_walking`, `8_dir_rotation`, `any_animation`, `vfx` eram descritas como disponíveis no site e na API | **Agora só API/MCP**: "The prompt-only sprite animation formats... have left the website. They are still available through the API and MCP at the same prices. On the site, use Advanced Animations" | [E] F3 |
| **API v2** | Não detalhada no relatório de 14/11 (o `curl` de teste recebeu 403 do proxy de saída) | Estrutura mais madura: toda geração é assíncrona (`POST` → `task_id` → *polling*), erro padronizado `{"error":{"code","message","request_id"}}`, `Idempotency-Key` recomendada antes de todo envio pago, "API ACTIVITY" com histórico de 24 h (saídas) / 30 dias (metadados), V1 "remains supported with no retirement plan" | [E] F4 |
| **Pixel Art Fixer** | Já existia, grátis no site, roda local (Rust/WASM) | **Sem mudança** — confirmado: "Processing runs locally in your browser... so the image is not uploaded for processing" | [E] F3 |
| **Low-Poly 3D** | Já documentado em 14/11 | Sem mudança relevante de preço; API agora documenta `split`, `re-rig`, `recolor` com mais detalhe | [E] F4 |
| **Extensão Aseprite** | "Está sendo descontinuada", preços US$ 65 / 20 | **Sem mudança de preço nem de status**; a frase de descontinuação é a mesma ("in the process of being phased out... hopefully be available (for free)... within the year") — pode ser texto reaproveitado, não uma atualização nova | [E] F6 |
| **Preços por item** | RD Core 0,10 · RD Fast 0,03 · RD Pro 0,18 · Advanced Animations 0,10–0,25 (rotate 0,10) · Low-Poly por tamanho | **Mesmos valores** — nenhuma mudança de preço identificada | [E] F2, F3, F4 |
| **Saldo grátis** | US$ 0,50, sem cartão | **Sem mudança** | [E] F1, F3 |
| **"Images made with free usage are public"** | Citada, sem contexto adicional; "não encontrei a definição de free usage" | **Mesma frase, agora com o parágrafo completo ao redor** (§12 do guia, "Explore"): ver §4 abaixo — mais contexto, ainda não 100% inequívoco | [E] F3 |
| **Termos/privacidade** | Página só carrega via JavaScript; Internet Archive recusou (429) | **Mesma limitação**; Internet Archive agora recusa até o snapshot que antes estava disponível (§6) — pior acesso, não melhor | [E] F8, F9 |

**Leitura geral [H]:** a mudança mais relevante para a nossa decisão é o **MCP server** (novo canal de automação) e a **consolidação em RD Core como padrão** (RD Plus e as animações só-texto migraram para "API/MCP apenas", o site ficou mais simples). Nenhuma mudança altera a análise de custo ou de risco de PI feita em 14/11.

## 3. Modelos, preços e recursos de animação (estado atual, 15/11)

### 3.1 Modelos de imagem

| Modelo | Faixa de tamanho | Preço | Observação |
|---|---|---|---|
| RD Core | 12–512 px, qualquer proporção | US$ 0,10/imagem | Padrão do site; até 9 imagens de referência; até 4 por lote |
| RD Fast | 64–384 px (varia por estilo) | US$ 0,03/imagem | Mais rápido e barato; até 15–16 por lote |
| RD Pro | 12–256 px | US$ 0,18/imagem | Maior qualidade; até 9 referências; até 4 por lote; inclui estilos `edit` e `pixelate` |
| RD Mini | 16–192 px | a partir de US$ 0,03/imagem | Pequenos ícones/sprites; variantes "fast" mais baratas |
| RD Plus | 64–384 px | US$ 0,06/imagem | **Só via API/MCP** (saiu do site) |

[E] F2, F3, F4.

### 3.2 Animação (o que interessa ao nosso teste)

**Advanced Animations** (a aba do site; `input_image` obrigatória, 32–256 px igual ao quadro enviado, lote = 1):
- Ações com motor de movimento: `walking`, `idle`, `jump`, `crouch`, `attack`, `destroy` — US$ 0,14 cada.
- `custom_action` (qualquer movimento descrito em texto) e `subtle_motion` (movimento ambiente) — US$ 0,25 cada.
- `rotate` — gera as outras 7 vistas do sprite enviado (não é movimento): US$ 0,10. **Exige tamanho múltiplo de 8** (ex.: 64×64; 60×60 **não** serve diretamente — ver `PROTOCOLO_TESTE_F5.md` §3). Saída: GIF de 8 vistas por padrão, ou folha 3×3 com `return_spritesheet: true` (centro vazio; topo = frente, base = costas, laterais = perfil, cantos = diagonais — mesma ordem do antigo `8_dir_rotation`).
- Duração: 4, 6, 8, 10, 12 ou 16 quadros (`frames_duration`), exceto `rotate`, que ignora esse campo.
- "Your art stays on-model; the motion is generated around it" — **afirmação do fornecedor, sem validação prática** [E da afirmação, NÃO VALIDADO do resultado].

**Animações só-por-texto** (API/MCP apenas, desde a mudança do site, §2): `four_angle_walking` (48×48), `four_angle_walking_idle` (48×48), `small_sprites`, `vfx` (24–96 px), `any_animation`, `big_animation`, `8_dir_rotation` (80×80), `battle_sprites` — preços de US$ 0,07 a US$ 0,25. Não usaremos nenhuma neste protocolo: o brief pede **a partir do nosso sprite**, que é o caso do Advanced Animations, não dessas.

[E] F3, F4.

### 3.3 Edição e limpeza

Image Edit, Inpainting, Outpainting, Seam Tiling — US$ 0,12 cada. Background Remover, Color Style Transfer — US$ 0,01 cada. Color Reducer, Palette Converter, K-Centroid Downscale, Pixel Correction (experimental), Rotate (experimental) — **grátis no site** (precisa de saldo positivo pequeno); na API, Pixel Fixer custa US$ 0,002 (padrão) ou US$ 0,005 (neural). [E] F3, F4. Sem mudança desde 14/11.

### 3.4 Formatos de saída

PNG com fundo transparente (background removal integrado), folha de sprites, GIF, exportação para SpriteFusion (tilesets). `return_spritesheet: true` em animações devolve PNG em folha no lugar do GIF. [E] F3, F4.

### 3.5 Preço, créditos grátis, "Claim" diário

- **Sem assinatura.** Saldo pré-pago em dólar, nunca expira. Recarga mínima US$ 5; a partir de US$ 50, bônus de 10%. Auto-recarga opcional (desligada por padrão).
- **Conta nova:** US$ 0,50 de saldo, **sem cartão**. "Enough for 16 RD Fast images or 2 RD Pro images."
- **Não existe "Claim" diário documentado.** Nem em 14/11 nem agora apareceu qualquer menção a um crédito diário gratuito recorrente — só o saldo inicial único de US$ 0,50 por conta nova. Se o comando original presumiu um "Claim" diário, **não encontrei essa afirmação em nenhuma das duas leituras**; marco como **NÃO CONFIRMADO**.
- Toda geração que falha é reembolsada automaticamente.
- Faturamento mensal por convite, para equipes (Discord ou e-mail do suporte) — sem relevância para o nosso caso.

[E] F1, F2, F3.

## 4. "As gerações gratuitas ficam públicas?" — com mais contexto que em 14/11

Texto completo do guia (§12 "See what the community is creating", seção "Images"), lido em 2026-11-15:

> "Share your own images with Share to Explore on the canvas. Shared images show your name and link to your collection; you can remove them any time. **Images made with free usage are public.**"

**Leitura [H], mais forte que a de 14/11, mas ainda não uma confirmação jurídica:**
- A primeira frase descreve um ato **voluntário** ("Share to Explore"), reversível ("you can remove them any time").
- A terceira frase está **separada** da primeira — não diz "compartilhe e isso ficará público", diz uma coisa adicional: imagens feitas com "uso grátis" são públicas, **sem mencionar um ato de compartilhar nem uma forma de remover**.
- "Free usage" ainda **não tem definição explícita** no texto lido. A leitura mais provável [H] é que se refere ao **saldo grátis inicial de US$ 0,50** (distinto de saldo pago), porque é o único "uso grátis" de geração mencionado em toda a documentação — mas o guia não diz isso com essas palavras, e pode também significar "uso das ferramentas grátis do site" (Pixel Art Fixer, redutor de cor etc.), que **não geram imagem nova** e portanto não teriam o que publicar.
- **Continua NÃO CONFIRMADO** se usar o saldo grátis de US$ 0,50 publica automaticamente a imagem gerada, e se há uma forma de remover essa publicação específica (distinta do botão de remover do "Share to Explore").
- **Consequência prática para o Digital Odyssey:** se o cenário de teste usar saldo grátis, **não dar como certo que o resultado fica privado**. Um personagem original (como proposto em `PROTOCOLO_TESTE_F5.md`) elimina o risco de exposição de Digimon, mas não elimina a possível exposição pública de arte do projeto (ainda que original e sem marca). Pagar a recarga mínima (US$ 5, saldo pago) evita a ambiguidade por completo, pela leitura mais provável da frase.

[E] da citação exata, F3 · [H] da interpretação · **NÃO CONFIRMADO** a definição operacional de "free usage".

## 5. Direitos de uso

> "Yes. You own your outputs and can use them in personal and commercial projects alike." [E] F1 — mesma frase de 14/11, sem mudança.

Isso responde "quem é dono da saída", não "o que você pode enviar como entrada" nem "o que a empresa pode fazer com o que você envia" (treino de modelo, retenção, etc.) — essas perguntas dependem dos Termos de Uso e da Política de Privacidade completos, que **não puderam ser lidos** (§6).

## 6. Termos de uso e privacidade — ainda NÃO VALIDADO

- `retrodiffusion.ai/terms` e `retrodiffusion.ai/privacy` continuam retornando só o `<title>` da página: o conteúdo carrega via JavaScript no navegador, e a ferramenta de leitura deste agente não executa JavaScript. **Mesma limitação de 14/11.**
- Tentei o Internet Archive: `archive.org/wayback/available` **encontrou** um snapshot de ambas as páginas em `20260918172915` (18/09/2026) — mais recente que a tentativa de 14/11 teria encontrado, então em tese seria uma leitura melhor que a anterior. Mas ao buscar o snapshot em si, o Internet Archive recusou com **HTTP 429 "suspected abusive bot traffic that is degrading the performance of the Wayback Machine"** — uma recusa mais dura que a de 14/11 (que teve o mesmo 429, mas em outra tentativa).
- **Continua NÃO VALIDADO:** o conteúdo completo dos termos e da política de privacidade. Isso inclui, sem poder confirmar: o que a empresa pode fazer com imagens enviadas como entrada (treino de modelo?), retenção de dados, e qualquer cláusula sobre conteúdo de terceiros ou propriedade intelectual de marcas enviadas por usuários.
- **Recomendação prática, sem mudança em relação a 14/11:** antes de qualquer envio de imagem (mesmo um personagem original), alguém com navegador comum (não este agente) deveria abrir essas duas páginas e ler o texto renderizado. Isso é rápido e resolveria a lacuna sem gastar nada.

[E] da tentativa e do resultado · **NÃO VALIDADO** do conteúdo.

## 7. O que foi confirmado e o que não foi (atualização da tabela de 14/11)

| Confirmado [E] em 15/11 | Mudou desde 14/11? | Ainda não confirmado |
|---|---|---|
| RD Core é o modelo padrão do site, US$ 0,10, até 512 px | Sim (antes não era "o padrão" destacado) | Qualquer resultado prático com nosso sprite |
| RD Plus saiu do site, só API/MCP, US$ 0,06 | Sim (antes ambíguo) | Conteúdo de `/terms` e `/privacy` |
| MCP server existe, 33 ferramentas, `mcp.retrodiffusion.ai` | Sim (não mencionado em 14/11) | Definição exata de "free usage" na frase de publicidade |
| Animações só-texto saíram do site, só API/MCP | Sim | Taxa de falha/tempo real de `rotate`, `walking`, `idle` |
| Preços de Advanced Animations e Low-Poly | Não (iguais) | Se há "Claim" diário (não encontrado em nenhuma das duas leituras) |
| Saldo grátis US$ 0,50, sem cartão | Não (igual) | — |
| "You own your outputs" | Não (igual) | — |
| `rotate` exige múltiplo de 8 | Não (igual, só mais explícito agora) | — |
| Serviço no ar (`/v2/status`: rd_fast, rd_pro, rd_plus, animations, background_removal = "ok") | — | Tempo real de resposta |

## 8. O que não foi feito

- Nenhum experimento prático. Nenhuma conta, chave ou login.
- Leitura completa dos Termos de Uso e da Política de Privacidade (bloqueada por JavaScript e pelo Internet Archive).
- Qualquer envio de imagem, mesmo de teste.
- Decisão sobre o "Cenário 1" (saldo grátis) vs. "Cenário 2" (recarga paga) — fica em `ORCAMENTO_E_RISCOS_F5.md`, para o fundador decidir.
