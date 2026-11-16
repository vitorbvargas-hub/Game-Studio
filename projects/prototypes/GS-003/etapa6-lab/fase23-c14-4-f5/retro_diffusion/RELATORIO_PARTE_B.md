# Relatório Parte B — Retro Diffusion (C14.4-B / F5): resumo executivo

**Digital Odyssey (GS-003) · game-research · 2026-11-15 · custo PixelLab: 0 gerações · custo Retro Diffusion: US$ 0**
Para: ChatGPT (revisão técnica) → Vitor (decisão). Documentos completos: `DOC_RETRO_DIFFUSION_2026-11-15.md`, `PROTOCOLO_TESTE_F5.md`, `ORCAMENTO_E_RISCOS_F5.md`, `PROGRESS.md`, nesta mesma pasta.
Fan game não oficial, sem licença. Nada foi executado, nada foi publicado, nenhuma conta foi criada.

## Resumo em 6 pontos

1. **Documentação atualizada.** Desde a pesquisa de 14/11 (`fase15-f5-retro-diffusion/RELATORIO_F5.md`), o Retro Diffusion mudou em três pontos relevantes: **RD Core** passou a ser o modelo padrão do site (US$ 0,10/imagem, até 512 px); **RD Plus saiu do site** (só API/MCP agora); e um **servidor MCP novo** apareceu (`mcp.retrodiffusion.ai`, 33 ferramentas), que não existia na pesquisa anterior. Preços de Advanced Animations (US$ 0,10–0,25) e Low-Poly não mudaram. Termos de uso e política de privacidade **continuam ilegíveis por este agente** (carregam via JavaScript; o Internet Archive recusou o acesso com erro 429, pior que em 14/11).
2. **A frase sobre publicidade de gerações grátis ficou mais clara, não resolvida.** O guia confirma, com o parágrafo completo: "Images made with free usage are public" — uma frase separada de "Share to Explore" (que é voluntário e reversível). A leitura mais provável é que usar o saldo grátis de US$ 0,50 publica a imagem automaticamente, sem forma de remoção clara — mas isso **não está 100% confirmado**, porque "free usage" não tem definição explícita no texto.
3. **Personagem de teste original escolhido: "Vernix"** — criatura bípede verde-musgo, ~38 px, cauda com bola arredondada na ponta, duas saliências dorsais lisas (não são asas funcionais), sem semelhança pretendida com Digimon, Pokémon ou qualquer outra marca. Elimina o risco de enviar arte derivada de Digimon a um serviço externo sem termos lidos — o risco central que travou o teste em 14/11.
4. **Protocolo de comparação justa definido.** Os dois pipelines (ChatGPT→PixelLab e ChatGPT→Retro Diffusion) partem da **mesma** folha de 4 poses de Vernix, desenhada uma única vez no ChatGPT e limpa com o mesmo processo (60×60, âncora 29,5;49). O PixelLab segue o método já validado no Hawkmon v2 (`METODO_CHATGPT_PIXELLAB_v1.md`); o Retro Diffusion usaria `rotate` (opcional, US$ 0,10) + `walking` e `idle` (Advanced Animations) a partir de cada uma das 4 rotações, em canvas 64×64 (exigência de múltiplo de 8 do `rotate`), reconvertido depois para o formato de saída do jogo. Métricas: a mesma régua de 8 critérios usada no QA do Hawkmon v2.
5. **Orçamento: ≈ US$ 1,76 a US$ 3,00** para o protocolo completo (4 direções × walk + idle, com repetições de contingência), cabendo dentro da recarga mínima de US$ 5,00 (que não expira). Um subconjunto mínimo (1 direção só) cabe no saldo grátis de US$ 0,50, mas não responde ao protocolo completo e carrega o risco de publicidade do ponto 2.
6. **Nada foi executado.** 0 gerações PixelLab, 0 créditos ou contas no Retro Diffusion, nenhuma imagem enviada a qualquer serviço.

## Recomendação técnica

**Testar com Vernix, usando a recarga mínima paga (Cenário 2, ≈ US$ 3,00 de uso dentro de US$ 5,00), não o saldo grátis.** Razões:
- O personagem original já remove o risco de PI que travava o teste com o Agumon.
- A recarga paga evita a ambiguidade da frase "free usage is public" pela leitura mais provável do texto (a frase não menciona saldo pago).
- O custo (≈ US$ 3,00–5,00) é pequeno e coerente com a proposta de 14/11 (que já previa US$ 2,25–5,00 para o Agumon); com Vernix, o mesmo valor compra uma comparação sem o risco adicional de propriedade intelectual.
- **Antes de qualquer envio**, alguém com navegador comum (não um agente) deveria ler `retrodiffusion.ai/terms` e `/privacy` — é a única lacuna que nenhuma das duas pesquisas conseguiu fechar, e é rápida de resolver manualmente.

**Não recomendo** o Cenário 1 (saldo grátis) como forma de "economizar", porque a ambiguidade da publicidade se aplica exatamente a ele, e o ganho de não pagar US$ 5,00 é pequeno frente ao risco de expor arte do estúdio sem controle de remoção confirmado.

## Decisões que dependem do Vitor (fundador)

1. Autorizar o teste com Vernix e o Cenário 2 (recarga mínima US$ 5,00), ou pedir ajuste no personagem/protocolo antes.
2. Decidir quem lê os Termos de Uso e a Política de Privacidade antes do envio (ninguém leu ainda, em nenhuma das duas rodadas).
3. Decidir quem cria a conta e como a chave de API/MCP é guardada, se o teste for executado por um agente via MCP em vez de manualmente pelo site.
4. Avaliar se o servidor MCP novo do Retro Diffusion deve ser considerado como ferramenta adicional no futuro (fora do escopo desta tarefa; só registrado como achado).
5. Confirmar a descrição de Vernix como suficientemente original (checagem visual, `PROTOCOLO_TESTE_F5.md` §6) antes de pedir a arte ao ChatGPT.

## O que não foi feito

- Nenhum experimento prático com o Retro Diffusion.
- Leitura completa dos Termos de Uso e da Política de Privacidade.
- Geração da arte de Vernix (nem no ChatGPT, nem em nenhuma ferramenta).
- Qualquer alteração no jogo, nos labs ou na Database.
- Homologação — este relatório segue para QA independente, depois ChatGPT, depois Vitor, conforme o fluxo do brief.
