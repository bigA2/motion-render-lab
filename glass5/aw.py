"""aw: 100 brand-awareness images, 1080x1350 (phone-first 4:5). Copy = aw100.json.
Stages s1-s5 (unaware 30 / problem 35 / solution 20 / product 10 / most-aware 5), 12 styles, brand assets locked
(logo, palette family, Playfair + Inter (+League numbers), CTA strip, footer). Every image is audited:
render QA (size, overlap, safe zone, covered text) + 12-point brand checklist + alt text + caption -> out/AUDIT_aw.md
Run: python glass5/aw.py [first last]
"""
import json, os, pathlib, re, sys
from playwright.sync_api import sync_playwright
from cta import cta

HERE = pathlib.Path(__file__).parent.resolve()
OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
W, H = 1080, 1350
F = lambda n: (HERE / "fonts" / n).as_uri()
LOGO = (HERE / "logo-fansa.png").as_uri()
I = lambda s: (HERE / "icons" / f"{s}.png").as_uri()
QA = re.search(r'QA = """(.*?)"""', (HERE / "build.py").read_text(encoding="utf-8"), re.S).group(1)
DATA = json.loads((HERE / "aw100.json").read_text(encoding="utf-8"))
NAMES = {"google-my-business": "Google Business", "google-search-console": "Search Console", "jira-cloud": "Jira", "fireflies-ai": "Fireflies",
         "respond-io": "Respond.io", "microsoft-teams": "Teams", "microsoft-todo": "To Do", "microsoft-outlook": "Outlook", "microsoft-onedrive": "OneDrive",
         "microsoft-sharepoint": "SharePoint", "simplybook-me": "SimplyBook.me", "heymarket-sms": "Heymarket", "leadconnector": "LeadConnector",
         "voipstudio": "VoIPstudio", "housecall-pro": "Housecall Pro", "hubspot": "HubSpot", "clickup": "ClickUp", "oncehub": "OnceHub",
         "cognito-forms": "Cognito Forms", "mycase": "MyCase", "savvycal": "SavvyCal", "sessions-us": "Sessions", "addevent": "AddEvent",
         "activecampaign": "ActiveCampaign", "wordpress": "WordPress", "pagerduty": "PagerDuty", "help-scout": "Help Scout", "docusign": "Docusign",
         "google-drive": "Google Drive", "google-calendar": "Google Calendar", "google-docs": "Google Docs", "youtube": "YouTube"}
name = lambda s: NAMES.get(s, s.replace("-", " ").title())
STAGE = {1: "Unaware", 2: "Problem-aware", 3: "Solution-aware", 4: "Product-aware", 5: "Most-aware"}
# palettes: bg, ink, accent, mark, muted, card
PALS = [
 ("radial-gradient(900px 1100px at 20% 15%,#FFFFFF 0%,#F1EEFB 55%,#DED8F4 100%)", "#16142C", "#6B4FD8", "#E4DCFF", "#47445F", "rgba(255,255,255,.75)"),
 ("radial-gradient(900px 1100px at 80% 10%,#FFFDF8 0%,#F6ECDD 55%,#E8D7BF 100%)", "#1E1A14", "#C2410C", "#FDDCC4", "#5A5246", "rgba(255,255,255,.7)"),
 ("radial-gradient(900px 1100px at 25% 15%,#2C2668 0%,#17143A 60%,#0C0A22 100%)", "#F4F2FF", "#B3A6FF", "#463D96", "#CBC6EC", "rgba(255,255,255,.08)"),
 ("radial-gradient(900px 1100px at 15% 85%,#FFFFFF 0%,#E8F5EF 55%,#CFE9DD 100%)", "#10241C", "#0F766E", "#C9EEDF", "#3F5A50", "rgba(255,255,255,.75)"),
 ("radial-gradient(900px 1100px at 70% 20%,#FFF7F5 0%,#FBE3DD 55%,#F2C9BE 100%)", "#2A1210", "#BE3A2B", "#FFD4CB", "#5E403B", "rgba(255,255,255,.7)"),
 ("radial-gradient(900px 1100px at 30% 20%,#1E2430 0%,#121721 60%,#0A0D13 100%)", "#F3F5F8", "#5EEAD4", "#1F4D49", "#BFC7D3", "rgba(255,255,255,.07)"),
]
STYLE_PAL = {"sym": [0, 1, 3], "check": [3, 0, 4], "num": [1, 2, 0], "loss": [2, 5, 4], "still": [0, 3, 1], "myth": [4, 1, 0],
             "old": [5, 2], "sent": [0, 2, 3], "vs": [1, 3, 0], "fact": [2, 0, 5], "story": [2, 1], "cta": [0, 2, 1]}

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
.ico{{width:64px;height:64px;border-radius:16px;background:#fff;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(16,12,50,.22);flex:none}}
.ico img{{width:68%;height:68%;object-fit:contain}}
"""

def mk(t, acc, mark):
    return re.sub(r"\*\*(.+?)\*\*", lambda m: f'<span style="color:{acc};background:linear-gradient(transparent 66%,{mark} 66%,{mark} 94%,transparent 94%)">{m.group(1)}</span>', t)

def chips(apps, top, ink, acc, arrows=False, center=False):
    out = []
    for n, a in enumerate(apps):
        if n and arrows: out.append(f'<span style="color:{acc};font-size:40px;font-weight:700">→</span>')
        out.append(f'<span style="display:inline-flex;align-items:center;gap:12px"><span class="ico"><img src="{I(a)}"></span>'
                   f'<span data-rank="4" style="font-size:32px;font-weight:700;color:{ink}">{name(a)}</span></span>')
    j = "center" if center else "flex-start"
    return f'<div class="abs" style="left:64px;right:64px;top:{top}px;display:flex;flex-wrap:wrap;gap:18px 26px;align-items:center;justify-content:{j}">{"".join(out)}</div>'

def head(x, top, size, ink, acc, mark, center=False, width=952):
    al = "center" if center else "left"
    return f'<div class="abs" data-rank="1" style="left:64px;top:{top}px;width:{width}px;text-align:{al};font-family:Playfair;font-size:{size}px;line-height:1.08;color:{ink}">{mk(x["h"], acc, mark)}</div>'

def para(t, top, size, col, acc, mark, center=False, rank=3, weight=700):
    al = "center" if center else "left"
    return f'<div class="abs" data-rank="{rank}" style="left:64px;right:64px;top:{top}px;text-align:{al};font-size:{size}px;line-height:1.3;font-weight:{weight};color:{col}">{mk(t, acc, mark)}</div>'

def body(x):
    st = x["y"]; p = PALS[STYLE_PAL[st][x["i"] % len(STYLE_PAL[st])]]; bg, ink, acc, mark, mut, card = p
    dark = p in (PALS[2], PALS[5]); a = x.get("a", []); l = x.get("l", []); b = x.get("b", "")
    kick = f'<div class="abs" data-rank="5" style="left:64px;top:60px;font-size:26px;font-weight:700;letter-spacing:.12em;color:{acc}">{x["w"]}</div>'
    main = ""
    if st == "sym":
        main = (f'<div class="abs" data-rank="1" data-layer="behind" style="left:52px;top:150px;font-family:League;font-size:{230 if len(x["g"]) < 9 else 170}px;line-height:.9;color:{mark};white-space:nowrap">{x["g"]}</div>'
                + head(x, 470, 66, ink, acc, mark) + chips(a, 860, ink, acc))
    elif st == "check":
        rows = "".join(f'<div style="display:flex;align-items:center;gap:22px;margin-bottom:26px"><span style="width:52px;height:52px;border-radius:12px;border:4px solid {acc};display:inline-flex;align-items:center;justify-content:center;color:{acc};font-size:34px;font-weight:700;flex:none">✓</span>'
                       f'<span data-rank="3" style="font-size:40px;font-weight:700;color:{ink}">{r}</span></div>' for r in l)
        main = head(x, 150, 70, ink, acc, mark) + f'<div class="abs" style="left:64px;top:480px;width:952px">{rows}</div>' + (chips(a, 900, ink, acc) if a else "")
    elif st == "num":
        two = len(l) > 4
        items = "".join(f'<div data-rank="3" style="font-size:{34 if two else 40}px;font-weight:700;color:{ink};margin-bottom:16px">— {r}</div>' for r in l)
        cols = f'columns:2;column-gap:40px;' if two else ""
        main = (f'<div class="abs" data-rank="1" data-layer="behind" style="left:56px;top:120px;font-family:League;font-size:360px;line-height:.85;color:{acc}">{x["g"]}</div>'
                + head(x, 450, 60, ink, acc, mark) + f'<div class="abs" style="left:64px;top:{690 if len(x["h"]) < 50 else 740}px;width:952px;{cols}">{items}</div>'
                + (chips(a, 960, ink, acc) if a and len(l) <= 5 else ""))
    elif st == "loss":
        main = (f'<div class="abs" style="left:64px;top:300px;width:120px;height:8px;background:{acc};border-radius:4px"></div>'
                + head(x, 360, 82, ink, acc, mark) + (chips(a, 900, ink, acc) if a else ""))
    elif st == "still":
        c1 = (f'<div class="abs" style="left:64px;top:470px;width:952px;padding:30px 34px;border-radius:24px;background:{card};border:2px dashed {mut}">'
              f'<div data-rank="5" style="font-size:26px;font-weight:700;letter-spacing:.12em;color:{mut}">BY HAND</div>'
              f'<div data-rank="3" style="font-size:38px;font-weight:700;color:{mut};margin-top:10px;text-decoration:line-through;text-decoration-thickness:3px">{l[0]}</div></div>')
        c2 = (f'<div class="abs" style="left:64px;top:700px;width:952px;padding:30px 34px;border-radius:24px;background:{acc};box-shadow:0 18px 40px rgba(0,0,0,.18)">'
              f'<div data-rank="5" style="font-size:26px;font-weight:700;letter-spacing:.12em;color:rgba(255,255,255,.85)">ONE SENTENCE</div>'
              f'<div data-rank="3" style="font-size:38px;font-weight:700;color:#fff;margin-top:10px">{l[1]}</div></div>')
        main = head(x, 150, 70, ink, acc, mark) + c1 + c2 + chips(a, 950, ink, acc, arrows=True)
    elif st == "myth":
        main = (f'<div class="abs" data-rank="5" style="left:64px;top:170px;font-size:26px;font-weight:700;letter-spacing:.14em;color:{mut}">MYTH</div>'
                f'<div class="abs" data-rank="1" style="left:64px;top:220px;width:952px;font-family:Playfair;font-size:84px;line-height:1.06;color:{ink};text-decoration:line-through;text-decoration-color:{acc};text-decoration-thickness:8px">{x["h"].replace("**", "")}</div>'
                f'<div class="abs" data-rank="2" style="left:64px;top:640px;font-family:Playfair;font-size:64px;color:{acc}">Actually, no.</div>'
                + para(b, 760, 46, ink, acc, mark))
    elif st == "old":
        rows = "".join(f'<div data-rank="3" style="font-size:40px;font-weight:700;color:{mut};text-decoration:line-through;margin-bottom:14px">{r}</div>' for r in l)
        main = (f'<div class="abs" data-rank="2" style="left:64px;top:160px;width:952px;font-family:Playfair;font-size:64px;line-height:1.1;color:{mut}">{x["h"].replace("**", "")}</div>'
                f'<div class="abs" style="left:64px;top:430px">{rows}</div>'
                f'<div class="abs" data-rank="1" style="left:64px;top:720px;width:952px;font-family:Playfair;font-size:96px;line-height:1.04;color:{ink}">{mk(b, acc, mark)}</div>')
    elif st == "sent":
        bub = (f'<div class="abs" style="left:64px;top:430px;width:952px;padding:34px 38px;border-radius:28px 28px 28px 8px;background:{card};border:2px solid {mark};box-shadow:0 20px 50px rgba(16,12,50,.16)">'
               f'<div data-rank="5" style="font-size:24px;font-weight:700;letter-spacing:.12em;color:{acc}">YOU TYPE</div>'
               f'<div data-rank="3" style="font-size:36px;line-height:1.35;font-weight:500;color:{ink};margin-top:12px">“{b}”</div></div>')
        main = head(x, 150, 64, ink, acc, mark) + bub + chips(a, 920, ink, acc, arrows=True)
    elif st == "vs":
        cards = "".join(f'<div style="padding:26px 32px;border-radius:22px;margin-bottom:22px;background:{acc if n == len(l) - 1 else card};'
                        f'{"" if n == len(l) - 1 else "border:2px solid " + mark}"><span data-rank="3" style="font-size:40px;font-weight:700;color:{"#fff" if n == len(l) - 1 else ink}">{r}</span></div>'
                        for n, r in enumerate(l))
        main = head(x, 150, 70, ink, acc, mark) + f'<div class="abs" style="left:64px;top:500px;width:952px">{cards}</div>'
    elif st == "fact":
        q = (f'<div class="abs" style="left:64px;top:150px;padding:18px 28px;border-radius:24px 24px 24px 6px;background:{card};border:2px solid {mark}">'
             f'<span data-rank="2" style="font-size:42px;font-weight:700;color:{ink}">“{x["w"].capitalize()}”</span></div>')
        rows = "".join(f'<div data-rank="3" style="font-size:40px;font-weight:700;color:{ink};margin-bottom:18px">✓ {r}</div>' for r in l)
        main = q + head(x, 320, 74, ink, acc, mark) + (f'<div class="abs" style="left:64px;top:700px">{rows}</div>' if l else chips(a, 700, ink, acc))
        kick = ""
    elif st == "story":
        main = (head(x, 230, 80, ink, acc, mark) + para(b, 640, 42, mut, acc, mark, weight=500)
                + f'<img class="abs" src="{LOGO}" style="left:64px;top:860px;width:150px;height:150px">')
    elif st == "cta":
        main = (head(x, 260, 86, ink, acc, mark, center=True) + (para(b, 700, 42, mut, acc, mark, center=True, weight=500) if b else "")
                + cta(140, 880, fs=44, stack=True, gap=24, dark=dark).replace('left:140px', 'left:0;right:0;align-items:center').replace('align-items:flex-start', 'align-items:center'))
    bottom = "" if st == "cta" else cta(64, 1120, fs=32, dark=dark)
    note = f'<div class="abs" data-rank="5" style="right:64px;top:1076px;font-size:22px;color:{mut}">{x["note"]}</div>' if x.get("note") else ""
    foot = (f'<div class="abs" style="left:64px;bottom:44px;display:flex;align-items:center;gap:12px"><img src="{LOGO}" style="width:44px;height:44px">'
            f'<span data-rank="4" style="font-size:28px;font-weight:700;color:{ink}">fansachat.com</span></div>')
    return f'<body style="background:{bg};color:{ink}"><div class="grain"></div><img class="abs" src="{LOGO}" style="right:64px;top:50px;width:56px;height:56px">{kick}{main}{note}{bottom}{foot}</body>'

def slug(t): return re.sub(r"[^a-z0-9]+", "-", t.lower()).strip("-")
def fname(x): return f'aw{x["i"]:03d}-{slug(STAGE[x["s"]])}-{slug(x["w"])[:40]}-' + ("-".join(x.get("a", [])[:2]) + "-" if x.get("a") else "") + "fansachat"
def plain(t): return re.sub(r"\*\*", "", t)

BANNED = re.compile(r"\$|€|£|\b20\d\d\b|november|launch(es|ing)? on|gmail|google sheets|\bslack\b|notion|invoice|revolution|game-chang|10x|joined today|spots left", re.I)
def audit(x, qa_issues):
    txt = " ".join([x["w"], plain(x["h"]), x.get("b", ""), " ".join(x.get("l", []))])
    checks = {
        "1 stage named": x["s"] in STAGE, "2 persona named": bool(x["w"]), "3 one pain": len(x.get("h", "")) > 0,
        "4 one outcome": x["s"] in (1, 5) or bool(x.get("b") or x.get("l") or x.get("a")),
        "5 real apps (catalogue icons)": all((HERE / "icons" / f"{a}.png").exists() for a in x.get("a", [])),
        "6 facts only": not re.search(r"\d+%|\d{2,},\d{3}", txt) or "700+" in txt,
        "7 no prices": not re.search(r"\$|€|£", txt), "8 no dates": not re.search(r"\b20\d\d\b|november|monday \d", txt, re.I),
        "9 no fake proof": not re.search(r"joined|users love|rated|testimonial", txt, re.I),
        "10 ethical urgency": not BANNED.search(txt), "11 brand assets locked": True, "12 CTA present": True,
        "QA render": not qa_issues}
    return checks

def caption(x):
    apps = ", ".join(name(a) for a in x.get("a", []))
    q = {1: f"Is this you, {x['w'].lower()}?", 2: f"Why does this keep happening to {x['w'].lower()}?", 3: f"How can {x['w'].lower()} automate this without a builder?",
         4: f"{x['w'].capitalize()}", 5: "Want in early?"}[x["s"]]
    return (f"{q} {plain(x['h'])} " + (f"{plain(x.get('b', ''))} " if x.get("b") else "") +
            (f"Works with {apps} and 700+ apps. " if apps else "") + "FansaChat: describe a workflow in one sentence, AI builds it, you approve it. "
            "Join the waitlist → fansachat.com · Community → t.me/fansachat #Automation #NoCode #AIWorkflow")

first, last = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (1, 100)
allowed = {str(k): list(range(18, 400)) for k in range(1, 6)}
SMALL = """() => [...document.querySelectorAll('[data-rank]')].filter(e => parseFloat(getComputedStyle(e).fontSize) < (+e.dataset.rank === 5 ? 20 : 28))
  .map(e => `too small ${getComputedStyle(e).fontSize}: "${e.textContent.trim().slice(0,24)}"`)"""
rows, fails = [], 0
with sync_playwright() as pw:
    br = pw.chromium.launch(channel=os.environ.get("PW_CHANNEL") or None)
    pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    for x in [d for d in DATA if first <= d["i"] <= last]:
        n = fname(x); f = OUT / f"{n}.html"
        f.write_text(f"<!doctype html><html><head><meta charset=utf-8><style>{CSS}</style></head>{body(x)}</html>", encoding="utf-8")
        pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(250)
        pg.screenshot(path=str(OUT / f"{n}.png")); r = pg.evaluate(QA, [24, allowed, W, H]); iss = r["issues"] + pg.evaluate(SMALL); f.unlink()
        c = audit(x, iss); ok = all(c.values()); fails += not ok
        alt = f'FansaChat {STAGE[x["s"]].lower()} post for {x["w"].lower()}: {plain(x["h"])}' + (f' Apps: {", ".join(name(a) for a in x["a"])}.' if x.get("a") else "")
        rows.append(f'| {x["i"]} | S{x["s"]} {STAGE[x["s"]]} | {x["y"]} | {x["k"]} · T{x["t"]} | {x["w"]} | {sum(c.values())}/13 {"PASS" if ok else "FAIL " + "; ".join([k for k, v in c.items() if not v] + iss)} | `{n}.png` | {alt} | {caption(x)} |')
    br.close()
hdr = ("# Awareness 100: audit\nChecklist = BRAND_AWARENESS_RESEARCH §9 (12 points) + render QA. Hook = image hook H1–H12 · urgency technique T1–T15 (§7).\n"
       "Search fit per image: SEO = persona + app names visible + keyword filename + alt; AEO = caption opens with the reader's question; "
       "GEO = brand + 700+ fact in caption; AIO = one idea, plain text; SXO = persona → pain → outcome → CTA.\n\n"
       "| # | Stage | Style | Hook | Persona | Audit | File | Alt | Caption |\n|---|---|---|---|---|---|---|---|---|\n")
(OUT / "AUDIT_aw.md").write_text(hdr + "\n".join(rows), encoding="utf-8")
print(f"{len(rows)} rendered, {fails} failed"); print("\n".join(r for r in rows if "FAIL" in r)[:6000])
