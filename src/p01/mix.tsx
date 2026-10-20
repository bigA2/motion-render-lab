// P01 dry audio: VO lines + one SFX per on-screen event (CC0 Kenney + self-made proc sounds). Music is mixed later (variant B).
// Mounted ONCE per format so the 16:9 blurred background copy never doubles the sound.
import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {HAS_VO, T, VO_AT, VOL} from './timeline';

const P = 'sfx/proc/', K = 'sfx/kenney/interface-sounds/';
// [frame, file, volume]; whooshes start ~half their length early so the peak lands on the cut
const EVENTS = (): [number, string, number][] => [
  [T.speck + 3, P + 'node_pop_1.ogg', 0.45],
  [T.morph - 4, P + 'transition_whoosh_0.25s.ogg', 0.3],
  ...T.rows.map((r): [number, string, number] => [r, P + 'typing_keyboard_0.6s.ogg', 0.22]),
  ...T.cross.map((c): [number, string, number] => [c, K + 'error_004.ogg', 0.38]),
  [T.crash, P + 'hook_bass_impact_0.8s.ogg', 0.42],
  [T.scatter - 6, P + 'transition_whoosh_0.45s.ogg', 0.42],
  [T.glitch, K + 'glitch_002.ogg', 0.4],
  [T.converge - 4, P + 'transition_whoosh_0.7s.ogg', 0.32],
  [T.iris, K + 'maximize_003.ogg', 0.3],
  [T.typeAt, P + 'typing_keyboard_2.0s.ogg', 0.24],
  [T.typeAt + 60, P + 'typing_keyboard_1.2s.ogg', 0.24],
  [T.send, P + 'ui_click_1.ogg', 0.5],
  [T.lift - 2, P + 'transition_whoosh_0.25s.ogg', 0.25],
  [T.plan, P + 'node_pop_2.ogg', 0.38],
  ...[0, 1, 2].map((i): [number, string, number] => [T.plan + 14 + i * 6, P + 'ui_tick_1.ogg', 0.3]),
  ...[0, 1, 2].map((i): [number, string, number] => [T.morphPlan + 8 + i * 3, P + `node_pop_${3 + i}.ogg`, 0.3]),
  [T.pull - 4, P + 'transition_whoosh_0.45s.ogg', 0.28],
  [T.run, P + 'ui_click_2.ogg', 0.5],
  ...T.lit.map((l): [number, string, number] => [l, K + 'confirmation_001.ogg', 0.24]),
  [T.done, P + 'success_chime_G.ogg', 0.45],
  [T.pushDone - 3, P + 'transition_whoosh_0.25s.ogg', 0.28],
  [T.end, P + 'hook_bass_impact_1.2s.ogg', 0.4],
  [T.lockup + 30, K + 'glass_002.ogg', 0.32],
];

export const Mix: React.FC = () => <>
  {HAS_VO ? VOL.map((l, i) => <Sequence key={'v' + i} from={VO_AT[i]}><Audio src={staticFile(l.file)} /></Sequence>) : null}
  {EVENTS().map(([at, file, v], i) => <Sequence key={'s' + i} from={Math.max(0, Math.round(at))}><Audio src={staticFile(file)} volume={v} /></Sequence>)}
</>;
