export function formatAed(fils: bigint): string {
  const sign = fils < 0n ? "-" : "";
  const amount = fils < 0n ? -fils : fils;
  const whole = (amount / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fraction = (amount % 100n).toString().padStart(2, "0");
  return `AED ${sign}${whole}.${fraction}`;
}
