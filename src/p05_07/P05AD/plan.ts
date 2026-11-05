// P05 as a PRODUCTION AD (no voice, music-led). Pure timeline: every cut and big move sits on the 140 bpm grid of
// the CC0 music, and the SFX events (~1.9 per second, each on a visible beat) come from the same numbers.
// Picture: Film.tsx. Sound: dump.ts -> tools/p05_07/ad_mix.py (presets-lab one-shots). MIT, our own code.
import results from '../../../public/real/real_results.json';
import {Camera} from '../kit/camera';
import {Sfx, Timeline} from '../kit/events';
import {Glow, glowAt} from '../kit/glowtime';

export const FPS = 60;
export const BPM = 140;
export const BEAT = (60 / BPM) * FPS; // 25.714 frames
export const b = (n: number) => Math.round(n * BEAT);
export const TOTAL = b(31.5); // 810 frames = 13.50 s (founder update: 13-14 s, rapid)
// CC0 "High Technologic Beat Explosion" (Loyalty Freak Music). Its beat grid (140 bpm) starts at 0.006 s and the
// full section hits at 54.43 s (beat 127, +8 dB): start 9 beats earlier so that hit lands on the cut to the product.
export const MUSIC = 'audio/01_upbeat-tech_high-technologic-beat-explosion_loyalty-freak-music.mp3';
export const MUSIC_OFFSET = (127 - 9) * (60 / BPM) + 0.006;

export const PERSON = results.P05.notion[0].title as string; // the page the real run created
export const CHAT = results.P05.slack[0].text as string;     // the message the real run posted
export const PROMPT = 'When a sales call is booked, prep it for me.';
export const HOOK = ['Sales', 'calls', 'slip', 'through.']; // typed as one line "Sales calls slip through."

// glow-trail typing (presets-lab GlowTrailTypewriter): hook at ~13 letters/s, prompt burst at ~17/s
export const GH: Glow = {start: 4, perChar: 4.5, head: 3.5};
export const GP: Glow = {start: b(18.5) + 6, perChar: 3.5, head: 3.5};
export const HOOK_FROM = [0, 6, 12, 17]; // index of each word's first letter in "Sales calls slip through."

export const T = {
  box: Math.ceil(glowAt(GH, 15)) + 1,                     // highlight box snaps on when "slip" is typed
  cut1: b(5), steps: [b(5.5), b(5.75), b(6)], tight: b(7.5), // problem: items snap into orbit in 3 steps, orbit tightens
  cut2: b(9), toB: b(12), toC: b(15), page: b(15) + 14, chat: b(17), // product (music drop on cut2)
  cut3: b(18), bar: b(18.5), rise0: b(22), out: b(25.25),   // prompt beat
  logo: b(26), word: b(26) + 8, tag: b(27), pill: b(28.5), end: TOTAL,
};
export const BUILD = T.toC - 14; // the real diagram is drawn: charge ends here, the data dot leaves screen B
export const TICKS = [0, 1, 2].map((i) => T.page + 16 + i * 5); // three checkboxes tick on the deal page

// footage: [source start s, source end s, speed] for each screen; out frame -> source s
export const CLIP = {A: {f0: T.cut2, a: 8.2, b: 32.4, r: 16}, B: {f0: T.toB - 10, a: 36.0, b: 40.2, r: 3.1}};
export const srcT = (c: {f0: number; a: number; b: number; r: number}, f: number) => Math.min(c.b, Math.max(c.a, c.a + ((f - c.f0) / FPS) * c.r));

// ---------- world: three fanned screens (world px, centre of each screen) ----------
export const SCR = {
  A: {x: -1000, y: 0, w: 896, h: 736, ry: 18, z: -120, crop: {x: 0, y: 600, s: 1.6}},
  B: {x: 0, y: 0, w: 910, h: 525, ry: 0, z: 0, crop: {x: 1075, y: 468, s: 2.3}},
  C: {x: 1000, y: 0, w: 900, h: 880, ry: -14, z: -120},
};
export const capRoom = (h: number) => Math.round(h * 0.06 + 136);
export function cams(h: number) {
  const room = capRoom(h);
  const fit = (s: {w: number; h: number}) => Math.min(1080 * 0.86 / s.w, (h - room - h * 0.06 - 40) / s.h, 1.05);
  const at = (s: {x: number; y: number; w: number; h: number}) => { const z = fit(s); return {x: s.x, y: s.y - room / 2 / z, zoom: z}; };
  const C = at(SCR.C);
  const prod = new Camera([
    {f: T.cut2, dur: 0, to: {x: 0, y: 0, zoom: 0.34, yaw: -10, pitch: 8, roll: 0}, cut: true},
    {f: T.cut2 + 4, dur: 40, to: {...at(SCR.A), yaw: 0, pitch: 0}, curve: 'swift2', stiff: 14},
    {f: T.toB - 8, dur: 30, to: {...at(SCR.B), roll: 0}, curve: 'swift2', stiff: 14},
    {f: T.toC - 8, dur: 30, to: C, curve: 'swift2', stiff: 14},
    {f: T.toC + 26, dur: 150, to: {...C, zoom: C.zoom * 1.04}, curve: 'softOut', stiff: 10},
  ], TOTAL, 1080, h, {x: 0, y: 0, zoom: 0.34});
  const prob = new Camera([
    {f: T.cut1, dur: 0, to: {x: 0, y: 0, zoom: 1.04, roll: -1.5}, cut: true},
    {f: T.cut1 + 2, dur: 70, to: {x: 0, y: 0, zoom: 1.0, roll: 0}, curve: 'softOut', stiff: 10},
    {f: T.tight - 6, dur: 40, to: {x: 0, y: 0, zoom: 1.08, roll: 1.5}, curve: 'swift2', stiff: 12},
  ], TOTAL, 1080, h, {x: 0, y: 0, zoom: 1.04});
  return {prod, prob};
}

// ---------- the problem orbit: 6 items on one ellipse (one ring, even spacing = no text ever overlaps) ----------
export const ORBIT = (f: number, h: number) => {
  const tall = h > 1500; const k = Math.min(1, Math.max(0, (f - T.tight) / 24)); const e = k * k * (3 - 2 * k);
  const rx = 340 - 50 * e, ry = (tall ? 470 : 330) - (tall ? 110 : 40) * e;
  const ang = ((f - T.cut1) / FPS) * (0.55 + 0.9 * e) + 0.4 + e * 0.6; // radians
  return {rx, ry, ang};
};

// ---------- sound: music-led + hits on cuts + presets-lab "viral" styles, ~1.9 per second, each on a visible beat ----------
export function events(): Sfx[] {
  const tl = new Timeline();
  tl.add({f: GH.start, kind: 'stutter', gain: -2, src: 'hook typing burst'});
  tl.add([{f: T.box - 2, kind: 'whoosh', src: 'box snaps on "slip"', gain: -2}, {f: T.box, kind: 'pop', src: 'box lands'}]);
  tl.add({f: T.cut1, kind: 'impact', src: 'hard cut to the problem'});
  T.steps.forEach((f, i) => tl.add({f, kind: 'mech', gain: i - 1, src: `orbit items snap in (step ${i + 1}/3)`}));
  tl.add({f: T.tight, kind: 'whoosh', src: 'orbit tightens'});
  tl.add({f: T.cut2, kind: 'click', gain: 2, src: 'hard cut to the product (music drop)'});
  tl.add({f: T.cut2 + 10, kind: 'stutter', gain: -4, src: 'typing burst on screen A'});
  tl.add({f: T.toB + 4, kind: 'whoosh', gain: -5, src: 'swish: screen A -> B'});
  tl.add({f: BUILD, kind: 'charge', dur: BUILD - T.toB - 6, src: 'charge: the diagram builds'});
  tl.add({f: BUILD, kind: 'data', dur: T.page - BUILD, src: 'data loop under the data dot (B -> C)'});
  tl.add({f: T.toC + 4, kind: 'whoosh', gain: -6, src: 'swish: screen B -> C'});
  tl.add({f: T.page, kind: 'pop', src: 'deal page lands'});
  TICKS.forEach((f, i) => tl.add({f, kind: 'mech', gain: -2 + i, src: `checkbox ${i + 1} ticks`}));
  tl.add({f: T.chat, kind: 'pop', gain: -1, src: 'chat message lands'});
  tl.add({f: T.cut3 + 2, kind: 'whoosh', gain: -4, src: 'cut to dark, ring forms'});
  tl.add({f: T.bar, kind: 'pop', gain: 1, src: 'ring becomes the prompt bar'});
  tl.add({f: GP.start, kind: 'stutter', gain: -2, src: 'prompt typing burst'});
  tl.add({f: T.logo, kind: 'riser', dur: T.logo - T.rise0, src: 'riser into the logo'});
  tl.add({f: T.logo - 4, kind: 'whoosh', gain: 0, src: 'bar flies out'});
  tl.add({f: T.logo, kind: 'impact', src: 'logo'});
  tl.add({f: T.pill + 2, kind: 'pop', gain: -1, src: 'waitlist pill'});
  return tl.ev.sort((p, q) => p.f - q.f);
}
