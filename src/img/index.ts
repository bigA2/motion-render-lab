import React from 'react';
import {Still as RStill, registerRoot} from 'remotion';
import {Still, ImgSpec} from './Still';
import specs from './specs.json';
const C = Still as unknown as React.FC<Record<string, unknown>>;
const Root: React.FC = () => React.createElement(React.Fragment, null, ...(specs as ImgSpec[]).map((s) =>
  React.createElement(RStill, {key: s.id, id: s.id, component: C, width: 1080, height: 1350, defaultProps: {spec: s}})));
registerRoot(Root);
