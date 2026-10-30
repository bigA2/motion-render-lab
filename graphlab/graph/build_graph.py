# Graph-lite builder (no AI, no tokens): reads the Activepieces community pieces SOURCE (MIT) and writes
# a typed graph  app -> trigger / action  (+ app -> category). Each node keeps the human + aiMetadata text,
# so retrieval is plain keyword scoring over nodes + 1-hop expansion, never LLM indexing.
# v2: real npm metadata from graph/extract.mjs (npm_meta.json) where available, regex over source as fallback.
# Run (GitHub Actions): python graph/build_graph.py <path-to activepieces/packages/pieces/community> [npm_meta.json]
import json, os, re, sys, collections

ROOT = sys.argv[1]
META = json.load(open(sys.argv[2], encoding='utf-8')) if len(sys.argv) > 2 and os.path.isfile(sys.argv[2]) else {}
HAND = {  # small hand alias list for top apps (slug -> extra aliases)
    'telegram-bot': ['telegram'], 'google-sheets': ['gsheets', 'google sheets', 'google sheet'],
    'google-calendar': ['gcal', 'google calendar'], 'google-drive': ['gdrive', 'google drive'],
    'google-forms': ['google forms', 'google form', 'gforms'], 'gmail': ['google mail'],
    'microsoft-teams': ['ms teams', 'teams'], 'microsoft-outlook': ['outlook'], 'twitter': ['x', 'twitter'],
    'microsoft-excel-365': ['excel'], 'microsoft-onedrive': ['onedrive'], 'quickbooks': ['quickbooks online', 'qbo'],
    'whatsapp': ['whatsapp'], 'hubspot': ['hubspot'], 'github': ['github'], 'trello': ['trello'],
}
def aliases(slug, name):
    a = [name.lower(), slug, re.sub(r'-(bot|app)$', '', slug)] + HAND.get(slug, [])
    return list(dict.fromkeys(x.replace('-', ' ') for x in a if x))
OUT = os.environ.get('GRAPH_OUT', 'out')
os.makedirs(OUT, exist_ok=True)
CALL = re.compile(r'create(Action|Trigger)\s*\(\s*\{', re.S)
STR = lambda key: re.compile(key + r"""\s*:\s*(['"`])((?:\\.|(?!\1).)*)\1""", re.S)
NAME, DISP, DESC = STR(r'\bname'), STR(r'\bdisplayName'), STR(r'\bdescription')
AIDESC = re.compile(r"""aiMetadata\s*:\s*\{[^}]*?description\s*:\s*(['"`])((?:\\.|(?!\1).)*)\1""", re.S)
CAT = re.compile(r'PieceCategory\.([A-Z_]+)')

def first(rx, s):
    m = rx.search(s)
    return m.group(2).strip() if m else ''

nodes, edges = [], []
for piece in sorted(os.listdir(ROOT)):
    src = os.path.join(ROOT, piece, 'src')
    idx = os.path.join(src, 'index.ts')
    if not os.path.isfile(idx): continue
    head = open(idx, encoding='utf-8', errors='ignore').read()
    app = f'app:{piece}'
    m = META.get(piece)
    name = (m and m['displayName']) or first(DISP, head) or piece
    nodes.append({'id': app, 'type': 'app', 'name': name, 'text': (m and m['description']) or first(DESC, head),
                  'aliases': aliases(piece, name), 'source': 'npm' if m else 'regex'})
    for c in sorted(set(m['categories'] if m else CAT.findall(head))):
        if f'cat:{c}' not in {n['id'] for n in nodes if n['type'] == 'category'}:
            nodes.append({'id': f'cat:{c}', 'type': 'category', 'name': c.replace('_', ' ').title(), 'text': ''})
        edges.append([app, 'in_category', f'cat:{c}'])
    if m:
        for kind in ('trigger', 'action'):
            for st in m[kind + 's']:
                nid = f'{kind}:{piece}:{st["name"]}'
                nodes.append({'id': nid, 'type': kind, 'name': st['displayName'], 'app': piece,
                              'text': (st['description'] + ' ' + st['ai']).strip()})
                edges.append([app, 'has_' + kind, nid])
        continue
    for dp, _, files in os.walk(src):
        for f in files:
            if not f.endswith('.ts') or f.endswith('.spec.ts'): continue
            s = open(os.path.join(dp, f), encoding='utf-8', errors='ignore').read()
            for m in CALL.finditer(s):
                body = s[m.end():m.end() + 6000]
                kind = m.group(1).lower()
                key = first(NAME, body)
                if not key: continue
                nid = f'{kind}:{piece}:{key}'
                nodes.append({'id': nid, 'type': kind, 'name': first(DISP, body), 'app': piece,
                              'text': (first(DESC, body) + ' ' + first(AIDESC, body)).strip()})
                edges.append([app, 'has_' + kind, nid])

# de-dupe (a piece can re-export the same action)
seen, uniq = set(), []
for n in nodes:
    if n['id'] not in seen: seen.add(n['id']); uniq.append(n)
json.dump({'nodes': uniq, 'edges': edges}, open(os.path.join(OUT, 'graph.json'), 'w', encoding='utf-8'), ensure_ascii=False)
idx = {n['id'][4:]: {'name': n['name'], 'aliases': n['aliases'], 'triggers': [], 'actions': []} for n in uniq if n['type'] == 'app'}
for n in uniq:
    if n['type'] in ('trigger', 'action'): idx[n['app']][n['type'] + 's'].append(n['name'])
ip = os.path.join(OUT, 'index.json')
json.dump(idx, open(ip, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
t = collections.Counter(n['type'] for n in uniq)
src_n = collections.Counter(n['source'] for n in uniq if n['type'] == 'app')
no_trig = sorted(k for k, v in idx.items() if not v['triggers'])
with_ai = sum(1 for n in uniq if n['type'] in ('action', 'trigger') and len(n['text']) > 60)
md = [f"# Graph-lite stats", f"- nodes: {len(uniq)} ({dict(t)})", f"- edges: {len(edges)}",
      f"- triggers/actions with rich text (>60 chars): {with_ai}",
      f"- apps by extractor: {dict(src_n)} (npm = published package metadata, regex = source fallback)",
      f"- apps with 0 triggers: {len(no_trig)}", f"- index.json: {os.path.getsize(ip)} bytes"]
open(os.path.join(OUT, 'STATS.md'), 'w', encoding='utf-8').write('\n'.join(md) + '\n')
print('\n'.join(md))
