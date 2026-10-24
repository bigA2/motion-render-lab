# Remotion recipe — continuous camera (pin all @remotion/* to the project version, 4.0.532)

```tsx
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {noise2D} from '@remotion/noise';

const crash = Easing.bezier(0.16, 1, 0.3, 1);      // crash zoom in
const reveal = Easing.bezier(0.33, 0, 0.2, 1);     // slower zoom out

// Camera keyframes: [frame, scale, x, y, rotX, rotY, rotZ]
const KEYS = [[0,.35,0,0,0,0,-2],[66,.6,0,0,0,0,3],[76,1.6,0,40,-8,18,2],[135,2.2,0,120,-6,14,1] /* … */];

export const Camera: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const k = (i: number) => interpolate(f, KEYS.map(k => k[0]), KEYS.map(k => k[i]),
    {easing: crash, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const drift = 1 + 0.04 * (f / 30);                     // never-static slow push: +4 % per second
  const shakeX = noise2D('cx', f / 40, 0) * 2;           // tiny handheld drift (px)
  return (
    <AbsoluteFill style={{background: '#E5E5EA', perspective: 1400}}>
      <CameraMotionBlur samples={10} shutterAngle={180}>
        <AbsoluteFill style={{
          transform: `translate(${k(2) + shakeX}px, ${-k(3)}px) scale(${k(1) * drift})
                      rotateX(${k(4)}deg) rotateY(${k(5)}deg) rotateZ(${k(6)}deg)`,
          transformStyle: 'preserve-3d'}}>
          {children}
        </AbsoluteFill>
      </CameraMotionBlur>
      {/* depth of field: radial mask over a blurred copy, or a vignette blur layer */}
    </AbsoluteFill>
  );
};
```

Patterns:
- **Letter write-in:** per letter `opacity 0→1, translateY 12→0, filter blur(8px→0)`, stagger 1.5 frames.
- **❌ draw:** SVG path `strokeDashoffset` from length → 0 over 6 frames.
- **✅ pop:** scale 0 → 1.15 → 1 (spring damping 12).
- **Particles:** 120 dots, each with a seeded start (text glyph positions) and a target (next shape's points); `interpolate` with random per-dot delay 0–8 frames.
- **Shared-element morph:** the same div; interpolate width/height/borderRadius/background between the two states.
- **Slot columns:** each column a vertical strip; translateY to its target with `crash` easing + motion blur; stagger columns by 2 frames.
- **Row sweep:** pill width 0→100 % per row, 8 frames each, rows overlap by 3 frames.
- **Page curl (cheap):** rotateY on the card + skewY 2° on the right half + a gradient shadow.
- Render: GitHub Actions render workflow (public repo), QA at 4 fps before showing the founder.
