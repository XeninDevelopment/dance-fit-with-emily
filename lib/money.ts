// Money helpers. Amounts are always stored and sent to Stripe as integer MINOR units
// (e.g. pence) to avoid floating-point errors.

// Currencies Stripe treats as zero-decimal (the amount is already the smallest unit).
const ZERO_DECIMAL = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg",
  "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
]);

export function isZeroDecimal(currency: string): boolean {
  return ZERO_DECIMAL.has(currency.toLowerCase());
}

/** Convert a major-unit amount (e.g. 12.50) to minor units (e.g. 1250). */
export function toMinorUnits(amountMajor: number, currency: string): number {
  if (isZeroDecimal(currency)) return Math.round(amountMajor);
  return Math.round(amountMajor * 100);
}

/** Convert minor units back to a major-unit number. */
export function toMajorUnits(amountMinor: number, currency: string): number {
  if (isZeroDecimal(currency)) return amountMinor;
  return amountMinor / 100;
}

/** Format a minor-unit amount as a localized currency string, e.g. "£12.50". */
export function formatMoney(amountMinor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(toMajorUnits(amountMinor, currency));
  } catch {
    return `${toMajorUnits(amountMinor, currency)} ${currency.toUpperCase()}`;
  }
}

export const SUPPORTED_CURRENCIES = ["gbp", "usd", "eur"] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
