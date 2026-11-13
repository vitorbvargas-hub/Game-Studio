# Digital Odyssey — Etapa 6, Fase 0: inventário de recebimento dos assets do ChatGPT

- **Origem:** adendo do fundador de 2026-11-13, "Aproveitamento dos assets criados no ChatGPT".
- **Dono:** game-studio (recebimento e catálogo). A avaliação fica com o game-art e a revisão independente com o game-qa, um agente por vez.
- **Status:** **RECEBIDO em 2026-11-13 (pacote `digital_odyssey_assets_fase4.zip`). Catalogado. Aguardando avaliação: 1º game-art, depois game-qa (um por vez).** Veemon: pendente (o próprio pacote declara que falta a folha individual).

## 1. Verificação feita antes de abrir o inventário
- Busquei no estúdio e no workspace por arquivos com "exveemon" e "chatgpt". Só encontrei a folha do Digimon World DS do Spriters Resource (`assets/GAME-ASSETS/10-source-files/spriters-resource/dgmnworldds__…ExVeemon__48586.png`), que é rip de jogo e **não** é asset do ChatGPT.
- Nas imagens recebidas no chat entre 07/11 e 13/11, nenhuma está identificada como Guilmon ou ExVeemon feitos no ChatGPT. **Não presumi** que alguma delas fosse.
- Nenhuma imagem foi inventada nem gerada.

## 2. Como enviar
Mande pelo chat, um por mensagem ou vários juntos, e escreva para cada arquivo:
1. a espécie;
2. "ChatGPT";
3. se possível, a versão ou a data e se é imagem única, folha de sprite ou animação.

Prefira PNG com fundo transparente, no tamanho original, sem print de tela. Se só existir print, mande assim mesmo e indique isso.

O coordenador copia o arquivo para `etapa6-lab/fase0-chatgpt/<especie>/` sem modificá-lo e registra o md5.

## 3. Ficha de avaliação, uma por asset (avaliação = game-art; revisão = game-qa)
| Campo | Valor |
|---|---|
| ID do recebimento | F0-NNN |
| Espécie e identificação | nome canônico + estágio (conforme a Database) |
| Arquivo original | caminho + md5 + data de recebimento |
| Origem e versão | ChatGPT; versão ou data informada pelo fundador |
| Classificação ADR-015 | (1) oficial / (2) recriação ou adaptação / (3) original, + (4) fonte e risco |
| Fidelidade visual à franquia | 0–10, com motivo (anatomia, cores, detalhes da espécie) |
| Qualidade artística | 0–10 (pela `RUBRICA_QUALIDADE_VISUAL_V1.md`) |
| Resolução e dimensões | px reais; é pixel art de verdade (grade de pixel limpa) ou ilustração com aparência de pixel? |
| Transparência | sim / não / parcial (halo, fundo branco) |
| Consistência com a identidade proposta | contorno, paleta, sombreamento, escala relativa ao Tamer (`ESTUDO_ESCALA_DIGIMONS.md`) |
| Possibilidade de animação | pose única / várias poses / quadros consistentes entre si |
| Trabalho para integração | redimensionar, limpar pixels, recortar, fazer spritesheet, animar; estimativa em horas |
| Veredito | candidato aproveitável / precisa de retrabalho / descartado (**nunca** "aprovado" nesta fase) |

## 4. Registro de recebimentos

**Pacote:** `fase0-chatgpt/_original/digital_odyssey_assets_fase4.zip` (md5 `ee2f29be8aa12bfd36073514a21d1059`), preservado sem alteração. Cópia extraída para leitura em `fase0-chatgpt/extraido/digital_odyssey_assets_fase4/`.

**O que o pacote declara sobre si [E, README.md do pacote]:** "RASCUNHO / NÃO IMPORTAR"; "referências artísticas geradas, não spritesheets técnicos homologados"; o fundo quadriculado pode estar desenhado no PNG; não há contrato de quadro, pivô nem hitbox.

**Scripts do pacote:**
- `scripts/01_auditoria_sem_alteracoes.md`
- `scripts/02_preparacao_futura.md` (marcado "NÃO EXECUTAR AGORA")

Os dois foram registrados como **material do fundador**, não como ordem em execução. O 01 coincide em boa parte com a §6 do comparativo, escrita pelo game-dev. O 02 depende de aprovação futura.

| ID | Espécie (estágio) | Arquivo | md5 | Dimensões / modo | Recebido |
|---|---|---|---|---|---|
| F0-001 | Guilmon (Rookie) | `references/guilmon_concept.png` | `07f876678cbab78c5dc1d9237f65f229` | 1536×1024, RGB **sem canal alfa** | 13/11 |
| F0-002 | ExVeemon (Champion) | `references/exveemon_concept.png` | `ce3c13dc6a488f9fe05d1b2a08c1eedf` | 1536×1024, RGB sem alfa | 13/11 |
| F0-003 | Agumon (Rookie) | `references/agumon_concept.png` | `accf6ea1d2508f1f5528818fac1ef7fe` | 1536×1024, RGB sem alfa | 13/11 |
| F0-004 | Gabumon (Rookie) | `references/gabumon_concept.png` | `bb627a4b3dc8fbd8243caca0a0c615f6` | 1536×1024, RGB sem alfa | 13/11 |
| — | Veemon | não recebido (pendente segundo o pacote) | — | — | — |

### 4.1 Catalogação factual do coordenador (não é avaliação de qualidade)

Origem e versão: ChatGPT, versão não informada. Nenhum item recebeu nota; as notas são do game-art e do game-qa.

- **[E] Transparência.** Os 4 PNGs são RGB, sem canal alfa (verificado com `file`). O quadriculado é pintado. **Transparência real: não.**
- **[E] Formato.** São folhas de conceito com dezenas de poses, em posições e tamanhos variáveis. Não há grade nem contrato de quadro.
- **[H] Contagem visual aproximada por folha:**

| Folha | Quadros (aprox.) | Conteúdo observado |
|---|---|---|
| Guilmon | ~58 | frente, costas, perfil/caminhada, ataque com fogo, dano, vitória |
| ExVeemon | ~56 | 6 poses grandes de turnaround + ~50 menores; **duas escalas na mesma folha** |
| Agumon | ~52 | frente, costas, perfil/caminhada, ataque, dano/queda, vitória |
| Gabumon | ~44 | turnaround, perfil, ataque de gelo, dano, vitória |

- **[H] Aparência.** Lembra pixel art, mas a grade precisa ser verificada: a imagem pode ter sido ampliada ou ter o pixel art apenas imitado. O game-dev já estimou que o Método A exige 8 passos e de 12 a 32 h por personagem completo (COMPARATIVO §6.4).
- **[E] Escala relativa.** Não pode ser medida nas folhas. Precisa do estudo (`ESTUDO_ESCALA_DIGIMONS.md`) depois que a grade for confirmada.

### 4.2 Separação obrigatória
- **Agumon (F0-003)** também está no trio da comparação controlada A/B/C. A avaliação **desta** folha é de reaproveitamento (Fase 0) e **não substitui** o resultado do Método A no experimento controlado.
- Guilmon, ExVeemon e Gabumon estão fora do briefing A/B/C. Só servem como dado de reaproveitamento.

### 4.3 Próximos passos (um agente por vez, sem geração e sem integração)
1. O **game-art** preenche a ficha da §3 para F0-001 a F0-004 usando a `RUBRICA_QUALIDADE_VISUAL_V1.md`, que está sendo escrita pelo game-qa. Inclui verificar a grade de pixel em 1× e o custo de limpeza.
2. O **game-qa** faz a revisão independente das fichas.
3. O fundador homologa ou descarta. Nada entra no jogo.

## 5. Regras
- Os assets recebidos são **candidatos**. Nada é aprovado automaticamente.
- O resultado do **reaproveitamento** destes assets antigos fica **separado** da **comparação controlada** A/B/C, que usa o mesmo briefing (Tamer + Koromon + Agumon + WarGreymon + floresta-piloto).
- O Método A **não é classificado** como melhor nem pior antes de os resultados serem recebidos e avaliados.
- Nenhum asset é integrado ao jogo nesta etapa.
- Nenhuma geração paga do PixelLab sem autorização específica.
- Para cada asset avaliado, registrar o custo real: tempo e retrabalho.
