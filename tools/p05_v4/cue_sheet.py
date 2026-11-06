# Writes the P05 v4 cue sheet (markdown): ONE ROW PER SOUND from out/events_P05V4.json + the mix report, and optionally a
# per-second / per-type comparison with reference SFX analyses (json files with {"events": [{"t", "kind"}...]}).
# Usage: python cue_sheet.py events.json sfx_report.json out.md [ref1_sfx.json ...]. MIT, our own code.
import json, sys
from collections import Counter
J = json.load(open(sys.argv[1])); R = json.load(open(sys.argv[2])); out = sys.argv[3]; refs = sys.argv[4:]
FPS = J['fps']; ev = J['ev']; rep = R['events']
SRC = {'impact_a': 'proc/hook_bass_impact_1.2s.ogg', 'impact_b': 'presets/hit.wav', 'impact_c': 'proc/hook_bass_impact_0.8s.ogg', 'click_1': 'proc/ui_click_1.ogg', 'click_2': 'proc/ui_click_2.ogg',
       'slide_paper_a': 'kenney card-slide-2.ogg (CC0, real paper slide)', 'slide_paper_b': 'kenney card-slide-5.ogg (CC0, real paper slide)', 'tick_a': 'proc/ui_tick_1.ogg', 'tick_b': 'proc/ui_tick_2.ogg',
       'tick_c': 'kenney interface tick_001.ogg', 'whoosh_25': 'proc/transition_whoosh_0.25s.ogg', 'whoosh_45': 'proc/transition_whoosh_0.45s.ogg', 'whoosh_70': 'proc/transition_whoosh_0.7s.ogg',
       'whoosh_p': 'presets/whoosh.wav', 'chime': 'proc/success_chime_G.ogg', 'riser': 'proc/buildup_metallic_riser_1.4s.ogg (last 1.05 s)',
       'key': 'synth: band-passed noise click (2.6 kHz) + low noise body (420 Hz LP, 11 ms) + release tick 55-80 ms later; LP 7 kHz; no tonal part'}
for i in range(1, 6): SRC[f'pop_{i}'] = f'proc/node_pop_{i}.ogg'
seen = Counter(); rows = []
for i, (e, r) in enumerate(zip(ev, rep)):
    seen[e['snd']] += 1
    if e['snd'].startswith('key'): SRC[e['snd']] = SRC['key'] + f"; variant #{e['snd'].split('_')[1]} (own noise seed {1000 + int(e['snd'].split('_')[1])}, release {55}-{80} ms random)"
    rows.append(f"| {i + 1} | {e['f'] / FPS:.2f} | {round(e['f'])} | {e['cause']} | {e['kind']} | {SRC[e['snd']]} | {r['len_ms']} | {e['gain']:.0f} | {e.get('pan', 0):+.2f} | "
                f"{e.get('eq') or '-'}{' / rate ' + format(e.get('rate'), '.3f') if e.get('rate') and abs(e['rate'] - 1) > 1e-3 else ''} | {e.get('verb') or 'none'} | {e['why']} | {seen[e['snd']] - 1} |")
nk = [e for e in ev if e['kind'] != 'key']; dur = J['frames'] / FPS
cnt = Counter(e['kind'] for e in ev)
L = ['# P05 v4 cue sheet — one row per sound', '',
     f"Generated from the same plan as the picture (src/p05_v4/plan.ts → events_P05V4.json) and the mix report. {len(ev)} sounds in {dur:.0f} s: "
     + ', '.join(f'{k} {v}' for k, v in sorted(cnt.items())) + f". Non-key density {len(nk) / dur:.2f}/s. Levels are dBFS peaks in the mix before the master "
     "(the master then applies gain + a −2 dBFS look-ahead limiter to reach −14 LUFS). Anchor: whoosh = start of the camera travel; riser = its end; all others = onset.", '',
     f"Near-silence windows (bed −12 dB, no events): " + ', '.join(f'{a / FPS:.2f}–{b / FPS:.2f} s' for a, b in J.get('silence', [])) + '.', '',
     f"Bed: {R['music']} (CC0), {R['bed']['bed_under_sfx_peak_db']} dB under the SFX peak, −6 dB under impacts, −3 dB under whooshes.", '',
     '| # | time (s) | frame | on-screen event that causes it | type | source file / synth recipe | length (ms) | gain (dBFS peak) | pan | EQ / filter | reverb / tail | why this sound | repeats of this sample before |',
     '|---|---|---|---|---|---|---|---|---|---|---|---|---|', *rows, '']
if refs:
    L += ['## Comparison with the reference SFX analyses', '', '| reference | duration | events/s | impacts | whooshes | pops/clicks | risers | ours (14 s) |', '|---|---|---|---|---|---|---|---|']
    ours = f"{len(nk) / dur:.2f}/s non-key; impacts {cnt['impact']}, whooshes {cnt['whoosh']}, pops/ticks/clicks {cnt['pop'] + cnt['tick'] + cnt['click']}, risers {cnt['riser']}"
    for p in refs:
        d = json.load(open(p)); E = d['events']; k = Counter(x['kind'] for x in E); du = d['summary']['duration_s']
        L.append(f"| {p.split('/')[-1].replace('_sfx.json', '')} | {du:.1f} s | {len(E) / du:.2f} | {k['impact/thud']} | {k['whoosh/swish']} | {k['pop/blip'] + k['click/tick']} | {k.get('riser→hit', 0)} | {ours} |")
    L += ['', '### Events per second (type initials: I impact, W whoosh, P pop/click/tick, R riser, S swipe, C chime; keys counted as K)', '',
          '| second | ' + ' | '.join(p.split('/')[-1].replace('_sfx.json', '') for p in refs) + ' | ours |', '|---|' + '---|' * (len(refs) + 1)]
    ab = {'impact/thud': 'I', 'whoosh/swish': 'W', 'pop/blip': 'P', 'click/tick': 'P', 'riser→hit': 'R'}
    oab = {'impact': 'I', 'whoosh': 'W', 'pop': 'P', 'tick': 'P', 'click': 'P', 'riser': 'R', 'swipe': 'S', 'chime': 'C', 'key': 'K'}
    rd = [json.load(open(p))['events'] for p in refs]
    for sec in range(int(dur)):
        cells = [' '.join(ab.get(x['kind'], '?') for x in E if sec <= x['t'] < sec + 1) or '·' for E in rd]
        oc = Counter(oab[e['kind']] for e in ev if sec <= e['f'] / FPS < sec + 1)
        cells.append(' '.join(f'{k}×{v}' if v > 1 else k for k, v in sorted(oc.items())) or '·')
        L.append(f'| {sec}–{sec + 1} | ' + ' | '.join(cells) + ' |')
open(out, 'w').write('\n'.join(L) + '\n'); print('cue sheet', out, len(rows), 'rows')
