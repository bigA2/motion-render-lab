# X header 1500x500 for @Fansachatowner, v2. Locked direction: warm editorial paper + ink + ONE violet accent
# (no gradient glows). 12-column x 3-row construction grid (125 px columns, rows at 0/167/333/500). The avatar covers
# the bottom-left on X, so text starts at column 3 (x=300) and the founder sits right on a designed accent circle.
import io, os, urllib.request
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from rembg import remove
W, H = 1500, 500
INK, MUTED, PAPER, ACC, ACC2 = (20, 20, 31), (88, 86, 104), (245, 242, 236), (91, 63, 217), (196, 184, 255)
def get(u): return Image.open(io.BytesIO(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (banner build)'}), timeout=60).read()))
F = lambda w, s: ImageFont.truetype(f'fonts/InterTight-{w}.ttf', s)
img = Image.new('RGBA', (W, H), PAPER + (255,))
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)  # translucent strokes go on an overlay
# construction grid, kept faint on purpose (structure, not decoration)
for c in range(1, 12): d.line([(c * 125, 0), (c * 125, H)], fill=INK + (14,), width=1)
for r in (167, 333): d.line([(0, r), (W, r)], fill=INK + (14,), width=1)
img.alpha_composite(ov); ov = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
# accent circle system behind the founder: solid disc + two hairline rings + an orbit dot
cx, cy, R = 1240, 300, 190
for rr, a in ((R + 70, 40), (R + 36, 70)): d.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), outline=ACC + (a,), width=2)
d.ellipse((cx - R, cy - R, cx + R, cy + R), fill=ACC + (255,))
d.ellipse((cx - R + 26, cy - R + 26, cx + R - 26, cy + R - 26), outline=ACC2 + (110,), width=2)
d.ellipse((cx + R + 30, cy - 120, cx + R + 46, cy - 104), fill=ACC + (255,))
img.alpha_composite(ov)
# founder cut-out on the disc
f = remove(get('https://fansachat.com/founder.jpg').convert('RGB')).convert('RGBA')
a = f.split()[3].point(lambda v: 0 if v < 170 else 255).filter(ImageFilter.GaussianBlur(1.2)); f.putalpha(a)
f = f.crop(a.getbbox()); f = f.resize((int(f.width * 452 / f.height), 452), Image.LANCZOS)
sh = Image.new('RGBA', f.size, (0, 0, 0, 0)); sh.putalpha(f.split()[3].point(lambda v: int(v * 0.25)).filter(ImageFilter.GaussianBlur(14)))
fx = cx - f.width // 2 + 10
# clip the body to the disc so the photo's straight edges never show; the head may rise above the circle
clip = Image.new('L', (W, H), 0); cd = ImageDraw.Draw(clip); cd.ellipse((cx - R, cy - R, cx + R, cy + R), fill=255); cd.rectangle((cx - R + 40, 0, cx + R - 40, cy - R + 90), fill=255)
lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); lay.alpha_composite(f, (fx, H - f.height + 4))
from PIL import ImageChops
lay.putalpha(ImageChops.multiply(lay.split()[3], clip)); img.alpha_composite(lay)
d = ImageDraw.Draw(img)
X0 = 300  # column 3
# row 1: brand + category keyword
logo = get('https://fansachat.com/logo-mark.png').convert('RGBA').resize((58, 58), Image.LANCZOS)
img.alpha_composite(logo, (X0, 44)); d.text((X0 + 72, 50), 'FansaChat', font=F(700, 40), fill=INK)
lx = X0 + 72 + d.textlength('FansaChat', font=F(700, 40)) + 22
d.line([(lx, 56), (lx, 92)], fill=INK + (60,), width=2)
d.text((lx + 22, 62), 'AI WORKFLOW AUTOMATION  ·  NO-CODE', font=F(600, 19), fill=ACC)
# row 2: the slogan (one idea, two lines, accent on the payoff) + plain-English value line
d.text((X0, 128), 'Make your work life', font=F(700, 62), fill=INK)
d.text((X0, 196), 'hassle-free.', font=F(700, 62), fill=ACC)
d.text((X0, 276), 'Describe a task in plain English, approve it, and FansaChat runs it across 700+ apps.', font=F(500, 21), fill=MUTED)
# row 3: founder line + contact
d.text((X0, 346), 'Aminur Rahman Noor', font=F(700, 23), fill=INK)
nx = X0 + d.textlength('Aminur Rahman Noor', font=F(700, 23)) + 12
d.text((nx, 347), '— Solo founder, FansaChat · Bangladesh', font=F(500, 21), fill=MUTED)
pill = 'Join the waitlist  ·  fansachat.com'; pw = d.textlength(pill, font=F(600, 19)) + 36
d.rounded_rectangle((X0, 392, X0 + pw, 432), radius=20, fill=INK + (255,)); d.text((X0 + 18, 400), pill, font=F(600, 19), fill=PAPER)
d.text((X0 + pw + 20, 400), 'support@fansachat.com', font=F(600, 19), fill=INK)
d.text((X0, 448), 'X @Fansachatowner     Instagram & Threads @noor.fansachat     Telegram t.me/fansachat', font=F(500, 18), fill=MUTED)
os.makedirs('out', exist_ok=True); img.convert('RGB').save('out/x_banner.png', optimize=True); print('saved')
