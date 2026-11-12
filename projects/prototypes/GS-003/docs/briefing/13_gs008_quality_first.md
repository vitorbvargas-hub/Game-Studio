# GS-008 — QUALITY FIRST
## Reestruturação da qualidade visual, personagens, animações e mapas do Game Studio

A partir desta instrução, a prioridade máxima do Game Studio deixa de ser velocidade de desenvolvimento e volume de funcionalidades.

A prioridade passa a ser QUALIDADE VISUAL E EXPERIÊNCIA.

O usuário analisou as provas visuais atuais e identificou dois problemas principais:

1. Personagens e Digimon com aparência rígida, pouco expressiva e visualmente inferior à referência desejada.
2. Mapas com aparência antiga, repetitiva, excessivamente baseada em tiles e sem profundidade ou vida ambiental.

O usuário não deseja acelerar a produção.

Deseja alcançar um nível de qualidade artística significativamente superior, mesmo que cada entrega leve muito mais tempo.

## 1. MUDANÇA DE FILOSOFIA

Adotar oficialmente:

QUALITY FIRST — ART DIRECTION FIRST — ANIMATION FIRST.

Regras obrigatórias:

- Não priorizar velocidade.
- Não priorizar quantidade de mapas.
- Não aceitar assets medianos apenas para avançar.
- Não aceitar sprites rígidos.
- Não aceitar mapas repetitivos.
- Não utilizar geração automática sem direção artística.
- Não considerar um mapa pronto apenas porque é navegável.
- Não considerar uma animação pronta apenas porque possui quadros.
- Não aceitar inconsistência de escala, proporção, iluminação ou perspectiva.
- Não substituir qualidade artística por soluções técnicas mais simples.

O objetivo é produzir um MMORPG 2D de Digimon com identidade visual própria e qualidade comparável às referências artísticas de Drakantos.

PokeIdleDex continua sendo uma referência de organização e exploração, mas não deve limitar a ambição artística do projeto.

## 2. PRIMEIRO PASSO — AUDITORIA VISUAL PROFUNDA

Antes de modificar código ou gerar novos assets, analisar os dois vídeos fornecidos pelo usuário.

Inspecionar:
- Personagem principal.
- Digimon.
- Escala dos sprites.
- Proporções.
- Silhuetas.
- Animações.
- Ciclos de caminhada.
- Idle.
- Ataques.
- Transições.
- Efeitos.
- Terreno.
- Tilesets.
- Árvores.
- Vegetação.
- Água.
- Iluminação.
- Sombras.
- Profundidade.
- Composição dos mapas.
- Interface e integração com o mundo.

Analisar também os arquivos reais dos sprites e tilesets, não apenas a captura de tela.

Identificar:
- Resolução original.
- Dimensões dos sprites.
- Quantidade de quadros.
- FPS das animações.
- Origem dos assets.
- Escala de renderização.
- Sistema de camadas.
- Sistema de profundidade.
- Pipeline de geração.
- Possíveis perdas de qualidade na exportação.
- Inconsistências entre assets.

Criar um relatório com evidências visuais e classificação de problemas.

Não alterar o projeto durante a primeira auditoria.

## 3. GAME ART DIRECTOR — AUTORIDADE ARTÍSTICA

Criar ou promover um GAME-ART-DIRECTOR com autoridade para rejeitar assets.

Esse agente será responsável por:

- Criar a identidade visual oficial.
- Definir a linguagem artística.
- Definir escalas e proporções.
- Definir paletas.
- Definir padrões de animação.
- Aprovar personagens.
- Aprovar Digimon.
- Aprovar mapas.
- Aprovar efeitos.
- Manter consistência visual.

Nenhum agente de geração poderá considerar seu próprio trabalho aprovado.

Toda entrega visual deve passar pelo GAME-ART-DIRECTOR.

Se o resultado não atingir o padrão estabelecido, deverá ser refeito.

## 4. PERSONAGENS E DIGIMON — RECONSTRUÇÃO ARTÍSTICA

Criar uma frente independente chamada CHARACTER QUALITY LAB.

### 4.1 Auditoria dos sprites

Analisar todos os personagens e Digimon existentes.

Identificar:
- Sprites de baixa qualidade.
- Proporções inadequadas.
- Silhuetas pouco reconhecíveis.
- Falta de detalhes.
- Animações incompletas.
- Animações artificiais.
- Diferenças de escala.
- Falta de consistência entre espécies.

Não reconstruir tudo indiscriminadamente.

Classificar cada asset:
- Aprovado.
- Precisa melhorar.
- Precisa ser refeito.

### 4.2 Design de personagens

Desenvolver uma direção visual mais expressiva.

Os personagens precisam ter:
- Silhuetas fortes.
- Proporções coerentes.
- Personalidade.
- Detalhes próprios.
- Roupas e acessórios bem definidos.
- Boa leitura em movimento.
- Animações coerentes com sua estrutura corporal.

Não deixar todos os personagens com a mesma aparência.

### 4.3 Design de Digimon

Cada Digimon deve preservar sua identidade.

Não utilizar um único template de animação para espécies com estruturas corporais diferentes.

Considerar:
- Altura.
- Largura.
- Centro de gravidade.
- Número de membros.
- Cauda.
- Asas.
- Orelhas.
- Chifres.
- Apêndices.
- Tipo de locomoção.
- Personalidade.
- Comportamento.

Um Digimon quadrúpede não deve andar como um humanoide.

Um Digimon voador não deve simplesmente deslizar pelo chão.

Um Digimon pesado deve transmitir peso.

Um Digimon pequeno deve apresentar agilidade e comportamento próprios.

### 4.4 Sistema de animações

Criar um padrão de animação de alta qualidade.

Estados mínimos:
- Idle.
- Walk.
- Run.
- Attack.
- Skill.
- Hurt.
- Death.
- Victory.
- Sleep.
- Follow.
- Interaction.

Melhorar especialmente:

IDLE:
- Respiração.
- Oscilação corporal.
- Movimento secundário.
- Variação natural.
- Pequenos comportamentos individuais.

WALK:
- Contato com o chão.
- Distribuição de peso.
- Balanço corporal.
- Movimento de cabeça.
- Movimento de cauda.
- Movimento de asas quando aplicável.

ATTACK:
- Antecipação.
- Preparação.
- Movimento principal.
- Impacto.
- Recuperação.
- Efeitos sincronizados.

SKILLS:
- Preparação.
- Efeito visual.
- Movimento.
- Impacto.
- Reação do alvo.
- Dissipação dos efeitos.

Criar transições entre os estados.

Não permitir mudanças bruscas de animação sem interpolação ou transição adequada quando aplicável.

Evitar animações que pareçam apenas imagens deslocadas pela tela.

### 4.5 Qualidade de animação

Avaliar:
- Fluidez.
- Silhueta.
- Timing.
- Espaçamento dos movimentos.
- Peso.
- Antecipação.
- Impacto.
- Recuperação.
- Consistência.
- Leitura visual.

Não aumentar FPS artificialmente para esconder animações ruins.

A qualidade deve vir da animação, não apenas da taxa de reprodução.

## 5. MAP QUALITY LAB — RECONSTRUÇÃO DOS MAPAS

Criar uma frente independente para qualidade ambiental.

O problema atual não é somente a quantidade de tiles.

É a composição visual.

Os mapas precisam abandonar a aparência de ambientes antigos construídos com padrões repetitivos.

### 5.1 Nova filosofia de mapas

Adotar:
- Composição artesanal.
- Profundidade visual.
- Variação orgânica.
- Identidade por região.
- Vegetação em camadas.
- Detalhamento ambiental.
- Iluminação.
- Sombras.
- Elementos animados.
- Cenários com personalidade.

Os tiles continuam existindo como infraestrutura técnica, mas o jogador não deve perceber uma repetição evidente da grade.

### 5.2 Composição ambiental

Cada mapa deve ter:

BACKGROUND:
- Elementos distantes.
- Montanhas.
- Árvores distantes.
- Construções.
- Neblina.
- Elementos atmosféricos.

MIDGROUND:
- Terreno.
- Caminhos.
- Vegetação.
- Rochas.
- Água.
- Estruturas.
- Áreas navegáveis.

FOREGROUND:
- Árvores próximas.
- Galhos.
- Folhas.
- Plantas.
- Objetos que passam visualmente à frente dos personagens.

OVERLAYS:
- Sombras.
- Iluminação.
- Partículas.
- Efeitos climáticos.
- Brilhos.
- Reflexos.

### 5.3 Vida ambiental

Adicionar movimentos ambientais quando fizer sentido:

- Árvores balançando.
- Folhas caindo.
- Grama se movimentando.
- Água animada.
- Reflexos.
- Pequenos insetos.
- Partículas.
- Névoa.
- Variações de iluminação.
- Vegetação reagindo.
- Elementos ambientais interativos.

Não adicionar animações aleatórias apenas para preencher a tela.

Cada movimento deve ter propósito e coerência.

### 5.4 Diversidade de terreno

Eliminar repetição excessiva de:
- Texturas.
- Árvores.
- Pedras.
- Arbustos.
- Flores.
- Caminhos.

Criar variações de:
- Forma.
- Tamanho.
- Orientação.
- Densidade.
- Cor.
- Distribuição.
- Composição.

Não gerar mapas que pareçam uma grade de objetos repetidos.

## 6. STABLE DIFFUSION E PIXELLAB

Não remover as ferramentas que já estavam sendo instaladas.

Primeiro auditar o estado atual.

### Stable Diffusion

Utilizar para:
- Exploração artística.
- Conceitos visuais.
- Referências.
- Estudos de composição.
- Estudos de iluminação.
- Variações de biomas.
- Direção de arte.

Se disponível, utilizar workflows controlados no ComfyUI.

Criar referências aprovadas e manter consistência.

Não utilizar uma imagem gerada como mapa final.

### PixelLab

Utilizar para:
- Sprites.
- Personagens.
- Digimon.
- Animações.
- Tilesets.
- Objetos ambientais.
- Elementos de cenário.

Investigar os recursos de geração de sprites, animações e tilesets.

Não aceitar automaticamente a primeira geração.

Gerar alternativas, comparar, revisar e refinar.

Registrar prompts, parâmetros, referências, versões e custos.

### Controle de qualidade

Criar um processo de aprovação:

1. Briefing.
2. Referência.
3. Primeira geração.
4. Avaliação.
5. Revisão.
6. Nova geração.
7. Comparação.
8. Aprovação.
9. Integração.

Aprovar apenas quando o resultado atingir o padrão artístico.

## 7. NOVA ORGANIZAÇÃO DOS AGENTES

Criar ou adaptar os agentes:

GAME-ART-DIRECTOR:
Autoridade artística central.

CHARACTER-DESIGNER:
Design dos personagens.

DIGIMON-ARTIST:
Identidade visual das espécies.

ANIMATION-DIRECTOR:
Direção dos movimentos e ciclos.

SPRITE-ANIMATOR:
Produção das animações.

ENVIRONMENT-ARTIST:
Construção visual dos cenários.

WORLD-COMPOSER:
Composição dos mapas e profundidade.

ASSET-GENERATOR:
Coordenação do Stable Diffusion e PixelLab.

MAP-ENGINEER:
Implementação técnica dos mapas.

VISUAL-QA:
Revisão crítica de todos os assets.

GAME-INTEGRATOR:
Integração dos resultados ao jogo.

Os agentes devem trabalhar em conjunto e compartilhar a mesma documentação de direção de arte.

Não criar agentes duplicados caso já existam equivalentes. Adaptar os existentes.

## 8. PROJETO PILOTO — UMA PEQUENA REGIÃO DE ALTA QUALIDADE

Não produzir vários mapas agora.

Selecionar uma pequena região da floresta já existente.

Reconstruir essa região como prova de qualidade.

Entregar:

A. Um personagem jogável visualmente refinado.

B. Dois ou três Digimon com identidades visuais distintas.

C. Animações completas e naturais.

D. Uma área de floresta com profundidade.

E. Vegetação animada.

F. Iluminação e sombras.

G. Água ou outro elemento ambiental animado.

H. Colisões e navegação funcionais.

I. Combate no próprio mapa.

J. Uma demonstração contínua de gameplay.

Não trocar a arquitetura do jogo sem necessidade.

Não substituir assets originais sem backup.

Não interromper o funcionamento do protótipo atual.

## 9. REFERÊNCIAS E CRITÉRIOS DE ACEITAÇÃO

Usar Drakantos como referência de acabamento e expressividade.

Usar PokeIdleDex como referência de estrutura de exploração, não de qualidade artística final.

Comparar lado a lado:
- Personagens.
- Digimon.
- Árvores.
- Vegetação.
- Terreno.
- Iluminação.
- Animações.
- Combate.
- Profundidade.

Criar uma avaliação de 0 a 10 para:

1. Qualidade artística.
2. Personalidade dos personagens.
3. Identidade dos Digimon.
4. Fluidez das animações.
5. Qualidade dos mapas.
6. Profundidade ambiental.
7. Iluminação.
8. Vida ambiental.
9. Coerência entre assets.
10. Qualidade geral.

Exigir:
- Média mínima 9/10.
- Nenhuma dimensão abaixo de 8/10.
- Aprovação explícita do GAME-ART-DIRECTOR.
- Aprovação visual do usuário antes de expandir a produção.

Essas notas são critérios internos de homologação, não uma alegação de equivalência objetiva com Drakantos.

## 10. REGRA DE AUTONOMIA

O agente possui autonomia alta para:
- Auditar.
- Criar referências.
- Criar protótipos.
- Gerar assets dentro do orçamento autorizado.
- Refazer animações.
- Melhorar mapas.
- Criar branches.
- Testar.
- Comparar.
- Documentar.

Não pode:
- Comprar créditos.
- Contratar serviços.
- Publicar externamente.
- Apagar assets originais.
- Alterar produção.
- Trocar a engine.
- Reescrever o sistema de renderização sem aprovação.

Registrar todos os custos e consumo de créditos.

## 11. ENTREGAS OBRIGATÓRIAS

Primeira entrega:

1. Auditoria dos vídeos.
2. Diagnóstico dos sprites.
3. Diagnóstico das animações.
4. Diagnóstico dos mapas.
5. Diagnóstico das ferramentas.
6. Nova direção de arte documentada.
7. Plano de reconstrução.
8. Seleção da região piloto.

Segunda entrega:

1. Personagem refinado.
2. Digimon refinados.
3. Animações melhoradas.
4. Mapa reconstruído.
5. Efeitos ambientais.
6. Demonstração no jogo.
7. Comparativo visual antes/depois.

Não avançar para produção em escala sem aprovação do usuário.

## 12. INSTRUÇÃO FINAL

Não tente resolver problemas de qualidade adicionando mais conteúdo.

Não tente convencer o usuário de que o resultado atual já está bom.

Não entregue apenas um relatório técnico.

O objetivo é demonstrar uma evolução visual perceptível.

Se for necessário levar vários ciclos de geração e refinamento para atingir o padrão, faça isso.

A qualidade final vale mais do que a velocidade de entrega.

Comece pela auditoria e apresente o plano de reconstrução antes de modificar os assets existentes.