# GS-003: resumo executivo do discovery (2026-11-08)

**Pedido do fundador:** um idle de coleção de monstros simples e fácil, com modo automático e decisões reais, bom onboarding, desafio, eventos, ranking, chefe e masmorra. A base é o IdleDex ("similar e melhor"), com uma variante de monstros digitais para o público de Digimon.

## O que fizemos (4 partes)
1. Jogamos e destrinchamos IdleDex, Digi World Idle e Pokechill (`teardowns/`, 35 screenshots).
2. Jogamos e destrinchamos Auto Chess e Poke2D Arena. Battlegrounds não é jogo: é um canal de animação com votação.
3. Direção de arte com 4 testes no Recraft (`ART_DIRECTION_OPTIONS.md`, `art-tests/`) e análise de mercado e IP (`MARKET_AND_IP.md`).
4. Conceitos A e B (`GAME_CONCEPTS.md`) e business case (`BUSINESS_CASE.md`).

## Achados
- [E] As 6 referências usam nomes, sprites ou personagens oficiais de Pokémon e Digimon. Ser **original** é ao mesmo tempo nossa proteção jurídica e nosso diferencial.
- [E] Os concorrentes erram em três pontos: passividade (o IdleDex se joga sozinho), muro letal no início (o Digi World derrubou o time 2 vezes em 10 minutos) e UI poluída.
- [E] Mecânica não tem copyright, mas existem patentes (caso Nintendo × Pocketpair, ainda em andamento). Revisão jurídica antes de lançar.
- [E] No teste de arte, `emberkit` ficou parecido com o Charmander. Daí a regra de silhueta: nenhum monstro inicial pode ser lagarto de fogo, rato elétrico ou dinossauro laranja. O `cindervolt` (monstro digital) ficou original.
- [H] Projeções: de cerca de US$10/mês (conservador, 3 meses) a cerca de US$15,7 mil/mês (otimista, 12 meses), sem nenhum canal validado. O custo por imagem do Recraft não foi verificado.

## Recomendação do coordenador
**Um motor compartilhado, começando pela Linha A (coleção) na web.** Antes de qualquer MVP, um **protótipo vertical slice de 1 a 2 semanas** para testar a diversão:
- 6 a 9 criaturas, 2 zonas, 1 chefe com habilidade ativa e 1 masmorra de 3 a 4 andares com HP persistente.
- Sem monetização.
- Métrica: o jogador volta para decidir, não só para ver números subirem.

A Linha B (monstros digitais, BR) vem depois, sobre o mesmo motor.
Custo do protótipo: infraestrutura US$0; arte com cerca de 10 a 20 gerações no Recraft (custo não verificado).

**Kill criteria propostos:** D1 < 20%, D7 < 5%, sessão < 3 min, conversão < 0,5% em 60 dias, ou qualquer notificação de IP.

## Decisões do fundador
1. Aprovar o protótipo da Linha A (passagem DISCOVERY → PROTOTYPE, PHASE_GATES).
2. Plataforma: web primeiro.
3. Nomes provisórios: Faunário ou Capturis (A); NúcleoTam ou Byteera (B).
4. "Sem muro letal no começo, mas com desafio nos chefes e masmorras": de acordo?
5. Busca web: autorizar a atualização do OpenClaw.
