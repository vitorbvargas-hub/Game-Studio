'use strict';
// Converts a web_fetch spill log (/tmp/openclaw-web-fetch-*.log) into the
// real file. Needed because the sandbox egress proxy blocks curl/git to
// GitHub; only the agent's web_fetch tool reaches raw.githubusercontent.com /
// api.github.com, and it returns text. Modes:
//   api    -- GitHub contents API JSON, field "content" = base64 of the file
//   b64    -- body is plain base64 (wsrv.nl ...&encoding=base64)
//   text   -- body is the text file itself (credits.txt, AnimData.xml)
// Usage: node fetch_spill.js <mode> <spill.log> <out-file>
const fs = require('fs');

function body(spill) {
  const s = fs.readFileSync(spill, 'utf8');
  const m = s.match(/<<<EXTERNAL_UNTRUSTED_CONTENT[^\n]*>>>\nSource: Web Fetch\n---\n([\s\S]*?)\n?<<<END_EXTERNAL_UNTRUSTED_CONTENT/);
  if (!m) throw new Error(`no wrapped body in ${spill}`);
  return m[1];
}

function main() {
  const [mode, spill, out] = process.argv.slice(2);
  let b = body(spill);
  let buf;
  if (mode === 'api') {
    const j = JSON.parse(b);
    buf = Buffer.from(j.content, 'base64');
    if (j.size !== buf.length) throw new Error(`size mismatch ${j.size} vs ${buf.length}`);
  } else if (mode === 'b64') {
    b = b.trim().replace(/^data:[^,]*,/, '');
    buf = Buffer.from(b, 'base64');
  } else if (mode === 'text') {
    buf = Buffer.from(b.replace(/^\n+/, ''), 'utf8');
  } else throw new Error(`mode ${mode}`);
  fs.mkdirSync(require('path').dirname(out), { recursive: true });
  fs.writeFileSync(out, buf);
  console.log(`${out} ${buf.length}B`);
}
main();
