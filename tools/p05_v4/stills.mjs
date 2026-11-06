// P05 v4 animatic / QA stills: every Nth frame of each composition (default 10 = 6 fps) as JPEGs, then an 8-column
// sheet per format with the time under each cell (same grid as the reference study sheets). MIT, our own code.
// Usage: node tools/p05_v4/stills.mjs <outdir> <everyNth> <compId> [compId ...]   (BROWSER=/path/to/chrome optional)
import {bundle} from '@remotion/bundler';
import {renderFrames, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'child_process';
import {mkdirSync, readdirSync} from 'fs';
import path from 'path';

const [out, nth, ...ids] = process.argv.slice(2);
const every = +nth || 10;
const serveUrl = await bundle({entryPoint: path.resolve('src/p05_v4/index.ts')});
for (const id of ids) {
  const composition = await selectComposition({serveUrl, id, browserExecutable: process.env.BROWSER || null});
  const dir = path.join(out, id); mkdirSync(dir, {recursive: true});
  await renderFrames({serveUrl, composition, outputDir: dir, imageFormat: 'jpeg', jpegQuality: 80, everyNthFrame: every, concurrency: '100%',
    browserExecutable: process.env.BROWSER || null, onStart: () => {}, onFrameUpdate: () => {}, logLevel: 'error', timeoutInMilliseconds: 120000});
  const files = readdirSync(dir).filter((f) => f.endsWith('.jpeg')).sort();
  // label each cell with its time, then tile 8 across
  const lab = path.join(dir, 'lab'); mkdirSync(lab, {recursive: true});
  files.forEach((f, i) => {
    const t = ((i * every) / 60).toFixed(2) + 's';
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(dir, f), '-vf', `scale=240:-2,pad=iw:ih+28:0:0:0x14161c,drawtext=text='${t}':x=6:y=h-22:fontcolor=white:fontsize=16`, path.join(lab, `c${String(i).padStart(3, '0')}.png`)]);
  });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(lab, 'c%03d.png'), '-vf', `tile=8x${Math.ceil(files.length / 8)}:padding=2:color=0x0b0d10`, '-frames:v', '1', path.join(out, `${id}_sheet.jpg`)]);
  console.log('sheet', id, files.length, 'cells');
}
