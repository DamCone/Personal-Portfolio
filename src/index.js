// src/index.js
// Worker (Cloudflare) que expone POST /api/damianai y llama a Gemini.
// - La API key se lee de env.GEMINI_API_KEY (guardada con `wrangler secret put GEMINI_API_KEY`)
// - El modelo por defecto es env.GEMINI_MODEL o "gemini-2.0-flash"
// - Devuelve texto plano. CORS habilitado para llamadas desde tu web.

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders()
      });
    }

    // Endpoint principal
    if (req.method === 'POST' && url.pathname === '/api/damianai') {
      try {
        const { prompt = 'Dime por qué deberíamos contratarte', lang = 'es', profile = {}, miniBio = '' } =
          await safeJson(req);

        const model = env.GEMINI_MODEL || 'gemini-2.0-flash';
        if (!env.GEMINI_API_KEY) {
          return textError(500, 'Falta GEMINI_API_KEY en el Worker (wrangler secret).');
        }

        // Mensaje tipo "system" para orientar la respuesta al contexto suizo
        const systemText =
          lang === 'de'
            ? 'Du bist Damian.AI. Antworte kurz, geschäftsnah, mit Fokus auf Schweizer KMU.'
            : lang === 'en'
            ? 'You are Damian.AI. Answer concisely, business-focused, for Swiss SMEs.'
            : 'Eres Damian.AI. Responde breve y orientado a negocio para PYMEs suizas.';

        // Cuerpo de generateContent
        const body = {
          system_instruction: {
            parts: [
              {
                text:
                  systemText +
                  '\nPerfil: ' +
                  JSON.stringify(profile) +
                  '\nMiniBio: ' +
                  (miniBio || '')
              }
            ]
          },
          contents: [{ role: 'user', parts: [{ text: String(prompt) }]}]
        };

        // Construimos la URL con ?key= (Gemini REST espera la key como query param)
        const apiUrl = new URL(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
        );
        apiUrl.searchParams.set('key', env.GEMINI_API_KEY);

        const r = await fetch(apiUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          body: JSON.stringify(body)
        });

        if (!r.ok) {
          // devolvemos el error de Gemini para depurar desde el frontend
          const errText = await r.text();
          return textError(500, `Gemini error: ${errText}`);
        }

        const data = await r.json();

        // Extrae el texto de la primera candidata
        const text =
          data?.candidates?.[0]?.content?.parts
            ?.map((p) => p?.text || '')
            .join('') ||
          'No hay texto en la respuesta.';

        return new Response(text, {
          headers: {
            ...corsHeaders(),
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store'
          }
        });
      } catch (e) {
        return textError(500, 'Server error: ' + (e?.message || String(e)));
      }
    }

    // Healthcheck / ruta por defecto
    return new Response('OK', {
      headers: {
        ...corsHeaders(),
        'Content-Type': 'text/plain; charset=utf-8'
      }
    });
  }
};

// ----- helpers -----
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}

function textError(status, message) {
  return new Response(message, {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

async function safeJson(req) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}
