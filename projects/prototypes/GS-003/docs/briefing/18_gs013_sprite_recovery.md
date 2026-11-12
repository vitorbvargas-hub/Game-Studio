# GS-013 — DIGIMON SPRITE & ANIMATION RECOVERY
## Busca global, catalogação, extração e integração de sprites

Você é responsável por resolver uma das principais dificuldades do Game Studio: encontrar sprites de Digimon com qualidade e animações suficientes para o MMORPG.

**PRIORIDADE: encontrar recursos existentes antes de tentar desenhar todos os Digimon do zero.**

Não limite a pesquisa a um jogo, geração, console ou resolução. Aceite qualquer versão de Digimon como referência, desde que a origem e os direitos sejam identificados.

### 1. PESQUISA OBRIGATÓRIA

Investigue profundamente as seguintes fontes:

1. Digimon World DS / Dawn / Dusk Animated Sprites:
https://github.com/E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites

2. Digimon World Sprite Manager:
https://github.com/netraular/DigimonWorldSpriteManager

3. Digimon Sprite Collection:
https://github.com/kaisadilla/digimon-sprite-collection

4. DIM Modifier Resources:
https://dim.digitallink.games/resources?category=digimon

5. The Spriters Resource — Digimon World DS:
https://www.spriters-resource.com/ds_dsi/dgmnworldds/

6. The Spriters Resource — Digimon World Dawn/Dusk:
https://www.spriters-resource.com/ds_dsi/digimonworldds2/

7. Digimon / Pendulum Color Sprite Database:
https://dmc-sprite-database.vercel.app/

8. Aderek Digimon Database:
https://aderekart.github.io/

9. Digimon Assets Vital Bracelet:
https://github.com/kongtaehun/digimon-assets-VB

Não se limite a essas fontes. Procure também em comunidades de pixel art, repositórios públicos, fóruns de fãs, projetos de preservação e bancos de assets.

### 2. PESQUISAR TODAS AS GERAÇÕES E PLATAFORMAS

Investigar sprites de:

- Digimon World 1, 2, 3 e Next Order.
- Digimon World DS.
- Digimon Story Dawn e Dusk.
- Digimon Story Cyber Sleuth e Hacker's Memory.
- Digimon Re:Digitize e Decode.
- Digimon Masters Online.
- Digimon Battle.
- Digimon Rumble Arena.
- Digimon Adventure PSP.
- Digimon Vital Bracelet.
- Digimon Pendulum.
- Digimon games para Game Boy, GBA, DS, PSP e outras plataformas.

Também pesquisar spritesheets produzidos por artistas independentes, desde que tenham autorização de uso compatível com o projeto.

### 3. NÃO PROCURAR APENAS IMAGENS INDIVIDUAIS

O objetivo é encontrar, preferencialmente:

- Spritesheets completos.
- GIFs animados.
- Sequências PNG.
- Animações de idle.
- Animações de caminhada.
- Animações de ataque.
- Animações de vitória.
- Animações de dano.
- Animações de habilidades.
- Sprites em múltiplas direções.
- Sprites isométricos.
- Sprites com fundo transparente.

Uma imagem estática de Agumon não resolve o problema de animação.

Priorizar recursos que contenham múltiplos frames e movimentos completos.

### 4. CATÁLOGO CENTRAL DE ASSETS

Criar uma biblioteca pesquisável, sem duplicar arquivos.

Cada Digimon deverá ter:

- Nome oficial.
- Estágio evolutivo.
- Jogo de origem.
- Plataforma.
- Autor ou fonte.
- Link original.
- Formato.
- Resolução.
- Quantidade de frames.
- Direções disponíveis.
- Animações disponíveis.
- Fundo transparente ou não.
- Qualidade visual.
- Direitos de uso.
- Situação de integração.

Criar os arquivos:

- digimon_sprite_catalog.json
- digimon_animation_catalog.json
- digimon_asset_sources.json
- digimon_asset_licenses.json
- digimon_missing_sprites.json
- digimon_sprite_quality_report.md

Criar uma galeria visual para navegar, comparar e reproduzir os sprites animados.

### 5. EXTRAÇÃO E RECONSTRUÇÃO DE ANIMAÇÕES

Investigar ferramentas de extração e organização.

Avaliar especialmente o Digimon World Sprite Manager.

Verificar se é possível:

- Baixar spritesheets.
- Separar automaticamente os frames.
- Remover fundos sem destruir os contornos.
- Identificar a posição de cada frame.
- Montar animações.
- Gerar spritesheets padronizados.
- Criar previews animados.
- Exportar no formato compatível com a engine atual.

Não assumir que todos os spritesheets possuem a mesma organização.

Criar ferramentas de inspeção e correção manual para casos em que a extração automática falhar.

### 6. PADRONIZAÇÃO PARA NOSSO JOGO

Não deformar os sprites para encaixá-los artificialmente no padrão atual.

Primeiro avaliar:
- Proporções.
- Resolução.
- Direções.
- Número de frames.
- Estilo artístico.
- Velocidade da animação.
- Transparência.
- Alinhamento.
- Ponto de ancoragem.

Depois propor um padrão de integração compatível com o jogo.

Não misturar sprites de estilos visuais incompatíveis sem um processo de adaptação artística.

### 7. PRIORIZAÇÃO DOS DIGIMON

Começar pelos Digimon já utilizados no jogo e pelos mais conhecidos.

Criar uma matriz de cobertura:

| Digimon | Sprite | Idle | Walk | Attack | Hurt | Direções |
|---|---|---|---|---|---|---|

Identificar quais espécies possuem:
- Animação completa.
- Animação parcial.
- Apenas sprite estático.
- Nenhum recurso encontrado.

Priorizar os recursos mais completos.

### 8. QUANDO NÃO EXISTIR SPRITE

Não abandonar uma espécie porque não encontramos uma versão animada.

Criar um fluxo alternativo:

1. Buscar outras versões do mesmo Digimon.
2. Buscar sprites de jogos diferentes.
3. Buscar animações de outras plataformas.
4. Verificar se existe arte oficial ou material de referência autorizado.
5. Produzir um novo sprite com PixelLab ou fluxo de pixel art.
6. Criar animações específicas.
7. Submeter ao GAME-ART-DIRECTOR.

Não usar geração automática para simplesmente transformar uma imagem estática em uma animação ruim.

### 9. INTEGRAÇÃO COM O GAME STUDIO

Integrar a biblioteca ao:
- DIGIMON-ARTIST.
- SPRITE-ANIMATOR.
- ANIMATION-DIRECTOR.
- ASSET-GENERATOR.
- VISUAL-QA.
- GAME-INTEGRATOR.

Os agentes deverão consultar o catálogo antes de produzir um Digimon do zero.

### 10. DIREITOS AUTORAIS

Classificar cada recurso como:

- Original com autorização documentada.
- Licença aberta verificada.
- Uso permitido mediante condições.
- Uso pessoal/fan project.
- Direitos desconhecidos.
- Conteúdo protegido sem autorização comercial.

Não assumir que um repositório público autoriza uso comercial.

Não publicar assets protegidos sem autorização.

Quando necessário, usar os sprites apenas como referência de estudo e produzir assets originais licenciados.

### 11. RELAÇÃO COM OS MAPAS

A pesquisa também deverá investigar recursos de mapas:

- Tilesets de floresta.
- Tilesets de cavernas.
- Tilesets de cidades.
- Tilesets de praias.
- Vegetação.
- Árvores.
- Água.
- Objetos ambientais.
- Backgrounds.
- Elementos de primeiro e segundo plano.

Catalogar os recursos separadamente dos sprites de Digimon.

Não utilizar mapas completos de jogos protegidos como assets finais.

### 12. ENTREGA OBRIGATÓRIA

Quero uma entrega prática, não apenas uma lista de links.

Apresentar:

1. Fontes encontradas.
2. Quantidade de Digimon catalogados.
3. Quantidade de spritesheets encontrados.
4. Quantidade de animações utilizáveis.
5. Digimon com animação completa.
6. Digimon com animação parcial.
7. Digimon sem recursos encontrados.
8. Galeria de previews animados.
9. Ferramentas de extração testadas.
10. Recursos de mapas encontrados.
11. Restrições de licenciamento.
12. Plano de integração.

Produzir uma demonstração com pelo menos cinco Digimon de origens diferentes, desde que os recursos encontrados permitam.

Mostrar os frames e as animações funcionando dentro de um preview e, posteriormente, na engine do jogo.

### 13. EXECUÇÃO

Começar imediatamente pela pesquisa e catalogação.

Não interromper o trabalho do GS-010 de qualidade visual.

Não substituir assets atuais automaticamente.

Não comprar ferramentas ou créditos.

Não publicar em produção.

Preservar os arquivos originais e manter histórico das conversões.

**INSTRUÇÃO FINAL: NÃO ACEITE COMO RESPOSTA QUE NÃO EXISTEM SPRITES. PESQUISE OUTRAS VERSÕES, PLATAFORMAS, JOGOS E FORMATOS. PRIMEIRO ENCONTRE, ORGANIZE E TESTE O QUE JÁ EXISTE. DEPOIS PRODUZA SOMENTE O QUE REALMENTE ESTIVER FALTANDO.**