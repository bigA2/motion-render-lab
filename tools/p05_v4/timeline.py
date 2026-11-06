# SFX timeline QA image: 6 fps frames of the final video, 8 per row, with the SFX-only waveform under each row and a labelled
# marker for every sound at its exact time (keys drawn as short ticks). Lets you check that each marker sits on its visual.
# Usage: python timeline.py video.mp4 sfx_only.wav sfx_report.json out.jpg. MIT, our own code.
import json, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont
v, wv, rp, out = sys.argv[1:5]
ev = json.load(open(rp))['events']; COLS, FPS6, CW = 8, 6, 240
pr = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height', '-select_streams', 'v', '-of', 'csv=p=0', v], capture_output=True, text=True).stdout.strip().split(',')
W, H = int(pr[0]), int(pr[1]); CH = int(CW * H / W) // 2 * 2
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', v, '-vf', f'fps={FPS6},scale={CW}:{CH}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, CH, CW, 3)
with wave.open(wv) as w: sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), '<i2').reshape(-1, w.getnchannels()).mean(1) / 32768
rows = (len(fr) + COLS - 1) // COLS; WH, LH = 70, 64; RH = CH + WH + LH
img = Image.new('RGB', (COLS * CW, rows * RH), (14, 16, 22)); dr = ImageDraw.Draw(img)
try: font = ImageFont.truetype('DejaVuSans.ttf', 11)
except Exception: font = ImageFont.load_default()
col = {'impact': (255, 80, 80), 'whoosh': (120, 200, 255), 'pop': (255, 210, 90), 'tick': (255, 170, 60), 'click': (255, 255, 255), 'swipe': (190, 140, 255), 'chime': (90, 255, 160), 'riser': (255, 120, 220), 'key': (130, 140, 150)}
sec_per_row = COLS / FPS6
for r in range(rows):
    y0 = r * RH
    for c in range(COLS):
        i = r * COLS + c
        if i < len(fr): img.paste(Image.fromarray(fr[i]), (c * CW, y0)); dr.text((c * CW + 4, y0 + 3), f'{i / FPS6:.2f}s', fill=(255, 255, 255), font=font)
    t0 = r * sec_per_row; s0, s1 = int(t0 * sr), int((t0 + sec_per_row) * sr); seg = a[s0:s1]
    if len(seg):
        k = max(1, len(seg) // (COLS * CW)); env = np.abs(seg[: len(seg) // k * k]).reshape(-1, k).max(1)
        for x, e in enumerate(env[: COLS * CW]): hh = int(min(1, e * 1.6) * (WH / 2 - 2)); dr.line([(x, y0 + CH + WH / 2 - hh), (x, y0 + CH + WH / 2 + hh)], fill=(80, 150, 230))
    lane = 0
    for e in ev:
        t = e['t']
        if not (t0 <= t < t0 + sec_per_row): continue
        x = int((t - t0) / sec_per_row * COLS * CW); cc = col.get(e['kind'], (200, 200, 200))
        if e['kind'] == 'key': dr.line([(x, y0 + CH + WH - 12), (x, y0 + CH + WH)], fill=cc, width=1); continue
        dr.line([(x, y0), (x, y0 + CH + WH)], fill=cc, width=2)
        ly = y0 + CH + WH + 4 + (lane % 3) * 19; lane += 1
        dr.text((x + 3, ly), f"{t:.2f} {e['kind']}:{e['snd']}", fill=cc, font=font)
img.convert('RGB').save(out, quality=82); print('timeline', out, img.size)
