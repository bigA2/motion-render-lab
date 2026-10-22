// Clone lab: 1:1 recreations of the founder's Watch Later references (then FansaChat variants).
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {GlassUI} from './GlassUI';
import {TextAnim} from './TextAnim';
import {AppleMorph, APPLE_FRAMES} from './AppleMorph';
import {CameraFly} from './CameraFly';
import {MinimalSaaS, MINIMAL_SAAS_FRAMES} from './MinimalSaaS';
import {LogoField} from './LogoField';

registerRoot(() => React.createElement(React.Fragment, null,
  React.createElement(Composition, {id: 'GlassUI-16x9', component: GlassUI, durationInFrames: 300, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'AppleMorph-16x9', component: AppleMorph, durationInFrames: APPLE_FRAMES, fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'CameraFly-16x9', component: CameraFly, durationInFrames: 390, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'MinimalSaaS-16x9', component: MinimalSaaS, durationInFrames: MINIMAL_SAAS_FRAMES, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'LogoField-16x9', component: LogoField, durationInFrames: 240, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'TextAnim-4x5', component: TextAnim, durationInFrames: 330, fps: 30, width: 1080, height: 1350}),
));
