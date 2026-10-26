/* ═══════════════════════════════════════════════
   NOI DUE — navigazione, render, ricerca, avvio
═══════════════════════════════════════════════ */

const PAGES = {
  oggi:         () => renderOggi(),
  ricordi:      () => renderRicordi(),
  bigliettini:  () => renderBigliettini(),
  insieme:      () => renderInsieme(),
  gioca:        () => renderGioca(),
  calendario:   () => renderCalendario(),
  impostazioni: () => renderImpostazioni(),
};
// pagine "figlie": evidenziano la tab di Oggi
const PAGE_TAB = { calendario:'oggi', impostazioni:'oggi' };

let currentPage = 'oggi';
const scrollMem = {};
const lastHtml = {};

function pageEl(p) { return document.querySelector(`.page[data-page="${p}"]`); }

function go(page, opts = {}) {
  if (layers.length) { closeAllLayers(() => go(page, opts)); return; }
  if (!PAGES[page]) page = 'oggi';
  if (page === currentPage && !opts.force) {
    window.scrollTo({ top:0, behavior:'smooth' });
    return;
  }
  scrollMem[currentPage] = window.scrollY;
  currentPage = page;
  $$('.page').forEach(p => p.hidden = p.dataset.page !== page);
  const tab = PAGE_TAB[page] || page;
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.go === tab));
  try { history.replaceState(history.state, '', '#' + page); } catch (e) {}
  renderPage(page, true);
  window.scrollTo(0, opts.restore ? (scrollMem[page] || 0) : 0);
}

function routeFromHash() {
  const h = (location.hash || '').replace('#', '');
  go(PAGES[h] ? h : 'oggi', { force:true });
}

function renderPage(page, force) {
  const el = pageEl(page); if (!el) return;
  let html;
  try { html = PAGES[page](); }
  catch (e) { console.error(e); html = `<div class="empty"><p>Qualcosa è andato storto nel caricare questa pagina.</p></div>`; }
  if (force || html !== lastHtml[page]) {
    el.innerHTML = html;
    lastHtml[page] = html;
    if (typeof PAGE_AFTER[page] === 'function') PAGE_AFTER[page](el);
  }
}
const PAGE_AFTER = {};

function onDataChanged(kind, first) {
  if (first) {
    showScreen('app');
    routeFromHash();
  } else if (dataLoaded) {
    renderPage(currentPage);
  }
  updateBadges();
}

function updateBadges() {
  const unread = unreadNotes().length;
  const pending = gamesList.filter(g => g.status === 'pending' && g.createdBy !== myRole).length;
  const b1 = document.querySelector('.tab[data-go="bigliettini"] .badge');
  const b2 = document.querySelector('.tab[data-go="gioca"] .badge');
  if (b1) { b1.textContent = unread || ''; b1.hidden = !unread; }
  if (b2) { b2.textContent = pending || ''; b2.hidden = !pending; }
}

function startApp() {
  // la schermata di avvio resta visibile finché arrivano i dati
  showScreen('boot-screen');
  startListeners();
  clearTimeout(window._bootTimer);
  window._bootTimer = setTimeout(() => {
    if (!dataLoaded) {
      const m = $('#boot-msg');
      if (m) m.innerHTML = `La connessione è lenta…<br><button class="btn btn-ghost sm" onclick="location.reload()">Riprova</button>`;
    }
  }, 9000);
}

/* ═══════════════════════════════════════════════
   COMPONENTI COMUNI DI PAGINA
═══════════════════════════════════════════════ */
function pageHead({ eyebrow = '', title = '', actions = '', back = '' }) {
  return `<header class="ph">
    ${back ? `<button class="icon-btn ghost back" onclick="go('${back}')" aria-label="Indietro">${icon('chevL', 22)}</button>` : ''}
    <div class="ph-text">
      ${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}
      <h1 class="display">${title}</h1>
    </div>
    ${actions ? `<div class="ph-actions">${actions}</div>` : ''}
  </header>`;
}

function emptyState(emoji, title, text, action = '') {
  return `<div class="empty">
    <div class="empty-emoji">${emoji}</div>
    <h3>${title}</h3>
    ${text ? `<p>${text}</p>` : ''}
    ${action}
  </div>`;
}

function whoChip(role) {
  if (role !== 'lui' && role !== 'lei') return '';
  return `<span class="who-dot ${role}" title="${esc(PEOPLE[role])}">${esc(initials(PEOPLE[role]))}</span>`;
}

/* ═══════════════════════════════════════════════
   RICERCA
═══════════════════════════════════════════════ */
function openSearch() {
  const el = openFullLayer(`
    <div class="search-layer">
      <div class="search-bar">
        ${icon('search', 20)}
        <input id="search-input" type="search" placeholder="Cerca film, posti, ricordi, bigliettini…" autocomplete="off">
        <button class="link-btn" onclick="closeTop()">Chiudi</button>
      </div>
      <div class="search-results" id="search-results">
        <p class="muted center pad">Scrivi qualcosa per cercare in tutto il vostro spazio.</p>
      </div>
    </div>`, { cls:'search-full' });
  const input = el.querySelector('#search-input');
  setTimeout(() => input.focus(), 120);
  input.addEventListener('input', () => runSearch(input.value, el.querySelector('#search-results')));
}

function runSearch(q, out) {
  q = q.trim().toLowerCase();
  if (!q) { out.innerHTML = `<p class="muted center pad">Scrivi qualcosa per cercare in tutto il vostro spazio.</p>`; return; }
  const has = s => String(s || '').toLowerCase().includes(q);
  const rows = [];
  SECTION_KEYS.forEach(s => (data[s] || []).forEach(i => {
    if (has(i.title) || has(i.note) || has(i.map) || itemCats(i).some(has)) {
      rows.push(`<button class="result" onclick="openItem('${s}','${jsq(i.id)}')">
        <span class="result-ic">${SECTIONS[s].icon}</span>
        <span class="result-body"><b>${esc(i.title)}</b><small>${SECTIONS[s].label}${i.done ? ' · fatto' : ''}</small></span></button>`);
    }
  }));
  (data._gallery || []).forEach(g => {
    if (has(g.title) || has(g.caption) || has(g.location)) {
      rows.push(`<button class="result" onclick="openPhoto('${jsq(g.id)}')">
        ${g.img ? `<img class="result-img" src="${esc(cimg(g.img, 120))}" alt="">` : `<span class="result-ic">🖼️</span>`}
        <span class="result-body"><b>${esc(g.title || 'Ricordo')}</b><small>Ricordi${g.date ? ' · ' + fmtDate(g.date) : ''}</small></span></button>`);
    }
  });
  notesList.forEach(n => {
    if (!canSeeNote(n)) return;
    if (has(n.text)) {
      rows.push(`<button class="result" onclick="openNote('${jsq(n.id)}')">
        <span class="result-ic">💌</span>
        <span class="result-body"><b>${esc(String(n.text).slice(0, 70))}</b><small>Bigliettino di ${esc(PEOPLE[n.from] || '')} · ${relTime(n.createdAt)}</small></span></button>`);
    }
  });
  out.innerHTML = rows.length
    ? `<p class="eyebrow pad-x">${rows.length} risultat${rows.length === 1 ? 'o' : 'i'}</p>${rows.slice(0, 60).join('')}`
    : `<p class="muted center pad">Nessun risultato per “${esc(q)}”.</p>`;
}

/* ═══════════════════════════════════════════════
   AVVIO
═══════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  $$('.tab').forEach(t => t.addEventListener('click', () => go(t.dataset.go, { restore:true })));
  bootData();
});
