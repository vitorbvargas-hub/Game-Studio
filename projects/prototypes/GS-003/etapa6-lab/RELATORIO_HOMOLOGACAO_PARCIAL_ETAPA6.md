# Digital Odyssey — Etapa 6, Comando 2: relatório da homologação parcial

- **Data:** 2026-11-13. **Autor:** game-studio. Este relatório consolida o trabalho; o game-studio não homologa o que ele mesmo produz.
- **Comando:** `COMANDO_ETAPA6_C2_HOMOLOGACAO_PARCIAL.md`, decisão do fundador: "Aprovar o planejamento da Etapa 6 com ressalvas".
- **Execução:** 4 passos, com um agente por vez: game-art → game-design → game-art → game-qa. O passo 3 caiu 2 vezes por limite de uso e foi retomado sem perda.
- **Custo:** **0 gerações PixelLab.** O saldo era 737,95 antes e continua 737,95 depois. Nenhum código, Database, mapa, sprite em produção ou configuração foi alterado. Nenhum script de integração foi executado.

## 1. Entregáveis
| Arquivo | Autor | Revisão independente (game-qa) |
|---|---|---|
| `RELATORIO_AVALIACAO_ASSETS_FASE0.md` | game-art | **conforme com ressalva** (erro aritmético no Gabumon: a nota 4,0 deveria ser 4,25) |
| `COMPARATIVO_ESCALAS_E1_E5.md` + `pranchas/` (E1–E5, comparativo, metrics.json) | game-art (E1–E5) + game-design (§7) | **conforme** (4 sprites remedidos de forma independente, todos batem com o metrics.json) |
| `PAINEL_DIRECAO_ARTISTICA_V1.md` + `painel/moodboard_v1.png` | game-art | **conforme com ressalva** |
| `AJUSTES_RUBRICA_VISUAL_V1.md` | game-design (composição) + game-qa (reconciliação) | é a própria régua; não teve revisão por terceiro |
| `RELATORIO_HOMOLOGACAO_PARCIAL_ETAPA6.md` | game-studio | este documento |

## 2. Fase 0: os 4 assets do ChatGPT
Resultado: **nenhum é pixel art 1:1.** O game-art viu isso a 4×, e o game-qa confirmou por amostragem: as folhas têm sombreado em degradê e borda suavizada. Mesmo assim, a **fidelidade às espécies é boa**. Na parte técnica (B), as 4 falham (sem alfa, sem quadro, sem pivô), como o próprio pacote já avisava.

| Asset | Fidelidade isolada | Nota (A), leitura 1 (grade falsa conta como arte) | Nota (A), leitura 2 (grade falsa conta como conversão) | Veredito (A) | Veredito (B) |
|---|---|---|---|---|---|
| F0-001 Guilmon | 7 | 3,4 | 6,33 | candidato aproveitável | precisa de retrabalho |
| F0-002 ExVeemon | 8 | 3,9 | 6,83 | candidato aproveitável | precisa de retrabalho |
| F0-003 Agumon (reaproveitamento, **não** é Método A) | 6 | 4,25 | 6,00 | candidato aproveitável | precisa de retrabalho |
| F0-004 Gabumon | 6–7 | 4,25 (corrigido pelo QA) | 6,58 | candidato aproveitável | precisa de retrabalho |

- Em nenhuma das duas leituras algum asset chega a 8. A diferença entre elas está em como lemos as folhas: na leitura 1, "a arte não está pronta"; na leitura 2, "o conceito é bom e o problema é o custo de convertê-lo".
- **Leitura recomendada pelo game-qa:** a 1. **A minha:** a 2, porque segue a sua regra de "não descartar o conceito por motivo técnico" e evita punir duas vezes, já que a conversão já entra no custo. A decisão é sua (§6, item 1).
- **Custo de conversão** (game-dev §6.4, ajustado): de 12 a 32 h por personagem completo. A maior parte vai em redesenhar em grade real e fazer as direções e os quadros.

## 3. Escala: E1 a E5
| Hipótese | Champion ou Ultimate / Rookie ≥ 1,3 | Tamer/tile 1,1–1,6 | Só inteiros |
|---|---|---|---|
| E1 nativo 1× | 1,33 ✓ | 1,06 ✗ | ✓ |
| E2 escala por estágio | 2,67 ✓ | 1,06 ✗ | ✓ |
| E3 tudo 2× | 1,33 ✓ | 2,13 ✗ | ✓ |
| E4 tile 16 (conceitual) | 1,38 ✓ | 1,06 ✗ | ✓ |
| E5 escala por espécie/porte (WarGreymon 3× = 108 px, 3,4 tiles) | ✓ com folga | 1,06 ✗ | ✓ |

**Conclusão fechada (game-art, confirmada por game-design e game-qa):** a hierarquia entre os Digimon tem solução, mas a proporção Tamer/tile **não tem solução com fator inteiro sobre o sprite atual do Tamer**. Ele tem 34 px num tile de 32: a 1× fica em 1,06 e a 2× sobe para 2,13, sem valor intermediário. Sobram três caminhos, todos decisão sua:
- (a) redesenhar o Tamer em quadro maior, com 36–50 px de conteúdo, o que dá Tamer/tile entre 1,1 e 1,6;
- (b) rever a meta e aceitar 1,06;
- (c) aceitar escala não inteira, o que perde a nitidez do pixel art e por isso não é recomendado.

O game-design também mostrou que **a largura importa**: o Koromon é quase tão largo quanto o Agumon (19 contra 20 px). Por isso a E5 trata porte como altura + largura + postura.

Nenhuma hipótese foi aprovada.

## 4. Painel de direção artística
- Cobre os 6 eixos pedidos: File Island, vegetação, água/cachoeira/desnível, estruturas digitais, paleta/contorno/sombra/luz e integração entre Tamer, Digimon e ambiente.
- O GBA Plus está tratado como piso, não como teto.
- O conflito Endesga-32 × v13/v15 ficou **aberto**.
- **Ressalvas:**
  1. As referências de File Island ficaram como hipótese, sem fonte citada, porque a sessão não tinha busca na web. O agente preferiu não inventar fonte.
  2. **Faltaram as 2 ou 3 paletas candidatas** que eu tinha pedido: o painel só tabulou as regras de paleta que já existem. Isso é lacuna da entrega, não erro de conduta.
- Os dois pontos podem ser completados numa rodada curta do game-art, com busca na web, sem gastar gerações.

## 5. Ajustes da rubrica
- **17 critérios bloqueantes reconciliados:** os 12 da rubrica mais 5 de mapa vindos do game-design, sem duplicidades.
- **Os outros critérios passam a ser graduados**, de 0 a 10.
- **O mapa é avaliado em 3 dimensões:**
  1. arte e tileset num recorte de 12×10;
  2. composição no layout de 40×30;
  3. navegação real, num roteiro de teste que só roda depois.
- **Método de cálculo** (decidido pelo game-qa, como ajuste de régua): média simples das dimensões 1 e 2. A dimensão 3 entra quando houver mapa jogável.
- **Mantidos:** nota mínima de 8/10, nenhum critério principal abaixo de 7, e aprovação final do fundador.

## 6. Decisões pedidas ao fundador (uma por vez, nesta ordem)
1. **"Grade de pixel falsa" na Fase 0:** contar como arte (leitura 1, recomendada pelo QA) ou como custo de conversão (leitura 2, recomendada por mim)?
2. **Tamer/tile:** (a) redesenhar o Tamer em quadro maior, que eu recomendo; (b) aceitar 1,06; ou (c) usar escala não inteira, que não recomendo.
3. **Método de cálculo do critério de mapas:** aceitar a decisão do game-qa?
4. **Completar o painel:** autorizar uma rodada curta do game-art, com 0 gerações, para as paletas candidatas e as fontes de File Island?
5. **Primeira rodada limitada do PixelLab** (proposta abaixo, ainda não pedida como gasto).

## 7. Proposta de primeira rodada limitada do PixelLab (para decidir depois; **não** é pedido de gasto agora)
O teto de 90 gerações não está autorizado. A proposta é uma rodada mínima que responde à pergunta "o PixelLab produz um Digimon do elenco com nota ≥ 8?" antes de qualquer mapa:

| Item | Gerações (estimativa) | Por quê |
|---|---|---|
| Agumon v3, 8 direções, tamanho definido pela escala escolhida | ~2–3 | Espécie do trio; tem comparação direta com o rip do DS e com a folha F0-003 |
| Uma animação idle ou walk do Agumon (template) | ~1–4 | Testa a consistência entre quadros, o limiar L4 |
| Recorte de floresta de 12×10 tiles (1 tileset padrão + 2 props) | ~3–5 | Dimensão 1 da rubrica |
| Reserva para 1 retrabalho | ~5 | Limiar L2 (aprovação em até 2 tentativas) |
| **Total** | **≤ 15 gerações** (cerca de 2% do saldo) | Piso de saldo de 200 preservado |

Pré-requisitos: as decisões 1–3 acima e a escala escolhida.

## 8. Conflitos visuais abertos (continuam abertos)
Endesga-32 × referências posteriores; escala Tamer/Digimon, agora com a evidência do §3; critério unificado; densidade dos mapas; convenções da Database.

---

**ETAPA 6, COMANDO 2 CONCLUÍDO. AGUARDANDO NOVA DECISÃO DO FUNDADOR.**
