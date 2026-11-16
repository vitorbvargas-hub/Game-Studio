# Brief game-dev: Comando 14.3, build isolado do Hawkmon v1b para o teste no mapa

**Data:** 2026-11-15 · **Dono:** game-dev (Opus 5.5) · **QA:** game-qa (Opus 5.5) · **Coordenação:** game-studio

**Aprovado pelo ChatGPT** (revisor artístico obrigatório) para teste. **Não está homologado para produção.** O comando dele vale como especificação; o resumo está abaixo.

## Entradas
- **Pacote:** `etapa6-lab/fase20-f8b-hawkmon/etapa2b_walk_idle/pacote_hawkmon_v1b/`.
  - idle com 6 quadros e walk com 8, nas 4 direções;
  - canvas 60×60, âncora (29,5 ; 49);
  - `pacote.json` com o tempo de quadro por espécie;
  - em `camadas/`, corpo e topete separados.
- **QA:** `QA_ETAPA2B_INDEPENDENTE.md`, seções "Re-QA v1b" e §9, com as condições do build.
- **Infraestrutura de base:** o build da F7v2.
  - worktree `workspaces/game-dev/lab-f7v2`, branch `lab/f7v2`, commit `415825a`;
  - relatórios: `fase18-build-f7v2/RELATORIO_BUILD_F7V2.md` e o brief 12.2b.

## Isolamento
- Crie um build **novo**, sem alterar o da porta 5196, que está aguardando o teste do Vitor:
  - branch `lab/hawkmon-v1b`, criada a partir de `lab/f7v2`;
  - worktree próprio;
  - assets em `lab-assets/a-hawkmon/`;
  - serviço systemd de usuário `gs003-lab-hawkmon-5197`, na **porta 5197**, com Restart=on-failure e `--setenv=PATH=$PATH`.
- Não mexa no jogo principal, no Lab A (5191) nem no F7v2 (5196).
- Não altere a Database nem o formato de save.
- Não edite arte e não use créditos do PixelLab.
- Não faça push, merge nem deploy.
- O ChatGPT pediu um preview web, mas **deploy público não está autorizado**. Entregue o link local e registre o pedido como decisão do fundador.

## Integração
- O Hawkmon entra como **parceiro de teste** por parâmetro (por exemplo `?parceiro=hawkmon`). O Agumon F7v2 continua disponível para comparar lado a lado, se der, ou por outro parâmetro.
  - Se o motor exigir dados de espécie, use um registro **local do lab**, sem tocar na Database (o Hawkmon é Rookie, Vaccine).
  - Golpes ficam fora: **sem ataques e sem Feather Slash**. Se o motor exigir golpe, use um placeholder neutro sem efeito novo.
- Âncora fixa, sem trim e sem reposicionar quadro a quadro.
- **Tempo de quadro por espécie**, sem mudar a velocidade global: teste ~73 ms e ajuste pela velocidade real de deslocamento, de modo que o pé não escorregue (o Hawkmon dá passos de 2 px por quadro). Registre o valor final.
- Sombra de contato e ordem de profundidade do mapa, como no lab atual.

## Testes obrigatórios (Chromium headless; 0 erros de console)
1. Caminhada S/N/E/W em velocidade normal e lenta, incluindo as paradas.
2. Transições idle → walk → idle.
3. Hawkmon, Agumon e Tamer juntos na tela.
4. Quadros 5–6 de E/W em velocidade real: o "pulinho" do pé aparece?
5. Deslizamento dos pés, colisão e posição da sombra.
6. Terrenos diferentes e objetos próximos.

## Saída
- Pasta `etapa6-lab/fase21-build-hawkmon/`:
  - `RELATORIO_BUILD_HAWKMON.md`, com o link, como testar, o valor de tempo por quadro, as evidências (capturas e GIF curto) e os problemas;
  - `PROGRESS.md`.

## Limites
- Teto de cerca de 2 h de agente.
- Ao terminar, pare. Os próximos passos são o game-qa, o ChatGPT e o Vitor.
