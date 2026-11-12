# ASSET_LICENSE_POLICY — GS-003

- **Autor:** game-art · **Data:** 2026-11-08 (revisado 2026-11-08) · **Base legal:** ADR-007 (fan game não comercial), ADR-008 (visual aprovado antes do código), ADR-009 (reset + "Digimon primeiro"), `GOVERNANCE.md` do estúdio, `art/FAN_SPRITE_SOURCES.md` (inventário já feito).
- **Atualização do fundador (2026-11-08):** mensagem inter-sessão recebida de `agent:game-studio:main` relatando que o fundador **revogou a regra 2 do ADR-007** (proibição de rips oficiais) — sprites oficiais de Digimon World DS, Dawn, Dusk e PMD Chunsoft estão **liberados em todo o projeto, inclusive no git**, para este fan game não comercial, como base inicial a ser substituída aos poucos por arte própria. **Nota de rastreabilidade:** até o momento desta revisão não existe um ADR-010 em `shared/decisions/` registrando formalmente essa mudança — só este repasse inter-sessão. Este documento já aplica a mudança (dentro do escopo de edição do game-art), mas recomenda-se que o game-studio/fundador formalize a decisão como ADR-010, para o registro ficar no mesmo lugar que ADR-001–009, não espalhado em mensagens de sessão.
- Esta política define **onde cada asset mora** e **o que nunca entra no git**, por camada. Ela não substitui os ADRs — formaliza as regras de pasta/git que eles implicam.

---

## 1. As 6 camadas

```
official-fan-use ──(substituição gradual)──→ original (ou fica official-fan-use indefinidamente)
reference ──(nunca)──→ não vira asset do jogo, só estudo
private-prototype ──(licença esclarecida OU descartado)──→ licensed OU descartado
licensed ──(uso conforme a licença, com crédito)──→ INTEGRATED
original ──(criado pelo estúdio, inclusive redesenhos sob exceção ADR-007)──→ INTEGRATED
rejected ──(fim de linha)──→ só registro, arquivo binário não fica no repo
```

| Camada | O que é | Pasta (biblioteca `GAME-ASSETS/`) | Pasta (workspace) | Git |
|---|---|---|---|---|
| **official-fan-use** *(nova, 2026-11-08)* | Sprite **oficial** de jogo (DW DS, Dawn, Dusk, PMD Chunsoft) usado diretamente, sob a exceção explícita do fundador — ver §3 | `GAME-ASSETS/01-creatures/CREATURE-NNNN/` com `assetOrigin.layer: "official-fan-use"` | `art/sprites/official-fan-use/` | **Sim.** Com origem+crédito obrigatórios no `license.json` (§3) — é a única camada onde um arquivo que antes era proibido agora é versionado normalmente. |
| **reference** | Material só para estudo visual que **não** é usado como asset do jogo (screenshots, press kit, páginas de fã sem decisão de uso) | `GAME-ASSETS/.reference-local/` | `art/reference/` | **Nunca.** Gitignorado. |
| **private-prototype** | Asset de licença **ainda incerta** (ex. Happy Galgomon Pixel Preserve, DragonRod Art — `art/FAN_SPRITE_SOURCES.md` §1.2–1.3, sites de fã sem termos claros, não jogos oficiais) usado só para comparação visual interna | `GAME-ASSETS/.private-prototype/` | `art/_private-prototype/` | **Nunca**, até autorização explícita por escrito do autor. **Importante:** isto é diferente de "rip oficial" — rip oficial agora é `official-fan-use` (§3), não `private-prototype`. `private-prototype` continua existindo só para fan art de licença pessoal incerta. |
| **licensed** | Asset de terceiro com licença verificada e compatível (CC0, OFL, CC-BY-NC com crédito) | `GAME-ASSETS/01-creatures/.../` com `assetOrigin.layer: "licensed"` + `license.json` | — | **Sim**, se a licença permitir redistribuição. |
| **original** | Criado pelo estúdio — pixel art por código/matriz de caracteres, ou um redesenho de personagem feito de memória sob a exceção ADR-007 (quando o estúdio opta por **não** usar o sprite oficial direto) | `GAME-ASSETS/01-creatures/.../` com `assetOrigin.layer: "original"` | `art/sprites/`, `art/src/` | **Sim.** |
| **rejected** | Asset avaliado e recusado | Só o registro JSON fica | — | O binário nunca entra no git. |

## 2. Fluxo entre camadas

```
DISCOVERED → UNDER_REVIEW → (origem + crédito + QA) → APPROVED → INTEGRATED
                  │
                  └─(licença incompatível OU reprovado em QA)→ REJECTED

NEEDS_CREATION → (produção original) → UNDER_REVIEW → ... (mesmo fluxo acima)

official-fan-use (replacementStatus: "official")
   → em algum momento, arte própria substitui o sprite oficial
   → replacementStatus: "in-progress" (as duas versões coexistem durante a transição)
   → replacementStatus: "original" + assetOrigin.layer muda para "original"
```

`DISCOVERED`/`UNDER_REVIEW`/`APPROVED`/`REJECTED`/`NEEDS_CREATION`/`INTEGRATED` continuam sendo os valores de `approvalStatus` (`creature.schema.json`) — a estratégia "oficial primeiro, substituir aos poucos" não cria um status novo, cria o campo `replacementStatus` (§3) dentro do `license.json`, independente do `approvalStatus`.

## 3. Camada `official-fan-use` — sprites oficiais ripados

**Liberado para:** sprites de Digimon World DS, Dawn, Dusk (coleção "With the Will"/AngelOfHope, preservada em `github.com/E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites`, verificada nesta sessão **[E, 2026-11-08]** — inspecionada visualmente via `view_image` nos arquivos `rookie/Agumon.gif`, `rookie/Guilmon.gif`, `rookie/Gabumon.gif`, `rookie/Patamon.gif`: sprites pequenos, chibi, cabeça grande, contorno escuro grosso, poucas cores, estilo bem mais blocado que a referência Drakantos) e sprites PMD Chunsoft (ex. a referência de formato já em `art/reference/pmd-format-founder/`, originalmente marcada "não usar" — essa marcação está **superada** por esta atualização, ver §6).

**Regras:**

1. **Origem e créditos são obrigatórios para toda criatura**, não só para `licensed` — `license.json` de uma criatura `official-fan-use` não pode ter `credit: null`. Exemplo real (Agumon, baseado na verificação desta sessão):
   ```json
   {
     "layer": "official-fan-use",
     "source": {
       "type": "official-game-rip",
       "game": "Digimon World DS / Dawn / Dusk",
       "collection": "With the Will (AngelOfHope) — preservação",
       "repo": "https://github.com/E-M-B-E-R/digimon-world-ds-dawn-dusk-animated-sprites",
       "file": "rookie/Agumon.gif",
       "verifiedAt": "2026-11-08"
     },
     "credit": "Sprite original de Digimon World DS/Dawn/Dusk, propriedade da Bandai Namco Entertainment/Namco Bandai Games. Preservação: AngelOfHope (With the Will) via E-M-B-E-R. Não possui afiliação com a Bandai Namco.",
     "nonCommercial": true,
     "replacementStatus": "official"
   }
   ```
2. **`replacementStatus`** (campo novo em `license.json`, qualquer camada, obrigatório quando `layer: official-fan-use`): `"official"` (só o sprite oficial existe) → `"in-progress"` (arte própria em produção, ainda não substituiu) → `"original"` (arte própria substituiu; nesse ponto `assetOrigin.layer` muda para `original` e o `license.json` passa a seguir §4, mantendo um histórico de `replacedFrom` opcional para auditoria).
3. **Continuam valendo do ADR-007:** sem monetização de nenhum tipo, sem logos/marcas oficiais no título/material de divulgação, publicação exige aprovação separada do fundador, conteúdo em *content pack* trocável.
4. **Não é uma licença de redistribuição de terceiro** (diferente de `licensed`/CC0/OFL) — é uma exceção específica deste projeto não comercial, documentada pelo fundador. Não presumir que essa liberação vale para qualquer outro projeto do estúdio.
5. **Técnica de desenho não se aplica aqui** — ao contrário da camada `original` (que segue `ART_STYLE_GUIDE.md`, matriz de caracteres, nunca forma paramétrica), um asset `official-fan-use` é o arquivo oficial **usado como está** (recortado/organizado em spritesheet se necessário, nunca redesenhado) — ver `ART_STYLE_GUIDE.md` §1 e §8 atualizados.

## 4. Redesenho sob a exceção do ADR-007 (quando o estúdio opta por arte própria em vez do sprite oficial)

Quando uma criatura é um redesenho de personagem Digimon oficial feito de memória (nunca traçando um arquivo oficial — mesmo agora que o arquivo oficial é permitido, redesenhar "de memória" continua sendo uma escolha válida para a camada `original`, útil para o caminho `replacementStatus: "original"` do §3):

- Camada: **`original`**, com `license.json` incluindo:
  ```json
  {
    "layer": "original",
    "fanException": true,
    "baseCharacter": "Agumon",
    "basis": "ADR-007",
    "nonCommercial": true,
    "noRip": true,
    "replacementStatus": "original",
    "replacedFrom": "official-fan-use (rookie/Agumon.gif, With the Will/AngelOfHope)",
    "restrictions": ["sem monetização", "sem logos/marcas oficiais no material de divulgação", "publicação exige aprovação separada"]
  }
  ```

## 5. O que nunca entra no git (lista explícita)

1. Qualquer arquivo nas camadas `reference` e `private-prototype` (§1).
2. ~~Qualquer rip oficial de jogo~~ — **revogado nesta atualização.** Rips oficiais de DW DS/Dawn/Dusk/PMD Chunsoft agora entram no git **sob a camada `official-fan-use`** (§3), com origem e crédito obrigatórios. Rips de jogos **fora** dessa lista explícita (ex. um jogo não mencionado pelo fundador) continuam tratados como `private-prototype`/proibidos até nova decisão.
3. Qualquer asset de licença "não clara" de **fã** (ex.: Happy Galgomon Pixel Preserve, DragonRod Art — `art/FAN_SPRITE_SOURCES.md` §1.2–1.3) até haver autorização explícita por escrito do autor — **esta regra não mudou**, não é a mesma coisa que rip oficial de jogo.
4. Binário de asset `rejected` (§1) — só o registro JSON.
5. Qualquer credencial, chave de API ou token (regra padrão do estúdio, não específica de asset).

**`.gitignore`** (já ajustado nesta sessão, antes desta atualização de política — continua válido, porque cobre só `reference/`/`private-prototype/`, não `official-fan-use/`, que é um caminho novo e **tracked**):

```gitignore
# GS-003 — camadas de asset que nunca entram no git (ASSET_LICENSE_POLICY.md)
projects/prototypes/GS-003/art/reference/
projects/prototypes/GS-003/art/_private-prototype/
assets/GAME-ASSETS/.reference-local/
assets/GAME-ASSETS/.private-prototype/
**/rejected/*.png
**/rejected/*.gif
```

## 6. `art/reference/pmd-format-founder/` — nota de consistência

O `README.txt` local dessa pasta (escrito antes desta atualização) diz "Provável sprite oficial Chunsoft: NÃO usar no jogo, NÃO copiar pixels, NÃO versionar no git". Essa instrução está **superada** pela liberação de sprites PMD Chunsoft nesta atualização — atualizado no próprio arquivo (ver `art/reference/pmd-format-founder/README.txt`) para não deixar instrução contraditória para a próxima sessão que abrir a pasta.

## 7. `CREDITS.md`

Todo asset nas camadas `licensed` **e agora `official-fan-use`** precisa de uma linha em `CREDITS.md` — nome do monstro/asset, fonte, autor/coleção, licença ou base legal (para `official-fan-use`: "exceção ADR-007, ver ASSET_LICENSE_POLICY.md §3"), link, data de obtenção. `CREDITS.md` é público — nunca omitir um crédito.

## 8. Limitações

- Esta política formaliza regras já implícitas em ADR-007/ADR-009 **mais a atualização inter-sessão de 2026-11-08** — qualquer dúvida de interpretação volta para o fundador, não para este documento. Como registrado no topo, recomenda-se um ADR-010 formal; até lá, esta atualização tem a mesma autoridade que o repasse recebido, não mais que isso.
- **Verificado e corrigido nesta entrega [E, 2026-11-08]:** `art/reference/` (incluindo `pmd-format-founder/`) estava sem proteção de `.gitignore` — corrigido (ver §5). Isso não muda com a liberação de `official-fan-use`, porque os sprites liberados vivem num caminho novo (`art/sprites/official-fan-use/`), não em `art/reference/`.
- Os 4 sprites oficiais inspecionados nesta sessão (Agumon, Guilmon, Gabumon, Patamon) foram vistos via `view_image` (visualização, não download local — `curl` para `raw.githubusercontent.com` falhou neste host por bloqueio de proxy de saída, mesmo problema já documentado em `docs/TECH_AUDIT.md` para outros domínios). Nenhum arquivo foi de fato baixado/salvo no workspace nesta sessão — a liberação de política está registrada, mas a **ingestão real** dos arquivos (`art/sprites/official-fan-use/`) ainda não foi feita, fica para uma próxima tarefa de produção (provavelmente game-dev ou game-art numa sessão com acesso de rede mais amplo, ou o fundador baixando manualmente como já é o padrão documentado para o Phaser em `TECH_AUDIT.md`).
