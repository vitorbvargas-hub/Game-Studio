# DIGITAL ODYSSEY — GS-003
# COMANDO F9 — LABRAMON COMPLETE PRODUCTION
## Validação final do pipeline visual GBA Plus

**Prioridade:** P0  
**Modo:** execução autônoma supervisionada por checkpoints  
**Ambiente:** laboratório isolado  
**Status inicial:** NÃO HOMOLOGADO

---

# 1. MISSÃO

Executar o teste completo de produção do Digimon Labramon, utilizando o pipeline ChatGPT → PixelLab adotado como Standard Visual 1.1 provisório.

O objetivo é validar a produção de um Digimon quadrúpede com qualidade GBA Plus, incluindo:

1. Identidade visual fiel à espécie.
2. Quatro direções de exploração.
3. Standing, idle e caminhada.
4. Expressões emocionais.
5. Sono e descanso.
6. Interações com o Tamer.
7. Animações de combate.
8. Transições entre estados.
9. Integração em laboratório jogável.
10. QA técnico e artístico.
11. Preparação do Standard Visual 2.0.

Este é um teste completo de pipeline, não uma autorização para produzir outros Digimons.

## Decisões já tomadas

- Hawkmon v2 permanece como está, sem correções nesta rodada.
- Retro Diffusion está adiado.
- Não executar o protocolo F5.
- Não realizar compras ou recargas.
- Não alterar o jogo principal.
- Não iniciar Tamer 2.0 automaticamente.
- Não declarar Standard Visual 2.0 aprovado antes da homologação.

---

# 2. MODELOS E RESPONSABILIDADES

**Usar: Opus 5.5**

Responsável por:
- Planejamento e coordenação.
- Pesquisa na Knowledge Base.
- Direção artística.
- Revisão de prompts.
- Auditoria anatômica.
- Avaliação de resultados.
- QA final.
- Relatório executivo.

**Usar: Fable 5.2**

Responsável por:
- Produção artística complexa.
- Refinamento de poses.
- Correções visuais difíceis.
- Direção de animações especiais.

Usar somente quando a tarefa realmente exigir produção artística pesada.

**Usar: Sonnet**

Responsável por:
- Organização dos arquivos.
- Conversão de imagens.
- Scripts de processamento.
- Manifestos.
- Laboratório HTML.
- Integração isolada.
- Testes automatizados.
- Documentação operacional.

Sonnet não pode substituir o modelo de direção artística.

---

# 3. REGRAS DE SEGURANÇA E CUSTO

1. Criar branch ou worktree específico para F9.
2. Preservar todas as branches e builds anteriores.
3. Não fazer merge no projeto principal.
4. Não publicar o laboratório.
5. Não alterar banco de produção.
6. Não substituir sprites existentes.
7. Não consumir serviços pagos adicionais.
8. Não utilizar Retro Diffusion.
9. Registrar consumo real de PixelLab por operação.
10. Usar PixelLab apenas dentro de saldo e orçamento previamente autorizados.
11. Se não houver teto específico aprovado para F9, preparar as chamadas e solicitar autorização antes de executá-las.
12. Não interpretar ausência de resposta do fundador como aprovação.
13. Não criar resultados falsos ou simular geração de imagens.
14. Se uma ferramenta não estiver acessível, registrar bloqueio e continuar com atividades independentes.
15. Não gerar grandes lotes de variações sem necessidade.
16. Preservar os assets homologados da Praia do Primeiro Elo.

---

# 4. FASE 0 — INVENTÁRIO E KNOWLEDGE BASE

**Usar: Opus 5.5**

Antes de qualquer geração:

Localizar e verificar:
- Repositório Git do Game Studio.
- DigimonDex.
- WorldDex.
- AnimeDex.
- Reference Gate GD-072.
- `METODO_CHATGPT_PIXELLAB_v1.md`.
- Documentação Hawkmon C15a/C15b.
- QA independente do Hawkmon v2.
- Manifestos e ferramentas PixelLab existentes.

Registrar commit, branch, caminhos e estado de cada fonte.

Não assumir que a Knowledge Base está pronta sem verificar.

Pesquisar a espécie Labramon e produzir um dossiê visual com pelo menos cinco referências verificáveis, quando disponíveis.

Documentar:
- Silhueta.
- Proporções.
- Cores.
- Formato do focinho.
- Olhos.
- Orelhas.
- Patas.
- Cauda.
- Marcas anatômicas.
- Características que não podem ser alteradas.
- Diferenças entre referências.

A anatomia oficial deve prevalecer sobre interpretações criativas.

Não confundir Labramon com Hawkmon ou outras espécies.

**Entregável:** `F9_01_REFERENCE_REPORT.md`

---

# 5. FASE 1 — DIREÇÃO DE ARTE

**Usar: Opus 5.5**

Definir um Labramon no padrão GBA Plus.

Requisitos:
- Pixel art nativa.
- Perspectiva top-down 3/4.
- Anatomia quadrúpede.
- Silhueta reconhecível.
- Detalhamento equilibrado.
- Paleta consistente.
- Contornos limpos.
- Sombreamento controlado.
- Quatro direções independentes.
- Escala compatível com o Tamer.

A referência do Hawkmon é um padrão de acabamento, não um modelo anatômico.

Não copiar suas proporções.

### Escala

Determinar:
- Altura visual.
- Comprimento corporal.
- Canvas.
- Pivô.
- Ponto de contato com o chão.
- Área de colisão.
- Relação de tamanho com o Tamer.

Não impor 60×60 se isso prejudicar o corpo ou a cauda.

A escala deve ser consistente com o jogo e com a espécie.

**Entregável:** `F9_02_ART_DIRECTION.md`

---

# 6. FASE 2 — ARTE-MESTRA CHATGPT

**Usar: Opus 5.5 para preparar e validar o briefing.**

A arte-mestra deve seguir o padrão que produziu o Hawkmon v2.

Se houver acesso real e autorizado à geração de imagens do ChatGPT, utilizar esse fluxo.

Se não houver, preparar o prompt e marcar a geração como BLOQUEADA, sem substituí-la silenciosamente por outro modelo.

## Prompt mestre

Create ONE professional GBA Plus pixel art character reference sheet of LABRAMON from Digimon.

Use the verified official references and the approved anatomy specification as the source of truth.

The character must be immediately recognizable as Labramon.

Preserve the exact species-specific:
- Body silhouette.
- Head proportions.
- Muzzle.
- Ears.
- Eyes.
- Coat colors.
- Markings.
- Four paws.
- Tail.
- Overall anatomy.

Do not invent accessories or features.

CAMERA:
Top-down RPG view, low 3/4 perspective, inspired by classic handheld monster RPG readability.

NOT a side-scrolling view.

LAYOUT:
One image, landscape orientation.

Four standing poses side by side:

1. FRONT — facing the viewer.
2. BACK — facing away.
3. LEFT — facing left.
4. RIGHT — facing right.

Left and right must be drawn independently, never automatically mirrored.

All poses must:
- Have the same scale.
- Preserve identical anatomy.
- Preserve identical colors.
- Use the same lighting.
- Maintain consistent ground contact.
- Show four anatomically correct paws.

PIXEL ART:
- Strict pixel grid.
- Crisp pixel clusters.
- No antialiasing.
- No blur.
- No gradients.
- No glow.
- No painted ground shadow.
- No extra limbs.
- No duplicated tails.
- No anatomy deformation.
- Controlled palette, targeting 24 flat colors.
- Dark clean outlines.
- Light source from upper left.
- Two or three tones per material.

BACKGROUND:
Uniform solid #FF00FF.

No scenery, labels, text, watermarks, checkerboard or decorative elements.

Leave adequate space between poses for extraction.

This is the MASTER ART REFERENCE, not the final technical sprite sheet.

### Validação obrigatória

Comparar o resultado com as referências verificadas.

Rejeitar se:
- A espécie estiver descaracterizada.
- A anatomia estiver errada.
- Houver patas extras.
- As direções forem inconsistentes.
- As cores mudarem.
- O corpo variar significativamente entre vistas.

Não avançar com uma arte-base evidentemente defeituosa.

**Entregável:** arte-mestra candidata e `F9_03_MASTER_ART_QA.md`.

---

# 7. FASE 3 — PREPARAÇÃO TÉCNICA

**Usar: Sonnet**

Seguir o pipeline documentado:

1. Recortar as quatro poses.
2. Executar `unzoom_image`, quando necessário.
3. Remover o fundo magenta.
4. Executar `correct_pixelart`.
5. Executar `reduce_colors`.
6. Normalizar canvas.
7. Ajustar âncoras.
8. Verificar transparência.
9. Verificar paleta.
10. Criar manifesto inicial.

A ordem `correct_pixelart` antes de `reduce_colors` é obrigatória.

Não redimensionar por interpolação suave.

Preservar a relação anatômica e a legibilidade dos pixels.

**Entregável:** quatro PNGs técnicos e manifesto.

---

# 8. FASE 4 — MOVIMENTAÇÃO COMPLETA

**Usar: Fable 5.2 para direção artística pesada, PixelLab para animação autorizada e Sonnet para processamento técnico.**

Produzir para cada direção:

| Estado | Quadros |
|---|---:|
| Standing | 1 |
| Idle | 4 |
| Walk | 8 |

Total-base: 52 quadros distribuídos nas quatro direções.

### Caminhada quadrúpede

Exigir:
- Alternância coerente das patas.
- Movimento natural de apoio.
- Deslocamento corporal discreto.
- Estabilidade do focinho.
- Movimento secundário da cauda.
- Ausência de deformação da cabeça.
- Ausência de patas desaparecendo.
- Ausência de deslizamento excessivo.
- Loop contínuo.

Não reutilizar o ciclo de caminhada bípede do Hawkmon.

### Idle

Respiração discreta.

A cabeça não deve mudar de tamanho.

Olhos e marcas não podem aparecer e desaparecer arbitrariamente.

Evitar as falhas identificadas no QA do Hawkmon.

**Entregável:** spritesheets, GIFs de preview e relatório de QA de movimento.

---

# 9. FASE 5 — EMOÇÕES

**Usar: Opus 5.5 para direção; Fable 5.2 para produção artística pesada autorizada.**

Criar quatro estados emocionais:

### Feliz
- Expressão alegre.
- Movimento discreto da cauda.
- Postura receptiva.

### Triste
- Postura corporal abatida.
- Expressão compatível com a anatomia.
- Movimento reduzido.

### Irritado
- Postura defensiva.
- Expressão de irritação.
- Movimento coerente com a espécie.

### Assustado
- Recuo ou postura de alerta.
- Reação rápida.
- Retorno ao idle.

Para cada emoção, criar:
- Pose-mestra.
- Animação curta.
- Transição de entrada.
- Transição de saída.
- Metadados de duração.

Uma direção principal é suficiente para a primeira validação de cada emoção.

Não produzir automaticamente quatro direções para todas as emoções sem evidência de necessidade.

**Entregável:** `emotions/` e previews animados.

---

# 10. FASE 6 — DESCANSO E SONO

**Usar: Fable 5.2 para produção artística autorizada; Sonnet para integração.**

Produzir:

1. Em pé → deitado.
2. Deitado → dormindo.
3. Loop de sono.
4. Dormindo → acordando.
5. Acordando → em pé.

A pose deitada deve ser anatomicamente desenhada.

Não criar sono achatando verticalmente o sprite.

O loop deve apresentar respiração suave e preservar a identidade da espécie.

**Entregável:** `rest/` e demonstração completa.

---

# 11. FASE 7 — INTERAÇÕES COM O TAMER

**Usar: Opus 5.5 para direção; Fable 5.2 para arte autorizada; Sonnet para laboratório.**

Produzir:

### Receber carinho
- Aproximação.
- Reação corporal.
- Expressão de satisfação.
- Retorno ao idle.

### Comemoração
- Reação após vitória.
- Movimento de entusiasmo.
- Retorno ao idle.

Usar o Tamer provisório apenas como referência de interação no laboratório.

Não modificar o Tamer atual.

Preparar contratos de animação para permitir futuramente:
- Afinidade.
- Humor.
- Vínculo.
- Interações contextuais.
- Reações por espécie.

Não implementar agora todo o sistema de emoções ou afinidade.

**Entregável:** `interactions/` e contratos técnicos.

---

# 12. FASE 8 — COMBATE

**Usar: Opus 5.5 para direção; Fable 5.2 para arte autorizada; Sonnet para integração.**

Criar:

### Ataque
- Preparação.
- Execução.
- Recuperação.

### Receber dano
- Reação ao impacto.
- Recuperação.

### Incapacitação
- Perda de postura.
- Estado incapacitado.
- Recuperação.

Não criar animação de morte permanente ou retorno ao Digiovo.

A derrota normal do Digimon no Digital Odyssey representa incapacitação e recuperação.

Não inventar habilidades oficiais sem consultar a Knowledge Base.

**Entregável:** `combat/` e demonstração animada.

---

# 13. FASE 9 — LABORATÓRIO INTERATIVO

**Usar: Sonnet**

Criar uma página HTML funcional no laboratório isolado.

### Controles obrigatórios

- Seleção de direção.
- Caminhada WASD.
- Standing.
- Idle.
- Feliz.
- Triste.
- Irritado.
- Assustado.
- Deitar.
- Dormir.
- Acordar.
- Carinho.
- Comemoração.
- Ataque.
- Receber dano.
- Incapacitação.
- Recuperação.

### Visualização

Permitir:
- Escala real.
- Zoom 2×.
- Zoom 4×.
- Fundo transparente ou neutro.
- Comparação entre estados.
- Reprodução contínua.
- Reprodução quadro a quadro.
- Visualização de pivô e colisão.

### Diagnóstico

Exibir:
- Estado atual.
- Direção.
- Frame.
- FPS.
- Duração da animação.
- Dimensões.
- Âncora.
- Quantidade de cores.
- Status de cada asset.

Não simular como concluídas animações ausentes.

Estados incompletos devem aparecer como indisponíveis.

**Entregável:** laboratório acessível localmente e relatório de testes.

---

# 14. FASE 10 — QA INDEPENDENTE

**Usar: Opus 5.5 em sessão independente da produção. Sonnet pode executar verificações automatizadas.**

Avaliar:

1. Fidelidade à espécie.
2. Qualidade GBA Plus.
3. Consistência anatômica.
4. Qualidade das quatro direções.
5. Naturalidade da caminhada.
6. Qualidade do idle.
7. Clareza das emoções.
8. Qualidade do descanso.
9. Coerência das interações.
10. Qualidade do combate.
11. Transições.
12. Integridade dos arquivos.
13. Desempenho.
14. Escalabilidade do processo.

Utilizar a régua histórica de oito critérios do Hawkmon onde houver equivalência e acrescentar critérios específicos para o Labramon.

Não comparar notas de escopos diferentes como se fossem diretamente equivalentes.

### Testes automatizados

Verificar:
- PNGs.
- Transparência.
- Canvas.
- Paleta.
- Âncoras.
- Bounding boxes.
- Continuidade dos loops.
- Frames duplicados.
- Quadros ausentes.
- Consistência dos manifestos.
- Erros de console.
- Falhas de carregamento.
- Regressões.

### Critério de qualidade

Meta geral: pelo menos 8/10, sem falhas críticas de anatomia, identidade ou integração.

A nota não substitui a homologação humana.

**Entregável:** `F9_QA_INDEPENDENTE.md`.

---

# 15. FASE 11 — STANDARD VISUAL 2.0

**Usar: Opus 5.5**

Preparar uma proposta documentada contendo:

- Método de pesquisa.
- Reference Gate.
- Prompt Mestre 2.0.
- Padrão de arte-mestra.
- Regras de escala.
- Regras de paleta.
- Padrão de quatro direções.
- Regras para bípedes.
- Regras para quadrúpedes.
- Emoções.
- Descanso.
- Combate.
- Interações.
- Convenções de arquivos.
- Manifestos.
- QA.
- Custos.
- Ferramentas.
- Critérios de homologação.

Distinguir:
- Regras efetivamente validadas.
- Regras propostas.
- Limitações conhecidas.
- Hipóteses ainda não testadas.

Não declarar o padrão definitivo com base apenas em duas espécies.

**Entregável:** `STANDARD_VISUAL_2_0_CANDIDATO.md`.

---

# 16. FASE 12 — RELATÓRIO FINAL

**Usar: Opus 5.5**

Produzir um relatório executivo com:

1. Status geral do F9.
2. Resumo do trabalho realizado.
3. Evidências da pesquisa.
4. Arte-mestra.
5. Spritesheets.
6. GIFs e vídeos.
7. Laboratório.
8. Resultados do QA.
9. Créditos PixelLab consumidos.
10. Tempo de produção.
11. Falhas e correções.
12. Pendências.
13. Comparação com Hawkmon.
14. Proposta do Standard Visual 2.0.
15. Recomendação para Tamer 2.0.

Classificar cada entrega como:

- CONCLUÍDO E TESTADO.
- CANDIDATO — AGUARDANDO HOMOLOGAÇÃO.
- BLOQUEADO.
- NÃO INICIADO.

Não afirmar que houve revisão do ChatGPT sem uma revisão efetiva.

---

# 17. EXECUÇÃO NOTURNA

O fundador poderá ficar ausente durante a execução.

Não interromper tarefas independentes por falta de resposta.

Executar em sequência tudo que for possível sem violar orçamento, segurança ou homologação.

Se houver bloqueio de geração artística:
- Registrar o bloqueio.
- Preparar prompts.
- Preparar ferramentas.
- Preparar laboratório.
- Preparar manifestos.
- Executar testes disponíveis.
- Produzir relatório.

Não transformar um bloqueio em autorização implícita.

Não avançar para produção em massa.

Não iniciar Tamer 2.0.

---

# 18. RESULTADO ESPERADO

Ao final, apresentar um pacote F9 contendo:

- Labramon GBA Plus candidato.
- Quatro direções.
- Movimentação.
- Emoções.
- Sono.
- Interações.
- Combate.
- Laboratório interativo.
- QA independente.
- Proposta Standard Visual 2.0.

O pacote deve permitir avaliação visual e técnica pelo ChatGPT e pelo fundador.

**A execução técnica não equivale à homologação.**

Após a revisão, aguardar aprovação do fundador para encerrar a fase de Digimons e iniciar o Tamer 2.0.

# FIM — COMANDO F9