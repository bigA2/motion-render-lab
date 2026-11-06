// P05 v4 entry: 4:5 (1080x1350) and 5:4 (1350x1080), 60 fps, 14.0 s. One world + camera (plan.ts) framed per format.
// Audio is mixed outside Remotion (tools/p05_v4/mix.py). MIT, our own code.
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film} from './Film';
import {TOTAL} from './plan';

const h = React.createElement;
const Root: React.FC = () => h(React.Fragment, null,
  h(Composition, {id: 'P05V4-4x5', component: Film, durationInFrames: TOTAL, fps: 60, width: 1080, height: 1350}),
  h(Composition, {id: 'P05V4-5x4', component: Film, durationInFrames: TOTAL, fps: 60, width: 1350, height: 1080}),
);
registerRoot(Root);
