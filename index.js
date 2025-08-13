// Cloudflare Worker: POST /api/damianai  -> llama a Gemini y devuelve texto
export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // CORS básico
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        }
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/damianai') {
      try {
        const { prompt = "Dime por qué deberíamos contratarte", lang = "es", profile = {}, miniBio = "" } = await req.json();
        const model = env.GEMINI_MODEL || "gemini-2.0-flash"; // rápido y barato

        // Instrucción de sistema opcional (mejor respuesta de negocio)
        const systemText =
          (lang === 'de') ? 'Du bist Damian.AI, gib knappe, geschäftsnahe Antworten für Schweizer KMU.' :
          (lang === 'en') ? 'You are Damian.AI, concise, business-focused answers for Swiss SMEs.' :
                            'Eres Damian.AI: responde breve, orientado a negocio para PYMEs suizas.';

        const body = {
          system_instruction: { parts: [{ text: systemText + '\nPerfil: ' + JSON.stringify(profile) + '\nMiniBio: ' + miniBio }] },
          contents: [{ role: "user", parts: [{ text: prompt }]}]
        };

        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            // Pasa la API key en CABECERA (más limpio que ponerla en la URL)
            'x-goog-api-key': env.GEMINI_API_KEY
          },
          body: JSON.stringify(body)
        });

        if (!r.ok) {
          const errText = await r.text();
          return new Response(`Gemini error: ${errText}`, { status: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/plain' } });
        }

        const data = await r.json();
        // Extrae el primer texto de la primera candidata
        const text =
          data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') ||
          'No hay texto en la respuesta.';

        return new Response(text, {
          headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
        });
      } catch (e) {
        return new Response('Server error: ' + e.message, { status: 500, headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/plain' } });
      }
    }

    return new Response('OK', { headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'text/plain' } });
  }
}
