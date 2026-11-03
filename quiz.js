document.addEventListener("DOMContentLoaded",()=>{
 const el=document.getElementById("quiz");if(!el||!window.quizQuestions)return;
 let i=0,score=0;
 function render(){
  if(i>=quizQuestions.length){el.innerHTML=`<h2>Você concluiu o quiz!</h2><p>Você acertou <strong>${score} de ${quizQuestions.length}</strong> questões.</p><button id="restart">Refazer quiz</button>`;document.getElementById("restart").onclick=()=>{i=0;score=0;render()};return;}
  const q=quizQuestions[i];el.innerHTML=`<p><strong>Pergunta ${i+1} de ${quizQuestions.length}</strong></p><h2>${q.q}</h2><div>${q.a.map((a,n)=>`<button type="button" data-answer="${n}">${a}</button>`).join("")}</div><p id="feedback" aria-live="polite"></p>`;
  el.querySelectorAll("[data-answer]").forEach(b=>b.addEventListener("click",()=>{const n=Number(b.dataset.answer);const ok=n===q.correct;if(ok)score++;el.querySelectorAll("button").forEach(x=>x.disabled=true);el.querySelector("#feedback").innerHTML=`<strong>${ok?"Muito bem!":"Vamos aprender:"}</strong> ${q.why} <button id="next">${i===quizQuestions.length-1?"Ver resultado":"Próxima"}</button>`;document.getElementById("next").onclick=()=>{i++;render()}}));
 }
 render();
});