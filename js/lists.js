/* ═══════════════════════════════════════════════
   NOI DUE — Insieme (tutte le liste in un posto)
═══════════════════════════════════════════════ */

let insSection = 'all';   // 'all' | chiave sezione
let insTab = 'todo';      // 'todo' | 'done'
let insCat = null;

function openInsieme(s) {
  insSection = s || 'all'; insCat = null; insTab = 'todo';
  if (currentPage === 'insieme') renderPage('insieme', true);
  go('insieme', { force: currentPage !== 'insieme' });
}
function setInsSection(s) { insSection = s; insCat = null; renderPage('insieme', true); }
function setInsTab(t) { insTab = t; renderPage('insieme', true); }
function setInsCat(c) { insCat = insCat === c ? null : c; renderPage('insieme', true); }

function sortTodo(a, b) {
  const da = a.i.date ? (SECTIONS[a.s].recurring ? daysToNextOccurrence(a.i.date) : daysUntil(a.i.date)) : null;
  const dbb = b.i.date ? (SECTIONS[b.s].recurring ? daysToNextOccurrence(b.i.date) : daysUntil(b.i.date)) : null;
  const fa = da !== null && da >= 0, fb = dbb !== null && dbb >= 0;
  if (fa && fb) return da - dbb;
  if (fa) return -1; if (fb) return 1;
  return Number(b.i.id) - Number(a.i.id);
}
function sortDone(a, b) {
  return (Number(b.i.doneAt) || Number(b.i.id)) - (Number(a.i.doneAt) || Number(a.i.id));
}

function renderInsieme() {
  const keys = insSection === 'all' ? SECTION_KEYS : [insSection];
  let all = [];
  keys.forEach(s => (data[s] || []).forEach(i => all.push({ s, i })));
  const totalTodo = SECTION_KEYS.filter(s => !SECTIONS[s].recurring).reduce((n, s) => n + (data[s] || []).filter(i => !i.done).length, 0);

  const recurringOnly = insSection === 'anniversaries';
  const todo = all.filter(x => !x.i.done || SECTIONS[x.s].recurring);
  const done = all.filter(x => x.i.done && !SECTIONS[x.s].recurring);

  // filtro categoria (solo dentro una sezione)
  const usedCats = new Set();
  if (insSection !== 'all') (insTab === 'todo' ? todo : done).forEach(x => itemCats(x.i).forEach(c => usedCats.add(c)));
  const pick = list => insCat ? list.filter(x => itemCats(x.i).includes(insCat)) : list;

  const list = (insTab === 'done' && !recurringOnly ? pick(done).sort(sortDone) : pick(todo).sort(sortTodo));

  const addLabel = insSection === 'all' ? 'Aggiungi' : `Aggiungi ${SECTIONS[insSection].one}`;
  let h = pageHead({
    eyebrow: `${totalTodo} cose da fare insieme`,
    title: 'Insieme',
    actions: `<button class="icon-btn" onclick="openSearch()" aria-label="Cerca">${icon('search', 20)}</button>
              <button class="icon-btn accent" onclick="openItemForm(${insSection === 'all' ? 'null' : `'${insSection}'`})" aria-label="${addLabel}">${icon('plus', 22)}</button>`
  });

  h += `<div class="chips scroll-x sticky-chips">
    <button class="chip ${insSection === 'all' ? 'on' : ''}" onclick="setInsSection('all')">Tutto</button>
    ${SECTION_KEYS.map(s => {
      const n = (data[s] || []).filter(i => !i.done || SECTIONS[s].recurring).length;
      return `<button class="chip ${insSection === s ? 'on' : ''}" onclick="setInsSection('${s}')">${secIcon(s, 15)} ${SECTIONS[s].label}${n ? ` <i>${n}</i>` : ''}</button>`;
    }).join('')}
  </div>`;

  if (!recurringOnly) {
    h += `<div class="seg-row">
      <div class="seg">
        <button class="${insTab === 'todo' ? 'on' : ''}" onclick="setInsTab('todo')">Da fare <i>${todo.length}</i></button>
        <button class="${insTab === 'done' ? 'on' : ''}" onclick="setInsTab('done')">Fatti <i>${done.length}</i></button>
      </div>
      ${insSection !== 'all' && all.length ? `<div class="progress-mini" title="${done.length} su ${all.length}"><span style="width:${all.length ? Math.round(done.length / all.length * 100) : 0}%"></span></div>` : ''}
    </div>`;
  }

  if (usedCats.size > 1) {
    h += `<div class="chips scroll-x small">${[...usedCats].map(c =>
      `<button class="chip sm ${insCat === c ? 'on' : ''}" onclick="setInsCat('${jsq(c)}')">${esc(catLabel(c))}</button>`).join('')}</div>`;
  }

  if (!list.length) {
    if (!all.length) {
      const s = insSection === 'all' ? null : insSection;
      h += emptyState(s ? SECTIONS[s].icon : 'sparkle', s ? `Ancora nessun ${SECTIONS[s].one}` : 'La lista è vuota',
        'Aggiungete la prima cosa che vorreste fare insieme.',
        `<button class="btn btn-primary" onclick="openItemForm(${s ? `'${s}'` : 'null'})">${icon('plus', 18)} ${addLabel}</button>`);
    } else if (insTab === 'done') {
      h += emptyState('check', 'Ancora niente di fatto', 'Quando completate qualcosa, toccate il cerchio sulla card: finisce qui.');
    } else {
      h += emptyState('sparkle', 'Tutto fatto!', 'Avete completato tutto. Tempo di nuove idee.');
    }
  } else {
    h += `<div class="items-grid">${list.map(x => itemCardHtml(x.s, x.i, insSection === 'all')).join('')}</div>`;
  }
  return h;
}

function itemCardHtml(s, i, showSection) {
  const sec = SECTIONS[s];
  const cats = itemCats(i);
  let dateHtml = '';
  if (i.date) {
    if (sec.recurring) {
      const d = daysToNextOccurrence(i.date);
      dateHtml = `<span class="tag ${d <= 7 ? 'hot' : ''}">${d === 0 ? 'Oggi' : `D-${d}`}</span>`;
    } else {
      const d = daysUntil(i.date);
      dateHtml = `<span class="tag ${d !== null && d >= 0 && d <= 7 ? 'hot' : ''}">${fmtDate(i.date, { day:'numeric', month:'short' })}</span>`;
    }
  }
  return `<article class="item ${i.img ? 'has-img' : 'sec-' + s} ${i.done && !sec.recurring ? 'done' : ''}" onclick="openItem('${s}','${jsq(i.id)}')">
    ${i.img ? `<img src="${esc(cimg(i.img, 600))}" alt="" loading="lazy" onerror="this.remove()">` : `<div class="item-ic">${icon(sec.icon, 30)}</div>`}
    <div class="item-shade"></div>
    ${!sec.recurring ? `<button class="item-check ${i.done ? 'on' : ''}" onclick="event.stopPropagation();toggleDone('${s}','${jsq(i.id)}')" aria-label="${i.done ? 'Segna da fare' : 'Segna fatto'}">${icon('check', 16)}</button>` : ''}
    <div class="item-body">
      ${showSection ? `<span class="item-kicker">${icon(sec.icon, 12)} ${sec.label}</span>` : (cats[0] ? `<span class="item-kicker">${esc(catLabel(cats[0]))}</span>` : '')}
      <h3 class="item-title">${esc(i.title)}</h3>
      <div class="item-meta">${dateHtml}${i.rating ? starsHtml(i.rating, 11) : ''}<span class="grow"></span>${whoChip(i.who)}</div>
    </div>
  </article>`;
}

/* ═══════════════════════════════════════════════
   DETTAGLIO
═══════════════════════════════════════════════ */
function findItem(s, id) { return (data[s] || []).find(i => sameId(i.id, id)); }

function openItem(s, id, opts = {}) {
  const i = findItem(s, id); if (!i) { toast('Elemento non trovato'); return; }
  const sec = SECTIONS[s];
  const cats = itemCats(i);
  let when = '';
  if (i.date) {
    const long = fmtDate(i.date, { weekday:'long', day:'numeric', month:'long', year:'numeric' });
    if (sec.recurring) {
      const d = daysToNextOccurrence(i.date), y = yearsSince(s, i);
      when = `${cap(long)} · <b>${countdownLabel(d)}</b>${y ? ` · ${y} ${y === 1 ? 'anno' : 'anni'}` : ''}`;
    } else {
      const d = daysUntil(i.date);
      when = `${cap(long)}${d !== null && d >= 0 ? ` · <b>${countdownLabel(d)}</b>` : ''}`;
    }
  }
  const html = `<div class="detail">
    <div class="detail-media ${i.img ? '' : 'sec-' + s}">
      ${i.img ? `<img src="${esc(cimg(i.img, 1200))}" alt="">` : `<span class="detail-ic">${icon(sec.icon, 64)}</span>`}
    </div>
    <div class="detail-body">
      <div class="eyebrow">${icon(sec.icon, 13)} ${sec.label}${i.done && !sec.recurring ? ' · <span class="ok">fatto</span>' : ''}</div>
      <h2 class="display detail-title">${esc(i.title)}</h2>
      ${i.note ? `<p class="detail-note">${linkify(i.note)}</p>` : ''}
      <div class="detail-rows">
        ${when ? `<div class="drow">${icon('calendar', 18)}<span>${when}</span></div>` : ''}
        ${i.map ? `<a class="drow" href="https://maps.google.com/?q=${encodeURIComponent(i.map)}" target="_blank" rel="noopener">${icon('pin', 18)}<span>${esc(i.map)}</span>${icon('arrowR', 15, 'chev')}</a>` : ''}
        ${i.link ? `<a class="drow" href="${esc(i.link)}" target="_blank" rel="noopener">${icon('link', 18)}<span class="ellipsis">${esc(i.link.replace(/^https?:\/\/(www\.)?/, ''))}</span>${icon('arrowR', 15, 'chev')}</a>` : ''}
        ${i.rating ? `<div class="drow">${icon('star', 18)}<span>${starsHtml(i.rating, 16)}</span></div>` : ''}
        ${i.who ? `<div class="drow">${whoChip(i.who)}<span>Proposto da ${esc(PEOPLE[i.who] || '')}</span></div>` : ''}
      </div>
      ${cats.length ? `<div class="chips wrap">${cats.map(c => `<span class="chip sm static">${esc(catLabel(c))}</span>`).join('')}</div>` : ''}
      <div class="row-actions">
        <button class="icon-btn" onclick="deleteItem('${s}','${jsq(i.id)}')" aria-label="Elimina">${icon('trash', 20)}</button>
        <button class="btn btn-ghost" onclick="openItemForm('${s}','${jsq(i.id)}',{replace:true})">${icon('edit', 18)} Modifica</button>
        ${!sec.recurring ? `<button class="btn ${i.done ? 'btn-ghost' : 'btn-primary'}" onclick="toggleDone('${s}','${jsq(i.id)}',true)">${i.done ? 'Da rifare' : `${icon('check', 18)} Fatto`}</button>` : ''}
      </div>
    </div>
  </div>`;
  openSheet(html, { cls:'sheet-detail', replace: opts.replace });
}

/* ═══════════════════════════════════════════════
   AZIONI
═══════════════════════════════════════════════ */
async function toggleDone(s, id, fromSheet) {
  const i = findItem(s, id); if (!i) return;
  const nowDone = !i.done;
  const doneAt = nowDone ? Date.now() : null;
  if (fromSheet) closeTop();
  const ok = await mutate(s, list => list.map(x => sameId(x.id, id) ? { ...x, done: nowDone, doneAt } : x));
  if (!ok) return;
  if (nowDone) {
    if (SECTIONS[s].showRating && !i.rating) setTimeout(() => openRateSheet(s, id), fromSheet ? 420 : 0);
    else toast(`Fatto! “${i.title}”`, { action:'Annulla', onAction: () => toggleDone(s, id) });
  }
}

function openRateSheet(s, id) {
  const i = findItem(s, id); if (!i) return;
  const el = openSheet(`<div class="rate">
    <div class="eyebrow center">${icon('check', 13)} Fatto</div>
    <h3 class="display center rate-title">Com'è stato<br><em>${esc(i.title)}</em>?</h3>
    <div class="rate-stars">${[1, 2, 3, 4, 5].map(n => `<button data-n="${n}" aria-label="${n} stelle">${icon('starFill', 38)}</button>`).join('')}</div>
    <button class="link-btn center" onclick="closeTop()">Salta</button>
  </div>`, { cls:'sheet-small' });
  el.querySelectorAll('[data-n]').forEach(b => {
    b.addEventListener('click', async () => {
      const n = parseInt(b.dataset.n);
      el.querySelectorAll('[data-n]').forEach(x => x.classList.toggle('on', parseInt(x.dataset.n) <= n));
      setTimeout(closeTop, 280);
      await mutate(s, list => list.map(x => sameId(x.id, id) ? { ...x, rating: n } : x));
    });
  });
}

async function deleteItem(s, id) {
  const i = findItem(s, id); if (!i) return;
  const ok = await confirmSheet({ title:`Eliminare “${i.title}”?`, text:'Non si può annullare.', ok:'Elimina', danger:true });
  if (!ok) return;
  closeAllLayers(() => mutate(s, list => list.filter(x => !sameId(x.id, id))));
}

/* ═══════════════════════════════════════════════
   FORM AGGIUNGI / MODIFICA
═══════════════════════════════════════════════ */
function openItemForm(s, id = null, opts = {}) {
  const item = s && id ? findItem(s, id) : null;
  let sec = s;
  let selCats = item ? itemCats(item).slice() : [];
  let who = item ? (item.who || null) : myRole;
  let rating = item ? (item.rating || 0) : 0;

  const html = `<form class="form" id="item-form" novalidate>
    <h3 class="sheet-title">${item ? 'Modifica' : (sec ? `Nuovo ${SECTIONS[sec].one}` : 'Aggiungi a Insieme')}</h3>
    ${!item ? `<div class="field"><span>Dove lo mettiamo?</span>
      <div class="chips wrap" id="f-sec">${SECTION_KEYS.map(k => `<button type="button" class="chip ${k === sec ? 'on' : ''}" data-sec="${k}">${secIcon(k, 15)} ${SECTIONS[k].label}</button>`).join('')}</div></div>` : ''}
    <label class="field"><span>Titolo</span><input class="input big" name="title" value="${esc(item?.title || '')}" placeholder="Es. Vedere l'aurora boreale" autocomplete="off"></label>
    <div class="field"><span>Foto</span>${photoFieldHtml('item', item?.img || '')}</div>
    <label class="field"><span>Note</span><textarea class="input" name="note" rows="3" placeholder="Perché vi va, dettagli, idee…">${esc(item?.note || '')}</textarea></label>
    <div class="field" id="f-cats-wrap"><span>Categoria</span><div class="chips wrap" id="f-cats"></div></div>
    <div class="grid2">
      <label class="field"><span id="f-date-lbl">Data</span><input class="input" type="date" name="date" value="${esc(item?.date || '')}"></label>
      <label class="field"><span>Link</span><input class="input" type="url" name="link" value="${esc(item?.link || '')}" placeholder="https://…"></label>
    </div>
    <label class="field" id="f-map-wrap"><span>Indirizzo / luogo</span><input class="input" name="map" value="${esc(item?.map || '')}" placeholder="Via Roma 1, Milano"></label>
    <div class="field"><span>Proposto da</span>
      <div class="seg full" id="f-who">
        <button type="button" data-who="lui" class="${who === 'lui' ? 'on' : ''}">${esc(PEOPLE.lui)}</button>
        <button type="button" data-who="lei" class="${who === 'lei' ? 'on' : ''}">${esc(PEOPLE.lei)}</button>
      </div>
    </div>
    <div class="field" id="f-rate-wrap"><span>Voto</span><div class="rate-stars sm" id="f-rate">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-n="${n}" class="${n <= rating ? 'on' : ''}">${icon('starFill', 26)}</button>`).join('')}</div></div>
    <div class="row-actions sticky">
      <button type="button" class="btn btn-ghost" onclick="closeTop()">Annulla</button>
      <button type="submit" class="btn btn-primary">Salva</button>
    </div>
  </form>`;

  const el = openSheet(html, { cls:'sheet-form', replace: opts.replace });
  const form = el.querySelector('#item-form');
  bindPhotoField(el, 'item');

  const paint = () => {
    const catsEl = form.querySelector('#f-cats');
    if (!sec) { form.querySelector('#f-cats-wrap').hidden = true; form.querySelector('#f-map-wrap').hidden = true; form.querySelector('#f-rate-wrap').hidden = true; return; }
    const S = SECTIONS[sec];
    form.querySelector('#f-cats-wrap').hidden = false;
    catsEl.innerHTML = S.cats.map(c => `<button type="button" class="chip sm ${selCats.includes(c) ? 'on' : ''}" data-cat="${esc(c)}">${esc(catLabel(c))}</button>`).join('');
    catsEl.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => {
      const c = b.dataset.cat;
      selCats = selCats.includes(c) ? selCats.filter(x => x !== c) : [...selCats, c];
      b.classList.toggle('on');
    }));
    form.querySelector('#f-map-wrap').hidden = !S.showMap;
    form.querySelector('#f-rate-wrap').hidden = !S.showRating;
    form.querySelector('#f-date-lbl').textContent = S.recurring ? 'Data (si ripete ogni anno)' : 'Data';
  };
  paint();

  form.querySelectorAll('[data-sec]').forEach(b => b.addEventListener('click', () => {
    sec = b.dataset.sec; selCats = selCats.filter(c => SECTIONS[sec].cats.includes(c));
    form.querySelectorAll('[data-sec]').forEach(x => x.classList.toggle('on', x === b));
    form.querySelector('.sheet-title').textContent = `Nuovo ${SECTIONS[sec].one}`;
    paint();
  }));
  form.querySelectorAll('[data-who]').forEach(b => b.addEventListener('click', () => {
    who = who === b.dataset.who ? null : b.dataset.who;
    form.querySelectorAll('[data-who]').forEach(x => x.classList.toggle('on', x.dataset.who === who));
  }));
  form.querySelectorAll('#f-rate [data-n]').forEach(b => b.addEventListener('click', () => {
    const n = parseInt(b.dataset.n);
    rating = rating === n ? 0 : n;
    form.querySelectorAll('#f-rate [data-n]').forEach(x => x.classList.toggle('on', parseInt(x.dataset.n) <= rating));
  }));

  if (!item) setTimeout(() => form.title.focus(), 350);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const title = form.title.value.trim();
    if (!sec) { toast('Scegli dove metterlo'); return; }
    if (!title) { form.title.focus(); toast('Manca il titolo'); return; }
    const photo = getPhotoValue(el, 'item');
    if (photo.busy) { toast('Aspetta che la foto finisca di caricare'); return; }
    const S = SECTIONS[sec];
    const payload = {
      title,
      note: form.note.value.trim(),
      cats: selCats, cat: selCats[0] || '',
      date: form.date.value,
      link: form.link.value.trim(),
      img: photo.url,
      map: S.showMap ? form.map.value.trim() : (item?.map || ''),
      rating: S.showRating ? rating : (item?.rating || 0),
      who: who || null,
    };
    closeTop();
    if (item) {
      await mutate(sec, list => list.map(x => sameId(x.id, item.id) ? { ...x, ...payload } : x));
    } else {
      const newItem = { ...payload, id: Date.now(), done:false };
      const ok = await mutate(sec, list => [newItem, ...list]);
      if (ok) toast(`Aggiunto a ${S.label}`, { action:'Vedi', onAction: () => openInsieme(sec) });
    }
  });
}
