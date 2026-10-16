// YouCam API client (Skin Analysis v2.0 file flow + v2.1 task). Zero dependencies, Node >= 18.
const BASE = 'https://yce-api-01.makeupar.com';
// SD concerns we request (SD and HD cannot be mixed in one request).
const SD_ACTIONS = ['acne', 'moisture', 'oiliness', 'pore', 'redness', 'texture', 'wrinkle', 'dark_circle_v2', 'radiance', 'firmness'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function yc(path, key, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = { raw: text }; }
  if (!res.ok) {
    const e = new Error(`YouCam ${res.status}: ${body.error_code || body.error || text.slice(0, 200)}`);
    e.status = res.status; e.body = body; throw e;
  }
  return body;
}

// bytes: Buffer, contentType: image/jpeg|image/png -> file_id
async function uploadImage(key, bytes, contentType, fileName = 'face.jpg') {
  const meta = await yc('/s2s/v2.0/file/skin-analysis', key, {
    method: 'POST',
    body: JSON.stringify({ files: [{ content_type: contentType, file_name: fileName, file_size: bytes.length }] }),
  });
  const f = meta.data.files[0];
  const req = f.requests[0];
  const put = await fetch(req.url, { method: req.method || 'PUT', headers: req.headers, body: bytes });
  if (!put.ok) throw new Error(`Upload to pre-signed URL failed: ${put.status}`);
  return f.file_id;
}

async function runSkinAnalysis(key, { fileId, fileUrl, actions = SD_ACTIONS, pollMs = 2000, timeoutMs = 60000 }) {
  const body = { dst_actions: actions, format: 'json' };
  if (fileId) body.src_file_id = fileId; else body.src_file_url = fileUrl;
  const start = await yc('/s2s/v2.1/task/skin-analysis', key, { method: 'POST', body: JSON.stringify(body) });
  const taskId = start.data.task_id;
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    await sleep(pollMs);
    const r = await yc(`/s2s/v2.1/task/skin-analysis/${encodeURIComponent(taskId)}`, key);
    const st = r.data.task_status;
    if (st === 'success') return r.data.results;
    if (st === 'error') throw new Error(`Skin analysis failed: ${r.data.error || r.data.error_message || 'error'}`);
  }
  throw new Error('Skin analysis timed out');
}

// Normalise results.output[] -> { overall, scores:{concern:{ui,raw,mask}} }
function normalize(results) {
  const scores = {}; let overall = null;
  for (const o of (results && results.output) || []) {
    if (typeof o.score === 'number' && !o.type) { overall = o.score; continue; }
    if (!o.type) continue;
    const name = o.type.replace(/^hd_/, '');
    if (typeof o.score === 'number' && overall == null) overall = o.score;
    if (typeof o.ui_score !== 'number') continue;
    if (scores[name] && o.region && o.region !== 'whole') continue; // prefer whole-face region
    scores[name] = { ui: o.ui_score, raw: o.raw_score, mask: (o.mask_urls || [])[0] || null };
  }
  return { overall, scores };
}

module.exports = { SD_ACTIONS, uploadImage, runSkinAnalysis, normalize };
