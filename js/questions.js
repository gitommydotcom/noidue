/* ═══════════════════════════════════════════════
   NOI DUE — Domande
   Ogni giorno una domanda per voi due. Ognuno risponde per conto suo:
   le risposte si svelano solo quando avete risposto entrambi.
   Tre tipi: risposta libera, "chi dei due?", "questo o quello".
   Potete anche farvi domande vostre.
   Dati: couples/{id}/questions/{d-YYYY-MM-DD | id automatico}
═══════════════════════════════════════════════ */

const Q_BANK = {
  text: [
    'Qual è il primo ricordo che hai di noi due?',
    'Cosa hai pensato la prima volta che mi hai visto?',
    'Qual è una piccola cosa che faccio e che ti fa stare bene?',
    'Che canzone metteresti nella colonna sonora della nostra storia?',
    'Qual è il viaggio che sogni di fare insieme?',
    'Se potessimo rivivere un solo giorno insieme, quale sceglieresti?',
    'Cosa ti fa ridere di me anche quando non vorresti?',
    'Qual è la cosa più coraggiosa che hai fatto?',
    'Cosa ti piacerebbe imparare insieme a me?',
    'Descrivi la nostra domenica perfetta.',
    "C'è una cosa che vorresti dirmi più spesso?",
    'Qual è il complimento più bello che hai ricevuto?',
    'Che cosa ti manca di più quando siamo lontani?',
    "Quale momento di quest'anno vorresti incorniciare?",
    'Che lavoro sognavi di fare da grande?',
    'Qual è una mia abitudine che hai fatto tua?',
    'Se dovessi descrivermi con tre parole, quali sceglieresti?',
    'Qual è la cosa di noi due che ti rende più felice?',
    'Qual è il posto dove ti senti più a casa?',
    'Quale film guarderesti con me per la decima volta?',
    'Cosa faresti con un giorno libero a sorpresa, solo per noi?',
    'Che cosa hai imparato da me?',
    'Qual è il regalo più bello che ti ho fatto?',
    "C'è una cosa della tua infanzia che non mi hai mai raccontato?",
    'Dove ti immagini noi due tra dieci anni?',
    'Qual è il tuo ricordo preferito di un nostro viaggio?',
    'Cosa posso fare per renderti la giornata più leggera?',
    "C'è una canzone che ti fa pensare subito a me?",
    'Qual è la cosa più buffa che ci è successa?',
    'Se aprissimo un locale insieme, che posto sarebbe?',
    'Qual è la stagione che preferisci vivere insieme, e perché?',
    'Quale tradizione vorresti che diventasse solo nostra?',
    "Cos'è che ti ha fatto innamorare di me?",
    'Quando hai capito che eravamo una cosa seria?',
    'Che cosa ti dà energia nelle giornate pesanti?',
    'Qual è la cosa più dolce che ti ho detto?',
    'Che superpotere vorresti avere, e cosa ci faresti?',
    "Qual è un libro o un film che ti ha cambiato un po'?",
    'Se potessi organizzarmi una sorpresa senza limiti di budget, cosa faresti?',
    'Cosa vorresti che facessimo più spesso?',
    'Qual è stata la nostra litigata più stupida?',
    'Qual è il tuo modo preferito di passare una serata a casa con me?',
    'Se scrivessero un libro su di noi, come si intitolerebbe?',
    'Che cosa ti fa sentire al sicuro?',
    'Qual è il sapore che ti ricorda casa?',
    "Cosa vorresti ricordare di questo periodo, tra vent'anni?",
    'Quale piccolo gesto di oggi ti ha fatto sorridere?',
    'Racconta un sogno strano che hai fatto di recente.',
    'Che cosa ti mette di buon umore in meno di cinque minuti?',
    'Qual è una paura che hai superato?',
    'Qual è il luogo più bello in cui siamo stati insieme?',
    'Qual è la nostra battuta che capiamo solo noi?',
    'Cosa ti piacerebbe che ti chiedessi più spesso?',
    'Se avessimo un anno sabbatico, cosa faremmo?',
    'Qual è la scena più romantica che hai visto in un film?',
    'Quale profumo ti fa pensare a me?',
    'Cosa ti ha sorpreso di me, conoscendomi meglio?',
    'Che consiglio daresti a noi due di un anno fa?',
    'Qual è la tua colazione ideale?',
    'Cosa compreresti per primo se vincessimo alla lotteria?',
    'Qual è stato il giorno più bello di questo mese?',
    "C'è una cosa piccola che vorresti festeggiare?",
    "C'è un posto della tua città che vorresti farmi scoprire?",
    'Che cosa ti fa venire nostalgia?',
    'Qual è il tuo talento nascosto?',
    'Che nome daremmo a un nostro cane o gatto?',
    'Cosa ti fa arrabbiare più di quanto dovrebbe?',
    'In cosa mi batti senza discussioni?',
    'Quale momento di oggi vorresti raccontarmi?',
    'Cosa vorresti che non cambiasse mai tra noi?',
    "Qual è un obiettivo che vorresti raggiungere quest'anno?",
    'Quale cibo potresti mangiare tutti i giorni?',
    'Qual è la cosa più gentile che qualcuno ha fatto per te?',
    'Se potessi cenare con una persona qualsiasi, chi sceglieresti?',
    'Qual è un ricordo di famiglia che ti scalda il cuore?',
    'Qual è la nostra canzone?',
    'Cosa ti piace fare quando hai la casa tutta per te?',
    'Quale lingua vorresti parlare perfettamente?',
    'Cosa vorresti provare almeno una volta nella vita?',
    'Qual è il tuo posto del cuore in Italia?',
    'Cosa ti ricordi del nostro primo appuntamento?',
    'Qual è il tuo modo preferito di farti coccolare?',
    'Per cosa vuoi dire grazie, oggi?',
    'Cosa ti piacerebbe ricevere da me senza che io spenda niente?',
    'Qual è la foto di noi due che preferisci?',
    'Se fossimo un film, di che genere saremmo?',
    'Cosa faresti se non avessi paura di sbagliare?',
    'Qual è la serie che riguarderesti sempre?',
    'Qual è il messaggio più bello che ti ho mandato?',
    'Che piccolo lusso ti concederesti ogni settimana?',
    'In che cosa siamo una bella squadra?',
    "Qual è il tuo ricordo preferito d'estate?",
    'Cosa vuoi fare il prossimo weekend?',
    'Qual è una cosa che ti piace di te?',
    'Che cosa ti rilassa davvero?',
    'Qual è stata la giornata più divertente insieme?',
    'Cosa ti piacerebbe cucinare per me?',
    "Qual è un luogo dove vorresti tornare con me?",
    'Cosa posso fare quando hai una giornata no?',
    'Qual è il piatto che ti riporta in vacanza?',
  ],
  who: [
    'Chi dei due si perderebbe in una città nuova?',
    'Chi dei due canta più forte sotto la doccia?',
    'Chi dei due si addormenta prima durante un film?',
    'Chi dei due ha fatto il primo passo?',
    'Chi dei due è più disordinato?',
    'Chi dei due cucina meglio?',
    'Chi dei due chiede scusa per primo?',
    'Chi dei due è più permaloso?',
    'Chi dei due piangerebbe guardando un cartone animato?',
    'Chi dei due spende di più in cose inutili?',
    'Chi dei due è più romantico?',
    'Chi dei due ha più pazienza?',
    'Chi dei due fa i regali più belli?',
    'Chi dei due ruba le coperte la notte?',
    "Chi dei due sopravviverebbe più a lungo su un'isola deserta?",
    'Chi dei due ricorda meglio le date importanti?',
    'Chi dei due è più competitivo nei giochi?',
    'Chi dei due è sempre in ritardo?',
    'Chi dei due si lamenta di più per il freddo?',
    'Chi dei due farebbe la sorpresa più esagerata?',
    'Chi dei due ha detto "ti amo" per primo?',
    'Chi dei due ha la risata più contagiosa?',
    'Chi dei due potrebbe vivere di sola pizza?',
    'Chi dei due passa più tempo al telefono?',
    'Chi dei due guida meglio?',
    'Chi dei due organizzerebbe una festa a sorpresa?',
    'Chi dei due si sveglia prima la mattina?',
    "Chi dei due finisce le frasi dell'altro?",
    'Chi dei due ha i gusti musicali migliori?',
    'Chi dei due è più testardo?',
    "Chi dei due farebbe un tatuaggio d'impulso?",
    'Chi dei due adotterebbe tutti gli animali del canile?',
    'Chi dei due sa ascoltare meglio?',
    'Chi dei due sceglie più spesso il ristorante?',
    'Chi dei due fa più foto?',
    'Chi dei due si commuove più facilmente?',
    'Chi dei due perde sempre le chiavi?',
    'Chi dei due vincerebbe un quiz di cultura generale?',
    'Chi dei due cerca più coccole?',
    'Chi dei due prepara le valigie all\'ultimo minuto?',
  ],
  pick: [
    ['Mare', 'Montagna'], ['Alba', 'Tramonto'], ['Colazione dolce', 'Colazione salata'],
    ['Cinema', 'Divano e film'], ["Città d'arte", 'Natura selvaggia'], ['Pizza', 'Sushi'],
    ['Viaggio organizzato', "All'avventura"], ['Cena fuori', 'Cucinare insieme'], ['Estate', 'Inverno'],
    ['Cane', 'Gatto'], ['Messaggi vocali', 'Messaggi scritti'], ['Festa con gli amici', 'Serata solo noi due'],
    ['Libro', 'Serie tv'], ['Treno', 'Aereo'], ['Caffè', 'Tè'], ['Campagna', 'Grande città'],
    ['Concerto', 'Teatro'], ['Casa al mare', 'Baita in montagna'], ['Sorpresa', 'Piano fatto insieme'],
    ['Ballare', 'Cantare'], ['Gelato', 'Cioccolata calda'], ['Passeggiata lunga', 'Chiacchierata a tavola'],
    ['Weekend in giro', 'Weekend a casa'], ['Foto', 'Video'], ['Nord Europa', 'Sud America'],
    ['Pigiama tutto il giorno', "Fuori dall'alba"], ['Notte', 'Mattina'], ['Lettera a mano', 'Canzone dedicata'],
    ['Pioggia sui vetri', 'Sole che scotta'], ['Lume di candela', 'Picnic sul prato'], ['Roma', 'Parigi'],
    ["Film d'amore", 'Film horror'], ['Giochi da tavolo', 'Videogiochi'], ['Bici', 'Moto'],
    ['Montagne russe', 'Ruota panoramica'], ['Tenda', 'Hotel di lusso'], ['Vino', 'Birra'],
    ['Abbraccio lungo', 'Bacio sulla fronte'], ['Mercatino', 'Museo'], ['Spiaggia libera', 'Lido con ombrellone'],
  ],
};

const Q_KIND = {
  text: { ic:'ask',   label:'Domanda del giorno', short:'Domanda' },
  who:  { ic:'users', label:'Chi dei due?',       short:'Chi dei due?' },
  pick: { ic:'swap',  label:'Questo o quello',    short:'Questo o quello' },
};

/* ───────── domanda del giorno (uguale sui due telefoni) ───────── */
let _qBankCache = null;
function qBank() {
  if (_qBankCache && _qBankCache.id === COUPLE_ID) return _qBankCache;
  const mix = (arr, seed) => { const r = seededRandom(seed); const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  _qBankCache = { id: COUPLE_ID, text: mix(Q_BANK.text, COUPLE_ID + 't'), who: mix(Q_BANK.who, COUPLE_ID + 'w'), pick: mix(Q_BANK.pick, COUPLE_ID + 'p') };
  return _qBankCache;
}
function dayNumber(key) { const [y, m, d] = key.split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / 86400000); }
const qDocId = key => 'd-' + key;

function bankEntry(kind, idx) {
  const list = qBank()[kind];
  const e = list[((idx % list.length) + list.length) % list.length];
  return kind === 'pick' ? { kind, q:'Questo o quello?', opts: e.slice() } : { kind, q: e };
}

function computedDaily(key) {
  const n = dayNumber(key);
  const kind = ['text', 'who', 'text', 'pick'][n % 4];
  const cyc = Math.floor(n / 4);
  const idx = kind === 'text' ? cyc * 2 + (n % 4 === 2 ? 1 : 0) : cyc;
  return { id: qDocId(key), day: key, daily: true, answers: {}, ...bankEntry(kind, idx) };
}

function todayQuestion() {
  const key = todayKey();
  const doc = questionsList.find(x => x.id === qDocId(key));
  if (doc && doc.q) return doc;
  return { ...computedDaily(key), ...(doc || {}), _virtual: !doc };
}

/* ───────── stato ───────── */
const qAns = (q, role) => (q.answers || {})[role] || null;
const qMine = q => qAns(q, myRole);
const qTheirs = q => qAns(q, otherRole(myRole));
const qBoth = q => !!(qMine(q) && qTheirs(q));

function qSeenMap() { try { return JSON.parse(localStorage.getItem('nd_qseen_' + COUPLE_ID) || '{}'); } catch (e) { return {}; } }
function qIsSeen(q) { return !!qSeenMap()[q.id]; }
function qMarkSeen(ids) {
  if (!ids.length) return;
  const m = qSeenMap(); ids.forEach(id => m[id] = 1);
  try { localStorage.setItem('nd_qseen_' + COUPLE_ID, JSON.stringify(m)); } catch (e) {}
  updateBadges();
}
// domande che aspettano me: l'altro ha risposto e io no, o risposte svelate che non ho ancora visto
function questionsForMe() {
  return questionsList.filter(q => (qTheirs(q) && !qMine(q)) || (qBoth(q) && !qIsSeen(q)));
}

function qSorted() {
  return questionsList.filter(q => q.q).slice().sort((a, b) => (b.day || '').localeCompare(a.day || '') || ((b.createdAt || 0) - (a.createdAt || 0)));
}

function qStreak() {
  const done = new Set(questionsList.filter(q => q.daily && qBoth(q)).map(q => q.day));
  const d = todayStart();
  if (!done.has(todayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (done.has(todayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

function qAgree(q) {
  if (!qBoth(q) || q.kind === 'text') return null;
  return String(qAns(q, 'lui').v) === String(qAns(q, 'lei').v);
}

/* ───────── scritture ───────── */
const questionsCol = () => coupleRef().collection('questions');
const withTimeout = p => Promise.race([p, new Promise(r => setTimeout(r, 2500))]);

function qLocalPatch(q, patch) {
  // risposta immediata sullo schermo, prima che arrivi la conferma del server
  let cur = questionsList.find(x => x.id === q.id);
  if (!cur) { cur = { ...q }; delete cur._virtual; questionsList = [cur, ...questionsList]; }
  patch(cur);
  onDataChanged('questions');
}

async function answerQuestion(id, value) {
  const q = findQuestion(id);
  if (!q) return false;
  const v = typeof value === 'string' ? value.trim().slice(0, 1500) : value;
  if (v === '' || v === null || v === undefined) return false;
  const ans = { v, at: Date.now() };
  const payload = { answers: { [myRole]: ans } };
  if (q.daily) Object.assign(payload, { day: q.day, kind: q.kind, q: q.q, opts: q.opts || null, daily: true });
  qLocalPatch(q, cur => { cur.answers = { ...(cur.answers || {}), [myRole]: ans }; });
  try {
    await withTimeout(questionsCol().doc(q.id).set(payload, { merge:true }));
    return true;
  } catch (e) { console.error(e); toast('Risposta non salvata: riprova'); return false; }
}

async function toggleQuestionLike(id) {
  const q = findQuestion(id); if (!q) return;
  const on = !((q.likes || {})[myRole]);
  qLocalPatch(q, cur => { cur.likes = { ...(cur.likes || {}) }; if (on) cur.likes[myRole] = true; else delete cur.likes[myRole]; });
  try { await withTimeout(questionsCol().doc(id).update({ ['likes.' + myRole]: on ? true : FV.delete() })); }
  catch (e) { toast('Non salvato'); }
}

// Cambia la domanda di oggi: solo finché nessuno dei due ha risposto
async function shuffleToday() {
  const cur = todayQuestion();
  if (qMine(cur) || qTheirs(cur)) { toast('Avete già iniziato a rispondere'); return; }
  const r = Math.random();
  const kind = r < 0.5 ? 'text' : r < 0.75 ? 'who' : 'pick';
  let next, guard = 0;
  do { next = bankEntry(kind, Math.floor(Math.random() * 1000)); } while (next.q === cur.q && JSON.stringify(next.opts) === JSON.stringify(cur.opts) && ++guard < 10);
  const docData = { day: cur.day, daily: true, kind: next.kind, q: next.q, opts: next.opts || null };
  const ref = questionsCol().doc(cur.id);
  qLocalPatch(cur, c => Object.assign(c, docData));
  try {
    await withTimeout(db.runTransaction(async tx => {
      const s = await tx.get(ref);
      const a = s.exists ? (s.data().answers || {}) : {};
      if (a.lui || a.lei) return;
      tx.set(ref, docData, { merge:true });
    }));
  } catch (e) { await ref.set(docData, { merge:true }).catch(() => toast('Non riesco a cambiarla adesso')); }
}

async function addCustomQuestion(kind, q, opts) {
  const doc = { day: todayKey(), daily: false, kind, q, opts: kind === 'pick' ? opts : null, by: myRole, createdAt: Date.now(), answers: {} };
  const ref = questionsCol().doc();
  qLocalPatch({ id: ref.id, ...doc }, () => {});
  try { await withTimeout(ref.set(doc)); return ref.id; }
  catch (e) { toast('Domanda non salvata'); return null; }
}

async function deleteQuestion(id) {
  const q = findQuestion(id); if (!q || q.daily || q.by !== myRole) return;
  const ok = await confirmSheet({ title:'Eliminare questa domanda?', text:'Spariscono anche le risposte.', ok:'Elimina', danger:true });
  if (!ok) return;
  closeAllLayers(() => {
    questionsList = questionsList.filter(x => x.id !== id);
    onDataChanged('questions');
    questionsCol().doc(id).delete().catch(() => toast('Eliminazione non riuscita'));
  });
}

function findQuestion(id) {
  if (id === qDocId(todayKey())) return todayQuestion();
  return questionsList.find(x => x.id === id);
}

/* ───────── pezzi di interfaccia ───────── */
// "Questo o quello?" → "Mare o Montagna?"
function qTitle(q) {
  if (q.kind === 'pick' && (!q.q || q.q === 'Questo o quello?') && (q.opts || []).length === 2) return `${esc(q.opts[0])} <em>o</em> ${esc(q.opts[1])}?`;
  return esc(q.q);
}
function qKindChip(q, cls = 'q-chip') {
  const k = Q_KIND[q.kind] || Q_KIND.text;
  return `<span class="${cls}">${icon(k.ic, 14)} ${q.daily ? k.label : `Domanda di ${esc(PEOPLE[q.by] || '')}`}</span>`;
}

function qAnswerLabel(q, a) {
  if (!a) return '';
  if (q.kind === 'who') return esc(PEOPLE[a.v] || a.v);
  if (q.kind === 'pick') return esc((q.opts || [])[a.v] ?? '');
  return esc(a.v);
}

// i due pallini con lo stato di risposta
function qDots(q) {
  return `<span class="q-dots">${['lui', 'lei'].map(r => `<span class="q-dot ${r} ${qAns(q, r) ? 'on' : ''}" title="${esc(PEOPLE[r])}">${esc(initials(PEOPLE[r]))}${qAns(q, r) ? `<i>${icon('check', 9)}</i>` : ''}</span>`).join('')}</span>`;
}

function qStatusText(q) {
  const o = esc(otherName());
  if (qBoth(q)) return qIsSeen(q) ? 'Avete risposto entrambi' : 'Le risposte sono pronte';
  if (qTheirs(q)) return `${o} ha risposto · tocca a te`;
  if (qMine(q)) return `In attesa di ${o}`;
  return 'Rispondete tutti e due per scoprire le risposte';
}

// corpo della card: input (se tocca a me) o risposte
function qBody(q, { reveal = false } = {}) {
  const mine = qMine(q), theirs = qTheirs(q);
  const other = otherRole(myRole);
  const id = jsq(q.id);

  if (!mine) {
    let input = '';
    if (q.kind === 'who') {
      input = `<div class="q-who">${['lui', 'lei'].map(r => `<button class="q-who-btn ${r}" onclick="answerQuestion('${id}','${r}')"><span class="q-who-av">${esc(initials(PEOPLE[r]))}</span><b>${esc(PEOPLE[r])}</b></button>`).join('')}</div>`;
    } else if (q.kind === 'pick') {
      input = `<div class="q-pick">${(q.opts || []).map((o, i) => `<button class="q-pick-btn" onclick="answerQuestion('${id}',${i})">${esc(o)}</button>`).join(`<span class="q-or">o</span>`)}</div>`;
    } else {
      input = `<button class="q-write" onclick="openAnswerSheet('${id}')">${icon('pen', 18)}<span>Scrivi la tua risposta…</span></button>`;
    }
    const sealed = theirs ? `<div class="q-sealed">${icon('lock', 16)}<span><b>${esc(otherName())} ha già risposto.</b> Rispondi per scoprire cosa.</span></div>` : '';
    return sealed + input;
  }

  const card = (role, a, hidden) => `<div class="q-ans ${role} ${hidden ? 'hidden' : ''}">
      <div class="q-ans-head"><span class="who-dot ${role}">${esc(initials(PEOPLE[role]))}</span><b>${role === myRole ? 'Tu' : esc(PEOPLE[role])}</b></div>
      ${hidden
        ? `<div class="q-ans-wait">${icon('clock', 16)} Non ha ancora risposto</div>`
        : `<div class="q-ans-text kind-${q.kind}">${q.kind === 'text' ? linkify(a.v) : qAnswerLabel(q, a)}</div>`}
    </div>`;

  if (!theirs) {
    return `<div class="q-answers">${card(myRole, mine)}${card(other, null, true)}</div>
      ${q.kind === 'text' ? `<button class="link-btn q-edit" onclick="openAnswerSheet('${id}')">${icon('edit', 15)} Modifica la tua risposta</button>` : ''}`;
  }

  const agree = qAgree(q);
  const liked = !!(q.likes || {})[myRole];
  const likedByThem = !!(q.likes || {})[other];
  return `<div class="q-answers ${reveal ? 'reveal' : ''}">${card(other, theirs)}${card(myRole, mine)}</div>
    <div class="q-after">
      ${agree === null ? '' : `<span class="q-agree ${agree ? 'yes' : 'no'}">${icon(agree ? 'heartFill' : 'swap', 15)} ${agree ? (q.kind === 'pick' ? 'Stessa scelta' : "Siete d'accordo") : (q.kind === 'pick' ? 'Gusti diversi' : 'Non siete d\'accordo')}</span>`}
      ${likedByThem ? `<span class="q-liked">${icon('heartFill', 13)} a ${esc(otherName())} piace la tua risposta</span>` : ''}
      <span class="grow"></span>
      <button class="q-like ${liked ? 'on' : ''}" onclick="toggleQuestionLike('${id}')" aria-label="Mi piace la risposta di ${esc(otherName())}">${icon(liked ? 'heartFill' : 'heart', 20)}</button>
    </div>`;
}

/* ───────── pagina ───────── */
function renderDomande() {
  const today = todayQuestion();
  const others = qSorted().filter(q => q.id !== today.id);
  const forMe = others.filter(q => !qMine(q) && (qTheirs(q) || !q.daily));
  const waiting = others.filter(q => qMine(q) && !qTheirs(q));
  const doneList = others.filter(q => qBoth(q));
  const streak = qStreak();
  const together = questionsList.filter(qBoth).length;
  const choices = questionsList.filter(q => qAgree(q) !== null);
  const agreePct = choices.length >= 3 ? Math.round(choices.filter(q => qAgree(q)).length / choices.length * 100) : null;

  let h = pageHead({
    eyebrow: cap(new Date().toLocaleDateString('it-IT', { weekday:'long', day:'numeric', month:'long' })),
    title: 'Domande',
    actions: `<button class="icon-btn accent" onclick="openAskSheet()" aria-label="Fai una domanda">${icon('plus', 22)}</button>`
  });

  if (streak || together) {
    h += `<div class="q-stats">
      ${streak ? `<span class="q-stat hot">${icon('flame', 16)} <b>${streak}</b> ${streak === 1 ? 'giorno di fila' : 'giorni di fila'}</span>` : ''}
      ${together ? `<span class="q-stat">${icon('users', 16)} <b>${together}</b> ${together === 1 ? 'risposta insieme' : 'risposte insieme'}</span>` : ''}
      ${agreePct !== null ? `<span class="q-stat">${icon('heart', 16)} d'accordo al <b>${agreePct}%</b></span>` : ''}
    </div>`;
  }

  const revealNow = qBoth(today) && !qIsSeen(today);
  h += `<article class="q-today kind-${today.kind}" data-qid="${esc(today.id)}" ${revealNow ? 'data-unseen="1"' : ''}>
    <div class="q-today-top">${qKindChip(today)}${qDots(today)}</div>
    <h2 class="q-text">${qTitle(today)}</h2>
    ${qBody(today, { reveal: revealNow })}
  </article>`;
  if (!qMine(today) && !qTheirs(today)) {
    h += `<div class="q-under"><button class="link-btn" onclick="shuffleToday()">${icon('shuffle', 15)} Cambia domanda</button></div>`;
  } else {
    h += `<p class="q-under muted small">${qBoth(today) ? 'Domani arriva una nuova domanda' : qStatusText(today)}</p>`;
  }

  if (forMe.length) h += `<section class="block"><div class="block-head"><h2 class="h2">Tocca a te <em>${forMe.length}</em></h2></div>${forMe.map(qRow).join('')}</section>`;
  if (waiting.length) h += `<section class="block"><div class="block-head"><h2 class="h2">In attesa di ${esc(otherName())}</h2></div>${waiting.map(qRow).join('')}</section>`;

  h += `<button class="ask-card" onclick="openAskSheet()">
    <span class="ask-ic">${icon('ask', 22)}</span>
    <span><b>Fai una domanda a ${esc(otherName())}</b><small>Libera, "chi dei due" o "questo o quello"</small></span>
    ${icon('chevR', 18, 'chev')}
  </button>`;

  if (doneList.length) {
    h += `<section class="block"><div class="block-head"><h2 class="h2">Le vostre risposte</h2><span class="muted small">${doneList.length}</span></div>
      <div class="q-archive">${doneList.slice(0, 60).map(qArchiveCard).join('')}</div></section>`;
  } else if (!forMe.length && !waiting.length) {
    h += `<p class="muted small center pad">Qui si raccoglieranno le vostre risposte, giorno dopo giorno.</p>`;
  }

  const sc = (data._games && data._games.scores) || {};
  if ((sc.lui || 0) + (sc.lei || 0) > 0) {
    h += `<button class="archive-link" onclick="openOldGames()">${icon('archive', 18)} Le vecchie sfide di Gioca ${icon('chevR', 16)}</button>`;
  }
  return h;
}

function qRow(q) {
  const k = Q_KIND[q.kind] || Q_KIND.text;
  return `<button class="row-card" onclick="openQuestion('${jsq(q.id)}')">
    <span class="row-ic">${icon(k.ic, 20)}</span>
    <span class="row-text"><b>${qTitle(q)}</b><small>${q.daily ? fmtDate(q.day, { day:'numeric', month:'long' }) : `Da ${esc(PEOPLE[q.by] || '')} · ${fmtDate(q.day, { day:'numeric', month:'long' })}`}</small></span>
    ${qDots(q)}
  </button>`;
}

function qArchiveCard(q) {
  const unseen = !qIsSeen(q);
  const k = Q_KIND[q.kind] || Q_KIND.text;
  const line = role => `<div class="qa-line ${role}"><span class="who-dot ${role}">${esc(initials(PEOPLE[role]))}</span><span>${qAnswerLabel(q, qAns(q, role))}</span></div>`;
  const agree = qAgree(q);
  return `<button class="qa-card ${unseen ? 'unseen' : ''}" onclick="openQuestion('${jsq(q.id)}')">
    <div class="qa-top"><span class="qa-kind">${icon(k.ic, 13)} ${fmtDate(q.day, { day:'numeric', month:'short' })}</span>${unseen ? '<span class="qa-new">Nuove</span>' : ''}${agree !== null ? `<span class="qa-agree ${agree ? 'yes' : 'no'}">${icon(agree ? 'heartFill' : 'swap', 12)}</span>` : ''}</div>
    <div class="qa-q">${qTitle(q)}</div>
    ${unseen ? `<div class="qa-hidden">${icon('eye', 15)} Tocca per scoprire le risposte</div>` : line('lui') + line('lei')}
  </button>`;
}

/* dettaglio di una domanda (per quelle non di oggi) */
function openQuestion(id, opts = {}) {
  const q = findQuestion(id); if (!q) return;
  const render = () => {
    const cur = findQuestion(id) || q;
    const revealNow = qBoth(cur) && !qIsSeen(cur);
    const html = `<div class="q-sheet kind-${cur.kind}">
      <div class="q-today-top">${qKindChip(cur)}<span class="muted small">${fmtDate(cur.day, { day:'numeric', month:'long', year:'numeric' })}</span></div>
      <h2 class="q-text">${qTitle(cur)}</h2>
      ${qBody(cur, { reveal: revealNow })}
      ${!cur.daily && cur.by === myRole ? `<div class="row-actions"><button class="btn btn-ghost sm" onclick="deleteQuestion('${jsq(cur.id)}')">${icon('trash', 16)} Elimina</button></div>` : ''}
    </div>`;
    if (revealNow) setTimeout(() => qMarkSeen([cur.id]), 300);
    return html;
  };
  const el = openSheet(render(), { replace: opts.replace });
  // le risposte di "chi dei due" e "questo o quello" arrivano dai bottoni: aggiorno lo sheet
  el._qRefresh = () => { const box = el.querySelector('.q-sheet'); if (box) box.outerHTML = render(); };
  el._qId = id;
}

// dopo ogni aggiornamento dei dati, rinfresca l'eventuale dettaglio aperto
function refreshQuestionSheets() {
  const top = topLayerEl();
  if (top && top._qRefresh) top._qRefresh();
}

/* risposta scritta */
function openAnswerSheet(id) {
  const q = findQuestion(id); if (!q) return;
  const mine = qMine(q);
  const el = openSheet(`<form class="form" id="ans-form" novalidate>
    <div class="q-today-top">${qKindChip(q)}</div>
    <h3 class="q-text sm">${qTitle(q)}</h3>
    <textarea class="input q-area" name="v" rows="5" maxlength="1500" placeholder="Scrivi la tua risposta…">${esc(mine ? mine.v : '')}</textarea>
    <p class="muted small">${qTheirs(q) ? `Quando invii, vedi subito la risposta di ${esc(otherName())}.` : `${esc(otherName())} la vedrà solo dopo aver risposto a sua volta.`}</p>
    <div class="row-actions sticky">
      <button type="button" class="btn btn-ghost" onclick="closeTop()">Annulla</button>
      <button type="submit" class="btn btn-primary">${icon('send', 18)} ${mine ? 'Salva' : 'Rispondi'}</button>
    </div>
  </form>`, { cls:'sheet-form' });
  const f = el.querySelector('#ans-form');
  setTimeout(() => f.v.focus(), 380);
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const v = f.v.value.trim();
    if (!v) { toast('Scrivi qualcosa'); return; }
    closeTop();
    await answerQuestion(id, v);
  });
}

/* nuova domanda vostra */
function openAskSheet() {
  let kind = 'text';
  const el = openSheet(`<form class="form" id="ask-form" novalidate>
    <h3 class="sheet-title">Fai una domanda a ${esc(otherName())}</h3>
    <div class="seg full ask-kinds" id="ask-kind">
      <button type="button" class="on" data-k="text">Libera</button>
      <button type="button" data-k="who">Chi dei due</button>
      <button type="button" data-k="pick">Questo o quello</button>
    </div>
    <label class="field"><span>Domanda</span><textarea class="input" name="q" rows="3" maxlength="300" placeholder="Cosa vorresti sapere?"></textarea></label>
    <div class="grid2" id="ask-opts" hidden>
      <label class="field"><span>Questo</span><input class="input" name="o1" maxlength="60" placeholder="Mare"></label>
      <label class="field"><span>Quello</span><input class="input" name="o2" maxlength="60" placeholder="Montagna"></label>
    </div>
    <p class="muted small">Rispondete tutti e due: le risposte si vedono quando ci siete entrambi.</p>
    <div class="row-actions sticky">
      <button type="button" class="btn btn-ghost" onclick="closeTop()">Annulla</button>
      <button type="submit" class="btn btn-primary">${icon('send', 18)} Invia</button>
    </div>
  </form>`, { cls:'sheet-form' });
  const f = el.querySelector('#ask-form');
  const ph = { text:'Cosa vorresti sapere?', who:'Chi dei due…', pick:'Questo o quello? (facoltativo)' };
  el.querySelectorAll('#ask-kind [data-k]').forEach(b => b.addEventListener('click', () => {
    kind = b.dataset.k;
    el.querySelectorAll('#ask-kind [data-k]').forEach(x => x.classList.toggle('on', x === b));
    el.querySelector('#ask-opts').hidden = kind !== 'pick';
    f.q.placeholder = ph[kind];
    if (kind === 'who' && !f.q.value.trim()) { f.q.value = 'Chi dei due '; f.q.focus(); }
  }));
  setTimeout(() => f.q.focus(), 380);
  f.addEventListener('submit', async e => {
    e.preventDefault();
    let q = f.q.value.trim();
    const opts = [f.o1.value.trim(), f.o2.value.trim()];
    if (kind === 'pick') {
      if (!opts[0] || !opts[1]) { toast('Scrivi le due alternative'); return; }
      if (!q) q = 'Questo o quello?';
    }
    if (!q || q === 'Chi dei due') { toast('Scrivi la domanda'); return; }
    const btn = f.querySelector('[type=submit]');
    setBusy(btn, true, 'Invio…');
    const newId = await addCustomQuestion(kind, q, opts);
    setBusy(btn, false);
    if (!newId) return;
    toast(`Domanda inviata a ${otherName()}: ora rispondi anche tu`);
    openQuestion(newId, { replace:true });
  });
}

/* card per la home */
function qHomeCard() {
  const q = todayQuestion();
  const k = Q_KIND[q.kind] || Q_KIND.text;
  const hot = !qMine(q) || (qBoth(q) && !qIsSeen(q));
  return `<button class="q-home ${hot ? 'hot' : ''}" onclick="go('domande')">
    <span class="q-home-top"><span class="eyebrow accent">${icon(k.ic, 13)} ${q.kind === 'text' ? 'La domanda di oggi' : k.label}</span>${qDots(q)}</span>
    <span class="q-home-q">${qTitle(q)}</span>
    <span class="q-home-foot">${qStatusText(q)}${icon('chevR', 16, 'chev')}</span>
  </button>`;
}

/* ───────── le vecchie sfide (sola lettura) ───────── */
async function openOldGames() {
  const sc = (data._games && data._games.scores) || { lui:0, lei:0 };
  const el = openSheet(`<div class="archive">
    <h3 class="sheet-title">Le vecchie sfide</h3>
    <p class="muted small">Trivia, Pictionary e Vero o falso: conservati qui in sola lettura.</p>
    <div class="score">
      <div class="score-side lui ${sc.lui > sc.lei ? 'lead' : ''}"><span class="score-n">${sc.lui || 0}</span><span class="score-name">${esc(PEOPLE.lui)}</span></div>
      <span class="score-vs">vs</span>
      <div class="score-side lei ${sc.lei > sc.lui ? 'lead' : ''}"><span class="score-n">${sc.lei || 0}</span><span class="score-name">${esc(PEOPLE.lei)}</span></div>
    </div>
    <div class="old-games"><div class="center pad"><span class="spinner"></span></div></div>
  </div>`, { cls:'sheet-tall' });
  try {
    const s = await coupleRef().collection('games').orderBy('createdAt', 'desc').limit(200).get();
    const list = s.docs.map(d => ({ id:d.id, ...d.data() }));
    el.querySelector('.old-games').innerHTML = list.length ? list.map(oldGameCard).join('') : `<p class="muted center pad">Nessuna sfida salvata.</p>`;
  } catch (e) {
    el.querySelector('.old-games').innerHTML = `<p class="muted center pad">Non riesco a caricare le sfide.</p>`;
  }
}

function oldGameCard(g) {
  const label = { trivia:'Trivia', pictionary:'Pictionary', verofalso:'Vero o falso' }[g.type];
  if (!label) return '';
  const L = ['A', 'B', 'C', 'D'];
  let body = '';
  if (g.type === 'trivia') {
    body += `<p class="game-q">${esc(g.question)}</p><div class="opts">${(g.options || []).map((o, i) => o ? `<div class="opt static ${i === g.correctOption ? 'right' : ''} ${g.status === 'done' && i === g.answer && g.answer !== g.correctOption ? 'wrong' : ''}"><b>${L[i]}</b>${esc(o)}</div>` : '').join('')}</div>`;
  }
  if (g.type === 'pictionary') {
    if (g.drawing && String(g.drawing).startsWith('data:image/')) body += `<img class="game-drawing" src="${g.drawing}" alt="disegno">`;
    body += `<p class="muted small">La parola era <b>${esc(g.word || '')}</b>${g.guess ? ` · risposta: “${esc(g.guess)}”` : ''}</p>`;
  }
  if (g.type === 'verofalso') body += `<p class="game-q">“${esc(g.statement)}”</p><p class="muted small">Era ${g.answer ? 'vero' : 'falso'}</p>`;
  const foot = g.status === 'done'
    ? `<div class="game-foot ${g.correct ? 'ok' : 'ko'}">${icon(g.correct ? 'check' : 'close', 15)} ${esc(PEOPLE[g.answeredBy] || '')} ${g.correct ? 'ha indovinato' : 'ha sbagliato'}</div>`
    : `<div class="game-foot">${icon('clock', 15)} Senza risposta</div>`;
  return `<article class="game-card closed"><div class="game-head"><span class="game-type">${label}</span><span class="muted small">${esc(PEOPLE[g.createdBy] || '')} · ${fmtTs(g.createdAt)}</span></div>${body}${foot}</article>`;
}
