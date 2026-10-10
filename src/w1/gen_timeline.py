# Builds src/w1/timeline.json from public/w1/vo.json (picked narrator takes + Whisper word times).
import json
V=json.load(open(r'E:\remotion-studio\public\w1\vo.json'))
F=30; fr=lambda s: s*F
dur=[l['dur'] for l in V]; W=[l['words'] for l in V]
at={}; sc={}
def word(i,txt,nth=0):
    hits=[w for w in W[i] if w['w'].lower().strip('.,!?').startswith(txt)]
    return hits[nth]['s'] if len(hits)>nth else 0
t=0  # seconds
sc['meet']=[0,None]; at[1]=14/F; sc['meet'][1]=max(at[1]+dur[0]+16/F, 84/F)
s=sc['meet'][1]; sc['pain']=[s,None]; at[2]=s+6/F; at[3]=at[2]+dur[1]+5/F; at[4]=at[3]+dur[2]+8/F; sc['pain'][1]=at[4]+dur[3]+16/F
s=sc['pain'][1]; sc['type']=[s,None]; at[5]=s+8/F; sc['type'][1]=s+max(dur[4]+14/F, 142/F)
s=sc['type'][1]; sc['build']=[s,None]; at[6]=s+8/F; sc['build'][1]=s+max(dur[5]+14/F, 132/F)
s=sc['build'][1]; sc['stats']=[s,None]; at[7]=s+8/F; at[8]=at[7]+dur[6]+8/F; sc['stats'][1]=at[8]+dur[7]+40/F
s=sc['stats'][1]; sc['founder']=[s,None]; at[9]=s+8/F; at[10]=at[9]+dur[8]+10/F; sc['founder'][1]=at[10]+dur[9]+16/F
s=sc['founder'][1]; sc['cta']=[s,None]; at[11]=s+16/F; at[12]=at[11]+dur[10]+12/F; sc['cta'][1]=at[12]+dur[11]+80/F
total=sc['cta'][1]
vo={f'l{i}':round(at[i],3) for i in at}
vo.update({'copy':at[4]+word(3,'copy'),'paste':at[4]+word(3,'paste'),'chase':at[4]+word(3,'chase'),
           'inv':at[7]+word(6,'invoice'),'lead':at[7]+word(6,'lead'),'ord':at[7]+word(6,'order'),'sup':at[7]+word(6,'support'),
           'nocode':at[9]+word(8,'no',1)})
vo={k:round(v,3) for k,v in vo.items()}
out={'fps':F,'total':round(total,3),'vo':vo,'scenes':{k:[round(a*F),round(b*F)] for k,(a,b) in sc.items()},
     'lines':[{'file':V[i-1]['file'],'at':round(at[i],3),'dur':V[i-1]['dur']} for i in range(1,13)]}
json.dump(out,open(r'E:\remotion-studio\src\w1\timeline.json','w'),indent=1)
print('total',round(total,2),'s'); print(out['scenes']); print(vo)
