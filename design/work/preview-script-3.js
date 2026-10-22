(()=>{
 const menu=document.getElementById('site-takeover'),toggle=document.querySelector('.life-toggle'),content=document.getElementById('page-content'),desktop=document.querySelector('.desktop-links'),brand=document.querySelector('.nav-brand');
 let opened=false,timer;
 function setOpen(value){clearTimeout(timer);opened=value;document.body.classList.toggle('menu-open',value);document.body.classList.toggle('menu-closing',!value);menu.inert=!value;content.inert=value;desktop.inert=value;brand.inert=value;menu.setAttribute('aria-hidden',String(!value));toggle.setAttribute('aria-expanded',String(value));toggle.setAttribute('aria-label',value?'Close menu':'Open menu');toggle.focus({preventScroll:true});if(!value)timer=setTimeout(()=>document.body.classList.remove('menu-closing'),720)}
 toggle.addEventListener('click',()=>setOpen(!opened));
 document.addEventListener('keydown',e=>{if(!opened)return;if(e.key==='Escape'){e.preventDefault();setOpen(false)}if(e.key==='Tab'){const nodes=[toggle,...menu.querySelectorAll('a,button')],first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
 function edition(value){const palette=value==='dark'?'dark':'light';document.documentElement.style.colorScheme=palette;document.documentElement.classList.toggle('dark',palette==='dark');document.querySelectorAll('#coastal-art,#browser-tabs').forEach(art=>{art.style.colorScheme=palette;art.dataset.palette=palette});document.querySelectorAll('[data-edition],button[data-palette]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.edition||b.dataset.palette)===palette)));try{localStorage.setItem('coastal-edition',palette)}catch{}window.dispatchEvent(new Event('coastal-theme'))}
 document.querySelectorAll('[data-edition],button[data-palette]').forEach(b=>b.addEventListener('click',()=>edition(b.dataset.edition||b.dataset.palette)));
 let saved='light';try{saved=localStorage.getItem('coastal-edition')||'light'}catch{}edition(saved);
 matchMedia('(min-width:641px)').addEventListener('change',e=>{if(e.matches&&opened)setOpen(false)});
 if(new URLSearchParams(location.search).has('menu')&&innerWidth<=640)setOpen(true);
})();
