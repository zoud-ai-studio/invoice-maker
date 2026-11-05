import { INVOICE_SCHEMA_VERSION, type Invoice } from "./invoice";

export const INVOICE_STORAGE_KEY = "invoice-maker:invoices:v1";

type StorageLike = Pick<Storage, "getItem" | "setItem">;
type Envelope = { schemaVersion: number; invoices: Invoice[] };

function isText(value: unknown): value is string { return typeof value === "string"; }
function isDecimal(value: unknown): value is string | number {
  return (typeof value === "number" && Number.isFinite(value) && value >= 0) || (typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value));
}

function isPercentage(value: unknown): boolean {
  return isDecimal(value) && Number(value) <= 100;
}

export function isInvoice(value: unknown): value is Invoice {
  if (!value || typeof value !== "object") return false;
  const invoice = value as Record<string, unknown>;
  return invoice.schemaVersion === INVOICE_SCHEMA_VERSION && isText(invoice.id) && isText(invoice.invoiceNumber)
    && isText(invoice.invoiceDate) && isText(invoice.dueDate) && typeof invoice.createdAt === "number"
    && Number.isFinite(invoice.createdAt) && typeof invoice.updatedAt === "number" && Number.isFinite(invoice.updatedAt)
    && ["businessName", "businessAddressLine1", "businessAddressLine2", "businessPhone", "clientName", "clientAddressLine1", "clientAddressLine2", "clientPhone"].every((key) => isText(invoice[key]))
    && isPercentage(invoice.discountPercent) && isPercentage(invoice.vatPercent) && Array.isArray(invoice.lineItems)
    && invoice.lineItems.every((line) => line && typeof line === "object" && isText((line as Record<string, unknown>).id)
      && isText((line as Record<string, unknown>).description) && isDecimal((line as Record<string, unknown>).quantity)
      && isDecimal((line as Record<string, unknown>).unitPrice));
}

function sorted(invoices: Invoice[]): Invoice[] {
  return [...invoices].sort((left, right) => right.updatedAt - left.updatedAt || right.id.localeCompare(left.id));
}

export function readInvoices(storage: StorageLike): Invoice[] {
  const raw = storage.getItem(INVOICE_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Partial<Envelope>;
    if (parsed.schemaVersion !== INVOICE_SCHEMA_VERSION || !Array.isArray(parsed.invoices)) return [];
    return sorted(parsed.invoices.filter(isInvoice));
  } catch { return []; }
}

export function saveInvoice(storage: StorageLike, invoice: Invoice): Invoice[] {
  if (!isInvoice(invoice)) throw new Error("Cannot save an invalid invoice.");
  const current = readInvoices(storage);
  const next = sorted([...current.filter((item) => item.id !== invoice.id), invoice]);
  storage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ schemaVersion: INVOICE_SCHEMA_VERSION, invoices: next } satisfies Envelope));
  return next;
}

export function removeInvoice(storage: StorageLike, id: string): Invoice[] {
  const next = readInvoices(storage).filter((invoice) => invoice.id !== id);
  storage.setItem(INVOICE_STORAGE_KEY, JSON.stringify({ schemaVersion: INVOICE_SCHEMA_VERSION, invoices: next } satisfies Envelope));
  return next;
}
