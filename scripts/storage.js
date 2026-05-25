const STORAGE_KEY = 'emerloan.loans.v1';

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function getLoans() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = safeJsonParse(raw ?? '[]', []);
  return Array.isArray(parsed) ? parsed : [];
}

export function setLoans(loans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
}

export function upsertLoan(updatedLoan) {
  const loans = getLoans();
  const idx = loans.findIndex((l) => l.id === updatedLoan.id);
  if (idx >= 0) {
    loans[idx] = updatedLoan;
  } else {
    loans.unshift(updatedLoan);
  }
  setLoans(loans);
  return updatedLoan;
}

export function updateLoan(id, patch) {
  const loans = getLoans();
  const idx = loans.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  loans[idx] = { ...loans[idx], ...patch };
  setLoans(loans);
  return loans[idx];
}

export function getLoanById(id) {
  return getLoans().find((l) => l.id === id) ?? null;
}

export function deleteLoan(id) {
  const loans = getLoans();
  const next = loans.filter((l) => l.id !== id);
  setLoans(next);
  return next.length !== loans.length;
}

export function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `loan_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
