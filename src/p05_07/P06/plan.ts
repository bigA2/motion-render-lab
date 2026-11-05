// P06 "Urgent client messages, never missed" — pure timeline (layout, camera, typing, counters, SFX events).
import {Camera, Move} from '../kit/camera';
import {lerp, prog} from '../kit/curves';
import {Sfx, Timeline, arrive, chime, countUp, flow, pop, stepped, typing} from '../kit/events';

export const FPS = 60;
const s = (sec: number) => Math.round(sec * FPS);
export const VO = [0.3, 5.8, 10.3, 11.7, 20.6, 25.0, 26.3].map(s);
export const VO_FILES = [1, 2, 3, 4, 5, 6, 7].map((i) => `v/P06/0${i}.wav`);
const W = (line: number, at: number) => VO[line] + s(at);
export const TOTAL = s(29.6);
export const SC = {A: 0, B: s(5.55), C: s(10.15), D: s(11.6), E: s(18.3), F: s(24.8), END: TOTAL};

// world: inbox column on the left, checklist right of it, prompt + fan of nodes further right, payoff below
export const L = {
  inbox: {x: 540, y: 1000, w: 900}, urgentRow: 7, list: {x: 1560, y: 980},
  prompt: {x: 2700, y: 760, w: 960},
  nodes: [{x: 2380, y: 1330, r: -6}, {x: 2700, y: 1300, r: 0}, {x: 3020, y: 1330, r: 6}, {x: 3340, y: 1400, r: 11}],
  convo: {x: 2700, y: 2150}, task: {x: 2700, y: 3000}, discord: {x: 2700, y: 3820},
};
export const T = {
  head: W(0, 0), urgent: W(0, 1.42), buried: W(0, 2.86), fifty: W(0, 3.54),
  read: W(1, 0.72), spot: W(1, 1.82), task: W(1, 2.48), tell: W(1, 3.48),
  fix: W(2, 0), fan: W(2, 0) - 10, typeStart: W(3, 0.15), buildStart: 0, nodes: [0, 0, 0, 0],
  newConvo: s(18.45), urgentMeans: W(4, 0.48), seconds: W(4, 3.38), one: W(5, 0), endCard: s(26.05),
};
// the stack of "quick questions" (fictional clients)
export const ROWS = [
  ['Noah · Fernwood', 'quick q — can we swap the hero image?', '2m'], ['Ivy · Brightpath', 'love it! one tiny tweak on the footer', '4m'],
  ['Omar · Tidewell', 'is the invoice for Oct or Nov?', '6m'], ['Lena · Quartz Labs', 'can you resend the Figma link?', '9m'],
  ['Sam · Holloway', 'what font is the H2 again?', '11m'], ['Ravi · Northpine', 'meeting moved to 3?', '12m'],
  ['Mina · Coastline', 'tiny copy change on /pricing', '14m'],
  ['Kara Lin · Meridian Goods', 'Checkout is DOWN on our live store — losing orders', '15m'], // urgent (index 7)
  ['Theo · Lumen', 'quick question about fonts', '18m'], ['June · Harbor & Co', 'can we add a TikTok icon?', '21m'],
  ['Eli · Ridgeway', 'thanks!! all good now', '23m'], ['Zara · Pinehill', 'do you have the logo in SVG?', '25m'],
];
export const unread = countUp(12, 50, s(0.9), s(3.2), 'softOut', 1, 'unread');
export const rowsIn = ROWS.map((_, i) => s(0.35) + i * 9);
export const steps = [T.read, T.spot, T.task, T.tell];
export const SENTENCE = "When an Intercom conversation is tagged urgent, create a ClickUp task for whoever's on duty and post it in our Discord.";
export const LINES = ['When an Intercom conversation is', "tagged urgent, create a ClickUp", "task for whoever's on duty and", 'post it in our Discord.'];
export const PROMPT = {x: 2700 - 480, y: 470, w: 960};
export const PROMPT_TEXT = {x: 2700 - 480 + 30, y: 470 + 80 + 28 + 50, cw: 19.6, lh: 54, size: 38};
export const typed = typing(SENTENCE, T.typeStart, {cps: 27, seed: 11, enter: true, src: 'prompt'});
T.buildStart = Math.round(typed.end + 10);
T.nodes = [0, 1, 2, 3].map((i) => T.buildStart + 6 + i * 14);
export const P = {
  convo: T.newConvo, dot1: [T.newConvo + 54, 30] as const, filter: T.newConvo + 86, dot2: [T.newConvo + 92, 34] as const, taskIn: T.newConvo + 128,
  dot3: [T.newConvo + 170, 30] as const, discordIn: T.newConvo + 202, seen: [T.newConvo + 210, 70] as const,
};
export const convoArr = arrive(P.convo, 28, 1000, 'snapOut', {land: true, src: 'convo'});
export const taskArr = arrive(P.taskIn, 28, 1000, 'snapOut', {land: true, src: 'task'});
export const discArr = arrive(P.discordIn, 28, 1000, 'snapOut', {land: true, src: 'discord'});
export const seen = countUp(0, 8, P.seen[0], P.seen[1], 'softOut', 1, 'seen');
export const respTime = countUp(47, 192, T.read, T.tell + 60 - T.read, 'linear', 1, 'resp');

const caretPos = (f: number) => {
  const n = typed.count(f); let k = n, li = 0;
  while (li < LINES.length - 1 && k > LINES[li].length + 1) { k -= LINES[li].length + 1; li++; }
  return {x: PROMPT_TEXT.x + Math.min(k, LINES[li].length) * PROMPT_TEXT.cw, y: PROMPT_TEXT.y + li * PROMPT_TEXT.lh};
};
export const caret = caretPos;
const rowY = (i: number) => L.inbox.y - 520 + 150 + i * 98;
const moves: Move[] = [
  {f: 0, dur: 0, to: {x: 540, y: 820, zoom: 1.12}, cut: true},
  {f: 20, dur: 120, to: {x: 540, y: rowY(L.urgentRow) - 100, zoom: 1.3}, curve: 'inOut'},           // push in, find the urgent row
  {f: T.buried - 10, dur: 70, to: {x: 540, y: rowY(3), zoom: 1.0, roll: -1}, curve: 'inOut'},     // more piles on: pull back
  {f: T.fifty - 8, dur: 40, to: {x: 640, y: 900, zoom: 0.9, roll: 0}, curve: 'swift2'},
  {f: SC.B - 6, dur: 40, to: {x: L.list.x, y: L.list.y - 200, zoom: 1.12}, curve: 'swift2'},     // to the checklist
  {f: T.spot - 10, dur: 200, to: (f) => ({x: L.list.x, y: lerp(L.list.y - 200, L.list.y + 160, prog(f, T.spot - 10, T.tell + 20 - T.spot, 'inOut')), zoom: 1.12}), curve: 'softOut'}, // track down the list
  {f: T.fan, dur: 60, to: {x: 1060, y: 1000, zoom: 0.7, yaw: -18, roll: -3, dolly: 300}, curve: 'flyAccel'},     // fly into the card fan
  {f: T.fix + 46, dur: 40, to: {x: L.prompt.x, y: L.prompt.y + 60, zoom: 1.0, yaw: 0, roll: 0, dolly: 0}, curve: 'swift'},
  {f: T.typeStart, dur: 30, to: (f) => { const c = caretPos(f); return {x: lerp(L.prompt.x, c.x, 0.45), y: c.y + 20, zoom: 1.28}; }, curve: 'softOut'},
  {f: T.buildStart, dur: 80, to: {x: L.nodes[1].x + 160, y: L.nodes[1].y - 40, zoom: 0.78}, curve: 'swift2'},
  {f: P.convo - 16, dur: 40, to: {x: L.convo.x, y: L.convo.y, zoom: 1.0}, curve: 'swift2'},
  {f: P.dot2[0] - 10, dur: 70, to: {x: L.task.x, y: L.task.y - 30, zoom: 1.0}, curve: 'inOut'},
  {f: P.dot3[0] - 6, dur: 60, to: {x: L.discord.x, y: L.discord.y, zoom: 1.04}, curve: 'inOut'},
  {f: T.seconds - 30, dur: 40, to: {x: L.task.x, y: (L.task.y + L.discord.y) / 2, zoom: 0.55}, curve: 'swift2'},
];
export const cam = new Camera(moves, TOTAL, 1080, 1920);
export const camF = new Camera([
  {f: 0, dur: 0, to: {x: 540, y: 960, zoom: 1.15}, cut: true},
  {f: SC.F, dur: 80, to: {x: 540, y: 960, zoom: 1.0}, curve: 'softOut'},
  {f: T.endCard, dur: 0, to: {x: 540, y: 960, zoom: 1.08}, cut: true},
  {f: T.endCard + 1, dur: 120, to: {x: 540, y: 960, zoom: 1.0}, curve: 'softOut'},
], TOTAL, 1080, 1920);

export function events(): Sfx[] {
  const tl = new Timeline();
  tl.add(cam.whooshes('cam').filter((e) => e.f < SC.F - 10)); tl.add(camF.whooshes('camF').filter((e) => e.f >= SC.F));
  // inbox fills: soft pops per row (not chimes), counter ticks, one chime for the urgent message
  tl.add(rowsIn.map((f, i) => pop(f, -8 + (i % 3), 'row')));
  tl.add({f: rowsIn[L.urgentRow] + 2, kind: 'chime', gain: -3, src: 'urgent'});
  tl.add(unread.ev.filter((_, i) => i % 2 === 0));
  // checklist: each item stamps in on its VO word (mechanical), ✕ marks
  tl.add(stepped(steps, 'check')); tl.add(steps.map((f) => ({f: f + 12, kind: 'stamp' as const, gain: -6, src: 'x'})));
  tl.add(respTime.ev.filter((_, i) => i % 6 === 0).map((e) => ({...e, gain: -6})));
  // turn: cards fly apart (riser into the fly, swipe on the reveal)
  tl.add([{f: T.fan - 30, kind: 'riser', dur: 34, gain: -4, src: 'fan'}, {f: T.fix + 4, kind: 'impact', gain: -8, src: 'fix'}]);
  // body
  tl.add(typed.ev);
  [['Intercom', 0], ['urgent', 0], ['ClickUp', 0], ['Discord', 0]].forEach(([w]) => { const i = SENTENCE.indexOf(w as string) + (w as string).length - 1; tl.add(pop(typed.times[i] + 3, -4, 'chip')); });
  tl.add(T.nodes.map((f, i) => (i === 1 ? {f, kind: 'mech' as const, src: 'filter'} : pop(f, 0, 'node'))));
  tl.add(flow(T.nodes[0] + 8, 50, 'wires'));
  // payoff
  tl.add(convoArr.ev); tl.add(chime(P.convo + 10, 0, 'intercom'));
  tl.add(flow(P.dot1[0], P.dot1[1], 'dot1')); tl.add({f: P.filter, kind: 'mech', gain: 2, src: 'filter-pass'});
  tl.add(flow(P.dot2[0], P.dot2[1], 'dot2')); tl.add(taskArr.ev); tl.add({f: P.taskIn + 34, kind: 'stamp', src: 'assigned'});
  tl.add(flow(P.dot3[0], P.dot3[1], 'dot3')); tl.add(discArr.ev); tl.add(chime(P.discordIn + 14, -2, 'discord'));
  tl.add(seen.ev); tl.add({f: T.seconds, kind: 'impact', src: 'seconds'});
  tl.add({f: SC.F - 14, kind: 'swipe', dur: 20, src: 'iris'});
  tl.add([{f: T.endCard - 10, kind: 'swipe', dur: 16, src: 'wipe'}, {f: T.endCard + 8, kind: 'pop', gain: 2, src: 'logo'}]);
  return tl.sorted();
}
export const MUSIC = 'audio/01_upbeat-tech_high-technologic-beat-explosion_loyalty-freak-music.mp3';
