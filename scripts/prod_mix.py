# Final audio for a production video: prod_mix.py <vid> <fmt> <video.mp4> <audio.wav> <outdir> <qadir>
# no-music = VO+SFX; music = + CC0 bed ~15 dB under the voice, side-chain ducked. Both two-pass loudnorm to -14 LUFS / TP -1.5, then ebur128 check.
import json, re, subprocess, sys, os
vid, fmt, video, wav, outdir, qa = sys.argv[1:7]
MUSIC = {  # one different CC0 track per video (public/audio, credits in MUSIC_CREDITS.md)
    'P03': 'public/audio/02_calm-minimal_once-more-with-you_loyalty-freak-music.mp3',
    'P04': 'public/audio/04_lofi-future_traveling-in-your-mind_loyalty-freak-music.mp3',
    'P05': 'public/audio/03_calm-minimal_one-cool-minute_loyalty-freak-music.mp3',
    'P06': 'public/audio/05_lofi-warm_roof-tops_holiznacc0.mp3',
    'P07': 'public/audio/06_warm-emotional_washed-up_holiznacc0.mp3',
}[vid]
run = lambda *a: subprocess.run(a, check=True, capture_output=True, text=True)
dur = float(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav).stdout)
fo = max(0.0, dur - 2.5)

def two_pass(src, dst_wav):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    m = json.loads(re.search(r'\{[^{}]*"input_i"[^{}]*\}', r.stderr, re.S).group(0))
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,alimiter=limit=0.708:level=disabled")
    run('ffmpeg', '-v', 'error', '-y', '-i', src, '-af', af, '-ar', '48000', '-c:a', 'pcm_s16le', dst_wav)

def mux(a_wav, dst):
    run('ffmpeg', '-v', 'error', '-y', '-i', video, '-i', a_wav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', dst)

def check(path, tag):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    tail = r[r.rfind('Summary:'):]
    open(f'{qa}/loudness_{tag}.txt', 'w').write(tail)
    i = float(re.search(r'I:\s+(-?[\d.]+) LUFS', tail).group(1)); tp = float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', tail).group(1))
    return {'I': i, 'TP': tp}

res = {}
base = f'{outdir}/FansaChat_{vid}_{fmt}'
# A: voice + SFX, no music
two_pass(wav, 'a_nomusic.wav'); mux('a_nomusic.wav', f'{base}_no-music.mp4'); res['no-music'] = check(f'{base}_no-music.mp4', 'no-music')
# B: + music
fc = (f"[0:a]aresample=48000,loudnorm=I=-14:TP=-1.5:LRA=9,asplit=2[v][sc];"
      f"[1:a]aresample=48000,atrim=0:{dur},asetpts=PTS-STARTPTS,afade=t=in:d=1,afade=t=out:st={fo}:d=2.5,loudnorm=I=-29:TP=-6:LRA=7[m];"
      f"[m][sc]sidechaincompress=threshold=0.04:ratio=4:attack=25:release=400[md];[v][md]amix=inputs=2:duration=first:normalize=0[a]")
run('ffmpeg', '-v', 'error', '-y', '-i', wav, '-stream_loop', '-1', '-i', MUSIC, '-filter_complex', fc, '-map', '[a]', '-ar', '48000', '-c:a', 'pcm_f32le', 'b_pre.wav')
two_pass('b_pre.wav', 'b_music.wav'); mux('b_music.wav', f'{base}_music.mp4'); res['music'] = check(f'{base}_music.mp4', 'music')
json.dump(res, open(f'{qa}/loudness.json', 'w'), indent=1); print(vid, fmt, json.dumps(res))
