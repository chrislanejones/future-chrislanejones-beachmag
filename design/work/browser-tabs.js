(()=>{
 const root=document.getElementById('browser-tabs'),search=root.querySelector('input[type=search]'),select=root.querySelector('select'),buttons=[...root.querySelectorAll('[data-category]')],groups=[...root.querySelectorAll('.resource-group')];
 let category='all';
 function filter(){
  const query=search.value.trim().toLowerCase();let count=0;
  groups.forEach(group=>{let matches=0;group.querySelectorAll('li').forEach(item=>{const visible=(category==='all'||group.id===category)&&item.dataset.search.includes(query);item.hidden=!visible;if(visible)matches++});group.hidden=!matches;group.querySelector('.group-count').textContent=matches+' links';count+=matches});
  root.querySelector('#result-count').textContent=count+' of 53 links';root.querySelector('.no-results').hidden=count!==0;
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===category)));select.value=category;
 }
 buttons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;filter()}));
 select.addEventListener('change',()=>{category=select.value;filter()});search.addEventListener('input',filter);
 root.querySelector('#clear-filters').addEventListener('click',()=>{category='all';search.value='';filter();search.focus()});
 function updateImage(){const img=root.querySelector('#tabs-banner');img.src=img.dataset[document.documentElement.classList.contains('dark')?'night':'day']}
 window.addEventListener('coastal-theme',updateImage);updateImage();filter();
})();
