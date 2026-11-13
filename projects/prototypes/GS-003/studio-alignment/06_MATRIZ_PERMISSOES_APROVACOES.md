# 06 — Matriz de permissões e aprovações

- **Data:** 2026-11-12 · **Base:** `GOVERNANCE.md`, `ARCHITECTURE.md` §Permissões [L], ADR-001/004/007/009/011/012, `USER.md` do game-studio, `PROJECT_LOG.md`.
- **Importante:** esta matriz é **de conduta**. O controle técnico (perfil de ferramentas) não foi conferido no gateway nesta etapa e o `GOVERNANCE.md` registra que o runtime `claude-cli` não é totalmente governado pela política do OpenClaw. Nada aqui altera configuração.

- **Revisão 1 (2026-11-13, Fase 1 da implantação):** K2 e K3 de `08` corrigidos (PixelLab do game-studio; "aprova internamente" virou "revisão de coordenação"); permissões do game-growth no Nível 1; concorrência decidida (§4). Base: `COMANDO_IMPLANTACAO_ETAPA5.md` §3–§7.

Legenda: **✔** pode sem pedir · **◐** pode dentro de brief autorizado pelo game-studio · **F** só com aprovação explícita do fundador · **✖** proibido · — não se aplica.

## 1. Permissões de ação por agente

| Ação | studio | research | design | dev | art | qa | growth |
|---|---|---|---|---|---|---|---|
| Ler qualquer arquivo do estúdio (exceto segredos) | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Escrever em `projects/prototypes/GS-003/` (pasta da própria entrega) | ✔ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ |
| Escrever no próprio workspace | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Escrever em workspace de outro agente | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Alterar `AGENTS.md`/`SOUL.md` de agente | F | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Alterar config do gateway, modelos, permissões, agentes | F | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Código do jogo (worktree `qo`) | ✖ (delegar) | ✖ | ✖ | ◐ | ✖ | ✖ (só roteiro de teste fora do código) | ✖ |
| Commit local | ◐ (docs, ADR, snapshot pedido) | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ |
| Push / merge em `master` remoto | F | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Deploy / alterar prévia Vercel / abrir ou fechar login | F | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Dados da Database (`database/`) | ✖ (delegar) | ◐ (dono) | ✖ | ✖ | ✖ | ✖ (só rodar o validador) | ✖ |
| ADR em `shared/decisions/` | ✔ (redige; decisão estratégica = F) | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| `PROJECT_LOG.md` | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Gerar ou editar arte no PixelLab | ✖ como regra: delega ao game-art. Exceção pontual só registrada no log e com revisão de outro agente; nunca para produzir mapa | ✖ | ✖ | ✖ | ◐ (com teto) | ✖ | ✖ |
| Produzir mapa (layout ou composição) | ✖ (coordena) | ✖ | ◐ (estrutura, layout-brief) | ✖ (só engenharia/integração) | ◐ (composição visual) | ✖ (valida) | ✖ |
| `get_balance`, listar assets PixelLab | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | — |
| Comprar créditos / assinar serviço | F | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Web search / fetch público | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Browser perfil isolado | ✔ | ◐ | ◐ | ◐ | ◐ | ✔ | ◐ |
| Browser perfil pessoal (`chrome-sharp` etc.) | F (por tarefa) | F | ✖ | ✖ | ✖ | F | ✖ |
| Spawn de subagente | ✔ (os 7 IDs) | ◐ (só de si, 1 nível) | ◐ | ◐ | ◐ | ◐ | ◐ |
| Automação / cron | F (só as aprovadas) | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Comunicação externa (post, e-mail, mensagem, comentário) | F | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ (Nível 1) |
| Planejar marketing (estratégia, calendário, legendas, roteiros, planos de comunidade e beta, modelos de análise, relatórios internos) | ✔ (consolida) | — | — | — | — | — | ◐ (Nível 1 ativo) |
| Verificar conteúdo de marketing (fluxo `05` §3.5) | ✔ (consolida) | ◐ (Digimon, IP) | ◐ (mecânicas) | — | ◐ (visual) | ◐ (estado real) | — |
| Publicar, agendar, responder comentário ou mensagem em rede social | F | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ (Nível 1; Nível 2+ não autorizado) |
| Criar ou conectar conta (Instagram, Discord etc.), guardar credencial de rede | F | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Anúncio, campanha paga, gasto de mídia | F | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Coletar dados de interessados, abrir inscrições, divulgar data de beta | F | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Alterar o próprio nível ou as próprias permissões | F | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Ler/imprimir segredo ou token | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Operação destrutiva (apagar asset original, branch, banco) | F | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |

## 2. Quem aprova o quê (validação interna × homologação)

| Tipo de entrega | Valida consistência (passo 4) | Evidência (passo 6) | Revisão de coordenação (passos 2 e 7) | Homologa |
|---|---|---|---|---|
| Sprite / animação / Tamer | game-art diretor (sessão ≠ produtor; matriz ≥ 8, 0 falha crítica) | game-qa | game-studio | **Fundador** |
| Mapa / bioma | game-design (estrutura, layout-brief) + game-art (composição visual) | game-qa (validação independente: composição, escala, funcionalidade, desempenho) | game-studio (só coordenação; não produz mapa) | **Fundador** |
| UI / HUD / Digivice | game-design (fluxo) + game-art (arte) | game-qa | game-studio | **Fundador** |
| Spec de sistema | game-design; game-research (fidelidade) | — | game-studio | **Fundador** (via ADR se for regra) |
| Dado da Database (Camada A) | game-research + validador | game-qa (opcional) | game-studio | Fundador só se mudar decisão |
| Integração no jogo | — | game-qa | game-studio | **Fundador** |
| Conteúdo de marketing (plano, calendário, peça) | game-design (mecânicas) + game-research (Digimon, IP) + game-art (visual) | game-qa (estado real do jogo) | game-studio (consolida) | **Fundador** (aprovar plano ≠ autorizar publicação) |
| Pesquisa / relatório | game-studio | — | game-studio | Fundador (etapa) |
| Documento de alinhamento (esta etapa) | — | — | game-studio | **Fundador** |

**"Revisão de coordenação"** (correção de K3) = o `game-studio` confere escopo cumprido, critério do brief atendido e ausência de conflito com ADR antes de consolidar para o fundador. **Não** substitui a validação de consistência do passo 4 nem a evidência do passo 6, e **não é aprovação**: quem aprova é o fundador. Quando o próprio `game-studio` produziu algo (exceção registrada), ele não faz a revisão desse item: ela vai ao `game-art` ou ao `game-qa`.

## 3. Decisões que são sempre do fundador (estratégicas)

| Decisão | Base |
|---|---|
| Abrir, encerrar ou pular etapa; mudar roadmap | brief Etapa 5 §4; ADR-012 |
| **Referência visual que manda** (Style Bible × v13/v15) | Etapa 2 G-1 |
| **Escala** Tamer × Digimon × tile | Etapa 2 G-2; Style Bible §2.4 |
| Abordagem de mapa da Etapa 6 (PixelLab refinado, tilesets próprios, híbrido) | brief §8 |
| IP: prévia pública aberta/fechada, sprites oficiais em URL pública | Etapa 2 G-3; ADR-007 §4 |
| Publicação, domínio, deploy, servidor | GOVERNANCE; ADR-008 |
| Compra de créditos, assinaturas, serviços | GOVERNANCE; ADR-011 §4 |
| Descongelar regras de jogo; aprovar regra da Camada B | log 11/11; ADR-013 |
| Respostas às cinco perguntas do ADR-013 | ADR-013 |
| Convenção de nome, atributos, Drimogemon × Digmon, Database no runtime (D2–D10) | Etapa 4 |
| Mudança de AGENTS/SOUL/config/modelo/permissão de agente | brief Etapa 5 §3 e §9 |
| Ativar o Nível 2, 3 ou 4 do game-growth; acessos a contas; orçamento de mídia | `COMANDO_IMPLANTACAO_ETAPA5` §6 |
| Qualquer divulgação pública (post, devlog, data de beta, convite) | `COMANDO_IMPLANTACAO_ETAPA5` §3.2 e §7 |
| Concorrência depois da homologação da Etapa 6 (até 4 simultâneas ou não) | `COMANDO_IMPLANTACAO_ETAPA5` §3.4 |
| Conflitos visuais abertos (Endesga-32 × referências, escala, critério unificado, composição e densidade, convenções de sprite) | `COMANDO_IMPLANTACAO_ETAPA5` §3.5; Etapa 6 |
| Mapas antigos (manter, refazer, retirar) e alvo celular | Etapa 2 G-4, G-9 |

## 4. Regras temporárias vigentes

| Regra | Validade | Fonte |
|---|---|---|
| Um agente de execução e uma tarefa por vez; esperar aprovação entre passos | até a conclusão e a homologação da Etapa 6; depois, o fundador decide (até 4 simultâneas ou não). Configuração global de concorrência não é alterada | Decisão do fundador 13/11 (`COMANDO` §3.4), substitui o prazo de 15/11 do `USER.md` do game-studio |
| game-growth no Nível 1 (planejamento interno) | até autorização explícita do fundador para outro nível | `COMANDO` §6 |
| Sem produção de assets; conflitos visuais abertos | até a Etapa 6 | `COMANDO` §3.5 |
| Expansão de mundo congelada | até aprovação do piloto | ADR-012 |
| Regras de jogo congeladas | até a identidade visual ser definida | log 11/11 ~11:4x |
| Produção em massa e mudança de arquitetura proibidas | até a prova visual | ADR-010 |
| Prévia Vercel aberta sem login, noindex | até decisão G-3 | log 12/11 |

## 5. Lacunas de controle (registradas, não corrigidas)

- Limites de concorrência e profundidade de subagentes são **de conduta**; o schema não permite por agente sem afetar outros agentes (ADR-001 §5).
- Sem sandbox (sem Docker); isolamento por política + conduta (GOVERNANCE).
- O perfil `coding` dos especialistas inclui escrita de arquivos em qualquer caminho acessível ao usuário do sistema; o escopo de escrita é regra do `AGENTS.md`, não bloqueio técnico [H, não verificado no gateway].
- O PixelLab MCP fica disponível no ambiente; o "só game-art gera" é conduta, não bloqueio [E: ferramenta presente nesta sessão].
