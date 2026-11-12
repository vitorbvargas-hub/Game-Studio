# GS-009 — INSTANCED WORLD & MAP NAVIGATION
## Alteração arquitetural: mundo composto por mapas fechados e conectados

A partir desta instrução, a arquitetura de mundo do MMORPG deve priorizar mapas independentes, fechados e conectados por um sistema central de navegação.

O objetivo é permitir a produção de regiões menores, artesanais, visualmente refinadas e com identidade própria.

### 1. NOVO MODELO DE MUNDO

Não priorizar um mundo contínuo gigantesco.

Adotar:
- Um mapa-múndi de navegação.
- Regiões independentes.
- Mapas fechados e jogáveis.
- Entradas e saídas.
- Pontos de viagem.
- Desbloqueio progressivo.
- Conexões entre regiões.

O jogador abre o mapa, escolhe um destino disponível e viaja até ele.

### 2. MAPA-MÚNDI

Criar uma interface de navegação com:
- Regiões.
- Cidades.
- Florestas.
- Praias.
- Montanhas.
- Cavernas.
- Dungeons.
- Arenas.
- Áreas especiais.

Cada destino deve apresentar:
- Nome.
- Ilustração ou miniatura.
- Descrição.
- Requisitos de desbloqueio.
- Nível recomendado.
- Digimon encontrados.
- Eventos disponíveis.
- Estado de acesso.

O mapa deve ter identidade visual própria, não parecer um menu genérico.

### 3. MAPAS INDEPENDENTES

Cada região será um mapa jogável independente.

O tamanho deve ser definido pelo conteúdo e pela experiência desejada, não por uma dimensão fixa.

Cada mapa terá:
- Ponto de entrada.
- Pontos de saída.
- Colisões.
- Camadas.
- Terreno.
- Vegetação.
- Objetos.
- NPCs.
- Digimon.
- Pontos de spawn.
- Áreas de combate.
- Eventos.
- Elementos ambientais animados.

Dentro do mapa, o jogador terá movimentação livre.

Não transformar a movimentação interna em navegação por cliques.

### 4. SISTEMA DE VIAGEM

Implementar:
- Seleção de destino.
- Verificação de desbloqueio.
- Carregamento da região.
- Posicionamento do personagem.
- Persistência de estado.
- Retorno à região anterior.
- Preservação de progresso.

Quando houver conexão física entre duas regiões, permitir também a transição por portais, saídas ou passagens.

O jogador não precisa retornar ao mapa-múndi para toda transição, quando houver uma conexão direta prevista no design.

### 5. PERSISTÊNCIA

Preservar:
- Estado do personagem.
- Equipe de Digimon.
- Vida e recursos conforme as regras do jogo.
- Inventário.
- Progresso.
- Missões.
- Estado dos NPCs.
- Eventos.
- Regiões desbloqueadas.

Definir corretamente o que permanece entre mapas e o que é reinicializado.

### 6. QUALIDADE VISUAL

A arquitetura de mapas fechados não deve ser utilizada como justificativa para mapas simples.

Pelo contrário: cada mapa deverá receber maior investimento artístico.

Priorizar:
- Composição artesanal.
- Cenários ricos.
- Profundidade.
- Vegetação detalhada.
- Iluminação.
- Sombras.
- Animações ambientais.
- Identidade própria.
- Pontos de interesse.

Cada mapa precisa parecer uma região única do Digimundo.

### 7. INTEGRAÇÃO

Antes de desenvolver, auditar a arquitetura existente.

Não substituir o sistema de movimentação, combate, renderização ou carregamento sem necessidade.

Verificar compatibilidade com o motor atual.

Reaproveitar sistemas existentes.

Não duplicar entidades, inventários ou tabelas de progresso.

### 8. PRIMEIRO PILOTO

Criar:
1. Uma tela de mapa-múndi.
2. Duas regiões desbloqueadas.
3. Uma região bloqueada.
4. Uma região jogável de floresta.
5. Uma região jogável de praia ou costa.
6. Sistema de viagem.
7. Persistência de progresso.
8. Testes de carregamento e retorno.

A floresta será a principal prova de qualidade artística.

### 9. CRITÉRIO DE APROVAÇÃO

O usuário deve conseguir:
- Abrir o mapa.
- Escolher uma região.
- Entrar nela.
- Explorar livremente.
- Encontrar Digimon.
- Combater no próprio mapa.
- Interagir com elementos.
- Abrir novamente o mapa.
- Viajar para outra região.
- Retornar sem perder o progresso.

A qualidade visual continuará subordinada ao GS-008 QUALITY FIRST.

Não acelerar a produção para entregar mais regiões.

Priorizar poucas regiões excelentes em vez de muitas regiões medianas.