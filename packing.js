const documents = {
 identity:{name:'Документ, що посвідчує особу',message:'Краплик: Документ для ідентифікації на місці! Краплинка: Паспорт або інший документ, що посвідчує особу, — саме те, що потрібно.'},
 tax:{name:'РНОКПП — потрібен',message:'Краплинка: РНОКПП потрібен для оформлення документів. Покладемо його до сумки.'},
 medical:{name:'Медичні документи — за наявності',message:'Краплик: Якщо маєш документи щодо захворювання, лікування чи нещодавніх втручань, за можливості візьми їх із собою.'}
};
const questions = [
 {asker:'Краплик',helper:'Краплинка',title:'А яка в мене група крові?',question:'Документ узяв, але свою групу крові не знаю. Це завадить першому візиту?',reply:'Пригадаймо, що пояснює інструкція. Обери свою репліку!',choices:['Спершу обов’язково дізнаюся групу самостійно','Можна звернутися й без цього знання — її визначать фахівці'],correct:1,feedback:'Краплинка: Правильно! Знати групу крові та резус-фактор заздалегідь не потрібно. Визначення групи й необхідні лабораторні дослідження — частина роботи фахівців.',hint:'Спробуй ще раз. Не всі відомості потрібно знати заздалегідь.'},
 {asker:'Краплинка',helper:'Краплик',title:'А якщо зранку нездужаю?',question:'Уявімо: зранку я відчуваю слабкість і маю температуру. Сумка зібрана — усе одно йти?',reply:'Важливе передусім твоє самопочуття. Як вчинимо в цій ситуації?',choices:['Перенести візит і попередньо проконсультуватися з фахівцями','Іти, бо вже все зібрано, й не розповідати про симптоми'],correct:0,feedback:'Краплик: Так! За слабкості, температури чи іншого нездужання краще перенести візит і проконсультуватися з фахівцями. Краплинка: Подбати про себе — теж відповідальний крок.',hint:'Спробуй ще раз. Зібрана сумка не важливіша за здоров’я.'}
];
const packed = new Set();
const solved = new Set();
let activeQuestion = -1;
const $ = selector => document.querySelector(selector);
function updateBag(){
 const list=$('#packed-list');list.replaceChildren();
 if(!packed.size){const empty=document.createElement('li');empty.className='empty-bag';empty.textContent='Поки що порожньо — додай документ зі столу.';list.append(empty);}
 for(const id of packed){const item=document.createElement('li');item.textContent='✓ '+documents[id].name;list.append(item);}
 $('#bag-count').textContent=packed.size;
 $('#start-dialogue').disabled=!packed.has('identity');
 $('#task-bag').classList.toggle('done',packed.has('identity'));
 updateFinish();
}
function updateFinish(){const done=packed.has('identity')&&solved.size===questions.length;$('#packing-finish').hidden=!done;if(done){$('#packing-kraplyk').src='assets/kraplyk-radiie.png';$('#packing-kraplyk').alt='Краплик радіє';$('#packing-kraplynka').src='assets/kraplynka-radiie.png';$('#packing-kraplynka').alt='Краплинка радіє';}}
document.querySelectorAll('[data-document]').forEach(button=>button.addEventListener('click',()=>{
 const id=button.dataset.document;
 if(packed.has(id)){packed.delete(id);button.setAttribute('aria-pressed','false');button.querySelector('.card-action').textContent=id==='identity'?'＋ Покласти до сумки':id==='tax'?'＋ Покласти до сумки':'＋ Додати за наявності';$('#bag-feedback').textContent='Краплинка: Прибрали «'+documents[id].name+'» із сумки.';}
 else{packed.add(id);button.setAttribute('aria-pressed','true');button.querySelector('.card-action').textContent='✓ У сумці · прибрати';$('#bag-feedback').textContent=documents[id].message;}
 const bag=$('.bag-illustration');bag.classList.remove('pop');void bag.offsetWidth;bag.classList.add('pop');updateBag();
}));
function line(speaker,text){const p=document.createElement('p'),strong=document.createElement('strong');strong.textContent=speaker;p.append(strong,document.createTextNode(text));return p;}
function renderQuestion(index){activeQuestion=index;const q=questions[index];$('#talk-label').textContent='РОЗМОВА '+(index+1)+' / '+questions.length;$('#talk-title').textContent=q.title;$('#packing-lines').replaceChildren(line(q.asker,q.question),line(q.helper,q.reply));$('#talk-feedback').hidden=true;$('#next-dialogue').hidden=true;const choices=$('#talk-choices');choices.replaceChildren();
 q.choices.forEach((text,i)=>{const button=document.createElement('button');button.textContent=q.asker+': «'+text+'»';button.addEventListener('click',()=>{
 const feedback=$('#talk-feedback');feedback.hidden=false;
 if(i!==q.correct){button.classList.add('retry');feedback.textContent=q.helper+': '+q.hint;return;}
 choices.querySelectorAll('button').forEach(b=>b.disabled=true);button.classList.add('correct');feedback.textContent=q.feedback;solved.add(index);$(index===0?'#task-group':'#task-health').classList.add('done');$('#next-dialogue').hidden=index===questions.length-1;updateFinish();
 });choices.append(button);});
}
$('#start-dialogue').addEventListener('click',()=>{if(!packed.has('identity'))return;renderQuestion(0);$('#packing-conversation').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
$('#next-dialogue').addEventListener('click',()=>{if(activeQuestion>=0&&activeQuestion<questions.length-1)renderQuestion(activeQuestion+1);});
$('#reset-quest').addEventListener('click',()=>location.reload());

