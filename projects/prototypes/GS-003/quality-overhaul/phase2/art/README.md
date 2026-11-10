# Piloto comparativo — Guilmon, idle + walk, S e SW (à mão vs PixelLab)

- **Autor:** game-art, papel GAME-ART-DIRECTOR (ADR-012) · **Data:** 2026-11-09
- **Decisão do fundador que autoriza esta tarefa:** item 2 do pedido original de Fase 2, com a correção "quero ver a diferença lado a lado, produza as DUAS versões completas" (webchat, 2026-11-09) e a licença do personagem confirmada em `ADR-007`/`ADR-009` (ver `license.json` deste diretório).
- **Revisão independente:** esta prancha e os GIFs ficam aqui prontos para o `game-qa` revisar depois — eu não aprovo meu próprio protótipo.
- **Teto de geração autorizado para a via (b):** 6. **Gasto real: 5** (ver `pixellab_cost_log.csv`).

## 1. O que foi feito

Base: `CREATURE-0003` (Guilmon), rip oficial de Digimon World DS, 30×34px nativo, só direções S/N/W desenhadas no mapa (E é espelho de W). **Não existe direção SW no rip** — é um dos achados centrais deste piloto.

### (a) À mão — `pipeline-a/`, custo PixelLab = 0
Pixel editing exato via `pixelart_workbench` (sem IA generativa), sobre os frames já ripados:
- **Idle S/SW** (4 quadros): bob de respiração vertical ±1px sobre o frame de pé (`draw` com track de posição).
- **Walk S/SW** (6 quadros): o rip tem só 2 poses únicas por direção (`walk_00` e `walk_02` são o **mesmo arquivo byte-a-byte** — achado de QA, confirmado por `sha256sum`), então o ciclo nativo nunca alterna qual pé pisa à frente. Corrigido espelhando horizontalmente o frame de contato (`mirror_of` no `draw`) para gerar o contato com o pé oposto, e montando os 6 quadros (contato-A, passagem, contato-B espelhado, passagem, contato-A, passagem) com `join --as animation`.
- **SW não existe no rip**, então a via (a) **reaproveita o frame W** (técnica barata real de extensão 4→8 direções) com o mesmo tratamento de bob/contato — não é uma pose diagonal verdadeira.

### (b) PixelLab — `pipeline-b/`, teto 6 gerações
1. `create_character(mode="v3", reference_image_url=<frame S do rip>, n_directions=8)` — **1 geração** (referência 32×40px, `ceil(32*40*8/65536)=1`). Isso gera as 8 direções reais, **incluindo uma SW nova de verdade** (ângulo de câmera inédito, não existia em nenhum arquivo).
2. `animate_character(mode="v3")` para idle (4 quadros) e walk (6 quadros), direções S e SW, um job por direção (o plano trial só permite 1 geração simultânea): **4 gerações** (1 cada).
3. Total: **5 gerações**. `get_balance` antes = 26 restantes (14/40 usadas); depois = 21 restantes (19/40 usadas). Log completo em `pixellab_cost_log.csv`.

## 2. Entregas neste diretório

```
pipeline-a/{idle-s,idle-sw,walk-s,walk-sw}/*.gif   — clipes da via (a)
pipeline-b/{idle-s,idle-sw,walk-s,walk-sw}/*.gif   — clipes da via (b)
board/prancha_comparativa.png   — prancha estática mestra, 4 blocos empilhados (idle-S, walk-S, idle-SW, walk-SW), cada bloco com 2 linhas: linha de cima = (a) à mão, linha de baixo = (b) PixelLab, quadros em ordem da esquerda pra direita
board/compare_side_by_side.html — comparação ao vivo: abre no navegador, cada clipe lado a lado (a) | (b) tocando em loop (ver nota abaixo)
pixellab_cost_log.csv           — log de custo, com get_balance antes/depois
license.json                    — base ADR-007/009/010, origem do rip, obrigação de crédito
```

**Nota sobre o "GIF lado a lado" pedido:** a ferramenta de pixel art do estúdio (`pixelart_workbench join`) compõe pranchas **estáticas** (grade de quadros), não um GIF animado sincronizado com duas fontes lado a lado — e não há ImageMagick/ffmpeg/PIL disponíveis neste ambiente para montar isso localmente. Resolvido com duas entregas complementares: a prancha estática (`prancha_comparativa.png`, todos os quadros visíveis de uma vez) e uma página HTML (`compare_side_by_side.html`) que toca os dois GIFs nativos lado a lado ao vivo — na prática melhor para avaliar peso/timing do que um GIF único, porque preserva a animação de cada via sem reamostrar.

## 3. Avaliação como diretor de arte

**SW é o achado principal, não um detalhe técnico.** O rip nunca teve direção SW. A via (a), sendo zero-custo, **não pode inventar um ângulo de câmera novo** — só reaproveita a direção mais próxima que já existe (W). Isso é uma técnica real e barata (jogos de orçamento baixo fazem isso o tempo todo), mas é visivelmente uma direção errada, não uma diagonal verdadeira: o personagem não gira o suficiente. A via (b), com `create_character(v3, reference)`, resolve isso de verdade por ~1 geração — o SW gerado é uma pose 3/4 coerente, nas mesmas cores/proporções da referência, lendo como um ângulo de câmera real.

**Para S (direção que já existia), as duas vias ficam próximas em leitura**, porque o ponto de partida é o mesmo frame ripado nos dois casos. A diferença maior aqui é quem resolve o defeito que a auditoria (`VISUAL_AUDIT.md`) já tinha marcado "Precisa melhorar": o walk nativo nunca alterna qual pé pisa à frente (confirmado: os dois "frames de contato" do rip são o mesmo arquivo). A via (a) corrige isso manualmente (espelhar a perna) por zero custo — é um defeito que não precisa de IA para resolver, só atenção de quem edita.

**Defeito observado na via (b) que o `game-qa` precisa checar de perto:** em pelo menos 1 quadro do idle gerado (S, quadro 3 de 4) a silhueta ficou visivelmente mais fina que nos outros quadros — sintoma conhecido de deriva de identidade entre quadros em animação v3 por IA. Não compromete o clipe (4 quadros, loop rápido, pouco perceptível em jogo), mas é o tipo de defeito que só aparece quadro a quadro, não no preview 1x — registrar como item de QA antes de aprovar qualquer direção gerada por IA para produção.

**Recomendação de pipeline para o piloto completo (Guilmon + Dorumon + Tentomon + Tamer): híbrido, não uma via só.**
- Use PixelLab **uma vez por criatura** para resolver o que a via manual não resolve por preço nenhum: as direções/ângulos que o rip não tem (aqui, SW/SE/NE/NW — 4 das 8 direções de mapa em todo o roster atual, que só tem S/N/W desenhados). A um canvas pequeno (30–40px) isso saiu muito barato: 1 geração para as 8 rotações, ~1 geração por direção por animação.
- Depois, use a via manual (`pixelart_workbench`, custo zero) para **polir** o que sair do PixelLab: limpar o tipo de deriva de identidade acima, corrigir contato de pé, ajustar paleta — exatamente o laço `inspect → edit` que a ferramenta já foi desenhada para fazer de graça.
- Produzir tudo manualmente sem PixelLab é possível mas **não escala** para 8 direções × 4+ estados × 4 criaturas: cada direção nova sem pose-fonte precisa ser desenhada como reaproveitamento (perde qualidade) ou redesenho completo (muitas horas de agente/artista por direção).

## 4. Custo estimado do piloto completo (Guilmon + Dorumon + Tentomon + Tamer)

Escopo mínimo de qualidade por criatura, com base no `ANIMATION_STANDARD_V2` em elaboração e no que a auditoria já pediu: **4 estados** (idle, walk, attack, hurt) × **8 direções reais**.

| Via | Base de cálculo (medida neste piloto) | Gerações/criatura | Gerações, roster completo (4) | Custo PixelLab | Tempo de agente (ordem de grandeza) |
|---|---|---:|---:|---|---|
| **(a) só à mão** | 0 geração; cada direção nova sem fonte é reaproveitamento (perda de qualidade) ou redesenho manual | 0 | 0 | $0 | Alto e não-linear: ~10 chamadas de `pixelart_workbench` só para 2 estados × 2 direções neste piloto; 4 estados × 8 direções reais exigiria dezenas de chamadas por criatura, e direções sem pose-fonte **não alcançam o mesmo nível** (ver achado SW acima) |
| **(b) só PixelLab** | 1 (create_character 8-dir) + 4 estados × 8 direções × ~1 geração/direção neste tamanho de canvas | ≈ 33 | **≈ 132** | No plano trial (40 gerações, +5/dia): ~26–33 dias só para gerar; em plano pago, cada geração ≈ $0,10–0,15 nos tiers do PixelLab já vistos no estúdio → **ordem de $13–20 por criatura, ~$53–80 para o roster** (estimativa [H], não testado além deste piloto) | Baixo: poucos minutos por job, mas 1 geração simultânea no trial serializa tudo (~2–4 min/job) |
| **(c) híbrido (recomendado)** | PixelLab só para as 4 direções novas (SE/SW/NE/NW) de cada estado + polimento manual de todas as 8 | ≈ 17–20 | **≈ 70–80** | Metade do custo da via (b) pura, mesma cobertura de direções, qualidade final mais alta (polimento manual corrige o que a IA erra) | Médio: soma o tempo de edição manual ao de espera dos jobs, mas sem o gargalo de regerar direções que já existiam no rip |

**Leitura direta para o fundador:** a via 100% manual é grátis mas **não resolve** a lacuna de direções que a auditoria já apontou como o maior problema visual do roster (sem SE/SW/NE/NW reais em nenhuma criatura hoje); a via 100% PixelLab resolve, mas no plano trial atual o teto diário de gerações é o gargalo real (não o preço), e levaria quase um mês só para gerar o roster mínimo. **A via híbrida é a recomendação**: ela é a que mais reduz gerações gastas por criatura sem abrir mão de ter as 8 direções verdadeiras.

## 5. Limitações deste piloto

- Escala mantida no tamanho nativo do rip (30×34px / canvas de trabalho 32×40–48×48), **sem** aplicar ainda a escala nova de Rookie (44–52px) proposta em `ART_DIRECTION_V2.md` §1.2 — isso é um passo separado (redesenho real, não reescalonamento) e não foi testado aqui.
- Só testei S e SW, por pedido explícito; não testei as outras 6 direções, nem attack/hurt.
- A via (a) para SW é um reaproveitamento de W, não uma direção nova desenhada à mão — se o fundador quiser comparar "mão versus IA" especificamente para *desenhar um ângulo novo*, essa comparação ainda não foi feita (a via manual não tentou redesenhar SW do zero; isso teria custo de tempo de agente bem mais alto e não cabia no escopo desta prova rápida).
- Estimativas de custo da seção 4 fora deste piloto (ordem de $/criatura em plano pago) são **[H]** — hipótese com base nos preços já documentados pelo estúdio para o PixelLab, não uma cotação nova.
- `game-qa` ainda não revisou nada disto — ver nota de deriva de identidade acima.
