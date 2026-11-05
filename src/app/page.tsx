"use client";

import { useEffect, useState } from "react";
import { InvoiceForm } from "@/components/InvoiceForm/InvoiceForm";
import { InvoiceList } from "@/components/InvoiceList/InvoiceList";
import { draftNumericErrors } from "@/lib/calc";
import { createDraftInvoice, draftFromInvoice, invoiceFromDraft, type DraftInvoice, type Invoice } from "@/lib/invoice";
import { readInvoices, removeInvoice, saveInvoice } from "@/lib/storage";

function today(): string { return new Date().toISOString().slice(0, 10); }
function newId(): string { return crypto.randomUUID(); }

export default function Home() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [draft, setDraft] = useState<DraftInvoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

  useEffect(() => {
    const refresh = () => setInvoices(readInvoices(window.localStorage));
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  function beginNew() { setDraft(createDraftInvoice(today(), invoices.map((invoice) => invoice.invoiceNumber))); }
  function persist(nextDraft: DraftInvoice) {
    const existing = invoices.find((invoice) => invoice.id === nextDraft.id);
    const now = Date.now();
    const invoice = invoiceFromDraft(nextDraft, nextDraft.id === "draft" ? newId() : nextDraft.id, existing?.createdAt ?? now, now);
    setInvoices(saveInvoice(window.localStorage, invoice));
    setDraft(null);
  }
  function duplicate(invoice: Invoice) {
    const copy = draftFromInvoice(invoice);
    setDraft({ ...copy, id: "draft", invoiceNumber: createDraftInvoice(today(), invoices.map((item) => item.invoiceNumber)).invoiceNumber, lineItems: copy.lineItems.map((line) => ({ ...line, id: newId() })) });
  }
  return <main className="invoice-shell">
    {draft ? <InvoiceForm key={draft.id} initialDraft={draft} onSave={persist} onBack={(nextDraft) => Object.keys(draftNumericErrors(nextDraft)).length === 0 ? persist(nextDraft) : setDraft(null)} /> : <>
      <header><p className="eyebrow">Invoice Maker</p><button className="save" type="button" onClick={beginNew}>Create invoice</button></header>
      <InvoiceList invoices={invoices} onOpen={(invoice) => setDraft(draftFromInvoice(invoice))} onDuplicate={duplicate} onDelete={setDeleteTarget} />
      {deleteTarget && <div className="dialog-backdrop" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="delete-title" className="confirm-dialog"><h2 id="delete-title">Delete invoice?</h2><p>This permanently removes {deleteTarget.invoiceNumber}.</p><button type="button" onClick={() => { setInvoices(removeInvoice(window.localStorage, deleteTarget.id)); setDeleteTarget(null); }}>Delete invoice</button><button type="button" onClick={() => setDeleteTarget(null)}>Cancel</button></section></div>}
    </>}
  </main>;
}
