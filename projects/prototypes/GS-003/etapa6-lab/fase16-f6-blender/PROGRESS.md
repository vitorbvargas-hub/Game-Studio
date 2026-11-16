# PROGRESS — F6 Blender 3D → pixel art (Comando 12)

game-art · 2026-11-14 · brief: `etapa6-lab/BRIEF_COMANDO_12_F6.md`

| Hora (BRT) | Etapa | Estado |
|---|---|---|
| 16:09 | Leitura do brief, do contexto §4.1, do Reference Gate, da ficha do Agumon, do C10 e do Comando 11 §5 | feito |
| 16:10 | Etapa 1: instalar o Blender em `~/opt/blender` | **FALHOU** |
| 16:11 | Diagnóstico da falha (proxy de saída) e busca de Blender já instalado na máquina | feito |
| 16:13 | `RELATORIO_F6.md` com o motivo e o que falta | feito |

## Onde parou
**Parado na etapa 1, como o brief manda ("se a instalação falhar, registre o motivo e pare").**
O proxy de saída do OpenClaw recusa `download.blender.org` e todos os outros lugares de onde o Blender poderia vir (403 no CONNECT). Nada foi baixado, nada foi instalado. `~/opt` foi criado vazio e removido.

## Para retomar
1. Alguém com acesso à configuração do Gateway libera `download.blender.org` (ver `RELATORIO_F6.md` §3), **ou** coloca o tarball oficial em disco.
2. Rodar `scripts/check_egress.sh`: `download.blender.org` precisa responder 200.
3. Recomeçar pela etapa 1 do brief. As etapas 2 a 5 não foram iniciadas; não há script de modelo, rig ou render.

## Consumo
PixelLab: 0 gerações (nenhuma ferramenta chamada, nem `get_balance`). Custo: zero. Disco: 12 KB. Tempo: ~5 min.

---
## RETOMADA (2026-11-14, 17:40 BRT) — Blender 4.5.16 disponível em `assets/tools/blender/`

| Hora (BRT) | Etapa | Estado |
|---|---|---|
| 17:40–17:46 | Leitura: brief (RETOMADA), relatório anterior, ficha, F2b/C10/F4, medidas do F2b (canvas, bbox, paleta de 254 cores) | feito |
| 17:46–17:52 | Etapas 2+3: `scripts/agumon_blender.py` (modelo próprio por elipsoides/cones, armature, FK própria + IK analítica das pernas, caminhada 8q, ataque 9q). 1ª execução OK: 3,7 s para 54 poses × 2 passes | feito (v1) |
| 17:52–17:56 | Etapa 4: `scripts/pixelize.py` (voto 4×4→1, faixas de tom, linha por profundidade, contorno, paleta F2b). 6,4 s | feito (v1) |
| 17:48–17:59 | Iteração: 7 rodadas de forma (cabeça, focinho, olhos, boca, braços, cauda, escala igual à do F2b) e 3 defeitos de pipeline (sinais das rotações do ataque; perna que não alcançava o chão no contato; dither do Blender fazendo a cabeça piscar) | feito |
| 17:52–17:59 | Etapa 5: `scripts/metricas_f6.py` (F2b × B/C10 × F6 em S, E, N) e `scripts/entregas_f6.py` (folhas e GIFs lado a lado, com D/F4 no S) | feito |
| 17:59 | Build final com `--blend`; `.blend` em `modelo/` | feito |
| 17:59–18:01 | `RELATORIO_F6.md` reescrito com o resultado real | feito |

## Estado: **CONCLUÍDO** (prova de conceito; não homologado, não integrado)
- Entregas: `pacote_agumon_f6/`, `comparacao/`, `metricas_f6.json`, `scripts/`, `modelo/agumon_f6.blend`, `RELATORIO_F6.md`.
- Reproduzir: `scripts/build_all.sh --blend && python3 scripts/metricas_f6.py && python3 scripts/entregas_f6.py` (~30 s).
- Resultado em uma linha: pipeline funciona, é consistente e custa zero; perde para o F2b no rosto. Autoavaliação 6,5. Recomendação: **combinar**.
- Pendente de terceiros: QA independente (game-qa) e decisões do fundador listadas no §9 do relatório.
- Não feito: F7, integração, teste da combinação, GIFs vistos em movimento.

## Consumo da retomada
PixelLab: 0 gerações, nenhuma ferramenta chamada. Custo: zero. Disco: 3,8 MB. Tempo de agente: ~21 min (17:40–18:01).
