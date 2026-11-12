
# MÓDULO 18 — GENERATIVE SPRITE FACTORY

O Game Studio deverá possuir capacidade de criar sprites e animações originais quando não encontrar assets adequados.

OBJETIVO:
Não depender exclusivamente de bibliotecas externas.

Criar o agente:
GAME-SPRITE-GENERATOR

RESPONSABILIDADES:

1. Criar criaturas originais em pixel art.
2. Criar sprites individuais com fundo transparente.
3. Criar spritesheets.
4. Produzir animações completas.
5. Criar variações de cores e raridade.
6. Criar expressões e movimentos.
7. Completar animações ausentes em assets autorizados.
8. Criar efeitos de ataque e evolução.
9. Manter consistência visual entre frames.
10. Exportar arquivos prontos para integração no jogo.

PIPELINE DE CRIAÇÃO:

ETAPA 1 — DESIGN
- Criar conceito visual.
- Definir silhueta.
- Definir paleta.
- Definir proporções.
- Definir personalidade.

ETAPA 2 — MODEL SHEET
- Criar vistas frontal, traseira e laterais.
- Definir proporções.
- Definir pontos de referência.
- Criar guia de consistência.

ETAPA 3 — ANIMAÇÃO
Produzir:
- Idle.
- Walk.
- Sleep.
- Follow.
- Eat.
- Attack.
- Hurt.
- Defeat.
- Evolution.

ETAPA 4 — SPRITESHEET
- Frames uniformes.
- Fundo transparente.
- Alinhamento consistente.
- Origem e pivô definidos.
- Sequenciamento correto.
- Metadados JSON.

ETAPA 5 — QA
- Verificar continuidade.
- Identificar frames duplicados.
- Detectar deformações.
- Validar loops.
- Validar transparência.
- Testar velocidade.
- Testar no Phaser.

ETAPA 6 — EXPORTAÇÃO
Exportar:
- PNG individual.
- Spritesheet PNG.
- JSON de animações.
- Arquivo-fonte editável quando possível.
- Preview GIF.
- Manifest da criatura.

REGRAS:

- Não utilizar personagens protegidos como produto final.
- Criar criaturas originais.
- Não deformar a criatura entre frames.
- Não alterar paleta sem justificativa.
- Não mudar proporções entre animações.
- Não gerar spritesheets sem validar os frames.
- Preservar a estética definida pelo ART DIRECTOR.

CAPACIDADE DE AUTOCORREÇÃO:

Se um frame estiver inconsistente:
1. Identificar o problema.
2. Regenerar ou corrigir o frame.
3. Comparar com os frames anteriores.
4. Executar novamente o QA.

Se a ferramenta generativa não produzir qualidade suficiente:
- Utilizar edição programática.
- Utilizar ferramentas de pixel art.
- Considerar animação manual.
- Solicitar aprovação humana quando necessário.

Não declarar uma animação pronta sem preview e validação real.
