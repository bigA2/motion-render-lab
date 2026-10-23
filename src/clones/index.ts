// Clone lab: 1:1 recreations of the founder's Watch Later references (then FansaChat variants).
import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
// frame-fill wrapper: the references fill the frame more than our first passes did
// measured reference camera per scene (durations in the clone's 30-fps authoring frames)
const cam = (C: React.FC, _id: string, durs: number[]): React.FC => () => React.createElement(SmoothCam as React.FC<any>, {durs, scale: 2}, React.createElement(C));
const big = (C: React.FC, sc: number): React.FC => () => React.createElement(AbsoluteFill, {style: {transform: `scale(${sc})`}}, React.createElement(C));
import {GlassUI} from './GlassUI';
import {SmoothCam} from './RefCamera';
import {TextAnim} from './TextAnim';
import {AppleMorph, APPLE_FRAMES} from './AppleMorph';
import {CameraFly, CAMERA_FRAMES} from './CameraFly';
import {MinimalSaaS, MINIMAL_SAAS_FRAMES} from './MinimalSaaS';
import {LogoField} from './LogoField';
import {KineticType, KINETIC_FRAMES} from './KineticType';
import {ToggleSaaS, OrbitSaaS, MorphGuide, TRIO_FRAMES} from './SaasTrio';
import {LiquidGlass, ClaudeMotion, Blob3D, GTRIO_FRAMES} from './GlassTrio';
import {P01v8, P01_SECONDS} from '../p01v8/P01v8';

// colour variants: rotate each clone's main accent hue onto a FansaChat palette (logos / monochrome clones excluded)
const VARIANTS: [string, number][] = [['violet', 248], ['ocean', 195], ['sunset', 18]];
const BASE_HUE: Record<string, number> = {"GlassUI-16x9": 215, "AppleMorph-16x9": 25, "CameraFly-16x9": 215, "MinimalSaaS-16x9": 140, "KineticType-16x9": 140, "ToggleSaaS-16x9": 235, "OrbitSaaS-16x9": 330, "MorphGuide-16x9": 215, "LiquidGlass-16x9": 220, "ClaudeMotion-16x9": 15, "TextAnim-4x5": 235};
const tint = (C: React.FC, deg: number): React.FC => () => React.createElement(AbsoluteFill, {style: {filter: `hue-rotate(${deg}deg)`, ['--hue' as any]: `${deg}deg`}}, React.createElement(C));
const COMPS = [
  React.createElement(Composition, {id: 'P01v8-16x9', component: P01v8, durationInFrames: Math.round(P01_SECONDS * 60), fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'P01v8-4x5', component: P01v8, durationInFrames: Math.round(P01_SECONDS * 60), fps: 60, width: 1080, height: 1350}),
  React.createElement(Composition, {id: 'P01v8-16x9-music', component: P01v8, defaultProps: {music: true}, durationInFrames: Math.round(P01_SECONDS * 60), fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'P01v8-4x5-music', component: P01v8, defaultProps: {music: true}, durationInFrames: Math.round(P01_SECONDS * 60), fps: 60, width: 1080, height: 1350}),
  React.createElement(Composition, {id: 'GlassUI-16x9', component: GlassUI, durationInFrames: (300) * 2, fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'AppleMorph-16x9', component: AppleMorph, durationInFrames: APPLE_FRAMES, fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'CameraFly-16x9', component: CameraFly, durationInFrames: (CAMERA_FRAMES) * 2, fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'MinimalSaaS-16x9', component: MinimalSaaS, durationInFrames: (MINIMAL_SAAS_FRAMES) * 2, fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'LogoField-16x9', component: LogoField, durationInFrames: (240) * 2, fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'KineticType-16x9', component: KineticType, durationInFrames: (KINETIC_FRAMES) * 2, fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'ToggleSaaS-16x9', component: cam(big(ToggleSaaS, 1.15), 'EicGPYk7cFc', [150, 90, 60]), durationInFrames: (TRIO_FRAMES.toggle) * 2, fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'OrbitSaaS-16x9', component: cam(OrbitSaaS, 'Jccbzpicst8', [70, 90, 130]), durationInFrames: (TRIO_FRAMES.orbit) * 2, fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'MorphGuide-16x9', component: cam(big(MorphGuide, 1.25), 'y5Q-AhxPh9A', [80, 60, 80, 70, 80]), durationInFrames: (TRIO_FRAMES.morph) * 2, fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'LiquidGlass-16x9', component: cam(big(LiquidGlass, 1.35), 'n0g4HXxx03s', [60, 70, 80, 80, 60]), durationInFrames: (GTRIO_FRAMES.glass) * 2, fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'ClaudeMotion-16x9', component: cam(big(ClaudeMotion, 1.3), 'D5qpBbEWTxo', [40, 50, 30, 110, 70]), durationInFrames: (GTRIO_FRAMES.claude) * 2, fps: 60, width: 1920, height: 1080}),
  React.createElement(Composition, {id: 'Blob3D-9x16', component: cam(Blob3D, '6dicRcPoQsM', [60, 60, 60]), durationInFrames: (GTRIO_FRAMES.blob) * 2, fps: 60, width: 1080, height: 1920}),
  React.createElement(Composition, {id: 'TextAnim-4x5', component: TextAnim, durationInFrames: (330) * 2, fps: 60, width: 1080, height: 1350}),
];
registerRoot(() => React.createElement(React.Fragment, null,
  ...COMPS,
  ...COMPS.filter((c) => BASE_HUE[c.props.id] !== undefined).flatMap((c) => VARIANTS.map(([name, hue]) =>
    React.createElement(Composition, {...c.props, key: `${c.props.id}-${name}`, id: `${c.props.id}-${name}`, component: tint((c.props as any).component as React.FC, (hue - BASE_HUE[c.props.id] + 360) % 360)}))),
));
