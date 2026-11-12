
# MÓDULO ADICIONAL — PROCEDURAL SPRITE CREATION & ANIMATION

O Game Studio NÃO poderá depender exclusivamente de sprites encontrados na internet.

Quando não encontrar assets adequados, deverá criar os próprios sprites originais.

## 1. CAPACIDADE DE CRIAÇÃO

O GAME-SPRITE-ARTIST deverá conseguir:

- Criar criaturas originais em pixel art.
- Criar personagens em diferentes proporções.
- Criar poses consistentes.
- Criar variações de cores.
- Criar criaturas por estágio evolutivo.
- Criar sprites transparentes.
- Criar spritesheets.
- Criar elementos ambientais.
- Criar efeitos de habilidades.

## 2. PRODUÇÃO DE ANIMAÇÕES

O GAME-ANIMATOR deverá criar:

- Idle.
- Walk.
- Run.
- Sleep.
- Eat.
- Attack.
- Hurt.
- Death.
- Follow.
- Happy.
- Interact.
- Evolution.
- Special Skills.

As animações deverão preservar:
- Identidade da criatura.
- Proporções.
- Paleta de cores.
- Silhueta.
- Ponto de origem.
- Dimensões.
- Direção visual.

## 3. FERRAMENTAS

Pesquisar e avaliar ferramentas como:

- Aseprite.
- LibreSprite.
- Pixelorama.
- ImageGen.
- Modelos de geração de imagem disponíveis.
- Ferramentas de spritesheet.
- Scripts Python para processamento de frames.

Não assumir que uma ferramenta gera spritesheets tecnicamente perfeitos.

Se uma ferramenta produzir uma imagem conceitual, o pipeline deverá transformar o resultado em frames individuais, validar e corrigir os problemas.

## 4. ANIMAÇÃO REAL

É obrigatório produzir animações utilizáveis.

Não considerar uma imagem estática como animação.

Não considerar uma sequência de imagens inconsistentes como spritesheet aprovado.

Implementar:
- Separação de frames.
- Organização dos frames.
- Controle de FPS.
- Loop.
- Direções.
- Preview.
- Exportação PNG.
- Manifest JSON.

## 5. CONSISTÊNCIA VISUAL

Toda nova criatura deverá utilizar o ART_STYLE_GUIDE.md.

Criar uma ficha visual de referência para cada criatura.

A ficha deverá ser utilizada em todas as gerações seguintes.

Não aceitar mudanças involuntárias de:
- Anatomia.
- Cores.
- Olhos.
- Formato da cabeça.
- Proporções.
- Acessórios.

## 6. GARANTIA DE QUALIDADE

Antes da integração:

- Verificar transparência.
- Verificar frames duplicados.
- Verificar frames cortados.
- Verificar alinhamento.
- Verificar loops.
- Verificar consistência entre poses.
- Verificar escala.
- Verificar legibilidade no mapa.
- Testar na engine.

Sprites reprovados deverão retornar ao agente responsável para correção.

## 7. AUTONOMIA

A criação de criaturas originais e suas animações está autorizada.

Não solicitar aprovação humana para cada sprite.

Solicitar aprovação somente para mudanças relevantes na identidade artística, contratação de serviços pagos ou uso de conteúdo protegido.

OBJETIVO:

O Game Studio deverá ser capaz de criar uma criatura completamente nova, produzir suas animações, validar os arquivos e disponibilizá-la no jogo sem depender de um artista externo.
