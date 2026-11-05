# Sound map — sound follows the action (P05–P07 and later)

Rule: every sound is caused by something visible, and lasts only as long as that thing happens. Silence between
beats is fine. The code emits events from the animation (`kit/events.ts`); `tools/sfx_mix.py` places the sounds
from those events, so sound cannot drift from picture.

## What the research says
Marked **[S]** = sourced, **[R]** = our rule / starting value, to check by ear and against the study numbers.

- Explainer / SaaS sound design is split into layers: interface + UI sounds, whooshes + transitions, impacts +
  risers [S] ([HeroUI launch video sound design case study, Contra](https://contra.com/p/ks662MrZ-hero-ui-launch-video-sound-design-exploration)).
- The voice carries the message; SFX help the viewer follow movement, transitions and UI actions [S]
  ([Motion The Agency](https://www.motiontheagency.com/blog/sound-design-for-explainer-videos)); a sharp snap is
  for one point you want to underline, used sparingly [S] ([Morphic](https://morphic.com/resources/use-cases/sound-effects-for-explainer-videos)).
- Ducking: a gentle duck is 6–12 dB, attack ~30–80 ms, release ~250–700 ms [S]
  ([CapCut guide](https://www.capcut.com/create/audio-ducking-for-clear-dialogue-in-video)); music often 10–20 dB
  under speech; there is no broadcast standard for ducking depth [S]
  ([Salford University paper](https://salford-repository.worktribe.com/output/1341554/loudness-differences-for-voice-over-voice-audio-in-tv-and-streaming),
  [Mubert docs](https://mubert.com/tools/cast/docs/music-too-loud.md)). Premiere can also duck SFX and ambience,
  not only music [S] ([Freepik / Premiere auto-ducking](https://www.freepik.com/blog/how-to-use-auto-ducking-in-premiere-pro-for-clean-professional-audio)).
- Repetition kills realism: vary pitch (~0.9–1.1) and level per trigger, round-robin several samples [S]
  ([Game Developer — The power of pitch shifting](https://gamedeveloper.com/audio/the-power-of-pitch-shifting),
  [IRPR — why is my game audio repetitive](https://sounddesign.irpr.agency/guides/why-is-my-game-audio-repetitive/)).
- Apple builds UI sounds from the physical object (strike the real material, keep it short and soft) [S]
  ([Twenty Thousand Hertz — The Sound of Apple](https://www.20k.org/episodes/the-sound-of-apple)).
- Online video delivery ≈ -14 LUFS integrated, true peak ≤ -1 dBTP [R, platform convention].

## Event → sound → level → length
Levels are peak dBFS of the one-shot before the final loudness pass (VO sits ≈ -6 dBFS peak). Pitch/level jitter
per trigger is seeded, so a render is repeatable.

| Event (emitted by) | Sound | Level | Length | Notes |
|---|---|---|---|---|
| `key` — one character appears in a typed line (`typing()`) | short mechanical switch (round-robin of 5) + soft 180 Hz body | -24 dBFS ±2.5 dB, pitch ±6 % | 25–60 ms | one per character, never a loop; stops when typing stops; space = lower pitch, no body |
| `enter` — typed line submitted | heavier switch + low thock | -19 dBFS | 80 ms | once |
| `click` — cursor press on a button (`cursor.click`) | mouse press, release 70 ms later | -20 dBFS | 60 + 70 ms | + `pop` if the button reacts |
| `pop` — chip / badge / node scales in with spring | 900→300 Hz pitch-drop blip | -26 dBFS | 60 ms | small things only |
| `whoosh` — card/panel/camera move faster than ~1.2 frame-widths/s (`arrive()`, camera velocity) | band-passed noise sweep, peak placed on the fastest frame | -30 … -20 dBFS scaled by peak speed | = move duration, 0.2–0.9 s | slow moves get nothing |
| `land` — card settles (progress ≥ 0.97) | soft low thud | -28 dBFS | 120 ms | only for big panels |
| `chime` — notification / new lead / message arrives | 2-partial glass bell | -20 dBFS | 0.5 s tail | one per notification, never a click |
| `tick` — counter value changes (`countUp()`) | 20 ms tick, pitch rises 3 % over the count | -30 dBFS | 20 ms | one per displayed change, min 35 ms apart, so ticks slow down with the ease |
| `data` — data dot travelling along a wire (`flow()`) | high, quiet random blips on a 30 ms grid | -34 dBFS | exactly the travel time | under the flow only |
| `mech` — stepped (time-quantised) text, toggle, stamp | mechanical switch, one per step | -22 dBFS | 30 ms | only for mechanical-looking events |
| `stamp` — "Saved" / "Synced ✓" stamp lands | plate tap + body | -22 dBFS | 0.25 s | |
| `swipe` — circle / bloom / wipe transition | bright short whoosh | -24 dBFS | wipe duration | peak on the cut |
| `riser` — camera charges into depth before a hero word | detuned saw + noise riser | -28 → -20 dBFS | 0.6–1.2 s | ends 1 frame before `impact` |
| `impact` — hero word lands | 55 Hz sub drop + soft crack | -14 dBFS | 0.5 s | max 3 per video |

## Mix
- SFX bus ducks 4 dB under VO (attack 30 ms, release 300 ms) [R]; impacts are not ducked.
- Music variant: music bed 15 dB under VO, side-chain ducked by the VO (ratio 4, release 400 ms), fades in 1 s,
  out 2.5 s [R]. No-music variant: same VO + SFX.
- Final: 2-pass `loudnorm` to -14 LUFS, TP -1.5 dBTP.
- QA: `sfx_report.json` lists every event with frame number; the 4 fps contact sheet shows the event marks under
  each frame so a missing or late sound is visible.
