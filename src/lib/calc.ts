import type { Invoice } from "./invoice";

export type InvoiceTotals = {
  lineAmounts: bigint[];
  subtotal: bigint;
  discount: bigint;
  subtotalAfterDiscount: bigint;
  vat: bigint;
  total: bigint;
};

type Decimal = { coefficient: bigint; scale: number };

function decimal(value: number): Decimal {
  const text = Number.isFinite(value) && value >= 0 ? String(value) : "0";
  const [whole, fraction = ""] = text.split(".");
  return { coefficient: BigInt(`${whole}${fraction}`), scale: fraction.length };
}

function roundedFils(coefficient: bigint, scale: number): bigint {
  if (scale <= 2) return coefficient * 10n ** BigInt(2 - scale);
  const factor = 10n ** BigInt(scale - 2);
  const quotient = coefficient / factor;
  return quotient + ((coefficient % factor) * 2n >= factor ? 1n : 0n);
}

function roundHalfUp(coefficient: bigint, scale: number): bigint {
  if (scale === 0) return coefficient;
  const factor = 10n ** BigInt(scale);
  const quotient = coefficient / factor;
  return quotient + ((coefficient % factor) * 2n >= factor ? 1n : 0n);
}

function percentage(amount: bigint, percent: number): bigint {
  const value = decimal(Math.min(100, Math.max(0, percent)));
  return roundHalfUp(amount * value.coefficient, value.scale + 2);
}

export function calculateTotals(invoice: Invoice): InvoiceTotals {
  const lineAmounts = invoice.lineItems.map((item) => {
    const quantity = decimal(item.quantity);
    const unitPrice = decimal(item.unitPrice);
    return roundedFils(quantity.coefficient * unitPrice.coefficient, quantity.scale + unitPrice.scale);
  });
  const subtotal = lineAmounts.reduce((sum, amount) => sum + amount, 0n);
  const discount = percentage(subtotal, invoice.discountPercent);
  const subtotalAfterDiscount = subtotal - discount;
  const vat = percentage(subtotalAfterDiscount, invoice.vatPercent);
  return { lineAmounts, subtotal, discount, subtotalAfterDiscount, vat, total: subtotalAfterDiscount + vat };
}
