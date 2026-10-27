/* ═══════════════════════════════════════════════
   NOI DUE — dati: Firebase, accesso, sincronizzazione, backup

   Regole di sicurezza dei dati:
   • La struttura del database è la stessa della versione precedente
     (couples/{id} con le liste + sottoraccolte notes/questions; messages e games sono archivi).
     Si aggiungono solo: sottoraccolta "notes" (bigliettini) e "backups".
   • Ogni modifica scrive SOLO il campo toccato, dentro una transazione
     che parte dai dati più recenti sul server: nessuna modifica
     dell'altra persona viene sovrascritta.
   • Una guardia blocca qualsiasi scrittura che cancellerebbe più di un
     elemento alla volta da una lista.
   • Ogni giorno, alla prima apertura, viene salvata una copia completa
     in couples/{id}/backups/{AAAA-MM-GG} (ultime 30 copie).
═══════════════════════════════════════════════ */

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
// Cache locale: l'app si apre subito anche con rete lenta. Se non disponibile si continua senza.
try { db.enablePersistence({ synchronizeTabs:true }).catch(() => {}); } catch (e) {}
const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
const FV = firebase.firestore.FieldValue;

const coupleRef = () => db.collection('couples').doc(COUPLE_ID);

let mainUnsub = null, questionsUnsub = null, notesUnsub = null;
let joinRole = 'lei';
let lastServerDoc = null;

/* ═══════════════════════════════════════════════
   SCHERMATE
═══════════════════════════════════════════════ */
function showScreen(id) {
  ['boot-screen', 'auth-screen', 'setup-screen', 'app'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.hidden = s !== id;
  });
}

function bootData() {
  const p = new URLSearchParams(location.search);
  const code = p.get('code');
  if (code) { const jc = document.getElementById('join-code'); if (jc) jc.value = code; }

  auth.onAuthStateChanged(async user => {
    if (!user) { showScreen('auth-screen'); return; }
    try {
      await routeAfterLogin(user);
    } catch (e) {
      console.error(e);
      showAuthMsg('Errore: ' + (e.message || 'riprova'));
      showScreen('auth-screen');
    }
  });
}

async function routeAfterLogin(user) {
  // 1. Profilo utente → coppia + ruolo
  let coupleId = null;
  try {
    const uSnap = await db.collection('users').doc(user.uid).get();
    if (uSnap.exists) {
      const ud = uSnap.data();
      if (ud.coupleId) coupleId = ud.coupleId;
      if (ud.role === 'lui' || ud.role === 'lei') myRole = ud.role;
    }
  } catch (e) {}

  // 2. Fallback: sessione salvata sul dispositivo (versioni vecchie)
  if (!coupleId) {
    try {
      const c = JSON.parse(localStorage.getItem('noidueFirebase') || 'null');
      if (c && c.id) { coupleId = c.id; if (c.r) myRole = c.r; if (c.p) PEOPLE = c.p; }
    } catch (e) {}
  }

  if (!coupleId) { showScreen('setup-screen'); return; }

  COUPLE_ID = coupleId;
  const ok = await ensureMembership(user.uid);
  if (!ok) {
    // Nota: NON cancelliamo nulla dal database, solo il riferimento locale
    COUPLE_ID = '';
    localStorage.removeItem('noidueFirebase');
    showScreen('setup-screen');
    return;
  }
  try { await db.collection('users').doc(user.uid).set({ coupleId: COUPLE_ID, role: myRole }, { merge:true }); } catch (e) {}
  saveSession();
  startApp();
}

async function ensureMembership(uid) {
  const ref = coupleRef();
  const snap = await ref.get();
  if (!snap.exists) return false;
  const d = snap.data();
  const members = Array.isArray(d._members) ? d._members : [];
  if (members.includes(uid)) return true;
  if (members.length >= 2) return false;
  await ref.update({ _members: FV.arrayUnion(uid) });
  return true;
}

function saveSession() {
  try { localStorage.setItem('noidueFirebase', JSON.stringify({ id:COUPLE_ID, r:myRole, p:PEOPLE })); } catch (e) {}
}

/* ═══════════════════════════════════════════════
   ACCESSO / REGISTRAZIONE
═══════════════════════════════════════════════ */
function switchAuthTab(which) {
  $$('#auth-screen [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === which));
  $$('#auth-screen [data-panel]').forEach(p => p.hidden = p.dataset.panel !== which);
  showAuthMsg('');
}

function showAuthMsg(m, ok = false) {
  const e = document.getElementById('auth-msg'); if (!e) return;
  e.textContent = m || '';
  e.classList.toggle('ok', ok);
}

function authErrorMessage(e) {
  const code = (e && e.code) || '';
  const map = {
    'auth/invalid-email': 'Email non valida.',
    'auth/missing-password': 'Inserisci la password.',
    'auth/weak-password': 'Password troppo corta (almeno 6 caratteri).',
    'auth/email-already-in-use': 'Email già registrata: prova ad accedere.',
    'auth/wrong-password': 'Email o password errate.',
    'auth/invalid-credential': 'Email o password errate.',
    'auth/invalid-login-credentials': 'Email o password errate.',
    'auth/user-not-found': 'Nessun account con questa email.',
    'auth/too-many-requests': 'Troppi tentativi. Riprova tra qualche minuto.',
    'auth/network-request-failed': 'Connessione assente.',
    'auth/unauthorized-domain': 'Questo indirizzo non è autorizzato in Firebase (Authentication → Settings → Domini autorizzati).',
  };
  return map[code] || (e && e.message) || 'Errore. Riprova.';
}

function setBusy(btn, busy, label) {
  if (!btn) return;
  if (busy) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="spinner sm"></span> ${label || ''}`; }
  else { btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; }
}

async function doLogin(btn) {
  const email = $('#login-email').value.trim();
  const pw = $('#login-password').value;
  if (!email || !pw) { showAuthMsg('Inserisci email e password.'); return; }
  setBusy(btn, true, 'Accesso…');
  try { await auth.signInWithEmailAndPassword(email, pw); }
  catch (e) { showAuthMsg(authErrorMessage(e)); }
  setBusy(btn, false);
}

async function doSignup(btn) {
  const email = $('#signup-email').value.trim();
  const pw = $('#signup-password').value;
  if (!email || !pw) { showAuthMsg('Inserisci email e password.'); return; }
  setBusy(btn, true, 'Creazione…');
  try { await auth.createUserWithEmailAndPassword(email, pw); }
  catch (e) { showAuthMsg(authErrorMessage(e)); }
  setBusy(btn, false);
}

async function doResetPassword() {
  const email = $('#login-email').value.trim();
  if (!email) { showAuthMsg('Scrivi la tua email qui sopra, poi tocca di nuovo "Password dimenticata".'); $('#login-email').focus(); return; }
  try {
    await auth.sendPasswordResetEmail(email);
    showAuthMsg(`Ti abbiamo mandato un'email a ${email} per scegliere una nuova password. Controlla anche lo spam.`, true);
  } catch (e) { showAuthMsg(authErrorMessage(e)); }
}

/* ═══════════════════════════════════════════════
   CREA / UNISCITI
═══════════════════════════════════════════════ */
function genCoupleId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'nd-';
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function showSetupMsg(m) { const e = $('#setup-msg'); if (e) e.textContent = m || ''; }

function setJoinRole(role) {
  joinRole = role;
  $$('#setup-screen [data-join-role]').forEach(b => b.classList.toggle('on', b.dataset.joinRole === role));
}

async function createCouple(btn) {
  const user = auth.currentUser;
  if (!user) { showSetupMsg('Devi prima accedere.'); return; }
  const nameLui = $('#name-lui').value.trim() || 'Lui';
  const nameLei = $('#name-lei').value.trim() || 'Lei';
  const me = $('#setup-screen [data-me].on')?.dataset.me || 'lui';
  setBusy(btn, true, 'Creazione…');
  const newId = genCoupleId();
  try {
    const initial = {};
    SECTION_KEYS.forEach(s => initial[s] = []);
    initial._gallery = [];
    initial._games = { scores: { lui:0, lei:0 } };
    initial._people = { lui:nameLui, lei:nameLei };
    initial._members = [user.uid];
    await db.collection('couples').doc(newId).set(initial);
    await db.collection('users').doc(user.uid).set({ coupleId:newId, role:me }, { merge:true });
    COUPLE_ID = newId; myRole = me; PEOPLE = initial._people;
    saveSession();
    startApp();
  } catch (e) {
    showSetupMsg('Errore di rete. Riprova.');
  }
  setBusy(btn, false);
}

async function joinCouple(btn) {
  const user = auth.currentUser;
  if (!user) { showSetupMsg('Devi prima accedere.'); return; }
  const code = $('#join-code').value.trim().toLowerCase().replace(/^.*code=/, '');
  if (!code) { showSetupMsg('Inserisci il codice dello spazio.'); return; }
  setBusy(btn, true, 'Connessione…');
  try {
    const ref = db.collection('couples').doc(code);
    const snap = await ref.get();
    if (!snap.exists) { showSetupMsg('Codice non trovato.'); setBusy(btn, false); return; }
    const d = snap.data();
    const members = Array.isArray(d._members) ? d._members : [];
    if (!members.includes(user.uid)) {
      if (members.length >= 2) { showSetupMsg('Questo spazio ha già due persone.'); setBusy(btn, false); return; }
      await ref.update({ _members: FV.arrayUnion(user.uid) });
    }
    if (d._people) PEOPLE = d._people;
    COUPLE_ID = code; myRole = joinRole;
    await db.collection('users').doc(user.uid).set({ coupleId:COUPLE_ID, role:myRole }, { merge:true });
    saveSession();
    startApp();
  } catch (e) {
    showSetupMsg('Connessione non riuscita. Riprova.');
  }
  setBusy(btn, false);
}

async function logout() {
  const ok = await confirmSheet({ title:'Vuoi uscire?', text:'I vostri dati restano al sicuro: per rientrare basta accedere di nuovo con la tua email.', ok:'Esci' });
  if (!ok) return;
  stopListeners();
  localStorage.removeItem('noidueFirebase');
  COUPLE_ID = ''; dataLoaded = false;
  SECTION_KEYS.forEach(s => data[s] = []);
  data._gallery = []; data._games = { scores:{ lui:0, lei:0 } };
  questionsList = []; notesList = [];
  await auth.signOut().catch(() => {});
  location.hash = '';
  location.reload();
}

/* ═══════════════════════════════════════════════
   ASCOLTO IN TEMPO REALE
═══════════════════════════════════════════════ */
function stopListeners() {
  [mainUnsub, questionsUnsub, notesUnsub].forEach(u => { if (u) u(); });
  mainUnsub = questionsUnsub = notesUnsub = null;
}

function startListeners() {
  stopListeners();

  mainUnsub = coupleRef().onSnapshot({ includeMetadataChanges:false }, snap => {
    if (!snap.exists) return;
    const d = snap.data();
    SECTION_KEYS.forEach(s => { data[s] = Array.isArray(d[s]) ? d[s] : []; });
    data._gallery = Array.isArray(d._gallery) ? d._gallery : [];
    data._games = d._games || { scores:{ lui:0, lei:0 } };
    if (d._people) { PEOPLE = d._people; saveSession(); }
    const first = !dataLoaded;
    dataLoaded = true;
    setSync(snap.metadata.hasPendingWrites ? 'saving' : 'live');
    if (!snap.metadata.fromCache) {
      lastServerDoc = d;
      maybeDailyBackup(d);
      ensureIds(d);
    }
    onDataChanged('main', first);
  }, err => {
    console.error(err);
    setSync('err');
  });

  // Domande: avvisa quando l'altro risponde o ne fa una nuova
  let prevQ = null;
  questionsUnsub = coupleRef().collection('questions').orderBy('day', 'desc').limit(200)
    .onSnapshot(snap => {
      const list = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      const other = otherRole(myRole);
      if (prevQ && !snap.metadata.fromCache) {
        list.forEach(q => {
          const prev = prevQ.find(p => p.id === q.id);
          const theirs = (q.answers || {})[other], had = prev && (prev.answers || {})[other];
          if (!prev && !q.daily && q.by === other) {
            toast(`${PEOPLE[other] || ''} ti ha fatto una domanda`, { onClick: () => go('domande') });
          } else if (theirs && !had) {
            const mine = (q.answers || {})[myRole];
            toast(mine ? `${PEOPLE[other] || ''} ha risposto: scopri cosa` : `${PEOPLE[other] || ''} ha risposto · tocca a te`, { onClick: () => go('domande') });
          }
        });
      }
      if (!snap.metadata.fromCache) prevQ = list;
      questionsList = list;
      onDataChanged('questions');
    }, err => console.error(err));

  let prevNotes = null;
  notesUnsub = coupleRef().collection('notes').orderBy('createdAt', 'desc').limit(300)
    .onSnapshot(snap => {
      const list = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      if (prevNotes) {
        list.forEach(n => {
          if (n.from !== myRole && !prevNotes.some(p => p.id === n.id)) {
            toast(`${PEOPLE[n.from] || ''} ti ha lasciato un bigliettino`, { onClick: () => go('bigliettini') });
          }
        });
      }
      prevNotes = list;
      notesList = list;
      onDataChanged('notes');
    }, err => console.error(err));
}

/* ═══════════════════════════════════════════════
   SCRITTURE SICURE
═══════════════════════════════════════════════ */
function defaultFor(field) {
  if (field === '_games') return { scores:{ lui:0, lei:0 } };
  return [];
}

class GuardError extends Error {}

/*
  mutate('movies', list => list.concat(nuovo))
  La funzione riceve una copia e restituisce il nuovo valore.
  Deve essere "pura": viene eseguita sui dati locali (risposta immediata)
  e poi di nuovo sui dati più aggiornati del server dentro una transazione.
*/
async function mutate(field, fn, opts = {}) {
  if (!dataLoaded || !COUPLE_ID) { toast('Un attimo, sto ancora sincronizzando…'); return false; }

  const apply = cur => {
    const before = cur === undefined ? defaultFor(field) : clone(cur);
    const after = fn(clone(before));
    if (Array.isArray(before)) {
      if (!Array.isArray(after)) throw new GuardError('formato non valido');
      if (!opts.allowShrink && after.length < before.length - 1) throw new GuardError('troppi elementi rimossi');
    }
    return after;
  };

  try { data[field] = apply(data[field]); }
  catch (e) { console.error(e); toast('Modifica annullata per sicurezza.'); return false; }
  onDataChanged('local');
  setSync('saving');

  const ref = coupleRef();
  try {
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new GuardError('spazio non trovato');
      tx.update(ref, { [field]: apply(snap.data()[field]) });
    });
  } catch (e) {
    if (e instanceof GuardError) {
      console.error(e); toast('Modifica annullata per sicurezza.'); setSync('err'); return false;
    }
    // Probabilmente offline: scrive solo questo campo partendo dai dati locali (già sincronizzati)
    try { await ref.update({ [field]: data[field] }); }
    catch (e2) { console.error(e2); setSync('err'); toast('Salvataggio non riuscito. Controlla la connessione.'); return false; }
  }
  setSync('live');
  return true;
}

async function saveNames(lui, lei) {
  PEOPLE = { lui: lui || 'Lui', lei: lei || 'Lei' };
  saveSession();
  onDataChanged('local');
  try { await coupleRef().update({ _people: PEOPLE }); toast('Nomi aggiornati'); }
  catch (e) { toast('Salvataggio non riuscito.'); }
}

function setMyRole(role) {
  myRole = role; saveSession();
  const user = auth.currentUser;
  if (user) db.collection('users').doc(user.uid).set({ role }, { merge:true }).catch(() => {});
  onDataChanged('local');
}

// Elementi vecchi senza id: aggiunge un id (modifica solo additiva, una volta sola)
let idsChecked = false;
function ensureIds(d) {
  if (idsChecked) return;
  idsChecked = true;
  const fields = [...SECTION_KEYS, '_gallery'].filter(f => Array.isArray(d[f]) && d[f].some(i => i && (i.id === undefined || i.id === null || i.id === '')));
  fields.forEach((f, k) => {
    mutate(f, list => list.map((i, idx) => (i && (i.id === undefined || i.id === null || i.id === '')) ? { ...i, id: 1000 + k * 10000 + idx } : i));
  });
}

/* ═══════════════════════════════════════════════
   SINCRONIZZAZIONE (indicatore)
═══════════════════════════════════════════════ */
function setSync(state) {
  document.documentElement.dataset.sync = state;
}

/* ═══════════════════════════════════════════════
   BACKUP
═══════════════════════════════════════════════ */
function backupPayload(d) {
  const out = {};
  SECTION_KEYS.forEach(s => out[s] = Array.isArray(d[s]) ? d[s] : []);
  out._gallery = Array.isArray(d._gallery) ? d._gallery : [];
  out._games = d._games || { scores:{ lui:0, lei:0 } };
  out._people = d._people || PEOPLE;
  return out;
}

function countItems(d) {
  let n = 0;
  SECTION_KEYS.forEach(s => n += (d[s] || []).length);
  return { items:n, photos:(d._gallery || []).length };
}

async function maybeDailyBackup(d) {
  const day = todayKey();
  const lsKey = 'nd_backup_' + COUPLE_ID;
  try { if (localStorage.getItem(lsKey) === day) return; } catch (e) {}
  try {
    const col = coupleRef().collection('backups');
    const ref = col.doc(day);
    const s = await ref.get();
    if (!s.exists) {
      const c = countItems(d);
      await ref.set({ ...backupPayload(d), _backupAt: Date.now(), _by: myRole, _kind:'auto', _items:c.items, _photos:c.photos });
      // tieni le ultime 30 copie automatiche
      const all = await col.orderBy('_backupAt', 'desc').get();
      all.docs.filter(x => x.data()._kind === 'auto').slice(30).forEach(x => x.ref.delete().catch(() => {}));
    }
    localStorage.setItem(lsKey, day);
  } catch (e) { console.warn('backup giornaliero non riuscito', e); }
}

async function listBackups() {
  const all = await coupleRef().collection('backups').orderBy('_backupAt', 'desc').limit(40).get();
  return all.docs.map(x => ({ id:x.id, ...x.data() }));
}

async function restoreBackup(id) {
  const col = coupleRef().collection('backups');
  const snap = await col.doc(id).get();
  if (!snap.exists) throw new Error('Copia non trovata');
  const b = snap.data();
  // prima di ripristinare, salva lo stato attuale (così si può tornare indietro)
  const cur = await coupleRef().get();
  const c = countItems(cur.data());
  await col.doc('prima-del-ripristino-' + Date.now()).set({ ...backupPayload(cur.data()), _backupAt: Date.now(), _by: myRole, _kind:'manual', _items:c.items, _photos:c.photos });
  await coupleRef().update(backupPayload(b));
}

async function fetchAll(colName, orderField) {
  const s = await coupleRef().collection(colName).orderBy(orderField, 'asc').get();
  return s.docs.map(d => ({ id:d.id, ...d.data() }));
}

async function exportBackup(btn) {
  setBusy(btn, true, 'Preparo il file…');
  try {
    const main = await coupleRef().get();
    const [messages, games, notes, questions] = await Promise.all([
      fetchAll('messages', 'ts').catch(() => []),
      fetchAll('games', 'createdAt').catch(() => []),
      fetchAll('notes', 'createdAt').catch(() => []),
      fetchAll('questions', 'day').catch(() => []),
    ]);
    const md = main.data() || {};
    const out = {
      _info: { app:'Noi Due', exportedAt: new Date().toISOString(), coupleId: COUPLE_ID },
      ...backupPayload(md),
      _chat: messages,
      _gamesList: games,
      _notes: notes,
      _questions: questions,
    };
    const blob = new Blob([JSON.stringify(out, null, 2)], { type:'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'noidue_backup_' + todayKey() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Backup scaricato');
  } catch (e) {
    console.error(e); toast('Backup non riuscito: ' + e.message);
  }
  setBusy(btn, false);
}

/* ═══════════════════════════════════════════════
   BIGLIETTINI & CHAT (sottoraccolte)
═══════════════════════════════════════════════ */
const notesCol = () => coupleRef().collection('notes');

async function addNote(note) {
  const doc = { from: myRole, createdAt: Date.now(), openedAt: null, reactions: {}, ...note };
  return notesCol().add(doc);
}
function updateNote(id, patch) { return notesCol().doc(id).update(patch); }
function deleteNote(id) { return notesCol().doc(id).delete(); }

async function loadChatArchive() {
  const s = await coupleRef().collection('messages').orderBy('ts', 'asc').limitToLast(300).get();
  return s.docs.map(d => ({ id:d.id, ...d.data() }));
}
