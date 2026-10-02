'use strict';
document.getElementById('year').textContent = new Date().getFullYear();

const lab = document.getElementById('lab-content');
lab.innerHTML = `<div class="lab-tabs" role="tablist" aria-label="Business demos">
<button role="tab" id="tab-finance" aria-controls="panel-finance" aria-selected="true" data-tab="finance">Finance</button>
<button role="tab" id="tab-marketing" aria-controls="panel-marketing" aria-selected="false" tabindex="-1" data-tab="marketing">Marketing</button>
<button role="tab" id="tab-analytics" aria-controls="panel-analytics" aria-selected="false" tabindex="-1" data-tab="analytics">Business challenge</button></div>
<div class="lab-panel" id="panel-finance" role="tabpanel" aria-labelledby="tab-finance">
<div class="calculator-grid"><form id="finance-form"><h3>When does a business break even?</h3><p>Imagine launching a product. Adjust the numbers to see what it takes to cover your costs.</p>
<label class="field">Monthly fixed costs ($)<input id="fixed" name="fixed" type="number" min="0" max="100000000" step="any" value="2000" required></label>
<div class="field-row"><label class="field">Price per unit ($)<input id="price" name="price" type="number" min="0" max="1000000" step="any" value="25" required></label><label class="field">Cost per unit ($)<input id="cost" name="cost" type="number" min="0" max="1000000" step="any" value="10" required></label></div>
<label class="field">Units sold per month<input id="units" name="units" type="number" min="0" max="100000000" step="1" value="200" required></label>
<button class="reset" type="reset">Reset assumptions</button></form>
<div class="result-box" id="finance-result" aria-live="polite" aria-atomic="true"></div></div>
<p class="fine-print">Illustrative model: profit = (price − variable cost) × units sold − fixed costs. Excludes taxes and other costs.</p></div>
<div class="lab-panel" id="panel-marketing" role="tabpanel" aria-labelledby="tab-marketing" hidden>
<div class="calculator-grid"><form id="marketing-form"><h3>From campaign to customers.</h3><p>Explore the relationship between campaign spending, clicks, and conversions.</p>
<label class="field">Campaign budget ($)<input id="budget" name="budget" type="number" min="0" max="100000000" step="any" value="1000" required></label>
<div class="field-row"><label class="field">Cost per click ($)<input id="cpc" name="cpc" type="number" min="0.01" max="1000000" step="any" value="2" required></label><label class="field">Conversion rate (%)<input id="conversion" name="conversion" type="number" min="0" max="100" step="any" value="4" required></label></div>
<label class="field">Revenue per customer ($)<input id="order" name="order" type="number" min="0" max="100000000" step="any" value="80" required></label>
<button class="reset" type="reset">Reset assumptions</button></form>
<div class="result-box" id="marketing-result" aria-live="polite" aria-atomic="true"></div></div>
<p class="fine-print">Illustrative estimates, not guaranteed outcomes. Return on ad spend measures revenue, not profit; product and operating costs are excluded.</p></div>
<div class="lab-panel" id="panel-analytics" role="tabpanel" aria-labelledby="tab-analytics" hidden><div id="quiz"></div></div>`;

const money = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
const number = value => new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(value);
function values(form) {
  const inputs = [...form.querySelectorAll('input')];
  if (inputs.some(input => !input.checkValidity() || input.value.trim()==='' || !Number.isFinite(input.valueAsNumber))) return null;
  return Object.fromEntries(inputs.map(input => [input.name, input.valueAsNumber]));
}
function renderFinance() {
  const v=values(document.getElementById('finance-form'));
  const result=document.getElementById('finance-result');
  if(!v){result.innerHTML='<p class="error">Enter a valid number in every field. Costs, price, and units cannot be negative; units must be whole numbers.</p>';return;}
  const margin=v.price-v.cost, profit=margin*v.units-v.fixed;
  const breakEven=margin>0?Math.ceil(v.fixed/margin):v.fixed===0&&margin===0?0:null;
  result.innerHTML=`<span class="result-caption">BREAK-EVEN SALES / MONTH</span><div class="result-number">${breakEven===null?'Not achievable':number(breakEven)+' units'}</div><p>${margin<=0?'The price must exceed the cost per unit to earn a positive contribution toward fixed costs.':'Each unit contributes '+money(margin)+' toward covering fixed costs.'}</p><dl class="result-list"><dt>Monthly revenue</dt><dd>${money(v.price*v.units)}</dd><dt>Total monthly cost</dt><dd>${money(v.fixed+v.cost*v.units)}</dd><dt>Monthly ${profit<0?'loss':'profit'}</dt><dd>${money(profit)}</dd></dl>`;
}
function renderMarketing(){
 const v=values(document.getElementById('marketing-form')), result=document.getElementById('marketing-result');
 if(!v){result.innerHTML='<p class="error">Enter valid nonnegative numbers, a cost per click of at least $0.01, and a conversion rate from 0% to 100%.</p>';return;}
 const clicks=v.budget/v.cpc,customers=clicks*v.conversion/100,revenue=customers*v.order;
 result.innerHTML=`<span class="result-caption">ESTIMATED REVENUE</span><div class="result-number">${money(revenue)}</div><p>${v.budget>0?number(revenue/v.budget)+'× return on ad spend.':'Add a campaign budget to calculate return on ad spend.'}</p><dl class="result-list"><dt>Estimated clicks</dt><dd>${number(clicks)}</dd><dt>Expected customers</dt><dd>${number(customers)}</dd><dt>Acquisition cost</dt><dd>${customers>0?money(v.budget/customers):'Not available'}</dd></dl>`;
}
for(const [id,render] of [['finance-form',renderFinance],['marketing-form',renderMarketing]]){
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
 {question:'Revenue grew by 20%. Does that mean the business became more profitable?',options:['Yes, more revenue always means more profit.','Not necessarily. Costs may have grown faster.','No, revenue and profit are never related.'],answer:1,explanation:'Profit is revenue minus costs. Higher revenue can still produce lower profit when costs rise faster.'},
 {question:'Campaign A has 1,000 clicks and 20 sales. Campaign B has 400 clicks and 16 sales. Which has the higher conversion rate?',options:['Campaign A','Campaign B','They have the same conversion rate.'],answer:1,explanation:'Campaign A converts 2% of clicks; Campaign B converts 4%. More clicks do not always mean a better conversion rate.'},
 {question:'A product sells for $30, costs $12 per unit, and has $900 in fixed costs. How many units cover all costs?',options:['30 units','50 units','75 units'],answer:1,explanation:'Each unit contributes $18. Dividing $900 by $18 gives a break-even point of 50 units.'}
];
let questionIndex=0,score=0,answered=false;
function renderQuiz(){
 const root=document.getElementById('quiz');answered=false;
 if(questionIndex===questions.length){root.innerHTML=`<span class="quiz-progress">CHALLENGE COMPLETE</span><h3>You scored ${score} out of ${questions.length}.</h3><p>${score===3?'Strong instincts! You looked beyond the headline numbers.':'Keep exploring. Small changes in assumptions can make a big difference.'}</p><button class="button dark" id="restart-quiz">Try again</button>`;document.getElementById('restart-quiz').onclick=()=>{score=0;questionIndex=0;renderQuiz();};return;}
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
