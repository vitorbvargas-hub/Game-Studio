# GDD — GS-003 Protótipo Linha B — Fan Game Digimon (nome provisório: Byteera / NúcleoTam)

> Template Game Studio. Datas em ISO. Marcação: **[E]** evidência (com fonte) · **[H]** hipótese de design não validada com jogador real.

- **Projeto:** GS-003 (fase PROTOTYPE, Linha B)
- **Autor (agente):** game-design
- **Data:** 2026-11-08 (revisado 2026-11-08 após ADR-007)
- **Status:** rascunho pronto para implementação de protótipo
- **Fontes:** `ADR-006-gs003-prototipo-linha-b.md`, `ADR-007-gs003-fan-game-pokemon-digimon.md`, `GAME_CONCEPTS.md` (seções 0, 3.B, 4), `EXECUTIVE_SUMMARY.md`, `teardowns/DIGIWORLDIDLE.md`, `ART_DIRECTION_OPTIONS.md` §5.1, Wikimon/Digimon Reference Book (consultado 2026-11-08)

> **⚠️ AVISO OBRIGATÓRIO (ADR-007, condição 3):** fan game não oficial e não comercial, sem afiliação com Bandai, Toei Animation ou qualquer detentor de direitos da franquia Digimon. Este aviso deve aparecer em toda tela de título/splash e material de divulgação; nenhum logo ou marca oficial pode ser usado.

---

## Pitch (1 frase)

Um Tamer forma vínculo com um parceiro Digimon oficial (Agumon, Gabumon ou Patamon) que caça e evolui sozinho em modo automático, enquanto o jogador toma decisões reais e visíveis — time, caminho de digivolução, habilidade de chefe e rota de masmorra — a cada 1-3 minutos, sem jamais perder progresso por um "wipe" surpresa no início. **Fan game não comercial** (ADR-007): usa nomes, atributos e linhas evolutivas oficiais de Digimon, com arte em pixel art redesenhada do zero pelo estúdio (nunca sprites extraídos de jogos/ROMs oficiais).

---

## Pilares de design

**[E, herdado de `GAME_CONCEPTS.md` §2, aplicado à Linha B]**

1. **Fácil de começar, impossível de ignorar.** O automático cobre o grind cru; o jogo sempre tem 1-2 decisões táticas reais pendentes.
2. **Nunca morto por surpresa.** Nenhuma zona de early game causa derrota sem aviso e sem chance de reagir. Desafio real é opcional e sinalizado (chefe, masmorra).
3. **Cada decisão é visível, compreensível e a tempo.** Toda escolha mostra o trade-off antes de confirmar.
4. **Fan game oficial, com limites claros (ADR-007).** Este protótipo usa nomes, atributos, tipos e linhas evolutivas **oficiais** de Digimon (Bandai/Toei) — exceção explicita e pontual do fundador à regra geral de `GOVERNANCE.md` contra uso de IP de terceiros, válida **somente para o GS-003** e sob as condições do ADR-007: sem monetização, arte redesenhada do zero (nunca sprites/sons ripados), sem logos/marcas oficiais em título ou material de divulgação, publicação exige nova aprovação separada, e conteúdo em content pack trocavel (ver `data/content-pack-digimon-oficial.json`).
5. **Sem UI poluída.** Máximo 5 elementos clicáveis visíveis por tela no protótipo (reação direta ao achado de `DIGIWORLDIDLE.md` §9.3: "sobrecarga de ícones/sistemas simultâneos").

---

## Core loop

### Divisão automático × decisão

| Ciclo | Automático | Jogador decide |
|---|---|---|
| **A cada ~1,5s (tick de combate)** | Ataque básico, habilidade passiva, cura de emergência (se aplicável) | — |
| **A cada 1-3 min** | Time caça na zona ativa, acumula Bits/XP/Dados, Varredura de espécie avança | **Time de 3:** montar/reordenar composição (até 3 slots) sempre que recruta uma nova espécie ou quer testar sinergia de Atributo |
| **A cada 1-3 min** | — | **Rota/zona:** escolher Zona 1 (segura) vs Zona 2 (arriscada, melhor retorno) vs entrar na Masmorra (custa Carga) |
| **A cada evolução (nível 8 / nível 16)** | — | **Linha de evolução ramificada:** confirmar evolução vendo o preview de Modo A (ofensivo) vs Modo B (defensivo) antes de confirmar |
| **A cada level-up** | — | **Alocação de treino:** distribuir 1 Ponto de Treino entre ATK/DEF/SPD da criatura |
| **Durante luta de chefe** | Dano calculado automaticamente | **1 habilidade de Sincronização** manual, com cooldown, acionada no momento certo |
| **Dentro da Masmorra** | Combate de cada sala | **Escolha de sala/andar:** avançar direto, arriscar sala "Instável" (risco/recompensa) ou usar o único item de reparo disponível no run |
| **Gestão contínua** | Regeneração passiva de Carga no hub | **Gestão de energia:** decidir que criatura manda caçar onde, equilibrando Carga disponível vs Dados-Linha (Zona 1) vs Dados-Ruído (Zona 2/Masmorra) necessários para o Modo de evolução desejado |

### Loop em 3 escalas (herdado de `GAME_CONCEPTS.md` §3.B, adaptado)

- **30 segundos:** parceiro em AUTO varre a zona, ataca, ganha Bits/XP; Varredura da espécie avança.
- **5 minutos:** jogador revisa 1 evolução pendente, aloca 1 Ponto de Treino, ajusta time, decide zona/masmorra.
- **1 sessão (15-20 min, escopo de protótipo — sem missão diária/evento, que ficam fora do escopo):** completa ao menos 1 run de masmorra ou 1 chefe de zona, vê o Bestiário avançar.

---

## Meta loop / progressão

1. **Nível (1-20, contínuo por linhagem).** Nível não reseta na evolução; a evolução troca a fórmula de stat aplicada a partir daquele nível (ver "Fórmulas").
2. **Evolução em 2 etapas:** Larva → Juvenil (nível 8) → Adulto (nível 16, ramificado em Modo A/Modo B).
3. **Bestiário (Varredura):** cada espécie ainda não recrutada acumula % de Varredura por encontro; ao chegar a 100%, a próxima vitória recruta a espécie automaticamente (sem RNG — decisão de design para reduzir frustração, ver "Riscos de design").
4. **Desbloqueio de zona/masmorra:** Zona 2 abre após o time atingir nível 6; Masmorra abre após derrotar o Chefe de Zona (Devimon) pelo menos 1 vez.
5. **Sem prestígio/reset no protótipo** — fora de escopo (ver "Escopo do MVP vs pós-MVP").

---

## Economia (fontes, sumidouros, moedas)

| Recurso | Fonte | Sumidouro no protótipo | Observação |
|---|---|---|---|
| **Bits** (moeda soft) | Vitória = Nível do inimigo × 5 | **Nenhum funcional no protótipo** — só contador visível, preparando terreno para loja pós-protótipo | **[H]** decisão de escopo: sem sumidouro intencional aqui porque não há loja/monetização no protótipo (regra do ADR-006) |
| **Dados-Linha** | Vitória em Zona 1 contra a própria linhagem (+2) ou qualquer vitória em Zona 1 (+1 genérico) | Evolução (consumido ao evoluir) | Empurra Modo A/B da evolução para o lado "estável/defensivo" se acumulado em excesso (ver "Fórmulas") |
| **Dados-Ruído** | Vitória em Zona 2 ou Masmorra (+2) | Evolução (consumido ao evoluir) | Empurra o Modo para o lado "ofensivo" se acumulado em excesso |
| **Carga (energia)** | Regenera +1/min por criatura parada no hub | Caçar em Zona 1 (−1/min), Zona 2 (−2/min), entrar na Masmorra (−20 fixo + −3/min por andar) | Não é moeda acumulável entre sessões — cap 100 por criatura, zera o incentivo a farmar infinito numa única zona |
| **Ponto de Treino** | +1 por level-up | Alocação manual em ATK/DEF/SPD (1 ponto = +2% no growth atual do stat, cap 20 pontos por criatura) | Decisão de build real, não automática |

---

## Coleção / conteúdo

### Tipagem — Atributo oficial Digimon (Vaccine/Data/Virus)

**[E, Wikimon/Digimon Reference Book, 2026-11-08]** O protótipo usa o sistema oficial de atributos da franquia, agora autorizado pelo ADR-007. Vantagem circular: **Vaccine > Virus > Data > Vaccine**. Vantagem = ×1,25 no dano; desvantagem = ×0,8; neutro = ×1,0.

**[H]** Nenhuma das 3 linhagens do roster inicial tem representante de atributo Virus — a vantagem concreta que aparece no protótipo é Data > Vaccine (Gabumon/Patamon, atributo Data, têm vantagem contra Agumon/Greymon, atributo Vaccine). Virus fica reservado para futuros encontros fora do escopo dos 9.

### Roster do protótipo — 9 Digimon oficiais (3 linhagens × 3 estágios)

**[E, Wikimon/Digimon Reference Book, consultado 2026-11-08]** Linhas evolutivas clássicas de Digimon Adventure (1999). Nomes, atributo, tipo e golpe especial são conteúdo oficial (Bandai/Toei) — a arte deve ser **redesenhada do zero** pelo estúdio em pixel art a partir da descrição textual oficial, nunca ripada de jogos/ROMs (ADR-007, condição 2).

| # | Espécie | Linhagem | Estágio oficial | Atributo | Tipo oficial | Golpe especial oficial | Papel |
|---|---|---|---|---|---|---|---|
| 1 | **Koromon** | Agumon | Baby II (Lv1-7) | Vaccine | Lesser | Bubble Blow | Suporte/controle |
| 2 | **Agumon** | Agumon | Child/Rookie (Lv8-15) | Vaccine | Reptile | Baby Flame | Atacante versátil |
| 3 | **Greymon** | Agumon | Adult/Champion (Lv16-20) | Vaccine | Dinosaur | Mega Flame | Modo ofensivo = atacante burst / Modo defensivo = tanque |
| 4 | **Tsunomon** | Gabumon | Baby II (Lv1-7) | Nenhum (oficial, sem atributo neste estágio) | Lesser | não documentado | Suporte |
| 5 | **Gabumon** | Gabumon | Child/Rookie (Lv8-15) | Data | Reptile | Petit Fire | Atacante físico |
| 6 | **Garurumon** | Gabumon | Adult/Champion (Lv16-20) | Vaccine (primário)/Data (secundário, fontes variam) | Beast | Fox Fire | Modo ofensivo = DPS físico / Modo defensivo = tanque |
| 7 | **Tokomon** | Patamon | Baby II (Lv1-7) | Nenhum (oficial, confirmado 2026-11-08) | Lesser | não documentado | Suporte/cura |
| 8 | **Patamon** | Patamon | Child/Rookie (Lv8-15) | Data | Mammal | Air Shot / Hane Binta | Suporte/cleave |
| 9 | **Angemon** | Patamon | Adult/Champion (Lv16-20) | Vaccine | Angel | Heaven's Knuckle | Modo ofensivo = cleave/burst / Modo defensivo = sustain |

**[H, decisão de design mantida do rascunho anterior, ver "Riscos de design"]** A digivolução de Child para Adult é ramificada por **Modo** (ofensivo/defensivo) dentro do mesmo Digimon oficial (ex.: Greymon ofensivo vs. Greymon defensivo) — não existem 2 Digimon oficiais distintos por ramo; isso preserva o número exato de 9 criaturas pedido. **[H]** Perfil oficial de Koromon descreve o estágio Baby II como "ainda incapaz de batalhar" — decisão de design do protótipo ignora essa regra de flavor por motivo de jogabilidade (o onboarding exige vitória antes de 1min30).

Dados completos (stats, habilidades, requisitos de evolução, fontes) em `prototype/data/content-pack-digimon-oficial.json` e na seção "Fórmulas" abaixo.

### Áreas de caça (2)

| Zona | Nível de inimigos | Encontros selvagens | Taxa base (design, [H]) | Observação |
|---|---|---|---|---|
| **Zona 1 — Campo de Bits** (tutorial) | 1-5 | Baby II das 2 linhagens que o jogador não escolheu como inicial (45%/45%) + Baby II da própria linhagem (10%, farma Dados-Linha) | 15 XP/min, 10 Bits/min | Nunca causa wipe (cura de emergência, ver "Curva de dificuldade") |
| **Zona 2 — Distrito Metálico** (intermediária) | 6-13 | Agumon/Gabumon/Patamon (Child, 33% cada) | 30 XP/min, 22 Bits/min | Abre em nível 6; após 10 vitórias contra Child-stage, libera o botão de luta contra o Chefe de Zona |

### Chefe e Masmorra

**[H, decisão de escopo do coordenador — ver "Riscos de design"]** O chefe escolhido é **Devimon** — vilão clássico de Digimon Adventure (1999), Fallen Angel/Adult, golpe especial oficial "Death Claw", originalmente da mesma espécie de Angemon antes de cair ao Dark Area (perfil oficial, [E]). Para caber no orçamento R$0 do protótipo, o Chefe de Zona e o Chefe final da Masmorra são o **mesmo Devimon em 2 níveis de força** — reaproveita 1 asset de arte em vez de 2. **[H]** Devimon não tem uma segunda forma/digivolução oficial em Digimon Adventure (1999); a "forma plena" da masmorra é uma reescala de dificuldade do mesmo Devimon, não uma forma canônica distinta — nomeada "Devimon em força plena" para não sugerir um nome oficial inexistente.

- **Chefe de Zona — Devimon** (fim da Zona 2, nível 14). Atributo oficial **Virus** **[E, Wikimon/Digimon Reference Book, confirmado 2026-11-08]** (também listado como "Free" em uma fonte secundária posterior; usamos a ficha de referência primária, mesma convenção do resto do roster). Dano travado: nunca reduz nenhuma criatura do time abaixo de 1 HP. Ensina a habilidade de Sincronização sem risco real de derrota.
- **Masmorra — Brecha Instável.** 4 andares ("Setores"), HP **não** recupera entre andares, exceto 1 item "Fragmento de Reparo" (cura 40% HP do time), usável 1x por run. Inimigos dos Setores 1-3 = Greymon/Garurumon/Angemon em nível mais alto (stats ×(1 + 0,15×andar) sobre a base Adult, reaproveita os mesmos dados do content pack). Setor 4 = **Devimon (força plena)** (nível 20, dano real — pode derrotar o time; derrota só termina o run, sem perda de Bits/Dados/XP já conquistados nos Setores 1-3).

---

## Personagens / mundo (fan game, conteúdo oficial Digimon)

**[H]** O jogador é um **Tamer** que recebe um parceiro Digimon oficial (Koromon, Tsunomon ou Tokomon, que digivolui logo em seguida para Agumon, Gabumon ou Patamon) ao entrar pela primeira vez no Mundo Digital — fantasia minimalista, sem lore extensa (reação direta ao achado de `teardowns/DIGIWORLDIDLE.md` §9.2: "3 falas de lore antes de qualquer gameplay" prejudica o onboarding). 1 NPC guia (sem nome próprio no protótipo, ex. "Guia-Sistema") dá 1 instrução por etapa, nunca um bloco de texto. Zonas e masmorra mantêm nome **original** do estúdio (Campo de Bits, Distrito Metálico, Brecha Instável) — ADR-007 autoriza monstros oficiais, não exige geografia oficial (ex.: File Island), e manter os locais originais reduz a superfície de IP do protótipo. **Nenhum logo, marca ou nome de Tamer oficial (ex.: Taichi/Tai, Yamato/Matt) é usado**, conforme ADR-007 condição 3.

---

## Fórmulas (implementáveis, [H] — valores de balanceamento não testados com jogador real)

### Stats por nível
```
Stat(nível) = Base_do_estágio + Growth_do_estágio × (nível − nível_inicial_do_estágio)
```
Larva: nível_inicial = 1. Juvenil: nível_inicial = 8. Adulto: nível_inicial = 16 (Modo A ou Modo B, conforme evolução).

### Dano
```
Dano = round( max(1, ATK_atacante × (Potência/100) − DEF_defensor × 0.5) × MultAtributo × Variância )
```
- `Potência` = 100 para ataque básico; cada habilidade define sua própria potência (ex. habilidades de Sincronização usam % de ATK, ver tabela de habilidades em `creatures.json`).
- `MultAtributo` = 1,25 (vantagem) / 0,8 (desvantagem) / 1,0 (neutro), conforme o ciclo oficial Vaccine > Virus > Data > Vaccine.
- `Variância` = aleatório uniforme entre 0,9 e 1,1.
- Crítico: 5% de chance, ×1,5 no dano final.
- Tick de combate automático: 1 ataque básico por criatura ativa a cada 1,5s.

### XP e nível
```
XP_para_próximo_nível(n) = round(20 × n^1.5)
XP_por_vitória = 8 × Nível_do_inimigo
```
Nível máximo no protótipo: 20.

### Varredura (recrutamento de espécie selvagem)
```
Varredura_% += 25% por encontro resolvido (vitória ou derrota), cap 100%
```
Ao atingir 100%, a **próxima vitória** contra aquela espécie recruta 1 cópia automaticamente para o Banco de Parceiros. Determinístico — sem RNG de captura (ver "Riscos de design", item sobre frustração).

### Evolução ramificada
```
Larva → Juvenil: nível ≥ 8 E Dados_totais_acumulados ≥ 30
Juvenil → Adulto: nível ≥ 16 E Dados_totais_acumulados ≥ 60
  Modo resultante:
    SE Dados-Linha_gastos_no_momento ≥ Dados-Ruído_gastos_no_momento → Modo B (defensivo)
    SENÃO → Modo A (ofensivo)
```
A tela de evolução mostra a proporção atual Dados-Linha vs Dados-Ruído e qual Modo resultaria **antes** de confirmar — o jogador pode esperar e farmar mais de um tipo para mudar o resultado (decisão real e informada, pilar 3).

### Carga (energia) e offline
```
Carga_max = 100 por criatura
Regeneração no hub = +1/min
Consumo: Zona 1 = −1/min · Zona 2 = −2/min · Masmorra = −20 fixo (entrada) + −3/min por Setor
Ao chegar a 0, a criatura retorna ao hub automaticamente (sem penalidade)

Cap_offline = 240 min (4h) — sem camada premium no protótipo
Fator_offline = 0.5
Ganho_offline(XP|Bits|Dados) = min(minutos_offline, 240) × (taxa_por_minuto_da_zona_ativa × 0.5)
```

### Curva de dificuldade (implementa o pilar "nunca morto por surpresa")
```
SE HP_do_time ≤ 15% DURANTE combate normal (Zona 1/Zona 2, fora de chefe/masmorra):
    cura automática única de 30% do HP máximo do time, 1x por sessão de caça (reseta ao voltar ao hub)
```
- Chefe de Zona (Devimon): dano travado, nunca reduz HP de nenhuma criatura abaixo de 1.
- Masmorra Setores 1-3: inimigos ×(1 + 0,15 × número_do_Setor) sobre os stats base Adult (Greymon/Garurumon/Angemon) correspondente.
- Masmorra Setor 4 (Devimon em força plena): dano real, pode derrotar o time — é o único ponto do protótipo onde a derrota é possível por design; derrota não causa perda de Bits/Dados/XP já ganhos no run (só perde o progresso dentro daquele run de masmorra).

---

## Ajuste de balanceamento — Zona 2 (2026-11-08)

**[E, medido nesta sessão por game-design via simulação determinística do motor real]** O game-dev reportou que o Distrito Metálico (Zona 2, abre no Nv 6, inimigos Nv 6-13) derrotava o time Nv 6 cerca de 7 vezes seguidas até o 1º chefe (`tests/packs_playable.test.ts`, log `[digimon-fan] derrotas até o 1º chefe: 7`), violando o pilar 2 ("nunca morto por surpresa"). Causa raiz: o nível dos inimigos de onda é sorteado uniformemente em todo o `levelRange` da área a cada combate (não escala com o progresso do time), então mesmo um time recém-chegado ao Nv 6 pode encontrar inimigos Nv 11-13 imediatamente — e o time ainda está no estágio Baby II (Koromon/Tsunomon/Tokomon) até o Nv 8, quando evolui para Child. Essa é a janela de risco real.

**Método de medição:** simulação do motor real (`src/sim/battle.ts`, mesmas fórmulas de dano/afinidade/crítico do jogo), rodando a onda da Zona 2 (`distrito_metalico`) centenas/milhares de vezes por nível de time, com o time sempre curado a 100% no início (replica `restHealPct: 1` da área — toda onda começa com HP cheio, vitória ou derrota anterior). Métrica: % de vitórias por onda = "taxa de vitória nas ondas comuns" pedida como meta.

**Antes do ajuste** (`packs/digimon-fan/creatures.json` original, placeholder do game-dev):

| Nível do time (estágio) | Taxa de vitória por onda |
|---|---|
| 6 (Baby II) | 75,0% |
| 7 (Baby II) | 81,7% |
| 8-13 (Child) | 94,0%-100,0% |

O Nv 6 (nível de desbloqueio da zona) ficava abaixo da meta de 80%. Decompondo por nível do inimigo sorteado no Nv 6: contra inimigo Nv 6-8 a taxa era 98-100%; contra Nv 11-13 caía para 52-65% — essa combinação (onda difícil + time ainda Baby II) gera as sequências de derrota.

**Ajuste aplicado em `packs/digimon-fan/creatures.json`:** Baby II (Koromon/Tsunomon/Tokomon) não têm stat numérico oficial para este motor (idle-RPG original, sem base em jogo oficial) — eram placeholder do game-dev. Game-design definiu os valores finais **[H, balanceamento do estúdio, validado por simulação]**: HP/ATK/DEF (`base` e `growth`) de Koromon, Tsunomon e Tokomon subiram ~15% sobre o placeholder original; SPD não mudou. Child (Agumon/Gabumon/Patamon) já atendia a meta na simulação e **não foi alterado**. `enemies.json` (inimigos selvagens), `balance.json` (fórmulas globais) e `areas.json` (`levelRange`, `unlock`, composição das ondas) também não foram alterados — o ajuste de stats de Baby II foi suficiente para atingir a meta sem estreitar o intervalo de nível dos inimigos ou achatar a escalada de dificuldade da zona.

**Depois do ajuste** (mesma simulação, dados reais de `packs/digimon-fan/`):

| Nível do time (estágio) | Taxa de vitória por onda |
|---|---|
| 6 (Baby II) | 83,9% |
| 7 (Baby II) | 90,3% |
| 8 (Child, recém-evoluído) | 95,5% |
| 9-13 (Child) | 98,8%-100,0% |

Todos os níveis ficam ≥ 80% (meta atingida com margem). No teste de jogo completo (`tests/packs_playable.test.ts`, time autojogado do Nv 1 até vencer o 1º chefe, `npm test`), as derrotas registradas até o 1º chefe caíram de 7 para **1**.

**Chefe Devimon:** a decisão obrigatória de Sincronia (pausa em 100% e 50% do HP do chefe, `decisionAtHpPct: [100, 50]`) já existia e segue acionando corretamente (confirmado na simulação: média de 2 decisões por luta). O chefe de zona mantém `lethal: false` (dano travado, nunca derrota o time) — não houve necessidade de mudar isso para cumprir "chefe pede uma decisão do jogador" sem custar o pilar de segurança do começo de jogo.

**Limitações desta medição [H]:** a simulação roda só a batalha em si (sem o restante do loop: viagem, evolução, Carga), mas reflete fielmente as fórmulas e dados reais porque chama as mesmas funções do motor (`createBattle`/`stepBattle`) usadas pelo jogo. Não substitui playtest humano — é a validação possível sem jogador real, conforme já assumido nas "Limitações deste documento". `npm test` (48 testes, suite completa) passa sem alterações nos testes, só nos dados do pacote.

## Retenção (sessão, D1, D7, D30)

**[H] — fora de escopo de medição real no protótipo (sem usuários externos), mas o design já prepara os ganchos:**

- **Sessão:** loop de 1-3 min de decisão garante que a sessão nunca fique "morta" por mais de poucos minutos (pilar 1).
- **D1:** gancho é a digivolução pendente (Baby II→Child normalmente bate perto do fim da 1ª sessão) — o jogador volta para ver o resultado da escolha de Modo.
- **D7/D30:** fora de escopo do protótipo (sem missão diária, evento semanal ou passe — ver "Escopo"). Ficam como hipótese para a fase MVP, não implementados aqui.

---

## Monetização integrada ao design

**Nenhuma, de nenhum tipo, no protótipo** — por decisão explícita do ADR-006, reforçada pelo ADR-007 condição 1 ("sem venda, anúncios, doações vinculadas ao jogo, IAP nem coleta de dados para fins comerciais"), já que o GS-003 Linha B agora usa IP oficial de Digimon e não pode ter caso de negócio direto. Bits existem apenas como contador visível sem sumidouro funcional; nenhuma tela ou sistema de loja é implementado.

---

## Onboarding — minuto a minuto

| Tempo | O que acontece | Tipo |
|---|---|---|
| **0:00–0:30** | Nome do Tamer (campo único, sem formulário longo) + escolha de 1 dos 3 parceiros iniciais (tela mostra o bebê Koromon/Tsunomon/Tokomon e, em preview, a forma Agumon/Gabumon/Patamon em que ele digivolui), cada um com 1 frase de fantasia curta | **Decisão #1** |
| **0:30–1:30** | 1 NPC guia dá 1 instrução única; primeira batalha manual-guiada (1 toque de ataque) contra inimigo com HP reduzido propositalmente | **Primeira vitória garantida antes de 1:30** |
| **1:30–2:00** | Varredura ensinada com escolha real: 2 Digimon selvagens de linhagens diferentes aparecem, jogador escolhe qual enfrentar primeiro | **Decisão #2 — primeira escolha significativa, antes de 2:00** |
| **2:00–3:00** | Botão AUTO introduzido com 1 overlay único (nunca empilhado); Bits explicado na mesma tela | Automação |
| **3:00–4:30** | Primeiro level-up dispara alocação de 1 Ponto de Treino (ATK/DEF/SPD) | **Decisão #3** |
| **4:30–6:00** | Mini-encontro com o Chefe de Zona em versão reduzida (dano travado), ensina a habilidade de Sincronização (1 toque no botão) | **Decisão #4** (sem risco real) |
| **6:00–7:00** | Hub se abre com Zona 1 / Zona 2 (bloqueada até nível 6) / Masmorra (bloqueada até derrotar o Chefe) visíveis, UI agrupada em no máximo 3 blocos | Exploração do hub |
| **7:00–8:30** | Primeiro Digimon perto de digivoluir (Baby II→Child): tela de digivolução mostra o requisito e, quando aplicável, o preview de Modo ofensivo/defensivo | **Decisão #5** |
| **8:30–10:00** | Explicação do teto de Carga/offline (240 min) e primeira escolha real de para onde mandar o time: continuar na Zona 1 segura ou arriscar a Zona 2 | **Decisão #6** |

### Nota de implementação (2026-11-08, game-dev, correção do Bug #3 de `qa/QA_REPORT_PROTOTYPE_B.md`)

O protótipo implementa as Decisões #1–#3 desta tabela. Onde a regra mudou ou foi detalhada em relação ao texto acima:

- **Decisão #1:** a escolha de 1 dos 3 parceiros está implementada (card mostra o Baby II, o Atributo e a forma Child no nível de evolução). **Não implementados:** campo de nome do Tamer, NPC-guia e batalha manual-guiada; a 1ª vitória continua automática.
- **Decisão #2 (mudança de regra):** a escolha de encontro **se repete**. A 1ª vem após 3 vitórias (medido: 0:21–0:30) e as seguintes a cada 25 vitórias (~1:15–1:45), sempre entre 2 ondas de composição diferente, com a % de Varredura visível. Sem resposta em 15 s, a 1ª opção entra sozinha, para o idle nunca travar. Ela cumpre o "Rota/zona a cada 1-3 min" do core loop enquanto Carga e Masmorra não existem. A Varredura segue a fórmula do GDD (+25% por encontro; a próxima vitória após 100% recruta). O recruta entra direto no time (até 3) no nível do selvagem derrotado; ainda não existe Banco de Parceiros nem Bestiário.
- **Decisão #3 (mudança de regra):** 1 Ponto de Treino por level-up, com teto de 20 por criatura. Cada ponto dá **+2% no valor do stat** (ATK, DEF ou VEL), e não "+2% no growth" como diz a tabela de Economia, porque 2% do growth (~0,03 por nível) seria imperceptível. Pontos não alocados se acumulam sem prazo.
- **Começo solo sem derrota (substitui a "cura automática única" de "Curva de dificuldade", que não foi implementada):** no Campo de Bits, a onda nunca traz mais selvagens que criaturas no time, e o nível do selvagem fica limitado ao maior nível do time + 2.
- **Decisões #4–#6:** sem mudança e ainda **não implementadas** como passos de onboarding (o mini-chefe tutorial não existe; Sincronia, evolução e viagem existem, mas ocorrem depois dos 10 min).
- **Medição [E] (simulação determinística, `prototype/game/tests/onboarding_pacing.test.ts`, 3 parceiros × 3 seeds, jogador com 3 s de reação, 2026-11-08):** decisão #1 em 0:00; 1ª escolha de encontro entre 0:21 e 0:30; maior intervalo entre decisões novas entre 72 s e 93 s; 16–22 decisões em 10 min; 0 derrotas; time completo (3) e Nv 5–6 aos 10 min. **[H]** Ainda não validado com jogador real. O ritmo pode cansar (escolhas demais) e precisa de playtest.

---

## Telas do protótipo

1. **Título / Novo Tamer** — campo de nome, botão "Começar".
2. **Escolha de Parceiro** — 3 cards (Koromon→Agumon / Tsunomon→Gabumon / Tokomon→Patamon), 1 frase de fantasia cada, botão "Confirmar".
3. **Combate** — HP do time, toggle AUTO, botão de Sincronização (visível apenas em luta de chefe), log de batalha compacto (3 últimas linhas, não histórico infinito).
4. **Bestiário / Varredura** — lista das 9 espécies, barra de % de Varredura por espécie não recrutada, ícone de recrutada.
5. **Time e Treino** — até 3 slots de time, drag para reordenar, botão de alocação de Ponto de Treino por criatura.
6. **Digivolução** — preview do Modo ofensivo vs Modo defensivo com barra comparativa de Dados-Linha/Dados-Ruído, botão "Confirmar digivolução".
7. **Hub / Mapa** — 3 botões grandes (Zona 1, Zona 2, Masmorra), indicador de Carga por criatura.
8. **Masmorra** — indicador de Setor atual (1-4), HP persistente visível, botão "Avançar", botão de uso do Fragmento de Reparo (1 uso por run).
9. **Resultado (Chefe/Masmorra)** — resumo de vitória/derrota, recompensas ganhas, botão "Voltar ao hub".

### Wireframes textuais (orientação de UI limpa — reação direta à UI poluída do IdleDex/Digi World Idle)

```
[HUB]
+-----------------------------------+
|  Carga: Agumon 62% | Gabumon 80%  |
|                                    |
|   [ ZONA 1 ]   [ ZONA 2 ]  [ MASMORRA ]
|   (sempre      (nível 6+)   (pós-chefe)
|    disponível)                     |
+-----------------------------------+
Máximo 3 botões grandes + 1 linha de status. Sem ícones secundários.
```

```
[COMBATE]
+-----------------------------------+
| Time: [HP ===   ] [HP ======] [HP =]|
| Inimigo: [HP =====]                |
|                                     |
|  [ AUTO: ON ]     [ SINCRONIA ]*    |
|  * só aparece em luta de chefe      |
|                                     |
| > Agumon usou Baby Flame            |
| > Gabumon causou 14 de dano         |
+-----------------------------------+
Log de 3 linhas, sem popup sobreposto.
```

```
[EVOLUÇÃO / DIGIVOLUÇÃO]
+-----------------------------------+
|  Gabumon está pronto para digivoluir |
|                                      |
|  Dados-Linha: 38   Dados-Ruído: 52  |
|                                      |
|  Resultado atual: Garurumon (Modo Ofensivo) |
|  [ Farmar mais Dados-Linha ]        |
|  [ Confirmar digivolução agora ]    |
+-----------------------------------+
Trade-off visível e numérico antes de qualquer clique definitivo.
```

```
[MASMORRA — Brecha Instável]
+-----------------------------------+
|  Setor 2 de 4                       |
|  HP do time (persistente): 54%      |
|  Fragmento de Reparo: disponível(1) |
|                                      |
|  [ AVANÇAR ]   [ USAR FRAGMENTO ]   |
+-----------------------------------+
```

---

## Dados em formato JSON

**Content pack (ADR-007, condição 5):** todo o conteúdo de identidade dos Digimon (nomes, atributo, tipo, golpe especial oficial) fica isolado em 1 arquivo trocavel, separado das mecânicas/fórmulas — uma futura versão comercial com monstros originais troca apenas esse arquivo, sem retrabalho de motor.

- `prototype/data/content-pack-digimon-oficial.json` — **content pack**: as 9 espécies oficiais (estágio, atributo, tipo, golpe especial, stats base/growth por estágio, habilidade passiva, habilidade de Sincronização, requisitos de digivolução) + dados do chefe Devimon.
- `prototype/data/zones.json` — Zona 1 e Zona 2: nível de inimigos, tabela de encontros (referenciando IDs do content pack), taxas base de XP/Bits.
- `prototype/data/dungeon.json` — Brecha Instável: 4 Setores, multiplicador de dificuldade, item de reparo.
- `prototype/data/bosses.json` — Devimon (forma de zona e forma plena de masmorra): stats, trava de dano, habilidades, golpe especial oficial.
- `prototype/data/formulas.json` — constantes de todas as fórmulas de mecânica (dano, XP, carga, offline, dificuldade) — **não muda** com a troca de content pack.
- `prototype/data/creatures.json` — **obsoleto** (stub de depreciação apontando para o content pack atual); mantido apenas para não quebrar referências antigas.

---

## Escopo do MVP vs pós-MVP

**Dentro do protótipo (este GDD):**
- 9 Digimon oficiais, 2 zonas, 1 entidade de chefe (Devimon, 2 níveis de força), 1 masmorra de 4 andares.
- Sistema de Atributo oficial (Vaccine/Data/Virus), digivolução ramificada por Modo, Varredura determinística, Carga, Pontos de Treino.
- Sem loja, sem ranking, sem missão diária, sem evento, sem guilda, sem passe (todos herdados de `GAME_CONCEPTS.md` §4 "fora de escopo do protótipo", reforçado por ADR-007 condição 1).

**Pós-protótipo (MVP, fora deste documento):**
- Linha A (coleção estilo Pokémon-like) sobre o mesmo motor.
- Ranking (mesmo que local/mock no MVP inicial), missões diárias, eventos semanais/comunitários, passe de 3 camadas, guildas.
- Monetização de conveniência/cosmética (a validar com game-growth).
- Ampliação do roster além das 9 criaturas do protótipo.

---

## Riscos de design

1. **[E] ADR-007 substitui a exigência de originalidade do ADR-006/GOVERNANCE para o GS-003.** A versão anterior deste documento usava criaturas 100% originais e um sistema "Protocolo" para evitar a tríade oficial Vaccine/Virus/Data (sinalizada como risco de IP em `teardowns/DIGIWORLDIDLE.md` §10). O ADR-007 (fundador, 2026-11-08) torna isso uma **exceção explícita e pontual**, válida só para o GS-003, sob 5 condições (sem monetização, arte redesenhada sem ripar, sem logos/marcas, publicação exige nova aprovação, content pack trocavel). Este GDD foi revisado para usar nomes/atributos/tipos/golpes oficiais. **Risco aceito pelo fundador (ADR-007):** notificação de remoção (DMCA/C&D) se publicado — por isso a publicação continua exigindo aprovação separada e o padrão é uso local/privado.
2. **[H] Digivolução ramificada implementada como Modo ofensivo/defensivo, não Digimon oficial distinto.** O pedido explícito de 9 Digimon (3 linhagens × 3 estágios) é incompatível matematicamente com uma ramificação que usasse 2 Digimon oficiais diferentes por linhagem no estágio Adult (isso daria 15 espécies, não 9). A solução adotada — 1 Digimon Adult oficial por linhagem (Greymon/Garurumon/Angemon) com 2 Modos mutuamente exclusivos, decidido pela proporção de Dados acumulados — preserva a decisão real do jogador e o número pedido, sem inventar nem sugerir uma forma canônica que não existe. Se o fundador quiser digivoluções alternativas oficiais de fato (ex.: Agumon também digivolui para Tyrannomon em alguns jogos oficiais), isso expande o roster para 15 e exige nova decisão de escopo/orçamento de arte.
3. **[H] Escolha do chefe Devimon e reaproveitamento em 2 níveis de força.** O ADR-007/pedido do coordenador citou apenas os parceiros (Agumon/Gabumon/Patamon) como exemplo; a extensão para usar Devimon como chefe oficial (em vez de um chefe original) foi uma decisão deste documento, pela coerência temática de um fan game 100% oficial e pelo vínculo canônico com a linhagem Patamon/Angemon. Devimon não tem uma segunda forma oficial em Digimon Adventure (1999); a "força plena" da masmorra é só uma reescala de dificuldade, não um nome canônico. Se o fundador preferir um chefe original ou outro Digimon oficial, é ajuste de conteúdo no content pack, sem mudar mecânica.
4. **[H] Pipeline de arte pixel art ainda não existe, e agora tem uma restrição adicional.** O ADR-006 já exigia pixel art à mão/por código, R$0; o ADR-007 condição 2 acrescenta que os sprites devem ser **redesenhados do zero** representando os Digimon oficiais — **proibido ripar** sprites/sons/músicas de jogos, ROMs ou sites oficiais. Nenhum pipeline de redesign existe ainda; é bloqueio em aberto para game-art. O protótipo pode rodar com placeholders geométricos coloridos por Atributo enquanto isso.
5. **[H] Todos os valores numéricos de balanceamento (dano, XP, taxas, custo de Carga) são hipóteses de design, não testadas com jogador real.** Exceção: os stats de Baby II/Child e a taxa de vitória da Zona 2 foram validados por simulação do motor real em 2026-11-08 (ver §"Ajuste de balanceamento — Zona 2"), mas simulação não substitui playtest humano. Os demais números (dano, XP, Carga, masmorra) seguem não testados — recomenda-se 1 rodada de ajuste após o primeiro playtest interno.
6. **[H] Recrutamento 100% determinístico (sem RNG de captura).** Decisão deliberada para reduzir frustração (reação ao problema de "muro letal"/atrito do Digi World Idle), mas reduz a tensão de "sorte de captura" que existe nos concorrentes — a validar se isso é sentido como "fácil demais" no playtest.
7. **[E, confirmado 2026-11-08]** Atributo oficial de Devimon e dos estágios Baby II de Tsunomon/Tokomon — pendência resolvida nesta sessão via Wikimon/Digimon Reference Book: Tsunomon e Tokomon têm atributo oficial **"None"** no estágio Baby II (mapeado para `free`/neutro no pacote, que já era o valor usado — sem mudança de dados necessária). Devimon tem atributo oficial **Virus** na ficha de referência primária (também aparece como "Free" em uma fonte secundária de um jogo posterior; mantivemos a ficha de referência primária por consistência com o resto do roster) — `packs/digimon-fan/enemies.json` atualizado de `free` para `virus` no Devimon (chefe de zona e forma plena da masmorra). Efeito mecânico: o time evoluído (Greymon/Garurumon/Angemon, todos `vaccine`) ganha vantagem de dano (×1,25) contra Devimon e recebe menos dano dele (×0,8), pelo ciclo oficial Vaccine > Virus > Data > Vaccine — torna o chefe de zona (já protegido por dano travado) ainda mais seguro como tutorial; o impacto na masmorra (Devimon em força plena, dano real) não foi reavaliado nesta sessão, pois estava fora do escopo do pedido (rebalanceamento da Zona 2).

---

## Métricas do teste interno e critério de sucesso

**[H] Teste interno** (equipe do estúdio e/ou poucos testadores convidados — protótipo ainda não tem usuários externos; estas são metas de design para o playtest, não dados coletados).

| Métrica | Como medir (protótipo, sem analytics real) | Meta |
|---|---|---|
| Tempo até Decisão #1 | Cronômetro manual/observação | ≤ 30s |
| Tempo até primeira vitória | Cronômetro manual/observação | ≤ 1min30s |
| Tempo até Decisão #2 (primeira escolha significativa) | Cronômetro manual/observação | ≤ 2min |
| % do tempo de sessão em telas de decisão (time/evolução/masmorra) vs tela de combate em AUTO puro | Anotação do observador por sessão | ≥ 25% |
| Taxa de conclusão de pelo menos 1 run de masmorra até o Setor 4 (vitória ou derrota, sem abandono por frustração) | Contagem direta | ≥ 60% dos testadores |
| Resposta pós-sessão à pergunta "você sentiu que voltou para decidir algo, ou só para ver o número subir?" | Pesquisa de 1 pergunta pós-sessão | ≥ 70% respondem "decidir algo" |
| Ocorrência de comentário espontâneo de frustração ligado a wipe/perda de progresso no early game | Anotação qualitativa do observador | 0 ocorrências nas Zonas 1/2 (fora da Masmorra Setor 4, onde derrota é esperada por design) |

**Critério de saída do protótipo (herdado do ADR-006):** o jogador volta para **decidir** algo, não só para ver número subir. Se as metas acima não forem atingidas, revisar ritmo de decisões e curva de dificuldade antes de avançar para MVP.

---

## Limitações deste documento

- **[H]** Nenhum valor numérico de balanceamento foi testado com jogador real; todos exigem ajuste após o primeiro playtest interno.
- **[H]** Pipeline de reprodução de arte pixel art oficial (ADR-006 + ADR-007 condição 2: redesenhada do zero, nunca ripada) não existe ainda — recomenda-se placeholders geométricos para o primeiro build jogável.
- **[E]** Nomes, atributos, tipos e golpes especiais oficiais foram verificados no Wikimon/Digimon Reference Book nesta sessão (2026-11-08); atributo oficial de Devimon e dos estágios Baby II de Tsunomon/Tokomon não foi confirmado (perfil truncado na fonte).
- **[H]** A exceção de uso de IP oficial (ADR-007) não foi submetida a revisão jurídica externa — é decisão do fundador com risco aceito (DMCA/C&D em caso de publicação), não parecer legal. Publicação continua exigindo aprovação separada.
- **[H]** A escolha de Devimon como chefe (em vez de um chefe original) foi decisão deste documento, não pedido explícito do fundador — sinalizada na seção "Riscos de design" para confirmação.
- Este GDD cobre apenas o protótipo (vertical slice). Sistemas de retenção de médio/longo prazo (D7/D30), ranking, eventos e monetização são explicitamente fora de escopo e ficam para a fase MVP.
