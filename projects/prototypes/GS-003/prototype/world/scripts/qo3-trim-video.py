"""Corta o vídeo bruto do passeio (scripts/qo3-capture.mjs video) em trechos e regrava em WebM VP9 (PyAV).

Uso: python qo3-trim-video.py ENTRADA.webm SAIDA.webm "ini-fim,ini-fim,..."   (segundos do vídeo bruto)
Rodada 2 da fase 3: tira o carregamento e encurta o vaivém na grama até o encontro natural sair.
"""
import sys
from fractions import Fraction

import av

src, dst, spec = sys.argv[1], sys.argv[2], sys.argv[3]
ranges = [tuple(float(v) for v in r.split("-")) for r in spec.split(",")]
inp = av.open(src)
vs = inp.streams.video[0]
out = av.open(dst, "w")
fps = 25
os_ = out.add_stream("libvpx-vp9", rate=fps)
os_.width, os_.height, os_.pix_fmt = vs.codec_context.width, vs.codec_context.height, "yuv420p"
os_.options = {"crf": "34", "b:v": "0", "deadline": "realtime", "cpu-used": "8", "row-mt": "1"}
n = 0
for frame in inp.decode(vs):
    t = float(frame.pts * vs.time_base)
    if not any(a <= t < b for a, b in ranges):
        continue
    f = frame.reformat(format="yuv420p")
    f.pts = n
    f.time_base = Fraction(1, fps)
    n += 1
    for pkt in os_.encode(f):
        out.mux(pkt)
for pkt in os_.encode():
    out.mux(pkt)
out.close()
print(f"{dst}: {n} quadros, {n / fps:.1f} s")
