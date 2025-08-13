# Damian.AI — Portfolio + Gemini Chat on Cloudflare Workers

Damian.AI is a **first-person conversational AI** embedded in my personal portfolio.  
It answers as if it were me (Damián Conejos), using a structured CV and a tuned prompt.  
Frontend: **HTML/CSS/JS**. Backend: **Cloudflare Worker** calling **Google Gemini**.

> 🧭 Local demo: open `index.html`  
> ☁️ API: exposed by the Worker at `/api/damianai`

---

## 📁 Project Structure

Actual repo structure:

.  
├─ .vscode/  
├─ .wrangler/  
├─ node_modules/  
├─ src/  
│ └─ index.js # Worker code (fetch handler, CORS, Gemini call)  
├─ test/  
├─ .editorconfig  
├─ .gitignore  
├─ .prettierrc  
├─ index.html # Portfolio page with Damian.AI widget (chat bubble)  
├─ index.js # (optional utilities / local tests)  
├─ package.json  
├─ package-lock.json  
├─ vitest.config.js  
└─ wrangler.jsonc # Cloudflare Workers configuration


If you also upload `css/` and `images/`, place them alongside `index.html` or in a dedicated `web/` folder.  
`index.html` contains:
- a `<script type="application/json" id="damian-cv">` block with my CV,
- the chat widget script that calls the Worker (`API_URL` constant).

---

## ✨ Features

- **First-person** answers (my voice) and **multi-language** (ES/EN/DE).
- **Prompt templates** tailored for recruiters (why hire me, projects, availability).
- **Structured CV (JSON)** embedded in `index.html` → easy to maintain.
- **CORS & preflight OPTIONS** fully handled in the Worker.
- **LocalStorage** chat history and responsive UI.

---

## 🔧 Requirements

- Node.js 18+ and npm.
- **Cloudflare** account (Workers) and **Google Gemini API key**.

---

Frontend (index.html)
Open index.html directly in your browser or host it on your server.

Set your endpoint in the widget script:

js
Copiar
Editar
const API_URL = 'https://<your-subdomain>.workers.dev/api/damianai';
CV is embedded like this (shortened example):

html
Copiar
Editar
<script type="application/json" id="damian-cv">
{
  "basics": { "name": "Damián Conejos", "location": "Deutschschweiz, CH", ... },
  "education": [...],
  "experience": [...],
  "projects": [...],
  "skills": {...},
  "academics": { "grade_avg_over_3_years": 8.5 }
}
</script>
The widget reads this JSON and sends it to the Worker along with:

current language,

mini-bio from the page,

recent chat history.

🔌 API Quick Test
Endpoint
bash
Copiar
Editar
POST /api/damianai
Content-Type: application/json
Minimal body
json
Copiar
Editar
{
  "prompt": "Why should we hire you?",
  "lang": "en"
}
Curl example
bash
Copiar
Editar
curl -X POST "https://<your-subdomain>.workers.dev/api/damianai" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Ping","lang":"en"}'
🧠 How It Works
Frontend builds a prompt in first person with:

current <html lang> value,

structured CV and profile,

mini-bio from the page,

recent history (max 6 messages),

output templates (bullets, CTA, focus on Swiss SMEs).

Worker:

Builds a system prompt with tone, constraints (no hallucinations), and CV details,

Calls Gemini (models/gemini-1.5-flash:generateContent),

Returns plain text with proper CORS headers.

🛡️ CORS & HTTPS
Worker returns:

Access-Control-Allow-Origin: *

Access-Control-Allow-Methods: POST, OPTIONS

Access-Control-Allow-Headers: Content-Type

If your hosting is HTTPS and the Worker is too (it is), no mixed-content issues.

In production, you can restrict Allow-Origin to your domain.

🧪 Useful Scripts
bash
Copiar
Editar
# local worker dev
npx wrangler dev

# deploy to Cloudflare
npx wrangler deploy

# run tests (if using vitest and /test)
npm test
🩺 Troubleshooting
“Failed to fetch” → usually CORS or wrong API_URL:

check API_URL in index.html,

ensure Worker handles OPTIONS and CORS (already implemented).

Gemini upstream error → invalid key or quota exceeded: recreate GEMINI_API_KEY.

Chat bubble not changing language → widget reacts to <html lang>; make sure your language switch updates it and/or calls window.setLang(lang).

📸 Screenshot

Add a screenshot of your running app in docs/screenshot.png for GitHub preview.

📜 License
MIT License © 2025 Damián Conejos

🙌 Credits
Cloudflare Workers

Google Gemini API

Bootstrap 5

yaml
Copiar
Editar

---

Do you want me to also **embed your full CV JSON** in the README so that anyone checking the repo can see exactly what data the AI uses? That could make the repo much more transparent for recruiters.
