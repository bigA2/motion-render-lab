// Template lab entry: npx remotion render src/templates/index.ts <Lottie|AM>-<4x5|16x9|native> out.mp4 --props=props.json
// props.json = {"name":"sample","replace":{"text":{"old":"new"},"colors":{"#ff3366":"#7C83FF"}}}
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {AMTemplate, amMeta} from './AMTemplate';
import {LottieTemplate, lottieMeta} from './LottieTemplate';
import type {Fit} from './common';

const L = LottieTemplate as unknown as React.FC<Record<string, unknown>>;
const A = AMTemplate as unknown as React.FC<Record<string, unknown>>;
const FITS: Fit[] = ['4x5', '16x9', 'native'];
const mk = (kind: 'Lottie' | 'AM', fit: Fit) => React.createElement(Composition, {
  key: `${kind}-${fit}`, id: `${kind}-${fit}`, component: kind === 'Lottie' ? L : A, durationInFrames: 90, fps: 30, width: 1080, height: 1350,
  defaultProps: {name: 'sample', fit} as Record<string, unknown>,
  calculateMetadata: async ({props}: {props: Record<string, unknown>}) => (kind === 'Lottie' ? lottieMeta : amMeta)({...(props as any), fit}) as any,
});
registerRoot(() => React.createElement(React.Fragment, null, ...FITS.flatMap((f) => [mk('Lottie', f), mk('AM', f)])));
