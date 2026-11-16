# Brief game-art: Comando 12, F6 Blender 3D → pixel art (prova de conceito gratuita)

**Data:** 2026-11-14 · **Dono:** game-art (Fable 5.2) · **QA:** game-qa (Opus 5.5) · **Coordenação:** game-studio

**Origem:** a governança visual do fundador, que pede F5 → F6 → F7 em sequência, e o pedido dele de "terminar todos os testes e colocar lado a lado". A F5 parou numa decisão de conta e pagamento que é do fundador, e a F6 não depende dela.

## Objetivo
Provar, sem custo nenhum, se um pipeline Blender 3D → pixel art entrega um Agumon com:
- anatomia consistente entre as direções S/E/N/W (o W espelhado);
- caminhada de 8 quadros sem pé deslizando, com cabeça e tronco estáveis e cauda com movimento secundário;
- se der tempo, a pose de ataque com a origem do fogo na boca.

A identidade GBA Plus precisa ser preservada. O Agumon v7 (F2b) é a referência de comparação e não pode ser substituído.

## Como fazer
1. **Instalar o Blender (gratuito, GPL)** em modo headless, no espaço do usuário, por exemplo com o tarball oficial em `~/opt/blender`.
   - Nada de `sudo` e nada de pagamento.
   - Registre a versão e o sha256 do arquivo.
   - Se a instalação falhar, registre o motivo e pare.
2. **Modelo 3D:** construa o seu próprio, low-poly, por script Python (primitivas, metaballs ou skin modifier) a partir da ficha `fase11-fichas-anatomia/FICHA_AGUMON.md` e das referências oficiais em `fase12-comando9/f1/imagens/oficiais/`.
   - **Proibido** baixar modelos 3D ou rigs de terceiros, mesmo os grátis, porque não temos licença.
3. **Rig simples e animação:** armature, ciclo de caminhada de 8 quadros e câmera ortográfica no ângulo low top-down do jogo.
4. **Pixelização:**
   - render em baixa resolução, no canvas de 60×60 e na mesma escala do F2b;
   - toon shading e contorno (Freestyle ou inverted hull);
   - quantização na paleta do F2b, com script próprio;
   - limpeza mínima.
5. **Medidas:** as mesmas métricas do C10 (oscilação, âncora do pé, cabeça estável, número de cores, pixels soltos) e o tempo gasto em cada etapa.

## Saída
`etapa6-lab/fase16-f6-blender/`:
- `RELATORIO_F6.md`, com:
  - um reference report;
  - o passo a passo reproduzível;
  - as métricas e o tempo;
  - os limites encontrados;
  - uma autoavaliação nos 6 critérios do Comando 11 §5;
  - a recomendação: adotar, combinar, reservar ou descartar.
- `scripts/`, com tudo o que for preciso para reproduzir.
- Folhas PNG das rotações S/N/E/W e GIFs da caminhada em 1× e 4×, lado a lado com o F2b.
- `PROGRESS.md`, sempre atualizado.

## Limites
- PixelLab: 0 gerações.
- Nenhum serviço pago e nenhuma conta.
- Não integrar ao jogo.
- Não tocar no F2b, no C10, no F4 nem no worktree `kb-gs003`.
- Não fazer a F7.
- Teto: cerca de 3 h de agente, menos de 2 GB em disco. A máquina tem 7 GB de RAM; renderize leve.
- Se cair, o `PROGRESS.md` aponta onde parou.

Ao terminar, pare.

---
## RETOMADA (2026-11-14 ~17:45): o Blender está disponível
- **Fundador:** confirmou que o 3D pode entrar **como ferramenta**, desde que o resultado final seja pixel art ("sim desde que seja pixel art"). O ChatGPT também aprovou essa leitura.
- **Instalação:** Blender **4.5.16 LTS** oficial em `~/projects/GameStudio/assets/tools/blender/`, com sha256 conferido contra o `.sha256` oficial. libSM e libICE vêm do Ubuntu noble, em `libs/`.
- **Como rodar:** `~/projects/GameStudio/assets/tools/blender/run_blender.sh -b --factory-startup --python <script.py>`. O wrapper já ajusta o `LD_LIBRARY_PATH`.
- **Teste feito:** render headless de uma esfera a 64×64. EEVEE na CPU levou ~44 s. Prefira **Workbench** ou **EEVEE com poucas amostras**, sempre em baixa resolução: a máquina tem 7 GB de RAM e não tem GPU.
- **NumPy:** use o que vem dentro do Python do Blender. Não instale nada fora.
- **Ponto de partida:** a etapa 2 do brief. A etapa 1 já está resolvida.
- **Comparação:** além do F2b, compare com B e com o híbrido D. Siga a régua do ChatGPT: mesma escala, mesma animação, S/E/N/W, GIFs na mesma velocidade e os 6 critérios.
