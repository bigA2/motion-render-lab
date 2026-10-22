// Clone lab: 1:1 recreations of the founder's Watch Later references (then FansaChat variants).
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {GlassUI} from './GlassUI';

registerRoot(() => React.createElement(React.Fragment, null,
  React.createElement(Composition, {id: 'GlassUI-16x9', component: GlassUI, durationInFrames: 300, fps: 30, width: 1920, height: 1080}),
));
