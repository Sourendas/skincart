const test = require('node:test'); const assert = require('node:assert');
const { buildRoutine, cartCheck, needs } = require('../lib/planner'); const { normalize } = require('../lib/youcam'); const mock = require('../lib/mock');
const scores = normalize(mock()).scores;
test('normalize reads documented json shape', () => { const n = normalize(mock()); assert.equal(n.scores.acne.ui, 62); assert.ok(n.overall > 60); });
test('needs sorted by severity', () => { const n = needs(scores); assert.equal(n[0].concern, 'moisture'); assert.ok(n.every((x) => x.ui < 75)); });
test('routine has SPF, never stacks conflicting actives, within budget', () => {
  const r = buildRoutine(scores, { budget: 60 }); assert.ok(r.products.some((p) => p.id === 'spf')); assert.ok(r.spent <= 60);
  const act = r.products.flatMap((p) => p.actives); assert.ok(!(act.includes('retinoid') && act.includes('aha')));
});
test('cart check flags useless + conflicting items', () => {
  const c = cartCheck(['glitter-mask', 'retinol', 'aha-peel', 'ha-serum'], scores); const v = Object.fromEntries(c.items.map((i) => [i.id, i.verdict]));
  assert.equal(v['glitter-mask'], 'skip'); assert.equal(v['aha-peel'], 'conflict'); assert.equal(v['ha-serum'], 'keep'); assert.equal(c.saved, 6 + 15);
});
