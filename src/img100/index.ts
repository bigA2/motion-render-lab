import React from 'react';
import {Still, registerRoot} from 'remotion';
import SPECS from './specs.json';
import {Spec, theme} from './kit';
import * as R1 from './R1';
import * as R2 from './R2';
import * as R3 from './R3';
const MAP: Record<string, React.FC<{s: Spec; th: ReturnType<typeof theme>}>> = {
  intro: R1.Intro, hero3d: R1.Hero3d, receipt: R1.Receipt, notes: R1.Notes, chat: R1.Chat, tweet: R1.Tweet, search: R1.Search, ticket: R1.Ticket, magazine: R1.Magazine, newspaper: R1.Newspaper, swiss: R1.Swiss, bauhaus: R1.Bauhaus, neobrutal: R1.NeoBrutal,
  mythfact: R2.MythFact, beforeafter: R2.BeforeAfter, lockscreen: R2.Lockscreen, retroos: R2.RetroOS, terminal: R2.Terminal, bento: R2.Bento, flow: R2.Flow, calendar: R2.Calendar, checklist: R2.Checklist, quote: R2.Quote, bignum: R2.BigNum, faq: R2.FAQ,
  appwall: R3.AppWall, sticky: R3.Sticky, sign: R3.Sign, label: R3.Label, pixel: R3.Pixel, neon: R3.Neon, cover: R3.Cover, subway: R3.Subway, whiteboard: R3.Whiteboard, sheet: R3.Sheet, postcard: R3.Postcard, card: R3.Card, glass: R3.Glass, collage: R3.Collage, maya: R3.Maya, iso: R3.Iso, cta: R3.CTA,
};
const Poster: React.FC<{s: Spec}> = ({s}) => React.createElement(MAP[s.r], {s, th: theme(s)});
const Root: React.FC = () => React.createElement(React.Fragment, null, ...(SPECS as Spec[]).map((s) => React.createElement(Still, {key: s.id, id: s.id, component: Poster as any, width: 1080, height: 1350, defaultProps: {s}})));
registerRoot(Root);
