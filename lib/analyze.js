const { uploadImage, runSkinAnalysis, normalize } = require('./youcam');
const { buildRoutine, cartCheck } = require('./planner');
const mock = require('./mock');

const sniff = (b) => (b[0] === 0xff && b[1] === 0xd8 ? 'image/jpeg' : b[0] === 0x89 && b[1] === 0x50 ? 'image/png' : null);
async function fetchImage(url) {
  let u; try { u = new URL(url); } catch { const e = new Error('bad imageUrl'); e.status = 400; throw e; }
  if (u.protocol !== 'https:' || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(u.hostname)) { const e = new Error('imageUrl must be a public https URL'); e.status = 400; throw e; }
  const r = await fetch(u, { headers: { 'User-Agent': 'skincart-hackathon/0.1 (contact: souren.devapp@gmail.com)' }, redirect: 'follow' });
  if (!r.ok) { const e = new Error('could not fetch imageUrl: ' + r.status); e.status = 400; throw e; }
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > 9.5 * 1024 * 1024) { const e = new Error('image too large'); e.status = 413; throw e; }
  return buf;
}
// body: { image: 'data:image/jpeg;base64,...' | imageUrl: 'https://...', cart: [ids], budget }
async function analyze(body, env = process.env) {
  const useMock = env.YOUCAM_MOCK === '1';
  const key = env.YOUCAM_API_KEY;
  let results;
  if (useMock) results = mock();
  else {
    if (!key) { const e = new Error('Server has no YOUCAM_API_KEY configured.'); e.status = 503; throw e; }
    if (body.imageUrl) {
      // Fetch server-side (some hosts block YouCam's fetcher) then upload via the File API.
      const bytes = await fetchImage(body.imageUrl);
      const ct = sniff(bytes);
      if (!ct) { const e = new Error('imageUrl is not a JPEG/PNG'); e.status = 400; throw e; }
      const fileId = await uploadImage(key, bytes, ct, ct === 'image/png' ? 'face.png' : 'face.jpg');
      results = await runSkinAnalysis(key, { fileId });
    } else if (body.image) {
      const m = /^data:(image\/(?:jpeg|png));base64,(.+)$/.exec(body.image);
      if (!m) { const e = new Error('image must be a JPEG/PNG data URL'); e.status = 400; throw e; }
      const bytes = Buffer.from(m[2], 'base64');
      if (bytes.length > 9.5 * 1024 * 1024) { const e = new Error('image too large (max 10MB)'); e.status = 413; throw e; }
      const fileId = await uploadImage(key, bytes, m[1], m[1] === 'image/png' ? 'face.png' : 'face.jpg');
      results = await runSkinAnalysis(key, { fileId });
    } else { const e = new Error('Provide image or imageUrl'); e.status = 400; throw e; }
  }
  const norm = normalize(results);
  if (!Object.keys(norm.scores).length) { const e = new Error('YouCam returned no scores'); e.status = 502; throw e; }
  return {
    mock: useMock, overall: norm.overall, skinAge: norm.skinAge, baseImage: norm.baseImage, scores: norm.scores,
    routine: buildRoutine(norm.scores, { budget: Number(body.budget) || 60 }),
    cart: Array.isArray(body.cart) ? cartCheck(body.cart, norm.scores) : null,
  };
}
module.exports = { analyze };
