# SkinCart demo — voiced script (target 2:15, edge-tts `en-US-AndrewNeural`, -16 LUFS, no music)

STATUS: script only. The final video must be recorded with a LIVE YouCam API key and a license-free sample image; do not use mock mode on camera.
Capture: run `YOUCAM_API_KEY=… node dev.js`, then `demo/capture.py` (and a screen recording of the live run). Reuse /workspace/demo-build/voice.py + builder.py.

| # | Frame | Narration |
|---|---|---|
| 1 | cover.png | This is SkinCart. It checks your skin before you check out, using the YouCam Skin Analysis API. |
| 2 | problem slide | People buy skincare right before a purchase, with no idea what their skin actually needs. They add trendy products to the cart, and sometimes combine actives that clash. |
| 3 | 01_home | Here is the web app. It runs in any browser. We choose a license-free sample photo, no real person's photo, and confirm we have the right to use it. |
| 4 | 02_ready | The cart already holds four items: a hyaluronic serum, a retinol cream, a glycolic toner, and a shimmer sheet mask. We click Analyze. |
| 5 | terminal/network | Behind the button, our server calls the YouCam API. First the file API, to get an upload URL. Then Skin Analysis version 2.1, asking for ten skin concerns, and we poll the task until it succeeds. The API key never reaches the browser. |
| 6 | 03_report | The YouCam scores come back. Each bar is a real score from the API, from one to one hundred, where higher is healthier. Here hydration and acne are the weakest. |
| 7 | 04_cart | Now the cart check. The hyaluronic serum matches hydration, so keep. The retinol matches acne and texture, so keep. The glycolic toner clashes with retinol, so we flag a conflict. The shimmer mask addresses nothing in this analysis, so skip. That saves twenty-one dollars. |
| 8 | 05_routine | Then SkinCart builds a morning and evening routine from the weakest scores, inside the budget, with sun protection always included, and never stacking clashing actives. |
| 9 | closing | SkinCart turns a skin score into a smarter purchase. It is built on the YouCam Skin Analysis API, with the planner open source and unit tested. Thanks for watching. |
