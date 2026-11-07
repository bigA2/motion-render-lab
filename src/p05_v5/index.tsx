// P05 v5 test shots 1-4, 5:4 (1350x1080), 30 fps. Draft-first: each *-draft id is the black-and-white plan. MIT, our own code.
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Shot} from './Shot';
import {TOTAL, FPS} from './plan';
import {Shot2} from './Shot2';
import {TOTAL as TOTAL2} from './plan2';
import {Shot3} from './Shot3';
import {TOTAL as TOTAL3} from './plan3';
import {Shot4} from './Shot4';
import {TOTAL as TOTAL4} from './plan4';

const Root: React.FC = () => (
  <>
    <Composition id="P05V5-draft" component={Shot} defaultProps={{draft: true}} durationInFrames={TOTAL} fps={FPS} width={1350} height={1080} />
    <Composition id="P05V5" component={Shot} defaultProps={{draft: false}} durationInFrames={TOTAL} fps={FPS} width={1350} height={1080} />
    {/* test shot 2: camera dive into the real composer, typing, send */}
    <Composition id="P05V5T2-draft" component={Shot2} defaultProps={{draft: true}} durationInFrames={TOTAL2} fps={FPS} width={1350} height={1080} />
    <Composition id="P05V5T2" component={Shot2} defaultProps={{draft: false}} durationInFrames={TOTAL2} fps={FPS} width={1350} height={1080} />
    {/* test shot 3: liquid-glass prompt box with a neon runner, match cuts to the real Notion page and Slack channel */}
    <Composition id="P05V5T3-draft" component={Shot3} defaultProps={{draft: true}} durationInFrames={TOTAL3} fps={FPS} width={1350} height={1080} />
    <Composition id="P05V5T3" component={Shot3} defaultProps={{draft: false}} durationInFrames={TOTAL3} fps={FPS} width={1350} height={1080} />
    {/* test shot 4: Chrome window on an ice/steel field, glass box -> real chat bubble, real builder states, flow connects, Notion, Slack */}
    <Composition id="P05V5T4-draft" component={Shot4} defaultProps={{draft: true}} durationInFrames={TOTAL4} fps={FPS} width={1350} height={1080} />
    <Composition id="P05V5T4" component={Shot4} defaultProps={{draft: false}} durationInFrames={TOTAL4} fps={FPS} width={1350} height={1080} />
  </>
);
registerRoot(Root);
