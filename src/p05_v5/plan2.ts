// P05 v5 test shot 2: timing, camera keys and SFX rows (pure data). 5:4 1350x1080, 30 fps, 4.5 s.
// World = one real 1920x1080 still of our app (public/real/P05_still_empty.png, then P05_still_sent.png).
export const FPS = 30;
export const TOTAL = 135;
export const W = 1350, H = 1080;

// Hook: words reveal 3 f apart (8 f each), all exit together (1 f stagger, 6 f, blur + scale 1.18).
export const HOOK: {w: string; line: 0 | 1; bold: boolean}[] = [
  {w: 'Still', line: 0, bold: false}, {w: 'copying', line: 0, bold: false}, {w: 'leads', line: 0, bold: false},
  {w: 'by', line: 1, bold: true}, {w: 'hand?', line: 1, bold: true},
];
export const WORD0 = 2, WSTEP = 3, WDUR = 8;
export const T = {
  hookOut: 23,   // words start leaving (ease-in, peak speed at the cut)
  cut1: 29,      // real app window cuts in at 0.82 -> 1 (UI-morph incoming)
  zoom0: 39, zoom1: 62, // camera dives into the composer (peaked in-out)
  dof0: 50, dof1: 64,   // background goes out of focus, pill comes forward
  type0: 64,     // first character
  track0: 106, track1: 117, // camera tracks to the send button
  cursorIn: 100, press: 116,
  cut2: 120,     // send: hard cut to the real 'sent' still (0.84 -> 1)
  end: TOTAL,
};
export const CPS = 2.0; // characters per frame
export const LINES = ['When someone books a sales call,', 'create a Notion page, then post in Slack.'];
export const PROMPT = LINES.join(' ');

// Real geometry inside the 1920x1080 recording frame (measured on the still).
export const PILL = {x: 29, w: 526, bottom: 1002, h1: 54, h2: 80}; // composer pill; grows upward like the real UI
export const SEND = {x: 528, y: 975.5, r: 21}; // send button centre (one-line pill)
export const PILL_GRAD = 'linear-gradient(90deg, #F4D3CC 0%, #ECCED1 23%, #E1C5DA 42%, #DDC2E5 61%, #D3BDEE 80%, #CDBCF0 100%)';
export const UI_FONT = 19; // world px of the typed text (~44 px on screen at 2.25x with the 1.03 pop)

// Camera keys: world centre (cx, cy) and scale s.
export const CAM = {
  window: {cx: 960, cy: 540, s: 0.66},
  composer: {cx: 292, cy: 944, s: 2.15},
  drift: {cx: 292, cy: 950, s: 2.25},
  send: {cx: 470, cy: 962, s: 2.9},
  push: {cx: 528, cy: 962, s: 3.4},
  sent: {cx: 300, cy: 250, s: 2.0},
};

// Mechanical SFX (Kenney CC0 + our procedural keyboard). f = first visible frame of the event.
export const SFX: {f: number; src: string; vol: number; why: string}[] = [
  ...HOOK.map((_, i) => ({f: WORD0 + i * WSTEP, src: 'sfx/kenney/interface-sounds/tick_00' + (i % 2 ? 2 : 4) + '.ogg', vol: 0.4, why: 'word lands: relay tick'})),
  {f: T.cut1, src: 'sfx/kenney/interface-sounds/switch_003.ogg', vol: 0.6, why: 'window cuts in: latch'},
  {f: T.zoom0, src: 'sfx/kenney/interface-sounds/scroll_002.ogg', vol: 0.5, why: 'camera dives: rail'},
  {f: T.zoom1, src: 'sfx/kenney/interface-sounds/switch_002.ogg', vol: 0.35, why: 'camera lands on the composer: small latch'},
  {f: T.type0, src: 'sfx/proc/typing_keyboard_1.2s.ogg', vol: 0.55, why: 'typing: mechanical keys'},
  {f: T.type0 + 36, src: 'sfx/proc/typing_keyboard_0.6s.ogg', vol: 0.45, why: 'typing tail'},
  {f: T.track0, src: 'sfx/kenney/interface-sounds/scroll_004.ogg', vol: 0.35, why: 'track to send: rail'},
  {f: T.press, src: 'sfx/kenney/interface-sounds/click_003.ogg', vol: 0.8, why: 'press send: switch'},
  {f: T.cut2, src: 'sfx/kenney/impact-sounds/impactMetal_light_002.ogg', vol: 0.5, why: 'sent / cut: light metal hit'},
  {f: T.cut2, src: 'sfx/proc/hook_bass_impact_0.8s.ogg', vol: 0.35, why: 'cut: low thump under the hit'},
];
