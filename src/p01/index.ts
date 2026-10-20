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
// 16:9: blurred full-bleed copy behind, the 4:5 column (scaled to 1080 tall) in the middle
const V169: React.FC = () => h(AbsoluteFill, {style: {background: '#F7F6F9', overflow: 'hidden'}},
  h('div', {style: {position: 'absolute', left: 0, top: (1080 - 1920 * (1920 / 1080)) / 2, width: 1080, height: 1920, transformOrigin: '0 0', transform: `scale(${1920 / 1080})`, filter: 'blur(28px) saturate(1.15) brightness(1.04)'}}, h(Film)),
  h('div', {style: {position: 'absolute', left: (1920 - 864) / 2, top: 0, width: 1080, height: 1350, transformOrigin: '0 0', transform: 'scale(0.8)', boxShadow: '0 0 120px 20px rgba(40,30,80,0.22)', overflow: 'hidden'}}, h(Crop45)),
  h(Mix));

const comp = (id: string, component: React.FC, width: number, height: number) => h(Composition, {key: id, id, component, durationInFrames: TOTAL, fps: FPS, width, height});
const Root: React.FC = () => h(React.Fragment, null, comp('P01', V916, 1080, 1920), comp('P01-4x5', V45, 1080, 1350), comp('P01-16x9', V169, 1920, 1080));
registerRoot(Root);
