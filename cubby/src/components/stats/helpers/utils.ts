export function formatAccountTypeLabel(accountType?: string): string {
  if (!accountType) {
    return '';
  }

  return accountType
    .split(' ')
    .map((part) => {
      if (part === 'ira' || part === 'hysa' || part === 'hsa' || part === 'utma') {
        return part.toUpperCase();
      }

      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

export function getMonthName(monthIndex: number): string {
  return new Date(2026, monthIndex, 1).toLocaleDateString(undefined, { month: 'long' });
}

export function formatMonthKeyLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });
}
