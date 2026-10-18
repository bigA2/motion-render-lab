// FansaChat intro v6 (I28): 16:9 + 4:5, 60 fps. VO reused from intro26 (public/v/I26).
import React from 'react';
import {Composition, registerRoot, staticFile} from 'remotion';
import {estimateVo, Film, timeline, Vo} from './Film';

const C = Film as unknown as React.FC<Record<string, unknown>>;
const meta = async () => {
  let vo: Vo;
  try { vo = await (await fetch(staticFile('v/I26/vo.json'))).json(); } catch { vo = estimateVo(); }
  return {durationInFrames: timeline(vo).total, props: {vo} as unknown as Record<string, unknown>};
};
const comp = (id: string, width: number, height: number) => React.createElement(Composition, {key: id, id, component: C, durationInFrames: 3600, fps: 60, width, height, defaultProps: {vo: estimateVo()} as unknown as Record<string, unknown>, calculateMetadata: meta});
const Root: React.FC = () => React.createElement(React.Fragment, null, comp('I28-16x9', 1920, 1080), comp('I28-4x5', 1080, 1350));
registerRoot(Root);
