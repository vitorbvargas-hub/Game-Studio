# Brief C14.4 Parte B — Retro Diffusion (F5): documentação, protocolo e orçamento (game-research)

Data: 2026-11-15 · Dono: game-research · Origem: `COMANDO_14_4_F5_CHATGPT.md` (Parte B) · Autorização do Vitor: "pode executar o teste do retro então".
Fan game não oficial, sem licença. Nada é publicado.

## Objetivo
Preparar o teste controlado do Retro Diffusion para compará-lo de forma justa com o método ChatGPT → PixelLab, **sem gerar nada**.

## Entradas (reaproveitar, não refazer)
- Fase anterior: `etapa6-lab/fase15-f5-retro-diffusion/` (pesquisa e prática de 14/11: 2 de 4 experimentos, nota 6,4, recomendação RESERVAR; 2 imagens do Agumon foram para a galeria pública).
- Método de referência: `etapa6-lab/fase22-hawkmon-estilo-chatgpt/METODO_CHATGPT_PIXELLAB_v1.md` (Hawkmon v2: 14,55 gerações; QA 7,78 com 3 correções gratuitas pendentes).
- QA do Hawkmon v2: `fase23-c14-4-f5/QA_HAWKMON_V2_INDEPENDENTE.md` (régua de 8 critérios).

## Tarefas
1. Atualizar a documentação atual do Retro Diffusion: modelos, recursos de animação (walk/idle/direções), formatos, API, preços, créditos grátis, "Claim" diário. Marque o que mudou desde 14/11.
2. Termos de uso: as gerações gratuitas ficam públicas? como apagar? direitos de uso; risco de IP para um fangame sem licença.
3. Personagem de teste **ORIGINAL** (não Digimon nem outro protegido) com anatomia comparável a um Rookie (bípede, ~38 px, cauda/asas): descrição e prompts. O mesmo personagem deve rodar no pipeline ChatGPT → PixelLab para a comparação ser justa.
4. Protocolo de teste: entradas iguais, parâmetros, o que gerar (4 rotações, walk 8q, idle 4q), formato de saída (60x60, âncora (29,5;49)).
5. Métricas: fidelidade, qualidade GBA Plus, consistência anatômica, animação, legibilidade (mesma régua de 8 critérios), tempo e custo (gerações/US$).
6. Orçamento e riscos: quanto custa rodar o protocolo nos dois métodos (gratuito vs pago), com opções.

## Saída
`fase23-c14-4-f5/retro_diffusion/`: `DOC_RETRO_DIFFUSION_2026-11-15.md`, `PROTOCOLO_TESTE_F5.md`, `ORCAMENTO_E_RISCOS_F5.md`, `RELATORIO_PARTE_B.md` (resumo executivo para ChatGPT/Vitor) e `PROGRESS.md`.

## Regras
- **0 gerações, 0 créditos (grátis ou pagos), sem criar conta, sem login, sem enviar imagem para o site.** Só leitura de páginas públicas. Separar [E] evidência com fonte e data de [H] hipótese.
- Não tocar jogo, labs, Database. Não publicar.
- Teto: ~1,5 h de agente.

## Validação
game-qa (independente) → ChatGPT → Vitor.

## Retomada
"Continue do parcial em `fase23-c14-4-f5/retro_diffusion/PROGRESS.md`."
