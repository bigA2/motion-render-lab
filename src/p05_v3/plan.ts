// P05 v3 production ad. Pure timeline + layout (no React) so the SFX dump uses the same numbers as the picture.
// 14.0 s at 60 fps, 140 bpm grid, no voice. SFX lead; the CC0 music is only a low bed. MIT, our own code.
import results from '../../public/real/real_results.json';
import {Sfx, Timeline} from '../p05_07/kit/events';
import {Glow, glowAt, glowDone} from '../p05_07/kit/glowtime';

export const FPS = 60;
export const BPM = 140;
export const BEAT = (60 / BPM) * FPS; // 25.714 frames
export const TOTAL = 840; // 14.0 s
// CC0 bed: "One Cool Minute" (Loyalty Freak Music, CC0 1.0, Free Music Archive)
export const MUSIC = 'audio/03_calm-minimal_one-cool-minute_loyalty-freak-music.mp3';
export const MUSIC_OFFSET = 4.0;

export const PERSON = results.P05.notion[0].title as string; // "Dana Whitfield"
export const CHAT = results.P05.slack[0].text as string;     // "Prep for the call with Dana Whitfield (Northwind Studio)"
export const COMPANY = 'Northwind Studio';
export const PROMPT = 'New booking? Add to Notion, ping Slack.';

// ---------------- section frames (brief table) ----------------
export const T = {
  hook: 0, copy: 90, paste: 144, repeat: 180, every: 216, collapse: 244,
  turn: 258, bar: 292, enter: 404,
  proof: 420, push: 490, built: 548, card1: 540, card2: 562, cap2: 548,
  payoff: 636, cta: 738, pill: 786, end: TOTAL,
};
// glow-trail typing: hook (~13 letters/s, starts mid-action), prompt (~21 letters/s so it fits the turn)
export const GH: Glow = {start: -6, perChar: 4.4, head: 3.5};
export const HOOK = [{t: 'Tired', from: 0}, {t: 'of', from: 6}, {t: 'manual', from: 9, hot: true}, {t: 'work?', from: 16}];
export const MANUAL_DONE = Math.ceil(glowAt(GH, 14)); // "manual" fully typed -> impact
export const GP: Glow = {start: T.bar + 8, perChar: 2.8, head: 3.5};
export const PROMPT_DONE = Math.ceil(glowDone(GP, PROMPT.length - 1));

// problem stack: 6 duplicates land with a stutter
export const STACK = [0, 1, 2, 3, 4, 5].map((i) => T.repeat + 4 + Math.round(i * 5.4));
export const CLOCK = {from: 23 * 60 + 12, to: 23 * 60 + 47}; // 11:12 PM -> 11:47 PM

// footage on the proof screen: piecewise source time (s) per frame
export const SRC = [[T.proof, 33.0], [T.built, 38.9], [T.payoff, 40.6]] as const;
export const srcT = (f: number) => {
  if (f <= SRC[0][0]) return SRC[0][1];
  for (let i = 0; i < SRC.length - 1; i++) { const [f0, s0] = SRC[i], [f1, s1] = SRC[i + 1]; if (f <= f1) return s0 + ((f - f0) / (f1 - f0)) * (s1 - s0); }
  return SRC[SRC.length - 1][1];
};
// footage view (source px, 1920x1080): wide on the chat + canvas, then pushes into the diagram as it builds
export const VIEW_WIDE = {cx: 660, cy: 560, w: 1240};
export const VIEW_DIAG = {cx: 1240, cy: 600, w: 460};

// ---------------- layout per format (screen px) ----------------
export type Box = {x: number; y: number; w: number; h: number};
export type Lay = {W: number; H: number; wide: boolean; text: Box; mock: Box; hookSize: number; wordSize: number; capSize: number;
  screen: Box; screenSmall: Box; cards: [Box, Box]; bar: Box; promptSize: number};
export function layout(W: number, H: number): Lay {
  const wide = W > H; const sx = W * 0.06, sy = H * 0.06;
  if (wide) { // 5:4 (1350x1080): text in the left 40 %, mockups in the right 55 %
    const text = {x: sx + 10, y: sy + 30, w: W * 0.4 - sx - 10, h: H - 2 * sy - 60};
    const mock = {x: W * 0.43, y: sy + 10, w: W * 0.57 - sx - 6, h: H - 2 * sy - 20};
    const screen = {x: mock.x, y: H / 2 - 300, w: mock.w, h: 600};
    return {W, H, wide, text, mock, hookSize: 132, wordSize: 104, capSize: 62, screen,
      screenSmall: screen,
      cards: [{x: text.x, y: 470, w: text.w, h: 250}, {x: text.x, y: 740, w: text.w, h: 220}],
      bar: {x: W / 2 - 560, y: H / 2 - 75, w: 1120, h: 150}, promptSize: 44};
  }
  // 4:5 (1080x1350): text in the top 30 %, mockups below
  const text = {x: sx + 10, y: sy + 10, w: W - 2 * sx - 20, h: H * 0.3 - sy};
  const mock = {x: sx, y: H * 0.32, w: W - 2 * sx, h: H * 0.68 - sy};
  const screen = {x: mock.x, y: mock.y + 20, w: mock.w, h: 640};
  return {W, H, wide, text, mock, hookSize: 132, wordSize: 112, capSize: 64, screen,
    screenSmall: {x: mock.x, y: mock.y, w: mock.w, h: 470},
    cards: [{x: mock.x, y: mock.y + 500, w: mock.w * 0.48, h: 320}, {x: mock.x + mock.w * 0.52, y: mock.y + 500, w: mock.w * 0.48, h: 320}],
    bar: {x: W / 2 - 470, y: H / 2 - 105, w: 940, h: 210}, promptSize: 46};
}

// ---------------- sound: SFX lead, each on a visible beat (~1.9 per second) ----------------
export function events(): Sfx[] {
  const tl = new Timeline();
  tl.add({f: 0, kind: 'stutter', gain: -5, src: 'hook typing burst (mid-action start)'});
  tl.add({f: MANUAL_DONE, kind: 'impact', src: 'impact on "manual"'});
  tl.add({f: T.copy, kind: 'riser', dur: 40, gain: -6, src: 'soft riser tail into the cut'});
  tl.add({f: T.copy + 8, kind: 'mech', src: 'cursor grabs the booking card'});
  tl.add({f: T.copy + 22, kind: 'whoosh', gain: -5, src: 'card dragged across'});
  tl.add({f: T.copy + 42, kind: 'pop', gain: -2, src: 'card drops into the doc card'});
  tl.add({f: T.paste + 4, kind: 'click', src: 'paste click'});
  tl.add({f: T.paste + 14, kind: 'pop', src: 'chat bubble pops in'});
  STACK.slice(0, 3).forEach((f, i) => tl.add({f, kind: 'mech', gain: -3 + i, src: `stack stutter ${i + 1}/3`}));
  tl.add({f: T.repeat + 30, kind: 'mech', gain: -6, pitch: 1.4, src: 'clock ticks to 11:47 PM'});
  tl.add({f: T.collapse - 10, kind: 'whoosh', gain: -4, src: 'stack collapses into the ring'});
  tl.add({f: T.collapse, kind: 'impact', gain: -3, pitch: 0.7, src: 'low impact: stack hits the ring'});
  tl.add({f: T.bar, kind: 'charge', dur: T.bar - T.turn, gain: -2, src: 'ring builds into the prompt bar (trim path)'});
  tl.add({f: T.bar + 2, kind: 'pop', gain: -3, src: 'prompt bar lands'});
  tl.add({f: GP.start, kind: 'stutter', gain: -6, src: 'prompt typing burst 1'});
  tl.add({f: T.enter, kind: 'click', gain: 2, src: 'Enter'});
  tl.add({f: T.proof - 2, kind: 'whoosh', gain: -3, src: 'camera flies to the glass screen'});
  tl.add({f: T.proof + 40, kind: 'data', dur: T.built - T.proof - 40, src: 'data loop under the flow build'});
  tl.add({f: T.push + 6, kind: 'whoosh', gain: -8, src: 'camera pushes into the diagram'});
  tl.add({f: T.card1, kind: 'pop', src: 'Notion page card flies out'});
  tl.add({f: T.card2, kind: 'pop', gain: -1, pitch: 1.12, src: 'Slack message card flies out'});
  tl.add({f: T.payoff - 3, kind: 'whoosh', gain: -4, src: 'white bloom'});
  tl.add({f: T.payoff, kind: 'impact', gain: -1, src: 'payoff impact'});
  tl.add({f: T.cta, kind: 'riser', dur: 80, gain: -5, src: 'riser into the logo'});
  tl.add({f: T.cta, kind: 'impact', gain: -7, src: 'soft impact: logo over the horizon'});
  tl.add({f: T.pill, kind: 'pop', gain: -3, src: 'waitlist pill'});
  return tl.ev.sort((p, q) => p.f - q.f);
}
