# Builds a browsable gallery of FREE assets for FansaChat ads (no downloads committed; previews load from the source CDNs):
# LottieFiles public animations (Lottie Simple License, plays in Remotion via @remotion/lottie with no conversion)
# and Mixkit free stock video loops (Mixkit License) for gradient / abstract / tech backgrounds.
import html, json, re, sys, time, urllib.request
UA = {"User-Agent": "Mozilla/5.0", "Content-Type": "application/json"}
LOTTIE_Q = ["laptop mockup", "macbook", "phone mockup", "device mockup", "browser window", "dashboard ui", "saas", "app interface",
            "gradient background", "abstract background", "blob", "mesh gradient", "workflow", "automation", "data flow", "connect apps",
            "chat bubble", "message notification", "typing", "cursor click", "checkmark success", "loading", "rocket launch", "calendar",
            "email", "crm", "invoice", "graph growth", "ai sparkle", "robot assistant"]
VIDEO_CATS = ["gradient", "abstract", "background", "technology", "particles", "light", "bokeh"]

def post(q, first=24):
    body = json.dumps({"query": 'query($q:String!,$n:Int){searchPublicAnimations(query:$q,first:$n){edges{node{name jsonUrl url}}}}', "variables": {"q": q, "n": first}}).encode()
    for k in range(4):
        try:
            r = json.load(urllib.request.urlopen(urllib.request.Request("https://graphql.lottiefiles.com/2022-08", body, UA), timeout=60))
            return [e["node"] for e in r["data"]["searchPublicAnimations"]["edges"]]
        except Exception:
            time.sleep(10 * (k + 1))
    return []

def get(url):
    time.sleep(1.5)
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read().decode("utf-8", "ignore")

lottie = {}
for q in LOTTIE_Q:
    lottie[q] = post(q)
videos = {}
for c in VIDEO_CATS:
    ids = []
    for page in (1, 2, 3):
        try: ids += re.findall(r'/free-stock-video/([a-z0-9-]+)-(\d+)/', get(f"https://mixkit.co/free-stock-video/{c}/?page={page}"))
        except Exception: break
    seen, uniq = set(), []
    for s, i in ids:
        if i not in seen: seen.add(i); uniq.append({"slug": s, "id": i, "page": f"https://mixkit.co/free-stock-video/{s}-{i}/", "mp4": f"https://assets.mixkit.co/videos/{i}/{i}-360.mp4"})
    videos[c] = uniq[:40]
json.dump({"lottie": lottie, "videos": videos}, open("research/asset_gallery.json", "w"), indent=1)

e = html.escape
out = ['<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>FansaChat asset gallery</title>',
       '<script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>',
       '<style>body{background:#0b0b14;color:#e8e8f0;font:14px system-ui;margin:16px}h2{margin:28px 0 8px}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px}'
       '.c{background:#161624;border-radius:10px;padding:6px}.c div,.c video{width:100%;aspect-ratio:1;background:#fff;border-radius:6px}.c video{aspect-ratio:16/9;background:#000}a{color:#9aa0ff;font-size:12px;word-break:break-all}</style>',
       '<h1>FansaChat free asset gallery</h1><p>Lottie = plays in our Remotion pipeline directly (LottieTemplate). Videos = Mixkit free loops for backgrounds. Check each source licence page before use.</p>']
n = 0
for q, items in lottie.items():
    out.append(f"<h2>Lottie · {e(q)} ({len(items)})</h2><div class=g>")
    for it in items:
        out.append(f'<div class=c><div class=l data-src="{e(it["jsonUrl"])}"></div><a href="{e(it["url"])}" target=_blank>{e(it["name"])}</a></div>'); n += 1
    out.append("</div>")
for c, items in videos.items():
    out.append(f"<h2>Video loops · {e(c)} ({len(items)})</h2><div class=g>")
    for it in items:
        out.append(f'<div class=c><video muted loop playsinline preload=none src="{e(it["mp4"])}" onmouseover="this.play()" onmouseout="this.pause()"></video><a href="{e(it["page"])}" target=_blank>{e(it["slug"])}</a></div>')
    out.append("</div>")
out.append('<script>const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting&&!x.target.dataset.on){x.target.dataset.on=1;lottie.loadAnimation({container:x.target,renderer:"svg",loop:true,autoplay:true,path:x.target.dataset.src})}}));document.querySelectorAll(".l").forEach(d=>io.observe(d))</script>')
open(sys.argv[1], "w", encoding="utf-8").write("\n".join(out))
print("lottie", n, "videos", sum(len(v) for v in videos.values()))
