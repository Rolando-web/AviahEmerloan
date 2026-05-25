import { initCommonUi } from './common.js';
import { getLoans, initStorage, updateLoan } from '../storage.js';
import { daysLeft } from '../loanMath.js';
import { escapeHtml, qs, on, setText } from '../dom.js';
import { renderEmptyState } from '../renderers.js';

function getNearDueLoans() {
  return getLoans()
    .filter((l) => l.status === 'active' && !l.notificationDismissed)
    .filter((l) => daysLeft(l.dueDate) === 1);
}

function renderNotificationCard(loan) {
  const due = escapeHtml(String(loan.dueDate || ''));
  const borrower = escapeHtml(String(loan.borrowerName || ''));
  const id = escapeHtml(String(loan.id));

  return `
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm relative pr-10">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-base font-semibold text-slate-900">${borrower}</div>
          <div class="mt-1 text-xs text-slate-500">Due Date</div>
          <div class="text-sm font-semibold text-violet-800">${due}</div>
        </div>
        <span class="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">1d left</span>
      </div>
      <button type="button" class="absolute top-4 right-4 text-slate-400 hover:text-red-500" data-action="dismiss" data-id="${id}" title="Delete Notification">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
        </svg>
      </button>
    </div>
  `;
}

function render() {
  const loans = getNearDueLoans();
  setText(qs('#nearDueCount'), loans.length);

  const container = qs('#notificationsList');
  if (!container) return;

  if (loans.length === 0) {
    container.innerHTML = renderEmptyState('No near due loans');
    return;
  }

  container.innerHTML = loans.map(renderNotificationCard).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUi();
  await initStorage();
  render();

  const container = qs('#notificationsList');
  if (container) {
    on(container, 'click', async (e) => {
      const btn = e.target.closest('[data-action="dismiss"]');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      if (!id) return;
      
      await updateLoan(id, { notificationDismissed: true });
      render();
    });
  }
});
