// Standalone entry for the v3 intro film (real 3D via @remotion/three):
//   npx remotion render src/v3/index.ts IntroV3-16x9 out/intro_v3_16x9.mp4 --gl=swangle
// End-card variant via props: --props='{"endcard":"ig","audio":true}' (generic | ig | x).
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film, FILM_FRAMES, FilmProps} from './Film';

const defaults: FilmProps = {endcard: 'generic', audio: true};
const Root: React.FC = () =>
  React.createElement(React.Fragment, null,
    React.createElement(Composition, {id: 'IntroV3-16x9', component: Film as unknown as React.FC<Record<string, unknown>>, durationInFrames: FILM_FRAMES, fps: 30, width: 1920, height: 1080, defaultProps: defaults}),
    React.createElement(Composition, {id: 'IntroV3-4x5', component: Film as unknown as React.FC<Record<string, unknown>>, durationInFrames: FILM_FRAMES, fps: 30, width: 1080, height: 1350, defaultProps: defaults}));
registerRoot(Root);
