(()=>{
 const root=document.getElementById('beach-offline');
 const audio=root.querySelector('.real-audio'),play=root.querySelector('.real-play'),status=root.querySelector('.real-status');
 let sourceLabel='Original instrumental demo · 20-second loop',objectUrl=null,quote=0,photo=0;
 audio.volume=.35;
 function playback(){play.textContent=audio.paused?'Play radio ▶':'Pause radio Ⅱ';play.setAttribute('aria-pressed',String(!audio.paused));status.textContent=sourceLabel+' · '+(audio.paused?'Paused':'Playing')}
 play.addEventListener('click',async()=>{try{if(audio.paused)await audio.play();else audio.pause()}catch{status.textContent='Playback could not start. Choose an audio file below or try again.'}});
 audio.addEventListener('play',playback);audio.addEventListener('pause',playback);
 audio.addEventListener('error',()=>status.textContent='Audio could not load. Choose a local audio file below.');
 root.querySelector('.real-stop').addEventListener('click',()=>{audio.pause();audio.currentTime=0;playback()});
 root.querySelector('.radio-volume').addEventListener('input',e=>audio.volume=Number(e.target.value));
 root.querySelector('.radio-file').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;audio.pause();if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=URL.createObjectURL(file);audio.src=objectUrl;audio.loop=false;sourceLabel=file.name;playback()});
 const quotes=['“I went outside for inspiration. Came back with another side project.”','“A quick experiment is how most of my weekends begin.”','“The ocean has excellent offline support.”'];
 root.querySelector('[data-next-quote]').addEventListener('click',()=>{quote=(quote+1)%quotes.length;root.querySelector('blockquote').textContent=quotes[quote];const paper=root.querySelector('.ramble');paper.classList.remove('flip');void paper.offsetWidth;paper.classList.add('flip')});
 const scenes=[['about-day.webp','The pier, from above.'],['blog-day.webp','A little farther offshore.'],['contact-night.webp','After the beach goes quiet.']];
 const album=root.querySelector('.album'),opener=root.querySelector('.photo-stack'),frame=root.querySelector('.album-photo');
 function renderPhoto(animate=false){frame.querySelector('img').src='https://cdn.jsdelivr.net/gh/chrislanejones/future-chrislanejones-beach@08f57809e4f1f954f2aff5689b95497002f579d3/public/banners/'+scenes[photo][0];frame.querySelector('img').alt=scenes[photo][1];frame.querySelector('figcaption').textContent=scenes[photo][1];root.querySelector('.photo-count').textContent=(photo+1)+' / 3';if(animate){frame.classList.remove('changing');void frame.offsetWidth;frame.classList.add('changing')}}
 function setAlbum(open){album.hidden=!open;opener.setAttribute('aria-expanded',String(open));album.classList.toggle('opening',open);if(open)root.querySelector('[data-close-album]').focus({preventScroll:true});else opener.focus({preventScroll:true})}
 opener.addEventListener('click',()=>setAlbum(album.hidden));root.querySelector('[data-close-album]').addEventListener('click',()=>setAlbum(false));
 root.querySelector('[data-photo-prev]').addEventListener('click',()=>{photo=(photo+2)%3;renderPhoto(true)});root.querySelector('[data-photo-next]').addEventListener('click',()=>{photo=(photo+1)%3;renderPhoto(true)});
 album.addEventListener('keydown',e=>{if(e.key==='Escape')setAlbum(false)});renderPhoto();
 window.addEventListener('pagehide',()=>{audio.pause();if(objectUrl)URL.revokeObjectURL(objectUrl)});
})();


(()=>{const root=document.getElementById('tool-gallery');const names=['Tech I love','Learning & tinkering','Current AI tools'];const counts=[17,5,10];const buttons=Array.from(root.querySelectorAll('[data-group]'));const panels=Array.from(root.querySelectorAll('.icon-panel'));function select(index,animate=false){if(!Number.isInteger(index)||index<0||index>2)index=0;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));panels.forEach((p,i)=>{p.hidden=i!==index;p.classList.toggle('arrive',animate&&i===index)});root.querySelector('.selection-status').textContent=names[index]+' · '+counts[index]+' tools';}root.querySelectorAll('.icon-grid').forEach(grid=>Array.from(grid.children).forEach((item,i)=>item.style.setProperty('--i',i)));select(window.openai?.widgetState?.modelContent?.selectedGroup??0);buttons.forEach(b=>b.addEventListener('click',()=>{const index=Number(b.dataset.group);select(index,true);if(window.openai?.setWidgetState)window.openai.setWidgetState({modelContent:{selectedGroup:index,category:names[index],palette:document.getElementById('coastal-art').dataset.palette},privateContent:null}).catch(()=>{})}));window.addEventListener('openai:set_globals',event=>{const saved=event.detail?.globals?.widgetState;if(saved)select(saved.modelContent?.selectedGroup??0)});const design={iconSize:40};if(globalThis.Tweak){const tweak=new Tweak({container:root,onChange:()=>root.style.setProperty('--logo-size',design.iconSize+'px')});tweak.addSlider(design,'iconSize',{label:'Icon size',min:28,max:52,unit:'px'})}})();


(()=>{const root=document.getElementById('coastal-art');const buttons=Array.from(root.querySelectorAll('[data-palette]'));function applyPalette(value){const palette=value==='dark'?'dark':'light';root.style.colorScheme=palette;root.dataset.palette=palette;buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.palette===palette)))}applyPalette(window.openai?.widgetState?.modelContent?.palette);buttons.forEach(button=>button.addEventListener('click',()=>{applyPalette(button.dataset.palette);const group=Number(root.querySelector('[data-group][aria-pressed="true"]')?.dataset.group??0);if(window.openai?.setWidgetState)window.openai.setWidgetState({modelContent:{palette:root.dataset.palette,selectedGroup:group},privateContent:null}).catch(()=>{})}));window.addEventListener('openai:set_globals',event=>{const state=event.detail?.globals?.widgetState;if(state?.modelContent?.palette)applyPalette(state.modelContent.palette)})})();

