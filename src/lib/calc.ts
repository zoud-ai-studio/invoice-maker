import type { DecimalValue, DraftInvoice, Invoice } from "./invoice";

export type InvoiceTotals = {
  lineAmounts: bigint[];
  subtotal: bigint;
  discount: bigint;
  subtotalAfterDiscount: bigint;
  vat: bigint;
  total: bigint;
};

export type Decimal = { coefficient: bigint; scale: number };
export type DecimalParseResult = { decimal: Decimal } | { error: string };

const MAX_WHOLE_DIGITS = 12;
const MAX_DECIMAL_PLACES = 6;
const ZERO: Decimal = { coefficient: 0n, scale: 0 };
const ONE_HUNDRED: Decimal = { coefficient: 100n, scale: 0 };

export function parseDecimalText(value: string, options: { maximum?: string } = {}): DecimalParseResult {
  if (/^-\d+(?:\.\d+)?$/.test(value)) return { error: options.maximum ? `Enter a value from 0 to ${options.maximum}.` : "Enter a non-negative value." };
  if (!/^\d+(?:\.\d+)?$/.test(value)) return { error: "Enter a base-10 decimal number." };
  const [whole, fraction = ""] = value.split(".");
  const significantWhole = whole.replace(/^0+/, "") || "0";
  if (significantWhole.length > MAX_WHOLE_DIGITS) return { error: `Enter a value up to ${MAX_WHOLE_DIGITS} whole digits.` };
  if (fraction.length > MAX_DECIMAL_PLACES) return { error: `Use no more than ${MAX_DECIMAL_PLACES} decimal places.` };
  const parsed = { coefficient: BigInt(`${whole}${fraction}`), scale: fraction.length };
  if (options.maximum) {
    const maximum = parseDecimalText(options.maximum);
    if ("decimal" in maximum && compareDecimals(parsed, maximum.decimal) > 0) return { error: `Enter a value from 0 to ${options.maximum}.` };
  }
  return { decimal: parsed };
}

function compareDecimals(left: Decimal, right: Decimal): number {
  const scale = Math.max(left.scale, right.scale);
  const leftCoefficient = left.coefficient * 10n ** BigInt(scale - left.scale);
  const rightCoefficient = right.coefficient * 10n ** BigInt(scale - right.scale);
  return leftCoefficient === rightCoefficient ? 0 : leftCoefficient > rightCoefficient ? 1 : -1;
}

function decimal(value: DecimalValue): Decimal {
  if (typeof value === "string") {
    const parsed = parseDecimalText(value);
    return "decimal" in parsed ? parsed.decimal : ZERO;
  }
  if (!Number.isFinite(value) || value < 0) return ZERO;
  const rounded = value.toFixed(MAX_DECIMAL_PLACES).replace(/0+$/, "").replace(/\.$/, "");
  const parsed = parseDecimalText(rounded);
  return "decimal" in parsed ? parsed.decimal : ZERO;
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

function percentage(amount: bigint, percent: DecimalValue): bigint {
  const value = decimal(percent);
  if (compareDecimals(value, ONE_HUNDRED) > 0) return 0n;
  return roundHalfUp(amount * value.coefficient, value.scale + 2);
}

export function draftNumericErrors(draft: DraftInvoice): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const item of draft.lineItems) {
    for (const [key, value] of [["quantity", item.quantity], ["unitPrice", item.unitPrice]] as const) {
      const result = parseDecimalText(value);
      if ("error" in result) errors[`${item.id}.${key}`] = result.error;
    }
  }
  for (const [key, value] of [["discountPercent", draft.discountPercent], ["vatPercent", draft.vatPercent]] as const) {
    const result = parseDecimalText(value, { maximum: "100" });
    if ("error" in result) errors[key] = result.error;
  }
  return errors;
}

export function calculateTotals(invoice: Pick<Invoice, "lineItems" | "discountPercent" | "vatPercent">): InvoiceTotals {
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
