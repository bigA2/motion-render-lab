// P05 v4 "Tired of manual work?" — pure timeline, camera keys, layout and SFX (no React), so the SFX dump and the
// picture share the same numbers. ONE continuous camera through four worlds that hand over by transforms:
// W1 hook + manual-work world (word -> selection box -> booking card -> doc -> chat -> pull back to a dot)
// W2 turn (dot -> ring -> prompt bar, typed)          W3 product (Enter pulse draws the flow, dive into Notion, whip to Slack, pull back)
// W4 end (flow collapses to a point -> ring -> logo -> wordmark -> CTA).  14.0 s at 60 fps. MIT, our own code.
import results from '../../public/real/real_results.json';
import {Curve, ease, lerp} from '../p05_07/kit/curves';
import {Sfx} from '../p05_07/kit/events';

export const FPS = 60;
export const TOTAL = 840;
export const s = (t: number) => Math.round(t * FPS);
export const MUSIC = 'audio/03_calm-minimal_one-cool-minute_loyalty-freak-music.mp3'; // CC0, Loyalty Freak Music
export const MUSIC_OFFSET = 4.0;

// ---------- real data ----------
export const PERSON = results.P05.notion[0].title as string; // "Dana Whitfield"
export const CHAT = results.P05.slack[0].text as string;     // "Prep for the call with Dana Whitfield (Northwind Studio)"
export const COMPANY = (/\(([^)]+)\)/.exec(CHAT)?.[1]) ?? 'Northwind Studio';
export const CALL = 'Thu 10:30 AM'; // illustrative (not in the run output)
export const PREP = ['Review Northwind site', 'Check past emails', 'Agenda for the call']; // illustrative
export const PROMPT = 'New booking? Add to Notion, ping Slack.';

// ---------- shot times (frames) ----------
export const T = {
  w1: 0, manual: s(0.5), box: s(1.05), card: s(1.5), click: s(1.78), lift: s(2.0), whip1: s(2.25), doc: s(2.5), type1: s(2.62),
  whip2: s(3.0), chat: s(3.25), type2: s(3.3), pull: s(3.7), shrink: s(4.05), w2: s(4.32),
  ring: s(4.36), bar: s(4.78), type3: s(4.86), enter: s(6.25),
  w3: s(6.25), n1: s(6.5), n2: s(6.78), n3: s(7.0), n4: s(7.2), dive: s(7.45), page: s(7.7), ttl: s(7.75), props: s(8.0), ticks: s(8.3),
  whip3: s(8.95), toast: s(9.22), msg: s(9.5), react: s(9.78), pullB: s(10.25), pay1: s(10.62), pay2: s(10.88), collapse: s(11.7),
  w4: s(11.95), logo: s(12.25), sweep: s(12.45), word: s(12.62), tag: s(12.95), cta: s(13.22), url: s(13.45), end: TOTAL,
};
export const WORLD = (f: number) => (f < T.w2 ? 1 : f < T.w3 ? 2 : f < T.w4 ? 3 : 4);

// typing (letters per frame) — the keyboard texture in the mix uses the same key times
export type Type = {f0: number; text: string; cps: number};
export const typeKeys = (t: Type) => { const out: number[] = []; let f = t.f0; for (let i = 0; i < t.text.length; i++) { out.push(f); const ch = t.text[i]; f += (FPS / t.cps) * (ch === ' ' ? 1.25 : /[,.?]/.test(ch) ? 1.8 : 0.75 + ((i * 37) % 11) / 20); } return out; };
export const shown = (t: Type, f: number) => typeKeys(t).filter((k) => k <= f).length;
export const TY = {
  doc: {f0: T.doc + 2, text: COMPANY, cps: 44},           // typed by hand into the Deals doc (ends before the whip)
  chat: {f0: T.chat + 2, text: 'Dana booked Thu 10:30', cps: 40},
  prompt: {f0: s(4.84), text: PROMPT, cps: 36},           // ends ~5.96 s: 0.25 s of near-silence before the product reveal
  title: {f0: T.ttl, text: PERSON, cps: 40},
};
export const SENT = T.pull + 6; // the chat message is sent as the camera pulls back

// ---------- layout ----------
export type Lay = {W: number; H: number; wide: boolean; k: number};
export const layout = (W: number, H: number): Lay => ({W, H, wide: W > H, k: Math.min(W, H) / 1080});

// world-1 stations (world units; camera zoom 1 => 1 unit = k px)
export const MX = (L: Lay) => (L.wide ? -250 : 0); // x of "manual" (centre)
export const ST = (L: Lay) => {
  const m = MX(L);
  return {card: {x: m, y: 40}, doc: {x: m + 1750, y: 760}, chat: {x: m + 3350, y: 60}, clock: {x: m + 1650, y: -560}};
};
export const CARD = {w: 820, h: 500};

// world-3 flow nodes
export const NODES = (L: Lay) => L.wide
  ? [{x: -630, y: 0}, {x: -210, y: 0}, {x: 210, y: 0}, {x: 630, y: 0}]
  : [{x: 0, y: -600}, {x: 0, y: -200}, {x: 0, y: 200}, {x: 0, y: 600}];
export const WIN3 = (L: Lay) => (L.wide ? {w: 1640, h: 620} : {w: 760, h: 1560});

// ---------- camera ----------
export type Cam = {x: number; y: number; z: number; r: number};
type Key = [number, Cam, Curve?];
const ip = (keys: Key[], f: number): Cam => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, a] = keys[i], [f1, b, c] = keys[i + 1];
    if (f <= f1) { const t = ease((f - f0) / Math.max(1, f1 - f0), c ?? 'inOut'); return {x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: Math.exp(lerp(Math.log(a.z), Math.log(b.z), t)), r: lerp(a.r, b.r, t)}; }
  }
  return keys[keys.length - 1][1];
};
export function camKeys(L: Lay): Key[] {
  const m = MX(L), S = ST(L), N = NODES(L), w = L.wide; const ZS = w ? 1.25 : 1.1;
  const c = (x: number, y: number, z: number, r = 0): Cam => ({x, y, z, r});
  return [
    // W1 hook: hard dolly-in on the line (fills ~85 % of the width), then track onto "manual"
    [0, c(0, 0, 0.7, -3)], [T.manual, c(0, 0, w ? 0.98 : 1.1, -1), 'flyAccel'], [s(0.95), c(0, 0, w ? 1.1 : 1.28, 0), 'softOut'],
    [T.box + 6, c(m, 0, w ? 1.45 : 1.5, 0), 'swift'], [T.card, c(S.card.x, -60, ZS, 0), 'swift2'], [T.whip1, c(S.card.x + 30, -60, ZS * 1.05, 0.5), 'linear'],
    [T.doc, c(S.doc.x, S.doc.y - 60, ZS, -1), 'swift'], [T.whip2, c(S.doc.x + 25, S.doc.y - 60, ZS * 1.04, -0.5), 'linear'],
    [T.chat, c(S.chat.x, S.chat.y - 60, ZS, 1), 'swift'], [T.pull, c(S.chat.x + 20, S.chat.y - 60, ZS * 1.05, 0.5), 'linear'],
    [T.shrink, c(m + 1650, w ? 260 : 360, w ? 0.36 : 0.3, 3), 'swift'], [T.w2, c(m + 1650, 120, 0.02, 9), 'inHard'],
    // W2 turn (own world, centred on the bar)
    [T.w2 + 1, c(0, 0, 1.0, 0), 'linear'], [T.type3, c(0, 0, 1.03, 0), 'softOut'], [T.enter - 6, c(0, 0, 1.1, 0), 'linear'], [T.enter, c(0, 0, 1.22, 0), 'inHard'],
    // W3 product: track the pulse along the nodes, frame the whole flow, dive, whip, pull back
    [T.w3 + 1, c(N[0].x, N[0].y, 1.15, 0), 'linear'], [T.n2, c(N[1].x, N[1].y, 1.0, 0), 'swift'], [T.n4, c(0, 0, w ? 0.68 : 0.58, 0), 'swift'],
    [T.dive, c(0, 0, w ? 0.7 : 0.6, 0), 'linear'], [T.page, c(N[2].x, N[2].y, 1.0, 0), 'swift'], [T.whip3, c(N[2].x, N[2].y, 1.05, 0.6), 'linear'],
    [T.toast, c(N[3].x, N[3].y, 1.0, -0.5), 'swift'], [T.pullB, c(N[3].x, N[3].y, 1.07, 0), 'linear'],
    [T.pay1, c(0, w ? -610 : -470, w ? 0.5 : 0.46, -2), 'swift'], [T.collapse, c(0, w ? -620 : -480, w ? 0.52 : 0.48, -1), 'linear'], [T.w4, c(0, w ? -620 : -480, 0.03, 6), 'inHard'],
    // W4 end: slow continuous push to the last frame
    [T.w4 + 1, c(0, 0, 1.0, 0), 'linear'], [T.end, c(0, 0, 1.09, 0), 'linear'],
  ];
}
export const camAt = (L: Lay, f: number): Cam & {v: number} => {
  const K = camKeys(L); const a = ip(K, f), b = ip(K, f + 1);
  // living drift: never a frozen frame
  const dx = Math.sin(f / 47) * 9 + Math.sin(f / 23) * 4, dy = Math.cos(f / 53) * 7;
  const v = (Math.hypot((b.x - a.x) * a.z, (b.y - a.y) * a.z) + Math.abs(Math.log(b.z / a.z)) * 900) * L.k; // px per frame
  return {x: a.x + dx / a.z, y: a.y + dy / a.z, z: a.z * (1 + 0.004 * Math.sin(f / 31)), r: a.r, v};
};

// ---------- sound: ONE ROW PER SOUND, each with a visible cause in the same frame (+-1) ----------
// f = frame the sound is anchored to: the START for whoosh/swipe/riser (a camera travel / slide starts), the HIT for the rest.
// gain = dBFS peak of this sound in the mix (before the master), rate = playback-rate ratio (pitch + length).
export type Ev = Sfx & {snd: string; len: number; pan: number; eq: string; verb: string; cause: string; why: string; rate?: number};
const W = (f: number, snd: string, len: number, gain: number, pan: number, cause: string, rate = 1): Ev =>
  ({f, kind: 'whoosh', snd, len, gain, pan, rate, eq: 'highpass=f=180', verb: 'none', cause, src: cause, why: `camera travel lasting ${len} ms: a whoosh of the same length`});
export const SILENCE: [number, number][] = [[s(6.0), T.enter - 1], [s(12.0) + 1, T.logo - 1]]; // near-silence before the reveal and the logo
export function events(): Ev[] {
  const e: Ev[] = [];
  const ev = (f: number, kind: Sfx['kind'], snd: string, len: number, gain: number, cause: string, why: string, o: Partial<Ev> = {}) =>
    e.push({f, kind, snd, len, gain, pan: 0, eq: '', verb: 'none', cause, src: cause, why, ...o});
  // --- hook
  ev(T.manual, 'impact', 'impact_a', 450, -3, '"manual" slams in from in front of the camera', 'structural moment 1 of 3 (hook word)', {eq: 'lowpass=f=9000'});
  ev(T.manual + 2, 'pop', 'pop_1', 140, -18, 'selection box snaps around "manual"', 'a small frame landing', {pan: -0.15});
  // --- manual world
  ev(T.card, 'pop', 'pop_2', 140, -17, 'booking card finishes its flip and lands', 'element lands');
  ev(T.click, 'click', 'click_1', 50, -18, 'cursor clicks the name (1st click)', 'a real cursor click', {pan: 0.1});
  ev(T.click + 7, 'click', 'click_2', 50, -19, 'cursor clicks the name (2nd click, double-click) - name highlights', 'second click of the double-click', {pan: 0.1});
  e.push(W(T.whip1, 'whoosh_25', 250, -11, 0.3, 'whip from the booking card to the Deals doc (down-right)'));
  ev(T.doc, 'swipe', 'slide_paper_a', 460, -16, 'Deals doc slides in from the right and stops', 'a slide-in panel = swipe (paper slide, not a pop)', {pan: 0.25, eq: 'highpass=f=300'});
  e.push(W(T.whip2, 'whoosh_45', 250, -11, 0.2, 'whip from the doc to the #sales chat (up-right)', 1.8));
  ev(T.chat, 'pop', 'pop_3', 140, -17, 'chat panel arrives from depth and lands', 'element lands');
  ev(T.pull + 14, 'tick', 'tick_a', 80, -18, 'clock hand stops on 11:47 PM', 'small mechanical stop');
  e.push(W(T.pull + 2, 'whoosh_70', 620, -12, 0, 'pull back: the whole manual world shrinks to a dot', 1.13));
  // --- turn
  ev(T.bar + 2, 'pop', 'pop_4', 140, -17, 'ring squashes into the prompt bar and lands', 'element lands');
  // --- product
  ev(T.enter, 'impact', 'impact_b', 450, -3, 'Enter: the light pulse fires into the flow (product reveal) + white flash', 'structural moment 2 of 3 (product reveal), after 0.25 s near-silence', {eq: 'lowpass=f=10000'});
  ev(T.n1, 'pop', 'pop_5', 140, -19, 'node "Booking" pops in', 'node lands', {pan: -0.3});
  ev(T.n2, 'pop', 'pop_1', 140, -19, 'node "FansaChat" pops in', 'node lands', {pan: -0.1, rate: 1.06});
  ev(T.n3, 'pop', 'pop_2', 140, -19, 'node "Notion" pops in', 'node lands', {pan: 0.1, rate: 1.12});
  ev(T.n4, 'pop', 'pop_3', 140, -19, 'node "Slack" pops in', 'node lands', {pan: 0.3, rate: 1.18});
  e.push(W(T.dive, 'whoosh_25', 250, -12, 0, 'camera dives into the Notion node'));
  ev(T.page - 12, 'swipe', 'slide_paper_b', 600, -14, 'the Notion page unfolds out of the node (3D flip) and lands at 7.70 s', 'paper/page whoosh for the page appearing', {eq: 'highpass=f=250', verb: 'short room'});
  ev(T.ticks, 'tick', 'tick_b', 80, -17, 'prep box 1 ticks', 'checkbox tick');
  ev(T.ticks + 13, 'tick', 'tick_c', 80, -18, 'prep box 2 ticks', 'checkbox tick');
  ev(T.ticks + 26, 'tick', 'tick_a', 80, -18, 'prep box 3 ticks', 'checkbox tick', {rate: 1.08});
  e.push(W(T.whip3, 'whoosh_45', 270, -11, 0.35, 'whip along the flow line to the Slack node', 1.7));
  ev(T.toast, 'chime', 'chime', 700, -12, 'Slack notification slides in and lands', 'notification chime = the Slack message arriving', {pan: 0.2, eq: 'lowpass=f=8000'});
  ev(T.react, 'pop', 'pop_4', 140, -20, '✅ reaction pops on the message', 'small element lands', {rate: 1.2});
  e.push(W(T.pullB, 'whoosh_p', 420, -12, 0, 'pull back over the finished flow', 1.3));
  // --- payoff + end
  ev(s(12.0), 'riser', 'riser', 1050, -10, 'payoff holds while the flow pulses; ends as everything has collapsed to a point (12.00 s)', 'the one build into the logo reveal (1.05 s); then 0.25 s near-silence', {eq: 'highpass=f=200'});
  e.push(W(T.collapse, 'whoosh_25', 250, -12, 0, 'flow + payoff collapse into one point'));
  ev(T.logo, 'impact', 'impact_c', 500, -3, 'logo mark lands through the ring', 'structural moment 3 of 3 (logo), after 0.25 s near-silence', {verb: 'short room'});
  ev(T.cta + 6, 'pop', 'pop_5', 140, -17, '"Join the waitlist" pill lands', 'element lands', {rate: 0.94});
  // --- typing: one soft key per 1-2 letters, only while letters appear
  for (const [name, ty] of Object.entries(TY)) {
    const k = typeKeys(ty); const step = ty.cps > 30 ? 2 : 1;
    k.forEach((f, i) => { if (i % step) return; ev(f, 'key', 'key', 60, -24 + ((i * 7) % 5) - 2, `letter ${i + 1}${step > 1 ? `-${Math.min(i + 2, k.length)}` : ''} of "${ty.text}" appears (${name})`, 'soft keyboard key while text is typed', {rate: Math.pow(2, (((i * 13) % 9) - 4) / 2 / 12), pan: name === 'prompt' ? 0 : 0.1}); });
  }
  return e.sort((p, q) => p.f - q.f);
}
/** sound rules: impacts, risers, whooshes, repeats, silence windows, density */
export function checkRules(ev: Ev[]) {
  const errs: string[] = []; const imp = ev.filter((x) => x.kind === 'impact');
  if (imp.length < 2 || imp.length > 3) errs.push(`impacts: ${imp.length}`);
  for (let i = 1; i < imp.length; i++) if (imp[i].f - imp[i - 1].f < 3 * FPS) errs.push(`impacts too close at ${imp[i].f}`);
  if (ev.filter((x) => x.kind === 'riser').length > 2) errs.push('more than 2 risers');
  const wh = ev.filter((x) => x.kind === 'whoosh').length; if (wh < 5 || wh > 7) errs.push(`whooshes: ${wh}`);
  const nk = ev.filter((x) => x.kind !== 'key');
  for (let i = 0; i < nk.length; i++) for (let j = i + 1; j < nk.length; j++) { const a = nk[i], b = nk[j]; if (a.snd === b.snd && Math.abs(a.f - b.f) < 0.4 * FPS) errs.push(`${a.snd} repeats within 0.4 s at ${a.f}/${b.f}`); }
  for (const k of ['whoosh', 'pop', 'tick', 'impact', 'click', 'swipe']) { const xs = nk.filter((x) => x.kind === k); for (let i = 1; i < xs.length; i++) if (xs[i].snd === xs[i - 1].snd) errs.push(`same sample twice in a row: ${xs[i].snd} at ${xs[i].f}`); }
  for (const [a, b] of SILENCE) for (const x of ev) { const end = x.f + (x.kind === 'riser' ? 0 : 0); if (end >= a && end <= b) errs.push(`event inside silence ${a}-${b}: ${x.snd} at ${x.f}`); }
  const dens = nk.length / (TOTAL / FPS); if (dens < 1.5 || dens > 2.5) errs.push(`density ${dens.toFixed(2)}/s (non-key events)`);
  return errs;
}
