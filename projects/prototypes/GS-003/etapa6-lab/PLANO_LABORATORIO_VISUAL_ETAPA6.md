# Digital Odyssey — Etapa 6: plano do laboratório visual

- **Data:** 2026-11-13. **Autor:** game-studio (coordenação). **Status:** **PLANO. Nada deste documento foi executado.**
- **Autorização vigente:** só planejamento e preparação documental (Comando 1). Os experimentos dependem de aprovação do fundador.
- **Base:**
  - `COMANDO_ETAPA6_C1.md`, que prevalece;
  - os adendos do fundador de 13/11: ADR-015, extração do anime e assets do ChatGPT;
  - `studio-alignment/07_BRIEFING_ETAPA6_VISUAL.md`;
  - os 5 estudos desta pasta;
  - `INVENTARIO_ASSETS_CHATGPT.md`.
- **Legenda:** [E] evidência com caminho; [H] hipótese ou meta a aprovar.

## 1. O que o laboratório tem de responder
1. Qual direção visual entrega a melhor experiência: GBA Plus como referência, não como limite.
2. Como representar os Digimon com fidelidade.
3. Qual escala usar entre Tamer e Digimon e entre as espécies.
4. Como fazer um mapa bonito e explorável, inspirado no anime.
5. Se o PixelLab justifica o custo, segundo os limiares L1–L6 (`COMPARATIVO` §7).
6. Como garantir nota ≥ 8/10 antes de expandir.

Fora do escopo:
- produção em massa;
- novos mapas e regiões;
- roster;
- regras de jogo (continuam congeladas);
- publicação;
- integração da Database;
- homologar a identidade sem o fundador.

## 2. Estrutura em fases
| Fase | O que é | Dono (um por vez) | Gera crédito? | Depende de |
|---|---|---|---|---|
| **0 — Assets do ChatGPT (reaproveitamento)** | Avaliar as 4 folhas recebidas: Guilmon, ExVeemon, Agumon e Gabumon (Veemon pendente) | game-art avalia → game-qa revisa → fundador | **Não** | Rubrica v1 ajustada |
| **E1–E4 — Escala** | Pranchas de composição local com sprites existentes, uma por hipótese de escala | game-art (prancha) → game-dev (só se precisar de flag) → game-qa | **Não** | Aprovação do fundador para executar |
| **Decisão de escala** | O fundador escolhe uma hipótese, que fica congelada para A/B/C | fundador | — | Pranchas E1–E4 |
| **Layout comum congelado** | Layout-brief da floresta-piloto (já especificado) convertido em grade/colisão comum aos 3 métodos | game-design | Não | Escala escolhida |
| **A — ChatGPT + ferramentas gratuitas** | Produção do briefing único | game-art, com os arquivos que o fundador gerar | Não no PixelLab (custo na conta ChatGPT do fundador) | Fundador produzir ou fornecer as imagens |
| **B — PixelLab** | Mesmo briefing | game-art | **Sim** (teto §5) | Autorização específica de gasto |
| **C — Híbrido** | Mesmo briefing | game-art | **Sim** (teto §5) | Resultados de A e B |
| **Integração atrás de flag** | As 3 versões na mesma área, `?lab=a\|b\|c`, URL padrão intocada | game-dev | Não | A, B, C prontos |
| **Medição** | Rubrica v1 + capturas lado a lado + custo | game-qa (+ game-art como diretor em sessão separada) | Não | Integração |
| **Homologação** | Relatório comparativo + recomendação | game-studio → fundador | — | Medição |

### 2.1 Fase 0 e comparação controlada ficam separadas
- O resultado da Fase 0 (aproveitar folhas antigas) **não entra** na matriz A/B/C. Ele vira um relatório próprio.
- O Agumon da folha F0-003 vale só como reaproveitamento. O Método A do experimento controlado precisa de produção nova sobre o **briefing único**: Tamer original, Koromon, Agumon, WarGreymon e floresta-piloto.
- O Método A **não é classificado** antes de ser avaliado. Uma boa nota na Fase 0 não conta a favor do A, e uma nota ruim não conta contra.
- Fato registrado [E, INVENTARIO §4.1]: as 4 folhas são RGB sem alfa, com fundo quadriculado pintado, sem grade de quadro. O próprio pacote se declara "RASCUNHO / NÃO IMPORTAR".

## 3. Os experimentos E1–E4 (escala), sem execução
Definição [E, `07_BRIEFING` §4], com ajuste pelos achados do game-dev [E, `COMPARATIVO` §6.6]:

| Exp. | Hipótese | Como testar (sem gerar) | Custo de código [E, game-dev §6.6] | Risco conhecido |
|---|---|---|---|---|
| **E1** | Nativo 1× + câmera mais larga | Prancha e captura com `?charh` (já existe) | ~0 | Não resolve a hierarquia: Champion ≈ Tamer |
| **E2** | Escala inteira por estágio (Baby/Rookie 1×, Champion+ 2×) | Prancha; em jogo exigiria 0,5–1 dia de código | 0,5–1 dia (não autorizado) | Rip DS a 2× fica "gordo" |
| **E3** | Personagens 2×, tile 32 | `?creatureScale=2` (já existe) + prancha | ~0 | Tamer com ~72 px domina o tile |
| **E4** | Tile 16 nativo | Só prancha conceitual. Em jogo, 3–5 dias + refazer todo o cenário | Alto | Contradiz a aprovação de tile 32 (11/11) |

**Ordem proposta:** E1 → E3 → E2 → E4. Começa pelos dois que não custam código, depois o de código baixo. O E4 fica por último, só para registro, porque contradiz uma decisão já tomada.

**Critério de escolha [H, metas a aprovar, 07 §4]:**
- hierarquia visível Baby < Rookie < Tamer ≤ Champion < Ultimate/Mega;
- Champion/Rookie ≥ 1,3;
- Tamer/tile entre 1,1 e 1,6;
- só fatores inteiros;
- legível a 1920×1080.

**Trio de prova [E, `ESTUDO_ESCALA_DIGIMONS.md` §5]:**
- Koromon: pequeno, 17 px, 0,65× o Tamer;
- Agumon: médio, 26 px, 1,0×;
- WarGreymon: grande, 37 px, 1,42×.

O 07 previa Greymon e Garurumon no elenco. Prevalece o trio do C1, com o WarGreymon como caso de porte grande.

### 3.1 Divergências de medida (registradas e conciliadas aqui)
| Item | Valor A | Valor B | Por quê | Regra adotada no laboratório |
|---|---|---|---|---|
| Agumon | 26 px (estudo de escala, altura do sprite DS sem margem) | 30–34 px (Etapa 2, "Rookies DS") | Métricas diferentes: corpo medido × quadro/caixa com margem | Medir sempre a **altura do bounding box opaco** (pixels não transparentes) no quadro idle sul, com o mesmo script, e informar também o tamanho do quadro |
| WarGreymon | ~36 px na URL padrão [E, game-dev §6] | ~72 px (estudo/comparativo) | O valor de 72 px só ocorre com `?dpr=0` | As pranchas declaram a URL/flag usada; a comparação é sempre na URL padrão, salvo indicação |
| Critérios da rubrica | COMANDO C1 §7 (fundador) | A primeira versão da rubrica usou rótulos reformulados pelo coordenador | Erro do game-studio no brief | **Prevalece o C1 §7.** Corrigido pelo game-qa na revisão 2 da rubrica (13/11) |
| Métodos A/B/C | C1: A = ChatGPT, B = PixelLab, C = híbrido | 07: A = PixelLab refinado, B = tilesets próprios, C = híbrido | O 07 é anterior | **Prevalece o C1.** O 07 fica como histórico, com nota a acrescentar na próxima revisão do `studio-alignment` |

## 4. Briefing único (igual nos 3 métodos)
[E, `COMPARATIVO` §2; `ESTUDO_REGIOES_E_MAPA_PILOTO.md` Parte 2]
- **Elenco:** Tamer original de referência (preset v13) + Koromon + Agumon + WarGreymon.
- **Cenário:** floresta-piloto inspirada em Adventure/File Island. Layout-brief de 40×30 tiles, 11 POIs, zona segura, Digimon forte só em área de exibição, sem trilha marrom, 10 critérios verificáveis.
- **Uso da franquia:** ADR-015 permite recriar locais e elementos reconhecíveis no desenvolvimento interno, sempre com a classificação documental (1)–(4).
- **Extração do anime:** opção válida nos 3 métodos, desde que cumpra as condições do ADR-015 (fonte com episódio e minuto, acesso legítimo, crédito, tratamento até nota ≥ 8).
- **Requisitos técnicos e checklist de integração:** I-01..I-16 [E, `COMPARATIVO` §6.5].

## 5. Custos e tetos (propostos; nenhum gasto autorizado)
**Saldo [E, `get_balance` 13/11]:** 737,95 gerações de 2.000; renova em 11/12/2026.

| Item | Estimativa | Teto proposto [H] | Base |
|---|---|---|---|
| Fase 0 | 0 gerações; ~1–2 h-agente de avaliação | 0 | Só leitura |
| E1–E4 | 0 gerações | 0 | Pranchas com sprites existentes |
| Método A | 0 PixelLab. Custo na conta ChatGPT do fundador. Integração de 12–32 h por personagem completo e 0,6–1,7 h por prop [E, game-dev §6.4] | — | §6.4 |
| Método B | 25–40 gerações para a rodada [E, `COMPARATIVO` §4.1] | **50** | Histórico: v13 r1 gastou 203 e foi reprovado; v15 gastou 2; Guilmon 18,2 sem aprovação |
| Método C | Parcial do B | **30** | — |
| Reserva | — | **10** | — |
| **Total da rodada** | — | **90 gerações** (12% do saldo) | Piso de saldo de 200 (L5) |
| Código (flags, importadores) | M1 1–2 d, M2 1 d, M3 0,5–1 d, M4 0,5–1 d, M5 0,5 d [E, game-dev §6.6] | Só M3 e M4 na 1ª rodada [H] | M1 só se o B/C produzir mapa novo |

## 6. Riscos
| Risco | Probabilidade [H] | Mitigação |
|---|---|---|
| Folhas do ChatGPT não terem grade de pixel real (só aparência) | Alta (RGB 1536×1024, sem alfa) | A rubrica bloqueia grade falsa; a Fase 0 mede o custo de limpeza antes de qualquer uso |
| Comparação injusta se o layout mudar entre métodos | Média | Layout congelado antes de A/B/C |
| Duas fontes de estilo no mesmo quadro (C) | Alta | Critério Escala e consistência; paleta registrada como variável |
| Créditos acabarem | Baixa com teto de 90 | Teto por método + piso de 200 + `get_balance` antes e depois de cada rodada |
| Queda por limite de uso | Alta (histórico) | `PROGRESS.md` por passo; retomada na mesma sessão |
| Importador do PixelLab fixo na v15b | Certa [E, game-dev] | Mapa-piloto só entra no jogo com M1. Até lá, avaliar por captura do Map Workshop/Tiled |
| Pasta de assets diferente entre `qo` e master (T6) | Certa [E, game-dev] | Assets do laboratório só em `projects/prototypes/GS-003/art/etapa6/<f0\|a\|b\|c>/`. Decidir a pasta canônica antes da integração |
| Risco de PI (fangame sem licença) | Permanente | Tudo interno. Publicação só com decisão específica do fundador. Extração sempre com fonte e crédito |
| Conflitos visuais abertos (Endesga-32, escala, critério, densidade, convenções da Database) | — | **Não resolvidos neste plano.** Entram como variáveis medidas (rubrica §6) e vão para a decisão do fundador |

## 7. Critério de aprovação de um método
Pela rubrica v1 (revisão 2, alinhada ao C1 §7):
- média ponderada ≥ 8,0;
- nenhum critério principal abaixo de 7;
- 0 falha bloqueante;
- checklist técnica I-01..I-16 aprovada;
- avaliação do game-art (diretor) e revisão independente do game-qa;
- **homologação do fundador**.

**Continuidade do PixelLab:** limiares L1–L6 (`COMPARATIVO` §7).

## 8. Proteção da versão atual (para quando houver execução)
- Tag `pre-etapa6` no worktree `qo`, registrando o commit (hoje `3289e32` [E, game-dev]).
- Uma branch por método (`lab/etapa6-a|b|c`) e flag `?lab=`. A URL padrão, o save `gs003.world.save` e o mapa v15b não mudam.
- Sem deploy. A prévia Vercel não muda.
- O game-qa confirma no fim: URL padrão idêntica (captura + hash), testes passando, `git status` limpo.

## 9. Decisões pedidas ao fundador (uma por vez, nesta ordem)
1. **Aprovar a execução da Fase 0** (avaliação das 4 folhas). Custo 0. Recomendo aprovar.
2. **Aprovar a execução de E1–E4** (pranchas sem geração). Custo 0. Recomendo aprovar.
3. **Escolher a escala** depois das pranchas.
4. **Método A:** quem gera as imagens no ChatGPT seguindo o briefing único. Este ambiente não tem acesso.
5. **Autorizar o gasto de B e C**, até 90 gerações no total.
6. Decidir os conflitos visuais abertos, com a evidência do laboratório.
