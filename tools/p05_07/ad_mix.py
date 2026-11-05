# Music-led mix for the no-voice production ad. Places the presets-lab one-shots (public/sfx/presets) on the plan's
# events and lays the CC0 music under them from a fixed offset (so the cuts sit on the beat grid).
# Usage: python ad_mix.py events.json outdir -> music_sfx.wav, sfx_only.wav, music_only.wav, sfx_report.json
# Kinds: whoosh (sound PEAKS on f), hit (lands on f), riser / charge (END on f, dur frames), pop, click, mech (lands on f),
# stutter (first click on f), data (data loop STARTS on f, runs dur frames, short fades). MIT, our own code.
import json, os, subprocess, sys, wave
import numpy as np

SR = 48000
J = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
FPS = J['fps']; ns = int(J['frames'] / FPS * SR)

def load(rel):
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', os.path.join('public', rel), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
def db(x): return 10 ** (x / 20)
SM = {k: load(f'sfx/presets/{k}.wav') for k in ('whoosh', 'hit', 'riser', 'pop', 'click', 'charge', 'stutter')}
SM['mech'] = load('sfx/presets/mech_click.wav'); SM['data'] = load('sfx/presets/data_loop.wav')
PEAK = {'whoosh': 0.30, 'hit': 0.0, 'pop': 0.0, 'click': 0.0, 'mech': 0.0, 'stutter': 0.0, 'data': 0.0}   # where the audible beat is inside each file (s)
LEVEL = {'whoosh': -9, 'hit': -3, 'riser': -10, 'pop': -11, 'click': -10, 'charge': -12, 'stutter': -12, 'mech': -11, 'data': -17}  # dB vs. music peak level

# ---- music: from offset, short fade in, 1.4 s fade out ----
m = load(J['music']); o = int(J.get('music_offset', 0) * SR); m = m[o:o + ns]; m = np.pad(m, (0, ns - len(m)))
fi, fo = int(0.03 * SR), int(1.4 * SR); m[:fi] *= np.linspace(0, 1, fi); m[-fo:] *= np.linspace(1, 0, fo) ** 1.5
m = m / (np.abs(m).max() + 1e-9) * db(-6)
ref = db(-6)

sfx = np.zeros(ns); duck = np.ones(ns); rep = []
for e in sorted(J['ev'], key=lambda x: x['f']):
    k = {'impact': 'hit'}.get(e['kind'], e['kind']); s = SM[k].copy(); t = e['f'] / FPS
    if k == 'data':  # loop the 1-bar data bed for `dur` frames, 40 ms fades
        L = int((e.get('dur') or 60) / FPS * SR); s = np.tile(s, L // len(s) + 1)[:L].copy(); fd = int(0.04 * SR); s[:fd] *= np.linspace(0, 1, fd); s[-fd:] *= np.linspace(1, 0, fd); start = t
    elif k in ('riser', 'charge'):  # keep the last `dur` of the sweep so its end lands on f
        L = int(min(len(s), (e.get('dur') or 120) / FPS * SR)); s = s[-L:].copy(); s[:int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR)); start = t - L / SR
    else:
        start = t - PEAK[k]
    s = s / (np.abs(s).max() + 1e-9) * ref * db(LEVEL[k] + (e.get('gain') or 0))
    a = int(round(start * SR));
    if a < 0: s = s[-a:]; a = 0
    s = s[:max(0, ns - a)]; sfx[a:a + len(s)] += s
    if k == 'hit':  # music steps aside for the impact: -4 dB, 20 ms in, 350 ms back
        n1, n2 = int(0.02 * SR), int(0.35 * SR); c = int(t * SR)
        env = np.concatenate([np.linspace(1, db(-4), n1), np.linspace(db(-4), 1, n2)]); seg = duck[c:c + len(env)]; duck[c:c + len(env)] = np.minimum(seg, env[:len(seg)])
    rep.append({'frame': round(e['f'], 1), 't': round(t, 3), 'kind': k, 'src': e.get('src'), 'level_db': LEVEL[k] + (e.get('gain') or 0)})
m = m * duck
def wav(p, x):
    st = np.stack([x, x], 1) if x.ndim == 1 else x; st = np.clip(st, -1, 1)
    with wave.open(p, 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype('<i2').tobytes())
mix = m + sfx; pk = np.abs(mix).max(); g = db(-1) / pk if pk > db(-1) else 1
wav(os.path.join(out, 'music_sfx.wav'), mix * g); wav(os.path.join(out, 'sfx_only.wav'), sfx * g); wav(os.path.join(out, 'music_only.wav'), m * g)
dur = ns / SR; cnt = {}
for r in rep: cnt[r['kind']] = cnt.get(r['kind'], 0) + 1
json.dump({'events': rep, 'counts': cnt, 'events_per_s': round(len(rep) / dur, 2), 'duration_s': round(dur, 3), 'music': J['music'], 'music_offset_s': J.get('music_offset', 0)}, open(os.path.join(out, 'sfx_report.json'), 'w'), indent=0)
print('events', len(rep), cnt, 'per s', round(len(rep) / dur, 2))
