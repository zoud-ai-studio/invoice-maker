# AGENTS.md: rules for every agent in this repo

## Commands (use only these)
make setup · make check · make ci · make test · make e2e · make eval · make preview

## Default stack (don't change without an ADR)
- Backend: Python 3.12, FastAPI, Postgres, pytest
- Frontend: Next.js + TypeScript, ESLint (npm run lint must run eslint, not tsc), Playwright for E2E
- Local services: Podman / Compose

## Where things live
docs/PRD.md = what & why · docs/ARCHITECTURE.md = how
docs/stories/ = one file per ticket · docs/adr/ = decisions
docs/STATE.md = current status and decisions: read it first

## Hard rules
1. One ticket = one branch = one PR. Never push to main. Never merge.
2. Write tests first, from the story's Given/When/Then.
3. `make ci` must pass before you open a PR.
4. Never weaken or delete a test to make it pass. Never turn off lint or type checks.
5. A new dependency needs one line in the PR saying why.
6. No secrets in code, logs, tickets or PRs.
7. Don't change .github/ unless the ticket says so.
8. Stuck after 2 tries: set the ticket to blocked and explain what you tried.

## Data rules
Project data class: PUBLIC | INTERNAL | CONFIDENTIAL-LOCAL-ONLY
CONFIDENTIAL-LOCAL-ONLY: only the local model endpoint below. No paid APIs.

## Local model endpoint (for AI features and tests)
http://127.0.0.1:8000/v1   model: local-qwen
