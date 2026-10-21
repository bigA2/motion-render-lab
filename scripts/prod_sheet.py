# contact sheet from a stills list: prod_sheet.py <list.json> <out.jpg> <4x5|16x9>
import json, sys
from PIL import Image, ImageDraw, ImageFont
lst, out, fmt = json.load(open(sys.argv[1])), sys.argv[2], sys.argv[3]
tw, th, cols = (400, 500, 4) if fmt == '4x5' else (640, 360, 3)
rows = (len(lst) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 10) + 10, rows * (th + 46) + 10), (20, 18, 26))
dr = ImageDraw.Draw(sheet)
try: fnt = ImageFont.truetype('DejaVuSans.ttf', 26)
except Exception: fnt = ImageFont.load_default()
for i, (t, p) in enumerate(lst):
    x, y = 10 + (i % cols) * (tw + 10), 10 + (i // cols) * (th + 46)
    dr.text((x, y + 4), f'{t} s', fill=(230, 230, 240), font=fnt)
    sheet.paste(Image.open(p).convert('RGB').resize((tw, th), Image.LANCZOS), (x, y + 40))
sheet.save(out, quality=88)
