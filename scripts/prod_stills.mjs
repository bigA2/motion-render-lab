// Storyboard stills + contact sheets for a production video: node scripts/prod_stills.mjs <vid> [secs...]
// One bundle, both formats (<vid>-4x5, <vid>-16x9). blank secs = 12 evenly spaced times incl. frame 0.
import path from 'node:path';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';

const vid = process.argv[2];
const given = (process.argv[3] ?? '').trim().split(/\s+/).filter(Boolean).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/prod/index.ts'), publicDir: path.resolve('public')});
fs.mkdirSync('stills', {recursive: true});
for (const fmt of ['4x5', '16x9']) {
  const comp = await selectComposition({serveUrl, id: `${vid}-${fmt}`});
  const dur = comp.durationInFrames / comp.fps;
  const secs = given.length ? given : Array.from({length: 12}, (_, i) => +((i * (dur - 0.4)) / 11).toFixed(2));
  const files = [];
  for (const s of secs) {
    const out = `stills/${vid}_${fmt}_${s}.png`;
    await renderStill({composition: comp, serveUrl, output: out, frame: Math.min(comp.durationInFrames - 1, Math.round(s * comp.fps)), scale: 0.5, timeoutInMilliseconds: 120000});
    files.push([s, out]);
  }
  fs.writeFileSync(`stills/${vid}_${fmt}_list.json`, JSON.stringify(files));
  execFileSync('python3', ['scripts/prod_sheet.py', `stills/${vid}_${fmt}_list.json`, `stills/SHEET_${vid}_${fmt}.jpg`, fmt], {stdio: 'inherit'});
  console.log(vid, fmt, 'done', secs.length, 'stills');
}
