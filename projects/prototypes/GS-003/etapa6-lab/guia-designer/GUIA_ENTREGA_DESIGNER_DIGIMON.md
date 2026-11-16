# Digital Odyssey: o que uma designer precisa entregar para os Digimon ficarem bons

> Rascunho do `game-studio`, 2026-11-15. É um documento interno e ainda **não foi homologado**.
> Imagem de exemplo: `exemplo_folha_entrega.png`, montada com o pacote real do Hawkmon v1b do laboratório.
> Fonte das medidas: `fase20-f8b-hawkmon/.../pacote_hawkmon_v1b/pacote.json` e `fase21-build-hawkmon/RELATORIO_BUILD_HAWKMON.md` [E].

## 0. Antes de contratar (decisão do fundador)

- Contratar uma designer é uma contratação e uma comunicação externa, e as duas precisam da sua aprovação.
- A designer vai desenhar Digimon **oficiais**, e o projeto **não tem licença**. Ela precisa saber três coisas:
  - o jogo é um fangame não oficial;
  - não há monetização;
  - a arte não pode ser reaproveitada fora do projeto.
- Os pontos de **escala** (Tamer × Rookie × Champion) e **paleta** (Endesga-32 × v15b) continuam **abertos**, porque são decisões da Etapa 6. Eles precisam estar fechados antes de encomendar algo em lote. Até lá, o certo é encomendar **1 espécie piloto**.

## 1. O que ela recebe de nós (o kit de partida)

1. Esta folha-exemplo, que mostra o formato e as guias de âncora, chão e tile.
2. O Tamer atual e o Agumon F7v2, para ela comparar o tamanho e o estilo.
3. Um print do mapa v15b com o Tamer, para ver o sprite no contexto real.
4. As referências oficiais da espécie: sprite DS, artwork oficial e frente, costas e perfil, com a fonte registrada na Database.
5. A velocidade de caminhada do jogo: **100 px/s**, e o modo lento a 40 px/s.

## 2. O que ela entrega, por espécie

### Nível 1: o mínimo para andar no mapa (o piloto)

| Asset | Direções | Quadros | Observação |
|---|---|---|---|
| Rotação parada | S, E, N, W (8 direções se o jogo adotar diagonais) | 1 | É o "retrato" do sprite em cada direção |
| Idle (respirando) | as mesmas | 4–6, em loop | O movimento é sutil: 1 px de corpo, asa ou cauda |
| Walk (andar) | as mesmas | 8, em loop | Contato, passagem e contato, com as pernas alternando |

### Nível 2: depois que o Nível 1 for aprovado (combate e vida no mapa)

- Corrida (6–8 quadros).
- Ataque básico (6–10 quadros).
- Dano (2–3 quadros).
- Nocaute (4–6 quadros).
- Emote feliz e emote triste (4 quadros).

As regras de jogo estão **congeladas**: o Nível 2 só entra quando você descongelar o que ele cobre.

## 3. Especificação técnica (o que reprova sem discussão)

1. **Formato:** PNG com RGBA, **um arquivo por quadro** ou um spritesheet com grade fixa, e também o arquivo-fonte (`.aseprite` ou equivalente, com camadas e tags por animação).
2. **Canvas fixo** por espécie e por estágio. O Rookie de hoje usa 60×60, e o tamanho final depende da decisão de escala. **Todos os quadros vêm no mesmo canvas**, sem recortar quadro por quadro.
3. **Âncora fixa** no pé ou no quadril: hoje é (29,5; 49), com o chão na linha 49. O pé de apoio toca o chão na mesma linha em todos os quadros.
4. **Transparência limpa:**
   - fundo 100% transparente;
   - nada semitransparente, a não ser que se combine antes;
   - **sem sombra pintada**, porque a sombra é desenhada pelo motor.
5. **Pixel art de verdade:**
   - sem antisserrilhado (anti-aliasing) contra o fundo;
   - sem redimensionar com filtro;
   - contorno coerente com o Tamer.
6. **Paleta:** no máximo cerca de 16–24 cores por espécie. As cores seguem a espécie oficial e as diretrizes vigentes, e a família de paleta depende da decisão aberta.
7. **E e W desenhados.** O espelho só é aceito em espécie simétrica e precisa estar declarado na entrega, porque detalhes assimétricos mudam de lado quando espelhados.
8. **Passada casada com a velocidade:**
   - a 100 px/s, cerca de 110 ms por quadro pede que o pé avance **cerca de 11 px por quadro** (é como funciona o Agumon F7v2);
   - um avanço de 2 px por quadro obriga as pernas a mexerem muito rápido: é a "corridinha" do Hawkmon;
   - uma passada maior que a velocidade faz o pé escorregar;
   - se a espécie é pequena e de passo curto, isso precisa ser **decidido antes** (por exemplo, dar pulinhos em vez de andar).
9. **Tabela de tempos:** um arquivo simples (JSON ou planilha) com animação, direção, quadro, duração em ms e âncora.

## 4. Como ela prova que ficou bom (o que acompanha a entrega)

- Um GIF de cada animação em cada direção, no tamanho real **e** ampliado 4×.
- Uma folha de contato como a do exemplo: as direções nas linhas, os quadros nas colunas e as guias desenhadas.
- Um quadro lado a lado com o Tamer e o Agumon, na mesma escala, sobre um tile de 32 px.

## 5. Critérios de aceite (mesma régua do nosso QA, meta ≥ 8 em cada um)

1. A espécie é reconhecível como o Digimon oficial nas 4 direções.
2. A anatomia e o volume se mantêm consistentes entre direções e quadros (nada "derrete").
3. A âncora e o chão ficam estáveis: 0 px de tremida do pé de apoio.
4. A cadência da walk lê como andar e não escorrega na velocidade do jogo.
5. O idle é vivo, mas sem tremer.
6. O contorno, a luz e as cores combinam com o Tamer e com o mapa.
7. A silhueta fica legível no tamanho real (1×) sobre grama e sobre água.
8. Os arquivos estão limpos: canvas, transparência, nomes e tabela de tempos.

## 6. Fluxo sugerido

1. A designer faz **só o piloto**: 1 Rookie (sugestão: Agumon, porque já temos a régua do F7v2).
2. Entrega o Nível 1.
3. O game-art e o game-qa avaliam.
4. O ChatGPT dá o parecer.
5. O build de laboratório mostra o sprite no mapa.
6. Você testa e homologa.
7. Só então ela faz o lote, e o lote só começa depois das decisões de escala e paleta.

[H] Estimativa de esforço de uma pixel artist experiente para o Nível 1 de um Rookie em 4 direções (4 rotações, cerca de 20 quadros de idle e 32 de walk): **2 a 4 dias**. Isso não foi verificado com orçamento real.
