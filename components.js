document.addEventListener("DOMContentLoaded",()=>{
 const header=document.getElementById("header");
 const footer=document.getElementById("footer");
 const path=location.pathname;
 const back="../../grupos.html";
 if(header) header.innerHTML=`<div class="g4-header-inner">
   <a class="g4-back" href="${back}" aria-label="Voltar para os grupos do ConectaGerações">← <span>Voltar aos grupos</span></a>
   <a class="g4-brand" href="index.html">Pare, Pense e Confira!</a>
   <nav class="g4-nav" aria-label="Navegação do projeto">
    <a href="index.html">Início</a><a href="golpes.html">Exemplos de golpes</a><a href="prevencao.html">Prevenção</a><a href="quiz.html">Quiz</a><a href="sobre.html">Sobre</a>
   </nav></div>`;
 if(footer) footer.innerHTML=`<div class="footer__inner"><div><strong>Pare, Pense e Confira!</strong><p>Guia educativo sobre golpes por SMS e e-mail.</p></div><a class="g4-footer-back" href="${back}">← Voltar ao ConectaGerações</a></div>`;
});
