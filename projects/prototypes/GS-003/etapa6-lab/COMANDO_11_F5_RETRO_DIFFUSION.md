# DIGITAL ODYSSEY — GS-003
## COMANDO 11 — F5: LABORATÓRIO RETRO DIFFUSION

**Prioridade:** Alta  
**Etapa:** 6 — Pesquisa e homologação da identidade visual GBA Plus  
**Modelo artístico:** Fable 5.2  
**Modelo técnico e QA:** Opus 5.5  
**Execução:** Sequencial, um agente por vez

### 1. OBJETIVO

Investigar e testar o Retro Diffusion como alternativa ou complemento ao pipeline atual de produção de Digimons.

Não estamos substituindo o Método A.

Queremos descobrir se o Retro Diffusion consegue entregar:

- Melhor fidelidade anatômica.
- Animações mais naturais.
- Consistência entre quadros e direções.
- Maior qualidade de pixel art.
- Menor necessidade de correções manuais.
- Melhor relação entre qualidade, tempo e custo.

O objetivo é encontrar a melhor combinação possível de ferramentas, não necessariamente um único método vencedor.

### 2. PRESERVAR O TRABALHO ATUAL

Antes de iniciar:

1. Localizar os assets aprovados do Agumon v7.
2. Preservar F2b, C10 e o híbrido F4.
3. Registrar as versões e os resultados anteriores.
4. Não executar a terceira versão combinada do Comando 10 nesta rodada.
5. Registrar no backlog os ajustes pendentes do Agumon.

O Agumon atual será a referência de comparação, não um asset a ser substituído.

### 3. INVESTIGAÇÃO DO RETRO DIFFUSION

Pesquisar a documentação oficial, versões e funcionalidades disponíveis.

Verificar:

- Existe acesso gratuito ou teste gratuito?
- É necessário instalar Aseprite ou outro software?
- Quais modelos e recursos estão disponíveis?
- Permite usar imagens próprias como referência?
- Consegue preservar identidade visual?
- Permite criar spritesheets?
- Possui recursos de animação?
- Consegue produzir múltiplas direções?
- Quais são os limites de resolução?
- Quais são os custos por geração?
- Quais são as condições de licença e uso dos resultados?

Não presumir que a ferramenta possui recursos que não foram confirmados.

**PROIBIDO:** contratar assinatura, comprar créditos, iniciar cobrança ou utilizar recursos pagos sem autorização explícita do fundador.

Se não houver acesso gratuito ou já autorizado, concluir a investigação e apresentar uma proposta de teste com custos. Não contornar limitações de acesso.

### 4. TESTE CONTROLADO — AGUMON V7

Se houver acesso autorizado e condições técnicas, utilizar o Agumon v7 como referência.

Testar, conforme os recursos realmente disponíveis:

**Experimento A — Sprite estático**
- Agumon lateral.
- Preservação da anatomia.
- Paleta e contornos GBA Plus.
- Comparação com F2b/C10.

**Experimento B — Caminhada**
- Oito quadros, se suportado.
- Movimento lateral.
- Cabeça e tronco consistentes.
- Pés sem deslizamento.
- Cauda com movimento natural.

**Experimento C — Ataque**
- Testar o Pepper Breath.
- Chama saindo da boca.
- Antecipação, execução e recuperação.
- Ausência de deformações.

**Experimento D — Direções**
- Testar S, E, N e W, se suportado.
- Comparar anatomia e consistência.
- Registrar limitações da ferramenta.

Não gastar recursos para forçar funcionalidades inexistentes.

### 5. COMPARAÇÃO COM O PIPELINE ATUAL

Comparar os resultados com:

A. PixelLab Método A puro.

B. PixelLab + polimento manual.

C. Rig 2D.

D. Híbrido F4.

E. Retro Diffusion.

Avaliar cada alternativa em:

| Critério | Peso |
|---|---:|
| Fidelidade ao Digimon | 25% |
| Qualidade visual GBA Plus | 20% |
| Qualidade da animação | 20% |
| Consistência anatômica | 15% |
| Legibilidade no jogo | 10% |
| Tempo e custo de produção | 10% |

Apresentar notas individuais, média ponderada, problemas encontrados e evidências.

Não comparar um sprite estático com uma animação completa como se fossem entregas equivalentes.

### 6. POSSIBILIDADES HÍBRIDAS

Investigar se o Retro Diffusion pode:

- Melhorar sprites já produzidos no PixelLab.
- Gerar poses que depois serão animadas pelo PixelLab.
- Corrigir quadros defeituosos.
- Produzir efeitos de ataque separados.
- Ajudar na consistência anatômica.
- Reduzir o número de gerações necessárias.

Não integrar automaticamente nenhuma dessas possibilidades.

### 7. QA INDEPENDENTE

Após os testes, encaminhar ao game-qa.

Exigir:

- Inspeção quadro a quadro.
- Avaliação da animação em movimento.
- Testes em escala nativa e ampliada.
- Verificação de canvas e âncora.
- Consistência de proporções.
- Identificação de artefatos.
- Registro de limitações.

Não declarar vitória por nota isolada.

### 8. ENTREGÁVEIS

Produzir:

1. Relatório de recursos e custos do Retro Diffusion.
2. Evidências dos testes realizados.
3. PNGs e GIFs comparativos, quando disponíveis.
4. Tabela de notas por critério.
5. Registro de tempo e recursos consumidos.
6. Análise de oportunidades de integração híbrida.
7. Recomendação técnica: adotar, combinar, reservar ou descartar.

Caso os testes não possam ser realizados por limitações de acesso, registrar claramente o que foi investigado e o que permanece sem validação prática.

### 9. GOVERNANÇA DE APROVAÇÃO

Fluxo obrigatório:

**Game Studio → game-qa → ChatGPT → Vitor**

O ChatGPT deverá receber o relatório, as evidências e os resultados para revisão artística e técnica.

Se o ChatGPT aprovar o experimento, apresentar ao Vitor uma versão de laboratório para teste, quando aplicável.

O Vitor é o único responsável pela homologação final.

Não incorporar assets ao jogo principal sem sua aprovação explícita.

### 10. RESTRIÇÕES

- Não alterar o jogo principal.
- Não realizar deploy.
- Não substituir assets aprovados.
- Não consumir créditos PixelLab.
- Não realizar pagamentos sem autorização.
- Não produzir novas espécies.
- Não utilizar Sonnet para produção ou decisões artísticas.
- Não executar F6 ou F7 automaticamente.
- Manter o trabalho em ambiente isolado.
- Preservar identidade visual GBA Plus.
- Não utilizar assets de terceiros sem direitos adequados.

### 11. ENCERRAMENTO

Ao concluir a F5, apresentar ao ChatGPT:

- O que funcionou.
- O que falhou.
- O que superou o PixelLab.
- O que pode ser combinado com nosso pipeline.
- Quanto custou.
- O que precisa da aprovação do Vitor.

**Parar após a entrega e aguardar revisão.**

A F6 — Blender 3D → pixel art permanece obrigatória como próximo experimento, independentemente do resultado do Retro Diffusion.