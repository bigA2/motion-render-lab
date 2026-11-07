// P05 v5 test shot 4b (= shot 4 + addendum 9-11: animated ice/steel field, a null-zoom close-up per new element, the field
// morphs to a new colourway during each null zoom). Shot 4 (plan4.ts) is untouched.
// P05 v5 test shot 4: timing, typographic grid, geometry, camera keys and the SFX cue list (pure data). 5:4 1350x1080, 30 fps.
// One Chrome browser window (code-drawn generic browser chrome) on a designed ice/steel field. Its content is ONLY real
// captures (public/real4/*, made by tools/p05t4/prep_crops.py): our builder's real 2x states (ready -> sent -> reading ->
// built flow + "What goes where"), the real Notion page body, and the real Slack channel header / composer + the Maya Chen
// message block. Nothing of the apps is redrawn; plates are row-interpolated pixels of the same capture.
export const FPS = 30;
export const TOTAL = 340; // 11.33 s (8 null-zoom close-ups added)
export const W = 1350, H = 1080;

// ---------- typographic grid (shown in the draft render) ----------
export const GRID = {cols: 12, margin: 96, gutter: 24, col: 77.5, baseline: 8, top: 72, bottom: 72};
export const colX = (i: number) => GRID.margin + i * (GRID.col + GRID.gutter); // i = 0..11 (column start)
export const colR = (i: number) => colX(i) + GRID.col;                           // column end
// type scale: 16 px x 1.25^n
export const TS = (n: number) => 16 * Math.pow(1.25, n);
export const SCALE_USED = [
  {n: 10, px: 119.2, use: 'hook line 2 (Geist 700)'},
  {n: 9, px: 95.4, use: 'hook line 1 (Geist 500)'},
  {n: 7, px: 61.0, use: 'prompt in the glass box (Geist 700)'},
];

// Hook: left-aligned to column 1, baselines on the 8 px grid.
export const HOOK: {w: string; line: 0 | 1; bold: boolean}[] = [
  {w: 'Still', line: 0, bold: false}, {w: 'copying', line: 0, bold: false}, {w: 'leads', line: 0, bold: false},
  {w: 'by', line: 1, bold: true}, {w: 'hand?', line: 1, bold: true},
];
export const HOOK_LINES = [
  {size: 95.4, weight: 500, baseline: 488, track: -0.035},
  {size: 119.2, weight: 700, baseline: 616, track: -0.04},
];
export const WORD0 = 2, WSTEP = 3, WDUR = 8;

// ---------- timeline ----------
export const T = {
  hookOut: 22,                   // words slide out left (1 f stagger, ease-in)
  win0: 26, win1: 46,            // Chrome window slides in from the right (expo-out), parallax field
  lift0: 46, lift1: 58,          // glass box lifts off the real composer pill and opens to hero size
  type0: 58,                     // first character, 2 chars / frame
  cursorIn: 86, press: 100,      // cursor glides in, press send (in-box disc)
  morph0: 102, morph1: 116,      // box shrinks INTO the real sent chat bubble (box gone by 116)
  sent0: 100, sent1: 106,        // real state: ready -> sent (cross-dissolve)
  pick0: 118, pick1: 132,        // shape picker card transforms into the "Reading your request" card (real states)
  flow0: 134,                    // reading -> built: mapping panel slides in from the left
  node1: 144, node2: 160, node3: 176, // each node connects + gets its own null-zoom close-up (16 f each)
  flowRel0: 189, flowRel1: 197,  // camera releases to the flow overview
  nIn0: 199, cutN: 207,          // camera pushes into the Notion node; the node opens into the real Notion page
  nFit: 219,
  line0: 222,                    // Notion body lines Name / Company / Budget / Need enter one by one (16 f each), null zoom each
  nRel0: 281, nRel1: 291,        // release to the whole page
  sCam0: 289,
  sSwap0: 291, sSwap1: 303,      // Notion slides out left, Slack slides in from the right, window resizes
  msg: 301,                      // the real Slack message arrives (notification tick on its first visible frame)
  sPush0: 304, sPush1: 312, sHold1: 322, sRel1: 332, // null zoom on the message: push, hold, release
  end: TOTAL,
};
export const LINE_STEP = 16;
// null zoom envelope: push PUSH f -> hold HOLD f -> release
export const PUSH = 7, HOLD = 6;
export type Zoom = {id: string; t: number; hold1: number; rel1: number};
export const ZOOMS: Zoom[] = [
  {id: 'node1', t: T.node1, hold1: T.node1 + 13, rel1: T.node2},
  {id: 'node2', t: T.node2, hold1: T.node2 + 13, rel1: T.node3},
  {id: 'node3', t: T.node3, hold1: T.node3 + 13, rel1: T.flowRel1},
  ...[0, 1, 2, 3].map((j) => {
    const t = T.line0 + j * LINE_STEP;
    return {id: 'line' + j, t, hold1: j < 3 ? t + 11 : T.nRel0, rel1: j < 3 ? t + LINE_STEP : T.nRel1};
  }),
  {id: 'msg', t: T.sPush0, hold1: T.sHold1, rel1: T.sRel1},
];
// colourways near ice/steel (blue / warm yellow / soft red / white accents); index 0 = base, zoom i morphs i -> i+1
export type Way = {name: string; top: string; bot: string; a: string; b: string; c: string};
export const WAYS: Way[] = [
  {name: 'ice / steel', top: '#EDF2F8', bot: '#B7C6D8', a: '#98B9E6', b: '#A9B9CC', c: '#FFFFFF'},
  {name: 'ice blue', top: '#E9F1FB', bot: '#B9CEEA', a: '#7DABEA', b: '#A6B9D2', c: '#F4F9FF'},
  {name: 'warm yellow', top: '#F7F2E5', bot: '#CFD7E1', a: '#F2CB6A', b: '#A9BED9', c: '#FFF5D8'},
  {name: 'white / pearl', top: '#FCFDFE', bot: '#DCE4EE', a: '#D6E4F6', b: '#C3CFDD', c: '#FFFFFF'},
  {name: 'soft red', top: '#F7EDED', bot: '#CED5DF', a: '#EAA09B', b: '#A9BCD3', c: '#FFF0EC'},
  {name: 'steel blue', top: '#E5ECF4', bot: '#ACBDD2', a: '#82A7DA', b: '#8EA2BB', c: '#EEF4FB'},
  {name: 'yellow / ice', top: '#F6F1E3', bot: '#CCD8E6', a: '#EFC25C', b: '#98BCEB', c: '#FFF8E4'},
  {name: 'soft red / steel', top: '#F5EBEB', bot: '#C8D1DD', a: '#E4978F', b: '#98ADC7', c: '#FFF3F0'},
  {name: 'ice / white, warm accent', top: '#F3F7FC', bot: '#C4D3E5', a: '#98BEEF', b: '#F1D488', c: '#FFFFFF'},
];
// Notion body lines (notion crop px) + the white plate that hides them until each enters
export const NOTION_LINES = [
  {x: 118, y: 598, w: 280, h: 46}, {x: 118, y: 646, w: 404, h: 46}, {x: 118, y: 694, w: 228, h: 46}, {x: 118, y: 742, w: 720, h: 46},
];
export const NOTION_PLATE = {x: 104, y: 594, w: 780, h: 204};
export const CPS = 2;
export const LINES = ['When a lead fills my', 'website form, add them', 'to Notion and post it', 'in Slack.'];
export const TYPE_END = T.type0 + Math.ceil((LINES.reduce((a, l) => a + l.length + 1, 0) - 1) / CPS);

// ---------- glass box (screen px, on the grid: text starts on column 2, box padded 48 outside cols 2..11, baselines 416/488/560/632) ----------
export const BOX = {x: colX(1) - 48, y: 328, w: colR(10) - colX(1) + 96, h: 352, r: 48, padX: 48, size: 61, lead: 72, base0: 416};
export const SEND_R = 32;

// ---------- the browser window per scene (stage px at camera s = 1) ----------
export const CHROME_H = 76; // tab strip 36 + toolbar 40
export type Rect = {x: number; y: number; w: number; h: number};
export const IMG = {
  ready: {src: 'real4/b_ready.png', w: 2880, h: 1656},
  sent: {src: 'real4/b_sent.png', w: 2880, h: 1656},
  read: {src: 'real4/b_read.png', w: 2880, h: 1656},
  built: {src: 'real4/b_built.png', w: 2880, h: 1656},
  pillPlate: {src: 'real4/b_ready_pillplate.png', x: 20, y: 1388, w: 840, h: 180},     // in builder crop px
  cardPlate: {src: 'real4/b_read_cardplate.png', w: 1356, h: 1222},                     // = B.picker rect
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
// real UI rects inside the builder crop (2x px, crop starts at 2x row 112)
export const B = {
  pill: {x: 58, y: 1424, w: 764, h: 108},
  bubble: {x: 126, y: 74, w: 614, h: 278},
  picker: {x: 1194, y: 233, w: 1356, h: 1222},
  loading: {x: 1574, y: 740, w: 596, h: 320},
  mapping: {x: 0, y: 0, w: 860, h: 1656},       // the whole left panel column slides in
  canvas: {x: 860, y: 0, w: 2020, h: 1656},
  nodes: [{x: 1400, y: 778, w: 300, h: 220, cx: 1547}, {x: 1860, y: 778, w: 130, h: 220, cx: 1922}, {x: 2230, y: 778, w: 140, h: 220, cx: 2297}],
  lines: [{x: 1590, y: 840, w: 290, h: 30}, {x: 1964, y: 840, w: 292, h: 30}],
  nodeCy: 856, nodeR: 42,
};
export const NOTION_TITLE = {cx: 334, cy: 86}; // notion crop px: centre of the title 'Maya Chen'
export const NOTION_BODY = {cx: 480, cy: 700}; // notion crop px of the 4 body lines' centre
export const SLACK_LINE = {cx: 470, cy: 60};   // message crop px of 'New lead with Maya Chen, ...'

const I = 'sfx/kenney/interface-sounds/', M = 'sfx/kenney/impact-sounds/', P = 'sfx/p05t4/';
const KEYS = [I + 'click_002.ogg', I + 'click_003.ogg', I + 'tick_002.ogg'];
export type Cue = {f: number; src: string; vol: number; why: string; dur?: number};
// One soft key per 3-frame character group, only while characters appear (T.type0 .. TYPE_END-1).
const keyCues: Cue[] = [];
for (let f = T.type0, i = 0; f < TYPE_END; f += 3, i++) keyCues.push({f, src: KEYS[i % 3], vol: 0.26 + 0.06 * ((i * 7) % 3) / 2, why: 'typing: soft key (character group appears)'});
const W_ = P + 'whoosh_s.ogg';
export const SFX: Cue[] = [
  ...HOOK.map((_, i) => ({f: WORD0 + i * WSTEP, src: I + 'tick_00' + (i % 2 ? 2 : 4) + '.ogg', vol: 0.36, why: 'hook word lands: tick'})),
  {f: T.win0, src: P + 'whoosh_m.ogg', vol: 0.12, why: 'window slides in from the right: whoosh'},
  {f: T.win1 - 2, src: I + 'switch_003.ogg', vol: 0.38, dur: 7, why: 'window lands: latch'},
  {f: T.lift0, src: W_, vol: 0.1, why: 'glass box lifts off the pill: soft whoosh'},
  ...keyCues,
  {f: T.press, src: I + 'click_001.ogg', vol: 0.7, why: 'press send: click'},
  {f: T.morph0, src: W_, vol: 0.13, why: 'box flies into the chat bubble: whoosh'},
  {f: T.morph1 - 2, src: I + 'switch_002.ogg', vol: 0.32, dur: 7, why: 'bubble lands: small latch'},
  {f: T.pick0, src: W_, vol: 0.06, why: 'camera glides + card transforms: whoosh'},
  {f: T.flow0, src: W_, vol: 0.06, why: 'mapping panel slides in: whoosh'},
  ...[T.node1, T.node2, T.node3].flatMap((t, i) => [
    {f: t, src: I + 'tick_001.ogg', vol: 0.5, why: `node ${i + 1} snaps in: tick`},
    {f: t + 2, src: W_, vol: 0.07, why: `null zoom on node ${i + 1}: soft whoosh`},
  ]),
  {f: T.nIn0, src: P + 'whoosh_m.ogg', vol: 0.15, why: 'push into the Notion node: whoosh (peaks on the open)'},
  {f: T.cutN, src: I + 'switch_003.ogg', vol: 0.34, dur: 7, why: 'Notion page opens: latch'},
  {f: T.cutN, src: M + 'impactMetal_light_002.ogg', vol: 0.3, why: 'Notion page opens: light metal hit'},
  ...[0, 1, 2, 3].flatMap((j) => [
    {f: T.line0 + j * LINE_STEP, src: I + 'tick_002.ogg', vol: 0.32, why: `Notion line ${j + 1} enters: soft tick`},
    {f: T.line0 + j * LINE_STEP + 2, src: W_, vol: 0.06, why: `null zoom on Notion line ${j + 1}: soft whoosh`},
  ]),
  {f: T.sSwap0, src: W_, vol: 0.15, why: 'Notion slides out / Slack slides in: whoosh (short, clears before the tick)'},
  {f: T.msg, src: I + 'glass_001.ogg', vol: 0.55, why: 'Slack message appears: notification tick'},
  {f: T.sPush0, src: W_, vol: 0.08, why: 'null zoom on the Slack message: soft whoosh'},
];
