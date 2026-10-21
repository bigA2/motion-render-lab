// Dry audio for a production video: VO lines + one SFX per on-screen event (CC0 Kenney + self-made proc sounds). Music is mixed later (variant B).
// Mounted ONCE per composition so nothing doubles.
import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {composeTimes} from './compose';
import {FPS, TL} from './timeline';

const P = 'sfx/proc/', K = 'sfx/kenney/interface-sounds/';
type Ev = {at: number; file: string; vol: number; len?: number; loop?: boolean}; // len = frames the sound may run (looped / faded out)

const events = (tl: TL): Ev[] => {
  const ev: Ev[] = []; const add = (at: number, file: string, vol: number, len?: number, loop?: boolean) => ev.push({at, file, vol, len, loop});
  add(2, P + 'node_pop_1.ogg', 0.45);
  tl.acts.forEach((a: any, ai: number) => {
    const S = a.start; const rel = (abs: number) => S + (abs - S);
    if (ai > 0) add(S - 5, P + (a.dark ? 'transition_whoosh_0.45s.ogg' : 'transition_whoosh_0.25s.ogg'), a.dark ? 0.34 : 0.26);
    switch (a.kind) {
      case 'list': [0, 1, 2].forEach((i) => add(S + 8 + i * 5, P + `ui_tick_1.ogg`, 0.25)); break;
      case 'chatflash': add(S + 2, P + 'node_pop_2.ogg', 0.4); break;
      case 'myth': {
        [tl.w(1, 'stripe'), tl.w(1, 'sheet'), tl.w(1, 'miss')].forEach((x) => add(x + 6, K + 'error_004.ogg', 0.34));
        [0, 1, 2].forEach((i) => add(tl.S[1] + 8 + i * 10, P + 'typing_keyboard_0.6s.ogg', 0.2));
        add(tl.S[2], P + 'hook_bass_impact_0.8s.ogg', 0.4); add(tl.S[2] + 2, P + 'ui_click_2.ogg', 0.45); break; }
      case 'split': add(tl.S[1], P + 'transition_whoosh_0.45s.ogg', 0.3); add(tl.w(1, 'day') + 2, K + 'error_004.ogg', 0.36); add(tl.S[2], P + 'transition_camera_flash_1.ogg', 0.22); break;
      case 'inbox': {
        add(tl.S[0] + 20, P + 'ui_tick_1.ogg', 0.2);
        [tl.w(1, 'everything'), tl.w(1, 'spot'), tl.w(1, 'task'), tl.w(1, 'team')].forEach((x) => add(x + 8, K + 'error_004.ogg', 0.34));
        [0, 1, 2, 3].forEach((i) => add(tl.S[1] + 8 + i * 9, P + 'typing_keyboard_0.6s.ogg', 0.2)); break; }
      case 'brief': {
        [tl.w(1, 'dm'), tl.w(1, 'email'), tl.w(1, 'form'), tl.w(1, 'rebuild')].forEach((x) => add(x + 8, K + 'error_004.ogg', 0.34));
        add(tl.S[2], K + 'glass_002.ogg', 0.34); add(a.end - 16, P + 'transition_whoosh_0.25s.ogg', 0.28); break; }
      case 'turn': add(tl.w(a.line, 'fix'), K + 'glitch_002.ogg', 0.4); break;
      case 'compose': {
        const T = composeTimes(a, tl);
        add(S + T.tType, P + (T.tEnd - T.tType > 60 ? 'stutter_clicks_long.ogg' : 'stutter_clicks_short.ogg'), 0.26, T.tEnd - T.tType + 4);
        add(S + T.send, P + 'ui_click_1.ogg', 0.5); add(S + T.lift - 2, P + 'transition_whoosh_0.25s.ogg', 0.25);
        add(S + T.think, P + (T.ready - T.think > 70 ? 'data_loop_3.0s.ogg' : 'data_loop_2.0s.ogg'), 0.2, T.ready - T.think, true);
        add(S + T.reply, P + 'node_pop_2.ogg', 0.34);
        a.nodes.forEach((_: unknown, i: number) => add(S + T.nodesAt + 7 * i + 2, P + `mechanical_click_${(i % 4) + 1}.ogg`, 0.3));
        add(S + T.runF, P + 'ui_click_2.ogg', 0.5);
        add(S + T.runF - 5, P + 'charge_data_0.8s.ogg', 0.34);
        a.nodes.forEach((_: unknown, i: number) => { add(S + T.lit[i] - 5, P + 'charge_data_0.8s.ogg', 0.2); add(S + T.lit[i], K + 'confirmation_001.ogg', 0.24); });
        add(S + T.lit[a.nodes.length - 1] + 2, P + 'data_loop_1.0s.ogg', 0.16, 20, true);
        add(S + T.done, P + 'success_chime_G.ogg', 0.45); break; }
      case 'ping': { const t = Math.max(8, tl.w(a.line, 'ping') - S - 6); add(S + t - 4, P + 'transition_whoosh_0.25s.ogg', 0.3); add(S + t + 2, P + 'node_pop_3.ogg', 0.4); add(S + t + 10, P + 'success_chime_C.ogg', 0.4); break; }
      case 'recap': [0, 1, 2].forEach((i) => add(S + 24 + i * 8, P + `node_pop_${3 + i}.ogg`, 0.3)); add(S + 52, P + 'success_chime_G.ogg', 0.4); break;
      case 'poll': add(S + 30, P + 'ui_click_1.ogg', 0.45); add(S + 34, P + 'success_chime_C.ogg', 0.3); break;
      case 'end': { const lock = a.lead ? tl.S[a.to] - 4 : S + 6; add(lock, P + 'hook_bass_impact_1.2s.ogg', 0.4); add(lock + 30, K + 'glass_002.ogg', 0.32); break; }
    }
  });
  return ev;
};

export const Mix: React.FC<{tl: TL}> = ({tl}) => {
  const ev = React.useMemo(() => events(tl), [tl]);
  return <>
    {tl.HAS_VO ? tl.VOL.map((l, i) => <Sequence key={'v' + i} from={tl.S[i]}><Audio src={staticFile(l.file)} /></Sequence>) : null}
    {ev.map((e, i) => {
      const from = Math.max(0, Math.round(e.at));
      if (e.len) return <Sequence key={'s' + i} from={from} durationInFrames={Math.max(6, Math.round(e.len))}><Audio src={staticFile(e.file)} loop={e.loop} volume={(fr) => e.vol * Math.min(1, fr / 3) * Math.min(1, Math.max(0, (Math.round(e.len!) - fr) / 10))} /></Sequence>;
      return <Sequence key={'s' + i} from={from}><Audio src={staticFile(e.file)} volume={e.vol} /></Sequence>;
    })}
  </>;
};
