import assert from "node:assert/strict";
import test from "node:test";
import { INVOICE_STORAGE_KEY, readInvoices, removeInvoice, saveInvoice } from "../../.test-dist/src/lib/storage.js";

class MemoryStorage { values = new Map(); getItem(key) { return this.values.get(key) ?? null; } setItem(key, value) { this.values.set(key, value); } }
const invoice = (id, updatedAt, overrides = {}) => ({ schemaVersion: 1, id, createdAt: 1, updatedAt, invoiceNumber: `INV-${id}`, invoiceDate: "2026-11-05", dueDate: "2026-11-19", businessName: "Studio", businessAddressLine1: "", businessAddressLine2: "", businessPhone: "", clientName: "Client", clientAddressLine1: "", clientAddressLine2: "", clientPhone: "", lineItems: [], discountPercent: "0", vatPercent: "5", ...overrides });

test("stores invoices across reads and sorts most recently modified first", () => {
  const storage = new MemoryStorage();
  saveInvoice(storage, invoice("a", 10)); saveInvoice(storage, invoice("b", 20));
  assert.deepEqual(readInvoices(storage).map((item) => item.id), ["b", "a"]);
});
test("updates one record without dropping another and deletes permanently", () => {
  const storage = new MemoryStorage();
  saveInvoice(storage, invoice("a", 10)); saveInvoice(storage, invoice("b", 20)); saveInvoice(storage, invoice("a", 30, { clientName: "Updated" }));
  assert.deepEqual(readInvoices(storage).map((item) => item.id), ["a", "b"]);
  assert.equal(readInvoices(storage)[0].clientName, "Updated");
  assert.deepEqual(removeInvoice(storage, "a").map((item) => item.id), ["b"]);
});
test("ignores malformed, future-version, and invalid saved records", () => {
  const storage = new MemoryStorage();
  storage.setItem(INVOICE_STORAGE_KEY, "not json"); assert.deepEqual(readInvoices(storage), []);
  storage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ schemaVersion: 99, invoices: [invoice("a", 1)] })); assert.deepEqual(readInvoices(storage), []);
  storage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, invoices: [invoice("a", 1), { id: "bad" }] })); assert.deepEqual(readInvoices(storage).map((item) => item.id), ["a"]);
  storage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, invoices: [invoice("a", 1, { vatPercent: "101" })] })); assert.deepEqual(readInvoices(storage), []);
});
