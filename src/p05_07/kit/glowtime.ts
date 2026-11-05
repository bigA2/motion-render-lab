// Timing for the glow-trail typewriter (pure TS, so the SFX dump can import it). MIT, our own code.
export type Glow = {start: number; perChar: number; head: number};
/** frame the i-th letter of the line snaps on */
export const glowAt = (g: Glow, i: number) => g.start + i * g.perChar;
/** frame letter i has settled to the base colour (its glow is gone) */
export const glowDone = (g: Glow, i: number) => g.start + (i + g.head) * g.perChar;
