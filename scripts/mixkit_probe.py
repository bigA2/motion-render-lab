# Crawl Mixkit's free After Effects templates, download each zip on the runner, and score how convertible it is
# (by scanning the .aep binary for layer chunks, effect match-names, fonts and footage). Nothing from Mixkit is committed.
import io, json, re, sys, urllib.request, zipfile, collections
UA = {"User-Agent": "Mozilla/5.0"}
BASE = "https://mixkit.co/free-after-effects-templates/"
SAFE = {"ADBE Fill", "ADBE Gaussian Blur 2", "ADBE Fast Blur", "ADBE Tint", "ADBE Ramp", "ADBE Drop Shadow", "ADBE Stroke", "ADBE Linear Wipe", "ADBE Radial Wipe", "ADBE Venetian Blinds"}

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()

def catalog(limit):
    seen = collections.OrderedDict()
    cats = set(re.findall(r'href="/free-after-effects-templates/([a-z-]+)/"', get(BASE).decode("utf-8", "ignore")))
    for cat in sorted(cats | {""}):
        for page in range(1, 20):
            html = get(f"{BASE}{cat + '/' if cat else ''}?page={page}").decode("utf-8", "ignore")
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
    effects = collections.Counter(m.decode() for m in re.findall(rb"ADBE [A-Za-z0-9 ]{2,30}", b) if not m.startswith((b"ADBE Transform", b"ADBE Vector", b"ADBE Text", b"ADBE Root", b"ADBE Mask", b"ADBE Effect Parade", b"ADBE Layer", b"ADBE Marker", b"ADBE Time", b"ADBE Audio", b"ADBE Material", b"ADBE Position", b"ADBE Scale", b"ADBE Opacity", b"ADBE Rotat", b"ADBE Anchor", b"ADBE Orientation")))
    plug = sorted({m.decode() for m in re.findall(rb"(?:CC |VC |Trapcode|Element|Saber|Deep Glow|Optical Flares)[A-Za-z0-9 ]{2,25}", b)})
    t["layers"] = len(re.findall(rb"Ldta", b)); t["comps"] = len(re.findall(rb"cdta", b))
    t["effects"] = dict(effects.most_common(12)); t["third_party"] = plug[:8]
    t["fonts"] = sorted({m.decode() for m in re.findall(rb"[A-Z][A-Za-z]+-(?:Bold|Regular|Medium|Light|Black|SemiBold)", b)})[:6]
    t["expressions"] = len(re.findall(rb"wiggle\(|loopOut\(|valueAtTime\(|thisComp\.", b))
    bad = [e for e in effects if e not in SAFE]
    score = 100 - 6 * len(bad) - 25 * bool(plug) - min(30, t["expressions"]) - 10 * (t["footage"] > 0)
    t["convert_score"] = max(0, score)
    t["route"] = "remotion-rebuild (aep2json)" if score >= 60 else ("lottiefiles-aep2lottie then fix" if score >= 30 else "skip / study motion only")
    return t

if __name__ == "__main__":
    out = []
    for t in catalog(int(sys.argv[1]) if len(sys.argv) > 1 else 400):
        out.append(probe(t)); print(t["id"], t.get("convert_score"), t.get("error", ""), flush=True)
    json.dump(out, open("research/mixkit_ae.json", "w"), indent=1)
    rows = sorted(out, key=lambda x: -x.get("convert_score", -1))
    md = ["# Mixkit free After Effects templates — convertibility (auto-generated on GitHub Actions)", "", "| score | template | category | layers | effects (non-basic) | 3rd-party | expressions | route |", "|---|---|---|---|---|---|---|---|"]
    for t in rows:
        md.append(f"| {t.get('convert_score','-')} | [{t['slug']}]({t['page']}) ([preview]({t['preview']})) | {t['category']} | {t.get('layers','-')} | {', '.join(k for k in t.get('effects',{}) if k not in SAFE)[:80]} | {', '.join(t.get('third_party',[]))} | {t.get('expressions','-')} | {t.get('route', t.get('error',''))} |")
    open("research/MIXKIT_AE_REPORT.md", "w").write("\n".join(md) + "\n")
