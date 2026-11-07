# P05 FULL v5: procedural SFX (our own code, no samples). Writes public/sfx/p05full/*.wav (48 kHz mono 16-bit).
# Every repeated event gets its OWN file so no sample repeats within 1.5 s:
#   key_00..key_29  soft key clicks (one per typed character group), each with its own pitch/body/noise seed
#   tick_00..tick_04 hook word ticks (5 different)
#   swish_a/b/c      soft AIR swishes (band-passed noise, different lengths/centres) for camera/window moves (not whooshes)
# Run: python3 tools/p05full/make_sfx.py  (the render workflow runs it before rendering; outputs are not committed)
import math, os, random, struct, sys, wave
SR = 48000
OUT = sys.argv[1] if len(sys.argv) > 1 else 'public/sfx/p05full'
os.makedirs(OUT, exist_ok=True)

def write(name, x, peak=0.9):
    m = max(1e-9, max(abs(v) for v in x)); g = peak / m
    with wave.open(os.path.join(OUT, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b''.join(struct.pack('<h', int(max(-1, min(1, v * g)) * 32767)) for v in x))

def biquad_bp(x, f0, q):
    w0 = 2 * math.pi * f0 / SR; a = math.sin(w0) / (2 * q); c = math.cos(w0)
    b0, b1, b2, a0, a1, a2 = a, 0, -a, 1 + a, -2 * c, 1 - a
    y, x1, x2, y1, y2 = [], 0, 0, 0, 0
    for v in x:
        o = (b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0
        x2, x1, y2, y1 = x1, v, y1, o; y.append(o)
    return y

def click(seed, f_body, f_snap, dur=0.045, snap=0.6, body=0.5):
    r = random.Random(seed); n = int(SR * dur); out = []
    ns = [r.uniform(-1, 1) for _ in range(n)]
    hp = biquad_bp(ns, f_snap, 1.4)
    for i in range(n):
        t = i / SR
        e1 = math.exp(-t / 0.0022); e2 = math.exp(-t / 0.011)
        out.append(snap * hp[i] * e1 * 3 + body * math.sin(2 * math.pi * f_body * t) * e2)
    att = int(SR * 0.0006)  # 0.6 ms attack so onsets are clean
    for i in range(min(att, n)): out[i] *= i / att
    for i in range(int(SR * 0.004)): out[n - 1 - i] *= i / (SR * 0.004)
    return out

for i in range(30):
    r = random.Random(100 + i)
    write('key_%02d' % i, click(1000 + i, r.uniform(180, 320), r.uniform(2600, 4800), r.uniform(0.035, 0.05), r.uniform(0.45, 0.7), r.uniform(0.25, 0.45)))
for i in range(5):
    write('tick_%02d' % i, click(2000 + i, 900 + 140 * i, 5200 + 300 * i, 0.03, 0.8, 0.35))

def swish(seed, dur, f_lo, f_hi, q=0.9):
    r = random.Random(seed); n = int(SR * dur); ns = [r.uniform(-1, 1) for _ in range(n)]
    # sweep the band centre with a short-block band-pass (blocks of 256, crossfaded by the envelope)
    out = [0.0] * n; B = 512
    for s in range(0, n, B // 2):
        p = s / n; fc = f_lo * (f_hi / f_lo) ** p
        seg = biquad_bp(ns[s:s + B], fc, q)
        for j, v in enumerate(seg):
            k = s + j
            if k < n: out[k] += v * math.sin(math.pi * j / B) ** 2
    for i in range(n):
        p = i / n; out[i] *= math.sin(math.pi * min(1, p / 0.55) / 2) ** 2 * (1 - max(0, (p - 0.55) / 0.45)) ** 1.6
    return out

write('swish_a', swish(31, 0.42, 500, 2400), 0.6)   # camera pushes into the composer
write('swish_b', swish(32, 0.36, 700, 3200), 0.6)   # camera pushes onto the reply
write('swish_c', swish(33, 0.50, 2600, 600), 0.6)   # camera pulls out (falling)
print('ok', OUT)
