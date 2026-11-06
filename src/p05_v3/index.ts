// P05 v3 entry: 4:5 (1080x1350) and 5:4 (1350x1080, for X), 60 fps, 14.0 s. Each format is laid out for its own
// frame by plan.layout() (no crop of the other). Audio is mixed outside Remotion (tools/p05_v3/mix.py). MIT.
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film} from './Film';
import {TOTAL} from './plan';

const h = React.createElement;
const Root: React.FC = () => h(React.Fragment, null,
  h(Composition, {id: 'P05V3-4x5', component: Film, durationInFrames: TOTAL, fps: 60, width: 1080, height: 1350}),
  h(Composition, {id: 'P05V3-5x4', component: Film, durationInFrames: TOTAL, fps: 60, width: 1350, height: 1080}),
);
registerRoot(Root);
