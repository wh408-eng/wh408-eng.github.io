'use strict';
document.getElementById('year').textContent = new Date().getFullYear();

const lab = document.getElementById('lab-content');
lab.innerHTML = `<div class="lab-tabs" role="tablist" aria-label="Supply chain demos">
<button role="tab" id="tab-finance" aria-controls="panel-finance" aria-selected="true" data-tab="finance">Inventory planner</button>
<button role="tab" id="tab-marketing" aria-controls="panel-marketing" aria-selected="false" tabindex="-1" data-tab="marketing">Freight comparison</button>
<button role="tab" id="tab-analytics" aria-controls="panel-analytics" aria-selected="false" tabindex="-1" data-tab="analytics">Procurement challenge</button></div>
<div class="lab-panel" id="panel-finance" role="tabpanel" aria-labelledby="tab-finance">
<div class="calculator-grid"><form id="inventory-form"><h3>When should you reorder?</h3><p>Adjust demand and supplier lead time to estimate the inventory position that triggers a new order.</p>
<label class="field">Average daily demand (units)<input name="demand" type="number" min="0" max="1000000" step="any" value="40" required></label>
<div class="field-row"><label class="field">Lead time (days)<input name="lead" type="number" min="0" max="3650" step="any" value="7" required></label><label class="field">Safety stock (units)<input name="safety" type="number" min="0" max="10000000" step="1" value="80" required></label></div>
<label class="field">Inventory position (units)<input name="position" type="number" min="0" max="10000000" step="1" value="300" required></label>
<button class="reset" type="reset">Reset assumptions</button></form>
<div class="result-box" id="inventory-result" aria-live="polite" aria-atomic="true"></div></div>
<p class="fine-print">Reorder point = average daily demand × lead time + safety stock, rounded up to whole units. Inventory position = on-hand stock + stock on order − backorders. This simplified continuous-review model assumes stable demand and lead time; safety stock is a user-selected buffer.</p></div>
<div class="lab-panel" id="panel-marketing" role="tabpanel" aria-labelledby="tab-marketing" hidden>
<div class="calculator-grid"><form id="freight-form"><h3>Which freight quote costs less?</h3><p>Compare a flat booking fee plus a per-unit charge for the same shipment and service level.</p>
<label class="field">Shipment size (units)<input name="quantity" type="number" min="1" max="10000000" step="1" value="200" required></label>
<div class="field-row"><label class="field">Carrier A: flat fee ($)<input name="aFixed" type="number" min="0" max="1000000" step="any" value="100" required></label><label class="field">Carrier A: per unit ($)<input name="aRate" type="number" min="0" max="1000000" step="any" value="2" required></label></div>
<div class="field-row"><label class="field">Carrier B: flat fee ($)<input name="bFixed" type="number" min="0" max="1000000" step="any" value="250" required></label><label class="field">Carrier B: per unit ($)<input name="bRate" type="number" min="0" max="1000000" step="any" value="1" required></label></div>
<button class="reset" type="reset">Reset assumptions</button></form>
<div class="result-box" id="freight-result" aria-live="polite" aria-atomic="true"></div></div>
<p class="fine-print">Illustrative quotes only. Total = flat fee + per-unit charge × shipment size. Excludes fuel surcharges, taxes, customs, and service differences; actual carrier quotes may use weight, distance, and minimum charges.</p></div>
<div class="lab-panel" id="panel-analytics" role="tabpanel" aria-labelledby="tab-analytics" hidden><div id="quiz"></div></div>`;

const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
const number = value => new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(value);
function values(form) {
  const inputs = [...form.querySelectorAll('input')];
  if (inputs.some(input => !input.checkValidity() || input.value.trim()==='' || !Number.isFinite(input.valueAsNumber))) return null;
  return Object.fromEntries(inputs.map(input => [input.name, input.valueAsNumber]));
}
function renderInventory() {
  const v=values(document.getElementById('inventory-form'));
  const result=document.getElementById('inventory-result');
  if(!v){result.innerHTML='<p class="error">Enter a valid nonnegative number in every field. Safety stock and inventory position must be whole units.</p>';return;}
  const leadDemand=v.demand*v.lead,point=Math.ceil(leadDemand+v.safety),reorder=v.position<=point;
  result.innerHTML=`<span class="result-caption">REORDER POINT</span><div class="result-number">${number(point)} units</div><p>${v.demand===0?'There is no forecast demand. Review the need for replenishment before ordering.':reorder?'At or below the reorder point: consider placing an order.':'Above the reorder point: monitor demand and inventory.'}</p><dl class="result-list"><dt>Expected lead-time demand</dt><dd>${number(leadDemand)} units</dd><dt>Safety stock buffer</dt><dd>${number(v.safety)} units</dd><dt>Inventory position</dt><dd>${number(v.position)} units</dd><dt>Position ${reorder?'below':'above'} threshold</dt><dd>${number(Math.abs(v.position-point))} units</dd></dl>`;
}
function renderFreight(){
 const v=values(document.getElementById('freight-form')),result=document.getElementById('freight-result');
 if(!v){result.innerHTML='<p class="error">Enter valid nonnegative costs and a shipment size of at least one whole unit.</p>';return;}
 const a=v.aFixed+v.aRate*v.quantity,b=v.bFixed+v.bRate*v.quantity,difference=Math.abs(a-b),tie=difference<0.005;
 result.innerHTML=`<span class="result-caption">LOWEST QUOTED COST</span><div class="result-number">${money(Math.min(a,b))}</div><p>${tie?'Both carriers have the same quoted total.':(a<b?'Carrier A':'Carrier B')+' costs '+money(difference)+' less for this shipment.'}</p><dl class="result-list"><dt>Carrier A total</dt><dd>${money(a)}</dd><dt>Carrier B total</dt><dd>${money(b)}</dd><dt>Lowest cost per unit</dt><dd>${money(Math.min(a,b)/v.quantity)}</dd></dl>`;
}
for(const [id,render] of [['inventory-form',renderInventory],['freight-form',renderFreight]]){
 const form=document.getElementById(id);form.addEventListener('input',render);form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('reset',()=>setTimeout(render,0));render();
}
function selectTab(name,focus=false){
 if(!['finance','marketing','analytics'].includes(name)) throw new Error('Unknown demo');
 document.querySelectorAll('[data-tab]').forEach(button=>{const active=button.dataset.tab===name;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;if(active&&focus)button.focus();});
 ['finance','marketing','analytics'].forEach(item=>document.getElementById('panel-'+item).hidden=item!==name);
}
document.querySelectorAll('[data-tab]').forEach((button,index)=>{
 button.addEventListener('click',()=>selectTab(button.dataset.tab));
 button.addEventListener('keydown',event=>{const tabs=['finance','marketing','analytics'];let next;if(event.key==='ArrowRight')next=(index+1)%3;if(event.key==='ArrowLeft')next=(index+2)%3;if(event.key==='Home')next=0;if(event.key==='End')next=2;if(next!==undefined){event.preventDefault();selectTab(tabs[next],true);}});
});
document.querySelectorAll('[data-tool]').forEach(link=>link.addEventListener('click',()=>selectTab(link.dataset.tool)));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 const category=button.dataset.filter;let count=0;
 document.querySelectorAll('.project-card').forEach(card=>{card.hidden=category!=='All'&&card.dataset.category!==category;if(!card.hidden)count++;});
 document.querySelectorAll('[data-filter]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
 document.getElementById('filter-count').textContent=count+' project'+(count===1?'':'s');
}));

const questions=[
 {question:'A supplier offers the lowest unit price. Is that enough to choose them?',options:['Yes. The lowest unit price always gives the best value.','No. Compare total landed cost, quality, and reliability.','No. Always choose the most expensive supplier.'],answer:1,explanation:'Purchase price is only one part of the decision. Freight, defects, delays, and service reliability can change the total cost and operational risk.'},
 {question:'Daily demand is 40 units, lead time is 7 days, and safety stock is 80 units. What is the reorder point?',options:['280 units','360 units','560 units'],answer:1,explanation:'Expected lead-time demand is 40 × 7 = 280 units. Adding 80 units of safety stock gives a reorder point of 360 units.'},
 {question:'A critical part comes from just one supplier. Which action can improve resilience?',options:['Remove all safety stock.','Qualify an alternative supplier and review contingency plans.','Wait until a disruption occurs.'],answer:1,explanation:'A qualified backup supplier and an agreed contingency plan can reduce dependence on a single source. Cost, quality, capacity, and switching time still need to be evaluated.'}
];
let questionIndex=0,score=0,answered=false;
function renderQuiz(){
 const root=document.getElementById('quiz');answered=false;
 if(questionIndex===questions.length){root.innerHTML=`<span class="quiz-progress">CHALLENGE COMPLETE</span><h3>You scored ${score} out of ${questions.length}.</h3><p>${score===3?'Strong instincts! You considered cost, inventory, and supply risk.':'Keep exploring. Small changes in assumptions can make a big difference.'}</p><button class="button dark" id="restart-quiz">Try again</button>`;document.getElementById('restart-quiz').onclick=()=>{score=0;questionIndex=0;renderQuiz();};return;}
 const q=questions[questionIndex];
 root.innerHTML=`<span class="quiz-progress">QUESTION ${questionIndex+1} OF ${questions.length}</span><h3>${q.question}</h3><div class="quiz-options">${q.options.map((option,index)=>`<button class="quiz-option" aria-pressed="false" data-answer="${index}">${option}</button>`).join('')}</div><div id="quiz-feedback" aria-live="polite"></div><div class="quiz-footer"><p>Score: ${score} / ${questions.length}</p><button class="button dark" id="next-question" hidden>${questionIndex===questions.length-1?'See my score':'Next question'}</button></div>`;
 root.querySelectorAll('[data-answer]').forEach(button=>button.onclick=()=>{
   if(answered)return;answered=true;const correct=Number(button.dataset.answer)===q.answer;if(correct)score++;
   button.setAttribute('aria-pressed','true');root.querySelectorAll('[data-answer]').forEach(item=>{item.disabled=true;});
   document.getElementById('quiz-feedback').innerHTML=`<div class="quiz-feedback"><strong>${correct?'Correct.':'Not quite.'}</strong> ${q.explanation}</div>`;
   root.querySelector('.quiz-footer p').textContent=`Score: ${score} / ${questions.length}`;
   document.getElementById('next-question').hidden=false;
 });
 document.getElementById('next-question').onclick=()=>{questionIndex++;renderQuiz();};
}
renderQuiz();
