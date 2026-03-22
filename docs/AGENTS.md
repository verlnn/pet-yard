# Codex Project Notes

## Language
- Respond in Korean by default.

## Docs First
- At the start of a new session, review the markdown documents under `docs/` before acting on repository-wide backend or product requests.
- Treat the documents in `docs/` as project context, not optional reference material.
- Read the most relevant documents for the task first, and when the request is broad or ambiguous, scan the full `docs/` tree before implementation.
- When a document in `docs/` conflicts with stale assumptions, follow the document.

## Commit Rules
- Commit automatically after completing a user-requested implementation task unless the user explicitly says not to commit.
- Write commit messages in Korean.
- If the user requests multiple distinct features or changes in one turn, make separate commits for each logically independent feature when practical.

## Frontend Notes
- Frontend-specific working rules live in `web/docs/AGENTS.md`.
- Korean frontend-specific notes live in `web/docs/AGENTS.ko.md`.
