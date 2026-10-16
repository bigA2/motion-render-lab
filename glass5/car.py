"""car: Instagram carousels, founder framework: 1 hook (identity) -> 2 obstacles (stands alone: IG re-serves slide 2)
-> 3 cost of inaction -> 4 intro -> 5 solution (REAL builder screenshot) -> 6 CTA (save + waitlist + community, price only when it fits).
1080x1350 per slide. Retention: N/6 counter, right-edge swipe arrow, a shape that bleeds into the next slide.
Run: python glass5/car.py -> glass5/out/car/<file>-<n>.png + out/QA_car.txt
"""
import json, os, pathlib, re
from playwright.sync_api import sync_playwright
from cta import cta

HERE = pathlib.Path(__file__).parent.resolve()
OUT = HERE / "out" / "car"; OUT.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1350
F = lambda n: (HERE / "fonts" / n).as_uri()
LOGO = (HERE / "logo-fansa.png").as_uri()
QA = re.search(r'QA = """(.*?)"""', (HERE / "build.py").read_text(encoding="utf-8"), re.S).group(1)
DATA = json.loads((HERE / "car.json").read_text(encoding="utf-8"))
PALS = [  # bg, ink, accent, mark, muted, card
 ("linear-gradient(160deg,#FFFFFF 0%,#F1EEFB 55%,#DED8F4 100%)", "#16142C", "#6B4FD8", "#E4DCFF", "#47445F", "rgba(255,255,255,.8)"),
 ("linear-gradient(160deg,#FFFDF8 0%,#F6ECDD 55%,#E8D7BF 100%)", "#1E1A14", "#C2410C", "#FDDCC4", "#5A5246", "rgba(255,255,255,.75)"),
 ("linear-gradient(160deg,#2C2668 0%,#17143A 60%,#0C0A22 100%)", "#F4F2FF", "#B3A6FF", "#463D96", "#CBC6EC", "rgba(255,255,255,.08)"),
 ("linear-gradient(160deg,#FFFFFF 0%,#E8F5EF 55%,#CFE9DD 100%)", "#10241C", "#0F766E", "#C9EEDF", "#3F5A50", "rgba(255,255,255,.8)"),
]
CSS = f"""
@font-face{{font-family:Playfair;src:url({F('PlayfairDisplay-700.woff2')})}}
@font-face{{font-family:League;src:url({F('LeagueGothic-400.woff2')})}}
@font-face{{font-family:Inter;font-weight:500;src:url({F('InterTight-500.woff2')})}}
@font-face{{font-family:Inter;font-weight:700;src:url({F('InterTight-700.woff2')})}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:100vw;height:100vh;overflow:hidden;position:relative;font-family:Inter;font-weight:500}}
.abs{{position:absolute}}
"""
mk = lambda t, acc, mark: re.sub(r"\*\*(.+?)\*\*", lambda m: f'<span style="color:{acc};background:linear-gradient(transparent 66%,{mark} 66%,{mark} 94%,transparent 94%)">{m.group(1)}</span>', t)

def slide(c, n, s):
    bg, ink, acc, mark, mut, card = PALS[c["pal"]]; dark = c["pal"] == 2; N = len(c["s"]); t = s["t"]
    # bleed: a disc cut by the right edge here continues on the left edge of the next slide
    bleed = (f'<div class="abs" style="left:{W - 90}px;top:{300 + n * 70}px;width:180px;height:180px;border-radius:50%;background:{mark};opacity:.9"></div>' if n < N else "")
    bleed += (f'<div class="abs" style="left:-90px;top:{300 + (n - 1) * 70}px;width:180px;height:180px;border-radius:50%;background:{mark};opacity:.9"></div>' if n > 1 else "")
    top = (f'<div class="abs" data-rank="5" style="left:64px;top:60px;font-size:26px;font-weight:700;letter-spacing:.12em;color:{acc}">{c["who"]}</div>'
           f'<img class="abs" src="{LOGO}" style="right:64px;top:50px;width:56px;height:56px">'
           f'<div class="abs" data-rank="5" style="right:64px;top:118px;font-size:24px;font-weight:700;color:{mut}">{n}/{N}</div>')
    arrow = (f'<div class="abs" style="right:40px;top:1150px;width:84px;height:84px;border-radius:50%;background:{acc};display:flex;align-items:center;justify-content:center;'
             f'box-shadow:0 10px 24px rgba(0,0,0,.2)"><span style="color:#fff;font-size:46px;font-weight:700;line-height:1">→</span></div>' if n < N else "")
    head = lambda size, tp=200: f'<div class="abs" data-rank="1" style="left:64px;top:{tp}px;width:900px;font-family:Playfair;font-size:{size}px;line-height:1.08;color:{ink}">{mk(s["h"], acc, mark)}</div>'
    rows = lambda items, tp, sym: (f'<div class="abs" style="left:64px;top:{tp}px;width:900px">' + "".join(
        f'<div style="display:flex;gap:22px;align-items:flex-start;margin-bottom:30px"><span style="flex:none;width:54px;height:54px;border-radius:14px;background:{acc};color:#fff;font-size:30px;font-weight:700;display:flex;align-items:center;justify-content:center">{sym if sym else i + 1}</span>'
        f'<span data-rank="3" style="font-size:42px;font-weight:700;line-height:1.2;color:{ink};padding-top:2px">{r}</span></div>' for i, r in enumerate(items)) + "</div>")
    if t == "hook":
        main = head(88, 230) + f'<div class="abs" data-rank="2" style="left:64px;top:900px;width:900px;font-size:44px;font-weight:700;color:{acc}">{s["b"]}</div>'
    elif t == "obst":
        main = head(72) + rows(s["l"], 560, "")
    elif t == "cost":
        main = head(72) + rows(s["l"], 600, "✕")
    elif t == "intro":
        main = (head(80, 220) + f'<div class="abs" style="left:64px;top:620px;width:900px;padding:36px 40px;border-radius:28px 28px 28px 8px;background:{card};border:2px solid {mark}">'
                f'<div data-rank="5" style="font-size:24px;font-weight:700;letter-spacing:.12em;color:{acc}">FANSACHAT</div>'
                f'<div data-rank="3" style="font-size:40px;line-height:1.35;font-weight:500;color:{ink};margin-top:12px">{s["b"]}</div></div>')
    elif t == "sol":
        shot = (HERE / "assets" / f'{c["shot"]}.jpg').as_uri()
        main = (head(64, 170) + f'<div class="abs" style="left:64px;top:420px;width:952px;height:588px;border-radius:22px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.25),0 0 0 6px #fff">'
                f'<img src="{shot}" style="width:100%;height:100%;object-fit:cover;object-position:left top"></div>'
                f'<div class="abs" data-rank="3" style="left:64px;top:1040px;width:900px;font-size:34px;font-weight:700;line-height:1.3;color:{ink}">{s["b"]}</div>')
    else:  # cta
        price = (f'<div class="abs" style="left:64px;top:520px;width:952px;padding:26px 32px;border-radius:22px;background:{card};border:2px solid {acc}">'
                 f'<span data-rank="3" style="font-size:36px;font-weight:700;color:{ink}">{s["price"]}</span></div>' if s.get("price") else "")
        main = (head(80, 220) + price
                + f'<div class="abs" data-rank="3" style="left:64px;top:{700 if s.get("price") else 600}px;font-size:38px;font-weight:700;color:{acc}">🔖 {s["save"]}</div>'
                + cta(64, 860, fs=40, stack=True, gap=22, dark=dark))
    foot = (f'<div class="abs" style="left:64px;bottom:44px;display:flex;align-items:center;gap:12px"><img src="{LOGO}" style="width:44px;height:44px">'
            f'<span data-rank="4" style="font-size:28px;font-weight:700;color:{ink}">fansachat.com</span></div>')
    return f'<body style="background:{bg};color:{ink}">{bleed}{top}{main}{arrow}{foot}</body>'

allowed = {str(k): list(range(18, 400)) for k in range(1, 6)}
SMALL = """() => [...document.querySelectorAll('[data-rank]')].filter(e => parseFloat(getComputedStyle(e).fontSize) < (+e.dataset.rank === 5 ? 20 : 28))
  .map(e => `too small ${getComputedStyle(e).fontSize}: "${e.textContent.trim().slice(0,24)}"`)"""
lines = []
with sync_playwright() as pw:
    br = pw.chromium.launch(channel=os.environ.get("PW_CHANNEL") or None)
    pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    for c in DATA:
        for n, s in enumerate(c["s"], 1):
            name = f'{c["file"]}-{n}'; f = OUT / f"{name}.html"
            f.write_text(f"<!doctype html><html><head><meta charset=utf-8><style>{CSS}</style></head>{slide(c, n, s)}</html>", encoding="utf-8")
            pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(250)
            pg.screenshot(path=str(OUT / f"{name}.png")); r = pg.evaluate(QA, [24, allowed, W, H]); iss = r["issues"] + pg.evaluate(SMALL); f.unlink()
            lines.append(f'{name}: {"PASS" if not iss else "FAIL " + "; ".join(iss)}')
    br.close()
txt = "\n".join(lines); print(txt); (HERE / "out" / "QA_car.txt").write_text(txt, encoding="utf-8")
