export const INVOICE_SCHEMA_VERSION = 1;

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  schemaVersion: number;
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  businessName: string;
  clientName: string;
  lineItems: LineItem[];
  discountPercent: number;
  vatPercent: number;
};

export type DraftLineItem = Omit<LineItem, "quantity" | "unitPrice"> & {
  quantity: string;
  unitPrice: string;
};

export type DraftInvoice = Omit<Invoice, "lineItems" | "discountPercent" | "vatPercent"> & {
  lineItems: DraftLineItem[];
  discountPercent: string;
  vatPercent: string;
};

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const result = new Date(year, month - 1, day + days);
  return [result.getFullYear(), String(result.getMonth() + 1).padStart(2, "0"), String(result.getDate()).padStart(2, "0")].join("-");
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
    clientName: "",
    lineItems: [],
    discountPercent: "0",
    vatPercent: "5",
  };
}

export function emptyDraftLineItem(id: string): DraftLineItem {
  return { id, description: "", quantity: "0", unitPrice: "0" };
}
