# Measures a motion-design video with plain signal processing (no AI). MIT, our own code.
# Usage: python measure.py <video> <out.json> [label]
# The video stays in the runner's temp folder; only the numbers below leave the job.
import json, subprocess, sys
import cv2, numpy as np

path, out = sys.argv[1], sys.argv[2]
label = sys.argv[3] if len(sys.argv) > 3 else path.split('/')[-1]
cap = cv2.VideoCapture(path)
fps = cap.get(cv2.CAP_PROP_FPS) or 30
W0 = cap.get(cv2.CAP_PROP_FRAME_WIDTH); H0 = cap.get(cv2.CAP_PROP_FRAME_HEIGHT)
step = max(1, round(fps / 12))
aw, ah = 320, int(round(320 * H0 / W0 / 2) * 2) if W0 else 180
ys, xs = np.mgrid[0:ah, 0:aw]; r = np.stack([xs - aw / 2, ys - ah / 2], -1); rr = (r ** 2).sum(-1) + 1
try:
    import pytesseract
except Exception:
    pytesseract = None
prev = prev_hist = None; i = 0
T, cuts, vel, div, curl, diff, sharp, words, hts = [], [], [], [], [], [], [], [], []
sat, lum = [], []
while True:
    ok, frame = cap.read()
    if not ok: break
    if i % step: i += 1; continue
    t = i / fps
    small = cv2.resize(frame, (aw, ah)); g = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    hist = cv2.calcHist([small], [0, 1, 2], None, [8, 8, 8], [0, 256] * 3); cv2.normalize(hist, hist)
    T.append(t)
    sharp.append(float(cv2.Laplacian(g, cv2.CV_64F).var()))
    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV); sat.append(float(hsv[..., 1].mean() / 255)); lum.append(float(g.mean() / 255))
    if prev is not None:
        cut = cv2.compareHist(prev_hist, hist, cv2.HISTCMP_BHATTACHARYYA) > 0.45
        if cut: cuts.append(round(t, 3))
        f = cv2.calcOpticalFlowFarneback(prev, g, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        dx, dy = float(np.median(f[..., 0])), float(np.median(f[..., 1]))
        # per second, as share of frame width
        vel.append(0 if cut else float(np.hypot(dx, dy)) * (12 if step else fps) / aw)
        div.append(0 if cut else float(np.median((f * r).sum(-1) / rr)) * 12)
        curl.append(0 if cut else float(np.median((r[..., 0] * f[..., 1] - r[..., 1] * f[..., 0]) / rr)) * 12 * 57.3)
        diff.append(float(np.abs(g.astype(np.int16) - prev.astype(np.int16)).mean()))
    else:
        vel.append(0); div.append(0); curl.append(0); diff.append(0)
    if pytesseract is not None and i % int(round(fps)) == 0:      # OCR 1 frame per second
        big = cv2.resize(frame, (960, int(960 * H0 / W0))) if W0 else frame
        try:
            d = pytesseract.image_to_data(cv2.cvtColor(big, cv2.COLOR_BGR2GRAY), output_type=pytesseract.Output.DICT, config='--psm 11')
            hs = [d['height'][k] / big.shape[0] for k in range(len(d['text'])) if d['text'][k].strip() and len(d['text'][k].strip()) > 1 and float(d['conf'][k]) > 60]
            words.append(len(hs)); hts.extend(hs)
        except Exception:
            pass
    prev, prev_hist = g, hist; i += 1
dur = i / fps
T = np.array(T); vel = np.array(vel); div = np.array(div); curl = np.array(curl); diff = np.array(diff); sharp = np.array(sharp)
moving = vel > 0.04            # camera/content pan faster than 4% of frame width per second
zooming = np.abs(div) > 0.03   # >3%/s scale change
rolling = np.abs(curl) > 1.0   # >1 deg/s
# move segments -> ease shape
segs = []
k = 0
while k < len(vel):
    if moving[k]:
        j = k
        while j < len(vel) and moving[j]: j += 1
        if j - k >= 3:
            v = vel[k:j]; pk = int(np.argmax(v))
            segs.append({"t": round(float(T[k]), 2), "dur": round((j - k) / 12, 2), "peak_frac": round(pk / max(1, j - k - 1), 2), "peak_v": round(float(v.max()), 3)})
        k = j
    else: k += 1
pf = np.array([s['peak_frac'] for s in segs]) if segs else np.array([])
fast = vel > 0.25
blur_ratio = float(np.median(sharp[fast]) / max(1e-6, np.median(sharp[~fast]))) if fast.sum() > 3 and (~fast).sum() > 3 else None
# visual events = cuts, starts of move segments, big frame-diff spikes
dd = np.diff(diff, prepend=0); spikes = T[(dd > dd.mean() + 2.5 * dd.std())]
vis_events = sorted(set([round(x, 2) for x in cuts] + [s['t'] for s in segs] + [round(float(x), 2) for x in spikes]))
# audio
raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", path, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768 if raw else np.zeros(1)
has_audio = bool(len(a) > 16000 and np.abs(a).max() > 0.01)
audio = {}
if has_audio:
    win = 160  # 10 ms
    n = len(a) // win
    env = np.sqrt((a[: n * win].reshape(n, win) ** 2).mean(1)) + 1e-9
    db = 20 * np.log10(env)
    ref = np.percentile(db, 95)
    # high-frequency transient detector (SFX hits): spectral flux on 10 ms frames
    spec = np.abs(np.fft.rfft(a[: n * win].reshape(n, win) * np.hanning(win), axis=1))
    flux = np.maximum(0, np.diff(np.log1p(spec), axis=0)).sum(1); flux = np.concatenate([[0], flux])
    thr = np.median(flux) + 3 * np.std(flux)
    on = np.where((flux > thr) & (np.roll(flux, 1) <= thr))[0]
    on = on[np.concatenate([[True], np.diff(on) > 5])] if len(on) else on   # min 50 ms apart
    ont = on * 0.01
    ve = np.array(vis_events) if vis_events else np.array([-99.0])
    sync = float(np.mean([np.min(np.abs(ve - x)) <= 0.1 for x in ont])) if len(ont) else None
    lufs = None
    r2 = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    for line in r2.splitlines()[::-1]:
        if line.strip().startswith('I:'):
            try: lufs = float(line.split()[1]); break
            except Exception: pass
    audio = {"onsets_per_s": round(len(ont) / dur, 2), "quiet_share": round(float((db < ref - 30).mean()), 3),
             "onset_on_visual_event_share": round(sync, 3) if sync is not None else None, "lufs": lufs,
             "dyn_range_db": round(float(np.percentile(db, 95) - np.percentile(db, 10)), 1)}
shots = np.diff([0] + cuts + [dur]) if dur else np.array([])
res = {
    "label": label, "w": W0, "h": H0, "fps": round(fps, 2), "duration_s": round(dur, 2), "has_audio": has_audio,
    "cuts": len(cuts), "shot_s_median": round(float(np.median(shots)), 2) if len(shots) else None,
    "shot_s_mean": round(float(np.mean(shots)), 2) if len(shots) else None,
    "camera_moving_share": round(float(moving.mean()), 3), "zooming_share": round(float(zooming.mean()), 3),
    "zoom_in_vs_out": round(float((div > 0.03).sum() / max(1, zooming.sum())), 2),
    "rolling_share": round(float(rolling.mean()), 3),
    "pan_speed_median_fw_per_s": round(float(np.median(vel[moving])), 3) if moving.any() else 0,
    "pan_speed_p90_fw_per_s": round(float(np.percentile(vel[moving], 90)), 3) if moving.any() else 0,
    "move_segments": len(segs), "move_dur_median_s": round(float(np.median([s['dur'] for s in segs])), 2) if segs else None,
    "ease_peak_frac_median": round(float(np.median(pf)), 2) if len(pf) else None,
    "ease_out_share": round(float((pf < 0.35).mean()), 2) if len(pf) else None,
    "ease_inout_share": round(float(((pf >= 0.35) & (pf <= 0.65)).mean()), 2) if len(pf) else None,
    "ease_in_share": round(float((pf > 0.65).mean()), 2) if len(pf) else None,
    "motion_blur_sharpness_ratio": round(blur_ratio, 2) if blur_ratio else None,
    "alive_share": round(float((diff > 0.6).mean()), 3),
    "still_share": round(float((diff < 0.15).mean()), 3),
    "ocr_words_per_frame_median": float(np.median(words)) if words else None,
    "ocr_words_per_frame_p90": float(np.percentile(words, 90)) if words else None,
    "text_h_median_pct": round(float(np.median(hts) * 100), 2) if hts else None,
    "text_h_p95_pct": round(float(np.percentile(hts, 95) * 100), 2) if hts else None,
    "saturation_mean": round(float(np.mean(sat)), 3), "luma_mean": round(float(np.mean(lum)), 3),
    "audio": audio, "segments": segs[:60],
}
json.dump(res, open(out, "w"))
print(json.dumps({k: v for k, v in res.items() if k != 'segments'}))
