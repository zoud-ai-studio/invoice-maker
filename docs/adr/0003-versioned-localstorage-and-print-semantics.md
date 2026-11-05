# ADR 0003: Isolate browser storage and share invoice semantics across print

**Status:** Accepted
**Date:** 2026-11-05

## Decision

Encapsulate one namespaced, versioned localStorage collection in `src/lib/storage.ts`. Render the same canonical invoice data for editable screen and print output; print CSS controls A4 presentation and hides non-document UI.

## Consequences

- Invalid stored values are normalized or ignored without preventing startup.
- Save, duplicate, delete, and sort behavior have one storage owner.
- Print cannot drift from the active invoice, and viewport styles cannot determine the printed document.
