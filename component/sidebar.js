export class AppSidebar extends HTMLElement {
  connectedCallback() {
    this.classList.add('block', 'md:w-64', 'shrink-0', 'bg-violet-800', 'text-white');
    this.innerHTML = `
      <div class="h-full flex flex-col">
        <div class="flex items-center gap-3 p-4">
          <img src="/assets/images/aviah.jpg" alt="Aviah" class="h-10 w-10 rounded-full bg-white" />
          <div>
            <div class="text-sm font-semibold">AviahEmerloan</div>
            <div class="text-[11px] text-white/70">Emergency Loan Manager</div>
          </div>
        </div>

        <nav class="flex gap-2 p-3 overflow-x-auto md:block md:space-y-2 md:overflow-visible">
          <a data-nav href="/views/create/index.html" class="flex flex-1 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 md:flex-none whitespace-nowrap">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                <path d="M10 2a.75.75 0 01.75.75v6.5h6.5a.75.75 0 010 1.5h-6.5v6.5a.75.75 0 01-1.5 0v-6.5h-6.5a.75.75 0 010-1.5h6.5v-6.5A.75.75 0 0110 2z" />
              </svg>
            </span>
            Create
          </a>

          <a data-nav href="/views/active/index.html" class="flex flex-1 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 md:flex-none whitespace-nowrap">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                <path d="M3 4.75A.75.75 0 013.75 4h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 4.75zM3 9.75A.75.75 0 013.75 9h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 9.75zM3 14.75a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" />
              </svg>
            </span>
            Active
          </a>

          <a data-nav href="/views/paid/index.html" class="flex flex-1 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 md:flex-none whitespace-nowrap">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 10-1.214-.882l-3.05 4.2-2.035-2.034a.75.75 0 10-1.06 1.06l2.65 2.65a.75.75 0 001.137-.089l3.572-4.905z" clip-rule="evenodd" />
              </svg>
            </span>
            Paid
          </a>

          <a data-nav href="/views/report/index.html" class="flex flex-1 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 md:flex-none whitespace-nowrap">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                <path d="M3 3.75A.75.75 0 013.75 3h12.5a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V3.75zM5 12.25a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0v-3zm4-5a.75.75 0 011.5 0v8a.75.75 0 01-1.5 0v-8zm4 3a.75.75 0 011.5 0v5a.75.75 0 01-1.5 0v-5z" />
              </svg>
            </span>
            Report
          </a>

          <a data-nav href="/views/notification/index.html" class="flex flex-1 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/10 md:flex-none whitespace-nowrap">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4">
                <path d="M10 2a6 6 0 00-6 6v2.586l-.707.707A1 1 0 004 13h12a1 1 0 00.707-1.707L16 10.586V8a6 6 0 00-6-6zm0 16a2 2 0 01-1.995-1.85L8 16h4a2 2 0 01-2 2z" />
              </svg>
            </span>
            Notify
          </a>
        </nav>

        <div class="p-4 text-[11px] text-white/70 md:mt-auto">Aviah Collection © <span data-year></span></div>
      </div>
    `;
    
    // highlight active nav since it's just rendered
    const path = location.pathname.replace(/\/index\.html$/, '/');
    this.querySelectorAll('[data-nav]').forEach((a) => {
      const href = a.getAttribute('href') || '';
      const normalized = href.replace(/\/index\.html$/, '/');
      const isActive = normalized && path.endsWith(normalized);
      a.classList.toggle('bg-white/15', isActive);
      a.classList.toggle('text-white', isActive);
      a.classList.toggle('text-white/80', !isActive);
    });
    
    const yearEl = this.querySelector('[data-year]');
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }
}

customElements.define('app-sidebar', AppSidebar);
