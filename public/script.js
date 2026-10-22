(function () {
  "use strict";

  var FONT_KEY = "cg-font-scale";
  var CONTRAST_KEY = "cg-high-contrast";
  var MIN_SCALE = 0.85;
  var MAX_SCALE = 1.4;
  var STEP = 0.1;

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

  function initMobileNav() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
    function closeNav() {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !toggle.contains(e.target)) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        closeNav();
        toggle.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) closeNav();
    });
  }

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

  function initHeaderScroll() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function update() {
      header.classList.toggle("scrolled", window.scrollY > 8);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

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

  function initVideoPlayers() {
    document.querySelectorAll(".video-player").forEach(function (player) {
      var scenes = player.querySelectorAll(".vp-scene");
      var caption = player.querySelector(".vp-caption");
      var playBtn = player.querySelector(".vp-play");
      var startOverlay = player.querySelector(".vp-start-overlay");
      var startLabel = player.querySelector(".vp-start-label");
      var barFill = player.querySelector(".vp-bar-fill");
      var bar = player.querySelector(".vp-bar");
      var timeLabel = player.querySelector(".vp-time");
      var chapters = player.querySelectorAll(".vp-chapter");
      if (!scenes.length) return;

      var SCENE_DURATION = 4000;
      var total = scenes.length * SCENE_DURATION;
      var current = 0;
      var elapsed = 0;
      var playing = false;
      var lastTick = null;
      var raf = null;

      function formatTime(ms) {
        var s = Math.min(Math.floor(ms / 1000), total / 1000);
        return "0:" + (s < 10 ? "0" + s : s);
      }

      function updateProgress() {
        var seconds = Math.floor(elapsed / 1000);
        if (barFill) barFill.style.width = (elapsed / total) * 100 + "%";
        if (timeLabel) timeLabel.textContent = formatTime(elapsed) + " / " + formatTime(total);
        if (bar) {
          bar.setAttribute("aria-valuenow", String(seconds));
          bar.setAttribute("aria-valuetext", seconds + " de " + total / 1000 + " segundos");
        }
      }

      function showScene(i, restart) {
        var changed = i !== current || restart;
        current = i;
        scenes.forEach(function (scene, idx) {
          if (idx !== i) scene.classList.remove("active");
        });
        if (changed) {
          scenes[i].classList.remove("active");
          void scenes[i].offsetWidth;
        }
        scenes[i].classList.add("active");
        if (caption) caption.textContent = scenes[i].getAttribute("data-caption") || "";
        chapters.forEach(function (chapter, idx) {
          chapter.setAttribute("aria-current", idx === i ? "true" : "false");
        });
      }

      function setPlaying(state) {
        playing = state;
        player.classList.toggle("playing", state);
        if (playBtn) playBtn.setAttribute("aria-label", state ? "Pausar vídeo" : "Reproduzir vídeo");
      }

      function pause() {
        setPlaying(false);
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      }

      function finish() {
        pause();
        elapsed = total;
        updateProgress();
        player.classList.add("ended");
        if (startLabel) startLabel.textContent = "Assistir de novo";
        if (startOverlay) startOverlay.setAttribute("aria-label", "Assistir de novo o vídeo Antes de clicar");
      }

      function tick(ts) {
        if (!playing) return;
        if (lastTick === null) lastTick = ts;
        elapsed += Math.min(ts - lastTick, 100);
        lastTick = ts;
        if (elapsed >= total) {
          finish();
          return;
        }
        var index = Math.min(scenes.length - 1, Math.floor(elapsed / SCENE_DURATION));
        if (index !== current) showScene(index, false);
        updateProgress();
        raf = requestAnimationFrame(tick);
      }

      function play() {
        if (player.classList.contains("ended")) {
          player.classList.remove("ended");
          elapsed = 0;
          showScene(0, true);
          updateProgress();
          if (startLabel) startLabel.textContent = "Assistir: Antes de clicar";
        }
        player.classList.add("started");
        lastTick = null;
        setPlaying(true);
        raf = requestAnimationFrame(tick);
      }

      function goTo(index) {
        var wasEnded = player.classList.contains("ended");
        index = Math.max(0, Math.min(scenes.length - 1, index));
        if (wasEnded) {
          player.classList.remove("ended");
          if (startLabel) startLabel.textContent = "Assistir: Antes de clicar";
        }
        player.classList.add("started");
        elapsed = index * SCENE_DURATION;
        showScene(index, true);
        updateProgress();
        if (!playing && wasEnded) play();
      }

      showScene(0, false);
      updateProgress();

      if (startOverlay) startOverlay.addEventListener("click", play);

      if (playBtn) {
        playBtn.addEventListener("click", function () {
          if (playing) pause(); else play();
        });
      }

      chapters.forEach(function (chapter) {
        chapter.addEventListener("click", function () {
          goTo(parseInt(chapter.getAttribute("data-scene"), 10));
        });
      });

      if (bar) {
        bar.addEventListener("click", function (e) {
          var rect = bar.getBoundingClientRect();
          var ratio = Math.max(0, Math.min(0.999, (e.clientX - rect.left) / rect.width));
          goTo(Math.floor(ratio * scenes.length));
        });
        bar.addEventListener("keydown", function (e) {
          var step = null;
          if (e.key === "ArrowRight" || e.key === "ArrowUp") step = current + 1;
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") step = current - 1;
          if (e.key === "Home") step = 0;
          if (e.key === "End") step = scenes.length - 1;
          if (step !== null) {
            e.preventDefault();
            goTo(step);
          }
        });
      }

      document.addEventListener("visibilitychange", function () {
        if (document.hidden && playing) pause();
      });

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          if (!entries[0].isIntersecting && playing) pause();
        }, { threshold: 0.1 }).observe(player);
      }
    });
  }

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
