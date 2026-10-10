import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Environment, Lightformer, RoundedBox, useTexture} from '@react-three/drei';
import {staticFile} from 'remotion';
import {BD_H, BD_PATHS, BD_W, DHAKA} from '../intro/bangladesh';

// 3D kit for the v3 intro: icy-white studio lighting, glossy "Pip" orb mascot, glossy app/key tiles,
// ribbons/tubes with draw-on, extruded Bangladesh with a light sweep. Everything procedural (no downloads).
export const COL = {
  lav: '#6468D8', lavLight: '#9C9FF2', icy: '#A8DAFF', icyDeep: '#5FB4FF', peach: '#FFB89A', coral: '#FF7A6B',
  orange: '#FF5A1F', cream: '#FFF8F0', ink: '#1E1B3A', white: '#FFFFFF', green: '#1FA463',
};

export const Studio: React.FC<{warm?: number}> = ({warm = 1}) => (
  <>
    <Environment resolution={256} frames={1}>
      <Lightformer intensity={5} position={[0, 7, 1]} rotation-x={Math.PI / 2} scale={[14, 5, 1]} />
      <Lightformer intensity={2.6 * warm} color="#FFC4AA" position={[-7, 1, 2]} rotation-y={Math.PI / 2} scale={[5, 9, 1]} />
      <Lightformer intensity={2.6} color="#BFE4FF" position={[7, 1, 2]} rotation-y={-Math.PI / 2} scale={[5, 9, 1]} />
      <Lightformer intensity={2.2} position={[0, 0, 9]} scale={[12, 7, 1]} />
      <Lightformer intensity={1.4} color="#B4B6FF" position={[0, -5, -3]} rotation-x={-Math.PI / 2} scale={[14, 5, 1]} />
      <Lightformer form="ring" intensity={3} position={[3, 3, 6]} scale={1.6} />
    </Environment>
    <ambientLight intensity={0.55} />
    <directionalLight position={[3, 6, 7]} intensity={1.1} />
  </>
);

// ---------- shared textures ----------
const texCache = new Map<string, THREE.Texture>();
export const canvasTex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const hit = texCache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  texCache.set(key, t);
  return t;
};
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
};

export const useLogoTex = () => {
  const t = useTexture(staticFile('logo-fansa.png'));
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// ---------- glyphs (drawn by us; generic, no third-party logos) ----------
export type Glyph = 'mail' | 'sheet' | 'send' | 'chat' | 'doc' | 'cal' | 'cart' | 'db' | 'bolt' | 'hash' | 'chatL';
const GL: Record<Glyph, {bg: string; fg: string; d: string; fill?: boolean; dots?: [number, number][]}> = {
  mail: {bg: '#FFE3DE', fg: '#E5483B', d: 'M14 20h36v26H14z M14 21l18 14 18-14'},
  sheet: {bg: '#DDF3E6', fg: '#1FA463', d: 'M20 14h24a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z M16 26h32M16 38h32M30 14v36'},
  send: {bg: '#DCEBFF', fg: '#2A8BE0', d: 'M14 31 50 16 42 50 32 38 46 22 28 35z', fill: true},
  chat: {bg: '#ECE4FF', fg: '#6468D8', d: 'M15 18h34v22H30l-9 8v-8h-6z', fill: true},
  chatL: {bg: '#6468D8', fg: '#FFFFFF', d: 'M15 18h34v22H30l-9 8v-8h-6z', fill: true},
  doc: {bg: '#FFF0D6', fg: '#E59A1A', d: 'M20 13h17l9 9v29H20z M26 32h14M26 40h14'},
  cal: {bg: '#FFE7EF', fg: '#E0457B', d: 'M20 17h24a5 5 0 0 1 5 5v22a5 5 0 0 1-5 5H20a5 5 0 0 1-5-5V22a5 5 0 0 1 5-5z M15 28h34M24 12v9M40 12v9'},
  cart: {bg: '#E3F6F8', fg: '#1A9AA8', d: 'M12 16h7l6 22h20l5-15H22', dots: [[27, 46], [43, 46]]},
  db: {bg: '#EDEDF3', fg: '#55536E', d: 'M17 18a15 6 0 1 0 30 0a15 6 0 1 0-30 0 M17 18v26c0 3 7 6 15 6s15-3 15-6V18M17 31c0 3 7 6 15 6s15-3 15-6'},
  bolt: {bg: '#FFE6D6', fg: '#FF5A1F', d: 'M36 10 18 36h12l-4 18 20-28H34z', fill: true},
  hash: {bg: '#F3E4FF', fg: '#8A4FD6', d: 'M24 14l-4 36M42 14l-4 36M14 26h38M12 40h38'},
};
export const glyphTex = (k: Glyph) =>
  canvasTex('g' + k, 256, 256, (g) => {
    const s = GL[k];
    rr(g, 0, 0, 256, 256, 56);
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, k === 'chatL' ? '#B9E2FF' : '#FFFFFF');
    grd.addColorStop(k === 'chatL' ? 0.55 : 1, s.bg);
    g.fillStyle = grd;
    g.fill();
    g.save();
    g.translate(128 - 32 * 2.6, 128 - 32 * 2.6);
    g.scale(2.6, 2.6);
    const p = new Path2D(s.d);
    g.lineWidth = 4.6;
    g.lineJoin = 'round';
    g.lineCap = 'round';
    if (s.fill) {
      g.fillStyle = s.fg;
      g.fill(p);
      if (k === 'chatL') {
        g.strokeStyle = s.bg;
        g.lineWidth = 3.6;
        g.stroke(new Path2D('M22 27h20M22 33h12'));
      }
    } else {
      g.strokeStyle = s.fg;
      g.stroke(p);
    }
    s.dots?.forEach(([x, y]) => {
      g.beginPath();
      g.arc(x, y, 3.2, 0, Math.PI * 2);
      g.fillStyle = s.fg;
      g.fill();
    });
    g.restore();
  });

export const labelTex = (text: string, font: string, color = COL.ink, w = 256, h = 256, bg?: string) =>
  canvasTex(`l${text}${font}${color}${w}${bg}`, w, h, (g) => {
    if (bg) {
      rr(g, 0, 0, w, h, Math.min(w, h) * 0.22);
      g.fillStyle = bg;
      g.fill();
    }
    g.fillStyle = color;
    g.font = font;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, w / 2, h / 2 + 4);
  });

// ---------- materials ----------
export const Gloss: React.FC<{color?: string; rough?: number; emissive?: string; ei?: number}> = ({color = '#FFFFFF', rough = 0.16, emissive = '#000000', ei = 0}) => (
  <meshPhysicalMaterial color={color} roughness={rough} metalness={0} clearcoat={1} clearcoatRoughness={0.06} emissive={emissive} emissiveIntensity={ei} envMapIntensity={1.15} />
);

// Fresnel rim halo (normal blending so it works on a transparent canvas over the cream page).
const haloMat = (color: string, power: number, strength: number) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide,
    uniforms: {c: {value: new THREE.Color(color)}, p: {value: power}, s: {value: strength}},
    vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'uniform vec3 c; uniform float p; uniform float s; varying vec3 vN; void main(){ float i = pow(clamp(0.78 + vN.z, 0.0, 1.0), p) * s; gl_FragColor = vec4(c, i);}',
  });

// ---------- Pip: glossy orb mascot with a face ----------
export type Mood = 'happy' | 'meh' | 'wow' | 'wink';
let pipGeo: THREE.SphereGeometry | null = null;
const getPipGeo = () => {
  if (pipGeo) return pipGeo;
  const g = new THREE.SphereGeometry(1, 96, 72);
  const top = new THREE.Color('#BDE6FF');
  const mid = new THREE.Color(COL.lavLight);
  const bot = new THREE.Color('#4E52CF');
  const pos = g.attributes.position;
  const cols = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const t = (y + 1) / 2;
    c.copy(bot).lerp(mid, Math.min(1, t * 1.4)).lerp(top, Math.max(0, (t - 0.55) / 0.45));
    // a touch of peach on the lower front (brand warmth)
    c.lerp(new THREE.Color(COL.peach), Math.max(0, 0.35 - t) * Math.max(0, z) * 0.9);
    cols.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  pipGeo = g;
  return g;
};
const halo = haloMat('#E4F3FF', 3.0, 0.55);
export const Pip: React.FC<{
  position?: [number, number, number]; scale?: number; squash?: number; mood?: Mood; blink?: number; look?: [number, number]; spin?: number; tilt?: number;
}> = ({position = [0, 0, 0], scale = 1, squash = 0, mood = 'happy', blink = 0, look = [0, 0], spin = 0, tilt = 0}) => {
  const k = 1 + squash;
  const sx = 1 / Math.sqrt(Math.max(0.2, k));
  const eyeY = 0.17 * (1 - blink * 0.92) * (mood === 'wow' ? 1.25 : 1);
  return (
    <group position={position} scale={scale} rotation={[0, 0, tilt]}>
      <group scale={[sx, k, sx]} position={[0, squash < 0 ? squash * 0.9 : 0, 0]}>
        <mesh geometry={getPipGeo()}>
          <meshPhysicalMaterial vertexColors roughness={0.12} clearcoat={1} clearcoatRoughness={0.04} iridescence={0.35} iridescenceIOR={1.4} emissive="#4A4FD0" emissiveIntensity={0.12} envMapIntensity={1.3} />
        </mesh>
        <mesh scale={1.1} material={halo}>
          <sphereGeometry args={[1, 48, 32]} />
        </mesh>
        {/* face looks toward `look` */}
        <group rotation={[-look[1] * 0.5, look[0] * 0.6 + spin, 0]}>
          {[-1, 1].map((s) => (
            <group key={s}>
              <mesh position={[s * 0.3, 0.14, 0.95]} scale={[mood === 'wink' && s > 0 ? 0.11 : 0.105, mood === 'wink' && s > 0 ? 0.03 : eyeY, 0.07]}>
                <sphereGeometry args={[1, 24, 16]} />
                <meshPhysicalMaterial color="#17154A" roughness={0.1} clearcoat={1} />
              </mesh>
              {/* eye glint */}
              <mesh position={[s * 0.3 - 0.03, 0.19, 1.02]} scale={[0.028, 0.035 * (1 - blink), 0.01]}>
                <sphereGeometry args={[1, 12, 8]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              {/* blush */}
              <mesh position={[s * 0.5, -0.06, 0.86]} rotation={[0, s * 0.52, 0]}>
                <circleGeometry args={[0.09, 24]} />
                <meshBasicMaterial color={COL.peach} transparent opacity={mood === 'meh' ? 0.15 : 0.55} />
              </mesh>
            </group>
          ))}
          {mood === 'meh' ? (
            <mesh position={[0, -0.13, 0.985]} rotation={[0, 0, Math.PI / 2]}>
              <capsuleGeometry args={[0.022, 0.14, 4, 8]} />
              <meshBasicMaterial color="#17154A" />
            </mesh>
          ) : mood === 'wow' ? (
            <mesh position={[0, -0.14, 0.98]}>
              <torusGeometry args={[0.065, 0.024, 10, 24]} />
              <meshBasicMaterial color="#17154A" />
            </mesh>
          ) : (
            <mesh position={[0, -0.06, 0.975]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.11, 0.024, 10, 24, Math.PI]} />
              <meshBasicMaterial color="#17154A" />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};

// ---------- glossy tiles ----------
export const IconTile: React.FC<{glyph: Glyph; position?: [number, number, number]; rotation?: [number, number, number]; scale?: number; body?: string}> = ({
  glyph, position, rotation, scale = 1, body = '#FFFFFF',
}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <RoundedBox args={[1, 1, 0.34]} radius={0.17} smoothness={5}>
      <Gloss color={body} rough={0.14} />
    </RoundedBox>
    <mesh position={[0, 0, 0.172]}>
      <planeGeometry args={[0.84, 0.84]} />
      <meshPhysicalMaterial map={glyphTex(glyph)} transparent roughness={0.2} clearcoat={1} clearcoatRoughness={0.05} />
    </mesh>
  </group>
);

export const LogoTile: React.FC<{position?: [number, number, number]; rotation?: [number, number, number]; scale?: number}> = ({position, rotation, scale = 1}) => {
  const t = useLogoTex();
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <RoundedBox args={[1.4, 1.4, 0.36]} radius={0.24} smoothness={6}>
        <Gloss color="#FFFFFF" rough={0.1} />
      </RoundedBox>
      {t ? (
        <mesh position={[0, 0, 0.182]}>
          <planeGeometry args={[1.18, 1.18]} />
          <meshBasicMaterial map={t} transparent toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};

export const Keycap: React.FC<{label: string; w?: number; position?: [number, number, number]; rotation?: [number, number, number]; press?: number; scale?: number}> = ({
  label, w = 1, position, rotation, press = 0, scale = 1,
}) => (
  <group position={position} rotation={rotation} scale={scale}>
    <RoundedBox args={[w + 0.08, 1.08, 0.3]} radius={0.12} smoothness={4} position={[0, 0, -0.18]}>
      <Gloss color="#C9CBF4" rough={0.3} />
    </RoundedBox>
    <group position={[0, 0, -press * 0.16]}>
      <RoundedBox args={[w, 1, 0.42]} radius={0.16} smoothness={5}>
        <Gloss color="#FFFFFF" rough={0.12} />
      </RoundedBox>
      <mesh position={[0, 0, 0.212]}>
        <planeGeometry args={[w * 0.92, 0.92]} />
        <meshBasicMaterial map={labelTex(label, '700 104px "FC Inter Tight"', COL.ink, Math.round(256 * w), 256)} transparent toneMapped={false} />
      </mesh>
    </group>
  </group>
);

// ---------- ribbons and tubes (draw-on via drawRange) ----------
export const ribbonGeo = (pts: THREE.Vector3[], width: number, segs = 220, colors = [COL.lav, COL.icyDeep, COL.peach, COL.orange], twist = 0) => {
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
  const frames = curve.computeFrenetFrames(segs, false);
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const cs = colors.map((c) => new THREE.Color(c));
  const c = new THREE.Color();
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const p = curve.getPointAt(u);
    const b = frames.binormals[i].clone().applyAxisAngle(frames.tangents[i], twist * u * Math.PI);
    const ww = width * (0.55 + 0.45 * Math.sin(u * Math.PI));
    for (const s of [-1, 1]) {
      const q = p.clone().addScaledVector(b, (s * ww) / 2);
      pos.push(q.x, q.y, q.z);
      const f = u * (cs.length - 1);
      const k = Math.min(cs.length - 2, Math.floor(f));
      c.copy(cs[k]).lerp(cs[k + 1], f - k);
      col.push(c.r, c.g, c.b);
    }
    if (i < segs) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  g.userData.segs = segs;
  return {geo: g, count: idx.length, segs};
};
// Show the slice [a,b] (0..1) of a ribbon/tube built segment-major.
export const slice = (g: THREE.BufferGeometry, count: number, a: number, b: number) => {
  const per = count / Math.max(1, (g.userData.segs as number) || 1);
  const s0 = Math.floor(Math.max(0, Math.min(1, a)) * (g.userData.segs || 1));
  const s1 = Math.ceil(Math.max(0, Math.min(1, b)) * (g.userData.segs || 1));
  g.setDrawRange(s0 * per, Math.max(0, s1 - s0) * per);
};
export const tubeGeo = (pts: THREE.Vector3[], r: number, segs = 120) => {
  const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), segs, r, 10, false);
  g.userData.segs = segs;
  return {geo: g, count: g.index!.count, curve: new THREE.CatmullRomCurve3(pts)};
};

// ---------- Bangladesh, extruded ----------
export const BD_SCALE = 4.4 / BD_H;
export const bdLocal = (x: number, y: number) => new THREE.Vector3((x - BD_W / 2) * BD_SCALE, -(y - BD_H / 2) * BD_SCALE, 0);
let bdGeo: THREE.ExtrudeGeometry | null = null;
export const BD_DEPTH = 0.22;
export const getBdGeo = () => {
  if (bdGeo) return bdGeo;
  const shapes: THREE.Shape[] = [];
  for (const d of BD_PATHS) {
    for (const sub of d.split('M').filter((s) => s.trim())) {
      const nums = sub.replace(/[LZ]/g, ' ').trim().split(/\s+/).map(Number);
      const pts: THREE.Vector2[] = [];
      for (let i = 0; i + 1 < nums.length; i += 2) {
        const v = bdLocal(nums[i], nums[i + 1]);
        pts.push(new THREE.Vector2(v.x, v.y));
      }
      if (pts.length > 3) shapes.push(new THREE.Shape(pts));
    }
  }
  const g = new THREE.ExtrudeGeometry(shapes, {depth: BD_DEPTH, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.035, bevelSegments: 3, curveSegments: 1});
  // pastel gradient on the caps: peach (south-west) -> lavender -> icy (north-east)
  const pos = g.attributes.position;
  const cols = new Float32Array(pos.count * 3);
  const a = new THREE.Color('#FFC9B2');
  const b = new THREE.Color('#B9BBF7');
  const c = new THREE.Color('#CFEAFF');
  const t = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const u = THREE.MathUtils.clamp((pos.getX(i) * 0.6 + pos.getY(i) + 2.4) / 4.6, 0, 1);
    t.copy(a).lerp(b, Math.min(1, u * 1.6)).lerp(c, Math.max(0, (u - 0.6) / 0.4));
    cols.set([t.r, t.g, t.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  bdGeo = g;
  return g;
};
export const DHAKA_LOCAL = bdLocal(DHAKA.x, DHAKA.y).setZ(BD_DEPTH + 0.05);

export const sweepMat = () =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    uniforms: {sweep: {value: -5}, strength: {value: 0.9}},
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:
      'uniform float sweep; uniform float strength; varying vec3 vP; void main(){ float d = (vP.x*0.7 + vP.y) - sweep; float b = exp(-d*d/0.08); gl_FragColor = vec4(1.0, 1.0, 1.0, b*strength);}',
  });
