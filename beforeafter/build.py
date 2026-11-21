"""FansaChat BEFORE/AFTER posts: 10 workflows x (1 split 1080x1350 + 2 carousel slides) = 30 PNGs.
House style from glass5/ (fonts, icons, logo, cta.py). Real UI = frames cut from public/real/*.webm with ffmpeg.
Run: pip install playwright pillow && python beforeafter/build.py   (needs ffmpeg + chromium)
"""
import json, os, pathlib, random, re, subprocess, sys
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent.resolve()
ROOT = HERE.parent
G5 = ROOT / "glass5"
sys.path.insert(0, str(G5))
from cta import cta  # house CTA: 'Join the waitlist ->' + 'FansaChat Community - t.me/fansachat'

OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
FR = HERE / "frames"; FR.mkdir(exist_ok=True)
TMP = HERE / "_tmp"; TMP.mkdir(exist_ok=True)
W, H = 1080, 1350
F = lambda n: (G5 / "fonts" / n).as_uri()
def I(s):
    p = G5 / "icons" / f"{s}.png"
    if not p.exists(): p = G5 / "icons" / f"{s}.svg"
    assert p.exists(), s
    return p.as_uri()
LOGO = (G5 / "logo-fansa.png").as_uri()
RESULTS = json.loads((ROOT / "public/real/real_results.json").read_text(encoding="utf-8"))

# ---- real UI frames (sharp 1920x1080 frames from our recordings) ----
FRAMES = {"P05": ("P05", 38.9), "P06": ("P06", 33.0), "P07": ("P07", 33.0), "GEN": ("P05", 36.0)}
def grab(key):
    vid, t = FRAMES[key]; out = FR / f"{key}.png"
    if not out.exists():
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", str(ROOT / f"public/real/{vid}_ui.webm"), "-frames:v", "1", str(out)], check=True)
    return out
def crop(key, aspect, name):
    """matched flows show the real chat (request + draft); generic ones show the real workflow-shape picker."""
    im = Image.open(grab(key)).convert("RGB")
    if key == "GEN":  # neutral real frame: the 'How should your workflow look?' picker (no app named)
        w = min(680, round(609 * aspect)); h = round(w / aspect); x0 = 1248 - w // 2; y0 = 263
    else:
        x0, y0, w = {"P06": (16, 76, 554)}.get(key, (16, 150, 554))
        h = min(round(w / aspect), 1060 - y0); w = round(h * aspect)
    c = im.crop((x0, y0, x0 + w, y0 + h)); p = TMP / f"{name}.png"; c.save(p); return p.as_uri()

# ---- the 10 workflows ----
POSTS = [
 dict(id="01", slug="lead-to-crm", area="Sales", title="New lead to CRM", ui="GEN", pal="teal",
      pain="A lead fills the form. Nobody sees it until **Monday**.", sub="Copy. Paste. Switch tab. Repeat.",
      pile=["gmail", "google-sheets", "hubspot", "slack", "typeform", "microsoft-outlook", "notion"],
      after="Every new lead lands in **HubSpot** in **seconds**.", chain=["typeform", "hubspot", "slack"],
      stat="SECONDS", line="from form to CRM, and your team gets a Slack ping"),
 dict(id="02", slug="call-prep", area="Sales", title="Booked call to prep page", ui="P05", pal="amber",
      pain="Call booked. Now **three tabs** to prepare for it.", sub="Name, company, time, copied by hand.",
      pile=["calendly", "notion", "slack", "google-calendar", "google-docs", "gmail", "zoom"],
      after="Call booked. The **prep page** and **Slack ping** are ready.", chain=["calendly", "notion", "slack"],
      stat="READY", line="before you even open your calendar"),
 dict(id="03", slug="publish-everywhere", area="Marketing", title="One post to every channel", ui="GEN", pal="sky",
      pain="Publish once, then **rewrite it** for every channel by hand.", sub="Four logins for one blog post.",
      pile=["wordpress", "buffer", "instagram-business", "facebook-pages", "canva", "google-docs", "mailchimp"],
      after="Publish once. **Every channel** gets its post.", chain=["wordpress", "buffer", "instagram-business", "facebook-pages"],
      stat="30 MIN", line="back on every post you publish"),
 dict(id="04", slug="urgent-ticket", area="Support", title="Urgent ticket to the right person", ui="GEN", pal="rose",
      pain="An urgent ticket sits in the queue. **Nobody** noticed.", sub="The team lives in other tabs.",
      pile=["zendesk", "intercom", "slack", "gmail", "help-scout", "linear", "microsoft-teams"],
      after="Urgent tickets reach the **right person** in a **minute**.", chain=["zendesk", "slack", "linear"],
      stat="1 MIN", line="from ticket to the right Slack channel"),
 dict(id="05", slug="order-to-label", area="Ops", title="Order to shipping label and sheet", ui="GEN", pal="sage",
      pain="Every order is copied into a **sheet** and the shipping tool.", sub="By hand. Every single day.",
      pile=["shopify", "google-sheets", "shippo", "gmail", "airtable", "woocommerce", "slack"],
      after="Every order gets its **label** and a **row** in the sheet.", chain=["shopify", "shippo", "google-sheets"],
      stat="NO RETYPING", line="the daily copy-paste hour is gone"),
 dict(id="06", slug="monday-report", area="Finance", title="Payments booked, Monday summary posted", ui="GEN", pal="sand",
      pain="The Monday report gets built on **Sunday night**.", sub="Payment by payment, into the books.",
      pile=["stripe", "quickbooks", "google-sheets", "xero", "gmail", "square", "microsoft-outlook"],
      after="Payments are **booked** as they clear. Monday's **summary** posts itself.", chain=["stripe", "quickbooks", "slack"],
      stat="MONDAY", line="report ready before you sit down"),
 dict(id="07", slug="new-hire", area="HR", title="Offer accepted to onboarding", ui="GEN", pal="mint",
      pain="Offer accepted. Now **five checklists** across five tabs.", sub="And someone always forgets one.",
      pile=["greenhouse", "bamboohr", "google-drive", "slack", "google-calendar", "gmail", "docusign"],
      after="Offer accepted. **Onboarding** starts by itself.", chain=["greenhouse", "bamboohr", "slack", "google-calendar"],
      stat="DAY ONE", line="set up before the new hire arrives"),
 dict(id="08", slug="client-requests", area="Agency", title="Client request to task and alert", ui="P06", pal="blue",
      pain="Client requests hide in **email**, **chat** and **DMs**.", sub="Which message is the current one?",
      pile=["gmail", "slack", "whatsapp", "trello", "notion", "microsoft-teams", "asana"],
      after="Every client request becomes a **task** and an **alert**.", chain=["typeform", "notion", "slack"],
      stat="ONE PLACE", line="for every request, with the client name on it"),
 dict(id="09", slug="video-published", area="Solo creator", title="New video to every audience", ui="GEN", pal="coral",
      pain="The video is live. Now **paste the link** everywhere.", sub="Every upload, the same chores.",
      pile=["youtube", "bluesky", "discord", "buffer", "canva", "google-sheets", "notion"],
      after="Upload once. The **link** goes out **everywhere**.", chain=["youtube", "bluesky", "discord"],
      stat="10 MIN", line="back on every upload"),
 dict(id="10", slug="project-brief", area="Freelance", title="Project brief to Notion and Slack", ui="P07", pal="teal2",
      pain="The brief arrives by email. **Budget** and **deadline** get buried.", sub="Found again three weeks later.",
      pile=["gmail", "notion", "slack", "google-docs", "google-drive", "todoist", "microsoft-outlook"],
      after="Brief in. A **Notion page** and **Slack summary** out.", chain=["typeform", "notion", "slack"],
      stat="NOTHING LOST", line="client, budget and deadline in one page"),
]
# palettes: after-bg, accent, soft highlight, ink
PAL = {
 "teal":  ("radial-gradient(900px 700px at 85% 10%,#D6F5EE,transparent 60%),linear-gradient(160deg,#F7FFFC,#E4F6F0)", "#0B7A6B", "#BFEBE1"),
 "amber": ("radial-gradient(900px 700px at 90% 5%,#FFE7BF,transparent 60%),linear-gradient(160deg,#FFFDF7,#FBEFDA)", "#B45309", "#FFD9A3"),
 "sky":   ("radial-gradient(900px 700px at 90% 8%,#CFE6FF,transparent 60%),linear-gradient(160deg,#F8FBFF,#E6F0FC)", "#1D5FD1", "#BBD8FF"),
 "rose":  ("radial-gradient(900px 700px at 90% 8%,#FFD9DF,transparent 60%),linear-gradient(160deg,#FFFAFA,#FCE9EC)", "#BE1E45", "#FFC9D3"),
 "sage":  ("radial-gradient(900px 700px at 90% 8%,#DDEFD2,transparent 60%),linear-gradient(160deg,#FAFFF6,#EBF4E3)", "#2F7A1F", "#CFEBBF"),
 "sand":  ("radial-gradient(900px 700px at 90% 8%,#F7E6C4,transparent 60%),linear-gradient(160deg,#FFFCF3,#F5ECD8)", "#8A5A00", "#F4DFA9"),
 "mint":  ("radial-gradient(900px 700px at 90% 8%,#C9F2E0,transparent 60%),linear-gradient(160deg,#F5FFFA,#E1F5EC)", "#0F7A4E", "#B7EBD2"),
 "blue":  ("radial-gradient(900px 700px at 90% 8%,#D4E3FF,transparent 60%),linear-gradient(160deg,#F7FAFF,#E5EDFB)", "#1B4FBF", "#B9CFFA"),
 "coral": ("radial-gradient(900px 700px at 90% 8%,#FFD8C9,transparent 60%),linear-gradient(160deg,#FFFAF7,#FCEBE3)", "#C2410C", "#FFCDB5"),
 "teal2": ("radial-gradient(900px 700px at 90% 8%,#CDEFF2,transparent 60%),linear-gradient(160deg,#F6FDFE,#E1F3F5)", "#0E7490", "#B6E4EC"),
}
INK = "#121821"; MUTE = "#4A4640"
GRAIN = ("url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/>"
         "<feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>\")")

CSS = f"""
@font-face{{font-family:Grotesk;font-weight:500;src:url({F('SpaceGrotesk-500.woff2')})}}
@font-face{{font-family:Grotesk;font-weight:700;src:url({F('SpaceGrotesk-700.woff2')})}}
@font-face{{font-family:BigS;src:url({F('BigShouldersDisplay-800.woff2')})}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:{W}px;height:{H}px;overflow:hidden;position:relative;font-family:Grotesk;font-weight:700;font-style:normal}}
.abs{{position:absolute}} svg.abs{{pointer-events:none}}
.big{{font-family:BigS;font-weight:400;text-transform:uppercase;line-height:.9;letter-spacing:.01em}}
.grain{{position:absolute;inset:0;pointer-events:none;opacity:.16;mix-blend-mode:multiply;background-image:{GRAIN}}}
.cta span[data-rank="4"]{{font-size:30px!important}} .cta span[data-rank="5"]{{font-size:30px!important}}
.ic{{background:#fff;border-radius:22%;display:flex;align-items:center;justify-content:center;flex:none}}
.ic img{{width:66%;height:66%;object-fit:contain}}
"""

def mark(t, acc, soft):
    return re.sub(r"\*\*(.+?)\*\*", lambda m: f'<span style="color:{acc};background:linear-gradient(transparent 66%,{soft} 66%,{soft} 93%,transparent 93%)">{m.group(1)}</span>', t)
def plain(t): return t.replace("**", "")

def footer(x_right, y, ink=INK):
    return (f'<div class="abs" style="right:{x_right}px;top:{y}px;display:flex;align-items:center;gap:12px"><img src="{LOGO}" style="width:48px;height:48px">'
            f'<span data-rank="5" style="font-size:30px;color:{ink};white-space:nowrap">fansachat.com</span></div>')
def cta_block(left, top, dark=False):
    return f'<div class="cta">{cta(left, top, fs=32, stack=True, gap=12, dark=dark)}</div>'

def pile(apps, x0, y0, w, h, size, seed):
    """messy pile of real app logos: overlapping, rotated, muted, crossed by straight lines."""
    r = random.Random(seed); n = len(apps)
    cols = min(n, 4); rows = (n + cols - 1) // cols; pts = []
    for i, a in enumerate(apps):
        c, rw = i % cols, i // cols
        cx = x0 + (c + .5) * w / cols + r.uniform(-.28, .28) * w / cols
        cy = min(y0 + (rw + .5) * h / rows + r.uniform(-.2, .2) * h / rows, y0 + h - size * .6)
        pts.append((a, cx, cy, r.uniform(-24, 24), size * r.uniform(.82, 1.08)))
    lines = "".join(f'<line x1="{pts[i][1]:.0f}" y1="{pts[i][2]:.0f}" x2="{pts[(i * 3 + 2) % n][1]:.0f}" y2="{pts[(i * 3 + 2) % n][2]:.0f}" stroke="#8C867C" stroke-width="3" stroke-dasharray="10 9" opacity=".75"/>'
                    for i in range(n) if (i * 3 + 2) % n != i)
    lines += "".join(f'<line x1="{pts[i][1]:.0f}" y1="{pts[i][2]:.0f}" x2="{pts[(i + 2) % n][1]:.0f}" y2="{pts[(i + 2) % n][2]:.0f}" stroke="#8C867C" stroke-width="3" opacity=".55"/>' for i in range(n))
    ics = "".join(f'<div class="ic abs" style="left:{cx - s / 2:.0f}px;top:{cy - s / 2:.0f}px;width:{s:.0f}px;height:{s:.0f}px;transform:rotate({rot:.0f}deg);'
                  f'box-shadow:0 8px 18px rgba(40,34,20,.28);filter:grayscale(.75) contrast(.88);opacity:.88"><img src="{I(a)}"></div>' for a, cx, cy, rot, s in pts)
    return f'<svg class="abs" style="left:0;top:0" width="{W}" height="{H}">{lines}</svg>{ics}'

def chain(apps, left, top, width, size, acc):
    items = []
    for i, a in enumerate(apps):
        if i: items.append(f'<div style="flex:1;height:{size}px;display:flex;align-items:center;position:relative;margin:0 6px">'
                           f'<div style="flex:1;height:6px;background:{acc};border-radius:3px"></div>'
                           f'<div style="width:0;height:0;border-left:16px solid {acc};border-top:11px solid transparent;border-bottom:11px solid transparent;margin-left:-3px"></div></div>')
        items.append(f'<div class="ic" style="width:{size}px;height:{size}px;box-shadow:0 0 0 4px {acc},0 12px 24px rgba(20,30,40,.22)"><img src="{I(a)}"></div>')
    return f'<div class="abs" style="left:{left}px;top:{top}px;width:{width}px;display:flex;align-items:center">{"".join(items)}</div>'

def ui_card(src, left, top, w, h):
    return (f'<div class="abs" style="left:{left}px;top:{top}px;width:{w}px;height:{h}px;border-radius:20px;overflow:hidden;background:#fff;'
            f'box-shadow:0 0 0 4px #fff,0 26px 50px rgba(20,30,40,.30)"><img src="{src}" style="width:100%;height:100%;object-fit:cover;display:block"></div>')

def before_bg():
    return (f'<div class="abs" style="inset:0;background:radial-gradient(800px 600px at 20% 0%,#D9D5CC,transparent 70%),linear-gradient(170deg,#CFCBC2,#B9B5AB)"></div>'
            f'<div class="abs" style="inset:0;background:repeating-linear-gradient(115deg,rgba(0,0,0,.035) 0 2px,transparent 2px 22px)"></div><div class="grain"></div>')
def after_bg(pal):
    bg, acc, soft = PAL[pal]
    return (f'<div class="abs" style="inset:0;background:{bg}"></div>'
            f'<div class="abs" style="inset:0;color:{acc};opacity:.10;background-image:radial-gradient(currentColor 1.6px,transparent 1.8px);background-size:22px 22px"></div><div class="grain" style="opacity:.07"></div>')

def label(txt, color, left=72, top=0):
    return f'<div class="abs big" data-rank="3" style="left:{left}px;top:{top}px;font-size:48px;color:{color};letter-spacing:.08em">{txt}</div>'

def html_split(p, i):
    bg, acc, soft = PAL[p["pal"]]; BH = 470
    card = crop(p["ui"], 438 / 285, f'split{p["id"]}')
    before = (f'<div class="abs" style="left:0;top:0;width:{W}px;height:{BH}px;overflow:hidden">{before_bg()}'
              f'{label("BEFORE", "#5B564D", 72, 44)}'
              f'<div class="abs" data-rank="1" style="left:72px;top:104px;width:936px;font-size:50px;line-height:1.1;color:#2F2C27">{plain(p["pain"])}</div>'
              f'<div class="abs" data-rank="3" style="left:72px;top:232px;width:936px;font-size:32px;color:{MUTE};font-weight:500">{p["sub"]}</div>'
              f'{pile(p["pile"], 72, 290, 936, 150, 76, i)}</div>')
    after = (f'<div class="abs" style="left:0;top:{BH}px;width:{W}px;height:{H - BH}px;overflow:hidden"><div class="abs" style="left:0;top:-{BH}px;width:{W}px;height:{H}px">{after_bg(p["pal"])}</div></div>'
             f'<div class="abs" style="left:0;top:{BH - 3}px;width:{W}px;height:6px;background:{acc}"></div>'
             f'{label("AFTER", acc, 72, BH + 24)}'
             f'<div class="abs" data-rank="1" style="left:72px;top:{BH + 84}px;width:936px;font-size:52px;line-height:1.1;color:{INK}">{mark(p["after"], acc, soft)}</div>'
             f'{chain(p["chain"], 72, BH + 216, 936, 88, acc)}'
             f'<div class="abs big" data-rank="2" style="left:72px;top:{BH + 340}px;font-size:92px;color:{acc};white-space:nowrap">{p["stat"]}</div>'
             f'<div class="abs" data-rank="3" style="left:72px;top:{BH + 440}px;width:440px;font-size:32px;line-height:1.2;color:{INK};font-weight:500">{p["line"]}</div>'
             f'{ui_card(card, 570, BH + 316, 438, 285)}'
             f'{cta_block(72, 1100)}{footer(72, 1112)}')
    return f'<body>{before}{after}</body>'

def html_slide(p, i, which):
    bg, acc, soft = PAL[p["pal"]]
    if which == 1:
        body = (before_bg() + label("BEFORE", "#5B564D", 72, 64) +
                f'<div class="abs" data-rank="1" style="left:72px;top:150px;width:936px;font-size:78px;line-height:1.08;color:#2F2C27">{mark(p["pain"], "#6B2E2E", "rgba(120,60,60,.18)")}</div>'
                f'<div class="abs" data-rank="3" style="left:72px;top:470px;width:936px;font-size:38px;color:{MUTE};font-weight:500">{p["sub"]}</div>'
                f'{pile(p["pile"], 72, 590, 936, 440, 150, i)}'
                f'{cta_block(72, 1100)}{footer(72, 1112)}')
    else:
        card = crop(p["ui"], 480 / 519, f'slide{p["id"]}')
        body = (after_bg(p["pal"]) + label("AFTER", acc, 72, 64) +
                f'<div class="abs" data-rank="1" style="left:72px;top:140px;width:936px;font-size:66px;line-height:1.08;color:{INK}">{mark(p["after"], acc, soft)}</div>'
                f'{chain(p["chain"], 72, 380, 936, 104, acc)}'
                f'{ui_card(card, 72, 530, 480, 519)}'
                f'<div class="abs big" data-rank="2" style="left:600px;top:560px;width:410px;font-size:84px;line-height:.95;color:{acc}">{p["stat"]}</div>'
                f'<div class="abs" data-rank="3" style="left:600px;top:{760 if len(p["stat"]) > 10 else 690}px;width:408px;font-size:36px;line-height:1.2;color:{INK};font-weight:500">{p["line"]}</div>'
                f'{cta_block(72, 1100)}{footer(72, 1112)}')
    return f'<body>{body}</body>'

QA = re.search(r'QA = """(.*?)"""', (G5 / "build.py").read_text(encoding="utf-8"), re.S).group(1)
SMALL = """() => [...document.querySelectorAll('body *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
  .filter(e => parseFloat(getComputedStyle(e).fontSize) < 30).map(e => `text under 30px (${getComputedStyle(e).fontSize}): "${e.textContent.trim().slice(0,24)}"`)"""
FONTS = """() => [...new Set([...document.querySelectorAll('body *')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).map(e => getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g,'')))]"""

def main():
    allowed = {str(k): list(range(18, 430)) for k in range(1, 6)}
    report = []; bad = 0
    with sync_playwright() as pw:
        kw = {}
        if os.environ.get("CHROME_PATH"): kw["executable_path"] = os.environ["CHROME_PATH"]
        br = pw.chromium.launch(**kw)
        for i, p in enumerate(POSTS):
            for kind, doc in (("split", html_split(p, i)), ("slide1-before", html_slide(p, i, 1)), ("slide2-after", html_slide(p, i, 2))):
                name = f'{p["id"]}_{p["slug"]}_{kind}'
                f = TMP / f"{name}.html"; f.write_text(f"<!doctype html><html><head><meta charset=utf-8><style>{CSS}</style></head>{doc}</html>", encoding="utf-8")
                pg = br.new_page(viewport={"width": W, "height": H}); pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(400)
                pg.screenshot(path=str(OUT / f"{name}.png"))
                res = pg.evaluate(QA, [16, allowed, W, H]); small = pg.evaluate(SMALL); fonts = pg.evaluate(FONTS); pg.close()
                iss = [x for x in res["issues"] if not x.startswith("hierarchy")] + small
                bad += bool(iss)
                report.append(f'{name}: fonts {fonts} · {"PASS" if not iss else "FAIL " + "; ".join(iss)}')
        br.close()
    (OUT / "QA.txt").write_text("\n".join(report), encoding="utf-8"); print("\n".join(report))
    import shutil; shutil.rmtree(TMP, ignore_errors=True)
    sys.exit(1 if bad else 0)

if __name__ == "__main__":
    main()
