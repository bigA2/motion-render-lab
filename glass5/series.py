"""series: the 10 Team/Scale campaign images (2026-10-16). 1600x900 each, 3 layouts (split / giant / calm).
Scripts + audit live privately in fansa-knowledge (IMAGES_10_SCRIPTS.md); only the copy below ships here.
Hero = REAL builder screenshot (assets/iNN.jpg). Callout steps match the steps the builder generated.
Run: python glass5/series.py -> glass5/out/<file>.png + out/QA_series.txt
"""
import json, os, pathlib, re
from playwright.sync_api import sync_playwright
from cta import cta

HERE = pathlib.Path(__file__).parent.resolve()
OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
W, H = 1600, 900
F = lambda n: (HERE / "fonts" / n).as_uri()
I = lambda s: (HERE / "logo-fansa.png").as_uri() if s == 'fansa' else (HERE / "icons" / f"{s}.png").as_uri()
LOGO = (HERE / "logo-fansa.png").as_uri()
QA = re.search(r'QA = """(.*?)"""', (HERE / "build.py").read_text(encoding="utf-8"), re.S).group(1)
SPEC = json.loads((HERE / "series.json").read_text(encoding="utf-8"))

# palettes: bg, ink, accent, soft mark, muted
PAL = {
 "lilac": ("radial-gradient(1100px 760px at 25% 20%,#FFFFFF 0%,#F1EEFB 55%,#E2DDF5 100%)", "#16142C", "#6B4FD8", "#E4DCFF", "#45425E"),
 "cream": ("radial-gradient(1100px 760px at 70% 10%,#FFFDF8 0%,#F7EFE2 55%,#EADCC6 100%)", "#1E1A14", "#C2410C", "#FDE2CC", "#5A5246"),
 "night": ("radial-gradient(1100px 760px at 30% 20%,#2B2566 0%,#17143A 60%,#0D0B24 100%)", "#F4F2FF", "#A99BFF", "#3B3380", "#C9C4EA"),
 "mint":  ("radial-gradient(1100px 760px at 20% 80%,#FFFFFF 0%,#EAF6F1 55%,#D3EBE1 100%)", "#10241C", "#0F766E", "#CDEFE3", "#3F5A50"),
}

CSS = f"""
@font-face{{font-family:Playfair;src:url({F('PlayfairDisplay-700.woff2')})}}
@font-face{{font-family:League;src:url({F('LeagueGothic-400.woff2')})}}
@font-face{{font-family:Inter;font-weight:500;src:url({F('InterTight-500.woff2')})}}
@font-face{{font-family:Inter;font-weight:700;src:url({F('InterTight-700.woff2')})}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:100vw;height:100vh;overflow:hidden;position:relative;font-family:Inter;font-weight:500}}
.abs{{position:absolute}}
.grain{{position:absolute;inset:0;pointer-events:none;opacity:.10;mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}}
.app{{width:44px;height:44px;border-radius:12px;background:#fff;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(20,16,60,.20);flex:none}}
.app img{{width:68%;height:68%;object-fit:contain}}
"""

def mark(t, acc, soft):  # **word** -> colour-marked value word
    return re.sub(r"\*\*(.+?)\*\*", lambda m: f'<span style="color:{acc};background:linear-gradient(transparent 68%,{soft} 68%,{soft} 94%,transparent 94%)">{m.group(1)}</span>', t)

def shot(s, left, top, w, rot=-7):
    h = round(w * 790 / 1280)
    return (f'<div class="abs" style="left:{left}px;top:{top}px;width:{w}px;height:{h}px;border-radius:18px;overflow:hidden;'
            f'transform:perspective(1800px) rotateY({rot}deg);box-shadow:0 40px 80px rgba(16,12,50,.40),0 0 0 6px #fff">'
            f'<img src="{(HERE / "assets" / (s["id"] + ".jpg")).as_uri()}" style="width:100%;height:100%;object-fit:cover;display:block"></div>')

def steps(s, left, top, width, ink, acc):
    rows = []
    for i, (app, txt) in enumerate(s["steps"]):
        rows.append(f'<div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">'
                    f'<span class="app"><img src="{I(app)}"></span>'
                    f'<span data-rank="4" style="font-size:26px;font-weight:700;color:{ink};line-height:1.2">{txt}</span></div>')
    return f'<div class="abs" style="left:{left}px;top:{top}px;width:{width}px">{"".join(rows)}</div>'

def chain(apps, acc):
    out = []
    for i, a in enumerate(apps):
        if i: out.append(f'<span style="color:{acc};font-weight:700;font-size:26px;margin:0 6px">→</span>')
        out.append(f'<span class="app"><img src="{I(a)}"></span>')
    return "".join(out)

def body(s):
    bg, ink, acc, soft, mut = PAL[s["pal"]]; dark = s["pal"] == "night"
    kick = f'<div data-rank="5" style="font-size:22px;font-weight:700;letter-spacing:.10em;color:{acc};white-space:nowrap">{s["kicker"]}</div>'
    head = f'<div data-rank="1" style="font-family:Playfair;font-size:{s.get("hs", 64)}px;line-height:1.06;color:{ink}">{mark(s["h1"], acc, soft)}</div>'
    ans = f'<div data-rank="3" style="font-size:30px;line-height:1.3;font-weight:700;color:{mut};margin-top:18px">{mark(s["answer"], acc, soft)}</div>'
    foot = (f'<div class="abs" style="right:56px;bottom:44px;display:flex;align-items:center;gap:12px"><img src="{LOGO}" style="width:46px;height:46px">'
            f'<span data-rank="4" style="font-size:26px;font-weight:700;color:{ink}">fansachat.com</span></div>')
    note = (f'<div class="abs" data-rank="5" style="left:56px;bottom:20px;font-size:20px;color:{mut}">{s["note"]}</div>' if s.get("note") else "")
    L = s["layout"]
    if L == "split":
        main = (f'<div class="abs" style="left:56px;top:56px;width:560px">{kick}<div style="height:18px"></div>{head}{ans}</div>'
                f'{steps(s, 56, 470, 560, ink, acc)}{shot(s, 660, 130, 890)}{cta(56, 760, fs=32, dark=dark)}')
    elif L == "giant":
        main = (f'<div class="abs" data-layer="behind" data-rank="1" style="right:30px;top:120px;font-family:League;font-size:420px;line-height:.85;color:{soft};opacity:.95;white-space:nowrap">{s["giant"]}</div>'
                f'<div class="abs" style="left:56px;top:56px;width:700px">{kick}<div style="height:18px"></div>{head}{ans}</div>'
                f'<div class="abs" style="left:56px;top:520px;display:flex;align-items:center">{chain(s["apps"], acc)}</div>'
                f'{shot(s, 780, 260, 770, -9)}{cta(56, 760, fs=32, dark=dark)}')
    else:  # calm: centred statement + screenshot under it
        main = (f'<div class="abs" style="left:56px;top:48px;width:{W - 112}px;text-align:center">{kick}<div style="height:14px"></div>{head}</div>'
                f'<div class="abs" style="left:56px;top:{s.get("at", 158)}px;width:{W - 112}px;text-align:center">{ans}</div>'
                f'<div class="abs" style="left:110px;top:290px;display:flex;flex-direction:column;gap:14px">{"".join(f"<span class=app><img src={I(a)}></span>" for a in s["apps"])}</div>'
                f'{shot(s, 230, 240, 740, 0)}{steps(s, 1030, 320, 560, ink, acc)}{cta(56, 770, fs=32, dark=dark)}')
    return f'<body style="background:{bg};color:{ink}"><div class="grain"></div><img class="abs" src="{LOGO}" style="right:56px;top:48px;width:52px;height:52px">{main}{note}{foot}</body>'

allowed = {str(k): list(range(18, 430)) for k in range(1, 6)}
SMALL = """() => [...document.querySelectorAll('[data-rank]')].filter(e => parseFloat(getComputedStyle(e).fontSize) < (+e.dataset.rank === 5 ? 20 : 24))
  .map(e => `too small ${getComputedStyle(e).fontSize}: "${e.textContent.trim().slice(0,24)}"`)"""
lines = []
with sync_playwright() as pw:
    br = pw.chromium.launch(channel=os.environ.get("PW_CHANNEL") or None)
    for s in SPEC:
        f = OUT / f'{s["file"]}.html'
        f.write_text(f"<!doctype html><html><head><meta charset=utf-8><style>{CSS}</style></head>{body(s)}</html>", encoding="utf-8")
        pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=2); pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(500)
        pg.screenshot(path=str(OUT / f'{s["file"]}.png')); res = pg.evaluate(QA, [16, allowed, W, H]); small = pg.evaluate(SMALL); pg.close()
        iss = res["issues"] + small
        lines.append(f'{s["id"]} {s["file"]}: fonts {res["fonts"]} · {"PASS" if not iss else "FAIL " + "; ".join(iss)}')
    br.close()
print("\n".join(lines)); (OUT / "QA_series.txt").write_text("\n".join(lines), encoding="utf-8")
