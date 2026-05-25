import { loadHtmlFragment } from '../modalLoader.js';
import { qs, qsa, setValue } from '../dom.js';
import { normalizeIsoDate, toNumber } from '../loanMath.js';

let modalEl = null;
let formEl = null;

function show() {
  modalEl?.classList.remove('hidden');
  modalEl?.setAttribute('aria-hidden', 'false');
}

function hide() {
  modalEl?.classList.add('hidden');
  modalEl?.setAttribute('aria-hidden', 'true');
}

function wireRateButtons() {
  const rateInput = qs('input[name="interestRate"]', formEl);
  const buttons = qsa('[data-rate]', modalEl);

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

export async function ensureEditModalMounted({ mountSelector = '#modal-root' } = {}) {
  if (modalEl) return;

  const mount = document.querySelector(mountSelector);
  if (!mount) throw new Error(`Missing modal mount: ${mountSelector}`);

  let html = '';
  try {
    html = await loadHtmlFragment('/modals/edit-loan.html');
  } catch {
    // Fallback for environments where fetch cannot load local files (e.g. file://)
    html = `
<div id="editLoanModal" class="fixed inset-0 z-50 hidden" aria-hidden="true">
  <div class="absolute inset-0 bg-black/60" data-modal-close></div>

  <div class="relative flex min-h-full items-center justify-center p-4">
    <div class="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-lg font-semibold text-slate-900">Edit Loan</h2>
          <p class="text-xs text-slate-500">Update loan details then save.</p>
        </div>
        <button type="button" class="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close" data-modal-close>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <form id="editLoanForm" class="mt-4 space-y-4">
        <input type="hidden" name="id" />

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-700">Borrower Name</label>
          <input name="borrowerName" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-violet-400" placeholder="Enter borrower name" required />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-700">Loan Amount</label>
          <input name="amount" inputmode="decimal" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-violet-400" placeholder="0.00" required />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-700">Interest Rate (%)</label>
          <input name="interestRate" inputmode="decimal" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-violet-400" placeholder="0.0" required />
          <div class="grid grid-cols-3 gap-2 pt-1">
            <button type="button" class="rate-btn rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200" data-rate="10">10%</button>
            <button type="button" class="rate-btn rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200" data-rate="20">20%</button>
            <button type="button" class="rate-btn rounded-lg bg-violet-700 px-3 py-2 text-xs font-medium text-white hover:bg-violet-800" data-rate="30">30%</button>
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-700">Due Date</label>
          <input name="dueDate" type="date" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-violet-400" required />
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button type="button" class="w-1/2 rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300" data-modal-close>Cancel</button>
          <button type="submit" class="w-1/2 rounded-xl bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800">Save</button>
        </div>
      </form>
    </div>
  </div>
</div>
    `.trim();
  }

  mount.insertAdjacentHTML('beforeend', html);
  modalEl = document.getElementById('editLoanModal');
  formEl = document.getElementById('editLoanForm');

  if (!modalEl || !formEl) return;

  qsa('[data-modal-close]', modalEl).forEach((el) => el.addEventListener('click', hide));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hide();
  });

  wireRateButtons();
}

export function openEditLoanModal(loan, { onSave } = {}) {
  if (!modalEl || !formEl) return;

  setValue(qs('input[name="id"]', formEl), loan.id);
  setValue(qs('input[name="borrowerName"]', formEl), loan.borrowerName);
  setValue(qs('input[name="amount"]', formEl), String(loan.amount ?? ''));
  setValue(qs('input[name="interestRate"]', formEl), String(loan.interestRate ?? ''));
  setValue(qs('input[name="dueDate"]', formEl), normalizeIsoDate(loan.dueDate));

  formEl.onsubmit = (e) => {
    e.preventDefault();
    const id = String(formEl.id.value || '').trim();
    const borrowerName = String(formEl.borrowerName.value || '').trim();
    const amount = toNumber(formEl.amount.value);
    const interestRate = toNumber(formEl.interestRate.value);
    const dueDate = normalizeIsoDate(formEl.dueDate.value);

    if (!borrowerName || amount <= 0 || !dueDate) {
      alert('Please fill borrower name, amount, and due date.');
      return;
    }

    onSave?.({ id, borrowerName, amount, interestRate, dueDate });
    hide();
  };

  show();
}
