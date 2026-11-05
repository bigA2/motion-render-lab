// P05 "This or that: sales-call follow-up" — pure timeline: layout, camera, typing, counters and the SFX events
// they cause. Picture (Film.tsx) and sound (tools/p05_07/sfx_mix.py via dump.ts) both read this file.
import {Camera, Move} from '../kit/camera';
import {lerp, prog} from '../kit/curves';
import {Sfx, Timeline, arrive, chime, countUp, cursorPath, flow, pop, stepped, typing} from '../kit/events';

export const FPS = 60;
const s = (sec: number) => Math.round(sec * FPS);
// VO line starts (s) and key word times (absolute s) from vo.json word timings
export const VO = [0.3, 3.4, 8.95, 12.1, 21.3, 24.6, 26.3].map(s);
export const VO_FILES = [1, 2, 3, 4, 5, 6, 7].map((i) => `v/P05/0${i}.wav`);
const W = (line: number, at: number) => VO[line] + s(at);
export const TOTAL = s(29.6);
export const SC = {A: 0, B: s(3.33), C: s(9.0), D: s(12.0), E: s(18.17), F: s(24.5), END: TOTAL};

// ---------- world layout (px). Divider at x = 1080: left = sticky-note chaos, right = automatic ----------
export const L = {
  div: 1080,
  head: {x: 1080, y: 300},
  pile: {x: 820, y: 1010}, dash: {x: 1350, y: 1010},
  toast: {x: 560, y: 520}, board: {x: 560, y: 1060}, cal: {x: 560, y: 1560}, sticky: {x: 840, y: 1150},
  prompt: {x: 2150, y: 700, w: 960},
  nodes: [{x: 2150, y: 1180}, {x: 2150, y: 1480}, {x: 2150, y: 1780}],
  deal: {x: 2150, y: 2420}, card: {x: 2150, y: 3300},
};

// ---------- timed things ----------
export const T = {
  headIn: W(0, 0) + 2, this: W(0, 1.3), that: W(0, 2.26),
  toastIn: W(1, 0.6), note1: W(1, 2.64), note2: W(1, 3.24), dayStart: W(1, 4.0), xMark: s(8.55),
  forgot: W(2, 0.64), mattered: W(2, 2.16), whip: s(11.7),
  typeStart: W(3, 1.15), // after "tell FansaChat"
  nodes: [0, 0, 0], buildStart: 0,
  booking: s(18.35), deal: 0, card: 0, tracked: W(4, 0.84), prepped: W(4, 1.48), auto: W(4, 1.9),
  pollClick: W(5, 0.7), endCard: s(26.2),
};
// prompt window geometry (Film.tsx uses the same numbers): window top-left, text block origin, char width, line height
export const PROMPT = {x: 1650, y: 470, w: 1000, side: 190};
export const PROMPT_TEXT = {x: 1650 + 28 + 190 + 26, y: 470 + 80 + 28 + 50 + 14, cw: 22.4, lh: 62, size: 44};
export const SENTENCE = 'When someone books on Calendly, create a deal in Pipedrive and a prep card in Trello.';
export const LINES = ['When someone books on', 'Calendly, create a deal in', 'Pipedrive and a prep card', 'in Trello.'];
export const typed = typing(SENTENCE, T.typeStart, {cps: 24, seed: 5, enter: true, src: 'prompt'});
T.buildStart = Math.round(typed.end + 10);
T.nodes = [T.buildStart + 8, T.buildStart + 26, T.buildStart + 44];
// payoff: booking toast -> dot to Pipedrive -> deal card -> dot to Trello -> prep card
export const P = {
  toast: T.booking, dot1: [T.booking + 30, 62] as const, dealIn: T.booking + 88, value: [T.booking + 100, 56] as const,
  stamp: T.booking + 170, dot2: [T.booking + 176, 56] as const, cardIn: T.booking + 228, checks: [T.booking + 262, T.booking + 276],
};
T.deal = P.dealIn; T.card = P.cardIn;
export const dealArr = arrive(P.dealIn, 30, 360, 'snapOut', {land: true, src: 'deal'});
export const cardArr = arrive(P.cardIn, 30, 360, 'snapOut', {land: true, src: 'card'});
export const value = countUp(0, 4800, P.value[0], P.value[1], 'softOut', 100, 'value');
export const score = countUp(0, 82, P.value[0] + 10, 50, 'softOut', 1, 'score');
export const poll = countUp(0, 88, T.pollClick + 6, 30, 'softOut', 1, 'poll');
// calendar fills ("the day happens"): 9 meetings pop in on a stepped rhythm
export const MEET = [
  ['9:00', 'Standup', 0], ['9:30', 'Hiring sync — Ops', 1], ['10:00', 'Q4 forecast review', 2], ['11:00', 'Vendor call · Northwind', 0],
  ['12:00', 'Lunch w/ Sam', 3], ['13:00', 'Board deck edits', 2], ['14:30', 'Dana Whitfield — Discovery', 4], ['15:30', '1:1 Priya', 1], ['16:00', 'Ship review', 0],
] as const;
export const meetAt = MEET.map((_, i) => T.dayStart + i * 8);
// sticky notes arriving on the board (slap)
export const notes = [
  {txt: 'add Dana to CRM!!', at: T.note1, x: -200, y: -40, r: -5, c: '#FFE066'},
  {txt: 'prep for Dana call', at: T.note2, x: 40, y: 10, r: 4, c: '#FF9EBB'},
];
// "you mean to add them to your CRM": cursor snoozes the booking email instead
export const SNOOZE = {x: 462, y: 640, at: s(4.95)};
export const cursorB = cursorPath([
  {f: T.toastIn + 24, x: 860, y: 980}, {f: SNOOZE.at - 4, x: SNOOZE.x, y: SNOOZE.y}, {f: SNOOZE.at, x: SNOOZE.x, y: SNOOZE.y, click: true}, {f: SNOOZE.at + 50, x: SNOOZE.x + 160, y: SNOOZE.y + 260},
]);
export const cursor = cursorPath([
  {f: T.pollClick - 46, x: 920, y: 1420}, {f: T.pollClick - 4, x: 640, y: 1050}, {f: T.pollClick, x: 640, y: 1050, click: true}, {f: T.pollClick + 40, x: 700, y: 1130},
]);

// ---------- camera (one world, one camera: it tracks the subject of each beat) ----------
const caretPos = (f: number) => {
  const n = typed.count(f); let k = n, li = 0;
  while (li < LINES.length - 1 && k > LINES[li].length + 1) { k -= LINES[li].length + 1; li++; }
  return {x: PROMPT_TEXT.x + Math.min(k, LINES[li].length) * PROMPT_TEXT.cw, y: PROMPT_TEXT.y + li * PROMPT_TEXT.lh};
};
export const caret = caretPos;
const dot = (a: {x: number; y: number}, b: {x: number; y: number}, f: number, f0: number, d: number) => { const t = prog(f, f0, d, 'inOut'); return {x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t)}; };
const moves: Move[] = [
  {f: 0, dur: 0, to: {x: 1080, y: 960, zoom: 1.04}, cut: true},
  {f: 10, dur: 80, to: {x: 1080, y: 980, zoom: 1.12}, curve: 'softOut'},                      // drift with the headline
  {f: T.this - 6, dur: 26, to: {x: 860, y: 1000, zoom: 1.22, roll: -1.5}, curve: 'swift2'},     // track "THIS"
  {f: T.that - 6, dur: 22, to: {x: 1300, y: 1000, zoom: 1.22, roll: 1.5}, curve: 'swift2'},     // track "THAT"
  {f: SC.B - 4, dur: 40, to: {x: 600, y: 760, zoom: 1.1, roll: 0}, curve: 'swift'},            // to the booking toast
  {f: T.note1 - 20, dur: 50, to: {x: 560, y: 1000, zoom: 1.05}, curve: 'inOut'},              // sticky notes
  {f: T.dayStart - 10, dur: 70, to: {x: 560, y: 1330, zoom: 0.86}, curve: 'inOut'},           // calendar fills
  {f: SC.C, dur: 60, to: {x: L.sticky.x + 40, y: L.sticky.y + 30, zoom: 1.55, roll: -2}, curve: 'swift2'}, // rack onto the forgotten note
  {f: T.mattered - 30, dur: 90, to: {x: L.sticky.x + 60, y: L.sticky.y + 50, zoom: 1.7, roll: -2.5}, curve: 'softOut'},
  {f: T.whip, dur: 30, to: {x: L.prompt.x, y: L.prompt.y + 40, zoom: 1.0, roll: 0}, curve: 'swift'}, // whip right across the divider
  {f: T.typeStart - 10, dur: 30, to: (f) => { const c = caretPos(f); return {x: lerp(L.prompt.x, c.x, 0.22), y: lerp(L.prompt.y + 200, c.y, 0.5), zoom: 1.42}; }, curve: 'softOut'}, // follow the caret
  {f: T.buildStart, dur: 70, to: {x: L.nodes[1].x, y: L.nodes[1].y - 120, zoom: 0.92}, curve: 'swift2'},     // nodes snap in
  {f: P.toast - 10, dur: 40, to: {x: L.nodes[0].x, y: L.nodes[0].y - 80, zoom: 1.12}, curve: 'swift2'},   // new booking hits the trigger
  {f: P.dot1[0], dur: 30, to: (f) => ({...dot(L.nodes[0], {x: L.deal.x, y: L.deal.y - 120}, f, P.dot1[0], P.dot1[1] + 40), zoom: 1.08}), curve: 'softOut'}, // track the data dot down
  {f: P.dealIn + 10, dur: 60, to: {x: L.deal.x, y: L.deal.y + 10, zoom: 1.12}, curve: 'softOut'},
  {f: P.dot2[0], dur: 30, to: (f) => ({...dot({x: L.deal.x, y: L.deal.y + 200}, {x: L.card.x, y: L.card.y - 100}, f, P.dot2[0], P.dot2[1] + 40), zoom: 1.08}), curve: 'softOut'},
  {f: P.cardIn + 10, dur: 60, to: {x: L.card.x, y: L.card.y, zoom: 1.12}, curve: 'softOut'},
  {f: T.auto - 26, dur: 34, to: {x: L.deal.x, y: (L.deal.y + L.card.y) / 2 + 40, zoom: 0.52, roll: 0}, curve: 'swift2'}, // pull back for "Automatically."
  {f: T.auto + 10, dur: 70, to: {x: L.deal.x, y: (L.deal.y + L.card.y) / 2 + 40, zoom: 0.56}, curve: 'softOut'},
];
export const cam = new Camera(moves, TOTAL, 1080, 1920);
// end scene camera (own small world): poll card then end card
export const camF = new Camera([
  {f: 0, dur: 0, to: {x: 540, y: 900, zoom: 1.2}, cut: true},
  {f: SC.F, dur: 50, to: {x: 540, y: 960, zoom: 1.0}, curve: 'softOut'},
  {f: T.pollClick - 50, dur: 50, to: (f) => { const c = cursor.at(f); return {x: lerp(540, c.x, 0.35), y: lerp(960, c.y, 0.35), zoom: 1.08}; }, curve: 'softOut'},
  {f: T.pollClick + 30, dur: 40, to: {x: 540, y: 960, zoom: 1.0}, curve: 'softOut'},
  {f: T.endCard, dur: 0, to: {x: 540, y: 960, zoom: 1.0}, cut: true},
], TOTAL, 1080, 1920);

// ---------- sound events (all derived from the numbers above) ----------
export function events(): Sfx[] {
  const tl = new Timeline();
  // camera whooshes (only fast moves) — per scene range so the end camera does not double up
  tl.add(cam.whooshes('cam').filter((e) => e.f < SC.F - 10));
  tl.add(camF.whooshes('camF').filter((e) => e.f >= SC.F));
  // hook: headline letters (mechanical stepped type), THIS / THAT per-letter clicks
  tl.add(stepped([0, 1, 2].map((i) => T.headIn + i * 7), 'head'));
  tl.add([0, 1, 2, 3].map((i) => ({f: T.this + i * 4, kind: 'mech' as const, gain: -2, pitch: 1 - i * 0.03, src: 'THIS'})));
  tl.add([0, 1, 2, 3].map((i) => ({f: T.that + i * 4, kind: 'mech' as const, gain: -2, pitch: 1.05 + i * 0.03, src: 'THAT'})));
  // problem: booking notification, notes slap, calendar fills, the X
  tl.add(arrive(T.toastIn, 24, 700, 'snapOut', {src: 'toast'}).ev); tl.add(cursorB.ev); tl.add(pop(SNOOZE.at + 4, -4, 'snoozed')); tl.add(chime(T.toastIn + 14, -2, 'calendly'));
  notes.forEach((n) => tl.add([{f: n.at, kind: 'land', gain: 4, src: 'sticky'}, {f: n.at - 8, kind: 'swipe', dur: 10, gain: -6, src: 'sticky'}]));
  tl.add(meetAt.map((f, i) => pop(f, -2 + (i % 3), 'meeting')));
  tl.add([{f: T.dayStart + 30, kind: 'chime', gain: -9, src: 'slack'}, {f: T.dayStart + 56, kind: 'chime', gain: -11, src: 'slack'}]);
  tl.add({f: T.xMark, kind: 'swipe', dur: 14, gain: 0, src: 'x'});
  // agitate: the note fades — silence except a low land when the screen dims
  // solution: typing (one key per char) + enter, app chips pop as their names complete, nodes snap
  tl.add(typed.ev);
  ['Calendly', 'Pipedrive', 'Trello'].forEach((w) => { const i = SENTENCE.indexOf(w) + w.length - 1; tl.add(pop(typed.times[i] + 3, -4, 'chip')); });
  tl.add(T.nodes.map((f) => pop(f, 0, 'node')));
  tl.add([flow(T.nodes[0] + 6, 40, 'wires')]);
  // payoff
  tl.add(chime(P.toast + 12, 0, 'booking'));
  tl.add(flow(P.dot1[0], P.dot1[1], 'dot1')); tl.add(dealArr.ev); tl.add(value.ev); tl.add(score.ev.filter((_, i) => i % 3 === 0));
  tl.add({f: P.stamp, kind: 'stamp', src: 'synced'});
  tl.add(flow(P.dot2[0], P.dot2[1], 'dot2')); tl.add(cardArr.ev);
  tl.add(P.checks.map((f) => ({f, kind: 'mech' as const, src: 'check'})));
  tl.add([{f: T.auto - 46, kind: 'riser', dur: 44, src: 'auto'}, {f: T.auto, kind: 'impact', src: 'auto'}]);
  tl.add({f: SC.F - 12, kind: 'swipe', dur: 18, src: 'bloom'});
  // end: poll click, bar ticks, end card
  tl.add(cursor.ev); tl.add(pop(T.pollClick + 2, -2, 'poll')); tl.add(poll.ev.filter((_, i) => i % 2 === 0));
  tl.add([{f: T.endCard - 10, kind: 'swipe', dur: 16, src: 'wipe'}, {f: T.endCard + 8, kind: 'impact', gain: -5, src: 'logo'}, flow(T.endCard + 40, 50, 'end-chain')]);
  return tl.sorted();
}
export const MUSIC = 'audio/02_calm-minimal_once-more-with-you_loyalty-freak-music.mp3';
