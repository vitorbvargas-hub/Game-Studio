# Progresso — revisão independente do rig (game-art)

- **Status:** concluído.
- **Tarefa:** revisão independente de arte (AGENTS.md §6) do rig local de pixel art/animação produzido pelo game-studio (exceção do fundador), sobre os resultados de Agumon em `fase7-digimon-proprio/out/` e `out/mock_chatgpt/`.
- **Feito:**
  1. Li `PESQUISA_E_TESTE_PRODUCAO_DIGIMON.md` e todo o código em `tool/`.
  2. Inspecionei visualmente as 9 animações do Agumon "do zero" e as 8 do Agumon "ChatGPT + rig", incluindo zoom local (Pillow, sem rede, sem alterar o laboratório) nos quadros de maior deslocamento para checar frestas/buracos de emenda.
  3. Medi (Pillow, bbox de pixel não-transparente e contagem de cor) e comparei contra o DS oficial (`agumon_ds_south.png`) e o PixelLab v2 já reprovado — dados em `REVISAO_GAME_ART_RIG.md` §2.2.
  4. Confirmei o bug já citado pelo game-studio (bola de fogo de perfil cortada pela borda do canvas) e identifiquei um ponto novo: a animação `derrota` do Agumon ChatGPT+rig lê fraco porque a prancha-base é uma pose de ação, não uma pose neutra.
  5. Escrevi `REVISAO_GAME_ART_RIG.md` com veredito por item (nenhum "aprovado"; candidato/candidato com ressalva/reprovado), resposta às 4 perguntas do brief, recomendação de pipeline só com ferramentas gratuitas, e o alerta de conflito com o Style Bible (Agumon já tem sprite DS oficial mandatório — este teste vale só como prova de método para espécies fora do catálogo DS).
- **Não feito / fora do escopo:** nenhuma geração PixelLab (proibido no brief); nenhum envio de arte a serviço externo; nenhuma alteração no código do jogo, na Database ou no laboratório; nenhum commit; nenhum outro agente acionado.
- **Entregável:** `fase7-digimon-proprio/REVISAO_GAME_ART_RIG.md`.
