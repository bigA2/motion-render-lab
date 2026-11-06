// @ts-nocheck — node script (run with tsx), not part of the Remotion bundle
// Writes out/events_P05V4.json (fps, frames, SFX events with key times for typing, music + offset) for tools/p05_v4/mix.py,
// and FAILS if the sound rules are broken (impacts 2-3 and >= 3 s apart, no same sound within 0.4 s).
import {mkdirSync, writeFileSync} from 'fs';
import * as P from './plan';

mkdirSync('out', {recursive: true});
const ev = P.events();
const keys = {doc: P.typeKeys(P.TY.doc), chat: P.typeKeys(P.TY.chat), prompt: P.typeKeys(P.TY.prompt), title: P.typeKeys(P.TY.title)};
const errs = P.checkRules(ev);
writeFileSync('out/events_P05V4.json', JSON.stringify({id: 'P05V4', fps: P.FPS, frames: P.TOTAL, ev, keys, music: P.MUSIC, music_offset: P.MUSIC_OFFSET, silence: P.SILENCE, rule_errors: errs}));
console.log('P05V4 frames', P.TOTAL, 'events', ev.length, (ev.length / (P.TOTAL / P.FPS)).toFixed(2), 'per s');
for (const e of ev) console.log(String((e.f / P.FPS).toFixed(2)).padStart(6), e.kind.padEnd(7), e.snd.padEnd(12), e.src);
if (errs.length) { console.error('SFX RULES BROKEN:', errs); process.exit(1); }
console.log('sfx rules ok');
