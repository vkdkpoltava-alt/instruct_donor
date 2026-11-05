(() => {
 const scene=document.querySelector('#arrival-scene');
 const map=document.querySelector('#arrival-map');
 const actors=[document.querySelector('#arrival-kraplyk'),document.querySelector('#arrival-kraplynka')];
 const start=document.querySelector('#walk-to-registration');
 const skip=document.querySelector('#skip-arrival');
 const overview=document.querySelector('#show-full-map');
 const status=document.querySelector('#arrival-status');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const full=[0,0,1536,1024],close=[320,645,330,220];
 // Enter through entrance 1, follow the corridor, and use the north reception doorway.
 const path=[[575,898],[575,850],[575,650],[485,650],[485,685],[465,720],[465,816]];
 let camera=[...full],feet=[path[0],[635,898]],trail=[[635,898],path[0]],fast=false,walking=false,zoomed=false;
 const length=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 function render(){
  map.setAttribute('viewBox',camera.join(' '));
  document.querySelector('#arrival-route').style.opacity=camera[2]<700?'0':'.7';
  actors.forEach((actor,i)=>{actor.style.left=((feet[i][0]-camera[0])/camera[2]*100)+'%';actor.style.top=((feet[i][1]-camera[1])/camera[3]*100)+'%';actor.style.width=(46/camera[2]*100)+'%';});
 }
 function follower(){let gap=56;for(let i=trail.length-1;i>0;i--){const a=trail[i],b=trail[i-1],d=length(a,b);if(d>=gap){const t=gap/d;return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}gap-=d;}return trail[0];}
 function tween(duration,draw){return new Promise(resolve=>{let began;function frame(now){began??=now;const t=(fast||reduced)?1:Math.min(1,(now-began)/duration);draw(t);if(t<1)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame);});}
 async function cameraTo(target){const from=[...camera];await tween(1150,t=>{const eased=t*t*(3-2*t);camera=from.map((n,i)=>n+(target[i]-n)*eased);render();});}
 async function arrive(){
  if(walking||zoomed)return;
  walking=true;start.disabled=true;skip.hidden=false;status.textContent='Ідемо через вхід 1 коридором до реєстратури…';
  scene.closest('.arrival-panel').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
  actors.forEach(actor=>actor.classList.add('actor-walking'));
  for(let i=1;i<path.length;i++){
   const a=path[i-1],b=path[i];
   await tween(length(a,b)*12,t=>{feet[0]=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];trail.push(feet[0]);feet[1]=follower();document.querySelector('#arrival-route').setAttribute('points',trail.slice(1).filter((_,index)=>index%3===0).map(p=>p.join(',')).join(' '));render();});
  }
  actors.forEach(actor=>{actor.classList.remove('actor-walking');actor.classList.add('facing-staff');});
  document.querySelector('#donor-pose').src='assets/kraplyk-dokument.png';
  document.querySelector('#donor-pose').alt='Червоний Краплик Резусович повернувся до реєстратора';
  document.querySelector('#friend-pose').src='assets/kraplynka-dokument.png';
  document.querySelector('#friend-pose').alt='Червона Краплинка Плазмівна повернулася до реєстратора';
  status.textContent='Ми в реєстратурі. Повертаємося до реєстраторів і наближаємо сцену…';
  await tween(500,()=>{});
  await cameraTo(close);
  walking=false;zoomed=true;skip.hidden=true;start.hidden=true;overview.hidden=false;
  overview.textContent='Показати велику карту ↗';
  status.textContent='Реєстратура · герої повернулися до працівників. Продовж розмову нижче.';
  document.querySelector('#registration-content').hidden=false;
  document.querySelector('#donor-progress').hidden=false;

 }
 start.addEventListener('click',arrive);
 skip.addEventListener('click',()=>{fast=true;});
 overview.addEventListener('click',async()=>{if(walking)return;walking=true;overview.disabled=true;fast=false;zoomed=!zoomed;await cameraTo(zoomed?close:full);overview.textContent=zoomed?'Показати велику карту ↗':'Збільшити реєстратуру ↙';walking=false;overview.disabled=false;});
 render();
})();




