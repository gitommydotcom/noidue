/* ═══════════════════════════════════════════════
   NOI DUE — Ricordi (galleria, viewer, storie)
═══════════════════════════════════════════════ */

const GALLERY_SORT_LS_KEY = 'nd_gallery_sort_v1';
let gallerySortBy = 'postDate';   // postDate | uploadDate
let gallerySortReverse = false;   // false: più recenti prima
try {
  const p = JSON.parse(localStorage.getItem(GALLERY_SORT_LS_KEY) || 'null');
  if (p) { gallerySortBy = p.sortBy === 'uploadDate' ? 'uploadDate' : 'postDate'; gallerySortReverse = !!p.reverse; }
} catch (e) {}


function galleryTime(g, mode = gallerySortBy) {
  if (mode === 'postDate' && g.date) { const d = parseLocalDate(g.date); if (d) return d.getTime(); }
  const n = Number(g.id);
  return Number.isFinite(n) ? n : 0;
}

function sortedGallery() {
  const list = (data._gallery || []).map((g, index) => ({ g, index }));
  list.sort((a, b) => (galleryTime(b.g) - galleryTime(a.g)) || (b.index - a.index));
  if (gallerySortReverse) list.reverse();
  return list.map(x => x.g);
}

function findPhoto(id) { return (data._gallery || []).find(g => sameId(g.id, id)); }

/* Visualizzazioni (solo su questo dispositivo) per variare i ricordi proposti */
function bumpViewLocal(id) {
  if (!id || !COUPLE_ID) return;
  const key = `nd_views_${COUPLE_ID}`;
  let map = {};
  try { map = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) {}
  map[id] = { ts: Date.now(), count: ((map[id] && map[id].count) || 0) + 1 };
  try { localStorage.setItem(key, JSON.stringify(map)); } catch (e) {}
}
function getViewLocal(id) {
  if (!id || !COUPLE_ID) return null;
  try { return JSON.parse(localStorage.getItem(`nd_views_${COUPLE_ID}`) || '{}')[id] || null; } catch (e) { return null; }
}

/* ═══════════════════════════════════════════════
   TESTI DEI RICORDI — solo le vostre parole
   Il titolo è sempre quello che avete scritto voi; se manca,
   il luogo o la data. Nessuna frase inventata.
═══════════════════════════════════════════════ */
function photoWhen(g, today = todayStart()) {
  const d = parseLocalDate(g.date);
  if (!d) return '';
  if (d.getMonth() === today.getMonth() && d.getDate() === today.getDate() && d.getFullYear() < today.getFullYear()) {
    const y = today.getFullYear() - d.getFullYear();
    return `Oggi, ${y === 1 ? 'un anno fa' : `${y} anni fa`}`;
  }
  const diff = Math.floor((today - d) / 86400000);
  if (diff < 0) return '';
  if (diff === 0) return 'Oggi';
  if (diff === 1) return 'Ieri';
  if (diff < 30) return `${diff} giorni fa`;
  if (diff < 365) { const m = Math.floor(diff / 30); return m === 1 ? 'Un mese fa' : `${m} mesi fa`; }
  const y = Math.floor(diff / 365);
  const more = diff - y * 365 > 45 ? 'Più di ' : '';
  return more + (y === 1 ? (more ? 'un anno fa' : 'Un anno fa') : `${y} anni fa`);
}

function photoText(g) {
  const title = (g.title || '').trim();
  const loc = (g.location || '').trim();
  const date = g.date ? fmtDate(g.date, { day:'numeric', month:'long', year:'numeric' }) : '';
  const head = title || loc || date || 'Un ricordo';
  const meta = [date !== head ? date : '', loc !== head ? loc : ''].filter(Boolean).map(esc).join(' · ');
  return { title: esc(head), caption: (g.caption || '').trim(), meta, when: photoWhen(g) };
}

function pickHeroMemories(max = 8) {
  const gallery = (data._gallery || []).filter(g => g.img);
  if (!gallery.length) return [];
  const now = Date.now();
  const pool = gallery.map(g => {
    const v = getViewLocal(g.id);
    let w = 5;
    if (v) w = Math.max(0.3, 1 + Math.min(4, (now - v.ts) / 86400000 / 7) - Math.min(0.7, (v.count || 0) * 0.1));
    return { g, w };
  });
  const picked = [];
  while (picked.length < Math.min(max, gallery.length) && pool.length) {
    const total = pool.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total, i = 0;
    for (; i < pool.length; i++) { r -= pool[i].w; if (r <= 0) break; }
    i = Math.min(i, pool.length - 1);
    picked.push(pool[i].g); pool.splice(i, 1);
  }
  // in ordine cronologico, come un racconto
  return picked.sort((a, b) => galleryTime(a, 'postDate') - galleryTime(b, 'postDate'));
}

/* ═══════════════════════════════════════════════
   PAGINA
═══════════════════════════════════════════════ */
function renderRicordi() {
  const all = sortedGallery();
  let h = pageHead({
    eyebrow: all.length ? `${all.length} ricordi` : 'I vostri momenti',
    title: 'Ricordi',
    actions: `${all.length > 1 ? `<button class="icon-btn" onclick="openGallerySort()" aria-label="Ordina">${icon('sort', 20)}</button>` : ''}
              <button class="icon-btn accent" onclick="openGalleryForm()" aria-label="Aggiungi ricordo">${icon('plus', 22)}</button>`
  });

  if (!all.length) {
    return h + emptyState('camera', 'Ancora nessun ricordo', 'Aggiungete la prima foto: un viaggio, una cena, una giornata qualsiasi.',
      `<button class="btn btn-primary" onclick="openGalleryForm()">${icon('plus', 18)} Aggiungi un ricordo</button>`);
  }

  if (all.filter(g => g.img).length > 1) {
    h += `<button class="relive" onclick="playStories()">
      <span class="relive-stack">${all.filter(g => g.img).slice(0, 3).map(g => `<img src="${esc(cimg(g.img, 200))}" alt="">`).join('')}</span>
      <span class="relive-text"><b>Rivivi i vostri ricordi</b><small>Un racconto a schermo intero, scelto per voi</small></span>
      <span class="relive-play">${icon('play', 18)}</span>
    </button>`;
  }

  // gruppi per anno (con le foto spesso sparse, i mesi frammentano troppo)
  const groups = [];
  all.forEach(g => {
    const t = gallerySortBy === 'postDate' ? (g.date ? galleryTime(g, 'postDate') : null) : galleryTime(g, 'uploadDate');
    const key = t ? String(new Date(t).getFullYear()) : 'none';
    let grp = groups.find(x => x.key === key);
    if (!grp) { grp = { key, label: t ? `<em>${key}</em>` : 'Senza data', items:[] }; groups.push(grp); }
    grp.items.push(g);
  });

  h += groups.map((grp, gi) => `<section class="mgroup">
    <div class="mgroup-head">
      <h2 class="h2 year">${grp.label}</h2>
      <span class="muted small">${grp.items.length} ${grp.items.length === 1 ? 'ricordo' : 'ricordi'}</span>
      <span class="grow"></span>
      ${grp.items.filter(g => g.img).length > 1 ? `<button class="mini-play" onclick="playGroup(${gi})" aria-label="Rivivi questo anno">${icon('play', 14)}</button>` : ''}
    </div>
    <div class="mosaic">${grp.items.map((g, i) => mosaicTile(g, i === 0 && grp.items.length >= 3)).join('')}</div>
  </section>`).join('');

  window._galleryGroups = groups;
  return h;
}

function mosaicTile(g, big) {
  const rx = Object.values(g.reactions || {}).reduce((n, a) => n + ((a && a.length) || 0), 0);
  return `<button class="tile-photo ${big ? 'big' : ''}" onclick="openPhoto('${jsq(g.id)}')">
    ${g.img ? `<img src="${esc(cimg(g.img, big ? 900 : 450))}" alt="" loading="lazy" style="${g.heroFocus ? `object-position:${g.heroFocus.x}% ${g.heroFocus.y}%` : ''}">` : `<span class="tile-noimg">${g.title ? esc(g.title) : icon('photo', 28)}</span>`}
    ${big && g.title ? `<span class="tile-cap">${esc(g.title)}</span>` : ''}
    ${rx ? `<span class="tile-rx">${icon('heartFill', 12)}${rx}</span>` : ''}
  </button>`;
}

function playGroup(gi) {
  const grp = (window._galleryGroups || [])[gi]; if (!grp) return;
  playStories(grp.items.filter(g => g.img).slice().sort((a, b) => galleryTime(a, 'postDate') - galleryTime(b, 'postDate')));
}

function openGallerySort() {
  const el = openSheet(`<div class="menu">
    <h3 class="sheet-title">Ordina i ricordi</h3>
    <button class="menu-item ${gallerySortBy === 'postDate' ? 'on' : ''}" data-s="postDate">${icon('calendar', 20)} Per data del ricordo</button>
    <button class="menu-item ${gallerySortBy === 'uploadDate' ? 'on' : ''}" data-s="uploadDate">${icon('clock', 20)} Per data di caricamento</button>
    <div class="menu-sep"></div>
    <button class="menu-item ${!gallerySortReverse ? 'on' : ''}" data-r="0">Prima i più recenti</button>
    <button class="menu-item ${gallerySortReverse ? 'on' : ''}" data-r="1">Prima i più vecchi</button>
  </div>`, { cls:'sheet-small' });
  const save = () => {
    try { localStorage.setItem(GALLERY_SORT_LS_KEY, JSON.stringify({ sortBy: gallerySortBy, reverse: gallerySortReverse })); } catch (e) {}
    renderPage('ricordi', true); closeTop();
  };
  el.querySelectorAll('[data-s]').forEach(b => b.addEventListener('click', () => { gallerySortBy = b.dataset.s; save(); }));
  el.querySelectorAll('[data-r]').forEach(b => b.addEventListener('click', () => { gallerySortReverse = b.dataset.r === '1'; save(); }));
}

/* ═══════════════════════════════════════════════
   VIEWER FOTO
═══════════════════════════════════════════════ */
function openPhoto(id, opts = {}) {
  const list = sortedGallery();
  let idx = list.findIndex(g => sameId(g.id, id));
  if (idx < 0) { toast('Ricordo non trovato'); return; }

  const el = openFullLayer(`<div class="viewer">
    <div class="viewer-top">
      <button class="icon-btn glass" data-act="close" aria-label="Chiudi">${icon('close', 20)}</button>
      <span class="viewer-count"></span>
      <button class="icon-btn glass" data-act="more" aria-label="Altro">${icon('more', 20)}</button>
    </div>
    <div class="viewer-stage">
      <button class="viewer-nav prev" data-act="prev" aria-label="Precedente">${icon('chevL', 26)}</button>
      <div class="viewer-img"></div>
      <button class="viewer-nav next" data-act="next" aria-label="Successiva">${icon('chevR', 26)}</button>
    </div>
    <div class="viewer-info"></div>
  </div>`, { cls:'viewer-layer', replace: opts.replace, onClose: () => document.removeEventListener('keydown', onKey) });

  const show = () => {
    const g = list[idx];
    const fresh = findPhoto(g.id) || g;
    el.querySelector('.viewer-count').textContent = `${idx + 1} / ${list.length}`;
    el.querySelector('.viewer-img').innerHTML = fresh.img
      ? `<img src="${esc(cimg(fresh.img, 1800))}" alt="">`
      : `<div class="viewer-noimg">${icon('photo', 56)}</div>`;
    el.querySelector('.prev').hidden = idx === 0;
    el.querySelector('.next').hidden = idx === list.length - 1;
    const meta = [fresh.date ? fmtDate(fresh.date, { day:'numeric', month:'long', year:'numeric' }) : '', fresh.location ? esc(fresh.location) : ''].filter(Boolean).join(' · ');
    el.querySelector('.viewer-info').innerHTML = `
      ${fresh.title ? `<h2 class="display viewer-title">${esc(fresh.title)}</h2>` : ''}
      ${fresh.caption ? `<p class="viewer-cap">${linkify(fresh.caption)}</p>` : ''}
      ${meta ? `<div class="viewer-meta">${meta}</div>` : ''}
      <div class="reactions">${reactionsHtml(fresh.reactions)}</div>`;
    el.querySelectorAll('.reactions [data-emoji]').forEach(b => b.addEventListener('click', async () => {
      await toggleGalleryReaction(fresh.id, b.dataset.emoji);
      show();
    }));
    bumpViewLocal(g.id);
  };
  const nav = d => { const n = idx + d; if (n < 0 || n >= list.length) return; idx = n; show(); };
  const onKey = e => { if (e.key === 'ArrowLeft') nav(-1); if (e.key === 'ArrowRight') nav(1); };
  document.addEventListener('keydown', onKey);

  el.querySelector('[data-act=close]').addEventListener('click', closeTop);
  el.querySelector('[data-act=prev]').addEventListener('click', () => nav(-1));
  el.querySelector('[data-act=next]').addEventListener('click', () => nav(1));
  el.querySelector('[data-act=more]').addEventListener('click', () => photoMenu(list[idx].id));

  // swipe orizzontale per scorrere, verso il basso per chiudere
  const stage = el.querySelector('.viewer-stage');
  let sx = 0, sy = 0, tracking = false;
  stage.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true; }, { passive:true });
  stage.addEventListener('touchend', e => {
    if (!tracking) return; tracking = false;
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) nav(dx < 0 ? 1 : -1);
    else if (dy > 110 && Math.abs(dy) > Math.abs(dx)) closeTop();
  });
  show();
}

function reactionsHtml(reactions = {}) {
  const g = groupReactions(reactions);
  return REACTIONS.map(r => {
    const users = g[r.k] || [];
    const mine = users.includes(myRole);
    const who = users.map(u => PEOPLE[u] || u).join(' e ');
    return `<button class="rx ${mine ? 'mine' : ''} ${users.length ? 'has' : ''}" data-emoji="${r.k}" aria-label="${r.label}" title="${esc(who || r.label)}">${icon(r.ic, 20, 'rx-ic rx-' + r.ic)}${users.length ? `<i>${users.length === 2 ? '2' : esc(initials(PEOPLE[users[0]]))}</i>` : ''}</button>`;
  }).join('');
}

// Attiva/disattiva la mia reazione; spegnendola la tolgo anche dalle emoji "sorelle" della vecchia app
function toggleReactionMap(reactions, emoji) {
  const k = reactionKey(emoji);
  const r = { ...(reactions || {}) };
  const keys = Object.keys(r).filter(e => reactionKey(e) === k);
  const mine = keys.some(e => (r[e] || []).includes(myRole));
  if (mine) {
    keys.forEach(e => { r[e] = (r[e] || []).filter(u => u !== myRole); if (!r[e].length) delete r[e]; });
  } else {
    r[k] = [...(r[k] || []), myRole];
  }
  return r;
}

const hasMyReaction = (reactions, emoji) => (groupReactions(reactions)[reactionKey(emoji)] || []).includes(myRole);

async function toggleGalleryReaction(id, emoji) {
  const g = findPhoto(id); if (!g) return;
  const wantOn = !hasMyReaction(g.reactions, emoji);
  await mutate('_gallery', list => list.map(x => {
    if (!sameId(x.id, id)) return x;
    return hasMyReaction(x.reactions, emoji) === wantOn ? x : { ...x, reactions: toggleReactionMap(x.reactions, emoji) };
  }));
}

function photoMenu(id) {
  const g = findPhoto(id); if (!g) return;
  const el = openSheet(`<div class="menu">
    <h3 class="sheet-title">${esc(g.title || 'Ricordo')}</h3>
    <button class="menu-item" data-a="edit">${icon('edit', 20)} Modifica</button>
    ${g.img ? `<a class="menu-item" href="${esc(g.img)}" target="_blank" rel="noopener">${icon('download', 20)} Apri l'originale</a>` : ''}
    <button class="menu-item danger" data-a="del">${icon('trash', 20)} Elimina</button>
  </div>`, { cls:'sheet-small' });
  el.querySelector('[data-a=edit]').addEventListener('click', () => openGalleryForm(id, { replace:true }));
  el.querySelector('[data-a=del]').addEventListener('click', () => deletePhoto(id));
}

async function deletePhoto(id) {
  const g = findPhoto(id); if (!g) return;
  const ok = await confirmSheet({ title:'Eliminare questo ricordo?', text: g.title ? `“${g.title}” verrà tolto dalla galleria.` : 'Verrà tolto dalla galleria.', ok:'Elimina', danger:true });
  if (!ok) return;
  closeAllLayers(() => mutate('_gallery', list => list.filter(x => !sameId(x.id, id))));
}

/* ═══════════════════════════════════════════════
   FORM RICORDO
═══════════════════════════════════════════════ */
function openGalleryForm(id = null, opts = {}) {
  const g = id ? findPhoto(id) : null;
  const html = `<form class="form" id="gal-form" novalidate>
    <h3 class="sheet-title">${g ? 'Modifica ricordo' : 'Nuovo ricordo'}</h3>
    ${photoFieldHtml('gal', g?.img || '', { big:true, focal:true, label:'Scegli una foto' })}
    <label class="field"><span>Titolo</span><input class="input big" name="title" value="${esc(g?.title || '')}" placeholder="Un momento speciale…" autocomplete="off"></label>
    <label class="field"><span>Racconto</span><textarea class="input" name="caption" rows="3" placeholder="Cosa è successo, cosa vi siete detti…">${esc(g?.caption || '')}</textarea></label>
    <div class="grid2">
      <label class="field"><span>Quando</span><input class="input" type="date" name="date" value="${esc(g ? (g.date || '') : todayKey())}"></label>
      <label class="field"><span>Dove</span><input class="input" name="location" value="${esc(g?.location || '')}" placeholder="Roma, Trastevere"></label>
    </div>
    <div class="row-actions sticky">
      <button type="button" class="btn btn-ghost" onclick="closeTop()">Annulla</button>
      <button type="submit" class="btn btn-primary">Salva</button>
    </div>
  </form>`;
  const el = openSheet(html, { cls:'sheet-form', replace: opts.replace });
  bindPhotoField(el, 'gal', { focal: g?.heroFocus || { x:50, y:50 } });
  const form = el.querySelector('#gal-form');
  // nuovo ricordo: apre subito la scelta della foto (deve restare sincrono per iOS)
  if (!g && opts.pick !== false) { try { el.querySelector('#pf-gal input[type=file]').click(); } catch (e) {} }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const photo = getPhotoValue(el, 'gal');
    if (photo.busy) { toast('Aspetta che la foto finisca di caricare'); return; }
    const title = form.title.value.trim();
    if (!title && !photo.url) { toast('Aggiungi almeno una foto o un titolo'); return; }
    const payload = {
      title,
      caption: form.caption.value.trim(),
      date: form.date.value,
      location: form.location.value.trim(),
      img: photo.url,
      heroFocus: photo.url ? (photo.focal || { x:50, y:50 }) : null,
    };
    closeTop();
    if (g) {
      await mutate('_gallery', list => list.map(x => sameId(x.id, g.id) ? { ...x, ...payload } : x));
    } else {
      const item = { ...payload, id: Date.now(), reactions:{} };
      const ok = await mutate('_gallery', list => [item, ...list]);
      if (ok) toast('Ricordo aggiunto', { action:'Vedi', onAction: () => openPhoto(item.id) });
    }
  });
}

/* ═══════════════════════════════════════════════
   STORIE — "Rivivi"
═══════════════════════════════════════════════ */
const STORY_MS = 6500;

function playStories(items) {
  const gallery = (data._gallery || []).filter(g => g.img);
  if (!gallery.length) { openGalleryForm(); return; }
  const list = (items && items.length ? items : pickHeroMemories()).filter(g => g.img);
  const slides = list.map(g => ({ g, t: photoText(g) }));

  const el = openFullLayer(`<div class="stories">
    <div class="story-bars">${slides.map(() => '<span><i></i></span>').join('')}<span><i></i></span></div>
    <div class="story-top">
      <span class="story-brand">Noi <em>Due</em></span>
      <button class="icon-btn glass sm" data-act="close" aria-label="Chiudi">${icon('close', 18)}</button>
    </div>
    ${slides.map((s, i) => {
      const g = s.g, t = s.t;
      return `<section class="story" data-i="${i}">
        <div class="story-photo"><img src="${esc(cimg(g.img, 1600))}" alt="" style="${g.heroFocus ? `object-position:${g.heroFocus.x}% ${g.heroFocus.y}%` : ''}"></div>
        <div class="story-shade"></div>
        <div class="story-text">
          ${t.when ? `<span class="glass-chip">${icon('clock', 13)} ${t.when}</span>` : ''}
          <div class="story-phrase">${t.title}</div>
          ${t.caption ? `<div class="story-caption">${esc(t.caption)}</div>` : ''}
          ${t.meta ? `<div class="story-meta">${t.meta}</div>` : ''}
        </div>
      </section>`;
    }).join('')}
    <section class="story story-end" data-i="${slides.length}">
      <div class="story-end-inner">
        <div class="eyebrow center">Fine</div>
        <div class="display story-end-title">Ancora tanti<br><em>ricordi</em> da fare.</div>
        <div class="row-actions center">
          <button class="btn btn-ghost" data-act="again">${icon('restore', 18)} Ancora</button>
          <button class="btn btn-cream" data-act="add">${icon('plus', 18)} Nuovo ricordo</button>
        </div>
      </div>
    </section>
    <div class="story-tap left" data-tap="-1"></div>
    <div class="story-tap right" data-tap="1"></div>
  </div>`, { cls:'stories-layer', onClose: () => { stopped = true; cancelAnimationFrame(raf); } });

  const total = slides.length + 1;
  let idx = 0, start = performance.now(), paused = false, pausedAt = 0, raf = 0, stopped = false;
  const bars = el.querySelectorAll('.story-bars i');
  const secs = el.querySelectorAll('.story');

  const setActive = i => {
    idx = Math.max(0, Math.min(total - 1, i));
    secs.forEach((s, k) => s.classList.toggle('active', k === idx));
    bars.forEach((b, k) => b.style.width = k < idx ? '100%' : '0%');
    el.querySelector('.stories').classList.toggle('at-end', idx === total - 1);
    start = performance.now();
    if (slides[idx]) bumpViewLocal(slides[idx].g.id);
    // precarica la successiva
    const nx = secs[idx + 1] && secs[idx + 1].querySelector('img');
    if (nx && !nx.complete) nx.loading = 'eager';
  };
  const tick = now => {
    if (stopped) return;
    if (!paused && idx < total - 1) {
      const p = Math.min(1, (now - start) / STORY_MS);
      bars[idx].style.width = (p * 100) + '%';
      if (p >= 1) setActive(idx + 1);
    }
    if (idx === total - 1) bars[idx].style.width = '100%';
    raf = requestAnimationFrame(tick);
  };

  // tocco breve: avanti/indietro — tocco lungo: pausa
  let downAt = 0;
  el.querySelectorAll('[data-tap]').forEach(z => {
    z.addEventListener('pointerdown', () => { downAt = performance.now(); paused = true; pausedAt = downAt; el.classList.add('paused'); });
    z.addEventListener('pointerup', () => {
      const held = performance.now() - downAt;
      paused = false; el.classList.remove('paused');
      start += performance.now() - pausedAt;
      if (held < 250) setActive(idx + parseInt(z.dataset.tap));
    });
    z.addEventListener('pointercancel', () => { paused = false; el.classList.remove('paused'); });
  });
  let sy = 0;
  el.addEventListener('touchstart', e => { sy = e.touches[0].clientY; }, { passive:true });
  el.addEventListener('touchend', e => { if (e.changedTouches[0].clientY - sy > 120) closeTop(); });

  el.querySelector('[data-act=close]').addEventListener('click', closeTop);
  el.querySelector('[data-act=again]').addEventListener('click', () => setActive(0));
  el.querySelector('[data-act=add]').addEventListener('click', () => { closeTop(); setTimeout(() => openGalleryForm(), 350); });
  const onKey = e => { if (e.key === 'ArrowRight') setActive(idx + 1); if (e.key === 'ArrowLeft') setActive(idx - 1); };
  document.addEventListener('keydown', onKey);
  const prevClose = layers[layers.length - 1].onClose;
  layers[layers.length - 1].onClose = () => { document.removeEventListener('keydown', onKey); prevClose && prevClose(); };

  setActive(0);
  raf = requestAnimationFrame(tick);
}
