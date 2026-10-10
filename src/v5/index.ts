// v5 = hyper-dynamic rebuild (founder refs DTkR1ctDYYb + Db28edFqHTP). 9:16 1080x1920 30 fps.
// Render free: gh workflow run render-fast.yml --ref videos/v3 -f entry=src/v5/index.ts -f comp=W1-01-v5
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Intro01, TOTAL as TI01} from './Intro01';

const Root: React.FC = () => React.createElement(React.Fragment, null,
  React.createElement(Composition, {id: 'W1-01-intro', component: Intro01, durationInFrames: TI01, fps: 30, width: 1080, height: 1920}),
);
registerRoot(Root);
