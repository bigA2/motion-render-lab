// Timing, grid and SFX rows for the P05 v5 hook shot (pure data, shared by picture and sound).
export const FPS = 30;
export const TOTAL = 135; // 4.5 s
// 5:4 grid: 1350x1080, 12 columns, outer margin 96 px, gutter 24 px; title-safe band top 120..330.
export const G = {W: 1350, H: 1080, M: 96, cardW: 1158, cardX: 96, cardY: 372};
export const CARD_H = Math.round(G.cardW * 1080 / 1920); // 651, the recording keeps its 16:9
// Hook (8 words). Word i lands at WORD0 + i*WSTEP frames; the accent phrase is set in the serif italic.
export const HOOK = ['Still', 'copying', 'leads', 'by hand', 'at', '11 PM?'];
export const ACCENT = new Set(['by hand']);
export const WORD0 = 4; export const WSTEP = 4;
export const T = {
  lift: 32,    // hook rises to the title band
  card: 34,    // real UI window enters (18 f, expo-out)
  settle: 52,  // window settles: latch
  cursorIn: 70, press: 98, send: 100, // cursor travels, presses send (switch), message goes
  end: TOTAL,
};
// Recording: the request is typed 30.3..32.1 s, sent at 32.8 s (P05_timing.json). Start so 'sent' lands on T.send.
export const REC_START_S = 32.8 - (T.send - T.card) / FPS; // 30.6 s
// Send button inside the 1920x1080 recording (measured on the frame at 32.0 s).
export const SEND = {x: 528, y: 965};
// Mechanical SFX vocabulary: one row per sound. f = first visible frame of its event.
export const SFX: {f: number; src: string; vol: number; why: string}[] = [
  ...HOOK.map((_, i) => ({f: WORD0 + i * WSTEP, src: 'sfx/kenney/interface-sounds/tick_00' + (i % 2 ? 2 : 4) + '.ogg', vol: 0.32, why: 'word lands: relay tick'})),
  {f: T.card, src: 'sfx/kenney/interface-sounds/scroll_002.ogg', vol: 0.35, why: 'window slides in: rail'},
  {f: T.settle, src: 'sfx/kenney/interface-sounds/switch_003.ogg', vol: 0.55, why: 'window settles: latch'},
  {f: T.press, src: 'sfx/kenney/interface-sounds/click_003.ogg', vol: 0.75, why: 'cursor press: switch down'},
  {f: T.send, src: 'sfx/kenney/impact-sounds/impactMetal_light_002.ogg', vol: 0.35, why: 'message sent: structural hit'},
];
