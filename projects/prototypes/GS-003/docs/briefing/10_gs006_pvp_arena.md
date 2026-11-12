# GS-006 — DIGIMON PVP ARENA
## Sistema competitivo com equipes próprias, combate automático e manual

Você é responsável por projetar e implementar o sistema de arena PvP do MMORPG Digimon.

A arena deve ser integrada ao mundo e aos sistemas de progressão existentes.

Não desenvolver um minigame desconectado da experiência principal.

# 1. REFERÊNCIA PRINCIPAL

Vídeo enviado pelo usuário:

https://www.youtube.com/watch?v=nVY9eDfpWtQ

Analisar o vídeo integralmente antes de definir a implementação.

Identificar:
- Formato da arena.
- Perspectiva.
- Organização dos participantes.
- Quantidade de Digimons.
- Interface.
- Seleção de equipes.
- Movimentação.
- Ataques.
- Habilidades.
- Efeitos.
- Regras.
- Condições de vitória.
- Duração.
- Recompensas.

Não inventar características do vídeo que não tenham sido observadas.

Complementar a pesquisa com:
- Digimon Masters Online.
- Digimon World: Next Order.
- Cyber Sleuth.
- Outros sistemas competitivos da franquia.

# 2. PRINCÍPIO FUNDAMENTAL — DIGIMONS PRÓPRIOS

O jogador deverá utilizar exclusivamente Digimons pertencentes à sua conta.

Não haverá:
- Equipes pré-definidas.
- Digimons emprestados.
- Personagens de demonstração.
- Equipes padronizadas que substituam a coleção real.

A equipe deverá ser formada a partir dos Digimons conquistados durante a jornada.

Os Digimons devem manter:
- Identidade.
- Evolução.
- Nível.
- Status.
- Treinamento.
- Habilidades.
- Equipamentos.
- Melhorias.

# 3. SELEÇÃO DE EQUIPE

Ao entrar na arena:

1. Consultar os Digimons reais da conta.
2. Mostrar os Digimons elegíveis.
3. Exibir informações completas.
4. Permitir escolher a equipe.
5. Permitir salvar composições.
6. Permitir editar antes da partida.

Mostrar:
- Nome.
- Sprite.
- Estágio.
- Nível.
- HP.
- Status.
- Atributos.
- Elementos.
- Habilidades.
- Equipamentos.
- Evoluções.
- Treinamento.

A quantidade de integrantes por equipe será definida após a análise do vídeo e do sistema de combate. Não assumir uma quantidade sem justificativa.

# 4. DOIS MODOS DE PvP

O sistema deve oferecer duas modalidades independentes.

## MODO A — PvP AUTOMÁTICO

O jogador monta sua equipe e configura as estratégias.

O sistema executa automaticamente o combate.

Permitir configurar:

- Prioridade de alvos.
- Prioridade de habilidades.
- Estratégia ofensiva.
- Estratégia defensiva.
- Uso de habilidades especiais.
- Condições de suporte e cura.
- Formação.
- Ordem de atuação.
- Regras de utilização de recursos.

O jogador acompanha:
- Animações.
- Ataques.
- Dano.
- Efeitos.
- HP.
- Habilidades.
- Resultado.

A estratégia preparada pelo jogador deve influenciar o resultado.

Não transformar o combate em um resultado aleatório ou decidido apenas pelo nível.

## MODO B — PvP MANUAL

O jogador controla as ações durante a partida.

Permitir:
- Selecionar Digimon ativo.
- Selecionar adversário.
- Escolher ataques.
- Utilizar habilidades.
- Movimentar Digimons, se o formato permitir.
- Utilizar suporte.
- Reagir às ações adversárias.
- Administrar cooldowns.
- Executar estratégias em tempo real.

A interface deve oferecer comandos intuitivos e feedback visual.

O controle manual deve valorizar habilidade, leitura da batalha, posicionamento e tempo de reação.

# 5. NÚCLEO DE COMBATE COMPARTILHADO

Criar um motor de regras compartilhado entre os dois modos.

Separar:

- Motor de combate.
- Controlador automático.
- Controlador manual.
- Interface de batalha.
- Validação do servidor.
- Sistema de resultado.

Não duplicar o motor de combate.

O modo automático e o manual devem utilizar as mesmas regras fundamentais de dano, atributos, habilidades, efeitos e cooldowns.

As diferenças devem estar nos controladores e na interação.

# 6. SISTEMA DE STATUS

Utilizar os atributos reais dos Digimons.

Integrar:
- HP.
- SP/MP, conforme o sistema unificado.
- ATK.
- DEF.
- INT.
- SPD.
- Resistências.
- Elementos.
- Habilidades.
- Efeitos.
- Equipamentos.

Não criar atributos artificiais exclusivos da arena.

A pesquisa do GS-005 deverá alimentar este módulo.

# 7. EVOLUÇÃO E PvP

O sistema deve reconhecer a evolução real de cada Digimon.

Considerar:
- Estágio.
- Caminho evolutivo.
- Atributos.
- Habilidades desbloqueadas.
- Treinamento.
- Equipamentos.
- Melhorias.

Não permitir que a arena conceda evoluções automaticamente.

A evolução acontece no sistema principal do MMORPG.

A arena apenas reconhece a condição atual do Digimon.

# 8. MODOS COMPETITIVOS

Projetar:

- PvP amistoso.
- PvP ranqueado automático.
- PvP ranqueado manual.
- Batalhas em dupla.
- Torneios.
- Temporadas.
- Desafios competitivos.

Não implementar todos simultaneamente.

Primeiro entregar o protótipo de uma batalha automática e uma manual.

Depois expandir gradualmente.

# 9. MATCHMAKING

Criar sistema de matchmaking considerando:

- Rating.
- Vitórias.
- Derrotas.
- Faixa de poder.
- Evolução das equipes.
- Níveis.
- Histórico.
- Tempo de espera.

Criar rankings independentes:

- Ranking automático.
- Ranking manual.

Não misturar resultados das duas modalidades.

Evitar confrontos extremamente desbalanceados.

O matchmaking deve equilibrar tempo de espera e qualidade da competição.

# 10. BALANCEAMENTO

O modo automático deve valorizar:
- Composição.
- Sinergia.
- Configuração.
- Escolha de habilidades.
- Estratégia.

O modo manual deve valorizar:
- Execução.
- Posicionamento.
- Tempo de reação.
- Escolha de habilidades.
- Estratégia em tempo real.

Avaliar:
- Normalização opcional de atributos.
- Faixas de poder.
- Restrições de equipe.
- Cooldowns.
- Limites de cura.
- Combinações abusivas.
- Efeitos excessivos.
- Combates intermináveis.

Não normalizar silenciosamente os atributos.

Qualquer regra de normalização deve ser apresentada claramente ao jogador.

# 11. RANKING E RECOMPENSAS

Implementar:

- Rating.
- Vitórias.
- Derrotas.
- Histórico.
- Classificação.
- Divisões.
- Temporadas.
- Recompensas.
- Títulos.
- Conquistas.
- Cosméticos.
- Moedas competitivas.

Evitar recompensas que criem vantagem competitiva permanente e impossível de alcançar por jogadores não participantes.

# 12. INTERFACE DA ARENA

Criar:

- Entrada.
- Seleção de equipe.
- Preparação.
- Busca de adversário.
- Confirmação.
- Tela de batalha.
- HUD.
- Barras de HP.
- Identificação de Digimons.
- Habilidades.
- Cooldowns.
- Temporizador.
- Resultado.
- Ranking.
- Histórico.

A interface deve seguir a direção visual:
- Estrutura do IdleDex.
- Refinamento do Drakantos.
- Identidade Digimon.

# 13. SEGURANÇA E INTEGRIDADE

O servidor deve ser autoridade sobre os resultados.

Validar:
- Propriedade dos Digimons.
- IDs.
- Status.
- Níveis.
- Habilidades.
- Equipamentos.
- Cooldowns.
- Ações.
- Resultados.

Prevenir:
- Manipulação de atributos.
- Duplicação de Digimons.
- Exploits.
- Manipulação de resultados.
- Recompensas duplicadas.
- Desconexões abusivas.
- Bots indevidos.
- Repetição de requisições.

Registrar partidas e resultados.

# 14. ARQUITETURA E INTEGRAÇÃO

Auditar a arquitetura atual antes de implementar.

Reutilizar:
- Usuários.
- Contas.
- Inventário.
- Digimon Database.
- Evolução.
- Treinamento.
- Status.
- Habilidades.
- Equipamentos.
- Combate.
- Banco de dados.

Não duplicar tabelas, serviços ou regras existentes.

O sistema de PvP deve ser modular e preparado para expansão.

# 15. MULTIAGENTES

Distribuir tarefas entre:

GAME-PVP-DESIGNER:
- Regras.
- Modos.
- Fluxos.
- Experiência competitiva.

GAME-COMBAT-ENGINEER:
- Motor de combate.
- Controladores.
- Cálculos.
- Sincronização.

GAME-PVP-BALANCER:
- Equilíbrio.
- Matchmaking.
- Rankings.
- Métricas.

GAME-UI-UX:
- Interfaces.
- HUD.
- Seleção de equipes.
- Experiência.

GAME-QA:
- Testes.
- Exploits.
- Balanceamento.
- Homologação.

O agente principal deve coordenar os agentes e evitar duplicidade.

# 16. ETAPAS DE IMPLEMENTAÇÃO

FASE 1 — PESQUISA
- Analisar o vídeo.
- Estudar arenas da franquia.
- Documentar regras.
- Entregar especificação.

FASE 2 — ARQUITETURA
- Auditar sistemas existentes.
- Definir motor compartilhado.
- Definir controladores.
- Definir integração.

FASE 3 — PROTÓTIPO AUTOMÁTICO
- Seleção de equipe própria.
- Configuração estratégica.
- Batalha automática.
- Resultado.

FASE 4 — PROTÓTIPO MANUAL
- Seleção de equipe própria.
- Comandos.
- Ataques.
- Habilidades.
- Resultado.

FASE 5 — TESTES
- Balanceamento.
- Segurança.
- Sincronização.
- Exploits.
- Desempenho.

FASE 6 — COMPETITIVO
- Matchmaking.
- Ranking.
- Histórico.
- Temporadas.
- Recompensas.

# 17. PRIMEIRA ENTREGA OBRIGATÓRIA

Antes da implementação definitiva, entregar:

1. Análise do vídeo de referência.
2. Comparação com PvP dos jogos Digimon.
3. Especificação do automático.
4. Especificação do manual.
5. Seleção de equipe própria.
6. Regras de combate.
7. Regras de balanceamento.
8. Interface.
9. Arquitetura.
10. Plano de implementação.
11. Testes necessários.

# 18. CRITÉRIOS DE SUCESSO

O jogador deve sentir que está colocando à prova os Digimons que conquistou e desenvolveu durante sua jornada.

Os dois modos devem ser competitivos, justos e divertidos.

A arena deve ser uma extensão da progressão principal do MMORPG.

Não criar equipes pré-definidas.

Não duplicar o sistema de Digimons.

Não implementar regras que contradigam o GS-005.

A prioridade é entregar um PvP integrado, consistente e expansível.