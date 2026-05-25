import { initCommonUi } from './common.js';
import { deleteLoan, getLoanById, getLoans, initStorage } from '../storage.js';
import { computeTotals, formatCurrency } from '../loanMath.js';
import { qs, setText } from '../dom.js';
import { renderEmptyState, renderPaidLoanCard } from '../renderers.js';

function getPaidLoans() {
  return getLoans().filter((l) => l.status === 'paid');
}

function render() {
  const loans = getPaidLoans();
  setText(qs('#totalSettled'), loans.length);

  const totalCollected = loans.reduce((sum, l) => sum + computeTotals(l).accumulated, 0);
  setText(qs('#totalCollected'), formatCurrency(totalCollected));

  const list = qs('#paidLoansList');
  if (!list) return;

  if (loans.length === 0) {
    list.innerHTML = renderEmptyState('No settled loans yet');
    return;
  }

  list.innerHTML = loans.map(renderPaidLoanCard).join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUi();
  await initStorage();
  render();

  const list = qs('#paidLoansList');
  if (!list) return;

  list.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-action="deletePaid"]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (!id) return;

    const loan = getLoanById(id);
    const name = loan?.borrowerName ? ` "${loan.borrowerName}"` : '';
    const ok = confirm(`Delete${name} record? This cannot be undone.`);
    if (!ok) return;

    deleteLoan(id);
    render();
  });
});
