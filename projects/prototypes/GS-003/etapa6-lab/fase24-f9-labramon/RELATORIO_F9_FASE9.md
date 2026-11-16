# Relatório F9 — Fase 9: laboratório HTML interativo do Labramon

Digital Odyssey (GS-003) · F9 Labramon · Fase 9 · 2026-11-16 (BRT) · Autor: `game-dev` (Sonnet) · Comando `COMANDO_F9_LABRAMON.md` §13.
Fan game não oficial, sem licença, sem monetização; uso local, nada publicado. **[E]** evidência medida · **[H]** leitura/hipótese/proposta do laboratório.
Esta é a entrega da Fase 9. **Não é** o QA independente (Fase 10, `game-qa`) nem homologação.

## 1. Status

**COMPLETA.** Entregue em `lab/`: página HTML estática autônoma (sem build, sem dependências externas — só HTML/CSS/JS puro), que carrega os PNGs reais via `lab-data.js` (gerado dos `manifesto.json` de `movement/`, `emotions/`, `rest/`, `interactions/`, `combat/`) e implementa todos os controles do §13.
Servida localmente via `systemd-run --user` (unit `gs003-lab-labramon-5198`, porta 5198, `127.0.0.1` apenas). HTTP 200 confirmado. Teste automatizado com `chrome-headless-shell` (CDP puro): **180/180 assets carregam, 0 erros de console, 0 exceções de página, 26/26 verificações do self-test passam**.
Não toquei o jogo, os labs existentes nem a Database. Nenhum PixelLab usado (0 gerações). Nada publicado.

## 2. O que foi construído

```
fase24-f9-labramon/lab/
  index.html         # UI: palco (1 ou 2 painéis), controles, diagnóstico
  styles.css
  app.js             # motor de reprodução, máquina de estados, análise ao vivo de quadro, self-test
  lab-data.js        # GERADO por build_lab_data.mjs a partir dos manifesto.json reais — não editar à mão
  assets/tamer_reference/tamer_v13_south.png   # cópia de leitura do Tamer provisório (original intocado)
fase24-f9-labramon/scripts_f9_fase9/
  build_lab_data.mjs       # gera lab/lab-data.js
  run_headless_test.mjs    # teste automatizado (Chromium headless via CDP)
  LEIAME.md
  _evidencias_teste/       # 3 capturas + report.json do teste automatizado
```

Nenhum pixel foi gerado ou regenerado nesta fase: o laboratório só lê e organiza os arquivos já produzidos nas Fases 3–8 (via seus `manifesto.json`), e desenha o canvas com `drawImage` sem reamostragem (`image-rendering: pixelated`).

### 2.1 Controles obrigatórios (§13) — todos implementados

| Controle | Implementação | Direções |
|---|---|---|
| Seleção de direção | `<select>` por painel (S/E/N/W) | — |
| Caminhada WASD | `keydown`/`keyup` em W/A/S/D (+ botões de seta p/ telas sem teclado); cadência configurável, padrão **100 ms/quadro** (sugestão de arte do `movement/manifesto.json`, Fase 4); o painel mostra, por direção, o recuo do pé medido na Fase 4 (E: 2,28 px/quadro; W: 3,0 px/quadro; S/N: sem recuo lateral medido) e a velocidade aproximada resultante (recuo ÷ cadência) | S, E, N, W |
| Standing | `movement/standing/{dir}.png`, quadro parado | S, E, N, W |
| Idle | `movement/idle/{dir}` em loop | S, E, N, W |
| Feliz / Triste / Irritado / Assustado | `emotions/{happy,sad,angry,scared}`: entrada → loop contínuo → (2º clique no mesmo botão) saída → idle | **E** |
| Deitar | `rest/rest/stand_to_lie` → segura a pose deitada (não há loop de repouso acordado na produção; o laboratório não inventa um — mostra "deitado (parado — sem loop…)" no rótulo) | **E** |
| Dormir | a partir de deitado: `lie_to_sleep` → `sleep_loop` contínuo; a partir de em pé: encadeia `stand_to_lie` antes (documentado no rótulo como "auto, antes de dormir") | **E** |
| Acordar | só habilitado dormindo: `sleep_to_wake` → `wake_to_stand` → idle | **E** |
| Carinho | `interactions/petting`: entrada → loop contínuo → (2º clique) saída → idle | **E** |
| Comemoração | `interactions/celebrate` (8 quadros, disparo único) → idle | **E** |
| Ataque | `combat/attack_retriever_bark` (8 quadros) **com a camada FX da onda de choque sincronizada pela linha do tempo do manifesto** (`fx_onda_de_choque.linha_do_tempo`) → idle | **E** |
| Receber dano | `combat/hurt` (8 quadros) → idle | **E** |
| Incapacitação | `combat/incapacitated`: queda (6q) → estado incapacitado em loop | **E** |
| Recuperação | só habilitado incapacitado: `combat/incapacitated/recuperacao` (8q) → idle | **E** |

Os botões de descanso/combate ficam desabilitados quando a pré-condição não é satisfeita (ex.: "Acordar" só liga depois de "Dormir"; "Recuperação" só depois de "Incapacitação"), para não permitir uma sequência que a produção não cobriu.

### 2.2 Visualização (§13)

- **Escala real / zoom 2× / zoom 4×:** seletor de zoom, aplicado via CSS no `<canvas>` (`image-rendering: pixelated`), sem build.
- **Fundo transparente / neutro / grama:** transparente = padrão xadrez (convenção de editor para mostrar transparência); neutro = cinza sólido `#808080` (mesmo tom das "folhas de contato" da produção); grama = padrão procedural desenhado em CSS/JS, **não é asset do jogo** (rotulado assim na própria UI — nada de PixelLab usado aqui).
- **Comparação entre estados:** um segundo painel independente (própria direção, próprio estado, próprio player) ativado por checkbox.
- **Reprodução contínua / quadro a quadro:** botão Pausar/Retomar + Quadro anterior/próximo; o motor usa um relógio por `requestAnimationFrame` (não `setTimeout` por quadro), então pausar e avançar quadro a quadro não desalinha a reprodução depois.
- **Pivô e colisão:** sobreposição desenhada no canvas: cruz no pivô (29,5; 49, da `movement/manifesto.json`) e uma elipse de contato no pé. **A elipse é uma proposta do laboratório [H]** — a produção de arte (Fases 4–8) não definiu uma caixa de colisão; isso está escrito na própria UI/código, não apresentado como dado oficial.

### 2.3 Diagnóstico (§13)

Painel com, em tempo real, por quadro renderizado: estado atual, direção, quadro (índice/total), **FPS medido de verdade** (contagem de `requestAnimationFrame`, não um número fixo), duração da animação (total do clipe + duração do quadro atual, dos próprios manifestos), **dimensões** (bounding box real medido agora por `getImageData`, não um número copiado do relatório da Fase 4/5-8), âncora (compara o pé medido agora com o pivô y=49 e avisa se diverge), **número de cores** (contagem real feita agora, não herdada), e status do asset (ok/erro, por URL, vindo do `onload`/`onerror` real da imagem). Também uma tabela de disponibilidade por direção × grupo de estados, e um contador de assets carregados (180/180).

**Estados ausentes aparecem como INDISPONÍVEL.** Testado: selecionar uma emoção/descanso/interação/combate fora da direção E mostra "INDISPONÍVEL (… só existe em E)" por 1,8 s e **não troca o quadro nem o estado** — não há simulação.

### 2.4 Tamer provisório

Seção condicional: só aparece porque `etapa6-lab/fase1-pixellab/referencias/tamer_v13_south.png` (36×36) existe no repositório. O build script faz uma **cópia de leitura** para `lab/assets/tamer_reference/` — o arquivo original não foi tocado (nem aberto em modo de escrita). É só referência visual de escala/posição, como pedido; nenhuma lógica de interação usa esse sprite.

## 3. Como foi servido e testado [E]

```
systemd-run --user --unit=gs003-lab-labramon-5198 \
  --working-directory=.../etapa6-lab/fase24-f9-labramon \
  -- python3 -m http.server 5198 --bind 127.0.0.1
```
- Raiz do servidor = `fase24-f9-labramon/` (não `lab/`), para que `lab/index.html` alcance `../movement/`, `../combat/`, etc. por caminho relativo sem sair da raiz servida.
- `curl -s -o /dev/null -w "%{http_code}"` → **200** em `lab/index.html`, `lab/app.js`, `lab/lab-data.js`, um PNG de `movement/`, um de `combat/.../fx/` e o PNG do Tamer de referência.
- Serviço confirmado **ativo** (`systemctl --user is-active` → `active`) ao final desta entrega.

**Teste automatizado** (`scripts_f9_fase9/run_headless_test.mjs`), `chrome-headless-shell` do Playwright (`~/.cache/ms-playwright/chromium_headless_shell-1243`) via CDP puro (WebSocket bruto, sem pacote Playwright/Puppeteer), mesmo padrão dos QAs anteriores do estúdio (`map-factory/.../capture_reference.mjs`). Achado de ambiente, documentado no `LEIAME.md`: o sandbox define `HTTP_PROXY`/`HTTPS_PROXY` globais que capturam até o `fetch`/`WebSocket` do próprio Node para `127.0.0.1` (o `--no-proxy-server` do Chromium só cobre a navegação do navegador, não as chamadas do script ao CDP); o script zera essas variáveis no próprio processo antes de qualquer chamada de rede.

### Resultado [E] (`scripts_f9_fase9/_evidencias_teste/report.json`)

| Verificação | Resultado |
|---|---|
| `window.__labReady` (todos os assets tentaram carregar) | true |
| Assets carregados | **180/180, 0 com erro** |
| Erros de console (`Runtime.consoleAPICalled` tipo `error`) | **0** |
| Exceções de página (`Runtime.exceptionThrown`) | **0** |
| Requisições de rede falhadas | **0** |
| Self-test (`window.__labSelfTest()`) | **26/26 verificações passaram, 0 novos erros** |
| Checagem de indisponibilidade (emoção fora de E) | **true** — não trocou de estado, não simulou |

O self-test cobre: standing/idle/walk nas 4 direções (12 verificações), feliz/triste/irritado/assustado com entrada+saída, deitar/dormir/acordar em cadeia, carinho com entrada+saída, comemoração, ataque (com FX), dano, incapacitação, recuperação (14 verificações) — **26 no total**. Cada verificação confere que o quadro exibido corresponde a um asset com status `ok`.

Capturas em `scripts_f9_fase9/_evidencias_teste/`: `01_carregado.png` (estado inicial, idle E/W, tabela de disponibilidade), `02_apos_selftest.png`, `03_comparacao_zoom4_pivo_grama.png` (comparação lado a lado, zoom 4×, fundo grama, overlay de pivô/colisão — inspecionada visualmente, confirma o desenho correto).

## 4. Decisões de engenharia (documentadas, para o QA/coordenador revisar)

1. **Cadência da caminhada:** o §13 pede "cadência por espécie configurável, padrão ~ o que mede o recuo do pé da Fase 4". Implementei: padrão = 100 ms/quadro (é literalmente a `duracao_sugerida_ms_por_quadro` que a Fase 4 já registrou no `movement/manifesto.json`, com base na própria caminhada medida); o campo é editável; e o painel mostra, ao vivo, o recuo medido (E/W) e a velocidade resultante (recuo ÷ cadência), para quem for ajustar ter o número certo à mão. Não inventei uma velocidade de jogo (o Tamer não tem velocidade documentada nesta fase).
2. **Deitar sem loop de repouso acordado:** a Fase 6 não produziu uma "pose deitada acordada em loop" (só `sleep_loop`, dormindo). Em vez de simular uma respiração que não existe, o laboratório **segura o último quadro de `stand_to_lie`** e rotula isso explicitamente no estado ("deitado (parado — sem loop de repouso acordado na produção)"). Isso é intencional e documentado, não uma lacuna escondida.
3. **Toggle de emoção/carinho:** como as Fases 5 e 7 produziram clipes de entrada/loop/saída (não um loop infinito com atalho de saída embutido), o laboratório trata o mesmo botão como liga/desliga: 1º clique = entrada→loop; 2º clique no mesmo botão = saída→idle. Clicar em outro controle enquanto um loop está ativo faz um corte direto para o novo clipe (sem tocar a saída do anterior) — documentado no código; não há instrução no comando sobre esse caso específico.
4. **Colisão:** a produção de arte (Fases 3–8) não definiu uma caixa de colisão. A sobreposição "pivô e colisão" desenha o pivô real (29,5; 49) e uma elipse de contato **proposta pelo laboratório [H]**, claramente diferenciada do pivô (cor diferente) e descrita como proposta no código — não é apresentada como dado da produção.
5. **FX do ataque:** a camada de 96×60 (onda de choque) é desenhada sobre o sprite 60×60 na mesma origem, com os quadros de FX escolhidos a cada instante pela `linha_do_tempo` do `combat/manifesto.json` (não é um GIF à parte: é sincronizada quadro a quadro pelo relógio do laboratório).
6. **Servidor:** mantive o `systemd-run --user` ativo ao final da entrega (só em `127.0.0.1`, não exposto), para a Fase 10 (QA independente) poder abrir o laboratório sem precisar subir nada. Comando para derrubar: `systemctl --user stop gs003-lab-labramon-5198`. Registro para o coordenador: isso é um servidor local ligado; se a regra "servidor sempre ligado exige aprovação" (ADR-008) for lida como cobrindo até ferramentas de laboratório em `127.0.0.1`, avise e eu derrubo.

## 5. O que não foi feito / limitações

- Não gerei nem editei nenhum pixel (0 gerações PixelLab). O laboratório é 100% consumidor dos manifestos.
- Não testei em navegador com interface gráfica real (só headless); os clipes foram inspecionados via captura de tela (`read` de imagem) para confirmar visualmente o desenho, o zoom, o fundo e o overlay — não substitui um teste manual humano.
- Não implementei temporizador automático de saída das emoções/carinho (ex.: "depois de 3s volta sozinho"); o §13 não pede isso e o comando diz para não inventar.
- Não medi desempenho (FPS sob carga, múltiplos personagens); o laboratório roda 1 Labramon por painel, no máximo 2 com a comparação.
- A tabela de disponibilidade e os botões desabilitados cobrem os grupos de estado, não cada clipe individual isoladamente (ex.: não há um botão separado para "só a entrada do ataque"); achei que isso corresponde ao nível de granularidade pedido pelos controles do §13.
- Não toquei no `interactions/contratos/` nem na Database; só li o índice de contratos (`contrato_estados_labramon_indice.json`) para a lista de ids/transições, sem usar os campos reservados (afinidade/humor/vínculo continuam `null`).

## 6. Arquivos

- `lab/index.html`, `lab/styles.css`, `lab/app.js`, `lab/lab-data.js` (gerado), `lab/assets/tamer_reference/tamer_v13_south.png` (cópia).
- `scripts_f9_fase9/build_lab_data.mjs`, `scripts_f9_fase9/run_headless_test.mjs`, `scripts_f9_fase9/LEIAME.md`.
- `scripts_f9_fase9/_evidencias_teste/{01_carregado.png,02_apos_selftest.png,03_comparacao_zoom4_pivo_grama.png,report.json}`.
- `PROGRESS.md` — atualizado.

**Acesso:** `http://127.0.0.1:5198/lab/index.html` (só localhost; serviço `systemd --user` `gs003-lab-labramon-5198`).

## 7. Decisões que dependem do coordenador/QA

1. Confirmar se manter o servidor `127.0.0.1:5198` ligado entre fases está dentro do escopo de "laboratório isolado" ou se precisa de aprovação específica (ADR-008) por ficar "sempre ligado".
2. A proposta de colisão (elipse no pé) é só para visualização no laboratório — não deve virar referência de colisão real sem uma tarefa própria.
3. Pasta `lab/` e `scripts_f9_fase9/` não foram commitadas no git (mesmo estado de `movement/`, `combat/`, `rest/`, `emotions/`, `interactions/`, que também estão `??` no `git status` desde as Fases anteriores) — commitar fica a critério do coordenador, junto com o resto da F9.

Para o `game-qa` (Fase 10): abrir `http://127.0.0.1:5198/lab/index.html`; `window.__labSelfTest()` no console reproduz a bateria automatizada; `window.__labAssetSummary` mostra o total de assets e falhas.
