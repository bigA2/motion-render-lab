# Whisper-pick the best take per line -> public/v/<id>/NN.wav + vo.json (word timings). Runs on GitHub.
import glob, re, difflib, subprocess, numpy as np, json, shutil, sys, os
from faster_whisper import WhisperModel
vid=sys.argv[1]; only=int(sys.argv[2]) if len(sys.argv)>2 else 0; S=json.load(open(f'src/specs/{vid}.json',encoding='utf-8')); DST=f'public/v/{vid}'; os.makedirs(DST,exist_ok=True)
BAD=['fonsa','fans of','fans to','fanta','fan of','fansad','fansat','fonza','phansa']
norm=lambda s: re.sub(r'[^a-z0-9 ]',' ',s.lower().replace('fansa chat','fansachat').replace('fans a chat','fansachat').replace('-',' ')).split()
m=WhisperModel('base.en',device='cpu',compute_type='int8'); out=[]
for i,t in enumerate(S['lines'],1):
    if only and i!=only: continue
    best=None
    for f in sorted(glob.glob(f'gen/{vid}/{i:02d}_take*.wav')):
        tr=f.replace('.wav','_t.wav'); subprocess.run(['ffmpeg','-v','error','-y','-i',f,'-af','silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.05','-ar','48000',tr],check=True)
        a=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',tr,'-ac','1','-ar','16000','-f','f32le','-']),np.float32)
        segs=list(m.transcribe(a,word_timestamps=True)[0]); got=' '.join(x.text for x in segs).strip()
        sc=difflib.SequenceMatcher(None,' '.join(norm(t)),' '.join(norm(got))).ratio()
        bb='fansachat' in t.lower() and any(b in got.lower() for b in BAD)
        ws=[w for x in segs for w in x.words]; dur=len(a)/16000; wpm=len(t.split())/max(dur,0.3)*60
        gaps=[ws[j+1].start-ws[j].end for j in range(len(ws)-1)]; mg=max(gaps) if gaps else 0
        cost=(1-sc)*10+abs(wpm-150)/60+max(0,mg-0.7)*2+(50 if bb else 0)+(30 if dur>len(t.split())*0.75+1.5 else 0)
        if best is None or cost<best[0]: best=(cost,tr,dur,[{'w':w.word.strip(),'s':round(w.start,2),'e':round(w.end,2)} for w in ws],got)
    shutil.copy(best[1], f'{DST}/{i:02d}.wav')
    out.append({'file':f'v/{vid}/{i:02d}.wav','dur':round(best[2],2),'words':best[3]}); print(vid,i,round(best[0],2),'|',best[4])
json.dump(out,open(f'{DST}/'+('vo_line.json' if only else 'vo.json'),'w'),indent=1)
