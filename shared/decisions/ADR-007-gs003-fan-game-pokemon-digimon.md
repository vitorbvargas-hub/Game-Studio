# ADR-007 — GS-003 vira fan game com Pokémon e Digimon oficiais

- **Data:** 2026-11-08
- **Decisor:** Vitor Vargas (fundador), via webchat: "quero fan game mesmo, usando os pokemons e os digimons"
- **Status:** aprovado pelo fundador
- **Substitui parcialmente:** ADR-006 (o escopo da Linha B e da Linha A passa a usar monstros oficiais)

## Decisão

O GS-003 é um **fan game não comercial** que usa os monstros oficiais de Pokémon (Linha A) e Digimon (Linha B): nomes, designs e linhas evolutivas.

Isso é uma **exceção explícita do fundador** à regra "copiar IP de terceiros" de `GOVERNANCE.md`, válida **somente para o GS-003**.

## Condições da exceção (definidas pelo coordenador, reversíveis)

1. **Sem monetização de nenhum tipo:** sem venda, anúncios, doações vinculadas ao jogo, IAP nem coleta de dados para fins comerciais.
2. **[REVOGADA pelo fundador em 2026-11-08 — ver ADR-009 §Licença]** Sprites oficiais (rips de jogos, ex.: Digimon World DS/Dawn/Dusk, PMD Chunsoft) estão LIBERADOS em todo o projeto, inclusive no git, para o fan game não comercial; a meta é substituí-los progressivamente por arte própria. Texto anterior, só histórico: **Arte do estúdio ou de fãs com permissão** (emenda aprovada pelo fundador em 2026-11-08): sprites próprios em pixel art, ou sprites feitos por fãs cuja licença ou autor permita uso não comercial (ex.: Digimon Pixels; PMD Collab apenas com sprites de fãs, CC BY-NC 4.0), com crédito em `CREDITS.md` (autor, link, licença). **Proibido** extrair (ripar) sprites, sons, músicas ou arquivos de ROMs, jogos ou sites oficiais, e usar sprites oficiais redistribuídos por terceiros (ex.: sprites Chunsoft do PMD Collab, coleções baseadas em rips).
3. **Sem logos ou marcas oficiais** no título, ícone ou material de divulgação. O nome do jogo é próprio, com aviso de "fan game não oficial, sem afiliação com Nintendo/Game Freak/The Pokémon Company/Bandai/Toei".
4. **Publicação continua exigindo aprovação** do fundador, separada desta decisão. O padrão é uso local e privado.
5. **Motor com conteúdo em dados separados (content pack):** monstros, nomes e sprites ficam em um pacote de dados trocável. Assim, uma versão comercial com monstros originais reaproveita o motor sem retrabalho.

## Riscos aceitos pelo fundador

- [H] Risco de notificação de remoção (DMCA/C&D), especialmente da Nintendo/The Pokémon Company, se o jogo for publicado.
- O GS-003 deixa de ter caso de negócio direto. O business case e a monetização de GS-003 P4b ficam sem efeito para esta versão.

## Impacto nas tarefas em andamento

- game-design: o documento do protótipo usa Digimon oficiais na Linha B.
- game-art: redesenha em pixel art 3 Digimon iniciais, sem ripar arquivos.
- game-dev: o conteúdo fica em content pack trocável.
- game-research: o foco sai da monetização e vai para os riscos de remoção e para os canais da comunidade de fan games.
