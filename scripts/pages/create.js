import { initCommonUi } from './common.js';
import { generateId, upsertLoan, initStorage } from '../storage.js';
import { normalizeIsoDate, todayIso, toNumber } from '../loanMath.js';

function wireRateButtons(rateInput, container = document) {
  const buttons = Array.from(container.querySelectorAll('[data-rate]'));
  const setActive = (rate) => {
    buttons.forEach((b) => {
      const r = b.getAttribute('data-rate');
      const active = r === String(rate);
      b.classList.toggle('bg-violet-700', active);
      b.classList.toggle('text-white', active);
      b.classList.toggle('bg-slate-100', !active);
      b.classList.toggle('text-slate-700', !active);
    });
  };

  buttons.forEach((b) => {
    b.addEventListener('click', () => {
      rateInput.value = b.getAttribute('data-rate') || '';
      setActive(rateInput.value);
    });
  });

  rateInput.addEventListener('input', () => setActive(rateInput.value));
  setActive(rateInput.value);
}

async function onSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;

  const borrowerName = String(form.borrowerName.value || '').trim();
  const amount = toNumber(form.amount.value);
  const interestRate = toNumber(form.interestRate.value);
  const dueDate = normalizeIsoDate(form.dueDate.value);

  if (!borrowerName || amount <= 0 || !dueDate) {
    alert('Please fill borrower name, amount, and due date.');
    return;
  }

  await upsertLoan({
    id: generateId(),
    borrowerName,
    amount,
    interestRate,
    dueDate,
    createdAt: todayIso(),
    status: 'active',
  });

  window.location.href = '/views/active/index.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUi();
  await initStorage();

  const form = document.getElementById('createLoanForm');
  const rateInput = document.getElementById('interestRate');

  wireRateButtons(rateInput);
  form.addEventListener('submit', onSubmit);
});
