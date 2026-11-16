# Brief game-art: Comando 11, F5 Laboratório Retro Diffusion

**Data:** 2026-11-14 · **Dono:** game-art (Fable 5.2) · **QA:** game-qa (Opus 5.5) · **Coordenação:** game-studio
**Comando do fundador, que vem antes deste brief em caso de conflito:** `etapa6-lab/COMANDO_11_F5_RETRO_DIFFUSION.md`. Leia inteiro.

## Antes de começar
- Leia o contexto comum: `shared/knowledge/DIGITAL_ODYSSEY_CONTEXT.md` (§4.1, protocolo de referência).
- Leia o que já existe sobre ferramentas: `etapa6-lab/COMPARATIVO_FERRAMENTAS_VISUAIS.md`, para não repetir pesquisa.
- O Agumon que serve de referência e as pendências estão em `etapa6-lab/BACKLOG_AGUMON.md`. Não mexa nas versões preservadas.
- Não execute o Comando 10b.

## Escopo
Cumpra §3 a §8 do comando, nesta ordem:
1. **Investigação:**
   - documentação oficial do Retro Diffusion (site, documentação da API, plugin do Aseprite, termos e licença);
   - acesso gratuito, custo por geração, recursos de referência, animação e direções, limites de resolução.
   - Separe **[E] evidência**, com URL e data, de **[H] hipótese**.
2. **Teste prático:** só se existir acesso gratuito **sem conta paga e sem credencial pessoal**.
   - Criar conta, usar login, cartão ou chave de API **não está autorizado**.
   - Se o teste exigir isso, pare na investigação e entregue uma **proposta de teste com custo estimado** para o fundador decidir.
   - Não contorne paywall, CAPTCHA nem Cloudflare.
3. **Comparação A–E:** use os pesos do §5 do comando.
   - Notas de A a D: aproveite os QAs que já existem (F2, F3, F4, C10).
   - Nota de E: só com evidência prática. Sem teste, escreva "sem validação prática". **Não invente nota.**
4. **Possibilidades híbridas (§6):** só análise.

## Saída
`etapa6-lab/fase15-f5-retro-diffusion/`:
- `RELATORIO_F5.md`, com os 7 entregáveis do §8.
- `PROPOSTA_TESTE_PAGO.md`, se for o caso.
- PNGs e GIFs, se houver teste.
- `PROGRESS.md`, sempre atualizado.

## Limites
- PixelLab: 0 gerações.
- Não fazer pagamento, cadastro nem integração.
- Não fazer F6 nem F7.
- Não tocar no worktree `kb-gs003`.
- Teto: ~2 h de agente.
- Se cair por limite de uso, o `PROGRESS.md` mostra onde parou.

Ao terminar, pare. O game-studio aciona o game-qa e depois leva ao ChatGPT.
