"""Standard Chatterbox (emotion exaggeration control) batch. Loads ONCE, renders many jobs on CPU.
jobs = [{"ref":..., "text":..., "out":..., "exaggeration":0.5, "cfg_weight":0.5, "temperature":0.8, "seed":1}, ...]
Usage: python cb_std_batch.py jobs.json   (skips outputs that already exist)"""
import sys, os, json, time, wave, torch, numpy as np
torch.set_num_threads(int(os.getenv("CB_THREADS", "2")))
from chatterbox.tts import ChatterboxTTS

jobs = json.load(open(sys.argv[1], encoding="utf-8-sig"))
t0 = time.time()
model = ChatterboxTTS.from_local(os.environ["CB_CKPT"], device="cpu") if os.environ.get("CB_CKPT") else ChatterboxTTS.from_pretrained(device="cpu")
print(f"load {time.time()-t0:.1f}s", flush=True)
cur = None
for j in jobs:
    if os.path.exists(j["out"]):
        continue
    ex = float(j.get("exaggeration", 0.5))
    if (j["ref"], ex) != cur:
        model.prepare_conditionals(j["ref"], exaggeration=ex); cur = (j["ref"], ex)
    torch.manual_seed(j.get("seed", 0))
    t = time.time()
    wav = model.generate(j["text"], exaggeration=ex, cfg_weight=float(j.get("cfg_weight", 0.5)), temperature=float(j.get("temperature", 0.8)))
    pcm = (wav.squeeze(0).numpy().clip(-1, 1) * 32767).astype(np.int16)
    os.makedirs(os.path.dirname(j["out"]), exist_ok=True)
    with wave.open(j["out"], "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(model.sr); w.writeframes(pcm.tobytes())
    print(f"{j['out']} | ex {ex} | gen {time.time()-t:.1f}s | audio {len(pcm)/model.sr:.2f}s", flush=True)
