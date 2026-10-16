// Vercel serverless function
const { analyze } = require('../lib/analyze');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  try { res.status(200).json(await analyze(req.body || {})); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
};
module.exports.config = { api: { bodyParser: { sizeLimit: '12mb' } } };
