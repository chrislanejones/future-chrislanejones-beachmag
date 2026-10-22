from pathlib import Path
import re
# Base pages vendored from the Codex visualization folder so the build runs anywhere.
base=Path('work/source')
home=(base/'coastal-journal-with-tech.html').read_text(encoding='utf-8-sig')
section=(base/'beach-offline-section.html').read_text(encoding='utf-8-sig')
start=section.index('<div class="radio-scene">')
end=section.index('<div class="two">',start)
radio=Path('work/radio-insert.html').read_text(encoding='utf-8')
meter=re.search(r'<div class="meter-stack">.*?</output></div>',radio,re.S).group()
knob=re.search(r'<div class="knob-bank">.*?<span>VOLUME.*?</span></div></div>',radio,re.S).group()
radio=radio.replace('<div class="upper-deck">'+meter+knob+'</div>', '')
radio=radio.replace('<div class="hardware-tuner">','<div class="radio-instruments">'+meter+'<div class="hardware-tuner">',1)
radio=radio.replace('<div class="hardware-face">',knob+'</div><div class="hardware-face">',1)
radio=radio.replace('</style>','''#beach-offline .mono-radio{max-width:620px}
#beach-offline .radio-instruments{display:grid;grid-template-columns:100px minmax(0,1fr) auto;gap:10px;align-items:center}
#beach-offline .radio-instruments .hardware-tuner{padding:8px}
#beach-offline .radio-instruments .frequency-scale{font-size:8px;word-spacing:0;white-space:nowrap}
#beach-offline .radio-instruments .seek-label{font-size:6px;gap:5px;margin-top:4px}
#beach-offline .radio-instruments .radio-seek{height:12px}
#beach-offline .hardware-face{grid-template-columns:minmax(0,1fr) minmax(0,1.25fr);gap:12px;margin-top:10px}
#beach-offline .woofer-housing{min-height:0}
#beach-offline .cassette-door{padding:7px 8px 9px}
@media(max-width:760px){#beach-offline .radio-instruments{grid-template-columns:76px minmax(0,1fr) auto;gap:8px}#beach-offline .radio-instruments .hardware-tuner{padding:6px}#beach-offline .station{font-size:6px;letter-spacing:0}#beach-offline .station b{font-size:7px}#beach-offline .knob-bank{column-gap:3px}}
@media(max-width:520px){#beach-offline .radio-instruments{grid-template-columns:65px minmax(0,1fr);gap:5px}#beach-offline .radio-instruments .knob-bank{grid-column:1/-1;justify-content:center;gap:14px}#beach-offline .station{font-size:6px;letter-spacing:0}#beach-offline .station b{font-size:7px}#beach-offline .knob-bank .tone-knob{width:32px;height:32px}#beach-offline .radio-instruments .frequency-scale{font-size:5px}#beach-offline .radio-instruments .hardware-tuner{padding:4px}#beach-offline .radio-instruments .seek-label{font-size:0;gap:0}#beach-offline .radio-instruments .volume-knob{width:36px;height:36px;min-height:0}#beach-offline .radio-instruments .volume-assembly>span{font-size:5px}#beach-offline .hardware-face{gap:7px}#beach-offline .hardware-transport button{height:40px;min-height:40px}#beach-offline .deck-caption{font-size:5px;letter-spacing:1px}}
</style>''')
section=section[:start]+radio+section[end:]
ramble_photo='<figure class="ramble-photo"><img src="https://cdn.jsdelivr.net/gh/chrislanejones/future-chrislanejones-beach@08f57809e4f1f954f2aff5689b95497002f579d3/public/banners/about-day.webp" alt="3D beach scene standing in for a rambling photo"><figcaption>Photo rambling · Preview image</figcaption></figure>'
section=section.replace('<h3>My ramblings.</h3>', '<h3>My ramblings.</h3>'+ramble_photo, 1)
section=section.replace('<div class="two">', Path('work/journal-room.html').read_text(encoding='utf-8')+'<div class="two">', 1)
section=re.sub(r'<script>.*?</script>','<script>'+Path('work/home-radio.js').read_text(encoding='utf-8')+'</script>',section,flags=re.S)
projects=Path('work/home-projects.html').read_text(encoding='utf-8')
home=home.replace('<div class="viz-dotted-background">',projects+section+'\n<div class="viz-dotted-background">',1)
wrapper='<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Coastal homepage · Playable preview</title><link rel="stylesheet" href="sandbox.css"><style>body{margin:0;background:#172f32}body>main{max-width:1240px;margin:auto}button{cursor:pointer}:focus-visible{outline:3px solid #d47a40;outline-offset:4px}</style></head><body><main>'
nav=Path('work/site-nav.html').read_text(encoding='utf-8')
sandbox='<section id="sandbox" aria-label="Sandcastle sandbox"><div id="sandbox-root">Getting the beach ready…</div></section>'
ending='</div><script>'+Path('work/site-nav.js').read_text(encoding='utf-8')+'</script><script src="sandbox.js"></script></main></body></html>'
Path('outputs/coastal-homepage.html').write_text(wrapper+nav+'<div id="page-content">'+home+sandbox+ending,encoding='utf-8')
Path('outputs/coastal-mobile.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Coastal mobile preview</title><style>body{margin:0;background:#173e42;color:#eee5d2;font:14px Arial,sans-serif;text-align:center}p{margin:18px}iframe{display:block;width:min(390px,100vw);height:calc(100dvh - 60px);min-height:640px;margin:auto;border:0;box-shadow:0 0 0 2px #eee5d2}</style><p>Mobile edition · Tap the life preserver to open or close.</p><iframe src="coastal-homepage.html?menu=open" title="Interactive mobile homepage preview"></iframe></html>''',encoding='utf-8')
print('Homepage includes the playable radio, ramblings, postcards, blog/events and tech binder.')
