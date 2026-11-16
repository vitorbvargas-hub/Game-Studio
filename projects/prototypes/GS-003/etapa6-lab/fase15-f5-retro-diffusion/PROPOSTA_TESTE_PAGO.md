# PROPOSTA de teste do Retro Diffusion (F5): para decisão do fundador

**Digital Odyssey (GS-003) · game-art · 2026-11-14 · status: PROPOSTA, nada executado**
Preços de tabela lidos em 2026-11-14 (`RELATORIO_F5.md` §1.2). Antes de cada pedido, o preço real aparece no botão do site ou no `check_cost` da API.

## Por que é preciso decidir

Gerar, animar e rotacionar no Retro Diffusion exige **conta**. O brief não autoriza cadastro, login, cartão nem chave de API. Sem isso, os experimentos A–D do Comando 11 não podem ser feitos.

## Três cenários

| | Cenário 0: sem Digimon | Cenário 1: saldo grátis | Cenário 2: recarga mínima |
|---|---|---|---|
| Custo | **US$ 0** | **US$ 0** | **US$ 5,00** (o saldo não expira) |
| Exige | cadastro (sem cartão) | cadastro (sem cartão) | cadastro + pagamento |
| O que se envia | um personagem **original** nosso (por exemplo, o Tamer) | a rotação do Agumon v7 | a rotação do Agumon v7 |
| O que responde | se a ferramenta anima e rotaciona bem um sprite do nosso estilo | os 4 experimentos, 1 tentativa cada | os 4 experimentos, com repetição |
| Risco | nenhum de PI | **o guia diz "Images made with free usage are public"**: o Agumon poderia aparecer na galeria pública do serviço [H, frase não definida] | envio de arte derivada de Digimon a um serviço externo, com os termos ainda não lidos |
| Limite | não mede fidelidade a Digimon | US$ 0,50 não paga repetição nem o `custom_action` | — |

**Minha sugestão:** começar pelo **Cenário 0**. Ele responde de graça, e sem expor Digimon, se a animação e a rotação valem o Cenário 2. Evitar o Cenário 1 até saber o que "free usage" quer dizer.

## Plano do Cenário 2 (os 4 experimentos do §4 do comando)

Entrada: `fase13-comando10/pacote_agumon_c10/rotations/E.png` e `S.png` (48×48, já múltiplo de 8). Se a margem for menor que 3 px, centralizar em 64×64, sem reescalar.

| Experimento | Pedido | Unitário | Tentativas | Subtotal |
|---|---|---|---|---|
| A. Sprite lateral estático | RD Core com o Agumon como referência | 0,10 | 2 | 0,20 |
| A. idem, modelo de maior qualidade | RD Pro com referência | 0,18 | 1 | 0,18 |
| B. Caminhada lateral, 8 quadros | `walking` sobre a rotação E | 0,14 | 3 | 0,42 |
| C. Pepper Breath | `attack` sobre a rotação E | 0,14 | 2 | 0,28 |
| C. Pepper Breath com descrição | `custom_action` ("abre a boca e solta uma bola de fogo pela boca") | 0,25 | 2 | 0,50 |
| C. Chama separada, sem Digimon | `rd_animation__vfx` (só API) | 0,07 | 2 | 0,14 |
| D. Direções | `rotate` sobre a rotação S | 0,10 | 2 | 0,20 |
| D. Andar em S e N a partir das vistas do rotate | `walking` | 0,14 | 2 | 0,28 |
| Limpeza | conversor de paleta e remoção de fundo | ≤ 0,01 | algumas | 0,05 |
| **Total estimado** | | | | **≈ US$ 2,25** |

Sobra ≈ US$ 2,75 da recarga para repetir o que falhar. **Teto proposto: US$ 5,00, sem auto-recarga.** Geração que falha é reembolsada pelo serviço.

O Cenário 0 usa a mesma lista com o personagem original e cabe em US$ 0,48 (1 rotate + 1 walking + 1 attack + 1 RD Core).

## Como seria executado

1. O **fundador** cria a conta, lê os termos (`retrodiffusion.ai/terms`) e, se for o caso, faz a recarga. A auto-recarga fica desligada.
2. Duas formas de rodar:
   - **Pelo site:** o fundador (ou alguém com a sessão dele) envia os arquivos e baixa os resultados em tamanho original. É o caminho sem credencial para o agente.
   - **Pela API:** exige uma chave guardada fora do alcance do agente em texto e a liberação de `api.retrodiffusion.ai` no proxy de saída (hoje o `curl` do ambiente recebe 403).
3. O game-art mede os resultados com os mesmos scripts da F4 e do C10: canvas, âncora, largura do crânio, sola, cores por quadro, pixels soltos, deslizamento na pista de 4 px.
4. O game-qa avalia de forma independente, quadro a quadro e em movimento, a 1× e a 4×, e dá a nota de E nos 6 critérios do comando.
5. Nada vai para o jogo. Os arquivos ficam em `fase15-f5-retro-diffusion/teste/`.

## Critério de parada

- Parar se os termos proibirem enviar conteúdo de terceiros, ou se tornarem público o que for enviado ou gerado.
- Parar ao atingir US$ 5,00.
- Parar um experimento depois de 3 tentativas sem resultado usável. Não forçar recurso que não funciona (§4 do comando).

## O que o fundador precisa decidir

1. Cenário 0, 1, 2 ou nenhum.
2. Se o Agumon v7 pode ser enviado ao Retro Diffusion.
3. Site ou API, e quem opera.
4. O teto de gasto (proposta: US$ 5,00).
