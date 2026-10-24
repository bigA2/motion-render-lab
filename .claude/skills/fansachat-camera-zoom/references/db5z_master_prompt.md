# Master prompt — reverse-engineered from reel Db5zGx4O5oa (henryexists, "noble")

Use this as the prompt for Claude/Remotion. Swap the content in [brackets] for the FansaChat story.

---

Create a 14-second 1:1 (1080×1080, 30 fps) motion graphic in Remotion. Style: Apple-native UI (SF Pro / Inter, iOS Notes + Calendar look), light grey stage #E5E5EA, white rounded cards (radius 36px, soft shadow 0 30px 60px rgba(0,0,0,.12)), accent red #FF3B30, accent blue #0A84FF, yellow Notes header #FFCC00. ONE continuous virtual camera: no cuts until the end card. Every fast move has directional motion blur (CameraMotionBlur, 10 samples, 180° shutter). Cards live in 3D (perspective 1400px). The camera never stops: during holds it keeps a slow push-in (+4 % per second) and a 1–2° rotation drift. Edges of frame have a soft depth-of-field blur.

Shots:
1. 0.0–0.5 s: black. A tiny yellow square appears in the centre and scales up from 0.05 to 0.35 with blur 20→0px, while the background fades from black to grey: it becomes a Notes card titled "Notes", body "[What is my biggest **problem?**]" (the last word in red), "Yesterday" in grey.
2. 0.5–2.2 s: slow dolly in (scale 0.35→0.6), rotateZ −2°→+3°.
3. 2.2–3.0 s: the card tilts (rotateY 0→18°, rotateX 0→−8°) while the camera crash-zooms (scale 0.6→1.6, 10 frames, ease cubic-bezier(.16,1,.3,1)) onto the body; a checklist starts.
4. 3.0–4.5 s: list items write in letter by letter (each letter slides 12px up from blur 8px→0): "[Quality?]", "[Quantity?]", "[Consistency?]". A red ❌ draws inside the first two circles (stroke-dashoffset, 6 frames each); the third circle fills green with a white ✓ (scale pop 0→1.15→1). The camera pushes further (1.6→2.2) and pans down to follow the newest line.
5. 4.75–5.5 s: whip-pan + darken: the list explodes into ~120 small particles (grey/colour dots) that drift; the stage goes dark grey #2B2B2E. Centre text "[let's fix that]" in white; the word "[fix]" has an RGB-split glitch (3 frames on, offset ±4px red/blue).
6. 5.5–6.5 s: the letters scatter as particles and re-form into the blue word "[today.]" on pure black; at 6.3 s it stretches horizontally (scaleX 1→1.6) with blur and vanishes.
7. 6.75–7.25 s: on light grey, particles converge into an iOS Calendar app icon ("Tue Aug" small red, "11" big). The icon tints red.
8. 7.5 s: shared-element morph: the icon becomes a solid red circle with a white "11" (border-radius 28%→50%, size 1:1).
9. 8.0–8.5 s: around the circle, the calendar's number columns slide in vertically with motion blur (like a slot reel stopping): 4, 10, 18 / 2 3 4 5 / 9 10 11 12…; the circle snaps into its cell.
10. 8.5–9.25 s: fast zoom-out (scale 3→1, 18 frames, ease-out) with a slight rotateX tilt, revealing the full white "AUGUST" month card.
11. 9.25–10.5 s: red pill highlights sweep left→right row by row (11–12, then 13–19, then 20–26), each row 8 frames, overlapping.
12. 10.75–12.25 s: the camera pushes in and orbits (rotateY 0→−20°, translateX) toward "26"; the card's right edge curls like a lifted page; "26" gets a solid red circle (scale pop).
13. 12.5–14.0 s: hard cut to black. The wordmark "[henryexists]" in thin white sans scales 1.08→1.0 and resolves from blur 6px→0, with a slight letter-spacing tighten.

---

## FansaChat version (fill the brackets)
- Note: "What is slowing my agency down?" → ❌ "More clients?" ❌ "More hours?" ✅ "Automation?"
- "let's fix that" → "in one sentence." → particles form the FansaChat chat box; the typed sentence morphs into the first workflow node; nodes slide in like the calendar columns; zoom-out reveals the full workflow; the run steps light up row by row (like the red pills); push in on "✓ Done"; end card = FansaChat logo + wordmark.
- Truth rule: only real product UI and real features (chat-build must be live before we show it to visitors).
