# P05–P07 rebuild kit (our own code, MIT)

| File | What |
|---|---|
| `sound_map.md` | event → sound → level → length; research sources |
| `kit/curves.ts` | curve vocabulary (snapOut, hitDecay, inHard, swift, softOut, flyAccel, slide pair, spring) |
| `kit/events.ts` | animation helpers that return motion **and** the SFX events they cause (`typing`, `countUp`, `arrive`, `cursorPath`, `flow`, …) |
| `kit/camera.ts` | virtual camera: moves to framings or follows a moving subject, critically damped spring (no overshoot), velocity, whooshes from speed peaks |
| `kit/CameraRig.tsx` | null parent for the UI world: x/y/zoom/roll/yaw/pitch/dolly, `<Depth z>` parallax, directional motion blur by velocity, `hitShake` |
| `kit/Living.tsx` | living background (gradient drift, rings, grid, depth particles, light sweep, grain, vignette), animated corners/edges, `LiveBorder` |
| `kit/type.tsx` | kinetic type: typed line, giant letters + long shadow, rotating word, tracking in + breathing push, stepped text, VO-synced line |
| `../../tools/p05_07/sfx_mix.py` | places sounds from the dumped event list, ducks under VO, music bed, report |

Rendering happens only on GitHub Actions (`.github/workflows/p05_07.yml`).
