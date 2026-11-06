# Master for the SFX-led P05 v3 mix: an SFX-led track is all transients, so loudnorm alone cannot reach -14 LUFS
# without breaking the true-peak ceiling. Here: gain + a look-ahead peak limiter (alimiter, -2 dBFS ceiling, 4x
# oversampled through 192 kHz), iterated until the integrated loudness is -14 LUFS (+-0.3), then mux (AAC 192k).
# Usage: master.py video.mp4 audio.wav out.mp4 [sfx_stem.wav music_stem.wav report.json]  -> prints the measured I / TP of the final file. MIT, our own code.
import re, subprocess, sys
v, a, o = sys.argv[1:4]
TARGET, CEIL = -14.0, -2.0

def chain(g):
    lim = 10 ** (CEIL / 20)
    return f'aresample=192000,volume={g:.2f}dB,alimiter=limit={lim:.4f}:attack=1:release=50:level=disabled,aresample=48000'
def measure(args):
    r = subprocess.run(['ffmpeg', '-hide_banner', *args, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    i = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]); tp = float(re.findall(r'Peak:\s+(-?[\d.inf]+) dBFS', r)[-1])
    return i, tp
def measure_af(af):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', a, '-af', af + ',ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]), float(re.findall(r'Peak:\s+(-?[\d.inf]+) dBFS', r)[-1])

i0, _ = measure(['-i', a]); g = TARGET - i0
for _ in range(6):
    i, tp = measure_af(chain(g))
    if abs(i - TARGET) <= 0.3: break
    g += TARGET - i
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', v, '-i', a, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', chain(g), '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', o], check=True)
fi, ftp = measure(['-i', o])
print(f'{o}: input {i0:.1f} LUFS, gain {g:+.1f} dB -> {fi:.1f} LUFS, true peak {ftp:.1f} dBTP')

if len(sys.argv) > 6:  # how far the bed sits under the SFX AFTER this master (the limiter squeezes SFX peaks)
    import json
    def st(path):
        r = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', chain(g) + ',ebur128=peak=sample', '-f', 'null', '-'], capture_output=True, text=True).stderr
        pk = float(re.findall(r'Peak:\s+(-?[\d.inf]+) dBFS', r)[-1]); ss = [float(x) for x in re.findall(r' S:\s*(-?[\d.]+)', r)]
        return pk, max(ss) if ss else -99
    (sp, ss), (mp, ms) = st(sys.argv[4]), st(sys.argv[5])
    rep = {'master_lufs': round(fi, 1), 'master_true_peak_dbtp': round(ftp, 1), 'gain_db': round(g, 1), 'sfx_peak_dbfs': sp, 'bed_peak_dbfs': mp,
           'bed_under_sfx_peak_db': round(sp - mp, 1), 'sfx_max_short_term_lufs': ss, 'bed_max_short_term_lufs': ms, 'bed_under_sfx_short_term_db': round(ss - ms, 1)}
    json.dump(rep, open(sys.argv[6], 'w'), indent=1); print(rep)
