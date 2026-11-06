// Quick stills of the P05 v3 compositions (both formats) before the full render. MIT, our own code.
// Usage: node tools/p05_v3/stills.mjs <outdir> <f1,f2,...> <compId> [compId ...]
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'fs';
import path from 'path';

const [out, frames, ...ids] = process.argv.slice(2);
mkdirSync(out, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/p05_v3/index.ts')});
for (const id of ids) {
  const composition = await selectComposition({serveUrl, id});
  for (const f of frames.split(',').map(Number)) await renderStill({serveUrl, composition, frame: f, output: `${out}/${id}_${String(f).padStart(3, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 80});
}
console.log('stills ok', ids.join(' '), frames);
