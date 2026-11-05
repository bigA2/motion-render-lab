// Render a frame range of a src/p05_07 composition AND collect the TextGuard boxes the page logs (TG|{...}).
// Usage: node tools/p05_07/render_guarded.mjs <compId> <out.mp4> <tg.json> [a b | p/k]  (frame range a..b inclusive, or part p of k)
// MIT, our own code.
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {writeFileSync} from 'fs';
import path from 'path';

const [id, out, tgOut, a, b] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/p05_07/index.ts')});
const composition = await selectComposition({serveUrl, id});
const N = composition.durationInFrames;
let frameRange = a !== undefined && a !== '' ? [Math.max(0, +a), Math.min(N - 1, +b)] : null;
if (a && a.includes('/')) { const [p, k] = a.split('/').map(Number); frameRange = [Math.floor((N * p) / k), Math.floor((N * (p + 1)) / k) - 1]; } // part p of k
const seen = new Map();
await renderMedia({
  serveUrl, composition, codec: 'h264', outputLocation: out, muted: true, crf: 15, pixelFormat: 'yuv420p',
  frameRange, concurrency: '100%', timeoutInMilliseconds: 180000, logLevel: 'error',
  onBrowserLog: (l) => { const i = l.text.indexOf('TG|'); if (i < 0) return; const j = JSON.parse(l.text.slice(i + 3)); seen.set(j.f, j); },
});
const frames = [...seen.values()].sort((x, y) => x.f - y.f);
writeFileSync(tgOut, JSON.stringify({id, n: N, range: frameRange, frames}));
console.log(`rendered ${id} ${frameRange ?? 'all'} -> ${out}; text-guard frames: ${frames.length}`);
