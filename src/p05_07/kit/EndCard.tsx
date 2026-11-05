// Living end card: the video's own app chain (logos + wire + one data pass), breathing logo + wordmark,
// tagline, the sentence, and the waitlist pill with a light sweep. Screen space, centred for 9:16 and 4:5. MIT.
import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {clamp, lerp, prog} from './curves';
import {a} from './Living';
import {TrackIn} from './type';
import {Logo} from './ui';

export const EndCard: React.FC<{f0: number; pill: number; apps: string[]; tagline: string; sentence?: string; accent: string; ink: string; muted: string; display: string; body: string; wordWeight?: number; pillInk?: string; dot?: [number, number]}> = ({f0, pill, apps, tagline, sentence, accent, ink, muted, display, body, wordWeight = 800, pillInk = '#fff', dot}) => {
  const f = useCurrentFrame(); const {height: h} = useVideoConfig(); const tall = h > 1500;
  const push = lerp(1, 1.06, prog(f, f0, 220, 'softOut'));
  const n = apps.length, gap = 150, x0 = 540 - ((n - 1) * gap) / 2;
  const dp = dot ? prog(f, dot[0], dot[1], 'inOut') : -1;
  const sweep = ((f - pill - 20) % 150) / 40;
  return <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: h, transform: `scale(${push})`, transformOrigin: '50% 50%'}}>
    {/* app chain */}
    <div style={{position: 'absolute', left: 0, top: tall ? h / 2 - 470 : h / 2 - 470, width: 1080, height: 110}}>
      <div style={{position: 'absolute', left: x0, top: 52, width: (n - 1) * gap * prog(f, f0 + 6, 30, 'swift'), height: 4, background: a(accent, 0.5), borderRadius: 2}} />
      {dp >= 0 && dp < 1 && <div style={{position: 'absolute', left: x0 + (n - 1) * gap * dp - 12, top: 42, width: 24, height: 24, borderRadius: 12, background: accent, boxShadow: `0 0 24px 8px ${a(accent, 0.6)}`}} />}
      {apps.map((ap, i) => { const p = prog(f, f0 + i * 5, 22, 'spring'); const lit = dp >= 0 && Math.abs(dp * (n - 1) - i) < 0.35;
        return <div key={ap} style={{position: 'absolute', left: x0 + i * gap - 42, top: 12, transform: `scale(${p * (lit ? 1.12 : 1)})`, filter: lit ? `drop-shadow(0 0 16px ${a(accent, 0.8)})` : undefined}}><Logo name={ap} size={84} round={22} /></div>; })}
    </div>
    {/* logo + wordmark */}
    <div style={{position: 'absolute', left: 0, width: 1080, top: tall ? h / 2 - 270 : h / 2 - 320, textAlign: 'center'}}>
      <div style={{display: 'inline-block', transform: `scale(${lerp(0.4, 1, prog(f, f0 + 4, 30, 'spring'))})`, filter: `drop-shadow(0 20px 40px ${a(accent, 0.35)})`}}><Logo name="fansa" size={tall ? 230 : 190} round={60} /></div>
      <TrackIn f0={f0 + 10} dur={60} from={0.5} style={{fontFamily: display, fontWeight: wordWeight, fontSize: tall ? 132 : 112, color: ink, marginTop: 18, lineHeight: 1}}>FansaChat</TrackIn>
      <div style={{fontFamily: body, fontSize: tall ? 46 : 40, color: muted, marginTop: 16, opacity: clamp((f - f0 - 25) / 12)}}>{tagline}</div>
      {sentence && <div style={{fontFamily: body, fontSize: 28, lineHeight: 1.35, color: muted, margin: '26px 110px 0', opacity: clamp((f - f0 - 34) / 14) * 0.9}}>“{sentence}”</div>}
      <div style={{marginTop: tall ? 54 : 34, display: 'inline-block', position: 'relative', overflow: 'hidden', borderRadius: 999, transform: `scale(${prog(f, pill, 20, 'spring')})`}}>
        <div style={{padding: '22px 46px', background: accent, color: pillInk, fontFamily: body, fontWeight: 700, fontSize: tall ? 46 : 42, whiteSpace: 'nowrap'}}>Join the waitlist · link in bio</div>
        {sweep >= 0 && sweep <= 1 && <div style={{position: 'absolute', top: 0, bottom: 0, left: `${sweep * 140 - 30}%`, width: '25%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent)', transform: 'skewX(-20deg)'}} />}
      </div>
    </div>
  </div>;
};
