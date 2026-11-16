"""Comando 9 / F4 — página de comparação A/B/C/D (offline, quadros embutidos em base64) + folha e GIF do híbrido.
Só leitura das entradas; grava em ../pagina_comparacao.html e ../hibrido_agumon_S/{folha_4x.png,hibrido_4x.gif}.
"""
import os, glob, base64, json, sys
HERE = os.path.dirname(os.path.abspath(__file__)); F4 = os.path.dirname(HERE); C9 = os.path.dirname(F4)
LAB = os.path.dirname(C9)
sys.path.insert(0, '/home/openclaw/projects/GameStudio/workspaces/game-art/tools')
from pxpng import load_png_rgba, save_png_rgba
from gifenc import write_gif

def frames(d):
    return sorted(glob.glob(os.path.join(d, 'frame_*.png')))

def delays(d, n, default):
    p = os.path.join(d, 'delays_ms.txt')
    if os.path.exists(p):
        v = [int(x) for x in open(p).read().split()]
        if len(v) == n: return v
    return [default] * n

def anim(label, d, default=110):
    fs = frames(d); w, h, _ = load_png_rgba(fs[0])
    return {'label': label, 'w': w, 'h': h, 'delays': delays(d, len(fs), default),
            'src': os.path.relpath(d, LAB),
            'frames': ['data:image/png;base64,' + base64.b64encode(open(f, 'rb').read()).decode() for f in fs]}

V7 = os.path.join(LAB, 'fase9-pixellab-d12', 'pacote_agumon_v7')
F2 = os.path.join(C9, 'f2', 'pacote_agumon_f2')
F3 = os.path.join(C9, 'f3')
HB = os.path.join(F4, 'hibrido_agumon_S')
FEL_D = [160, 110, 90, 120, 140, 140, 110, 120, 200]

METODOS = [
 {'id': 'A', 'nome': 'A — PixelLab original (Agumon v7 + emoção v3 custom)',
  'custo': '≈ 18 gerações por espécie no padrão 1.0 (11 base + 3 andar + 3 ataque + 1 emoção/direção); o Agumon real custou 23 com as iterações v5–v7. Tempo: fila de 2–4 min por chamada.',
  'notas': 'QA F2 (antes): fidelidade 5,5 · estabilidade 5,5 · limpeza 5,5 · legibilidade 6,5 → média 5,75. QA F3: feliz v3 custom 8,0; ataque v3 como preparação 7,0.',
  'anims': [anim('andar S (v7)', os.path.join(V7, 'walk', 'S')), anim('ataque S (v7)', os.path.join(V7, 'attack', 'S')),
            dict(anim('feliz S (v3 custom, cru)', os.path.join(F3, 'ref_v3_custom_feliz_1x')), delays=FEL_D)]},
 {'id': 'B', 'nome': 'B — A + polimento por script (F2/F2b)',
  'custo': '0 gerações sobre A. ~14 min de agente para 3 espécies (F2) + ~8 min (F2b).',
  'notas': 'QA F2 (depois, Agumon): 7,5 · 7,5 · 7 · 7 → média 7,25 (Gomamon 7,25; Ikkakumon 7,5). A F2b corrigiu F2-1..F2-4 depois do QA e ainda não foi revalidada.',
  'anims': [anim('andar S (F2b)', os.path.join(F2, 'walk', 'S')), anim('ataque S (F2b)', os.path.join(F2, 'attack', 'S'))]},
 {'id': 'C', 'nome': 'C — rig 2D por partes (F3)',
  'custo': '0 gerações (precisa da rotação de A). ~8 min de agente para 4 animações.',
  'notas': 'QA F3: idle S 7,5 · idle E 7,0 · feliz 6,0 · preparo 5,5 → média 6,5. Identidade: crânio 100% idêntico em todos os quadros.',
  'anims': [anim('idle S (rig)', os.path.join(F3, 'anim_idle_S')), anim('feliz S (rig)', os.path.join(F3, 'anim_feliz_S')),
            anim('preparo S (rig)', os.path.join(F3, 'anim_preparo_S')), anim('idle E (rig)', os.path.join(F3, 'anim_idle_E'))]},
 {'id': 'D', 'nome': 'D — híbrido (F4): idle do rig · ataque = antecipação do rig + miolo v3 F2b + volta do rig · feliz v3 polido',
  'custo': '0 gerações sobre A (reaproveita o ataque e o feliz v3 já pagos). ~25 min de agente (montagem + métricas + página).',
  'notas': 'SEM QA independente ainda (NÃO VALIDADO). Notas herdadas dos componentes: idle 7,5 (QA F3); ataque = miolo B (Agumon 7,25) com emenda medida; feliz v3 8,0 (QA F3, antes do polimento).',
  'anims': [anim('idle S (D)', os.path.join(HB, 'idle')), anim('ataque S (D)', os.path.join(HB, 'ataque')),
            anim('feliz S (D)', os.path.join(HB, 'feliz'))]},
]

HTML = r'''<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Digital Odyssey — Comando 9 F4: comparação A/B/C/D (Agumon S)</title>
<style>
 body{font-family:system-ui,sans-serif;background:#1f2228;color:#e6e6e6;margin:16px}
 h1{font-size:18px} h2{font-size:15px;margin:22px 0 4px} p.n{margin:2px 0;font-size:13px;color:#c8c8c8}
 .warn{background:#4a3a14;border:1px solid #a98a2a;padding:8px;font-size:13px}
 .row{display:flex;flex-wrap:wrap;gap:14px;margin-top:8px}
 .cell{background:var(--bg);padding:8px;border:1px solid #3a3f48}
 .cell .t{font-size:12px;color:#ddd;margin-bottom:4px} .cell .s{font-size:10px;color:#9aa}
 img{image-rendering:pixelated;image-rendering:crisp-edges;display:block}
 .pair{display:flex;align-items:flex-end;gap:10px}
 button,label{font-size:13px}
</style></head><body>
<h1>Comando 9 · F4 — comparação dos métodos (Agumon, direção S)</h1>
<div class="warn">Página local, sem rede: todos os quadros estão embutidos. Fan game não oficial e não licenciado; uso interno de estudo. Escalas: 1× (tamanho de jogo) e 4× (zoom inteiro, vizinho mais próximo). Notas = QA independente (game-qa), não autoavaliação. D ainda não tem QA independente.</div>
<p class="n"><button id="pp">Pausar</button> <button id="st">Avançar 1 quadro</button>
 <label><input type="checkbox" id="bg"> fundo claro (grama)</label>
 <label>velocidade <select id="sp"><option value="1">1×</option><option value="0.5">0,5×</option><option value="0.25">0,25×</option></select></label></p>
<div id="root"></div>
<script>
const DATA = __DATA__;
let playing = true, speed = 1; const players = [];
function mk(a, scale){const im=document.createElement('img');im.width=a.w*scale;im.height=a.h*scale;im.src=a.frames[0];return im;}
for(const m of DATA){
  const h=document.createElement('h2');h.textContent=m.nome;root.appendChild(h);
  for(const t of [m.notas,m.custo]){const p=document.createElement('p');p.className='n';p.textContent=t;root.appendChild(p);}
  const row=document.createElement('div');row.className='row';root.appendChild(row);
  for(const a of m.anims){
    const c=document.createElement('div');c.className='cell';
    const t=document.createElement('div');t.className='t';t.textContent=a.label+' — '+a.frames.length+' q, '+a.w+'×'+a.h;c.appendChild(t);
    const pr=document.createElement('div');pr.className='pair';const i1=mk(a,1),i4=mk(a,4);pr.appendChild(i1);pr.appendChild(i4);c.appendChild(pr);
    const s=document.createElement('div');s.className='s';s.textContent=a.src;c.appendChild(s);
    row.appendChild(c);players.push({a,imgs:[i1,i4],q:0,acc:0,lab:t});
  }
}
function show(p){for(const im of p.imgs) im.src=p.a.frames[p.q]; p.lab.textContent=p.a.label+' — q'+p.q+'/'+(p.a.frames.length-1)+', '+p.a.w+'×'+p.a.h;}
function step(p){p.q=(p.q+1)%p.a.frames.length;show(p);}
let last=performance.now();
function tick(now){const dt=(now-last)*speed;last=now;
  if(playing) for(const p of players){p.acc+=dt;while(p.acc>=p.a.delays[p.q]){p.acc-=p.a.delays[p.q];step(p);}}
  requestAnimationFrame(tick);}
requestAnimationFrame(tick);
pp.onclick=()=>{playing=!playing;pp.textContent=playing?'Pausar':'Tocar';};
st.onclick=()=>{playing=false;pp.textContent='Tocar';players.forEach(step);};
sp.onchange=()=>{speed=parseFloat(sp.value);};
bg.onchange=()=>{document.documentElement.style.setProperty('--bg',bg.checked?'#7fa65a':'#30343c');};
document.documentElement.style.setProperty('--bg','#30343c');
</script></body></html>'''

if __name__ == '__main__':
    with open(os.path.join(F4, 'pagina_comparacao.html'), 'w') as fh:
        fh.write(HTML.replace('__DATA__', json.dumps(METODOS, ensure_ascii=False)))
    # folha 4x e GIF 4x do híbrido (3 animações lado a lado, ciclo independente por coluna)
    S = 4; N = 64; BG = (48, 52, 60, 255)
    cols = []
    for n in ('idle', 'ataque', 'feliz'):
        d = os.path.join(HB, n); fs = frames(d)
        cols.append(([load_png_rgba(f)[2] for f in fs], delays(d, len(fs), 110)))
    # folha: uma linha por animação
    maxq = max(len(c[0]) for c in cols)
    W, H = maxq * N * S, len(cols) * N * S
    cv = [[BG] * W for _ in range(H)]
    for r, (fr, _) in enumerate(cols):
        for q, px in enumerate(fr):
            for y in range(N * S):
                for x in range(N * S):
                    c = px[y // S][x // S]
                    if c[3]: cv[r * N * S + y][q * N * S + x] = c
    save_png_rgba(os.path.join(HB, 'folha_4x.png'), W, H, cv)
    # GIF: linha do tempo em passos de 10 ms, um quadro a cada mudança de qualquer coluna
    def at(fr, dl, t):
        t %= sum(dl); q = 0
        while t >= dl[q]: t -= dl[q]; q += 1
        return q
    import math
    total = 1
    for _, dl in cols: total = total * sum(dl) // math.gcd(total, sum(dl))
    total = min(total, 12000)
    gw, gh = 3 * N * S, N * S
    gframes, gdel, prev, t0 = [], [], None, 0
    for t in range(0, total, 10):
        key = tuple(at(fr, dl, t) for fr, dl in cols)
        if key != prev:
            if prev is not None: gdel.append(t - t0)
            prev, t0 = key, t
            g = [[BG] * gw for _ in range(gh)]
            for ci, ((fr, _), q) in enumerate(zip(cols, key)):
                px = fr[q]
                for y in range(gh):
                    for x in range(N * S):
                        c = px[y // S][x // S]
                        if c[3]: g[y][ci * N * S + x] = c
            gframes.append(g)
    gdel.append(total - t0)
    write_gif(os.path.join(HB, 'hibrido_4x.gif'), gframes, gw, gh, gdel)
    print('ok', len(gframes), 'quadros de GIF,', total, 'ms')
