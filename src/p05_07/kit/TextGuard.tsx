// TextGuard: every piece of our own type is a <G> (a tagged inline-block). <TextGuard> sits once in a composition
// and, on every `every`-th frame, measures each <G> on screen after fonts load and logs one line
// `TG|{json}` (frame, frame size, one box per text: x, y, w, h, on-screen font px, colour, opacity, blurred).
// tools/p05_07/render_guarded.mjs collects those lines while rendering; tools/p05_07/layout_guard.mjs checks
// overlaps, the safe area, size and contrast on the rendered pixels. MIT, our own code.
import React, {useLayoutEffect} from 'react';
import {continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';

/** Guarded text. size = CSS font px before camera/scale, color = solid text colour (#rrggbb).
 *  anim = the letters are still being typed / glowing (not yet one solid colour): the guard then treats the text like
 *  motion-blurred text (overlap + safe area still checked; size/contrast checked once it has settled). */
export const G: React.FC<{id: string; size: number; color: string; children: React.ReactNode; style?: React.CSSProperties; font?: string; weight?: number | string; anim?: boolean}> = ({id, size, color, children, style, font, weight, anim}) => (
  <span data-tg={id} data-tg-size={size} data-tg-color={color} data-tg-anim={anim ? '1' : undefined} style={{display: 'inline-block', fontSize: size, color, fontFamily: font, fontWeight: weight, ...style}}>{children}</span>
);

const effective = (el: Element) => {
  let o = 1, blur = (el as HTMLElement).dataset.tgAnim === '1'; let n: Element | null = el;
  while (n) {
    const cs = getComputedStyle(n);
    o *= parseFloat(cs.opacity || '1');
    if (cs.visibility === 'hidden' || cs.display === 'none') o = 0;
    if (/url\(|blur\((?!0px)/.test(cs.filter || '')) blur = true; // motion blur / blur-in, not drop shadows
    n = n.parentElement;
  }
  return {o, blur};
};

export const TextGuard: React.FC<{every?: number; label?: string}> = ({every = 4, label = ''}) => {
  const f = useCurrentFrame(); const {width, height} = useVideoConfig();
  useLayoutEffect(() => {
    if (f % every !== 0) return;
    const h = delayRender('text-guard');
    document.fonts.ready.then(() => {
      const boxes = Array.from(document.querySelectorAll('[data-tg]')).map((el) => {
        const r = el.getBoundingClientRect(); const e = el as HTMLElement;
        const sc = e.offsetWidth > 0 ? r.width / e.offsetWidth : 1;
        const {o, blur} = effective(el);
        return {id: e.dataset.tg, x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), px: +(parseFloat(e.dataset.tgSize || '0') * sc).toFixed(1), c: e.dataset.tgColor, o: +o.toFixed(2), blur};
      }).filter((b) => b.o > 0.02 && b.w > 0 && b.h > 0);
      console.log('TG|' + JSON.stringify({f, w: width, h: height, label, boxes}));
      continueRender(h);
    });
  }, [f, every, width, height, label]);
  return null;
};
