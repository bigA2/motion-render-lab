// Production reels P03-P07: ten compositions, <id>-4x5 (IG/Threads, 1080x1350) and <id>-16x9 (X, native 1920x1080), 30 fps, length follows the VO.
import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {Film} from './Film';
import {Mix} from './mix';
import {buildTL, FPS, Spec, TL} from './timeline';
import {P03} from './specs/P03';
import {P04} from './specs/P04';
import {P05} from './specs/P05';
import {P06} from './specs/P06';
import {P07} from './specs/P07';
import V03 from '../../public/v/P03/vo.json';
import V04 from '../../public/v/P04/vo.json';
import V05 from '../../public/v/P05/vo.json';
import V06 from '../../public/v/P06/vo.json';
import V07 from '../../public/v/P07/vo.json';

const h = React.createElement;
const ALL: [Spec, unknown][] = [[P03, V03], [P04, V04], [P05, V05], [P06, V06], [P07, V07]];
const full = (tl: TL): React.FC => () => h(AbsoluteFill, null, h(Film, {tl}), h(Mix, {tl}));

const Root: React.FC = () => h(React.Fragment, null, ALL.flatMap(([spec, raw]) => {
  const tl = buildTL(spec, raw); const C = full(tl);
  return [['4x5', 1080, 1350], ['16x9', 1920, 1080]].map(([fmt, width, height]) =>
    h(Composition, {key: `${spec.id}-${fmt}`, id: `${spec.id}-${fmt}`, component: C, durationInFrames: tl.TOTAL, fps: FPS, width: width as number, height: height as number}));
}));
registerRoot(Root);
