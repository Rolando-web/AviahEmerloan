import { initCommonUi } from './common.js';
import { getLoans, initStorage } from '../storage.js';
import { computeTotals, formatCurrency, inDateRange } from '../loanMath.js';
import { qs, on, setText } from '../dom.js';
import { downloadCsv } from '../csv.js';

function getFilters() {
  const from = qs('#fromDate')?.value || '';
  const to = qs('#toDate')?.value || '';
  return { from, to };
}

function getActiveInRange() {
  const { from, to } = getFilters();
  return getLoans()
    .filter((l) => l.status === 'active')
    .filter((l) => inDateRange(l.createdAt, from, to));
}

function getPaidInRange() {
  const { from, to } = getFilters();
  return getLoans()
    .filter((l) => l.status === 'paid')
    .filter((l) => inDateRange(l.createdAt, from, to));
}

function renderChart(paidLoans) {
  const panel = qs('#reportChartPanel');
  if (!panel) return;

  if (paidLoans.length === 0) {
    panel.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div class="flex items-end gap-1 text-red-400">
          <div class="h-6 w-2 rounded bg-red-200"></div>
          <div class="h-10 w-2 rounded bg-red-300"></div>
          <div class="h-8 w-2 rounded bg-red-200"></div>
        </div>
        <div class="text-sm font-semibold text-slate-500">No settled loans in selected range</div>
      </div>
    `;
    return;
  }

  // Group by month
  const groupedByMonth = {};
  paidLoans.forEach(l => {
    const d = new Date(l.createdAt);
    const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!groupedByMonth[key]) {
      groupedByMonth[key] = {
        label: d.toLocaleString('default', { month: 'short' }),
        sortKey: d.getFullYear() * 100 + d.getMonth(),
        interest: 0
      };
    }
    const t = computeTotals(l);
    groupedByMonth[key].interest += t.interest;
  });

  const data = Object.values(groupedByMonth).sort((a, b) => a.sortKey - b.sortKey);

  // SVG setup
  const width = 600;
  const height = 250;
  const paddingX = 50;
  const paddingY = 40;
  
  const maxInterest = Math.max(...data.map(d => d.interest), 1);
  const maxVal = maxInterest * 1.2; 
  const minVal = 0;

  const stepX = data.length > 1 ? (width - paddingX * 2) / (data.length - 1) : 0;
  
  const pointsData = data.map((d, idx) => {
    const x = paddingX + idx * stepX;
    const y = height - paddingY - ((d.interest - minVal) / (maxVal - minVal)) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  const pointsStr = pointsData.map(p => `${p.x},${p.y}`).join(' ');

  // Generate grid lines and labels
  let gridLines = '';
  // Horizontal grid lines
  for (let i = 0; i <= 4; i++) {
    const y = height - paddingY - (i / 4) * (height - paddingY * 2);
    const val = (minVal + (maxVal - minVal) * (i / 4)).toFixed(0);
    gridLines += `
      <line x1="${paddingX}" y1="${y}" x2="${width - paddingX}" y2="${y}" stroke="#e2e8f0" stroke-width="1" />
      <text x="${paddingX - 10}" y="${y + 4}" fill="#64748b" font-size="12" font-weight="600" text-anchor="end">${val}</text>
    `;
  }
  
  // Vertical grid lines
  pointsData.forEach(p => {
    gridLines += `
      <line x1="${p.x}" y1="${paddingY}" x2="${p.x}" y2="${height - paddingY}" stroke="#e2e8f0" stroke-width="1" />
      <text x="${p.x}" y="${height - paddingY + 20}" fill="#0f172a" font-size="14" font-weight="bold" text-anchor="middle">${p.label}</text>
    `;
  });

  const tooltips = pointsData.map(p => `
    <g class="group cursor-pointer">
      <circle cx="${p.x}" cy="${p.y}" r="6" fill="#ef4444" class="transition-all duration-300 group-hover:r-[8px]" />
      <rect x="${p.x - 45}" y="${p.y - 35}" width="90" height="24" rx="4" fill="#1e293b" class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <text x="${p.x}" y="${p.y - 18}" fill="white" font-size="11" text-anchor="middle" font-weight="bold" class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">₱${p.interest.toFixed(2)}</text>
    </g>
  `).join('');

  panel.innerHTML = `
    <div class="flex flex-col items-center w-full">
      <div class="text-sm font-semibold text-slate-700 mb-4 w-full text-left">Monthly Interest Earned</div>
      <div class="w-full overflow-x-auto bg-white rounded-xl border border-slate-200">
        <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto min-w-[500px]">
          ${gridLines}
          <polyline points="${data.length > 1 ? pointsStr : `${paddingX},${pointsData[0].y} ${width-paddingX},${pointsData[0].y}`}" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          ${tooltips}
        </svg>
      </div>
    </div>
  `;
}

function render() {
  const activeLoans = getActiveInRange();
  const paidLoans = getPaidInRange();
  
  setText(qs('#showingCount'), activeLoans.length + paidLoans.length);

  const activeTotals = activeLoans.reduce(
    (acc, l) => {
      const t = computeTotals(l);
      acc.principal += t.principal;
      acc.interest += t.interest;
      acc.accumulated += t.accumulated;
      return acc;
    },
    { principal: 0, interest: 0, accumulated: 0 }
  );

  const paidTotals = paidLoans.reduce(
    (acc, l) => {
      const t = computeTotals(l);
      acc.principal += t.principal;
      acc.interest += t.interest;
      acc.accumulated += t.accumulated;
      return acc;
    },
    { principal: 0, interest: 0, accumulated: 0 }
  );

  setText(qs('#activeReleased'), formatCurrency(activeTotals.principal));
  setText(qs('#activeAccumulated'), formatCurrency(activeTotals.accumulated));
  setText(qs('#activePrincipalBreakdown'), formatCurrency(activeTotals.principal));
  setText(qs('#activeInterestBreakdown'), formatCurrency(activeTotals.interest));

  setText(qs('#paidReleased'), formatCurrency(paidTotals.principal));
  setText(qs('#paidAccumulated'), formatCurrency(paidTotals.accumulated));
  setText(qs('#paidPrincipalBreakdown'), formatCurrency(paidTotals.principal));
  setText(qs('#paidInterestBreakdown'), formatCurrency(paidTotals.interest));

  renderChart(paidLoans);
}

function handleExportCsv() {
  const { from, to } = getFilters();
  const filteredLoans = getLoans().filter((l) => inDateRange(l.createdAt, from, to));

  if (!filteredLoans.length) {
    alert('No data matches the current date filter.');
    return;
  }

  const csvData = filteredLoans.map(l => {
    const totals = computeTotals(l);
    return {
      "Loan ID": l.id,
      "Borrower Name": l.borrowerName,
      "Amount Released": totals.principal.toFixed(2),
      "Interest Rate (%)": totals.interestRate,
      "Interest Amount": totals.interest.toFixed(2),
      "Total Payable": totals.accumulated.toFixed(2),
      "Created At": l.createdAt,
      "Due Date": l.dueDate,
      "Paid At": l.paidAt || '',
      "Status": l.status.toUpperCase()
    };
  });

  const rangeSuffix = from || to ? `_${from || 'start'}_to_${to || 'end'}` : '_all';
  downloadCsv(csvData, `report_loans${rangeSuffix}.csv`);
}

document.addEventListener('DOMContentLoaded', async () => {
  initCommonUi();
  await initStorage();
  render();

  ['#fromDate', '#toDate'].forEach((sel) => {
    const el = qs(sel);
    if (el) on(el, 'input', render);
  });

  const exportBtn = qs('#exportCsvBtn');
  if (exportBtn) on(exportBtn, 'click', handleExportCsv);
});
