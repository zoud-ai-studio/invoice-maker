# ADR 0002: Centralize invoice state and exact money calculations

**Status:** Accepted
**Date:** 2026-11-05

## Decision

Define the versioned `Invoice` model once in `src/lib/invoice.ts`. All form edits flow through one active-invoice controller; all totals come from a pure `calculateTotals` domain function using exact decimal/minor-unit arithmetic and a single AED formatter.

## Consequences

- Components must not perform monetary arithmetic or persist derived totals as an independent source of truth.
- Storage, list rows, and print all consume the canonical model and calculated totals.
- Numeric parsing and rounding are unit-tested independently of React and browser APIs.
