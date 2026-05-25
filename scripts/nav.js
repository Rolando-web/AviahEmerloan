import { qsa } from './dom.js';

export function highlightActiveNav() {
  const path = location.pathname.replace(/\/index\.html$/, '/');
  qsa('[data-nav]')
    .forEach((a) => {
      const href = a.getAttribute('href') || '';
      const normalized = href.replace(/\/index\.html$/, '/');
      const isActive = normalized && path.endsWith(normalized);
      a.classList.toggle('bg-white/15', isActive);
      a.classList.toggle('text-white', isActive);
      a.classList.toggle('text-white/80', !isActive);
    });
}
