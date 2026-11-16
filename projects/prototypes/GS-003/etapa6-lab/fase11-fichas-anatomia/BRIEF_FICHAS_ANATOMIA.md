# Brief game-research — Fichas de anatomia (Agumon, Gomamon, Ikkakumon)

**Data:** 2026-11-14 · **Dono:** game-research · **Coordenação:** game-studio
**Por quê:** o fundador apontou erros de anatomia que o gerador inventou:
- o Gomamon saiu sem patas traseiras, e ele tem;
- o Ikkakumon saiu "de 4" reto, mas a traseira dele é baixa, quase sentada;
- o Agumon ganhou listras nas costas, que não existem, e a cabeça dele cresce ao andar de lado.

Ele perguntou: "como deixar vocês mais autônomos para não errar os detalhes?". A resposta é ter **uma ficha de anatomia por espécie, escrita antes de gerar**, usada nos prompts e na conferência.

## Saída
Um arquivo por espécie em `etapa6-lab/fase11-fichas-anatomia/`:
- `FICHA_AGUMON.md`
- `FICHA_GOMAMON.md`
- `FICHA_IKKAKUMON.md`

Mais um `MODELO_FICHA.md` para reusar nas próximas espécies.

## Conteúdo de cada ficha (curto, objetivo, em tópicos)
1. **Fontes.** Arte oficial de vários ângulos: Wikimon/Reference Book, anime, figuras e 3D oficiais. Liste URL e data. Uso interno.
2. **Postura e locomoção.** Bípede, quadrúpede, de barriga, sentado ou flutuante. Diga como ele anda (ex.: o Ikkakumon arrasta a traseira baixa? o Gomamon puxa o corpo com as patas da frente?).
3. **Membros.** Quantos são e onde ficam; tamanho relativo; garras (cor, quantidade).
4. **Marcas, cores e acessórios que EXISTEM**, por região (cabeça, costas, barriga, cauda, membros).
5. **O que NÃO existe:** a lista negativa. Ex.: o Agumon não tem listras nem manchas nas costas.
6. **Vista de costas** e **vista de lado**: o que aparece em cada uma.
7. **Proporções-chave.** Ex.: cabeça/corpo; o tamanho da cabeça não muda ao andar.
8. **Linha de prompt positiva e negativa**, pronta para colar em inglês, curta.
9. **Checklist de conferência** com 5 a 8 itens verificáveis numa imagem, por direção (S/E/N/W).

## Regras
- **[E] evidência com fonte × [H] hipótese.** Se algo não estiver claro nas fontes oficiais, marque [H]. Nada de inventar.
- Sem arte de fã como fonte.
- Não gere imagens nem gaste créditos.
- Português, máximo de ~1 página por ficha.

## Validação
O game-studio confere e usa na regeneração.
