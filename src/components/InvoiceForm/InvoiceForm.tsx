"use client";

import { useMemo, useState } from "react";
import { calculateTotals, draftNumericErrors } from "@/lib/calc";
import { formatAed } from "@/lib/format";
import { addDays, createDraftInvoice, draftFieldErrors, emptyDraftLineItem, isValidDate, type DraftInvoice } from "@/lib/invoice";
import { InvoiceDocument } from "./InvoiceDocument";

function localDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

type Props = { initialDraft?: DraftInvoice; onSave?: (draft: DraftInvoice) => boolean; onBack?: (draft: DraftInvoice, changed: boolean) => void; };

export function InvoiceForm({ initialDraft, onSave, onBack }: Props) {
  const [draft, setDraft] = useState<DraftInvoice>(() => initialDraft ?? createDraftInvoice(localDate()));
  const [dueDateEdited, setDueDateEdited] = useState(() => initialDraft?.id !== undefined && initialDraft.id !== "draft");
  const [actionError, setActionError] = useState("");
  const initialDraftSnapshot = useMemo(() => JSON.stringify(initialDraft ?? draft), []);
  const errors = useMemo(() => ({ ...draftFieldErrors(draft), ...draftNumericErrors(draft) }), [draft]);
  const totals = calculateTotals(draft);

  function update<K extends keyof DraftInvoice>(key: K, value: DraftInvoice[K]) {
    setActionError("");
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateLine(id: string, key: "description" | "quantity" | "unitPrice", value: string) {
    setActionError("");
    setDraft((current) => ({ ...current, lineItems: current.lineItems.map((line) => line.id === id ? { ...line, [key]: value } : line) }));
  }

  function save() {
    if (Object.keys(errors).length > 0) return;
    if (!onSave?.(draft)) setActionError("Could not save this invoice. Your edits are still on this form.");
  }

  function back() {
    if (errors.invoiceNumber) { setActionError("Enter an invoice number before returning."); return; }
    if (Object.keys(errors).length > 0) { setActionError("Fix the highlighted fields before returning."); return; }
    onBack?.(draft, JSON.stringify(draft) !== initialDraftSnapshot);
  }

  return <main className="invoice-shell">
    <header className="screen-only"><p className="eyebrow">Invoice Maker</p><h1>{draft.id === "draft" ? "Create invoice" : "Edit invoice"}</h1><p>Prepare a clear invoice with real-time AED totals.</p>{onBack && <button type="button" className="back" onClick={back}>Back to invoices</button>}</header>
    <section className="form-card screen-only" aria-label="Invoice details">
      <div className="field-grid">
        <label>Business name<input value={draft.businessName} onChange={(event) => update("businessName", event.target.value)} /></label>
        <label>Business address line 1<input value={draft.businessAddressLine1} onChange={(event) => update("businessAddressLine1", event.target.value)} /></label>
        <label>Business address line 2<input value={draft.businessAddressLine2} onChange={(event) => update("businessAddressLine2", event.target.value)} /></label>
        <label>Business phone<input type="tel" value={draft.businessPhone} onChange={(event) => update("businessPhone", event.target.value)} /></label>
        <label>Client name<input value={draft.clientName} onChange={(event) => update("clientName", event.target.value)} /></label>
        <label>Client address line 1<input value={draft.clientAddressLine1} onChange={(event) => update("clientAddressLine1", event.target.value)} /></label>
        <label>Client address line 2<input value={draft.clientAddressLine2} onChange={(event) => update("clientAddressLine2", event.target.value)} /></label>
        <label>Client phone<input type="tel" value={draft.clientPhone} onChange={(event) => update("clientPhone", event.target.value)} /></label>
        <label>Invoice number<input aria-label="Invoice number" aria-invalid={Boolean(errors.invoiceNumber)} value={draft.invoiceNumber} onChange={(event) => update("invoiceNumber", event.target.value)} />{errors.invoiceNumber && <span className="field-error">{errors.invoiceNumber}</span>}</label>
        <label>Invoice date<input aria-label="Invoice date" type="date" value={draft.invoiceDate} onChange={(event) => {
          const date = event.target.value;
          setActionError("");
          setDraft((current) => ({ ...current, invoiceDate: date, dueDate: dueDateEdited || !isValidDate(date) ? current.dueDate : addDays(date, 14) }));
        }} />{errors.invoiceDate && <span className="field-error">{errors.invoiceDate}</span>}</label>
        <label>Due date<input aria-label="Due date" type="date" aria-invalid={Boolean(errors.dueDate)} value={draft.dueDate} onChange={(event) => { setDueDateEdited(true); update("dueDate", event.target.value); }} />{errors.dueDate && <span className="field-error">{errors.dueDate}</span>}</label>
      </div>

      <div className="line-items-heading"><h2>Line items</h2><button type="button" onClick={() => setDraft((current) => ({ ...current, lineItems: [...current.lineItems, emptyDraftLineItem(crypto.randomUUID())] }))}>Add line item</button></div>
      {draft.lineItems.length === 0 ? <p className="empty-state">No line items yet. Add an item to begin.</p> : <div className="line-items" role="table" aria-label="Line items">
        <div className="line-head" role="row"><span>Description</span><span>Quantity</span><span>Unit price</span><span>Amount</span><span>Actions</span></div>
        {draft.lineItems.map((item, index) => <div className="line-row" role="row" key={item.id}>
          <label><span className="sr-only">Description {index + 1}</span><input aria-label={`Description ${index + 1}`} value={item.description} onChange={(event) => updateLine(item.id, "description", event.target.value)} /></label>
          <label><span className="sr-only">Quantity {index + 1}</span><input aria-label={`Quantity ${index + 1}`} inputMode="decimal" aria-invalid={Boolean(errors[`${item.id}.quantity`])} aria-describedby={errors[`${item.id}.quantity`] ? `quantity-error-${item.id}` : undefined} value={item.quantity} onChange={(event) => updateLine(item.id, "quantity", event.target.value)} />{errors[`${item.id}.quantity`] && <span className="field-error" id={`quantity-error-${item.id}`}>{errors[`${item.id}.quantity`]}</span>}</label>
          <label><span className="sr-only">Unit price {index + 1}</span><input aria-label={`Unit price ${index + 1}`} inputMode="decimal" aria-invalid={Boolean(errors[`${item.id}.unitPrice`])} aria-describedby={errors[`${item.id}.unitPrice`] ? `unit-price-error-${item.id}` : undefined} value={item.unitPrice} onChange={(event) => updateLine(item.id, "unitPrice", event.target.value)} />{errors[`${item.id}.unitPrice`] && <span className="field-error" id={`unit-price-error-${item.id}`}>{errors[`${item.id}.unitPrice`]}</span>}</label>
          <output aria-label={`Amount ${index + 1}`}>{formatAed(totals.lineAmounts[index])}</output>
          <button className="remove" type="button" onClick={() => setDraft((current) => ({ ...current, lineItems: current.lineItems.filter((line) => line.id !== item.id) }))}>Remove</button>
        </div>)}
      </div>}

      <div className="summary-area">
        <div className="tax-fields">
          <label>Discount (%)<input aria-label="Discount percentage" inputMode="decimal" aria-invalid={Boolean(errors.discountPercent)} aria-describedby={errors.discountPercent ? "discount-error" : undefined} value={draft.discountPercent} onChange={(event) => update("discountPercent", event.target.value)} />{errors.discountPercent && <span className="field-error" id="discount-error">{errors.discountPercent}</span>}</label>
          <label>VAT (%)<input aria-label="VAT percentage" inputMode="decimal" aria-invalid={Boolean(errors.vatPercent)} aria-describedby={errors.vatPercent ? "vat-error" : undefined} value={draft.vatPercent} onChange={(event) => update("vatPercent", event.target.value)} />{errors.vatPercent && <span className="field-error" id="vat-error">{errors.vatPercent}</span>}</label>
        </div>
        <dl className="totals"><div><dt>Subtotal</dt><dd>{formatAed(totals.subtotal)}</dd></div><div><dt>Discount</dt><dd>-{formatAed(totals.discount)}</dd></div><div><dt>Subtotal after discount</dt><dd>{formatAed(totals.subtotalAfterDiscount)}</dd></div><div><dt>VAT</dt><dd>{formatAed(totals.vat)}</dd></div><div className="grand-total"><dt>Total</dt><dd>{formatAed(totals.total)}</dd></div></dl>
      </div>
      {actionError && <p className="action-error" role="alert">{actionError}</p>}
      {onSave && <button type="button" className="save" disabled={Object.keys(errors).length > 0} onClick={save}>Save invoice</button>}
      <button type="button" className="print-button" disabled={Object.keys(errors).length > 0} onClick={() => window.print()}>Print invoice</button>
    </section>
    <InvoiceDocument draft={draft} totals={totals} />
  </main>;
}
