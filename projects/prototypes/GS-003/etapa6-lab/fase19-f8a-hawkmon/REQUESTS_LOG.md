# REQUESTS_LOG — F8A Hawkmon

Regra: Wikimon com ≥ 65 s entre requisições (robots `Crawl-delay: 60` + margem). Sem `--noproxy`. Sem contornar Cloudflare/CAPTCHA. Ferramenta: `web_fetch` do OpenClaw (perfil padrão, sem login).

| # | Hora (BRT) | Site | URL | Resultado |
|---|---|---|---|---|
| W1 | 23:20:58 | wikimon.net | https://wikimon.net/Hawkmon | 200; página completa (69 657 caracteres); cópia de trabalho fora da entrega |
| — | 23:23:15 | wikimon.net | https://wikimon.net/images/9/9d/Hawkmon_adv02_reference_art.jpg (curl) | 000: o proxy de saída do exec recusou o túnel (CONNECT 403); a requisição **não chegou** ao Wikimon. Contada mesmo assim no intervalo de 65 s. Sem contorno (sem --noproxy). Imagens passam a ser vistas por `view_image` com URL, sem cópia local |
| W2 | 23:24:25 | wikimon.net | https://wikimon.net/images/9/9d/Hawkmon_adv02_reference_art.jpg (`view_image`, só visualização) | ok; folha de modelo do anime Adventure 02 (costas, frente, 3/4) |
| W3 | 23:25:30 | wikimon.net | https://wikimon.net/images/7/7f/Hawkmon.jpg (`view_image`) | ok; arte do Digimon Reference Book |
| W4 | 23:27:01 | wikimon.net | https://wikimon.net/images/1/1d/Hawkmon_adv02_reference_art_2.jpg (`view_image`) | ok; folha "決定稿" do anime: coreografia da Feather Slash |
| W5 | 23:28:07 | wikimon.net | https://wikimon.net/images/f/f0/Hawkmon_dot.png (`view_image`) | ok; "dot" oficial (Digimon ReArise segundo a legenda da galeria), 16×16 ampliado ×8 |
| W6 | 23:29:21 | wikimon.net | https://wikimon.net/images/f/fb/Hawkmon_Model_DSR.png (`view_image`) | ok; modelo 3D oficial (Digimon Super Rumble), pose T |

## Outras fontes (sem limite de taxa específico; ritmo manual, sem login)

| Hora | Site | URL | Resultado |
|---|---|---|---|
| 23:21:42 | digimon.net (oficial, cat. 1) | https://digimon.net/reference/detail.php?directory_name=hawkmon | 200; JP: 成長期 / 鳥型 / フリー; técnicas ビークペッカー, フェザースラッシュ |
| 23:21:48 | digimon.net (oficial, cat. 1) | https://digimon.net/reference_en/detail.php?directory_name=hawkmon | 200; EN: Rookie / Bird / Free; Pecking Beak, Feather Slash |
| 23:22:01 | duckduckgo (html) | q = hawkmon sprite site:deviantart.com | 200; 10 resultados |
| 23:22 | spriters-resource.com | /search/?q=hawkmon | 403 "Just a moment" (Cloudflare). **Não contornado** |
| 23:2x | curl → duckduckgo | 12 buscas | falharam no proxy de saída do exec (CONNECT 403); nenhuma chegou ao destino |
| 23:24–23:25 | deviantart.com + backend.deviantart.com/oembed | Neroesaurus, Neoweegee, FelipeTop, maximus237, GuilTronPrime, vLocxoay99, DigimonGif | 200; metadados (autor, data, tamanho, copyright) |
| 23:27 | api.github.com | repos/dannyphang/digimon-up-sprites/contents/baked/hawkmon (+ /walking) | 200; pastas attack, faint, idle, walking; walking = 13 quadros (f_000–f_012) |
| 23:27:36 | raw.githubusercontent.com | baked/hawkmon/walking/f_000, f_003, f_006, f_009 (`view_image`, sem cópia local) | ok |
| 23:28:13–14 | duckduckgo (html, via web_fetch) | 3 buscas: pixel art walk; site:pinterest; site:reddit | 200 |
| 23:28:21–23 | duckduckgo | 3 buscas | 202 (limite de taxa do DDG). Parei e espacei |
