// P01 timeline — all times in frames at 30 fps (script beats: hook 0–3, problem 3–9, turn 9–11, body 11–20, payoff 20–26, end 26–30 s)
export const FPS = 30;
export const TOTAL = 900;
export const s = (sec: number) => Math.round(sec * FPS);

export const T = {
  // hook
  speck: 0, cardIn: 14,
  // problem: card becomes the checklist; rows write in, red crosses draw on the VO stress words
  morph: s(3), rows: [s(3.5), s(5), s(6.5)], cross: [s(4.4), s(5.9), s(7.6)], crash: s(8.6),
  // turn: list scatters → "let's fix that" → particles form the chat box
  scatter: s(8.95), turnText: s(9.25), glitch: s(9.7), converge: s(10.15), iris: s(10.6), body: s(11),
  // body
  typeAt: s(11.5), cps: 1.05, cursor: s(14.15), send: s(14.9), lift: s(15.1), think: s(15.4), plan: s(16.1), morphPlan: s(16.9), nodes: s(17.5), edges: s(17.6), reply: s(17.6),
  // payoff
  pull: s(20), run: s(21.3), lit: [s(21.8), s(22.6), s(23.4)], done: s(24.1), pushDone: s(24.4),
  // ending (hard cut)
  end: s(26), lockup: s(25.85),
};
// VO windows [start, end] in frames for caption word timing (estimated until the real VO exists)
export const VO_WIN: [number, number][] = [[3, 87], [96, 262], [278, 328], [-1, -1], [606, 772], [792, 885]];
