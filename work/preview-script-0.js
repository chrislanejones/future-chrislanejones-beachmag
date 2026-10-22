(()=>{
 const root=document.getElementById('beach-offline');
 const audio=root.querySelector('.real-audio'),play=root.querySelector('.real-play'),status=root.querySelector('.real-status');
 const stations=[['lowtide','Lowtide','Liquid DnB',172],['basement','Basement','House',122],['southside','Southside','Garage',132],['study','Study','Chillhop',76]];
 let station=0,sourceLabel='',objectUrl=null,quote=0,photo=0;
 const chassis=root.querySelector('.mono-radio'),seek=root.querySelector('.radio-seek'),presets=[...root.querySelectorAll('.station')];
 // Chrome feeds Web Audio silence from file:// media, so the EQ and meter need the page served over http.
 const canRoute=location.protocol!=='file:';
 let context,analyser,samples,meterFrame,filters={};
 function graph(){if(context||!canRoute)return;const AudioEngine=window.AudioContext||window.webkitAudioContext;if(!AudioEngine)return;context=new AudioEngine();analyser=context.createAnalyser();analyser.fftSize=256;samples=new Uint8Array(analyser.fftSize);filters.bass=context.createBiquadFilter();filters.bass.type='lowshelf';filters.bass.frequency.value=250;filters.treble=context.createBiquadFilter();filters.treble.type='highshelf';filters.treble.frequency.value=3500;for(const key in filters)filters[key].gain.value=tones[key].get();context.createMediaElementSource(audio).connect(filters.bass);filters.bass.connect(filters.treble);filters.treble.connect(analyser);analyser.connect(context.destination)}
 function meter(){cancelAnimationFrame(meterFrame);if(audio.paused){chassis.style.setProperty('--vu','-40deg');return}if(analyser){analyser.getByteTimeDomainData(samples);let sum=0;for(const sample of samples)sum+=((sample-128)/128)**2;chassis.style.setProperty('--vu',(-40+Math.min(1,Math.sqrt(sum/samples.length)*5)*80)+'deg')}meterFrame=requestAnimationFrame(meter)}
 function playback(){play.querySelector('span').textContent=audio.paused?'▶':'Ⅱ';play.querySelector('small').textContent=audio.paused?'PLAY':'PAUSE';play.setAttribute('aria-label',audio.paused?'Play radio':'Pause radio');play.setAttribute('aria-pressed',String(!audio.paused));chassis.classList.toggle('is-playing',!audio.paused);status.textContent=sourceLabel+' · '+(audio.paused?'Paused':'Playing');meter()}
 async function start(){try{graph();if(context)await context.resume();await audio.play()}catch{status.textContent='Playback could not start. Press PLAY again, or LOAD your own audio file.'}}
 play.addEventListener('click',()=>{if(audio.paused)start();else audio.pause()});
 function tune(index,keepPlaying=!audio.paused){station=(index+stations.length)%stations.length;const [id,name,style,bpm]=stations[station];if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}audio.src='audio/'+id+'.mp3';sourceLabel=name+' · '+style+' · '+bpm+' bpm';presets.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===station)));chassis.classList.remove('off-dial');chassis.style.setProperty('--needle',((station+.5)/stations.length*100)+'%');if(keepPlaying)start();else playback()}
 presets.forEach((button,i)=>button.addEventListener('click',()=>tune(i)));
 audio.addEventListener('play',playback);audio.addEventListener('pause',playback);
 // The radio keeps going: when a station's track ends, the dial moves on to the next one.
 audio.addEventListener('ended',()=>{if(objectUrl)playback();else tune(station+1,true)});
 audio.addEventListener('error',()=>status.textContent='Audio could not load. Press LOAD to choose a local audio file.');
 root.querySelector('.real-stop').addEventListener('click',()=>{audio.pause();audio.currentTime=0;playback()});
 function dial(knob,{min,max,value,step,big,text,change}){
  let current=value,drag=null;
  function set(next){current=Math.max(min,Math.min(max,next));knob.style.setProperty('--knob',(-135+(current-min)/(max-min)*270)+'deg');knob.setAttribute('aria-valuenow',String(Math.round(current)));knob.setAttribute('aria-valuetext',text(current));change(current)}
  function angle(e){const box=knob.getBoundingClientRect();return Math.atan2(e.clientX-box.left-box.width/2,box.top+box.height/2-e.clientY)*180/Math.PI}
  knob.addEventListener('pointerdown',e=>{if(e.button!==0||knob.getAttribute('aria-disabled')==='true')return;e.preventDefault();knob.focus({preventScroll:true});knob.setPointerCapture(e.pointerId);drag={id:e.pointerId,angle:angle(e)}});
  knob.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const next=angle(e);let delta=next-drag.angle;if(delta>180)delta-=360;if(delta< -180)delta+=360;set(current+delta/270*(max-min));drag.angle=next});
  function end(e){if(drag&&drag.id===e.pointerId){drag=null;if(knob.hasPointerCapture(e.pointerId))knob.releasePointerCapture(e.pointerId)}}
  knob.addEventListener('pointerup',end);knob.addEventListener('pointercancel',end);knob.addEventListener('lostpointercapture',()=>drag=null);
  knob.addEventListener('keydown',e=>{if(knob.getAttribute('aria-disabled')==='true')return;const steps={ArrowUp:step,ArrowRight:step,ArrowDown:-step,ArrowLeft:-step,PageUp:big,PageDown:-big};if(e.key in steps){e.preventDefault();set(current+steps[e.key])}else if(e.key==='Home'||e.key==='End'){e.preventDefault();set(e.key==='End'?max:min)}});
  set(value);return {set,get:()=>current};
 }
 const volumeReadout=root.querySelector('.volume-readout');
 dial(root.querySelector('.volume-knob'),{min:0,max:100,value:35,step:5,big:10,text:v=>Math.round(v)+' percent',change:v=>{audio.volume=v/100;volumeReadout.textContent=String(Math.round(v))}});
 const decibels=v=>{const n=Math.round(v);return (n>0?'+':n<0?'−':'')+Math.abs(n)};
 const tones={};
 for(const knob of root.querySelectorAll('.tone-knob')){
  const key=knob.dataset.tone,readout=knob.closest('.tone-assembly').querySelector('.tone-readout');
  tones[key]=dial(knob,{min:-12,max:12,value:0,step:1,big:3,text:v=>decibels(v).replace('−','minus ')+' decibels',change:v=>{readout.textContent=decibels(v);if(filters[key])filters[key].gain.setTargetAtTime(v,context.currentTime,.03)}});
  knob.addEventListener('dblclick',()=>tones[key].set(0));
  if(!canRoute){knob.setAttribute('aria-disabled','true');knob.closest('.tone-assembly').classList.add('is-off');knob.title='Treble and bass need the page served over http, not opened as a file.'}
 }
 function position(){const time=audio.currentTime||0;seek.disabled=!Number.isFinite(audio.duration);seek.value=Number.isFinite(audio.duration)&&audio.duration>0?time/audio.duration*100:0;root.querySelector('.tape-counter').textContent=String(Math.floor(time/60)).padStart(2,'0')+':'+String(Math.floor(time%60)).padStart(2,'0')}
 audio.addEventListener('timeupdate',position);audio.addEventListener('loadedmetadata',position);audio.addEventListener('emptied',position);
 seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(seek.value)/100*audio.duration});
 function skip(seconds){if(Number.isFinite(audio.duration)){audio.currentTime=Math.max(0,Math.min(audio.duration,audio.currentTime+seconds));position()}}
 root.querySelector('.real-rewind').addEventListener('click',()=>skip(-5));
 root.querySelector('.real-forward').addEventListener('click',()=>skip(5));
 root.querySelector('.real-load').addEventListener('click',()=>root.querySelector('.radio-file').click());
 tune(0,false);position();
 root.querySelector('.radio-file').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;audio.pause();if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(file);audio.src=objectUrl;sourceLabel=file.name;presets.forEach(button=>button.setAttribute('aria-pressed','false'));chassis.classList.add('off-dial');playback()});
 const sticker=root.querySelector('.skill-sticker'),stickerHint=sticker.querySelector('.sticker-hint');let hintTimer;
 sticker.addEventListener('click',async()=>{const text=sticker.querySelector('code').textContent;let copied=false;try{await navigator.clipboard.writeText(text);copied=true}catch{const field=document.createElement('textarea');field.value=text;field.setAttribute('readonly','');field.style.cssText='position:fixed;opacity:0';document.body.append(field);field.select();try{copied=document.execCommand('copy')}catch{}field.remove()}stickerHint.textContent=copied?'Copied. Paste it in a terminal.':'Select the line above to copy it.';clearTimeout(hintTimer);hintTimer=setTimeout(()=>stickerHint.textContent='Click to copy',2600)});
 const quotes=['“I went outside for inspiration. Came back with another side project.”','“A quick experiment is how most of my weekends begin.”','“The ocean has excellent offline support.”'];
 const ramblePhotos=['about-day.webp',null,'contact-night.webp'];
 function renderRamble(){const paper=root.querySelector('.ramble'),figure=paper.querySelector('.ramble-photo'),file=ramblePhotos[quote];paper.querySelector('blockquote').textContent=quotes[quote];figure.hidden=!file;paper.classList.toggle('text-only',!file);if(file){figure.querySelector('img').src='https://cdn.jsdelivr.net/gh/chrislanejones/future-chrislanejones-beach@08f57809e4f1f954f2aff5689b95497002f579d3/public/banners/'+file;figure.querySelector('img').alt=quote===2?'Nighttime 3D beach scene standing in for a rambling photo':'3D beach scene standing in for a rambling photo'}paper.classList.remove('flip');void paper.offsetWidth;paper.classList.add('flip')}
 root.querySelector('[data-next-quote]').addEventListener('click',()=>{quote=(quote+1)%quotes.length;renderRamble()});
 const scenes=[['about-day.webp','The pier, from above.'],['blog-day.webp','A little farther offshore.'],['contact-night.webp','After the beach goes quiet.']];
 const album=root.querySelector('.album'),opener=root.querySelector('.photo-stack'),frame=root.querySelector('.album-photo');
 function renderPhoto(animate=false){frame.querySelector('img').src='https://cdn.jsdelivr.net/gh/chrislanejones/future-chrislanejones-beach@08f57809e4f1f954f2aff5689b95497002f579d3/public/banners/'+scenes[photo][0];frame.querySelector('img').alt=scenes[photo][1];frame.querySelector('figcaption').textContent=scenes[photo][1];root.querySelector('.photo-count').textContent=(photo+1)+' / 3';if(animate){frame.classList.remove('changing');void frame.offsetWidth;frame.classList.add('changing')}}
 function setAlbum(open){album.hidden=!open;opener.setAttribute('aria-expanded',String(open));album.classList.toggle('opening',open);if(open)root.querySelector('[data-close-album]').focus({preventScroll:true});else opener.focus({preventScroll:true})}
 opener.addEventListener('click',()=>setAlbum(album.hidden));root.querySelector('[data-close-album]').addEventListener('click',()=>setAlbum(false));
 root.querySelector('[data-photo-prev]').addEventListener('click',()=>{photo=(photo+2)%3;renderPhoto(true)});root.querySelector('[data-photo-next]').addEventListener('click',()=>{photo=(photo+1)%3;renderPhoto(true)});
 album.addEventListener('keydown',e=>{if(e.key==='Escape')setAlbum(false)});renderPhoto();
 window.addEventListener('pagehide',()=>{audio.pause();if(objectUrl)URL.revokeObjectURL(objectUrl)});
})();
