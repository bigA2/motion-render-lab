// FansaChat introduction film (I26): 16:9 + 4:5. Duration comes from public/v/I26/vo.json at render time.
import React from 'react';
import {Composition, registerRoot, staticFile} from 'remotion';
import {estimateVo, Film, timeline, Vo} from './Film';

const C = Film as unknown as React.FC<Record<string, unknown>>;
const meta = async () => {
  let vo: Vo;
  try { vo = await (await fetch(staticFile('v/I26/vo.json'))).json(); } catch { vo = estimateVo(); }
  return {durationInFrames: timeline(vo).total, props: {vo} as unknown as Record<string, unknown>};
};
const Root: React.FC = () => React.createElement(React.Fragment, null,
  React.createElement(Composition, {id: 'I26-16x9', component: C, durationInFrames: 1800, fps: 30, width: 1920, height: 1080, defaultProps: {vo: estimateVo()} as unknown as Record<string, unknown>, calculateMetadata: meta}),
  React.createElement(Composition, {id: 'I26-4x5', component: C, durationInFrames: 1800, fps: 30, width: 1080, height: 1350, defaultProps: {vo: estimateVo()} as unknown as Record<string, unknown>, calculateMetadata: meta}),
);
registerRoot(Root);
