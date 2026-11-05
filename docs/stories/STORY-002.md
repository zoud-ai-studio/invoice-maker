# STORY-002: Save and manage invoices
Ticket: ZOU-37 · Size: M (2–3 days) · Data class: INTERNAL

## Why
The user must be able to save invoices, revisit them later, duplicate existing invoices, and remove ones they no longer need. This makes the tool practical for ongoing use rather than a one-off calculator.

## Acceptance criteria
- Given an invoice form, when the user saves the invoice (by navigating away or clicking Save), then the invoice is stored in the browser's local storage.
- Given a saved invoice, when the user reloads the page, then the saved invoice appears in the invoice list.
- Given no saved invoices, when the user opens the invoice list, then the list shows an empty state with no invoices to display.
- Given one or more saved invoices, when the user views the invoice list, then each invoice shows its invoice number, client name, date, and total amount in AED format.
- Given an invoice in the list, when the user clicks on it, then the invoice opens for editing with all fields and line items intact.
- Given an invoice in the list, when the user clicks Duplicate, then a new editable copy of the invoice is created with a new invoice number and all line items preserved.
- Given an invoice in the list, when the user clicks Delete, then a confirmation dialog appears.
- Given a confirmation dialog for deletion, when the user confirms, then the invoice is permanently removed from local storage and the list.
- Given a confirmation dialog for deletion, when the user cancels, then the invoice remains in the list unchanged.
- Given saved invoices in the list, when the user returns to the list after editing or creating an invoice, then the list sorts with the most recently modified invoice first.
- Given an invoice saved in local storage, when the user closes the browser and reopens it, then the saved invoices are still present in the list.

## Files likely to touch
- `src/components/InvoiceList/` — list component rendering saved invoices
- `src/lib/storage.ts` — local storage read/write operations
- `src/lib/normalize.ts` — invoice number generation
- `src/app/` — page layout with navigation between list and form views

## Out of scope
- Print view (handled in STORY-003).
- Search or filter in the list.
- Export/import functionality.

## Test notes (edge cases QA must try)
- Save an invoice with no client name — does it still save?
- Save 10+ invoices — does the list still render correctly?
- Delete the only saved invoice — does the list show the empty state?
- Open an invoice, edit a line item, save — does the list show the updated total?
- Clear browser local storage — do invoices disappear and does the list show empty state?
- Open two tabs with the app — does saving in one tab affect the other? (localStorage syncs automatically but the list may not refresh without a storage event listener.)
- Very long client name (500+ characters) — does the list layout hold?
