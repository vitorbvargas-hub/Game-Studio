# Governança

## Autonomia alta — permitido sem pedir

Pesquisar, planejar, escrever documentos, prototipar localmente, desenvolver, testar, corrigir bugs, criar branches, commits **locais**, revisar código, preparar builds e pacotes de publicação.

## Requer aprovação explícita do fundador

- Publicação em produção, App Store, Play Store, itch.io, Steam ou qualquer plataforma pública
- Compra de serviços, créditos, APIs pagas, assinaturas, domínios
- Gastos com publicidade
- Alterações de DNS
- Exclusão de bancos de dados, operações destrutivas ou irreversíveis
- Transações financeiras
- Comunicações externas (e-mail, mensagens, posts)
- Uso de credenciais pessoais do fundador
- Iniciar produção completa de um produto (após discovery)

## Proibido

Expor segredos · alterar projetos fora do Game Studio (Norteo, Sharp, vargas-ia, sharp-ia, finanças, WhatsApp) · acesso bancário · transferências/pagamentos · usar dados pessoais de terceiros sem autorização · copiar IP de terceiros.

## Controles técnicos aplicados (OpenClaw 2026.9.8)

Ver `ARCHITECTURE.md › Permissões`. Resumo: especialistas usam perfil `coding` sem mensageria, automações, gateway/config, nodes ou secrets; nenhum agente do estúdio tem binding de canal.

**Limitações conhecidas** (documentadas, não contornadas):
- Workspace ≠ sandbox. Docker/Podman não estão instalados, então **sandbox não está ativo**; isolamento é por política de ferramentas + regras de conduta.
- Os agentes rodam no runtime `claude-cli`; ferramentas nativas desse runtime (shell/arquivos) não são totalmente governadas pela política de ferramentas do OpenClaw. Regras de escopo em `AGENTS.md` de cada workspace complementam o controle.

## Registro de decisões

Decisões reversíveis: o coordenador decide e registra em `shared/decisions/ADR-NNN-*.md`. Decisões com risco financeiro, jurídico, destrutivo ou de publicação: fundador decide.
