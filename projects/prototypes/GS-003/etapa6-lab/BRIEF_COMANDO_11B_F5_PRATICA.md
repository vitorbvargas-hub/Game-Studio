# Brief game-art: Comando 11b, a F5 prática no Retro Diffusion (cenário 1)

**Data:** 2026-11-14 · **Dono:** game-art (Fable 5.2) · **QA:** game-qa (Opus 5.5) · **Coordenação:** game-studio

## Autorização do fundador
- **Cenário 1** aprovado: "pode testa". O Agumon vai no **saldo grátis**, com o risco aceito de a imagem ficar pública.
- A conta já está **logada no Chrome do fundador**: `browser`, profile `chrome-sharp`, aba `t35` (https://retrodiffusion.ai/app). O painel mostrava "Free usage 86% left".
- **Proibido:** comprar, recarregar, colocar cartão, ativar assinatura ou auto-recarga, criar chave de API, mexer na conta ou nas configurações, ou ler ou registrar dados pessoais da conta.
- **Teto:** o saldo grátis que sobrou. Quando acabar, pare.

## Contexto que você precisa ler antes
- `fase15-f5-retro-diffusion/RELATORIO_F5.md` e `PROPOSTA_TESTE_PAGO.md`: recursos, preços e plano dos experimentos.
- O parecer do ChatGPT sobre a F6 (PROJECT_LOG, 18:35): o Pepper Breath fica em **camada 2D separada saindo da boca**, e o visual 3D foi rejeitado.

## Experimentos, nesta ordem
Confira o preço no botão antes de cada um.
1. **D, rotate (≈0,10):** a partir de `fase13-comando10/backup_f2b/pacote_agumon_f2/rotations/S.png` (o F2b, a referência estética aprovada). Se faltar margem, centralize num canvas de 64×64 **sem reescalar**.
2. **B, walking (≈0,14):** a partir da rotação E do F2b.
3. **C, attack ou Pepper Breath (≈0,14):** a partir da rotação E. Se der, use o efeito de fogo **separado**, saindo da boca.
4. **A, sprite estático (≈0,10):** RD Core com o F2b como referência. Só se ainda houver saldo.

Uma tentativa por experimento. Não force um recurso que não existir.

## Operação do navegador (lições de hoje)
- **Upload:**
  1. snapshot com `refs:"aria"` e `query` igual ao rótulo do botão;
  2. clique no ref;
  3. `browser upload` com `ref` ou `selector` e `paths`, com os arquivos copiados antes para `/tmp/openclaw/uploads/`.
- **Download do resultado:** **NUNCA use `browser action=download`**. Ela repete o clique e encheu a pasta Downloads do fundador de cópias. Prefira:
  - (a) `evaluate` que faz `fetch(imgSrc)` e devolve o base64 de um PNG pequeno, salvo depois com exec; ou
  - (b) **um único** clique no botão de download do site, conferindo depois `/mnt/c/Users/vitor/Downloads` e **movendo** o arquivo dali para a pasta do teste.
  - Não deixe lixo na pasta Downloads do fundador.
- **Se a aba cair** ("access revoked" ou "tab not found"), use `browser tabs` e pegue o tab da Retro Diffusion.

## Saída
Pasta `etapa6-lab/fase15-f5-retro-diffusion/teste/`:
- os resultados em tamanho original;
- folhas e GIFs em 1× e 4× lado a lado com o F2b e o F6;
- as métricas, com os mesmos scripts da F6 e do C10: canvas, âncora, cabeça estável, deslizamento, cores, pixels soltos;
- `RELATORIO_F5_PRATICA.md`, com custo real, o que funcionou e o que falhou, autoavaliação nos 6 critérios do Comando 11 §5 e recomendação (adotar, combinar, reservar ou descartar);
- `PROGRESS.md`.

## Limites
- PixelLab: 0 gerações.
- Não integrar ao jogo.
- Não tocar em F2b, C10, F4, F6 nem no worktree `kb-gs003`.
- Teto de ~2 h de agente.

Ao terminar, pare.

---
## ADENDO (2026-11-14 ~19:35): Claim diário, só o experimento C
- O fundador autorizou usar o **"Claim" diário grátis** ("1. sim"), aceitando de novo a galeria pública. Não retirar as imagens que já estão lá.
- O QA independente recomendou rodar **apenas o C (ataque / Pepper Breath)**. O A (RD Core) **não** deve rodar.
- **C:**
  - a partir da rotação E do F2b, uma tentativa de `attack`;
  - se o painel oferecer efeito de fogo separado (vfx), uma tentativa da chama **sozinha, sem o Digimon**, para posicionar na boca depois;
  - se não houver saldo depois do Claim, pare.
- Saída em `teste/C_ataque/`. Atualize o `RELATORIO_F5_PRATICA.md` com uma seção "Adendo C" e a autoavaliação.
- Lembretes: o perfil `chrome-sharp` e a aba da Retro Diffusion estão autorizados para este teste; não registre os títulos das outras abas. Nunca use `browser download`. Não deixe lixo na pasta Downloads.
