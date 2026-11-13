# DIGITAL ODYSSEY — ETAPA 6, Comando 1: planejamento do laboratório visual
- **Data:** 2026-11-13
- **Executor:** game-studio (Opus 5.5)
- **Status:** Etapa 5 homologada pelo fundador
- **Autorização:** só planejamento e preparação documental

Texto do fundador condensado sem perda de requisito. A numeração segue a original.

## 1. Missão
Preparar um laboratório comparativo para uma identidade visual própria, bonita, imersiva e consistente. A referência é o GBA Plus, mas ele não é limite artístico.

O laboratório deve descobrir:
1. qual direção visual entrega a melhor experiência;
2. como representar os Digimon com fidelidade;
3. como definir escalas proporcionais entre espécies;
4. como fazer mapas bonitos, exploráveis e inspirados no anime;
5. se o PixelLab justifica o custo;
6. como garantir nota ≥ 8/10 antes de expandir.

**Só plano e critérios.** Proibido: produção em massa, alterar o jogo e homologar a identidade sem o fundador.

## 2. Contexto
Usar:
- Digital Odyssey Context v1.0
- Style Bible
- ADRs
- Database 1.0
- Relatórios de homologação visual
- Relatório de implantação da Etapa 5
- `studio-alignment/07_BRIEFING_ETAPA6_VISUAL.md`
- Decisões do fundador sobre GBA Plus e PixelLab

Manter separados: fato canônico, proposta do jogo e decisão aprovada. **Não modificar a Database.**

## 3. Identidade visual (direção de trabalho)
**"Digital Odyssey Visual Identity — GBA Plus + identidade própria + imersão."**

Elementos:
- Digimon reconhecíveis e fiéis.
- Sprites detalhados e expressivos.
- Mapas ricos, com profundidade e variedade.
- Animações naturais.
- Coerência entre personagens, criaturas, cenários e UI.
- Exploração agradável, com caminhos, descobertas e pontos de interesse.

**Não limitar automaticamente a paleta à Endesga-32.** Não descartar o Style Bible: identificar o que revisar e preparar propostas comparativas.

## 4. Comparação de ferramentas → `COMPARATIVO_FERRAMENTAS_VISUAIS.md`
- **A — ChatGPT + ferramentas gratuitas:** criação e tratamento de sprites e cenários, exportação, transparência, controle de dimensões, consistência entre quadros, integração. Imagem gerada **não** é sprite pronto.
- **B — PixelLab:** sprites, tilesets, animações, consistência, controle de estilo, tempo, **custo por asset aprovado**, retrabalho.
- **C — Híbrido:** ChatGPT + PixelLab + editores, mostrando onde cada um agrega.

Os três métodos usam o **mesmo briefing, os mesmos personagens e o mesmo cenário**. Matriz de comparação: qualidade, consistência, tempo, retrabalho, custo e integração técnica. **Sem contratar serviço e sem consumir crédito pago nesta execução.**

## 5. Escala dos Digimon → `ESTUDO_ESCALA_DIGIMONS.md`
Alturas documentadas, com prioridade para fonte oficial e fonte de fã identificada como apoio. **Não inventar.**

Para cada espécie:
- nome canônico;
- estágio;
- altura documentada;
- fonte;
- confiança;
- estimativa visual (quando não houver medida);
- classe proposta;
- escala de gameplay sugerida.

Hipótese inicial de classes (revisável):

| Classe | Altura |
|---|---|
| Pequeno | ≤ 30 cm |
| Médio | > 30 até 100 cm |
| Grande | > 100 até 300 cm |
| Gigante | > 300 cm |

Diferenciar altura física, volume visual, largura, colisão e pixels. Comparar 3 Digimon de portes distintos. **Não implementar no runtime.**

## 6. Regiões e mapa-piloto → `ESTUDO_REGIOES_E_MAPA_PILOTO.md`
Proposta de longo prazo: cada temporada inspira uma região do jogo.

| Temporada | Referência inicial |
|---|---|
| Adventure | File Island e referências ambientais |
| 02 | Setores do Mundo Digital e Torres Negras |
| Tamers | Ambientes digitais e paisagens abstratas |
| Frontier | Estações, trilhos e territórios elementais |

Para cada região:
- fontes;
- biomas;
- arquitetura;
- vegetação;
- elementos reconhecíveis;
- atmosfera;
- exploração;
- pontos de interesse;
- riscos de propriedade intelectual.

Distinguir: referência artística × recriação de local reconhecível × reprodução direta. **Não copiar cenários, mapas ou imagens do anime.**

**Piloto:** floresta inspirada em Adventure. O layout-brief cobre:
- caminhos principais e secundários;
- vegetação variada;
- clareiras;
- elementos interativos;
- descobertas;
- profundidade;
- legibilidade;
- encontros futuros;
- transições.

**Não implementar.**

## 7. Régua → `RUBRICA_QUALIDADE_VISUAL_V1.md`
Mínimo **8/10**. Pesos:

| Critério | Peso |
|---|---|
| Fidelidade e beleza dos Digimon | 35% |
| Beleza e exploração dos mapas | 35% |
| Animações e imersão | 15% |
| Escala e consistência | 10% |
| Integração com a UI | 5% |

Cada nota tem critério objetivo e evidência.

Impeditivos (a média **não compensa** falha crítica):
- Digimon irreconhecível ou mal resolvido;
- anatomia, cores ou detalhes que descaracterizam a espécie;
- mapa pobre ou sem exploração;
- legibilidade grave;
- inconsistência crítica;
- animação que prejudica a experiência.

Revisão independente do game-qa e aprovação visual do fundador.

## 8. Laboratório (1ª rodada pequena)
- 1 mapa-piloto de floresta
- 1 Tamer de referência
- 3 Digimon de portes diferentes
- 3 métodos de produção
- Comparações de escala
- Critérios de avaliação
- Estimativa de créditos e custo
- Estratégia de integração

A rodada tem de bastar para decidir se o PixelLab continua. Sem biblioteca extensa, sem substituir arquivos, sem sprite final.

## 9. Responsabilidades
| Agente | Papel |
|---|---|
| game-studio | Coordena e consolida |
| game-research | Fontes e dimensões |
| game-design | Requisitos de exploração e layout-brief |
| game-art | Métodos e critérios de produção |
| game-dev | Requisitos de exportação, spritesheet e integração, sem código |
| game-qa | Testes e avaliação independente |
| game-growth | Nível 1, fora da execução visual, sem divulgar |

**Um agente por vez, sem sessões simultâneas.**

## 10. Segurança
Não modificar:
- código, mapas, sprites, Database, UI, saves;
- infra, deploy, configurações globais;
- permissões dos agentes;
- outros projetos.

Também proibido:
- publicar, conectar redes, anunciar beta;
- push ou deploy;
- consumir crédito pago sem autorização específica.

## 11. Entregáveis
1. `PLANO_LABORATORIO_VISUAL_ETAPA6.md`
2. `COMPARATIVO_FERRAMENTAS_VISUAIS.md`
3. `ESTUDO_ESCALA_DIGIMONS.md`
4. `ESTUDO_REGIOES_E_MAPA_PILOTO.md`
5. `RUBRICA_QUALIDADE_VISUAL_V1.md`
6. `RELATORIO_PREPARACAO_ETAPA6.md`

Em todos: fontes, decisões pendentes, hipóteses, custos e critérios de aprovação. Propor a sequência dos experimentos **E1–E4, sem executar**.

## 12. Conclusão
Pronto quando:
- os 3 métodos estiverem definidos;
- as regras de comparação estiverem claras;
- as classes de tamanho estiverem fundamentadas;
- o piloto estiver especificado;
- a régua estiver pronta;
- custos e riscos estiverem levantados;
- nenhum asset ou arquivo operacional tiver sido alterado.

Declarar: **ETAPA 6 — PLANEJAMENTO DO LABORATÓRIO VISUAL CONCLUÍDO. AGUARDANDO APROVAÇÃO DO FUNDADOR PARA EXECUTAR OS EXPERIMENTOS.** Parar.

---
## Notas operacionais do coordenador
- **Pasta de saída:** `projects/prototypes/GS-003/etapa6-lab/`
- **Sequência de agentes (um por vez):**
  1. game-research → `ESTUDO_ESCALA_DIGIMONS.md` + seção de pesquisa das regiões
  2. game-design → layout-brief do piloto (completa `ESTUDO_REGIOES_E_MAPA_PILOTO.md`)
  3. game-art → `COMPARATIVO_FERRAMENTAS_VISUAIS.md`, com seção de requisitos técnicos preenchida depois pelo game-dev
  4. game-dev → requisitos de exportação e integração (seção do comparativo)
  5. game-qa → `RUBRICA_QUALIDADE_VISUAL_V1.md`
  6. game-studio → `PLANO` + `RELATORIO`
- **PixelLab:** a assinatura Tier 1 é paga. Nesta execução, **nenhuma geração**. Só leitura de saldo e de documentação (`get_balance`, `search_help`).
- **ChatGPT:** não há acesso deste ambiente (sem chave OpenAI). O Método A depende da conta do fundador ou de autorização específica. Registrar isso no comparativo.
