// MOCK payload shaped like the documented format=json response (docs.perfectcorp.com). Used ONLY when YOUCAM_MOCK=1,
// and the UI labels it clearly. It is NOT real YouCam output.
module.exports = function mock() {
  const t = { acne: 62, moisture: 58, oiliness: 66, pore: 71, redness: 80, texture: 69, wrinkle: 78, dark_circle_v2: 64, radiance: 74, firmness: 84 };
  return { output: [{ type: 'skin_all', score: 70.4 }, ...Object.entries(t).map(([type, ui]) => ({ type, region: 'whole', ui_score: ui, raw_score: ui - 6, mask_urls: [] }))] };
};
