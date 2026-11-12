# GS-010 — VISUAL QUALITY OVERHAUL
## Personagens, Digimon, mapas, animações e interface

**PRIORIDADE ABSOLUTA: QUALIDADE VISUAL. NÃO EXPANDIR O MUNDO ANTES DA HOMOLOGAÇÃO.**

A partir deste comando, interrompa a produção em escala de novos mapas, cenários e conteúdo visual. O objetivo é elevar a qualidade do jogo atual e estabelecer um padrão artístico que será utilizado em todas as futuras produções.

Não basta melhorar genericamente. Execute as especificações abaixo, produza protótipos reais e demonstre os resultados dentro do jogo.

---

### 1. PRIMEIRO PASSO — AUDITORIA VISUAL E TÉCNICA

Antes de modificar qualquer coisa:

1. Inspecione o jogo atual, seu código, engine, renderer, resolução, câmera, escala dos sprites e sistema de animação.
2. Localize todos os sprites de personagens e Digimon utilizados.
3. Identifique como os sprites são animados: spritesheets, animação por código, skeletal animation ou outro método.
4. Inspecione os mapas, tilesets, camadas, iluminação, sombras, objetos e efeitos ambientais.
5. Inspecione todos os painéis, menus, HUD, inventário, personagem, equipe, mapa e demais elementos de interface.
6. Verifique Stable Diffusion, ComfyUI, PixelLab, Tiled e LDtk, caso estejam instalados. Não reinstale ferramentas sem necessidade.
7. Identifique limitações técnicas que estejam impedindo a qualidade visual.

**Entregável:** relatório com imagens do estado atual, problemas encontrados, causa provável e plano de correção priorizado.

Não substitua a engine, renderer ou arquitetura sem apresentar evidências e solicitar aprovação.

---

### 2. CHARACTER DESIGN LAB — PERSONAGENS

Criar um laboratório de desenvolvimento visual de personagens.

Cada personagem deve passar pelas seguintes etapas:

**A. Design**
- Definir silhueta e proporções.
- Criar identidade visual e personalidade.
- Definir paleta de cores, roupas, acessórios e detalhes.
- Criar expressões faciais e poses.
- Validar legibilidade em diferentes escalas.
- Verificar consistência entre todas as direções de movimento.

**B. Animação obrigatória**

Produzir e testar:
- Idle: respiração, piscadas, pequenos movimentos e mudanças de postura.
- Walk: caminhada com contato dos pés, transferência de peso e movimento natural dos braços.
- Run: passada mais ampla, inclinação do corpo e movimento secundário.
- Turn: transições naturais entre direções.
- Attack: antecipação, execução, impacto e recuperação.
- Hurt: reação corporal ao receber dano.
- Victory: pose de vitória com personalidade.
- Defeat: reação de derrota.
- Interaction: movimentos específicos de interação.
- Transições entre estados sem cortes bruscos.

**C. Regras de qualidade**
- Não utilizar um sprite estático como solução definitiva para animações.
- Não usar a mesma animação genérica para todos os personagens.
- Evitar movimentos mecânicos, repetitivos ou sem peso.
- Preservar proporções e identidade visual em todos os frames.
- Corrigir flickering, desalinhamento, mudanças involuntárias de tamanho e inconsistência de contorno.
- Verificar o resultado em movimento real, não apenas frame por frame.

---

### 3. DIGIMON ART & ANIMATION LAB

Os Digimon são protagonistas do jogo. Cada espécie precisa ter uma identidade própria.

Para cada Digimon do piloto:

1. Definir sua anatomia, proporções e silhueta.
2. Identificar como seu corpo se movimenta.
3. Definir personalidade e comportamento.
4. Criar animações específicas para sua anatomia.
5. Criar efeitos visuais coerentes com seus ataques.
6. Testar integração com o personagem e com o ambiente.

**Exemplos de comportamento por anatomia:**
- Quadrúpedes: movimentação coordenada das patas, balanço do corpo e da cauda.
- Bípedes: equilíbrio, transferência de peso, movimentação dos braços e postura.
- Voadores: batimento de asas, flutuação, inclinação e pouso.
- Digimon com caudas longas: movimento secundário da cauda, inclusive durante paradas e mudanças de direção.
- Digimon com armaduras: peso visual, articulação e reação coerente dos componentes.

Não aplicar essas categorias como templates rígidos. Cada espécie deve ser analisada individualmente.

**Animações obrigatórias:**
- Idle.
- Walk ou movimento equivalente.
- Run ou deslocamento equivalente.
- Attack.
- Skill.
- Hurt.
- Victory.
- Defeat.
- Follow.
- Transições entre estados.

**Ataques e habilidades:**
- Preparação do movimento.
- Animação de execução.
- Efeito visual.
- Impacto.
- Reação do alvo.
- Dissipação do efeito.

Não transformar todo ataque em uma simples explosão de partículas. Os efeitos devem respeitar a habilidade e a identidade do Digimon.

---

### 4. MAP QUALITY LAB — CONSTRUÇÃO DE CENÁRIOS

Não produzir dezenas de mapas agora.

Escolher uma pequena área da floresta existente e reconstruí-la como cenário de referência.

**A. Composição**
- Criar pontos de interesse visual.
- Trabalhar profundidade e perspectiva.
- Evitar distribuição aleatória de objetos.
- Criar caminhos naturais e áreas de exploração.
- Alternar espaços abertos, vegetação densa e áreas de transição.
- Utilizar elementos de primeiro plano para criar profundidade sem esconder o jogador de forma inadequada.

**B. Camadas**
Separar e organizar:
- Background.
- Terreno principal.
- Vegetação e objetos intermediários.
- Personagens e Digimon.
- Elementos de primeiro plano.
- Efeitos ambientais.
- Iluminação e sombras.

**C. Tiles e terreno**
- Criar transições naturais entre grama, terra, pedra, água e areia.
- Evitar padrões repetitivos perceptíveis.
- Variar formatos, tamanhos e distribuição dos objetos.
- Corrigir bordas artificiais entre tiles.
- Criar elementos exclusivos de cada região.
- Evitar aparência de mapa montado exclusivamente com blocos repetidos.

**D. Iluminação e profundidade**
- Trabalhar sombras coerentes.
- Criar luz ambiente.
- Utilizar variação de tonalidade por região.
- Adicionar iluminação localizada quando fizer sentido.
- Avaliar o contraste entre personagens, Digimon e cenário.

**E. Vida ambiental**
Adicionar, quando fizer sentido:
- Árvores e folhas com movimento.
- Grama e vegetação balançando.
- Água animada.
- Partículas e insetos.
- Névoa e efeitos atmosféricos.
- Variações de luz.
- Elementos ambientais interativos.

A animação ambiental deve ser sutil e coerente. Não encher o cenário de efeitos aleatórios.

**F. Jogabilidade**
- Colisões corretas.
- Caminhos transitáveis.
- Profundidade e ordenação dos sprites.
- Objetos interativos.
- Pontos de spawn.
- Áreas de combate.
- Entradas e saídas.
- Performance adequada.

O mapa precisa ser editável e jogável, não apenas uma imagem bonita.

---

### 5. UI/UX LAB — PAINÉIS E INTERFACE

Auditar e aprimorar a interface existente sem descartar funcionalidades já implementadas.

**Direção visual:**
Criar uma interface que pareça pertencer a um MMORPG de Digimon, e não a um dashboard administrativo ou template genérico.

**A. HUD principal**
- Manter informações essenciais acessíveis.
- Evitar excesso de elementos na tela.
- Melhorar hierarquia visual.
- Garantir legibilidade sobre diferentes cenários.
- Organizar atalhos e indicadores de combate.
- Não esconder personagens e Digimon atrás de painéis desnecessários.

**B. Personagem**
- Retrato ou representação visual.
- Nome e nível.
- Experiência e progressão.
- Atributos.
- Equipamentos.
- Informações relevantes sem excesso de texto.

**C. Equipe de Digimon**
- Retratos ou sprites de cada integrante.
- Nome e nível.
- Indicadores de HP e demais recursos utilizados pelo jogo.
- Status e condições.
- Acesso às informações e evolução.
- Identidade visual individual de cada Digimon.

**D. Inventário**
- Ícones consistentes e legíveis.
- Categorias.
- Raridade visualmente identificável.
- Quantidade de itens.
- Informações ao selecionar.
- Organização que permita encontrar itens rapidamente.

**E. Evolução**
- Apresentar visualmente as possibilidades de evolução.
- Mostrar requisitos.
- Diferenciar caminhos disponíveis, bloqueados e ainda desconhecidos.
- Preservar a identidade e a árvore individual de cada Digimon.
- Não escolher automaticamente uma evolução sem a decisão do jogador.

**F. Mapa-múndi e navegação**
- Criar um mapa ilustrado do mundo.
- Apresentar regiões com identidade visual própria.
- Diferenciar locais disponíveis e bloqueados.
- Exibir nome, descrição, requisitos e informações relevantes do destino.
- Permitir selecionar uma região para viajar.
- Integrar a navegação ao universo do jogo, evitando aparência de menu administrativo.

**G. Acabamento**
- Padronizar tipografia, ícones, espaçamentos, bordas e estados.
- Melhorar feedback de seleção, hover, clique e confirmação.
- Criar transições e animações discretas.
- Garantir responsividade e legibilidade.
- Evitar excesso de caixas, contornos e informações simultâneas.

Não redesenhar tudo sem antes apresentar uma proposta visual. Preservar funcionalidades, rotas e dados existentes.

---

### 6. DIREÇÃO ARTÍSTICA E REFERÊNCIAS

Usar como referências de qualidade:
- Drakantos: qualidade visual, pixel art detalhada, profundidade, iluminação, personagens e animações.
- PokeIdleDex/IdleDex: organização da exploração, visão do mundo e estrutura de navegação.
- Jogos oficiais de Digimon: identidade visual, anatomia, personalidade e comportamento das espécies.

Essas referências são parâmetros de estudo, não autorização para copiar assets, personagens, interfaces ou mapas protegidos.

Toda produção deve respeitar os direitos de uso dos assets. Não assumir que imagens encontradas no GitHub ou em comunidades podem ser utilizadas comercialmente.

**Ferramentas:**
- Stable Diffusion/ComfyUI: exploração artística, referências, composição e estudos visuais.
- PixelLab: produção e refinamento de pixel art, sprites, animações e tilesets, conforme recursos disponíveis.
- Tiled ou LDtk: montagem e organização de mapas, escolhendo a ferramenta adequada à arquitetura atual.
- Engine atual: integração e validação dentro do jogo.

Não utilizar imagens geradas como mapas finais sem composição, revisão, colisões e integração.

---

### 7. PILOTO OBRIGATÓRIO — UMA ENTREGA DE ALTA QUALIDADE

O piloto será pequeno e extremamente bem executado.

Produzir:

1. Um personagem jogável refinado.
2. Dois ou três Digimon com anatomias e personalidades diferentes.
3. Animações completas dos personagens e Digimon.
4. Uma pequena área da floresta reconstruída.
5. Camadas, profundidade, iluminação e elementos ambientais.
6. Combate funcional no próprio mapa.
7. HUD e painéis principais revisados.
8. Integração com a navegação atual e com a estrutura de mapas independentes, sem criar uma expansão de mundo neste momento.

A entrega precisa incluir:
- Comparação visual antes/depois.
- Vídeo curto de gameplay.
- Personagens em movimento.
- Digimon em movimento.
- Combate demonstrativo.
- Visualização do mapa.
- Demonstração dos painéis.
- Lista dos assets criados e modificados.
- Relatório de testes e limitações.

---

### 8. CRITÉRIOS DE HOMOLOGAÇÃO

Avaliar cada categoria de 0 a 10:

| Critério | Meta |
|---|---:|
| Design dos personagens | 9 |
| Expressividade | 9 |
| Animações dos personagens | 9 |
| Identidade dos Digimon | 9 |
| Animações dos Digimon | 9 |
| Qualidade do cenário | 9 |
| Profundidade e composição | 9 |
| Iluminação e efeitos | 9 |
| Vida ambiental | 9 |
| Qualidade da interface | 9 |
| Consistência artística | 9 |
| Integração com gameplay | 9 |

Critério interno de aprovação:
- Média mínima de 9.
- Nenhuma categoria abaixo de 8.
- Aprovação do GAME-ART-DIRECTOR.
- Aprovação visual do usuário.

As notas devem vir acompanhadas de evidências. Não atribuir notas altas apenas porque a implementação funciona.

Se não atingir o padrão, corrigir e apresentar novamente.

---

### 9. ORGANIZAÇÃO DOS AGENTES

Auditar os agentes existentes e adaptar suas responsabilidades. Não criar duplicatas.

Papéis necessários:
- GAME-ART-DIRECTOR: responsável pela direção visual e aprovação artística.
- CHARACTER-DESIGNER: design e expressividade dos personagens.
- DIGIMON-ARTIST: identidade visual e sprites dos Digimon.
- ANIMATION-DIRECTOR: padrões de movimento e transições.
- SPRITE-ANIMATOR: execução e refinamento das animações.
- ENVIRONMENT-ARTIST: criação de elementos ambientais.
- WORLD-COMPOSER: composição e profundidade dos mapas.
- UI-UX-DESIGNER: painéis, HUD e experiência de navegação.
- MAP-ENGINEER: mapas, tilesets, camadas e colisões.
- VISUAL-QA: avaliação visual e consistência.
- GAME-INTEGRATOR: integração com o jogo.

O GAME-ART-DIRECTOR pode rejeitar qualquer asset que não atinja o padrão definido.

---

### 10. REGRAS DE EXECUÇÃO E AUTONOMIA

- Trabalhar devagar, priorizando qualidade.
- Não expandir a quantidade de mapas antes da homologação.
- Não apagar assets originais.
- Preservar backups e histórico de alterações.
- Trabalhar em branch ou ambiente de desenvolvimento.
- Não realizar compras de créditos ou serviços sem autorização.
- Não publicar alterações em produção sem aprovação.
- Não substituir engine ou renderer sem aprovação.
- Aproveitar o que já funciona.
- Evitar reconstruir funcionalidades existentes.
- Registrar decisões e resultados.

**Autonomia alta para auditoria, experimentação, criação de protótipos locais, refinamento de assets e testes reversíveis.**

---

### 11. PRIMEIRA AÇÃO

Não comece criando novos mapas.

Execute nesta ordem:

1. Auditoria visual e técnica.
2. Diagnóstico específico de personagens e Digimon.
3. Diagnóstico específico dos mapas.
4. Diagnóstico dos painéis e da interface.
5. Plano de correção com prioridades e exemplos visuais.
6. Protótipo de personagem e Digimon.
7. Reconstrução da área-piloto da floresta.
8. Revisão da interface.
9. Demonstração integrada.
10. Homologação.

**A primeira entrega não é um relatório bonito: é uma transformação visual perceptível no jogo.**

A meta é construir um padrão artístico de qualidade e consistência. Somente depois de aprovado começaremos a produzir novas regiões, mesmo que isso leve mais tempo.