// FansaChat intro v5 (I27): 16:9 + 4:5 (light, DESIGN.md) and a dark 16:9 for the theme choice. 60 fps.
import React from 'react';
import {Composition, registerRoot, staticFile} from 'remotion';
import {estimateVo, Film, timeline, Vo} from './Film';

const C = Film as unknown as React.FC<Record<string, unknown>>;
const meta = (theme: string) => async () => {
  let vo: Vo;
  try { vo = await (await fetch(staticFile('v/I26/vo.json'))).json(); } catch { vo = estimateVo(); }
  return {durationInFrames: timeline(vo).total, props: {vo, theme} as unknown as Record<string, unknown>};
};
const comp = (id: string, width: number, height: number, theme: string) => React.createElement(Composition, {key: id, id, component: C, durationInFrames: 3600, fps: 60, width, height, defaultProps: {vo: estimateVo(), theme} as unknown as Record<string, unknown>, calculateMetadata: meta(theme)});
const Root: React.FC = () => React.createElement(React.Fragment, null, comp('I27-16x9', 1920, 1080, 'light'), comp('I27-4x5', 1080, 1350, 'light'), comp('I27D-16x9', 1920, 1080, 'dark'));
registerRoot(Root);
