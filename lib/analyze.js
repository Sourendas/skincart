const { uploadImage, runSkinAnalysis, normalize } = require('./youcam');
const { buildRoutine, cartCheck } = require('./planner');
const mock = require('./mock');

// body: { image: 'data:image/jpeg;base64,...' | imageUrl: 'https://...', cart: [ids], budget }
async function analyze(body, env = process.env) {
  const useMock = env.YOUCAM_MOCK === '1';
  const key = env.YOUCAM_API_KEY;
  let results;
  if (useMock) results = mock();
  else {
    if (!key) { const e = new Error('Server has no YOUCAM_API_KEY configured.'); e.status = 503; throw e; }
    if (body.imageUrl) {
      if (!/^https:\/\//.test(body.imageUrl)) { const e = new Error('imageUrl must be https'); e.status = 400; throw e; }
      results = await runSkinAnalysis(key, { fileUrl: body.imageUrl });
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
    mock: useMock, overall: norm.overall, scores: norm.scores,
    routine: buildRoutine(norm.scores, { budget: Number(body.budget) || 60 }),
    cart: Array.isArray(body.cart) ? cartCheck(body.cart, norm.scores) : null,
  };
}
module.exports = { analyze };
