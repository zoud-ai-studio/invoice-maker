export const INVOICE_SCHEMA_VERSION = 1;

export type DecimalValue = number | string;

export type LineItem = {
  id: string;
  description: string;
  quantity: DecimalValue;
  unitPrice: DecimalValue;
};

export type Invoice = {
  schemaVersion: number;
  id: string;
  createdAt: number;
  updatedAt: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  businessName: string;
  businessAddressLine1: string;
  businessAddressLine2: string;
  businessPhone: string;
  clientName: string;
  clientAddressLine1: string;
  clientAddressLine2: string;
  clientPhone: string;
  lineItems: LineItem[];
  discountPercent: DecimalValue;
  vatPercent: DecimalValue;
};

export type DraftLineItem = Omit<LineItem, "quantity" | "unitPrice"> & {
  quantity: string;
  unitPrice: string;
};

export type DraftInvoice = Omit<Invoice, "lineItems" | "discountPercent" | "vatPercent" | "createdAt" | "updatedAt"> & {
  lineItems: DraftLineItem[];
  discountPercent: string;
  vatPercent: string;
};

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(year, month - 1, day + days);
  return [result.getFullYear(), String(result.getMonth() + 1).padStart(2, "0"), String(result.getDate()).padStart(2, "0")].join("-");
}

export function invoiceFromDraft(draft: DraftInvoice, id: string, createdAt: number, updatedAt = createdAt): Invoice {
  return {
    ...draft,
    id,
    createdAt,
    updatedAt,
    lineItems: draft.lineItems.map((item) => ({ ...item })),
  };
}

export function draftFromInvoice(invoice: Invoice): DraftInvoice {
  return {
    ...invoice,
    lineItems: invoice.lineItems.map((item) => ({
      ...item,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
    })),
    discountPercent: String(invoice.discountPercent),
    vatPercent: String(invoice.vatPercent),
  };
}

export function nextAvailableInvoiceNumber(numbers: string[]): string {
  const highest = numbers.reduce((current, number) => {
    const match = /^INV-(\d+)$/.exec(number);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);
  return `INV-${String(highest + 1).padStart(4, "0")}`;
}

export function createDraftInvoice(today: string, existingNumbers: string[] = []): DraftInvoice {
  return {
    schemaVersion: INVOICE_SCHEMA_VERSION,
    id: "draft",
    invoiceNumber: nextAvailableInvoiceNumber(existingNumbers),
    invoiceDate: today,
    dueDate: addDays(today, 14),
    businessName: "",
    businessAddressLine1: "",
    businessAddressLine2: "",
    businessPhone: "",
    clientName: "",
    clientAddressLine1: "",
    clientAddressLine2: "",
    clientPhone: "",
    lineItems: [],
    discountPercent: "0",
    vatPercent: "5",
  };
}

export function emptyDraftLineItem(id: string): DraftLineItem {
  return { id, description: "", quantity: "0", unitPrice: "0" };
}
