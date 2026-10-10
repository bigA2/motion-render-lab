// All FansaChat videos (data specs in src/specs). Duration comes from public/v/<id>/vo.json at render time.
import React from 'react';
import {Composition, registerRoot, staticFile} from 'remotion';
import {Film, layoutBeats, Spec, Vo} from './engine';
import {SPECS} from '../specs';

type Props = {spec: Spec; vo: Vo};
const C = Film as unknown as React.FC<Record<string, unknown>>;
const meta = async ({props}: {props: Record<string, unknown>}) => {
  const spec = props.spec as Spec;
  let vo: Vo;
  try { vo = await (await fetch(staticFile(`v/${spec.id}/vo.json`))).json(); } catch { vo = spec.lines.map((t, i) => ({file: `v/${spec.id}/${String(i + 1).padStart(2, '0')}.wav`, dur: t.split(' ').length / 2.6 + 0.4, words: []})); }
  return {durationInFrames: layoutBeats(spec, vo).total, props: {spec, vo} as unknown as Record<string, unknown>};
};
const Root: React.FC = () => React.createElement(React.Fragment, null, ...SPECS.flatMap((s) => [
  React.createElement(Composition, {key: s.id + 'w', id: `${s.id}-16x9`, component: C, durationInFrames: 900, fps: 30, width: 1920, height: 1080, defaultProps: {spec: s, vo: []} as unknown as Props, calculateMetadata: meta}),
  React.createElement(Composition, {key: s.id + 't', id: `${s.id}-4x5`, component: C, durationInFrames: 900, fps: 30, width: 1080, height: 1350, defaultProps: {spec: s, vo: []} as unknown as Props, calculateMetadata: meta}),
]));
registerRoot(Root);
