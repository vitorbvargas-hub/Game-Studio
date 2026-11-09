# WarGreymon como parceira de teste — evidência (2026-11-09)

Pedido do fundador: "me coloca um WarGreymon para testar as animações de um Digimon mais evoluído e mais forte".

- **Como foi capturado:** jogo real no Chromium headless (porta 5190, Vite próprio do script; a 5174 do fundador não foi tocada):
  `CHROME_LIBS=/tmp/chromelibs/root/usr/lib/x86_64-linux-gnu ONLY=wargreymon npm run shots:live` (em `prototype/world/`).
- **URL usada:** `/?seed=7&map=digimon-forest-01&look=v8&partner=wargreymon&criador=0&novo=1&time=day`. `criador=0&novo=1` só pulam o criador e o save, para a captura ficar reprodutível. O link do fundador não precisa deles.
- **Entrada:** teclas WASD (o Tamer anda e a parceira segue), clique em selvagem (engage), tecla `1` (slot do Gaia Force) e AUTO. O estado da sim só foi lido para escolher o instante da foto: a de golpe sai quando o quadro é `attack`, o golpe é especial e o Gaia Force acabou de entrar em recarga. A de dano sai quando o quadro é `hurt`.

| Arquivo | O que mostra |
|---|---|
| `wg_00_inicio.png` | Tela cheia: selo "TESTE · WarGreymon Nv.20", HUD com os 4 golpes (Gaia Force, Dramon Killer, Great Tornado, Brave Shield) |
| `wg_01_andando_{norte,sul,leste,oeste}.png` | Recorte do walk em cada direção (N e W com 3 quadros, E espelha W, S com 1 quadro) |
| `wg_02_andando_tela.png` | Tela cheia depois de andar |
| `wg_03_golpe_forte.png` / `_tela.png` | Gaia Force: quadro de ataque da folha (braço erguido) e a esfera de fogo saindo |
| `wg_04_levando_dano.png` | Quadro de dano da folha (agachado) com o anel de impacto (selvagem acertando 1 de dano) |
| `wg_05_combate_tela.png` | Combate contra selvagem da floresta, tela cheia |
| `wg_andando.gif` | Walk nas 4 direções, 0,6x |
| `wg_combate.gif` | ~160 quadros de combate (golpes, vitórias, dano), 0,6x |

Log do HUD numa das rodadas **[E, 2026-11-09]**: "WarGreymon causou 245 de dano · Tentomon foi derrotado · Venceu! +22 XP"; "WarGreymon sofreu 1 de dano". Selvagens da floresta (Nv.1–6) caem com 1 golpe.
