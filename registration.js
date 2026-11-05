const profiles = [
 Object.freeze({key:'kraplyk',short:'Краплик',genitive:'Краплика',name:'Червоний Краплик Резусович',passport:'НАВЧ-001',tax:'0000000001',address:'м. Приклад, вул. Навчальна, 1, кв. 2',phone:'000 000 00 01',incorrectPhone:'000 000 00 10',helper:'Краплинка',helperVocative:'Краплинко'}),
 Object.freeze({key:'kraplynka',short:'Краплинка',genitive:'Краплинки',name:'Червона Краплинка Плазмівна',passport:'НАВЧ-002',tax:'0000000002',address:'м. Приклад, вул. Навчальна, 1, кв. 3',phone:'000 000 00 02',incorrectPhone:'000 000 00 20',helper:'Краплик',helperVocative:'Краплику'})
];
const $=selector=>document.querySelector(selector);
const delivered=new Set(),receivedCards=new Map();
let donorIndex=0,demo=profiles[0],nextAction=null;
function pose(file,description){const image=$(demo.key==='kraplyk'?'#donor-pose':'#friend-pose');image.src='assets/'+demo.key+'-'+file+'.png';image.alt=demo.short+' '+description;}
function say(name,text){const p=document.createElement('p'),label=document.createElement('strong');label.textContent=name;if(name==='Реєстратор')p.className='registrar-line';p.append(label,document.createTextNode(text));return p;}
function conversation(label,title,lines){$('#registration-label').textContent=label;$('#registration-title').textContent=title;$('#registration-lines').replaceChildren(...lines.map(([name,text])=>say(name,text)));$('#registration-choices').replaceChildren();$('#registration-feedback').hidden=true;$('#registration-next').hidden=true;nextAction=null;}
function field(name,value){const el=$('#card-'+name);el.textContent=value;el.classList.remove('empty');}
function feedback(text){$('#registration-feedback').textContent=text;$('#registration-feedback').hidden=false;}
function advance(text,action){$('#registration-next').textContent=text;$('#registration-next').hidden=false;nextAction=action;}
function reply(text,action){const button=document.createElement('button');button.textContent=text;button.addEventListener('click',()=>action(button));$('#registration-choices').append(button);}
function completeChoices(button){$('#registration-choices').querySelectorAll('button').forEach(b=>b.disabled=true);button.classList.add('correct');}
function updateDonorProgress(){for(const profile of profiles){const chip=$('#donor-progress-'+profile.key);const received=receivedCards.has(profile.key);chip.classList.toggle('received',received);chip.classList.toggle('current',!received&&profile.key===demo.key);chip.textContent=profile.short+(received?' · картку отримано ✓':profile.key===demo.key?' · оформлюємо картку':' · наступна');}}
function beginDonor(index){
 donorIndex=index;demo=profiles[index];delivered.clear();
 $('#donor-turn').textContent='Картка '+(index+1)+' із 2';$('#card-donor').textContent=demo.short;$('#card-number').textContent='НАВЧАЛЬНА · 00'+(index+1);
 $('#reference-label').textContent='ПАМ’ЯТКА '+demo.genitive.toUpperCase();
 for(const key of ['name','passport','tax','address','phone']){$('#reference-'+key).textContent=demo[key];const el=$('#card-'+key);el.textContent=['address','phone'].includes(key)?'Реєстратор уточнить':'Очікуємо документ';el.classList.add('empty');}
 $('#donor-card').classList.remove('verified','received');$('#card-status').textContent='Оформлюємо разом…';$('.card-description').textContent='Реєстратор заповнює дані';
 $('#document-actions').hidden=false;document.querySelectorAll('[data-registration-document]').forEach(button=>{button.disabled=false;button.querySelector('.action-mark').textContent='＋';});
 document.querySelectorAll('.registration-ticket li').forEach(item=>item.classList.remove('done'));updateDonorProgress();
 if(index>0)pose('dokument','передає документи');
 conversation('КРОК 1 · ДОКУМЕНТИ '+demo.genitive.toUpperCase(),'Оформлюємо картку '+demo.genitive,[
  ['Реєстратор',index===0?'Вітаю! Спочатку оформимо картку Краплика, потім — Краплинки. Кожному потрібна своя картка. Передайте, будь ласка, паспорт і РНОКПП.':'Тепер оформимо окрему картку Краплинки. Передайте, будь ласка, свій паспорт і РНОКПП.'],
  [demo.short,demo.helperVocative+', допоможеш нічого не пропустити?'],
  [demo.helper,'Звісно. Передамо твої документи й перевіримо саме твої дані.']
 ]);
}
document.querySelectorAll('[data-registration-document]').forEach(button=>button.addEventListener('click',()=>{
 const type=button.dataset.registrationDocument;if(delivered.has(type))return;
 delivered.add(type);button.disabled=true;button.querySelector('.action-mark').textContent='✓';
 if(type==='passport'){field('name',demo.name);field('passport',demo.passport);}else field('tax',demo.tax);
 feedback('Реєстратор: '+(type==='passport'?'ПІБ і номер паспорта перенесено з документа.':'РНОКПП внесено до картки.'));
 if(delivered.size===2){$('#step-documents').classList.add('done');feedback('Реєстратор: Дякую! Дані з документів внесено. Уточнімо вашу адресу проживання й номер телефону.');advance('До коротких запитань →',showAddress);}
}));
function showAddress(){
 $('#document-actions').hidden=true;
 conversation('КРОК 2 · АДРЕСА '+demo.genitive.toUpperCase(),'Уточнімо адресу проживання',[
  ['Реєстратор','Назвіть, будь ласка, адресу проживання. Я запишу її до вашої картки.'],
  [demo.helper,'У твоїй пам’ятці є всі навчальні дані. Назвімо адресу повністю.']
 ]);
 reply(demo.short+': «Моя адреса: '+demo.address+'»',button=>{completeChoices(button);field('address',demo.address);feedback('Реєстратор: Адресу записано. Тепер уточнімо номер телефону.');advance('Повідомити номер телефону →',showPhone);});
}
function showPhone(){
 conversation('КРОК 2 · ТЕЛЕФОН '+demo.genitive.toUpperCase(),'Як із вами зв’язатися?',[
  ['Реєстратор','Назвіть, будь ласка, номер телефону.'],
  [demo.short,'Мій навчальний номер — '+demo.phone+'. Зараз повідомлю його реєстратору.']
 ]);
 reply(demo.short+': «Мій номер: '+demo.phone+'»',button=>{completeChoices(button);field('phone',demo.phone);$('#step-contacts').classList.add('done');feedback(demo.helper+': Адресу й телефон повідомили. '+demo.short+': Тепер уважно перевіримо всі записані дані.');advance('Перевірити картку →',showReview);});
}
function showReview(){
 field('phone',demo.incorrectPhone);pose('chytaie','уважно читає картку');$('#card-status').textContent='Перевіряємо дані';
 conversation('КРОК 3 · ПЕРЕВІРКА КАРТКИ '+demo.genitive.toUpperCase(),'Уважність — теж допомога',[
  ['Реєстратор','Перевірте, будь ласка, чи правильно записані ваші дані.'],
  [demo.helper,'Звірмо картку з твоїми документами й пам’яткою.'],
  [demo.short,'Мій номер має закінчуватися на '+demo.phone.slice(-2)+'. А що записано в картці?']
 ]);
 reply(demo.short+': «Усе правильно, можна забирати»',button=>{button.classList.add('retry');feedback(demo.helper+': Поглянь уважніше: у картці номер закінчується на '+demo.incorrectPhone.slice(-2)+', а в пам’ятці — на '+demo.phone.slice(-2)+'. Це навчальна помилка. Попросімо реєстратора її виправити.');});
 reply(demo.short+': «Будь ласка, виправте номер телефону: останні цифри мають бути '+demo.phone.slice(-2)+'»',button=>{
  completeChoices(button);field('phone',demo.phone);$('#donor-card').classList.add('verified');$('#card-status').textContent='✓ Дані перевірено';
  feedback('Реєстратор: Дякую за уважність! Номер виправлено. Ось ваша картка із заповненими даними. Збережіть її — із нею підете до терапевта.');advance('Отримати картку '+demo.genitive+' →',receiveCard);
 });
}
function receiveCard(){
 $('#step-card').classList.add('done');$('#donor-card').classList.add('received');$('#card-status').textContent='✓ Видано донору';$('.card-description').textContent='Перевірено й отримано';pose('kartka','отримує власну картку');
 receivedCards.set(demo.key,{...demo});updateDonorProgress();$('#card-bag').classList.add('has-card');$('#bag-card-status').textContent='Отримано карток: '+receivedCards.size+' із 2';
 const list=$('#bag-cards-list');list.replaceChildren();for(const card of receivedCards.values()){
  const li=document.createElement('li'),details=document.createElement('details'),summary=document.createElement('summary');
  summary.textContent='✓ '+card.name;details.append(summary);
  const data=document.createElement('dl');
  for(const [key,label] of [['name','ПІБ'],['passport','Паспорт'],['tax','РНОКПП'],['address','Адреса'],['phone','Телефон']]){
   const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=card[key];data.append(dt,dd);
  }
  details.append(data);li.append(details);list.append(li);
 }
 conversation('КАРТКУ '+demo.genitive.toUpperCase()+' ОТРИМАНО',receivedCards.size===2?'Кожен зі своєю карткою':'Тепер черга Краплинки',[
  [demo.helper,'Усі дані перевірили. Твоя картка готова!'],
  [demo.short,receivedCards.size===2?'Тепер у нас обох є власні картки. Ходімо до терапевта.':'Мою картку отримано. А тепер допоможу тобі оформити твою, Краплинко.']
 ]);
 if(receivedCards.size===2){$('#registration-finish').hidden=false;}else{advance('Оформити картку Краплинки →',()=>beginDonor(1));}
}
$('#registration-next').addEventListener('click',()=>{if(nextAction){const action=nextAction;nextAction=null;action();}});
$('#registration-reset').addEventListener('click',()=>location.reload());
beginDonor(0);

