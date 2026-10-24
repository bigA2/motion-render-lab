// P01–P07 v11 at 1440p: each spec x (16:9 2560x1440, native 4:5 1440x1800) x (no music, music).
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Ad11, adSeconds} from './kit';
import {SPECS11} from './specs';

registerRoot(() => React.createElement(React.Fragment, null, ...SPECS11.flatMap((spec) => {
  const n = spec.id.slice(0, 3).toUpperCase().replace('V', ''), dur = Math.round(adSeconds(spec) * 60);
  return [['16x9', 2560, 1440], ['4x5', 1440, 1800]].flatMap(([r, w, h]) => [false, true].map((music) =>
    React.createElement(Composition, {key: `${n}${r}${music}`, id: `${n}v11-${r}${music ? '-music' : ''}`, component: Ad11 as React.FC<any>, defaultProps: {spec, music}, durationInFrames: dur, fps: 60, width: w as number, height: h as number})));
})));
