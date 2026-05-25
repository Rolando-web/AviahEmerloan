import { initCommonUi } from './common.js';
import { getLoans, getLoanById, updateLoan, initStorage } from '../storage.js';
import { inDateRange, todayIso, computeTotals } from '../loanMath.js';
import { qs, on, setText, showToast } from '../dom.js';
import { renderActiveLoanCard, renderEmptyState } from '../renderers.js';
import { ensureEditModalMounted, openEditLoanModal } from './editModal.js';
import { downloadCsv } from '../csv.js';

function getFilters() {
  const from = qs('#fromDate')?.value || '';
  const to = qs('#toDate')?.value || '';
  return { from, to };
}

function getFilteredActiveLoans() {
  const { from, to } = getFilters();
  return getLoans()
    .filter((l) => l.status === 'active')
    .filter((l) => inDateRange(l.dueDate, from, to));
}

function render() {
  const loans = getFilteredActiveLoans();
  setText(qs('#totalActive'), loans.length);

  const container = qs('#activeLoansList');
  if (!container) return;

  if (loans.length === 0) {
    container.innerHTML = renderEmptyState('No active loans found');
    return;
  }

  container.innerHTML = loans.map(renderActiveLoanCard).join('');
}

function handleListClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const id = btn.getAttribute('data-id');
  const action = btn.getAttribute('data-action');
  if (!id || !action) return;

  if (action === 'markPaid') {
    const loan = getLoanById(id);
    const name = loan?.borrowerName ? ` "${loan.borrowerName}"` : '';
    const ok = confirm(`Mark${name} as Paid?`);
    if (!ok) return;
    updateLoan(id, { status: 'paid', paidAt: todayIso() });
    render();
    return;
  }

  if (action === 'edit') {
    const loan = getLoanById(id);
    if (!loan) return;

    openEditLoanModal(loan, {
      onSave: async (patch) => {
        try {
          await updateLoan(id, patch);
          render();
          showToast('Loan updated successfully!');
        } catch (error) {
          console.error(error);
          showToast('Failed to update loan. Check database rules.', 'error');
        }
      },
    });
  }
}

function handleExportCsv() {
  const loans = getFilteredActiveLoans();
  if (!loans.length) {
    alert('No active loans to export.');
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
      "Total Payable": totals.accumulated.toFixed(2),
      "Due Date": l.dueDate,
      "Created At": l.createdAt,
      "Status": "Active"
    };
  });

  downloadCsv(csvData, `active_loans_${todayIso()}.csv`);
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUi();
  await initStorage();
  await ensureEditModalMounted();

  render();

  const list = qs('#activeLoansList');
  if (list) on(list, 'click', handleListClick);

  ['#fromDate', '#toDate'].forEach((sel) => {
    const el = qs(sel);
    if (el) on(el, 'input', render);
  });

  const exportBtn = qs('#exportCsvBtn');
  if (exportBtn) on(exportBtn, 'click', handleExportCsv);
});
