document.addEventListener("DOMContentLoaded",()=>{
 const root=document.documentElement;
 let scale=Number(localStorage.getItem("g4-font-scale")||1);
 root.style.fontSize=(scale*100)+"%";
 document.querySelectorAll("[data-font-increase]").forEach(b=>b.addEventListener("click",()=>{scale=Math.min(1.3,scale+.1);root.style.fontSize=(scale*100)+"%";localStorage.setItem("g4-font-scale",scale)}));
 document.querySelectorAll("[data-font-decrease]").forEach(b=>b.addEventListener("click",()=>{scale=Math.max(.9,scale-.1);root.style.fontSize=(scale*100)+"%";localStorage.setItem("g4-font-scale",scale)}));
});
