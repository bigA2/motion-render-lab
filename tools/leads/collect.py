# FansaChat lead collector (no AI, no tokens). Runs on GitHub Actions; output is ENCRYPTED to pubkey.pem.
# Sources: OpenStreetMap (Overpass) business listings with a website -> the business's own public pages
# (home/contact/about/team) -> public business email + fit signals. Respects robots.txt, identifies itself,
# skips EU/UK, keeps only businesses that look genuine and like teams/agencies that would automate work.
import csv, io, json, os, re, socket, ssl, sys, time, urllib.parse, urllib.request, urllib.robotparser
from concurrent.futures import ThreadPoolExecutor, as_completed

UA = 'FansaChatLeadBot/1.0 (+https://fansachat.com; business contact discovery; obeys robots.txt)'
TARGET = int(os.environ.get('TARGET', '500'))
# (city, country, south, west, north, east) - English-first markets outside EU/UK
CITIES = [('New York', 'US', 40.70, -74.02, 40.80, -73.93), ('Los Angeles', 'US', 34.00, -118.50, 34.12, -118.20),
          ('Chicago', 'US', 41.85, -87.70, 41.93, -87.60), ('Austin', 'US', 30.22, -97.80, 30.33, -97.68),
          ('San Francisco', 'US', 37.74, -122.45, 37.80, -122.38), ('Miami', 'US', 25.74, -80.25, 25.82, -80.17),
          ('Seattle', 'US', 47.58, -122.37, 47.66, -122.29), ('Denver', 'US', 39.70, -105.02, 39.77, -104.94),
          ('Toronto', 'CA', 43.63, -79.43, 43.70, -79.34), ('Vancouver', 'CA', 49.26, -123.17, 49.30, -123.09),
          ('Sydney', 'AU', -33.90, 151.17, -33.84, 151.24), ('Melbourne', 'AU', -37.83, 144.93, -37.79, 145.00),
          ('Auckland', 'NZ', -36.88, 174.72, -36.83, 174.80), ('Dubai', 'AE', 25.06, 55.12, 25.27, 55.32),
          ('Singapore', 'SG', 1.27, 103.80, 1.32, 103.88)]
OFFICES = 'advertising_agency|it|consulting|company|estate_agent|architect|graphic_design|marketing|web_design|coworking'
TOOLS = ['slack', 'notion', 'hubspot', 'asana', 'trello', 'clickup', 'monday.com', 'airtable', 'shopify', 'zapier',
         'make.com', 'google workspace', 'calendly', 'typeform', 'stripe', 'quickbooks', 'xero', 'pipedrive', 'salesforce']
TEAM_WORDS = ['our team', 'meet the team', 'team members', 'agency', 'studio', 'our clients', 'case studies', 'we help',
              'founded in', 'careers', 'we are hiring', 'account manager', 'project manager']
NEED_WORDS = ['onboarding', 'clients', 'leads', 'invoices', 'reports', 'projects', 'bookings', 'campaigns', 'proposals']
BAD_EMAIL = re.compile(r'(noreply|no-reply|donotreply|example\.|sentry|wixpress|\.png|\.jpg|\.gif|@2x|domain\.com|email\.com|yourdomain)', re.I)
EMAIL_RE = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}')
ROLE = {'info', 'hello', 'contact', 'office', 'admin', 'team', 'support', 'sales', 'enquiries', 'inquiries', 'studio', 'mail', 'hi'}
ctx = ssl.create_default_context()

def get(url, timeout=12):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'text/html,*/*'})
    with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
        if 'text/html' not in (r.headers.get('Content-Type') or 'text/html'): return ''
        return r.read(600_000).decode('utf-8', 'ignore')

def overpass(c):
    city, cc, s, w, n, e = c
    q = f'[out:json][timeout:120];(nwr["office"~"^({OFFICES})$"]["website"]({s},{w},{n},{e}););out tags center;'
    for mirror in ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']:
        try:
            req = urllib.request.Request(mirror, data=urllib.parse.urlencode({'data': q}).encode(), headers={'User-Agent': UA})
            els = json.loads(urllib.request.urlopen(req, timeout=180).read())['elements']
            return [{'name': x['tags'].get('name', ''), 'category': x['tags'].get('office', ''), 'city': city, 'country': cc,
                     'website': x['tags'].get('website') or x['tags'].get('contact:website', ''),
                     'osm_email': x['tags'].get('email') or x['tags'].get('contact:email', '')} for x in els if x.get('tags')]
        except Exception as ex:
            print('overpass fail', city, mirror, ex, flush=True); time.sleep(20)
    return []

def mx_ok(domain):
    # DNS MX via DNS-over-HTTPS (no extra packages); genuine domains receive mail
    try:
        j = json.loads(urllib.request.urlopen(urllib.request.Request(f'https://dns.google/resolve?name={domain}&type=MX', headers={'User-Agent': UA}), timeout=10).read())
        return any(a.get('type') == 15 for a in j.get('Answer', []))
    except Exception: return False

def research(b):
    site = b['website'].strip()
    if not site: return None
    if not site.startswith('http'): site = 'https://' + site
    host = urllib.parse.urlparse(site).netloc.lower().removeprefix('www.')
    if not host or any(x in host for x in ['facebook.', 'instagram.', 'linkedin.', 'google.', 'yelp.']): return None
    rp = urllib.robotparser.RobotFileParser()   # read with a timeout (rp.read() has none and can hang forever)
    try:
        req = urllib.request.Request(f'https://{host}/robots.txt', headers={'User-Agent': UA})
        rp.parse(urllib.request.urlopen(req, timeout=8, context=ctx).read(200_000).decode('utf-8', 'ignore').splitlines())
    except Exception: rp = None
    pages, texts = [site, f'https://{host}/contact', f'https://{host}/about', f'https://{host}/team'], []
    for p in pages:
        if rp and not rp.can_fetch(UA, p): continue
        try: texts.append(get(p))
        except Exception: pass
        time.sleep(1)
    if not texts: return None
    html = ' '.join(texts); low = html.lower()
    text = re.sub(r'<[^>]+>', ' ', low)
    emails = {e.lower().rstrip('.') for e in EMAIL_RE.findall(html) if not BAD_EMAIL.search(e)}
    if b['osm_email']: emails.add(b['osm_email'].lower())
    same = [e for e in emails if e.split('@')[1].removeprefix('www.') == host]
    pick = sorted(same or [e for e in emails if not e.endswith(('gmail.com', 'yahoo.com', 'hotmail.com'))] or [], key=lambda e: (e.split('@')[0] in ROLE, len(e)))
    if not pick: return None
    email = pick[0]
    title = re.search(r'<title[^>]*>(.*?)</title>', html, re.I | re.S)
    desc = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']{10,300})', html, re.I)
    tools = [t for t in TOOLS if t in text]
    team = [w for w in TEAM_WORDS if w in text]
    need = [w for w in NEED_WORDS if w in text]
    years = [int(y) for y in re.findall(r'(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(20\d\d)', low)]
    fresh = max(years) >= 2024 if years else False
    has_contact = bool(re.search(r'\+?\d[\d\s().-]{7,}\d', text)) or 'address' in text
    mx = mx_ok(email.split('@')[1])
    genuine = mx and (fresh or has_contact)
    score = 3 * min(len(tools), 4) + 2 * min(len(team), 5) + min(len(need), 5) + (3 if genuine else -10) + (2 if fresh else 0) + (1 if email.split('@')[0] not in ROLE else 0)
    return {**b, 'website': site, 'email': email, 'email_type': 'role' if email.split('@')[0] in ROLE else 'person',
            'mx_ok': mx, 'site_updated_2024plus': fresh, 'title': (title.group(1).strip()[:120] if title else ''),
            'what_they_do': (desc.group(1).strip() if desc else ''), 'tools_seen': ', '.join(tools),
            'team_signals': ', '.join(team), 'needs_seen': ', '.join(need), 'genuine': genuine, 'fit_score': score}

def main():
    biz, seen = [], set()
    for c in CITIES:
        found = overpass(c); print(c[0], len(found), flush=True)
        for b in found:
            k = urllib.parse.urlparse(b['website'] if b['website'].startswith('http') else 'https://' + b['website']).netloc.lower().removeprefix('www.')
            if k and k not in seen: seen.add(k); biz.append(b)
        time.sleep(15)
    print('businesses with websites:', len(biz), flush=True)
    out, t0 = [], time.time()
    with ThreadPoolExecutor(12) as ex:
        futs = [ex.submit(research, b) for b in biz]
        for i, f in enumerate(as_completed(futs)):
            try:
                r = f.result()
                if r and r['genuine'] and r['fit_score'] >= 6: out.append(r)
            except Exception: pass
            if i % 100 == 0: print(f'{i}/{len(biz)} checked, {len(out)} qualified, {int(time.time()-t0)}s', flush=True)
            if time.time() - t0 > 5 * 3600: break
    out.sort(key=lambda r: -r['fit_score']); out = out[:TARGET]
    buf = io.StringIO(); w = csv.DictWriter(buf, fieldnames=list(out[0].keys()) if out else ['empty']); w.writeheader(); w.writerows(out)
    from cryptography.fernet import Fernet
    from cryptography.hazmat.primitives import hashes, serialization
    from cryptography.hazmat.primitives.asymmetric import padding
    key = Fernet.generate_key()
    pub = serialization.load_pem_public_key(open(os.path.join(os.path.dirname(__file__), 'pubkey.pem'), 'rb').read())
    os.makedirs('out', exist_ok=True)
    open('out/leads.csv.enc', 'wb').write(Fernet(key).encrypt(buf.getvalue().encode()))
    open('out/key.enc', 'wb').write(pub.encrypt(key, padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None)))
    print('DONE qualified leads:', len(out))   # count only; no lead data ever printed to the public log

if __name__ == '__main__':
    main()
