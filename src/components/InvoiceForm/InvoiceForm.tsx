"use client";

import { useMemo, useState } from "react";
import { calculateTotals } from "@/lib/calc";
import { formatAed } from "@/lib/format";
import { addDays, createDraftInvoice, emptyDraftLineItem, type DraftInvoice } from "@/lib/invoice";

function localDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function numberOrZero(value: string): number {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

export function InvoiceForm() {
  const [draft, setDraft] = useState<DraftInvoice>(() => createDraftInvoice(localDate()));
  const [dueDateEdited, setDueDateEdited] = useState(false);
  const invoice = useMemo(() => ({
    ...draft,
    lineItems: draft.lineItems.map((item) => ({ ...item, quantity: numberOrZero(item.quantity), unitPrice: numberOrZero(item.unitPrice) })),
    discountPercent: numberOrZero(draft.discountPercent),
    vatPercent: numberOrZero(draft.vatPercent),
  }), [draft]);
  const totals = calculateTotals(invoice);

  function update<K extends keyof DraftInvoice>(key: K, value: DraftInvoice[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateLine(id: string, key: "description" | "quantity" | "unitPrice", value: string) {
    setDraft((current) => ({ ...current, lineItems: current.lineItems.map((line) => line.id === id ? { ...line, [key]: value } : line) }));
  }

  return <main className="invoice-shell">
    <header><p className="eyebrow">Invoice Maker</p><h1>Create invoice</h1><p>Prepare a clear invoice with real-time AED totals.</p></header>
    <section className="form-card" aria-label="Invoice details">
      <div className="field-grid">
        <label>Business name<input value={draft.businessName} onChange={(event) => update("businessName", event.target.value)} /></label>
        <label>Client name<input value={draft.clientName} onChange={(event) => update("clientName", event.target.value)} /></label>
        <label>Invoice number<input aria-label="Invoice number" value={draft.invoiceNumber} onChange={(event) => update("invoiceNumber", event.target.value)} /></label>
        <label>Invoice date<input aria-label="Invoice date" type="date" value={draft.invoiceDate} onChange={(event) => {
          const date = event.target.value;
          setDraft((current) => ({ ...current, invoiceDate: date, dueDate: dueDateEdited ? current.dueDate : addDays(date, 14) }));
        }} /></label>
        <label>Due date<input aria-label="Due date" type="date" value={draft.dueDate} onChange={(event) => { setDueDateEdited(true); update("dueDate", event.target.value); }} /></label>
      </div>

      <div className="line-items-heading"><h2>Line items</h2><button type="button" onClick={() => setDraft((current) => ({ ...current, lineItems: [...current.lineItems, emptyDraftLineItem(crypto.randomUUID())] }))}>Add line item</button></div>
      {draft.lineItems.length === 0 ? <p className="empty-state">No line items yet. Add an item to begin.</p> : <div className="line-items" role="table" aria-label="Line items">
        <div className="line-head" role="row"><span>Description</span><span>Quantity</span><span>Unit price</span><span>Amount</span><span>Actions</span></div>
        {draft.lineItems.map((item, index) => <div className="line-row" role="row" key={item.id}>
          <label><span className="sr-only">Description {index + 1}</span><input aria-label={`Description ${index + 1}`} value={item.description} onChange={(event) => updateLine(item.id, "description", event.target.value)} /></label>
          <label><span className="sr-only">Quantity {index + 1}</span><input aria-label={`Quantity ${index + 1}`} type="number" min="0" step="any" value={item.quantity} onChange={(event) => updateLine(item.id, "quantity", event.target.value)} /></label>
          <label><span className="sr-only">Unit price {index + 1}</span><input aria-label={`Unit price ${index + 1}`} type="number" min="0" step="any" value={item.unitPrice} onChange={(event) => updateLine(item.id, "unitPrice", event.target.value)} /></label>
          <output aria-label={`Amount ${index + 1}`}>{formatAed(totals.lineAmounts[index])}</output>
          <button className="remove" type="button" onClick={() => setDraft((current) => ({ ...current, lineItems: current.lineItems.filter((line) => line.id !== item.id) }))}>Remove</button>
        </div>)}
      </div>}

      <div className="summary-area">
        <div className="tax-fields">
          <label>Discount (%)<input aria-label="Discount percentage" type="number" min="0" max="100" step="any" value={draft.discountPercent} onChange={(event) => update("discountPercent", event.target.value)} /></label>
          <label>VAT (%)<input aria-label="VAT percentage" type="number" min="0" max="100" step="any" value={draft.vatPercent} onChange={(event) => update("vatPercent", event.target.value)} /></label>
        </div>
        <dl className="totals"><div><dt>Subtotal</dt><dd>{formatAed(totals.subtotal)}</dd></div><div><dt>Discount</dt><dd>-{formatAed(totals.discount)}</dd></div><div><dt>Subtotal after discount</dt><dd>{formatAed(totals.subtotalAfterDiscount)}</dd></div><div><dt>VAT</dt><dd>{formatAed(totals.vat)}</dd></div><div className="grand-total"><dt>Total</dt><dd>{formatAed(totals.total)}</dd></div></dl>
      </div>
    </section>
  </main>;
}
