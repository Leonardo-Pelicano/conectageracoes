const questions = [
  {
    text: "Uma pessoa compartilhou um conteúdo para humilhar um colega. O que fazer?",
    answers: [
      ["Compartilhar também para que outras pessoas vejam.", false],
      ["Não compartilhar e avisar um adulto de confiança.", true],
      ["Fazer uma publicação para atacar quem começou.", false]
    ],
    correctFeedback: "Boa escolha. Não espalhar o conteúdo e buscar apoio ajuda a interromper o ciclo.",
    wrongFeedback: "Essa atitude pode aumentar o problema. Evite compartilhar o conteúdo e procure apoio."
  },
  {
    text: "Você recebeu uma mensagem ofensiva. Qual atitude é mais adequada?",
    answers: [
      ["Responder imediatamente com outra ofensa.", false],
      ["Ignorar sempre e nunca contar para ninguém.", false],
      ["Guardar o registro e procurar ajuda de um adulto.", true]
    ],
    correctFeedback: "Isso. Guardar registros e buscar apoio pode ajudar a compreender e enfrentar a situação.",
    wrongFeedback: "Uma atitude mais segura é guardar o registro e procurar uma pessoa de confiança."
  },
  {
    text: "Qual atitude contribui para um ambiente online mais seguro?",
    answers: [
      ["Pensar antes de publicar e respeitar outras pessoas.", true],
      ["Curtir conteúdos que ridicularizam alguém.", false],
      ["Excluir alguém de um grupo para humilhar.", false]
    ],
    correctFeedback: "Certo. Comunicação responsável e respeito são parte de um comportamento online seguro.",
    wrongFeedback: "O comportamento online seguro começa pelo respeito e pela responsabilidade antes de publicar ou compartilhar."
  }
];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let current = 0;
let score = 0;
let answered = false;
let finished = false;

const quizEl = document.querySelector("#quiz");
const questionEl = document.querySelector("#question");
const questionTag = document.querySelector("#questionTag");
const answersEl = document.querySelector("#answers");
const feedbackEl = document.querySelector("#feedback");
const nextBtn = document.querySelector("#nextBtn");
const reviewLink = document.querySelector("#reviewLink");
const progressBar = document.querySelector("#progressBar");
const progress = document.querySelector(".progress");
const progressLabel = document.querySelector("#progressLabel");
const scorePill = document.querySelector("#scorePill");

function updateProgress(value, label) {
  progressBar.style.width = `${(value / questions.length) * 100}%`;
  progress.setAttribute("aria-valuenow", value);
  progress.setAttribute("aria-valuetext", label);
  progressLabel.textContent = label;
}

// Move o foco para um elemento sem provocar "salto" de rolagem e garante que o jogo fique visível.
function focusAndReveal(element) {
  element.focus({ preventScroll: true });
  quizEl.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
}

function renderQuestion({ moveFocus = false } = {}) {
  const item = questions[current];
  answered = false;
  finished = false;
  questionEl.textContent = item.text;
  questionTag.textContent = `PERGUNTA ${current + 1}`;
  answersEl.innerHTML = "";
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  nextBtn.classList.add("hidden");
  reviewLink.classList.add("hidden");
  nextBtn.textContent = current === questions.length - 1 ? "Ver resultado →" : "Próxima pergunta →";

  updateProgress(current + 1, `Pergunta ${current + 1} de ${questions.length}`);
  scorePill.textContent = `Pontos: ${score}`;

  item.answers.forEach(([text, correct]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer";
    button.dataset.correct = String(correct);
    const label = document.createElement("span");
    label.textContent = text;
    button.appendChild(label);
    button.addEventListener("click", () => selectAnswer(button, correct));
    answersEl.appendChild(button);
  });

  if (moveFocus) focusAndReveal(questionEl);
}

function addStatus(button, text) {
  const status = document.createElement("span");
  status.className = "answer-status";
  status.textContent = text;
  button.appendChild(status);
}

function selectAnswer(button, correct) {
  if (answered) return;
  answered = true;

  const buttons = [...document.querySelectorAll(".answer")];
  // aria-disabled (em vez de disabled) mantém os botões legíveis por leitores de tela e não perde o foco.
  buttons.forEach((answerButton) => answerButton.setAttribute("aria-disabled", "true"));

  if (correct) {
    score++;
    button.classList.add("correct");
    addStatus(button, "✓ Resposta correta");
    feedbackEl.textContent = questions[current].correctFeedback;
    feedbackEl.classList.add("ok");
  } else {
    button.classList.add("wrong");
    addStatus(button, "✗ Não foi dessa vez");
    // Mostra qual era a atitude mais segura: o erro também ensina.
    const right = buttons.find((answerButton) => answerButton.dataset.correct === "true");
    right.classList.add("show-correct");
    addStatus(right, "✓ Atitude mais segura");
    feedbackEl.textContent = questions[current].wrongFeedback;
    feedbackEl.classList.add("no");
  }

  scorePill.textContent = `Pontos: ${score}`;
  nextBtn.classList.remove("hidden");
  // O feedback recebe o foco: o leitor de tela o anuncia e o próximo Tab já cai em "Próxima pergunta".
  focusAndReveal(feedbackEl);
}

function finishGame() {
  finished = true;
  questionTag.textContent = "ATIVIDADE CONCLUÍDA";
  questionEl.textContent = `Resultado: ${score} de ${questions.length}`;
  answersEl.innerHTML = "";
  feedbackEl.className = "feedback ok";
  feedbackEl.textContent = score === questions.length
    ? "Excelente! Você reconheceu atitudes mais seguras para o ambiente online."
    : "Bom começo! Você pode revisar as orientações do CyberSafe e tentar novamente.";
  nextBtn.classList.remove("hidden");
  nextBtn.textContent = "Refazer jogo";
  reviewLink.classList.remove("hidden");
  updateProgress(questions.length, "Atividade concluída");
  focusAndReveal(questionEl);
}

function restartGame() {
  current = 0;
  score = 0;
  renderQuestion({ moveFocus: true });
}

nextBtn.addEventListener("click", () => {
  if (finished) return restartGame();
  if (!answered) return;
  if (current < questions.length - 1) {
    current++;
    renderQuestion({ moveFocus: true });
  } else {
    finishGame();
  }
});

renderQuestion();

/* ---------- Menu ---------- */
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

function setMenu(open, { returnFocus = false } = {}) {
  nav.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  if (!open && returnFocus) menuToggle.focus();
}

menuToggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

// Esc fecha o menu e devolve o foco ao botão; clique fora também fecha.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("open")) setMenu(false, { returnFocus: true });
});
document.addEventListener("click", (event) => {
  if (nav.classList.contains("open") && !nav.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false);
});
window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => { if (event.matches) setMenu(false); });

/* ---------- Item ativo do menu (scrollspy) ---------- */
const navLinks = [...document.querySelectorAll(".main-nav a")];
const sections = [...document.querySelectorAll("main section[id]")];

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    // Seções sem item próprio no menu (ex.: "Perfil dos envolvidos") mantêm o último item ativo.
    if (!navLinks.some((link) => link.getAttribute("href") === `#${entry.target.id}`)) return;
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${entry.target.id}`;
      link.classList.toggle("active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  });
}, { rootMargin: "-35% 0px -55% 0px" });

sections.forEach((section) => observer.observe(section));

/* ---------- Animação de entrada (só com JS; respeita movimento reduzido via CSS) ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
