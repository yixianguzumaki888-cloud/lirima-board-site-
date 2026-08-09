// api/chat.js
// Vercel serverless function — keeps your Groq API key safe on the server.
// Deploy inside a project's /api folder on Vercel (or adapt for Netlify Functions).

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' in request body" });
    }

    const systemPrompt = `Eres el Asistente IA de Lirima Board, una plataforma escolar para el Colegio Lirima.

Tu propósito es ayudar a estudiantes (5to a 12vo grado) a:
- Encontrar clubes, tutorías, torneos, eventos deportivos y publicaciones del marketplace
- Entender cómo usar la plataforma (publicar, mensajear, etc.)
- Dar consejos generales y motivadores sobre participación escolar

REGLAS IMPORTANTES:
- NUNCA des consejería personal, emocional o de salud mental. Si un estudiante menciona temas personales, bullying, problemas familiares, autolesión, o cualquier tema sensible, responde con calidez pero redirígelo a un profesor, orientador(a), o adulto de confianza. NO intentes resolver el problema tú mismo.
- NUNCA ayudes con tareas de forma que constituya deshonestidad académica (no escribas ensayos ni tareas completas para entregar).
- Identifícate siempre como un asistente de IA, no como un profesor o consejero.
- Mantén las respuestas breves, amigables y apropiadas para la edad.
- Responde en el mismo idioma en que te escriban (español, inglés o chino).`;

    // Build message list in OpenAI-compatible format (Groq uses this format)
    const messages = [{ role: "system", content: systemPrompt }];

    if (Array.isArray(history)) {
      for (const turn of history) {
        messages.push({
          role: turn.role === "assistant" ? "assistant" : "user",
          content: turn.content,
        });
      }
    }
    messages.push({ role: "user", content: message });

    const apiKey = process.env.GROQ_API_KEY; // set this in Vercel's environment variables, never hardcode it

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // solid free-tier model on Groq
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", data);
      return res.status(500).json({ error: "AI request failed" });
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Lo siento, no pude generar una respuesta. Intenta de nuevo.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}
