(function () {
  "use strict";

  var form = document.getElementById("form-contato");
  if (!form) return;

  var status = document.getElementById("contato-status");
  var button = document.getElementById("contato-enviar");
  var message = document.getElementById("contato-mensagem");
  var counter = document.getElementById("contador-mensagem");
  var errorBoxes = {
    email: document.getElementById("erro-email"),
    tipo: document.getElementById("erro-tipo"),
    mensagem: document.getElementById("erro-mensagem")
  };
  var inputs = {
    email: document.getElementById("contato-email"),
    tipo: document.getElementById("contato-tipo"),
    mensagem: message
  };

  function showStatus(kind, text) {
    status.className = "form-status show " + kind;
    status.textContent = text;
  }

  function clearErrors() {
    Object.keys(errorBoxes).forEach(function (key) {
      errorBoxes[key].textContent = "";
      inputs[key].removeAttribute("aria-invalid");
    });
  }

  function showFieldErrors(fields) {
    var first = null;
    Object.keys(fields || {}).forEach(function (key) {
      if (!errorBoxes[key]) return;
      errorBoxes[key].textContent = fields[key];
      inputs[key].setAttribute("aria-invalid", "true");
      if (!first) first = inputs[key];
    });
    if (first) first.focus();
  }

  message.addEventListener("input", function () {
    counter.textContent = message.value.length + " de " + message.maxLength + " caracteres";
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearErrors();
    status.className = "form-status";

    if (message.value.trim().length < 10) {
      showFieldErrors({ mensagem: "Escreva uma mensagem com pelo menos 10 caracteres." });
      return;
    }

    var payload = {
      nome: form.elements.nome.value,
      email: form.elements.email.value,
      tipo: form.elements.tipo.value,
      mensagem: message.value,
      website: form.elements.website.value
    };

    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var abortTimer = window.setTimeout(function () {
      if (controller) controller.abort();
    }, 75000);
    var wakeTimer = window.setTimeout(function () {
      showStatus("info", "O servidor está acordando e pode levar até um minuto. Aguarde, sua mensagem será enviada.");
    }, 4000);

    button.disabled = true;
    button.textContent = "Enviando...";

    fetch("/api/mensagens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          return { status: response.status, data: data };
        });
      })
      .then(function (result) {
        if (result.status === 201) {
          form.reset();
          counter.textContent = "0 de " + message.maxLength + " caracteres";
          showStatus("ok", "Mensagem enviada. Obrigado por falar com a gente!");
        } else if (result.status === 422) {
          showStatus("error", "Revise os campos indicados e tente de novo.");
          showFieldErrors(result.data.campos);
        } else if (result.status === 429) {
          showStatus("error", "Foram muitas mensagens em pouco tempo. Tente novamente em alguns minutos.");
        } else if (result.status === 413) {
          showStatus("error", "A mensagem ficou grande demais. Encurte o texto e tente de novo.");
        } else {
          showStatus("error", result.data.erro || "Não foi possível enviar agora. Tente novamente mais tarde.");
        }
      })
      .catch(function () {
        showStatus("error", "Não foi possível conectar ao servidor. Verifique a internet e tente de novo em instantes.");
      })
      .then(function () {
        window.clearTimeout(abortTimer);
        window.clearTimeout(wakeTimer);
        button.disabled = false;
        button.textContent = "Enviar mensagem";
      });
  });
})();
