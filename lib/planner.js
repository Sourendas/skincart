// Turns YouCam skin scores into a routine + a pre-purchase cart check. Pure functions, unit-tested.
// Catalog is fictional/generic (ingredient-based) so no third-party trademarks are used.
const CONCERN_LABEL = {
  acne: 'Acne', moisture: 'Hydration', oiliness: 'Oil control', pore: 'Pores', redness: 'Redness',
  texture: 'Texture', wrinkle: 'Fine lines', dark_circle_v2: 'Dark circles', radiance: 'Radiance', firmness: 'Firmness',
};
const NEED_BELOW = 75; // ui_score below this = worth acting on (higher ui_score = healthier)

const CATALOG = [
  { id: 'gel-cleanser', name: 'Gentle gel cleanser', price: 9, slot: 'both', targets: ['oiliness', 'acne'], actives: [] },
  { id: 'cream-cleanser', name: 'Creamy hydrating cleanser', price: 10, slot: 'both', targets: ['moisture'], actives: [] },
  { id: 'sal-serum', name: '2% salicylic acid serum', price: 14, slot: 'pm', targets: ['acne', 'pore', 'oiliness', 'texture'], actives: ['bha'] },
  { id: 'niacin-serum', name: '5% niacinamide serum', price: 12, slot: 'am', targets: ['oiliness', 'pore', 'redness', 'texture'], actives: [] },
  { id: 'ha-serum', name: 'Hyaluronic acid serum', price: 11, slot: 'am', targets: ['moisture', 'wrinkle', 'radiance'], actives: [] },
  { id: 'vitc-serum', name: '10% vitamin C serum', price: 18, slot: 'am', targets: ['radiance', 'dark_circle_v2', 'wrinkle'], actives: ['vitc'] },
  { id: 'retinol', name: '0.3% retinol night cream', price: 20, slot: 'pm', targets: ['wrinkle', 'texture', 'firmness', 'acne'], actives: ['retinoid'] },
  { id: 'aha-peel', name: 'Glycolic acid exfoliating toner', price: 15, slot: 'pm', targets: ['texture', 'radiance', 'pore'], actives: ['aha'] },
  { id: 'peptide', name: 'Peptide firming cream', price: 24, slot: 'pm', targets: ['firmness', 'wrinkle'], actives: [] },
  { id: 'centella', name: 'Centella soothing gel', price: 13, slot: 'both', targets: ['redness', 'acne'], actives: [] },
  { id: 'caffeine-eye', name: 'Caffeine eye serum', price: 16, slot: 'both', targets: ['dark_circle_v2'], actives: [] },
  { id: 'gel-moist', name: 'Oil-free gel moisturiser', price: 12, slot: 'both', targets: ['oiliness', 'moisture'], actives: [] },
  { id: 'rich-moist', name: 'Ceramide barrier cream', price: 17, slot: 'both', targets: ['moisture', 'redness'], actives: [] },
  { id: 'spf', name: 'SPF 50 lightweight sunscreen', price: 12, slot: 'am', targets: ['wrinkle', 'dark_circle_v2', 'radiance', 'firmness'], actives: [] , essential: true},
  { id: 'clay-mask', name: 'Kaolin clay mask', price: 11, slot: 'pm', targets: ['oiliness', 'pore'], actives: [] },
  { id: 'glitter-mask', name: 'Shimmer sheet mask (fragrance)', price: 6, slot: 'pm', targets: [], actives: [] },
];
// Actives that should not be stacked in the same routine slot/night.
const CONFLICTS = [['retinoid', 'aha'], ['retinoid', 'bha'], ['aha', 'bha'], ['vitc', 'retinoid']];

function needs(scores, threshold = NEED_BELOW) {
  return Object.entries(scores)
    .filter(([, v]) => v.ui < threshold)
    .map(([k, v]) => ({ concern: k, label: CONCERN_LABEL[k] || k, ui: v.ui, severity: Math.round(threshold - v.ui) }))
    .sort((a, b) => b.severity - a.severity);
}

function conflictBetween(a, b) {
  for (const x of a.actives) for (const y of b.actives)
    if (CONFLICTS.some(([p, q]) => (p === x && q === y) || (p === y && q === x))) return [x, y];
  return null;
}

function value(product, needList) {
  let v = 0;
  for (const n of needList) if (product.targets.includes(n.concern)) v += n.severity;
  return v;
}

// Greedy: best value-per-dollar product that covers an unmet need and conflicts with nothing already chosen.
function buildRoutine(scores, { budget = 60 } = {}) {
  const needList = needs(scores);
  const chosen = []; let spent = 0; const covered = new Set();
  const pool = CATALOG.filter((p) => p.targets.length);
  const base = pool.find((p) => p.essential); // sunscreen always
  const add = (p, why) => { chosen.push({ ...p, why }); spent += p.price; p.targets.forEach((t) => needList.some((n) => n.concern === t) && covered.add(t)); };
  if (base) add(base, 'Daily sun protection protects every other result.');
  for (;;) {
    const cands = pool
      .filter((p) => !chosen.some((c) => c.id === p.id) && spent + p.price <= budget)
      .filter((p) => !chosen.some((c) => conflictBetween(c, p)))
      .map((p) => ({ p, gain: needList.filter((n) => p.targets.includes(n.concern) && !covered.has(n.concern)).reduce((s, n) => s + n.severity, 0) }))
      .filter((x) => x.gain > 0)
      .sort((a, b) => b.gain / b.p.price - a.gain / a.p.price);
    if (!cands.length) break;
    const { p } = cands[0];
    const hit = needList.filter((n) => p.targets.includes(n.concern) && !covered.has(n.concern)).map((n) => `${n.label} (${n.ui})`);
    add(p, `Targets ${hit.join(', ')}.`);
  }
  const am = chosen.filter((p) => p.slot !== 'pm'), pm = chosen.filter((p) => p.slot !== 'am');
  const uncovered = needList.filter((n) => !covered.has(n.concern));
  return { needs: needList, products: chosen, am, pm, spent, uncovered };
}

// "Should I buy this?" — the moment before purchase.
function cartCheck(cartIds, scores) {
  const needList = needs(scores);
  const items = cartIds.map((id) => CATALOG.find((p) => p.id === id)).filter(Boolean);
  const out = items.map((p, i) => {
    const hits = needList.filter((n) => p.targets.includes(n.concern));
    const clash = items.slice(0, i).map((o) => ({ o, c: conflictBetween(o, p) })).find((x) => x.c);
    if (clash) return { id: p.id, name: p.name, price: p.price, verdict: 'conflict', reason: `${clash.c[0].toUpperCase()} + ${clash.c[1].toUpperCase()} clash with ${clash.o.name}; use on different nights or pick one.` };
    if (hits.length) return { id: p.id, name: p.name, price: p.price, verdict: 'keep', reason: `Matches ${hits.map((h) => `${h.label} (${h.ui})`).join(', ')}.` };
    if (p.essential) return { id: p.id, name: p.name, price: p.price, verdict: 'keep', reason: 'Daily essential.' };
    return { id: p.id, name: p.name, price: p.price, verdict: 'skip', reason: 'Does not address any concern found in this analysis.' };
  });
  const saved = out.filter((x) => x.verdict !== 'keep').reduce((s, x) => s + x.price, 0);
  return { items: out, saved };
}

module.exports = { CATALOG, CONCERN_LABEL, NEED_BELOW, needs, buildRoutine, cartCheck, conflictBetween };
