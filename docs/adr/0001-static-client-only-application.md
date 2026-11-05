# ADR 0001: Use a client-only static application

**Status:** Accepted
**Date:** 2026-11-05

## Decision

Build Invoice Maker as a Next.js static export. The runtime is browser-only: no API routes, server actions, database, accounts, analytics, or network request is part of the product.

## Consequences

- `next build` must produce `out/` through `output: 'export'`.
- Browser localStorage is the persistence boundary and data stays on the current device/browser.
- The app remains usable offline after its static assets have loaded.
