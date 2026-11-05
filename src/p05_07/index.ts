// P05–P07 entry: 9:16 (1080x1920) and 4:5 (1080x1350), 60 fps. Same world + camera in both; 4:5 sees a
// shorter vertical slice. Audio is mixed outside Remotion from the plan's events (tools/p05_07/sfx_mix.py).
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film as F05} from './P05/Film';
import * as P05 from './P05/plan';
import {Film as F06} from './P06/Film';
import * as P06 from './P06/plan';
import {Film as F07} from './P07/Film';
import * as P07 from './P07/plan';
import {Film as F05R} from './P05R/Film';
import * as P05R from './P05R/plan';

const h = React.createElement;
const V: {id: string; c: React.FC; n: number}[] = [{id: 'P05', c: F05, n: P05.TOTAL}, {id: 'P06', c: F06, n: P06.TOTAL}, {id: 'P07', c: F07, n: P07.TOTAL}, {id: 'P05R', c: F05R, n: P05R.TOTAL}];
const Root: React.FC = () => h(React.Fragment, null, ...V.flatMap((v) => [
  h(Composition, {key: v.id, id: v.id, component: v.c, durationInFrames: v.n, fps: 60, width: 1080, height: 1920}),
  h(Composition, {key: v.id + '45', id: `${v.id}-4x5`, component: v.c, durationInFrames: v.n, fps: 60, width: 1080, height: 1350}),
]));
registerRoot(Root);
