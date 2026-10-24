import { lazy, Suspense, useEffect, useRef, useState } from "react";

// The WebGL field is not needed for first paint: it is code-split and only
// mounted once the browser is idle, so shader compile + the render loop stay
// out of the initial main-thread work (audit 2026-10-01, TBT). Skipped when the
// visitor has asked to save data; the plain var(--bg) fill shows instead.
const ColorBends = lazy(() => import("./ColorBends"));

/*
 * SiteBackground — the soft-white + periwinkle/blush animated Color Bends field
 * (DESIGN.md v5). ONE fixed flowing field behind the whole page (shader animates
 * via uTime). Its colour palette is driven by scroll position, but SUBTLY: the page
 * stays soft off-white and each lower section is just a touch warmer/softer than
 * the one above. NO grain (noise=0).
 */

// 2 stops, each = 5 colours the shader blends. Stop 1 is a touch brighter than 0.
const STOPS = [
  ["#e4e0fb", "#b3aef2", "#8f93ec", "#ef9d8a", "#f6c3b2"], // hero — soft periwinkle -> blush (a touch more visible)
  ["#ebe8fb", "#c3bef2", "#9ea1ee", "#f1ab98", "#f9d3c4"], // lower — a touch softer/warmer
];

const hexToRgb = (h) => {
  const s = h.replace("#", "");
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
};
const toHex = (rgb) =>
  "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const lerpHex = (h1, h2, t) => {
  const a = hexToRgb(h1);
  const b = hexToRgb(h2);
  return toHex([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
};
const paletteAt = (p) => {
  const seg = p * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(seg));
  const t = seg - i;
  return STOPS[i].map((c, k) => lerpHex(c, STOPS[i + 1][k], t));
};

const BUCKETS = 40;

// Narrow or touch-first screens get a lighter field: started after `load` and
// drawn at a lower internal resolution (CSS scales it up; the field is very
// smooth, so it still reads the same). It still flows (DESIGN.md).
const MOBILE = () => window.matchMedia("(max-width: 767px), (pointer: coarse)").matches;

export default function SiteBackground({ paused = false }) {
  const [colors, setColors] = useState(() => paletteAt(0));
  const bucketRef = useRef(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (navigator.connection?.saveData) return;
    const ric = window.requestIdleCallback;
    let id;
    const start = () => {
      id = ric ? ric(() => setReady(true), { timeout: 2500 }) : setTimeout(() => setReady(true), 1200);
    };
    // Phones (perf 2026-10-07): wait for the load event too, so the shader never
    // competes with first paint; desktop keeps the idle start.
    const waitLoad = MOBILE() && document.readyState !== "complete";
    if (waitLoad) window.addEventListener("load", start, { once: true });
    else start();
    return () => {
      window.removeEventListener("load", start);
      if (id !== undefined) (ric ? window.cancelIdleCallback(id) : clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const bucket = Math.round(p * BUCKETS);
      if (bucket !== bucketRef.current) {
        bucketRef.current = bucket;
        setColors(paletteAt(bucket / BUCKETS));
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -10,
        background: "var(--bg)",
        pointerEvents: "none",
      }}
    >
      {ready && (
        <Suspense fallback={null}>
          <ColorBends
            colors={colors}
            paused={paused}
            renderScale={MOBILE() ? 0.3 : 0.5}
            transparent
            speed={0.2}
            scale={1.3}
            frequency={1.0}
            warpStrength={1.0}
            noise={0}
            intensity={1.0}
            bandWidth={6}
            rotation={90}
            autoRotate={0}
            parallax={0.4}
            mouseInfluence={0.6}
          />
        </Suspense>
      )}
    </div>
  );
}
