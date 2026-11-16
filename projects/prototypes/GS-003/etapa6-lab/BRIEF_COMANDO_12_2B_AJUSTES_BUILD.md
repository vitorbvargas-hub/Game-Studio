# Brief game-dev: Comando 12.2b, ajustes do build da F7v2 depois do QA

**Data:** 2026-11-14 · **Dono:** game-dev (Opus 5.5) · **Coordenação:** game-studio
**Origem:** `etapa6-lab/fase18-build-f7v2/QA_BUILD_F7V2_INDEPENDENTE.md`. Sem eles, o teste do Vitor sai distorcido.

São só ajustes de engenharia do lab: nada de regra de jogo, nada de pixel. Trabalhe no worktree `lab-f7v2`, branch `lab/f7v2`, porta 5196.

1. **Cadência da walk (P1).** Hoje a walk da F7v2 avança 1 quadro a cada 3 px e fica ~2,5× mais rápida que a do F2b (43 ms contra ~108 ms por quadro, com quadros pulados). Use para a F7v2 a **mesma lógica de tempo que o F2b usa no lab**, para a comparação ser justa: ~110 ms por quadro, sem pular quadro. Meça o resultado e registre se o pé escorrega.
2. **Projétil só nos golpes de fogo (P2).** Pepper Breath, Baby Burner e Triple Baby Flame (confira o elemento de cada um na Database, sem alterar nada nela) soltam o projétil F7v2 e não desenham o orbe genérico por cima. Mach Jab, Uppercut e os outros golpes físicos voltam a usar o efeito próprio deles e **não** soltam fogo. Não equipe golpes e não altere dados de jogo.
3. **Fogo cruzando o Tamer (P3).** Se a mudança for pequena e segura, deixe o projétil sempre na frente do Tamer quando ele estiver à frente do Agumon no eixo y. Se não for, registre e deixe como está.
4. **Instruções de teste.** Atualize `RELATORIO_BUILD_F7V2.md` com uma seção "Como testar (v2)":
   - quais golpes soltam fogo e em que tecla está cada um no Agumon Nv.20;
   - a tecla K para o ataque de teste;
   - `&agumon=v8` para comparar com o F2b;
   - o que observar: a entrada e a saída da walk S.
5. **Validação:** rebuild, reinício **só** do `gs003-lab-f7v2-5196`, Chromium headless com 0 erros e capturas da walk (com o tempo medido) e de um golpe de fogo e um físico.

Limites: não tocar no jogo principal nem no Lab A da 5191; 0 gerações; nada de push nem de deploy; teto de ~1 h. Atualize o PROGRESS.md em `fase18-build-f7v2/`.
