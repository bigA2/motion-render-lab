# 4 fps contact sheets + frame-difference pop scan: i27_qa.py <frames dir> <qa dir>
import glob, sys
import numpy as np
from PIL import Image, ImageDraw
src, qa = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(f'{src}/*.png')); per = 30
for i in range(0, len(fs), per):
    ims = [Image.open(p).convert('RGB') for p in fs[i:i + per]]; w, h = ims[0].size; cols = 6; rows = (len(ims) + cols - 1) // cols
    s = Image.new('RGB', (w * cols, h * rows), 'white')
    for j, im in enumerate(ims):
        ImageDraw.Draw(im).text((6, 6), f'{(i + j) / 4:.2f}s', fill=(255, 0, 0)); s.paste(im, ((j % cols) * w, (j // cols) * h))
    s.save(f'{qa}/sheet_{i // per:02d}.jpg', quality=80)
a = [np.asarray(Image.open(p).convert('L').resize((96, 96)), np.float32) for p in fs]
d = [float(np.abs(a[k + 1] - a[k]).mean()) for k in range(len(a) - 1)]
out = [f'pop? t={(k + 1) / 4:.2f}s diff={d[k]:.1f}' for k in range(1, len(d) - 1) if d[k] > 3 * max((d[k - 1] + d[k + 1]) / 2, 1.0) and d[k] > 8]
open(f'{qa}/popscan.txt', 'w').write('\n'.join(out) or 'no pops')
print('\n'.join(out) or 'no pops')
