PROMPTS_USED.md
===========

This file records prompts used during the development of the Codebase Q&A with Proof project (Option B). It does not include agent responses or sensitive data (like API keys).

Dates and prompts (examples)
- 2026-02-17: What are the primary components or modules (frontend, backend, data layer, AI integration) and how do they interact?
- 2026-02-17: What are the entry points (startup scripts, routes) and the typical data path from input to output?
- 2026-02-17: Describe all data models with fields, types, and relationships, including any indexes.
- 2026-02-17: give me custom hook for debouncing to implement in this project

How prompts were used in practice
- Architecture prompts guided the separation between frontend, backend, and AI components.
- Prompts were used to draft documentation artifacts (README, AI_NOTES, ABOUTME, PROMPTS_USED) to demonstrate industry-standard deliverables.
- AI prompts intentionally steered the LLM to avoid fabricating details not present in the codebase (as per system prompt rules in the backend).

Notes on prompt hygiene
- All prompts used for this project are stored in this file for reproducibility.
- Do not store or expose any sensitive inputs or system prompts publicly if they contain private information.
