# GS-012 — WILD ENCOUNTER SYSTEM
## Sistema de encontros selvagens de Digimon

**OBJETIVO:** Implementar um sistema de encontros selvagens inspirado na exploração de Pokémon, adaptado ao universo Digimon e à proposta de MMORPG do nosso jogo.

Este comando complementa os documentos GS-008, GS-009, GS-010 e GS-011.

Não substitua decisões anteriores nem interrompa o trabalho de qualidade visual. Integre este sistema ao laboratório da floresta-piloto.

---

### 1. CONCEITO PRINCIPAL

O jogador deve poder explorar livremente os mapas sem precisar encontrar dezenas de Digimon andando continuamente pelo cenário.

Ao caminhar por áreas específicas, como grama alta e vegetação densa, poderá encontrar Digimon selvagens aleatoriamente.

O sistema deverá combinar dois tipos de encontro:

**A. Encontros aleatórios**
- O jogador caminha pela vegetação.
- O sistema verifica a possibilidade de encontro.
- Um Digimon é selecionado conforme as regras da região.
- O encontro é apresentado com animação, efeito visual e sonoro.
- O jogador entra em combate.

**B. Encontros visíveis**
- Alguns Digimon aparecem fisicamente no mapa.
- Podem permanecer parados, caminhar ou realizar pequenas animações.
- O jogador pode se aproximar e interagir.
- Alguns são raros, especiais, agressivos ou ligados a missões.
- Nem todos precisam iniciar combate imediatamente.

A combinação dos dois sistemas deve criar exploração e sensação de descoberta.

### 2. SISTEMA DE ENCONTROS ALEATÓRIOS

Criar um sistema configurável com:

- Probabilidade de encontro por região.
- Probabilidade por tipo de terreno.
- Quantidade de passos ou tempo de exposição à vegetação.
- Intervalo mínimo entre encontros.
- Proteção contra encontros consecutivos excessivos.
- Possibilidade de não encontrar nada.
- Tabela de espécies por região.
- Peso de aparição por espécie.
- Raridade.
- Nível mínimo e máximo.
- Condições especiais de aparição.

Evitar que o jogador seja interrompido a cada poucos passos.

Criar parâmetros ajustáveis para balanceamento, sem precisar alterar código a cada mudança.

### 3. TABELA DE DIGIMON POR REGIÃO

Cada região deverá ter sua própria tabela de encontros.

Exemplo ilustrativo para a floresta:

- Digimon comuns: alta frequência.
- Digimon incomuns: frequência intermediária.
- Digimon raros: baixa frequência.
- Digimon extremamente raros: condições especiais.
- Digimon exclusivos: determinados horários, clima ou locais.

Não inventar espécies aleatoriamente. Utilizar a base de dados oficial do projeto e respeitar os Digimon já cadastrados.

Cada registro deverá permitir configurar:

- Digimon.
- Região.
- Terreno.
- Raridade.
- Peso de aparição.
- Faixa de nível.
- Horário.
- Clima.
- Condições especiais.
- Possibilidade de encontro visível ou aleatório.

Não misturar requisitos de evolução com regras de aparição.

### 4. VARIAÇÕES AMBIENTAIS

Preparar suporte para:

- Dia e noite.
- Chuva.
- Neblina.
- Clima especial.
- Áreas específicas.
- Eventos temporários.
- Missões.
- Progressão do jogador.

Exemplo: uma espécie pode aparecer somente à noite, enquanto outra pode ter maior chance durante a chuva.

Essas regras devem ser configuráveis e não obrigatórias para todos os Digimon.

### 5. ENCONTROS VISÍVEIS NO MAPA

Criar um sistema para posicionar Digimon selvagens em pontos específicos.

Cada encontro visível deverá permitir:

- Definir espécie.
- Definir posição.
- Definir comportamento.
- Definir raio de detecção.
- Definir se foge, ignora ou persegue o jogador.
- Definir se pode ser enfrentado.
- Definir se reaparece.
- Definir condições para aparecer.

Não colocar Digimon em todos os espaços do mapa.

O cenário deve continuar bonito, explorável e com espaço visual.

### 6. EXPERIÊNCIA DO ENCONTRO

O encontro precisa ter acabamento visual.

Para encontros aleatórios:

1. Detectar a entrada ou movimentação na área de encontro.
2. Verificar as condições e probabilidades.
3. Selecionar o Digimon.
4. Executar uma breve apresentação visual e sonora.
5. Iniciar o combate.

Para encontros visíveis:

1. O jogador identifica o Digimon no mapa.
2. Aproxima-se.
3. O Digimon apresenta comportamento próprio.
4. O jogador interage ou inicia o combate conforme as regras.

Não utilizar transições bruscas ou telas genéricas.

A animação de apresentação deve respeitar a direção artística estabelecida no GS-010.

### 7. COMBATE E INTEGRAÇÃO

Auditar o sistema de combate existente antes de implementar.

Reutilizar:
- Sistema atual de combate.
- Dados dos Digimon.
- Atributos e níveis.
- Habilidades.
- Evoluções.
- Equipe do jogador.
- Inventário.
- Recompensas.
- Progressão.
- Missões.

Não criar um segundo sistema de combate independente.

Avaliar duas alternativas:

**Alternativa A — Combate no próprio mapa:** o encontro acontece e o combate começa no cenário atual.

**Alternativa B — Instância de combate:** o encontro inicia uma instância visual curta, preservando a localização e o estado do jogador.

Comparar as duas alternativas em qualidade visual, desempenho, experiência e compatibilidade com o sistema atual.

Recomendar a melhor e implementar primeiro no ambiente de desenvolvimento, sem substituir o combate existente.

### 8. RECOMPENSAS E PROGRESSÃO

Integrar os encontros com os sistemas já existentes:

- Experiência.
- Itens.
- Drops.
- Missões.
- Registro de Digimon encontrados.
- Condições de captura ou recrutamento, se essa mecânica existir ou for aprovada.
- Estatísticas de exploração.

Não inventar mecânicas de captura ou recrutamento sem verificar o planejamento atual.

### 9. INTERFACE E FEEDBACK

Criar feedback visual e sonoro para:

- Início do encontro.
- Identificação do Digimon.
- Raridade.
- Início do combate.
- Vitória e derrota.
- Registro de descoberta.
- Encontro especial.

A interface deve seguir o padrão artístico do GS-010.

Não transformar a exploração em uma sequência de janelas e notificações.

### 10. ARQUITETURA E MULTIPLAYER

Como o projeto é um MMORPG, verificar:

- Quem calcula os encontros: cliente ou servidor.
- Como evitar que jogadores manipulem probabilidades.
- Como impedir duplicação de recompensas.
- Como controlar encontros simultâneos.
- Como compartilhar ou individualizar encontros.
- Como sincronizar Digimon visíveis.
- Como evitar que dois jogadores recebam indevidamente o mesmo encontro individual.
- Como tratar desconexão durante o encontro.

A seleção do Digimon, validação do encontro e recompensas devem ser protegidas pelo servidor, conforme a arquitetura existente.

Não presumir que o jogo já possui infraestrutura multiplayer completa. Auditar antes.

### 11. LABORATÓRIO DE TESTES

Implementar primeiro na floresta-piloto.

Testar:

1. Caminhar pela vegetação sem encontrar Digimon.
2. Encontrar Digimon comuns.
3. Encontrar Digimon raros.
4. Encontrar Digimon em horários diferentes.
5. Encontrar Digimon sob condições climáticas distintas.
6. Interagir com Digimon visíveis.
7. Iniciar e concluir combates.
8. Sair e retornar à região.
9. Testar encontros simultâneos de jogadores, se multiplayer estiver funcional.
10. Testar desempenho e repetição de encontros.

Criar ferramentas internas de debug para simular encontros e ajustar probabilidades sem alterar manualmente os dados de produção.

### 12. ENTREGA OBRIGATÓRIA

Apresentar:

- Documento de arquitetura.
- Regras de encontro.
- Tabelas configuráveis da floresta.
- Digimon utilizados no piloto.
- Demonstração dos encontros aleatórios.
- Demonstração dos encontros visíveis.
- Vídeo de gameplay.
- Demonstração do combate.
- Testes de balanceamento.
- Problemas encontrados.
- Comparação da experiência com e sem encontros.

### 13. LIMITES DE ESCOPO

- Não produzir novos mapas em escala.
- Não preencher a floresta com dezenas de Digimon.
- Não criar outro sistema de combate.
- Não duplicar banco de dados.
- Não alterar funcionalidades existentes sem necessidade.
- Não publicar em produção sem aprovação.
- Não comprar créditos ou serviços.
- Preservar assets e backups.

### 14. ORDEM DE EXECUÇÃO

1. Auditar sistemas atuais.
2. Propor arquitetura de encontros.
3. Comparar as alternativas de combate.
4. Preparar tabelas configuráveis.
5. Implementar encontros aleatórios.
6. Implementar encontros visíveis.
7. Integrar ao combate.
8. Refinar animações e efeitos.
9. Testar e balancear.
10. Apresentar demonstração para homologação.

**INSTRUÇÃO FINAL:** implemente o sistema na floresta-piloto, priorizando qualidade visual, equilíbrio e experiência de exploração. Não amplie a produção de mapas até a aprovação do laboratório visual.