# SkinCart — check your skin before you check out

Web prototype for the **YouCam API Skin AI & eCommerce VTO Hackathon**. Uses the **YouCam Skin Analysis API** (v2.0 File API + v2.1 task, `format=json`, 10 SD concerns).

Flow: sample/own photo → YouCam Skin Analysis → per-concern scores → **cart check** (keep / skip / conflicting actives) → AM/PM routine within a budget.

## Run
```
cp .env.example .env     # add YOUCAM_API_KEY (from https://yce.perfectcorp.com/ai-api console)
node dev.js              # http://localhost:3000   (Node >= 18, zero dependencies)
npm test
```
Deploy free on Vercel: import the repo, set env `YOUCAM_API_KEY`. `api/` functions are serverless; `public/` is static.

`YOUCAM_MOCK=1` serves clearly-labelled placeholder scores for UI development only (banner shown). It is not YouCam output.

## Layout
`lib/youcam.js` API client · `lib/planner.js` routine + cart rules (pure, tested) · `lib/analyze.js` orchestration · `api/` Vercel functions · `public/` UI.

## Notes
Photos go only to the YouCam API for analysis; nothing is stored. Catalog is fictional and generic. Cosmetic guidance, not medical advice. MIT license.
