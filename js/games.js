/* ═══════════════════════════════════════════════
   NOI DUE — Gioca (Trivia, Pictionary, Vero o falso)
   Database: couples/{id}/games/{autoId} — stesso formato di prima
═══════════════════════════════════════════════ */

/* ── Pictionary word list (Italian) ── */
const PIC_WORDS = [
// Casa & oggetti
'amaca','candelabro','caminetto','vasca','jacuzzi','specchio','tappeto','lenzuola','cuscino','tenda',
'frigorifero','forno','lavatrice','telefono','televisione','computer','orologio','diario',
'ombrello','valigia','zaino','tacchi','cappello','occhiali','anello','chiave','rossetto',
'profumo','candela','champagne','calice','accendino','smalto','cravatta','reggiseno',
'mutande','vestaglia','pigiama','asciugamano','phon','rasoio','peluche',
// Animali
'gatto','cane','criceto','pesce','cavallo','mucca','maiale','pecora','coniglio','riccio',
'elefante','giraffa','leone','tigre','scimmia','orso','volpe','lupo','aquila','pinguino',
'delfino','balena','squalo','polpo','farfalla','ape','ragno','lumaca','fenicottero','panda',
'koala','canguro','camaleonte','pavone','gufo',
// Natura
'albero','fiore','montagna','mare','sole','luna','stella','nuvola','arcobaleno','neve',
'pioggia','vento','tramonto','alba','fungo','cascata','vulcano','isola','lago','fiume',
'rosa','girasole','tulipano','quadrifoglio',
// Cibo
'pizza','pasta','gelato','torta','pane','mela','banana','fragola','uva','ananas',
'pomodoro','carota','patata','cipolla','aglio','limone','arancia','caffe','vino','birra',
'hamburger','sushi','formaggio','uovo','cioccolato','caramella','tiramisu','cannolo','riso',
'cocktail','spritz','tartufo','ostriche','peperoncino','miele','panna',
// Sport & attività
'calcio','tennis','nuoto','corsa','bicicletta','yoga','danza','palestra','sci','surf',
'boxe','golf','pallavolo','basket','arrampicata','kayak','pattinaggio','pilates','zumba',
'tango','salsa',
// Professioni
'dottore','cuoco','insegnante','pompiere','poliziotto','astronauta','musicista','pittore',
'fotografo','pilota','marinaio','contadino','ballerina','modella','spogliarellista',
'massaggiatore','barista','dj','attore',
// Trasporti
'aereo','treno','macchina','barca','moto','autobus','elicottero','sottomarino','limousine',
'gondola','yacht',
// Luoghi
'spiaggia','castello','chiesa','museo','mercato','stadio','ospedale','scuola','ristorante',
'cinema','teatro','parco','piscina','biblioteca','stazione','aeroporto','faro','igloo',
'discoteca','spa','hotel','motel','sauna','terme','vigneto','luna park',
// Romantico & coppia 💕
'bacio','abbraccio','carezza','massaggio','luna di miele','matrimonio','fidanzamento',
'appuntamento','cena romantica','san valentino','dichiarazione','proposta','fede',
'lettera d amore','serenata','coccole','sguardo','lacrima','sorriso','sussurro',
'mano nella mano','ballo lento','poesia','dedica',
// Hot 🔥 (per modalità piccante)
'lingerie','seduzione','flirt','strip tease','lap dance','bondage','manette','frusta',
'maschera','benda','piuma','olio','schiuma','doccia','letto','divano','tappeto',
'tatuaggio','piercing','autoreggenti','perizoma','corsetto','reggicalze','pizzo',
'morso','succhiotto','gemito','brivido','desiderio','passione','tentazione','peccato',
'fantasia','sogno proibito','gioco di ruolo','infermiera','poliziotta','segretaria',
'cameriera','pirata','vampiro',
// Varie
'regalo','cuore','corona','robot','fantasma','unicorno','drago','mago',
'pallone','aquilone','mongolfiera','diavolo','angelo','sirena','cupido','afrodite',
];

const GAME_META = {
  trivia:     { icon:'🧠', label:'Trivia',       hint:'Una domanda su di te, quattro risposte' },
  pictionary: { icon:'🎨', label:'Pictionary',   hint:"Disegni una parola, l'altro indovina" },
  verofalso:  { icon:'❓', label:'Vero o falso', hint:'Racconta qualcosa: sarà vero?' },
};

function normWord(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

function renderGioca() {
  const sc = (data._games && data._games.scores) || { lui:0, lei:0 };
  const lui = sc.lui || 0, lei = sc.lei || 0;
  const forMe = gamesList.filter(g => g.status === 'pending' && g.createdBy !== myRole);
  const waiting = gamesList.filter(g => g.status === 'pending' && g.createdBy === myRole);
  const done = gamesList.filter(g => g.status === 'done').slice(0, 20);

  let h = pageHead({ eyebrow:'Sfide a distanza', title:'Gioca' });

  h += `<div class="score">
    <div class="score-side lui ${lui > lei ? 'lead' : ''}"><span class="score-n">${lui}</span><span class="score-name">${esc(PEOPLE.lui)}</span></div>
    <span class="score-vs">vs</span>
    <div class="score-side lei ${lei > lui ? 'lead' : ''}"><span class="score-n">${lei}</span><span class="score-name">${esc(PEOPLE.lei)}</span></div>
  </div>`;

  h += `<section class="block">
    <div class="block-head"><h2 class="h2">Nuova sfida</h2></div>
    <div class="game-tiles">${Object.entries(GAME_META).map(([k, m]) => `<button class="game-tile gt-${k}" onclick="openGameCreate('${k}')">
        <span class="gt-emoji">${m.icon}</span><b>${m.label}</b><small>${m.hint}</small></button>`).join('')}</div>
  </section>`;

  if (forMe.length) h += `<section class="block"><div class="block-head"><h2 class="h2">Tocca a te <em>${forMe.length}</em></h2></div>${forMe.map(gameCard).join('')}</section>`;
  if (waiting.length) h += `<section class="block"><div class="block-head"><h2 class="h2">In attesa di ${esc(otherName())}</h2></div>${waiting.map(gameCard).join('')}</section>`;
  if (done.length) h += `<section class="block"><div class="block-head"><h2 class="h2">Concluse</h2></div>${done.map(gameCard).join('')}</section>`;
  if (!gamesList.length) h += emptyState('🎲', 'Nessuna sfida ancora', `Lancia la prima a ${esc(otherName())}: risponderà quando vuole.`);
  return h;
}

function gameCard(g) {
  const m = GAME_META[g.type]; if (!m) return '';
  const mine = g.createdBy === myRole;
  const pending = g.status === 'pending';
  const canPlay = pending && !mine;
  const head = `<div class="game-head"><span class="game-type">${m.icon} ${m.label}</span><span class="muted small">${esc(PEOPLE[g.createdBy] || '')} · ${fmtTs(g.createdAt)}</span></div>`;
  let body = '';

  if (g.type === 'trivia') {
    const L = ['A', 'B', 'C', 'D'];
    body += `<p class="game-q">${esc(g.question)}</p>`;
    const opts = (g.options || []).map((o, i) => ({ o, i })).filter(x => x.o);
    if (canPlay) {
      body += `<div class="opts">${opts.map(x => `<button class="opt" onclick="answerTrivia('${jsq(g.id)}',${x.i})"><b>${L[x.i]}</b>${esc(x.o)}</button>`).join('')}</div>`;
    } else if (!pending) {
      body += `<div class="opts">${opts.map(x => `<div class="opt static ${x.i === g.correctOption ? 'right' : ''} ${x.i === g.answer && g.answer !== g.correctOption ? 'wrong' : ''}"><b>${L[x.i]}</b>${esc(x.o)}</div>`).join('')}</div>`;
    }
  }
  if (g.type === 'pictionary') {
    if (g.drawing) body += `<img class="game-drawing" src="${g.drawing.startsWith('data:image/') ? g.drawing : ''}" alt="disegno">`;
    if (canPlay) body += `<button class="btn btn-primary wide" onclick="openGuess('${jsq(g.id)}')">Indovina il disegno</button>`;
    else if (mine && pending) body += `<p class="muted small">La parola era <b>${esc(g.word)}</b></p>`;
  }
  if (g.type === 'verofalso') {
    body += `<p class="game-q">“${esc(g.statement)}”</p>`;
    if (canPlay) body += `<div class="grid2"><button class="btn btn-ghost" onclick="answerVeroFalso('${jsq(g.id)}',true)">Vero</button><button class="btn btn-ghost" onclick="answerVeroFalso('${jsq(g.id)}',false)">Falso</button></div>`;
  }

  let foot = '';
  if (pending && mine) foot = `<div class="game-foot wait">${icon('clock', 15)} In attesa che ${esc(otherName())} risponda</div>`;
  if (!pending) {
    const who = esc(PEOPLE[g.answeredBy] || '');
    let detail = '';
    if (g.type === 'pictionary') detail = g.correct ? `Era “${esc(g.word)}”` : `Era “${esc(g.word)}”, ha detto “${esc(g.guess || '')}”`;
    if (g.type === 'verofalso') detail = `Era ${g.answer ? 'vero' : 'falso'}`;
    foot = `<div class="game-foot ${g.correct ? 'ok' : 'ko'}">${g.correct ? `${icon('check', 15)} ${who} ha indovinato · +1` : `${icon('close', 15)} ${who} ha sbagliato`}${detail ? ` · ${detail}` : ''}</div>`;
  }
  return `<article class="game-card ${canPlay ? 'hot' : ''} ${!pending ? 'closed' : ''}">${head}${body}${foot}</article>`;
}

/* ═══════════════════════════════════════════════
   CREA SFIDA
═══════════════════════════════════════════════ */
function openGameCreate(type) {
  if (type === 'trivia') return openTriviaCreate();
  if (type === 'pictionary') return openPictionaryCreate();
  if (type === 'verofalso') return openVfCreate();
}

async function addGame(doc) {
  const full = { ...doc, createdBy: myRole, status:'pending', createdAt: FV.serverTimestamp() };
  await Promise.race([coupleRef().collection('games').add(full), new Promise(r => setTimeout(r, 2500))]);
}

function openTriviaCreate() {
  const el = openSheet(`<form class="form" id="tv-form" novalidate>
    <h3 class="sheet-title">🧠 Nuova Trivia</h3>
    <label class="field"><span>La domanda</span><textarea class="input" name="q" rows="2" placeholder="Qual è il mio film preferito?"></textarea></label>
    <div class="field"><span>Risposte — tocca il cerchio di quella giusta</span>
      ${[0, 1, 2, 3].map(i => `<div class="opt-in"><button type="button" class="radio ${i === 0 ? 'on' : ''}" data-ok="${i}" aria-label="Risposta giusta">${icon('check', 14)}</button><input class="input" name="o${i}" placeholder="Risposta ${'ABCD'[i]}${i > 1 ? ' (facoltativa)' : ''}"></div>`).join('')}
    </div>
    <div class="row-actions sticky"><button type="button" class="btn btn-ghost" onclick="closeTop()">Annulla</button><button class="btn btn-primary">Invia sfida</button></div>
  </form>`, { cls:'sheet-form' });
  const f = el.querySelector('#tv-form');
  let ok = 0;
  f.querySelectorAll('[data-ok]').forEach(b => b.addEventListener('click', () => {
    ok = parseInt(b.dataset.ok); f.querySelectorAll('[data-ok]').forEach(x => x.classList.toggle('on', x === b));
  }));
  setTimeout(() => f.q.focus(), 380);
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const question = f.q.value.trim();
    const options = [0, 1, 2, 3].map(i => f['o' + i].value.trim());
    if (!question) { toast('Scrivi la domanda'); return; }
    if (options.filter(Boolean).length < 2) { toast('Servono almeno due risposte'); return; }
    if (!options[ok]) { toast('La risposta giusta è vuota'); return; }
    const btn = f.querySelector('.btn-primary'); setBusy(btn, true, 'Invio…');
    try { await addGame({ type:'trivia', question, options, correctOption: ok }); closeTop(); toast('Sfida inviata!'); }
    catch (err) { setBusy(btn, false); toast('Errore: ' + err.message); }
  });
}

function openVfCreate() {
  const el = openSheet(`<form class="form" id="vf-form" novalidate>
    <h3 class="sheet-title">❓ Vero o falso</h3>
    <label class="field"><span>La tua affermazione</span><textarea class="input" name="s" rows="3" placeholder="Non ho mai visto Titanic"></textarea></label>
    <div class="field"><span>In realtà è…</span><div class="seg full"><button type="button" class="on" data-v="1">Vero</button><button type="button" data-v="0">Falso</button></div></div>
    <div class="row-actions sticky"><button type="button" class="btn btn-ghost" onclick="closeTop()">Annulla</button><button class="btn btn-primary">Invia sfida</button></div>
  </form>`, { cls:'sheet-form' });
  const f = el.querySelector('#vf-form');
  let val = true;
  f.querySelectorAll('[data-v]').forEach(b => b.addEventListener('click', () => {
    val = b.dataset.v === '1'; f.querySelectorAll('[data-v]').forEach(x => x.classList.toggle('on', x === b));
  }));
  setTimeout(() => f.s.focus(), 380);
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const statement = f.s.value.trim();
    if (!statement) { toast("Scrivi un'affermazione"); return; }
    const btn = f.querySelector('.btn-primary'); setBusy(btn, true, 'Invio…');
    try { await addGame({ type:'verofalso', statement, answer: val }); closeTop(); toast('Sfida inviata!'); }
    catch (err) { setBusy(btn, false); toast('Errore: ' + err.message); }
  });
}

function openPictionaryCreate() {
  let word = PIC_WORDS[Math.floor(Math.random() * PIC_WORDS.length)];
  let sketch = null;
  const el = openSheet(`<div class="form">
    <h3 class="sheet-title">🎨 Pictionary</h3>
    <div class="pic-word"><span class="muted small">Disegna</span><b class="display" id="pic-word">${esc(word)}</b>
      <button type="button" class="icon-btn sm" data-act="reroll" aria-label="Cambia parola">${icon('dice', 18)}</button></div>
    <p class="hint">Non scrivere la parola: ${esc(otherName())} dovrà indovinarla.</p>
    <canvas class="pic-canvas"></canvas>
    ${sketchToolbarHtml('pic')}
    <div class="row-actions sticky"><button type="button" class="btn btn-ghost" onclick="closeTop()">Annulla</button><button type="button" class="btn btn-primary" data-act="send">Invia disegno</button></div>
  </div>`, { cls:'sheet-form', onClose: () => sketch && sketch.destroy() });
  requestAnimationFrame(() => requestAnimationFrame(() => {
    sketch = new Sketch(el.querySelector('.pic-canvas'), { bg:'#ffffff', color:'#2b1d14', size:6 });
    bindSketchToolbar(el, 'pic', sketch);
  }));
  el.querySelector('[data-act=reroll]').addEventListener('click', () => {
    word = PIC_WORDS[Math.floor(Math.random() * PIC_WORDS.length)];
    el.querySelector('#pic-word').textContent = word;
  });
  el.querySelector('[data-act=send]').addEventListener('click', async e => {
    if (!sketch || !sketch.dirty) { toast('Prima disegna qualcosa!'); return; }
    const btn = e.currentTarget; setBusy(btn, true, 'Invio…');
    try { await addGame({ type:'pictionary', word, drawing: sketch.toDataURL(0.7, 900) }); closeTop(); toast('Disegno inviato!'); }
    catch (err) { setBusy(btn, false); toast('Errore: ' + err.message); }
  });
}

/* ═══════════════════════════════════════════════
   RISPONDI
═══════════════════════════════════════════════ */
function findGame(id) { return gamesList.find(g => g.id === id); }

async function finishGame(g, patch, correct) {
  try {
    await coupleRef().collection('games').doc(g.id).update({ status:'done', answeredBy: myRole, correct, answeredAt: FV.serverTimestamp(), ...patch });
    if (correct) await addScore(myRole);
    toast(correct ? 'Esatto! +1 punto 🎉' : 'Sbagliato! Sarà per la prossima.');
  } catch (e) { toast('Errore: ' + e.message); }
}

function answerTrivia(id, idx) {
  const g = findGame(id);
  if (!g || g.status !== 'pending' || g.createdBy === myRole) return;
  finishGame(g, { answer: idx }, idx === g.correctOption);
}

function answerVeroFalso(id, guess) {
  const g = findGame(id);
  if (!g || g.status !== 'pending' || g.createdBy === myRole) return;
  finishGame(g, { guess }, guess === g.answer);
}

function openGuess(id) {
  const g = findGame(id); if (!g) return;
  const el = openSheet(`<form class="form" id="guess-form" novalidate>
    <h3 class="sheet-title">Cos'è?</h3>
    <img class="game-drawing" src="${(g.drawing || '').startsWith('data:image/') ? g.drawing : ''}" alt="disegno">
    <input class="input big" name="guess" placeholder="Scrivi la tua risposta" autocomplete="off" autocapitalize="off">
    <div class="row-actions sticky"><button type="button" class="btn btn-ghost" onclick="closeTop()">Annulla</button><button class="btn btn-primary">Rispondi</button></div>
  </form>`, { cls:'sheet-form' });
  const f = el.querySelector('#guess-form');
  setTimeout(() => f.guess.focus(), 380);
  f.addEventListener('submit', e => {
    e.preventDefault();
    const guess = f.guess.value.trim();
    if (!guess) return;
    closeTop();
    finishGame(g, { guess }, normWord(guess) === normWord(g.word));
  });
}
