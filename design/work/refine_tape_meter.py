from pathlib import Path
import math
import re

path = Path('work/radio-insert.html')
html = path.read_text(encoding='utf-8')
def point(angle, radius):
    a = math.radians(angle)
    return (100 + math.sin(a)*radius, 108 - math.cos(a)*radius)
ticks = []
for angle in range(-50, 51, 5):
    major = angle % 10 == 0
    x1,y1 = point(angle,75)
    x2,y2 = point(angle,85 if major else 80)
    color = '#a93927' if angle >= 20 else '#3b392c'
    ticks.append(f'<path d="M{x1:.2f} {y1:.2f} L{x2:.2f} {y2:.2f}" stroke="{color}" stroke-width="{1.4 if major else .8}"/>')
for angle,label in [(-50,'−20'),(-30,'−10'),(-10,'−3'),(10,'0'),(30,'+1'),(50,'+3')]:
    x,y = point(angle,94)
    ticks.append(f'<text x="{x:.2f}" y="{y:.2f}" fill="{"#a93927" if angle > 10 else "#3b392c"}">{label}</text>')
meter = '<div class="vu-meter" aria-hidden="true"><svg class="vu-dial" viewBox="0 0 200 112" xmlns="http://www.w3.org/2000/svg"><path d="M42.55 59.79 A75 75 0 0 1 157.45 59.79" fill="none" stroke="#3b392c" stroke-width="1.2"/><path d="M125.65 37.52 A75 75 0 0 1 157.45 59.79" fill="none" stroke="#a93927" stroke-width="3"/><g class="meter-graduations" text-anchor="middle" dominant-baseline="middle">' + ''.join(ticks) + '</g><text class="meter-brand" x="100" y="68" text-anchor="middle">VU</text><text class="meter-subtitle" x="100" y="81" text-anchor="middle">OUTPUT LEVEL</text><g class="meter-pointer"><path d="M100 108 L99.2 33 L100.8 33 Z" fill="#a53422"/><circle cx="100" cy="108" r="7" fill="#252b22" stroke="#85866a" stroke-width="2"/></g></svg><span class="meter-glass"></span></div>'
html, count = re.subn(r'<div class="vu-meter" aria-hidden="true">.*?</div><small>VU · LEVEL</small></div>', lambda _: meter, html, count=1)
if count != 1:
    raise RuntimeError('Expected one original meter')
css = """
/* Compact cassette silhouette; all internal parts scale with the shell. */
#beach-offline .cassette-shell{width:100%;max-width:260px;aspect-ratio:100 / 63;height:auto;min-height:0;padding:0;margin:auto;overflow:hidden}
#beach-offline .cassette-shell strong{position:absolute;left:8%;right:8%;top:10%;font-size:clamp(6px,1.1vw,9px);line-height:1}
#beach-offline .cassette-window{position:absolute;left:8%;right:8%;top:35%;height:34%;margin:0;padding:3px 5px;gap:5%;border-radius:999px}
#beach-offline .tape-spool{width:auto;height:100%;aspect-ratio:1;flex:none}
#beach-offline .tape-spool:last-child{border-width:3px}
#beach-offline .physical-reel{width:52%;height:auto;aspect-ratio:1;flex:none}
#beach-offline .tape-thread{height:38%;flex:1;min-width:0}
#beach-offline .cassette-shell small{position:absolute;left:0;right:0;top:73%;font-size:clamp(5px,.8vw,7px);line-height:1}
#beach-offline .cassette-head{position:absolute;bottom:0;left:23.5%;width:53%;height:13%;margin:0}
#beach-offline .cassette-shell:before,#beach-offline .cassette-shell:after{bottom:9%}
#beach-offline .deck-caption{margin-top:9px}
/* Printed analog scale behind a slightly convex glass cover. */
#beach-offline .vu-meter{height:auto;aspect-ratio:200 / 112;min-width:0;width:100%;border:4px solid #29312a;border-top-color:#72796b;border-left-color:#555e50;border-radius:5px;background:radial-gradient(ellipse at 50% 80%,#eee1ad,#d4c18a 75%,#a89565);box-shadow:0 1px 0 #f0efd4,inset 0 3px 7px #322d2466,inset 0 0 0 1px #ece1af}
#beach-offline .vu-dial{display:block;width:100%;height:100%;overflow:hidden}
#beach-offline .meter-graduations{font:8px Arial,sans-serif;font-weight:600}
#beach-offline .meter-brand{font:bold 13px Georgia,serif;fill:#494333;letter-spacing:2px}
#beach-offline .meter-subtitle{font:5px Arial,sans-serif;fill:#62583e;letter-spacing:1.2px}
#beach-offline .meter-pointer{transform-box:view-box;transform-origin:100px 108px;transform:rotate(var(--vu,-40deg));transition:transform 110ms cubic-bezier(.2,.7,.4,1);filter:drop-shadow(1px 1px 1px #40332455)}
#beach-offline .vu-meter .meter-glass{position:absolute;inset:0;display:block;margin:0;padding:0;border:0;border-radius:2px;pointer-events:none;background:linear-gradient(152deg,#fff8,transparent 29%,#fff2 29.5%,transparent 43%,transparent 76%,#fff2);box-shadow:inset 0 0 5px #0005,inset 0 1px 0 #fff8}
@media(max-width:520px){#beach-offline .upper-deck{grid-template-columns:minmax(0,1fr) 58px;gap:4px}#beach-offline .vu-meter{border-width:3px}#beach-offline .cassette-window{padding:2px 3px;border-width:1px}#beach-offline .tape-spool:last-child{border-width:2px}#beach-offline .cassette-shell{border-width:2px}}
@media(prefers-reduced-motion:reduce){#beach-offline .meter-pointer{transition:none}}
"""
html = html.replace('</style>', css + '</style>')
path.write_text(html, encoding='utf-8')
print('Cassette aspect ratio fixed; vector VU face installed.')
