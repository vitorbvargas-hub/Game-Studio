# Relatório da noite — 2026-11-14 (game-studio)

Mandato do fundador: finalizar o Agumon (focinho, tamanho, "fofo"); se eu e o ChatGPT aprovarmos, GIF andando e atacando e depois a linha do Gomamon; se não der, seguir para o próximo teste; D12 liberado (PixelLab).

## Resultado

| Item | Estado | Nota do ChatGPT | Onde |
|---|---|---|---|
| Agumon v6 | **No Link A (5191) como padrão**: anda e ataca (Pepper Breath) nas 4 direções. Commit `d6cecf3` | 7,5 | `pacote_agumon_v6/`, `integracao/` |
| Bukamon v1 | Pacote pronto; flutua S/L/O, N parado; sem ataque | 8,5 | `pacote_bukamon_v1/` |
| Gomamon v1 | Pacote pronto; anda e ataca (garra) nas 4 direções | 8,0 | `pacote_gomamon_v1/` |
| Ikkakumon v1 | Pacote provisório; anda L/O, S/N parados; sem ataque | 7,5 | `pacote_ikkakumon_v1/` |

A linha do Gomamon **ainda não está no jogo**. Foi aprovada para teste no laboratório, e a integração é a próxima tarefa do game-dev.

## O que aprendemos (evidência)
1. **ChatGPT gerando o Agumon foi bloqueado** ("pode violar diretrizes… semelhança com conteúdo de terceiros"). Não tentei contornar. A partir daqui o ChatGPT fica só como revisor, em texto, e ajudou bem nesse papel.
2. **O método que funcionou:** criar uma pose de frente aprovada; usar o PixelLab v3 *rotate* para as 4 direções (1 geração); animar com o PixelLab v3 *custom* (1 geração por direção); espelhar o oeste de graça; corrigir à mão o que falhar.
3. Para espécie nova: **create_image_pro** com 2 referências (arte oficial = design; Digimon já aprovado = estilo). Custa 10 gerações e entrega 25 a 64 candidatos, que já trazem **poses de emoção de bônus** (feliz, triste, fome, dormindo, bravo…).
4. Animação por *template* genérico deforma o Digimon. O v3 *custom* é muito melhor.
5. O focinho "narigudo" de antes era culpa do desenho do ChatGPT, não da escala.

## Pendências para você decidir
- **Escala** (conflito aberto da Etapa 6): o Agumon ficou com cerca de 0,9 do Tamer (34–39 px contra 41). O ChatGPT sugere 33–34 px. Não mexi.
- **Orçamento PixelLab:** o saldo está em **650,95**, exatamente no piso. Para dar ataque e emoções à linha toda, falta pouco por espécie: cerca de 4 a 8 gerações por animação de 4 direções. Para continuar, é preciso liberar mais saldo ou esperar a renovação em 11/12.
- **Ataque do Agumon mais lento** (1,1 s contra 0,38 s antes). Dá para ajustar o fps, se você achar lento.

## Defeitos conhecidos (correção à mão, sem custo)
- **Agumon de costas:** lê como um corpo liso. A cauda que desenhei não se sustenta em todos os quadros.
- **Ikkakumon:** as presas piscam na caminhada (P0 do ChatGPT).
- **Gomamon de frente:** quica mais do que avança.

## Custo
PixelLab: 714,95 → 650,95 (**64 gerações**). Agumon 23, Gomamon 19 (inclui 2 descartadas), Bukamon 13, Ikkakumon 8 (inclui 1 descartada), 1 de desconto de rodada. Integração: 0.

## Regras
- Nenhum deploy, nenhum push, jogo principal intocado.
- Referências oficiais ficaram só para uso interno, com fonte anotada.
- Nesta noite eu gerei e editei arte por mandato seu. A exceção está registrada no log e pede revisão do game-art ou do game-qa.
