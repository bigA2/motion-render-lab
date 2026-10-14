# Procedural SFX (code-made, zero licence risk), named by the on-screen event they serve.
import math, random, os, numpy as np, soundfile as sf, sys
sys.path.insert(0, os.getcwd())
from sfx_engine.synth import SR, click, key, blip, pop, chime, whoosh, riser, impact
OUT = 'public/sfx/proc'; os.makedirs(OUT, exist_ok=True)
def save(name, x, peak_db=-3.0):
    a = np.asarray(x, dtype=np.float32); m = np.abs(a).max() or 1
    sf.write(f'{OUT}/{name}.ogg', a / m * 10 ** (peak_db / 20), SR, format='OGG', subtype='VORBIS')
def mix(*parts):
    n = max(len(p) + int(o * SR) for p, o, g in parts); y = np.zeros(n)
    for p, o, g in parts: s = int(o * SR); y[s:s + len(p)] += np.asarray(p) * g
    return y
def ring(dur, f0, f1, ratios=(1, 2.76, 5.4, 8.93), tau=None):
    n = int(dur * SR); t = np.arange(n) / SR; f = f0 * (f1 / f0) ** (t / dur); ph = 2 * np.pi * np.cumsum(f) / SR
    env = (t / dur) ** 2.2
    return sum(np.sin(ph * r) / (i + 1) for i, r in enumerate(ratios)) * env
random.seed(7)
# HOOK: bass impact (sub thump + noise crack) — the ONE hit per video
for d in (0.8, 1.2, 1.8): save(f'hook_bass_impact_{d}s', impact(d))
# BUILD-UP: metallic riser (resonant inharmonic sweep + airy riser), ends exactly at the hit
for d in (0.8, 1.4, 2.2): save(f'buildup_metallic_riser_{d}s', mix((ring(d, 220, 1800), 0, 0.6), (riser(d, 300, 6000), 0, 0.5)))
# TRANSITION: camera flash (shutter double-click + bright burst tail)
for v in range(3): save(f'transition_camera_flash_{v+1}', mix((click(2600 + v * 300, 0.03), 0, 1), (click(1900 + v * 200, 0.04), 0.035, 0.8), (whoosh(0.22, 3000, 9000, 0.4), 0.01, 0.6)))
# TRANSITION: soft whoosh short/long (whips, crash-zooms)
for d in (0.25, 0.45, 0.7): save(f'transition_whoosh_{d}s', whoosh(d, 500, 4200, 0.55))
# TEXT: mouth pop (pitched, use rising pitch across a sequence)
for i, f in enumerate((520, 620, 740, 880)): save(f'text_mouth_pop_{i+1}', pop(f, f * 0.45, 0.09))
# TYPING: keyboard bursts
for d in (0.6, 1.2, 2.0):
    y = np.zeros(int(d * SR) + SR // 5); t = 0.0
    while t < d: k = np.asarray(key()); s = int(t * SR); y[s:s + len(k)] += k * random.uniform(0.6, 1.0); t += random.uniform(0.055, 0.12)
    save(f'typing_keyboard_{d}s', y, -6)
# UI: click, tick, node pop, success chime (C major), error blip
for i, f in enumerate((1500, 1800, 2200)): save(f'ui_click_{i+1}', click(f, 0.05))
for i, f in enumerate((2400, 3000)): save(f'ui_tick_{i+1}', blip(f, 0.08, 0.02))
for i, f in enumerate((523, 587, 659, 784, 880)): save(f'node_pop_{i+1}', pop(f * 1.5, f, 0.14))
save('success_chime_C', chime([523.25, 659.25, 783.99], 1.6))
save('success_chime_G', chime([392.0, 493.88, 587.33], 1.6))
# COUNTER: riser for number rolls
for d in (0.8, 1.5): save(f'counter_roll_riser_{d}s', riser(d, 400, 3000), -8)
print(len(os.listdir(OUT)), 'procedural sounds')
