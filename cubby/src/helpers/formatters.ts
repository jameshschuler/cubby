export function formatCurrency(amount: number): string {
  // Show cents only when there are some, so "$1,200" stays compact but "$12.50" isn't rounded.
  const fractionDigits = Math.round(amount * 100) % 100 === 0 ? 0 : 2;

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
