"""Screen-record one clip from a public page (frame-accurate, cropped to the clip). usage: record_one.py <page_url> <out.mp4>"""
import subprocess, sys
from playwright.sync_api import sync_playwright
URL, OUT, FPS, LONG = sys.argv[1], sys.argv[2], 30, 1280
FILL = """() => { const v = document.querySelector('video'); v.muted = true; v.loop = false; v.pause();
  v.removeAttribute('controls'); v.removeAttribute('autoplay');
  Object.assign(v.style, {position:'fixed', left:'0', top:'0', width:'100vw', height:'100vh', objectFit:'contain',
    background:'#000', zIndex:'2147483647', maxWidth:'none', maxHeight:'none', borderRadius:'0', margin:'0', aspectRatio:'auto'});
  document.documentElement.style.overflow = 'hidden'; return [v.videoWidth, v.videoHeight, v.duration]; }"""
SEEK = """t => new Promise(res => { const v = document.querySelector('video');
  if (Math.abs(v.currentTime - t) < 1e-4 && v.readyState >= 2) return res(true);
  v.addEventListener('seeked', () => res(true), {once: true}); v.currentTime = t; })"""
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    page = b.new_page(viewport={"width": 1280, "height": 720})
    page.goto(URL, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_selector("video", state="attached", timeout=30000)
    page.evaluate("() => { const v = document.querySelector('video'); v.preload = 'auto'; v.muted = true; v.load(); }")
    page.wait_for_function("() => { const v = document.querySelector('video'); return v.readyState >= 1 && v.duration > 0; }", timeout=90000)
    vw, vh, dur = page.evaluate(FILL)
    k = min(1.0, LONG / max(vw, vh)); w, h = int(vw * k) // 2 * 2, int(vh * k) // 2 * 2
    page.set_viewport_size({"width": w, "height": h})
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-c:v", "mjpeg", "-r", str(FPS), "-i", "-",
                           "-vf", f"scale={w}:{h}", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", OUT], stdin=subprocess.PIPE)
    n = max(1, int(dur * FPS))
    for i in range(n):
        page.evaluate(SEEK, i / FPS)
        ff.stdin.write(page.screenshot(type="jpeg", quality=90))
        if i % 900 == 0: print(f"{i}/{n}", flush=True)
    ff.stdin.close(); assert ff.wait() == 0
    print("OK", OUT, f"{dur:.1f}s {w}x{h} {n} frames")
