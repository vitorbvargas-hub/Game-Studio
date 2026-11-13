## 1. Regras do estúdio (prioridade sobre o restante deste arquivo)

- Estúdio raiz: `/home/openclaw/projects/GameStudio`. Leia `GOVERNANCE.md` e `STRATEGY.md` de lá quando relevante.
- **Escopo de escrita:** apenas `~/projects/GameStudio/projects/<fase>/GS-NNN/`, `shared/`, `portfolio/`, `assets/` e este workspace. Nunca tocar `~/projects/Norteo`, `~/projects/Sharp`, `~/.openclaw/` ou workspaces de outros agentes.
- **Sem aprovação do fundador, nunca:** publicar, comprar, contratar API/serviço pago, alterar DNS, apagar bancos, executar operação destrutiva, enviar comunicação externa, usar credenciais pessoais.
- Nunca ler, imprimir ou gravar segredos/tokens. Nunca copiar código, arte, nomes ou marcas de terceiros — **exceto** a exceção de fangame do Digital Odyssey (§2), e só dentro dela.
- Separe **[E] evidência** (com fonte e data) de **[H] hipótese**. Nunca invente dados, fontes ou resultados. Se não conseguiu verificar, diga.
- Escreva em **pt-BR**.
- Use os templates de `~/projects/GameStudio/shared/templates/`.

## 2. Digital Odyssey (ex-GS-003) — exceção e contexto obrigatório

- **Antes de qualquer tarefa do Digital Odyssey, leia** `~/projects/GameStudio/shared/knowledge/DIGITAL_ODYSSEY_CONTEXT.md` (identidade, estado, universo Digimon, Database, decisões, armadilhas). Se o arquivo não existir, avise e use os ADR-006 a ADR-014.
- O Digital Odyssey é um **fangame não comercial** com Digimon oficiais (ADR-007, ADR-009, ADR-014). Valem: sem monetização, sem logo/marca oficial, aviso de fan game, publicação só com aprovação separada do fundador, crédito de toda arte de terceiros. Só Digimon; nada de Pokémon.
- **GS-003 é o identificador técnico legado**: não renomeie pastas, ids, chaves de save, scripts, branches nem o projeto Vercel. Documento novo usa "Digital Odyssey".
- **Precedência:** decisão mais recente do fundador > ADR mais recente > contexto comum > documento antigo.
- **Estado:** o visual atual **não** está aprovado; não expandir mapas antes de validar a qualidade; não produzir sprites em massa antes de homologar o padrão; regras de jogo congeladas até a identidade visual ser definida; não antecipar etapas do roadmap. Cada etapa só começa com autorização do fundador.
- Registro central: `projects/prototypes/GS-003/quality-overhaul/PROJECT_LOG.md` (quem escreve nele é o `game-studio`; os demais citam o caminho da entrega no relatório final).
