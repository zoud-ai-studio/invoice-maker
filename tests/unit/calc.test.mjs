import assert from "node:assert/strict";
import test from "node:test";
import { calculateTotals } from "../../.test-dist/src/lib/calc.js";
import { formatAed } from "../../.test-dist/src/lib/format.js";

const invoice = (overrides = {}) => ({
  schemaVersion: 1,
  id: "draft",
  invoiceNumber: "INV-0001",
  invoiceDate: "2026-11-05",
  dueDate: "2026-11-19",
  businessName: "Studio",
  clientName: "Client",
  lineItems: [],
  discountPercent: 0,
  vatPercent: 5,
  ...overrides,
});

test("calculates a discounted invoice using AED fils", () => {
  const totals = calculateTotals(invoice({
    lineItems: [{ id: "line-1", description: "Design", quantity: 1, unitPrice: 1000 }],
    discountPercent: 10,
  }));

  assert.equal(formatAed(totals.subtotal), "AED 1,000.00");
  assert.equal(formatAed(totals.discount), "AED 100.00");
  assert.equal(formatAed(totals.subtotalAfterDiscount), "AED 900.00");
  assert.equal(formatAed(totals.vat), "AED 45.00");
  assert.equal(formatAed(totals.total), "AED 945.00");
});

test("rounds 0.1 multiplied by 0.2 to AED 0.02 without floating-point drift", () => {
  const totals = calculateTotals(invoice({
    lineItems: [{ id: "line-1", description: "Fraction", quantity: 0.1, unitPrice: 0.2 }],
    vatPercent: 0,
  }));

  assert.equal(formatAed(totals.lineAmounts[0]), "AED 0.02");
  assert.equal(formatAed(totals.subtotal), "AED 0.02");
});

test("handles zero amounts and a full discount", () => {
  const totals = calculateTotals(invoice({
    lineItems: [
      { id: "zero", description: "Zero", quantity: 0, unitPrice: 50 },
      { id: "paid", description: "Work", quantity: 1, unitPrice: 1000 },
    ],
    discountPercent: 100,
  }));

  assert.equal(formatAed(totals.lineAmounts[0]), "AED 0.00");
  assert.equal(formatAed(totals.subtotalAfterDiscount), "AED 0.00");
  assert.equal(formatAed(totals.vat), "AED 0.00");
  assert.equal(formatAed(totals.total), "AED 0.00");
});
