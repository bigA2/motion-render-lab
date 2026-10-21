// Production timeline: frames at 30 fps, derived from the real VO (public/v/<id>/vo.json: per-line duration + Whisper word timings).
// With no VO yet, durations are estimated (2.6 words/s) so stills still work.
export const FPS = 30;
export type VoLine = {file: string; dur: number; words: {w: string; s: number; e: number}[]};
export type Act = {kind: string; from: number; to: number; label?: string; dark?: boolean} & Record<string, any>;
export type Spec = {
  id: string; slug: string; music: string;
  lines: string[];
  pre?: Record<number, number>; // min frames between the end of line i-1 and the start of line i
  tail?: number;                // frames after the last word
  nocap?: number[];             // lines whose words are NOT captioned (kinetic text covers them)
  capUntil?: Record<number, string>; // line -> only words before the first word starting with this prefix are captioned
  labels?: Record<number, string>; // 16:9 only: small beat label above the captions, keyed by the line it starts at
  acts: Act[];
};

const est = (t: string): VoLine => { const ws = t.split(' '); const dur = ws.length / 2.6 + 0.2; return {file: '', dur, words: ws.map((w, j) => ({w, s: (j / ws.length) * dur, e: ((j + 1) / ws.length) * dur}))}; };
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export const buildTL = (spec: Spec, raw: unknown) => {
  const arr = raw as VoLine[];
  const HAS_VO = Array.isArray(arr) && arr.length === spec.lines.length;
  const VOL: VoLine[] = spec.lines.map((t, i) => (HAS_VO ? arr[i] : est(t)));
  const D = VOL.map((l) => Math.round(l.dur * FPS));
  const S: number[] = []; let at = 3;
  spec.lines.forEach((_, i) => {
    at = Math.max(at, i > 0 ? S[i - 1] + D[i - 1] + (spec.pre?.[i] ?? 9) : 0, 3);
    S[i] = at; at = S[i] + D[i];
  });
  const lastEnd = S[S.length - 1] + D[D.length - 1];
  const TOTAL = lastEnd + (spec.tail ?? 100);
  // absolute frame of the n-th word of line li starting with `pre` (Whisper timing; proportional fallback)
  const w = (li: number, pre: string, nth = 0): number => {
    let k = 0; for (const x of VOL[li].words) if (norm(x.w).startsWith(pre)) { if (k === nth) return S[li] + Math.round(x.s * FPS); k++; }
    const toks = spec.lines[li].split(' ').map(norm); let n = 0;
    for (let j = 0; j < toks.length; j++) if (toks[j].startsWith(pre)) { if (n === nth) return S[li] + Math.round((j / toks.length) * D[li]); n++; }
    return S[li];
  };
  // absolute frame where the last spoken word of line li ends
  const lineEnd = (li: number) => { const ws = VOL[li].words; return S[li] + (HAS_VO && ws.length ? Math.round(ws[ws.length - 1].e * FPS) : D[li]); };
  const acts = spec.acts.map((a) => ({...a, start: S[a.from], end: a.to + 1 < spec.lines.length ? S[a.to + 1] : TOTAL}));
  return {spec, HAS_VO, VOL, D, S, TOTAL, w, lineEnd, acts, FPS};
};
export type TL = ReturnType<typeof buildTL>;
