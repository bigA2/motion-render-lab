---
name: feedback-camera-is-transition-not-continuous
description: 2026-10-23 founder rejected clones with continuous zoom/shake; camera moves only as transitions locked to text beats (overrides camera-zoom skill rules 2 + master wobble)
metadata:
  type: feedback
---
Camera/zoom/shake are TRANSITIONS, never continuous. Wanted move: first word appears → camera crash-zooms onto it → smooth near-linear pan right following the line as it writes → at line end ONE smooth transition (whip with directional blur, or the word morphs into the next thing). Shake max 4–6 frames on impact only.
Rejected: CamSeq replay of measured reference curves (random zooms/rolls, excessive), ClaudeMotion stuck on a static "$500" image over a flat background ("2001-style edit, not Apple smooth").

**Why:** founder 2026-10-23: "its a transition effect not a necessary continuousness"; clones must be zerox copies of the reference, not extra camera.
**How to apply:** overrides rule 2 ("always drifting") and "master wobble" in [[project-camera-zoom-skill]]. QA = reference vs clone frames side by side at same timestamps before showing. Show building live in Remotion Studio (localhost:3000, CDP Chrome); one clone approved before the next; P01–P07 only after clone approval.
