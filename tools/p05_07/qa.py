# QA for a render: 4 fps contact sheets with the SFX events of each 0.25 s under every thumbnail, 1 fps half-size
# stills, waveform with event marks, loudness. Usage: python qa.py video.mp4 sfx_report.json outdir label [t0 t1]
import json, os, subprocess, sys, glob
import numpy as np
from PIL import Image, ImageDraw, ImageFont
vid, rep, out, label = sys.argv[1:5]
t0 = float(sys.argv[5]) if len(sys.argv) > 5 else 0.0; t1 = float(sys.argv[6]) if len(sys.argv) > 6 else 1e9
os.makedirs(out, exist_ok=True); tmp = out + '/_f'; os.makedirs(tmp, exist_ok=True)
subprocess.run(['ffmpeg', '-v', 'error', '-i', vid, '-vf', 'fps=4,scale=300:-2', f'{tmp}/%04d.png'], check=True)
R = json.load(open(rep)); ev = [e for e in R['events'] if t0 <= e['t'] < t1]
try: fnt = ImageFont.truetype('DejaVuSans.ttf', 15); big = ImageFont.truetype('DejaVuSans-Bold.ttf', 18)
except Exception: fnt = big = ImageFont.load_default()
fr = sorted(glob.glob(tmp + '/*.png')); cols, rows = 6, 4; per = cols * rows
for si in range(0, len(fr), per):
    ims = [Image.open(p).convert('RGB') for p in fr[si:si + per]]
    tw, th = ims[0].size; cell = th + 64
    sheet = Image.new('RGB', (cols * (tw + 8) + 8, rows * cell + 8), (24, 24, 30)); d = ImageDraw.Draw(sheet)
    for i, im in enumerate(ims):
        x, y = 8 + (i % cols) * (tw + 8), 8 + (i // cols) * cell
        sheet.paste(im, (x, y)); t = (si + i) / 4 + t0
        d.text((x + 4, y + th + 2), f'{t:5.2f}s', fill=(255, 255, 255), font=big)
        ks = [e['kind'] for e in ev if t - 0.125 <= e['t'] < t + 0.125]
        txt = ' '.join(sorted(set(ks), key=ks.index)) + (f' ({len(ks)})' if len(ks) > 2 else '')
        d.text((x + 4, y + th + 24), txt[:42], fill=(255, 210, 90), font=fnt)
    sheet.save(f'{out}/{label}_sheet_{si // per:02d}.jpg', quality=82)
# 1 fps half-size stills for readability checks
subprocess.run(['ffmpeg', '-v', 'error', '-i', vid, '-vf', 'fps=1,scale=540:-2', '-q:v', '4', f'{out}/{label}_still_%02d.jpg'], check=True)
# waveform (from the video's audio) with event ticks
raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', vid, '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], capture_output=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
if len(a):
    W, H = 2400, 360; n = len(a) // W; env = np.abs(a[: n * W]).reshape(W, n).max(1)
    img = Image.new('RGB', (W, H + 40), (20, 20, 26)); d = ImageDraw.Draw(img)
    for x in range(W): v = env[x] * H / 2; d.line([(x, H / 2 - v), (x, H / 2 + v)], fill=(120, 170, 255))
    dur = len(a) / 8000; col = {'key': (255, 255, 255), 'space': (200, 200, 200), 'whoosh': (90, 220, 160), 'impact': (255, 80, 80), 'chime': (255, 200, 60), 'tick': (180, 120, 255)}
    for e in ev:
        x = (e['t'] - t0) / dur * W; d.line([(x, H), (x, H + 14)], fill=col.get(e['kind'], (255, 140, 60)))
    for s in range(int(dur) + 1): d.text((s / dur * W + 2, H + 18), f'{s + t0:.1f}s', fill=(200, 200, 200), font=fnt)
    img.save(f'{out}/{label}_wave.png')
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', vid, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
open(f'{out}/{label}_loudness.txt', 'w').write('\n'.join(r.splitlines()[-12:]))
subprocess.run(['rm', '-rf', tmp]); print('qa', label, len(fr), 'frames')
