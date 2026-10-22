from pathlib import Path
from html import escape as e
from urllib.parse import urlparse
import json

navpath=Path('work/site-nav.html')
nav=navpath.read_text(encoding='utf-8')
for anchor in ['coastal-art','beach-offline','sandbox']:
    nav=nav.replace('href="#'+anchor+'"','href="coastal-homepage.html#'+anchor+'"')
if 'coastal-browser-tabs.html' not in nav:
    nav=nav.replace('<a href="coastal-homepage.html#beach-offline">Journal</a>', '<a href="coastal-browser-tabs.html">Browser Tabs</a><a href="coastal-homepage.html#beach-offline">Journal</a>')
    nav=nav.replace('<a style="--order:5"', '<a style="--order:5" href="coastal-browser-tabs.html">Browser Tabs <span>↗</span></a><a style="--order:6"')
nav=nav.replace('.desktop-links{display:flex;gap:20px}', '.desktop-links{display:flex;gap:12px}')
navpath.write_text(nav,encoding='utf-8')
data=json.loads(Path('work/browser-tabs-data.json').read_text(encoding='utf-8'))
buttons=['<button type="button" data-category="all" aria-pressed="true">All the tabs <span>53</span></button>']
options=['<option value="all">All the tabs · 53</option>']
sections=[]
for index,group in enumerate(data,1):
    key=f'category-{index}'
    category=e(group['category'])
    count=len(group['links'])
    buttons.append(f'<button type="button" data-category="{key}" aria-pressed="false">{category}<span>{count:02}</span></button>')
    options.append(f'<option value="{key}">{category} · {count}</option>')
    links=[]
    for title,url in group['links']:
        host=urlparse(url).netloc.removeprefix('www.')
        terms=e((title+' '+host+' '+group['category']).lower(),quote=True)
        mark=e(title[0])
        if group['category']=='AI & coding agents' and title in ('AIBestSkill','Augment Code'):
            mark+=f'<img class="resource-favicon" src="https://www.google.com/s2/favicons?domain={e(host)}&amp;sz=64" alt="" width="24" height="24" loading="lazy" onerror="this.hidden=true">'
        links.append(f'<li data-search="{terms}"><a class="resource-link" href="{e(url,quote=True)}" target="_blank" rel="noopener noreferrer"><span class="site-mark" aria-hidden="true">{mark}</span><span class="link-copy"><strong>{e(title)}</strong><small>{e(host)}</small></span><span class="link-arrow" aria-hidden="true">↗</span><span class="sr-only"> (opens in a new tab)</span></a></li>')
    sections.append(f'<section class="resource-group" id="{key}" aria-labelledby="heading-{index}"><div class="group-heading"><span class="group-number">{index:02}</span><h2 id="heading-{index}">{category}</h2><span class="group-count">{count} links</span></div><ul>{"".join(links)}</ul></section>')
base='https://cdn.jsdelivr.net/gh/chrislanejones/future-chrislanejones-beach@08f57809e4f1f954f2aff5689b95497002f579d3/public/banners/browser-tabs-'
page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Chrome tabs I left open · Chris Lane Jones</title><style>{Path('work/browser-tabs.css').read_text(encoding='utf-8')}
body{{margin:0;background:#172f32}}body>main{{max-width:1240px;margin:auto}}:focus-visible{{outline:3px solid #d47a40;outline-offset:4px}}.sr-only{{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}}
</style></head><body><main>{nav}<div id="page-content"><article id="browser-tabs">
<div class="edition-strip"><span>FIELD NOTES / THE INTERNET EDITION</span><div role="group" aria-label="Color scheme"><button type="button" data-edition="light" aria-pressed="true">Sunlit paper ☀</button><button type="button" data-edition="dark" aria-pressed="false">After dark ☾</button></div></div>
<header class="tabs-hero"><div><p class="eyebrow">53 LINKS. ELEVEN RABBIT HOLES.</p><h1>Chrome tabs<br><em>I left open.</em></h1><p class="intro">Tools, oddities & good ideas worth keeping around. A little collection from a very curious browser.</p></div><figure class="tabs-photo"><img id="tabs-banner" src="{base}day.webp" data-day="{base}day.webp" data-night="{base}night.webp" alt="A miniature 3D coastal world from the Browser Tabs collection"><figcaption>Washed up on the internet. ↙</figcaption></figure></header>
<div class="collection-bar"><p><strong id="result-count" role="status" aria-live="polite">53 of 53 links</strong><br>Collected, not closed.</p><label class="search-wrap" for="tab-search">FIND SOMETHING<input id="tab-search" type="search" placeholder="Search links or categories…" autocomplete="off" aria-controls="resource-results"></label></div>
<div class="archive-layout"><aside class="category-index" aria-label="Filter by category"><p>THE CONTENTS ↓</p>{''.join(buttons)}</aside><div><label class="mobile-category">EXPLORE A CATEGORY<select aria-controls="resource-results">{''.join(options)}</select></label><div id="resource-results">{''.join(sections)}<div class="no-results" hidden><h2>Nothing washed ashore.</h2><p>Try another search or clear the category filter.</p><button type="button" id="clear-filters">Show all the tabs ↗</button></div></div></div></div>
<footer class="tabs-footer"><p>Links from <a href="https://www.chrislanejones.com/browser-tabs">my current collection</a>.<br>All links open in a new tab. Naturally.</p><a href="coastal-homepage.html#coastal-art"><em>Back to the beach. ↗</em></a></footer>
</article></div><script>{Path('work/site-nav.js').read_text(encoding='utf-8')}</script><script>{Path('work/browser-tabs.js').read_text(encoding='utf-8')}</script></main></body></html>'''
Path('outputs/coastal-browser-tabs.html').write_text(page,encoding='utf-8')
print('Created Browser Tabs preview: '+str(sum(len(g['links']) for g in data))+' links.')
