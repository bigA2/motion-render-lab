# Crawl Mixkit's free After Effects templates, download each zip on the runner, and score how convertible it is
# (by scanning the .aep binary for layer chunks, effect match-names, fonts and footage). Nothing from Mixkit is committed.
import io, json, re, sys, time, urllib.error, urllib.request, zipfile, collections
UA = {"User-Agent": "Mozilla/5.0"}
BASE = "https://mixkit.co/free-after-effects-templates/"
HEAVY = {"ADBE Glo2", "ADBE Fractal Noise", "ADBE Lens Flare", "ADBE Turbulent Displace", "ADBE Displacement Map", "ADBE Exposure2", "ADBE Optics Compensation", "ADBE Echo", "ADBE Particle Playground", "ADBE CurvesCustom", "ADBE 4ColorGradient"}
SAFE = {"ADBE Fill", "ADBE Gaussian Blur 2", "ADBE Fast Blur", "ADBE Tint", "ADBE Ramp", "ADBE Drop Shadow", "ADBE Stroke", "ADBE Linear Wipe", "ADBE Radial Wipe", "ADBE Venetian Blinds"}

def get(url, tries=6):
    for k in range(tries):  # polite: pause between requests, back off on 429
        time.sleep(1.5)
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except urllib.error.HTTPError as e:
            if e.code != 429 or k == tries - 1: raise
            time.sleep(30 * (k + 1))

def catalog(limit):
    seen = collections.OrderedDict()
    cats = set(re.findall(r'href="/free-after-effects-templates/([a-z-]+)/"', get(BASE).decode("utf-8", "ignore")))
    for cat in sorted(cats | {""}):
        for page in range(1, 20):
            try: html = get(f"{BASE}{cat + '/' if cat else ''}?page={page}").decode("utf-8", "ignore")
            except Exception: break
            items = re.findall(r'href="/free-after-effects-templates/([a-z0-9-]+)-(\d+)/"', html)
            new = [(s, i) for s, i in items if i not in seen]
            for s, i in new: seen[i] = {"id": i, "slug": s, "category": cat or "all"}
            if not new: break
            if len(seen) >= limit: return list(seen.values())[:limit]
    return list(seen.values())

def probe(t):
    i = t["id"]; t["page"] = f"{BASE}{t['slug']}-{i}/"; t["preview"] = f"https://assets.mixkit.co/video-templates/{i}/mixkit-{i}-360.mp4"
    try:
        z = zipfile.ZipFile(io.BytesIO(get(f"https://assets.mixkit.co/video-templates/{i}/mixkit-{i}.zip")))
    except Exception as e:
        t["error"] = f"download: {e}"; return t
    names = z.namelist()
    aeps = [n for n in names if n.lower().endswith(".aep")]
    t["footage"] = sum(n.lower().endswith((".mp4", ".mov", ".png", ".jpg", ".psd", ".ai")) for n in names)
    if not aeps: t["error"] = "no .aep"; return t
    b = z.read(aeps[0]); t["aep_mb"] = round(len(b) / 1e6, 1)
    names = collections.Counter(m.decode() for m in re.findall(rb"ADBE [A-Za-z0-9]+(?: [A-Za-z0-9]+)?", b))
    effects = {k: v for k, v in names.items() if k in HEAVY or k in SAFE}
    heavy = [k for k in effects if k in HEAVY]
    plug = sorted({m.decode().strip() for m in re.findall(rb"(?:Element 3D|Trapcode [A-Za-z]+|Saber|Deep Glow|Optical Flares|Twitch|Universe [A-Za-z]+)", b)})
    cc = sorted({m.decode().strip() for m in re.findall(rb"CC [A-Z][a-z]+(?: [A-Z][a-z]+)?", b)} - {"CC Composite"})
    t["layers"] = len(re.findall(rb"ldta", b)); t["comps"] = len(re.findall(rb"cdta", b))
    t["effects"] = effects; t["third_party"] = plug; t["cc_effects"] = cc[:6]
    t["has_3d_camera"] = b"ADBE Camera Options Group" in b and len(re.findall(rb"ADBE Camera Options Group", b)) > 1
    t["expressions"] = len(re.findall(rb"wiggle\(|loopOut\(|valueAtTime\(|thisComp\.", b))
    score = 100 - 12 * len(heavy) - 40 * bool(plug) - 4 * len(cc) - min(25, t["expressions"]) - 10 * (t["footage"] > 0) - 10 * t["has_3d_camera"]
    t["convert_score"] = max(0, score)
    t["route"] = "remotion-rebuild (aep2json)" if score >= 60 else ("lottiefiles-aep2lottie then fix" if score >= 35 else "study motion only")
    return t

if __name__ == "__main__":
    out = []
    for t in catalog(int(sys.argv[1]) if len(sys.argv) > 1 else 400):
        out.append(probe(t)); print(t["id"], t.get("convert_score"), t.get("error", ""), flush=True)
    json.dump(out, open("research/mixkit_ae.json", "w"), indent=1)
    rows = sorted(out, key=lambda x: -x.get("convert_score", -1))
    md = ["# Mixkit free After Effects templates — convertibility (auto-generated on GitHub Actions)", "", "| score | template | category | layers | effects (non-basic) | 3rd-party | expressions | route |", "|---|---|---|---|---|---|---|---|"]
    for t in rows:
        md.append(f"| {t.get('convert_score','-')} | [{t['slug']}]({t['page']}) ([preview]({t['preview']})) | {t['category']} | {t.get('layers','-')} | {', '.join(k for k in t.get('effects',{}) if k in HEAVY)[:80]} {' '.join(t.get('cc_effects',[]))[:60]} | {', '.join(t.get('third_party',[]))} | {t.get('expressions','-')} | {t.get('route', t.get('error',''))} |")
    open("research/MIXKIT_AE_REPORT.md", "w").write("\n".join(md) + "\n")
