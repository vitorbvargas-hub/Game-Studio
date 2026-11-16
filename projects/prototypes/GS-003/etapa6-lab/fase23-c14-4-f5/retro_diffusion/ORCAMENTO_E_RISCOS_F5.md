# Orçamento e riscos — teste F5 do Retro Diffusion (Vernix, personagem original)

**Digital Odyssey (GS-003) · game-research · 2026-11-15 · status: PROPOSTA, nada executado**
Preços de `DOC_RETRO_DIFFUSION_2026-11-15.md` §3; protocolo de `PROTOCOLO_TESTE_F5.md`.

## 1. Por que o risco de IP muda, mas não desaparece por completo

Usar um personagem **original** (Vernix) em vez de uma espécie Digimon elimina o risco específico de "enviar arte derivada de Digimon a um serviço externo sem licença" — esse era o risco central registrado em 14/11 (`RELATORIO_F5.md`, decisão 3 do fundador). Com Vernix, esse risco **não se aplica**.

**O que continua valendo, mesmo com personagem original:**
1. **"Images made with free usage are public"** (`DOC_RETRO_DIFFUSION_2026-11-15.md` §4) — se o teste usar o saldo grátis de US$ 0,50, a arte de Vernix (original, mas ainda assim arte do nosso estúdo) pode ficar pública na galeria do Retro Diffusion, sem certeza de como removê-la. Isso toca a regra "toda publicação pública exige aprovação do fundador" (`AGENTS.md` §1), mesmo não envolvendo Digimon.
2. **Termos de uso e privacidade ainda não lidos** (`DOC_RETRO_DIFFUSION_2026-11-15.md` §6) — não sabemos o que a empresa pode fazer com as imagens enviadas como entrada (treino de modelo, por exemplo), nem com Vernix nem com nada.
3. **Cadastro e pagamento** continuam exigindo decisão do fundador (quem cria a conta, como a chave de API é guardada).

## 2. Três cenários de orçamento

| | Cenário 0: protocolo mínimo | Cenário 1: saldo grátis (US$ 0,50) | Cenário 2: recarga mínima (US$ 5,00) |
|---|---|---|---|
| Custo | Dentro do saldo grátis | US$ 0 (usa o saldo da conta nova) | **US$ 5,00** (o saldo não expira) |
| Exige | Cadastro (sem cartão) | Cadastro (sem cartão) | Cadastro + pagamento |
| O que roda | `rotate` (1×) + `walking` S (1×) + `idle` S (1×) = US$ 0,38 | O mesmo do Cenário 0, com folga de US$ 0,12 para 1 repetição | Protocolo completo (§3 do `PROTOCOLO_TESTE_F5.md`): `rotate` + `walking`×4 direções + `idle`×4 direções, com repetições de contingência |
| Risco de publicidade | O mesmo do Cenário 1 (ainda saldo grátis) | **"Free usage is public" pode se aplicar** (§1.1) — NÃO CONFIRMADO se há como remover | Nenhum identificado na documentação lida (saldo pago não é mencionado na frase de publicidade) |
| Risco de PI | Nenhum (personagem original) | Nenhum (personagem original) | Nenhum (personagem original) |
| Responde ao protocolo completo? | Não — só 1 direção, sem comparação S/N/E/W | Não — mesma limitação | **Sim** |

### 2.1 Cálculo do Cenário 2 (protocolo completo, com contingência)

| Item | Unitário | Tentativas | Subtotal |
|---|---|---|---|
| `rotate` (direções extras, opcional — ver `PROTOCOLO_TESTE_F5.md` §3.2) | US$ 0,10 | 2 (1 repetição se `provider_busy`) | US$ 0,20 |
| `walking` × 4 direções (S, N, E, W) | US$ 0,14 | 1 cada, + 1 repetição extra em até 2 direções | US$ 0,56 + US$ 0,28 = US$ 0,84 |
| `idle` × 4 direções (S, N, E, W) | US$ 0,14 | 1 cada, + 1 repetição extra em até 2 direções | US$ 0,56 + US$ 0,28 = US$ 0,84 |
| Limpeza (Background Remover, se o Color Reducer grátis não bastar) | US$ 0,01 | ~8 (1 por saída) | US$ 0,08 |
| **Subtotal** | | | **US$ 1,96** |
| Buffer para falhas adicionais e repetição do `rotate` em mais de 1 direção, se quisermos testar rotação a partir de N/E/W também | | | US$ 1,04 |
| **Total proposto** | | | **≈ US$ 3,00**, dentro da recarga mínima de US$ 5,00 |

Sobra ≈ US$ 2,00 de margem na recarga mínima, sem contar a hipótese de testar `custom_action` (fora do escopo deste protocolo, §7 do `PROTOCOLO_TESTE_F5.md`).

**Sem `rotate`** (só `walking` + `idle`, 4 direções cada, já que as 4 vistas já vêm do ChatGPT): subtotal cai para **US$ 1,76**, com a mesma margem de contingência chegando a ≈ US$ 2,50–2,80.

### 2.2 Comparação de custo com o pipeline A (PixelLab)

O Hawkmon v2 custou **14,55 gerações PixelLab** (sem contar correções gratuitas), dentro da assinatura Tier 1 (2.000 gerações/mês). O custo do Retro Diffusion é em **dólares à parte**, fora da assinatura PixelLab. **Não é possível converter um para o outro em uma métrica única**, porque são orçamentos de natureza diferente (gerações de uma assinatura mensal já paga vs. dólares avulsos de um saldo pré-pago). O que se pode comparar, de forma justa:
- **Dinheiro adicional necessário:** pipeline A, US$ 0 adicional (já dentro da assinatura); pipeline B, ≈ US$ 1,76–3,00 adicional (recarga mínima US$ 5,00, com sobra).
- **Tempo de agente:** pipeline A, Hawkmon levou C15a (0,8 ger) + C15b/C15b-2 (13,75 ger) em sessões que, somadas, passaram de uma hora de trabalho de agente [L]; pipeline B, a estimativa é menor em número de chamadas (9–10 chamadas pagas vs. dezenas de chamadas do v3 custom), mas isso **não foi medido na prática** — é só contagem de passos no protocolo.

## 3. Como seria executado (igual à estrutura de 14/11, adaptada a Vernix)

1. O **fundador** cria a conta, idealmente lê os Termos de Uso e a Política de Privacidade em um navegador comum antes de qualquer envio (resolve a lacuna do §1.2), e decide entre Cenário 1 ou 2.
2. Duas formas de rodar:
   - **Pelo site:** o fundador (ou alguém com a sessão dele) sobe os 4 PNGs de Vernix e baixa os resultados.
   - **Pela API ou pelo MCP server** (novo desde 14/11, `DOC_RETRO_DIFFUSION_2026-11-15.md` §2): exige uma chave guardada fora do alcance do agente em texto, e — se for a API REST direta — a liberação de `api.retrodiffusion.ai` no proxy de saída (em 14/11, o `curl` do ambiente recebeu 403; não testado de novo nesta tarefa, por estar fora do escopo de "0 gerações, 0 contas"). O MCP server hospedado (`mcp.retrodiffusion.ai`) é uma alternativa que um agente poderia usar diretamente se o fundador autorizar uma chave — isso tornaria o teste executável por um agente, não só manualmente pelo fundador. **Essa é uma decisão nova desde 14/11, registrada aqui para o fundador avaliar, não decidida por este documento.**
3. O game-art mede os resultados com os mesmos scripts da régua de 8 critérios (§5 do `PROTOCOLO_TESTE_F5.md`).
4. O game-qa avalia de forma independente, como fez com o Hawkmon v2.
5. Nada vai para o jogo nem é publicado. Os arquivos ficam em uma pasta de teste equivalente a `fase15-f5-retro-diffusion/teste/`.

## 4. Critério de parada

- Parar se os Termos de Uso, quando lidos, proibirem o uso pretendido ou confirmarem publicação sem opção de remoção.
- Parar ao atingir US$ 5,00 (Cenário 2) ou US$ 0,50 (Cenário 1).
- Parar um experimento depois de 2 tentativas sem resultado usável (o `rotate` já documenta `provider_busy` como erro conhecido de sobrecarga, não de qualidade — nesse caso, esperar alguns minutos e tentar de novo antes de desistir, conforme a própria documentação recomenda).

## 5. O que o fundador precisa decidir

1. **Cenário 0, 1 ou 2** (nenhum/mínimo grátis/completo pago).
2. **Ler os Termos de Uso e a Política de Privacidade** num navegador comum antes de qualquer envio — ninguém fez isso ainda, em nenhuma das duas rodadas de pesquisa (14/11 e 15/11).
3. **Quem cria a conta e como a chave é guardada** (site manual vs. API/MCP com chave).
4. **Se o MCP server do Retro Diffusion deve ser considerado** como uma ferramenta a mais para um agente usar no futuro (decisão de ferramentas, fora do escopo desta tarefa — só registro).
5. **O teto de gasto** (proposta: US$ 5,00, Cenário 2, para responder ao protocolo completo).
6. Se a checagem de originalidade de Vernix (`PROTOCOLO_TESTE_F5.md` §6) deve ser feita pelo ChatGPT, pelo game-art ou pelo próprio Vitor antes de seguir.
