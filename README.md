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

const API_URL = 'https://<your-subdomain>.workers.dev/api/damianai';
CV is embedded like this (shortened example):

html  

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
--
--
  📜 License
MIT License © 2025 Damián Conejos

