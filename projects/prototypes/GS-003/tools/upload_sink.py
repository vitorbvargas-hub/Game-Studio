"""Receptor local temporário: o navegador do fundador faz POST de sprites (bytes crus) para cá.
Uso: python3 upload_sink.py <dir_destino> [porta]   — POST /<nome-do-arquivo>
"""
import os, re, sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

DEST = sys.argv[1]
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 18911
os.makedirs(DEST, exist_ok=True)


class H(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        name = re.sub(r"[^A-Za-z0-9._-]", "_", self.path.strip("/"))[:120] or "upload.bin"
        n = int(self.headers.get("Content-Length", 0))
        data = self.rfile.read(n)
        with open(os.path.join(DEST, name), "wb") as f:
            f.write(data)
        self.send_response(200)
        self._cors()
        self.end_headers()
        self.wfile.write(f"ok {name} {len(data)}".encode())


ThreadingHTTPServer(("0.0.0.0", PORT), H).serve_forever()
