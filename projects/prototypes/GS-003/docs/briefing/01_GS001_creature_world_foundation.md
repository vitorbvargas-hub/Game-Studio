
# GAME STUDIO — GS-001
# CREATURE WORLD — ART, ASSETS & GAMEPLAY FOUNDATION

Você é o agente principal do Game Studio OpenClaw.
Sua missão é coordenar a criação de um MMORPG Idle 2D inspirado nas mecânicas do IdleDex, na direção visual de Drakantos e na personalidade/animação dos sprites de Guilmon e Digimon World.

IMPORTANTE:
Não quero apenas documentação ou recomendações.
Quero pesquisa real, análise das referências, criação dos agentes necessários, implementação dos pipelines, produção de protótipos e validação técnica.

==================================================
1. REFERÊNCIAS OBRIGATÓRIAS
==================================================

IDLEDEX:
https://idledex.com/
https://idledex.com/play
https://wiki.idledex.com/

DRAKANTOS:
https://press.drakantos.com/
https://store.steampowered.com/app/2454980/Drakantos/
https://wingeon.com/

GUILMON / DIGIMON:
https://digimon.fandom.com/wiki/Gallery:Guilmon
https://codexpets.net/gallery/guilmon
https://dim.digitallink.games/resources

SPRITE MANAGEMENT:
https://github.com/netraular/DigimonWorldSpriteManager

SPRITE ANIMATION:
https://pixel.fliperstudio.com/pixel-art-animation
https://pixler.dev/

ASSETS:
https://itch.io/game-assets/tag-pixel-art
https://opengameart.org/

DIRETRIZES DE PESQUISA:

1. Estudar o gameplay real do IdleDex.
2. Estudar os mapas e personagens de Drakantos.
3. Estudar os sprites e animações de Guilmon.
4. Identificar referências de Digimon World DS e Digimon Twin.
5. Pesquisar assets com licença compatível com o projeto.
6. Identificar ferramentas para produção de spritesheets.
7. Registrar links, imagens, licenças e observações.
8. Não considerar uma imagem ilustrativa como asset baixável.
9. Não inventar funcionalidades que não foram verificadas.

Se uma página não puder ser acessada, registrar a limitação e continuar utilizando as demais referências.

==================================================
2. DIREÇÃO ARTÍSTICA
==================================================

Identidade visual: IDLE MMORPG PIXEL ART.

Combinar:

- IdleDex: estrutura de gameplay e experiência.
- Drakantos: mundo, cenários, profundidade e acabamento.
- Guilmon: personalidade, expressividade e animações.
- Digimon World: organização e comportamento das criaturas.

Características:

- Pixel art detalhada.
- Perspectiva top-down 3/4.
- Mundo colorido e vivo.
- Criaturas pequenas e expressivas.
- Cenários ricos em detalhes.
- Vegetação, água, pedras, árvores e construções.
- Animações naturais.
- Efeitos visuais sem exageros.
- Identidade artística consistente.

Não copiar sprites, mapas, personagens ou recursos protegidos.

A produção final deve utilizar criaturas originais ou assets devidamente licenciados.

A referência a Guilmon serve para estudar linguagem visual, personalidade, proporções e movimentos.

==================================================
3. REGRA FUNDAMENTAL: COMBATE NO PRÓPRIO MAPA
==================================================

ESTA DECISÃO É OBRIGATÓRIA.

As batalhas acontecerão no próprio mapa.

NÃO criar:
- Tela separada de batalha.
- Mudança de cenário ao iniciar combate.
- Arena individual automática.
- Transição para battle scene.
- Campo de batalha separado.

O jogador e as criaturas permanecem nas posições do mundo.

Durante o combate:

- Criatura inimiga permanece no mapa.
- Criatura do jogador permanece no mapa.
- Animações de ataque acontecem no local.
- Efeitos aparecem sobre o cenário.
- Barras de HP aparecem sobre os personagens.
- Dano e habilidades são exibidos visualmente.
- O ambiente permanece visível.
- Outros jogadores continuam visíveis.
- O combate é sincronizado pelo servidor.

Criar estados:

IDLE
WALK
FOLLOW
ENGAGE
ATTACK
HURT
DEFEAT
RETURN

O combate deve ser integrado ao sistema de entidades do mundo.

A lógica de batalha precisa ser separada da apresentação visual, mas a apresentação nunca deverá trocar de mapa.

==================================================
4. ARENA — NÃO IMPLEMENTAR AGORA
==================================================

A arena será um evento futuro dentro do próprio jogo.

Por enquanto:

- Não desenvolver sistema de arena.
- Não criar matchmaking.
- Não criar mapas exclusivos.
- Não criar filas.
- Não implementar ranking PvP de arena.

A arquitetura poderá prever eventos futuros, mas sem desenvolver esse módulo.

==================================================
5. SISTEMA DE CRIATURAS
==================================================

Criar uma arquitetura escalável de criaturas.

Cada criatura deverá possuir:

- ID único.
- Nome.
- Descrição.
- Categoria.
- Raridade.
- Elemento.
- Atributos.
- Estágio evolutivo.
- Linha evolutiva.
- Requisitos de evolução.
- Sprites.
- Spritesheets.
- Animações.
- Dimensões.
- Hitbox.
- Pontos de ancoragem.
- Origem do asset.
- Licença.
- Status de homologação.

Preparar catálogo inicial de 12 criaturas originais.

Distribuição:
- 4 iniciais.
- 4 intermediárias.
- 4 avançadas.

Criar três linhas de evolução demonstráveis.

As criaturas devem ter identidades distintas, silhuetas reconhecíveis e proporções consistentes.

==================================================
6. SISTEMA DE ANIMAÇÕES
==================================================

Implementar padrão de animações:

P0:
- Idle.
- Walk.
- Sleep.
- Follow.
- Hurt.
- Attack.

P1:
- Eat.
- Happy.
- Interact.
- Special Attack.
- Defeat.
- Evolution.

P2:
- Dance.
- Emotes.
- Social Interaction.
- Rare Animations.
- Cosmetic Variations.

Cada animação deverá ter:
- Frames.
- FPS configurável.
- Duração.
- Loop.
- Direção.
- Ponto de origem.
- Eventos de animação quando necessário.

Estudar sprites de Guilmon como referência para expressividade.

Não exigir quatro direções para toda animação. Definir a necessidade de acordo com o comportamento e a câmera.

Priorizar qualidade do loop idle e walk.

==================================================
7. PIPELINE MULTIAGENTE
==================================================

Utilizar o agente principal game-studio como orquestrador.

Verificar os agentes existentes antes de criar novos.

Criar ou aproveitar especialistas:

GAME-RESEARCH:
Pesquisa de assets, referências e licenças.

GAME-ART-DIRECTOR:
Direção artística, paletas, proporções e consistência visual.

GAME-SPRITE-ARTIST:
Produção de criaturas e sprites originais.

GAME-ANIMATOR:
Produção de spritesheets e animações.

GAME-WORLD-DESIGNER:
Tilesets, mapas, biomas e ambientação.

GAME-DEVELOPER:
Integração de assets e sistemas do jogo.

GAME-QA:
Homologação visual, técnica e funcional.

Os agentes devem trabalhar em tarefas paralelas quando possível.

Limite inicial de quatro tarefas simultâneas.

Cada agente deverá produzir entregáveis verificáveis.

Não criar agentes duplicados se já existir um especialista equivalente.

==================================================
8. ESTRUTURA DA BIBLIOTECA
==================================================

Criar:

GAME-ASSETS/
  01-creatures/
    original/
    reference/
    approved/
    evolution-lines/

  02-animations/
    idle/
    walk/
    sleep/
    eat/
    attack/
    hurt/
    evolve/
    special/

  03-environments/
    grass/
    forest/
    water/
    rocks/
    buildings/
    props/

  04-effects/
    particles/
    combat/
    evolution/
    skills/

  05-ui/
  06-audio/
  07-manifests/
  08-licenses/
  09-previews/
  10-source-files/

Cada criatura terá seu próprio diretório.

Exemplo:

CREATURE-0001/
  creature.json
  sprites/
  spritesheets/
  animations/
  previews/
  source/
  license.json

Não duplicar arquivos desnecessariamente.

Utilizar versionamento e registro de alterações.

==================================================
9. PADRÃO TÉCNICO
==================================================

Investigar a arquitetura atual do projeto antes de definir ferramentas.

Não substituir tecnologias existentes sem justificativa.

Avaliar:

- Phaser 3.
- TypeScript.
- WebGL.
- PNG.
- JSON.
- Aseprite.
- Texture atlases.
- Spritesheet animation.

Se o projeto já possuir engine e estrutura de renderização, preservar o que estiver funcionando.

Garantir:

- Pixel-perfect rendering.
- Nearest-neighbor scaling.
- Ausência de blur.
- Animações sincronizadas.
- Carregamento eficiente.
- Cache de assets.
- Lazy loading quando aplicável.
- Suporte mobile.
- Performance com muitas entidades simultâneas.

==================================================
10. VISUALIZADOR DE SPRITES
==================================================

Desenvolver um visualizador interno.

Funcionalidades:

- Galeria de criaturas.
- Preview animado.
- Visualização de frames individuais.
- Controle de velocidade.
- Seleção de animação.
- Comparação de versões.
- Visualização de direções.
- Filtros por categoria.
- Filtros por raridade.
- Filtros por status.
- Informações de licença.
- Aprovação ou rejeição.

Não criar apenas uma página estática.

O visualizador deve permitir testar os assets de verdade.

==================================================
11. PRODUÇÃO DO PRIMEIRO PACOTE
==================================================

Produzir a primeira vertical slice:

12 criaturas originais.
3 linhas evolutivas.
3 biomas.
Sistema de animação.
Sistema de catálogo.
Sistema de efeitos.
Sistema de homologação.

Primeiro protótipo:
4 criaturas completas.

Para cada uma:
- Idle.
- Walk.
- Sleep.
- Follow.
- Attack.
- Hurt.

Depois expandir para as 12.

Criar um cenário real de teste contendo:
- Jogador.
- Múltiplas criaturas.
- NPCs.
- Criaturas selvagens.
- Elementos ambientais.
- Combate acontecendo no próprio mapa.
- Barras de vida.
- Efeitos de ataque.
- Animações contínuas.

==================================================
12. COMBATE VISUAL
==================================================

Implementar a camada visual de combate no mundo.

Exemplo de fluxo:

1. Criatura identifica inimigo.
2. Aproxima-se do alvo.
3. Entra em estado de combate.
4. Executa animação de ataque.
5. Efeito visual é exibido.
6. Servidor confirma o dano.
7. HP é atualizado.
8. Inimigo executa sua reação.
9. Combate continua até derrota ou fuga.

Não permitir que a animação determine o resultado do combate.

O servidor é responsável pela autoridade dos eventos.

A camada visual representa os acontecimentos confirmados.

Não bloquear a movimentação e a visualização dos demais jogadores sem necessidade.

==================================================
13. DOCUMENTAÇÃO OBRIGATÓRIA
==================================================

Criar:

ART_STYLE_GUIDE.md
ASSET_PIPELINE.md
SPRITE_SPECIFICATION.md
ANIMATION_STANDARD.md
ASSET_LICENSE_POLICY.md
CREATURE_CATALOG.json
ASSET_QA_CHECKLIST.md
GS001_ASSET_BACKLOG.md
WORLD_COMBAT_VISUAL_SPEC.md
REFERENCE_LIBRARY.md

O arquivo REFERENCE_LIBRARY.md deverá registrar todos os links utilizados e o motivo de cada referência.

==================================================
14. SEGURANÇA E LICENCIAMENTO
==================================================

Não utilizar assets comerciais sem autorização.

Não incorporar sprites oficiais de Digimon em builds comerciais sem licença.

Separar claramente:

- Referências visuais.
- Assets de teste.
- Assets autorizados.
- Assets originais.
- Assets rejeitados.

Todo asset deverá possuir registro de origem e licença.

Não realizar compras ou assinaturas sem autorização.

==================================================
15. EXECUÇÃO E AUTONOMIA
==================================================

Autonomia alta dentro dos limites do projeto.

Você está autorizado a:

- Pesquisar.
- Criar agentes especializados.
- Criar diretórios.
- Criar documentação.
- Produzir assets originais.
- Desenvolver ferramentas internas.
- Implementar protótipos.
- Executar testes.
- Corrigir problemas.
- Fazer commits conforme as regras existentes do projeto.

Exigir aprovação humana para:

- Compras.
- Serviços pagos.
- Publicações externas.
- Operações irreversíveis.
- Uso de conteúdo com direitos duvidosos.

Não modificar projetos externos ou outros produtos do usuário.

Preservar backups e versionamento.

==================================================
16. ORDEM DE EXECUÇÃO
==================================================

FASE 1 — AUDITORIA
- Identificar a estrutura atual do Game Studio.
- Verificar agentes existentes.
- Verificar ferramentas disponíveis.
- Identificar engines e tecnologias.
- Verificar projetos existentes.
- Evitar duplicação.

FASE 2 — RESEARCH
- Analisar referências.
- Coletar links e imagens.
- Documentar licenças.
- Definir identidade visual.

FASE 3 — PIPELINE
- Configurar agentes.
- Criar biblioteca.
- Criar manifests.
- Criar sistema de validação.
- Criar visualizador.

FASE 4 — PRODUÇÃO
- Produzir quatro criaturas-piloto.
- Criar animações.
- Criar três biomas de referência.
- Desenvolver os primeiros efeitos.

FASE 5 — INTEGRAÇÃO
- Integrar sprites ao mundo.
- Implementar animações.
- Implementar combate no mapa.
- Testar sincronização.

FASE 6 — HOMOLOGAÇÃO
- Testar qualidade.
- Testar performance.
- Validar licenças.
- Corrigir inconsistências.
- Apresentar resultado.

==================================================
17. RELATÓRIO FINAL
==================================================

Ao concluir, apresentar:

1. O que foi encontrado nas referências.
2. Quais agentes foram criados ou reutilizados.
3. Quais arquivos foram criados.
4. Quais ferramentas foram configuradas.
5. Quais criaturas foram produzidas.
6. Quais animações estão funcionais.
7. Quais cenários estão prontos.
8. Como funciona o combate dentro do mapa.
9. Resultado dos testes.
10. Pendências.
11. Próximas tarefas recomendadas.

Não declarar algo como implementado sem evidência.

Não encerrar a tarefa apenas com um planejamento.

COMECE PELA AUDITORIA DO GAME STUDIO E SIGA A ORDEM DE EXECUÇÃO.
