# ADR-011 — GS-003: Map Factory (fábrica de mapas)

- **Data:** 2026-11-09 · **Decisor:** Vitor Vargas (fundador) · **Registro:** game-studio
- **Base:** script "GS-007 — AI MAP FACTORY" e revisão `projects/prototypes/GS-003/docs/briefing/12_map_factory_v2.md`.

## Decisões
1. **Frente de trabalho dentro do GS-003**, sem abrir um projeto novo no portfólio.
2. **Agentes:** usar todos os agentes existentes que puderem ajudar (game-design, game-art, game-dev, game-research, game-qa). Nenhum agente permanente novo.
3. **Formato de mapa: Tiled JSON (`.tmj.json`)**, que o jogo já usa (`prototype/world/src/data/maps/`, objetos `portal`, colisão, autotile Wang-47). LDtk fica fora. O fundador não tinha preferência, e a decisão técnica é manter o que já funciona.
4. **PixelLab: 40 créditos disponíveis no total.** O escopo se ajusta a isso: tilesets top-down standard (1 crédito cada) e props via `create_image_pixen`/`pixflux` (1 crédito cada). Ferramentas de 10–25 créditos (`create_1_direction_object`, pro, 8 direções) ficam vetadas sem nova aprovação. Cada uso entra no log.
5. **Referências de terceiros (Drakantos, IdleDex, sprites Digimon) PODEM ser usadas como referência de estilo** nas gerações. Decisão do fundador, no contexto de fan game não comercial (ADR-007/010). Risco registrado: isso aproxima a arte gerada da arte de terceiros. Se um dia houver monetização, toda arte gerada com essas referências precisa ser revista ou substituída.
6. **Expandir o roster de Digimon e as linhas de evolução** como parte da frente.
7. **Proxy (temporário):** o fundador roda `shared/tools/sd-local/liberar-proxy.sh` para a instalação do SD e `fechar-proxy.sh` ao final.

## Pendências
- PixelLab MCP: toda chamada retorna `401 Missing Authorization header`. O header está configurado, mas não chega ao servidor. Causa provável: SecretRef não resolvido ou o runtime claude-cli não repassa o header. O operador verifica com `openclaw secrets audit --check`.
