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
# ---- Wave 1 product-UI set (numpy, own seeded RNG so the sounds above never shift) ----
R = np.random.default_rng(2610)
def edge(x, ms=6):  # raised-cosine fade in/out: no DC click at either end (one-shots only)
    x = np.asarray(x, float).copy(); k = int(ms * SR / 1000); w = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, k))
    x[:k] *= w; x[-k:] *= w[::-1]; return x
def nband(n, lo, hi):  # white noise band-limited in the FFT domain (periodic over n samples)
    S = np.fft.rfft(R.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR); S[(f < lo) | (f > hi)] = 0
    y = np.fft.irfft(S, n); return y / (np.abs(y).max() or 1)
def tick(f, tau, n_ms=40, noise=0.5, lo=2000, hi=12000):  # resonant click: decaying sine + noise transient
    n = int(n_ms * SR / 1000); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * np.exp(-t / tau) + nband(n, lo, hi) * np.exp(-t / 0.0012) * noise
def thump(f0, n_ms=60, tau=0.012):  # low body under a click (pitch drops 40%)
    n = int(n_ms * SR / 1000); t = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(f0 * (0.6 + 0.4 * np.exp(-t / 0.01))) / SR
    return np.sin(ph) * np.exp(-t / tau) * np.minimum(1, t / 0.0005)
def put(y, x, s, g=1.0, wrap=False):  # add x into y at sample s (mod len(y) for loops)
    idx = np.arange(s, s + len(x)); idx = idx % len(y) if wrap else idx[idx < len(y)]; np.add.at(y, idx, np.asarray(x)[: len(idx)] * g)
def loop_cut(y):  # rotate a periodic buffer so the seam is the smallest-step zero crossing in its quietest 10%
    w = int(0.02 * SR); e = np.convolve(np.abs(y), np.ones(w) / w, 'same')
    z = np.where(np.signbit(y[:-1]) != np.signbit(y[1:]))[0]; z = z[e[z] <= np.percentile(e, 10)]
    return np.roll(y, -int(z[np.argmin(np.abs(y[z + 1] - y[z]))] + 1))
# THINKING / PLAN: data loop = low hum bed + gated bursts of digital chatter; periodic by construction -> seamless loop
def data_loop(L, density):
    n = int(L * SR); t = np.arange(n) / SR; q = lambda f: round(f * L) / L  # every freq a multiple of 1/L
    bed = sum(a * np.sin(2 * np.pi * q(f) * t) for f, a in ((55, 1.0), (110, 0.45), (165, 0.2), (220, 0.08)))
    bed *= 0.8 + 0.2 * np.sin(2 * np.pi * q(6) * t)  # slow pulse
    y = bed * 0.35 + nband(n, 60, 400) * 0.05
    hiss = nband(n, 6000, 14000); gate = (np.sin(2 * np.pi * q(1.5) * t + 1.3) > 0.2).astype(float)
    gate = np.convolve(np.concatenate([gate[-480:], gate]), np.ones(480) / 480, 'valid')[: n]  # 10 ms soft gate
    y += hiss * gate * 0.06
    tt = 0.0
    while tt < L:  # chatter: short bright square-ish blips in clusters
        f = R.choice((2400, 3200, 4000, 4800, 6000, 7200)); m = int(R.uniform(0.012, 0.035) * SR); u = np.arange(m) / SR
        b = np.sign(np.sin(2 * np.pi * f * u)) * 0.5 + np.sin(2 * np.pi * f * u) * 0.5
        put(y, b * np.sin(np.pi * np.arange(m) / m) ** 2 * R.uniform(0.08, 0.18), int(tt * SR), wrap=True)
        tt += R.uniform(0.03, 0.09) / density if R.random() > 0.15 else R.uniform(0.15, 0.3)
    return loop_cut(y)
for L, d in ((1.0, 1.4), (2.0, 1.0), (3.0, 0.8)): save(f'data_loop_{L}s', data_loop(L, d))
# TYPING: stutter clicks = sparse groups of rapid low-heavy clicks with a bright edge
def stutter(dur, busy):
    y = np.zeros(int((dur + 0.08) * SR)); tt = 0.01
    while tt < dur:
        for _ in range(R.integers(2, 6)):
            c = thump(R.uniform(90, 140), 50, 0.008) * 0.9 + tick(R.uniform(2600, 4800), 0.002, 50, 0.7) * 0.45
            put(y, c * R.uniform(0.6, 1.0), int(tt * SR)); tt += R.uniform(0.012, 0.03)
        tt += R.uniform(0.08, 0.22) / busy
    return edge(y)
for name, d, b in (('short', 0.6, 1.2), ('long', 1.5, 1.0)): save(f'stutter_clicks_{name}', stutter(d, b))
# RUN + ROWS: charge (rising tone + air) with clicks that accelerate and brighten, ends on a bright data hit
def charge_data(dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = t / dur
    ph = 2 * np.pi * np.cumsum(180 * 6.0 ** x) / SR
    y = (np.sin(ph) + 0.3 * np.sin(2 * ph)) * x ** 1.8 * 0.25 + nband(n, 3000, 12000) * x ** 3 * 0.12
    tt = 0.03
    while tt < dur - 0.02:
        p = tt / dur; put(y, thump(110 + 60 * p, 40, 0.006) * 0.6 + tick(2500 + 5000 * p, 0.0025, 40, 0.6) * (0.3 + 0.4 * p), int(tt * SR))
        tt += 0.12 * (0.015 / 0.12) ** p  # 120 ms gaps tightening to 15 ms
    tail = np.zeros(int(0.18 * SR)); u = 0
    for f in (6000, 7200, 4800, 8000, 6000):  # bright data burst on the hit
        m = int(0.02 * SR); put(tail, np.sin(2 * np.pi * f * np.arange(m) / SR) * np.sin(np.pi * np.arange(m) / m) * 0.35, u); u += int(0.025 * SR)
    put(tail, tick(7000, 0.004, 60, 0.8) * 0.8, 0)
    return edge(np.concatenate([y, tail]))
for d in (0.8, 1.5): save(f'charge_data_{d}s', charge_data(d))
# PLAN -> NODES: mechanical click one-shots = bright ~8 kHz tick + low thunk (relay / latch)
MECH = [((8200,), 1500, 0.04), ((7600, 8800), 1200, 0.035), ((8000, 8400, 9000), 1800, 0.03), ((7000,), 1000, 0.05)]
for i, (ticks, tf, gap) in enumerate(MECH):
    y = np.zeros(int(0.32 * SR)); s = 0
    for f in ticks: put(y, tick(f, 0.0015, 25, 0.9, 5000, 14000), s); s += int(0.018 * SR)
    put(y, tick(tf, 0.006, 70, 0.4, 800, 3000) * 0.8 + thump(130, 70, 0.012) * 0.7, s + int(gap * SR))
    save(f'mechanical_click_{i+1}', edge(y))
print(len(os.listdir(OUT)), 'procedural sounds')
