"""month: 30-day Instagram carousel month (13 Team, 13 Scale, 4 Individual). Copy = month/team.json, scale.json, ind.json.
Founder framework: hook -> obstacles (indirect) -> implied cost -> "here's how we remove it" + their sentence -> team/department map
-> one lane zoom (flow or real screenshot) -> CTA (price only where it fits). Every carousel gets its OWN theme:
palette (30, warm-led), background pattern (8) and font pair (10). 1080x1350.
Run: python glass5/month.py [id,id,...] -> glass5/out/month/<day>-<id>-<file>-<n>.png + out/month/QA_month.txt
"""
import colorsys, json, os, pathlib, re, sys
from playwright.sync_api import sync_playwright
from cta import cta

HERE = pathlib.Path(__file__).parent.resolve()
OUT = HERE / "out" / "month"; OUT.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1350
F = lambda n: (HERE / "fonts" / n).as_uri()
LOGO = (HERE / "logo-fansa.png").as_uri()
QA = re.search(r'QA = """(.*?)"""', (HERE / "build.py").read_text(encoding="utf-8"), re.S).group(1)
DATA = sorted(sum((json.loads((HERE / "month" / f).read_text(encoding="utf-8")) for f in ("team.json", "scale.json", "ind.json")), []), key=lambda c: c["day"])
ICON = lambda a: LOGO if a == "fansa" else next((HERE / "icons" / f"{a}.{e}").as_uri() for e in ("png", "svg") if (HERE / "icons" / f"{a}.{e}").exists())

# font pairs: (headline font file, size factor, body bold, body regular)
FONTS = [("PlayfairDisplay-700", 1.0, "InterTight-700", "InterTight-500"), ("Fraunces-600", 1.0, "Manrope-700", "Manrope-500"),
         ("DMSerifDisplay-400", 1.02, "SpaceGrotesk-700", "SpaceGrotesk-500"), ("InstrumentSerif-400", 1.12, "Sora-700", "Sora-400"),
         ("CormorantGaramond-600", 1.1, "Montserrat-500", "Montserrat-500"), ("Anton-400", .9, "InterTight-700", "InterTight-500"),
         ("BebasNeue-400", 1.05, "Manrope-700", "Manrope-500"), ("Oswald-700", .9, "Sora-700", "Sora-400"),
         ("BigShouldersDisplay-800", .95, "SpaceGrotesk-700", "SpaceGrotesk-500"), ("Sora-700", .9, "InterTight-700", "InterTight-500")]
HUES = [14, 28, 38, 352, 6, 22, 45, 330, 18, 160, 32, 10, 200, 48, 24]  # warm-led, a few cool for contrast

def hsl(h, s, l, a=1):
    r, g, b = colorsys.hls_to_rgb(h / 360, l / 100, s / 100); return f"rgba({round(r*255)},{round(g*255)},{round(b*255)},{a})"

def theme(k):
    h = HUES[k % 15]; dark = (k // 15 + k) % 3 == 2; fp = FONTS[(k * 3) % 10]; pat = k % 8
    if dark:
        bg1, bg2, ink, acc, mut = hsl(h, 45, 16), hsl(h, 50, 7), hsl(h, 30, 96), hsl((h + 20) % 360, 85, 68), hsl(h, 20, 78)
        card = "rgba(255,255,255,.08)"
    else:
        bg1, bg2, ink, acc, mut = hsl(h, 70, 97), hsl(h, 55, 86), hsl(h, 45, 11), hsl(h, 75, 40), hsl(h, 20, 32)
        card = "rgba(255,255,255,.78)"
    mark = hsl((h + 20) % 360 if dark else h, 80, 60 if dark else 82, .55 if dark else .9)
    line = hsl(h, 40, 50, .14)
    PAT = ["none", f"radial-gradient({line} 2px, transparent 2.5px) 0 0/34px 34px",
           f"repeating-linear-gradient(135deg,{line} 0 2px,transparent 2px 26px)",
           f"radial-gradient(420px 420px at 88% 18%,{mark},transparent 70%),radial-gradient(360px 360px at 8% 92%,{mark},transparent 70%)",
           f"repeating-linear-gradient(0deg,{line} 0 1px,transparent 1px 54px)",
           f"linear-gradient({line} 1px,transparent 1px) 0 0/60px 60px,linear-gradient(90deg,{line} 1px,transparent 1px) 0 0/60px 60px",
           f"repeating-radial-gradient(circle at 100% 0%,{line} 0 2px,transparent 2px 46px)",
           f"linear-gradient(180deg,{mark} 0 34%,transparent 34%)"][pat]
    bg = (PAT + "," if PAT != "none" else "") + f"linear-gradient(165deg,{bg1} 0%,{bg2} 100%)"
    return dict(bg=bg, ink=ink, acc=acc, mut=mut, mark=mark, card=card, dark=dark, hf=fp[0], hk=fp[1], bb=fp[2], br=fp[3], center=k % 4 == 3)

def css(t):
    return (f"@font-face{{font-family:HF;src:url({F(t['hf'] + '.woff2')})}}@font-face{{font-family:BB;src:url({F(t['bb'] + '.woff2')})}}"
            f"@font-face{{font-family:BR;src:url({F(t['br'] + '.woff2')})}}"
            "*{box-sizing:border-box;margin:0;padding:0}body{width:100vw;height:100vh;overflow:hidden;position:relative;font-family:BR}.abs{position:absolute}"
            "b,.b{font-family:BB;font-weight:700}")

mk = lambda s, T: re.sub(r"\*\*(.+?)\*\*", lambda m: f'<span style="color:{T["acc"]};background:linear-gradient(transparent 64%,{T["mark"]} 64%,{T["mark"]} 94%,transparent 94%)">{m.group(1)}</span>', s)

def slide(c, n, s, T):
    N = len(c["s"]); t = s["t"]; ink, acc, mut, card = T["ink"], T["acc"], T["mut"], T["card"]
    al = "center" if T["center"] and t in ("hook", "cta") else "left"
    head = lambda size, tp: (f'<div class="abs" data-rank="1" style="left:64px;top:{tp}px;width:952px;text-align:{al};font-family:HF;'
                             f'font-size:{round(size * T["hk"])}px;line-height:1.08;color:{ink}">{mk(s["h"], T)}</div>')
    bleed = (f'<div class="abs" style="left:{W - 90}px;top:{300 + n * 70}px;width:180px;height:180px;border-radius:50%;background:{T["mark"]}"></div>' if n < N else "")
    bleed += (f'<div class="abs" style="left:-90px;top:{300 + (n - 1) * 70}px;width:180px;height:180px;border-radius:50%;background:{T["mark"]}"></div>' if n > 1 else "")
    top = (f'<div class="abs b" data-rank="5" style="left:64px;top:60px;font-size:26px;letter-spacing:.12em;color:{acc}">{c["who"]}</div>'
           f'<img class="abs" src="{LOGO}" style="right:64px;top:50px;width:56px;height:56px">'
           f'<div class="abs b" data-rank="5" style="right:64px;top:118px;font-size:24px;color:{mut}">{n}/{N}</div>')
    arrow = (f'<div class="abs" style="right:40px;top:1150px;width:84px;height:84px;border-radius:50%;background:{acc};display:flex;align-items:center;justify-content:center">'
             f'<span style="color:{"#111" if T["dark"] else "#fff"};font-size:46px;font-weight:700;line-height:1">→</span></div>' if n < N else "")
    marks = ["1", "2", "3", "4"] if t == "obst" else ["✕", "✕", "✕", "✕"]
    rows = lambda items, tp: (f'<div class="abs" style="left:64px;top:{tp}px;width:900px">' + "".join(
        f'<div style="display:flex;gap:22px;align-items:flex-start;margin-bottom:30px"><span class="b" style="flex:none;width:54px;height:54px;border-radius:{14 if t == "obst" else 27}px;'
        f'background:{acc};color:{"#111" if T["dark"] else "#fff"};font-size:30px;display:flex;align-items:center;justify-content:center">{marks[i]}</span>'
        f'<span class="b" data-rank="3" style="font-size:42px;line-height:1.2;color:{ink};padding-top:2px">{r}</span></div>' for i, r in enumerate(items)) + "</div>")
    chip = lambda a, sz=56: (f'<span style="width:{sz}px;height:{sz}px;border-radius:14px;background:#fff;display:inline-flex;align-items:center;justify-content:center;'
                             f'box-shadow:0 3px 10px rgba(0,0,0,.18);flex:none"><img src="{ICON(a)}" style="width:68%;height:68%;object-fit:contain"></span>')
    arr = f'<span class="b" style="color:{acc};font-size:30px;margin:0 4px">→</span>'
    if t == "hook":
        main = head(88, 240) + f'<div class="abs b" data-rank="2" style="left:64px;top:900px;width:952px;text-align:{al};font-size:44px;color:{acc}">{s["b"]}</div>'
    elif t in ("obst", "cost"):
        main = head(72, 200) + rows(s["l"], 580)
    elif t == "intro":
        main = (head(80, 220) + f'<div class="abs" style="left:64px;top:620px;width:952px;padding:36px 40px;border-radius:28px 28px 28px 8px;background:{card};border:2px solid {T["mark"]}">'
                f'<div style="display:flex;align-items:center;gap:12px"><img src="{LOGO}" style="width:36px;height:36px"><span class="b" data-rank="5" style="font-size:24px;letter-spacing:.12em;color:{acc}">{s["lab"]}</span></div>'
                f'<div data-rank="3" style="font-size:40px;line-height:1.35;color:{ink};margin-top:14px">“{s["b"]}”</div></div>')
    elif t == "team":
        L = s["lanes"]; gap = 136 if len(L) > 4 else 160; lanes = ""
        for k, ln in enumerate(L):
            y = 470 + k * gap
            lanes += (f'<div class="abs" style="left:64px;top:{y}px;width:800px"><div class="b" data-rank="4" style="font-size:28px;letter-spacing:.08em;color:{acc}">{ln["role"]}</div>'
                      f'<div style="display:flex;align-items:center;gap:14px;margin-top:8px"><span style="display:flex;align-items:center">{arr.join(chip(a) for a in ln["apps"])}</span>'
                      f'<span class="b" data-rank="4" style="font-size:28px;color:{ink};line-height:1.15">{ln["out"]}</span></div></div>'
                      f'<div class="abs" style="left:870px;top:{y + 66}px;width:70px;border-top:3px dotted {acc}"></div>')
        main = (head(66, 170) + lanes + f'<div class="abs" style="left:944px;top:470px;width:76px;height:{len(L) * gap - 30}px;border-radius:20px;background:{acc};display:flex;align-items:center;justify-content:center">'
                f'<span class="b" data-rank="5" style="writing-mode:vertical-rl;transform:rotate(180deg);color:{"#111" if T["dark"] else "#fff"};font-size:26px;letter-spacing:.1em">SHARED TABLE</span></div>'
                f'<div class="abs" data-rank="5" style="left:64px;top:{470 + len(L) * gap}px;width:860px;font-size:22px;color:{mut}">{s["legend"]}</div>')
    elif t == "flow":
        main = (head(72, 200) + f'<div class="abs" style="left:64px;top:560px;width:952px;display:flex;flex-wrap:wrap;align-items:center;gap:14px 6px">{arr.join(chip(a, 96) for a in s["apps"])}</div>'
                + f'<div class="abs b" data-rank="3" style="left:64px;top:760px;width:952px;font-size:40px;line-height:1.3;color:{ink}">{s["b"]}</div>')
    elif t == "sol":
        main = (head(64, 170) + f'<div class="abs" style="left:64px;top:420px;width:952px;height:588px;border-radius:22px;overflow:hidden;box-shadow:0 30px 60px rgba(0,0,0,.25),0 0 0 6px #fff">'
                f'<img src="{(HERE / "assets" / (c["shot"] + ".jpg")).as_uri()}" style="width:100%;height:100%;object-fit:cover;object-position:left top"></div>'
                f'<div class="abs b" data-rank="3" style="left:64px;top:1040px;width:900px;font-size:34px;line-height:1.3;color:{ink}">{s["b"]}</div>')
    else:  # cta
        p = s.get("price")
        price = (f'<div class="abs" style="left:64px;top:520px;width:952px;padding:26px 32px;border-radius:22px;background:{card};border:2px solid {acc}">'
                 f'<span class="b" data-rank="3" style="font-size:36px;color:{ink}">{p}</span></div>' if p else "")
        main = (head(80, 220) + price + f'<div class="abs b" data-rank="3" style="left:64px;top:{700 if p else 600}px;width:952px;text-align:{al};font-size:38px;color:{acc}">🔖 {s["save"]}</div>'
                + cta(64, 860, fs=40, stack=True, gap=22, dark=T["dark"]))
    foot = (f'<div class="abs" style="left:64px;bottom:44px;display:flex;align-items:center;gap:12px"><img src="{LOGO}" style="width:44px;height:44px">'
            f'<span class="b" data-rank="4" style="font-size:28px;color:{ink}">fansachat.com</span></div>')
    return f'<body style="background:{T["bg"]};color:{ink}">{bleed}{top}{main}{arrow}{foot}</body>'

ONLY = set(sys.argv[1].split(",")) if len(sys.argv) > 1 else None
allowed = {str(k): list(range(18, 400)) for k in range(1, 6)}
SMALL = """() => [...document.querySelectorAll('[data-rank]')].filter(e => parseFloat(getComputedStyle(e).fontSize) < (+e.dataset.rank === 5 ? 20 : 28))
  .map(e => `too small ${getComputedStyle(e).fontSize}: "${e.textContent.trim().slice(0,24)}"`)"""
lines, plan = [], []
with sync_playwright() as pw:
    br = pw.chromium.launch(channel=os.environ.get("PW_CHANNEL") or None)
    pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    for k, c in enumerate(DATA):
        T = theme(k); plan.append(f'| {c["day"]} | {c["tier"]} | {c["who"]} | {c["s"][0]["h"].replace("**", "")} | {T["hf"]} + {T["bb"]} | {"dark" if T["dark"] else "light"} hue {HUES[k % 15]} pattern {k % 8} |')
        if ONLY and c["id"] not in ONLY: continue
        for n, s in enumerate(c["s"], 1):
            name = f'{c["day"]:02d}-{c["id"]}-{c["file"]}-{n}'; f = OUT / f"{name}.html"
            f.write_text(f"<!doctype html><html><head><meta charset=utf-8><style>{css(T)}</style></head>{slide(c, n, s, T)}</html>", encoding="utf-8")
            pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(200)
            pg.screenshot(path=str(OUT / f"{name}.png")); r = pg.evaluate(QA, [24, allowed, W, H]); iss = r["issues"] + pg.evaluate(SMALL); f.unlink()
            lines.append(f'{name}: {"PASS" if not iss else "FAIL " + "; ".join(iss)}')
    br.close()
(OUT / "QA_month.txt").write_text("\n".join(lines), encoding="utf-8")
(OUT / "PLAN_month.md").write_text("| Day | Tier | Reader | Hook | Fonts | Theme |\n|---|---|---|---|---|---|\n" + "\n".join(plan), encoding="utf-8")
print(f"{len(lines)} slides, {sum('FAIL' in l for l in lines)} failed"); print("\n".join(l for l in lines if "FAIL" in l)[:5000])
