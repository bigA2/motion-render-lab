# X header 1500x500 for @Fansachatowner. Inputs: founder.jpg + logo-mark.png (public on fansachat.com). Output: out/x_banner.png
import io, math, random, urllib.request
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps
from rembg import remove
W, H = 1500, 500
def get(u): return Image.open(io.BytesIO(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (banner build)'}), timeout=60).read()))
F = lambda w, s: ImageFont.truetype(f'fonts/InterTight-{w}.ttf', s)
bg = Image.new('RGB', (W, H), '#0B0C1A')
# soft brand glows (logo pastels: lavender + sky)
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); g = ImageDraw.Draw(glow)
g.ellipse((780, -260, 1560, 520), fill=(139, 92, 246, 120)); g.ellipse((300, 180, 900, 760), fill=(56, 189, 248, 55))
bg = Image.alpha_composite(bg.convert('RGBA'), glow.filter(ImageFilter.GaussianBlur(130)))
# workflow-branch pattern (our own motif): root -> split dots -> leaves, faint
pat = Image.new('RGBA', (W, H), (0, 0, 0, 0)); p = ImageDraw.Draw(pat); random.seed(7)
for _ in range(9):
    x0, y0 = random.randint(-100, 1400), random.randint(-50, 520)
    for k in range(3):
        x1, y1 = x0 + 160, y0 + (k - 1) * 70
        pts = [(x0 + (x1 - x0) * t / 20, y0 + (y1 - y0) * (3 * (t / 20) ** 2 - 2 * (t / 20) ** 3)) for t in range(21)]
        p.line(pts, fill=(196, 181, 253, 38), width=2); p.ellipse((x1 - 5, y1 - 5, x1 + 5, y1 + 5), outline=(196, 181, 253, 60), width=2)
    p.ellipse((x0 - 7, y0 - 7, x0 + 7, y0 + 7), fill=(196, 181, 253, 70))
bg = Image.alpha_composite(bg, pat)
# founder cut-out, right side, slightly desaturated + lavender rim light
f = remove(get('https://fansachat.com/founder.jpg').convert('RGB')).convert('RGBA')
a = f.split()[3].point(lambda v: 0 if v < 170 else 255).filter(ImageFilter.GaussianBlur(1.2)); f.putalpha(a)
f = f.crop(a.getbbox()); f = f.resize((int(f.width * 470 / f.height), 470), Image.LANCZOS)
rgb = Image.blend(f.convert('RGB'), ImageOps.grayscale(f.convert('RGB')).convert('RGB'), 0.35); f = Image.merge('RGBA', (*rgb.split(), f.split()[3]))
rim = Image.new('RGBA', f.size, (167, 139, 250, 0)); rim.putalpha(f.split()[3].filter(ImageFilter.GaussianBlur(10)).point(lambda a: int(a * 0.55)))
fx = W - f.width - 30; bg.alpha_composite(rim, (fx - 6, H - f.height + 2)); bg.alpha_composite(f, (fx, H - f.height + 8))
d = ImageDraw.Draw(bg)
# logo + wordmark
logo = get('https://fansachat.com/logo-mark.png').convert('RGBA').resize((74, 74), Image.LANCZOS)
x = 430; bg.alpha_composite(logo, (x, 62)); d.text((x + 90, 72), 'FansaChat', font=F(700, 52), fill='#F5F3FF')
# headline: 3-step promise
y = 168
for word, col in [('Describe it.', '#F5F3FF'), ('Approve it.', '#C4B5FD'), ('It runs.', '#7DD3FC')]:
    d.text((x, y), word, font=F(700, 64), fill=col); y += 70
# proof chips
cx, cy = x, 392
for txt in ['700+ apps', 'Nothing runs without your OK', 'Launching Nov 2026']:
    tw = d.textlength(txt, font=F(500, 22)); d.rounded_rectangle((cx, cy, cx + tw + 32, cy + 40), radius=20, outline=(196, 181, 253, 150), width=2, fill=(30, 27, 60, 200))
    d.text((cx + 16, cy + 8), txt, font=F(500, 22), fill='#E9E5FF'); cx += tw + 46
d.text((x, 446), 'Join the waitlist  ·  fansachat.com', font=F(500, 24), fill='#A5B4FC')
import os; os.makedirs('out', exist_ok=True); bg.convert('RGB').save('out/x_banner.png', optimize=True); print('saved')
