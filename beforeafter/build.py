"""beforeafter: 10 FansaChat BEFORE/AFTER posts, each = 1 split post + 2 carousel slides (1080x1350 PNG).
House style: glass5 (fonts, icons, logo, cta.py). Real UI = frames cut from public/real/P0x_ui.webm.
Run: python beforeafter/build.py   -> beforeafter/out/*.png + out/QA.txt
Needs: playwright (chromium), ffmpeg.
"""
import json, os, pathlib, random, re, subprocess, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "glass5"))
from cta import cta
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent.resolve()
ROOT = HERE.parent
G5 = ROOT / "glass5"
OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
FR = HERE / "frames"; FR.mkdir(exist_ok=True)
HTML = HERE / "_html"; HTML.mkdir(exist_ok=True)
W, H = 1080, 1350
F = lambda n: (G5 / "fonts" / n).as_uri()
def I(s):
    p = G5 / "icons" / f"{s}.png"
    return p.as_uri()
LOGO = (G5 / "logo-fansa.png").as_uri()

# ---------- real UI frames (ffmpeg from our own screen recordings) ----------
FRAMES = {"P05": ("P05_ui.webm", 43.5), "P06": ("P06_ui.webm", 35.2), "P07": ("P07_ui.webm", 37.1), "SHAPE": ("P05_ui.webm", 36.0)}
for k, (vid, t) in FRAMES.items():
    dst = FR / f"{k}.png"
    if not dst.exists():
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", str(ROOT / "public" / "real" / vid), "-frames:v", "1", str(dst)], check=True)
EMPTY = ROOT / "public" / "real" / "P05_still_empty.png"
# (file, sx, sy, sw, sh) crop boxes in the 1920x1080 frames
UI = {
    "steps_P05": (FR / "P05.png", 20, 335, 535, 520),
    "steps_P06": (FR / "P06.png", 20, 335, 535, 520),
    "steps_P07": (FR / "P07.png", 20, 335, 535, 520),
    "shape": (FR / "SHAPE.png", 908, 262, 680, 612),
    "empty": (EMPTY, 16, 395, 554, 650),
}

# ---------- palettes (AFTER side) ----------
PAL = {  # bg0, bg1, ink, accent, soft
    "teal":  ("#F3FCF9", "#C6EBE0", "#0E2A26", "#0B7A6E", "#BFEBDD"),
    "amber": ("#FFF7EA", "#F6DDB4", "#2B1E0C", "#B45309", "#FBD9A0"),
    "blue":  ("#F2F8FF", "#C5DBF6", "#0F2340", "#1D5FD0", "#BBD6FB"),
    "rose":  ("#FFF4F4", "#F7CFCF", "#32121A", "#BE123C", "#F9C6D0"),
    "green": ("#F5FBEC", "#D3E9AE", "#17260A", "#3F7D12", "#CDE8A4"),
    "cyan":  ("#EEFBFE", "#B8E4F0", "#0A2A33", "#0E7490", "#B3E3EF"),
    "slate": ("#F4F6FA", "#D0D8E8", "#16203A", "#33509A", "#C9D5F0"),
    "coral": ("#FFF5F0", "#F8D0BE", "#34150B", "#C2410C", "#FAD0B8"),
    "lime":  ("#FBFCE8", "#E4EDA6", "#242A06", "#5C7A0A", "#E1ECA0"),
}

POSTS = [
 dict(n="01", slug="booked_call_prep", title="Booked call, prep ready", area="Sales", pal="teal", ui="steps_P05",
      pain="A call gets booked. The prep is **scattered** across four tabs.",
      chips=["Copy the name", "Paste into Notion", "Ping the team?"],
      pile=["calendly", "gmail", "google-calendar", "notion", "google-docs", "slack", "google-sheets", "google-drive"],
      after="Every booked call gets a **prep page** and a **Slack heads-up** in seconds.",
      flow=[("calendly", "Call booked"), ("notion", "Prep page"), ("slack", "Team heads-up")],
      saved="About 10 minutes of prep admin per call, gone."),
 dict(n="02", slug="client_request_alert", title="Client request to task and alert", area="Agency", pal="amber", ui="steps_P06",
      pain="A client request lands in an inbox and **sits there** until someone notices.",
      chips=["Who saw this?", "Forwarded again", "Due today?"],
      pile=["gmail", "slack", "notion", "trello", "asana", "microsoft-outlook", "typeform", "whatsapp"],
      after="Every client request becomes a **Notion task** and a **Slack alert** at once.",
      flow=[("typeform", "Client request"), ("notion", "Task, due today"), ("slack", "Alert to team")],
      saved="No more forwarding and retyping each request."),
 dict(n="03", slug="project_brief_to_notion", title="Project brief saved and sent to you", area="Freelancer", pal="blue", ui="steps_P07",
      pain="Briefs arrive in **different places**. Budget and deadline get lost.",
      chips=["Budget in a DM", "Deadline in a mail", "Which doc?"],
      pile=["gmail", "typeform", "notion", "slack", "google-docs", "whatsapp", "dropbox", "google-drive"],
      after="New brief in. **Notion page** made. **Budget and deadline** in your Slack.",
      flow=[("typeform", "New brief"), ("notion", "Brief page"), ("slack", "Message to you")],
      saved="Every brief stored the same way, in seconds."),
 dict(n="04", slug="blog_post_to_socials", title="One blog post, drafts for every network", area="Marketing", pal="rose", ui="shape",
      pain="One blog post means **an hour** of rewriting captions for every network.",
      chips=["Rewrite for LinkedIn", "Resize for Instagram", "Schedule each one"],
      pile=["wordpress", "buffer", "instagram-business", "facebook-pages", "canva", "google-docs", "mailchimp", "bluesky"],
      after="Publish once. **Post drafts** for every network are **ready in minutes**.",
      flow=[("wordpress", "New blog post"), ("openai", "Captions written"), ("buffer", "Posts queued"), ("instagram-business", "Instagram post")],
      saved="Cuts about an hour of caption work per post."),
 dict(n="05", slug="support_email_to_ticket", title="Support email to ticket and owner", area="Support", pal="green", ui="empty",
      pain="Support emails pile up in a shared inbox. **Nobody owns** them.",
      chips=["Who is replying?", "Seen it, did you?", "Reply Monday"],
      pile=["gmail", "help-scout", "zendesk", "slack", "microsoft-outlook", "intercom", "google-sheets", "microsoft-teams"],
      after="Every support email becomes a **ticket** and pings the **right person**.",
      flow=[("gmail", "Support email"), ("help-scout", "Ticket created"), ("slack", "Owner pinged")],
      saved="No copy-paste between inbox and helpdesk."),
 dict(n="06", slug="order_to_shipping_label", title="Order to label and tracking email", area="Ops / e-commerce", pal="amber", ui="shape",
      pain="Each order means **copying** an address into a label tool by hand.",
      chips=["Copy the address", "Paste the tracking", "Email the buyer"],
      pile=["shopify", "shippo", "gmail", "google-sheets", "woocommerce", "square", "twilio", "slack"],
      after="New order in. **Label made.** **Tracking email** sent to the buyer.",
      flow=[("shopify", "New order"), ("shippo", "Label made"), ("gmail", "Tracking email"), ("google-sheets", "Order log")],
      saved="Saves a few minutes on every order."),
 dict(n="07", slug="monday_revenue_report", title="Monday revenue report builds itself", area="Finance", pal="cyan", ui="empty",
      pain="The Monday report gets built by hand on **Sunday night**.",
      chips=["Export the CSV", "Paste into Sheets", "Fix the totals"],
      pile=["stripe", "quickbooks", "google-sheets", "gmail", "xero", "airtable", "dropbox", "microsoft-outlook"],
      after="The revenue report builds itself and is **in your inbox** before **Monday starts**.",
      flow=[("stripe", "Payments"), ("quickbooks", "Books"), ("google-sheets", "Weekly totals"), ("gmail", "Report sent")],
      saved="Gives back a Sunday evening every week."),
 dict(n="08", slug="new_hire_onboarding", title="Offer accepted, onboarding starts", area="HR", pal="slate", ui="shape",
      pain="Offer accepted. Now **five separate** setup tasks start by hand.",
      chips=["Add to the HR system", "Send the welcome", "Book day one"],
      pile=["greenhouse", "bamboohr", "slack", "google-calendar", "gmail", "google-drive", "notion", "okta"],
      after="Offer accepted. The **HR record**, **welcome email** and **day-one invite** go out.",
      flow=[("greenhouse", "Offer accepted"), ("bamboohr", "HR record"), ("gmail", "Welcome email"), ("google-calendar", "Day-one invite")],
      saved="About 30 minutes of setup per hire, handled."),
 dict(n="09", slug="new_lead_to_crm", title="New lead lands in the CRM", area="Sales", pal="coral", ui="empty",
      pain="A lead fills in the form and **waits** until someone checks.",
      chips=["Missed it", "Copy into the CRM", "Reply tomorrow"],
      pile=["typeform", "gmail", "pipedrive", "google-sheets", "hubspot", "slack", "whatsapp", "facebook-pages"],
      after="Every new lead lands **in the CRM in seconds** and gets a **first reply**.",
      flow=[("typeform", "New lead"), ("pipedrive", "Deal created"), ("gmail", "First reply"), ("slack", "Team alert")],
      saved="No lead waits for someone to check."),
 dict(n="10", slug="video_to_post_drafts", title="New video, drafts ready", area="Solo creator", pal="lime", ui="shape",
      pain="Every upload means **rewatching** it to write the description and posts.",
      chips=["Write the description", "Pull the quotes", "Draft three posts"],
      pile=["youtube", "google-docs", "notion", "buffer", "canva", "instagram-business", "openai", "dropbox"],
      after="Upload a video. **Description and post drafts** are **ready in minutes**.",
      flow=[("youtube", "New upload"), ("openai", "Drafts written"), ("google-docs", "Drafts saved"), ("buffer", "Posts queued")],
      saved="Saves about an hour per video."),
]

CSS = f"""
@font-face{{font-family:Grotesk;font-weight:500;src:url({F('SpaceGrotesk-500.woff2')})}}
@font-face{{font-family:Grotesk;font-weight:700;src:url({F('SpaceGrotesk-700.woff2')})}}
@font-face{{font-family:Anton;src:url({F('Anton-400.woff2')})}}
*{{box-sizing:border-box;margin:0;padding:0}}
body{{width:{W}px;height:{H}px;overflow:hidden;position:relative;font-family:Grotesk;font-weight:500;color:#111}}
.abs{{position:absolute}}
.grain{{position:absolute;inset:0;pointer-events:none;opacity:.16;mix-blend-mode:multiply;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")}}
.tag{{font-family:Anton;font-size:36px;letter-spacing:.06em;line-height:1;padding:10px 22px 8px;border-radius:8px;display:inline-block;text-transform:uppercase}}
.tile{{position:absolute;background:#fff;display:flex;align-items:center;justify-content:center}}
.tile img{{width:66%;height:66%;object-fit:contain}}
"""

def mark(t, acc, soft):
    return re.sub(r"\*\*(.+?)\*\*", lambda m: f'<span style="color:{acc};background:linear-gradient(transparent 66%,{soft} 66%,{soft} 92%,transparent 92%)">{m.group(1)}</span>', t)

def crop(key, dw, maxh=None):
    f, sx, sy, sw, sh = UI[key]
    sc = dw / sw
    if maxh and sh * sc > maxh: sc = maxh / sh
    w, h = round(sw * sc), round(sh * sc)
    return (f'<div style="width:{w}px;height:{h}px;border-radius:18px;overflow:hidden;position:relative;background:#fff;'
            f'box-shadow:0 26px 60px rgba(20,24,40,.30),0 0 0 6px #fff"><img src="{f.as_uri()}" '
            f'style="position:absolute;left:{-sx * sc:.2f}px;top:{-sy * sc:.2f}px;width:{1920 * sc:.2f}px;height:{1080 * sc:.2f}px;max-width:none"></div>'), w, h

# ---------- BEFORE ----------
def pile(apps, x0, y0, w, h, size, seed, chips, chip_fs, chip_pos):
    rnd = random.Random(seed)
    n = len(apps) + 4
    items = (apps + rnd.sample(apps, 4))
    cols = max(3, round((n * w / h) ** .5))
    rows = -(-n // cols)
    cw, ch = w / cols, h / rows
    pos = []
    for i, a in enumerate(items):
        r, c = divmod(i, cols)
        s = size * rnd.uniform(.82, 1.12)
        x = x0 + c * cw + cw / 2 - s / 2 + rnd.uniform(-cw * .28, cw * .28)
        y = y0 + r * ch + ch / 2 - s / 2 + rnd.uniform(-ch * .22, ch * .22)
        pos.append((a, x, y, s, rnd.uniform(-22, 22)))
    lines = ""
    for _ in range(9):
        a, b = rnd.sample(pos, 2)
        lines += f'<line x1="{a[1] + a[3] / 2:.0f}" y1="{a[2] + a[3] / 2:.0f}" x2="{b[1] + b[3] / 2:.0f}" y2="{b[2] + b[3] / 2:.0f}"/>'
    svg = f'<svg class="abs" style="left:0;top:0;pointer-events:none" width="{W}" height="{H}"><g stroke="#4A453D" stroke-opacity=".55" stroke-width="3">{lines}</g></svg>'
    tiles = "".join(f'<div class="tile" style="left:{x:.0f}px;top:{y:.0f}px;width:{s:.0f}px;height:{s:.0f}px;border-radius:{s * .22:.0f}px;'
                    f'transform:rotate({rot:.0f}deg);filter:grayscale(.92) contrast(.92);opacity:.88;box-shadow:0 8px 18px rgba(0,0,0,.28)"><img src="{I(a)}"></div>'
                    for a, x, y, s, rot in pos)
    cl = "".join(f'<div class="abs" data-bg="#EDE8DD" style="left:{x}px;top:{y}px;transform:rotate({r}deg);background:#EDE8DD;color:#2A2620;border:3px solid #5A544A;'
                 f'padding:8px 18px;border-radius:10px;font-weight:700;font-size:{chip_fs}px;white-space:nowrap;box-shadow:0 8px 16px rgba(0,0,0,.25)">{t}</div>'
                 for t, (x, y, r) in zip(chips, chip_pos))
    return svg + tiles + cl

BEFORE_BG = ("background:linear-gradient(160deg,#CFCAC0 0%,#B3ADA1 55%,#9A9488 100%)")
GRID = ("background-image:repeating-linear-gradient(0deg,rgba(40,36,28,.10) 0 2px,transparent 2px 46px),"
        "repeating-linear-gradient(90deg,rgba(40,36,28,.10) 0 2px,transparent 2px 120px)")

def before_layer(p, mode):
    """mode 'split' (top 0..450) or 'full' (whole slide)."""
    red, redsoft = "#8F2A17", "rgba(190,70,40,.28)"
    if mode == "split":
        head = (f'<div class="abs" style="left:60px;top:104px;width:960px;font-weight:700;font-size:46px;line-height:1.1;color:#24211B">{mark(p["pain"], red, redsoft)}</div>')
        tag = '<div class="abs tag" style="left:60px;top:40px;background:#2A2620;color:#EDE8DD">Before</div>'
        pl = pile(p["pile"], 30, 222, 1020, 210, 84, int(p["n"]), p["chips"][:2], 30, [(60, 250, -3), (640, 335, 2)])
    else:
        head = (f'<div class="abs" style="left:60px;top:150px;width:960px;font-weight:700;font-size:76px;line-height:1.06;color:#24211B">{mark(p["pain"], red, redsoft)}</div>')
        tag = '<div class="abs tag" style="left:60px;top:64px;background:#2A2620;color:#EDE8DD;font-size:44px">Before</div>'
        pl = pile(p["pile"], 20, 520, 1040, 520, 128, int(p["n"]), p["chips"], 36, [(50, 590, -4), (560, 760, 3), (160, 930, -2)])
    return pl + head + tag

# ---------- AFTER ----------
def flow_vertical(p, x, y, acc, ink):
    out, step = "", 88
    for i, (a, lab) in enumerate(p["flow"]):
        yy = y + i * step
        if i:
            out += f'<div class="abs" style="left:{x + 33}px;top:{yy - 16}px;width:6px;height:22px;background:{acc};border-radius:3px"></div>'
        out += (f'<div class="tile" style="left:{x}px;top:{yy}px;width:72px;height:72px;border-radius:18px;box-shadow:0 0 0 4px {acc},0 8px 18px rgba(0,0,0,.18)"><img src="{I(a)}"></div>'
                f'<div class="abs" style="left:{x + 94}px;top:{yy + 17}px;font-weight:700;font-size:32px;color:{ink};white-space:nowrap">{lab}</div>')
    return out

def flow_horizontal(p, y, acc, ink, size=124):
    n = len(p["flow"]); gap = (960 - n * size) / (n - 1); out = ""
    for i, (a, lab) in enumerate(p["flow"]):
        x = 60 + i * (size + gap)
        if i:
            out += f'<div class="abs" style="left:{x - gap + 8:.0f}px;top:{y + size / 2 - 3}px;width:{gap - 16:.0f}px;height:6px;background:{acc};border-radius:3px"></div>'
        lw = min(size + gap - 64, 300); cx = x + size / 2
        lx, al = (x, "left") if i == 0 else ((x + size - lw, "right") if i == n - 1 else (cx - lw / 2, "center"))
        out += (f'<div class="tile" style="left:{x:.0f}px;top:{y}px;width:{size}px;height:{size}px;border-radius:30px;box-shadow:0 0 0 5px {acc},0 12px 26px rgba(0,0,0,.2)"><img src="{I(a)}"></div>'
                f'<div class="abs" style="left:{lx:.0f}px;top:{y + size + 18}px;width:{lw:.0f}px;text-align:{al};font-weight:700;font-size:32px;line-height:1.1;color:{ink}">{lab}</div>')
    return out

def after_bg(pal, top=0, h=H):
    b0, b1, ink, acc, soft = PAL[pal]
    return (f'<div class="abs" style="left:0;top:{top}px;width:{W}px;height:{h}px;overflow:hidden;background:radial-gradient(900px 700px at 78% 30%,{b0} 0%,{b1} 100%)">'
            f'<div class="abs" style="right:-160px;top:-120px;width:620px;height:620px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.9),rgba(255,255,255,0))"></div>'
            f'<div class="abs" style="left:-100px;bottom:-200px;width:700px;height:700px;border-radius:50%;background:radial-gradient(closest-side,{soft},rgba(255,255,255,0));opacity:.8"></div>'
            f'<div class="abs" style="inset:0;background:repeating-linear-gradient(115deg,rgba(255,255,255,.22) 0 40px,transparent 40px 110px)"></div></div>')

def footer(x, y, ink, stacked=False):
    return (f'<div class="abs" style="left:{x}px;top:{y}px;display:flex;align-items:center;gap:12px"><img src="{LOGO}" style="width:48px;height:48px">'
            f'<span style="font-weight:700;font-size:32px;color:{ink}">fansachat.com</span></div>')

# ---------- pages ----------
def split(p):
    b0, b1, ink, acc, soft = PAL[p["pal"]]
    H1 = 450
    ui, uw, uh = crop(p["ui"], 470, 335)
    after = (after_bg(p["pal"]) +
        f'<div class="abs" style="left:0;top:0;width:{W}px;height:{H1 + 34}px;{BEFORE_BG};clip-path:polygon(0 0,100% 0,100% {H1 - 34}px,0 {H1 + 34}px);overflow:hidden">'
        f'<div class="abs" style="inset:0;{GRID}"></div>'
        f'<div class="abs" style="inset:0;background:radial-gradient(700px 300px at 20% 10%,rgba(255,255,255,.28),transparent)"></div></div>'
        f'<div class="grain"></div>' + before_layer(p, "split") +
        f'<div class="abs" style="left:{W / 2 - 46}px;top:{H1 - 46}px;width:92px;height:92px;border-radius:50%;background:{acc};box-shadow:0 0 0 6px #fff,0 12px 26px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center">'
        f'<svg width="46" height="46" viewBox="0 0 46 46"><path d="M23 8V36M10 24L23 37L36 24" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="square"/></svg></div>'
        f'<div class="abs tag" style="left:60px;top:{H1 + 60}px;background:{acc};color:#fff">After</div>'
        f'<div class="abs" style="left:60px;top:{H1 + 122}px;width:960px;font-weight:700;font-size:50px;line-height:1.08;color:{ink}">{mark(p["after"], acc, soft)}</div>'
        + flow_vertical(p, 60, H1 + 312, acc, ink) +
        f'<div class="abs" style="left:{W - 60 - uw}px;top:{H1 + 312}px">{ui}</div>'
        + cta(60, 1122, fs=32, stack=True, gap=12, sub=(.96, .96)) + footer(470, 1138, ink))
    return after

def slide_before(p):
    return (f'<div class="abs" style="inset:0;{BEFORE_BG}"></div><div class="abs" style="inset:0;{GRID}"></div>'
            f'<div class="abs" style="inset:0;background:radial-gradient(800px 500px at 20% 8%,rgba(255,255,255,.3),transparent)"></div><div class="grain"></div>'
            + before_layer(p, "full") + cta(60, 1090, fs=36, stack=True, gap=12, sub=(.9, .9)) + footer(60, 1282, "#24211B"))

def slide_after(p):
    b0, b1, ink, acc, soft = PAL[p["pal"]]
    ui, uw, uh = crop(p["ui"], 560, 350)
    return (after_bg(p["pal"]) + '<div class="grain"></div>'
        f'<div class="abs tag" style="left:60px;top:64px;background:{acc};color:#fff;font-size:44px">After</div>'
        f'<div class="abs" style="left:60px;top:150px;width:960px;font-weight:700;font-size:68px;line-height:1.06;color:{ink}">{mark(p["after"], acc, soft)}</div>'
        + flow_horizontal(p, 440, acc, ink) +
        f'<div class="abs" data-bg="{b1}" style="left:60px;top:720px;width:430px;font-weight:700;font-size:40px;line-height:1.15;color:{ink}">{p["saved"]}</div>'
        f'<div class="abs" style="left:{W - 60 - uw}px;top:712px">{ui}</div>'
        + cta(60, 1090, fs=36, stack=True, gap=12, sub=(.9, .9)) + footer(60, 1282, ink))

QA_JS = """([W,H]) => {
  const lum = c => { const [r,g,b] = c.map(v => { v/=255; return v<=.03928? v/12.92 : Math.pow((v+.055)/1.055,2.4)}); return .2126*r+.7152*g+.0722*b };
  const rgb = s => (s.match(/[\\d.]+/g)||[0,0,0]).slice(0,3).map(Number);
  const hex = h => [1,3,5].map(i => parseInt(h.slice(i,i+2),16));
  const issues = [], fonts = new Set(), els = [];
  for (const el of document.body.querySelectorAll('*')) {
    const own = [...el.childNodes].filter(n => n.nodeType===3 && n.textContent.trim());
    if (!own.length) continue;
    const cs = getComputedStyle(el); fonts.add(cs.fontFamily.split(',')[0].replace(/["']/g,''));
    const fs = parseFloat(cs.fontSize);
    const label = el.textContent.trim().slice(0,28);
    if (fs < 30) issues.push(`small ${fs}px "${label}"`);
    const rects = []; for (const n of own) { const r = document.createRange(); r.selectNodeContents(n); rects.push(...r.getClientRects()); }
    for (const r of rects) {
      if (r.left < 24 || r.right > W-24 || r.top < 20 || r.bottom > H-20) issues.push(`edge "${label}"`);
      const px = r.left + r.width/2, py = r.top + r.height/2, top = document.elementFromPoint(px, py);
      if (top && !(el.contains(top) || top.contains(el))) issues.push(`covered "${label}" by ${top.tagName}`);
    }
    // contrast vs declared bg (data-bg ancestor) when present
    let a = el, bg = null; while (a && !bg) { bg = a.dataset && a.dataset.bg; a = a.parentElement; }
    if (bg) { const L1 = lum(rgb(cs.color)), L2 = lum(hex(bg)), cr = (Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05); if (cr < 4.5) issues.push(`contrast ${cr.toFixed(1)} "${label}"`); }
    els.push({el, rects, label});
  }
  for (let i=0;i<els.length;i++) for (let j=i+1;j<els.length;j++) {
    const A=els[i], B=els[j]; if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
    for (const a of A.rects) for (const b of B.rects) {
      const sa=a.height*.22, sb=b.height*.22; const ox = Math.min(a.right,b.right)-Math.max(a.left,b.left), oy = Math.min(a.bottom-sa,b.bottom-sb)-Math.max(a.top+sa,b.top+sb);
      if (ox>4 && oy>4) issues.push(`overlap "${A.label}" x "${B.label}"`);
    }
  }
  return {issues:[...new Set(issues)], fonts:[...fonts]};
}"""

def doc(body):
    return f"<!doctype html><html><head><meta charset=utf-8><style>{CSS}</style></head><body>{body}</body></html>"

def main():
    exe = os.environ.get("PW_EXE") or ("/opt/pw-browsers/chromium" if pathlib.Path("/opt/pw-browsers/chromium").exists() else None)
    report, allfonts = [], set()
    only = sys.argv[1:]
    with sync_playwright() as pw:
        br = pw.chromium.launch(executable_path=exe, args=["--no-sandbox"]) if exe else pw.chromium.launch()
        for p in POSTS:
            if only and p["n"] not in only: continue
            for kind, fn in (("split", split), ("s1_before", slide_before), ("s2_after", slide_after)):
                name = f'{p["n"]}_{p["slug"]}_{kind}'
                f = HTML / f"{name}.html"; f.write_text(doc(fn(p)), encoding="utf-8")
                pg = br.new_page(viewport={"width": W, "height": H}); pg.goto(f.as_uri()); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
                pg.screenshot(path=str(OUT / f"{name}.png")); res = pg.evaluate(QA_JS, [W, H]); pg.close()
                allfonts.update(res["fonts"])
                report.append(f'{name}: {"PASS" if not res["issues"] else "FAIL " + "; ".join(res["issues"])}')
        br.close()
    txt = "\n".join(report) + f"\nfonts: {sorted(allfonts)}\n"
    print(txt)
    if not only: (OUT / "QA.txt").write_text(txt, encoding="utf-8")

if __name__ == "__main__":
    main()
