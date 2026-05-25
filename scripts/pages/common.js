import '../../component/sidebar.js';
import { highlightActiveNav } from '../nav.js';

export function initCommonUi() {
  highlightActiveNav();
  const yearEls = document.querySelectorAll('[data-year]');
  const y = new Date().getFullYear();
  yearEls.forEach((el) => (el.textContent = String(y)));
}
