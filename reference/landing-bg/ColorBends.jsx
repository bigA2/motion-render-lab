import { useEffect, useLayoutEffect, useRef } from 'react';
import './ColorBends.css';

/*
 * 2026-09-30 (perf): the same shader, now drawn with raw WebGL2 instead of
 * three.js. three was the bulk of the 851 kB shared chunk, and all it did here
 * was draw one full-screen quad. The GLSL body below is untouched; the prefixes
 * mirror what three's ShaderMaterial prepended (GLSL 3.00 es, highp) and the
 * context attributes match its WebGLRenderer, so the output is the same pixels.
 * `renderScale` < 1 renders the (very smooth) field at a lower resolution and
 * lets CSS scale it up: a quarter of the fragment work at 0.5.
 */

const MAX_COLORS = 8;

const frag = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer; // in NDC [-1,1]
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
uniform int uIterations;
uniform float uIntensity;
uniform float uBandWidth;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

    for (int j = 0; j < 5; j++) {
      if (j >= uIterations - 1) break;
      vec2 rr = sin(1.5 * (q.yx * uFrequency) + 2.0 * cos(q * uFrequency));
      q += (rr - q) * 0.15;
    }

    vec3 col = vec3(0.0);
    float a = 1.0;

    if (uColorCount > 0) {
      vec2 s = q;
      vec3 sumCol = vec3(0.0);
      float cover = 0.0;
      for (int i = 0; i < MAX_COLORS; ++i) {
            if (i >= uColorCount) break;
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3); // strong response across 0..1
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0); // allow >1 to amplify displacement
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float m = mix(m0, m1, kMix);
            float w = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
            sumCol += uColors[i] * w;
            cover = max(cover, w);
      }
      col = clamp(sumCol, 0.0, 1.0);
      a = uTransparent > 0 ? cover : 1.0;
    } else {
        vec2 s = q;
        for (int k = 0; k < 3; ++k) {
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float m = mix(m0, m1, kMix);
            col[k] = 1.0 - exp(-uBandWidth / exp(uBandWidth * m));
        }
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
    }

    col *= uIntensity;

    if (uNoise > 0.0001) {
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
      col += (n - 0.5) * uNoise;
      col = clamp(col, 0.0, 1.0);
    }

    vec3 rgb = (uTransparent > 0) ? col * a : col;
    gl_FragColor = vec4(rgb, a);
}
`;

const vert = `#version 300 es
precision highp float;
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// three's ShaderMaterial prefix for WebGL2: GLSL 3.00 es, highp, gl_FragColor
// mapped to an out variable, `varying` to `in`.
const FRAG_PREFIX = `#version 300 es
precision highp float;
precision highp int;
out highp vec4 pc_fragColor;
#define gl_FragColor pc_fragColor
#define varying in
`;

const hexToRgb = hex => {
  const h = hex.replace('#', '').trim();
  const v =
    h.length === 3
      ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
      : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  return [v[0] / 255, v[1] / 255, v[2] / 255];
};

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh));
  return sh;
}

export default function ColorBends({
  // defaulted to "": SiteBackground passes no className, and the template below
  // stringified `undefined` straight into the DOM as
  // class="color-bends-container undefined".
  className = "",
  style,
  rotation = 90,
  speed = 0.2,
  colors = [],
  transparent = true,
  autoRotate = 0,
  scale = 1,
  frequency = 1,
  warpStrength = 1,
  mouseInfluence = 1,
  parallax = 0.5,
  noise = 0.15,
  iterations = 1,
  intensity = 1.5,
  bandWidth = 6,
  paused = false,
  renderScale = 1
}) {
  const containerRef = useRef(null);
  // Live prop values the render loop reads (no effect re-run on prop change).
  const live = useRef({});
  useLayoutEffect(() => {
    live.current = { rotation, speed, colors, transparent, autoRotate, scale, frequency, warpStrength, mouseInfluence, parallax, noise, iterations, intensity, bandWidth };
  });
  const dirtyRef = useRef(true); // uniforms need re-upload
  const pointerTargetRef = useRef([0, 0]);
  // When true, the rAF keeps ticking but skips rendering — no per-frame GPU
  // cost. Used so this hero field costs nothing while the intro plays, yet stays
  // compiled + ready to flow the instant the intro fades into it.
  const pausedRef = useRef(paused);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: true,
      stencil: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance'
    });
    if (!gl) return undefined; // no WebGL2: the plain var(--bg) behind it shows
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const prog = gl.createProgram();
    const vs = compile(gl, gl.VERTEX_SHADER, vert);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_PREFIX + frag);
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {};
    for (const n of ['uCanvas', 'uTime', 'uSpeed', 'uRot', 'uColorCount', 'uColors', 'uTransparent', 'uScale', 'uFrequency', 'uWarpStrength', 'uPointer', 'uMouseInfluence', 'uParallax', 'uNoise', 'uIterations', 'uIntensity', 'uBandWidth']) {
      U[n] = gl.getUniformLocation(prog, n);
    }
    const colorBuf = new Float32Array(MAX_COLORS * 3);

    const upload = () => {
      const v = live.current;
      gl.uniform1f(U.uSpeed, v.speed);
      gl.uniform1f(U.uScale, v.scale);
      gl.uniform1f(U.uFrequency, v.frequency);
      gl.uniform1f(U.uWarpStrength, v.warpStrength);
      gl.uniform1f(U.uMouseInfluence, v.mouseInfluence);
      gl.uniform1f(U.uParallax, v.parallax);
      gl.uniform1f(U.uNoise, v.noise);
      gl.uniform1i(U.uIterations, v.iterations);
      gl.uniform1f(U.uIntensity, v.intensity);
      gl.uniform1f(U.uBandWidth, v.bandWidth);
      gl.uniform1i(U.uTransparent, v.transparent ? 1 : 0);
      const arr = (v.colors || []).filter(Boolean).slice(0, MAX_COLORS).map(hexToRgb);
      colorBuf.fill(0);
      arr.forEach((c, i) => colorBuf.set(c, i * 3));
      gl.uniform3fv(U.uColors, colorBuf);
      gl.uniform1i(U.uColorCount, arr.length);
      gl.clearColor(0, 0, 0, v.transparent ? 0 : 1);
      dirtyRef.current = false;
    };

    const handleResize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      const ratio = Math.min(window.devicePixelRatio || 1, 2) * renderScale;
      canvas.width = Math.max(1, Math.floor(w * ratio));
      canvas.height = Math.max(1, Math.floor(h * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.uCanvas, w, h);
    };

    // Same clock as THREE.Clock was: time only advances while rendering.
    let last = null;
    let elapsed = 0;
    const cur = [0, 0];
    const draw = () => {
      const now = performance.now() / 1000;
      const dt = last === null ? 0 : now - last;
      last = now;
      elapsed += dt;
      if (dirtyRef.current) upload();
      const v = live.current;
      gl.uniform1f(U.uTime, elapsed);
      const rad = (((v.rotation % 360) + v.autoRotate * elapsed) * Math.PI) / 180;
      gl.uniform2f(U.uRot, Math.cos(rad), Math.sin(rad));
      const amt = Math.min(1, dt * 8);
      const tgt = pointerTargetRef.current;
      cur[0] += (tgt[0] - cur[0]) * amt;
      cur[1] += (tgt[1] - cur[1]) * amt;
      gl.uniform2f(U.uPointer, cur[0], cur[1]);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    upload();
    handleResize();

    // Force one render now so the shader program compiles + links at load (hidden
    // behind the intro overlay). Without this, a paused canvas would defer compile
    // to resume time and pop a flat frame into the intro->hero blend.
    draw();
    last = null;
    elapsed = 0;

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (pausedRef.current) return; // skip GPU render while the intro plays
      draw();
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (canvas.parentElement === container) container.removeChild(canvas);
    };
  }, [renderScale]);

  // Any prop change: re-upload the uniforms on the next frame.
  useEffect(() => {
    dirtyRef.current = true;
  }, [rotation, autoRotate, speed, scale, frequency, warpStrength, mouseInfluence, parallax, noise, iterations, intensity, bandWidth, colors, transparent]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const handlePointerMove = e => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / (rect.width || 1)) * 2 - 1;
      const y = -(((e.clientY - rect.top) / (rect.height || 1)) * 2 - 1);
      pointerTargetRef.current = [x, y];
    };

    // Bound to WINDOW, not to the container. `pointer-events` is an INHERITED
    // property and SiteBackground's wrapper sets pointerEvents:'none' (it must —
    // this canvas sits over the whole page and would otherwise eat every click),
    // so the container computed to pointer-events:none and never received a
    // single pointermove. The coordinates are still measured against the
    // container's own rect, so the math is unchanged — it just receives events.
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  return <div ref={containerRef} className={`color-bends-container ${className}`.trim()} style={style} />;
}
