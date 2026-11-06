# P05 v3 mix: SFX LEAD, the CC0 music is only a low bed. Places the presets-lab one-shots (public/sfx/presets) on the
# plan's events, then sets the bed so that it sits >= 14 dB under the SFX (on sample peaks AND on 400 ms short-term
# RMS peaks), and ducks it a further 6 dB on every impact (3 dB on whooshes).
# Usage: python mix.py events.json outdir -> music_sfx.wav, sfx_only.wav, music_only.wav, sfx_report.json
# Kinds: whoosh (peaks on f), impact/hit (lands on f), riser/charge (END on f, dur frames), pop, click, mech (on f),
# stutter (first click on f), data (loop STARTS on f, runs dur frames). pitch = playback-rate ratio. MIT, our own code.
import json, os, subprocess, sys, wave
import numpy as np

SR = 48000
J = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
FPS = J['fps']; ns = int(J['frames'] / FPS * SR)
BED_UNDER = float(os.environ.get('BED_UNDER', 23))  # dB under the SFX before the master; the master's limiter takes ~8 dB off SFX peaks, so >= 14 dB remain after it (master.py reports the final margin)

def load(rel):
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', os.path.join('public', rel), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
def db(x): return 10 ** (x / 20)
def todb(x): return 20 * np.log10(max(x, 1e-12))
def st_rms_max(x, win=0.4):
    n = int(win * SR); k = len(x) // n
    return float(np.sqrt((x[: k * n].reshape(k, n) ** 2).mean(1)).max()) if k else 0.0
def repitch(s, r):
    if not r or abs(r - 1) < 1e-3: return s
    idx = np.arange(0, len(s) - 1, r); return np.interp(idx, np.arange(len(s)), s)

SM = {k: load(f'sfx/presets/{k}.wav') for k in ('whoosh', 'hit', 'riser', 'pop', 'click', 'charge', 'stutter')}
SM['mech'] = load('sfx/presets/mech_click.wav'); SM['data'] = load('sfx/presets/data_loop.wav')
PEAK = {'whoosh': 0.30}  # where the audible beat sits inside the file (s); 0 for the rest
LEVEL = {'whoosh': -8, 'hit': -1, 'riser': -9, 'pop': -7, 'click': -6, 'charge': -10, 'stutter': -9, 'mech': -6, 'data': -14}  # dBFS peak per one-shot

sfx = np.zeros(ns); duck = np.ones(ns); rep = []
for e in sorted(J['ev'], key=lambda x: x['f']):
    k = {'impact': 'hit'}.get(e['kind'], e['kind']); s = repitch(SM[k].copy(), e.get('pitch')); t = e['f'] / FPS
    if k == 'data':
        L = int((e.get('dur') or 60) / FPS * SR); s = np.tile(s, L // len(s) + 1)[:L].copy(); fd = int(0.04 * SR); s[:fd] *= np.linspace(0, 1, fd); s[-fd:] *= np.linspace(1, 0, fd); start = t
    elif k in ('riser', 'charge'):
        L = int(min(len(s), (e.get('dur') or 120) / FPS * SR)); s = s[-L:].copy(); s[:int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR)); start = t - L / SR
    else:
        start = t - PEAK.get(k, 0.0)
    s = s / (np.abs(s).max() + 1e-9) * db(LEVEL[k] + (e.get('gain') or 0))
    a = int(round(start * SR))
    if a < 0: s = s[-a:]; a = 0
    s = s[:max(0, ns - a)]; sfx[a:a + len(s)] += s
    if k in ('hit', 'whoosh'):  # the bed steps aside: impacts -6 dB (20 ms in, 500 ms back), whooshes -3 dB
        d = -6 if k == 'hit' else -3; n1, n2 = int(0.02 * SR), int(0.5 * SR); c = max(0, int((t - (0.08 if k == 'whoosh' else 0)) * SR))
        env = np.concatenate([np.linspace(1, db(d), n1), np.full(int(0.12 * SR), db(d)), np.linspace(db(d), 1, n2)]); seg = duck[c:c + len(env)]; duck[c:c + len(env)] = np.minimum(seg, env[:len(seg)])
    rep.append({'frame': round(e['f'], 1), 't': round(t, 3), 'kind': k, 'src': e.get('src'), 'level_dbfs': LEVEL[k] + (e.get('gain') or 0)})

# ---- the bed: from offset, fades, then set >= BED_UNDER dB under the SFX on peaks and on short-term RMS ----
m = load(J['music']); o = int(J.get('music_offset', 0) * SR); m = m[o:o + ns]; m = np.pad(m, (0, ns - len(m)))
fi, fo = int(0.25 * SR), int(1.2 * SR); m[:fi] *= np.linspace(0, 1, fi); m[-fo:] *= np.linspace(1, 0, fo) ** 1.5
sp, sr = np.abs(sfx).max(), st_rms_max(sfx); mp, mr = np.abs(m).max() + 1e-9, st_rms_max(m) + 1e-9
g = min(sp / mp, sr / mr) * db(-BED_UNDER); m = m * g * duck
mix = sfx + m; pk = np.abs(mix).max(); G = db(-1) / pk if pk > db(-1) else 1.0
def wav(p, x):
    st = np.clip(np.stack([x, x], 1), -1, 1)
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
wav(os.path.join(out, 'music_sfx.wav'), mix * G); wav(os.path.join(out, 'sfx_only.wav'), sfx * G); wav(os.path.join(out, 'music_only.wav'), m * G)
dur = ns / SR; cnt = {}
for r in rep: cnt[r['kind']] = cnt.get(r['kind'], 0) + 1
bed = {'bed_under_sfx_peak_db': round(todb(np.abs(sfx).max()) - todb(np.abs(m).max()), 1),
       'bed_under_sfx_shortterm_rms_db': round(todb(st_rms_max(sfx)) - todb(st_rms_max(m)), 1),
       'bed_peak_under_sfx_peak_at_impacts_db': round(todb(np.abs(sfx).max()) - todb(max(np.abs(m[int(r['t'] * SR):int(r['t'] * SR) + int(0.15 * SR)]).max() for r in rep if r['kind'] == 'hit')), 1)}
json.dump({'events': rep, 'counts': cnt, 'events_per_s': round(len(rep) / dur, 2), 'duration_s': round(dur, 3), 'music': J['music'], 'music_offset_s': J.get('music_offset', 0), 'bed': bed}, open(os.path.join(out, 'sfx_report.json'), 'w'), indent=0)
print('events', len(rep), cnt, 'per s', round(len(rep) / dur, 2), bed)
