import assert from "node:assert/strict";
import test from "node:test";
import { calculateTotals, parseDecimalText } from "../../.test-dist/src/lib/calc.js";
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

test("ignores invalid percentages when calculating totals", () => {
  const totals = calculateTotals(invoice({
    lineItems: [{ id: "line-1", description: "Design", quantity: 1, unitPrice: 500 }],
    discountPercent: 150,
    vatPercent: 150,
  }));

  assert.equal(formatAed(totals.discount), "AED 0.00");
  assert.equal(formatAed(totals.vat), "AED 0.00");
  assert.equal(formatAed(totals.total), "AED 500.00");
});

test("safely ignores numeric exponential values that cannot be represented exactly", () => {
  const totals = calculateTotals(invoice({
    lineItems: [{ id: "line-1", description: "Unsafe", quantity: 1e21, unitPrice: 1 }],
    vatPercent: 0,
  }));

  assert.equal(formatAed(totals.subtotal), "AED 0.00");
  assert.equal(formatAed(totals.total), "AED 0.00");
});

test("parses raw decimal text without number coercion and rejects unsafe values", () => {
  assert.deepEqual(parseDecimalText("99999999999999999999999"), { error: "Enter a value up to 12 whole digits." });
  assert.deepEqual(parseDecimalText("1e21"), { error: "Enter a base-10 decimal number." });
  assert.deepEqual(parseDecimalText("0.0000001"), { error: "Use no more than 6 decimal places." });
  assert.deepEqual(parseDecimalText("-20", { maximum: "100" }), { error: "Enter a value from 0 to 100." });
  assert.deepEqual(parseDecimalText("150", { maximum: "100" }), { error: "Enter a value from 0 to 100." });
  assert.deepEqual(parseDecimalText("0.125"), { decimal: { coefficient: 125n, scale: 3 } });
});
