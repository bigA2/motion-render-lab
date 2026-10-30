# Graph-lite retrieval + tiny eval (no AI). Query -> apps named in it -> best trigger + best action on the
# 1-hop neighbours of those apps, scored by plain BM25 over name + description text.
# v2: aliases, trigger from FIRST-named app, action from LAST-named app, verb intent filter; BM25 breaks ties.
# Run: python graph/retrieve.py out/graph.json  -> out/EVAL.md
import json, math, os, re, sys, collections

g = json.load(open(sys.argv[1], encoding='utf-8'))
N = {n['id']: n for n in g['nodes']}
nbr = collections.defaultdict(list)
for a, _, b in g['edges']: nbr[a].append(b)
def stem(w):  # crude suffix strip so moves/moved/move and rows/row meet
    if len(w) <= 3 or w.endswith('ss'): return w
    if w.endswith('ies'): return w[:-3] + 'y'
    for suf in ('es', 'ed', 's', 'e'):
        if w.endswith(suf): return w[:-len(suf)]
    return w
tok = lambda s: [stem(w) for w in re.findall(r'[a-z0-9]+', s.lower())]
STOP = set(tok('a an the to in on of my me it is and with for from when whenever every should into new'))
docs = {i: tok(n['name'] + ' ' + n['text']) for i, n in N.items() if n['type'] in ('trigger', 'action')}
df = collections.Counter(w for d in docs.values() for w in set(d))
avg = sum(map(len, docs.values())) / max(1, len(docs))

def bm25(q, i, k=1.2, b=.75):
    d = docs[i]; tf = collections.Counter(d)
    return sum(math.log(1 + (len(docs) - df[w] + .5) / (df[w] + .5)) * tf[w] * (k + 1) / (tf[w] + k * (1 - b + b * len(d) / avg))
               for w in q if w in tf)

# app aliases (v2): display name, slug, slug without -bot/-app, hand list. Longest overlapping mention wins.
APPS = {n['id']: [tok(a) for a in n.get('aliases') or [n['name']]] for n in N.values() if n['type'] == 'app'}
def apps_in(q):
    spans = []
    for a, als in APPS.items():
        hits = [(i, i + len(w)) for w in als if w for i in range(len(q) - len(w) + 1) if q[i:i + len(w)] == w]
        if hits: spans.append((min(hits, key=lambda h: (h[0], -h[1])), a))
    keep = [(sp, a) for sp, a in spans if not any(o != sp and o[0] <= sp[0] and sp[1] <= o[1] and o[1] - o[0] > sp[1] - sp[0] for o, _ in spans)]
    return sorted(keep)   # [((start, end), app)] in order of mention

# verb intent (v2)
S = lambda words: set(tok(words))
TRIG_Q = S('create created new added submitted booked received comes')
TRIG_GOOD = S('new created added submitted received scheduled')
TRIG_BAD = S('canceled cancelled deleted removed updated archived failed')
READ = S('get list find search delete archive remove retrieve lookup')
WRITE = S('create add send post upload save insert append new publish')

def score(q, i, qs):
    n = tok(N[i]['name'])
    if not n or ' '.join(n) == 'custom api call': return None
    s = bm25(q, i)
    if N[i]['type'] == 'trigger':
        if TRIG_BAD & set(n) and not TRIG_BAD & qs: return None
        if TRIG_Q & qs and TRIG_GOOD & set(n): s += 3
    else:
        if n[0] in READ and n[0] not in qs: return None
        if n[0] in WRITE: s += 3
    return s

def plan(text):
    q = tok(text); found = apps_in(q)
    if not found: return None
    apps = [a for _, a in found]
    # trigger = first-named app, except an app inside a later "when/whenever/once ..." clause; action = last OTHER named app
    w = next((i for i, x in enumerate(q) if x in S('when whenever once')), None)
    after = [a for (st, _), a in found if w is not None and st > w]
    ta = after[0] if after and w > found[0][0][0] else apps[0]
    aa = next((a for a in reversed(apps) if a != ta), ta)
    used = {k for (st, en), _ in found for k in range(st, en)}
    qb = [x for k, x in enumerate(q) if k not in used and x not in STOP]   # BM25 words: no app names, no stopwords
    def best(kind, app):
        c = [(score(qb, i, set(q)), i) for i in nbr[app] if N[i]['type'] == kind]
        return max(((s, i) for s, i in c if s is not None), default=(0, None))[1]
    return {'apps': apps, 'trigger': best('trigger', ta), 'action': best('action', aa)}

EVAL = [  # (request, trigger app, action app)
    ('When a new item is added to my Notion database, post it in Slack', 'notion', 'slack'),
    ('Every new Typeform response should become a row in Google Sheets', 'typeform', 'google-sheets'),
    ('When a Stripe payment succeeds, send me a Telegram message', 'stripe', 'telegram-bot'),
    ('New HubSpot contact -> add a task in Asana', 'hubspot', 'asana'),
    ('When I get a new Gmail email with an attachment, save it to Google Drive', 'gmail', 'google-drive'),
    ('New Shopify order, create an invoice in QuickBooks', 'shopify', 'quickbooks'),
    ('When a Calendly meeting is booked, add the person to Mailchimp', 'calendly', 'mailchimp'),
    ('New row in Airtable, send a Discord message', 'airtable', 'discord'),
    ('When a Trello card moves, notify my Slack channel', 'trello', 'slack'),
    ('New GitHub issue, create a Linear issue', 'github', 'linear'),
    ('Create an event in Google Calendar when a Calendly meeting is booked', 'calendly', 'google-calendar'),
    ('When a new Stripe payment comes in, add a row to Google Sheets', 'stripe', 'google-sheets'),
    ('New Google Form response, send an email with Gmail', 'google-forms', 'gmail'),
    ('When a new file is added to Google Drive, post it in Slack', 'google-drive', 'slack'),
]
rows, ok = [], 0
for text, ta, aa in EVAL:
    p = plan(text)
    t = p and p['trigger']; a = p and p['action']
    good = bool(t and a and N[t]['app'] == ta and N[a]['app'] == aa); ok += good
    rows.append(f"| {text} | {', '.join(p['apps']) if p else '-'} | {N[t]['name'] if t else '-'} ({N[t]['app'] if t else ''}) | {N[a]['name'] if a else '-'} ({N[a]['app'] if a else ''}) | {'yes' if good else 'NO'} |")
md = ['# Graph-lite retrieval eval (no AI)', f'App-level accuracy: {ok}/{len(EVAL)}', '',
      '| request | apps detected | trigger picked | action picked | right apps |', '|---|---|---|---|---|'] + rows
out = os.path.join(os.path.dirname(sys.argv[1]), 'EVAL.md')
open(out, 'w', encoding='utf-8').write('\n'.join(md) + '\n'); print('\n'.join(md))
