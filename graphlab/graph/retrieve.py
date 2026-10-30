# Graph-lite retrieval + tiny eval (no AI). Query -> apps named in it -> best trigger + best action on the
# 1-hop neighbours of those apps, scored by plain BM25 over name + description text.
# Run: python graph/retrieve.py out/graph.json  -> out/EVAL.md
import json, math, os, re, sys, collections

g = json.load(open(sys.argv[1], encoding='utf-8'))
N = {n['id']: n for n in g['nodes']}
nbr = collections.defaultdict(list)
for a, _, b in g['edges']: nbr[a].append(b)
tok = lambda s: re.findall(r'[a-z0-9]+', s.lower())
docs = {i: tok(n['name'] + ' ' + n['text']) for i, n in N.items() if n['type'] in ('trigger', 'action')}
df = collections.Counter(w for d in docs.values() for w in set(d))
avg = sum(map(len, docs.values())) / max(1, len(docs))

def bm25(q, i, k=1.2, b=.75):
    d = docs[i]; tf = collections.Counter(d)
    return sum(math.log(1 + (len(docs) - df[w] + .5) / (df[w] + .5)) * tf[w] * (k + 1) / (tf[w] + k * (1 - b + b * len(d) / avg))
               for w in q if w in tf)

APPS = {n['id']: tok(n['name']) for n in N.values() if n['type'] == 'app'}
def apps_in(q):
    s = ' ' + ' '.join(q) + ' '
    hits = [a for a, w in APPS.items() if w and ' ' + ' '.join(w) + ' ' in s]
    return sorted(hits, key=lambda a: s.index(' ' + ' '.join(APPS[a]) + ' '))   # order of mention

def plan(text):
    q = tok(text); apps = apps_in(q)
    if not apps: return None
    best = lambda kind, pool: max(((bm25(q, i), i) for a in pool for i in nbr[a] if N[i]['type'] == kind), default=(0, None))[1]
    return {'apps': apps, 'trigger': best('trigger', apps[:1]), 'action': best('action', apps[1:] or apps)}

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
]
rows, ok = [], 0
for text, ta, aa in EVAL:
    p = plan(text)
    t = p and p['trigger']; a = p and p['action']
    good = bool(t and a and N[t]['app'] == ta and N[a]['app'] == aa); ok += good
    rows.append(f"| {text} | {N[t]['name'] if t else '-'} ({N[t]['app'] if t else ''}) | {N[a]['name'] if a else '-'} ({N[a]['app'] if a else ''}) | {'yes' if good else 'NO'} |")
md = ['# Graph-lite retrieval eval (no AI)', f'App-level accuracy: {ok}/{len(EVAL)}', '',
      '| request | trigger picked | action picked | right apps |', '|---|---|---|---|'] + rows
out = os.path.join(os.path.dirname(sys.argv[1]), 'EVAL.md')
open(out, 'w', encoding='utf-8').write('\n'.join(md) + '\n'); print('\n'.join(md))
