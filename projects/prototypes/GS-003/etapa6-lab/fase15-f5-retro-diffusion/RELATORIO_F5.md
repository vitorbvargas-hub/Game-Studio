# RELATÓRIO F5: Laboratório Retro Diffusion (Comando 11)

**Digital Odyssey (GS-003) · game-art (Fable 5.2) · 2026-11-14, 16:04–16:09 · custo PixelLab: 0 gerações · custo Retro Diffusion: US$ 0**
Nenhuma ferramenta PixelLab foi chamada (nem `get_balance`). Nenhuma conta foi criada, nenhum login foi feito, nenhuma chave de API foi usada e nada foi enviado ao Retro Diffusion.
Legenda: **[E]** evidência lida nesta tarefa, com URL e data · **[L]** lido de relatório ou QA anterior, não reverificado · **[H]** hipótese · **NÃO VALIDADO**.

## Resumo

1. **Não houve teste prático.** Gerar, animar ou rotacionar no Retro Diffusion exige conta. Existe saldo grátis de US$ 0,50 sem cartão, mas ele depende de cadastro, que o brief não autoriza. Parei na investigação e escrevi `PROPOSTA_TESTE_PAGO.md`.
2. **O Retro Diffusion (site e API) tem, no papel, os recursos que o comando pergunta:** imagem de referência (até 9), animação a partir de um sprite nosso (andar, parado, ataque, ação livre; 4 a 16 quadros), 8 direções a partir de um sprite, folha de sprites, paleta travada e edição por máscara. Tudo isso é [E] de documentação do fornecedor, não de resultado.
3. **Nada disso foi visto funcionando com o Agumon.** Fidelidade, deslizamento de pé, consistência entre quadros e entre direções continuam **sem validação prática**.
4. **A nota de E fica em branco.** A tabela A–D usa só notas de QA independente; dois dos seis critérios do comando não têm nota de QA em nenhum método (ver §4).
5. **Recomendação: reservar**, com um teste pequeno (até US$ 5) condicionado à decisão do fundador. Não há base para adotar, combinar ou descartar.
6. **Três pontos pedem decisão antes de qualquer teste:** cadastro e pagamento; envio do Agumon a mais um serviço externo; e uma frase do guia que diz que imagens feitas com uso grátis são públicas.

## 1. Recursos e custos do Retro Diffusion

Fontes, todas lidas em 2026-11-14:
- F1: `https://retrodiffusion.ai/` (página inicial e perguntas frequentes)
- F2: `https://retrodiffusion.ai/pricing`
- F3: `https://retrodiffusion.ai/learn-more`
- F4: `https://retrodiffusion.ai/app/guide` (guia do usuário; cópia em `evidencias/rd_user_guide_2026-11-14.txt`)
- F5: `https://github.com/Retro-Diffusion/api-examples` (README; cópia em `evidencias/rd_api_examples_readme_2026-11-14.txt`)
- F6: `https://raw.githubusercontent.com/Retro-Diffusion/api-examples/main/llms.txt` (resumo da API, "verified 2026-09"; cópia em `evidencias/rd_api_llms_txt_2026-11-14.txt`)
- F7: `https://astropulse.itch.io/retrodiffusion` (extensão do Aseprite)
- F8: `https://retrodiffusion.ai/tools/pixel-art-fixer`
- F9: `https://api.retrodiffusion.ai/v2/status` (sem autenticação; respondeu `ok` para rd_fast, rd_pro, rd_plus, animations e background_removal)

### 1.1 Respostas às perguntas do §3 do comando

| Pergunta | Resposta | Fonte |
|---|---|---|
| Existe acesso gratuito? | **Sim, com cadastro.** Conta nova começa com US$ 0,50 de saldo, sem cartão. Sem cadastro só existem as ferramentas de navegador (corretor de grade, redutor de cor, conversor de paleta, fatiador de folha), que não geram nem animam | [E] F1, F2, F8 |
| Precisa do Aseprite? | **Não.** O site e a API rodam na nuvem. O Aseprite só é necessário para a extensão local, que é outro produto | [E] F7 |
| Modelos disponíveis | RD Core (padrão, 12–512 px), RD Pro (maior qualidade, 12–256 px), RD Fast (rascunho), RD Mini (16–192 px), RD Plus (só API), Advanced Animations, Tilesets, Low-Poly 3D, My Styles | [E] F4, F5 |
| Usa imagem própria como referência? | **Sim.** Até 9 `reference_images` no RD Core e no RD Pro; `input_image` com `strength` (img2img); My Styles cria um estilo a partir de 1–4 imagens nossas | [E] F4, F5, F6 |
| Preserva identidade visual? | O fornecedor **afirma** que a animação mantém o sprite "on-model" e que referências mantêm o personagem. O guia da API avisa que geração por referência "re-imagina, não converte". **Sem validação prática** | [E] da afirmação: F1, F6 · resultado: NÃO VALIDADO |
| Cria spritesheet? | **Sim.** `return_spritesheet: true` devolve PNG em folha nas animações; há estilos `spritesheet` no RD Core e no RD Pro | [E] F5, F6 |
| Tem animação? | **Sim.** Advanced Animations parte de um quadro inicial nosso (32–256 px): walking, idle, jump, crouch, attack, destroy, custom_action (movimento descrito em texto) e subtle_motion. 4, 6, 8, 10, 12 ou 16 quadros; 1 animação por pedido | [E] F5, F6 |
| Produz várias direções? | **Sim, 8.** `rd_advanced_animation__rotate` gera as outras 7 vistas de um sprite enviado (32–256 px, múltiplos de 8), em GIF ou folha 3×3. Os quadros 2, 4, 6 e 8 são frente, esquerda, costas e direita. Há também estilos só por texto: `four_angle_walking` (48×48) e `8_dir_rotation` (80×80) | [E] F5, F6 |
| Limites de resolução | 12–512 px na API; RD Pro até 256; animação avançada 32–256 e igual ao quadro enviado; rotate em múltiplos de 8. O site fala em 16×16 a 384×384 "conforme o estilo" | [E] F1, F5, F6 |
| Custo por geração | Ver §1.2 | [E] F2, F5, F6 |
| Licença dos resultados | A página inicial diz: "You own your outputs and can use them in personal and commercial projects alike". **Os termos completos (`/terms`) e a política de privacidade (`/privacy`) não puderam ser lidos**: as páginas só carregam por JavaScript e voltaram vazias. A cópia do Internet Archive recusou o acesso (429). **NÃO VALIDADO** | [E] da frase: F1, F3 · termos: NÃO VALIDADO |

### 1.2 Preços (US$, pré-pago, sem assinatura) [E] F2, F5, F6

| Item | Preço |
|---|---|
| RD Fast | 0,03 por imagem |
| RD Core | 0,10 por imagem, em qualquer tamanho; até 4 por pedido |
| RD Pro | 0,18 por imagem |
| Advanced Animations: walking, idle, jump, crouch, attack, destroy | 0,14 por animação |
| Advanced Animations: custom_action, subtle_motion | 0,25 por animação |
| Advanced Animations: rotate (8 vistas) | 0,10 |
| Animações só por texto (API): 4 ângulos andando, sprites pequenos, VFX, batalha | 0,07 |
| Animações só por texto (API): any_animation, big_animation, 8_dir_rotation | 0,25 |
| Edição por texto, inpainting, outpainting | 0,12 cada |
| Remoção de fundo, transferência de cor | 0,01 cada |
| Redutor de cor, conversor de paleta, downscale K-Centroid, correção de pixels | grátis no site (com conta e saldo positivo); 0,001 na API, por quadro em entrada animada |
| Corretor de grade (Pixel Art Fixer) | grátis no site, sem cadastro; 0,002 ou 0,005 na API |
| Low-Poly 3D, tamanho 64 (personagem) | gerar 0,85 · revisar 0,65 · animar 0,35; rig e exportação grátis |
| Recarga mínima | 5,00; o saldo não expira; a partir de 50, bônus de 10% |
| Geração que falha | reembolso automático |
| `check_cost: true` | consulta de preço grátis, não gera nada (mas exige chave) |

**Comparação de custo com o PixelLab: não dá para fechar em dólar.** O custo do Agumon foi de 23 gerações e o padrão é ≈ 18 por espécie [L, `RELATORIO_F4.md` §4], mas o preço em dólar de uma geração da nossa assinatura não está nos documentos da Etapa 6 que consultei. Em unidades da própria ferramenta, um pacote equivalente no Retro Diffusion (1 rotação + 3 andar + 3 ataque + 1 emoção) custaria 0,10 + 0,42 + 0,42 a 0,75 + 0,25 ≈ **US$ 1,2 a 1,5 por espécie, sem contar repetições** [H, soma minha sobre a tabela de preços].

### 1.3 A extensão do Aseprite é outro produto [E] F7

- Roda local, compra única: US$ 65 (completa) ou US$ 20 (Lite). Exige Aseprite e placa de vídeo razoável (uma GTX 1050 Ti leva 2,5 min por imagem 64×64; em CPU, de 4 a 10 min).
- O próprio autor avisa: a extensão e o site "use different models" e "DO NOT buy the extension if you are trying to get the same results as the website".
- Está sendo descontinuada em favor de um editor próprio, ainda sem data.
- A página lista geração de imagem, pixelização, redução de cor, paleta, remoção de fundo e mapas de textura. **Não lista animação nem direções.** Não presumo que tenha.
- **Leitura:** não serve ao objetivo do comando (animação e direções). Não recomendo comprar.

### 1.4 Limites documentados que afetam o nosso caso

- **Sem controle de quadro final nem de esqueleto** na animação avançada: a documentação só mostra quadro inicial + texto + número de quadros [E] F5, F6. O PixelLab aceita quadro final e poses. Logo, pé plantado e passada medida não são controláveis por parâmetro [H].
- **Tamanho:** o quadro enviado precisa ter de 32 a 256 px, e o rotate exige múltiplos de 8. A rotação do Agumon (48×48) entra direto; o andar (60×60) precisa de margem até 64 [E dos limites; H da adaptação].
- **Margem:** o guia pede ≥ 3 px livres em volta do sprite, senão "anima mal" [E] F6.
- **Falhas:** "Animations fail/time out more often than stills"; o rotate tem um único provedor e devolve `provider_busy` quando lotado. Falha é reembolsada [E] F5, F6.
- **Transparência:** o README diz que toda imagem de entrada é "RGB without transparency" e, na mesma página, que "a transparent start frame yields a transparent GIF". As duas frases não fecham; só um teste resolve [E da contradição].
- **Sem prompt negativo** [E] F4, F5.
- **Uso grátis pode ser público:** o guia, na seção Explore, diz "Images made with free usage are public" [E] F4. Não encontrei a definição de "free usage". Se valer para o saldo de US$ 0,50, um Agumon gerado com ele ficaria exposto na galeria pública do serviço [H]. Isso toca a regra "toda publicação pública exige aprovação do fundador".
- **Rede do agente:** o `curl` do ambiente recebe 403 do proxy de saída para `retrodiffusion.ai`; só a busca de páginas funciona. Não tentei contornar. Um teste via API a partir deste ambiente dependeria de liberação [E].

## 2. Evidências dos testes

**Nenhum teste prático foi feito.** Os experimentos A, B, C e D do §4 do comando ficam **sem validação prática**.

O que foi visto, e o que isso prova:
- Três amostras públicas do fornecedor (`images/anim-character.png`, `anim-walking.gif`, `anim-custom-action.gif`, no repositório F5). A ferramenta de visualização só me mostrou **um quadro** de cada GIF. São um cavaleiro lateral em ~64 px e um dragão verde, limpos e na grade [E, visual]. **Não avaliei movimento.** São amostras escolhidas pelo fornecedor, de personagens que ele mesmo gerou; não dizem nada sobre manter um Digimon fiel.
- As ferramentas grátis sem cadastro (corretor de grade e utilitários de folha) não cobrem nenhum dos quatro experimentos, e o sprite do Agumon já está na grade. Não as usei: não produziriam evidência para a nota de E.

## 3. PNGs e GIFs comparativos

**Não há.** Sem teste, não existe saída do Retro Diffusion para comparar. Os comparativos A–D já existentes continuam onde estavam: `fase12-comando9/f4/pagina_comparacao.html` e os GIFs de `fase13-comando10/`. Não os alterei.

## 4. Tabela de notas por critério (Agumon)

**De onde vêm as notas.** Só de QA independente: `f2/QA_F2_INDEPENDENTE.md`, `f3/QA_F3_INDEPENDENTE.md`, `f4/QA_F4_INDEPENDENTE.md` e `fase13-comando10/QA_C10_INDEPENDENTE.md`. Não usei autoavaliação e não dei nota nova.

**Três limites desta tabela:**
1. Os QAs avaliaram **4 critérios**, não os 6 do comando. Não existe nota de QA para **"Qualidade visual GBA Plus"** (a paleta ficou fora da nota por causa do conflito G-1, ainda aberto) nem para **"Tempo e custo"**. Deixo os dois em branco e mostro os fatos de custo ao lado.
2. O QA da F2 usou "estabilidade" e "limpeza". Aqui elas entram como aproximação de "animação" e "consistência anatômica", a mesma leitura do `RELATORIO_F4.md` §4. É uma aproximação, não uma equivalência.
3. **Os escopos são diferentes** e não devem ser lidos como entregas iguais: A e B (F2b) são o pacote inteiro (rotações, andar e ataque em 4 direções); B (C10) é só o andar lateral; C é só o rig (4 animações, sem andar); D é só a direção S (parado, ataque, feliz).

| Critério (peso) | A: PixelLab Método A puro | B: A + polimento F2/F2b (pacote) | B: C10 (só andar L/O) | C: rig 2D (F3) | D: híbrido F4 (só S) | E: Retro Diffusion |
|---|---|---|---|---|---|---|
| Fidelidade (25%) | 5,5 | 7,5 | 8,0 | sem nota de QA | 7,5 | **sem validação prática** |
| Qualidade visual GBA Plus (20%) | sem nota de QA | sem nota de QA | sem nota de QA | sem nota de QA | sem nota de QA | **sem validação prática** |
| Animação (20%) | 5,5 (estabilidade) | 7,5 (estabilidade) | 8,0 | 6,5 | 7,0 (≈ 7,25 com a saída pelo q8) | **sem validação prática** |
| Consistência anatômica (15%) | 5,5 (limpeza) | 7,0 (limpeza) | 8,0 | sem nota de QA | 7,0 | **sem validação prática** |
| Legibilidade (10%) | 6,5 | 7,0 | 8,0 | sem nota de QA | 8,0 | **sem validação prática** |
| Tempo e custo (10%) | sem nota · ≈ 18 gerações por espécie; o Agumon real custou 23 [L] | sem nota · 0 gerações sobre A; ~22 min de agente para 3 espécies [L] | sem nota · 0 gerações sobre B [L] | sem nota · 0 gerações; ~8 min para 4 animações [L] | sem nota · 0 gerações; ~20 min [L] | sem nota · preço de tabela no §1.2 |
| Média simples do QA (4 critérios) | 5,75 | 7,25 | 8,0 | 6,5 (só animação) | 7,4 (≈ 7,5 com q8) | — |
| **Média ponderada parcial** (pesos do comando sobre os 4 critérios com nota, 70% do total, renormalizados) | **5,64** | **7,32** | **8,00** | não calculável (1 critério) | **7,32** (≈ 7,39 com q8) | **—** |

Conta da média parcial: (F×25 + An×20 + C×15 + L×10) ÷ 70. Exemplo, B (F2b): (187,5 + 150 + 105 + 70) ÷ 70 = 7,32.
**A média ponderada completa do comando (6 critérios) não pode ser fechada para nenhum método** enquanto "Qualidade visual GBA Plus" e "Tempo e custo" não tiverem nota de QA. Sugiro que o game-qa dê essas duas notas a A–D, para a tabela ficar comparável quando E for testado.

**Problemas já registrados em A–D [L]:** fogo do Pepper Breath saindo do peito (S); troca de traço na emenda do híbrido; ataque lateral com tronco antigo e âncora 1 px abaixo (C10-R1); braço com 2–3 px de balanço; cauda rígida. Estão no `BACKLOG_AGUMON.md`. Nenhum foi tocado aqui.

## 5. Tempo e recursos consumidos

| Recurso | Consumo |
|---|---|
| Tempo de agente | ~5 min de relógio (16:04–16:09), do teto de ~2 h |
| PixelLab | 0 gerações; nenhuma ferramenta chamada |
| Retro Diffusion | US$ 0; sem conta, sem chave, sem envio de imagem |
| Rede | 14 leituras de página pública (site, GitHub, itch.io, endpoint de status); 1 tentativa recusada no Internet Archive |
| Arquivos | este relatório, `PROPOSTA_TESTE_PAGO.md`, `PROGRESS.md` e 3 cópias de documentação em `evidencias/` (com `sha256.txt`) |
| Versões preservadas | F2b, C10 e híbrido F4 não foram abertos para escrita |

## 6. Oportunidades de integração híbrida (só análise; nada integrado)

Tudo abaixo é **[H]** quanto ao resultado. O que é [E] é só a existência do recurso na documentação.

| Possibilidade do §6 | Recurso que existe [E] | Leitura [H] | Risco |
|---|---|---|---|
| Melhorar sprites já feitos no PixelLab | `image_edit` (0,12), `rd_pro__edit`, img2img com `strength` baixo | Possível para acabamento, mas edição por texto redesenha a imagem inteira. O polimento manual da F2/C10 é de custo 0 e já chegou a 8,0 no andar lateral | Trocar o traço do v7 e criar uma terceira família de desenho no mesmo Digimon |
| Gerar poses para o PixelLab animar | RD Core/Pro com o Agumon como referência (0,10–0,18) | Plausível para poses-chave (antecipação, boca aberta). O guia avisa que referência "re-imagina" | A pose pode não casar com a anatomia do v7; exigiria a mesma checagem de crânio e sola da F4 |
| Corrigir quadros defeituosos | `inpainting` com máscara (0,12); com `soft_inpaint=false`, o que está fora da máscara volta exato | É o uso mais seguro: muda só a região marcada. O PixelLab tem o equivalente (`inpaint_image_pro_flash`, 5 gerações em 64 px) | Baixo. Ganho incerto contra a ferramenta que já temos |
| Efeitos de ataque separados | `rd_animation__vfx` (24–96 px, 0,07, só texto); `custom_action` (0,25) | **A mais promissora.** Uma chama do Pepper Breath gerada à parte, sem o Digimon, resolveria "o fogo sai do peito" por composição: a chama é posta na boca na montagem. Não envolve enviar arte de Digimon | Baixo de PI (o efeito é genérico). Paleta e traço da chama precisam casar com o pacote |
| Ajudar na consistência anatômica | `rotate` (8 vistas, 0,10); `walking` a partir do nosso quadro (0,14) | É a pergunta central e a que menos dá para responder sem teste. Modelos que redesenham cada quadro costumam variar cor e detalhe entre quadros; foi o que o v3 do PixelLab fez (50–59 cores por quadro, [L] QA F3) | Alto de expectativa: não há controle de quadro final nem de esqueleto |
| Reduzir o número de gerações | Preço fixo por animação | Só reduz se acertar em menos tentativas que o PixelLab. Sem taxa de acerto medida, não há como afirmar | — |

**Observação para a F6 (não executada, não proposta como troca):** o Low-Poly 3D do Retro Diffusion gera um modelo 3D com textura em pixel art a partir de até 4 imagens de referência, faz o rig de graça, anima por texto e exporta folha de sprites, 8 vistas e 6 vistas ortográficas com 1 px por texel [E] F5, F6. É um caminho "3D → pixel art" pronto, de ≈ US$ 0,85 + 0,35 por animação. Pode entrar como ponto de comparação na F6 (Blender), se o fundador quiser. A F6 continua obrigatória e não foi iniciada.

## 7. Recomendação técnica: **reservar**

- **Não adotar** e **não combinar** agora: não existe nenhuma evidência prática com o Agumon. Adotar por documentação seria declarar vitória sem teste.
- **Não descartar:** os recursos documentados batem com as nossas lacunas (andar a partir do nosso sprite, 8 direções, efeito de ataque separado), o preço de tabela é baixo e não há assinatura.
- **Reservar, com um teste pequeno e fechado**, se o fundador autorizar: `PROPOSTA_TESTE_PAGO.md` descreve os quatro experimentos do comando por ≈ US$ 2,3, dentro de uma recarga mínima de US$ 5, e uma variante de US$ 0 com um personagem original no lugar do Agumon.
- **Se o teste for feito**, o que tem mais chance de virar "combinar" [H]: (1) efeito de ataque separado; (2) rotate para as direções; (3) walking a partir da rotação E do C10. O que tem menos chance: substituir o Método A na criação da espécie.
- **A extensão do Aseprite: não comprar** (§1.3).

## O que foi confirmado e o que não foi

| Confirmado [E] (documentação do fornecedor) | Não confirmado |
|---|---|
| Acesso grátis existe, mas exige cadastro | Qualquer resultado com o Agumon ou com outro Digimon |
| Preços por imagem e por animação | Fidelidade anatômica, pé sem deslizar, cauda, chama na boca |
| Referência de imagem, img2img, paleta travada, My Styles | Consistência entre quadros e entre direções |
| Animação a partir de sprite próprio, 4–16 quadros | Termos de uso e privacidade (páginas não legíveis) |
| 8 direções a partir de um sprite | Se o envio de arte derivada de Digimon é permitido pelos termos |
| Folha de sprites e GIF | O que "free usage" significa na frase "são públicas" |
| Extensão do Aseprite é outro produto, com outros modelos | Se a extensão tem animação |
| Serviço no ar em 2026-11-14 (`/v2/status`) | Tempo real de geração e taxa de falha |

## O que não foi feito

- Experimentos A, B, C e D do comando.
- Cadastro, login, chave de API, pagamento, instalação do servidor MCP do Retro Diffusion.
- Leitura dos termos de uso e da política de privacidade.
- Nota para E e notas novas para A–D.
- Comando 10b, F6, F7, integração no jogo, deploy.
- QA independente deste relatório (é o próximo passo, do game-qa).

## Decisões que dependem do fundador

1. **Autorizar ou não o teste** da `PROPOSTA_TESTE_PAGO.md`, e em qual cenário (US$ 0 com personagem original, ou até US$ 5 com o Agumon).
2. **Quem cria a conta e como a chave é guardada.** Cadastro e credencial são do fundador; o agente não deve ver nem gravar a chave em texto.
3. **Enviar o Agumon v7 ao Retro Diffusion.** É arte derivada de Digimon indo para mais um serviço externo, sem os termos lidos. É a mesma classe de risco que o QA da F4 apontou para o PixelLab (§3.2 daquele QA).
4. **Ler os termos** (`retrodiffusion.ai/terms`) num navegador comum antes de qualquer envio, em especial o que diz sobre conteúdo enviado, uso para treino e publicação na galeria.
5. **Pedir ao game-qa** as notas de "Qualidade visual GBA Plus" e "Tempo e custo" para A–D, para fechar a média de 6 critérios.
6. Os conflitos abertos da Etapa 6 (paleta, escala, critério unificado) não foram tocados.
