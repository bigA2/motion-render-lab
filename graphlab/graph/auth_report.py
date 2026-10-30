# Login research report (no AI): out/auth_index.json -> out/AUTH_RESEARCH.md
# Run: python graph/auth_report.py out/auth_index.json
import json, os, sys, collections

d = json.load(open(sys.argv[1], encoding='utf-8'))
# re-save auth/props indexes as pure ASCII JSON so any default-encoding json.load (e.g. Windows cp1252) reads them
for f in (sys.argv[1], os.path.join(os.path.dirname(sys.argv[1]), 'props_index.json')):
    if os.path.isfile(f): x = json.load(open(f, encoding='utf-8')); json.dump(x, open(f, 'w', encoding='ascii'), separators=(',', ':'))
types = collections.Counter(t for v in d.values() for t in {m['type'] for m in v['auth']})
oauth = {k: [m for m in v['auth'] if m['type'] == 'OAUTH2'] for k, v in d.items()}
oauth = {k: v for k, v in oauth.items() if v}
pkce = sum(1 for v in oauth.values() if any(m['pkce'] for m in v))
multi = sum(1 for v in d.values() if len(v['auth']) > 1)

def needs(m):  # what the user must provide for one auth method
    t = m['type']
    if t == 'none': return 'nothing'
    if t == 'OAUTH2':
        return 'sign in (OAuth2)' + (f" + {', '.join(m['props'])}" if m['props'] else '')
    if t == 'CUSTOM_AUTH':
        return ', '.join(f"{p['displayName'] or p['name']} ({p['type']}{'' if p['required'] else ', optional'})" for p in m['props']) or '-'
    if t == 'BASIC_AUTH': return f"username + password ({m['displayName']})"
    return m['displayName'] or t

cell = lambda s: str(s).replace('|', '/').replace('\n', ' ')
md = ['# Per-app login research (Activepieces pieces, published npm metadata, no AI)', '',
      f'- apps: {len(d)}; apps with more than one auth method: {multi}',
      '- apps per auth type (an app with several methods counts once per type):']
md += [f'  - {t}: {n}' for t, n in types.most_common()]
md += [f'- OAUTH2 apps using PKCE: {pkce} of {len(oauth)}', '', '## Meta family', '',
       '| app | piece@version | auth type | authUrl | scopes |', '|---|---|---|---|---|']
for k in ('instagram-business', 'facebook-pages', 'facebook-leads', 'whatsapp'):
    if k not in d: md.append(f'| {k} | not found | | | |'); continue
    for m in d[k]['auth']:
        md.append(f"| {k} | {d[k]['piece']}@{d[k]['version']} | {m['type']} | {m.get('authUrl', '')} | {cell(', '.join(m.get('scope', [])))} |")
TOP = ('slack notion gmail google-sheets google-drive google-calendar hubspot airtable trello asana calendly typeform stripe '
       'shopify mailchimp discord telegram-bot whatsapp instagram-business facebook-pages linkedin twitter zoom microsoft-teams '
       'microsoft-outlook dropbox github jira-cloud clickup monday').split()
md += ['', '## Top-30 apps', '', '| app | auth type | user must provide | notes |', '|---|---|---|---|']
for k in TOP:
    if k not in d: md.append(f'| {k} | not found | | |'); continue
    for m in d[k]['auth']:
        md.append(f"| {k} | {m['type']}{' (PKCE)' if m.get('pkce') else ''} | {cell(needs(m))} | {cell(m['description'][:160])} |")
out = os.path.join(os.path.dirname(sys.argv[1]), 'AUTH_RESEARCH.md')
open(out, 'w', encoding='utf-8').write('\n'.join(md) + '\n'); print('\n'.join(md[:12]))
