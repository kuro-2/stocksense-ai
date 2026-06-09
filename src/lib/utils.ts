export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatINRCompact(amount: number): string {
  if (amount >= 10000000000000) return `₹${(amount / 10000000000000).toFixed(1)}L Cr`;
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(0)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return formatINR(amount);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const RECO_CONFIG = {
  STRONG_BUY:  { label: 'Strong Buy',  textClass: 'text-green-700', bgClass: 'bg-green-50',  borderClass: 'border-green-300' },
  BUY:         { label: 'Buy',         textClass: 'text-green-600', bgClass: 'bg-green-50',  borderClass: 'border-green-200' },
  HOLD:        { label: 'Hold',        textClass: 'text-amber-700', bgClass: 'bg-amber-50',  borderClass: 'border-amber-200' },
  SELL:        { label: 'Sell',        textClass: 'text-red-600',   bgClass: 'bg-red-50',    borderClass: 'border-red-200'   },
  STRONG_SELL: { label: 'Strong Sell', textClass: 'text-red-700',   bgClass: 'bg-red-50',    borderClass: 'border-red-300'   },
} as const;

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
