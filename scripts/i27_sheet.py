# Storyboard sheets from remotion stills: stills/<comp>_<sec>.png -> stills/SHEET_<comp>.jpg
import glob, sys
from PIL import Image, ImageDraw
d = sys.argv[1]
for C in ['I27-16x9', 'I27D-16x9', 'I27-4x5', 'I28-16x9', 'I28-4x5']:
    fs = sorted(glob.glob(f'{d}/{C}_*.png'), key=lambda p: float(p.rsplit('_', 1)[1][:-4]))
    if not fs:
        continue
    ims = [Image.open(p).convert('RGB') for p in fs]
    w, h = ims[0].size; tw = 640; th = int(h * tw / w); cols = 3; rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (tw * cols, th * rows), 'white')
    for i, (im, p) in enumerate(zip(ims, fs)):
        t = im.resize((tw, th)); ImageDraw.Draw(t).text((8, 8), p.rsplit('_', 1)[1][:-4] + 's', fill=(255, 0, 0))
        sheet.paste(t, ((i % cols) * tw, (i // cols) * th))
    sheet.save(f'{d}/SHEET_{C}.jpg', quality=85)
    print(C, len(fs))
