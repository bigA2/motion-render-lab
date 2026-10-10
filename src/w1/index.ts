// W1-01 FINAL "Meet FansaChat" — forked from the v3 grand intro engine (real 3D world, orb with eyes, camera flights).
// Formats LOCKED: 16:9 + 4:5 only. Render: gh workflow run render-fast.yml --ref videos/v3 -f entry=src/w1/index.ts -f comp=W1-01-16x9
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film, FILM_FRAMES, FilmProps} from './Film';

const C = Film as unknown as React.FC<Record<string, unknown>>;
const Root: React.FC = () =>
  React.createElement(React.Fragment, null,
    React.createElement(Composition, {id: 'W1-01-16x9', component: C, durationInFrames: FILM_FRAMES, fps: 30, width: 1920, height: 1080, defaultProps: {endcard: 'generic', audio: true} as FilmProps}),
    React.createElement(Composition, {id: 'W1-01-4x5', component: C, durationInFrames: FILM_FRAMES, fps: 30, width: 1080, height: 1350, defaultProps: {endcard: 'ig', audio: true} as FilmProps}));
registerRoot(Root);
