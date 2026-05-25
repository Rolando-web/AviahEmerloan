import { initCommonUi } from './common.js';
import { getLoans, initStorage } from '../storage.js';
import { daysLeft } from '../loanMath.js';
import { escapeHtml, qs, setText } from '../dom.js';
import { renderEmptyState } from '../renderers.js';

function getNearDueLoans() {
  return getLoans()
    .filter((l) => l.status === 'active')
    .filter((l) => daysLeft(l.dueDate) === 1);
}

function renderNotificationCard(loan) {
  const due = escapeHtml(String(loan.dueDate || ''));
  const borrower = escapeHtml(String(loan.borrowerName || ''));

  return `
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-base font-semibold text-slate-900">${borrower}</div>
          <div class="mt-1 text-xs text-slate-500">Due Date</div>
          <div class="text-sm font-semibold text-violet-800">${due}</div>
        </div>
        <span class="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">1d left</span>
      </div>
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
});
