// Local dev server: node dev.js  (PORT=3000). Loads .env if present.
const http = require('http'), fs = require('fs'), path = require('path');
try { fs.readFileSync('.env', 'utf8').split('\n').forEach((l) => { const m = /^([A-Z_]+)=(.*)$/.exec(l.trim()); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; }); } catch {}
const { analyze } = require('./lib/analyze'); const { CATALOG } = require('./lib/planner');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg' };
http.createServer(async (req, res) => {
  const send = (c, o) => { res.writeHead(c, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
  if (req.url === '/api/catalog') return send(200, { catalog: CATALOG.map(({ id, name, price }) => ({ id, name, price })) });
  if (req.url === '/api/analyze' && req.method === 'POST') {
    let b = ''; for await (const c of req) b += c;
    try { return send(200, await analyze(JSON.parse(b || '{}'))); } catch (e) { return send(e.status || 500, { error: e.message }); }
  }
  const f = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (!f.startsWith(path.join(__dirname, 'public')) || !fs.existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(process.env.PORT || 3000, () => console.log('SkinCart on http://localhost:' + (process.env.PORT || 3000)));
