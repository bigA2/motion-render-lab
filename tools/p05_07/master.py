# Mux picture + mixed audio with 2-pass loudnorm (-14 LUFS, TP -1.5). Usage: master.py video.mp4 audio.wav out.mp4 [t0 t1]
import json, subprocess, sys
v, a, o = sys.argv[1:4]
trim = f'atrim={sys.argv[4]}:{sys.argv[5]},asetpts=PTS-STARTPTS,' if len(sys.argv) > 5 else ''
r = subprocess.run(['ffmpeg', '-hide_banner', '-i', a, '-af', f'{trim}loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
af = (f"{trim}loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
      f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', v, '-i', a, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-af', af, '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', o], check=True)
print(o, 'in', m['input_i'], 'LUFS ->', -14)
