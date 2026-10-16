# DEVPOST DRAFT — SkinCart (live-API verified 2026-10-16; hosted URL still pending, see Links)

**Tagline:** Check your skin before you check out.

**Topic:** Skin AI (with an eCommerce angle)

## Inspiration
People think about their skin right before a purchase, and carts fill with trendy products that do nothing for their actual concerns, or that clash (retinol + glycolic acid). We wanted the skin analysis to happen at that moment.

## What it does
1. You provide a front-facing photo (upload or public URL) and confirm you have the rights to it.
2. SkinCart calls the **YouCam Skin Analysis API** for 10 concerns: acne, hydration, oil, pores, redness, texture, fine lines, dark circles, radiance, firmness.
3. **Cart check:** every item in your cart is marked KEEP (matches a weak score), SKIP (addresses nothing found), or CONFLICT (actives that shouldn't be stacked), with dollars saved.
4. **Routine builder:** a morning/evening routine built greedily from the weakest scores, inside your budget, always with sunscreen, never stacking clashing actives.

## How we built it
Zero-dependency Node (>=18) app: static UI + serverless functions (Vercel). `lib/youcam.js` uses the File API (pre-signed upload) then Skin Analysis v2.1 `format=json`, polls the task, and normalizes `results.output[]`. The API key stays server-side. `lib/planner.js` is a pure, unit-tested rules engine (concern severity → product value per dollar, with an active-ingredient conflict matrix).

## YouCam API used
AI Skin Analysis (File API `/s2s/v2.0/file/skin-analysis`, task `/s2s/v2.1/task/skin-analysis`).

## Challenges
Asynchronous task polling, SD/HD concern mixing rules, and keeping personal photos out of storage.

## Accomplishments
A complete flow from score to a purchase decision, not just a score display; planner covered by unit tests.

## What we learned
Scores need a decision layer: the value is in what the user does next.

## What's next
Add Virtual Try-On (makeup/clothing APIs) to the SKIP/KEEP flow, retailer catalog connectors, and an agentic loop that re-scans weekly.

## Significant update during the Submission Period
New project, built entirely after the Submission Period opened (Sep 29, 2026).

## Built with
Node.js, Vercel, YouCam API (Skin Analysis), HTML/CSS/JS.

## Links
Repo: https://github.com/Sourendas/skincart (public, MIT) · Live demo URL: **PENDING** (free Vercel deploy blocked by connector 403; run locally with `node dev.js` + YOUCAM_API_KEY, instructions in README; alternative: Souren imports the repo at vercel.com/new and sets YOUCAM_API_KEY) · Video: local file demo/skincart_demo_voice.mp4 (2:09, voiced), upload to YouTube then paste link · Screenshots: screenshots/ (live YouCam run, no mock banner; PNGs are local, upload them to Devpost directly).
Test image used: public-domain StyleGAN2 synthetic face (Wikimedia Commons, "This Person Does Not Exist example.jpg"); no real person's photo.
Social bonus (optional, +500 units): post video tagging @YouCam API with "Received API credits for sharing".
