// P01 "Stop copying leads by hand" — 30 fps, length follows the VO.
// P01 = 9:16 design canvas (storyboard stills) · P01-4x5 = IG reel/post + Threads (1080x1350) · P01-16x9 = X (1920x1080).
import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {Film} from './Film';
import {Mix} from './mix';
import {FPS, TOTAL} from './timeline';

const h = React.createElement;
// 9:16 design → 4:5: content lives in y 220–1540, so a 1350-tall window from y 205 holds all of it
const CROP_Y = 205;
const Crop45: React.FC = () => h(AbsoluteFill, {style: {overflow: 'hidden'}}, h('div', {style: {position: 'absolute', left: 0, top: -CROP_Y, width: 1080, height: 1920}}, h(Film)));

const V916: React.FC = () => h(AbsoluteFill, null, h(Film), h(Mix));
const V45: React.FC = () => h(AbsoluteFill, null, h(Crop45), h(Mix));
// 16:9: native wide layout (cards side by side, big text), same timeline and VO
const V169: React.FC = () => h(AbsoluteFill, null, h(Film, {wide: true}), h(Mix));

const comp = (id: string, component: React.FC, width: number, height: number) => h(Composition, {key: id, id, component, durationInFrames: TOTAL, fps: FPS, width, height});
const Root: React.FC = () => h(React.Fragment, null, comp('P01', V916, 1080, 1920), comp('P01-4x5', V45, 1080, 1350), comp('P01-16x9', V169, 1920, 1080));
registerRoot(Root);
