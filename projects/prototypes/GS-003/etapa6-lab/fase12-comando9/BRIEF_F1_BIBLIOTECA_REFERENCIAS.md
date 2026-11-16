# Comando 9, Frente 1: biblioteca de referências (game-research)

**Data:** 2026-11-14 · **Dono:** game-research · **Coordenação:** game-studio
**Aprovado por:** fundador (próximos testes) e ChatGPT (revisor). Execução sequencial: F1 → F2 → F3 → F4, um agente por vez.

## Objetivo
Montar uma biblioteca **curada**, com qualidade e não quantidade, de referências de sprites Digimon para quatro espécies: **Agumon, Greymon, Gomamon, Ikkakumon**. Inclua também Koromon e Bukamon se encontrar algo bom. A biblioteca é o "passo 0" do Sprite Production Standard 1.1, uma regra nova do fundador: **antes de produzir cada Digimon, buscar pixel art pronta, usar o que tiver licença e pedir permissão para o resto.**

## Fontes, em ordem
1. **Oficiais: The Spriters Resource, Digimon World 3 (PS1)** em https://www.spriters-resource.com/playstation/digiworld3/, além de DW Dawn/Dusk, DW DS, DW Championship (já baixado: `etapa6-lab/fase10-fontes-sprites/dwchampionship/`) e outros jogos oficiais com sprite de mapa em 4 direções.
   - **Por quê:** é o melhor material de *movimento* oficial.
   - **Uso:** o fundador aceita sprites oficiais como referência interna, inclusive como entrada no PixelLab (decisão D12).
   - **Limite:** a licença MIT de repositórios não cobre os assets da Bandai. Não presuma permissão para redistribuir.
   - **Como acessar:** o site tem Cloudflare. Use o navegador `chrome-sharp` (`browser`, `profile=chrome-sharp`): a página carrega e o `fetch` dentro da página funciona. Para salvar a imagem pixel a pixel, desenhe num canvas overlay em escala 1 e tire screenshot (veja `fase10-fontes-sprites/`).
2. **Pinterest** (é descoberta, não prova de autoria): leve cada pin até o autor original.
3. **DeviantArt, ArtStation e Reddit** (r/PixelArt, r/digimon): artistas autorais. Leia a licença na página.
4. **Wikimon e Reference Book:** fidelidade de design (as fichas de anatomia já existem em `fase11-fichas-anatomia/`).

## O que procurar
Caminhada em 4 direções, ataque, emoções, anatomia de quadrúpede (Gomamon, Ikkakumon), cauda e membros, e técnicas chibi GBA/DS/PS1.

## Dados do DW3 (separado, sem misturar)
Os repositórios achados foram:
- markisha64/ddw3
- ReGame-Labs/dw3_decomp (MIT)
- markisha64/dmw3-randomizer (MIT, lê as tabelas)
- dawsonc623/digimon-world-2003 (MIT)
- RonnyAraujoTest/digimon-world-3-api

Produza uma **matriz comparativa** das 6 espécies, comparando o DW3 com a nossa Database (`projects/prototypes/GS-003/database/`) em três pontos: digivoluções, golpes e atributos.
- **Não incorpore nada na Database.** Qualquer incorporação exige aprovação.
- **Não baixe ROM** nem use repositório que distribua o jogo.

## Saída em `etapa6-lab/fase12-comando9/f1/`
- `CATALOGO_REFERENCIAS.md`: tabela por espécie com URL original, autor ou responsável, tipo (oficial/fã), animação/direções, resolução, o que é útil, **licença** (livre / pedir / oficial-uso interno) e se dá para pedir permissão (canal de contato).
- `SELECAO_COMENTADA.md`: as 3 a 5 melhores por espécie, com o porquê.
- `imagens/`: cópias locais **só** das oficiais e das de licença livre, para estudo interno. As de fã sem licença ficam só como link.
- `PEDIDOS_PERMISSAO.md`: lista dos artistas que valem pedido, com canal e texto sugerido. **Não envie nada.** O envio é decisão do fundador.
- `MATRIZ_DW3_DATABASE.md`.

## Regras
- Separe [E] evidência (com fonte e data) de [H] hipótese.
- Nada de arte de terceiros no jogo.
- Não gaste créditos PixelLab.
- Não toque nos Links A e B nem no jogo principal.
- Arte de fã sem licença clara serve só como referência de estudo.

## Validação
O game-studio revisa e leva ao ChatGPT e ao fundador. A F2 só começa depois.
