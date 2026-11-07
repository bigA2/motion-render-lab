// P05 FULL v5 (15 s, 5:4 1350x1080, 30 fps): built from test shot 4b (plan4b.ts, untouched) + the founder's 7 notes on 4b:
//  1 max 2 whooshes, varied situation-matched sounds, never the same sample twice within 1.5 s
//  2 max 4 purposeful null zooms with calm wide holds between them
//  3 classic premium bold open-licence type: Inter (SIL OFL 1.1), display optical size
//  4 ZOOM INTO the real composer (no pull-out): liquid glass in place, lifted a few px, ice-blue neon, whole box + margin in frame
//  5 after typing, the builder's real RESPONSE (the reply card "Review the steps on the right / What goes where")
//  6 workflow: ONE zoom in, ONE pan across form -> Notion -> Slack as the nodes connect, zoom OUT, one simple transition
//  7 real Notion lines, real Slack message, logo + "Join the waitlist · fansachat.com", hook "Still copying leads by hand?"
// Pure data (no imports) so tools can read it with `node --experimental-strip-types`.
export const FPS = 30;
export const TOTAL = 450; // 15.0 s
export const W = 1350, H = 1080;

// ---------- typographic grid (shown in the draft render) ----------
export const GRID = {cols: 12, margin: 96, gutter: 24, col: 77.5, baseline: 8, top: 72, bottom: 72};
export const colX = (i: number) => GRID.margin + i * (GRID.col + GRID.gutter);
export const colR = (i: number) => colX(i) + GRID.col;
export const TS = (n: number) => 16 * Math.pow(1.25, n);
export const SCALE_USED = [
  {n: 10, px: 119.2, use: 'hook line 2 (Inter 800)'},
  {n: 9, px: 95.4, use: 'hook line 1 (Inter 700)'},
  {n: 8, px: 76.3, use: 'end wordmark (Inter 800)'},
  {n: 4, px: 39.1, use: 'prompt in the composer at zoom (Inter 700) · CTA (Inter 700)'},
];

export const HOOK: {w: string; line: 0 | 1; bold: boolean}[] = [
  {w: 'Still', line: 0, bold: false}, {w: 'copying', line: 0, bold: false}, {w: 'leads', line: 0, bold: false},
  {w: 'by', line: 1, bold: true}, {w: 'hand?', line: 1, bold: true},
];
export const HOOK_LINES = [
  {size: 95.4, weight: 700, baseline: 488, track: -0.03},
  {size: 119.2, weight: 800, baseline: 616, track: -0.035},
];
export const WORD0 = 4, WSTEP = 4, WDUR = 9;

// ---------- timeline (frames @30) ----------
export const T = {
  hookOut: 28,                    // words slide out left (1 f stagger, ease-in), gone by 39 (before the window arrives)
  win0: 40, win1: 58,             // Chrome window slides in from the right
  z1: 62, z1in: 80,               // ZOOM 1: camera pushes INTO the real composer
  lift0: 64, lift1: 76,           // glass applied in place: lifts 3 px, frost + ice-blue neon fade in
  type0: 82,                      // first character (1.2 chars / f), last character at 144
  cursorIn: 140, press: 152,      // cursor glides to the send disc, press
  rel1a: 154, rel1b: 178,         // zoom 1 releases to the wide; the glass box flies into the real sent bubble
  morph0: 154, morph1: 172,
  sent0: 152, sent1: 158,         // real state ready -> sent (dissolve)
  pick0: 178, pick1: 190,         // wide hold: picker card transforms into the "Reading your request" card (real states)
  flow0: 190,                     // built: the reply card slides in from the left (= the response)
  z2: 192, z2in: 208,             // ZOOM 2: push onto the reply
  pan0: 222, pan1: 258,           // ONE pan from the reply across form -> Notion -> Slack while the nodes connect
  node1: 230, node2: 240, node3: 250,
  out0: 264, out1: 282,           // zoom OUT to the wide
  tr0: 286, tr1: 300,             // simple transition: builder -> Notion (dissolve + 3 % scale, window resizes, tab switches)
  z3: 300, z3in: 312, z3hold: 324, z3rel: 336, // ZOOM 3: Notion body lines (they rise in one by one)
  line0: 302, lineStep: 4,
  sSwap0: 326, sSwap1: 338,       // Notion slides out left, Slack slides in from the right
  msg: 344,                       // the real Slack message arrives
  z4: 346, z4in: 358, z4hold: 372, z4rel: 386, // ZOOM 4: the Slack message
  end0: 384, end1: 398,           // window recedes (scale + fade + blur)
  logo0: 392, word0: 398, cta0: 404,
  end: TOTAL,
};
export type Zoom = {id: string; t: number; in1: number; rel0: number; rel1: number};
export const ZOOMS: Zoom[] = [
  {id: 'composer', t: T.z1, in1: T.z1in, rel0: T.rel1a, rel1: T.rel1b},
  {id: 'reply+flow', t: T.z2, in1: T.z2in, rel0: T.out0, rel1: T.out1},
  {id: 'notion lines', t: T.z3, in1: T.z3in, rel0: T.z3hold, rel1: T.z3rel},
  {id: 'slack message', t: T.z4, in1: T.z4in, rel0: T.z4hold, rel1: T.z4rel},
];
// colourways near ice/steel; zoom i morphs WAYS[i] -> WAYS[i+1] during its push
export type Way = {name: string; top: string; bot: string; a: string; b: string; c: string};
export const WAYS: Way[] = [
  {name: 'ice / steel', top: '#EDF2F8', bot: '#B7C6D8', a: '#98B9E6', b: '#A9B9CC', c: '#FFFFFF'},
  {name: 'ice blue', top: '#E9F1FB', bot: '#B9CEEA', a: '#7DABEA', b: '#A6B9D2', c: '#F4F9FF'},
  {name: 'warm yellow', top: '#F7F2E5', bot: '#CFD7E1', a: '#F2CB6A', b: '#A9BED9', c: '#FFF5D8'},
  {name: 'white / pearl', top: '#FCFDFE', bot: '#DCE4EE', a: '#D6E4F6', b: '#C3CFDD', c: '#FFFFFF'},
  {name: 'soft red / steel', top: '#F5EBEB', bot: '#C8D1DD', a: '#E4978F', b: '#98ADC7', c: '#FFF3F0'},
];

// ---------- prompt typed in the composer (wraps like the real textarea; the composer grows upward) ----------
export const CPS = 1.2;
export const LINES = ['When a lead fills my website', 'form, add them to Notion and', 'post it in Slack.'];
export const TOTAL_CHARS = LINES.reduce((a, l) => a + l.length + 1, 0) - 1;
export const charsAt = (f: number) => (f < T.type0 ? 0 : Math.min(TOTAL_CHARS, Math.floor((f - T.type0) * CPS) + 1));
export const LAST_CHAR_F = (() => {let f = T.type0; while (charsAt(f) < TOTAL_CHARS) f++; return f;})();
export const LINE_START = (() => {let u = 0; return LINES.map((l) => {const s = u; u += l.length + 1; return s;});})();
export const lineStartF = (i: number) => {let f = T.type0; while (charsAt(f) <= LINE_START[i]) f++; return f;};
// composer at the zoom (screen px at camera scale S0): 1 line = the real pill height, +48 per extra line
export const S0 = 2.6;
export const COMP = {size: 39.06, lead: 48, padL: 40, padB: 42, cap: 0.727, disc: 84, discR: 56.5};

// ---------- browser window per scene ----------
export const CHROME_H = 76;
export type Rect = {x: number; y: number; w: number; h: number};
export const IMG = {
  ready: {src: 'real4/b_ready.png', w: 2880, h: 1656},
  sent: {src: 'real4/b_sent.png', w: 2880, h: 1656},
  read: {src: 'real4/b_read.png', w: 2880, h: 1656},
  built: {src: 'real4/b_built.png', w: 2880, h: 1656},
  pillPlate: {src: 'real4/b_ready_pillplate.png', x: 20, y: 1388, w: 840, h: 180},
  cardPlate: {src: 'real4/b_read_cardplate.png', w: 1356, h: 1222},
  flowPlate: {src: 'real4/b_built_flowplate.png', x: 1360, y: 758, w: 1100, h: 260},
  notion: {src: 'real4/notion_body.png', w: 1560, h: 840},
  slackFrame: {src: 'real4/slack_frame.png', w: 1940, h: 830},
  slackMsg: {src: 'real4/slack_message.png', w: 1940, h: 114, slotY: 402},
};
const win = (x: number, w: number, imgW: number, imgH: number, cy: number): Rect => {
  const h = CHROME_H + (w * imgH) / imgW;
  return {x, w, h, y: Math.round(cy - h / 2)};
};
export const WIN = {
  builder: win(colX(0), colR(11) - colX(0), 2880, 1656, 548),
  notion: win(colX(1), colR(10) - colX(1), 1560, 840, 548),
  slack: win(colX(0), colR(11) - colX(0), 1940, 830, 548),
};
export const B = {
  pill: {x: 58, y: 1424, w: 764, h: 108},
  bubble: {x: 126, y: 74, w: 614, h: 278},
  picker: {x: 1194, y: 233, w: 1356, h: 1222},
  loading: {x: 1574, y: 740, w: 596, h: 320},
  mapping: {x: 0, y: 0, w: 860, h: 1656},
  reply: {x: 68, y: 52, w: 744, h: 520},       // the reply card's top: "Review the steps on the right / What goes where / Notion ..."
  canvas: {x: 860, y: 0, w: 2020, h: 1656},
  nodes: [{x: 1400, y: 778, w: 300, h: 220, cx: 1547}, {x: 1860, y: 778, w: 130, h: 220, cx: 1922}, {x: 2230, y: 778, w: 140, h: 220, cx: 2297}],
  lines: [{x: 1590, y: 840, w: 290, h: 30}, {x: 1964, y: 840, w: 292, h: 30}],
  nodeCy: 856, nodeR: 42,
};
export const NOTION_BODY = {cx: 480, cy: 700};
export const NOTION_LINES = [
  {x: 118, y: 598, w: 280, h: 46}, {x: 118, y: 646, w: 404, h: 46}, {x: 118, y: 694, w: 228, h: 46}, {x: 118, y: 742, w: 720, h: 46},
];
export const NOTION_PLATE = {x: 104, y: 594, w: 780, h: 204};
export const SLACK_LINE = {cx: 470, cy: 60};

// ---------- SFX: every cue has a TYPE (counted in the result) and its own sample; bed = CC0 calm track, quiet ----------
const I = 'sfx/kenney/interface-sounds/', P = 'sfx/p05t4/', G = 'sfx/p05full/', CA = 'sfx/kenney/casino-audio/', PR = 'sfx/proc/';
export type SfxType = 'tick' | 'whoosh' | 'swish' | 'latch' | 'key' | 'click' | 'chime' | 'paper';
export type Cue = {f: number; src: string; vol: number; type: SfxType; why: string; dur?: number};
const keyCues: Cue[] = [];
for (let f = T.type0, i = 0; f <= LAST_CHAR_F; f += 3, i++) keyCues.push({f, src: `${G}key_${String(i).padStart(2, '0')}.wav`, vol: 0.2 + 0.04 * ((i * 7) % 3), type: 'key', why: 'typing: soft key (characters appear this frame)'});
export const SFX: Cue[] = [
  ...HOOK.map((_, i): Cue => ({f: WORD0 + i * WSTEP, src: `${G}tick_0${i}.wav`, vol: 0.3, type: 'tick', why: `hook word ${i + 1} lands: tick`})),
  {f: T.win0, src: P + 'whoosh_m.ogg', vol: 0.11, type: 'whoosh', why: 'window slides in from the right (whoosh 1 of 2)'},
  {f: T.win1 - 2, src: I + 'switch_003.ogg', vol: 0.34, dur: 7, type: 'latch', why: 'window lands: latch'},
  {f: T.z1, src: G + 'swish_a.wav', vol: 0.09, type: 'swish', why: 'zoom 1: camera glides into the composer (air swish)'},
  ...keyCues,
  {f: T.press, src: I + 'click_001.ogg', vol: 0.6, type: 'click', why: 'press send: click'},
  {f: T.morph1 - 2, src: I + 'switch_002.ogg', vol: 0.28, dur: 7, type: 'latch', why: 'glass box lands in the sent bubble: small latch'},
  {f: T.z2, src: G + 'swish_b.wav', vol: 0.08, type: 'swish', why: 'zoom 2: push onto the reply (air swish)'},
  {f: T.node1, src: I + 'tick_001.ogg', vol: 0.42, type: 'tick', why: 'node 1 (form) connects: tick'},
  {f: T.node2, src: I + 'tick_004.ogg', vol: 0.42, type: 'tick', why: 'node 2 (Notion) connects: tick'},
  {f: T.node3, src: I + 'tick_002.ogg', vol: 0.42, type: 'tick', why: 'node 3 (Slack) connects: tick'},
  {f: T.out0, src: G + 'swish_c.wav', vol: 0.08, type: 'swish', why: 'zoom out to the wide (falling air swish)'},
  {f: T.tr0, src: CA + 'card-slide-6.ogg', vol: 0.32, type: 'paper', why: 'Notion page slides in: paper slide'},
  {f: T.sSwap0, src: P + 'whoosh_s.ogg', vol: 0.12, type: 'whoosh', why: 'Notion out / Slack in (whoosh 2 of 2)'},
  {f: T.msg, src: I + 'glass_002.ogg', vol: 0.5, type: 'chime', why: 'Slack message arrives: short glass chime'},
  {f: T.logo0 + 2, src: PR + 'success_chime_C.ogg', vol: 0.22, type: 'chime', why: 'logo lands: soft chime'},
  {f: T.cta0 + 2, src: I + 'select_002.ogg', vol: 0.3, type: 'tick', why: 'CTA pill lands: soft tick'},
];
export const BED = {src: 'audio/02_calm-minimal_once-more-with-you_loyalty-freak-music.mp3', vol: 0.1, from: 0, fadeIn: 12, fadeOut0: 414};
