// v11 contrast check (WCAG): every hot colour and the ink colour vs BOTH background stops of its video.
// Body/hot text must be >= 4.5:1 (we hold hot words to 4.5 too, though they are large display text).
// Run: node scripts/v11_checks.mjs   (exits 1 on any failure)
import {readFileSync} from 'node:fs';
const src = readFileSync(new URL('../src/ads/v11/specs.ts', import.meta.url), 'utf8');
const lum = (hex) => { const c = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
let fail = 0;
for (const m of src.matchAll(/(p0\dv8): T\(\{bg: \['(#\w+)', '(#\w+)'\].*?hot: \['(#\w+)', '(#\w+)'\](.*)/g)) {
  const [, id, b0, b1, h0, h1, rest] = m, dark = rest.includes('dark: true'), ink = dark ? '#F4F6FF' : '#0E1222', sub = dark ? '#B9C3E6' : '#545B70';
  const rows = [['hot0', h0], ['hot1', h1], ['ink', ink], ['sub', sub]].map(([n, c]) => { const r = Math.min(ratio(c, b0), ratio(c, b1)); if (r < 4.5) fail++; return `${n} ${c} ${r.toFixed(2)}${r < 4.5 ? ' FAIL' : ''}`; });
  console.log(id, rows.join(' | '));
}
process.exit(fail ? 1 : 0);
