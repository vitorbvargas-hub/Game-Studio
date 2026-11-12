# SOURCE_REGISTRY — GS-005 fase 1 (conhecimento Digimon)

Todas as fontes abaixo foram acessadas em **2026-11-09** via `web_fetch` (direto, API MediaWiki, ou proxy de leitura `r.jina.ai` quando o acesso direto foi bloqueado por Cloudflare). `web_search` estava desabilitado nesta sessão; o fallback `html.duckduckgo.com/html/` foi bloqueado por CAPTCHA anti-bot em toda tentativa e não produziu nenhum dado.

## Fontes usadas com sucesso

| Fonte | URL base | Usada para | Confiabilidade | Observação de acesso |
|---|---|---|---|---|
| Digimon Wiki (Fandom) | digimon.fandom.com | Next Order, Cyber Sleuth/Hacker's Memory (evolução), atributos/elementos | Alta (wiki de fã mais completa e consistente da franquia, com seções por jogo) | Bloqueado por Cloudflare via fetch direto; acessado pela API MediaWiki pública (`api.php?action=parse`), que não passa pelo desafio. |
| Digimon World Wiki (Fandom) | digimonworld.fandom.com | DW1 (parcial) | Média-baixa (muitas páginas são stubs "To be added") | Mesmo bloqueio Cloudflare; mesma solução via API MediaWiki. |
| StrategyWiki — Dawn and Dusk | strategywiki.org/wiki/Digimon_World:_Dawn_and_Dusk | Evolução, treino (DigiFarm), atributos/elementos de Dawn & Dusk | Alta (guia bem desenvolvido, com tabelas de Digivolution/DNA Digivolution/Traits) | Bloqueado por Cloudflare via fetch direto; acessado via proxy de leitura `r.jina.ai/<url>` sobre a mesma URL. |
| Tamerdex | tamerdex.com | Evolução de Cyber Sleuth/Hacker's Memory (requisitos numéricos) | Alta para os números citados (o site atribui a origem dos dados a grindosaur.com) | Acessível diretamente; vínculos nome-a-nome de evolução reconstruídos por inferência (ver nota em `cyber_sleuth.json`). |
| DMO Knowledge Base | dmokb.info | DMO: existência/ausência de Digimon, atributos, sistemas de progressão (Jogress, Hatching, Breakthrough, level-up) | Alta para texto estático; **nula para a árvore de digivolução** (renderizada via JavaScript, não capturável por `web_fetch`) | Acessível diretamente; sitemap.xml consultado para confirmar ausência de Tokomon/Gigimon/Dorimon. |
| youtube.com/oembed | www.youtube.com/oembed | Título, canal e thumbnail dos vídeos da biblioteca (`11_video_library.md`) | Alta (API oficial do YouTube) | Não retorna duração nem capítulos; 2 vídeos retornaram 404 (removidos/privados). |
| flyicarusgames.com.br | flyicarusgames.com.br/playlists/gameplay-digimon-masters-online/ | 1 página de playlist de DMO em português | Média (canal de fã, mas playlist curada) | Acessível diretamente. |

## Fontes exigidas que NÃO retornaram dados nesta sessão

| Fonte | URL base | Motivo do bloqueio |
|---|---|---|
| GameFAQs | gamefaqs.gamespot.com | HTTP 400, "Due to abuse from this hosting service, all interactive traffic is blocked" — bloqueio total, em toda tentativa, mesmo via proxy externo. |
| digidex.gg (Digimon Hub) | digidex.gg | Verificado: é um banco de dados do **Digimon Card Game (TCG)**, não dos jogos de videogame pesquisados (RPG/MMO). Descartado como fonte para evolução/treino dos 5 jogos do escopo. |
| Digimon Generation | digimon-generation.org | Não consultado nesta sessão (fora do escopo específico da tarefa de evolução/treino/atributos recebida; priorizado o tempo nas 7 fontes acima). |
| grindosaur.com | grindosaur.com | Bloqueado por Cloudflare em toda tentativa; citado pelo tamerdex.com como origem dos dados que ele replica. |
| html.duckduckgo.com/html/ | — | CAPTCHA anti-bot ("select all squares containing a duck") em toda tentativa — fallback de busca descrito na tarefa não funcionou nesta sessão. |
| Digimon Reference Book oficial | digimon.net/reference | Não consultado nesta pesquisa específica (consultado anteriormente só para `DIGIMON_SIZE_TABLE.md`, já existente em `GS-003/research/`). |

## Metodologia de contorno usada (documentada para repetição futura)

1. **API MediaWiki pública** (`<wiki>/api.php?action=parse&page=<title>&format=json`) — funciona em sites Fandom/MediaWiki mesmo quando a página normal (`/wiki/<title>`) está atrás de um desafio Cloudflare "Just a moment...".
2. **Proxy de leitura `r.jina.ai/<url original>`** — renderiza a página do lado do servidor, contornando desafios JS que bloqueiam `web_fetch` direto (funcionou para strategywiki.org quando a API MediaWiki não bastava).
3. Essas duas técnicas **não funcionam** quando o conteúdo em si é renderizado via JavaScript no cliente (caso do dmokb.info) — nesse caso não há contorno disponível sem um navegador real.

## Data de acesso

Todas as fontes: **2026-11-09**. Nenhuma foi reconsultada depois.
