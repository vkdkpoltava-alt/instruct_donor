// Feet coordinates follow the free floor; room changes use the same doorway graph.
const floor = {
 entry:[48,77], hall:[43,69], corridor:[43,55], bedroomDoor:[44,45], bedSide:[42,39], bedroom:[40,34],
 living:[38,71], hallBottom:[54,74], kitchenApproach:[59,77], kitchenDoor:[63.5,79], kitchenInside:[66,74],
 tableBottom:[70,75], tableRight:[84,70], kitchen:[85,64]
};
const links = [['entry','hall'],['hall','corridor'],['corridor','bedroomDoor'],['bedroomDoor','bedSide'],['bedSide','bedroom'],['hall','living'],['entry','hallBottom'],['hallBottom','kitchenApproach'],['kitchenApproach','kitchenDoor'],['kitchenDoor','kitchenInside'],['kitchenInside','tableBottom'],['tableBottom','tableRight'],['tableRight','kitchen']];
const rooms = {
 bedroom:{title:'Заряд спокійного ранку',label:'01 · СПАЛЬНЯ',question:'Може, сьогодні ляжемо пізніше, а зранку якось зберемося?',reply:'Перед донацією важливо добре виспатися. Яку відповідь оберемо?',choices:['Краще добре виспатися','Можна обійтися без сну'],correct:0,explanation:'Краплик: Саме так! Намагайся добре висипатися, а вранці перевір самопочуття. Краплинка: Залишу час для відпочинку.'},
 kitchen:{title:'Сніданок, а не голодування',label:'02 · КУХНЯ',question:'Перед донацією треба прийти натще? Що обрати на сніданок?',reply:'Поснідати потрібно обов’язково. Допоможи скласти легкий сніданок.',choices:['Смажене м’ясо з жирним соусом','Каша на воді, хліб і солодкий чай'],correct:1,explanation:'Краплик: Правильно! Це приклад легкого сніданку з інструкції. Також пий достатньо звичайної води. Краплинка: Чудово, без голодування!'},
 living:{title:'Пауза для себе',label:'03 · ВІТАЛЬНЯ',question:'А як щодо інтенсивного тренування перед донацією?',reply:'Подумаймо, як підготуватися без зайвого навантаження.',choices:['Обрати спокійний режим без інтенсивних навантажень','Запланувати важке тренування'],correct:0,explanation:'Краплинка: Так! За 1–2 дні до візиту не плануй інтенсивних навантажень. Алкоголь виключи щонайменше за 48 годин. Краплик: Обираю турботу про себе.'}
};
const completed = new Set();
const actors = [document.querySelector('#kraplyk'),document.querySelector('#kraplynka')];
let current = 'entry';
let moving = false;
let trail = [[49,82.8],floor.entry];
const distance = (a,b) => Math.hypot(a[0]-b[0],(a[1]-b[1])*2/3);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function place(actor,point){ actor.style.left=point[0]+'%';actor.style.top=point[1]+'%'; }
function follower(){
 let remaining=5.6;
 for(let i=trail.length-1;i>0;i--){const a=trail[i],b=trail[i-1],len=distance(a,b);if(len>=remaining){const t=remaining/len;return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}remaining-=len;}
 return trail[0];
}
function routeTo(target){const queue=[[current]],visited=new Set([current]);while(queue.length){const path=queue.shift(),last=path.at(-1);if(last===target)return path;for(const [a,b] of links){const next=a===last?b:b===last?a:null;if(next&&!visited.has(next)){visited.add(next);queue.push([...path,next]);}}}return [];}
function walkSegment(a,b){return new Promise(resolve=>{
 const duration=reducedMotion?0:distance(a,b)*65;let start;
 function tick(now){start??=now;const t=duration?Math.min((now-start)/duration,1):1;const point=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];trail.push(point);place(actors[0],point);place(actors[1],follower());if(t<1)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);
});}
function speech(name,text){const row=document.createElement('div');row.className='speech';const image=document.createElement('img');image.src=name==='Краплик'?'assets/kraplyk.png':'assets/kraplynka.png';image.alt='';const bubble=document.createElement('div'),strong=document.createElement('strong');strong.textContent=name;bubble.append(strong,document.createTextNode(text));row.append(image,bubble);return row;}
function showDialogue(room){const data=rooms[room];const asker=room==='living'?'Краплик':'Краплинка';const guide=room==='living'?'Краплинка':'Краплик';document.querySelector('#scene-label').textContent=data.label;document.querySelector('#scene-title').textContent=data.title;document.querySelector('#room-info').replaceChildren(speech(asker,data.question),speech(guide,data.reply));const choices=document.querySelector('#choices');choices.replaceChildren();const feedback=document.querySelector('#answer-feedback');feedback.hidden=true;document.querySelector('#quest-hint').textContent='Обери репліку '+(asker==='Краплик'?'Краплика':'Краплинки')+', щоб продовжити розмову.';
 data.choices.forEach((text,index)=>{const button=document.createElement('button');button.textContent=asker+': «'+text+'»';button.addEventListener('click',()=>{feedback.hidden=false;if(index!==data.correct){button.classList.add('retry');feedback.textContent=guide+': Подумай ще раз. Згадаймо, як допомогти організму підготуватися.';return;}choices.querySelectorAll('button').forEach(b=>b.disabled=true);button.classList.add('correct');feedback.textContent=data.explanation;completed.add(room);document.querySelector('#stamp-'+room).classList.add('earned');document.querySelector('#visited').textContent=completed.size+' із 3 відміток';document.querySelector('#quest-hint').textContent=completed.size===3?'Усі три відмітки зібрано!':'Відмітку отримано! Обери наступну кімнату.';document.querySelectorAll('[data-room="'+room+'"]').forEach(b=>b.classList.add('completed'));document.querySelector('#finish').hidden=completed.size!==3;});choices.append(button);});
}
async function visit(room){if(moving)return;const path=routeTo(room);if(!path.length)return;moving=true;document.querySelectorAll('[data-room]').forEach(button=>button.disabled=true);document.querySelector('#choices').replaceChildren();document.querySelector('#answer-feedback').hidden=true;document.querySelector('#scene-title').textContent='Йдемо разом…';document.querySelector('#room-info').replaceChildren(speech('Краплик','Тримаймося проходу — обійдемо меблі.'),speech('Краплинка','Я за тобою!'));document.querySelector('#quest-hint').textContent='Герої прямують до кімнати.';document.querySelector('#route').setAttribute('points',path.map(node=>floor[node][0]+','+(floor[node][1]*2/3)).join(' '));actors.forEach(a=>a.classList.add('walking'));
 for(let i=1;i<path.length;i++)await walkSegment(floor[path[i-1]],floor[path[i]]);
 actors.forEach(a=>a.classList.remove('walking'));current=room;moving=false;document.querySelectorAll('[data-room]').forEach(button=>{button.disabled=false;button.setAttribute('aria-pressed',String(button.dataset.room===room));});showDialogue(room);
}
document.querySelectorAll('[data-room]').forEach(button=>button.addEventListener('click',()=>visit(button.dataset.room)));
document.querySelector('#room-info').replaceChildren(speech('Краплик','Сьогодні ми команда! Обери кімнату, і вирушаймо.'),speech('Краплинка','Хочу зібрати три відмітки: сон, сніданок і спокій.'));

