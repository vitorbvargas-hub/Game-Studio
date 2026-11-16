'use strict';
// F9 Fases 5–8 — montagem das entregas (0 gerações). node build58.js <fase24-f9-labramon dir>
// Lê fin/<anim> (pós-processado) e raw/<anim> (bruto), grava combat/ rest/ emotions/ interactions/ com quadros, tiras, GIFs, folhas e manifestos.
const L = require('./lib.js'), fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const OUT = process.argv[2]; const S = __dirname;
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const fr = (a, i) => `fin/${a}/frame_${String(i).padStart(3, '0')}.png`;
const finLog = JSON.parse(fs.readFileSync('fin/_log.json')), preLog = JSON.parse(fs.readFileSync('pre/_log.json'));
const SRC = { // grupo e job PixelLab de cada animação-base (pixminimax, E, palette 19 cores, 1 ger cada)
  'f8-attack-bark': ['7e9ea826-9575-4a4e-9892-c7e725ab32f4', 'd0c68b3b-cf3c-4e78-9189-dac1298bfac9', 8, 'início = rotação E; end_frame = rotação E'],
  'f8-hurt': ['80061d3b-80de-492d-976b-6e8292d4bd8c', '353928a0-df8a-4f09-afcc-d3254cce60c6', 8, 'início = rotação E; end_frame = rotação E'],
  'f8-ko-fall': ['b763a8e9-f56b-4d47-98f5-afb9a8581d57', '3deef405-8d56-4081-8760-b18eae906dc2', 8, 'início = rotação E'],
  'f8-ko-loop': ['72740c14-54cc-48b6-8b94-962ff72b8203', '06b79d23-cc9b-4a96-98f3-129dddc68e26', 4, 'início = fim = último quadro da queda'],
  'f8-ko-recover': ['a1c50e45-e8ee-401d-ac2d-4923e4c77ed8', '7be04e34-5487-437c-b68c-01e644b01439', 8, 'início = último quadro da queda; end_frame = rotação E'],
  'f6-stand-to-lie': ['0e7c0493-87de-4f51-92d8-94141089d719', '75313d1a-695f-465e-a7db-618137b4cf1c', 8, 'início = rotação E'],
  'f6-lie-to-sleep': ['8df1179c-479d-4030-852e-39e062090c8a', '7a4c3d84-77b2-49b4-b476-bbf019520516', 8, 'início = pose deitada'],
  'f6-sleep-loop': ['2e0697b3-0c6c-4e5e-9a81-03e024884a92', 'fb351bda-8a76-4bb8-b177-c8a419c8f030', 4, 'início = fim = pose dormindo'],
  'f6-sleep-to-wake': ['66d41a31-ce6c-4c02-b792-b86374e18985', '2ce11285-16d3-4e3c-aeef-1cac2f7b1107', 8, 'início = pose dormindo; end_frame = pose deitada'],
  'f6-lie-to-stand': ['8e2db420-2ad8-4555-91d6-60d9a846947a', '3f820ad3-c5e1-4fcf-b854-632082ad8b78', 8, 'início = pose deitada; end_frame = rotação E'],
  'f5-happy': ['bd1aabfa-cb91-4789-81ec-b3c28993c8fe', '6d0912d3-a2de-40df-83d4-12d5e00f9e73', 8, 'início = rotação E; end_frame = rotação E'],
  'f5-sad': ['e76ceda9-4073-4feb-9835-d71afbb97fcb', '549d9866-97fb-4727-93bb-d080fa9c2ca3', 8, 'início = rotação E; end_frame = rotação E'],
  'f5-angry': ['990801d5-5fcb-4f4d-bbf6-dbe6b42d20c3', 'a9d2f5f1-59d4-4e0a-baa9-9a20431659f5', 8, 'início = rotação E; end_frame = rotação E'],
  'f5-scared': ['bfba21fd-7e65-4b61-9bfd-4b69204afd55', 'b33ca810-bbaf-4583-b241-6bf582a59b94', 8, 'início = rotação E; end_frame = rotação E'],
  'f7-petting': ['b5cfa1de-e59f-404a-a6e7-553490741ec0', 'd23576e0-30e3-4f49-a3ae-5de4a280d56a', 8, 'início = rotação E; end_frame = rotação E'],
  'f7-celebrate': ['7a8b76c3-ec0f-4628-a68a-3ef88664749c', 'a01776db-8f10-4ad0-a55b-1690da466982', 8, 'início = rotação E; end_frame = rotação E'],
};
// clip: {a: animação-base, f: índices, ms: duração por quadro, loop, doc, fases}
const C = (a, f, ms, extra) => Object.assign({ a, f, ms: Array.isArray(ms) ? ms : f.map(() => ms) }, extra || {});
const FOLDERS = {
  combat: {
    titulo: 'F9 Fase 8 — combate (ataque Retriever Bark, receber dano, incapacitação com recuperação)',
    estados: {
      attack_retriever_bark: { doc: 'Técnica oficial Retriever Bark (digimon.net: latido intenso que gera hiper-oscilação). Sem contato físico. A onda é camada FX separada (fx/), desenhada localmente.', pose: ['f8-attack-bark', 5],
        clips: { ataque: C('f8-attack-bark', [0, 1, 2, 3, 4, 5, 6, 7], [90, 90, 100, 120, 70, 180, 100, 110], { loop: false, fases: { preparacao: [0, 3], execucao: [4, 5], recuperacao: [6, 7] }, quadro_de_impacto: 4, retorna_a: 'idle' }) } },
      hurt: { doc: 'Receber dano: recuo com olho fechado, depois sacode e volta. Não cai.', pose: ['f8-hurt', 1],
        clips: { dano: C('f8-hurt', [0, 1, 2, 3, 4, 5, 6, 7], [60, 80, 100, 100, 90, 90, 90, 100], { loop: false, fases: { impacto: [0, 2], recuperacao: [3, 7] }, retorna_a: 'idle' }) } },
      incapacitated: { doc: 'Incapacitação (derrota normal): perde a postura e desaba de bruços, fica ofegante e se recupera. NÃO é morte nem retorno a Digiovo.', pose: ['f8-ko-fall', 7],
        clips: {
          queda: C('f8-ko-fall', [0, 1, 2, 3, 4, 7], [90, 90, 90, 100, 130, 220], { loop: false, fases: { perda_de_postura: [0, 3], assentar: [4, 5] }, segue_para: 'estado' }),
          estado: C('f8-ko-loop', [3, 0, 1, 2], [600, 220, 220, 220], { loop: true, doc: 'Estado incapacitado: parado no chão (600 ms) e uma arfada de boca aberta (3 quadros). Quadro 0 do clipe ≈ último quadro da queda.' }),
          recuperacao: C('f8-ko-recover', [0, 1, 2, 3, 4, 5, 6, 7], [220, 160, 140, 140, 120, 120, 110, 120], { loop: false, retorna_a: 'idle' }),
        } },
    },
    demos: { ataque_sem_fx: [['S', 250], 'attack_retriever_bark/ataque', ['S', 350]], dano: [['S', 250], 'hurt/dano', ['S', 350]], incapacitacao_completa: [['S', 250], 'incapacitated/queda', 'incapacitated/estado', 'incapacitated/estado', 'incapacitated/recuperacao', ['S', 400]] },
  },
  rest: {
    titulo: 'F9 Fase 6 — descanso e sono',
    estados: {
      rest: { doc: 'Cadeia: em pé → deitado → dormindo → (loop de sono) → acordando → em pé. Pose deitada desenhada (esfinge: barriga no chão, patas dianteiras à frente), não é o sprite achatado.', pose: ['f6-stand-to-lie', 7], pose2: ['f6-lie-to-sleep', 3],
        clips: {
          stand_to_lie: C('f6-stand-to-lie', [0, 1, 2, 3, 4, 7], [120, 120, 120, 120, 140, 200], { loop: false, segue_para: 'deitado (pose_mestra_deitado) ou lie_to_sleep' }),
          lie_to_sleep: C('f6-lie-to-sleep', [0, 1, 2, 3], [320, 240, 240, 400], { loop: false, segue_para: 'sleep_loop' }),
          sleep_loop: C('f6-sleep-loop', [0, 1, 2, 3], 550, { loop: true, doc: 'Respiração: o dorso e a barriga mudam 26–68 px por quadro; cabeça, patas e cauda paradas; bbox constante.' }),
          sleep_to_wake: C('f6-sleep-to-wake', [0, 1, 2, 3, 4, 5, 6, 7], [220, 220, 260, 260, 180, 340, 180, 260], { loop: false, doc: 'Dormindo → acordando: orelha mexe, olho abre, levanta a cabeça, boceja, termina deitado e acordado.', segue_para: 'wake_to_stand' }),
          wake_to_stand: C('f6-lie-to-stand', [0, 1, 2, 3, 4, 5, 6, 7], [130, 130, 130, 120, 120, 110, 110, 130], { loop: false, doc: 'Acordando → em pé.', retorna_a: 'idle' }),
        } },
    },
    demos: { descanso_completo: [['S', 300], 'rest/stand_to_lie', ['P', 500], 'rest/lie_to_sleep', 'rest/sleep_loop', 'rest/sleep_loop', 'rest/sleep_loop', 'rest/sleep_to_wake', 'rest/wake_to_stand', ['S', 400]], sono_loop: ['rest/sleep_loop'] },
  },
  emotions: {
    titulo: 'F9 Fase 5 — emoções (feliz, triste, irritado, assustado)',
    estados: {
      happy: { doc: 'Feliz: cabeça erguida, boca aberta, cauda abanando (movimento só na cauda durante o loop), postura receptiva.', pose: ['f5-happy', 3], clips: { entrada: C('f5-happy', [0, 1], [90, 90]), loop: C('f5-happy', [2, 3, 4, 5], 120, { loop: true }), saida: C('f5-happy', [6, 7], [100, 110], { retorna_a: 'idle' }) } },
      sad: { doc: 'Triste: cabeça baixa, dorso abatido, olho semicerrado. Movimento reduzido de propósito: no loop mudam 7–11 px por quadro.', pose: ['f5-sad', 2], clips: { entrada: C('f5-sad', [0, 1], [180, 180]), loop: C('f5-sad', [2, 3, 4, 3], 450, { loop: true }), saida: C('f5-sad', [5, 6, 7], [180, 160, 160], { retorna_a: 'idle' }) } },
      angry: { doc: 'Irritado: postura defensiva baixa, patas abertas, dentes à mostra, cauda erguida e rígida; rosna tremendo. Não late (o latido é o ataque).', pose: ['f5-angry', 2], clips: { entrada: C('f5-angry', [0], [90], { doc: 'Entrada de 1 quadro: o bruto já começa na postura. Leitura: reação brusca.' }), loop: C('f5-angry', [1, 2, 3, 4], 90, { loop: true }), saida: C('f5-angry', [6, 7], [120, 130], { retorna_a: 'idle' }) } },
      scared: { doc: 'Assustado: sobressalto (olho arregalado), recua e se encolhe tremendo, depois volta com cautela.', pose: ['f5-scared', 3], clips: { entrada: C('f5-scared', [0, 1], [60, 80], { doc: 'Reação rápida.' }), loop: C('f5-scared', [2, 3, 4, 5], 80, { loop: true }), saida: C('f5-scared', [6, 7], [140, 150], { retorna_a: 'idle' }) } },
    },
    demos: { happy: [['S', 300], 'happy/entrada', 'happy/loop', 'happy/loop', 'happy/loop', 'happy/saida', ['S', 400]], sad: [['S', 300], 'sad/entrada', 'sad/loop', 'sad/loop', 'sad/saida', ['S', 400]], angry: [['S', 300], 'angry/entrada', 'angry/loop', 'angry/loop', 'angry/loop', 'angry/saida', ['S', 400]], scared: [['S', 300], 'scared/entrada', 'scared/loop', 'scared/loop', 'scared/loop', 'scared/saida', ['S', 400]] },
  },
  interactions: {
    titulo: 'F9 Fase 7 — interações com o Tamer (receber carinho, comemoração)',
    estados: {
      petting: { doc: 'Receber carinho: inclina e baixa a cabeça para o toque, fecha o olho, cauda abana; volta ao idle. A aproximação e a mão são do Tamer (não desenhadas aqui): ver contratos/. Ponto de contato da mão: topo do capuz.', pose: ['f7-petting', 3], clips: { entrada: C('f7-petting', [0, 1], [110, 110]), loop: C('f7-petting', [2, 3, 4, 5], 130, { loop: true }), saida: C('f7-petting', [6, 7], [120, 130], { retorna_a: 'idle' }) } },
      celebrate: { doc: 'Comemoração após vitória: agacha, pula com as 4 patas fora do chão (pé sobe até y=43), boca aberta, orelhas e cauda para cima, aterrissa e volta.', pose: ['f7-celebrate', 3], clips: { comemoracao: C('f7-celebrate', [0, 1, 2, 3, 4, 5, 6, 7], [80, 70, 70, 100, 70, 80, 90, 110], { loop: false, fases: { preparacao: [0, 1], pulo: [2, 4], aterrissagem: [5, 6], retorno: [7, 7] }, quadros_no_ar: [2, 3, 4], repetivel: 'quadros 0–6 podem repetir antes do retorno', retorna_a: 'idle' }) } },
    },
    demos: { petting: [['S', 300], 'petting/entrada', 'petting/loop', 'petting/loop', 'petting/loop', 'petting/saida', ['S', 400]], celebrate: [['S', 300], 'celebrate/comemoracao', 'celebrate/comemoracao', ['S', 400]] },
  },
};
function run(script, args) { cp.execFileSync('node', [path.join(S, script), ...args], { stdio: ['ignore', 'ignore', 'inherit'] }); }
function gif(out, frames, ms) { fs.mkdirSync(path.dirname(out), { recursive: true }); for (const sc of [1, 4]) run('gif.js', [`${out}_${sc}x.gif`, String(sc), ms.join(','), ...frames]); }
function strip(out, files) { const w = L.readPNG(files[0]).width; const cv = L.canvas(files.length * w, 60); files.forEach((f, i) => { const im = L.readPNG(f); for (let y = 0; y < 60; y++) for (let x = 0; x < w; x++) { const si = (y * w + x) * 4, di = (y * cv.width + i * w + x) * 4; for (let k = 0; k < 4; k++) cv.data[di + k] = im.data[si + k]; } }); L.save(out, cv); }
const ROT = 'rot_E.png';
for (const [folder, F] of Object.entries(FOLDERS)) {
  const D = path.join(OUT, folder); for (const e of (fs.existsSync(D) ? fs.readdirSync(D) : [])) if (e !== 'contratos') fs.rmSync(path.join(D, e), { recursive: true, force: true }); /* contratos/ é escrito à mão: preservar */ fs.mkdirSync(D, { recursive: true });
  const man = { especie: 'Labramon (sp.labramon) — Rookie/child, Beast, Vaccine', versao: F.titulo, data: '2026-11-16', direcao: 'E (única direção nesta validação; standing/idle/walk nas 4 direções estão em movement/)',
    licenca: 'private-prototype (fan game não oficial, sem licença, sem monetização). Espécie oficial Bandai/Toei. NÃO homologado. Nada publicado.', status: 'CANDIDATO — aguardando QA independente (game-qa, Fase 10) e homologação do fundador',
    canvas: [60, 60], ancora: { x: 29.5, y_chao: 49 }, paleta: { limite: 24, doc: 'Todos os quadros usam só cores da rotação E (19 cores); 0 semitransparência.' },
    idle_de_retorno: 'movement/idle/E (ou movement/standing/E.png)', duracoes: 'ms por quadro = sugestão de arte; parâmetro do motor', estados: {}, demos: {}, bruto: {} };
  const sheetRows = [], usedAnims = new Set(), clipFiles = {};
  for (const [st, E] of Object.entries(F.estados)) {
    const SD = path.join(D, st); const mst = { doc: E.doc, clipes: {} };
    const multi = Object.keys(E.clips).length > 1;
    for (const [cn, c] of Object.entries(E.clips)) {
      usedAnims.add(c.a); const CD = multi ? path.join(SD, cn) : path.join(SD, 'frames'); const files = [];
      c.f.forEach((idx, i) => { const dst = path.join(CD, `frame_${String(i).padStart(3, '0')}.png`); fs.mkdirSync(CD, { recursive: true }); fs.copyFileSync(fr(c.a, idx), dst); files.push(dst); });
      clipFiles[`${st}/${cn}`] = { files, ms: c.ms };
      const logs = c.f.map(idx => finLog[c.a][idx]);
      const stripName = `spritesheets/${st}_${cn}.png`; strip(path.join(D, stripName), files);
      gif(path.join(D, 'gifs', `${st}_${cn}`), files, c.ms);
      mst.clipes[cn] = Object.assign({ fonte: c.a, quadros_fonte: c.f, quadros: c.f.length, duracao_ms_por_quadro: c.ms, duracao_total_ms: c.ms.reduce((a, b) => a + b, 0), loop: !!c.loop }, c.fases ? { fases_quadros_inicio_fim: c.fases } : {}, c.doc ? { doc: c.doc } : {},
        ...['quadro_de_impacto', 'retorna_a', 'segue_para', 'quadros_no_ar', 'repetivel'].filter(k => c[k] !== undefined).map(k => ({ [k]: c[k] })),
        { spritesheet: stripName, gifs: [`gifs/${st}_${cn}_1x.gif`, `gifs/${st}_${cn}_4x.gif`], medidas: { h_min_max: [Math.min(...logs.map(l => l.h)), Math.max(...logs.map(l => l.h))], w_min_max: [Math.min(...logs.map(l => l.w)), Math.max(...logs.map(l => l.w))], pe_y: logs.map(l => l.footY), cores_max: Math.max(...logs.map(l => l.colors)), fora_da_paleta: Math.max(...logs.map(l => l.offPalette)), semitransparentes: Math.max(...logs.map(l => l.semi)), olho_px: logs.map(l => l.eyePx), marcas_px: logs.map(l => l.markPx), rosto_travado: logs.map(l => l.face.locked), dif_px_vs_rotacao_E: logs.map(l => l.vsRotationPx) },
          arquivos: files.map(f => ({ arquivo: path.relative(D, f), sha256: sha(f) })) });
      sheetRows.push(files.join('+'));
    }
    const pm = path.join(SD, E.pose2 ? 'pose_mestra_deitado.png' : 'pose_mestra.png'); fs.copyFileSync(fr(...E.pose), pm);
    mst.pose_mestra = { arquivo: path.relative(D, pm), fonte: `${E.pose[0]} q${E.pose[1]}`, sha256: sha(pm) };
    if (E.pose2) { const p2 = path.join(SD, 'pose_mestra_dormindo.png'); fs.copyFileSync(fr(...E.pose2), p2); mst.pose_mestra_dormindo = { arquivo: path.relative(D, p2), fonte: `${E.pose2[0]} q${E.pose2[1]}`, sha256: sha(p2) }; }
    man.estados[st] = mst;
  }
  // demos
  for (const [dn, seq] of Object.entries(F.demos)) {
    const files = [], ms = []; let last = ROT;
    for (const s of seq) { if (Array.isArray(s)) { files.push(s[0] === 'S' ? ROT : last); ms.push(s[1]); } else { const c = clipFiles[s]; files.push(...c.files); ms.push(...c.ms); last = c.files[c.files.length - 1]; } }
    gif(path.join(D, 'gifs', `demo_${dn}`), files, ms);
    man.demos[dn] = { sequencia: seq.map(s => Array.isArray(s) ? (s[0] === 'S' ? `standing E ${s[1]} ms` : `pausa no último quadro ${s[1]} ms`) : s), quadros: files.length, duracao_total_ms: ms.reduce((a, b) => a + b, 0), gifs: [`gifs/demo_${dn}_1x.gif`, `gifs/demo_${dn}_4x.gif`] };
  }
  // FX do ataque
  if (folder === 'combat') {
    const FXD = path.join(D, 'attack_retriever_bark', 'fx'); run('fx_bark.js', [FXD]);
    const tl = [[0, null, 90], [1, null, 90], [2, null, 100], [3, null, 120], [4, 0, 70], [5, 1, 90], [5, 2, 90], [6, 3, 100], [7, 4, 110]];
    const CD = path.join(D, 'attack_retriever_bark', 'composto_preview'); const files = [];
    tl.forEach(([q, f], i) => { const cv = L.canvas(96, 60); L.paste(cv, L.readPNG(fr('f8-attack-bark', q)), 0, 0); if (f !== null) L.paste(cv, L.readPNG(path.join(FXD, `fx_00${f}.png`)), 0, 0); const p = path.join(CD, `frame_${String(i).padStart(3, '0')}.png`); L.save(p, cv); files.push(p); });
    // primeiro e último quadro do demo: standing em canvas 96
    const st96 = L.canvas(96, 60); L.paste(st96, L.readPNG(ROT), 0, 0); const sp = path.join(CD, '_standing_96.png'); L.save(sp, st96);
    gif(path.join(D, 'gifs', 'demo_ataque_com_fx'), [sp, ...files, sp], [250, ...tl.map(t => t[2]), 350]);
    const fxFiles = fs.readdirSync(FXD).sort().map(f => path.join(FXD, f));
    strip(path.join(D, 'spritesheets', 'attack_retriever_bark_fx.png'), fxFiles); strip(path.join(D, 'spritesheets', 'attack_retriever_bark_composto_preview.png'), files);
    man.estados.attack_retriever_bark.fx_onda_de_choque = { doc: 'Camada FX separada, desenhada localmente (0 gerações), só cores da paleta (#f6f2e8, #d5d2c6, #010101), sem semitransparência (o apagar é por tracejado). Canvas 96x60 com a MESMA origem do sprite 60x60 (o sprite ocupa x 0–59). Origem da onda = boca no quadro de execução.', canvas: [96, 60], origem_boca_xy: [52, 24], alcance_max_x: 78,
      linha_do_tempo: tl.map(([q, f, ms]) => ({ quadro_sprite: q, quadro_fx: f, ms })), arquivos: fxFiles.map(f => ({ arquivo: path.relative(D, f), sha256: sha(f) })), preview_composto: files.map(f => path.relative(D, f)), gifs: ['gifs/demo_ataque_com_fx_1x.gif', 'gifs/demo_ataque_com_fx_4x.gif'],
      espelhar_para_W: 'não validado: W não foi produzido nesta fase' };
    sheetRows.push(files.join('+'));
  }
  // folhas de contato
  for (const sc of [1, 4]) run('sheet58.js', [path.join(D, `folha_contato_${sc}x.png`), String(sc), '1', ROT, ...sheetRows]);
  run('sheet58.js', [path.join(D, 'folha_contato_3x_transparente.png'), '3', '0', ROT, ...sheetRows]);
  // bruto como evidência
  for (const a of [...usedAnims].sort()) { const ED = path.join(D, '_evidencias', 'bruto_pixminimax', a); fs.mkdirSync(ED, { recursive: true }); for (const f of L.frames('raw/' + a)) fs.copyFileSync(f, path.join(ED, path.basename(f)));
    man.bruto[a] = { pixellab_grupo: SRC[a][0], pixellab_job: SRC[a][1], modo: 'animate_character pixminimax, direção east, palette 19 cores, keep_first_frame=false', quadros_gerados: SRC[a][2], geracoes: 1, quadros_chave: SRC[a][3], canvas_bruto: preLog[a][0].srcSize, recorte_dx: preLog[a][0].cropDx, pos_processo: finLog[a].map((e, i) => ({ q: e.frame, px_soltos_removidos: preLog[a][i].loosePx, ancora_dy: preLog[a][i].anchorDy, queixo_px: e.chinDanglePx || 0, topo_cabeca_px: e.headBlobPx || 0, rosto_travado: e.face.locked, contorno_fechado_px: e.gaps })), pasta: `_evidencias/bruto_pixminimax/${a}` }; }
  fs.writeFileSync(path.join(D, '_evidencias', 'pos_processo_log.json'), JSON.stringify({ pre: Object.fromEntries([...usedAnims].map(a => [a, preLog[a]])), fin: Object.fromEntries([...usedAnims].map(a => [a, finLog[a]])) }, null, 1));
  man.folhas = ['folha_contato_1x.png', 'folha_contato_4x.png', 'folha_contato_3x_transparente.png'];
  man.geracoes_pixellab = [...usedAnims].length;
  fs.writeFileSync(path.join(D, 'manifesto.json'), JSON.stringify(man, null, 1));
  console.log(folder, 'estados', Object.keys(F.estados).length, 'animações-base', usedAnims.size, 'arquivos', cp.execSync(`find "${D}" -type f | wc -l`).toString().trim());
}
