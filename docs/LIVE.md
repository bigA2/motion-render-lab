# Live board

URL: https://bigA2.github.io/motion-render-lab/ (branch pages: `/<branch>/`, e.g. `/tools/templates/`).

How it works
- Every push to any branch (except gh-pages) runs `.github/workflows/live.yml` (the workflow file must exist on that branch).
- It reads `live.json` at the repo root: `{"entry":"src/x/index.ts","comps":["A","B"],"stills":[0,1,2,3,4,5]}` (max 10 stills, seconds). Missing file = `src/templates/index.ts` + first comp.
- Optional `"prep"` in live.json = shell command run first (e.g. am2json).
- Per comp: stills at 480px wide + 540p low-bitrate preview mp4 (CRF 32, veryfast), no laptop rendering.
- Output is published to `gh-pages` under `/<branch>/`; other branches' folders are kept. Root page lists branches newest first. Pages poll every 30 s and reload when a new commit lands.
- Newer push on the same branch cancels the older run. Manual: `gh workflow run live.yml --ref <branch> -f entry=... -f comp=...` (needs the workflow on main).
- Expect ~3-6 min from push to page update.
