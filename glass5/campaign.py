"""campaign: hardware-reveal style promo (founder's ASTRA LOOP prompt adapted to FansaChat). 1600x900.
Script + audit: fansa-knowledge/raw/image_research/scripts/C01_dm_autopilot.md
Run: python glass5/campaign.py -> glass5/out/<name>.png + QA (reuses the QA from build.py)
"""
import os, pathlib, re, sys
from playwright.sync_api import sync_playwright
from cta import cta

HERE = pathlib.Path(__file__).parent.resolve()
OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
W, H = 1600, 900
F = lambda n: (HERE / "fonts" / n).as_uri()
I = lambda s: (HERE / "logo-fansa.png").as_uri() if s == 'fansa' else (HERE / "icons" / f"{s}.png").as_uri()
LOGO = (HERE / "logo-fansa.png").as_uri()
VIO, MAIN, DEEP, NIGHT, INK, SIL = "#7B5CE0", "#6468D8", "#2B2266", "#14142E", "#1B1B2E", "#C9CAD8"
QA = re.search(r'QA = """(.*?)"""', (HERE / "build.py").read_text(encoding="utf-8"), re.S).group(1)

CSS = f"""
@font-face{{font-family:Sora;font-weight:300;src:url({F('Sora-400.woff2')})}}
@font-face{{font-family:Sora;font-weight:700;src:url({F('Sora-700.woff2')})}}
@font-face{{font-family:DMSerif;src:url({F('DMSerifDisplay-400.woff2')})}}
@font-face{{font-family:Inter;font-weight:500;src:url({F('InterTight-500.woff2')})}}
@font-face{{font-family:Inter;font-weight:700;src:url({F('InterTight-700.woff2')})}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:100vw;height:100vh;overflow:hidden;position:relative;font-family:Inter;font-weight:500;color:{INK};
  background:radial-gradient(900px 700px at 1150px 380px,#FFFFFF 0%,#EEEEF6 45%,#DCDDEA 100%)}}
.abs{{position:absolute}}
.grain{{position:absolute;inset:0;pointer-events:none;opacity:.12;mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}}
.ico{{width:30px;height:30px;border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(43,34,102,.15)}}
.ico img{{width:70%;height:70%;object-fit:contain}}
.app{{width:26px;height:26px;border-radius:7px;background:#fff;display:inline-flex;align-items:center;justify-content:center;vertical-align:middle}}
.app img{{width:72%;height:72%;object-fit:contain}}
"""

def callout(apps, text):
    icons = "".join(f'<span class="ico"><img src="{I(a)}"></span>' for a in apps)
    return (f'<div style="display:flex;align-items:center;gap:14px;height:44px;border-bottom:1px solid rgba(43,34,102,.12)">'
            f'<div style="display:flex;gap:4px;width:98px">{icons}</div><div data-rank="5" style="font-size:18px;color:{DEEP}">{text}</div></div>')

def sector(apps, label):
    icons = "".join(f'<span class="app" style="width:44px;height:44px;border-radius:12px;box-shadow:0 6px 14px rgba(43,34,102,.18)"><img src="{I(a)}"></span>' for a in apps)
    return (f'<div style="flex:1;text-align:center"><div style="display:flex;justify-content:center;gap:10px;align-items:center">{icons}'
            f'</div><div data-rank="5" style="font-size:14px;letter-spacing:.14em;color:{DEEP};margin-top:12px">{label}</div></div>')

SHOT = (HERE / "assets" / "real_builder_dm.jpg").as_uri()  # real FansaChat builder, built from one sentence (no mock-up)
screen = f'<img src="{SHOT}" style="width:100%;height:100%;object-fit:cover;object-position:left top;display:block">'

BODY = f"""<body>
<svg class="abs" style="left:0;top:0" width="{W}" height="{H}">
 <defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="{SIL}"/><stop offset="1" stop-color="#F4F4FA"/></linearGradient>
  <filter id="glow"><feGaussianBlur stdDeviation="14"/></filter></defs>
 {''.join(f'<circle cx="1150" cy="370" r="{r}" fill="none" stroke="rgba(123,92,224,{o})" stroke-width="1.5"/>' for r, o in [(470, .10), (540, .07), (620, .05)])}
 <circle cx="1150" cy="370" r="330" fill="none" stroke="{VIO}" stroke-width="22" opacity=".55" filter="url(#glow)"/>
 <circle cx="1150" cy="370" r="330" fill="none" stroke="url(#ring)" stroke-width="40"/>
 <circle cx="1150" cy="370" r="312" fill="none" stroke="rgba(160,140,255,.9)" stroke-width="3"/>
 <ellipse cx="1150" cy="640" rx="330" ry="26" fill="url(#ring)" stroke="#fff" stroke-width="2"/>
 <ellipse cx="1150" cy="634" rx="250" ry="10" fill="{VIO}" opacity=".35" filter="url(#glow)"/>
</svg>
<div class="grain"></div>
<!-- device -->
<div class="abs" style="left:780px;top:190px;width:740px;height:430px;border-radius:44px;
  background:linear-gradient(170deg,#FFFFFF,#E4E5EF 60%,#CFD0DE);box-shadow:inset 0 2px 0 #fff,inset 0 -6px 14px rgba(43,34,102,.12),0 40px 60px rgba(43,34,102,.30)">
 <div class="abs" style="left:24px;top:190px;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#55557a,#1d1d33);box-shadow:0 0 0 4px #fff,0 0 16px {VIO}"></div>
 <div class="abs" style="left:686px;top:190px;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#55557a,#1d1d33);box-shadow:0 0 0 4px #fff,0 0 16px {VIO}"></div>
 <div class="abs" style="left:66px;top:28px;width:608px;height:374px;border-radius:20px;background:{NIGHT};overflow:hidden;box-shadow:inset 0 0 0 2px #0A0A1A">
  {screen}</div>
</div>
<div class="abs" style="left:1150px;top:648px;transform:translateX(-50%);font-family:Sora;font-weight:300;font-size:14px;letter-spacing:.24em;white-space:nowrap;color:#8A8BA6">BUILT FROM ONE SENTENCE</div>
<!-- left column -->
<div class="abs" style="left:56px;top:44px;display:flex;align-items:center;gap:12px"><img src="{LOGO}" style="width:40px;height:40px">
 <span data-rank="5" style="font-family:Sora;font-weight:300;font-size:18px;letter-spacing:.28em;color:{DEEP}">FANSACHAT</span></div>
<div class="abs" data-rank="5" style="left:56px;top:112px;width:780px;font-size:13px;font-weight:700;letter-spacing:.1em;white-space:nowrap;color:{VIO}">FOR CUSTOMER SUPPORT AGENTS · SOCIAL MEDIA MANAGERS · AGENCIES · ONLINE SHOPS</div>
<div class="abs" data-rank="1" style="left:52px;top:146px;width:700px;font-family:Sora;font-weight:300;font-size:70px;line-height:1.04;letter-spacing:.02em;color:{INK}">ANSWERING DMs<br>
 <span style="font-weight:700;background:linear-gradient(90deg,{VIO},{MAIN});-webkit-background-clip:text;background-clip:text;color:transparent">ALL DAY?</span></div>
<div class="abs" data-rank="3" style="left:56px;top:306px;width:640px;font-family:DMSerif;font-size:32px;line-height:1.18;color:{INK}">Here's how to run <span style="background:linear-gradient(transparent 58%,#D9CFFF 58%,#D9CFFF 92%,transparent 92%);color:{DEEP}">Instagram &amp; Messenger</span> on autopilot.</div>
<div class="abs" data-rank="4" style="left:56px;top:394px;width:640px;font-size:18px;line-height:1.45;color:#4A4A66">Type one sentence. FansaChat links Instagram and Messenger to Shopify, Zendesk, HubSpot and Slack, and builds the workflow you see here.</div>
<div class="abs" style="left:56px;top:460px;width:560px">
 {callout(['instagram-business', 'facebook-pages', 'respond-io'], 'Instagram &amp; Messenger DMs arrive via Respond.io')}
 {callout(['fansa'], 'AI sorts each one: order, complaint or sale')}
 {callout(['shopify', 'respond-io'], 'Order status from Shopify, reply sent back')}
 {callout(['zendesk'], 'Complaints become a Zendesk ticket')}
 {callout(['hubspot', 'slack'], 'Sales leads become a HubSpot deal + Slack ping')}
</div>
<!-- bottom strip -->
<div class="abs" style="left:0;top:704px;width:1070px;height:146px;background:linear-gradient(180deg,rgba(255,255,255,.75),rgba(240,240,248,.9));border-top:1px solid #fff;box-shadow:0 -10px 30px rgba(43,34,102,.06)">
 <div data-rank="5" style="position:absolute;left:0;right:0;top:14px;text-align:center;font-size:13px;font-weight:700;letter-spacing:.24em;color:{VIO}">BUILT FOR</div>
 <div style="position:absolute;left:40px;right:40px;top:44px;display:flex">
  {sector(['shopify', 'instagram-business'], 'ONLINE SHOPS')}{sector(['respond-io', 'clickup', 'slack'], 'AGENCIES')}{sector(['whatsapp', 'calendly'], 'CLINICS &amp; SALONS')}{sector(['zendesk', 'intercom'], 'SUPPORT TEAMS')}</div></div>
<div class="abs" style="left:1070px;top:704px;width:530px;height:146px;background:linear-gradient(160deg,#FFFFFF,#ECEBF7);border-left:1px solid rgba(43,34,102,.1)"></div>
{cta(1100, 714, fs=22, stack=True, gap=12)}
<div class="abs" style="left:0;top:850px;width:{W}px;height:50px;background:{NIGHT};display:flex;align-items:center;justify-content:space-between;padding:0 56px">
 <span data-rank="5" style="font-size:14px;letter-spacing:.2em;color:#E4E4F4">700+ APPS · 478 TEMPLATES · PLAIN-ENGLISH SETUP · EDIT BY CHATTING</span>
 <span data-rank="5" style="font-size:12px;letter-spacing:.06em;color:#9C9DBC">Instagram &amp; Messenger connect via Respond.io</span></div>
</body>"""

def chip(apps, text):
    icons = "".join(f'<span class="ico" style="width:34px;height:34px"><img src="{I(a)}"></span>' for a in apps)
    return (f'<div style="display:flex;align-items:center;gap:12px;height:52px;border-bottom:1px solid rgba(43,34,102,.12)">'
            f'<div style="display:flex;gap:4px;width:110px">{icons}</div><div data-rank="5" style="font-size:20px;color:{DEEP}">{text}</div></div>')

# 4:5 Instagram version: same campaign, stacked (hook -> answer -> real device -> 5 steps -> CTA bar)
BODY45 = f"""<body style="background:radial-gradient(800px 700px at 540px 720px,#FFFFFF 0%,#EEEEF6 45%,#DCDDEA 100%)">
<svg class="abs" style="left:0;top:0" width="1080" height="1350">
 <defs><linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="{SIL}"/><stop offset="1" stop-color="#F4F4FA"/></linearGradient>
  <filter id="glow"><feGaussianBlur stdDeviation="14"/></filter></defs>
 {''.join(f'<circle cx="540" cy="690" r="{r}" fill="none" stroke="rgba(123,92,224,{o})" stroke-width="1.5"/>' for r, o in [(440, .10), (510, .07), (590, .05)])}
 <circle cx="540" cy="690" r="280" fill="none" stroke="{VIO}" stroke-width="22" opacity=".55" filter="url(#glow)"/>
 <circle cx="540" cy="690" r="280" fill="none" stroke="url(#ring)" stroke-width="40"/>
 <circle cx="540" cy="690" r="263" fill="none" stroke="rgba(160,140,255,.9)" stroke-width="3"/>
 <ellipse cx="540" cy="958" rx="420" ry="24" fill="url(#ring)" stroke="#fff" stroke-width="2"/>
 <ellipse cx="540" cy="952" rx="320" ry="10" fill="{VIO}" opacity=".35" filter="url(#glow)"/>
</svg>
<div class="grain"></div>
<div class="abs" style="left:56px;top:48px;display:flex;align-items:center;gap:12px"><img src="{LOGO}" style="width:40px;height:40px">
 <span data-rank="5" style="font-family:Sora;font-weight:300;font-size:18px;letter-spacing:.28em;color:{DEEP}">FANSACHAT</span></div>
<div class="abs" data-rank="5" style="left:56px;top:112px;width:968px;font-size:14px;font-weight:700;letter-spacing:.08em;white-space:nowrap;color:{VIO}">FOR CUSTOMER SUPPORT AGENTS · SOCIAL MEDIA MANAGERS · AGENCIES · SHOPS</div>
<div class="abs" data-rank="1" style="left:52px;top:146px;width:980px;font-family:Sora;font-weight:300;font-size:84px;line-height:1.04;letter-spacing:.02em;color:{INK}">ANSWERING DMs<br>
 <span style="font-weight:700;background:linear-gradient(90deg,{VIO},{MAIN});-webkit-background-clip:text;background-clip:text;color:transparent">ALL DAY?</span></div>
<div class="abs" data-rank="2" style="left:56px;top:338px;width:968px;font-family:DMSerif;font-size:38px;line-height:1.16;color:{INK}">Here's how to run <span style="background:linear-gradient(transparent 58%,#D9CFFF 58%,#D9CFFF 92%,transparent 92%);color:{DEEP}">Instagram &amp; Messenger</span> on autopilot.</div>
<div class="abs" style="left:80px;top:470px;width:920px;height:476px;border-radius:48px;
  background:linear-gradient(170deg,#FFFFFF,#E4E5EF 60%,#CFD0DE);box-shadow:inset 0 2px 0 #fff,inset 0 -6px 14px rgba(43,34,102,.12),0 40px 60px rgba(43,34,102,.30)">
 <div class="abs" style="left:18px;top:223px;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#55557a,#1d1d33);box-shadow:0 0 0 4px #fff,0 0 16px {VIO}"></div>
 <div class="abs" style="left:872px;top:223px;width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#55557a,#1d1d33);box-shadow:0 0 0 4px #fff,0 0 16px {VIO}"></div>
 <div class="abs" style="left:62px;top:26px;width:796px;height:424px;border-radius:20px;background:{NIGHT};overflow:hidden;box-shadow:inset 0 0 0 2px #0A0A1A">{screen}</div>
</div>
<div class="abs" style="left:540px;top:992px;transform:translateX(-50%);font-family:Sora;font-weight:300;font-size:14px;letter-spacing:.24em;white-space:nowrap;color:#8A8BA6">BUILT FROM ONE SENTENCE</div>
<div class="abs" style="left:56px;top:1022px;width:968px;display:grid;grid-template-columns:1fr 1fr;column-gap:28px">
 {chip(['instagram-business', 'facebook-pages', 'respond-io'], 'DMs arrive via Respond.io')}
 {chip(['fansa'], 'AI sorts: order, complaint, sale')}
 {chip(['shopify', 'respond-io'], 'Order status sent back')}
 {chip(['zendesk'], 'Complaints → Zendesk ticket')}
 {chip(['hubspot', 'slack'], 'Leads → HubSpot + Slack')}
 {chip(['fansa'], 'Built from one sentence')}
</div>
<div class="abs" style="left:0;top:1196px;width:1080px;height:154px;background:{NIGHT}"></div>
{cta(56, 1214, fs=26, dark=True)}
<div class="abs" data-rank="5" style="left:56px;top:1300px;font-size:14px;letter-spacing:.08em;color:#BDBDDA">700+ apps · 478 templates · fansachat.com · Instagram &amp; Messenger connect via Respond.io</div>
</body>"""

NAME = "instagram-messenger-dm-automation-customer-support-fansachat"
allowed = {str(k): list(range(10, 400)) for k in range(1, 6)}  # free type scale for this layout; QA keeps overlap/cover/fonts/safe-zone
lines = []
with sync_playwright() as pw:
    br = pw.chromium.launch(channel=os.environ.get("PW_CHANNEL") or None)
    for name, w, h, body in [(NAME, W, H, BODY), (NAME + "-4x5", 1080, 1350, BODY45)]:
        f = OUT / f"{name}.html"; f.write_text(f"<!doctype html><html><head><meta charset=utf-8><style>{CSS}</style></head>{body}</html>", encoding="utf-8")
        pg = br.new_page(viewport={"width": w, "height": h}, device_scale_factor=2); pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(600)
        pg.screenshot(path=str(OUT / f"{name}.png"))
        res = pg.evaluate(QA, [12, allowed, w, h]); pg.close()
        lines.append(f"{name}: fonts {res['fonts']} · {'PASS' if not res['issues'] else 'FAIL ' + '; '.join(res['issues'])}")
    br.close()
print(chr(10).join(lines)); (OUT / "QA_campaign.txt").write_text(chr(10).join(lines), encoding="utf-8")
