"""cover: C03 FansaChat "Issue 01" magazine cover (founder's luxury-cover prompt + Dyson/PlayStation refs). 1080x1350.
3D logo = code-only procedural Three.js model, following img2threejs (github.com/img2threejs/img2threejs, Apache-2.0) method
for flat marks: trace the reference image -> Shape -> ExtrudeGeometry with bevel; original logo colours mapped on the front cap.
Run: pip install playwright pillow potracer numpy && python glass5/cover.py -> glass5/out/<name>.png + QA
"""
import os, pathlib, re
import numpy as np, potrace
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent.resolve()
OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
W, H = 1080, 1350
F = lambda n: (HERE / "fonts" / n).as_uri()
import base64
LOGO = "data:image/png;base64," + base64.b64encode((HERE / "logo-fansa.png").read_bytes()).decode()  # data URI: WebGL textures cannot load file:// (CORS)
VIO, DEEP, INK = "#7B5CE0", "#2B2266", "#16122C"
QA = re.search(r'QA = """(.*?)"""', (HERE / "build.py").read_text(encoding="utf-8"), re.S).group(1)

# 1. trace the logo silhouette (alpha) into an SVG path, coordinates normalised to 0..1
N = 512
a = np.array(Image.open(HERE / "logo-fansa.png").convert("RGBA").resize((N, N), Image.LANCZOS))[:, :, 3] <= 110   # potracer traces the falsy pixels, so pass the inverse
d = []
for curve in potrace.Bitmap(a).trace(turdsize=8, alphamax=1.0, opttolerance=0.2):
    p = lambda pt: f"{pt.x / N:.5f} {pt.y / N:.5f}"
    d.append(f"M {p(curve.start_point)}")
    for s in curve.segments:
        d.append(f"L {p(s.c)} L {p(s.end_point)}" if s.is_corner else f"C {p(s.c1)} {p(s.c2)} {p(s.end_point)}")
    d.append("Z")
PATH = " ".join(d)

THREE = f"""
<script type="importmap">{{"imports":{{"three":"https://unpkg.com/three@0.160.0/build/three.module.js","three/addons/":"https://unpkg.com/three@0.160.0/examples/jsm/"}}}}</script>
<script type="module">
import * as THREE from 'three';
import {{ SVGLoader }} from 'three/addons/loaders/SVGLoader.js';
import {{ RoomEnvironment }} from 'three/addons/environments/RoomEnvironment.js';
const cv = document.getElementById('gl');
const r = new THREE.WebGLRenderer({{canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true}});
r.setPixelRatio(2); r.setSize({W}, {H}, false); r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
const cam = new THREE.PerspectiveCamera(26, {W}/{H}, 0.1, 100); cam.position.set(0, 0, 11);
const svg = new SVGLoader().parse('<svg xmlns="http://www.w3.org/2000/svg"><path d="{PATH}"/></svg>');
const shapes = svg.paths.flatMap(p => SVGLoader.createShapes(p));
const geo = new THREE.ExtrudeGeometry(shapes, {{depth: 0.09, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.012, bevelSegments: 6, curveSegments: 24}});
// caps keep the 0..1 shape coords as UVs -> map the real logo onto the front; flip because SVG y points down
const tex = await new THREE.TextureLoader().loadAsync('{LOGO}'); tex.colorSpace = THREE.SRGBColorSpace; tex.flipY = false;
const face = new THREE.MeshPhysicalMaterial({{map: tex, roughness: 0.22, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08}});
const side = new THREE.MeshPhysicalMaterial({{color: 0xD9CCFF, roughness: 0.18, metalness: 0.75, clearcoat: 1, iridescence: 0.6}});
const mesh = new THREE.Mesh(geo, [face, side]);
geo.center(); mesh.scale.set(2.2, -2.2, 2.2);           // y flip: SVG -> world
const g = new THREE.Group(); g.add(mesh); g.position.set(0.62, 0.42, 0); g.rotation.set(0.12, -0.42, 0.05); scene.add(g);
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-4, 5, 6); scene.add(key);
const gel = new THREE.PointLight(0x8A5CFF, 60, 30); gel.position.set(4, -1, 3); scene.add(gel);   // the colour gel
const rim = new THREE.DirectionalLight(0xFFB8E8, 1.4); rim.position.set(3, 4, -4); scene.add(rim);
r.render(scene, cam); window.done = true;
</script>"""

def barcode(x, y):
    rnd = np.random.default_rng(7); bars, cx = [], 0
    for _ in range(46):
        w = int(rnd.integers(1, 4)); bars.append(f'<rect x="{cx}" y="0" width="{w}" height="54" fill="{INK}"/>'); cx += w + int(rnd.integers(1, 3))
    return (f'<div class="abs" style="left:{x}px;top:{y}px;background:#fff;padding:8px 10px 4px;border-radius:2px">'
            f'<svg width="{cx}" height="54">{"".join(bars)}</svg>'
            f'<div style="font-family:Mono;font-size:11px;letter-spacing:.18em;color:{INK}">0 11 2026 0001</div></div>')

def teaser(top, num, title, line, fam):
    return (f'<div class="abs" style="left:56px;top:{top}px;width:450px">'
            f'<div data-rank="4" style="font-family:{fam};font-size:30px;letter-spacing:.1em;color:{VIO};font-weight:700">{num} · {title}</div>'
            f'<div data-rank="4" style="font-size:30px;line-height:1.25;color:#2E2848;margin-top:6px">{line}</div></div>')

CSS = f"""
@font-face{{font-family:Playfair;src:url({F('PlayfairDisplay-700.woff2')})}}
@font-face{{font-family:League;src:url({F('LeagueGothic-400.woff2')})}}
@font-face{{font-family:Inter;font-weight:500;src:url({F('InterTight-500.woff2')})}}
@font-face{{font-family:Inter;font-weight:700;src:url({F('InterTight-700.woff2')})}}
@font-face{{font-family:Mono;src:url({F('JetBrainsMono-500.woff2')})}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:100vw;height:100vh;overflow:hidden;position:relative;font-family:Inter;font-weight:500;color:{INK};
  background:radial-gradient(700px 800px at 70% 45%,#F6F1FF 0%,#DCCFFB 45%,#B9A6F2 80%,#9D86E8 100%)}}
.abs{{position:absolute}}
.grain{{position:absolute;inset:0;pointer-events:none;opacity:.14;mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}}
"""

BODY = f"""<body>
<div class="grain"></div>
<div class="abs" style="left:560px;top:820px;width:420px;height:60px;border-radius:50%;background:radial-gradient(closest-side,rgba(43,34,102,.35),transparent);filter:blur(6px)"></div>
<canvas id="gl" class="abs" style="left:0;top:0;width:{W}px;height:{H}px"></canvas>
<div class="abs" data-rank="2" style="left:0;top:30px;width:{W}px;text-align:center;font-family:Playfair;font-size:150px;line-height:1;letter-spacing:-.01em;color:{INK}">FANSACHAT</div>
<div class="abs" style="left:56px;top:196px;width:968px;display:flex;justify-content:space-between;font-family:Mono;font-size:13px;letter-spacing:.2em;color:{DEEP}">
 <span data-rank="5">ISSUE 01</span><span data-rank="5">THE WORKFLOW AUTOMATION ISSUE</span><span data-rank="5">NOVEMBER 2026</span></div>
{teaser(280, '01', 'ONE SENTENCE', 'Type what you want.<br>Get a working workflow.', 'Inter')}
{teaser(450, '02', '700+ APPS', 'Plus 478 ready templates<br>to start from.', 'Inter')}
{teaser(620, '03', 'YOU APPROVE', 'Check every step before<br>anything runs.', 'Inter')}
<div class="abs" data-rank="1" style="left:52px;top:900px;width:760px;font-family:League;font-size:150px;line-height:.88;color:{INK}">STOP DOING IT<br><span style="color:{VIO}">BY HAND.</span></div>
<div class="abs" data-rank="3" style="left:56px;top:1178px;width:640px;font-family:Playfair;font-size:32px;line-height:1.2;color:{DEEP}">One sentence. A completely different Monday.</div>
{barcode(820, 1210)}
<div class="abs" data-rank="5" style="left:820px;top:1170px;font-family:Mono;font-size:12px;letter-spacing:.14em;color:{DEEP}">WAITLIST OPEN</div>
<div class="abs" data-rank="5" style="left:56px;top:1268px;font-family:Mono;font-size:12px;letter-spacing:.16em;color:{DEEP}">FANSACHAT.COM</div>
{THREE}
</body>"""

NAME = "fansachat-issue-01-workflow-automation-magazine-cover"
allowed = {str(k): list(range(10, 400)) for k in range(1, 6)}
with sync_playwright() as pw:
    br = pw.chromium.launch(channel=os.environ.get("PW_CHANNEL") or None, args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    f = OUT / f"{NAME}.html"; f.write_text(f"<!doctype html><html><head><meta charset=utf-8><style>{CSS}</style></head>{BODY}</html>", encoding="utf-8")
    pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=2)
    pg.on("console", lambda m: print("console:", m.text) if m.type == "error" else None)
    pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_function("window.done === true", timeout=90000); pg.wait_for_timeout(500)
    pg.screenshot(path=str(OUT / f"{NAME}.png")); res = pg.evaluate(QA, [12, allowed, W, H]); br.close()
line = f"{NAME}: fonts {res['fonts']} · {'PASS' if not res['issues'] else 'FAIL ' + '; '.join(res['issues'])}"
print(line); (OUT / "QA_cover.txt").write_text(line, encoding="utf-8")
