# Research crawl (public data only, no LLM): what people automate, what they hate about automation/AI tools, what is
# missing. Runs on GitHub Actions (research-crawl.yml); output = artifact only. Local Laya filtering happens afterwards.
import csv, gzip, io, json, os, re, sys, time, urllib.parse, urllib.request

OUT = sys.argv[1] if len(sys.argv) > 1 else 'out'
os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (research; fansachat market study)'}
LOG = open(f'{OUT}/log.txt', 'w')
def log(*a): print(*a, flush=True); print(*a, file=LOG, flush=True)
def get(url, tries=3, headers=None):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={**UA, **(headers or {})}), timeout=60) as r: return r.read()
        except Exception as e:
            log('retry', i, url[:120], e); time.sleep(2 + 3 * i)
    return None
def jget(url, **kw):
    b = get(url, **kw); return json.loads(b) if b else None
def dump(name, rows):
    with open(f'{OUT}/{name}.jsonl', 'w', encoding='utf-8') as f:
        for r in rows: f.write(json.dumps(r, ensure_ascii=False) + '\n')
    log(name, len(rows))
strip = lambda s: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', s or '')).strip()

def hn():
    qs = ['zapier', 'make.com', 'n8n', 'workflow automation', 'automate my', 'no-code automation', 'ai agent workflow', 'ai agents unreliable',
          'small business automation', 'agency automation', 'crm automation', 'lindy ai', 'gumloop', 'activepieces', 'automation tool pricing', 'zapier alternative']
    rows, seen = [], set()
    for q in qs:
        for tag in ['comment', 'story']:
            for page in range(5):
                d = jget(f'https://hn.algolia.com/api/v1/search?query={urllib.parse.quote(q)}&tags={tag}&hitsPerPage=200&page={page}&numericFilters=created_at_i>1672531200')
                if not d or not d.get('hits'): break
                for h in d['hits']:
                    if h['objectID'] in seen: continue
                    seen.add(h['objectID'])
                    t = strip(h.get('comment_text') or h.get('story_text') or '') or (h.get('title') or '')
                    if len(t) > 60 or tag == 'story': rows.append({'src': 'hn', 'q': q, 'kind': tag, 'title': h.get('title') or h.get('story_title'), 'text': t[:4000], 'points': h.get('points'), 'at': h.get('created_at'), 'id': h['objectID']})
                time.sleep(0.2)
    dump('hn', rows)

def discourse(base, name, paths, deep=250):
    topics = {}
    for p in paths:
        for page in range(40):
            d = jget(f'{base}{p}{"&" if "?" in p else "?"}page={page}')
            tl = (d or {}).get('topic_list', {}).get('topics', [])
            if not tl: break
            for t in tl: topics.setdefault(t['id'], {'src': name, 'id': t['id'], 'title': t.get('title'), 'excerpt': strip(t.get('excerpt')), 'views': t.get('views'), 'likes': t.get('like_count'), 'posts': t.get('posts_count'), 'cat': t.get('category_id'), 'at': t.get('created_at'), 'path': p})
            time.sleep(0.3)
    top = sorted(topics.values(), key=lambda x: -(x['views'] or 0))[:deep]
    for t in top:
        d = jget(f'{base}/t/{t["id"]}.json')
        if d: t['text'] = ' \n'.join(strip(p.get('cooked'))[:1500] for p in d.get('post_stream', {}).get('posts', [])[:6])
        time.sleep(0.35)
    dump(name, list(topics.values()))

def discourse_cats(base):
    d = jget(f'{base}/categories.json') or {}
    return [(c['slug'], c['id'], c.get('topic_count')) for c in d.get('category_list', {}).get('categories', [])]

def n8n_templates():
    rows, page = [], 1
    while True:
        d = jget(f'https://api.n8n.io/api/templates/search?page={page}&rows=100')
        w = (d or {}).get('workflows', [])
        if not w: break
        for x in w: rows.append({'id': x['id'], 'name': x['name'], 'views': x.get('totalViews'), 'paid': bool(x.get('price')), 'at': x.get('createdAt'),
                                 'desc': strip(x.get('description'))[:600], 'nodes': sorted({n.get('displayName') or n.get('name') for n in x.get('nodes', []) if isinstance(n, dict)})})
        page += 1; time.sleep(0.25)
        if page > 200: break
    dump('n8n_templates', rows)

def aei():
    base = 'https://huggingface.co/datasets/Anthropic/EconomicIndex/resolve/main/release_2026_06_26/data/'
    keep = {'pct', 'usage_pct', 'collaboration_bucket_automation_pct', 'collaboration_bucket_augmentation_pct', 'ai_autonomy_mean', 'human_only_time_mean', 'human_with_ai_time_mean', 'use_case_work_pct'}
    for f in ['aei_1p_api_2026-06-26.csv', 'aei_claude_ai_2026-06-26.csv']:
        b = get(base + f, tries=4)
        if not b: continue
        rows = []
        for r in csv.DictReader(io.StringIO(b.decode('utf-8', 'replace'))):
            if r['geo_id'] == 'GLOBAL' and r['metric_id'] in keep and r['category_name'] in ('onet', 'request', 'soc_occupation', 'overall'):
                rows.append({k: r[k] for k in ('category_name', 'hierarchy_level', 'metric_id', 'value', 'node_name', 'node_external_id')})
        dump('aei_' + f.split('_2026')[0].replace('aei_', ''), rows)

def onet():
    for f in ['task_statements', 'occupation_data', 'tasks_to_dwas', 'dwa_reference']:
        b = get(f'https://www.onetcenter.org/dl_files/database/db_31_0_csv/{f}.csv')
        if b: open(f'{OUT}/onet_{f}.csv', 'wb').write(b); log('onet', f, len(b))

def gh_issues(repo, n=400):
    tok = os.environ.get('GH_TOKEN', '')
    rows = []
    for page in range(1, n // 100 + 1):
        d = jget(f'https://api.github.com/search/issues?q=repo:{repo}+is:issue&sort=reactions&order=desc&per_page=100&page={page}', headers={'Authorization': f'Bearer {tok}'} if tok else None)
        for i in (d or {}).get('items', []):
            rows.append({'src': repo, 'title': i['title'], 'text': (i.get('body') or '')[:3000], 'reactions': i.get('reactions', {}).get('total_count'), 'comments': i.get('comments'), 'state': i['state'], 'labels': [l['name'] for l in i.get('labels', [])], 'at': i['created_at']})
        time.sleep(2.5)
    dump('gh_' + repo.replace('/', '_'), rows)

if __name__ == '__main__':
    steps = sys.argv[2].split(',') if len(sys.argv) > 2 else ['hn', 'disc', 'n8n', 'aei', 'onet', 'gh']
    if 'hn' in steps: hn()
    if 'disc' in steps:
        for base, name in [('https://community.n8n.io', 'disc_n8n'), ('https://community.make.com', 'disc_make'), ('https://community.activepieces.com', 'disc_activepieces')]:
            cats = discourse_cats(base); log(name, 'cats', cats[:40])
            fr = [f'/c/{s}/{i}.json' for s, i, _ in cats if re.search(r'feature|idea|request|wish|feedback', s)]
            discourse(base, name, fr + ['/top.json?period=yearly', '/top.json?period=all'])
    if 'n8n' in steps: n8n_templates()
    if 'aei' in steps: aei()
    if 'onet' in steps: onet()
    if 'gh' in steps:
        for r in ['activepieces/activepieces', 'n8n-io/n8n', 'PipedreamHQ/pipedream', 'windmill-labs/windmill']: gh_issues(r)
    log('DONE')
