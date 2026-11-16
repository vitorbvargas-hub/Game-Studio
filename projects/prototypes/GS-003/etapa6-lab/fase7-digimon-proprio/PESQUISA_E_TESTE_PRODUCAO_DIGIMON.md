# Digital Odyssey — Pesquisa e teste: como produzir Digimon e mapa além do ChatGPT e do PixelLab

- **Data:** 13/11/2026 · **Autor:** game-studio
- **Exceção registrada:** o fundador pediu "vamos testar com você também". O teste de arte foi feito por mim e **não é aprovado por mim**. A revisão fica com o game-art e o game-qa.
- **Custo:** 0 gerações do PixelLab e nenhuma arte oficial enviada a serviço externo (D12).

## 1. O problema
O DS é o melhor resultado até agora: tem identidade e consistência. Mas **nem toda espécie existe no DS**, e uma espécie criada depois não vai bater com as outras. Precisamos de um **método reproduzível**, não de mais uma ferramenta que gere imagem bonita sem controle.

## 2. Ferramentas pesquisadas
web_search está desativado neste host. Usei web_fetch e marquei como [E] só o que conferi.

| Ferramenta | O que faz | Custo | Para nós |
|---|---|---|---|
| **Retro Diffusion** [E, retrodiffusion.ai, 13/11] | Pixel art em grade real; 84 estilos; tilesets; **Advanced Animations**: anima um personagem a partir de **1 imagem** (andar, idle, ataque, pulo, ação customizada), 4–16 quadros, spritesheet. Tem **Pixel Art Fixer**, que acha a grade real e limpa imagens "estilo pixel" de outras IAs (grátis no navegador, US$ 0,002 por imagem na API). API disponível. | De US$ 0,03 por imagem; animação de US$ 0,10 a 0,25 | **Forte candidato.** O Fixer resolve o defeito principal das pranchas do ChatGPT (grade falsa). As animações a partir de 1 imagem cobrem a maior lacuna do Método A. É pago: precisa de aprovação, e enviar arte da franquia esbarra na D12. |
| **Aseprite** [E, aseprite.org/docs/cli] | Editor padrão da indústria. Tem CLI e scripts Lua para exportar spritesheet e JSON em lote, trocar paleta e aplicar escala. | Licença paga, uma vez só (preço não conferido); o código-fonte compila grátis | É a ferramenta do artista humano ou do pipeline: padroniza paleta, quadros e exportação. |
| **LibreSprite** [H] | Fork gratuito do Aseprite antigo | Grátis | Alternativa sem custo para edição manual. |
| **PixelLab** (já usamos) | Gera por texto (reprovado para Digimon) e oferece o **pixelart_workbench**, motor gratuito de desenho e animação por camadas, sem IA | Workbench grátis | O workbench é útil. A geração por texto de Digimon está encerrada (D11). |
| **ClawHub** [E, consulta 13/11] | Não tem skill oficial de pixel art | — | Nada para instalar. |

## 3. Teste prático: Agumon feito por mim, em código (sem IA)
Criei um **rig de pixel art** (`tool/rig.py`) que funciona assim:
1. desenha as partes do corpo com formas, sombreamento em bandas (luz de cima à esquerda) e contorno automático;
2. coloca os detalhes (olhos, boca, garras) pixel a pixel, em grade;
3. **anima por partes**: cabeça, tronco, braços, pernas e cauda se movem em cada quadro, e os detalhes trocam por emoção.

A partir de **um único desenho** saíram, no mesmo estilo e de forma determinística:

| Animação | Quadros | Arquivo (`out/`) |
|---|---|---|
| Idle (respira, pisca, mexe a cauda) | 4 | `agumon_idle` |
| Andar: sul, leste, oeste (espelho), norte | 4 por direção | `agumon_walk_s/e/w/n` |
| Feliz (pulinhos, olhos fechados, braços para cima) | 4 | `agumon_feliz` |
| Triste (cabeça baixa) | 4 | `agumon_triste` |
| Bravo (rosna e treme) | 4 | `agumon_bravo` |
| Ataque "Pepper Breath" de frente (bola de fogo) | 6 | `agumon_ataque_pepper_breath` |
| Ataque de perfil | 4 | `agumon_ataque_e` |
| Dano (flash branco, recuo) | 4 | `agumon_dano` |
| Derrota | 4 | `agumon_derrota` |

Cada animação gera `.gif` (prévia 6×), `_sheet.png` (spritesheet 1×, transparente, pronta para o motor) e `_preview.png`. Pranchas de revisão: `contato_sul.png`, `contato_direcoes.png` e `comparacao_agumon_4_metodos.png`.

### Avaliação honesta (minha; precisa de revisão independente)
- **Pontos fortes:**
  - pixel art 1:1 de verdade, com paleta fechada e contorno consistente;
  - zero ruído;
  - **as 9 animações em 4 direções saíram de um só desenho, com custo zero**;
  - a identidade se mantém entre os quadros, que era o problema do ChatGPT e do PixelLab.
- **Pontos fracos:**
  - o desenho ainda é **mais genérico e "boneco" que o do DS e o do ChatGPT**: falta a pose curvada, o focinho mais longo e os braços para frente;
  - está **alto demais**: ~40 px, contra a meta E5 de 33–35;
  - a animação por partes é mais "rígida" que um desenho quadro a quadro;
  - a bola de fogo de perfil sai do quadro (falta margem no canvas).
- **Leitura:** como desenhista, eu sozinho não chego à qualidade do DS. **Como pipeline**, o rig resolve o maior problema que temos, que é ter **toda a movimentação consistente** de forma barata e repetível.

## 4. Recomendação: pipeline híbrido "estilo DS"
1. **Referência de design:** prancha do ChatGPT ou arte oficial, só para uso interno, como referência.
2. **Sprite base nativo 1:1** (de frente, de perfil e de costas), na escala E5 e com a paleta do jogo. Opções:
   - (a) Retro Diffusion com Pixel Art Fixer sobre a prancha do ChatGPT (barato, precisa da sua aprovação);
   - (b) artista humano no Aseprite;
   - (c) eu redesenhando com o rig, com qualidade menor.
3. **Animação pelo rig do estúdio**: idle, andar, emoções, ataque, dano e derrota saem do sprite base, sem custo e com consistência. Para movimentos mais orgânicos: Retro Diffusion Advanced Animations (US$ 0,10–0,25 por animação) ou ajuste quadro a quadro no Aseprite.
4. **Régua única de estilo** para todas as espécies: paleta, contorno, luz e escala E5. Assim uma espécie que não existe no DS sai coerente com as demais.

Para o **mapa**, vale a mesma lógica: um tileset próprio, padronizado no Aseprite ou com o Fixer, e montagem no Tiled/motor. O rig também serve para animar água e efeitos.

## 5. Decisões do fundador
1. Autorizar um **teste pago pequeno no Retro Diffusion** (≈ US$ 1–2): Fixer + 2 animações sobre uma prancha do ChatGPT? Atenção à D12, porque envolve enviar arte derivada da franquia a um serviço externo.
2. Avaliar se vale trazer um **artista humano de pixel art** só para os sprites base, deixando a animação com o rig.
3. Aprovar o **rig do estúdio** como ferramenta oficial de animação, depois da revisão do game-art e do game-qa.
