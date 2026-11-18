"""Builds the two Vice-edition homepage mock-ups from design/outputs/coastal-homepage.html.

  python3 build.py [path/to/simple-icons/icons]

Each mock-up is the stock homepage, plus the live site's footer and beach
figures, plus one override stylesheet (vice-neon.css or vice-deco.css) switched
on by a class on <html>. No image is converted: photos get their look from a
filter in the stylesheet, so any photo dropped in later is treated the same.
Reference only: nothing here is built or deployed.
"""
import pathlib, re, shutil, sys
from urllib.parse import quote

HERE = pathlib.Path(__file__).parent
ROOT = HERE / '../..'
SRC = (HERE / '../outputs/coastal-homepage.html').read_text()
ICONS = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else None


def gradient_map(stops, n=21):
    """feFuncR/G/B tables for a luminance -> colour ramp."""
    rows = [[], [], []]
    for i in range(n):
        t = i / (n - 1)
        for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
            if t0 <= t <= t1:
                k = (t - t0) / (t1 - t0)
                for ch in range(3):
                    rows[ch].append('%.3f' % ((c0[ch] * (1 - k) + c1[ch] * k) / 255))
                break
    return [' '.join(r) for r in rows]


# The neon photo treatment: brightness becomes an indigo -> magenta -> pink ->
# ice ramp, then a little of the photo's own colour is added back so lit
# windows stay warm and water stays blue.
R, G, B = gradient_map([(0, (14, 4, 46)), (.3, (70, 18, 140)), (.55, (214, 40, 170)), (.8, (255, 150, 200)), (1, (220, 255, 255))])
FILTERS = f'''<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<filter id="vice-neon-photo" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
<feColorMatrix in="SourceGraphic" type="saturate" values="1.7" result="own"/>
<feColorMatrix in="SourceGraphic" type="matrix" values=".3 .5 .2 0 0  .3 .5 .2 0 0  .3 .5 .2 0 0  0 0 0 1 0"/>
<feComponentTransfer><feFuncR type="gamma" amplitude="1.75" exponent=".9" offset="-.03"/><feFuncG type="gamma" amplitude="1.75" exponent=".9" offset="-.03"/><feFuncB type="gamma" amplitude="1.75" exponent=".9" offset="-.03"/></feComponentTransfer>
<feComponentTransfer result="toned"><feFuncR type="table" tableValues="{R}"/><feFuncG type="table" tableValues="{G}"/><feFuncB type="table" tableValues="{B}"/></feComponentTransfer>
<feComposite in="toned" in2="own" operator="arithmetic" k1="0" k2=".88" k3=".34" k4="0"/>
</filter></defs></svg>'''


def tower_filter(fid, body, trim, board, glow):
    """Recolours the lifeguard-stand line art in place and hangs a VI board on its
    railing. Regions are fractions of the drawing: roof and flag, then deck and rails."""
    sign = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 100"><g transform="rotate(3 110 50)">'
            f'<rect x="8" y="9" width="204" height="82" fill="{board}" stroke="{trim}" stroke-width="6"/>'
            f'<path d="M62 24h19l15 42 15-42h19L105 80H87ZM142 24h18v56h-18Z" fill="{trim}"/></g></svg>')
    blur = f'<feGaussianBlur in="art" stdDeviation="{glow}" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="art"/></feMerge>' if glow else ''
    return f'''<filter id="{fid}" primitiveUnits="objectBoundingBox" color-interpolation-filters="sRGB" x="-8%" y="-8%" width="116%" height="116%">
<feFlood flood-color="{body}" result="p0"/>
<feFlood flood-color="{trim}" x="0" y="0" width="1" height=".265" result="p1"/>
<feFlood flood-color="{trim}" x="0" y=".385" width="1" height=".185" result="p2"/>
<feMerge result="paint"><feMergeNode in="p0"/><feMergeNode in="p1"/><feMergeNode in="p2"/></feMerge>
<feComposite in="paint" in2="SourceAlpha" operator="in" result="ink"/>
<feFlood flood-color="#000" x=".4" y=".4" width=".22" height=".11" result="hole"/>
<feComposite in="ink" in2="hole" operator="out" result="cut"/>
<feImage href="data:image/svg+xml,{quote(sign)}" x=".395" y=".398" width=".23" height=".115" preserveAspectRatio="none" result="sign"/>
<feMerge result="art"><feMergeNode in="cut"/><feMergeNode in="sign"/></feMerge>{blur}
</filter>'''


FILTERS = FILTERS.replace('</defs>', tower_filter('vice-tower-neon', '#4d8dff', '#ff2d95', '#0b0220', '.012')
                          + tower_filter('vice-tower-deco', '#1f4fd6', '#ff3d9a', '#1f4fd6', '') + '</defs>')


def rules_for(css, *needles):
    """Top-level rules (and @media blocks, trimmed to matching rules) whose selector names a needle."""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out, i = [], 0

    def blocks(text):
        depth, start, pre = 0, 0, 0
        for j, ch in enumerate(text):
            if ch == '{':
                if depth == 0:
                    start = j
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    yield text[pre:start].strip(), text[start + 1:j]
                    pre = j + 1

    for prelude, body in blocks(css):
        if prelude.startswith('@media'):
            inner = [f'{p}{{{b}}}' for p, b in blocks(body) if any(n in p for n in needles)]
            if inner:
                out.append(f'{prelude}{{{"".join(inner)}}}')
        elif any(n in prelude for n in needles) and 'lifeguard' not in prelude:
            out.append(f'{prelude}{{{body}}}')
    return '\n'.join(out)


def figure(name, cls=''):
    return f'<span class="beach-figure {name} {cls}" aria-hidden="true" style="--art:url(\'../../public/art/{name}.webp\')"></span>'


WAVE = 'c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'
COLUMNS = [
    ('About', ['Home', 'About', 'Link Page', 'Browser Tabs', 'Events', 'Contact']),
    ('Work', ['Projects', 'Career & Resume', 'Blog', 'React Services', 'WordPress Services', 'Conferences']),
    ('Resources', ['History of This Site', 'Design System', 'Change Log / Site Map', 'Admin Showcase', '404 / Wipeout']),
]
# src/components/beachmag/site-footer.tsx, flattened to static markup.
FOOTER = f'''<footer id="coastal-footer" aria-label="Site footer">
<div class="footer-sendoff"><div><p class="footer-kicker">THE VICE EDITION / UNTIL NEXT TIME</p>
<h2>See you<br><em>out there.</em><svg class="footer-umbrella" viewBox="0 0 80 72" aria-hidden="true"><path d="M32 67 Q48 59 65 67Z" fill="var(--footer-accent)"/><g transform="rotate(-15 40 32)"><path d="M40 27 V64" stroke="var(--footer-ink)" stroke-width="3" stroke-linecap="round"/><path d="M40 10 V6" stroke="var(--footer-ink)" stroke-width="2" stroke-linecap="round"/><path d="M4 32 Q17 14 40 10 Q63 14 76 32Z" fill="var(--footer-accent)"/><path d="M40 10 Q30 18 26 32 H54 Q50 18 40 10Z" fill="var(--footer-ink)"/><path d="M4 32 H26 V36 L4 34Z M54 32 H76 V34 L54 36Z" fill="var(--footer-accent)"/><path d="M26 32 H54 V36 H26Z" fill="var(--footer-ink)"/></g></svg></h2></div>
<div class="footer-actions"><a class="footer-contact" href="#">LET’S MAKE SOMETHING <span aria-hidden="true">↗</span></a><a class="footer-contact" href="#">LET’S MEET <span aria-hidden="true">↗</span></a></div></div>
<div class="footer-directory"><div class="footer-bio"><a class="footer-name" href="#"><svg class="footer-wave" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 6{WAVE}"/><path d="M2 12{WAVE}"/><path d="M2 18{WAVE}"/></svg>Chris Lane Jones</a>
<p class="footer-role">Senior web engineer</p><p>I consult, design, and develop web interfaces for businesses and government agencies.</p>
<nav class="footer-social" aria-label="Social profiles">{''.join(f'<a href="#">{s} ↗</a>' for s in ['X.com', 'GitHub', 'Codeberg', 'LinkedIn', 'CodePen'])}</nav></div>
{''.join(f'<nav aria-label="Footer {t.lower()}"><h3>{i:02d} / {t}</h3>' + ''.join(f'<a href="#">{l}</a>' for l in links) + '</nav>' for i, (t, links) in enumerate(COLUMNS, 1))}
<div class="footer-figures" aria-hidden="true">{figure('surfer-guy')}</div></div>
<div class="footer-colophon"><p><span class="footer-love">Made with <svg class="footer-heart" width="13" height="13" viewBox="0 0 24 24" role="img" aria-label="love"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> from Jax, FL</span> <span aria-hidden="true">·</span> © 2026 Chris Lane Jones. All rights reserved.</p><a href="#site-nav">Back to top ↑</a></div>
</footer>'''
# The live sandbox seats the beach girl in its heading row; the static design's
# sandbox has no slot for her, so she is added once it has drawn itself.
GIRL = '''<script>(function(){var root=document.getElementById('sandbox-root');function seat(){var h=root.querySelector('.sandbox-heading');if(h&&!h.querySelector('.sand-figure'))h.insertAdjacentHTML('beforeend',%r)}new MutationObserver(seat).observe(root,{childList:true,subtree:true});seat()})()</script>''' % figure('beach-girl', 'sand-figure')


def page(variant, edition_label, night, extra=''):
    h = SRC
    h = h.replace("'Bodoni Moda'", "var(--font-bodoni-moda,'Bodoni Moda')")
    h = h.replace("'DM Sans'", "var(--font-dm-sans,'DM Sans')")
    h = re.sub(r'https://cdn\.jsdelivr\.net/gh/chrislanejones/future-chrislanejones-beach@[^/]+/public/',
               '../../public/', h)
    h = h.replace('../../public/site-icons/Waves-Logo.webp', 'vice-logo.svg')
    if night:  # the neon skin starts from the photos the After dark edition already uses
        h = h.replace('public/hero/coast-day.webp', 'public/hero/coast-night.webp')
        h = h.replace('public/banners/about-day.webp', 'public/banners/about-night.webp')

    def icon(m):
        name = m.group(1)
        if ICONS and (ICONS / name).exists():
            (HERE / 'icons').mkdir(exist_ok=True)
            shutil.copy(ICONS / name, HERE / 'icons' / name)
        return 'icons/' + name
    h = re.sub(r'https://cdn\.jsdelivr\.net/npm/simple-icons@latest/icons/([a-z0-9_.-]+\.svg)', icon, h)

    h = h.replace('href="sandbox.css"', 'href="../outputs/sandbox.css"')
    h = h.replace('src="sandbox.js"', 'src="../outputs/sandbox.js"')
    h = h.replace('src="audio/', 'src="../outputs/audio/')
    h = h.replace('<html', '<html class="vice vice-%s%s"' % (variant, ' vice-' + extra if extra else ''), 1)
    h = h.replace('THE COASTAL EDITION', 'THE VICE EDITION')
    h = h.replace('<title>Coastal homepage', '<title>Vice edition (%s)' % variant)
    # The live homepage draws the lifeguard stand from public/art (journal-hero.tsx);
    # the static design still has the older CSS stencil, so swap it for the real one.
    h, n = re.subn(r'<div class="lifeguard-drawing" aria-hidden="true">.*?<div class="station-ground"></div></div>',
                   lambda m: figure('lifeguard-stand', 'lifeguard-drawing'), h, count=1, flags=re.S)
    assert n == 1, 'lifeguard stencil not found'
    # A third edition button, already switched on.
    h = h.replace('aria-pressed="false">After dark</button></div>',
                  'aria-pressed="false">After dark</button>'
                  '<button type="button" class="vice-edition" aria-pressed="true">%s</button></div>' % edition_label)
    app = ROOT / 'src/components/beachmag'
    live = (app / 'footer.css').read_text() + rules_for((app / 'shell.css').read_text(), '#coastal-footer', '.beach-figure')
    h = h.replace('</main>', FOOTER + '</main>')
    h = h.replace('</body>', "<style>:root{--font-bodoni-moda:'Bodoni Moda';--font-dm-sans:'DM Sans'}\n%s</style>%s%s"
                             '<link rel="stylesheet" href="vice-%s.css">%s</body>'
                  % (live, FILTERS, GIRL, variant, '<link rel="stylesheet" href="vice-%s-%s.css">' % (variant, extra) if extra else ''))
    (HERE / ('vice-%s%s.html' % (variant, '-' + extra if extra else ''))).write_text(h)


page('neon', 'Vice nights ✦', night=True)
page('deco', 'Vice days ✦', night=False)
page('deco', 'Vice days ✦', night=False, extra='horizon')  # same skin, postcard-horizon hero
print('built', sorted(p.name for p in HERE.glob('*.html')), len(list((HERE / 'icons').glob('*.svg'))), 'icons')
