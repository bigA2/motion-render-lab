# Graph-lite builder (no AI, no tokens): reads the Activepieces community pieces SOURCE (MIT) and writes
# a typed graph  app -> trigger / action  (+ app -> category). Each node keeps the human + aiMetadata text,
# so retrieval is plain keyword scoring over nodes + 1-hop expansion, never LLM indexing.
# Run (GitHub Actions): python graph/build_graph.py <path-to activepieces/packages/pieces/community>
import json, os, re, sys, collections

ROOT = sys.argv[1]
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
    nodes.append({'id': app, 'type': 'app', 'name': first(DISP, head) or piece, 'text': first(DESC, head)})
    for c in sorted(set(CAT.findall(head))):
        if f'cat:{c}' not in {n['id'] for n in nodes if n['type'] == 'category'}:
            nodes.append({'id': f'cat:{c}', 'type': 'category', 'name': c.replace('_', ' ').title(), 'text': ''})
        edges.append([app, 'in_category', f'cat:{c}'])
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
t = collections.Counter(n['type'] for n in uniq)
with_ai = sum(1 for n in uniq if n['type'] in ('action', 'trigger') and len(n['text']) > 60)
md = [f"# Graph-lite stats", f"- nodes: {len(uniq)} ({dict(t)})", f"- edges: {len(edges)}",
      f"- triggers/actions with rich text (>60 chars): {with_ai}"]
open(os.path.join(OUT, 'STATS.md'), 'w', encoding='utf-8').write('\n'.join(md) + '\n')
print('\n'.join(md))
