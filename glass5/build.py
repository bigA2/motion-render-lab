"""glass5: 5 FansaChat promo images (1080x1350, 4:5) - liquid/shattered glass + our logo + our app icons.
Framework: fansa-knowledge/raw/image_research/IMAGE_HOOK_FRAMEWORK.md (hooks H1-H12, font combos T1-T3, colour combos C1-C5).
Run: pip install playwright pillow && playwright install chromium && python glass5/build.py   -> glass5/out/*.png + QA report
"""
import json, math, pathlib, random, sys
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent.resolve()
OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
W, H, M = 1080, 1350, 72
PHI = 1.618
# type scale (base 20, ratio chosen per image mood - framework section 4); rank1 may use poster sizes
def scale(r): return [round(20 * r ** n) for n in range(9)]
P = dict(main="#6468D8", accent="#D88264", neutral="#ACADD8", paper="#F0F0F7", ink="#0E0E1A", cream="#F3EEE6")
F = lambda n: (HERE / "fonts" / n).as_uri()
I = lambda s: (HERE / "icons" / f"{s}.png").as_uri()
LOGO = (HERE / "logo-fansa.png").as_uri()

CSS = f"""
@font-face{{font-family:Anton;src:url({F('Anton-400.woff2')})}}
@font-face{{font-family:ISerif;font-style:italic;src:url({F('InstrumentSerif-italic.woff2')})}}
@font-face{{font-family:ISerifR;src:url({F('InstrumentSerif-400.woff2')})}}
@font-face{{font-family:Inter;font-weight:500;src:url({F('InterTight-500.woff2')})}}
@font-face{{font-family:Inter;font-weight:700;src:url({F('InterTight-700.woff2')})}}
@font-face{{font-family:Mono;src:url({F('JetBrainsMono-500.woff2')})}}
@font-face{{font-family:Sora;font-weight:400;src:url({F('Sora-400.woff2')})}}
@font-face{{font-family:Sora;font-weight:700;src:url({F('Sora-700.woff2')})}}
@font-face{{font-family:Playfair;src:url({F('PlayfairDisplay-700.woff2')})}}
@font-face{{font-family:Grotesk;src:url({F('SpaceGrotesk-500.woff2')})}}
@font-face{{font-family:BigS;src:url({F('BigShouldersDisplay-800.woff2')})}}
@font-face{{font-family:DMSerif;src:url({F('DMSerifDisplay-400.woff2')})}}
@font-face{{font-family:Bebas;src:url({F('BebasNeue-400.woff2')})}}
@font-face{{font-family:Fraunces;src:url({F('Fraunces-600.woff2')})}}
@font-face{{font-family:League;src:url({F('LeagueGothic-400.woff2')})}}
@font-face{{font-family:Manrope;src:url({F('Manrope-500.woff2')})}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-variant-numeric:lining-nums;width:{W}px;height:{H}px;overflow:hidden;position:relative;font-family:Inter}}
.abs{{position:absolute}} svg.abs{{pointer-events:none}}
.anton{{font-family:Anton;line-height:.86;letter-spacing:-.01em;text-transform:uppercase}}
.serif{{font-family:ISerif;font-style:italic;font-weight:400}}
.inter{{font-family:Inter;font-weight:500}} .b{{font-weight:700}}
.mono{{font-family:Mono}} .sora{{font-family:Sora}} .play{{font-family:Playfair}} .grot{{font-family:Grotesk}}
.meta{{font-family:inherit;font-size:20px;letter-spacing:.14em;text-transform:uppercase}}
/* paper grain + halftone so no background is flat */
.grain{{position:absolute;inset:0;pointer-events:none;opacity:.22;mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}}
.halftone{{position:absolute;pointer-events:none;background-image:radial-gradient(currentColor 1.6px,transparent 1.8px);background-size:14px 14px}}
/* liquid glass */
.glass{{background:linear-gradient(135deg,rgba(255,255,255,.42),rgba(255,255,255,.10) 45%,rgba(255,255,255,.22));
  backdrop-filter:blur(14px) saturate(1.7) brightness(1.06);-webkit-backdrop-filter:blur(14px) saturate(1.7);
  border:1.5px solid rgba(255,255,255,.75);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.95),inset 0 -14px 30px rgba(255,255,255,.18),inset 6px 0 14px rgba(120,140,255,.22),
    inset -6px 0 14px rgba(255,150,120,.20),0 30px 60px rgba(14,14,26,.22)}}
.lite{{backdrop-filter:blur(2px) saturate(1.4);-webkit-backdrop-filter:blur(2px);background:linear-gradient(135deg,rgba(255,255,255,.30),rgba(255,255,255,.04) 50%,rgba(255,255,255,.16))}}
.shard{{position:absolute;background:linear-gradient(130deg,rgba(255,255,255,.75),rgba(255,255,255,.12) 55%,rgba(200,210,255,.35));
  backdrop-filter:blur(6px) saturate(1.6);-webkit-backdrop-filter:blur(6px);filter:drop-shadow(0 10px 14px rgba(14,14,26,.25))}}
.sticker{{position:absolute;background:#fff;border-radius:24%;display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 0 6px #fff,0 14px 30px rgba(14,14,26,.28)}}
.sticker img{{width:64%;height:64%;object-fit:contain}}
.chip{{display:inline-flex;align-items:center;gap:10px;border-radius:999px;padding:14px 24px}}
"""

def splash(cx, cy, r, color, seed, drops=14):
    """Generated ink splash (ours, no licence): displaced blob + droplets."""
    rnd = random.Random(seed)
    d = "".join(f'<circle cx="{cx + math.cos(a) * dist:.0f}" cy="{cy + math.sin(a) * dist:.0f}" r="{rr:.0f}" fill="{color}"/>'
                for a, dist, rr in [(rnd.uniform(0, 6.28), r * rnd.uniform(1.05, 1.6), rnd.uniform(5, 26)) for _ in range(drops)])
    return f'''<svg class="abs" style="left:0;top:0" width="{W}" height="{H}"><defs><filter id="ink{seed}" x="-50%" y="-50%" width="200%" height="200%">
<feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="{seed}"/><feDisplacementMap in="SourceGraphic" scale="{r * .9:.0f}"/></filter></defs>
<g filter="url(#ink{seed})"><circle cx="{cx}" cy="{cy}" r="{r}" fill="{color}"/><ellipse cx="{cx + r * .5}" cy="{cy - r * .35}" rx="{r * .7}" ry="{r * .45}" fill="{color}"/></g>{d}</svg>'''

def shards(cx, cy, n, spread, seed, size=(40, 140)):
    rnd = random.Random(seed); out = []
    for _ in range(n):
        a = rnd.uniform(0, 6.28); dist = rnd.uniform(spread * .35, spread)
        s = rnd.uniform(*size); x, y = cx + math.cos(a) * dist - s / 2, cy + math.sin(a) * dist - s / 2
        pts = ",".join(f"{rnd.uniform(0, 100):.0f}% {rnd.uniform(0, 100):.0f}%" for _ in range(3))
        out.append(f'<div class="shard" style="left:{x:.0f}px;top:{y:.0f}px;width:{s:.0f}px;height:{s * rnd.uniform(.6, 1.4):.0f}px;'
                   f'clip-path:polygon({pts});transform:rotate({rnd.uniform(-60, 60):.0f}deg)"></div>')
    return "".join(out)

def crack(x, top, bottom, seed, color="rgba(255,255,255,.95)"):
    rnd = random.Random(seed); pts = []; y = top
    while y < bottom: pts.append(f"{x + rnd.uniform(-38, 38):.0f},{y:.0f}"); y += rnd.uniform(40, 90)
    pts.append(f"{x:.0f},{bottom}")
    branches = "".join(f'<polyline points="{p} {float(p.split(",")[0]) + rnd.choice([-1, 1]) * rnd.uniform(40, 120):.0f},{float(p.split(",")[1]) + rnd.uniform(-60, 60):.0f}" '
                       f'stroke="{color}" stroke-width="2" fill="none"/>' for p in pts[1:-1:2])
    return f'<svg class="abs" style="left:0;top:0" width="{W}" height="{H}"><polyline points="{" ".join(pts)}" stroke="{color}" stroke-width="3.5" fill="none"/>{branches}</svg>'

def sticker(s, x, y, size, rot):
    return f'<div class="sticker" style="left:{x}px;top:{y}px;width:{size}px;height:{size}px;transform:rotate({rot}deg)"><img src="{I(s)}"></div>'

def brand(color, x=M, y=H - M - 40):
    return (f'<div class="abs" style="left:{x}px;top:{y}px;display:flex;align-items:center;gap:12px"><img src="{LOGO}" style="width:40px;height:40px">'
            f'<span data-rank="5" style="font-size:20px;font-weight:700;color:{color}">FansaChat</span></div>')

def meta_row(text_l, text_r, color):
    return (f'<div class="abs meta" data-rank="5" style="left:{M}px;top:{M}px;color:{color}">{text_l}</div>'
            f'<div class="abs meta" data-rank="5" style="right:{M}px;top:{M}px;color:{color}">{text_r}</div>'
            f'<div class="abs" style="left:{M}px;right:{M}px;top:{M + 34}px;height:1.5px;background:{color};opacity:.5"></div>')

IMGS = []

# 1 ── H10 "One small shift" + founder's Option-1 reference: the pane splits, our logo bursts out between the shards.
IMGS.append(("01_glass_burst_one_sentence", f"""
<body style="background:radial-gradient(120% 80% at 50% 45%,#FFFFFF 0%,{P['paper']} 45%,#DCDCF0 100%)">
<div class="grain"></div>
{meta_row("Issue 01 · Automation, rewritten", "fansachat.com", P['ink'])}
<div class="abs anton" data-rank="1" data-layer="behind" style="left:{M}px;top:120px;font-size:581px;color:{P['ink']}">One</div>
<div class="abs anton" data-rank="1" data-layer="behind" style="left:{M}px;top:640px;font-size:222px;color:{P['main']}">sentence.</div>
<!-- the two glass panes parting -->
<div class="abs glass lite" style="left:-20px;top:300px;width:560px;height:760px;clip-path:polygon(0 0,100% 0,90% 18%,100% 37%,86% 58%,98% 79%,88% 100%,0 100%)"></div>
<div class="abs glass lite" style="left:552px;top:300px;width:548px;height:760px;clip-path:polygon(8% 0,100% 0,100% 100%,2% 100%,12% 80%,0 61%,14% 40%,3% 20%)"></div>
<!-- light from the gap -->
<div class="abs" style="left:420px;top:380px;width:240px;height:680px;background:radial-gradient(closest-side,rgba(255,255,255,.95),rgba(216,130,100,.35),transparent);filter:blur(10px)"></div>
{shards(540, 700, 26, 420, 7)}
<img class="abs" src="{LOGO}" style="left:300px;top:420px;width:480px;height:480px;filter:drop-shadow(0 30px 40px rgba(14,14,26,.35))">
<div class="abs" style="left:{M}px;top:1030px;width:600px">
  <div class="serif" data-rank="3" style="font-size:52px;color:{P['ink']};line-height:1.05">A completely different Monday.</div>
  <div class="inter" data-rank="4" style="font-size:32px;color:{P['ink']};margin-top:14px;line-height:1.3">Type what you want. FansaChat builds the workflow.</div>
</div>
<div class="abs chip glass" style="right:{M}px;top:1140px"><span class="inter b" data-rank="4" style="font-size:32px;color:{P['ink']}">Join the waitlist</span></div>
{brand(P['ink'])}
</body>""", 1.618, 10))

# 2 ── H1 Number list, slide 1 of a 6-slide carousel. Giant 5, generated ink splash, glass sentence card, icon stickers.
IMGS.append(("02_number_5_automations", f"""
<body style="background:{P['ink']}">
<div class="halftone" style="inset:0;color:rgba(100,104,216,.22)"></div>
{splash(620, 560, 300, P['accent'], 11)}
{meta_row("Automations 01/06", "Swipe →", P['paper'])}
<div class="abs anton" data-rank="1" data-layer="behind" style="left:250px;top:130px;font-size:941px;color:{P['paper']}">5</div>
{sticker('stripe', 120, 240, 150, -10)}{sticker('gmail', 820, 220, 130, 8)}{sticker('telegram-bot', 860, 620, 120, -6)}
{sticker('google-sheets', 90, 640, 120, 7)}{sticker('calendly', 760, 880, 110, 12)}
<div class="abs glass" style="left:{M}px;top:930px;width:640px;border-radius:30px 30px 30px 8px;padding:24px 28px">
  <div class="mono" data-rank="4" style="font-size:32px;line-height:1.35;color:#fff">"When a Stripe invoice is 7 days overdue, email the client and tell me on Telegram."</div></div>
<div class="abs" style="left:{M}px;top:1095px;width:{W - 2 * M}px">
  <div class="inter b" data-rank="2" style="font-size:52px;color:{P['paper']};line-height:1.05">automations every freelancer needs <span class="serif" style="color:{P['accent']}">in 2026</span></div></div>
{brand(P['paper'])}
</body>""", 1.618, 1))

# 3 ── H5 Before -> after. Top: the 7 real manual steps on a shattered pane. Bottom: one clean liquid-glass bubble.
steps = ["Open Stripe", "Find overdue invoices", "Copy the client's email", "Open Gmail", "Write the reminder", "Send it", "Message yourself on Telegram"]
shard_steps = "".join(
    f'<div class="abs inter" data-rank="4" style="left:{x}px;top:{y}px;font-size:32px;color:#5A5A70;transform:rotate({r}deg)"><s>{i + 1}. {t}</s></div>'
    for i, (t, (x, y, r)) in enumerate(zip(steps, [(80, 420, -3), (560, 410, 4), (110, 490, 2), (600, 490, -5), (90, 570, -2), (640, 575, 3), (220, 645, -1)])))
IMGS.append(("03_before_after_7_steps", f"""
<body style="background:linear-gradient(180deg,#E7E6EE 0%,#E7E6EE 55%,{P['paper']} 55%)">
<div class="grain"></div>
{meta_row("The old way breaks", "01/06", P['ink'])}
<div class="abs anton" data-rank="1" style="left:{M}px;top:130px;font-size:137px;color:{P['ink']}">7 steps →<br><span style="color:{P['main']}">1 sentence.</span></div>
{shard_steps}
{crack(330, 400, 700, 3, "rgba(14,14,26,.55)")}{crack(780, 400, 700, 5, "rgba(14,14,26,.55)")}
{shards(540, 700, 18, 300, 21, (30, 90))}
{splash(540, 950, 230, P['accent'], 23, 10)}
<div class="abs glass" style="left:110px;top:800px;width:860px;border-radius:40px 40px 40px 10px;padding:34px 40px">
  <div class="meta" data-rank="5" style="color:{P['ink']};margin-bottom:12px">With FansaChat, you type</div>
  <div class="mono" data-rank="3" style="font-size:52px;line-height:1.2;color:{P['ink']}">"Email overdue clients and tell me on Telegram."</div></div>
<div class="abs" style="left:{M}px;top:1130px;width:700px">
  <div class="serif" data-rank="4" style="font-size:32px;color:{P['ink']}">700+ integrations. Edit by chatting.</div></div>
{sticker('stripe', 820, 1060, 96, -8)}{sticker('gmail', 920, 1130, 84, 10)}{sticker('telegram-bot', 840, 1180, 80, -4)}
{brand(P['ink'])}
</body>""", 1.618, 5))

# 4 ── H1/H9 Price: 4 plans as liquid-glass cards on a broken grid (Team biggest). Luxury combo T2.
cards = [("Starter", "$15", "2,000 runs", 72, 520, 440, 300), ("Pro", "$45", "10,000 runs", 568, 470, 440, 300),
         ("Team", "$149", "30,000 runs", 72, 850, 520, 330), ("Scale", "$299", "100,000 runs", 616, 800, 392, 300)]
card_html = "".join(f"""<div class="abs glass" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;border-radius:32px;padding:30px">
  <div class="sora b" data-rank="4" style="font-size:32px;color:#fff">{n}</div>
  <div class="play" data-rank="2" style="font-size:137px;color:#fff;line-height:1.05">{p}</div>
  <div data-rank="4" style="font-size:32px;color:{P['paper']}">{r} / mo</div></div>""" for n, p, r, x, y, w, h in cards)
IMGS.append(("04_four_plans_zero_seats", f"""
<body style="font-family:Sora;background:radial-gradient(90% 70% at 70% 30%,#2A2C6E 0%,{P['ink']} 70%)">
<div class="grain" style="opacity:.35;mix-blend-mode:screen"></div>
{splash(300, 900, 260, P['main'], 31)}{splash(860, 560, 180, P['accent'], 37, 8)}
{meta_row("Pricing · launching November", "fansachat.com", P['paper'])}
<div class="abs" style="left:{M}px;top:150px;width:{W - 2 * M}px">
  <div class="play" data-rank="1" style="font-size:222px;color:{P['paper']};line-height:.95">4 plans.</div>
  <div class="play" data-rank="3" style="font-size:85px;color:{P['accent']};line-height:1.1">0 seat fees.</div></div>
{card_html}
<div class="abs" data-rank="4" style="left:{M}px;top:1195px;width:740px;font-size:32px;color:{P['paper']}">Unlimited users and workflows on every plan.</div>
{brand(P['paper'], x=W - M - 190, y=1205)}
</body>""", 1.618, 1))

# 5 ── H1 "700+" integration explosion: shattered glass ring, logo in the centre, our app icons flying out (maximalism, C3).
ring = ["slack", "notion", "hubspot", "shopify", "airtable", "google-calendar", "trello", "asana", "discord", "mailchimp", "google-drive",
        "typeform", "clickup", "github", "quickbooks", "xero", "zendesk", "intercom", "woocommerce", "linear", "todoist", "monday", "jira-cloud",
        "stripe", "gmail", "google-sheets", "calendly", "telegram-bot"]
rnd = random.Random(5); icons = []
for k, s in enumerate(ring):
    a = k / len(ring) * 6.283 + rnd.uniform(-.1, .1); dist = rnd.uniform(300, 470); size = rnd.randint(70, 118)
    x, y = 540 + math.cos(a) * dist - size / 2, 720 + math.sin(a) * dist * .85 - size / 2
    if 140 < y < 520 and x < 700: continue  # keep the headline zone clear
    icons.append(sticker(s, int(x), int(y), size, rnd.randint(-18, 18)))
IMGS.append(("05_700_apps_one_sentence", f"""
<body style="font-family:Sora;background:radial-gradient(80% 60% at 50% 55%,#8A8DEB 0%,{P['main']} 55%,#3E41A8 100%)">
<div class="grain" style="opacity:.3"></div>
{splash(540, 720, 250, P['accent'], 41, 18)}
{shards(540, 720, 34, 520, 43)}
<div class="abs glass" style="left:330px;top:510px;width:420px;height:420px;border-radius:50%"></div>
<img class="abs" src="{LOGO}" style="left:375px;top:555px;width:330px;height:330px;filter:drop-shadow(0 24px 30px rgba(14,14,26,.4))">
{''.join(icons)}
<div class="abs anton" data-rank="1" style="left:{M}px;top:120px;font-size:359px;color:{P['paper']}">700+</div>
<div class="abs" style="left:{M}px;top:1110px;width:{W - 2 * M}px">
  <div class="sora b" data-rank="2" style="font-size:85px;color:{P['paper']};line-height:1">apps. <span class="serif" style="color:{P['ink']};font-weight:400">One sentence.</span></div></div>
{brand(P['paper'], x=W - M - 190, y=1225)}
</body>""", 1.618, 1))

# ══ v2 (founder review 2026-10-16): 01 and 03 kept; 02, 04, 05 redesigned ══════════════════
# 2 ── Hook: pain QUESTION (relatability-1 "If you're X struggling with Y") + indirect answer "You might need this."
#      Background: Swiss diagonal colour bands (ref design_refs/swiss-design, MIT-style stripe poster); workflow diagram of 5 apps.
def node(s, x, y, label, size=112, hi=False):
    shadow = (f"box-shadow:0 0 0 8px {P['accent']},0 0 60px 18px rgba(216,130,100,.55),0 18px 30px rgba(0,0,0,.35);" if hi
              else "box-shadow:0 0 0 5px #fff,0 16px 28px rgba(0,0,0,.35);")
    img = LOGO if s == "fansa" else I(s)
    return (f'<div class="abs" style="left:{x - size // 2}px;top:{y - size // 2}px;width:{size}px;height:{size}px;background:#fff;border-radius:26%;'
            f'display:flex;align-items:center;justify-content:center;{shadow}"><img src="{img}" style="width:70%;height:70%;object-fit:contain"></div>'
            f'<div class="abs" data-rank="5" style="font-family:Grotesk;left:{x - 120}px;top:{y + size // 2 + 14}px;width:240px;text-align:center;font-size:20px;color:{P["paper"]}"><span style="background:{P["ink"]};padding:4px 10px;border-radius:8px">{label}</span></div>')
WF = [("fansa", 210, 800, "FansaChat builds it", 150, True), ("stripe", 520, 690, "Invoice 7 days overdue", 112, False),
      ("gmail", 840, 690, "Email the client", 112, False), ("telegram-bot", 840, 950, "Tell me on Telegram", 112, False),
      ("google-sheets", 520, 950, "Log it in Sheets", 112, False)]
edges = [(0, 1), (1, 2), (2, 3), (1, 4)]
wf_lines = "".join(f'<line x1="{WF[a][1]}" y1="{WF[a][2]}" x2="{WF[b][1]}" y2="{WF[b][2]}" stroke="{P["paper"]}" stroke-width="6" stroke-dasharray="2 16" stroke-linecap="round"/>' for a, b in edges)
IMGS[1] = ("02_question_invoices_workflow", f"""
<body style="font-family:Grotesk;background:{P['ink']}">
<svg class="abs" style="left:0;top:0" width="{W}" height="{H}"><defs><clipPath id="band"><rect x="0" y="530" width="{W}" height="530"/></clipPath></defs>
  <g clip-path="url(#band)"><polygon points="-260,1350 -90,1350 1230,30 1060,30" fill="{P['main']}" opacity=".55"/>
  <polygon points="-90,1350 10,1350 1330,30 1230,30" fill="{P['accent']}" opacity=".55"/>
  <polygon points="10,1350 60,1350 1380,30 1330,30" fill="{P['neutral']}" opacity=".5"/></g>
  {wf_lines}</svg>
<div class="halftone" style="left:0;top:0;width:{W}px;height:430px;color:rgba(240,240,247,.07)"></div>
{meta_row("Invoices · freelancers", "fansachat.com", P['paper'])}
<div class="abs" style="left:{M}px;top:140px;width:{W - 2 * M}px">
  <div data-rank="1" style="font-family:BigS;font-size:137px;line-height:.9;color:{P['paper']};text-transform:uppercase">Too busy chasing invoices</div>
  <div data-rank="2" style="font-family:DMSerif;font-size:85px;line-height:1.02;color:{P['accent']};margin-top:14px">and messaging clients?</div></div>
{''.join(node(*n) for n in WF)}
<div class="abs" style="left:{M}px;top:1110px;width:720px">
  <div data-rank="2" style="font-family:Grotesk;font-size:52px;color:{P['paper']}">You might need this.</div>
  <div data-rank="4" style="font-family:Grotesk;font-size:32px;color:{P['neutral']};margin-top:8px">One sentence. The whole chase, automated.</div></div>
{brand(P['paper'], x=W - M - 190, y=1225)}
</body>""", 1.618, "relatability-1 pain question")

# 4 ── Hook: contrast "Your team grows. Your bill shouldn't." (authority-4 hidden cost). Bauhaus grid background
#      (ref design_refs/bauhaus, Wiegand square/circle poster). No splash, no glass: solid Bauhaus blocks.
tiers = [("Starter", "$15", "2,000 runs"), ("Pro", "$45", "10,000 runs"), ("Team", "$149", "30,000 runs"), ("Scale", "$299", "100,000 runs")]
cols = [P['paper'], P['main'], P['accent'], P['ink']]; txt = [P['ink'], P['paper'], P['ink'], P['paper']]
blocks = "".join(f"""<div class="abs" style="left:{M + (i % 2) * 476}px;top:{715 + (i // 2) * 236}px;width:460px;height:220px;background:{cols[i]};padding:22px 30px">
  <div data-rank="4" style="font-family:Grotesk;font-size:32px;color:{txt[i]}">{n}</div>
  <div data-rank="2" style="font-family:Bebas;font-size:137px;line-height:.9;color:{txt[i]}">{p}<span style="font-family:Grotesk;font-size:20px"> /mo</span></div>
  <div data-rank="5" style="font-family:Grotesk;font-size:20px;color:{txt[i]}">{r} a month</div></div>""" for i, (n, p, r) in enumerate(tiers))
bauhaus = "".join(f'<div class="abs" style="left:{x}px;top:{y}px;width:{s}px;height:{s}px;background:{c};{"border-radius:50%;" if circ else ""}"></div>'
                  for x, y, s, c, circ in [(860, 330, 150, P['main'], True), (940, 440, 90, P['accent'], False)])
grid = "".join(f'<line x1="{x}" y1="0" x2="{x}" y2="{H}"/>' for x in range(M, W, 78)) + "".join(f'<line x1="0" y1="{y}" x2="{W}" y2="{y}"/>' for y in range(M, H, 78))
IMGS[3] = ("04_team_grows_bill_doesnt", f"""
<body style="font-family:Grotesk;background:{P['cream']}">
<div class="grain"></div>
<svg class="abs" style="left:0;top:0" width="{W}" height="{H}"><g stroke="{P['ink']}" stroke-opacity=".10" stroke-width="1.5">{grid}</g></svg>
{bauhaus}
{meta_row("Pricing · launching November", "fansachat.com", P['ink'])}
<div class="abs" style="left:{M}px;top:140px;width:{W - 2 * M}px">
  <div data-rank="1" style="font-family:Bebas;font-size:222px;line-height:.86;color:{P['ink']}">Your team grows.</div>
  <div data-rank="2" style="font-family:Fraunces;font-size:85px;line-height:1;color:{P['main']};margin-top:16px">Your bill shouldn't.</div></div>
{blocks}
<div class="abs" data-rank="4" style="left:{M}px;top:1205px;width:600px;font-family:Grotesk;font-size:32px;color:{P['ink']}">Unlimited users on every plan.</div>
{brand(P['ink'], x=W - M - 190, y=1225)}
</body>""", 1.618, "authority-4 hidden-cost contrast")

# 5 ── Hook: "If you use any of these, pay attention." (ad hook 1 PAY ATTENTION). Sunburst background
#      (ref design_refs/maximalism ray poster) radiating from our highlighted logo; icons on an orbit; text zones kept clear.
rays = "".join(f'<polygon points="540,760 {540 + math.cos(a) * 1600:.0f},{760 + math.sin(a) * 1600:.0f} {540 + math.cos(a + .13) * 1600:.0f},{760 + math.sin(a + .13) * 1600:.0f}" fill="{P["paper"]}" opacity=".10"/>'
               for a in [k * .26 for k in range(25)])
ring5 = ["gmail", "slack", "shopify", "notion", "hubspot", "stripe", "google-sheets", "calendly", "airtable", "trello", "asana", "discord", "mailchimp", "typeform", "clickup", "github"]
icons5 = "".join(sticker(s, int(540 + math.cos(k / len(ring5) * 6.283) * 360 - 45), int(760 + math.sin(k / len(ring5) * 6.283) * 220 - 45), 90, (k % 5 - 2) * 5)
                 for k, s in enumerate(ring5))
IMGS[4] = ("05_if_you_use_these", f"""
<body style="font-family:Grotesk;background:radial-gradient(70% 55% at 50% 56%,#8A8DEB 0%,{P['main']} 60%,#34378F 100%)">
<svg class="abs" style="left:0;top:0" width="{W}" height="{H}">{rays}</svg>
<div class="grain" style="opacity:.25"></div>
{meta_row("700+ integrations", "fansachat.com", P['paper'])}
<div class="abs" style="left:{M}px;top:140px;width:{W - 2 * M}px">
  <div data-rank="1" style="font-family:League;font-size:137px;line-height:.9;color:{P['paper']};text-transform:uppercase">If you use any of these,</div>
  <div data-rank="2" style="font-family:DMSerif;font-size:85px;line-height:1;color:{P['ink']};margin-top:10px">pay attention.</div></div>
<div class="abs" style="left:415px;top:635px;width:250px;height:250px;border-radius:50%;background:#fff;box-shadow:0 0 0 10px {P['accent']},0 0 90px 30px rgba(216,130,100,.6)"></div>
<img class="abs" src="{LOGO}" style="left:440px;top:660px;width:200px;height:200px">
{icons5}
<div class="abs" style="left:{M}px;top:1070px;width:{W - 2 * M}px">
  <div data-rank="2" style="font-family:Grotesk;font-size:52px;color:{P['paper']};line-height:1.1">700+ apps. One sentence.</div>
  <div data-rank="4" style="font-family:Grotesk;font-size:32px;color:{P['paper']};margin-top:10px">Join the waitlist: fansachat.com</div></div>
{brand(P['paper'], x=W - M - 190, y=1240)}
</body>""", 1.618, "ad-hook-1 PAY ATTENTION")

# ── QA (framework section 9) ──────────────────────────────────────────────
QA = """([m, allowed, W, H]) => {
 const out = [], els = [...document.querySelectorAll('[data-rank]')];
 const B = els.map(e => ({e, r: e.getBoundingClientRect(), rank: +e.dataset.rank, fs: parseFloat(getComputedStyle(e).fontSize),
   fam: getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g,''), behind: e.dataset.layer === 'behind'}));
 for (const b of B) {
   if (!allowed[b.rank].some(s => Math.abs(s - b.fs) <= 2)) out.push(`size ${b.fs}px not on scale for rank ${b.rank}: "${b.e.textContent.trim().slice(0,24)}"`);
   if (!b.behind && (b.r.left < m - 1 || b.r.right > W - m + 1 || b.r.top < m - 1 || b.r.bottom > H - m + 1)) out.push(`outside safe zone: "${b.e.textContent.trim().slice(0,24)}"`);
   if (b.e.scrollWidth > b.e.clientWidth + 2) out.push(`overflow: "${b.e.textContent.trim().slice(0,24)}"`);
 }
 const T = B.filter(b => !b.behind && !B.some(o => o !== b && b.e.contains(o.e)));
 for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) { const a = T[i].r, c = T[j].r;
   if (a.left < c.right - 2 && c.left < a.right - 2 && a.top < c.bottom - 2 && c.top < a.bottom - 2) out.push(`overlap: "${T[i].e.textContent.trim().slice(0,16)}" x "${T[j].e.textContent.trim().slice(0,16)}"`); }
 const mx = r => Math.max(0, ...B.filter(b => b.rank === r).map(b => b.fs));
 for (let r = 1; r < 5; r++) if (mx(r) && mx(r + 1) > mx(r)) out.push(`hierarchy: rank ${r + 1} bigger than rank ${r}`);
 const fams = new Set([...document.querySelectorAll('body *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
   .map(e => getComputedStyle(e).fontFamily.split(',')[0].replace(/"/g,'')));
 if (fams.size < 2 || fams.size > 4) out.push(`font families ${fams.size} (${[...fams].join(', ')}), want 2-3 (+mono)`);
 for (const b of B.filter(b => b.rank <= 2 && !b.behind)) { const r = b.r; let hit = 0, n = 0;
   for (let fx = .1; fx < 1; fx += .2) for (let fy = .3; fy < .8; fy += .2) { n++; const el = document.elementFromPoint(r.left + r.width * fx, r.top + r.height * fy); if (el && !b.e.contains(el) && !el.contains(b.e)) hit++; }
   if (hit / n > .15) out.push(`main text covered ${Math.round(hit / n * 100)}%: "${b.e.textContent.trim().slice(0,20)}"`); }
 return {issues: out, fonts: [...fams]}; }"""

def allowed_sizes(ratio):
    s = scale(ratio)  # 20,32,52,85,137,222,359,581,941 for phi
    return {1: s[3:], 2: s[2:6], 3: s[2:5], 4: s[1:3], 5: s[0:2]}

def flat_check(png):
    from PIL import Image, ImageStat
    im = Image.open(png).convert("L").resize((108, 135)); return ImageStat.Stat(im).stddev[0]

fails = 0; report = []
with sync_playwright() as pw:
    import os; br = pw.chromium.launch(channel=os.environ.get("PW_CHANNEL") or None)
    for name, body, ratio, hook in IMGS:
        html = f"<!doctype html><html><head><meta charset=utf-8><style>{CSS}</style></head>{body}</html>"
        f = OUT / f"{name}.html"; f.write_text(html, encoding="utf-8")
        pg = br.new_page(viewport={"width": W, "height": H}); pg.goto(f.as_uri()); pg.wait_for_timeout(600)
        pg.evaluate("document.fonts.ready"); png = OUT / f"{name}.png"; pg.screenshot(path=str(png))
        res = pg.evaluate(QA, [M, {str(k): v for k, v in allowed_sizes(ratio).items()}, W, H])
        sd = flat_check(png)
        if sd < 12: res["issues"].append(f"background looks flat (stddev {sd:.1f})")
        # thumbnail test: render at feed size for eyeballing
        from PIL import Image; Image.open(png).resize((270, 338)).save(OUT / f"{name}_thumb.png")
        fails += bool(res["issues"])
        line = f"{name}: hook {hook} · fonts {res['fonts']} · {'PASS' if not res['issues'] else 'FAIL ' + '; '.join(res['issues'])}"
        print(line); report.append(line); pg.close()
    br.close()
(OUT / "QA.txt").write_text("\n".join(report), encoding="utf-8")
sys.exit(1 if fails else 0)
