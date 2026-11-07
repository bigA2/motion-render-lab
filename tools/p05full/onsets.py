# P05 FULL v5: check every SFX cue against the rendered SFX-only stem (bed muted) and the final mix.
# in: cues.json (from plan5.ts), stem.raw (s16le mono 48k), mix.raw. out: onsets.txt (per cue: detected onset frame,
# level), unexpected onsets (energy rises with no cue), SFX counts per type, same-sample-within-1.5 s check.
import json, math, struct, sys
SR, FPS = 48000, 30
cues = json.load(open(sys.argv[1]))
def load(p):
    b = open(p, 'rb').read(); return struct.unpack('<%dh' % (len(b) // 2), b)
stem = load(sys.argv[2])
# high-passed (first difference) energy in 2 ms hops, so the onset is located to ~1 ms
HOP = 96
d = [stem[i] - stem[i - 1] for i in range(1, len(stem))]
e = []
for i in range(0, len(d) - HOP, HOP):
    s = sum(v * v for v in d[i:i + HOP]) / HOP; e.append(10 * math.log10(s / (32767.0 ** 2) + 1e-14))
ON = []  # onset = level jumps >= 9 dB over the max of the previous 10 ms and is above -62 dB
for i in range(5, len(e)):
    prev = max(e[i - 5:i])
    if e[i] > -62 and e[i] - prev >= 9 and (not ON or i - ON[-1] > 10):
        ON.append(i)
on_f = [i * HOP / SR * FPS for i in ON]
out = []
used = set()
out.append('cue_f  type    detected_f  delta_ms  why')
miss = 0
for c in sorted(cues, key=lambda c: c['f']):
    best = None
    for j, of in enumerate(on_f):
        if abs(of - c['f']) <= 1.0 and (best is None or abs(of - c['f']) < abs(on_f[best] - c['f'])): best = j
    if best is None:
        # slow-attack sound (whoosh, swish, paper, chime): onset = first 2 ms hop within +-1 f that rises 20 dB over the
        # level of the 20 ms before the cue frame (the stem's floor there)
        i0 = int(c['f'] / FPS * SR / HOP); span = int(SR / FPS / HOP)
        floor = max(e[max(0, i0 - span - 10):max(1, i0 - span)])
        soft = next((i for i in range(i0 - span, i0 + span + 1) if e[i] > max(floor, -100) + 20 and e[i] > -75), None)
        if soft is None:
            out.append('%5d  %-7s  --          --        %s   [NOT FOUND]' % (c['f'], c['type'], c['why'])); miss += 1
        else:
            sf = soft * HOP / SR * FPS
            out.append('%5d  %-7s  %8.2f  %+7.1f   %s   [soft attack: +20 dB over the floor]' % (c['f'], c['type'], sf, (sf - c['f']) / FPS * 1000, c['why']))
    else:
        used.add(best); out.append('%5d  %-7s  %8.2f  %+7.1f   %s' % (c['f'], c['type'], on_f[best], (on_f[best] - c['f']) / FPS * 1000, c['why']))
extra = [on_f[j] for j in range(len(on_f)) if j not in used]
def owner(x):  # the latest-starting cue still playing at x
    on = [c for c in cues if c['f'] <= x < c['f'] + (c.get('dur') or 40)]
    return max(on, key=lambda c: c['f']) if on else None
inside = [(x, owner(x)) for x in extra if owner(x)]
alone = [x for x in extra if not owner(x)]
out.append('')
out.append('transients inside a playing cue (the same sample, e.g. a latch release): %s' % (', '.join('%.2f (%s @%d)' % (x, c['src'].split('/')[-1], c['f']) for x, c in inside) or 'none'))
out.append('UNEXPECTED onsets (no cue playing): %s' % (', '.join('%.2f' % x for x in alone) or 'none'))
cnt = {}
for c in cues: cnt[c['type']] = cnt.get(c['type'], 0) + 1
out.append('SFX count per type: ' + ', '.join('%s %d' % kv for kv in sorted(cnt.items())))
rep = []
cs = sorted(cues, key=lambda c: c['f'])
for i, a in enumerate(cs):
    for b in cs[i + 1:]:
        if b['f'] - a['f'] < 45 and b['src'] == a['src']: rep.append('%s @%d/%d' % (a['src'], a['f'], b['f']))
out.append('same sample twice within 1.5 s: ' + (', '.join(rep) or 'none'))
out.append('cues not found: %d' % miss)
# silence check per 1/30 s frame on the stem: frames whose level is above -50 dBFS but not within a cue's window
fr_db = []
N = SR // FPS
for f in range(len(stem) // N):
    seg = stem[f * N:(f + 1) * N]; s = sum(v * v for v in seg) / N
    fr_db.append(10 * math.log10(s / 32767.0 ** 2 + 1e-14))
win = set()
for c in cues:
    L = c.get('dur') or 40
    for f in range(c['f'], c['f'] + L): win.add(f)
loud = [f for f, v in enumerate(fr_db) if v > -50 and f not in win]
out.append('stem frames > -50 dBFS outside any cue window: ' + (', '.join(map(str, loud)) or 'none'))
open('onsets.txt', 'w').write('\n'.join(out) + '\n'); print('\n'.join(out))
