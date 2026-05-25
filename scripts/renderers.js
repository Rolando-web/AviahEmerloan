import { escapeHtml } from './dom.js';
import { computeTotals, daysLeft, formatCurrency, formatIso } from './loanMath.js';

export function renderEmptyState(text) {
  return `
    <div class="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-violet-700">
      ${escapeHtml(text)}
    </div>
  `;
}

export function renderActiveLoanCard(loan) {
  const totals = computeTotals(loan);
  const left = daysLeft(loan.dueDate);
  const leftLabel = left === null ? '' : left < 0 ? 'Overdue' : `${left}d left`;
  const leftClass = left !== null && left < 0 ? 'bg-rose-100 text-rose-700' : 'bg-violet-100 text-violet-700';

  return `
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-base font-semibold text-slate-900">${escapeHtml(loan.borrowerName)}</div>
        <div class="text-xs text-slate-500">Created: ${escapeHtml(formatIso(loan.createdAt))}</div>
      </div>
      ${leftLabel ? `<span class="rounded-full px-2 py-1 text-xs font-semibold ${leftClass}">${escapeHtml(leftLabel)}</span>` : ''}
    </div>

    <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="rounded-xl bg-slate-50 p-3">
        <div class="text-xs text-slate-500">Starting Amount</div>
        <div class="mt-1 text-lg font-bold text-slate-900">${escapeHtml(formatCurrency(totals.principal))}</div>
      </div>
      <div class="rounded-xl bg-slate-50 p-3">
        <div class="flex items-baseline justify-between">
          <div class="text-xs text-slate-500">Amount Accumulated</div>
          <div class="text-[10px] font-semibold text-violet-700">+${escapeHtml(String(totals.interestRate))}%</div>
        </div>
        <div class="mt-1 text-lg font-bold text-violet-700">${escapeHtml(formatCurrency(totals.accumulated))}</div>
      </div>
    </div>

    <div class="mt-3 rounded-xl bg-slate-50 p-3">
      <div class="text-xs text-slate-500">Due Date</div>
      <div class="mt-1 text-sm font-semibold text-slate-900">${escapeHtml(formatIso(loan.dueDate))}</div>
    </div>

    <div class="mt-4 flex items-center gap-3">
      <button class="flex-1 rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800" data-action="markPaid" data-id="${escapeHtml(loan.id)}">
        <span class="inline-flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 10-1.214-.882l-3.05 4.2-2.035-2.034a.75.75 0 10-1.06 1.06l2.65 2.65a.75.75 0 001.137-.089l3.572-4.905z" clip-rule="evenodd" />
          </svg>
          Mark as Paid
        </span>
      </button>
      <button class="rounded-xl border border-slate-200 bg-white p-3 text-slate-700 hover:bg-slate-50" aria-label="Edit" data-action="edit" data-id="${escapeHtml(loan.id)}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.5 8.5a1 1 0 01-.39.242l-3 1a1 1 0 01-1.265-1.265l1-3a1 1 0 01.242-.39l8.5-8.5z" />
          <path d="M11.5 5.5l3 3" />
        </svg>
      </button>
    </div>
  </div>
  `;
}

export function renderPaidLoanCard(loan) {
  const totals = computeTotals(loan);
  return `
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <div class="text-base font-semibold text-slate-900">${escapeHtml(loan.borrowerName)}</div>
        <div class="text-xs text-slate-500">Paid: ${escapeHtml(formatIso(loan.paidAt || ''))}</div>
      </div>
      <div class="flex items-center gap-2">
        <span class="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Settled</span>
        <button class="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50" aria-label="Delete" data-action="deletePaid" data-id="${escapeHtml(loan.id)}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
            <path fill-rule="evenodd" d="M8.5 2a1.5 1.5 0 00-1.5 1.5V4H4.75a.75.75 0 000 1.5h.49l.72 11.02A2.25 2.25 0 008.2 18.75h3.6a2.25 2.25 0 002.24-2.23l.72-11.02h.49a.75.75 0 000-1.5H13v-.5A1.5 1.5 0 0011.5 2h-3zM8.5 4h3V3.5a.5.5 0 00-.5-.5H9a.5.5 0 00-.5.5V4z" clip-rule="evenodd" />
            <path d="M9 8.25a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6A.75.75 0 019 8.25z" />
            <path d="M11 8.25a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75z" />
          </svg>
        </button>
      </div>
    </div>

    <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div class="rounded-xl bg-slate-50 p-3">
        <div class="text-xs text-slate-500">Starting Amount</div>
        <div class="mt-1 text-lg font-bold text-slate-900">${escapeHtml(formatCurrency(totals.principal))}</div>
      </div>
      <div class="rounded-xl bg-slate-50 p-3">
        <div class="flex items-baseline justify-between">
          <div class="text-xs text-slate-500">Amount Collected</div>
          <div class="text-[10px] font-semibold text-violet-700">+${escapeHtml(String(totals.interestRate))}%</div>
        </div>
        <div class="mt-1 text-lg font-bold text-violet-700">${escapeHtml(formatCurrency(totals.accumulated))}</div>
      </div>
    </div>
  </div>
  `;
}
