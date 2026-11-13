# ADR-014 — GS-003 passa a se chamar Digital Odyssey

- **Data:** 2026-11-12 · **Decisor:** Vitor Vargas (fundador) · **Registro:** game-studio
- **Status:** APROVADA pelo fundador.

## Decisão
O jogo antes identificado como GS-003 chama-se oficialmente **DIGITAL ODYSSEY**. Subtítulo descritivo: **Um fangame de Digimon**.

**GS-003 permanece como identificador técnico legado**: pastas, ids, chaves de save, scripts, branches, nomes de projeto e de deploy, e referências históricas em documentos antigos.

## Aplicado (público e documental)
- Título da aba do navegador e metadados descritivos de `prototype/world/index.html` (description e Open Graph).
- Descrição do `prototype/world/package.json`. O campo `name` (`gs003-world`) não mudou.
- Cabeçalho de identidade nos READMEs principais (`GS-003/README.md`, `world/README.md`) e no `portfolio/PORTFOLIO_MASTER.md`.
- Novos documentos devem usar "Digital Odyssey".

## Não alterado, por restrição do fundador
Mapas, sprites, gameplay, banco de dados, regras de evolução, design visual, domínios e URLs, nomes de repositórios e pastas, e identificadores internos. Não há logotipo novo. Sem deploy automático. A Digimon Database 1.0 (Etapa 4) ficou intacta.

## Observações
- Não existia nome do jogo na interface do jogador; nenhum texto novo foi criado nela.
- O projeto da Vercel `gs003-digimon-preview` e a URL pública mantêm o nome antigo até o fundador decidir sobre domínio e deploy.
- A linha de log do console (`GS-003 world · …`) é diagnóstico técnico e foi preservada.
