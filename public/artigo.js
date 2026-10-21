(function () {
  "use strict";

  var PASSPORT_KEY = "cg-passaporte";
  var QUIZ_KEY = "cg-quiz-melhor";
  var STAMPS = ["personas", "ferramentas", "filtro", "semaforo", "regra", "quiz"];

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      return;
    }
  }

  function readRaw(key) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  var earned = (function () {
    var saved = readJSON(PASSPORT_KEY, []);
    return Array.isArray(saved)
      ? saved.filter(function (name) { return STAMPS.indexOf(name) > -1; })
      : [];
  })();

  function renderPassport() {
    var count = document.getElementById("passaporte-contagem");
    var bar = document.getElementById("passaporte-barra");
    var done = document.getElementById("passaporte-final");
    document.querySelectorAll("[data-stamp]").forEach(function (item) {
      var has = earned.indexOf(item.getAttribute("data-stamp")) > -1;
      item.classList.toggle("earned", has);
      var state = item.querySelector(".stamp-state");
      if (state) state.textContent = has ? "Conquistado" : "A conquistar";
    });
    if (count) count.textContent = earned.length + " de " + STAMPS.length + " carimbos";
    if (bar) bar.style.width = Math.round((earned.length / STAMPS.length) * 100) + "%";
    if (done) done.classList.toggle("show", earned.length === STAMPS.length);
  }

  function award(name) {
    if (earned.indexOf(name) > -1) return;
    earned.push(name);
    writeJSON(PASSPORT_KEY, earned);
    renderPassport();
  }

  function initPassport() {
    var reset = document.getElementById("passaporte-zerar");
    if (reset) {
      reset.addEventListener("click", function () {
        earned = [];
        writeJSON(PASSPORT_KEY, earned);
        renderPassport();
      });
    }
    renderPassport();
  }

  function initPersonas() {
    var cards = document.querySelectorAll("[data-persona]");
    var seen = {};
    cards.forEach(function (card) {
      function flip() {
        var flipped = card.classList.toggle("flipped");
        card.setAttribute("aria-pressed", String(flipped));
        if (flipped) {
          seen[card.getAttribute("data-persona")] = true;
          if (Object.keys(seen).length === cards.length) award("personas");
        }
      }
      card.addEventListener("click", flip);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          flip();
        }
      });
    });
  }

  function updatePrefs() {
    var font = document.getElementById("pref-fonte");
    var contrast = document.getElementById("pref-contraste");
    var scale = parseFloat(readRaw("cg-font-scale")) || 1;
    if (font) font.textContent = Math.round(scale * 100) + "%";
    if (contrast) contrast.textContent = readRaw("cg-high-contrast") === "true" ? "Ligado" : "Desligado";
  }

  function pressHeader(id) {
    var control = document.getElementById(id);
    if (control) control.click();
    updatePrefs();
  }

  function initTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab-btn"));
    if (!tabs.length) return;
    var visited = {};

    function select(tab, focus) {
      tabs.forEach(function (t) {
        var active = t === tab;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        t.setAttribute("aria-selected", String(active));
        t.tabIndex = active ? 0 : -1;
        if (panel) {
          panel.classList.toggle("active", active);
          panel.hidden = !active;
        }
      });
      if (focus) tab.focus();
      visited[tab.id] = true;
      if (Object.keys(visited).length === tabs.length) award("ferramentas");
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var target = null;
        if (e.key === "ArrowRight") target = tabs[(index + 1) % tabs.length];
        if (e.key === "ArrowLeft") target = tabs[(index - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") target = tabs[0];
        if (e.key === "End") target = tabs[tabs.length - 1];
        if (target) {
          e.preventDefault();
          select(target, true);
        }
      });
    });

    visited[tabs[0].id] = true;

    var bindings = {
      "demo-fonte-menos": "font-decrease",
      "demo-fonte-mais": "font-increase",
      "demo-contraste": "contrast-toggle",
      "pref-aumentar": "font-increase",
      "pref-contraste-btn": "contrast-toggle"
    };
    Object.keys(bindings).forEach(function (id) {
      var btn = document.getElementById(id);
      if (btn) btn.addEventListener("click", function () { pressHeader(bindings[id]); });
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("#font-increase, #font-decrease, #contrast-toggle")) {
        window.setTimeout(updatePrefs, 0);
      }
    });
    updatePrefs();
  }

  var ICONS = {
    info: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>',
    ok: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',
    bad: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/></svg>',
    warn: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/></svg>'
  };

  function inspectText(text) {
    var found = { cpf: false, card: false };
    var runs = text.match(/\d[\d .\-]*\d/g) || [];
    runs.forEach(function (run) {
      var digits = run.replace(/\D/g, "");
      if (digits.length === 11 && /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(run)) {
        found.cpf = true;
      } else if (digits.length >= 13 && digits.length <= 19) {
        found.card = true;
      }
    });
    return found;
  }

  function initFilter() {
    var field = document.getElementById("filtro-texto");
    if (!field) return;
    var counter = document.getElementById("filtro-contador");
    var verdict = document.getElementById("filtro-veredito");
    var dots = document.getElementById("filtro-tentativas");
    var send = document.getElementById("filtro-enviar");
    var restart = document.getElementById("filtro-reiniciar");
    var limitNote = document.getElementById("filtro-limite");
    var MAX = 5;
    var attempts = 0;

    var examples = {
      seguro: "Olá! Gostaria de saber mais sobre as oficinas para a minha avó.",
      cpf: "Meu CPF é 123.456.789-09, vocês podem me ajudar?",
      cartao: "O número do meu cartão é 4111 1111 1111 1111."
    };

    function show(kind, title, text) {
      verdict.className = "verdict" + (kind === "info" ? "" : " " + kind);
      var icon = kind === "ok" ? ICONS.ok : kind === "bad" ? ICONS.bad : kind === "lock" ? ICONS.warn : ICONS.info;
      verdict.innerHTML = icon + "<p><strong>" + title + "</strong>" + text + "</p>";
    }

    function describe(found) {
      if (found.cpf && found.card) return "um CPF e um número de cartão";
      if (found.cpf) return "um número que parece CPF";
      return "um número que parece cartão de crédito";
    }

    function renderDots() {
      var items = dots.querySelectorAll("i");
      items.forEach(function (dot, i) { dot.classList.toggle("used", i < attempts); });
      var left = MAX - attempts;
      dots.setAttribute("aria-label", left + (left === 1 ? " envio restante" : " envios restantes"));
    }

    function update() {
      counter.textContent = field.value.length + " de " + field.maxLength + " caracteres";
    }

    field.addEventListener("input", update);

    document.querySelectorAll("[data-exemplo]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        field.value = examples[btn.getAttribute("data-exemplo")] || "";
        update();
        field.focus();
        show("info", "Exemplo pronto.", " Agora clique em enviar para ver o que acontece.");
      });
    });

    send.addEventListener("click", function () {
      var text = field.value.trim();
      if (!text) {
        show("info", "A mensagem está vazia.", " Escreva algo ou escolha um exemplo.");
        field.focus();
        return;
      }
      attempts++;
      renderDots();
      var found = inspectText(text);
      if (found.cpf || found.card) {
        show("bad", "Mensagem recusada.", " Encontramos " + describe(found) + ". O ConectaGerações nunca solicita essas informações. Apague o número e tente de novo.");
        award("filtro");
      } else {
        show("ok", "Mensagem aceita.", " Era só uma simulação: nada foi enviado de verdade.");
      }
      if (attempts >= MAX) {
        send.disabled = true;
        restart.hidden = false;
        limitNote.hidden = false;
      }
    });

    restart.addEventListener("click", function () {
      attempts = 0;
      renderDots();
      send.disabled = false;
      restart.hidden = true;
      limitNote.hidden = true;
      show("info", "Simulação reiniciada.", " Você tem 5 envios novamente.");
    });

    renderDots();
    update();
  }

  function initSemaforo() {
    var root = document.getElementById("semaforo-jogo");
    if (!root) return;

    var SITUATIONS = [
      { t: "Você está fazendo uma lição online e se sente tranquilo.", c: "verde", e: "Tudo bem! Aprender e se divertir sem desconforto é uma situação verde." },
      { t: "Chegou um link de prêmio de alguém que você não conhece, e você ficou em dúvida.", c: "amarelo", e: "Na dúvida, pare e pergunte a um adulto antes de clicar." },
      { t: "Um colega manda mensagens ofendendo você e não para.", c: "vermelho", e: "Ofensa é vermelho: saia da conversa e peça ajuda a um adulto." },
      { t: "Você conversa por vídeo com sua avó e está se divertindo.", c: "verde", e: "Conversar com quem você ama e se sentir bem é verde." },
      { t: "Apareceu uma janela pedindo seu nome completo e o nome da sua escola.", c: "amarelo", e: "Informações pessoais são só suas. Pare e pergunte a um adulto." },
      { t: "Alguém pede um segredo e diz que você não pode contar a ninguém.", c: "vermelho", e: "Pressão para guardar segredo é vermelho: saia e conte a um adulto de confiança." }
    ];
    var LABELS = { verde: "Tudo bem", amarelo: "Pare e pergunte", vermelho: "Saia e peça ajuda" };
    var NAMES = { verde: "Verde", amarelo: "Amarelo", vermelho: "Vermelho" };

    var order, index, score, answered;

    function start() {
      order = shuffle(SITUATIONS);
      index = 0;
      score = 0;
      answered = false;
      renderRound();
    }

    function renderRound() {
      var item = order[index];
      var buttons = ["verde", "amarelo", "vermelho"].map(function (cor) {
        return '<button class="light-btn ' + cor + '" type="button" data-cor="' + cor + '">' +
          '<span class="light-dot"></span><span>' + NAMES[cor] + '</span><small>' + LABELS[cor] + '</small></button>';
      }).join("");
      root.innerHTML =
        '<div class="round-meta"><span>Situação ' + (index + 1) + ' de ' + order.length + '</span><span>Acertos: ' + score + '</span></div>' +
        '<p class="situation" id="semaforo-situacao" tabindex="-1">' + item.t + '</p>' +
        '<div class="light-row" role="group" aria-labelledby="semaforo-situacao">' + buttons + '</div>' +
        '<div class="feedback" id="semaforo-retorno" aria-live="polite"></div>' +
        '<div class="track-actions"><button class="btn btn-primary btn-small" type="button" id="semaforo-proximo" hidden>' +
        (index === order.length - 1 ? "Ver resultado" : "Próxima situação") + '</button></div>';
      answered = false;
      root.querySelectorAll(".light-btn").forEach(function (btn) {
        btn.addEventListener("click", function () { answer(btn.getAttribute("data-cor")); });
      });
      document.getElementById("semaforo-proximo").addEventListener("click", next);
    }

    function answer(color) {
      if (answered) return;
      answered = true;
      var item = order[index];
      var right = color === item.c;
      if (right) score++;
      root.querySelectorAll(".light-btn").forEach(function (btn) {
        btn.disabled = true;
        var cor = btn.getAttribute("data-cor");
        if (cor === item.c) btn.classList.add("answer");
        if (cor === color) btn.classList.add("picked");
      });
      var box = document.getElementById("semaforo-retorno");
      box.className = "feedback show " + (right ? "right" : "wrong");
      box.innerHTML = (right ? ICONS.ok : ICONS.warn) +
        "<p>" + (right ? "Acertou! " : "Quase! A cor certa era " + NAMES[item.c].toLowerCase() + ". ") + item.e + "</p>";
      var nextBtn = document.getElementById("semaforo-proximo");
      nextBtn.hidden = false;
      nextBtn.focus({ preventScroll: true });
      nextBtn.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    function next() {
      index++;
      if (index >= order.length) {
        finish();
      } else {
        renderRound();
        var situation = document.getElementById("semaforo-situacao");
        situation.focus({ preventScroll: true });
        situation.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    function finish() {
      var msg = score === order.length
        ? "Perfeito! Você já sabe usar o semáforo da internet."
        : score >= order.length - 2
          ? "Muito bem! Quase tudo certo. Que tal tentar de novo?"
          : "Bom começo! Jogue outra vez para fixar as cores.";
      root.innerHTML =
        '<div class="result-box"><div class="big">' + score + ' de ' + order.length + '</div><p>' + msg + '</p>' +
        '<div class="track-actions" style="justify-content:center;"><button class="btn btn-primary btn-small" type="button" id="semaforo-repetir">Jogar de novo</button></div></div>';
      document.getElementById("semaforo-repetir").addEventListener("click", start);
      award("semaforo");
    }

    start();
  }

  function initRegra() {
    var root = document.getElementById("regra-jogo");
    if (!root) return;

    var STEPS = [
      { t: "Pare", d: "Respire e não responda com pressa.", h: "Antes de tudo, respire e não responda com pressa." },
      { t: "Confira", d: "Veja quem está pedindo e se faz sentido.", h: "Depois, veja quem está pedindo e se tudo faz sentido." },
      { t: "Confirme", d: "Fale por um canal que você já conhecia.", h: "Em seguida, fale com a pessoa ou o banco por um canal que você já conhecia." },
      { t: "Proteja", d: "Guarde senhas e códigos só para você.", h: "Por fim, proteja suas senhas e códigos: eles são só seus." }
    ];

    var next, pool;

    function start() {
      next = 0;
      do {
        pool = shuffle(STEPS.map(function (s, i) { return i; }));
      } while (pool.every(function (v, i) { return v === i; }));
      render();
    }

    function render() {
      var slots = STEPS.map(function (s, i) {
        var filled = i < next;
        return '<li class="order-slot' + (filled ? ' filled' : '') + '"><span class="slot-num">' + (i + 1) + '</span>' +
          (filled ? '<div><strong>' + s.t + '</strong><span>' + s.d + '</span></div>' : '<span>Passo ' + (i + 1) + '</span>') + '</li>';
      }).join("");
      var cards = pool.map(function (stepIndex) {
        return '<button class="order-card" type="button" data-i="' + stepIndex + '"' + (stepIndex < next ? ' disabled' : '') + '>' + STEPS[stepIndex].t + '</button>';
      }).join("");
      var finished = next >= STEPS.length;
      root.innerHTML =
        '<ol class="order-slots">' + slots + '</ol>' +
        (finished ? '' : '<div class="order-pool">' + cards + '</div>') +
        '<div class="feedback' + (finished ? ' show right' : '') + '" id="regra-retorno" aria-live="polite">' +
        (finished ? ICONS.ok + '<p>Regra de Ouro completa! Repita esses quatro passos sempre que alguém pedir dinheiro ou dados.</p>' : '') + '</div>' +
        (finished ? '<div class="track-actions"><button class="btn btn-green btn-small" type="button" id="regra-repetir">Jogar de novo</button></div>' : '');
      root.querySelectorAll(".order-card").forEach(function (card) {
        card.addEventListener("click", function () { choose(card); });
      });
      var again = document.getElementById("regra-repetir");
      if (again) again.addEventListener("click", start);
    }

    function choose(card) {
      var picked = parseInt(card.getAttribute("data-i"), 10);
      if (picked === next) {
        next++;
        render();
        var first = root.querySelector(".order-card:not(:disabled)");
        if (first) first.focus({ preventScroll: true });
        if (next >= STEPS.length) {
          award("regra");
        } else {
          var box = document.getElementById("regra-retorno");
          box.className = "feedback show right";
          box.innerHTML = ICONS.ok + "<p>Isso mesmo! Qual vem agora?</p>";
        }
      } else {
        card.classList.add("shake");
        window.setTimeout(function () { card.classList.remove("shake"); }, 400);
        var warn = document.getElementById("regra-retorno");
        warn.className = "feedback show wrong";
        warn.innerHTML = ICONS.warn + "<p>Ainda não é esse. Dica: " + STEPS[next].h + "</p>";
      }
    }

    start();
  }

  var QUIZ = {
    explorador: {
      nome: "Modo Explorador",
      publico: "Para crianças e famílias",
      perguntas: [
        { p: "O que significa a cor verde no semáforo da internet?", o: ["Situação confortável: posso continuar", "Preciso sair correndo", "Devo pagar alguma coisa"], c: 0, e: "Verde é quando você está aprendendo, se divertindo e se sentindo bem." },
        { p: "Em qual cor você deve parar e perguntar a um adulto quando fica em dúvida?", o: ["Amarelo", "Verde", "Nenhuma, é só continuar"], c: 0, e: "Amarelo quer dizer: pare e pergunte. Na dúvida, um adulto de confiança ajuda." },
        { p: "Alguém ofende ou pressiona você na internet. O que fazer?", o: ["Sair da conversa e pedir ajuda a um adulto", "Responder do mesmo jeito", "Guardar segredo e não contar a ninguém"], c: 0, e: "Ofensa e pressão são vermelho: saia e peça ajuda." },
        { p: "Algo deu errado online. Qual é o melhor caminho?", o: ["Parar a conversa, guardar as provas e falar com um adulto", "Apagar tudo bem rápido", "Entrar em outro grupo sem contar a ninguém"], c: 0, e: "Guardar as provas ajuda os adultos a resolverem o problema." },
        { p: "Pedir ajuda quando algo incomoda é...", o: ["Sempre certo, e você não vai se meter em problemas", "Motivo de castigo", "Algo que é melhor evitar"], c: 0, e: "Contar para um adulto nunca é errado." }
      ]
    },
    guardiao: {
      nome: "Modo Guardião",
      publico: "Para pessoas idosas e adultos",
      perguntas: [
        { p: "Quais são os quatro passos da Regra de Ouro, em ordem?", o: ["Pare, Confira, Confirme, Proteja", "Clique, Pague, Confie, Espere", "Responda, Confira, Pague, Proteja"], c: 0, e: "Pare, Confira, Confirme e Proteja: nessa ordem, antes de pagar ou enviar dados." },
        { p: "Chega uma mensagem de um “filho” com número novo pedindo dinheiro com urgência. Que golpe é esse?", o: ["Falso familiar", "Falsa central", "Boleto alterado"], c: 0, e: "No falso familiar, o golpista finge ser alguém da família e cria pressa." },
        { p: "Alguém diz ser do seu banco e pede sua senha por telefone. O que fazer?", o: ["Desligar e ligar para o banco por um canal oficial", "Passar a senha para resolver logo", "Pedir o número pessoal da pessoa"], c: 0, e: "Esse é o golpe da falsa central. Banco nenhum pede senha por telefone." },
        { p: "Você caiu em um golpe. Qual é um dos primeiros passos?", o: ["Cortar o contato com o golpista", "Pedir ajuda ao próprio golpista", "Apagar todas as conversas"], c: 0, e: "Corte o contato, fale com o banco, troque as senhas, guarde as evidências e registre a ocorrência." },
        { p: "O ConectaGerações pede CPF ou número de cartão?", o: ["Nunca", "Sempre, para fazer cadastro", "Só em promoções"], c: 0, e: "O projeto nunca solicita essas informações, nem senhas ou pagamentos." }
      ]
    },
    equipe: {
      nome: "Modo Projeto",
      publico: "Sobre como o site foi feito",
      perguntas: [
        { p: "Para quais dois públicos o ConectaGerações foi criado?", o: ["Crianças e pessoas idosas", "Estudantes e professores", "Empresas e investidores"], c: 0, e: "O foco são os dois grupos que mais enfrentam barreiras no mundo digital." },
        { p: "Quais controles de acessibilidade aparecem no topo do site?", o: ["Tamanho da letra (A- e A+) e alto contraste", "Tradução e modo escuro", "Leitor de voz e zoom automático"], c: 0, e: "Os botões A-, A+ e o alto contraste ficam visíveis em todas as páginas." },
        { p: "Como o projeto começou, em 04 de setembro de 2026?", o: ["Com o termo de abertura", "Com a entrega final", "Com os testes de usabilidade"], c: 0, e: "O termo de abertura definiu os objetivos e o escopo. Depois vieram as sprints 1, 2 e 3, o back-end e esta página." },
        { p: "Onde ficam guardadas suas escolhas de tamanho de letra e contraste?", o: ["No próprio navegador (localStorage)", "Em um banco de dados na nuvem", "Em um arquivo enviado por e-mail"], c: 0, e: "Por ficarem no navegador, as preferências valem em todas as páginas do site." },
        { p: "O que será testado depois da entrega do MVP?", o: ["Se idosos usam o fluxo de emergência sozinhos e se crianças explicam as cores do semáforo", "Quantos anúncios o site consegue exibir", "A velocidade de um aplicativo nativo"], c: 0, e: "Os testes de usabilidade vão confirmar se as ideias de design funcionam na prática." }
      ]
    }
  };

  function initQuiz() {
    var root = document.getElementById("quiz-area");
    if (!root) return;
    var best = readJSON(QUIZ_KEY, {});
    var modeKey, questions, index, score, locked;

    function menu() {
      var html = '<div class="quiz-modes">' + Object.keys(QUIZ).map(function (key) {
        var mode = QUIZ[key];
        var record = typeof best[key] === "number" ? '<span class="mode-best">Melhor resultado: ' + best[key] + ' de ' + mode.perguntas.length + '</span>' : "";
        return '<button class="mode-btn" type="button" data-modo="' + key + '"><strong>' + mode.nome + '</strong><span>' + mode.publico + '</span>' + record + '</button>';
      }).join("") + '</div>';
      root.innerHTML = html;
      root.querySelectorAll("[data-modo]").forEach(function (btn) {
        btn.addEventListener("click", function () { begin(btn.getAttribute("data-modo")); });
      });
    }

    function begin(key) {
      modeKey = key;
      questions = shuffle(QUIZ[key].perguntas);
      index = 0;
      score = 0;
      question();
    }

    function question() {
      var item = questions[index];
      var options = shuffle(item.o.map(function (text, i) { return { t: text, ok: i === item.c }; }));
      var letters = ["A", "B", "C", "D"];
      locked = false;
      root.innerHTML =
        '<div class="quiz-bar" aria-hidden="true"><span style="width:' + Math.round((index / questions.length) * 100) + '%"></span></div>' +
        '<div class="quiz-meta"><span>' + QUIZ[modeKey].nome + ' · Pergunta ' + (index + 1) + ' de ' + questions.length + '</span><span>Acertos: ' + score + '</span></div>' +
        '<h3 class="quiz-q" id="quiz-pergunta" tabindex="-1">' + item.p + '</h3>' +
        '<div class="quiz-options" role="group" aria-labelledby="quiz-pergunta">' + options.map(function (opt, i) {
          return '<button class="quiz-option" type="button" data-ok="' + opt.ok + '"><span class="opt-mark">' + letters[i] + '</span><span>' + opt.t + '</span></button>';
        }).join("") + '</div>' +
        '<div class="quiz-explain" id="quiz-explica"><p></p></div>' +
        '<button class="btn btn-primary quiz-next" type="button" id="quiz-proxima">' + (index === questions.length - 1 ? "Ver resultado" : "Próxima pergunta") + '</button>';
      root.querySelectorAll(".quiz-option").forEach(function (btn) {
        btn.addEventListener("click", function () { pick(btn, item); });
      });
      document.getElementById("quiz-proxima").addEventListener("click", advance);
      var heading = document.getElementById("quiz-pergunta");
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    function pick(btn, item) {
      if (locked) return;
      locked = true;
      var right = btn.getAttribute("data-ok") === "true";
      if (right) score++;
      root.querySelectorAll(".quiz-option").forEach(function (opt) {
        opt.disabled = true;
        var ok = opt.getAttribute("data-ok") === "true";
        var mark = opt.querySelector(".opt-mark");
        if (ok) {
          opt.classList.add("correct");
          mark.textContent = "✓";
        } else if (opt === btn) {
          opt.classList.add("incorrect");
          mark.textContent = "✕";
        }
      });
      var box = document.getElementById("quiz-explica");
      box.querySelector("p").innerHTML = "<strong>" + (right ? "Muito bem!" : "Não foi dessa vez.") + "</strong> " + item.e;
      box.classList.add("show");
      var nextBtn = document.getElementById("quiz-proxima");
      nextBtn.classList.add("show");
      nextBtn.focus({ preventScroll: true });
      nextBtn.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    function advance() {
      index++;
      if (index >= questions.length) {
        end();
      } else {
        question();
      }
    }

    function end() {
      var total = questions.length;
      var ratio = score / total;
      var title = ratio === 1 ? "Resultado perfeito!" : ratio >= 0.6 ? "Muito bem!" : "Bom começo!";
      var text = ratio === 1
        ? "Você acertou tudo. Que tal desafiar alguém da sua família?"
        : ratio >= 0.6
          ? "Você já sabe bastante. Jogue de novo para chegar ao resultado perfeito."
          : "Navegue pelas outras seções, aprenda mais e tente de novo.";
      if (typeof best[modeKey] !== "number" || score > best[modeKey]) {
        best[modeKey] = score;
        writeJSON(QUIZ_KEY, best);
      }
      root.innerHTML =
        '<div class="quiz-end">' +
        '<svg class="medal" viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="44" fill="#FEF5E2"/><circle cx="48" cy="48" r="32" fill="#F9A825"/><path d="m48 28 6.2 12.6 13.8 2-10 9.8 2.4 13.8L48 59.6l-12.4 6.6L38 52.4l-10-9.8 13.8-2Z" fill="#FFFFFF"/></svg>' +
        '<h3 id="quiz-fim" tabindex="-1">' + title + '</h3>' +
        '<p class="score">' + score + ' de ' + total + '</p>' +
        '<p>' + text + '</p>' +
        '<div class="track-actions"><button class="btn btn-primary" type="button" id="quiz-repetir">Jogar de novo</button>' +
        '<button class="btn btn-outline" type="button" id="quiz-trocar">Escolher outro modo</button></div></div>';
      document.getElementById("quiz-repetir").addEventListener("click", function () { begin(modeKey); });
      document.getElementById("quiz-trocar").addEventListener("click", menu);
      var finish = document.getElementById("quiz-fim");
      finish.focus({ preventScroll: true });
      finish.scrollIntoView({ block: "nearest", behavior: "smooth" });
      award("quiz");
    }

    menu();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initPassport();
    initPersonas();
    initTabs();
    initFilter();
    initSemaforo();
    initRegra();
    initQuiz();
  });
})();
