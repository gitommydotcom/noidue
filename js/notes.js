/* ═══════════════════════════════════════════════
   NOI DUE — Bigliettini
   Note brevi che arrivano come busta chiusa: si aprono con un tocco
   e restano appese in bacheca. Testo, foto, disegno o canzone.
   Opzionale: "capsula del tempo" (si apre solo da una certa data).
   Database: couples/{id}/notes/{autoId}
═══════════════════════════════════════════════ */

const PAPERS = {
  lilla:  { bg:'#e6def4', ink:'#2e2645', name:'Glicine' },
  carta:  { bg:'#f3e9d8', ink:'#3b2a1e', name:'Carta' },
  rosa:   { bg:'#f2d4cb', ink:'#4a231f', name:'Rosa' },
  burro:  { bg:'#f3e2b3', ink:'#3d2f12', name:'Burro' },
  salvia: { bg:'#d9dfca', ink:'#2e3524', name:'Salvia' },
  cielo:  { bg:'#d4dde6', ink:'#22303c', name:'Cielo' },
  notte:  { bg:'#262035', ink:'#ece6f6', name:'Notte' },
};
const paperOf = n => PAPERS[n && n.paper] || PAPERS.carta; // i bigliettini senza carta restano color carta
const paperStyle = n => { const p = paperOf(n); return `--paper:${p.bg};--ink:${p.ink}`; };

let notesFilter = 'all';

function isLocked(n) { return !!(n.unlockAt && n.unlockAt > todayKey()); }
function canSeeNote(n) { return n.from === myRole || !!n.openedAt; }
function unreadNotes() {
  return notesList.filter(n => n.from !== myRole && !n.openedAt && !isLocked(n))
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
}
function findNote(id) { return notesList.find(n => n.id === id); }
function noteRot(n) { return ((hashStr(String(n.id)) % 9) - 4) * 0.55; }

/* ═══════════════════════════════════════════════
   PAGINA
═══════════════════════════════════════════════ */
function renderBigliettini() {
  const other = otherName();
  const toOpen = notesList.filter(n => n.from !== myRole && !n.openedAt)
    .sort((a, b) => (isLocked(a) - isLocked(b)) || ((a.createdAt || 0) - (b.createdAt || 0)));
  const board = notesList.filter(canSeeNote).filter(n =>
    notesFilter === 'all' || (notesFilter === 'me' ? n.from === myRole : n.from !== myRole));

  let h = pageHead({
    eyebrow: 'Piccole cose da lasciarsi',
    title: 'Bigliettini',
    actions: `<button class="icon-btn accent" onclick="openCompose()" aria-label="Scrivi un bigliettino">${icon('pen', 20)}</button>`
  });

  h += `<button class="compose-cta" onclick="openCompose()">
    <span class="cta-papers">
      <i style="--paper:${PAPERS.rosa.bg}"></i><i style="--paper:${PAPERS.cielo.bg}"></i><i style="--paper:${PAPERS.lilla.bg}"></i>
    </span>
    <span class="cta-text"><b>Scrivi a ${esc(other)}</b><small>Arriverà come una busta da aprire</small></span>
    ${icon('arrowR', 20, 'chev')}
  </button>`;

  if (toOpen.length) {
    h += `<section class="block">
      <div class="block-head"><h2 class="h2">Da aprire <em>${toOpen.length}</em></h2></div>
      <div class="env-row">${toOpen.map(n => envelopeItem(n)).join('')}</div>
    </section>`;
  }

  h += `<section class="block">
    <div class="block-head"><h2 class="h2">La bacheca</h2></div>
    <div class="chips">
      <button class="chip sm ${notesFilter === 'all' ? 'on' : ''}" onclick="setNotesFilter('all')">Tutti</button>
      <button class="chip sm ${notesFilter === 'other' ? 'on' : ''}" onclick="setNotesFilter('other')">Da ${esc(other)}</button>
      <button class="chip sm ${notesFilter === 'me' ? 'on' : ''}" onclick="setNotesFilter('me')">Da me</button>
    </div>
    ${board.length
      ? `<div class="board">${board.map(noteCardHtml).join('')}</div>`
      : emptyState('mail', notesList.length ? 'Niente qui' : 'La bacheca è vuota', notesList.length ? '' : `Scrivete il primo bigliettino: un grazie, un “mi manchi”, un disegno, una canzone.`)}
  </section>`;

  h += `<button class="archive-link" onclick="openChatArchive()">${icon('chat', 18)} Archivio della vecchia chat ${icon('chevR', 16)}</button>`;
  return h;
}

function setNotesFilter(f) { notesFilter = f; renderPage('bigliettini', true); }

function envelopeHtml(n, big) {
  const locked = isLocked(n);
  return `<div class="env ${big ? 'big' : ''}" style="${paperStyle(n)}">
    <div class="env-back"></div>
    <div class="env-letter"><span></span><span></span><span></span></div>
    <div class="env-front"></div>
    <div class="env-flap"></div>
    <div class="env-seal">${locked ? icon('lock', big ? 22 : 16) : esc(initials(PEOPLE[n.from]))}</div>
  </div>`;
}

function envelopeItem(n) {
  const locked = isLocked(n);
  return `<button class="env-item ${locked ? 'locked' : ''}" onclick="openEnvelope('${jsq(n.id)}')">
    ${envelopeHtml(n)}
    <span class="env-label">${locked ? `Si apre il ${fmtDate(n.unlockAt, { day:'numeric', month:'long' })}` : `da ${esc(PEOPLE[n.from] || '')} · ${relTime(n.createdAt)}`}</span>
  </button>`;
}

function noteContentHtml(n, full) {
  let c = '';
  if (n.kind === 'photo' && n.img) c += `<div class="note-photo"><img src="${esc(cimg(n.img, full ? 1400 : 600))}" alt="" loading="lazy"></div>`;
  if (n.kind === 'doodle' && n.drawing) c += `<img class="note-doodle" src="${n.drawing.startsWith('data:image/') ? n.drawing : ''}" alt="disegno">`;
  if (n.kind === 'song' && n.link) {
    c += full ? `<div class="note-song">${mediaPreview(n.link)}</div>`
              : `<div class="note-song-mini">${icon('music', 18)}<span>Una canzone per te</span></div>`;
  }
  if (n.text) c += `<p class="hand">${full ? linkify(n.text) : esc(n.text)}</p>`;
  return c;
}

function noteStatus(n) {
  if (n.from !== myRole) return '';
  if (isLocked(n)) return `<span class="note-status">${icon('lock', 12)} si apre il ${fmtDate(n.unlockAt, { day:'numeric', month:'short' })}</span>`;
  if (n.openedAt) return `<span class="note-status ok">${icon('check', 12)} letto</span>`;
  return `<span class="note-status">non ancora aperto</span>`;
}

function noteCardHtml(n) {
  const rx = Object.keys(groupReactions(n.reactions)).map(k => reactionIcon(k, 14)).join('');
  return `<article class="note-card kind-${esc(n.kind || 'text')}" style="${paperStyle(n)};--rot:${noteRot(n)}deg" onclick="openNote('${jsq(n.id)}')">
    <span class="tape"></span>
    ${noteContentHtml(n, false)}
    <footer class="note-foot">
      <span>— ${esc(PEOPLE[n.from] || '')}</span>
      <span>${fmtTs(n.createdAt)}</span>
    </footer>
    ${noteStatus(n)}
    ${rx ? `<span class="note-rx">${rx}</span>` : ''}
  </article>`;
}

/* ═══════════════════════════════════════════════
   APERTURA BUSTA
═══════════════════════════════════════════════ */
function openEnvelope(id) {
  const n = findNote(id); if (!n) return;
  if (n.from === myRole || n.openedAt) { openNote(id); return; }
  if (isLocked(n)) {
    toast(`Capsula del tempo: si apre il ${fmtDate(n.unlockAt, { weekday:'long', day:'numeric', month:'long' })}`);
    return;
  }
  const el = openFullLayer(`<div class="env-stage">
    <button class="icon-btn glass close-tr" data-act="close" aria-label="Chiudi">${icon('close', 20)}</button>
    <div class="env-for">Per te, da <em>${esc(PEOPLE[n.from] || '')}</em></div>
    <button class="env-btn" aria-label="Apri la busta">${envelopeHtml(n, true)}</button>
    <div class="env-hint">Tocca per aprire</div>
  </div>`, { cls:'env-layer' });
  el.querySelector('[data-act=close]').addEventListener('click', closeTop);
  const btn = el.querySelector('.env-btn');
  btn.addEventListener('click', () => {
    if (btn.classList.contains('opening')) return;
    btn.classList.add('opening');
    el.querySelector('.env-stage').classList.add('is-opening');
    el.querySelector('.env-hint').textContent = '';
    if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
    updateNote(id, { openedAt: Date.now() }).catch(e => console.error(e));
    setTimeout(() => openNote(id, { replace:true, fresh:true }), 1950);
  }, { once:false });
}

/* ═══════════════════════════════════════════════
   BIGLIETTINO APERTO
═══════════════════════════════════════════════ */
function openNote(id, opts = {}) {
  const n = findNote(id); if (!n) return;
  const mine = n.from === myRole;
  const el = openFullLayer(`<div class="note-view ${opts.fresh ? 'fresh' : ''}">
    <button class="icon-btn glass close-tr" data-act="close" aria-label="Chiudi">${icon('close', 20)}</button>
    <div class="note-scroll">
      <article class="note-paper kind-${esc(n.kind || 'text')}" style="${paperStyle(n)}">
        <div class="note-to">${mine ? `Per ${esc(otherName())}` : `Per te`}</div>
        ${noteContentHtml(n, true)}
        <footer class="note-sign">— ${esc(PEOPLE[n.from] || '')}<small>${fmtTs(n.createdAt, { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</small></footer>
      </article>
      <div class="reactions center" data-rx>${reactionsHtml(n.reactions)}</div>
      <div class="row-actions center">
        ${mine
          ? `<span class="muted small">${n.openedAt ? `Letto ${relTime(n.openedAt)}` : isLocked(n) ? `Si apre il ${fmtDate(n.unlockAt, { day:'numeric', month:'long' })}` : 'Non ancora aperto'}</span>
             <button class="icon-btn" data-act="del" aria-label="Elimina">${icon('trash', 20)}</button>`
          : `<button class="btn btn-cream" data-act="reply">${icon('pen', 18)} Rispondi</button>`}
      </div>
    </div>
  </div>`, { cls:'note-layer', replace: opts.replace });

  el.querySelector('[data-act=close]').addEventListener('click', closeTop);
  const bindRx = () => el.querySelectorAll('[data-rx] [data-emoji]').forEach(b => b.addEventListener('click', async () => {
    const cur = findNote(id); if (!cur) return;
    const reactions = toggleReactionMap(cur.reactions, b.dataset.emoji);
    cur.reactions = reactions;
    el.querySelector('[data-rx]').innerHTML = reactionsHtml(reactions);
    bindRx();
    try { await updateNote(id, { reactions }); } catch (e) { toast('Reazione non salvata'); }
  }));
  bindRx();
  el.querySelector('[data-act=reply]')?.addEventListener('click', () => openCompose());
  el.querySelector('[data-act=del]')?.addEventListener('click', async () => {
    const ok = await confirmSheet({ title:'Eliminare questo bigliettino?', text:'Sparisce anche per ' + otherName() + '.', ok:'Elimina', danger:true });
    if (!ok) return;
    closeAllLayers(() => deleteNote(id).catch(() => toast('Eliminazione non riuscita')));
  });
}

/* ═══════════════════════════════════════════════
   SCRIVI
═══════════════════════════════════════════════ */
function openCompose(kind = 'text') {
  let paper = 'lilla';
  let sketch = null;
  const tomorrow = todayKey(new Date(Date.now() + 86400000));
  const html = `<form class="compose" id="compose" novalidate>
    <h3 class="sheet-title">Per ${esc(otherName())}</h3>
    <div class="seg full kinds">
      <button type="button" data-kind="text">${icon('pen', 16)} Scritto</button>
      <button type="button" data-kind="photo">${icon('camera', 16)} Foto</button>
      <button type="button" data-kind="doodle">${icon('scribble', 16)} Disegno</button>
      <button type="button" data-kind="song">${icon('music', 16)} Canzone</button>
    </div>
    <div class="paper-pick">${Object.entries(PAPERS).map(([k, p]) => `<button type="button" class="paper-sw ${k === paper ? 'on' : ''}" data-paper="${k}" style="--paper:${p.bg};--ink:${p.ink}" aria-label="${p.name}"></button>`).join('')}</div>
    <div class="compose-paper" style="--paper:${PAPERS[paper].bg};--ink:${PAPERS[paper].ink}">
      <div data-panel="photo" hidden>${photoFieldHtml('note', '', { label:'Scegli una foto' })}</div>
      <div data-panel="doodle" hidden><canvas class="doodle-canvas"></canvas></div>
      <div data-panel="song" hidden>
        <input class="input song-input" type="url" name="link" placeholder="Incolla un link di Spotify o YouTube">
        <div class="song-preview"></div>
      </div>
      <textarea class="hand" name="text" rows="4" maxlength="1200" placeholder="Scrivi qui…"></textarea>
      <div class="compose-sign">— ${esc(meName())}</div>
    </div>
    <div data-panel="doodle-tools" hidden>${sketchToolbarHtml('note')}</div>
    <label class="capsule">
      <input type="checkbox" name="lock">
      <span class="capsule-text">${icon('lock', 18)} <b>Capsula del tempo</b><small>Si potrà aprire solo da una data</small></span>
      <input class="input" type="date" name="unlockAt" min="${tomorrow}" value="${tomorrow}">
    </label>
    <div class="row-actions sticky">
      <button type="button" class="btn btn-ghost" onclick="closeTop()">Annulla</button>
      <button type="submit" class="btn btn-primary">${icon('send', 18)} Imbuca</button>
    </div>
  </form>`;

  const el = openSheet(html, { cls:'sheet-form sheet-compose', onClose: () => sketch && sketch.destroy() });
  const form = el.querySelector('#compose');
  const paperBox = form.querySelector('.compose-paper');
  bindPhotoField(el, 'note');

  const setKind = k => {
    kind = k;
    form.querySelectorAll('[data-kind]').forEach(b => b.classList.toggle('on', b.dataset.kind === k));
    form.querySelector('[data-panel=photo]').hidden = k !== 'photo';
    form.querySelector('[data-panel=doodle]').hidden = k !== 'doodle';
    form.querySelector('[data-panel=doodle-tools]').hidden = k !== 'doodle';
    form.querySelector('[data-panel=song]').hidden = k !== 'song';
    form.text.placeholder = k === 'text' ? 'Scrivi qui…' : 'Aggiungi due parole (facoltativo)…';
    form.text.rows = k === 'text' ? 5 : 2;
    if (k === 'doodle' && !sketch) {
      requestAnimationFrame(() => {
        sketch = new Sketch(form.querySelector('.doodle-canvas'), { bg:null, color: PAPERS[paper].ink, size:6 });
        bindSketchToolbar(el, 'note', sketch);
        const first = el.querySelector('#st-note [data-color]');
        if (first) { first.style.setProperty('--c', PAPERS[paper].ink); first.dataset.color = PAPERS[paper].ink; }
      });
    }
  };
  form.querySelectorAll('[data-kind]').forEach(b => b.addEventListener('click', () => setKind(b.dataset.kind)));
  form.querySelectorAll('[data-paper]').forEach(b => b.addEventListener('click', () => {
    paper = b.dataset.paper;
    form.querySelectorAll('[data-paper]').forEach(x => x.classList.toggle('on', x === b));
    paperBox.style.setProperty('--paper', PAPERS[paper].bg);
    paperBox.style.setProperty('--ink', PAPERS[paper].ink);
  }));
  const songIn = form.querySelector('.song-input');
  songIn.addEventListener('input', () => {
    const v = songIn.value.trim();
    form.querySelector('.song-preview').innerHTML = /^https?:\/\//.test(v) ? mediaPreview(v) : '';
  });
  setKind(kind);
  if (kind === 'text') setTimeout(() => form.text.focus(), 380);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const text = form.text.value.trim();
    const note = { kind, paper, text };
    if (kind === 'text' && !text) { toast('Scrivi qualcosa prima di imbucare'); form.text.focus(); return; }
    if (kind === 'photo') {
      const p = getPhotoValue(el, 'note');
      if (p.busy) { toast('Aspetta che la foto finisca di caricare'); return; }
      if (!p.url) { toast('Scegli una foto'); return; }
      note.img = p.url;
    }
    if (kind === 'doodle') {
      if (!sketch || !sketch.dirty) { toast('Fai un disegno prima di imbucare'); return; }
      note.drawing = sketch.toDataURL(0.75, 900, PAPERS[paper].bg);
    }
    if (kind === 'song') {
      const link = songIn.value.trim();
      if (!/^https?:\/\//.test(link)) { toast('Incolla il link della canzone'); songIn.focus(); return; }
      note.link = link;
    }
    if (form.lock.checked && form.unlockAt.value && form.unlockAt.value > todayKey()) note.unlockAt = form.unlockAt.value;

    const btn = form.querySelector('[type=submit]');
    setBusy(btn, true, 'Imbuco…');
    try {
      await Promise.race([addNote(note), new Promise(r => setTimeout(r, 2500))]);
      closeTop();
      toast(note.unlockAt ? `Capsula sigillata: ${otherName()} potrà aprirla il ${fmtDate(note.unlockAt, { day:'numeric', month:'long' })}` : `Imbucato! ${otherName()} lo troverà nella sua bacheca`);
    } catch (err) {
      setBusy(btn, false);
      toast('Invio non riuscito: ' + err.message);
    }
  });
}

/* ═══════════════════════════════════════════════
   ARCHIVIO CHAT (sola lettura)
═══════════════════════════════════════════════ */
async function openChatArchive() {
  const el = openSheet(`<div class="archive">
    <h3 class="sheet-title">La vecchia chat</h3>
    <p class="muted small">I vostri messaggi di prima, conservati qui in sola lettura.</p>
    <div class="archive-list"><div class="center pad"><span class="spinner"></span></div></div>
  </div>`, { cls:'sheet-tall' });
  try {
    const msgs = await loadChatArchive();
    const box = el.querySelector('.archive-list');
    if (!msgs.length) { box.innerHTML = `<p class="muted center pad">Nessun messaggio salvato.</p>`; return; }
    let lastDay = '';
    box.innerHTML = msgs.map(m => {
      const d = m.ts ? new Date(m.ts) : null;
      const day = d ? d.toLocaleDateString('it-IT', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) : '';
      const sep = day && day !== lastDay ? `<div class="archive-day">${cap(day)}</div>` : '';
      lastDay = day || lastDay;
      const rx = Object.keys(groupReactions(m.reactions)).map(k => reactionIcon(k, 13)).join('');
      return `${sep}<div class="bubble ${m.who === myRole ? 'me' : 'them'}">
        <div class="bubble-text">${linkify(m.text || '')}</div>
        <div class="bubble-meta">${esc(PEOPLE[m.who] || '')}${d ? ' · ' + d.toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' }) : ''}${rx ? ` <span class="bubble-rx">${rx}</span>` : ''}</div>
      </div>`;
    }).join('');
    box.scrollTop = box.scrollHeight;
  } catch (e) {
    el.querySelector('.archive-list').innerHTML = `<p class="muted center pad">Non riesco a caricare l'archivio.</p>`;
  }
}
