# 10-source-files

Arquivos-fonte editáveis — para criaturas desenhadas por código (pipeline Node em
`projects/prototypes/GS-003/art/src/`), o "arquivo-fonte" é o próprio script gerador
(determinístico, sem dependência externa — ver `projects/prototypes/GS-003/art/PIXEL_ART_DIRECTION.md`
§1). Para arte feita por matriz de caracteres (técnica atual, pós-ADR-009), o
arquivo-fonte é o script com a matriz hand-authored (ex. `art/src/pilot_model_sheet.js`).

Convenção: `CREATURE-NNNN/source/` (dentro de `01-creatures/`) guarda uma cópia ou
referência de caminho do script usado para gerar aquela criatura especificamente, para
reprodutibilidade (`node <script> <outDir> <previewDir>` regenera os PNGs de forma
determinística).
