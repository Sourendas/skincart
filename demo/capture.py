# Captures UI screenshots. Run with the app up (PORT=3111). With a real key and a license-free sample image, drop YOUCAM_MOCK.
import sys; from playwright.sync_api import sync_playwright
out=sys.argv[1] if len(sys.argv)>1 else "screenshots"
with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path="/usr/bin/google-chrome",headless=True,args=["--no-sandbox"])
    p=b.new_page(viewport={"width":1280,"height":800}); p.goto("http://localhost:3111"); p.wait_for_selector("#cart input")
    p.screenshot(path=f"{out}/01_home.png")
    p.fill("#url","https://example.com/sample-face.jpg"); p.check("#consent"); p.screenshot(path=f"{out}/02_ready.png")
    p.click("#go"); p.wait_for_selector("#out:not([hidden])"); p.wait_for_timeout(500)
    p.screenshot(path=f"{out}/03_report.png",full_page=True)
    p.evaluate("document.querySelector('#cartout').scrollIntoView()"); p.screenshot(path=f"{out}/04_cart.png")
    p.evaluate("document.querySelector('#am').scrollIntoView()"); p.screenshot(path=f"{out}/05_routine.png")
    b.close()
