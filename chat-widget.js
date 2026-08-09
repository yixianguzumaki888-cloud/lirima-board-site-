// chat-widget.js
// Handles the floating AI chat button + panel on Lirima Board.

let chatHistory = [];

async function sendMessage(userMessage) {
  chatHistory.push({ role: "user", content: userMessage });

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: userMessage,
      history: chatHistory.slice(0, -1),
    }),
  });

  const data = await response.json();

  if (data.reply) {
    chatHistory.push({ role: "assistant", content: data.reply });
    return data.reply;
  } else {
    return "Lo siento, hubo un error. Intenta de nuevo.";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("ai-chat-toggle");
  const panel = document.getElementById("ai-chat-panel");
  const closeBtn = document.getElementById("ai-chat-close");
  const form = document.getElementById("ai-chat-form");
  const input = document.getElementById("ai-chat-input");
  const messagesEl = document.getElementById("ai-chat-messages");

  if (!toggleBtn || !panel || !form) return;

  toggleBtn.addEventListener("click", () => {
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden") && messagesEl.children.length === 0) {
      appendMessage("assistant", "¡Hola! Puedo ayudarte a encontrar clubes, tutorías, torneos y más en Lirima Board. ¿En qué te puedo ayudar?");
    }
  });

  closeBtn.addEventListener("click", () => {
    panel.classList.add("hidden");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    appendMessage("user", userMessage);
    input.value = "";
    appendMessage("assistant", "...");

    const reply = await sendMessage(userMessage);

    const lastBubble = messagesEl.lastElementChild;
    lastBubble.textContent = reply;
  });

  function appendMessage(role, text) {
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble chat-bubble-${role}`;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
});