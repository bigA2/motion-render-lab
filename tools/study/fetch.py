# Finds and downloads public videos into a temp folder (never committed, never uploaded). MIT, our own code.
# Usage: python fetch.py <sources.txt> <outdir> <max_per_source>
# A source line is a yt-dlp target (URL / ytsearchN:query) or "page:<url>" to scrape <video>/mp4/webm links.
import os, re, subprocess, sys, urllib.parse, urllib.request
src, outdir, mx = sys.argv[1], sys.argv[2], int(sys.argv[3])
os.makedirs(outdir, exist_ok=True)
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'
log = open(os.path.join(outdir, '_fetch.log'), 'w')
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': UA}), timeout=30).read()
for n, line in enumerate(l.strip() for l in open(src)):
    if not line or line.startswith('#'): continue
    tag = re.sub(r'[^a-z0-9]+', '_', line.lower())[:50]
    if line.startswith('page:'):
        page = line[5:]
        try:
            html = get(page).decode('utf8', 'ignore')
        except Exception as e:
            print('FAIL page', page, e, file=log); continue
        urls = re.findall(r'''(?:src|href|data-src|content)=["']([^"']+\.(?:mp4|webm)(?:\?[^"']*)?)["']''', html)
        urls += re.findall(r'''https?://[^"'\s>]+\.(?:mp4|webm)(?:\?[^"'\s>]*)?''', html)
        seen = []
        for u in urls:
            u = urllib.parse.urljoin(page, u.replace('\\u002F', '/').replace('&amp;', '&'))
            if u not in seen: seen.append(u)
        got = 0
        for k, u in enumerate(seen):
            if got >= mx: break
            fn = os.path.join(outdir, f'{n:02d}_{tag}_{k}.' + ('webm' if '.webm' in u else 'mp4'))
            try:
                data = get(u)
                if len(data) < 300_000: continue          # skip tiny icons / loops under ~0.3 MB
                open(fn, 'wb').write(data); got += 1; print('OK', page, u, len(data), file=log)
            except Exception as e:
                print('FAIL', u, e, file=log)
        print('page', page, 'found', len(seen), 'kept', got, file=log)
    else:
        r = subprocess.run(['yt-dlp', '-q', '--no-warnings', '--playlist-end', str(mx), '--max-filesize', '400M',
                            '--match-filter', 'duration > 8 & duration < 400', '-f', 'bv*[height<=1080]+ba/b[height<=1080]/b',
                            '--merge-output-format', 'mp4', '-o', os.path.join(outdir, f'{n:02d}_{tag}_%(autonumber)s.%(ext)s'), line],
                           capture_output=True, text=True, timeout=1200)
        print('ytdlp', line, 'rc', r.returncode, r.stderr[-300:].replace('\n', ' '), file=log)
log.close(); print(open(os.path.join(outdir, '_fetch.log')).read())
