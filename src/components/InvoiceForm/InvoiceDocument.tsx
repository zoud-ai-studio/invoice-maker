import { calculateTotals, type InvoiceTotals } from "@/lib/calc";
import { formatAed } from "@/lib/format";
import type { DraftInvoice } from "@/lib/invoice";

type Props = { draft: DraftInvoice; totals: InvoiceTotals };

function address(lines: string[]) {
  return lines.filter((line) => line.trim()).map((line) => <p key={line}>{line}</p>);
}

function unitPrice(value: string) {
  return formatAed(calculateTotals({ lineItems: [{ id: "print-price", description: "", quantity: "1", unitPrice: value }], discountPercent: "0", vatPercent: "0" }).lineAmounts[0]);
}

export function InvoiceDocument({ draft, totals }: Props) {
  return <section className="print-invoice" data-testid="print-invoice" aria-label="Printable invoice">
    <header className="print-heading"><div><p className="eyebrow">Invoice</p><h1>{draft.invoiceNumber}</h1></div><dl><div><dt>Invoice date</dt><dd>{draft.invoiceDate}</dd></div><div><dt>Due date</dt><dd>{draft.dueDate}</dd></div></dl></header>
    <div className="print-parties"><section><h2>From</h2><strong>{draft.businessName || "Business name"}</strong>{address([draft.businessAddressLine1, draft.businessAddressLine2, draft.businessPhone])}</section><section><h2>Bill to</h2><strong>{draft.clientName || "Client name"}</strong>{address([draft.clientAddressLine1, draft.clientAddressLine2, draft.clientPhone])}</section></div>
    <table><thead><tr><th>Description</th><th>Quantity</th><th>Unit price</th><th>Amount</th></tr></thead><tbody>{draft.lineItems.map((item, index) => <tr key={item.id}><td>{item.description || "—"}</td><td>{item.quantity}</td><td>{unitPrice(item.unitPrice)}</td><td>{formatAed(totals.lineAmounts[index])}</td></tr>)}</tbody></table>
    <dl className="print-totals"><div><dt>Subtotal</dt><dd>{formatAed(totals.subtotal)}</dd></div><div><dt>Discount ({draft.discountPercent}%)</dt><dd>-{formatAed(totals.discount)}</dd></div><div><dt>VAT ({draft.vatPercent}%)</dt><dd>{formatAed(totals.vat)}</dd></div><div className="grand-total"><dt>Total</dt><dd>{formatAed(totals.total)}</dd></div></dl>
  </section>;
}
