// P01–P07 v11 specs: same scripts/VO/timings as v10 (src/ads/specs10.ts); each video gets its own background type,
// colour combo (founder: sky blue+white, dark+blue, orange+warm, …), hook layout, flow staging, transition, end card and
// closing proof mockup. Contrast of every hot colour vs both bg stops is checked by scripts/v11_checks.mjs.
import type {Scene, Spec, Theme} from './kit';
import {SPECS10} from '../specs10';

const T = (t: Theme) => t;
const THEMES: Record<string, Theme> = {
  p01v8: T({bg: ['#EEF3FF', '#D6E2FB'], bloom: ['#1E4FD8', '#7AA7FF', '#38BDF8'], hot: ['#1D4ED8', '#6D28D9'], type: 'liquid', liquid: true, stage: 'laptop', tilt: 0, hook: 'stack', wipe: 'blur', end: 'center', proof: 'dashboard'}),
  p02v8: T({bg: ['#F3EFFF', '#FFF1EA'], bloom: ['rgba(139,92,246,.6)', 'rgba(251,146,120,.55)', 'rgba(196,181,253,.6)'], hot: ['#5B21B6', '#B4380B'], type: 'aurora', liquid: true, stage: 'land', tilt: 20, hook: 'side', wipe: 'circle', end: 'split', proof: 'approvals'}),
  p03v8: T({bg: ['#0A0F24', '#111C44'], bloom: ['#1D4ED8', '#38BDF8', '#818CF8'], hot: ['#7DD3FC', '#F9A8D4'], type: 'waves', dark: true, stage: 'panel', tilt: 16, hook: 'behind', wipe: 'whip', end: 'left', proof: 'history'}),
  p04v8: T({bg: ['#FFF4EC', '#FFE2CC'], bloom: ['rgba(251,146,60,.75)', 'rgba(244,114,182,.5)', 'rgba(253,186,116,.8)'], hot: ['#9A3412', '#3730A3'], type: 'bends', stage: 'panel', tilt: 22, hook: 'stack', wipe: 'zoom', end: 'split', proof: 'billing'}),
  p05v8: T({bg: ['#ECFBFE', '#D9F3F8'], bloom: ['#22D3EE', '#E879F9', '#2DD4BF'], hot: ['#0E6A85', '#9D1AAB'], type: 'metaballs', stage: 'laptop', tilt: 0, hook: 'side', wipe: 'slide', end: 'center', proof: 'inbox'}),
  p06v8: T({bg: ['#FFF1F4', '#FBE4EC'], bloom: ['rgba(244,63,94,.6)', 'rgba(126,34,206,.5)', 'rgba(251,113,133,.6)'], hot: ['#9F1239', '#581C87'], type: 'silk', stage: 'land', tilt: 24, hook: 'behind', wipe: 'circle', end: 'left', proof: 'checklist'}),
  p07v8: T({bg: ['#FFF9EE', '#FDEFD6'], bloom: ['#6366F1', '#F59E0B', 'rgba(255,255,255,.95)'], hot: ['#3730A3', '#9A4A07'], type: 'contours', stage: 'panel', tilt: 12, hook: 'stack', wipe: 'blur', end: 'center', proof: 'report'}),
};
// closing rows per proof mockup (P02/P04 had none in v10)
const ROWS: Record<string, [string, string][]> = {
  p02v8: [['HubSpot deals → Sales sheet', 'Sales'], ['Canva briefs → Slack', 'Design'], ['QuickBooks invoices', 'Finance']],
  p04v8: [],
};

export const SPECS11: Spec[] = SPECS10.map((sp) => ({
  ...(sp as unknown as Spec),
  theme: THEMES[sp.id],
  scenes: (sp.scenes as unknown as Scene[]).map((sc) => (sc.kind === 'team' ? {...sc, kind: 'proof', rows: ROWS[sp.id] ?? sc.rows} as Scene : sc)),
}));
