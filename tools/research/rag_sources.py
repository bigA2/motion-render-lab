# Collects primary sources on GraphRAG vs vector RAG vs Self-RAG for FansaChat's builder. No AI, no secrets.
# Output: out/rag_sources.md (READMEs + paper abstracts + repo stats) for a morning read.
import json, re, urllib.request

UA = {'User-Agent': 'FansaChat-research/1.0'}
REPOS = ['microsoft/graphrag', 'HKUDS/LightRAG', 'gusye1234/nano-graphrag', 'OSU-NLP-Group/HippoRAG',
         'AkariAsai/self-rag', 'explodinggradients/ragas', 'infiniflow/ragflow', 'circlemind-ai/fast-graphrag']
PAPERS = {'GraphRAG (From Local to Global)': '2404.16130', 'LightRAG': '2410.05779', 'HippoRAG': '2405.14831',
          'Self-RAG': '2310.11511', 'Corrective RAG (CRAG)': '2401.15884', 'RAGAS': '2309.15217'}

def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read().decode('utf-8', 'ignore')

out = ['# RAG research sources (collected on GitHub, no AI)\n']
for r in REPOS:
    try:
        meta = json.loads(get(f'https://api.github.com/repos/{r}'))
        readme = ''
        for b in ('main', 'master'):
            try: readme = get(f'https://raw.githubusercontent.com/{r}/{b}/README.md'); break
            except Exception: pass
        out.append(f"\n## {r}\nstars {meta.get('stargazers_count')} · licence {(meta.get('license') or {}).get('spdx_id')} · "
                   f"updated {meta.get('pushed_at','')[:10]}\n{meta.get('description') or ''}\n\n" + readme[:6000])
    except Exception as e:
        out.append(f'\n## {r}\n(fetch failed: {e})')
for name, aid in PAPERS.items():
    try:
        x = get(f'https://export.arxiv.org/api/query?id_list={aid}')
        ab = re.search(r'<summary>(.*?)</summary>', x, re.S)
        out.append(f'\n## Paper: {name} (arXiv {aid})\n' + (ab.group(1).strip() if ab else '(no abstract)'))
    except Exception as e:
        out.append(f'\n## Paper: {name}\n(fetch failed: {e})')
import os; os.makedirs('out', exist_ok=True)
open('out/rag_sources.md', 'w', encoding='utf-8').write('\n'.join(out))
print('saved', len(out), 'sections')
