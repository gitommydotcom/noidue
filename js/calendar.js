/* ═══════════════════════════════════════════════
   NOI DUE — Calendario
═══════════════════════════════════════════════ */
let calYear = new Date().getFullYear(), calMonth = new Date().getMonth(), calSel = null;

function calNav(d) {
  calMonth += d;
  if (calMonth > 11) { calMonth = 0; calYear++; }
  if (calMonth < 0) { calMonth = 11; calYear--; }
  calSel = null;
  renderPage('calendario', true);
}
function calToday() { const n = new Date(); calYear = n.getFullYear(); calMonth = n.getMonth(); calSel = n.getDate(); renderPage('calendario', true); }
function calPick(d) { calSel = calSel === d ? null : d; renderPage('calendario', true); }

function eventsInMonth(y, m) {
  const by = {};
  SECTION_KEYS.forEach(s => (data[s] || []).forEach(i => {
    const d = parseLocalDate(i.date); if (!d) return;
    let day = null;
    if (SECTIONS[s].recurring) { if (d.getMonth() === m) day = d.getDate(); }
    else if (d.getFullYear() === y && d.getMonth() === m) day = d.getDate();
    if (day) (by[day] = by[day] || []).push({ s, i });
  }));
  (data._gallery || []).forEach(g => {
    const d = parseLocalDate(g.date);
    if (d && d.getFullYear() === y && d.getMonth() === m) (by[d.getDate()] = by[d.getDate()] || []).push({ s:'_gallery', i:g });
  });
  return by;
}

function calRow(e) {
  if (e.s === '_gallery') {
    return `<button class="row-card" onclick="openPhoto('${jsq(e.i.id)}')">
      ${e.i.img ? `<img class="row-thumb" src="${esc(cimg(e.i.img, 160))}" alt="">` : `<span class="row-ic emoji">🖼️</span>`}
      <span class="row-text"><b>${esc(e.i.title || 'Ricordo')}</b><small>Ricordo${e.i.location ? ' · ' + esc(e.i.location) : ''}</small></span></button>`;
  }
  const S = SECTIONS[e.s];
  return `<button class="row-card" onclick="openItem('${e.s}','${jsq(e.i.id)}')">
    <span class="row-ic emoji">${S.icon}</span>
    <span class="row-text"><b>${esc(e.i.title)}</b><small>${S.label}${S.recurring ? ' · ogni anno' : ''}${e.i.done ? ' · fatto' : ''}</small></span>
    ${e.days !== undefined ? `<span class="d-pill">${e.days === 0 ? 'Oggi' : e.days > 0 ? `D-${e.days}` : `${-e.days}g fa`}</span>` : ''}
  </button>`;
}

function renderCalendario() {
  const first = new Date(calYear, calMonth, 1);
  const last = new Date(calYear, calMonth + 1, 0);
  const startDow = (first.getDay() + 6) % 7;
  const by = eventsInMonth(calYear, calMonth);
  const now = new Date();
  const isThisMonth = now.getFullYear() === calYear && now.getMonth() === calMonth;

  let h = pageHead({ back:'oggi', eyebrow:'Tutte le vostre date', title:'Calendario',
    actions:`<button class="icon-btn accent" onclick="openItemForm('anniversaries')" aria-label="Aggiungi data">${icon('plus', 22)}</button>` });

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push('<span class="cal-cell empty"></span>');
  for (let d = 1; d <= last.getDate(); d++) {
    const ev = by[d] || [];
    const kinds = [...new Set(ev.map(e => e.s === '_gallery' ? 'photo' : SECTIONS[e.s].recurring ? 'date' : 'plan'))];
    cells.push(`<button class="cal-cell ${isThisMonth && d === now.getDate() ? 'today' : ''} ${calSel === d ? 'sel' : ''} ${ev.length ? 'has' : ''}" onclick="calPick(${d})">
      <span>${d}</span>${kinds.length ? `<i class="cal-dots">${kinds.map(k => `<b class="${k}"></b>`).join('')}</i>` : ''}</button>`);
  }

  h += `<div class="cal card">
    <div class="cal-head">
      <button class="icon-btn ghost" onclick="calNav(-1)" aria-label="Mese precedente">${icon('chevL', 20)}</button>
      <div class="cal-title display">${cap(first.toLocaleDateString('it-IT', { month:'long' }))} <em>${calYear}</em></div>
      <button class="icon-btn ghost" onclick="calNav(1)" aria-label="Mese successivo">${icon('chevR', 20)}</button>
    </div>
    <div class="cal-grid">${['L', 'M', 'M', 'G', 'V', 'S', 'D'].map(w => `<span class="cal-wd">${w}</span>`).join('')}${cells.join('')}</div>
    <div class="cal-legend"><span><b class="date"></b>Ricorrenze</span><span><b class="plan"></b>Piani</span><span><b class="photo"></b>Ricordi</span>
      ${!isThisMonth ? `<button class="link-btn" onclick="calToday()">Oggi</button>` : ''}</div>
  </div>`;

  if (calSel) {
    const ev = by[calSel] || [];
    const label = cap(new Date(calYear, calMonth, calSel).toLocaleDateString('it-IT', { weekday:'long', day:'numeric', month:'long' }));
    h += `<section class="block"><div class="block-head"><h2 class="h2">${label}</h2></div>
      ${ev.length ? ev.map(calRow).join('') : `<p class="muted small pad-y">Niente in questo giorno.</p>`}</section>`;
  } else {
    const monthList = Object.keys(by).map(Number).sort((a, b) => a - b).flatMap(d => by[d].map(e => ({ ...e, day:d })));
    if (monthList.length) {
      h += `<section class="block"><div class="block-head"><h2 class="h2">In questo mese</h2></div>
        ${monthList.map(e => `<div class="cal-daylabel">${e.day} ${first.toLocaleDateString('it-IT', { month:'short' })}</div>${calRow(e)}`).join('')}</section>`;
    }
  }

  const up = upcomingEvents(400).slice(0, 8);
  if (up.length) {
    h += `<section class="block"><div class="block-head"><h2 class="h2">Prossimi</h2></div>
      ${up.map(e => calRow({ s:e.s, i:e.i, days:e.days })).join('')}</section>`;
  }

  const past = [];
  SECTION_KEYS.filter(s => !SECTIONS[s].recurring).forEach(s => (data[s] || []).forEach(i => {
    const d = daysUntil(i.date);
    if (d !== null && d < 0) past.push({ s, i, days:d });
  }));
  past.sort((a, b) => b.days - a.days);
  if (past.length) {
    h += `<section class="block"><div class="block-head"><h2 class="h2">Già vissuti</h2></div>
      ${past.slice(0, 10).map(calRow).join('')}</section>`;
  }
  return h;
}
