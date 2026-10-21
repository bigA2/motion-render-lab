
## 2026-10-21 P03-P07 prod QA + release
- Run 39625026132 QA'd: P07 true peak -0.2/-0.5 (AAC overshoot) failed; others OK. Fixed: alimiter -3 dBFS before AAC in scripts/prod_mix.py; added glow behind end-card wordmark (src/prod/Film.tsx). Re-rendered via prodrun.json rev 5 (run 39629596495).
- All 20 files: I -14.1..-14.3 LUFS, TP -2.2..-2.9 dBFS. Frame 0 shows hook; no clipping/emoji seen on 4 fps sheets.
- Release prod-p03-p07 (target cloud/p03-p07). Not merged to main.
