// @ts-nocheck — node script (run with tsx), not part of the Remotion bundle
// Writes out/events_<ID>.json (fps, frames, VO placements, SFX events, music) for tools/p05_07/sfx_mix.py.
// Run: npx tsx src/p05_07/dump.ts P05 [P06 ...]
import {mkdirSync, writeFileSync} from 'fs';
import * as P05 from './P05/plan';
import * as P06 from './P06/plan';

type Plan = {FPS: number; TOTAL: number; VO: number[]; VO_FILES: string[]; MUSIC: string; events: () => unknown[]};
const PLANS: Record<string, Plan> = {P05, P06};
mkdirSync('out', {recursive: true});
for (const id of process.argv.slice(2)) {
  const p = PLANS[id]; if (!p) throw new Error('no plan ' + id);
  const ev = p.events();
  writeFileSync(`out/events_${id}.json`, JSON.stringify({id, fps: p.FPS, frames: p.TOTAL, vo: p.VO.map((f, i) => ({file: p.VO_FILES[i], f})), ev, music: p.MUSIC}));
  console.log(id, 'frames', p.TOTAL, 'events', ev.length);
}
