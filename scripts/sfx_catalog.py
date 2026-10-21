# Catalogue every SFX: duration, peak, brightness, event tag -> public/sfx/catalog.json
import os, json, numpy as np, soundfile as sf
TAGS = [('data_loop', 'thinking-loop'), ('stutter', 'typing-stutter'), ('charge_data', 'run-charge'), ('mechanical', 'plan-nodes'), ('impact', 'hook/hit'), ('hit', 'hook/hit'), ('riser', 'build-up'), ('flash', 'transition'), ('whoosh', 'transition'), ('swoosh', 'transition'),
        ('pop', 'text/pop'), ('typing', 'typing'), ('key', 'typing'), ('click', 'ui-click'), ('tick', 'ui-tick'), ('select', 'ui-click'), ('switch', 'ui-click'),
        ('toggle', 'ui-click'), ('confirm', 'success'), ('chime', 'success'), ('success', 'success'), ('error', 'error'), ('glitch', 'glitch'), ('laser', 'sci-fi'),
        ('zap', 'sci-fi'), ('drop', 'drop'), ('scroll', 'scroll'), ('maximize', 'open'), ('minimize', 'close'), ('open', 'open'), ('close', 'close'),
        ('coin', 'counter'), ('chip', 'counter'), ('card', 'card'), ('bong', 'accent'), ('glass', 'accent'), ('pluck', 'accent')]
rows = []
for root, _, files in os.walk('public/sfx'):
    for f in sorted(files):
        if not f.endswith('.ogg'): continue
        p = os.path.join(root, f).replace(os.sep, '/'); x, sr = sf.read(p)
        x = x if x.ndim == 1 else x.mean(1); S = np.abs(np.fft.rfft(x[: sr]))  # first second
        fr = np.fft.rfftfreq(min(len(x), sr), 1 / sr); c = float((S * fr).sum() / (S.sum() or 1))
        tag = next((t for k, t in TAGS if k in f.lower()), 'other')
        rows.append({'file': p[len('public/'):], 'tag': tag, 'dur': round(len(x) / sr, 3), 'peak_db': round(20 * np.log10(np.abs(x).max() + 1e-9), 1), 'bright_hz': int(c),
                     'source': 'Kenney CC0' if '/kenney/' in p else 'procedural (code)'})
json.dump(rows, open('public/sfx/catalog.json', 'w'), indent=0)
from collections import Counter; print(len(rows), 'sounds', Counter(r['tag'] for r in rows))
