// P01 timeline — frames at 30 fps, derived from the real VO (public/v/P01/vo.json: per-line duration + Whisper word timings).
// Beats land on the spoken words (crosses on "name / HubSpot / anyway", rows light on the payoff words).
// With no VO yet, durations are estimated (2.6 words/s) so stills still work.
import VOJ from '../../public/v/P01/vo.json';
import {VO as LINES} from './copy';

export const FPS = 30;
export type VoLine = {file: string; dur: number; words: {w: string; s: number; e: number}[]};
const est = (t: string): VoLine => { const ws = t.split(' '); const dur = ws.length / 2.6 + 0.2; return {file: '', dur, words: ws.map((w, j) => ({w, s: (j / ws.length) * dur, e: ((j + 1) / ws.length) * dur}))}; };
const RAW = VOJ as unknown as VoLine[];
export const HAS_VO = Array.isArray(RAW) && RAW.length === LINES.length;
export const VOL: VoLine[] = LINES.map((t, i) => (HAS_VO ? RAW[i] : est(t)));

const fr = (sec: number) => Math.round(sec * FPS);
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
// frame offset (from the line start) of the n-th word starting with `pre`; falls back to its position in the script
const w = (li: number, pre: string, nth = 0) => {
  let k = 0; for (const x of VOL[li].words) if (norm(x.w).startsWith(pre)) { if (k === nth) return fr(x.s); k++; }
  const toks = LINES[li].split(' ').map(norm); let n = 0; for (let j = 0; j < toks.length; j++) if (toks[j].startsWith(pre)) { if (n === nth) return fr((j / toks.length) * VOL[li].dur); n++; }
  return 0;
};
const D = VOL.map((l) => fr(l.dur));

// ---- hook ----
const AT0 = 3;
const morph = Math.max(90, AT0 + D[0] + 6);
// ---- problem ----
const AT1 = morph + 6;
const cross = [AT1 + w(1, 'name') + 6, AT1 + w(1, 'hubspot') + 8, AT1 + w(1, 'anyway') + 6];
const rows = [morph + 8, Math.max(morph + 30, cross[1] - 30), Math.max(morph + 52, cross[2] - 36)];
const crash = Math.max(cross[2] + 30, AT1 + D[1] + 2);
const scatter = crash + 10;
// ---- turn ----
const AT2 = scatter + 10;
const turnText = scatter + 9;
const glitch = Math.max(turnText + 14, AT2 + w(2, 'fix'));
const converge = Math.max(scatter + 36, AT2 + D[2] - 24);
const iris = converge + 14;
const body = iris + 12;
// ---- body: the sentence types while it is spoken ----
const typeAt = body + 15;
const AT3 = typeAt;
const CHARS = 91;
const cps = CHARS / Math.max(60, D[3] - 6);
const typeEnd = typeAt + Math.ceil(CHARS / cps);
const send = typeEnd + 14;
const lift = send + 6;
const plan = lift + 30;
// ---- payoff ----
const pull = Math.max(plan + 117, AT3 + D[3] + 10);
const AT4 = pull + 6;
const run = AT4 + Math.max(24, w(4, 'fansachat') - 2);
const lit = [Math.max(run + 15, AT4 + w(4, 'every')), Math.max(run + 30, AT4 + w(4, 'lands')), Math.max(run + 45, AT4 + w(4, 'task'))];
const done = Math.max(lit[2] + 20, AT4 + w(4, 'automatically'));
const pushDone = done + 9;
const end = Math.max(pushDone + 48, AT4 + D[4] + 8);
// ---- ending ----
const AT5 = end + 12;
export const TOTAL = Math.max(end + 120, AT5 + D[5] + 30);

export const T = {
  speck: 0, cardIn: 14,
  morph, rows, cross, crash,
  scatter, turnText, glitch, converge, iris, body,
  typeAt, cps, cursor: typeEnd - 8, send, lift, think: lift + 9, plan, morphPlan: plan + 24, nodes: plan + 42, edges: plan + 45, reply: plan + 45,
  pull, run, lit, done, pushDone,
  end, lockup: end - 5,
};
// where each VO line starts (frames)
export const VO_AT = [AT0, AT1, AT2, AT3, AT4, AT5];
