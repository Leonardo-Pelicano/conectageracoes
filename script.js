/* =========================================================
   ConectaGerações — script.js
   Interatividade: acessibilidade, menu, accordions, modais,
   combinados de segurança, animações de entrada.
   ========================================================= */
(function () {
  "use strict";

  var FONT_KEY = "cg-font-scale";
  var CONTRAST_KEY = "cg-high-contrast";
  var MIN_SCALE = 0.85;
  var MAX_SCALE = 1.4;
  var STEP = 0.1;

  /* ---------- Acessibilidade: fonte ---------- */
  function applyFontScale(scale) {
    scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
    document.documentElement.style.setProperty("--font-scale", scale);
    localStorage.setItem(FONT_KEY, String(scale));
    return scale;
  }

  function initFontControls() {
    var saved = parseFloat(localStorage.getItem(FONT_KEY)) || 1;
    var scale = applyFontScale(saved);

    var dec = document.getElementById("font-decrease");
    var inc = document.getElementById("font-increase");

    if (dec) {
      dec.addEventListener("click", function () {
        scale = applyFontScale(scale - STEP);
      });
    }
    if (inc) {
      inc.addEventListener("click", function () {
        scale = applyFontScale(scale + STEP);
      });
    }
  }

  /* ---------- Acessibilidade: alto contraste ---------- */
  function initContrastControl() {
    var toggle = document.getElementById("contrast-toggle");
    var saved = localStorage.getItem(CONTRAST_KEY) === "true";
    document.body.classList.toggle("high-contrast", saved);
    if (toggle) toggle.setAttribute("aria-pressed", String(saved));

    if (toggle) {
      toggle.addEventListener("click", function () {
        var active = document.body.classList.toggle("high-contrast");
        toggle.setAttribute("aria-pressed", String(active));
        localStorage.setItem(CONTRAST_KEY, String(active));
      });
    }
  }

  /* ---------- Menu mobile ---------- */
  function initMobileNav() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Accordion genérico (materiais, dúvidas) ---------- */
  function initAccordions() {
    document.querySelectorAll(".accordion-trigger").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        var isOpen = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!isOpen));
        if (panel) panel.classList.toggle("open", !isOpen);
      });
    });
  }

  /* ---------- Cards "combinados de segurança" (clicáveis, expandem detalhe) ---------- */
  function initCombinados() {
    document.querySelectorAll(".combinado-card").forEach(function (card) {
      function toggle() {
        var isOpen = card.getAttribute("aria-expanded") === "true";
        card.setAttribute("aria-expanded", String(!isOpen));
      }
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* ---------- Modais (checklist, etc.) ---------- */
  function initModals() {
    document.querySelectorAll("[data-modal-open]").forEach(function (opener) {
      opener.addEventListener("click", function () {
        var modal = document.getElementById(opener.getAttribute("data-modal-open"));
        if (!modal) return;
        modal.classList.add("open");
        var closeBtn = modal.querySelector(".modal-close");
        if (closeBtn) closeBtn.focus();
        document.body.style.overflow = "hidden";
      });
    });
    document.querySelectorAll(".modal-overlay").forEach(function (overlay) {
      function close() {
        overlay.classList.remove("open");
        document.body.style.overflow = "";
      }
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) close();
      });
      overlay.querySelectorAll(".modal-close").forEach(function (btn) {
        btn.addEventListener("click", close);
      });
      overlay.addEventListener("keydown", function (e) {
        if (e.key === "Escape") close();
      });
    });
  }

  /* ---------- Animação leve de entrada (IntersectionObserver) ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Sombra no cabeçalho ao rolar ---------- */
  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function update() {
      header.classList.toggle("scrolled", window.scrollY > 8);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ---------- Checklists com checkbox funcional + progresso ---------- */
  function initChecklists() {
    document.querySelectorAll("[data-checklist]").forEach(function (list) {
      var boxes = list.querySelectorAll('input[type="checkbox"]');
      var progressText = document.querySelector(
        '[data-checklist-progress="' + list.getAttribute("data-checklist") + '"] .progress-text'
      );
      var progressBar = document.querySelector(
        '[data-checklist-progress="' + list.getAttribute("data-checklist") + '"] .bar span'
      );
      function update() {
        var checked = 0;
        boxes.forEach(function (b) { if (b.checked) checked++; });
        var pct = boxes.length ? Math.round((checked / boxes.length) * 100) : 0;
        if (progressText) progressText.textContent = checked + " de " + boxes.length + " verificados";
        if (progressBar) progressBar.style.width = pct + "%";
      }
      boxes.forEach(function (b) { b.addEventListener("change", update); });
      update();
    });
  }

  /* ---------- Vídeo explicativo animado (player leve, sem arquivo externo) ---------- */
  function initVideoPlayers() {
    document.querySelectorAll(".video-player").forEach(function (player) {
      var scenes = player.querySelectorAll(".vp-scene");
      var caption = player.querySelector(".vp-caption");
      var playBtn = player.querySelector(".vp-play");
      var startOverlay = player.querySelector(".vp-start-overlay");
      var barFill = player.querySelector(".vp-bar-fill");
      var bar = player.querySelector(".vp-bar");
      var timeLabel = player.querySelector(".vp-time");
      if (!scenes.length) return;

      var SCENE_DURATION = 4000;
      var total = scenes.length * SCENE_DURATION;
      var current = 0;
      var elapsed = 0;
      var playing = false;
      var lastTick = null;
      var raf = null;

      function showScene(i) {
        scenes.forEach(function (s, idx) { s.classList.toggle("active", idx === i); });
        if (caption) caption.textContent = scenes[i].getAttribute("data-caption") || "";
      }

      function formatTime(ms) {
        var s = Math.floor(ms / 1000);
        return "0:" + (s < 10 ? "0" + s : s);
      }

      function tick(ts) {
        if (!playing) return;
        if (lastTick === null) lastTick = ts;
        elapsed += ts - lastTick;
        lastTick = ts;
        if (elapsed >= total) {
          elapsed = 0;
          current = 0;
          showScene(current);
        }
        current = Math.min(scenes.length - 1, Math.floor(elapsed / SCENE_DURATION));
        showScene(current);
        if (barFill) barFill.style.width = (elapsed / total) * 100 + "%";
        if (timeLabel) timeLabel.textContent = formatTime(elapsed);
        raf = requestAnimationFrame(tick);
      }

      function play() {
        playing = true;
        lastTick = null;
        player.classList.add("playing");
        raf = requestAnimationFrame(tick);
      }
      function pause() {
        playing = false;
        player.classList.remove("playing");
        if (raf) cancelAnimationFrame(raf);
      }

      showScene(0);

      if (startOverlay) {
        startOverlay.addEventListener("click", function () {
          play();
        });
      }
      if (playBtn) {
        playBtn.addEventListener("click", function () {
          if (playing) pause(); else play();
        });
      }
      if (bar) {
        bar.addEventListener("click", function (e) {
          var rect = bar.getBoundingClientRect();
          var ratio = (e.clientX - rect.left) / rect.width;
          elapsed = Math.max(0, Math.min(total - 1, ratio * total));
          current = Math.min(scenes.length - 1, Math.floor(elapsed / SCENE_DURATION));
          showScene(current);
          if (barFill) barFill.style.width = (elapsed / total) * 100 + "%";
          if (timeLabel) timeLabel.textContent = formatTime(elapsed);
        });
      }
    });
  }

  /* ---------- Marcar link de navegação ativo (reforço via JS) ---------- */
  function markActiveNav() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a").forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === path) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFontControls();
    initContrastControl();
    initMobileNav();
    initHeaderScroll();
    initAccordions();
    initCombinados();
    initModals();
    initChecklists();
    initVideoPlayers();
    initReveal();
    markActiveNav();
  });
})();
