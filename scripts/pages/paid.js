import { initCommonUi } from './common.js';
import { deleteLoan, getLoanById, getLoans, initStorage } from '../storage.js';
import { computeTotals, formatCurrency, todayIso } from '../loanMath.js';
import { qs, on, setText } from '../dom.js';
import { renderEmptyState, renderPaidLoanCard } from '../renderers.js';
import { downloadCsv } from '../csv.js';

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

function handleExportCsv() {
  const loans = getPaidLoans();
  if (!loans.length) {
    alert('No settled loans to export.');
    return;
  }

  const csvData = loans.map(l => {
    const totals = computeTotals(l);
    return {
      "Loan ID": l.id,
      "Borrower Name": l.borrowerName,
      "Amount Released": totals.principal.toFixed(2),
      "Interest Rate (%)": totals.interestRate,
      "Interest Amount": totals.interest.toFixed(2),
      "Total Collected": totals.accumulated.toFixed(2),
      "Created At": l.createdAt,
      "Paid At": l.paidAt || '',
      "Status": "Paid"
    };
  });

  downloadCsv(csvData, `settled_loans_${todayIso()}.csv`);
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUi();
  await initStorage();
  render();

  const list = qs('#paidLoansList');
  if (list) {
    on(list, 'click', (event) => {
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
  }

  const exportBtn = qs('#exportCsvBtn');
  if (exportBtn) on(exportBtn, 'click', handleExportCsv);
});
