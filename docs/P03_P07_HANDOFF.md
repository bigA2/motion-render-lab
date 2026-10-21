# P03-P07 handoff (branch cloud/p03-p07, not merged)
Done: shared engine src/prod (Film, compose, acts, mix, timeline, ui, specs/P03..P07), prod.yml (push-triggered via prodrun.json
because workflow_dispatch needs the file on main), voice for all 5 (public/v/P0N; P03 line 7 and P04 line 3 use raw takes),
4x5 + native 16x9 layouts, SFX subset from wave1/sfx, scripts/prod_mix.py (2-pass loudnorm -14 / TP -1.5, music bed 15 dB under VO).
Stills checked (4x5 all, 16x9 P03/P06): layouts OK, frame 0 shows the hook.
Full render run 39625026132 (all 5 videos) finished SUCCESS: artifacts final-P0N-{4x5,16x9}, qa-P0N-{4x5,16x9} (sheet_*.jpg, loudness.json).
Left:
1. Download qa-* and check loudness.json (I -14 +-1, TP <= -1) and sheet_00.jpg per video (clipping, captions, turn scene in P06, ping in P04).
   gh run download 39625026132 -R bigA2/motion-render-lab -p 'qa-*' -D qa ; -p 'final-*' -D final
2. If a fix is needed: edit src/prod, change prodrun.json (bump "rev"), push -> runs "full" again.
3. Release: gh release create prod-p03-p07 final/*/*.mp4 -R bigA2/motion-render-lab --target cloud/p03-p07 (20 files FansaChat_P0N_{4x5,16x9}_{music,no-music}.mp4).
4. Append short entry to docs/CLOUD_LOG.md (not yet written), commit, push. Do NOT merge to main.
Doubts: Whisper heard "Jotform"/"Pipedrive"/"Xero" oddly (TTS), "Myth" take is raw (0.7 s); music tracks are public/audio 02,04,03,05,06 (CC0; music/ dir has only 04).
