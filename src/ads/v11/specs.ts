// P01–P07 v11 specs: same scripts/VO/timings as v10 (src/ads/specs10.ts); each video gets its own background type,
// colour combo (founder: sky blue+white, dark+blue, orange+warm, …), hook layout, flow staging, transition, end card and
// closing proof mockup. Contrast of every hot colour vs both bg stops is checked by scripts/v11_checks.mjs.
import type {Scene, Spec, Theme} from './kit';
import {SPECS10} from '../specs10';

const T = (t: Theme) => t;
const THEMES: Record<string, Theme> = {
  p01v8: T({bg: ['#EEF3FF', '#D6E2FB'], bloom: ['#1E4FD8', '#7AA7FF', '#38BDF8'], hot: ['#1D4ED8', '#6D28D9'], type: 'liquid', liquid: true, stage: 'laptop', tilt: 0, hook: 'stack', wipe: 'blur', end: 'center', proof: 'dashboard'}),
  p02v8: T({bg: ['#F3EFFF', '#FFF1EA'], bloom: ['rgba(139,92,246,.6)', 'rgba(251,146,120,.55)', 'rgba(196,181,253,.6)'], hot: ['#5B21B6', '#B4380B'], type: 'aurora', liquid: true, stage: 'land', tilt: 20, hook: 'side', wipe: 'circle', end: 'split', proof: 'approvals'}),
  p03v8: T({bg: ['#070B1C', '#0C1430'], bloom: ['rgba(37,99,235,.55)', '#7DD3FC', '#FFFFFF'], hot: ['#7DD3FC', '#C4B5FD'], type: 'particles', dark: true, stage: 'panel', tilt: 12, hook: 'stack', wipe: 'blur', end: 'center', proof: 'history'}),
  p04v8: T({bg: ['#07070A', '#121014'], bloom: ['rgba(212,175,55,.55)', 'rgba(180,140,40,.45)', '#F5D27A'], hot: ['#F5D27A', '#E9E4D8'], type: 'gold', dark: true, stage: 'panel', tilt: 14, hook: 'stack', wipe: 'zoom', end: 'split', proof: 'billing'}),
  p05v8: T({bg: ['#FFFFFF', '#F6F4FF'], bloom: ['#6D28D9', '#A78BFA', 'rgba(196,181,253,.55)'], hot: ['#5B21B6', '#9D174D'], type: 'arcs', stage: 'laptop', tilt: 0, hook: 'side', wipe: 'slide', end: 'center', proof: 'inbox'}),
  p06v8: T({bg: ['#FFFBF5', '#FDF4EC'], bloom: ['rgba(251,207,232,.9)', 'rgba(187,247,208,.85)', 'rgba(196,181,253,.8)'], hot: ['#BE185D', '#047857'], type: 'pastel', stage: 'land', tilt: 12, hook: 'stack', wipe: 'circle', end: 'left', proof: 'checklist'}),
  p07v8: T({bg: ['#03100F', '#061A18'], bloom: ['rgba(20,184,166,.5)', '#2DD4BF', '#5EEAD4'], hot: ['#5EEAD4', '#FDE68A'], type: 'neon', dark: true, stage: 'panel', tilt: 10, hook: 'behind', wipe: 'whip', end: 'center', proof: 'report'}),
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
