// P05–P07 entry: 9:16 (1080x1920) and 4:5 (1080x1350), 60 fps. Same world + camera in both; 4:5 sees a
// shorter vertical slice. Audio is mixed outside Remotion from the plan's events (tools/p05_07/sfx_mix.py).
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film as F05} from './P05/Film';
import * as P05 from './P05/plan';

const h = React.createElement;
const V: {id: string; c: React.FC; n: number}[] = [{id: 'P05', c: F05, n: P05.TOTAL}];
const Root: React.FC = () => h(React.Fragment, null, ...V.flatMap((v) => [
  h(Composition, {key: v.id, id: v.id, component: v.c, durationInFrames: v.n, fps: 60, width: 1080, height: 1920}),
  h(Composition, {key: v.id + '45', id: `${v.id}-4x5`, component: v.c, durationInFrames: v.n, fps: 60, width: 1080, height: 1350}),
]));
registerRoot(Root);
