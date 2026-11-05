// @ts-nocheck — node script (run with tsx), not part of the Remotion bundle
// Writes out/events_P05AD.json (fps, frames, SFX events, music + offset) for tools/p05_07/ad_mix.py.
import {mkdirSync, writeFileSync} from 'fs';
import * as P from './plan';

mkdirSync('out', {recursive: true});
const ev = P.events();
writeFileSync('out/events_P05AD.json', JSON.stringify({id: 'P05AD', fps: P.FPS, frames: P.TOTAL, bpm: P.BPM, ev, music: P.MUSIC, music_offset: P.MUSIC_OFFSET}));
console.log('P05AD frames', P.TOTAL, 'events', ev.length, (ev.length / (P.TOTAL / P.FPS)).toFixed(2), 'per s');
for (const e of ev) console.log(String((e.f / P.FPS).toFixed(2)).padStart(6), e.kind.padEnd(7), e.src);
