# ADR — Etapa 6: decisões do fundador (Comando 3)

- **Data da decisão:** 2026-11-13. **Decisor:** Vitor Vargas (fundador). **Registro:** game-studio.
- **Fonte:** `COMANDO_ETAPA6_C3_CONSOLIDACAO_ABC.md`, cópia literal do comando, §1.
- **Status:** **DECIDIDO.** Os valores numéricos de escala continuam a testar (D2). Produção paga e integração **não** estão autorizadas.
- **Substitui:** as decisões pendentes 1, 2, 3 e 4 de `RELATORIO_HOMOLOGACAO_PARCIAL_ETAPA6.md` §6. A decisão 5 virou D6.

## Decisões

| # | Decisão (palavras do fundador, condensadas sem perda) | Efeito prático | O que continua proibido |
|---|---|---|---|
| **D1** | O Tamer é **redesenhado com 36 a 50 px de altura de conteúdo**, em tiles de 32×32. O jogador **cria o próprio Tamer** com personalização limitada: aparência, cabelo, roupas, acessórios e cores. Personagens do anime **não** são modelos básicos obrigatórios; podem aparecer como NPCs e, no futuro, como skins ou cosméticos, por decisão posterior. | Resolve o eixo Tamer/tile, que E1–E5 mostraram não ter solução inteira com o sprite atual de 34 px. Exige um contrato de personalização (`ESPECIFICACAO_TAMER_PERSONALIZAVEL_V1.md`). | Gerar ou substituir sprites do Tamer nesta rodada. |
| **D2** | **E5 (escala por espécie) aprovada como direção.** Cada espécie tem porte próprio, definido por: altura e largura, postura e silhueta, estágio, presença no mapa, sombra e ponto de contato, colisão e navegação, visibilidade do Tamer e espaço de combate. **Os Megas não recebem 3× automaticamente.** Os grandes devem ter imponência sem comprometer a navegação. **Escala visual e colisão física são separadas.** | A direção está decidida; **os valores não**. Os limites por ambiente, câmera e espécie são propostos e testados antes da aprovação definitiva (`ESCALA_E5_POR_ESPECIE_V1.md`). | Fixar fatores como definitivos sem teste. Aplicar 3× por estágio. |
| **D3** | **Vale a leitura 1:** pixel art nativa 1:1 é requisito de qualidade artística. As avaliações (A) arte/fidelidade/autenticidade e (B) prontidão técnica continuam independentes. Guilmon, ExVeemon, Agumon e Gabumon (F0-001..004) ficam como **referências aproveitáveis**, **não homologadas** como sprite técnico. | As notas (A) da Fase 0 seguem a leitura 1: 3,4 / 3,9 / 4,25 / 4,25. As folhas servem de referência de design para os métodos A/B/C. | Descartar os originais. Converter conceitos automaticamente em sprites definitivos. |
| **D4** | **Rubrica de mapas em 3 dimensões aprovada:** (1) arte e tilesets em ~12×10; (2) composição e exploração em 40×30; (3) navegação real em playtest posterior. Sem versão jogável, a nota provisória usa D1 + D2 (método homologado do game-qa). A dimensão 3 entra quando houver playtest. Ficam mantidos: 17 bloqueantes, critérios graduados, nota mínima 8/10, nenhum critério principal abaixo de 7 e aprovação final do fundador. | `AJUSTES_RUBRICA_VISUAL_V1.md` + `RUBRICA_QUALIDADE_VISUAL_V1.md` rev. 2 passam a ser a **régua homologada**. | Reabrir os critérios sem nova decisão. |
| **D5** | O game-art prepara **3 paletas candidatas** para a floresta-piloto: (i) Endesga-32 e suas regras; (ii) a paleta efetivamente usada na v13/v15 aprovada; (iii) uma harmonização entre personagens e cenário. Usar referências **verificáveis** de File Island, com fonte, sem inventar referências oficiais. | Entregável `COMPARATIVO_PALETAS_FLORESTA_V1.md`. | Fixar a paleta final sem aprovação. Resolver o conflito Endesga-32 × v13/v15 por conta própria. |
| **D6** | **Só a preparação** da 1ª rodada experimental do PixelLab, com teto proposto de **15 gerações**. **Não consumir créditos ainda.** Apresentar orçamento, sequência, critérios de parada e consumo estimado para autorização específica. | Entregável `ORCAMENTO_PIXEL_LAB_PILOTO_V1.md`. Saldo real verificado pelo game-studio: **737,95** (`get_balance`, 13/11). | Qualquer geração. |

## Outras definições do Comando 3

### Laboratório
- Três métodos: A (ChatGPT + gratuitas), B (PixelLab) e C (híbrido).
- Os três usam **o mesmo briefing, as mesmas espécies, o mesmo recorte e os mesmos critérios**.
- Nenhum vencedor é declarado antes do resultado.

### Elenco do teste
- **Prioritário:** Koromon, Agumon, Greymon, MetalGreymon, WarGreymon.
- **Complementar (só candidatos de teste, sem autorizar encontros ou mecânicas):** Betamon, Kunemon, Palmon, Kuwagamon.
- As árvores evolutivas da Database são preservadas.
- As referências visuais das linhas de Guilmon, Veemon e Gabumon serão corrigidas sem mexer na modelagem de evolução.

### Cenário
- **Só** a floresta-piloto de File Island, sobre o layout de 40×30, preservando o que foi aprovado na v15/v15b.
- O mapa terá 3 versões alternativas, comparadas nas mesmas condições.
- Requisitos:
  - chão predominantemente verde, sem trilha marrom contínua;
  - caminhos formados pela vegetação;
  - clareiras e mato alto;
  - rio, cachoeira, ponte e desníveis;
  - santuário e elementos digitais;
  - vegetação variada;
  - escala coerente.
- O mapa principal não é substituído, e os outros biomas não são produzidos.

### Identidade e combate
- Tamer original e personalizável.
- **Sem** Centro Pokémon nem equivalente visual como instalação padrão de cura. Qualquer recuperação seguirá as mecânicas de cuidados ainda a aprovar.
- Combate em tempo real no próprio mapa, **sem** tela de batalha separada.

### Registrado para o futuro (NÃO implementar)
- Controle automático/manual em bosses e PvP.
- Bosses e vilão final com porte visual maior.
- Combate de ação em tempo real.
- Indicadores de área no chão para esquiva.
- Padrões de ataque em círculo, cone, linha e área progressiva.

### Restrições desta rodada
Nada de:
- alterar o jogo, a Database ou os sprites;
- migrations, deploy ou créditos;
- mapas jogáveis ou produção em massa;
- integração sem aprovação;
- reabrir decisões homologadas;
- marcar como concluído sem evidência.

## Estado verificado pelo game-studio (passo 1, 13/11)

| Item | Estado | Evidência |
|---|---|---|
| Saldo PixelLab | 737,95 de 2.000; renova em 11/12 | `get_balance` |
| Pacotes do ChatGPT recebidos (Método A) | **1 pacote**: `digital_odyssey_assets_fase4.zip` (md5 `ee2f29be…`), com 4 folhas de conceito (Guilmon, ExVeemon, Agumon, Gabumon). **Não chegaram** referências de mapa, pranchas de bioma nem animações do ChatGPT. O §4 do comando cita "demais biomas apresentados nas pranchas conceituais", mas nenhuma prancha de bioma está no estúdio. | `INVENTARIO_ASSETS_CHATGPT.md` §4; inbound de 13/11 sem outros pacotes |
| Folhas Fase 0 × elenco do teste | Só o **Agumon** coincide com o elenco prioritário. Guilmon, ExVeemon e Gabumon ficam como referência de linha (D3). | — |
| Database × elenco | Koromon, Agumon, Greymon, MetalGreymon e WarGreymon estão no grafo piloto. Betamon e Palmon estão em `species.json`, mas fora do catálogo piloto. **Kunemon, Kuwagamon, Veemon e ExVeemon não estão na Database** (Kunemon só aparece em `sources_cache`). | `database/data/*.json` (grep, 13/11) |
| Jogo atual | Worktree `qo` limpo, branch `quality-overhaul`, commit `3289e32` | `git status` (Comando 2) |
| Régua | Rubrica rev. 2 + AJUSTES (homologada por D4) | — |

## Dependências e pendências

| # | Pendência | Bloqueia | Dono |
|---|---|---|---|
| P1 | Pacotes adicionais do ChatGPT (mapas, biomas, animações), se existirem | Inventário completo do Método A | **fundador** (enviar) |
| P2 | Imagens do Método A para o **briefing único** (Tamer, elenco, floresta) | Execução do Método A | **fundador** (gerar no ChatGPT) ou nova decisão |
| P3 | Kunemon, Kuwagamon e Veemon/ExVeemon fora da Database. A Database não pode ser alterada nesta rodada. | Rastreabilidade canônica dessas espécies no teste | Registrar como "fora da Database piloto". Entrada futura via game-research, com autorização. |
| P4 | Valores de escala E5 por espécie | Produção de qualquer Digimon para o teste | game-design (passo 3), com teste depois |
| P5 | Contrato do Tamer personalizável | Produção do Tamer em A/B/C | game-design (passo 3) |
| P6 | Paleta de trabalho do laboratório | Comparação justa entre A/B/C | Fundador escolhe entre as 3 candidatas (D5) |
| P7 | Importador do PixelLab fixo na v15b (achado do game-dev) | Versões jogáveis B/C do mapa | game-dev (passo 5, só proposta) |

## Próximos passos (um agente por vez, conforme o comando §7)
2. game-art (Sonnet 5): paletas e File Island.
3. game-design (Opus 5.5): E5 por espécie, Tamer personalizável e navegação de criaturas grandes.
4. game-art (Opus 5.5): briefing único A/B/C, especificações e inventário do Método A.
5. game-dev (Sonnet 5): forma isolada de testar, sem código.
6. game-qa (Opus 5.5): revisão.
7. game-studio: orçamento PixelLab, plano de testes e relatório de prontidão.

## Adendo ao Comando 3 (fundador, 13/11) — `COMANDO_ETAPA6_C3_ADENDO_PORTAO.md`
- **Objetivo final:** três **versões jogáveis** da mesma floresta-piloto (layout 40×30), acessíveis por **três links**: A (ChatGPT), B (PixelLab) e C (híbrida). Os links podem ser URLs ou rotas separadas, num ambiente isolado do jogo principal. Imagem estática não conta como versão. Nada de combate, bosses, PvP ou evolução nesta etapa.
- **Existe um pacote ChatGPT consolidado que ainda não foi entregue.** Ele traz o elenco prioritário e o complementar, o Tamer e a personalização, poses e animações, a floresta e o terreno, NPCs, UI e VFX, e manifestos. Isso **substitui** a pendência P1/P2: o Método A **não** começa com o pacote antigo de 4 folhas, e a ausência do pacote novo não autoriza recriar tudo do zero.
- **Portão obrigatório (§7)**, ao fim do planejamento, numa mesma comunicação:
  1. **Solicitação 1:** pedir o ZIP consolidado do ChatGPT.
  2. **Solicitação 2:** apresentar o orçamento do PixelLab (saldo, gerações por item, reserva, teto, critérios de qualidade e de parada, resultado esperado, saldo previsto) e perguntar: "Fundador, autoriza o consumo de até X gerações PixelLab para a rodada experimental descrita?"
- **Regras de execução:**
  - nada de créditos sem autorização expressa;
  - o A começa só depois de avaliar o ZIP;
  - o B começa só depois do orçamento autorizado;
  - o C começa só com resultados aproveitáveis de A e B;
  - o teto não é ultrapassado; se faltar orçamento, para e pede de novo;
  - integração e deploy só com autorização específica.
- **Modelo:** o fundador pediu "portão obrigatório use sonnet". A partir daqui, os passos seguintes do Comando 3 rodam em **Sonnet 5**, o que substitui a indicação de Opus nos passos 3, 4 e 6.

## Comando 4: aprovação do retrabalho do checkpoint 1 (fundador, 13/11), `COMANDO_ETAPA6_C4_APROVACAO_RETRABALHO_CP1.md`

- **D7, retrabalho:**
  - R1–R4 autorizados.
  - R5 só se for necessário para manter a consistência entre os presets.
  - R6 só se o recorte 12×10 mostrar costura na água.
  - Não repetir os prompts que falharam.
  - Gerar com Sonnet 5.
- **D8, escala-alvo do laboratório:**
  - Tamer com 40–42 px de conteúdo.
  - Agumon com 33–35 px de altura e 26–29 px de largura.
  - Margem superior adequada, pivô no pé e estabilidade entre quadros.
  - Colisão inalterada.
  - Esses valores **não** são definitivos para as outras espécies.
- **D9, paletas:**
  - **P-ii** para cenário e floresta.
  - **P-iii** para personagens e Digimon.
  - A paleta acomoda as cores **oficiais** das espécies; anatomia, marcas e cores oficiais não são alteradas para ganhar aderência. O histórico das 3 candidatas fica preservado em `COMPARATIVO_PALETAS_FLORESTA_V1.md`.
  - Pendência: atualizar as regras de paleta do Style Bible.
- **D10, medição de animação:**
  - Fórmula: `variacao_percentual = 100 × (altura_max − altura_min) / mediana_alturas`, calculada pelo bbox opaco, sem sombra e sem efeitos.
  - Limite de ≤ 5% por ciclo e direção na caminhada normal.
  - Pivô, amplitude e alternância das pernas, anatomia, fluidez e deformação são avaliados à parte. **O número não substitui a avaliação visual.**
- **Correções obrigatórias:**
  - Agumon: tirar crista, nadadeira, losango e listras azuis; cabeça lisa; amarelo-alaranjado; olhos verdes; cauda curta; 3 garras brancas; walk perceptível nas 4 direções.
  - Tamer: sem boné vermelho com jaqueta azul; identidade própria do DO, com cabelo visível, roupa de aventureiro e acessório digital discreto; nada de Pokémon nem de protagonistas de Digimon.
- **Pedido do fundador:** entregar **imagens e vídeos curtos (GIF) dos personagens em movimento** junto com as notas do QA. A fidelidade e a caminhada também são julgadas visualmente.

## Adendo C4 — água animada e viabilidade do PixelLab para Digimon (fundador, 13/11) — `COMANDO_ETAPA6_C4_ADENDO_AGUA_VIABILIDADE.md`
- **Água animada é obrigatória no lab A/B/C.** Itens: rio em loop, lago com ondulação e reflexo, cachoeira com queda, espuma e respingos na base, transições animadas, efeitos digitais perto do santuário.
  - Regras: reutilizar a v15b, manter a P-ii (ciano aprovado, nada de outro azul), pixel art 1:1 sem interpolação, loop sem corte, validação no motor.
  - Homologação: movimento discreto e perceptível, sem aspecto de textura deslizando, sem costura, coerente entre os corpos d'água, sem quebrar ponte, margem ou colisão, sem queda relevante de FPS.
  - O mapa aprovado não muda. Modelo: Sonnet 5.
- **Viabilidade do PixelLab para Digimon:**
  - Concluir o retrabalho do Agumon.
  - Depois, o game-qa avalia de forma independente: anatomia, silhueta, cores e marcas, consistência entre direções, animação e créditos por asset aproveitável.
  - **Sem produção em massa de Digimon no PixelLab.**
  - Se o novo Agumon ainda mudar a identidade da espécie, **parar as tentativas textuais da espécie** e apresentar alternativas: sprites existentes com procedência, redesenho manual assistido, híbrido (sprite fiel + animação e acabamento em ferramenta) e PixelLab só para cenário, Tamer e ambiente. Nenhuma alternativa fica aprovada automaticamente.
- **Orçamento:** piso de 650 mantido. Evitar geração paga quando houver alternativa gratuita de qualidade equivalente.

## Decisões do fundador para a Fase 2 (13/11), em `COMANDO_ETAPA6_C4_DECISOES_FASE2.md`
- **D11.** O Agumon DS é o **placeholder** dos protótipos jogáveis. Fica **encerrada** a geração do Agumon por texto no PixelLab. Os sprites v1 e v2 continuam guardados para comparação. O DS **não** está homologado como identidade definitiva.
- **D12.** O teste com referência oficial no PixelLab, estimado em 4–5 gerações, foi **adiado**. Nada de arte oficial ou derivada vai para o serviço externo nesta etapa. A decisão será revista depois da comparação dos protótipos.
- **D13.** A Fase 2 segue com o Tamer P1 v2 como candidato. A caminhada atual é **placeholder técnico** e deve ser corrigida depois dos builds e antes da homologação visual. **Não usar redimensionamento no motor para esconder inconsistência do asset.**
- **Continuidade.**
  - Retomada às 15h05, com Sonnet 5.
  - Três builds isolados (A, B e C), começando pelo B.
  - Jogo principal preservado no commit `3289e32`, sem tocar em saves, Database ou produção.
  - Piso de 650 no PixelLab.
  - Água animada incluída quando for viável.
  - Comparação mantida com os conceitos do ChatGPT e com os sprites do DS.
