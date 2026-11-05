const branches = {
 med:{name:'Медакадемія',points:[[535,240],[520,275],[505,320],[465,350]],behind:[565,175]},
 heroes:{name:'Героїв-Чорнобильців',points:[[170,470],[220,500],[285,465],[365,390],[410,368],[465,350]],behind:[123,520]}
};
const segments = [null,[[465,350],[530,430],[650,545],[795,658],[835,675],[1000,620],[1155,575],[1230,558]],[[1230,558],[1275,540],[1280,480],[1265,450],[1255,420],[1270,401]]];
const talks = [
 {title:'Добра справа має адресу',label:'ЗУПИНКА РОЗМОВИ 1 · ЗНАЄМО АДРЕСУ',asker:'Краплинка',helper:'Краплик',question:'Дорогу знайшли! А яку адресу станції запам’ятати?',reply:'Звірмося з інструкцією. Яку адресу оберемо?',choices:['м. Полтава, вул. Шевченка, 23','Адресу можна не перевіряти — підемо навмання'],correct:0,feedback:'Краплик: Так! КП «Полтавська обласна станція переливання крові» ПОР знаходиться за адресою: м. Полтава, вул. Шевченка, 23.',hint:'Подивись на інформаційну картку станції — адреса поруч.'},
 {title:'Перевіримо перед візитом',label:'ЗУПИНКА РОЗМОВИ 2 · ПЛАНУЄМО ВІЗИТ',asker:'Краплик',helper:'Краплинка',question:'Я запам’ятав години з інструкції. Чи варто перевірити, чи немає змін?',reply:'Давай допоможемо собі спланувати візит. Як перевіримо графік?',choices:['Будемо вважати, що графік ніколи не змінюється','Уточнимо актуальний графік за телефоном реєстратури'],correct:1,feedback:'Краплинка: Саме так. Перед візитом рекомендують перевірити актуальний графік і можливі зміни за телефоном реєстратури: (095) 452-13-57.',hint:'Інструкція радить уточнювати можливі зміни перед візитом.'},
 {title:'Ми біля станції. Що далі?',label:'ЗУПИНКА РОЗМОВИ 3 · НА МІСЦІ',asker:'Краплинка',helper:'Краплик',question:'Ми прийшли вперше. Куди звернутися після прибуття?',reply:'Обери перший крок, описаний в інструкції.',choices:['Одразу шукати донорське крісло','Звернутися до реєстратури'],correct:1,feedback:'Краплик: Правильно! У реєстратурі перевірять документи, оформлять реєстраційні дані та запропонують заповнити анкету донора. Краплинка: Тепер знаємо, з чого почати!',hint:'Перший етап візиту — реєстрація. Нам допоможуть працівники станції.'}
];
const $=selector=>document.querySelector(selector);
const walkers=[$('#traveller-kraplyk'),$('#traveller-kraplynka')];
const orderedTalks=[talks[1],talks[0],talks[2]];
orderedTalks[0].label='01 · ПЕРЕВІРИМО ДО ВИБОРУ ЗУПИНКИ';
orderedTalks[1].label='02 · ЗНАЄМО АДРЕСУ';
orderedTalks[2].label='03 · НА МІСЦІ';
const routeToCrossing=[[465,350],[530,430],[650,545],[770,630]];
const routeAfterCrossing=[[770,630],...segments[1].slice(3),...segments[2].slice(1)];
let crossingPending=false,crossingCleared=false;
let stage=0,busy=false,fastForward=false,run=0,solved=new Set(),history=[];
const length=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function place(actor,p){actor.style.left=(p[0]/1536*100)+'%';actor.style.top=(p[1]/740*100)+'%';}
function tail(){let gap=108;for(let i=history.length-1;i>0;i--){const a=history[i],b=history[i-1],d=length(a,b);if(d>=gap){const t=gap/d;return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}gap-=d;}return history[0];}
function renderTrail(){$('#travelled').setAttribute('points',history.slice(1).filter((_,i)=>i%4===0).map(p=>p.join(',')).join(' '));}
function walkEdge(a,b,id){return new Promise(resolve=>{let start;const duration=length(a,b)*6;function tick(now){if(id!==run){resolve();return;}start??=now;const t=(reduced||fastForward)?1:Math.min(1,(now-start)/duration);const p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];history.push(p);place(walkers[0],p);place(walkers[1],tail());renderTrail();if(t<1)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});}
function speech(name,text){const row=document.createElement('div');row.className='route-speech';const image=document.createElement('img');image.src=name==='Краплик'?'assets/kraplyk.png':'assets/kraplynka.png';image.alt='';const bubble=document.createElement('div'),label=document.createElement('strong');label.textContent=name;bubble.append(label,document.createTextNode(text));row.append(image,bubble);return row;}
function updateProgress(){document.querySelectorAll('.ticket-dots>span').forEach((dot,i)=>{dot.classList.toggle('solved',solved.has(i));dot.firstChild.textContent=solved.has(i)?'✓':String(i+1);});$('#route-counter').textContent=solved.size+' / 3';}
function showTalk(){const q=orderedTalks[stage];$('#route-label').textContent=q.label;$('#route-title').textContent=q.title;$('#route-lines').replaceChildren(speech(q.asker,q.question),speech(q.helper,q.reply));$('#route-feedback').hidden=true;$('#next-stop').hidden=true;const choices=$('#route-choices');choices.replaceChildren();q.choices.forEach((text,i)=>{const button=document.createElement('button');button.textContent=q.asker+': «'+text+'»';button.addEventListener('click',()=>{const feedback=$('#route-feedback');feedback.hidden=false;if(i!==q.correct){button.classList.add('retry');feedback.textContent=q.helper+': '+q.hint;return;}choices.querySelectorAll('button').forEach(b=>b.disabled=true);button.classList.add('correct');feedback.textContent=q.feedback;solved.add(stage);updateProgress();if(stage<2){$('#next-stop').textContent=stage===0?'Обрати зупинку →':'Рушаймо до станції →';$('#next-stop').hidden=false;}else{$('#journey-finish').hidden=false;$('#travel-status').textContent='Дорогу знайдено! Наступний крок — реєстратура.';walkers.forEach((actor,i)=>{const image=actor.querySelector('img');image.src=i===0?'assets/kraplyk-radiie.png':'assets/kraplynka-radiie.png';image.alt=i===0?'Краплик радіє':'Краплинка радіє';});}});choices.append(button);});}
function showDepartureChoices(){if(!solved.has(0))return;$('#departure-panel').hidden=false;$('#city-panel').hidden=false;document.querySelectorAll('[data-departure]').forEach(b=>b.disabled=false);$('#next-stop').hidden=true;$('#route-feedback').hidden=true;$('#route-label').textContent='ГРАФІК ПЕРЕВІРИЛИ · ОБИРАЄМО ЗУПИНКУ';$('#route-title').textContent='Звідки вирушимо разом?';$('#route-lines').replaceChildren(speech('Краплик','Тепер знаємо, що графік варто перевірити. Від якої зупинки підемо?'),speech('Краплинка','Обери мою репліку — і вирушаймо!'));$('#route-choices').replaceChildren();for(const [key,branch] of Object.entries(branches)){const choice=document.createElement('button');choice.textContent='Краплинка: «Вирушаймо від зупинки '+branch.name+'»';choice.addEventListener('click',()=>startDeparture(key));$('#route-choices').append(choice);}}
async function travel(points,pauseAtCrossing=false){if(busy)return;busy=true;fastForward=false;const id=run;$('#next-stop').hidden=true;$('#skip-walk').hidden=false;$('#route-choices').replaceChildren();$('#route-feedback').hidden=true;$('.route-dialogue').classList.remove('crossing-conversation');$('#route-title').textContent='Крокуємо разом…';$('#route-lines').replaceChildren(speech('Краплик','Ідімо позначеним маршрутом.'),speech('Краплинка','Добре, я поруч!'));$('#travel-status').textContent=stage===1?'У дорозі · звіримо адресу':'У дорозі · прямуємо до станції';walkers.forEach(a=>a.classList.add('walking'));for(let i=1;i<points.length;i++){await walkEdge(points[i-1],points[i],id);if(id!==run)return;}busy=false;walkers.forEach(a=>a.classList.remove('walking'));$('#skip-walk').hidden=true;if(pauseAtCrossing){showCrossing();return;}$('#travel-status').textContent=stage===2?'Біля станції · що зробимо спочатку?':'Звіримо адресу · обери репліку в розмові нижче';showTalk();}
function startDeparture(key){if(!solved.has(0)||!branches[key])return;run++;busy=false;crossingPending=false;crossingCleared=false;$('.route-dialogue').classList.remove('crossing-conversation');solved.delete(1);solved.delete(2);updateProgress();$('#journey-finish').hidden=true;$('#next-stop').hidden=true;$('#route-feedback').hidden=true;$('#travelled').setAttribute('points','');walkers.forEach((actor,i)=>{actor.classList.remove('walking');actor.hidden=false;const image=actor.querySelector('img');image.src=i===0?'assets/kraplyk-ide.png':'assets/kraplynka-ide.png';image.alt=i===0?'Краплик іде картою':'Краплинка іде картою';});const branch=branches[key];document.querySelectorAll('[data-departure]').forEach(b=>{b.disabled=false;b.setAttribute('aria-pressed',String(b.dataset.departure===key));});$('#map-invite').hidden=true;stage=1;history=[branch.behind,branch.points[0]];place(walkers[0],branch.points[0]);place(walkers[1],branch.behind);$('#route-label').textContent='ВІД ЗУПИНКИ «'+branch.name.toUpperCase()+'»';travel(branch.points);}
document.querySelectorAll('[data-departure]').forEach(button=>{button.disabled=true;button.addEventListener('click',()=>startDeparture(button.dataset.departure));});
$('#next-stop').addEventListener('click',()=>{
 if(busy)return;
 if(crossingPending){
  if(!crossingCleared)return;
  crossingPending=false;
  travel(routeAfterCrossing);
  return;
 }
 if(!solved.has(stage))return;
 if(stage===0)showDepartureChoices();
 else if(stage===1){stage=2;travel(routeToCrossing,true);}
});
$('#skip-walk').addEventListener('click',()=>{fastForward=true;});
$('#restart-route').addEventListener('click',()=>{if(solved.has(0)){run++;busy=false;crossingPending=false;crossingCleared=false;$('.route-dialogue').classList.remove('crossing-conversation');fastForward=false;solved.delete(1);solved.delete(2);stage=0;history=[];updateProgress();walkers.forEach(a=>{a.hidden=true;a.classList.remove('walking');});$('#journey-finish').hidden=true;$('#skip-walk').hidden=true;$('#travelled').setAttribute('points','');$('#map-invite').hidden=false;$('#travel-status').textContent='Обери нову зупинку в розмові';document.querySelectorAll('[data-departure]').forEach(b=>b.setAttribute('aria-pressed','false'));showDepartureChoices();}});
showTalk();



function showCrossing(){
 crossingPending=true;
 crossingCleared=false;
 const panel=$('.route-dialogue');
 panel.classList.add('crossing-conversation');
 $('#route-label').textContent='УВАГА · ЗУПИНЯЄМОСЯ ПЕРЕД ПЕРЕХРЕСТЯМ';
 $('#route-title').textContent='Як безпечно перейти перехрестя?';
 $('#travel-status').textContent='Зупинилися перед небезпечним перехрестям · обери відповідь у діалозі';
 $('#route-lines').replaceChildren(
  speech('Краплик','Попереду небезпечне нерегульоване перехрестя. Як нам його перейти?'),
  speech('Краплинка','Зупинімося перед ним. Уважність зараз важливіша за поспіх. Обери мою репліку.')
 );
 $('#route-feedback').hidden=true;
 $('#next-stop').hidden=true;
 const choices=$('#route-choices');
 choices.replaceChildren();
 const answers=[
  {text:'Швидко побіжімо, щоб не затримуватися',correct:false},
  {text:'Зупинімося, озирнімося в усі боки й переконаймося, що переходити безпечно',correct:true}
 ];
 for(const answer of answers){
  const button=document.createElement('button');
  button.textContent='Краплинка: «'+answer.text+'»';
  button.addEventListener('click',()=>{
   const feedback=$('#route-feedback');feedback.hidden=false;
   if(!answer.correct){
    button.classList.add('retry');
    feedback.textContent='Краплик: Не поспішаймо. Ми залишаємося перед перехрестям. Спочатку потрібно зупинитися, уважно озирнутися в усі боки й переконатися, що переходити безпечно.';
    return;
   }
   choices.querySelectorAll('button').forEach(b=>b.disabled=true);
   button.classList.add('correct');
   crossingCleared=true;
   feedback.textContent='Краплик: Саме так! Переходимо лише тоді, коли переконалися, що це безпечно. Краплинка: Добре, будемо уважними й не поспішатимемо.';
   $('#next-stop').textContent='Продовжити, коли перехід безпечний →';
   $('#next-stop').hidden=false;
  });
  choices.append(button);
 }
 panel.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'});
 $('#route-title').tabIndex=-1;
 $('#route-title').focus({preventScroll:true});
}

