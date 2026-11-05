# STORY-003: Print view and responsive design
Ticket: ZOU-37 · Size: S (1 day) · Data class: INTERNAL

## Why
The final value of the product is a professional-looking invoice the freelancer can send to a client. The print view must produce a clean document, and the page must work on mobile phones where the freelancer might create invoices on the go.

## Acceptance criteria
- Given an invoice on the form page, when the user clicks the "Print invoice" button, then the browser's print dialog opens.
- Given the print dialog, the printed view hides the "Print invoice" button and all edit form controls.
- Given the print dialog, the printed view shows all invoice content: business name, business address, client name, client address, invoice number, dates, all line items with description/quantity/unit price, subtotal, discount, VAT, and total.
- Given the printed invoice, when the output is rendered, then it fits on A4 paper without horizontal overflow.
- Given the printed invoice, when the output is rendered, then all amounts display in AED format (e.g. "AED 1,250.00").
- Given the web page, when the viewport is 375px wide, then the invoice form is readable and all inputs are accessible without horizontal scrolling.
- Given the web page, when the viewport is 1280px wide, then the layout uses the available width efficiently without excessive stretching or empty space.
- Given the web page, when the viewport is at a medium width (e.g. 768px), then the layout remains functional without horizontal overflow.
- Given the printed invoice, the accent color #2563EB is used consistently for headings and important elements.
- Given the web page, the page uses a white background and dark text as the base theme.
- Given the web page, the page uses a system font stack (e.g. `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).

## Files likely to touch
- `src/components/InvoiceForm/` — print CSS for the form/print views
- `src/app/globals.css` or equivalent — global print styles (`@media print`)
- `src/app/layout.tsx` — responsive meta viewport and base styles
- CSS media queries for responsive breakpoints

## Out of scope
- Adding a download-as-PDF button (relies on browser print dialog per the brief).
- Custom print templates (single default layout).
- PWA or installability.

## Test notes (edge cases QA must try)
- Print with only one line item — does the print view handle minimal content gracefully?
- Print with 20+ line items — does the layout handle overflow? (Consider whether print should paginate across multiple A4 pages.)
- Print on a device with a different print driver — does the output remain consistent?
- Resize the browser window from 375px to 1280px and back — does the layout adapt fluidly?
- Use the browser's "Save as PDF" option in the print dialog — does the generated PDF look correct?
- Print the invoice list view (if navigable) — should the list be hidden in print, or is print only available from the invoice form?
- Very wide invoice number or client name — does the print view handle long text without breaking?
- Print the invoice with 100% discount (total = AED 0.00) — does the print view still show all totals correctly?
