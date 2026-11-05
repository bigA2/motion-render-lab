// Layout guard (free, runs in the render workflow). Reads the TextGuard boxes logged while rendering and the
// rendered video, and FAILS (exit 1) when, on any checked frame (every 4th):
//   overlap  — two visible text boxes intersect (opacity >= 0.2 each)
//   safe     — a visible text box (opacity >= 0.2) is not fully inside the 6 % safe area
//   size     — readable text (opacity >= 0.9, not motion-blurred) is under 26 px on screen
//   contrast — WCAG contrast between the text colour and the pixels around the glyphs inside its box, measured on
//              the rendered frame (10th percentile of the background pixels), is under 4.5:1 (or 3:1 for >= 48 px)
//   unseen   — a fully visible text box has (almost) no pixels of its own colour: it is covered by something
// Contrast/size/unseen are skipped while the text itself is motion-blurred or fading (opacity < 0.9).
// Usage: node layout_guard.mjs <video.mp4> <report.json> <frameOffset> <tg1.json> [tg2.json ...]
// MIT, our own code.
import {spawn, spawnSync} from 'child_process';
import {mkdirSync, readFileSync, writeFileSync} from 'fs';
import path from 'path';

const [video, reportPath, offArg, ...tgFiles] = process.argv.slice(2);
const OFF = +offArg || 0, SAFE = 0.06, MIN_PX = 26;
const byF = new Map();
for (const p of tgFiles) for (const fr of JSON.parse(readFileSync(p, 'utf8')).frames) byF.set(fr.f, fr);
const frames = [...byF.values()].sort((a, b) => a.f - b.f);
if (!frames.length) { console.error('layout_guard: no TextGuard frames found'); process.exit(1); }
const W = frames[0].w, H = frames[0].h, EVERY = 4;

const hex = (c) => { let m = /^#?([0-9a-f]{3,8})$/i.exec((c || '').trim())?.[1] ?? '000000'; if (m.length <= 4) m = m.slice(0, 3).split('').map((x) => x + x).join(''); const n = parseInt(m.slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const onScreen = (b) => b.x < W && b.y < H && b.x + b.w > 0 && b.y + b.h > 0;

const viol = []; let checked = 0, boxesChecked = 0, contrastMeasured = 0; const worst = {};
const geom = (fr) => {
  const vis = fr.boxes.filter((b) => b.o >= 0.2 && onScreen(b));
  const sx0 = W * SAFE, sy0 = H * SAFE, sx1 = W - sx0, sy1 = H - sy0;
  for (const b of vis) if (b.x < sx0 - 1 || b.y < sy0 - 1 || b.x + b.w > sx1 + 1 || b.y + b.h > sy1 + 1) viol.push({f: fr.f, kind: 'safe', id: b.id, box: [b.x, b.y, b.w, b.h]});
  for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
    const a = vis[i], b = vis[j]; const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (ix > 1 && iy > 1) viol.push({f: fr.f, kind: 'overlap', id: `${a.id} × ${b.id}`, area: Math.round(ix * iy)});
  }
  for (const b of vis) if (b.o >= 0.9 && !b.blur && b.px < MIN_PX) viol.push({f: fr.f, kind: 'size', id: b.id, px: b.px});
  boxesChecked += vis.length;
};

const pixels = (fr, buf) => {
  for (const b of fr.boxes) {
    if (b.o < 0.9 || b.blur || !onScreen(b)) continue;
    const x0 = Math.max(0, Math.floor(b.x)), y0 = Math.max(0, Math.floor(b.y)), x1 = Math.min(W, Math.ceil(b.x + b.w)), y1 = Math.min(H, Math.ceil(b.y + b.h));
    const bw = x1 - x0, bh = y1 - y0; if (bw < 4 || bh < 4) continue;
    const [tr, tg, tb] = hex(b.c); const Lt = lum(tr, tg, tb);
    const mask = new Uint8Array(bw * bh);
    let nText = 0;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const i = ((y0 + y) * W + x0 + x) * 3; const d = Math.max(Math.abs(buf[i] - tr), Math.abs(buf[i + 1] - tg), Math.abs(buf[i + 2] - tb));
      if (d < 28) mask[y * bw + x] = 1;
      if (d < 60) nText++; // presence (thin strokes lose colour to chroma subsampling)
    }
    const need = b.px >= 48 ? 3 : 4.5;
    let nCore = 0; for (let k = 0; k < mask.length; k++) nCore += mask[k];
    if (nCore > bw * bh * 0.6) { // background is (almost) the text colour itself: compare with the box median
      const ls = []; for (let y = 0; y < bh; y += 2) for (let x = 0; x < bw; x += 2) { const i = ((y0 + y) * W + x0 + x) * 3; ls.push(lum(buf[i], buf[i + 1], buf[i + 2])); }
      ls.sort((p, q) => p - q); const c0 = ratio(Lt, ls[ls.length >> 1]); contrastMeasured++;
      if (c0 < need) viol.push({f: fr.f, kind: 'contrast', id: b.id, cr: +c0.toFixed(2), need, note: 'background ~ text colour'});
      continue;
    }
    if (nText < bw * bh * 0.004) { viol.push({f: fr.f, kind: 'unseen', id: b.id, box: [b.x, b.y, b.w, b.h]}); continue; }
    // dilate the glyph mask (anti-aliasing + shadows) and keep the rest as background
    const r = Math.max(3, Math.round(b.px * 0.08)); const tmp = new Uint8Array(bw * bh), dil = new Uint8Array(bw * bh);
    for (let y = 0; y < bh; y++) { let last = -1e9; for (let x = 0; x < bw; x++) { if (mask[y * bw + x]) last = x; if (x - last <= r) tmp[y * bw + x] = 1; } last = 1e9; for (let x = bw - 1; x >= 0; x--) { if (mask[y * bw + x]) last = x; if (last - x <= r) tmp[y * bw + x] = 1; } }
    for (let x = 0; x < bw; x++) { let last = -1e9; for (let y = 0; y < bh; y++) { if (tmp[y * bw + x]) last = y; if (y - last <= r) dil[y * bw + x] = 1; } last = 1e9; for (let y = bh - 1; y >= 0; y--) { if (tmp[y * bw + x]) last = y; if (last - y <= r) dil[y * bw + x] = 1; } }
    const cr = [];
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) if (!dil[y * bw + x]) { const i = ((y0 + y) * W + x0 + x) * 3; cr.push(ratio(Lt, lum(buf[i], buf[i + 1], buf[i + 2]))); }
    if (cr.length < bw * bh * 0.05) continue; // text fills its box: nothing to sample
    cr.sort((p, q) => p - q); const p10 = cr[Math.floor(cr.length * 0.1)];
    contrastMeasured++;
    if (!worst[b.id] || p10 < worst[b.id].cr) worst[b.id] = {cr: +p10.toFixed(2), f: fr.f, need};
    if (p10 < need) viol.push({f: fr.f, kind: 'contrast', id: b.id, cr: +p10.toFixed(2), need});
  }
};

// decode every 4th frame (rgb24) and check the frames that have guard data
const want = new Set(frames.map((fr) => fr.f));
const ff = spawn('ffmpeg', ['-v', 'error', '-i', video, '-vf', `select=not(mod(n\\,${EVERY})),scale=${W}:${H}`, '-vsync', '0', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-']);
const FS = W * H * 3; let acc = Buffer.alloc(0), k = 0; const shots = [];
ff.stdout.on('data', (d) => {
  acc = Buffer.concat([acc, d]);
  while (acc.length >= FS) {
    const buf = acc.subarray(0, FS); const f = OFF + k * EVERY; k++;
    if (want.has(f)) { const fr = byF.get(f); const n0 = viol.length; geom(fr); pixels(fr, buf); checked++; if (viol.length > n0 && shots.length < 8) shots.push({f, buf: Buffer.from(buf), boxes: fr.boxes}); }
    acc = acc.subarray(FS);
  }
});
await new Promise((res) => ff.on('close', res));

// annotated stills of the first violating frames (red = text boxes, green = safe area)
const dir = path.join(path.dirname(reportPath), 'guard_frames'); mkdirSync(dir, {recursive: true});
for (const s of shots) {
  const px = (x, y, c) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const i = (y * W + x) * 3; s.buf[i] = c[0]; s.buf[i + 1] = c[1]; s.buf[i + 2] = c[2]; };
  const rect = (x, y, w, h, c) => { for (let t = 0; t < 3; t++) { for (let xx = Math.round(x); xx < x + w; xx++) { px(xx, Math.round(y) + t, c); px(xx, Math.round(y + h) - t, c); } for (let yy = Math.round(y); yy < y + h; yy++) { px(Math.round(x) + t, yy, c); px(Math.round(x + w) - t, yy, c); } } };
  rect(W * SAFE, H * SAFE, W * (1 - 2 * SAFE), H * (1 - 2 * SAFE), [0, 200, 0]);
  for (const b of s.boxes) if (b.o >= 0.2) rect(b.x, b.y, b.w, b.h, [255, 0, 0]);
  const ppm = Buffer.concat([Buffer.from(`P6\n${W} ${H}\n255\n`), s.buf]);
  spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'ppm', '-i', '-', '-vf', 'scale=540:-2', path.join(dir, `f${String(s.f).padStart(5, '0')}.jpg`)], {input: ppm});
}

const kinds = {}; viol.forEach((v) => (kinds[v.kind] = (kinds[v.kind] || 0) + 1));
const rep = {video: path.basename(video), size: [W, H], every: EVERY, frames_with_guard: frames.length, frames_checked: checked, text_boxes_checked: boxesChecked, contrast_measured: contrastMeasured, violations: viol.length, by_kind: kinds, worst_contrast_per_text: worst, list: viol.slice(0, 400)};
writeFileSync(reportPath, JSON.stringify(rep, null, 1));
console.log(`layout_guard ${rep.video}: ${checked} frames, ${boxesChecked} text boxes, ${contrastMeasured} contrast samples -> ${viol.length} violations ${JSON.stringify(kinds)}`);
for (const v of viol.slice(0, 30)) console.log('  ', JSON.stringify(v));
if (checked < frames.length * 0.95) { console.error(`layout_guard: only ${checked}/${frames.length} guard frames decoded`); process.exit(1); }
process.exit(viol.length ? 1 : 0);
