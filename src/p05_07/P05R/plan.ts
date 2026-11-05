// P05 on the REAL interface — pure timeline: footage cuts, cameras, typing keys from the footage, data dot, and the
// SFX events they cause. Picture (Film.tsx) and sound (tools/p05_07/sfx_mix.py via dump.ts) both read this file.
// Footage: public/real/P05_ui.webm (1920x1080, 25 fps) + its timing marks; keys/caret measured from that footage
// (footage_marks.json). Result text = public/real/real_results.json (a real run on 5 Nov). MIT, our own code.
import timing from '../../../public/real/P05_timing.json';
import results from '../../../public/real/real_results.json';
import {Camera, Move} from '../kit/camera';
import {lerp, prog} from '../kit/curves';
import {Sfx, Timeline, arrive, chime, cursorPath, flow, pop, stepped} from '../kit/events';
import marks from './footage_marks.json';

export const FPS = 60;
export const s = (sec: number) => Math.round(sec * FPS);
export const VO = [0.3, 3.4, 9.0, 12.05, 24.4, 27.6, 29.65].map(s);
export const VO_FILES = [1, 2, 3, 4, 5, 6, 7].map((i) => `v/P05/0${i}.wav`);
// line 4 of the existing take names other apps after "Right, tell FansaChat." — keep only that part
export const VO_TRIM: ([number, number] | null)[] = [null, null, null, [0, 1.45], null, null, null];
const W = (line: number, at: number) => VO[line] + s(at);
export const TOTAL = s(33);
export const MUSIC = 'audio/02_calm-minimal_once-more-with-you_loyalty-freak-music.mp3';

export const MARK = timing.mark; // ms in the footage: ready, typed, sent, shape, built, end
export const NOTION_TITLE = results.P05.notion[0].title as string;
export const SLACK_TEXT = results.P05.slack[0].text as string;
export const REQUEST = results.P05.request as string; // the sentence typed in the footage

// ---------- footage cuts: o = output s, [a, b) = source s, r = speed ----------
export const SEG = [
  {o: 11.9, a: 7.3, b: 8.2, r: 1},     // ready: empty prompt
  {o: 12.8, a: 8.2, b: 13.2, r: 2.5},  // typing starts (natural pace on screen)
  {o: 14.8, a: 13.2, b: 32.2, r: 5},   // rest of the sentence, sped up
  {o: 18.6, a: 32.2, b: 35.2, r: 1.5}, // send + shape pick
  {o: 20.6, a: 35.2, b: 40.8, r: 2},   // build + diagram (built + 2 s)
  {o: 23.4, a: 40.8, b: 43.7, r: 0.5}, // diagram holds while the data leaves it
].map((g) => ({...g, f0: s(g.o), f1: s(g.o + (g.b - g.a) / g.r)}));
export const srcAt = (f: number) => { // output frame -> source seconds
  const g = [...SEG].reverse().find((x) => f >= x.f0) ?? SEG[0];
  return g.a + Math.min(g.b - g.a, ((f - g.f0) / FPS) * g.r);
};
export const outAt = (sec: number) => { // source seconds -> output frame (first cut that shows it)
  const g = SEG.find((x) => sec >= x.a && sec < x.b) ?? SEG[SEG.length - 1];
  return g.f0 + ((sec - g.a) / g.r) * FPS;
};
export const KEYS = (marks.keys as number[]).map((ms) => outAt(ms / 1000));
export const F_ENTER = outAt(MARK.sent / 1000), F_SHAPE = outAt(MARK.shape / 1000), F_BUILT = outAt(MARK.built / 1000);
const CARET = (marks.caret as [number, number | null, number | null][]).filter((c) => c[1] !== null && c[0] >= MARK.ready);
export const caret = (f: number) => { // caret in source px (= world px of the footage card)
  const ms = srcAt(f) * 1000; let i = 0; while (i < CARET.length - 2 && CARET[i + 1][0] <= ms) i++;
  const a = CARET[i], b = CARET[i + 1]; const t = Math.max(0, Math.min(1, (ms - a[0]) / Math.max(1, b[0] - a[0])));
  return {x: lerp(a[1]!, b[1]!, t), y: lerp(a[2]!, b[2]!, t)};
};

// ---------- world B (footage card at 0,0 in source px; result cards below it) ----------
export const UI = {prompt: {x: 270, y: 930}, modal: {x: 1248, y: 567}, horizontal: {x: 1036, y: 444}, loader: {x: 1245, y: 590},
  diagram: {x: 1272, y: 580}, trig: {x: 1186, y: 582}, notion: {x: 1356, y: 538}, slack: {x: 1356, y: 628}};
export const CARD = {x: 1300, w: 860, notion: {y: 1320, h: 470}, slack: {y: 2010, h: 360}};
export const CHIP = {x: UI.trig.x + 30, y: UI.trig.y + 95}; // the booking chip under the trigger node

// ---------- beats (frames) ----------
export const T = {
  head: s(0.2), this: W(0, 1.3), that: W(0, 2.26), hookOut: s(3.3),
  booking: W(1, 0.55), note1: W(1, 2.64), note2: W(1, 3.24), cal: W(1, 3.9), calOut: s(9.0),
  forgot: W(2, 0.64), mattered: W(2, 2.16), whip: s(11.72), cutB: s(11.9),
  chip: s(22.75), d1: s(23.0), d2: s(23.55), notionIn: s(24.5), d3: s(24.95), slackIn: s(25.8),
  auto: W(4, 1.9), outB: s(27.3), F: s(27.45), outF: s(29.25), end: s(29.4), pill: s(30.0),
};
export const D = {d1: 32, d2: 40, d3: 44};
export const CAPS: [string, number, number][] = [ // screen captions over the footage, one at a time
  ['Type one sentence', s(12.3), F_ENTER + 14],
  ['Pick how it reads', F_ENTER + 22, F_SHAPE + 26],
  ['It draws the workflow', F_SHAPE + 34, T.chip - 4],
  ['A booking comes in', T.chip + 4, T.notionIn],
];
export const cursor = cursorPath([
  {f: F_SHAPE - 56, x: 1420, y: 760}, {f: F_SHAPE - 8, x: UI.horizontal.x, y: UI.horizontal.y}, {f: F_SHAPE, x: UI.horizontal.x, y: UI.horizontal.y, click: true}, {f: F_SHAPE + 44, x: 1120, y: 560},
]);
const q = (a: {x: number; y: number}, b: {x: number; y: number}, t: number, bend = 0) => { const m = {x: (a.x + b.x) / 2 + bend, y: (a.y + b.y) / 2 - Math.abs(bend)}; return {x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * m.x + t * t * b.x, y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * m.y + t * t * b.y}; };
/** the data dot in world B, or null */
export const dot = (f: number) => {
  if (f >= T.d1 && f < T.d1 + D.d1) return q(UI.trig, UI.notion, prog(f, T.d1, D.d1, 'inOut'), 10);
  if (f >= T.d2 && f < T.d2 + D.d2) return q({x: UI.notion.x, y: UI.notion.y + 30}, {x: CARD.x, y: CARD.notion.y}, prog(f, T.d2, D.d2, 'inOut'), 40);
  if (f >= T.d3 && f < T.d3 + D.d3) return q({x: CARD.x, y: CARD.notion.y + CARD.notion.h}, {x: CARD.x, y: CARD.slack.y}, prog(f, T.d3, D.d3, 'inOut'));
  return null;
};
export const notionArr = arrive(T.notionIn, 26, 300, 'snapOut', {land: true, src: 'notion'});
export const slackArr = arrive(T.slackIn, 26, 300, 'snapOut', {land: true, src: 'slack'});

// ---------- cameras (per frame height: 9:16 and 4:5 frame the same subjects) ----------
const both = (h: number) => { // frame both result cards under the headline
  const top = CARD.notion.y, bot = CARD.slack.y + CARD.slack.h, room = h * 0.06 + 250;
  const z = Math.min(h > 1500 ? 1.12 : 1, (h * 0.94 - 40 - room) / (bot - top)); return {x: CARD.x, y: top + (h / 2 - room) / z, zoom: z};
};
export function cams(h: number) {
  const tall = h > 1500; // 9:16 sees more height: frame tighter so the subject fills it
  const zA = tall ? 1.06 : 1, yA = tall ? 880 : 960, yP = tall ? 920 : 1000, zN = tall ? 1.85 : 1.58;
  const camA = new Camera([
    {f: 0, dur: 0, to: {x: 540, y: yA, zoom: zA * 0.96}, cut: true},
    {f: 6, dur: 90, to: {x: 540, y: yA, zoom: zA}, curve: 'softOut'},
    {f: T.this - 4, dur: 30, to: {x: 528, y: yA, zoom: zA, roll: -0.8}, curve: 'swift2'},      // lean to THIS
    {f: T.that - 4, dur: 30, to: {x: 552, y: yA, zoom: zA, roll: 0.8}, curve: 'swift2'},       // lean to THAT
    {f: T.hookOut, dur: 40, to: {x: 540, y: yP, zoom: zA, roll: 0}, curve: 'inOut'},
    {f: T.cal - 10, dur: 70, to: {x: 540, y: yP + 20, zoom: zA * 0.98}, curve: 'inOut'},     // the day piles up
    {f: T.calOut + 6, dur: 70, to: {x: 730, y: 905, zoom: zN, roll: -1.2}, curve: 'swift2'},  // rack onto the note
    {f: T.mattered - 20, dur: 50, to: {x: 730, y: 915, zoom: zN * 1.04, roll: -1.6}, curve: 'softOut'},
    {f: T.whip, dur: 12, to: {x: 2400, y: 915, zoom: zN * 1.04, roll: 0}, curve: 'inHard', stiff: 40}, // whip right
  ], TOTAL, 1080, h);
  const B = both(h);
  const zT = tall ? 2.0 : 1.75, zM = 1.45, zL = tall ? 1.6 : 1.3, zD = tall ? 2.7 : 2.4, zC = tall ? 1.12 : 1;
  // typing: keep the bottom of the real page near the bottom of the frame, so the chat panel fills the frame above
  const typeY = (cy: number) => Math.min(cy - 40, 1080 - (h / 2 - 110) / zT);
  const typeX = (cx: number) => (tall ? 268 : lerp(UI.prompt.x, cx, 0.35));
  const camB = new Camera([
    {f: T.cutB, dur: 0, to: {x: 1000, y: 560, zoom: 0.6, yaw: -9, roll: 0.6}, cut: true},    // the whole real page, 3D card
    {f: T.cutB + 8, dur: 52, to: {x: typeX(UI.prompt.x), y: typeY(UI.prompt.y), zoom: zT, yaw: 0, roll: 0}, curve: 'swift2'}, // push into the prompt
    {f: s(12.9), dur: 40, to: (f) => { const c = caret(f); return {x: typeX(c.x), y: typeY(c.y), zoom: zT}; }, curve: 'softOut'}, // track the real caret
    {f: F_ENTER + 8, dur: 44, to: {x: UI.modal.x, y: UI.modal.y, zoom: zM}, curve: 'swift2'},     // to the shape picker
    {f: F_SHAPE + 30, dur: 40, to: {x: UI.loader.x, y: UI.loader.y, zoom: zL}, curve: 'inOut'},
    {f: F_BUILT - 6, dur: 70, to: {x: UI.diagram.x, y: UI.diagram.y, zoom: zD}, curve: 'softOut'}, // push into the diagram as it draws
    {f: T.d2, dur: 20, to: (f) => { const d = dot(f) ?? {x: CARD.x, y: CARD.notion.y}; const t = prog(f, T.d2, D.d2, 'inOut'), tz = prog(f, T.d2, D.d2 * 0.6, 'inOut'); return {x: lerp(UI.diagram.x, CARD.x, t), y: d.y, zoom: lerp(zD, zC, tz)}; }, curve: 'softOut'}, // follow the dot out
    {f: T.d2 + D.d2, dur: 50, to: {x: CARD.x, y: CARD.notion.y + 240, zoom: zC}, curve: 'softOut'},
    {f: T.d3, dur: 56, to: B, curve: 'inOut'},
    {f: T.auto, dur: 90, to: {...B, zoom: B.zoom * 1.02}, curve: 'softOut'},
  ], TOTAL, 1080, h, {x: 1000, y: 560, zoom: 0.6});
  return {camA, camB};
}
const C1920 = cams(1920);

// ---------- sound events (all derived from the numbers above) ----------
export function events(): Sfx[] {
  const tl = new Timeline();
  tl.add(C1920.camA.whooshes('camA').filter((e) => e.f < T.whip - 6));
  tl.add(C1920.camB.whooshes('camB').filter((e) => e.f > T.cutB + 4 && e.f < T.outB));
  // hook
  tl.add(stepped([0, 1, 2].map((i) => T.head + i * 6), 'head'));
  tl.add([0, 1, 2, 3].map((i) => ({f: T.this + i * 4, kind: 'mech' as const, gain: -2, pitch: 1 - i * 0.03, src: 'THIS'})));
  tl.add([0, 1, 2, 3].map((i) => ({f: T.that + i * 4, kind: 'mech' as const, gain: -2, pitch: 1.05 + i * 0.03, src: 'THAT'})));
  // problem: booking notification, sticky notes slap, the day piles in, the note nobody prepped
  tl.add(arrive(T.booking, 24, 500, 'snapOut', {src: 'booking'}).ev); tl.add(chime(T.booking + 12, -2, 'booking'));
  [T.note1, T.note2].forEach((f) => tl.add([{f: f - 8, kind: 'swipe', dur: 10, gain: -6, src: 'sticky'}, {f, kind: 'land', gain: 4, src: 'sticky'}]));
  tl.add(arrive(T.cal, 30, 900, 'snapOut', {land: true, src: 'calendar'}).ev);
  tl.add([0, 1, 2, 3, 4].map((i) => pop(T.cal + 26 + i * 9, -3 + (i % 2), 'meeting')));
  tl.add({f: T.calOut, kind: 'swipe', dur: 18, gain: -4, src: 'calendar-out'});
  tl.add([{f: T.forgot, kind: 'swipe', dur: 12, gain: -2, src: 'strike'}, {f: T.forgot + 10, kind: 'stamp', src: 'not-prepped'}]);
  tl.add({f: T.whip - 4, kind: 'swipe', dur: 16, gain: 0, src: 'whip'});
  // the real footage: one key per character typed IN the footage, Enter on send, click on the shape pick
  KEYS.forEach((f, i) => { const gap = i ? f - KEYS[i - 1] : 9; tl.add({f, kind: REQUEST[i] === ' ' ? 'space' : 'key', src: 'footage', gain: (gap < 3 ? -5 : 0) + ((i * 37) % 7 - 3) * 0.6, pitch: 1 + (((i * 53) % 11) - 5) * 0.012}); });
  tl.add({f: F_ENTER, kind: 'enter', src: 'footage'});
  tl.add(cursor.ev); tl.add(pop(F_SHAPE + 3, -3, 'shape'));
  tl.add([pop(F_BUILT, -2, 'node'), pop(F_BUILT + 8, -3, 'node'), pop(F_BUILT + 16, -3, 'node'), flow(F_BUILT + 4, 40, 'wires')]);
  // the data leaves the diagram
  tl.add([pop(T.chip, -4, 'booking-chip'), chime(T.chip + 4, -4, 'booking')]);
  tl.add([flow(T.d1, D.d1, 'dot1'), flow(T.d2, D.d2, 'dot2'), flow(T.d3, D.d3, 'dot3')]);
  tl.add(notionArr.ev); tl.add({f: T.notionIn + 30, kind: 'stamp', gain: -3, src: 'page-created'});
  tl.add(slackArr.ev); tl.add(chime(T.slackIn + 10, 0, 'slack'));
  tl.add([{f: T.auto - 44, kind: 'riser', dur: 42, src: 'auto'}, {f: T.auto, kind: 'impact', src: 'auto'}]);
  // which side + end card
  tl.add({f: T.outB, kind: 'swipe', dur: 16, gain: -3, src: 'to-question'});
  tl.add([pop(T.F + 10, -2, 'this-card'), pop(T.F + 18, -2, 'that-card')]);
  tl.add([{f: T.end - 6, kind: 'swipe', dur: 16, src: 'wipe'}, {f: T.end + 8, kind: 'impact', gain: -5, src: 'logo'}, flow(T.end + 40, 50, 'end-chain')]);
  return tl.sorted();
}
