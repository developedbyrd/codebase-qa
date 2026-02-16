AI_NOTES.md
===========

Overview
- This document records how AI was used in building the Codebase Q&A with Proof project (Option B), what checks were performed manually, and why a particular LLM provider/model was chosen.

AI usage in this project
- Architecture & scaffolding: Used AI to outline an end-to-end flow for a web app that indexes code and answers questions with citations.
- Code comprehension: Used AI to map file structures in both frontend (Next.js) and backend (Express + MongoDB) to the features described in the assignment.
- Documentation generation: Used AI to draft a concise README and ancillary MD files (AI_NOTES.md, PROMPTS_USED.md) aligned with industry standards.
- Prompts synthesis: Generated prompt structures for system prompts and user prompts to drive LLM interactions in the backend (OpenRouter).

LLM provider and model
- Provider: OpenRouter (https://openrouter.ai/)
- API key: OpenRouter API key is required and is configured via OPENROUTER_API_KEY in the backend configuration. This project uses the GPT-4o family model via the OpenRouter API (DEFAULT_MODEL = openai/gpt-4o-mini).
- Reason for choice: OpenRouter provides a chat-based API with flexible model support and a free of cost/throughput profile suitable for code understanding tasks and citation-heavy responses.

What I checked manually
- Verified repository structure and essential API routes: /api/upload, /api/ask, /api/history, /api/status.
- Confirmed LLM integration flow: system prompt + user message with code context, response parsing, and error handling.
- Validated data flow: uploading code (ZIP or GitHub), indexing files, extracting code snippets, and returning references with line ranges.
- Confirmed health checks: backend/database/LLM connectivity exposed via /api/status and frontend status page.

Notes on reliability & limitations
- The system relies on the availability of the OpenRouter API and a valid OPENROUTER_API_KEY.
- Local indexing uses MongoDB; performance depends on repository size and file types. Large repos may require longer indexing times.
- No encryption or authentication is included in this version; sensitive data should be handled with care.

Why this approach
- The OpenRouter-based LLM with a system prompt that emphasizes codebase understanding ensures the model respects context and provides file-path citations.
- The separation of concerns (upload/indexing, contextual search, and Q&A) makes the codebase maintainable and extensible.

Security & privacy considerations
- Avoid uploading secrets or credentials; the app filters out sensitive file types (e.g., .env) during indexing.
- API keys are read from environment variables and not embedded in source code.

Future work (optional)
- Add prompt/versioning controls, logging for prompts, and an audit trail for AI-generated answers.
- Support for different LLM providers, richer citation formats, and export options.
