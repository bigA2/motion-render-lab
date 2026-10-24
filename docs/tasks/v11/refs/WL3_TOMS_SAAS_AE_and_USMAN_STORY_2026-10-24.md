# WL3 study 2026-10-24 — TomsProject (3 SaaS AE animations) + Usman (Premiere motion reel = storytelling)
Files: E:\reel_study\wl3\<id>\{video.mkv, study\transcript.txt, study\sheets, study\cuts_*.jpg}. Processed on GitHub (study-enc.yml, run 40086283888).

## ruTR7i1oJgg — TomsProject "These 3 SaaS animations changed my edits forever" (4K, 14 min)
1. **Grid selector reveal** — near-white bg (warm or cool tint), soft grid layer feathered with a mask + low opacity ("luxurious because it doesn't draw attention"). Two stroked rectangles: one animates width, the other height (easy-ease, F9 + graph editor). Merge-paths INTERSECT of both = matte → an image appears inside the crossing; add a small scale-down for parallax.
2. **Glow search bar** — bg = wiggle-path orb blobs (3 tints, big box blur). Dark rounded bar + thin stroke; duplicate with a gradient stroke blue→transparent that ROTATES continuously (time*100) + stacked glows at low intensity. Typewriter with blinking cursor, text left-aligned. Bar pops in with a BOUNCE expression (size/scale/rotation keys) + fade; a null "camera" holds then follows the typing.
3. **Image orbit** — avatars/memoji in pastel squares on a circle path (orbit script), path made 3D and tilted on Y/X, continuous speed; scale null = image size, scale path = spacing.
Tips: everything near-white/off-white, nothing pure; subtle beats loud; easy-ease every key.

## Aa_T1uI4UXY — Usman Explains "Editing Motion Graphics Reels in Premiere Pro" (1440p, 24.5 min) → STORYTELLING style
Recreates a brand-story reel: "Watch how Liquid Death went from $3 million to a $1.4 billion brand in under 6 years… They're not just selling water, they're selling rebellion."
- Look: white background, **black & white cut-out objects** (product can, money bills, briefcase, coins, skull) from green-screen PNGs (Ultra Key + Black&White), soft drop shadow; one accent colour max.
- Motion: objects fly in from off-frame with rotation → settle (position+rotation keys, ease in); nested group scales 0→100 from an anchor; coins spin (rotation ×2) with a blurred duplicate behind = depth.
- Editorial graphics: thin pen-tool lines, dashed lines (text "- - -"), small black circles at line ends, a grid strip cropped top/bottom → "technical drawing" frames around the object; quote text inside.
- Text: preset type animations (fade by character, Gaussian-blur in), two fonts mixed (serif/italic + sans) in one line, text nested and scaled/rotated a little as a unit.
- Story beats = number hook ($3M → $1.4B, "under 6 years") → reframe ("not selling X, selling Y") → proof objects → next beat.
**For FansaChat storytelling (S01–S06):** same editorial B&W cut-out style with our ONE brand colour; objects = real things in the founder's story (phone with DMs, invoice paper, laptop, coins/taka), number hooks, "not selling automation, selling time back" reframe.

## Applied to P01–P07 v10 (commit after 452e7ee)
- Flow chat input = glow search bar (rotating gradient stroke in the video's hot colours + bounce pop).
- Cycle audiences = 3D tilted avatar orbit (Toms #3).
- Backdrop: feathered soft grid at very low opacity (Toms #1 tip).
