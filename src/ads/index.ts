// P02–P07 v8 official ads: each spec x (16:9, native 4:5) x (no music, music).
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Ad, adSeconds} from './AdKit';
import {SPECS} from './specs';

registerRoot(() => React.createElement(React.Fragment, null, ...SPECS.flatMap((spec) => {
  const n = spec.id.slice(0, 3).toUpperCase().replace('V', ''), dur = Math.round(adSeconds(spec) * 60);
  return [['16x9', 1920, 1080], ['4x5', 1080, 1350]].flatMap(([r, w, h]) => [false, true].map((music) =>
    React.createElement(Composition, {key: `${n}${r}${music}`, id: `${n}v9-${r}${music ? '-music' : ''}`, component: Ad as React.FC<any>, defaultProps: {spec, music}, durationInFrames: dur, fps: 60, width: w as number, height: h as number})));
})));
