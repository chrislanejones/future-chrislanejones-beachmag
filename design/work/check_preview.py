from pathlib import Path
from html.parser import HTMLParser
import re
class Inspect(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids=[]
        self.classes=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        self.classes.extend(attrs.get('class','').split())
html=Path('outputs/coastal-homepage.html').read_text(encoding='utf-8')
parsed=Inspect()
parsed.feed(html)
assert len(parsed.ids)==len(set(parsed.ids)), 'Duplicate IDs'
for key in ['site-nav','site-takeover','page-content','sandbox','sandbox-root']:
    assert parsed.ids.count(key)==1,key
assert parsed.classes.count('vu-meter')==1
assert parsed.classes.count('volume-knob')==1
assert parsed.classes.count('tone-knob')==2
assert parsed.classes.count('station')==4
assert re.search(r'<p class="sr-only" id="knob-help">[^<]+</p>',html), 'Knob instructions for screen readers are missing'
assert html.count('aria-describedby="knob-help"')==3, 'All three knobs should point at the screen-reader instructions'
assert 'data:audio' not in html, 'Audio should load from outputs/audio, not be inlined'
for track in ['lowtide','basement','southside','study']:
    assert Path('outputs','audio',track+'.mp3').stat().st_size>100_000, track
assert parsed.classes.count('upper-deck')==0
assert html.index('class="vu-meter"')<html.index('class="hardware-tuner"')
assert html.count('class="project-cutout"')==2 and html.index('id="featured-projects"')<html.index('id="beach-offline"'), 'Projects section should sit above the radio with two projects'
for name in ['sandbox.js','sandbox.css']:
    assert Path('outputs',name).stat().st_size>1000
scripts=re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>',html,re.S)
for i,script in enumerate(scripts):
    if script.strip(): Path(f'work/preview-script-{i}.js').write_text(script,encoding='utf-8')
print('Preview structure verified: unique IDs, compact radio order, 4 stations, tone knobs, menu, and game assets.')
