/* ═══════════════════════════════════════════════
   NOI DUE — core: config, stato, utility, icone, layer
═══════════════════════════════════════════════ */

const firebaseConfig = {
  apiKey: "AIzaSyDPoiUbg2goDaHjpz5tgNPEXXLuzWJmzcM",
  authDomain: "noi-due-c4940.firebaseapp.com",
  projectId: "noi-due-c4940",
  storageBucket: "noi-due-c4940.firebasestorage.app",
  messagingSenderId: "346277614319",
  appId: "1:346277614319:web:42ffeb68c48f1ec5be411a"
};

// Cloudinary: account fisso, così il caricamento foto funziona su ogni dispositivo
const CLOUD_NAME    = 'dywtbbbuq';
const UPLOAD_PRESET = 'ml_default';

/* Sezioni della lista "Insieme" — chiavi identiche al database, non rinominare */
const SECTIONS = {
  places:       { label:'Posti',        one:'posto',      icon:'📍', showMap:true,  showRating:true,  recurring:false, cats:['🏙️ Città','🌿 Natura','🎨 Museo & Cultura','🏖️ Mare & Spiaggia','⛰️ Montagna','🏘️ Borgo medievale','🌃 Vita notturna','🎡 Parco & Giardino','🏛️ Sito storico','🛤️ Sentiero & Trekking','🎭 Teatro & Spettacolo','🍷 Cantina & Degustazione','🌋 Paesaggio naturale'] },
  trips:        { label:'Viaggi',       one:'viaggio',    icon:'✈️', showMap:true,  showRating:true,  recurring:false, cats:['🇮🇹 Italia','🇪🇺 Europa','🌍 Fuori Europa','🚗 Road trip','🚂 In treno','🏕️ Camping','🛥️ Crociera','✈️ Lungo raggio','🚲 In bici','🥾 Trekking','🌊 Mare & Isole','🏔️ Montagna & Neve','🏙️ City break','🎒 Zaino in spalla','🚐 Camper','💑 Romantico'] },
  movies:       { label:'Film & Serie', one:'titolo',     icon:'🎬', showMap:false, showRating:true,  recurring:false, cats:['🎬 Film','📺 Serie TV','📽️ Documentario','🎭 Animazione','😂 Commedia','😱 Horror','💕 Romantico','🔍 Thriller & Giallo','🚀 Fantascienza','🧙 Fantasy','🥊 Azione','🎸 Musical','🕵️ Crime','🌍 Storico','🎞️ Classico','🇯🇵 Anime','🇰🇷 K-drama'] },
  books:        { label:'Libri',        one:'libro',      icon:'📚', showMap:false, showRating:true,  recurring:false, cats:['📖 Romanzo','🔍 Giallo & Noir','💭 Saggio','🧪 Fantascienza','❤️ Romance','🎨 Graphic novel','📰 Biografia','🌍 Storico','🧘 Crescita personale','🧙 Fantasy','😂 Umorismo','🌿 Natura & Viaggi','🕵️ Thriller','🎭 Classico','💡 Filosofia'] },
  restaurants:  { label:'Ristoranti',   one:'ristorante', icon:'🍽️', showMap:true,  showRating:true,  recurring:false, cats:['🍕 Italiano','🍣 Giapponese','🌮 Messicano','🥘 Etnico','🍔 Burger & Fast casual','🍷 Fine dining','🥂 Cocktail bar','☕ Caffè & Brunch','🍦 Gelateria','🥐 Pasticceria','🍜 Asiatico','🌿 Vegetariano','🍖 Grill & BBQ','🐟 Pesce'] },
  projects:     { label:'Progetti',     one:'progetto',   icon:'🛠️', showMap:false, showRating:false, recurring:false, cats:['🏠 Casa & Arredo','🎨 Creativo','💻 Tech','🌿 Giardino','📚 Studio','💪 Sport','🍳 Cucina','✈️ Viaggio','🎉 Evento','💰 Finanza','🎭 Cultura','🐾 Animali','🤝 Volontariato','🌱 Sostenibilità'] },
  dreams:       { label:'Sogni',        one:'sogno',      icon:'💭', showMap:false, showRating:false, recurring:false, cats:['✈️ Viaggio dei sogni','🏠 Casa ideale','💼 Carriera','❤️ Famiglia','🎨 Creatività','💪 Salute','📚 Cultura','💰 Libertà finanziaria','🌍 Impatto','🎉 Esperienze','🌟 Traguardi','🤝 Comunità','🎭 Avventure','🌿 Stile di vita'] },
  anniversaries:{ label:'Date',         one:'data',       icon:'🎂', showMap:true,  showRating:false, recurring:true,  cats:['💑 Anniversario','🎂 Compleanno','🎉 Festa','⭐ Momento speciale','💒 Matrimonio','🥂 Ricorrenza','🌹 Primo appuntamento','💌 Primo bacio','🏠 Prima casa','✈️ Primo viaggio','🎓 Laurea','🌟 Giorno speciale','🕯️ Ricordo'] },
};
const SECTION_KEYS = Object.keys(SECTIONS);

/* ═══════════════════════════════════════════════
   STATO GLOBALE
═══════════════════════════════════════════════ */
let COUPLE_ID = '';
let myRole    = 'lei';
let PEOPLE    = { lui:'Lui', lei:'Lei' };

let data = { _gallery:[], _games:{ scores:{lui:0,lei:0} } };
SECTION_KEYS.forEach(s => data[s] = []);

let gamesList  = [];
let notesList  = [];
let dataLoaded = false;

const otherRole = r => (r === 'lui' ? 'lei' : 'lui');
const meName    = () => PEOPLE[myRole] || '';
const otherName = () => PEOPLE[otherRole(myRole)] || '';

/* ═══════════════════════════════════════════════
   UTILITY
═══════════════════════════════════════════════ */
function esc(s) {
  if (s === null || s === undefined || s === '') return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
// Per stringhe dentro attributi onclick="fn('...')"
function jsq(s) { return esc(String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'")); }

const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const sameId = (a, b) => String(a) === String(b);
const clone = v => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

function itemCats(i) {
  return Array.isArray(i.cats) && i.cats.length ? i.cats : (i.cat ? [i.cat] : []);
}

function initials(name) { return (name || '?').trim().charAt(0).toUpperCase() || '?'; }

/* Date */
function parseLocalDate(str) {
  if (!str) return null;
  const p = String(str).split('-');
  if (p.length < 3) return null;
  const d = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
  return isNaN(d) ? null : d;
}
function todayStart() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function daysToNextOccurrence(dateStr) {
  const d = parseLocalDate(dateStr); if (!d) return null;
  const now = todayStart();
  let next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  return Math.round((next - now) / 86400000);
}
function daysUntil(dateStr) {
  const d = parseLocalDate(dateStr); if (!d) return null;
  return Math.round((d - todayStart()) / 86400000);
}
function fmtDate(str, opts = { day:'numeric', month:'short', year:'numeric' }) {
  const d = parseLocalDate(str); if (!d) return '';
  return d.toLocaleDateString('it-IT', opts);
}
function fmtTs(ts, opts = { day:'numeric', month:'short' }) {
  if (!ts) return '';
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString('it-IT', opts);
}
function relTime(ts) {
  if (!ts) return '';
  const t = ts.seconds ? ts.seconds * 1000 : ts;
  const diff = Math.max(0, Date.now() - t);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'adesso';
  if (m < 60) return `${m} min fa`;
  const h = Math.floor(m / 60);
  if (h < 24) return h === 1 ? "un'ora fa" : `${h} ore fa`;
  const g = Math.floor(h / 24);
  if (g === 1) return 'ieri';
  if (g < 7) return `${g} giorni fa`;
  return fmtTs(t, { day:'numeric', month:'short', year: g > 300 ? 'numeric' : undefined });
}
function countdownLabel(days) {
  if (days === null || days === undefined) return '';
  if (days === 0) return 'Oggi';
  if (days === 1) return 'Domani';
  return `Tra ${days} giorni`;
}
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

/* Random con seme: stessa scelta per tutto il giorno */
function hashStr(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return (h >>> 0);
}
function seededRandom(seed) {
  let a = typeof seed === 'number' ? seed : hashStr(String(seed));
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* Immagini Cloudinary ridimensionate al volo (molto più leggere) */
function cimg(url, w = 900) {
  if (!url) return '';
  const u = String(url);
  if (u.includes('res.cloudinary.com') && u.includes('/upload/') && !/\/upload\/[a-z]_[^/]*\//.test(u)) {
    return u.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${w}/`);
  }
  return u;
}

/* ═══════════════════════════════════════════════
   ICONE (SVG inline)
═══════════════════════════════════════════════ */
const ICONS = {
  home:     '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.8V20h13V9.8"/><path d="M10 20v-5h4v5"/>',
  photo:    '<rect x="3" y="4" width="18" height="16" rx="3.5"/><circle cx="9" cy="9.8" r="1.8"/><path d="m4 18 5-5 4 4 2.5-2.5L20 19"/>',
  mail:     '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  heart:    '<path d="M12 20s-7.5-4.6-7.5-10.4A4.3 4.3 0 0 1 12 6.9a4.3 4.3 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20z"/>',
  heartFill:'<path fill="currentColor" stroke="none" d="M12 20s-7.5-4.6-7.5-10.4A4.3 4.3 0 0 1 12 6.9a4.3 4.3 0 0 1 7.5 2.7C19.5 15.4 12 20 12 20z"/>',
  dice:     '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="9" cy="9" r="1.15" fill="currentColor"/><circle cx="15" cy="9" r="1.15" fill="currentColor"/><circle cx="9" cy="15" r="1.15" fill="currentColor"/><circle cx="15" cy="15" r="1.15" fill="currentColor"/><circle cx="12" cy="12" r="1.15" fill="currentColor"/>',
  search:   '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  plus:     '<path d="M12 5v14M5 12h14"/>',
  close:    '<path d="M6 6l12 12M18 6 6 18"/>',
  check:    '<path d="m5 12.5 4.5 4.5L19 7"/>',
  edit:     '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m14 7 3 3"/>',
  trash:    '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
  pin:      '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  link:     '<path d="M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  sliders:  '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  play:     '<path fill="currentColor" stroke="none" d="M8 5.3v13.4c0 .8.9 1.3 1.5.8l10.2-6.7a1 1 0 0 0 0-1.6L9.5 4.5C8.9 4 8 4.5 8 5.3z"/>',
  pause:    '<path d="M8 5v14M16 5v14" stroke-width="3"/>',
  chevR:    '<path d="m9.5 6 6 6-6 6"/>',
  chevL:    '<path d="m14.5 6-6 6 6 6"/>',
  chevD:    '<path d="m6 9.5 6 6 6-6"/>',
  arrowR:   '<path d="M5 12h14M13 6l6 6-6 6"/>',
  star:     '<path d="m12 3.6 2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8z"/>',
  starFill: '<path fill="currentColor" d="m12 3.6 2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8z"/>',
  music:    '<path d="M9 18V6.5l11-2.5v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  pen:      '<path d="M3 21c3-1 5.5-2.5 8-5l8.5-8.5a2.1 2.1 0 0 0-3-3L8 13c-2.5 2.5-4 5-5 8z"/>',
  scribble: '<path d="M3 16c2.5-3 3.5-9 6.5-9S8 16 11 16s2.5-6 5.5-6 1.5 5 4.5 5"/>',
  camera:   '<path d="M4 8.5h3l1.8-3h6.4l1.8 3h3V19H4z"/><circle cx="12" cy="13.5" r="3.5"/>',
  lock:     '<rect x="5" y="11" width="14" height="9.5" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/>',
  restore:  '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4.5V9h4.5"/>',
  logout:   '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l4-4-4-4M14 12H4"/>',
  userPlus: '<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6"/>',
  user:     '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>',
  chat:     '<path d="M4 5.5h16v10.5H9.5L4 20z"/>',
  sort:     '<path d="M7 4v16M3.5 16.5 7 20l3.5-3.5M17 20V4M13.5 7.5 17 4l3.5 3.5"/>',
  undo:     '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  more:     '<circle cx="5.5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18.5" cy="12" r="1.3" fill="currentColor"/>',
  sparkle:  '<path d="M12 3c.7 4.7 3.3 7.3 8 8-4.7.7-7.3 3.3-8 8-.7-4.7-3.3-7.3-8-8 4.7-.7 7.3-3.3 8-8z"/>',
  shield:   '<path d="M12 3.5 5 6v5.5c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  copy:     '<rect x="8" y="8" width="12" height="12" rx="3"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  send:     '<path d="M4 12 20 4l-5 16-3.5-6.5z"/><path d="m11.5 13.5 4-4"/>',
  trophy:   '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/>',
  clock:    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  image:    '<rect x="3" y="4" width="18" height="16" rx="3.5"/><circle cx="9" cy="9.8" r="1.8"/><path d="m4 18 5-5 4 4 2.5-2.5L20 19"/>',
};
function icon(name, size = 22, cls = '') {
  return `<svg class="ico ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/* ═══════════════════════════════════════════════
   LAYER (sheet, viewer, storie) + tasto indietro
═══════════════════════════════════════════════ */
const layers = [];

function lockScroll() { document.documentElement.classList.toggle('scroll-locked', layers.length > 0); }

function _pushLayer(el, onClose) {
  const entry = { el, onClose };
  layers.push(entry);
  history.pushState({ ndLayer: layers.length }, '');
  lockScroll();
  return entry;
}

function _destroyLayer(entry, instant) {
  const el = entry.el;
  if (entry.onClose) { try { entry.onClose(); } catch (e) { console.error(e); } }
  el.classList.remove('open');
  el.classList.add('closing');
  setTimeout(() => el.remove(), instant ? 0 : 380);
}

/*
  Ogni layer aperto corrisponde a una voce nella history, così il tasto
  "indietro" del telefono chiude il layer invece di uscire dall'app.
  Le chiusure fatte dall'app tolgono subito il layer e "consumano" il
  popstate che generano (expectedPops), così i conti tornano sempre.
*/
let expectedPops = 0;
let afterPopsCb = null;

function closeTop() {
  if (!layers.length) return;
  _destroyLayer(layers.pop());
  lockScroll();
  expectedPops++;
  history.back();
}

// Chiude tutti i layer di colpo e poi esegue cb (es. navigare a un'altra pagina)
function closeAllLayers(cb) {
  const n = layers.length;
  if (!n) { cb && cb(); return; }
  while (layers.length) _destroyLayer(layers.pop(), true);
  lockScroll();
  expectedPops++;
  afterPopsCb = cb || null;
  history.go(-n);
}

window.addEventListener('popstate', () => {
  if (expectedPops > 0) {
    expectedPops--;
    if (expectedPops === 0 && afterPopsCb) { const cb = afterPopsCb; afterPopsCb = null; cb(); }
    return;
  }
  if (layers.length) {
    const entry = layers.pop();
    _destroyLayer(entry);
    lockScroll();
    return;
  }
  if (typeof routeFromHash === 'function') routeFromHash();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && layers.length) closeTop();
});

/*
  openSheet(html, { cls, replace, onClose, onOpen })
  Bottom sheet su telefono, finestra centrata su desktop.
  replace:true sostituisce il layer in cima senza toccare la history (es. dettaglio → modifica).
*/
function openSheet(html, opts = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'layer sheet-layer ' + (opts.cls || '');
  wrap.innerHTML = `<div class="sheet-backdrop" data-close></div>
    <div class="sheet" role="dialog" aria-modal="true">
      <div class="sheet-grip" data-close-grip></div>
      <div class="sheet-body">${html}</div>
    </div>`;
  document.body.appendChild(wrap);
  wrap.querySelector('.sheet-backdrop').addEventListener('click', closeTop);
  enableSheetDrag(wrap);

  if (opts.replace && layers.length) {
    const top = layers[layers.length - 1];
    _destroyLayer(top, true);
    top.el = wrap; top.onClose = opts.onClose;
  } else {
    _pushLayer(wrap, opts.onClose);
  }
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('open')));
  if (opts.onOpen) setTimeout(() => opts.onOpen(wrap), 30);
  return wrap;
}

// Layer a tutto schermo (viewer foto, storie, bigliettino)
function openFullLayer(html, opts = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'layer full-layer ' + (opts.cls || '');
  wrap.innerHTML = html;
  document.body.appendChild(wrap);
  if (opts.replace && layers.length) {
    const top = layers[layers.length - 1];
    _destroyLayer(top, true);
    top.el = wrap; top.onClose = opts.onClose;
  } else {
    _pushLayer(wrap, opts.onClose);
  }
  requestAnimationFrame(() => requestAnimationFrame(() => wrap.classList.add('open')));
  return wrap;
}

function topLayerEl() { return layers.length ? layers[layers.length - 1].el : null; }

// Trascina giù la maniglia per chiudere lo sheet
function enableSheetDrag(wrap) {
  const sheet = wrap.querySelector('.sheet');
  const grip = wrap.querySelector('.sheet-grip');
  let startY = null, dy = 0;
  const start = e => { startY = (e.touches ? e.touches[0] : e).clientY; dy = 0; sheet.style.transition = 'none'; };
  const move = e => {
    if (startY === null) return;
    dy = Math.max(0, (e.touches ? e.touches[0] : e).clientY - startY);
    sheet.style.transform = `translateY(${dy}px)`;
  };
  const end = () => {
    if (startY === null) return;
    startY = null; sheet.style.transition = ''; sheet.style.transform = '';
    if (dy > 90) closeTop();
  };
  grip.addEventListener('touchstart', start, { passive:true });
  grip.addEventListener('touchmove', move, { passive:true });
  grip.addEventListener('touchend', end);
}

/* Conferma elegante (al posto di confirm()) */
function confirmSheet({ title, text = '', ok = 'Conferma', danger = false }) {
  return new Promise(resolve => {
    let done = false;
    const finish = v => { if (done) return; done = true; resolve(v); };
    const el = openSheet(`
      <div class="confirm">
        <h3 class="sheet-title">${esc(title)}</h3>
        ${text ? `<p class="muted">${esc(text)}</p>` : ''}
        <div class="row-actions">
          <button class="btn btn-ghost" data-v="0">Annulla</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-v="1">${esc(ok)}</button>
        </div>
      </div>`, { cls:'sheet-small', onClose: () => finish(false) });
    el.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => {
      finish(b.dataset.v === '1');
      closeTop();
    }));
  });
}

/* ═══════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════ */
function toast(msg, opts = {}) {
  const host = document.getElementById('toasts');
  if (!host) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>${esc(msg)}</span>${opts.action ? `<button class="toast-act">${esc(opts.action)}</button>` : ''}`;
  if (opts.action) t.querySelector('.toast-act').addEventListener('click', e => { e.stopPropagation(); opts.onAction && opts.onAction(); t.remove(); });
  t.addEventListener('click', () => { if (opts.onClick) opts.onClick(); t.remove(); });
  host.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, opts.duration || 3800);
}

/* ═══════════════════════════════════════════════
   UPLOAD FOTO (ridimensiona e carica su Cloudinary)
═══════════════════════════════════════════════ */
async function shrinkImage(file, maxSide = 2400, quality = 0.88) {
  try {
    if (!file.type || !file.type.startsWith('image/') || file.type === 'image/gif') return file;
    let bmp;
    try { bmp = await createImageBitmap(file, { imageOrientation:'from-image' }); }
    catch (e) { bmp = await createImageBitmap(file); }
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 2.5 * 1024 * 1024) return file;
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', quality));
    return blob || file;
  } catch (e) {
    return file;
  }
}

async function uploadImage(file) {
  const body = await shrinkImage(file);
  const fd = new FormData();
  fd.append('file', body, file.name || 'foto.jpg');
  fd.append('upload_preset', UPLOAD_PRESET);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method:'POST', body:fd });
  const j = await r.json().catch(() => ({}));
  if (!j.secure_url) throw new Error((j.error && j.error.message) || 'Caricamento non riuscito');
  return j.secure_url;
}

/*
  Campo foto riutilizzabile (form oggetti, galleria, bigliettini).
  photoFieldHtml(id, url) + bindPhotoField(root, id, {onChange, focal})
  Il valore finale si legge con getPhotoValue(root, id).
*/
function photoFieldHtml(id, url = '', opts = {}) {
  return `<div class="photo-field ${url ? 'has-img' : ''} ${opts.big ? 'big' : ''}" id="pf-${id}" data-url="${esc(url)}">
    <label class="photo-drop">
      <input type="file" accept="image/*" hidden>
      <div class="photo-preview">${url ? `<img src="${esc(cimg(url, 1000))}" alt="">` : ''}<span class="focal-dot"></span></div>
      <div class="photo-empty">${icon('camera', 26)}<span>${esc(opts.label || 'Aggiungi una foto')}</span></div>
      <div class="photo-busy"><span class="spinner"></span><span>Caricamento…</span></div>
    </label>
    <div class="photo-tools">
      <button type="button" class="link-btn when-img" data-act="change">${icon('camera', 15)} Cambia</button>
      <button type="button" class="link-btn" data-act="url">${icon('link', 15)} Incolla link</button>
      <button type="button" class="link-btn danger" data-act="remove">${icon('trash', 15)} Rimuovi</button>
    </div>
    ${opts.focal ? `<p class="hint focal-hint">Tocca la foto per scegliere il punto da tenere al centro.</p>` : ''}
    <input class="input url-input" type="url" placeholder="https://…" hidden>
  </div>`;
}

function bindPhotoField(root, id, opts = {}) {
  const box = root.querySelector('#pf-' + id);
  if (!box) return;
  const fileIn = box.querySelector('input[type=file]');
  const urlIn  = box.querySelector('.url-input');
  const prev   = box.querySelector('.photo-preview');
  const dot    = box.querySelector('.focal-dot');
  box._focal = opts.focal ? { ...(opts.focal) } : null;

  const placeDot = () => {
    if (!box._focal || !dot) return;
    dot.style.left = box._focal.x + '%'; dot.style.top = box._focal.y + '%';
  };
  const setUrl = url => {
    box.dataset.url = url || '';
    box.classList.toggle('has-img', !!url);
    prev.querySelector('img')?.remove();
    if (url) {
      const im = document.createElement('img');
      im.src = cimg(url, 1000); im.alt = '';
      prev.prepend(im);
      if (box._focal) im.style.objectPosition = `${box._focal.x}% ${box._focal.y}%`;
    }
    placeDot();
    opts.onChange && opts.onChange(url);
  };
  if (box._focal) { const im = prev.querySelector('img'); if (im) im.style.objectPosition = `${box._focal.x}% ${box._focal.y}%`; placeDot(); }

  fileIn.addEventListener('change', async () => {
    const f = fileIn.files[0]; if (!f) return;
    box.classList.add('busy');
    const local = URL.createObjectURL(f);
    prev.querySelector('img')?.remove();
    const im = document.createElement('img'); im.src = local; prev.prepend(im);
    box.classList.add('has-img');
    try {
      const url = await uploadImage(f);
      setUrl(url);
    } catch (e) {
      toast('Foto non caricata: ' + e.message);
      setUrl(box.dataset.url || '');
    }
    box.classList.remove('busy');
    fileIn.value = '';
  });

  // Tocco sulla foto: punto focale (se previsto), altrimenti cambia foto
  prev.addEventListener('click', e => {
    if (!box._focal || !box.classList.contains('has-img')) return;
    e.preventDefault();
    const r = prev.getBoundingClientRect();
    box._focal = {
      x: Math.round(Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100))),
      y: Math.round(Math.max(0, Math.min(100, (e.clientY - r.top) / r.height * 100)))
    };
    const im = prev.querySelector('img'); if (im) im.style.objectPosition = `${box._focal.x}% ${box._focal.y}%`;
    placeDot();
  });

  box.querySelector('[data-act=change]').addEventListener('click', () => fileIn.click());
  box.querySelector('[data-act=url]').addEventListener('click', () => {
    urlIn.hidden = !urlIn.hidden;
    if (!urlIn.hidden) { urlIn.value = box.dataset.url || ''; urlIn.focus(); }
  });
  urlIn.addEventListener('change', () => setUrl(urlIn.value.trim()));
  box.querySelector('[data-act=remove]').addEventListener('click', () => { urlIn.value = ''; setUrl(''); });
}

function getPhotoValue(root, id) {
  const box = root.querySelector('#pf-' + id);
  if (!box) return { url:'', focal:null, busy:false };
  return { url: box.dataset.url || '', focal: box._focal || null, busy: box.classList.contains('busy') };
}

/* Link Spotify / YouTube → anteprima */
function mediaPreview(url) {
  if (!url) return '';
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (yt) {
    return `<a href="${esc(url)}" target="_blank" rel="noopener" class="media-yt">
      <img src="https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg" alt="">
      <span class="media-play">${icon('play', 22)}</span></a>`;
  }
  const sp = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|playlist|album|episode|show)\/([A-Za-z0-9]+)/);
  if (sp) {
    const h = sp[1] === 'track' || sp[1] === 'episode' ? 80 : 152;
    return `<div class="media-sp"><iframe src="https://open.spotify.com/embed/${sp[1]}/${sp[2]}?utm_source=generator&theme=0" width="100%" height="${h}" frameborder="0" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></div>`;
  }
  let domain = ''; try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch (e) {}
  return `<a href="${esc(url)}" target="_blank" rel="noopener" class="media-link">${icon('link', 16)} ${esc(domain || url)}</a>`;
}

function linkify(text) {
  return String(text || '').split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    i % 2 === 1 ? `<a href="${esc(part)}" target="_blank" rel="noopener">${esc(part)}</a>` : esc(part)
  ).join('');
}

function starsHtml(n, size = 14) {
  if (!n) return '';
  return `<span class="stars">${Array.from({ length: 5 }, (_, i) => icon(i < n ? 'starFill' : 'star', size)).join('')}</span>`;
}
