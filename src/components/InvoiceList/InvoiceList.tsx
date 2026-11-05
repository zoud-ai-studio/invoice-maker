"use client";

import { calculateTotals } from "@/lib/calc";
import { formatAed } from "@/lib/format";
import type { Invoice } from "@/lib/invoice";

type Props = { invoices: Invoice[]; onOpen: (invoice: Invoice) => void; onDuplicate: (invoice: Invoice) => void; onDelete: (invoice: Invoice) => void };

export function InvoiceList({ invoices, onOpen, onDuplicate, onDelete }: Props) {
  if (invoices.length === 0) return <section className="invoice-list" aria-label="Saved invoices"><h1>Saved invoices</h1><p className="empty-state">No invoices to display.</p></section>;
  return <section className="invoice-list" aria-label="Saved invoices"><h1>Saved invoices</h1><div className="invoice-rows">
    {invoices.map((invoice) => <article className="invoice-row" key={invoice.id}>
      <button className="invoice-open" type="button" onClick={() => onOpen(invoice)} aria-label={`Open ${invoice.invoiceNumber}`}>
        <strong>{invoice.invoiceNumber}</strong><span>{invoice.clientName || "No client name"}</span><span>{invoice.invoiceDate}</span><span>{formatAed(calculateTotals(invoice).total)}</span>
      </button>
      <div className="invoice-actions"><button type="button" onClick={() => onDuplicate(invoice)}>Duplicate</button><button className="delete" type="button" onClick={() => onDelete(invoice)}>Delete</button></div>
    </article>)}
  </div></section>;
}
