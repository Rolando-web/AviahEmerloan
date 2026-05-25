export function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function normalizeIsoDate(dateString) {
  // Accepts yyyy-mm-dd (from input[type=date]) or Date-ish strings
  if (!dateString) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function formatIso(iso) {
  return normalizeIsoDate(iso);
}

export function formatCurrency(amount) {
  const n = toNumber(amount);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function computeTotals({ amount, interestRate }) {
  const principal = toNumber(amount);
  const rate = toNumber(interestRate);
  const interest = principal * (rate / 100);
  const accumulated = principal + interest;
  return {
    principal,
    interestRate: rate,
    interest,
    accumulated,
  };
}

export function daysLeft(dueDateIso, now = new Date()) {
  const due = new Date(`${normalizeIsoDate(dueDateIso)}T00:00:00`);
  if (Number.isNaN(due.getTime())) return null;
  const start = new Date(`${now.toISOString().slice(0, 10)}T00:00:00`);
  const diffMs = due.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function inDateRange(iso, fromIso, toIso) {
  const d = normalizeIsoDate(iso);
  if (!d) return false;
  const from = fromIso ? normalizeIsoDate(fromIso) : '';
  const to = toIso ? normalizeIsoDate(toIso) : '';
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}
