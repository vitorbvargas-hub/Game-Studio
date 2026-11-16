# Relatório F5 prática: Retro Diffusion com o Agumon F2b (Comando 11b, cenário 1)

**Digital Odyssey (GS-003) · game-art (Fable 5.2) · 2026-11-14 · status: 2 de 4 experimentos feitos; o saldo grátis acabou**
Esta é a autoavaliação de quem produziu. A nota que vale é a do game-qa, em sessão separada.

## 1. Resumo

- Foram gerados **D (rotate)** e **B (walking)**, uma tentativa cada, a partir das rotações S e E do F2b, em 48×48 sem reescalar.
- **C (attack / Pepper Breath) e A (RD Core) não foram gerados.** Depois do walking o medidor caiu para 5% e o site passou a avisar "Not enough free usage for this job". O brief manda parar quando o saldo grátis acaba.
- O **rotate** é o resultado útil: devolveu 8 direções em 48×48, com contorno limpo e a vista S quase igual à entrada. As vistas laterais e de costas são um Agumon plausível, mas **não são o F2b** (focinho mais curto, cauda erguida, três pontas na cabeça em N).
- O **walking** mantém a identidade da entrada e alterna as pernas, mas a cabeça muda em todo quadro, os braços se desfazem e o pé de apoio quase não recua. Não supera o F2b nem o F6 em nenhuma medida de estabilidade.
- **Recomendação: reservar**, com uso possível do rotate como rascunho de direções diagonais (seção 7).

## 2. Custo real

| Experimento | Preço no painel | Medidor de saldo grátis | Tentativas |
|---|---|---|---|
| D, rotate | US$ 0,10 | 86% → 67% (19 pontos) | 1 |
| B, walking, 8 quadros | US$ 0,14 | 67% → 5% (62 pontos) | 1 |
| C, attack | US$ 0,14 (tabela) | não gerado | 0 |
| A, RD Core | — | não gerado | 0 |

- **Dinheiro gasto: US$ 0.** O saldo pago da conta ("Balance") continuou em US$ 0,00. Nada foi comprado, recarregado nem configurado.
- **O medidor não acompanha o preço do painel.** O walking custa 1,4× o rotate no painel e consumiu 3,3× no medidor. [H] O saldo grátis é uma cota diária própria, com peso por quadro, e não os US$ 0,50 que o relatório F5 supôs. Não investiguei além do painel de uso.
- O painel de uso diz: "Free daily usage. Claim once a day. Free usage lasts 3 days." Existe um botão "Claim" gratuito. **Não cliquei**: o teto do brief é "o saldo grátis que sobrou". Fica como decisão do fundador (seção 8).
- PixelLab: 0 gerações, nenhuma ferramenta de geração chamada.

**Exposição pública.** O painel avisa: "Free generations are shared to the public gallery." As duas gerações (o rotate e o walking do Agumon) estão, portanto, na galeria pública do serviço. Era o risco aceito pelo fundador no cenário 1.

## 3. O que foi gerado

Legenda das figuras: linha **1 = F2b**, **2 = F6**, **3 = Retro Diffusion**.

| Arquivo | O que é |
|---|---|
| `entrada/f2b_S_48.png`, `f2b_E_48.png` | Entradas enviadas (cópias do F2b, 48×48). As versões 64×64 foram preparadas e não usadas: a margem era de 4 px ou mais |
| `D_rotate/original/D_rotate_sheet.png` (144×144), `D_rotate.gif` | Resultado do rotate em tamanho original |
| `D_rotate/rotations/{S,SE,E,NE,N,NW,W,SW}.png` | As 8 direções fatiadas, 48×48 |
| `B_walk/original/B_walk_sheet.png` (192×96), `B_walk.gif` | Resultado do walking em tamanho original |
| `B_walk/walk/E/frame_000..007.png` | Os 8 quadros fatiados, 48×48 |
| `comparacao/rotacoes_S_N_E_W_F2b_F6_RD_{1x,4x}.png` | Rotações S, N, E, W das três fontes |
| `comparacao/RD_rotate_8dir_{1x,4x}.png` | As 8 direções do rotate (S, SE, E, NE, N, NW, W, SW) |
| `comparacao/walk_E_folha_F2b_F6_RD_{1x,4x}.png` | Folha dos 8 quadros do walk E |
| `comparacao/walk_E_F2b_F6_RD_{1x,4x}.gif`, `walk_E_RD_{1x,4x}.gif` | Walk E em movimento, lado a lado e sozinho |
| `comparacao/pista_RD_walk_E_{2,3,4}px_4x.gif` | Walk do RD numa pista, a 2, 3 e 4 px por quadro |
| `metricas_f5_pratica.json`, `scripts/f5_pratica.py`, `sha256.txt` | Medidas, script que as reproduz e checksums |

Nas comparações os sprites estão alinhados pela base e centralizados, sem reescalar.

## 4. Métricas

Mesmas definições de `metricas_f6.py` e `metricas_c10.py`. Reproduzir: `python3 -I scripts/f5_pratica.py`.

### 4.1 Walk E, 8 quadros

| Medida | F2b | F6 | Retro Diffusion |
|---|---|---|---|
| Canvas | 60×60 | 60×60 | 48×48 |
| Pixels na borda do canvas | 0 | 0 | 0 |
| Pixels semitransparentes | 0 | 0 | 0 |
| Componentes por quadro | 1 | 1 | 1 |
| Amplitude do centroide em y | 1,5 px | 1,9 px | 2,7 px |
| Amplitude do centroide em x | 0,4 px | 0,4 px | 0,9 px |
| Amplitude do topo da cabeça | 2 px | 2 px | 2 px |
| Pixel mais baixo (âncora) | 49–50 | 46–49 | 42–44 |
| Largura do crânio | 23 px, constante | 25 px, constante | 23 px, constante |
| Cabeça idêntica ao quadro 0 | 1 de 8 | 8 de 8 | 1 de 8 |
| Pixels da cabeça diferentes do q0, com o melhor alinhamento | 0 a 15 | 0 | 19 a 50 |
| Cores | 39 | 12 | 17 |
| Cores fora da paleta F2b | 0 | 0 | 12 (distância máxima 3,2) |
| Pixels de cor isolados por quadro | 31 a 49 | 2 a 4 | 44 a 65 |

- **Cabeça:** no RD a cabeça desloca 1 px para a frente depois do quadro 0 e muda de 19 a 50 pixels por quadro mesmo no melhor alinhamento. No F2b são até 15 e no F6 nenhum. É o pior dos três.
- **Âncora:** a base sobe 2 px nos quadros 5 e 6 (linha 42 em vez de 44), e nesses dois quadros nenhum pé toca a linha do chão.
- **Deslizamento:** o pé de apoio ocupa x = 18–26, 18–24, 17–23, 17–22 e 19–21 nos quadros 0 a 4. A ponta do pé recua cerca de 1 px por quadro e o calcanhar fica parado. O F6 recua 3 px por quadro, medidos no modelo. Em qualquer velocidade de jogo acima de ~1 px por quadro o pé do RD desliza. Ver os GIFs de pista.
- **Paleta:** as 12 cores "fora" estão a no máximo 3,2 de distância de uma cor do F2b. A ferramenta respeitou a paleta da entrada e reduziu de 39 para 17 cores.
- **Contra o Style Bible (Endesga-32):** não medi. A entrada F2b já não é Endesga-32 e a saída segue a entrada. O conflito de paleta continua aberto.

### 4.2 Rotações

| Medida | F2b | F6 | Retro Diffusion |
|---|---|---|---|
| Canvas | 48×48 | 60×60 | 48×48 |
| Altura S / E / N | 35 / 41 / 39 | 36 / 38 / 34 | 35 / 38 / 38 |
| Largura S / E / N | 22 / 36 / 22 | 22 / 36 / 22 | 22 / 34 / 22 |
| Largura da cabeça S / E | 18 / 23 | 20 / 25 | 18 / 22 |
| Base (y) nas direções | 43–44 | 47–49 | 44 em todas as 8 |
| Cores por vista | 32 a 59 | 8 a 11 | 18 a 22 |
| Pixels isolados por vista | 57 a 184 | 1 a 7 | 92 a 148 |
| W igual ao espelho de E | sim | sim | **não** (141 px diferentes) |

- **S do RD contra a entrada:** a silhueta difere em 2 pixels. 530 pixels mudaram de cor, 133 deles com distância maior que 8. A ferramenta redesenhou o sombreamento interno e reduziu as cores, sem mexer na forma.
- **E do RD contra o E do F2b:** 166 pixels de silhueta diferentes. É outro desenho lateral, não o nosso.
- A base ficou na mesma linha nas 8 direções e a altura varia 3 px entre elas, o que é bom para âncora.

## 5. O que funcionou e o que falhou

**Funcionou**
- Upload e geração pelo site, em segundos, sem erro e sem repetição.
- Saída no tamanho exato da entrada (48×48), sem semitransparência, sem pixel na borda, um único componente.
- Rotate: 8 direções coerentes entre si em volume, altura e base. As diagonais (SE, SW, NE, NW) são legíveis e não existem no nosso pacote.
- Walking: mantém a cor, o olho e o focinho da entrada; a perna de trás ganha um tom mais escuro, que ajuda a ler a alternância.
- Download por `fetch()` na própria aba. A pasta Downloads do fundador não foi tocada (834 itens antes e depois).

**Falhou ou ficou aquém**
- Rotate, N: três pontas no alto da cabeça. O Agumon não tem crista. É erro de fidelidade.
- Rotate, E e W: focinho curto, boca aberta e cauda erguida, diferentes do F2b; e W não é o espelho de E, o que quebra a nossa regra de W espelhado.
- Walking: os braços mudam de forma a cada quadro e quase somem nos quadros 4 a 7 (leitura visual da folha a 4×); a cabeça nunca repete; o corpo avança e recua 1 px.
- Walking: 8 quadros mostram um pé plantado e dois quadros sem contato com o chão. O ciclo não é simétrico entre as duas pernas.
- Custo: o walking consumiu 62 pontos da cota grátis, e a cota não cobre os 4 experimentos.
- C e A não foram testados. **Nada se sabe ainda sobre o Pepper Breath nem sobre o fogo em camada separada no Retro Diffusion.**

**Nota de operação.** A ferramenta `browser` não veio na lista de ferramentas desta sessão do game-art. Conferi que a política de ferramentas não a nega (perfil `full`; só `tts` negado) e usei o CLI equivalente, `openclaw browser --browser-profile chrome-sharp`, na aba t35. Não usei `download`. A listagem de abas do perfil mostrou títulos e endereços de outras abas do fundador; não registrei nem usei nada disso.

## 6. Autoavaliação nos 6 critérios (Comando 11 §5)

Vale para o que foi gerado: rotações em 8 direções e um walk E cru, sem polimento. **Não é comparável a um pacote completo** (F2b e F6 têm walk e ataque em 4 direções).

| Critério | Peso | Nota | Motivo |
|---|---:|---:|---|
| Fidelidade ao Digimon | 25% | 6,5 | S preservado; laterais plausíveis mas diferentes do F2b; crista em N |
| Qualidade visual GBA Plus | 20% | 6,5 | Contorno limpo e paleta mantida; 44 a 148 pixels isolados por quadro |
| Qualidade da animação | 20% | 6,0 | Pernas alternam; cabeça instável, braços se desfazem, pé não recua |
| Consistência anatômica | 15% | 5,5 | W ≠ espelho de E; braços variam; lateral do rotate ≠ lateral do walk |
| Legibilidade no jogo | 10% | 7,5 | Silhueta clara a 1×; não validado dentro do jogo |
| Tempo e custo de produção | 10% | 7,0 | Segundos por pedido; a cota grátis acaba em 2 pedidos |
| **Média ponderada** | | **6,4** | |

A F6 teve 6,3 do QA com pacote completo. Esta nota é de um recorte menor e vem de quem produziu.

## 7. Recomendação: reservar

- **Não adotar** como fonte de animação. O walking cru é menos estável que o F2b e que o F6 em cabeça, âncora e deslizamento, e pediria o mesmo polimento manual que já fazemos.
- **Combinar, só se as diagonais entrarem no escopo:** o rotate é o único caminho testado que entrega SE, SW, NE e NW em 48×48 na paleta do F2b. Serviria de rascunho a redesenhar, nunca de arte final, por causa da crista em N e do lateral diferente.
- **Não descartar** antes de testar o ataque: o experimento C é o que responde à pergunta do Pepper Breath, e ele não rodou.

## 8. Decisões que dependem do fundador

1. Usar ou não o "Claim" diário gratuito para rodar C (attack) e A (RD Core) em outro dia. Cada geração grátis vai para a galeria pública.
2. Se o rotate pode servir de rascunho para direções diagonais, que hoje não estão no padrão de sprites.
3. As duas imagens do Agumon já estão públicas na galeria do serviço. Se quiser retirá-las, é na conta dele; não mexi em nada da conta.

## 9. O que não foi feito

- Experimentos C e A.
- Validação dentro do jogo; nada foi integrado.
- Medida contra Endesga-32.
- Leitura dos termos do serviço (seguem não lidos desde a F5).
- Revisão independente: é do game-qa.

---

## Adendo C (2026-11-14, ~18:36–18:45): Claim diário, ataque e chama — **nada foi gerado**

**Resultado em uma linha:** o Claim foi usado, mas a cota que ele deu (38%) não paga um Attack, e o site não tem VFX. O experimento C continua sem resposta.

### O que foi feito
1. **Claim diário clicado** (autorizado no adendo). Medidor: **5% → 38%** (+33 pontos). Balance continuou em US$ 0,00.
2. **Attack selecionado** em Advanced Animations, com `f2b_E_48.png` como entrada (ainda estava carregada do walking; conferi nome e tamanho, 600 bytes). Preço no botão: **US$ 0,14**.
3. O botão "Animate" ficou **desabilitado**, com o aviso "Not enough free usage for this job. Smaller jobs still fit."
4. Testei 6 e 4 quadros: **mesmo preço (US$ 0,14) e mesmo aviso**. Reduzir quadros não barateia o Attack.
5. **VFX (chama sozinha):** procurei nos painéis Advanced Animations (9 estilos: Custom Action, Walking, Idle, Jump, Crouch, Attack, Destroy, Subtle Motion, Rotate), RD Fast (15 estilos), RD Mini (9) e RD Pro (18). **Não há estilo de VFX nem de efeito animado no site.** O `rd_animation__vfx` do relatório F5 só existe na API, e criar chave de API está proibido.
6. Parei, como manda o adendo ("se não houver saldo depois do Claim, pare").

### O que não fiz, e por quê
- **Chama estática por RD Fast (US$ 0,03, caberia na cota):** não é o recurso pedido (o adendo pede vfx, se o painel oferecer) e o brief diz para não forçar recurso inexistente. Fica como opção para o fundador.
- **Custom Action com prompt de fogo:** marcado "uses a lot of your usage", mais caro que o Attack; também não cabe.
- **Experimento A:** proibido pelo adendo.

### Custo
| Item | Valor |
|---|---|
| Dinheiro | US$ 0 |
| Cota grátis | 5% → 38% (só o Claim; nada consumido) |
| Gerações no Retro Diffusion | 0 |
| Imagens novas na galeria pública | 0 |
| PixelLab | 0 gerações |

### Métricas
**Não há.** Sem imagem, não há medida de canvas, âncora, cabeça, cores nem pixels soltos. **A pergunta "o fogo sai da boca?" continua sem resposta para o Retro Diffusion.**

### Autoavaliação
- Os 6 critérios do Comando 11 §5 **não se aplicam**: não existe asset de ataque para avaliar. A nota do recorte D + B não muda (6,4 minha; 6,2 do QA).
- No critério **tempo e custo**, o adendo traz um dado negativo: o Claim rende 33 pontos por dia, um walking custou 62 e um Attack custa mais que 38. **Uma animação grátis pede pelo menos dois dias de Claim acumulado.** [H] A cota expira em 3 dias (painel: "Oldest free usage expires in 2 days"), então acumular dá no máximo ~2 animações por janela.

### Recomendação
**Mantém "reservar", com uma ressalva nova: o ataque só pode ser testado de três formas, todas do fundador.**
1. **Esperar o próximo Claim** (o painel dizia "next claim in 2 hours 21 minutes" às ~18:40, portanto por volta das 21:00). Com 38 + 33 = 71 pontos, o Attack deve caber [H: custo parecido com os 62 do walking; não confirmado]. Custo US$ 0, mais uma imagem na galeria pública.
2. **Recarga mínima** para pagar US$ 0,14 do Attack (e US$ 0,07 do VFX exigiria também chave de API). Não autorizado hoje.
3. **Encerrar o Retro Diffusion** sem o teste e seguir com o parecer da F6: Pepper Breath em camada 2D própria, desenhada por nós e posicionada na boca. Isso não depende do RD.

Minha indicação: **opção 1 se o fundador quiser fechar a dúvida de graça; senão opção 3.** O walking do RD já mostrou cabeça instável e braços que se desfazem; a expectativa para o corpo do ataque é a mesma [H]. A chama separada, que era a parte promissora, não existe no site.

### Operação
- Navegador: CLI `openclaw browser --browser-profile chrome-sharp`, aba t35. `download` não foi usado. Da listagem de abas só li a entrada da Retro Diffusion; os títulos das outras não foram exibidos nem registrados.
- Downloads do fundador: 834 itens antes e depois. O arquivo temporário de upload foi removido.
- Nada da conta foi alterado. O painel ficou em Advanced Animations → Attack, 8 quadros (estava em Walking, 8 quadros).
- As duas imagens antigas continuam na galeria; não mexi.
