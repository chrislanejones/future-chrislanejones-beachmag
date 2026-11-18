"""Draws vice-logo.svg: a vector redraw of the sunset-palm logo (sun, stripes, palm, waves)."""
import math

def qpt(p0, p1, p2, t):
    x = (1-t)**2*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0]
    y = (1-t)**2*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1]
    dx = 2*(1-t)*(p1[0]-p0[0]) + 2*t*(p2[0]-p1[0])
    dy = 2*(1-t)*(p1[1]-p0[1]) + 2*t*(p2[1]-p1[1])
    n = math.hypot(dx, dy) or 1
    return x, y, dx/n, dy/n

def frond(p0, p1, p2, width, side, teeth=7, lift=10):
    """A leaf: smooth outer edge along the rib, saw-toothed inner edge.
    side=+1 puts the teeth to the right of the direction of travel."""
    outer, inner = [], []
    steps = 28
    for i in range(steps+1):
        t = i/steps
        x, y, tx, ty = qpt(p0, p1, p2, t)
        nx, ny = -ty*side, tx*side          # normal toward the toothed side
        bulge = math.sin(math.pi*min(1, t*1.08))**.7
        outer.append((x - nx*lift*bulge, y - ny*lift*bulge))
    n = teeth*2
    for i in range(n+1):
        t = .1 + .9*i/n
        x, y, tx, ty = qpt(p0, p1, p2, t)
        nx, ny = -ty*side, tx*side
        w = width*math.sin(math.pi*(.12+.88*t)**.8)**.8
        if i % 2 == 0:   # tooth tip, swept toward the frond tip
            inner.append((x + nx*w + tx*w*.55, y + ny*w + ty*w*.55))
        else:            # notch
            inner.append((x + nx*w*.42, y + ny*w*.42))
    d = 'M%.1f %.1f ' % outer[0] + ' '.join('L%.1f %.1f' % p for p in outer[1:])
    d += ' ' + ' '.join('L%.1f %.1f' % p for p in reversed(inner)) + 'Z'
    return d

C = (700, 478)  # crown
FRONDS = [  # p0, control, tip, width, tooth side, rim colour, rim offset
    ((694, 470), (650, 250), (908, 228), 84, +1, 'm', (-9, -5)),
    ((690, 462), (560, 250), (346, 436), 90, -1, 'm', (-4, -10)),
    ((690, 474), (470, 400), (352, 664), 98, -1, 'm', (-6, -9)),
    ((700, 500), (520, 500), (528, 792), 78, -1, 'm', (-10, -4)),
    ((716, 470), (850, 270), (1072, 470), 82, +1, 'c', (2, -11)),
    ((726, 480), (960, 420), (1000, 694), 90, +1, 'c', (8, -8)),
]
MAG, CYAN, DARK = '#ff1fd1', '#12f1f5', 'url(#palm)'

rims = ''.join('<path d="%s" fill="%s" transform="translate(%d %d)"/>' % (
    frond(p0, p1, p2, w, s), MAG if c == 'm' else CYAN, o[0], o[1])
    for p0, p1, p2, w, s, c, o in FRONDS)
leaves = ''.join('<path d="%s"/>' % frond(p0, p1, p2, w, s) for p0, p1, p2, w, s, c, o in FRONDS)

stripes = ''.join('<rect x="150" y="%d" width="920" height="%d"/>' % (y, h)
                  for y, h in [(678, 20), (757, 21), (834, 20), (905, 17)])

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="150 190 950 930" role="img" aria-label="Sunset palm logo">
<defs>
<linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ffec00"/><stop offset=".3" stop-color="#ffb21c"/><stop offset=".52" stop-color="#ff6a3c"/>
<stop offset=".64" stop-color="#ff1f6e"/><stop offset=".84" stop-color="#ff1493"/><stop offset="1" stop-color="#c800c8"/>
</linearGradient>
<linearGradient id="palm" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="#5a0a55"/><stop offset=".55" stop-color="#3b0a4f"/><stop offset="1" stop-color="#2a0a52"/>
</linearGradient>
<mask id="cut"><rect x="150" y="190" width="950" height="930" fill="#fff"/><g fill="#000">{stripes}</g></mask>
</defs>
<circle cx="610" cy="640" r="430" fill="url(#sun)" mask="url(#cut)"/>
<path d="M214 1080C300 985 440 922 620 972C760 1010 885 1006 1004 948C905 1046 760 1056 620 1016C470 974 330 1002 214 1080Z" fill="{CYAN}"/>
<path d="M296 1046C400 985 505 986 620 1014C765 1052 900 1040 1004 948C925 1062 780 1090 640 1054C505 1020 400 1024 296 1046Z" fill="#2b2a93"/>
<path d="M338 1082C440 1022 525 1022 640 1052C780 1088 905 1064 990 972C905 1092 780 1116 650 1090C530 1066 440 1052 338 1082Z" fill="{CYAN}"/>
<path d="M682 520C742 640 792 812 752 1000L790 1002C810 820 760 640 708 520Z" fill="{MAG}"/>
<path d="M694 510C752 640 800 812 776 1002C812 990 852 992 886 1000C880 800 808 610 736 500Z" fill="{DARK}"/>
<g>{rims}</g>
<g fill="{DARK}">{leaves}<circle cx="704" cy="486" r="34"/></g>
</svg>
'''
open('vice-logo.svg', 'w').write(svg)
print(len(svg))
