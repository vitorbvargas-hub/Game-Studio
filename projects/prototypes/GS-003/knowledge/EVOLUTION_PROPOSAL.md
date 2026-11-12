# EVOLUTION_PROPOSAL — sistema de digivolução proposto para o MMO (GS-003)

- **Autor:** game-research (subagente GS-005, fase 1) · **Data:** 2026-11-09
- **Base de evidência:** `evolution_chains.json`, `evolution_requirements.json`, `evolution_comparison_by_game.json`, `EVOLUTION_GRAPHS.md` — 5 linhas (Agumon, Gabumon, Patamon, Guilmon, Dorumon), 5 jogos pesquisados.
- **Restrição do briefing (09_gs005_digimon_knowledge_studio.md §5.4):** "Não permitir que o sistema escolha arbitrariamente uma evolução quando houver mais de um caminho disponível. Apresentar os caminhos possíveis e seus requisitos antes da confirmação." Esta proposta obedece essa regra em todos os pontos.
- **[H]** Tudo abaixo é proposta de design original para o nosso MMO, não uma cópia de regra de um jogo específico. Cada escolha cita qual(is) jogo(s) pesquisado(s) inspiraram a decisão e por quê.

---

## 1. O que a pesquisa confirmou (evidência disponível para basear o design)

| Jogo | Qualidade dos dados coletados |
|---|---|
| **Cyber Sleuth/Hacker's Memory** | **Alta.** Requisitos numéricos exatos (Level, ATK/DEF/HP/INT/SPD, ABI, CAM%) para 24/26 Digimon das 5 linhas. |
| **Dawn & Dusk** | **Alta.** Requisitos numéricos exatos (LV, Friendship%, EXP de espécie, stats) para 24/25 Digimon (não existe ChaosDukemon). Única fonte com **evoluções alternativas explícitas e numeradas** (ex.: Agumon → Greymon OU GeoGreymon; Guilmon → Growlmon OU Tyrannomon) e **DNA Digivolution** (fusão de 2 Digimon) documentada com requisito. |
| **Next Order** | **Média.** Confirma TODOS os alvos possíveis de evolução (muitos — 4 a 7 por salto) e duas regras especiais claras (falha de requisito → Numemon/Geremon; negligência → Sukamon), mas **sem** números exatos de nível/stat por salto (bloqueio de fonte, não ausência no jogo). |
| **DMO** | **Baixa para requisitos** (árvore renderizada via JavaScript, não capturável nesta sessão) mas **confirma presença/ausência** de cada Digimon e expõe sistemas únicos (Jogress herda stats do menor nível; Breakthrough tipo gacha; Hatching com risco de destruir o ovo). |
| **DW1 (PS1)** | **Baixa.** Maioria das páginas é stub. Confirma só 1 mecanismo-chave: cuidado insuficiente → evolução degenerada (Numemon), reforçando a ideia de "evolução como consequência do cuidado", não um evento isolado. |

**Conclusão prática:** a franquia não tem UM único sistema de evolução — tem pelo menos 3 filosofias diferentes (DW1/Next Order: cuidado diário + stats + regras de "evolução ruim"; Cyber Sleuth: RPG por nível+stat+vínculo; Dawn/Dusk: treino offline em fazenda + EXP de espécie + friendship + fusão). A proposta abaixo é uma síntese original, não a cópia de nenhum dos cinco.

---

## 2. Princípios de design (não-negociáveis, do briefing)

1. **Requisitos sempre visíveis.** Antes de confirmar qualquer digivolução, a UI mostra: todos os caminhos elegíveis no momento, o próximo requisito que falta para cada caminho ainda não elegível, e o resultado final (nome, estágio, prévia de stats/habilidade).
2. **Escolha do jogador quando há ramificação.** Se 2+ caminhos estiverem elegíveis simultaneamente, o jogo **pausa e pergunta**. Nunca decide sozinho.
3. **Auto-evoluir é restrito.** Só age automaticamente quando (a) existe exatamente 1 caminho elegível, ou (b) o jogador já definiu uma preferência explícita para aquele Digimon/linha (ver §6).

---

## 3. Requisitos visíveis — estrutura de dados proposta

Cada aresta de evolução (`from -> to`) tem um contrato de **requisito legível e verificável client-side**, nos mesmos moldes do `evolution_requirements.json` já gerado nesta pesquisa:

```ts
interface EvolutionRequirement {
  from: string;              // speciesId
  to: string;                // speciesId
  kind: "normal" | "dna_fusion" | "item_triggered" | "rare";
  level_min?: number;
  stat_min?: { stat: "atk"|"def"|"int"|"spd"|"hp"|"sp"; value: number }[];
  affinity_min?: number;      // 0-100, equivalente ao "Friendship"/"CAM" pesquisado
  training_exp_min?: { track: string; value: number }[]; // equivalente ao "Species EXP" de Dawn/Dusk
  items_required?: string[];
  dna_partner?: string;       // speciesId do segundo Digimon, só para kind="dna_fusion"
  visible_always: true;       // trava de design: nunca ocultar requisito
}
```

**[H]** Os campos `stat_min`/`affinity_min`/`training_exp_min` são inspirados diretamente nos campos reais encontrados (ATK/DEF/HP/CAM em Cyber Sleuth; Friendship/Species-EXP em Dawn & Dusk) — escolhemos manter os MESMOS tipos de requisito que a franquia já usa, só trocando os valores numéricos pelo nosso próprio balanceamento (a definir pelo game-design, fora do escopo desta pesquisa).

---

## 4. Quando o jogador escolhe (ramificação)

**[H]** Modelo da UI de evolução:

1. O jogo detecta que o Digimon atingiu o nível/stats mínimos de **pelo menos 1** caminho.
2. Abre a tela "Digivolução disponível" listando **todos** os caminhos, mesmo os ainda não elegíveis (ex.: Dawn & Dusk mostra Agumon podendo ir para Greymon OU GeoGreymon, com requisitos de cada um lado a lado).
3. Caminhos elegíveis ficam destacados e clicáveis; caminhos não elegíveis mostram em cinza o que falta (ex.: "Defense 90+ — você tem 62").
4. O jogador escolhe. Sem escolha, o Digimon permanece no estágio atual (nunca evolui sozinho quando há ramificação) — isso cobre a restrição do briefing de não decidir arbitrariamente.
5. **Exceção de caminho único:** se só 1 caminho está definido para aquele Digimon na nossa tabela (ex.: Patamon → Angemon em quase todos os jogos pesquisados, sem ramificação), a tela ainda aparece (transparência), mas com 1 clique de confirmação — não é silenciosa, só não exige decisão entre opções.

---

## 5. Auto-evoluir — regra restrita

**[H]** Reaproveitando e refinando o Auto-evoluir já citado em `docs/GDD_MMO_V1.md`:

| Situação | Comportamento do Auto-evoluir |
|---|---|
| Exatamente 1 caminho elegível no momento | Evolui automaticamente (não há decisão a tomar — nenhuma arbitrariedade). |
| 2+ caminhos elegíveis, **sem preferência definida** | **Para e espera o jogador.** Nunca escolhe sozinho (regra direta do briefing §5.4). |
| 2+ caminhos elegíveis, **com preferência definida** (ver abaixo) | Evolui automaticamente para o caminho preferido do jogador. |
| Nenhum caminho elegível ainda | Não faz nada (Digimon continua treinando/ganhando status). |

**Preferência de caminho (`evolution_preference`):** o jogador pode, a qualquer momento (não só no instante da evolução), abrir a ficha do Digimon e marcar "se houver ramificação aqui, prefiro X" para uma ou mais linhas. Isso é uma configuração armazenada por `speciesId` (ou por slot de equipe), não uma decisão única — o jogador pode trocar a preferência depois, mas ela só vale para a PRÓXIMA evolução ainda não confirmada (nunca desfaz uma evolução já ocorrida).

---

## 6. Treino, afinidade e itens como pré-requisito (não como substituto da escolha)

**[H]** Com base no comparativo de `training_systems.json`:

- **Treino (nível + stats):** igual a Cyber Sleuth/Dawn&Dusk — ganhar nível e os stats certos (via combate no mapa, já implementado em `prototype/world`) é o requisito-base de toda evolução normal.
- **Afinidade/vínculo:** campo `affinity_min`, equivalente ao "Friendship"/"CAM" pesquisado — sobe interagindo com o Digimon (alimentar, lutar junto, etc., reaproveitando o MOVE_SYSTEM existente), não apenas por AFK.
- **Itens:** alguns caminhos (principalmente os mais raros/alternativos) exigem um item específico, inspirado em Cyber Sleuth/DMO — isso cria uma razão para o jogador caçar itens de evolução em dungeons/world bosses (`docs/GDD_MMO_V1.md` §3/§4), sem reinventar o loot já especificado lá.
- **Treino excessivo / cuidado ruim:** **não propomos** a "evolução degenerada" (Numemon) do DW1/Next Order para a v1 — é uma mecânica de punição que contradiz o tom "decisão significativa e visível" pedido no briefing; registrar como ideia descartada, não implementada.

---

## 7. De-digivolução

**[H]** Confirmado como mecânica real em Cyber Sleuth (citada no briefing §2 PRIORIDADE 3, mas não verificada em detalhe nesta pesquisa — não encontramos a regra exata de de-digivolução nas fontes acessadas, fica como `pendente` para fase 2). Proposta inicial, sujeita a essa pesquisa complementar:

- De-digivolução é **reversível e sem penalidade de progresso real**: volta o Digimon ao estágio anterior na MESMA linha escolhida (não apaga a preferência nem o nível/XP acumulado, só "reempacota" temporariamente a forma), usada para farmar habilidades de estágios anteriores ou cumprir requisitos de evento que pedem uma forma específica.
- **Pendência explícita:** o requisito exato de quando/como de-digivolver em Cyber Sleuth não foi confirmado nesta sessão (fontes bloqueadas); antes de implementar, pesquisar `digivolve`/`de-digivolve` especificamente no digimon.fandom.com quando o acesso não estiver bloqueado por Cloudflare.

---

## 8. Evoluções raras

**[H]** Inspirado nos padrões encontrados:

- **DNA Digivolution / Jogress** (confirmado em Dawn & Dusk com requisito numérico exato, e em Next Order/DMO como mecânica existente sem número): fundir 2 Digimon específicos (consumindo um deles) para obter uma forma rara, fora da linha normal. Mantemos como sistema **opcional e tardio** (Mega+), não obrigatório para progressão normal.
- **Variantes por atributo/elemento** (ex.: MetalGreymon Vaccine vs. Blue, WarGarurumon Blue vs. Black em Next Order/Dawn&Dusk): usamos esse padrão para variar visualmente Digimon do mesmo estágio sem multiplicar a quantidade de sistemas — é cosmético/estatístico leve, não uma linha evolutiva nova.
- Evoluções temporárias (tipo "Burst Mode" do DMO): marcado como **fora do escopo da fase 1**, fica para avaliação futura junto ao game-design.

---

## 9. Resumo da jornada de uma evolução no MMO (exemplo didático, não um Digimon real do nosso roster)

1. Digimon atinge nível/stat mínimo de pelo menos 1 caminho → ícone de "evolução disponível" aparece na HUD.
2. Jogador abre a ficha → vê todos os caminhos da linha, elegíveis e não elegíveis, cada um com requisito explícito.
3. Se só 1 elegível → 1 clique confirma. Se 2+ elegíveis e sem preferência salva → jogo espera decisão manual. Se 2+ elegíveis e preferência salva → Auto-evoluir (se ligado) resolve sozinho.
4. Evolução acontece com efeito visual (reaproveita VFX de `docs/MOVE_SYSTEM.md`), Digimon ganha 2 slots herdados de golpe (`inheritSlotsOnEvolve`, já especificado) e os novos golpes do novo estágio.
5. De-digivolução disponível depois, sem apagar progresso (pendente de detalhamento na fase 2).

---

## 10. Pendências para a fase 2 desta pesquisa

- Requisitos numéricos exatos de Next Order e DMO (bloqueados por Cloudflare/JS nesta sessão — precisam de acesso com renderização de navegador ou nova tentativa quando o bloqueio não estiver ativo).
- Regra exata de de-digivolução em Cyber Sleuth.
- Confirmar se Dawn vs. Dusk têm os MESMOS requisitos para os 24 Digimon pesquisados ou se há diferença por versão (não foi possível confirmar nesta sessão — ver `evolution_chains.json` → `dawn_dusk` → `general_notes`).
- Pesquisa de habilidades/moveset específico de cada Digimon por jogo (fora do escopo da fase 1, que priorizou evolução).
