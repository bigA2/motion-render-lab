// P07 "If I were a freelance designer…" — pure timeline (layout, camera, typing, counters, SFX events).
import {Camera, Move} from '../kit/camera';
import {lerp, prog} from '../kit/curves';
import {Sfx, Timeline, arrive, chime, countUp, flow, pop, stepped, typing} from '../kit/events';

export const FPS = 60;
const s = (sec: number) => Math.round(sec * FPS);
export const VO = [0.3, 5.0, 10.5, 12.0, 21.6, 26.6].map(s);
export const VO_FILES = [1, 2, 3, 4, 5, 6].map((i) => `v/P07/0${i}.wav`);
const W = (line: number, at: number) => VO[line] + s(at);
export const TOTAL = s(29.8);
export const SC = {A: 0, B: s(4.85), C: s(10.35), D: s(11.9), E: s(19.35), F: s(26.4), END: TOTAL};
export const L = {
  card: {x: 540, y: 960},
  nodes: [0, 1, 2, 3].map((i) => ({x: 540 - 375 + i * 250, y: 1560})),
  // payoff: a vertical stack while the data flows, then the panels slide into a 2x2 dashboard ("one place")
  tally: {x: 540, y: 2350}, trello: {x: 540, y: 3030}, clock: {x: 540, y: 3700}, tele: {x: 540, y: 4420},
};
export const G = {tally: {x: 540, y: 2560}, trello: {x: 1500, y: 2560}, clock: {x: 540, y: 3330}, tele: {x: 1500, y: 3400}};
export const T = {
  swap: [s(0.3), s(0.55), s(0.8)], designer: W(0, 0.76), one: W(0, 2.22), first: W(0, 3.8),
  dm: W(1, 0.76), email: W(1, 1.58), form: W(1, 2.28), rebuild: W(1, 3.2), monday: W(1, 4.56),
  catcher: W(2, 0.1), flip: W(2, 0.55), typeStart: W(3, 0.35), buildStart: 0, nodes: [0, 0, 0, 0],
  brief: s(19.5), lands: W(4, 0.58), onePlace: W(4, 1.06), ready: W(4, 1.98), opened: W(4, 4.0), endCard: s(26.35),
};
export const ROLE = ['copywriter', 'video editor', 'freelance designer'];
export const TODO = ['Reply to Lumen DM', 'Find Aisha email', 'Check form answers', 'Make Trello card', 'Set up Clockify'];
export const todoAt = TODO.map((_, i) => T.rebuild + 6 + i * 8);
export const SENTENCE = 'When someone sends my Tally brief form, add a Trello card, create the project in Clockify, and message me on Telegram.';
export const LINES = ['When someone sends my Tally', 'brief form, add a Trello card,', 'create the project in Clockify,', 'and message me on Telegram.'];
export const PROMPT = {x: 540 - 480, y: 960 - 330, w: 960};
export const PROMPT_TEXT = {x: 540 - 480 + 34, y: 960 - 330 + 74 + 30 + 46, cw: 24.4, lh: 60, size: 40};
export const typed = typing(SENTENCE, T.typeStart, {cps: 22, seed: 23, enter: true, src: 'prompt'});
T.buildStart = Math.round(typed.end + 8);
T.nodes = [0, 1, 2, 3].map((i) => T.buildStart + i * 10);
export const slotSteps = (i: number) => [0, 1, 2, 3].map((k) => T.nodes[i] + k * 4);
export const P = {
  brief: T.brief, dot1: [T.brief + 30, 36] as const, trelloIn: T.brief + 62, dot2: [T.brief + 88, 32] as const, clockIn: T.brief + 118,
  timer: [T.brief + 130, 90] as const, dot3: [T.brief + 142, 30] as const, teleIn: T.brief + 170,
};
export const briefArr = arrive(P.brief, 28, 360, 'snapOut', {land: true, src: 'tally'});
export const trelloArr = arrive(P.trelloIn, 26, 360, 'snapOut', {land: true, src: 'trello'});
export const clockArr = arrive(P.clockIn, 26, 360, 'snapOut', {land: true, src: 'clockify'});
export const teleArr = arrive(P.teleIn, 26, 360, 'snapOut', {src: 'telegram'});
export const est = countUp(0, 70, P.clockIn + 20, 40, 'softOut', 1, 'estimate');
export const briefs = countUp(11, 12, P.brief + 20, 2, 'linear', 1, 'count');

const caretPos = (f: number) => {
  const n = typed.count(f); let k = n, li = 0;
  while (li < LINES.length - 1 && k > LINES[li].length + 1) { k -= LINES[li].length + 1; li++; }
  return {x: PROMPT_TEXT.x + Math.min(k, LINES[li].length) * PROMPT_TEXT.cw, y: PROMPT_TEXT.y + li * PROMPT_TEXT.lh};
};
export const caret = caretPos;
const DASH = {x: 1020, y: 2950};
const moves: Move[] = [
  {f: 0, dur: 0, to: {x: 540, y: 960, zoom: 1.0}, cut: true},
  {f: 6, dur: 280, to: {x: 540, y: 940, zoom: 1.22, roll: -1}, curve: 'inOut'},                      // slow push on card 01
  {f: SC.B - 10, dur: 120, to: {x: 540, y: 960, zoom: 0.95, roll: 2, yaw: 6}, curve: 'inOut'},       // bubbles swirl: orbit out
  {f: T.rebuild - 20, dur: 60, to: {x: 540, y: 1080, zoom: 1.1, roll: 0, yaw: 0}, curve: 'inOut'},  // to-do list
  {f: SC.C - 10, dur: 50, to: {x: 540, y: 960, zoom: 1.05}, curve: 'inOut'},                         // card back to centre, flip
  {f: T.typeStart - 10, dur: 40, to: (f) => { const c = caretPos(f); return {x: lerp(540, c.x, 0.1), y: lerp(1080, c.y, 0.35), zoom: 1.12}; }, curve: 'softOut'},
  {f: T.buildStart - 6, dur: 80, to: {x: 540, y: 1250, zoom: 0.92}, curve: 'inOut'},                  // slot columns
  {f: P.brief - 16, dur: 60, to: {x: L.tally.x, y: L.tally.y - 40, zoom: 1.12}, curve: 'inOut'},
  {f: P.dot1[0] - 6, dur: 64, to: {x: L.trello.x, y: (L.tally.y + L.trello.y) / 2 - 40, zoom: 0.94}, curve: 'inOut'},
  {f: P.dot2[0] - 6, dur: 64, to: {x: L.clock.x, y: (L.trello.y + L.clock.y) / 2 - 40, zoom: 0.94}, curve: 'inOut'},
  {f: T.onePlace - 24, dur: 70, to: {x: DASH.x, y: DASH.y, zoom: 0.54}, curve: 'inOut'},              // one place: the dashboard
  {f: T.onePlace + 40, dur: 80, to: {x: DASH.x, y: DASH.y, zoom: 0.6}, curve: 'softOut'},
  {f: T.opened - 70, dur: 70, to: {x: G.tele.x - 80, y: G.tele.y - 60, zoom: 1.0}, curve: 'inOut'},  // the message you have not opened yet
];
export const cam = new Camera(moves, TOTAL, 1080, 1920);
export const camF = new Camera([
  {f: 0, dur: 0, to: {x: 540, y: 960, zoom: 1.12}, cut: true},
  {f: SC.F, dur: 160, to: {x: 540, y: 960, zoom: 1.0}, curve: 'softOut'},
], TOTAL, 1080, 1920);

export function events(): Sfx[] {
  const tl = new Timeline();
  tl.add(cam.whooshes('cam').filter((e) => e.f < SC.F - 10)); tl.add(camF.whooshes('camF').filter((e) => e.f >= SC.F));
  // hook: role word swaps = key sound per swap; "01" stepped digits
  tl.add(T.swap.map((f, i) => ({f, kind: (i === 2 ? 'enter' : 'key') as 'enter' | 'key', gain: i === 2 ? -3 : 2, src: 'swap'})));
  tl.add(stepped([4, 10], 'digits'));
  tl.add({f: T.first, kind: 'mech', gain: 2, src: 'first'});
  // problem: three messages arrive (DM, email, form) — one soft chime each; to-do items stamp in, then crossed
  tl.add([T.dm, T.email, T.form].map((f, i) => chime(f, -6 - i * 2, ['dm', 'email', 'form'][i])));
  tl.add([0, 1, 2].map((i) => pop(SC.B + 4 + i * 9, -6, 'pill')));
  tl.add(stepped(todoAt, 'todo'));
  tl.add({f: T.monday, kind: 'swipe', dur: 16, gain: -4, src: 'monday'});
  // reveal: title un-blurs, card flips
  tl.add([{f: T.catcher - 4, kind: 'pop', gain: 0, src: 'title'}, {f: T.flip, kind: 'swipe', dur: 22, src: 'flip'}]);
  // body
  tl.add(typed.ev);
  ['Tally', 'Trello', 'Clockify', 'Telegram'].forEach((w) => { const i = SENTENCE.indexOf(w) + w.length - 1; tl.add(pop(typed.times[i] + 3, -4, 'chip')); });
  [0, 1, 2, 3].forEach((i) => tl.add(stepped(slotSteps(i), 'slot')));
  tl.add(flow(T.nodes[3] + 18, 40, 'wires'));
  // payoff
  tl.add(briefArr.ev); tl.add(chime(P.brief + 12, 0, 'tally'));
  tl.add(flow(P.dot1[0], P.dot1[1], 'dot1')); tl.add(trelloArr.ev);
  tl.add(flow(P.dot2[0], P.dot2[1], 'dot2')); tl.add(clockArr.ev); tl.add(est.ev.filter((_, i) => i % 2 === 0));
  tl.add(flow(P.dot3[0], P.dot3[1], 'dot3')); tl.add(teleArr.ev); tl.add(chime(P.teleIn + 16, 2, 'telegram'));
  tl.add([{f: T.onePlace - 4, kind: 'impact', gain: -6, src: 'one place'}, {f: T.ready, kind: 'stamp', gain: -4, src: 'ready'}]);
  tl.add({f: SC.F - 16, kind: 'swipe', dur: 24, src: 'sweep'});
  tl.add([{f: T.endCard + 8, kind: 'impact', gain: -6, src: 'logo'}, flow(T.endCard + 40, 60, 'end-chain')]);
  return tl.sorted();
}
export const MUSIC = 'audio/music/04_ambient-electronic_horizon-ending_soft-and-furious.mp3';
