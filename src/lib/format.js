export function formatMoney(value, { cents = true } = {}) {
  if (value == null || Number.isNaN(value)) return '—';
  return `$${value.toFixed(cents ? 2 : 0)}`;
}

export function formatPricePerGallon(value) {
  if (value == null || Number.isNaN(value)) return '—';
  return `$${value.toFixed(3)}/gal`;
}

export function formatCentsDelta(value) {
  if (value == null || Number.isNaN(value)) return '—';
  const cents = value * 100;
  const sign = cents > 0 ? '+' : '';
  return `${sign}${cents.toFixed(1)}¢`;
}

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatShortDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function weekdayFromDateString(iso) {
  // Parse as local date (not UTC) so "the day you filled up" matches your calendar day.
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).getDay();
}

export function monthFromDateString(iso) {
  const [, m] = iso.split('-').map(Number);
  return m; // 1-12
}
