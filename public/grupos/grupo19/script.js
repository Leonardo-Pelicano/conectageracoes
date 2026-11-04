function responder(correta) {
    const resultado = document.getElementById("resultado");

    // Mantido para o quiz futuro do projeto.
    if (!resultado) return;

    if (correta) {
        resultado.innerHTML =
            "✅ Muito bem! Confirmar a identidade por outro meio é uma atitude segura.";
        resultado.style.color = "#15883E";
    } else {
        resultado.innerHTML =
            "⚠️ Cuidado! Nunca envie dinheiro sem confirmar se a pessoa realmente é quem diz ser.";
        resultado.style.color = "#D97706";
    }
}
