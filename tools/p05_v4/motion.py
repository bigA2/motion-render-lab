# Motion floor check: decodes the video as 540-px-wide grey frames, takes the mean absolute difference between consecutive
# frames (0-255) and averages it per 0.5 s window. FAILS (exit 1) if any window is under the floor (a static stretch).
# Usage: python motion.py video.mp4 report.json [floor=0.4]. MIT, our own code.
import json, subprocess, sys
import numpy as np
v, out = sys.argv[1], sys.argv[2]; FLOOR = float(sys.argv[3]) if len(sys.argv) > 3 else 0.4
pr = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'csv=p=0', v], capture_output=True, text=True).stdout.strip().split(',')
W, H = int(pr[0]), int(pr[1]); fps = eval(pr[2]); w = 540; h = int(round(H * w / W / 2) * 2)
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', v, '-vf', f'scale={w}:{h},format=gray', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
prev = None; d = []
while True:
    b = p.stdout.read(w * h)
    if len(b) < w * h: break
    x = np.frombuffer(b, np.uint8).astype(np.float32)
    if prev is not None: d.append(float(np.abs(x - prev).mean()))
    prev = x
n = int(round(fps / 2)); win = [round(float(np.mean(d[i:i + n])), 3) for i in range(0, len(d), n)]
low = [{'t0': round(i * 0.5, 1), 'mad': m} for i, m in enumerate(win) if m < FLOOR]
rep = {'video': v, 'fps': fps, 'frames': len(d) + 1, 'floor': FLOOR, 'window_s': 0.5, 'windows': win, 'min': min(win), 'min_at_s': win.index(min(win)) * 0.5, 'below_floor': low}
json.dump(rep, open(out, 'w'), indent=1)
print(f"motion {v}: {len(win)} windows, min {rep['min']} at {rep['min_at_s']} s, floor {FLOOR} -> {'FAIL ' + str(low) if low else 'ok'}")
sys.exit(1 if low else 0)
