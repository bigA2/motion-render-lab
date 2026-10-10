# Final audio mix (ffmpeg + numpy): music ducked under VO, VO lines, soft SFX. Mirrors engine.tsx timing exactly.
import json, sys, subprocess, numpy as np
vid=sys.argv[1]; out=sys.argv[2]; SR=48000
S=json.load(open(f'src/specs/{vid}.json',encoding='utf-8')); V=json.load(open(f'public/v/{vid}/vo.json'))
MUSIC={'B1':'07_warm-emotional_everything-is-love_komiku.mp3','B2':'07_warm-emotional_everything-is-love_komiku.mp3','B3':'04_lofi-future_traveling-in-your-mind_loyalty-freak-music.mp3','B4':'05_lofi-warm_roof-tops_holiznacc0.mp3','B5':'06_warm-emotional_washed-up_holiznacc0.mp3','B6':'07_warm-emotional_everything-is-love_komiku.mp3','B7':'01_upbeat-tech_high-technologic-beat-explosion_loyalty-freak-music.mp3','B8':'03_calm-minimal_one-cool-minute_loyalty-freak-music.mp3','D1':'04_lofi-future_traveling-in-your-mind_loyalty-freak-music.mp3','D2':'01_upbeat-tech_high-technologic-beat-explosion_loyalty-freak-music.mp3','D3':'01_upbeat-tech_high-technologic-beat-explosion_loyalty-freak-music.mp3','D4':'02_calm-minimal_once-more-with-you_loyalty-freak-music.mp3'}
GAP=8; starts=[]; t=0
for b in S['beats']:
    starts.append(t); d=round(V[b['line']]['dur']*30)+GAP+6+b.get('hold',0) if 'line' in b else b.get('dur',90); t+=d
total=t+40; N=int(total/30*SR)
def load(p,ch=2):
    a=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',p,'-ac',str(ch),'-ar',str(SR),'-f','f32le','-']),np.float32); return a.reshape(-1,ch)
mix=np.zeros((N,2),np.float32)
m=load('public/audio/'+S.get('music',MUSIC[S['pal']])); 
if len(m)<N: m=np.tile(m,(N//len(m)+1,1))
m=m[:N]
talk=np.zeros(N,bool)
for i,b in enumerate(S['beats']):
    if 'line' in b:
        s=int((starts[i]+6)/30*SR); e=int((starts[i]+6+V[b['line']]['dur']*30)/30*SR); talk[s:min(N,e)]=True
g=np.where(talk,0.14,0.30).astype(np.float32); k=int(0.12*SR); g=np.convolve(g,np.ones(k)/k,'same')
fade=np.ones(N,np.float32); fi=int(10/30*SR); fo=int(40/30*SR); fade[:fi]=np.linspace(0,1,fi); fade[-fo:]=np.linspace(1,0,fo)
mix+=m*(g*fade)[:,None]
for i,b in enumerate(S['beats']):
    if 'line' in b:
        a=load("public/"+V[b["line"]]["file"]); s=int((starts[i]+6)/30*SR); e=min(N,s+len(a)); mix[s:e]+=a[:e-s]
MAP={'card':'k_pluck_001','notif':'k_glass_002','phone':'k_glass_002','stamp':'k_drop_002','chat':'k_click_002','flow':'k_confirmation_002','counter':'k_tick_001','badges':'k_bong_001','end':'k_pluck_002'}
sfx=[]
for i,b in enumerate(S['beats']):
    e=next((x for x in b['els'] if x['t'] in MAP),None)
    if not e: continue
    at=starts[i]+(10+e.get('typeDur',90) if e['t']=='chat' else 70 if e['t']=='flow' else 12)
    if not sfx or at-sfx[-1][0]>=40: sfx.append((at,MAP[e['t']]))
for at,f in sfx[:7]:
    a=load(f'public/audio/sfx/{f}.ogg'); s=int(at/30*SR); e=min(N,s+len(a)); mix[s:e]+=a[:e-s]*0.2
mix=np.clip(mix,-1,1)
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-c:a','pcm_s16le',out],input=mix.astype(np.float32).tobytes(),check=True)
print('mixed',total/30,'s')
