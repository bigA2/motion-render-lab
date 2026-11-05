# Places sounds from the animation's event list (src/p05_07 dump) — sound cannot drift from picture.
# Levels/lengths follow src/p05_07/sound_map.md. Samples: Kenney CC0 (public/sfx/kenney); the rest is synthesised.
# Usage: python sfx_mix.py events.json outdir     -> outdir/{vo_sfx.wav, music_bed.wav, sfx_report.json}
import json, os, subprocess, sys
import numpy as np

SR = 48000
ev_path, outdir = sys.argv[1], sys.argv[2]
os.makedirs(outdir, exist_ok=True)
J = json.load(open(ev_path)); FPS = J['fps']; N = int(J['frames'] / FPS * SR) + SR
PUB = 'public'
rng = np.random.default_rng(7)

def load(rel, sr=SR):
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', os.path.join(PUB, rel), '-ac', '1', '-ar', str(sr), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()
_cache = {}
def S(name):
    if name not in _cache: _cache[name] = load('sfx/kenney/' + name)
    return _cache[name]
def db(x): return 10 ** (x / 20)
def norm(x, peak_db):
    m = np.abs(x).max() if len(x) else 0
    return x * (db(peak_db) / m) if m > 0 else x
def pitch(x, r):
    if abs(r - 1) < 1e-3: return x
    idx = np.arange(0, len(x) - 1, r); return np.interp(idx, np.arange(len(x)), x).astype(np.float32)
def env_exp(n, tau): return np.exp(-np.arange(n) / (tau * SR))
def tone(f0, f1, dur, tau):
    n = int(dur * SR); fr = np.geomspace(f0, f1, n); ph = 2 * np.pi * np.cumsum(fr) / SR
    return np.sin(ph) * env_exp(n, tau)
def bandnoise(n, lo, hi):
    X = np.fft.rfft(rng.standard_normal(n)); fr = np.fft.rfftfreq(n, 1 / SR)
    X[(fr < lo) | (fr > hi)] = 0; return np.fft.irfft(X, n)
def lowpass(x, fc):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (fr / fc) ** 4); return np.fft.irfft(X, len(x))
def whoosh(dur, lo=250, hi=3200, bright=False):
    n = max(int(dur * SR), 2400); t = np.linspace(0, 1, n)
    pk = 0.55; e = np.where(t < pk, (t / pk) ** 2.2, ((1 - t) / (1 - pk)) ** 1.6)
    # sweep: sum of 6 bands whose gains follow a moving centre frequency
    cs = np.geomspace(lo, hi * (1.6 if bright else 1), 6); out = np.zeros(n)
    centre = np.exp(np.interp(t, [0, pk, 1], np.log([lo * 1.5, hi * (1.3 if bright else 0.9), lo * 2])))
    for c in cs:
        band = bandnoise(n, c / 1.4, c * 1.4); g = np.exp(-(np.log(centre / c) ** 2) / 0.5); out += band * g
    return out * e

def make(e, i):
    k = e['kind']; g = e.get('gain', 0) or 0; p = e.get('pitch', 1) or 1; d = (e.get('dur') or 0) / FPS
    if k in ('key', 'space'):
        pool = ['ui-audio/switch12.ogg', 'ui-audio/switch13.ogg', 'ui-audio/switch14.ogg', 'ui-audio/click4.ogg', 'ui-audio/click5.ogg']
        s = pitch(S(pool[i % len(pool)]), p * (0.86 if k == 'space' else 1)); s = lowpass(s, 7000)
        body = tone(190 if k == 'key' else 140, 150, 0.03, 0.008) * 0.5
        s = np.pad(s, (0, max(0, len(body) - len(s)))); s[:len(body)] += body * np.abs(s).max()
        return norm(s, -24 + g + (1.5 if k == 'space' else 0))
    if k == 'enter':
        s = pitch(S('ui-audio/switch13.ogg'), 0.78); b = tone(130, 90, 0.08, 0.02)
        s = np.pad(s, (0, max(0, len(b) - len(s)))); s[:len(b)] += b * 0.6 * np.abs(s).max(); return norm(s, -19 + g)
    if k == 'click':
        a = S('ui-audio/mouseclick1.ogg'); r = S('ui-audio/mouserelease1.ogg'); off = int(0.07 * SR)
        s = np.zeros(off + len(r)); s[:len(a)] += a; s[off:off + len(r)] += r * 0.6; return norm(s, -20 + g)
    if k == 'pop':
        s = tone(900 * p, 300 * p, 0.07, 0.018); s[:60] += rng.standard_normal(60) * 0.3; return norm(s, -26 + g)
    if k == 'whoosh':
        return norm(whoosh(max(0.18, min(0.9, d or 0.4))), max(-30, min(-18, -24 + g)))
    if k == 'swipe':
        return norm(whoosh(max(0.15, min(0.6, d or 0.3)), 600, 6000, True), -24 + g)
    if k == 'land':
        s = lowpass(S('impact-sounds/impactSoft_medium_00%d.ogg' % (i % 5)), 900); return norm(s, -28 + g)
    if k == 'chime':
        n = int(0.6 * SR); t = np.arange(n) / SR
        bell = (np.sin(2 * np.pi * 1318.5 * t) * env_exp(n, 0.16) + 0.5 * np.sin(2 * np.pi * 1975.5 * t) * env_exp(n, 0.1) + 0.25 * np.sin(2 * np.pi * 2637 * t) * env_exp(n, 0.06))
        bell[:int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
        gl = S('interface-sounds/glass_001.ogg'); gl = np.pad(gl, (0, max(0, n - len(gl))))[:n]
        return norm(bell * 0.8 + gl / (np.abs(gl).max() + 1e-9) * 0.5, -20 + g)
    if k == 'tick':
        return norm(pitch(S('interface-sounds/tick_002.ogg'), p), -30 + g)
    if k == 'data':
        n = int(max(0.1, d) * SR); out = np.zeros(n); step = int(0.03 * SR)
        for s0 in range(0, n - 400, step):
            if rng.random() < 0.55:
                L = int(rng.uniform(0.004, 0.012) * SR); fr = rng.choice([2200, 2800, 3500, 4400, 5200])
                tt = np.arange(L) / SR; out[s0:s0 + L] += np.sign(np.sin(2 * np.pi * fr * tt)) * env_exp(L, 0.004) * rng.uniform(0.4, 1)
        fade = np.minimum(1, np.minimum(np.arange(n), n - np.arange(n)) / (0.04 * SR)); return norm(out * fade, -34 + g)
    if k == 'mech':
        s = pitch(S('interface-sounds/toggle_004.ogg' if i % 2 else 'ui-audio/switch13.ogg'), p); return norm(s, -22 + g)
    if k == 'stamp':
        s = S('impact-sounds/impactPlate_light_000.ogg')[:int(0.25 * SR)].copy(); s *= np.linspace(1, 0, len(s)) ** 2
        b = tone(160, 80, 0.12, 0.03); s[:len(b)] += b * 0.7 * np.abs(s).max(); return norm(s, -22 + g)
    if k == 'riser':
        n = int(max(0.3, d) * SR); t = np.arange(n) / SR; fr = 110 * 2 ** (np.linspace(0, 1, n) * 1.0)
        saw = sum(((np.cumsum(fr * dt) / SR) % 1 * 2 - 1) for dt in (0.995, 1.0, 1.006)) / 3
        x = (lowpass(saw, 2500) * 0.6 + bandnoise(n, 2000, 9000) * 0.25) * np.linspace(0, 1, n) ** 2.2
        return norm(x, -20 + g)
    if k == 'impact':
        s = tone(85, 42, 0.6, 0.18); s[:int(0.03 * SR)] += bandnoise(int(0.03 * SR), 1500, 8000) * env_exp(int(0.03 * SR), 0.006) * 0.8
        return norm(s, -14 + g)
    raise ValueError(k)

# ---- VO ----
vo = np.zeros(N, np.float32)
for v in J['vo']:
    x = load(v['file'])
    if v.get('b'):  # optional trim (s): keep [a, b) of the take with 30 ms fades
        x = x[int(v.get('a', 0) * SR):int(v['b'] * SR)].copy(); fd = min(len(x), int(0.03 * SR)); x[:fd] *= np.linspace(0, 1, fd); x[-fd:] *= np.linspace(1, 0, fd)
    s0 = int(v['f'] / FPS * SR); x = x[:max(0, N - s0)]; vo[s0:s0 + len(x)] += x
vo = norm(vo, -6) if np.abs(vo).max() > 0 else vo
# VO envelope -> SFX duck (4 dB, attack 30 ms, release 300 ms)
win = int(0.01 * SR); nwin = N // win
rms = np.sqrt((vo[:nwin * win].reshape(nwin, win) ** 2).mean(1)); act = (rms > db(-40)).astype(float)
envd = np.zeros(nwin); a_att, a_rel = np.exp(-1 / 3), np.exp(-1 / 30)
for j in range(1, nwin): envd[j] = act[j] + (envd[j - 1] - act[j]) * (a_att if act[j] > envd[j - 1] else a_rel)
duck = np.repeat(db(-4 * envd), win); duck = np.pad(duck, (0, N - len(duck)), constant_values=1)

L = np.zeros(N); R = np.zeros(N); report = []
for i, e in enumerate(sorted(J['ev'], key=lambda x: x['f'])):
    s = make(e, i).astype(np.float64); s0 = int(e['f'] / FPS * SR)
    if s0 >= N or s0 < 0: continue
    s = s[:N - s0]; dk = 1 if e['kind'] == 'impact' else duck[s0:s0 + len(s)]
    pan = {'whoosh': rng.uniform(-0.35, 0.35), 'swipe': rng.uniform(-0.3, 0.3)}.get(e['kind'], rng.uniform(-0.12, 0.12))
    L[s0:s0 + len(s)] += s * dk * np.sqrt(0.5 * (1 - pan)) * 1.414; R[s0:s0 + len(s)] += s * dk * np.sqrt(0.5 * (1 + pan)) * 1.414
    report.append({'frame': round(e['f'], 1), 't': round(e['f'] / FPS, 3), 'kind': e['kind'], 'src': e.get('src'), 'peak_dbfs': round(20 * np.log10(np.abs(s).max() + 1e-9), 1)})
st = np.stack([L + vo, R + vo], 1)
pk = np.abs(st).max();  st = st * (db(-1) / pk) if pk > db(-1) else st
def wav(path, x):
    x = np.clip(x, -1, 1); i16 = (x * 32767).astype('<i2').tobytes()
    import wave
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(i16)
dur = J['frames'] / FPS; ns = int(dur * SR)
wav(os.path.join(outdir, 'vo_sfx.wav'), st[:ns])
wav(os.path.join(outdir, 'sfx_only.wav'), np.stack([L, R], 1)[:ns])
# ---- music bed: 15 dB under the VO (RMS while speaking), extra side-chain duck 4 dB while VO, fades ----
m = load(J['music']); m = np.tile(m, int(np.ceil(ns / len(m))))[:ns] if len(m) else np.zeros(ns)
off = int(J.get('music_offset', 0) * SR); m = np.roll(m, -off)[:ns]
vo_rms = np.sqrt(np.mean(vo[:ns][np.repeat(act, win)[:ns] > 0] ** 2)) if act.any() else db(-20)
m_rms = np.sqrt(np.mean(m ** 2)) + 1e-9
m = m * (vo_rms * db(-15) / m_rms) * duck[:ns]
fi, fo = int(1.0 * SR), int(2.5 * SR); m[:fi] *= np.linspace(0, 1, fi); m[-fo:] *= np.linspace(1, 0, fo)
wav(os.path.join(outdir, 'music_bed.wav'), np.stack([m, m], 1))
mix = st[:ns] + np.stack([m, m], 1); pk = np.abs(mix).max(); mix = mix * (db(-1) / pk) if pk > db(-1) else mix
wav(os.path.join(outdir, 'vo_sfx_music.wav'), mix)
kinds = {}
for r in report: kinds[r['kind']] = kinds.get(r['kind'], 0) + 1
json.dump({'events': report, 'counts': kinds, 'events_per_s': round(len(report) / dur, 2), 'duration_s': dur}, open(os.path.join(outdir, 'sfx_report.json'), 'w'), indent=0)
print('events', len(report), kinds)
