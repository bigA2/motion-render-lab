// P01 "Stop copying leads by hand" — 1080×1920, 30 fps, 30 s. Storyboard stills: see README of the run in the report.
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Film} from './Film';
import {FPS, TOTAL} from './timeline';

const Root: React.FC = () => React.createElement(Composition, {id: 'P01', component: Film, durationInFrames: TOTAL, fps: FPS, width: 1080, height: 1920});
registerRoot(Root);
