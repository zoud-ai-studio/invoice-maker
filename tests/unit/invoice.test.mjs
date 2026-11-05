import assert from "node:assert/strict";
import test from "node:test";
import { addDays, createDraftInvoice, formatLocalDate, nextAvailableInvoiceNumber } from "../../.test-dist/src/lib/invoice.js";

test("creates an editable draft with the next available invoice number", () => {
  const draft = createDraftInvoice("2026-11-05", ["INV-0001", "INV-0003"]);
  assert.equal(draft.invoiceNumber, "INV-0004");
  assert.equal(draft.invoiceDate, "2026-11-05");
  assert.equal(draft.dueDate, "2026-11-19");
  assert.equal(draft.businessAddressLine1, "");
  assert.equal(draft.businessAddressLine2, "");
  assert.equal(draft.businessPhone, "");
  assert.equal(draft.clientAddressLine1, "");
  assert.equal(draft.clientAddressLine2, "");
  assert.equal(draft.clientPhone, "");
  assert.deepEqual(draft.lineItems, []);
});

test("finds the next number after the highest matching invoice number", () => {
  assert.equal(nextAvailableInvoiceNumber(["DRAFT", "INV-0009", "INV-0010"]), "INV-0011");
  assert.equal(addDays("2026-12-25", 14), "2027-01-08");
});

test("formats a default invoice date from local calendar parts", () => {
  assert.equal(formatLocalDate({ getFullYear: () => 2026, getMonth: () => 10, getDate: () => 5 }), "2026-11-05");
});
