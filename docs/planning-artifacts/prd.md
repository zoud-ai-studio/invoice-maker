---
title: Invoice Maker
created: 2026-11-05
updated: 2026-11-05
status: draft
---

# PRD: Invoice Maker

*Working title — confirm.*

## 0. Document Purpose

This PRD defines a static web application that lets freelancers create, save, and print professional invoices directly in the browser. It is aimed at the product manager, architect, and engineers who will implement it. Features are grouped by user journey with globally-numbered functional requirements (FR-1 through FR-N).

## 1. Vision

A freelancer needs to send an invoice quickly — without signing up, installing anything, or configuring a server. Invoice Maker delivers a single-page app that runs from a static site: the user opens the page, fills in business and client details, adds line items, and prints (or saves as PDF) the finished invoice.

The product is intentionally small. There is no account system, no database, no email sending. All invoices live in the browser's local storage on the device where they are created. The goal is a fast, reliable tool that works offline and prints beautifully on A4.

## 2. Target User

### 2.1 Jobs To Be Done

- **Functional**: Create a professional-looking invoice with line items, calculate tax and totals automatically, save it locally, and print or export as PDF.
- **Contextual**: Do it in one sitting without friction — no account, no waiting, no downloads.
- **Emotional**: Feel confident the invoice looks professional and the numbers are correct.

### 2.2 Key User Journeys

- **UJ-1. Freelancer creates and prints an invoice from scratch.**
  - **Persona + context**: Mary, a freelance graphic designer in Dubai, needs to bill a client for a completed project.
  - **Entry state**: Opens `index.html` in the browser, sees an empty invoice form.
  - **Path**:
    1. Fills in her business name, address, and phone number.
    2. Enters the client's name and address.
    3. Sets the invoice number (auto-generated, editable) and dates.
    4. Adds line items: description, quantity, unit price.
    5. Adjusts the discount percentage if applicable.
    6. Sees subtotal, VAT (5% default), and total update in real time.
    7. Clicks "Print invoice" → browser print dialog opens.
    8. Prints or saves as PDF through the browser's print window.
  - **Climax**: The printed invoice shows all details cleanly with no buttons or form controls visible — looks like a document sent to a client.
  - **Resolution**: Mary has a printed/saved PDF invoice. She returns to the list view later to see it saved.
  - **Edge case**: If she closes the tab and reopens it, her saved invoices are still there.

## 3. Glossary

- **Invoice** — A document representing a bill sent by a freelancer to a client. Contains business details, client details, invoice number, dates, line items, and totals.
- **Line item** — A single row in the invoice containing a description, quantity, and unit price.
- **Totals** — The computed financial summary: subtotal (sum of line item amounts), discount (optional percentage off subtotal), VAT (percentage of subtotal after discount), and total (subtotal minus discount plus VAT).
- **Saved invoice** — An invoice stored in the browser's local storage, retrievable on page reload.
- **Print view** — A print-optimized CSS view that hides UI chrome (buttons, forms) and formats the invoice for A4 paper.

## 4. Features

### 4.1 Invoice Creation

**Description:** The primary surface is an invoice creation form. The user enters business details, client details, invoice metadata (number, dates), and line items. All calculations update in real time.

**Functional Requirements:**

#### FR-1: Business and client detail fields

The user can enter their business name, address (line 1, line 2), and phone number, and the client's name, address (line 1, line 2), and phone number.

**Consequences (testable):**
- All fields accept free-form text and render correctly in the print view.
- Empty business/client fields still produce a valid invoice with those sections hidden in the print view.

#### FR-2: Invoice number and dates

The user can set the invoice number and the invoice date and due date. The invoice number defaults to a generated value (e.g. "INV-0001") and is editable.

**Consequences (testable):**
- The invoice number defaults to a non-empty value.
- The invoice date defaults to the current date.
- Due date defaults to 14 days after the invoice date.
- All date fields accept date input and display in a locale-appropriate format.

#### FR-3: Line items

The user can add, edit, and remove line items. Each line item has a description, quantity (number), and unit price (number).

**Consequences (testable):**
- Adding a line item creates a new row with empty description and quantity 0, unit price 0.
- Removing the last line item shows an empty state prompting "Add item."
- Editing any field on a line item triggers immediate recalculation of totals.

#### FR-4: Totals calculation

The system shows subtotal, optional discount (%), VAT (default 5%, editable), and total. These update immediately on any change to line items, discount, or VAT.

**Consequences (testable):**
- Subtotal equals the sum of (quantity × unit price) for all line items.
- Discount is a percentage applied to the subtotal (e.g. 10% discount on AED 1,000 = AED 100 off).
- VAT is a percentage applied to the subtotal after discount.
- Total equals (subtotal − discount amount) + VAT amount.
- `0.1 + 0.2` equals `0.3` (no floating-point rounding errors visible).
- Quantity 0 produces a line item amount of 0.
- 100% discount shows subtotal as AED 0.00, discount equal to the subtotal, VAT on zero, and total as AED 0.00.

### 4.2 Saving and Managing Invoices

**Description:** Invoices are saved in the browser's local storage. The user can view a list of saved invoices, open any one for editing, duplicate any saved invoice, or delete it.

**Functional Requirements:**

#### FR-5: Persist and restore invoices

The system saves every invoice in the browser's local storage automatically.

**Consequences (testable):**
- A saved invoice is still there after reloading the page.
- Each saved invoice has a unique internal ID for lookup.

#### FR-6: Invoice list

The user can view a list of saved invoices showing the invoice number, client name, date, and total amount.

**Consequences (testable):**
- The list shows zero invoices when no invoices have been saved yet.
- Clicking an invoice in the list opens it for editing.
- The list sorts with the most recently modified invoice first.

#### FR-7: Duplicate and delete

The user can duplicate any saved invoice (creates a copy with a new invoice number) and delete any saved invoice.

**Consequences (testable):**
- Duplicating an invoice opens a copy for editing with all line items preserved.
- Deleting an invoice removes it from the list permanently.
- A confirmation dialog appears before deletion.

### 4.3 Print and Responsive Design

**Description:** The invoice can be printed or saved as PDF through the browser's print window. The page must be responsive across mobile and desktop viewports.

**Functional Requirements:**

#### FR-8: Print view

When the user clicks "Print invoice" or triggers a browser print, the print view hides buttons and forms and formats the invoice for A4 paper.

**Consequences (testable):**
- The printed view hides all UI chrome: "Print invoice" button, edit forms, delete buttons.
- The printed view fits on A4 paper without horizontal overflow.
- The print view shows all invoice content: business details, client details, line items, totals.

#### FR-9: Responsive layout

The page must work correctly at 375px and 1280px viewport widths.

**Consequences (testable):**
- At 375px (iPhone SE width), the invoice form is readable and all inputs are accessible without horizontal scrolling.
- At 1280px, the layout uses available space efficiently without excessive stretching.
- The print view is not affected by responsive breakpoints (print CSS is independent).

## 5. Non-Goals (Explicit)

- Login or user accounts.
- Server-side storage or database.
- Sending invoices via email.
- Multiple currencies (AED only).
- Payments or invoicing templates beyond the single default layout.
- Collaborative editing.
- Mobile app (native or PWA).

## 6. MVP Scope

### 6.1 In Scope

- Single-page invoice creation form with all fields described above.
- Real-time totals calculation with AED formatting.
- Local storage persistence with list, open, duplicate, and delete.
- Print-optimized view for A4 paper.
- Responsive design at 375px and 1280px.
- Static build producing `out/index.html`.

### 6.2 Out of Scope for MVP

- PDF download button (relies on browser print dialog only).
- Auto-incrementing invoice numbers across sessions (uses generated value per creation).
- Search or filter in the invoice list.
- Export/import invoices.
- Dark mode or theme switcher.

## 7. Success Metrics

**Primary**
- **SM-1**: The application builds without errors and `npm run build` produces `out/index.html`. Validates FR-8 (static site), FR-9 (responsive).

**Counter-metrics (do not optimize)**
- **SM-C1**: Do not add any network requests, analytics, or external API calls. The app must work fully offline.

## 8. Open Questions

1. Invoice number format — is "INV-0001" acceptable, or does the user have a preferred format (e.g. "2026-001", "INV-2026-001")?
2. Due date default — is 14 days standard, or should it be configurable (e.g. 7, 14, 30 days)?
3. "Print invoice" button label — confirmed as exact text?
4. Business details — are phone number fields required, or can they be optional?
5. Client details — is the client name required, or can an invoice be created without a client name?

## 9. Assumptions Index

- `[ASSUMPTION: Currency]` All amounts are displayed in AED with the format "AED 1,250.00" (comma thousands separator, two decimal places).
- `[ASSUMPTION: VAT]` VAT defaults to 5% and is editable by the user.
- `[ASSUMPTION: Static site]` The project is a static site built with Next.js (or similar) that outputs to `out/`. No server is needed.
- `[ASSUMPTION: Next.js tech]` The project uses Next.js with TypeScript and ESLint, as established by the repo's AGENTS.md default stack.
- `[ASSUMPTION: Invoice number auto-increment]` Invoice numbers increment globally across sessions within the same browser (e.g. next INV-0002 after INV-0001 is saved).
- `[ASSUMPTION: Save trigger]` Invoices are saved automatically when the user navigates away from the invoice form or explicitly clicks a "Save" action, and persist in localStorage.
- `[ASSUMPTION: System font]` "System font" means the CSS `font-family` falls back to the operating system default sans-serif font stack (e.g. `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`).
- `[ASSUMPTION: Print behavior]` The "Print invoice" button triggers `window.print()` in the browser, relying on the browser's built-in print-to-PDF capability.
