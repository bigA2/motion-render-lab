// P05 v5 test shot 1: the hook, 5:4 (1350x1080), 4.5 s, 30 fps. Animates the REAL FansaChat screen recording
// (public/real/P05_ui.webm). Draft-first: P05V5-draft is the black-and-white plan, P05V5 the final. MIT, our own code.
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Shot} from './Shot';
import {TOTAL, FPS} from './plan';
import {Shot2} from './Shot2';
import {TOTAL as TOTAL2} from './plan2';

const Root: React.FC = () => (
  <>
    <Composition id="P05V5-draft" component={Shot} defaultProps={{draft: true}} durationInFrames={TOTAL} fps={FPS} width={1350} height={1080} />
    <Composition id="P05V5" component={Shot} defaultProps={{draft: false}} durationInFrames={TOTAL} fps={FPS} width={1350} height={1080} />
    {/* test shot 2: camera dive into the real composer, typing, send */}
    <Composition id="P05V5T2-draft" component={Shot2} defaultProps={{draft: true}} durationInFrames={TOTAL2} fps={FPS} width={1350} height={1080} />
    <Composition id="P05V5T2" component={Shot2} defaultProps={{draft: false}} durationInFrames={TOTAL2} fps={FPS} width={1350} height={1080} />
  </>
);
registerRoot(Root);
