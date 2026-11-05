# STORY-001: Invoice creation form
Ticket: ZOU-37 · Size: M (2–3 days) · Data class: INTERNAL

## Why
The user must be able to create an invoice from scratch: enter business and client details, add line items, and see correct totals updating in real time. This is the primary value the product delivers.

## Acceptance criteria
- Given an empty invoice, when the user fills in business name, client name, invoice number, and dates, then the fields display correctly on screen and in the print view.
- Given an empty invoice, when the user adds a line item with description "Web Design", quantity 1, unit price 1500, then the line item row shows correctly and the subtotal updates to AED 1,500.00.
- Given an invoice with line items totaling AED 1,000.00, when the user sets discount to 10%, then the discount amount shows as AED 100.00, the subtotal after discount shows AED 900.00, VAT (5%) shows AED 45.00, and the total shows AED 945.00.
- Given an invoice with line items, when the user changes any line item's description, quantity, or unit price, then the subtotal, VAT, and total recalculate immediately without a page reload.
- Given an invoice, when the user enters 0.1 in a quantity field and 0.2 in a unit price field, then the line item amount shows AED 0.04 (no floating-point error like AED 0.04000000000000001).
- Given an invoice with line items, when the user sets quantity to 0, then the line item amount is AED 0.00 and the subtotal reflects the zero amount.
- Given an invoice with subtotal AED 1,000.00, when the user sets discount to 100%, then the subtotal after discount is AED 0.00, VAT (5%) is AED 0.00, and the total is AED 0.00.
- Given an invoice, when the user changes the VAT percentage from 5% to 10%, then the VAT amount and total recalculate correctly.
- Given an empty invoice, when the user adds a line item, then the new row appears with empty description, quantity 0, and unit price 0.
- Given an invoice with one or more line items, when the user removes a line item, then the remaining items stay and totals recalculate.
- Given an invoice with only one line item, when the user removes that line item, then the line items area shows an empty state prompting the user to add an item.
- Given the invoice creation page, when the page loads, then the invoice number defaults to "INV-0001" (or the next available number) and is editable.
- Given the invoice creation page, when the page loads, then the invoice date defaults to today's date and is editable.
- Given the invoice creation page, when the page loads, then the due date defaults to 14 days after the invoice date and is editable.

## Files likely to touch
- `src/components/InvoiceForm/` — form component with business/client fields, line items, and totals
- `src/lib/calc.ts` — totals calculation logic
- `src/lib/format.ts` — AED currency formatting
- `src/lib/invoice.ts` — invoice data model and types

## Out of scope
- Saving to local storage (handled in STORY-002).
- Print view (handled in STORY-003).
- Invoice list view (handled in STORY-002).

## Test notes (edge cases QA must try)
- Enter very long text (500+ characters) in business name and description fields — does the layout hold?
- Enter negative numbers in quantity, unit price, or discount — what happens?
- Enter non-numeric text in quantity, unit price, or VAT — does the UI handle it gracefully?
- Enter 0% discount — totals should equal the line item amounts with VAT added.
- Line items with 0 quantity and 0 unit price — should produce AED 0.00 amounts without breaking the layout.
- AED formatting with large numbers (e.g. AED 123,456.78) — commas and decimals correct.
- The exact text "AED 1,250.00" format used for all amounts.
- Accent color #2563EB applied consistently to interactive elements.
