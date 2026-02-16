Codebase Q&A with Proof — Option B
=================================

Overview
- A web app that lets you upload a codebase (ZIP) or connect a public GitHub repo URL, index the code, and answer questions about the codebase with cited references and line numbers.
- Answers include file paths, start/end line numbers, and a snippet of the relevant code. You can view the referenced files in the UI.
- The app stores a history of questions and references, and exposes a status page to check health of the backend, database, and LLM connection.

What’s implemented
- Frontend: Next.js 16 app with a GitHub import tab and a ZIP upload tab, a codebase Q&A UI, and a status page. It talks to the backend using the API at /api.
- Backend: Express API with routes for uploading a codebase, asking questions, history, and status. MongoDB stores files, projects, and QAs.
- AI integration: OpenRouter-based LLM calls that generate answers from indexed code, with structured references to source files.
- Search & relevance: The backend indexes code files and extracts relevant snippets to feed the LLM context.
- Health: A /api/status endpoint and a frontend status page showing backend, database, and LLM health checks.

What is not done (as of this submission)
- No user authentication or multi-user collaboration.
- No unit or integration tests included in this patch.
- No production-grade deployment scripts or CI configuration (Dockerfiles exist, but no deploy pipeline is included here).
- No advanced features like weighting of vendors, export of reports, or refactor suggestions (these can be added as future work).

How to run locally
Prerequisites
- Node.js v18+ and MongoDB (local or cloud)
- OpenRouter API key (set OPENROUTER_API_KEY) for LLM access
- GitHub repo URL or a ZIP file for codebase indexing

1) Backend
- Open the backend folder:
  - cd backend
- Install dependencies:
  - npm install
- Create a .env file (or use backend/.env as reference) with at least:
  - PORT=4000
  - MONGODB_URI=<your-mongodb-connection-string>
  - OPENROUTER_API_KEY=<your-openrouter-api-key>
  - APP_URL=http://localhost:3000
- Start the server:
  - npm run start
  or for development:
  - npm run dev
- The backend exposes endpoints under /api (upload, ask, history, status).

2) Frontend
- Open the frontend folder:
  - cd frontend
- Install dependencies:
  - npm install
- Ensure the frontend can reach the backend:
  - In frontend/.env (or the current .env), set NEXT_PUBLIC_API_URL=http://localhost:4000
- Start the Next.js app:
  - npm run dev
- The app will be available at http://localhost:3000 and will communicate with the backend at the URL above.

Usage flow
- Home: Import a codebase either by providing a GitHub repo URL or by uploading a ZIP file.
- After indexing, you’ll see a short summary (project name and file count) and a link to the Q&A view.
- Q&A page allows you to ask questions about the codebase. The UI returns an answer with references to files and line ranges, plus optional code snippets.
- History: The app stores the last 10 Q&As for quick viewing (backend handles cleanup).

Notes on data & privacy
- The codebase is indexed locally in MongoDB and only used to generate answers. Do not upload sensitive data unless you intend to index it.
- No data is sent to external services beyond the configured LLM (OpenRouter) for answering questions.

Files added in this patch
- README.md
- AI_NOTES.md (AI usage notes)
- ABOUTME.md (your personal profile and resume)
- PROMPTS_USED.md (record of prompts used during development)

Further enhancements (suggested)
- Add dark/light theme customization per project or per user, if needed.
- Add export to Markdown or PDF for Q&A results.
- Improve input validation and accessibility improvements.

Live link and repository
- Live Link:- codebase-qa-beige.vercel.app
- GitHub Repo Link:- https://github.com/developedbyrd/codebase-qa

Notes
- This doc is based on the current repository structure (frontend + backend) and the Options B codebase QA with Proof flow.
