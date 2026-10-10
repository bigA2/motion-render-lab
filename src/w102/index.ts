// W1-02 "Ghosted invoice" (freelancers, B2 bright orange). 16:9 + 4:5.
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film, FILM_FRAMES} from './Film';

const Root: React.FC = () => React.createElement(React.Fragment, null,
  React.createElement(Composition, {id: 'W1-02-16x9', component: Film, durationInFrames: FILM_FRAMES, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'W1-02-4x5', component: Film, durationInFrames: FILM_FRAMES, fps: 30, width: 1080, height: 1350}));
registerRoot(Root);
