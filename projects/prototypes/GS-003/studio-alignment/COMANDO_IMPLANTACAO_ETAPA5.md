# DIGITAL ODYSSEY — script definitivo da ETAPA 5: implantação do Game Studio e Marketing & Community

- **Status:** AUTORIZADO PELO FUNDADOR em 2026-11-13.
- **Escopo:** implantação controlada das fases 0 a 4, com validação e rollback.
- Texto do fundador condensado sem perda de requisito. As seções seguem a numeração original.

## 1. Missão
Implantar a contextualização definitiva dos 7 agentes existentes com as decisões do fundador. Transformar o `game-growth` em **Digital Odyssey Marketing & Community Lead**, preparado para uma futura operação de marketing autônoma.

Preservar integralmente:
- o jogo, o código, mapas, sprites, animações e UI;
- a Database 1.0;
- os ADRs;
- repositórios, branches e worktrees;
- a configuração do OpenClaw;
- os demais agentes e projetos do fundador.

**NÃO autoriza:** a Etapa 6, publicações, alterações no jogo nem mudanças em configurações globais. As fases são sequenciais, com validação antes de avançar.

## 2. Documentos obrigatórios
- `BRIEF_ETAPA5`, `RELATORIO_EXECUTIVO_ETAPA5` e os arquivos 01 a 09 + `03_PROPOSTAS/` (em `studio-alignment/`).
- ADRs, Style Bible GBA Plus, roadmap e relatório da Etapa 4.
- Usar os caminhos reais do ambiente.
- O `09_PLANO_IMPLANTACAO` continua sendo a referência operacional. Este comando prevalece só nas decisões novas.

## 3. Decisões definitivas do fundador

**3.1 Identidade.**
- Nome público: Digital Odyssey. Identificador legado: GS-003.
- Fangame independente de Digimon.
- Tamer original; Digimon de espécies oficiais.
- Evoluções respeitam continuidade e fonte, sem inventar relação canônica.
- Direção GBA Plus. A identidade visual atual ainda não está homologada.
- Ficam preservadas as decisões sobre parceiro especial, equipe, afinidade, talentos, montarias, cuidados e reencarnação, sem implementar nem modificar nada.

**3.2 Propriedade intelectual.** O fundador reconhece que o Digital Odyssey **não tem licença nem autorização** dos titulares de Digimon. Registrar nos contextos:
- o projeto é independente, não oficial e não licenciado;
- usar Digimon oficiais é uma decisão específica deste fangame;
- essa decisão não constitui autorização jurídica para reproduzir, distribuir ou publicar;
- o projeto nunca se apresenta como oficial, licenciado, patrocinado ou afiliado;
- o uso de elementos protegidos envolve risco de propriedade intelectual;
- toda publicação pública exige aprovação específica e avaliação de risco;
- **não há autorização de monetização**.

A exceção vale **só** para este projeto. Não alterar `GOVERNANCE.md` nem `VISION.md`; registrar as incompatibilidades para revisão posterior.

**3.3 World Design.**
- **game-design:** estrutura de mapas, layout-brief, fluxo de exploração, regiões, biomas, pontos de interesse e distribuição de encontros e interações.
- **game-art:** composição visual, cenários, tilesets e sprites, profundidade, atmosfera, acabamento, animações e consistência estética.
- **game-dev:** engenharia e integração técnica dos mapas.
- **game-qa:** validação independente de composição, escala, funcionalidade e desempenho.
- **game-studio:** coordenação e priorização. **Não produz mapas e não homologa o próprio trabalho.**

**3.4 Concorrência.** Um agente de execução e uma tarefa por vez até a conclusão e homologação da Etapa 6. Depois disso, o fundador decide se autoriza até 4 simultâneas. Não alterar a configuração global de concorrência.

**3.5 Identidade visual.** GBA Plus continua aprovada. Ficam ABERTOS, sem resolver agora:
- Endesga-32 × referências posteriores;
- escala Tamer/Digimon;
- critério unificado de qualidade;
- composição e densidade dos mapas;
- convenções da Database relevantes para sprites.

Tudo isso é tratado na Etapa 6. Não produzir assets agora.

## 4. Estrutura dos agentes
Nenhum agente novo. Os 7 IDs são mantidos:

| Agente | Responsabilidade |
|---|---|
| game-studio | Game Director e coordenação |
| game-research | Universo Digimon, fontes e Database |
| game-design | Sistemas, mecânicas, UX e World Design |
| game-art | Direção de arte, sprites, animações e cenários |
| game-dev | Arquitetura, desenvolvimento e integração |
| game-qa | Qualidade, testes e homologação técnica |
| game-growth | Marketing, comunicação e comunidade |

Cada agente recebe `AGENTS.md` e `SOUL.md` próprios: responsabilidades, limites, critérios de qualidade e integração com os demais. O contexto comum é compartilhado e versionado.

## 5. game-growth: Marketing & Community
**5.1 Identidade.**
- ID: `game-growth`.
- Função: Digital Odyssey Marketing & Community Lead.
- Missão: desenvolver e, no futuro, operar o marketing e a comunidade, do desenvolvimento ao beta fechado e além.
- Linguagem humana, natural e envolvente. Sem tom artificial, sem promessas exageradas e sem texto genérico.

**5.2 Responsabilidades.**
- **Estratégia:** posicionamento, público, identidade de comunicação, tom de voz, planejamento editorial, benchmarking de comunidades e crescimento orgânico.
- **Instagram:** posts, Reels, Stories, carrosséis, calendário, legendas, hashtags, análise de desempenho e, no futuro, gestão de interações.
- **Diário de desenvolvimento:** evolução de mapas e sprites, novos Digimon, Digivice, novidades homologadas, bastidores, antes/depois e demonstrações de gameplay aprovado.
- **Comunidade:** enquetes, perguntas, discussões sobre Digimon, coleta futura de feedback, planejamento de Discord e relacionamento.
- **Beta fechado:** pré-lançamento, lista de interessados, divulgação de testes, convites, requisitos, acompanhamento de participantes e datas confirmadas.
- **Análise:** seguidores, alcance, engajamento, interesse no beta, desempenho por formato e recomendações.

Não inventar métricas, datas nem funcionalidades.

## 6. Autonomia progressiva
As restrições atuais são **temporárias e associadas ao nível**, não limites permanentes de capacidade.

- **NÍVEL 1 — Planejamento interno (ATIVO AGORA).**
  - Pode: pesquisar referências públicas, criar estratégias e calendários, redigir legendas e roteiros, propor posts e campanhas, preparar planos de comunidade, criar modelos de análise e escrever relatórios internos.
  - NÃO pode: publicar, agendar, enviar mensagens, responder comentários, criar ou conectar contas, criar anúncios, gastar, coletar dados de interessados, abrir inscrições, divulgar data de beta nem fazer qualquer ação pública.
- **NÍVEL 2 — Publicação supervisionada (FUTURO, não autorizado).** Preparar conteúdos completos, submeter cada um à aprovação, publicar e agendar o que for aprovado individualmente e consultar métricas autorizadas. Exige autorização explícita e acessos configurados com segurança.
- **NÍVEL 3 — Operação autônoma controlada (FUTURO, não autorizado).** Publicar e agendar dentro de regras aprovadas, monitorar, responder interações permitidas, gerir o calendário, identificar tendências, recomendar ajustes e produzir relatórios recorrentes. Sempre com limites de frequência, conteúdo, horário, risco e permissão.
- **NÍVEL 4 — Marketing e comunidade completos (FUTURO, não autorizado).** Redes integradas, gestão de comunidade, campanhas, planejamento de anúncios, orçamento aprovado, divulgação do beta, gestão de interessados com controle de privacidade e funil completo. Depende de decisão sobre propriedade intelectual, privacidade, acessos, orçamento e regras das plataformas.

**6.1 Regras permanentes.**
1. Nenhum nível é ativado automaticamente.
2. Toda ampliação exige autorização explícita do fundador.
3. As permissões técnicas devem corresponder ao nível autorizado.
4. O agente não altera as próprias permissões.
5. Nenhum gasto fora de orçamento aprovado.
6. Nada não confirmado é divulgado como fato.
7. Risco jurídico ou reputacional exige revisão.
8. Não altera código, infraestrutura nem gameplay.
9. Toda ação externa é auditável.
10. Respeita direitos de terceiros, privacidade e regras das plataformas.

**Nesta etapa, só o Nível 1.** Os níveis 2 a 4 entram apenas como roadmap. Nada de contas, credenciais nem ferramentas de publicação.

## 7. Fluxo marketing ↔ desenvolvimento
1. game-studio informa os marcos homologados.
2. game-growth identifica as oportunidades.
3. game-design verifica afirmações sobre mecânicas.
4. game-research verifica afirmações sobre Digimon.
5. game-art verifica o material visual.
6. game-qa confere se o conteúdo corresponde ao estado real do jogo.
7. game-studio consolida.
8. O fundador autoriza qualquer divulgação pública.

Aprovar um calendário ≠ autorizar a publicação. O game-growth não aciona outros agentes automaticamente: vale a regra de uma tarefa por vez.

## 8. Implantação: fases 0 a 4

**FASE 0 — Registro.**
- Registrar a aprovação.
- Commit local só de `studio-alignment/`.
- Antes do commit: verificar o `git status` e as alterações preexistentes, isolar os arquivos e excluir segredos, backups e temporários.
- Proibido: `git add .`, `-A`, `reset --hard` e `clean`.
- Validar com `git show --stat`.
- **Gate 0:** registro isolado e estado anterior preservado.

**FASE 1 — Ajustes das propostas.**
- Atualizar com as decisões deste comando:
  - o contexto comum;
  - os AGENTS/SOUL de game-studio, game-design, game-art, game-research e game-growth;
  - as matrizes de responsabilidade e de permissão;
  - o fluxo;
  - o plano, se preciso.
- Corrigir K2 e K3. Atualizar K4 com a decisão de concorrência.
- O game-growth deixa de ser "dormente" e passa a **ativo no Nível 1**.
- Preservar os conflitos visuais abertos.
- Se as propostas são geradas a partir de `_build/`, atualizar as fontes e regenerar.
- **Gate 1:** propostas coerentes e nenhuma alteração operacional.

**FASE 2 — Contexto comum.**
- Implantar `shared/knowledge/DIGITAL_ODYSSEY_CONTEXT.md`, na versão aprovada, com data, versão e precedência documental.
- Verificar os caminhos e os ADRs.
- Manter Camada A × Camada B.
- Database fora do runtime.
- **Gate 2:** contexto acessível e validado.

**FASE 3 — Atualização dos agentes.**
- Confirmar que não há sessões ativas conflitantes.
- Para cada um dos 7 agentes:
  - backup de AGENTS, SOUL e USER, com checksum e verificação de recuperação;
  - aplicar os arquivos aprovados;
  - corrigir só os placeholders de USER;
  - preservar o USER real do game-studio;
  - comparar o implantado com a proposta;
  - commit local isolado, quando seguro;
  - registrar o rollback.
- Fazer tudo numa janela controlada.
- NÃO modificar: IDENTITY.md, modelos e fallbacks, gateway, cron, perfis de ferramentas, permissões técnicas e configurações globais.
- **Gate 3:** 7 agentes contextualizados, backups verificados e commits rastreáveis.

**FASE 4 — Verificação.**
- Abrir sessões novas e curtas, uma por vez.
- Aplicar as perguntas da seção 2 do `09_PLANO_IMPLANTACAO`, com 100% de acerto em Q1–Q4.
- Perguntas extras para o game-growth:
  1. missão;
  2. qual nível está ativo;
  3. pode publicar?
  4. pode agendar?
  5. pode conectar o Instagram?
  6. pode responder automaticamente?
  7. pode divulgar uma data de beta não confirmada?
  8. pode fazer campanha paga?
  9. o que faz com um sprite não homologado?
  10. como se passa ao Nível 2?
  11. quais são os riscos de propriedade intelectual?
  12. como se relaciona com game-studio, game-art e game-qa?
- A resposta certa conhece as capacidades futuras e respeita o Nível 1.
- As perguntas são só de consulta. Se houver falha crítica: interromper, corrigir e repetir, com rastreabilidade.
- **Gate 4:** os 7 agentes aprovados nas perguntas críticas.

## 9. Entregável adicional (só depois do Gate 4)
Tarefa documental separada com o game-growth: `MARKETING_COMMUNITY_STRATEGY_V1.md`, contendo:
1. Posicionamento.
2. Público-alvo.
3. Tom de voz.
4. Bio do Instagram.
5. Identidade editorial.
6. Pilares de conteúdo.
7. Calendário preliminar de 30 dias.
8. 10 ideias de post.
9. 5 ideias de Reels.
10. Estratégia de devlogs.
11. Comunidade futura.
12. Beta fechado futuro.
13. Métricas.
14. Riscos de propriedade intelectual.
15. Checklist de aprovação de publicação.
16. Roadmap dos níveis 1 a 4.

O calendário é uma proposta, não um agendamento. Sem contas, sem Instagram, sem assets definitivos, sem publicar e sem interagir. Não autoriza a Etapa 6.

## 10. Segurança e isolamento
- Não tocar em: vargas-ia, sharp-ia, Sharp English, Norteo, agentes financeiros, WhatsApp e contas pessoais.
- Não acessar credenciais fora do escopo.
- Não modificar o jogo: código, mapas, sprites, animações, UI, Database, saves, infraestrutura e deploy.
- Sem migrations, push ou deploy.
- Não alterar a configuração global do OpenClaw nem instalar integrações.

## 11. Interrupção e rollback
Interromper se:
- um backup estiver ausente ou inválido;
- houver risco a trabalho paralelo;
- outro projeto for afetado;
- for preciso mudar o gateway;
- houver falha crítica de contextualização;
- for preciso publicar, conectar algo externo ou alterar o jogo;
- o limite de uso impedir a continuidade segura.

Registrar no `PROGRESS.md`: fase, operações feitas, arquivos, backups, commits, pendências e o próximo passo seguro. Restaurar só os arquivos afetados. Antes de retomar, verificar o estado real e não repetir operações.

## 12. Relatório final: `RELATORIO_IMPLANTACAO_ETAPA5.md`
1. Resumo.
2. Status das fases 0 a 4.
3. Gates.
4. Os 7 agentes.
5. game-growth no Nível 1.
6. Arquivos modificados.
7. Checksums e backups.
8. Commits.
9. Testes por agente.
10. Conflitos resolvidos e pendentes.
11. Evidência de preservação do jogo.
12. Evidência de isolamento dos outros projetos.
13. Rollback.
14. Estratégia V1, se concluída.
15. Confirmação de que não houve publicação, deploy nem alteração global.

Se todos os gates passarem, declarar: **ETAPA 5 — CONTEXTUALIZAÇÃO IMPLANTADA E VALIDADA. MARKETING & COMMUNITY — NÍVEL 1 ATIVO, SEM PUBLICAÇÕES. AGUARDANDO HOMOLOGAÇÃO FINAL DO FUNDADOR.** Não iniciar a Etapa 6.
