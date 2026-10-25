# Competitor public pages (pricing / AI features / template galleries) -> markdown via Crawl4AI (JS-rendered, no LLM).
import asyncio, json, os, sys
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
OUT = sys.argv[1]; os.makedirs(f'{OUT}/pages', exist_ok=True)
URLS = [l.strip() for l in open(os.path.join(os.path.dirname(__file__), 'urls.txt')) if l.strip() and not l.startswith('#')]
async def main():
    cfg = CrawlerRunConfig(cache_mode=CacheMode.BYPASS, page_timeout=60000, wait_until='domcontentloaded', delay_before_return_html=3.0)
    async with AsyncWebCrawler(config=BrowserConfig(headless=True)) as c:
        idx = []
        for u in URLS:
            try:
                r = await c.arun(u, config=cfg)
                md = (r.markdown.raw_markdown if hasattr(r.markdown, 'raw_markdown') else str(r.markdown or '')) if r.success else ''
            except Exception as e: md = ''; print('ERR', u, e)
            fn = u.split('//')[1].replace('/', '_').strip('_')[:120] + '.md'
            open(f'{OUT}/pages/{fn}', 'w', encoding='utf-8').write(md); idx.append({'url': u, 'file': fn, 'chars': len(md)}); print(len(md), u, flush=True)
        json.dump(idx, open(f'{OUT}/pages/index.json', 'w'), indent=1)
asyncio.run(main())
