/* ═══════════════════════════════════════════════
   NOI DUE — Oggi (home)
═══════════════════════════════════════════════ */

let _greetCache = null;
function greeting() {
  const h = new Date().getHours();
  const slot = h >= 5 && h < 12 ? 'm' : h >= 12 && h < 15 ? 'p' : h >= 15 && h < 18 ? 'a' : h >= 18 && h < 23 ? 's' : 'n';
  const key = slot + myRole + PEOPLE.lui + PEOPLE.lei;
  if (_greetCache && _greetCache.key === key) return _greetCache.v;
  const other = esc(otherName());
  const opts = {
    m: [['Buongiorno', `Un nuovo giorno tutto per voi due.`], ['Buongiorno', `Inizia la giornata pensando a ${other}.`], ['Bella giornata', `Caffè, e poi un pensiero per ${other}.`]],
    p: [['Buon pranzo', `Una pausa per voi, prima di ripartire.`], ['Ciao', `Anche ${other} starà facendo una pausa.`]],
    a: [['Buon pomeriggio', `Un attimo di calma, solo per voi.`], ['Ciao', `${other} è qui, almeno in questo spazio.`]],
    s: [['Buonasera', `La sera è il momento giusto per pensare a ${other}.`], ['Bella serata', `Un brindisi a voi due.`], ['Finalmente sera', `Tempo per voi, tempo per ${other}.`]],
    n: [['Buonanotte', `I sogni più belli si fanno in due.`], ['Notte fonda', `Domani un'altra giornata con ${other}.`]],
  }[slot];
  const day = new Date().getDay();
  let [hello, sub] = opts[Math.floor(Math.random() * opts.length)];
  if (day === 5 && slot !== 'n') sub = `Venerdì: il weekend con ${other} è vicino.`;
  if ((day === 6 || day === 0) && slot !== 'n') sub = `Weekend: oggi siete solo voi due.`;
  _greetCache = { key, v: { hello, sub } };
  return _greetCache.v;
}

/* Eventi in arrivo (date ricorrenti + elementi con data futura) */
function upcomingEvents(limitDays = 400) {
  const out = [];
  SECTION_KEYS.forEach(s => (data[s] || []).forEach(i => {
    if (!i.date || i.done) return;
    const days = SECTIONS[s].recurring ? daysToNextOccurrence(i.date) : daysUntil(i.date);
    if (days === null || days < 0 || days > limitDays) return;
    out.push({ s, i, days });
  }));
  return out.sort((a, b) => a.days - b.days);
}

function nextOccurrenceDate(s, i) {
  if (!SECTIONS[s].recurring) return parseLocalDate(i.date);
  const d = parseLocalDate(i.date); const now = todayStart();
  const next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  return next;
}

function yearsSince(s, i) {
  if (!SECTIONS[s].recurring) return null;
  const d = parseLocalDate(i.date); if (!d) return null;
  const next = nextOccurrenceDate(s, i);
  const y = next.getFullYear() - d.getFullYear();
  return y > 0 ? y : null;
}

function dBadge(days) { return days === 0 ? 'Oggi' : `D-${days}`; }

function memoryOfTheDay() {
  const gall = (data._gallery || []).filter(g => g.img);
  if (!gall.length) return null;
  const today = todayStart();
  const otd = gall.filter(g => {
    const d = parseLocalDate(g.date);
    return d && d.getMonth() === today.getMonth() && d.getDate() === today.getDate() && d.getFullYear() < today.getFullYear();
  });
  const rnd = seededRandom(COUPLE_ID + todayKey());
  const pool = otd.length ? otd : gall;
  const g = pool[Math.floor(rnd() * pool.length)];
  return { g, t: photoText(g) };
}

function renderOggi() {
  const gr = greeting();
  const parts = [];

  parts.push(`<header class="home-top">
    <div>
      <div class="eyebrow">${esc(gr.hello)}, ${esc(meName())}</div>
      <h1 class="display home-names">${esc(PEOPLE.lui)} <em>&amp;</em> ${esc(PEOPLE.lei)}</h1>
    </div>
    <div class="home-actions">
      <button class="icon-btn" onclick="openSearch()" aria-label="Cerca">${icon('search', 20)}</button>
      <button class="avatar ${myRole}" onclick="go('impostazioni')" aria-label="Impostazioni">${esc(initials(meName()))}<i class="sync-dot"></i></button>
    </div>
  </header>
  <p class="home-sub">${gr.sub}</p>`);

  // 1 — Bigliettini da aprire
  const unread = unreadNotes();
  if (unread.length) {
    const n = unread[unread.length - 1];
    parts.push(`<article class="letter-card" onclick="openEnvelope('${jsq(n.id)}')">
      <div class="mini-env"><span class="mini-flap"></span><span class="seal">${esc(initials(PEOPLE[n.from]))}</span></div>
      <div class="letter-text">
        <div class="eyebrow accent">Per te</div>
        <h3 class="h3">${unread.length === 1 ? `Un bigliettino da ${esc(PEOPLE[n.from])}` : `${unread.length} bigliettini da ${esc(PEOPLE[n.from])}`}</h3>
        <p class="muted small">${relTime(n.createdAt)} · tocca per aprire</p>
      </div>
      ${icon('chevR', 20, 'chev')}
    </article>`);
  }

  // 2 — La domanda di oggi
  parts.push(qHomeCard());

  // 3 — Ricordo del giorno
  const m = memoryOfTheDay();
  if (m) {
    const g = m.g;
    const pos = g.heroFocus ? `object-position:${g.heroFocus.x}% ${g.heroFocus.y}%` : '';
    parts.push(`<article class="motd" onclick="openPhoto('${jsq(g.id)}')">
      <img src="${esc(cimg(g.img, 1400))}" alt="" style="${pos}" loading="eager">
      <div class="motd-shade"></div>
      <div class="motd-top">
        <span class="glass-chip">Ricordo del giorno</span>
        ${m.t.when ? `<span class="glass-chip soft">${m.t.when}</span>` : ''}
      </div>
      <div class="motd-bottom">
        <div class="motd-phrase">${m.t.title}</div>
        ${m.t.caption ? `<div class="motd-caption">${esc(m.t.caption)}</div>` : ''}
        ${m.t.meta ? `<div class="motd-meta">${m.t.meta}</div>` : ''}
        <button class="btn btn-cream sm" onclick="event.stopPropagation();playStories()">${icon('play', 16)} Rivivi i vostri ricordi</button>
      </div>
    </article>`);
  } else {
    parts.push(`<article class="motd motd-empty" onclick="openGalleryForm()">
      <div class="motd-bottom">
        <div class="eyebrow">Ricordi</div>
        <div class="motd-phrase">Il vostro <em>primo</em><br>ricordo vi aspetta.</div>
        <span class="btn btn-cream sm">${icon('plus', 16)} Aggiungi una foto</span>
      </div>
    </article>`);
  }

  // 4 — In arrivo
  const up = upcomingEvents();
  if (up.length) {
    const first = up[0];
    const fi = first.i, fs = first.s;
    const yrs = yearsSince(fs, fi);
    const bg = fi.img ? `<img src="${esc(cimg(fi.img, 1000))}" alt="" loading="lazy">` : '';
    const nextD = nextOccurrenceDate(fs, fi);
    parts.push(`<section class="block">
      <div class="block-head"><h2 class="h2">In arrivo</h2><button class="link-btn" onclick="go('calendario')">Calendario ${icon('arrowR', 15)}</button></div>
      <article class="next-card ${fi.img ? 'has-img' : 'sec-' + fs}" onclick="openItem('${fs}','${jsq(fi.id)}')">
        ${bg}<div class="next-shade"></div>
        <div class="next-d">${dBadge(first.days)}</div>
        <div class="next-body">
          <span class="glass-chip">${secIcon(fs, 14)} ${itemCats(fi)[0] ? esc(catLabel(itemCats(fi)[0])) : SECTIONS[fs].label}</span>
          <h3 class="next-title">${esc(fi.title)}</h3>
          <span class="next-date">${cap(nextD.toLocaleDateString('it-IT', { weekday:'long', day:'numeric', month:'long' }))}${yrs ? ` · ${yrs} ${yrs === 1 ? 'anno' : 'anni'}` : ''}</span>
        </div>
      </article>
      ${up.slice(1, 4).map(e => `<button class="row-card" onclick="openItem('${e.s}','${jsq(e.i.id)}')">
          <span class="row-ic">${secIcon(e.s, 20)}</span>
          <span class="row-text"><b>${esc(e.i.title)}</b><small>${fmtDate(todayKey(nextOccurrenceDate(e.s, e.i)), { day:'numeric', month:'long' })}</small></span>
          <span class="d-pill">${dBadge(e.days)}</span>
        </button>`).join('')}
    </section>`);
  } else {
    parts.push(`<section class="block">
      <div class="block-head"><h2 class="h2">In arrivo</h2><button class="link-btn" onclick="go('calendario')">Calendario ${icon('arrowR', 15)}</button></div>
      <button class="row-card dashed" onclick="openItemForm('anniversaries')">
        <span class="row-ic">${icon('calendar', 20)}</span>
        <span class="row-text"><b>Nessuna data in arrivo</b><small>Aggiungi un anniversario, un compleanno o un viaggio</small></span>
        ${icon('plus', 18, 'chev')}
      </button>
    </section>`);
  }

  // 5 — Da fare insieme
  const tiles = SECTION_KEYS.filter(s => s !== 'anniversaries').map(s => {
    const todo = (data[s] || []).filter(i => !i.done).length;
    return { s, todo };
  });
  parts.push(`<section class="block">
    <div class="block-head"><h2 class="h2">Da fare insieme</h2><button class="link-btn" onclick="openInsieme('all')">Tutto ${icon('arrowR', 15)}</button></div>
    <div class="tiles">${tiles.map(t => `<button class="tile sec-${t.s}" onclick="openInsieme('${t.s}')">
        <span class="tile-ic">${secIcon(t.s, 22)}</span>
        <span class="tile-num">${t.todo}</span>
        <span class="tile-label">${SECTIONS[t.s].label}</span>
      </button>`).join('')}</div>
    <button class="idea-btn" onclick="drawIdea()">
      <span class="idea-dice">${icon('dice', 26)}</span>
      <span><small>Non sapete cosa fare?</small><b>Pesca un'idea a caso</b></span>
      ${icon('chevR', 18, 'chev')}
    </button>
  </section>`);

  // 6 — Ultimi ricordi
  const recent = (data._gallery || []).filter(g => g.img).slice().sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 12);
  if (recent.length) {
    parts.push(`<section class="block">
      <div class="block-head"><h2 class="h2">Ultimi ricordi</h2><button class="link-btn" onclick="go('ricordi')">Tutti ${icon('arrowR', 15)}</button></div>
      <div class="strip">${recent.map(g => `<button class="strip-item" onclick="openPhoto('${jsq(g.id)}')">
          <img src="${esc(cimg(g.img, 500))}" alt="" loading="lazy" style="${g.heroFocus ? `object-position:${g.heroFocus.x}% ${g.heroFocus.y}%` : ''}">
          <span>${esc(g.title || '')}</span></button>`).join('')}
        <button class="strip-item add" onclick="openGalleryForm()">${icon('plus', 26)}<span>Aggiungi</span></button>
      </div>
    </section>`);
  }

  // 7 — Scrivi un bigliettino
  parts.push(`<button class="write-card" onclick="openCompose()">
    <span class="write-paper">${icon('pen', 22)}</span>
    <span><b>Lascia un bigliettino a ${esc(otherName())}</b><small>Due righe, una foto, un disegno o una canzone</small></span>
  </button>`);

  return `<div class="home">${parts.join('')}</div>`;
}

/* Pesca un'idea */
function drawIdea(exclude) {
  const pool = [];
  SECTION_KEYS.filter(s => !SECTIONS[s].recurring).forEach(s => (data[s] || []).forEach(i => { if (!i.done) pool.push({ s, i }); }));
  if (!pool.length) { toast('La lista è vuota: aggiungete qualcosa da fare insieme!'); return; }
  let choices = pool.filter(p => !exclude || !sameId(p.i.id, exclude));
  if (!choices.length) choices = pool;
  const pick = choices[Math.floor(Math.random() * choices.length)];
  const { s, i } = pick;
  const html = `<div class="idea">
    <div class="eyebrow center">Che ne dite di…</div>
    <article class="idea-card ${i.img ? 'has-img' : 'sec-' + s}">
      ${i.img ? `<img src="${esc(cimg(i.img, 900))}" alt="">` : `<div class="idea-ic">${secIcon(s, 56)}</div>`}
      <div class="idea-shade"></div>
      <div class="idea-body">
        <span class="glass-chip">${secIcon(s, 14)} ${SECTIONS[s].label}</span>
        <h3 class="display idea-title">${esc(i.title)}</h3>
        ${i.note ? `<p>${esc(i.note).slice(0, 160)}</p>` : ''}
      </div>
    </article>
    <div class="row-actions">
      <button class="btn btn-ghost" onclick="drawIdea('${jsq(i.id)}')">${icon('dice', 18)} Un'altra</button>
      <button class="btn btn-primary" onclick="openItem('${s}','${jsq(i.id)}',{replace:true})">Apri</button>
    </div>
  </div>`;
  const replace = !!(topLayerEl() && topLayerEl().querySelector('.idea'));
  openSheet(html, { replace });
}
