# DIGITAL ODYSSEY — GS-003
## COMANDO 4 — APROVAÇÃO DO RETRABALHO DO CHECKPOINT 1

**Usar: Opus 5.5**

O fundador analisou a revisão independente do game-qa e aprova as quatro decisões seguintes.

### D7 — Retrabalho autorizado

Executar R1–R4 conforme `REVISAO_QA_CHECKPOINT1.md`.

Autorizar R5 se necessário para garantir consistência entre os dois presets de Tamer.

Executar R6 apenas se o teste 12×10 comprovar problemas de transição entre os tiles de água.

O retrabalho deve corrigir os bloqueantes identificados, sem repetir os mesmos prompts que causaram as falhas.

**Usar: Sonnet 5** para geração e operações no PixelLab.

### D8 — Escala visual

- Tamer: 40–42 px de altura de conteúdo.
- Agumon: 33–35 px de altura e 26–29 px de largura.
- Preservar as proporções e a hierarquia E5.
- Garantir margem superior adequada no canvas.
- Preservar pivô no pé e estabilidade entre quadros.
- Não alterar a colisão existente nesta rodada.

Esses valores são alvos de homologação do laboratório, não valores definitivos para todas as espécies.

### D9 — Paletas

Adotar:

- **P-ii:** cenário e floresta v15b.
- **P-iii:** harmonização dos personagens e Digimons.

A paleta dos personagens deve comportar as cores oficiais das espécies.

Não alterar a anatomia, as marcas características ou as cores oficiais dos Digimons para forçar aderência cromática.

Atualizar a documentação de direção artística e registrar a decisão no ADR, preservando o histórico das três paletas candidatas.

### D10 — Consistência das animações

Definir a medição do bloqueante de variação de altura:

`variacao_percentual = 100 * (altura_maxima - altura_minima) / mediana_alturas`

Limite: **5% por ciclo e direção**, para caminhada normal.

Medir o bounding box do conteúdo opaco de cada quadro, excluindo sombras e efeitos independentes quando tecnicamente identificáveis.

Avaliar separadamente:

- Estabilidade do pivô.
- Amplitude e alternância das pernas.
- Consistência anatômica.
- Fluidez perceptível.
- Ausência de deformações entre quadros.

A aprovação numérica não substitui a avaliação visual da animação.

### Correções artísticas obrigatórias

**Agumon**

- Remover crista, nadadeira e losango vermelho da cabeça.
- Remover listras e faixas azuis.
- Manter cabeça arredondada e lisa.
- Manter pele amarelo-alaranjada.
- Manter olhos verdes, cauda curta e grossa e três garras brancas por membro.
- Corrigir a largura e produzir caminhada perceptível nas quatro direções.

**Tamer principal**

- Eliminar a combinação boné vermelho + jaqueta azul que remete a Pokémon.
- Criar identidade original do Digital Odyssey.
- Priorizar cabelo visível, roupas de aventureiro e um acessório discreto com identidade digital.
- Não reproduzir personagens de Pokémon ou protagonistas de Digimon.
- Manter a possibilidade de personalização futura.

### Limite financeiro

O saldo PixelLab nunca poderá ficar abaixo de **650 gerações disponíveis**.

Consultar `get_balance` antes e depois de cada operação paga, registrar o custo individual e interromper qualquer operação que possa ultrapassar o limite.

### Sequência

1. Corrigir Agumon e Tamer.
2. Gerar novamente as animações necessárias.
3. Validar o Tamer P2 e corrigir se necessário.
4. Executar avaliação independente curta do game-qa.
5. Apresentar composições comparativas na floresta v15b.
6. Se os bloqueantes forem resolvidos, prosseguir para a Fase 2 técnica dos protótipos jogáveis.

Não integrar assets reprovados como definitivos.

Não alterar o jogo principal, a Database ou publicar versões públicas sem autorização específica.

**Objetivo: corrigir a identidade artística e avançar para o primeiro protótipo jogável, evitando novas rodadas de planejamento desnecessárias.**