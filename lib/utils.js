import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) { return twMerge(clsx(inputs)); }

export function formatMoney(amount, currency = 'USD') {
  const val = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: val % 1 === 0 ? 0 : 2 }).format(val);
  } catch { return `$${val.toFixed(2)}`; }
}

export function shortId() {
  return 'DGM-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}
