# voices/jobs/<id>.json from src/specs/<id>.json (female narrator; brand spelled for TTS; 3 takes on brand lines)
import json, sys, re
for vid in sys.argv[1:]:
    s=json.load(open(f'src/specs/{vid}.json',encoding='utf-8')); jobs=[]
    for i,t in enumerate(s['lines'],1):
        tts=re.sub(r'FansaChat','Fan-sa Chat',t).replace('700+','seven hundred plus').replace('$','').replace('24/7','twenty-four seven').replace('Typeform','Type-form').replace('Jotform','Jot-form').replace('Xero','Zero').replace('Clockify','Clock-ify')
        for seed in ((1,2,3) if any(x in tts for x in ('Fan-sa','Type-form','Jot-form','Zero','Clock-ify')) else (1,2)):
            jobs.append({"ref":"voices/female_ref.wav","text":tts,"out":f"out/{vid}/{i:02d}_take{seed}.wav","exaggeration":s.get('ex',0.45),"cfg_weight":0.5,"temperature":0.75,"seed":seed})
    json.dump(jobs,open(f'voices/jobs/{vid}.json','w'),indent=1); print(vid,len(jobs),'jobs')
