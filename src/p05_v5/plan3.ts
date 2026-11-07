// P05 v5 test shot 3: timing, geometry, camera keys and SFX rows (pure data). 5:4 1350x1080, 30 fps.
// Worlds are crisp crops of real captures (public/real3/*): our builder panel (2x), the real Notion page (2x) and the
// real Slack channel strip (1x, the only capture we have). Each crop is shown at <= 1.0 of its pixels except Slack.
export const FPS = 30;
export const TOTAL = 200;
export const W = 1350, H = 1080;

export const HOOK: {w: string; line: 0 | 1; bold: boolean}[] = [
  {w: 'Still', line: 0, bold: false}, {w: 'copying', line: 0, bold: false}, {w: 'leads', line: 0, bold: false},
  {w: 'by', line: 1, bold: true}, {w: 'hand?', line: 1, bold: true},
];
export const WORD0 = 2, WSTEP = 3, WDUR = 8;

export const T = {
  hookOut: 21, cut1: 27,          // hook leaves (+18 %, blur), builder panel cuts in 0.82 -> 1
  dive0: 36, dive1: 54,           // camera dives from the whole panel to the composer (log-space scale, peaked)
  lift0: 54, lift1: 64,           // glass box lifts off the real pill and opens to hero size
  type0: 62,                      // first character (2 chars / frame)
  cursorIn: 96, press: 110,       // cursor glides in, press send
  compact0: 112, compact1: 124,   // box shrinks to a fixed bar at the top (animated BEFORE the cut, VAk5)
  cut2: 126,                      // match cut #1: world -> real Notion page, box fixed
  nPush0: 138, nPush1: 156,       // push-in to the key lines (Company / Budget)
  cut3: 166,                      // match cut #2: world -> real Slack channel, box fixed
  sPush0: 174, sPush1: 190,       // push-in to the FansaChat row
  end: TOTAL,
};
export const CPS = 2;
// Pre-broken so nothing reflows while typing (phone-readable 58 px bold).
export const LINES = ['When a new lead fills', 'my website form, add them', 'to Notion and ping #sales', 'on Slack.'];

// Screen-space boxes. Pill = the real composer pill at the composer camera (panel px 26..886 x 1643..1751, s = 1).
export const PILL_CAM = {cx: 456, cy: 1316, s: 1.0};
export const PILL_PANEL = {x: 26, y: 1643, w: 860, h: 108};
export const HERO = {x: 225, y: 206, w: 900, h: 340, r: 52};   // sized to the text (r1 was 1080 wide: empty right half)
export const COMPACT = {sc: 0.56, cy: 138};  // box scale + screen centre y when parked at the top
export const TYPE = {size: 58, lh: 1.16, padX: 60, padY: 46};
export const SEND_R = 34;

// Worlds (image px) and cameras: world point (cx, cy) lands on the anchor (ax, ay), scale s.
export const IMG = {
  panel: {src: 'real3/fc_panel.png', w: 912, h: 1856, r: 56},
  notion: {src: 'real3/notion_page.png', w: 1200, h: 790, r: 22},
  slack: {src: 'real3/slack_newest.png', w: 962, h: 419, r: 18},
};
export const CAM = {
  panel: {cx: 456, cy: 928, s: 0.56, ax: 675, ay: 540},
  pill: {...PILL_CAM, ax: 675, ay: 540},
  notionFit: {cx: 600, cy: 395, s: 0.95, ax: 675, ay: 668},
  notionKey: {cx: 400, cy: 662, s: 1.3, ax: 675, ay: 668},     // Name / Company / Budget / Need lines
  slackFit: {cx: 481, cy: 210, s: 1.2, ax: 675, ay: 668},
  slackKey: {cx: 300, cy: 360, s: 1.75, ax: 675, ay: 640},      // Today + FansaChat APP 12:34 PM (1x capture: upscaled)
};

const I = 'sfx/kenney/interface-sounds/', M = 'sfx/kenney/impact-sounds/';
export const SFX: {f: number; src: string; vol: number; dur?: number; why: string}[] = [
  ...HOOK.map((_, i) => ({f: WORD0 + i * WSTEP, src: I + 'tick_00' + (i % 2 ? 2 : 4) + '.ogg', vol: 0.4, why: 'word lands: relay tick'})),
  {f: T.cut1, src: I + 'switch_003.ogg', vol: 0.6, why: 'panel cuts in: latch'},
  {f: T.dive0, src: I + 'scroll_002.ogg', vol: 0.5, why: 'camera dives: rail'},
  {f: T.lift0, src: I + 'switch_002.ogg', vol: 0.4, why: 'box lifts off the pill: small latch'},
  {f: T.type0, src: 'sfx/proc/typing_keyboard_1.2s.ogg', vol: 0.55, why: 'typing: mechanical keys'},
  {f: T.type0 + 34, src: 'sfx/proc/typing_keyboard_0.6s.ogg', vol: 0.45, dur: 10, why: 'typing tail (cut at the last key)'},
  {f: T.press, src: I + 'click_003.ogg', vol: 0.8, why: 'press send: switch'},
  {f: T.compact0 + 2, src: I + 'scroll_004.ogg', vol: 0.4, why: 'box parks at the top: rail'},
  {f: T.cut2, src: M + 'impactMetal_light_002.ogg', vol: 0.5, why: 'match cut to Notion: light metal hit'},
  {f: T.cut2, src: I + 'switch_003.ogg', vol: 0.35, why: 'match cut: latch under the hit'},
  {f: T.nPush0, src: I + 'scroll_002.ogg', vol: 0.3, why: 'push-in: rail'},
  {f: T.cut3, src: M + 'impactMetal_light_004.ogg', vol: 0.5, why: 'match cut to Slack: light metal hit'},
  {f: T.cut3, src: 'sfx/proc/hook_bass_impact_0.8s.ogg', vol: 0.35, why: 'payoff: low thump'},
  {f: T.sPush0, src: I + 'scroll_004.ogg', vol: 0.3, why: 'push-in: rail'},
];
