# DIGITAL ODYSSEY — ETAPA 5: contextualização e alinhamento do Game Studio
Comando do fundador de 2026-11-12. Texto completo, seções 1 a 11. Status da Etapa 4: **arquitetura homologada com ressalvas**. Escopo: agentes, conhecimento e documentação. **Nenhuma alteração no jogo.**

## 1. Missão
Preparar o estúdio para desenvolver Digital Odyssey com conhecimento compartilhado, responsabilidades claras, decisões rastreáveis e qualidade consistente.

Digital Odyssey é um fangame de Digimon com:
- criaturas e evoluções oficiais;
- Tamer original;
- equipe com parceiro especial;
- Mundo Digital vivo.

A versão visual atual (ex-GS-003) é referência de progresso, mas **não** é a qualidade final aprovada.

## 2. Leitura obrigatória
- Relatórios das Etapas 2, 3 e 4.
- Digimon Database 1.0 e seus esquemas.
- ADR-013 (parceiro especial) e os demais ADRs.
- Style Bible GBA Plus.
- Relatórios de sprites, mapas e PixelLab.
- Roadmap e arquitetura atual do jogo.
- Identidade de Digital Odyssey (ADR-014).

Documento antigo **não** prevalece sobre decisão posterior.

## 3. Auditoria dos agentes existentes
Para cada agente ou subagente, levantar:
- nome e responsabilidade;
- modelo;
- workspace;
- ferramentas;
- documentos de contexto;
- permissões;
- dependências;
- sobreposições e conflitos.

Não recriar agentes e não alterar configurações de execução.

## 4. Contextualização (propostas de AGENTS.md, SOUL.md e arquivos de conhecimento)
Os agentes devem compreender três blocos.

**Universo Digimon**
- Espécies e estágios.
- Evoluções ramificadas.
- Diferenças entre continuidades.
- Habilidades e atributos.
- Personalidade e relacionamento.
- Importância do parceiro especial.

**Identidade do jogo**
- Nome: Digital Odyssey. Identificador legado: GS-003.
- Direção GBA Plus.
- Qualidade visual acima da velocidade.
- Mapas vivos, ricos e consistentes.
- Digimon reconhecíveis e bem animados.
- Combate no próprio mapa.
- Evolução e relacionamento como diferenciais.

**Estado do projeto**
- O visual atual não está aprovado.
- Não expandir mapas antes de validar a qualidade.
- Não produzir sprites em massa antes de homologar o padrão.
- Não antecipar o roadmap.

## 5. Integração conceitual com a Database (sem runtime)
- Camada A é conhecimento da franquia. Camada B é proposta ou decisão de Digital Odyssey.
- Proposta não vira regra aprovada.
- Fonte comunitária não equivale a fonte oficial.
- Não misturar estágios japoneses e ocidentais.
- Não confundir Drimogemon com Digmon.
- Preservar a proveniência.
- O piloto revisado é a referência prioritária.

## 6. Responsabilidades (funções, não sete agentes novos)
- **Game Director:** visão, prioridades, consistência, aprovação de entregas.
- **Digimon Research:** universo, Database, evoluções, verificação de fontes.
- **Game Design:** progressão, sistemas, relacionamento, combate, economia.
- **Art Director:** identidade visual, sprites, animações, cenários, consistência.
- **World Design:** mapas, regiões, biomas, exploração, composição.
- **Game Development:** arquitetura, implementação, integração, testes técnicos.
- **QA:** validação visual e funcional, regressões, evidências.

Preferir aproveitar os agentes existentes.

## 7. Fluxo
1. O fundador aprova a entrega.
2. O Game Director define escopo e critérios.
3. Os responsáveis pesquisam e propõem.
4. O Art Director ou o Game Design valida a consistência.
5. O Game Development implementa só quando autorizado.
6. O QA apresenta evidências.
7. O fundador homologa.

Nenhum agente aprova sozinho mudanças estratégicas.

## 8. Briefing da Etapa 6 (visual)
- Comparar três abordagens de mapa: PixelLab refinado, tilesets próprios e híbrido.
- Testar as três na mesma área do jogo.
- Escala consistente entre Tamer e Digimon.
- Vegetação, terreno e profundidade.
- Animação e dinamismo.
- Interface e Digivice.
- Critérios visuais mensuráveis.
- Preservação da versão atual.

**Não gerar mapas nem sprites.**

## 9. Segurança
Não modificar:
- gameplay;
- mapas;
- sprites;
- interface;
- banco;
- saves;
- deploy;
- configurações, modelos e permissões dos agentes.

Sem migrations, commits ou pushes sem autorização. Preservar arquivos não rastreados e trabalhos paralelos.

## 10. Entregáveis (área documental isolada; não aplicar nos arquivos operacionais)
1. Inventário dos agentes.
2. Matriz de responsabilidades.
3. Propostas completas de AGENTS.md e SOUL.md.
4. Regras de consulta à Database.
5. Fluxo de colaboração.
6. Matriz de permissões e aprovações.
7. Briefing visual da Etapa 6.
8. Relatório de riscos e conflitos.
9. Plano de implantação da contextualização.

## 11. Critérios de conclusão
- Todos os agentes inventariados.
- Responsabilidades claras.
- Database representada corretamente nos contextos.
- Decisões do fundador preservadas.
- AGENTS.md e SOUL.md propostos e prontos para revisão.
- Nenhum código ou configuração operacional alterado.

Entregar relatório executivo e aguardar autorização. **Não iniciar a Etapa 6.**
