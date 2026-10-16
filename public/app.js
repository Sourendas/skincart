const $ = (s) => document.querySelector(s); let imageData = null;
const DEFAULT_CART = ['glitter-mask', 'retinol', 'aha-peel', 'ha-serum'];
fetch('/api/catalog').then((r) => r.json()).then(({ catalog }) => {
  $('#cart').innerHTML = catalog.map((p) => `<label><input type="checkbox" value="${p.id}" ${DEFAULT_CART.includes(p.id) ? 'checked' : ''}> ${p.name} <small>$${p.price}</small></label>`).join('');
});
const ready = () => { $('#go').disabled = !($('#consent').checked && (imageData || $('#url').value.startsWith('https://')) || $('#mockok')?.value); };
$('#file').onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { imageData = r.result; $('#preview').src = r.result; $('#preview').hidden = false; ready(); }; r.readAsDataURL(f); };
const SAMPLE = 'https://upload.wikimedia.org/wikipedia/commons/1/1c/This_Person_Does_Not_Exist_example.jpg';
$('#sample').onclick = () => { imageData = null; $('#url').value = SAMPLE; $('#preview').src = SAMPLE; $('#preview').hidden = false; $('#consent').checked = true; ready(); };
$('#url').oninput = ready; $('#consent').onchange = ready;
const color = (v) => (v >= 75 ? 'var(--ok)' : v >= 60 ? 'var(--warn)' : 'var(--bad)');
const LABEL = { acne: 'Acne', moisture: 'Hydration', oiliness: 'Oil control', pore: 'Pores', redness: 'Redness', texture: 'Texture', wrinkle: 'Fine lines', dark_circle_v2: 'Dark circles', radiance: 'Radiance', firmness: 'Firmness' };
$('#go').onclick = async () => {
  $('#go').disabled = true; $('#status').textContent = 'Uploading to YouCam and analyzing… (10–30 s)';
  const cart = [...document.querySelectorAll('#cart input:checked')].map((i) => i.value);
  const body = { cart, budget: $('#budget').value }; if (imageData) body.image = imageData; else body.imageUrl = $('#url').value;
  try {
    const r = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json(); if (!r.ok) throw new Error(d.error || r.status);
    render(d); $('#status').textContent = '';
  } catch (e) { $('#status').textContent = 'Error: ' + e.message; }
  $('#go').disabled = false;
};
function render(d) {
  if (d.mock) { $('#banner').hidden = false; $('#banner').textContent = 'MOCK MODE: these scores are placeholder data, not real YouCam output.'; }
  $('#out').hidden = false; $('#overall').textContent = d.overall != null ? `overall ${Math.round(d.overall)}/100 (higher = healthier)${d.skinAge ? ' · skin age ' + Math.round(d.skinAge) : ''}` : '';
  $('#overlay').hidden = !d.baseImage; if (d.baseImage) { $('#base').src = d.baseImage; $('#mask').src = ''; }
  $('#bars').innerHTML = Object.entries(d.scores).sort((a, b) => a[1].ui - b[1].ui).map(([k, v]) => `<div class="row" data-mask="${v.mask || ''}" style="cursor:pointer"><label>${LABEL[k] || k}</label><div class="bar"><i style="width:${v.ui}%;background:${color(v.ui)}"></i></div><b>${v.ui}</b></div>`).join('');
  $('#cartout').innerHTML = d.cart ? d.cart.items.map((i) => `<div class="item"><div><b>${i.name}</b> · $${i.price}<br><small>${i.reason}</small></div><span class="tag ${i.verdict}">${i.verdict.toUpperCase()}</span></div>`).join('') : '';
  $('#saved').textContent = d.cart && d.cart.saved ? `Skipping or re-timing flagged items saves $${d.cart.saved}.` : '';
  const li = (p) => `<li>${p.name} <small>${p.why}</small></li>`;
  $('#am').innerHTML = d.routine.am.map(li).join(''); $('#pm').innerHTML = d.routine.pm.map(li).join('');
  $('#unc').textContent = d.routine.uncovered.length ? 'Not covered by the catalog: ' + d.routine.uncovered.map((n) => n.label).join(', ') + ' (consider a dermatologist).' : `Routine total $${d.routine.spent}.`;
}

document.addEventListener('click', (e) => { const r = e.target.closest('.row[data-mask]'); if (r && r.dataset.mask) { $('#mask').src = r.dataset.mask; $('#masklabel').textContent = r.querySelector('label').textContent + ' detection overlay (from YouCam)'; } });
