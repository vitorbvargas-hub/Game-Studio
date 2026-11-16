# F9_02 — Direção de arte e escala: Labramon (Fase 1)

Digital Odyssey (GS-003) · F9 Labramon · Fase 1 · 2026-11-15 (BRT) · Autor: `game-art` (Opus 5.5) · Comando `COMANDO_F9_LABRAMON.md` §5.
Fan game não oficial, sem licença, sem monetização; nada publicado. **[E]** evidência medida/lida · **[H]** hipótese ou proposta.
Base: `F9_01_REFERENCE_REPORT.md` (invariantes §5.2, paleta §5.3), arte-mestra v2 em pé (`arte_mestra/labramon_arte_mestra_v2_em_pe_chatgpt.png`), método `fase22…/METODO_CHATGPT_PIXELLAB_v1.md`, Style Bible `quality-overhaul/phase3/style-bible/DIGIMON_STYLE_GUIDE.md` §2.

## 1. Alvo visual (GBA Plus, Standard 1.1 provisório)
- Pixel art nativa, câmera top-down 3/4 baixa (como REF-06 *Digimon RPG*, precedente oficial mais próximo), sem isométrico/3D.
- Quadrúpede compacto e **mais largo que alto de perfil**; cauda em espiral erguida atrás do dorso em pé (REF-05/06), horizontal atrás quando sentado.
- Contorno escuro de 1 px (externo), luz de cima-esquerda, 2–3 tons por material, sem AA, sem semitransparência, sem sombra pintada (a sombra de contato é do motor).
- Acabamento do Hawkmon v2 = régua de **acabamento**; proporções **não** são copiadas dele (ave bípede).
- Cor padrão provisória: **Reference Book** (corpo branco com sombra fria, orelhas/cauda/marcas rosa-vinho, garras osso, olho vermelho). Variação Toei 2001 (creme + rosa-choque) fica fora.

## 2. Escala — decisão proposta e medições
| Entidade | Fonte | Altura (px) | Largura (px) | Razão vs tile 32 |
|---|---|---|---|---|
| Tamer v13 south | `fase1-pixellab/referencias/tamer_v13_south.png` | 34 | 24 | 1,06 |
| Agumon F7v2 S | `fase17-f7-hibrido/v2/pacote_agumon_f7v2/rotations/S.png` | 35 | 22 | 1,09 |
| Hawkmon v2 S | `fase22…/pacote_hawkmon_v2/rotations/S.png` | 38 | 25 | 1,19 |
| **Labramon S / N** | `rotacoes/labramon_S.png`, `_N.png` | **36** | 24 / 25 | 1,125 |
| **Labramon W / E (perfil)** | `rotacoes/labramon_W.png`, `_E.png` | **36** | **39 / 38** | 1,125 (alt.) · 1,22 (larg.) |
| Labramon sentado S / W (ref. Fase 6) | `rotacoes_sentado/` | 37 / 38 | 24 / 38 | — |
[E] medido nesta sessão (bbox de pixels opacos; `scripts_f9_fase3/bb.js`).

- **Altura total (do topo do capuz ao chão) = 36 px**, igual nas 4 direções; perfil 38–39 px de largura (comprimento corporal + cauda) → **mais largo que alto**, como o sprite oficial de V-pet (≈50×39 em 64×64, REF-05).
- Razões: Labramon/Tamer = 1,06 em altura; Labramon/Agumon = 1,03; Labramon/Hawkmon = 0,95.
- **Por que 36 e não 32** [E]: testei 32 px (box-filter e reamostragem por moda, `tmp-f9/work/can_*`, `mo_*`, `bo32_*`): o contorno some, a espiral da cauda vira mancha e o rosto (olho, presa, marcas) fica ilegível. Em 36 a espiral, as orelhas, a gola e o olho vermelho continuam legíveis a 1x.
- **Conflito aberto G-2 (não resolvido):** o Style Bible §2.2 mede Rookies DS em 30–34 px; o laboratório já usa 35 (Agumon) e 38 (Hawkmon). O Labramon a 36 fica **acima** da faixa DS e **dentro** da prática do laboratório. A decisão de escala é do fundador (Etapa 6). Se a régua DS for adotada, o caminho é refazer a Fase 3 em ≤34 px com retoque manual do rosto, não só reduzir.

## 3. Canvas, pivô, contato, colisão
- **Canvas 60×60** (mesmo do Hawkmon/Agumon). Cabe a cauda sem corte: maior bbox de perfil = x 10–49 (margem ≥10 px nos dois lados; 0 pixels cortados [E]). Margem vertical: topo em y=14 (14 px livres para pulo, orelhas e emoções). Não é preciso 64×64; se uma animação (ataque com onda, abanar a cauda) sair do quadro, abrir canvas da animação, não da rotação.
- **Chão / pivô Y = 49** (última linha opaca), nas 4 direções e no sentado.
- **Pivô X = 29,5 = centro do contato das patas** (vão ocupado pelas 3 linhas mais baixas), não o centro do bbox. Motivo: de perfil a cauda empurra o bbox para trás; centrar o bbox faria o corpo saltar ~5 px ao virar. Medido: centro de contato = 30,0 nas 4 direções em pé [E].
- **Ponto de contato com o chão:** S x 21–38; N x 20–39; W x 18–41; E x 17–42 (y 47–49).
- **Colisão proposta (para o game-dev decidir):** caixa de pegada 22×10 px, x 19–40, y 40–49, igual nas 4 direções; cabe num tile 32.
- **Sombra de contato:** elipse do motor sob o pivô, ~80% da largura de contato (como na prancha).

## 4. Paleta-alvo
- Teto **≤24 cores** compartilhadas pelas 4 direções; resultado da Fase 3: **19** [E].
- Papéis (alvo → obtido na Fase 3):
  | Papel | Alvo (REF-05 / Reference Book) | Obtido |
  |---|---|---|
  | Contorno | `#000000` / `#191919` | `#010101`, `#24241e` |
  | Corpo luz/base/sombra | `#ffffff` `#dedec5` `#adad9c` + lilás `#dedeef` | `#f6f2e8` `#d5d2c6` `#b1afa3` `#8e8c81` `#6b6b5c` `#434a39` |
  | Orelhas/cauda (claro→escuro) | `#d67b9c` `#ad5273` `#7b4252` `#421021` | `#dc9aa3` `#d94182` `#ac2d64` `#7a2044` `#4b192d` `#250d20` |
  | Olho/marcas | `#c52921` `#9c1919` `#841010` | `#c63239` `#81231d` (+ `#b97191` marca) |
  | Garras | `#ffffce` `#efefbd` `#ada56b` | `#a4a370` (+ corpo claro) |
- **Desvios registrados** [E]: (a) o rosa da v2 (`#d94182`) é mais saturado que o mauve do Reference Book (D2 do F9_01) — fica entre o RB e o Toei 2001; (b) a sombra do corpo saiu cinza-esverdeada (`#434a39`, `#6b6b5c`) em vez de lilás-acinzentada; (c) garras com 1 tom próprio só (`#a4a370`). Correção possível sem gerar: trocar esses hex por versões RB na paleta (remapeamento local). **Não fiz** sem decisão: é ajuste de identidade de cor que o QA/fundador devem pedir.
- **Endesga-32** (conflito aberto, medido contra os dois lados): 0 de 3.151 pixels com cor exata da Endesga-32; distância RGB média 37,6. Contra a paleta oficial REF-05: 22,5. O Style Bible §3 aplica a Endesga-32 a cenário/UI, não a criatura; registro, não decido.

## 5. Notas por direção (para a Fase 4)
- **S:** cabeça e capuz dominam; patas dianteiras como colunas; cauda escondida (ok). Respiração: só o peito/gola; capuz não muda de tamanho.
- **N:** capuz com borda em zigue-zague na nuca, orelhas pendentes, espiral da cauda no centro do dorso — a espiral é o marcador de direção.
- **W/E:** perfil com focinho, presa e olho; orelha como aba triangular; cauda em disco erguido atrás. Desenhados de forma independente (E ≠ espelho de W: 52,7% dos pixels diferem).
- Caminhada quadrúpede (Fase 4): diagonais alternadas (dianteira esq. + traseira dir.), corpo sobe ≤1 px, cauda com atraso de 1 quadro, focinho estável. Não usar ciclo bípede do Hawkmon.

## 6. Riscos
- Rosto pequeno a 36 px: olho vermelho = 2–3 px; presa e marcas no limite da legibilidade a 1x (ver F9_03).
- Escala e paleta seguem nos conflitos abertos da Etapa 6.
- Nada aqui é homologação.
