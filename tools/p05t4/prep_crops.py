# P05 test shot 4: make the shown crops from the private real captures (fansachat-scripts/research/real_screens).
# Only crops that are on screen are written. Builder states: top 56 px row (1x) and bottom 16 px dropped, pastel streaks
# neutralised (low-chroma light pixels pulled to grey, logos/chips untouched), clean plates by row interpolation.
import sys, numpy as np
from PIL import Image
SRC, OUT = sys.argv[1], sys.argv[2]
BS = SRC + '/builder_states/'
Y0, Y1 = 112, 1768  # builder crop rows (2x)

def grade(a):
    f = a.astype(np.float32) / 255
    mx, mn = f.max(2), f.min(2); ch = mx - mn; lum = f.mean(2)
    w = np.clip((0.20 - ch) / 0.08, 0, 1) * np.clip((lum - 0.55) / 0.15, 0, 1) * 0.88
    g = lum[..., None] * np.array([0.992, 0.997, 1.006], np.float32)  # faint steel tint
    o = f * (1 - w[..., None]) + g * w[..., None]
    return (np.clip(o, 0, 1) * 255 + 0.5).astype(np.uint8)

def rowplate(a, x0, x1, y0, y1):
    top, bot = a[y0 - 1, x0:x1].astype(np.float32), a[y1, x0:x1].astype(np.float32)
    t = np.linspace(0, 1, y1 - y0, dtype=np.float32)[:, None, None]
    fill = top[None] * (1 - t) + bot[None] * t
    fe = 48  # feather the left/right edges into the original pixels
    wx = np.clip(np.minimum(np.arange(x1 - x0), np.arange(x1 - x0)[::-1]) / fe, 0, 1).astype(np.float32)[None, :, None]
    a[y0:y1, x0:x1] = (fill * wx + a[y0:y1, x0:x1].astype(np.float32) * (1 - wx) + 0.5).astype(np.uint8)

def save(a, name): Image.fromarray(a).save(OUT + '/' + name, optimize=True); print(name, a.shape[1], a.shape[0])

for src, name in [('000_ready_13072', 'b_ready'), ('030_sent_151401', 'b_sent'), ('031_build_159680', 'b_read'), ('037_built_198227', 'b_built')]:
    a = grade(np.asarray(Image.open(BS + src + '.png').convert('RGB')))[Y0:Y1].copy()
    save(a, name + '.png')
    if name == 'b_ready':  # plate over the real 'start connecting' pill (x 40..840, y 1520..1660 at 2x)
        p = a.copy(); rowplate(p, 10, 870, 1520 - Y0, 1660 - Y0); save(p[1500 - Y0:1680 - Y0, 20:860].copy(), 'b_ready_pillplate.png')
    if name == 'b_read':  # plate over the 'Reading your request' card (+ its shadow), saved as the picker-card rect
        p = a.copy(); rowplate(p, 1480, 2264, 836 - Y0, 1236 - Y0); save(p[345 - Y0:1567 - Y0, 1194:2550].copy(), 'b_read_cardplate.png')
    if name == 'b_built':  # plate over the drawn flow (x 1380..2440, y 890..1110 at 2x)
        p = a.copy(); rowplate(p, 1340, 2480, 890 - Y0, 1110 - Y0); save(p[870 - Y0:1130 - Y0, 1360:2460].copy(), 'b_built_flowplate.png')

n = np.asarray(Image.open(SRC + '/notion_maya.png').convert('RGB'))
save(n[280:1120, 1040:2600].copy(), 'notion_body.png')  # title + properties + comments + body lines, no sidebar

s = np.asarray(Image.open(SRC + '/slack_maya_2x.png').convert('RGB'))
X0, X1 = 760, 2700
hdr, today, comp = s[80:256, X0:X1], s[2128:2204, X0:X1], s[2380:2660, X0:X1]
gap = np.full((150, X1 - X0, 3), 255, np.uint8); gap2 = np.full((148, X1 - X0, 3), 255, np.uint8)
frame = np.concatenate([hdr, gap, today, gap2, comp])  # message slot = gap2 (the message block is its own layer)
save(frame, 'slack_frame.png')
save(s[2204:2318, X0:X1].copy(), 'slack_message.png')  # avatar + 'FansaChat APP 12:34 PM' + the Maya Chen line only
