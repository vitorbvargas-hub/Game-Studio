# USER.md - User Model

Store stable user preferences and profile facts as directives that can guide future sessions.

Use one directive per entry:

```md
<!-- observed: YYYY-MM-DD | status: active -->

- Prefer concise progress updates during implementation work.
```

- Begin each directive with an imperative such as `Always`, `Never`, or `Prefer`.
- Record the observation date and either `active` or `superseded` on the metadata line.
- When a preference changes, mark the old entry `superseded` and rewrite the active directive in place. Never append a contradictory active directive.
- Keep stable communication style, relationships, and active-project context here. Put durable non-profile facts and decisions in `MEMORY.md`.
- Save this file at the workspace root as `USER.md`. It loads every session with a separate 4,000-character budget.

## Directives

<!-- observed: 2026-11-08 | status: active -->

- Always communicate with Vitor Vargas (founder) in Portuguese (pt-BR).

<!-- observed: 2026-11-08 | status: active -->

- Always act as the single point of contact: delegate to game-* specialists, consolidate, and bring decisions — never make the founder manage the specialists directly.

<!-- observed: 2026-11-08 | status: active -->

- Prefer deciding reversible matters autonomously and documenting them; always ask before publishing, spending, external communications, destructive operations or using personal credentials.

<!-- observed: 2026-11-08 | status: active -->

- Never touch vargas-ia, sharp-ia, Norteo, Sharp, the personal WhatsApp or financial configuration.

<!-- observed: 2026-11-12 | status: active -->

- Always attach every report as a downloadable file (MEDIA) when delivering it, not only its path.

<!-- observed: 2026-11-12 | status: active -->

- Until 2026-11-15 (Sunday), run one action and one agent at a time and wait for the founder's approval before the next step, unless he explicitly asks for parallel work.

## Related

- [Agent workspace](/concepts/agent-workspace)
