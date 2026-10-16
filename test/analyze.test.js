const test = require('node:test'); const assert = require('node:assert'); const { analyze } = require('../lib/analyze');
test('mock mode is flagged', async () => { const r = await analyze({ cart: ['spf'] }, { YOUCAM_MOCK: '1' }); assert.equal(r.mock, true); });
test('no key -> 503', async () => { await assert.rejects(analyze({ imageUrl: 'https://x.y/a.jpg' }, {}), (e) => e.status === 503); });
test('bad image -> 400', async () => { await assert.rejects(analyze({ image: 'nope' }, { YOUCAM_API_KEY: 'k' }), (e) => e.status === 400); });
