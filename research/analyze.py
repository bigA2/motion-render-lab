# Local analysis of the research crawl (no LLM, no Claude tokens): Laya yes/no scoring of real user text on CPU +
# plain counting over n8n templates, Anthropic Economic Index and O*NET. Writes E:\research\out\DIGEST.md (small) so the
# report only reads the filtered evidence.
# Run: E:\laya-pilot\.venv\Scripts\python.exe -I E:\research\analyze.py E:\research\raw
import collections, csv, glob, json, os, re, sys, time
RAW, OUT = sys.argv[1], os.environ.get('RESEARCH_OUT', 'E:/research/out')
NS, SH = int(os.environ.get('NSHARD', 0)), int(os.environ.get('SHARD', 0))
os.makedirs(OUT, exist_ok=True)
def jl(p): return [json.loads(l) for l in open(p, encoding='utf-8')] if os.path.exists(p) else []
def find(name): return (glob.glob(os.path.join(RAW, '**', name), recursive=True) or [''])[0]
md = ['# Research digest (auto, ' + time.strftime('%Y-%m-%d %H:%M') + ')\n']

# ---- 1. n8n templates: what people actually build (views = demand signal) ----------------------------------------
T = jl(find('n8n_templates.jsonl'))
if T:
    V = sum(t['views'] or 0 for t in T)
    md.append(f'## n8n templates: {len(T)} workflows, {V:,} total views\n### Top 60 by views')
    for t in sorted(T, key=lambda t: -(t['views'] or 0))[:60]: md.append(f"- {t['views']:,} · {t['name']}")
    node = collections.Counter(); nodev = collections.Counter()
    for t in T:
        for n in t['nodes']: node[n] += 1; nodev[n] += t['views'] or 0
    md.append('### Top 70 apps/nodes by views (count of templates)')
    md += [f'- {n}: {v:,} views ({node[n]} templates)' for n, v in nodev.most_common(70)]
    THEMES = {'lead / CRM': r'lead|crm|hubspot|pipedrive|salesforce|prospect', 'email': r'email|gmail|outlook|inbox|newsletter', 'social media': r'social|instagram|linkedin|twitter|x post|tiktok|facebook|youtube',
              'content / blog / SEO': r'blog|seo|content|article|wordpress', 'customer support / chatbot': r'support|chatbot|ticket|helpdesk|customer service|whatsapp|telegram',
              'invoices / finance': r'invoice|payment|stripe|quickbooks|xero|expense|accounting', 'reports / dashboards': r'report|dashboard|analytics|kpi', 'scraping / research': r'scrap|crawl|research|extract',
              'documents / PDF / OCR': r'pdf|document|ocr|contract', 'meetings / calendar': r'meeting|calendar|transcri|zoom|call', 'hiring / HR': r'recruit|candidate|resume|cv|hr |onboard', 'ecommerce': r'shopify|woocommerce|order|ecommerce|product',
              'AI agent / RAG': r'agent|rag|vector|embedding|llm|openai|gpt|claude', 'data sync / sheets': r'sheet|airtable|notion|database|sync'}
    md.append('### Themes (templates / views)')
    for k, rx in THEMES.items():
        hit = [t for t in T if re.search(rx, (t['name'] + ' ' + t['desc']).lower())]
        md.append(f"- {k}: {len(hit)} templates, {sum(t['views'] or 0 for t in hit):,} views")

# ---- 2. Anthropic Economic Index: which work tasks businesses (API) automate with AI -------------------------------
for src in ['1p_api', 'claude_ai']:
    A = jl(find(f'aei_{src}.jsonl'))
    if not A: continue
    by = collections.defaultdict(dict)
    for r in A: by[(r['category_name'], r['hierarchy_level'], r['node_name'])][r['metric_id']] = float(r['value'] or 0)
    for cat, lvl, title in [('onet', '0', 'O*NET tasks'), ('request', '1', 'request topics'), ('soc_occupation', '0', 'occupations')]:
        rows = [(k[2], v) for k, v in by.items() if k[0] == cat and str(k[1]) == lvl and 'pct' in v]
        rows.sort(key=lambda x: -x[1]['pct'])
        md.append(f'## Economic Index ({src}) — top {title} by share')
        for name, v in rows[:45]:
            extra = ' · auto ' + str(v['collaboration_bucket_automation_pct']) + '%' if 'collaboration_bucket_automation_pct' in v else ''
            md.append(f"- {v['pct']}% · {name[:150]}{extra}")
    ov = [v for k, v in by.items() if k[0] == 'overall']
    if ov: md.append(f'- overall ({src}): ' + ', '.join(f'{m}={x}' for m, x in ov[0].items()))

# ---- 3. O*NET tasks of FansaChat's target jobs (how those humans actually work) -----------------------------------
occ = {r['O*NET-SOC Code']: r['Title'] for r in csv.DictReader(open(find('onet_occupation_data.csv'), encoding='utf-8'))} if find('onet_occupation_data.csv') else {}
if occ:
    JOBS = r'marketing manager|social media|sales representative|sales manager|bookkeep|customer service rep|human resources specialist|recruit|real estate|property|medical secretar|executive secretar|project management|event planner|public relations|market research|insurance sales|fundraising|lodging manager|food service manager|general and operations'
    md.append('## O*NET: real task lists of target jobs')
    tasks = collections.defaultdict(list)
    for r in csv.DictReader(open(find('onet_task_statements.csv'), encoding='utf-8')):
        t = occ.get(r['O*NET-SOC Code'], '')
        if re.search(JOBS, t.lower()): tasks[t].append(r['Task'])
    for t, ts in sorted(tasks.items()):
        md.append(f'### {t} ({len(ts)} tasks)'); md += [f'- {x}' for x in ts[:14]]

# ---- 4. Forums + GitHub issues: top requests by engagement ---------------------------------------------------------
for f in sorted(glob.glob(os.path.join(RAW, '**', 'disc_*.jsonl'), recursive=True)):
    R = jl(f); md.append(f'## {os.path.basename(f)}: {len(R)} topics — top 50 by views')
    md += [f"- {r['views']:,} views · {r['likes']} likes · {r['title']}" for r in sorted(R, key=lambda r: -(r['views'] or 0))[:50]]
for f in sorted(glob.glob(os.path.join(RAW, '**', 'gh_*.jsonl'), recursive=True)):
    R = jl(f); md.append(f'## {os.path.basename(f)}: top 40 issues by reactions')
    md += [f"- {r['reactions']} 👍 · {r['state']} · {r['title']}" for r in R[:40]]

# ---- 5. Laya yes/no scoring of real user text (HN + forums + issues) -------------------------------------------------
Q = {'wants_task': 'Does the author describe a specific task or workflow they want automated or already automate?',
     'frustration': 'Is the author complaining about or frustrated with an automation tool, integration platform or AI agent?',
     'missing': 'Does the author say a tool cannot do something, or ask for a missing feature?',
     'price': 'Is cost, pricing or paying per task a problem for the author?',
     'unreliable': 'Does the author describe AI or an automation making mistakes, breaking, or being unreliable?',
     'trust': 'Does the author worry about control, approval, privacy or letting AI act on their behalf?'}
docs = []
for f in glob.glob(os.path.join(RAW, '**', '*.jsonl'), recursive=True):
    b = os.path.basename(f)
    if not re.match(r'(hn|disc_|gh_)', b): continue
    for r in jl(f):
        text = ((r.get('title') or '') + '. ' + (r.get('text') or r.get('excerpt') or '')).strip()
        if len(text) < 80 or not re.search(r'automat|workflow|zap|integrat|agent|n8n|make\.com|no-code|trigger', text.lower()): continue
        eng = (r.get('points') or 0) + (r.get('views') or 0) / 50 + (r.get('reactions') or 0) * 3 + (r.get('likes') or 0)
        docs.append({'src': b.replace('.jsonl', ''), 'title': r.get('title'), 'text': text[:1200], 'eng': eng})
docs.sort(key=lambda d: -d['eng']); docs = docs[:int(os.environ.get('LAYA_MAX', 4000))]
if NS: docs = docs[SH::NS]
sp = os.path.join(OUT, f'scored_{SH}.jsonl' if NS else 'scored.jsonl'); done = {json.loads(l)['text'][:200] for l in open(sp, encoding='utf-8')} if os.path.exists(sp) else set()
todo = [d for d in docs if d['text'][:200] not in done]
print('laya docs', len(docs), 'todo', len(todo), flush=True)
if todo and not os.environ.get('LAYA_SKIP'):
    import laya
    m = laya.load('convaiinnovations/laya', device='cpu'); t0 = time.time()
    with open(sp, 'a', encoding='utf-8') as out:
        for i, d in enumerate(todo):
            a = m.predict(d['text'], {k: {'type': 'noul', 'instructions': q} for k, q in Q.items()})['answers']
            d.update({k: round(a[k]['noul'], 3) for k in Q}); out.write(json.dumps(d, ensure_ascii=False) + '\n'); out.flush()
            if i % 50 == 0: print(i, len(todo), f'{time.time() - t0:.0f}s', flush=True)
if NS: sys.exit(0)  # shard job: scores only; the merge job writes the digest
S = [x for f in glob.glob(os.path.join(OUT, '**', 'scored*.jsonl'), recursive=True) for x in jl(f)]
md.append(f'## Laya-scored user voices ({len(S)} posts)')
for k, q in Q.items():
    hi = sorted([s for s in S if s[k] >= 0.7], key=lambda s: -(s[k] * (1 + min(s['eng'], 200) / 100)))
    md.append(f'### {k} — {q} ({len(hi)} posts ≥0.7)')
    md += [f"- [{s['src']} · eng {s['eng']:.0f}] {s['text'][:280]}" for s in hi[:30]]
open(os.path.join(OUT, 'DIGEST.md'), 'w', encoding='utf-8').write('\n'.join(md))
print('DIGEST', os.path.join(OUT, 'DIGEST.md'), sum(len(x) for x in md), 'chars')
