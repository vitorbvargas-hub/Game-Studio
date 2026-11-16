# Brief game-art: Comando 13, F7 híbrido ampliado (protótipo do Agumon)

**Data:** 2026-11-14 · **Dono:** game-art (Fable 5.2) · **QA:** game-qa (Opus 5.5) · **Coordenação:** game-studio
**Aprovado pelo ChatGPT** (revisor artístico obrigatório) em 2026-11-14 ~19:55. Encerra os testes exploratórios F3 a F6 e abre a F7.

## Objetivo
Um protótipo do Agumon que junte o melhor de cada método já testado, para ser o candidato a padrão de produção dos Digimon. Depois do QA e do ChatGPT, o Vitor testa no jogo e decide.

## Composição aprovada
| Parte | Fonte |
|---|---|
| Visual (rosto, paleta, contorno, sombreado) | **F2b/C10**, a referência estética. Pose parada lateral **do F2b**, não a do C10 (decisão do ChatGPT) |
| Caminhada nas 4 direções | C10 e F2b redesenhados à mão com o **F6 (Blender) como gabarito de pose quadro a quadro**: pé de apoio parado no mundo, cabeça estável, braço com 4–5 px de balanço, coordenação perna/braço |
| Ataque | antecipação do rig (F3/F4) + corpo polido (F2b/D) + saída pelo q8 + **Pepper Breath em camada 2D separada saindo da boca**, sincronizada, desenhada por nós, nas 4 direções |
| Emoções | os melhores quadros já existentes (feliz v3 polido do D, custom do PixelLab), sem gerar nada novo |
| Idle | rig (F3/D), se couber sem quebrar a pose do F2b |
| Diagonais | **fora do escopo**. As do Retro Diffusion ficam só como referência experimental |

Proibido copiar do F6 o rosto, o sombreado de plástico, as garras em bloco ("luva") e a cauda deformada.

## Entradas
| Fonte | Caminho |
|---|---|
| F2b | `fase12-comando9/f2/pacote_agumon_f2/` (backup em `fase13-comando10/backup_f2b/`) |
| C10 | `fase13-comando10/` (pacote, relatório, QA e regressões R1–R5) |
| F3 e F4 | `fase12-comando9/f3/`, `fase12-comando9/f4/` e o híbrido em `fase13-comando10/hibrido_agumon_S_c10/` |
| F6 | `fase16-f6-blender/` (pacote, `scripts/`, `modelo/agumon_f6.blend`). Pode renderizar poses novas como guia com `~/projects/GameStudio/assets/tools/blender/run_blender.sh` |
| QAs | F2, F4, C10, F6 e F5 prática, com os problemas apontados |
| Ficha | `fase11-fichas-anatomia/FICHA_AGUMON.md`, seguindo o protocolo GS-003-DIGIMON-REFERENCE-GATE |

## Saída
`etapa6-lab/fase17-f7-hibrido/`:
- **`pacote_agumon_f7/`**, no formato do F2b:
  - rotações S/N/E/W;
  - walk de 8 quadros nas 4 direções;
  - ataque com a camada de fogo separada em `attack_fx/`;
  - idle;
  - feliz;
  - `pacote.json` com âncora no quadril/corpo, documentada.
- **`comparacao/`**: lado a lado F2b × C10 × F6 × F7, com GIFs em 1× e 4× na **mesma velocidade** (110 ms), na mesma escala, nas 4 direções, mais o ciclo completo idle → walk → ataque → idle.
- **`RELATORIO_F7.md`**:
  - reference report;
  - o que veio de cada método;
  - métricas (cabeça estável, deslizamento, âncora, cores, pixels soltos, oscilação);
  - tempo gasto, para estimar o custo por espécie;
  - autoavaliação nos 6 critérios;
  - regressões.
- **`PROGRESS.md`**.

## Limites
- PixelLab: 0 gerações.
- Nada de Retro Diffusion e nada de gasto.
- Paleta, escala, canvas e âncora consistentes com o F2b. Escala e paleta continuam em aberto para a Etapa 6: não decidir.
- Não integrar. Não tocar no F2b, no C10, no F4, no F6 nem no `kb-gs003`.
- Teto de ~3 h de agente.
- Se cair, o `PROGRESS.md` aponta onde parou.

Ao terminar, pare. Depois vêm o game-qa, o ChatGPT e, por último, o Vitor no jogo.

---
## ADENDO (2026-11-14 21:00): Comando 12 do fundador
O fundador mandou o texto oficial deste trabalho como **"Comando 12 — F7"**, em `etapa6-lab/COMANDO_FUNDADOR_12_F7.md`. **Leia inteiro: em caso de conflito, ele vale mais que este brief.** O que ele acrescenta:
- **§1 Inventário:** registre os caminhos, as versões e as evidências de A (PixelLab Método A), F2b, C10, F3, F4, F5 (Retro) e F6.
- **Emoções:** preserve o **feliz do PixelLab v3 custom**. Não troque por um feliz de rig de qualidade inferior.
- **Caminhada:** sem pernas projetadas demais, com contato com o chão, braços e cauda corrigidos.
- **Comparação obrigatória:**
  - A = F2b, B = C10, C = F4, D = F7;
  - PNGs em 1× e 4×;
  - GIFs de caminhada, idle, ataque e emoção, nas 4 direções e na mesma velocidade;
  - tempo e custo;
  - sem nota inventada para um método que não tem aquela animação.
- O QA avaliará também **transições entre animações** e **ausência de regressões**. A meta é ≥ 8, de preferência 8,5.
- **Retomada:** a primeira execução caiu por limite às 18:47, depois de ler as fontes. Continue do parcial em `fase17-f7-hibrido/` (PROGRESS.md, `scripts/`, `tmp/`).
