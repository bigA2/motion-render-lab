# P05 v4 mix: one row per sound (out/events_P05V4.json from src/p05_v4/dump.ts). Each event names its sample, playback
# rate, EQ (ffmpeg filter), tail (short room), pan and dBFS peak. Anchors: whoosh = START of the camera travel (trimmed to
# its length), riser = END on f, everything else = onset on f (leading silence of every sample is trimmed).
# Keys are synthesized per key (noise click + soft body + release; no tonal component, so never a "water drop").
# Bed: CC0 music, peak >= 14 dB under the SFX peak, -6 dB under impacts, -3 dB under whooshes, -12 dB in the near-silence
# windows before the product reveal and the logo.  Usage: python mix.py events.json outdir. MIT, our own code.
import json, os, subprocess, sys, wave
import numpy as np

SR = 48000
J = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
FPS = J['fps']; ns = int(J['frames'] / FPS * SR)
SAMPLES = {
    'impact_a': 'sfx/proc/hook_bass_impact_1.2s.ogg', 'impact_b': 'sfx/presets/hit.wav', 'impact_c': 'sfx/proc/hook_bass_impact_0.8s.ogg',
    'pop_1': 'sfx/proc/node_pop_1.ogg', 'pop_2': 'sfx/proc/node_pop_2.ogg', 'pop_3': 'sfx/proc/node_pop_3.ogg', 'pop_4': 'sfx/proc/node_pop_4.ogg', 'pop_5': 'sfx/proc/node_pop_5.ogg',
    'click_1': 'sfx/proc/ui_click_1.ogg', 'click_2': 'sfx/proc/ui_click_2.ogg',
    'slide_paper_a': 'sfx/kenney/casino-audio/card-slide-2.ogg', 'slide_paper_b': 'sfx/kenney/casino-audio/card-slide-5.ogg',
    'tick_a': 'sfx/proc/ui_tick_1.ogg', 'tick_b': 'sfx/proc/ui_tick_2.ogg', 'tick_c': 'sfx/kenney/interface-sounds/tick_001.ogg',
    'whoosh_25': 'sfx/proc/transition_whoosh_0.25s.ogg', 'whoosh_45': 'sfx/proc/transition_whoosh_0.45s.ogg', 'whoosh_70': 'sfx/proc/transition_whoosh_0.7s.ogg', 'whoosh_p': 'sfx/presets/whoosh.wav',
    'chime': 'sfx/proc/success_chime_G.ogg', 'riser': 'sfx/proc/buildup_metallic_riser_1.4s.ogg',
}

def load(rel, af=''):
    chain = ['-af', af] if af else []
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', os.path.join('public', rel), *chain, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
def db(x): return 10 ** (x / 20)
def todb(x): return 20 * np.log10(max(float(x), 1e-12))
def trim_lead(s, thr_db=-40):
    i = np.argmax(np.abs(s) > np.abs(s).max() * db(thr_db)); return s[i:]
def fade(s, n_in=0.003, n_out=0.03):
    s = s.copy(); a, b = int(n_in * SR), int(n_out * SR)
    if a: s[:a] *= np.linspace(0, 1, a)
    if b and len(s) > b: s[-b:] *= np.linspace(1, 0, b) ** 1.5
    return s
def biquad(x, b, a):
    y = np.zeros_like(x); x1 = x2 = y1 = y2 = 0.0
    for i in range(len(x)):
        v = b[0] * x[i] + b[1] * x1 + b[2] * x2 - a[1] * y1 - a[2] * y2; x2, x1 = x1, x[i]; y2, y1 = y1, v; y[i] = v
    return y
def bp(f0, q):
    w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q); c = np.cos(w); a0 = 1 + al
    return [al / a0, 0, -al / a0], [1, -2 * c / a0, (1 - al) / a0]
def lp(f0, q=0.707):
    w = 2 * np.pi * f0 / SR; al = np.sin(w) / (2 * q); c = np.cos(w); a0 = 1 + al
    return [(1 - c) / 2 / a0, (1 - c) / a0, (1 - c) / 2 / a0], [1, -2 * c / a0, (1 - al) / a0]
def key(seed, rate):
    r = np.random.default_rng(seed); n = int(0.11 * SR); t = np.arange(n) / SR
    noise = r.standard_normal(n)
    click = biquad(noise, *bp(2600 * rate, 1.4)) * np.exp(-t / 0.0035)
    body = biquad(r.standard_normal(n), *lp(420 * rate)) * np.exp(-t / 0.011) * 2.2
    rel_at = int((0.055 + r.random() * 0.025) * SR); rel = np.zeros(n)
    m = n - rel_at; rel[rel_at:] = biquad(r.standard_normal(m), *bp(3300 * rate, 1.6)) * np.exp(-np.arange(m) / SR / 0.0025) * 0.3
    s = click * 0.7 + body + rel
    return biquad(s, *lp(7000))  # soft: nothing above ~7 kHz

L = np.zeros(ns); R = np.zeros(ns); duck = np.ones(ns); rep = []
for i, e in enumerate(J['ev']):
    k, snd = e['kind'], e['snd']; rate = e.get('rate') or 1.0; t = e['f'] / FPS
    if snd == 'key':
        s = key(1000 + i, rate)
    else:
        af = [x for x in [e.get('eq') or '', f'asetrate={int(SR * rate)},aresample={SR}' if abs(rate - 1) > 1e-3 else '',
                          'aecho=0.8:0.6:35|60:0.22|0.12' if e.get('verb') == 'short room' else ''] if x]
        s = trim_lead(load(SAMPLES[snd], ','.join(af)))
    L_ms = e.get('len') or 0; n = int(L_ms / 1000 * SR)
    if k == 'riser':
        s = s[-n:] if n and len(s) > n else s; s = fade(s, 0.08, 0.004); start = t - len(s) / SR
    elif k == 'whoosh':
        s = fade(s[:n] if n and len(s) > n else s, 0.01, 0.06); start = t
    else:
        s = fade(s[:n], 0.002, 0.25) if (k == 'chime' and n and len(s) > n) else fade(s, 0.002, 0.03); start = t
    s = s / (np.abs(s).max() + 1e-12) * db(e['gain'])
    p = (e.get('pan') or 0); gl, gr = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
    a = int(round(start * SR))
    if a < 0: s = s[-a:]; a = 0
    s = s[:max(0, ns - a)]; L[a:a + len(s)] += s * gl; R[a:a + len(s)] += s * gr
    if k in ('impact', 'whoosh'):
        d = -6 if k == 'impact' else -3; c = max(0, int(t * SR) - int(0.02 * SR)); n1, n2 = int(0.02 * SR), int(0.5 * SR)
        env = np.concatenate([np.linspace(1, db(d), n1), np.full(int(0.15 * SR), db(d)), np.linspace(db(d), 1, n2)]); seg = duck[c:c + len(env)]; duck[c:c + len(env)] = np.minimum(seg, env[:len(seg)])
    rep.append({'i': i + 1, 'frame': round(e['f'], 1), 't': round(t, 3), 'start_s': round(start, 3), 'len_ms': round(len(s) / SR * 1000), 'kind': k, 'snd': snd,
                'gain_dbfs': e['gain'], 'pan': p, 'rate': rate, 'cause': e.get('cause')})
# near-silence windows: the bed drops 12 dB
for a, b in J.get('silence', []):
    a0, b0 = int(a / FPS * SR), int(b / FPS * SR); r0 = int(0.04 * SR)
    env = np.concatenate([np.linspace(1, db(-12), r0), np.full(max(0, b0 - a0 - r0), db(-12)), np.linspace(db(-12), 1, r0)])
    duck[a0:a0 + len(env)] = np.minimum(duck[a0:a0 + len(env)], env[:len(duck[a0:a0 + len(env)])])

sfxpk = max(np.abs(L).max(), np.abs(R).max())
m = load(J['music']); o = int(J.get('music_offset', 0) * SR); m = m[o:o + ns]; m = np.pad(m, (0, ns - len(m)))
fi, fo = int(0.3 * SR), int(1.2 * SR); m[:fi] *= np.linspace(0, 1, fi); m[-fo:] *= np.linspace(1, 0, fo) ** 1.5
BED_UNDER = float(os.environ.get('BED_UNDER', 18))
m = m / (np.abs(m).max() + 1e-12) * sfxpk * db(-BED_UNDER) * duck
ML, MR = L + m * 0.707, R + m * 0.707
pk = max(np.abs(ML).max(), np.abs(MR).max()); G = db(-1) / pk if pk > db(-1) else 1.0
def wav(path, l, r):
    st = np.clip(np.stack([l, r], 1), -1, 1)
    with wave.open(path, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
wav(os.path.join(out, 'music_sfx.wav'), ML * G, MR * G); wav(os.path.join(out, 'sfx_only.wav'), L * G, R * G); wav(os.path.join(out, 'music_only.wav'), m * 0.707 * G, m * 0.707 * G)
cnt = {}
for r_ in rep: cnt[r_['kind']] = cnt.get(r_['kind'], 0) + 1
dur = ns / SR; nk = [r_ for r_ in rep if r_['kind'] != 'key']
bed = {'sfx_peak_dbfs_pre_master': round(todb(sfxpk * G), 1), 'bed_peak_dbfs_pre_master': round(todb(np.abs(m * 0.707 * G).max()), 1),
       'bed_under_sfx_peak_db': round(todb(sfxpk) - todb(np.abs(m * 0.707).max()), 1)}
json.dump({'events': rep, 'counts': cnt, 'events_per_s_non_key': round(len(nk) / dur, 2), 'duration_s': round(dur, 3), 'music': J['music'], 'bed': bed}, open(os.path.join(out, 'sfx_report.json'), 'w'), indent=0)
print('events', len(rep), cnt, 'non-key per s', round(len(nk) / dur, 2), bed)
