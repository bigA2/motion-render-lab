// Clone lab: 1:1 recreations of the founder's Watch Later references (then FansaChat variants).
import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
// frame-fill wrapper: the references fill the frame more than our first passes did
const big = (C: React.FC, sc: number): React.FC => () => React.createElement(AbsoluteFill, {style: {transform: `scale(${sc})`}}, React.createElement(C));
import {GlassUI} from './GlassUI';
import {TextAnim} from './TextAnim';
import {AppleMorph, APPLE_FRAMES} from './AppleMorph';
import {CameraFly, CAMERA_FRAMES} from './CameraFly';
import {MinimalSaaS, MINIMAL_SAAS_FRAMES} from './MinimalSaaS';
import {LogoField} from './LogoField';
import {KineticType, KINETIC_FRAMES} from './KineticType';
import {ToggleSaaS, OrbitSaaS, MorphGuide, TRIO_FRAMES} from './SaasTrio';
import {LiquidGlass, ClaudeMotion, Blob3D, GTRIO_FRAMES} from './GlassTrio';

registerRoot(() => React.createElement(React.Fragment, null,
  React.createElement(Composition, {id: 'GlassUI-16x9', component: GlassUI, durationInFrames: 300, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'AppleMorph-16x9', component: AppleMorph, durationInFrames: APPLE_FRAMES, fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'CameraFly-16x9', component: CameraFly, durationInFrames: CAMERA_FRAMES, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'MinimalSaaS-16x9', component: MinimalSaaS, durationInFrames: MINIMAL_SAAS_FRAMES, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'LogoField-16x9', component: LogoField, durationInFrames: 240, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'KineticType-16x9', component: KineticType, durationInFrames: KINETIC_FRAMES, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'ToggleSaaS-16x9', component: big(ToggleSaaS, 1.35), durationInFrames: TRIO_FRAMES.toggle, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'OrbitSaaS-16x9', component: OrbitSaaS, durationInFrames: TRIO_FRAMES.orbit, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'MorphGuide-16x9', component: big(MorphGuide, 1.5), durationInFrames: TRIO_FRAMES.morph, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'LiquidGlass-16x9', component: big(LiquidGlass, 1.6), durationInFrames: GTRIO_FRAMES.glass, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'ClaudeMotion-16x9', component: big(ClaudeMotion, 1.3), durationInFrames: GTRIO_FRAMES.claude, fps: 30, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'Blob3D-9x16', component: Blob3D, durationInFrames: GTRIO_FRAMES.blob, fps: 30, width: 1080, height: 1920}),
  React.createElement(Composition, {id: 'TextAnim-4x5', component: TextAnim, durationInFrames: 330, fps: 30, width: 1080, height: 1350}),
));
