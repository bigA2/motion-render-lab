// Standalone entry for the intro film: `npx remotion render src/intro/index.ts Intro16x9 out/intro_16x9.mp4`.
// Keeps the intro render independent of the other compositions' font/network loading.
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Intro} from './Intro';

const IntroRoot: React.FC = () =>
  React.createElement(React.Fragment, null,
    React.createElement(Composition, {id: 'Intro16x9', component: Intro, durationInFrames: 1650, fps: 30, width: 1920, height: 1080}),
    React.createElement(Composition, {id: 'Intro4x5', component: Intro, durationInFrames: 1650, fps: 30, width: 1080, height: 1350}));
registerRoot(IntroRoot);
