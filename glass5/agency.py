"""agency: C02 "3 jobs your agency still does by hand" - founder's sneaker-blueprint campaign prompt adapted to FansaChat. 1600x900.
Script + audit: fansa-knowledge/raw/image_research/scripts/C02_agency_3_jobs.md. Hero = REAL builder screenshot (assets/).
Run: python glass5/agency.py -> glass5/out/<name>.png + QA (reuses the QA from build.py)
"""
import os, pathlib, re
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent.resolve()
OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
W, H = 1600, 900
F = lambda n: (HERE / "fonts" / n).as_uri()
I = lambda s: (HERE / "logo-fansa.png").as_uri() if s == 'fansa' else (HERE / "icons" / f"{s}.png").as_uri()
LOGO = (HERE / "logo-fansa.png").as_uri()
SHOT = (HERE / "assets" / "real_builder_agency_p1.jpg").as_uri()
VIO, MAIN, DEEP, INK, BP, BP2 = "#7B5CE0", "#6468D8", "#2B2266", "#16162A", "#2E2A7A", "#4B44B8"
QA = re.search(r'QA = """(.*?)"""', (HERE / "build.py").read_text(encoding="utf-8"), re.S).group(1)

CSS = f"""
@font-face{{font-family:Playfair;src:url({F('PlayfairDisplay-700.woff2')})}}
@font-face{{font-family:League;src:url({F('LeagueGothic-400.woff2')})}}
@font-face{{font-family:Inter;font-weight:500;src:url({F('InterTight-500.woff2')})}}
@font-face{{font-family:Inter;font-weight:700;src:url({F('InterTight-700.woff2')})}}
@font-face{{font-family:Mono;src:url({F('JetBrainsMono-500.woff2')})}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:100vw;height:100vh;overflow:hidden;position:relative;font-family:Inter;font-weight:500;color:{INK};
  background:radial-gradient(1000px 700px at 30% 30%,#FFFFFF 0%,#F0F0F6 55%,#E2E3EE 100%)}}
.abs{{position:absolute}}
.grain{{position:absolute;inset:0;pointer-events:none;opacity:.12;mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}}
.app{{width:30px;height:30px;border-radius:8px;background:#fff;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(43,34,102,.18)}}
.app img{{width:70%;height:70%;object-fit:contain}}
.note{{font-family:Mono;font-size:12px;line-height:1.35;letter-spacing:.02em;color:#E6E3FF;text-transform:uppercase}}
"""

def chain(apps):
    out = []
    for i, a in enumerate(apps):
        if i: out.append(f'<span style="color:{VIO};font-weight:700;margin:0 4px">→</span>')
        out.append(f'<span class="app"><img src="{I(a)}"></span>')
    return "".join(out)

def row(n, top, problem, apps, fix):
    return (f'<div class="abs" style="left:56px;top:{top}px;width:700px;display:flex;gap:22px;align-items:flex-start">'
            f'<div data-rank="1" style="font-family:League;font-size:104px;line-height:.82;color:{VIO};width:52px;text-align:center">{n}</div>'
            f'<div style="padding-top:4px"><div data-rank="4" style="font-size:20px;font-weight:700;color:{INK};line-height:1.25">{problem}</div>'
            f'<div style="display:flex;align-items:center;gap:6px;margin-top:10px">{chain(apps)}'
            f'<span data-rank="5" style="font-size:16px;color:#4A4A66;margin-left:10px">{fix}</span></div></div></div>')

BODY = f"""<body>
<!-- blueprint stage (bottom-right), like the reference's grid table -->
<svg class="abs" style="left:0;top:0" width="{W}" height="{H}">
 <defs><pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="rgba(255,255,255,.10)" stroke-width="1"/></pattern>
  <pattern id="G" width="120" height="120" patternUnits="userSpaceOnUse"><path d="M120 0H0V120" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.2"/></pattern>
  <linearGradient id="bp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{BP2}"/><stop offset="1" stop-color="{BP}"/></linearGradient></defs>
 <path d="M 820 380 L 1600 300 L 1600 900 L 640 900 Z" fill="url(#bp)"/>
 <path d="M 820 380 L 1600 300 L 1600 900 L 640 900 Z" fill="url(#g)"/><path d="M 820 380 L 1600 300 L 1600 900 L 640 900 Z" fill="url(#G)"/>
 <circle cx="1440" cy="760" r="90" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.2" stroke-dasharray="4 6"/>
 <circle cx="1440" cy="760" r="56" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="1"/>
 <line x1="1300" y1="760" x2="1580" y2="760" stroke="rgba(255,255,255,.3)"/><line x1="1440" y1="640" x2="1440" y2="880" stroke="rgba(255,255,255,.3)"/>
 {''.join(f'<line x1="{x}" y1="868" x2="{x}" y2="{876 if x % 40 else 884}" stroke="rgba(255,255,255,.5)"/>' for x in range(700, 1600, 10))}
 <!-- annotation leader lines -->
 <path d="M 1010 120 C 980 150, 980 180, 1000 205" fill="none" stroke="{INK}" stroke-width="1.4"/>
 <path d="M 1050 712 C 1020 700, 1010 690, 1012 668" fill="none" stroke="#fff" stroke-width="1.4"/>
</svg>
<div class="grain"></div>
<!-- hero: the REAL builder screenshot as the product shot -->
<div class="abs" style="left:800px;top:200px;width:740px;height:457px;border-radius:18px;overflow:hidden;transform:perspective(1600px) rotateY(-9deg) rotateZ(-2deg);
  box-shadow:0 50px 80px rgba(22,22,42,.45),0 0 0 6px #fff">
 <img src="{SHOT}" style="width:100%;height:100%;object-fit:cover;display:block"></div>
<div class="abs note" style="left:1022px;top:76px;width:300px;color:{INK}">Real FansaChat screen.<br>Built from one sentence,<br>4 steps, no flowchart.</div>
<div class="abs" data-rank="4" style="left:1060px;top:690px;width:480px;font-size:24px;line-height:1.35;font-weight:700;color:#fff">AI reads which client + how urgent<br>→ ClickUp task → reply in the Slack thread</div>
<!-- top bar + badge (like the series label / AM1 badge) -->
<div class="abs" style="left:56px;top:40px;display:flex;align-items:center;gap:12px"><img src="{LOGO}" style="width:34px;height:34px"></div>
<div class="abs" style="left:1410px;top:36px;width:134px;border:2px solid {DEEP};border-radius:10px;text-align:center;padding:6px 0;background:rgba(255,255,255,.7)">
 <div data-rank="3" style="font-family:League;font-size:46px;line-height:1;color:{DEEP}">700+</div>
 <div data-rank="5" style="font-size:11px;font-weight:700;letter-spacing:.16em;color:{DEEP}">APPS · ONE PLACE</div></div>
<!-- copy -->
<div class="abs" data-rank="5" style="left:56px;top:96px;font-size:13px;font-weight:700;letter-spacing:.12em;white-space:nowrap;color:{VIO}">FOR DIGITAL MARKETING AGENCIES · ACCOUNT MANAGERS · PROJECT MANAGERS</div>
<div class="abs" data-rank="1" style="left:54px;top:124px;width:760px;font-family:Playfair;font-size:72px;line-height:1.02;color:{INK}">3 jobs your agency<br>still does <span style="color:{VIO};background:linear-gradient(transparent 70%,#E2DAFF 70%,#E2DAFF 94%,transparent 94%)">by hand.</span></div>
<div class="abs" data-rank="4" style="left:56px;top:290px;width:700px;font-size:20px;line-height:1.4;color:#3D3D58">If your team juggles <b>Slack, ClickUp, HubSpot</b> and <b>Google Sheets</b> all day, <span style="color:{VIO};font-weight:700">this is for you.</span></div>
{row(1, 378, 'Client requests scattered across Slack, email and forms', ['slack', 'fansa', 'clickup', 'slack'], 'Logged in ClickUp, answered in the thread')}
{row(2, 492, 'A full day per client on the monthly report', ['google-search-console', 'google-sheets', 'fansa', 'google-docs'], 'AI writes it in Google Docs on the 1st')}
{row(3, 606, 'New leads wait hours for a reply', ['typeform', 'calendly', 'hubspot', 'slack'], 'HubSpot deal + Slack ping when they book')}
<div class="abs" style="left:56px;top:748px;width:600px">
 <div data-rank="3" style="font-family:Playfair;font-size:30px;color:{INK}">Join the waitlist →</div>
 <div data-rank="5" style="font-size:13px;font-weight:700;letter-spacing:.16em;color:{DEEP};margin-top:8px">LAUNCHING NOVEMBER 2026</div>
 <div data-rank="5" style="font-size:13px;color:#4A4A66;margin-top:4px">fansachat.com · 478 templates</div></div>
<div class="abs" style="left:1350px;top:770px;width:200px;text-align:center"><img src="{LOGO}" style="width:44px;height:44px"><div data-rank="5" style="font-size:16px;font-weight:700;letter-spacing:.06em;color:#fff;margin-top:6px">fansachat.com</div></div>
</body>"""

NAME = "digital-marketing-agency-automation-clickup-slack-hubspot-fansachat"
allowed = {str(k): list(range(10, 400)) for k in range(1, 6)}
with sync_playwright() as pw:
    br = pw.chromium.launch(channel=os.environ.get("PW_CHANNEL") or None)
    f = OUT / f"{NAME}.html"; f.write_text(f"<!doctype html><html><head><meta charset=utf-8><style>{CSS}</style></head>{BODY}</html>", encoding="utf-8")
    pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=2); pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(600)
    pg.screenshot(path=str(OUT / f"{NAME}.png")); res = pg.evaluate(QA, [12, allowed, W, H]); br.close()
line = f"{NAME}: fonts {res['fonts']} · {'PASS' if not res['issues'] else 'FAIL ' + '; '.join(res['issues'])}"
print(line); (OUT / "QA_agency.txt").write_text(line, encoding="utf-8")
