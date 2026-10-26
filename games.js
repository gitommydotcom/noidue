/* ═══════════════════════════════════════════════
   GAMES.JS — Trivia + Pictionary
   (loaded before app.js)
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

/* ── Vero o Falso state ── */
let vfAnswer = true; // the creator's actual answer

/* ── Canvas state ── */
let drawCanvas = null, drawCtx = null;
let isDrawing  = false;
let drawColor  = '#7E57C2';
let drawBrush  = 6;
let drawHistory = []; // ImageData snapshots for undo
let currentPicWord = '';
let activeGameTab  = 'trivia'; // 'trivia' | 'pictionary' | 'verofalso'

/* ════════════════════════════════════════════════
   RENDER GAMES PAGE
════════════════════════════════════════════════ */
function renderGames() {
  const el = document.getElementById('games-content');
  if (!el) return;

  const scores   = (data._games && data._games.scores) || { lui:0, lei:0 };
  const triGames = gamesList.filter(g => g.type === 'trivia');
  const picGames = gamesList.filter(g => g.type === 'pictionary');
  const vfGames  = gamesList.filter(g => g.type === 'verofalso');
  const curGames = activeGameTab === 'trivia' ? triGames
                 : activeGameTab === 'pictionary' ? picGames
                 : vfGames;

  const createFn  = activeGameTab === 'trivia' ? 'openTriviaModal()'
                  : activeGameTab === 'pictionary' ? 'openPicDrawModal()'
                  : 'openVeroFalsoModal()';
  const tabIcon   = activeGameTab === 'trivia' ? '🧠'
                  : activeGameTab === 'pictionary' ? '🎨' : '❓';

  el.innerHTML = `
    <!-- SCORES -->
    <div class="scores-bar">
      <div class="score-side">
        <span class="score-name lui">${esc(PEOPLE.lui)}</span>
        <span class="score-num">${scores.lui}</span>
      </div>
      <span class="score-vs">VS</span>
      <div class="score-side">
        <span class="score-name lei">${esc(PEOPLE.lei)}</span>
        <span class="score-num">${scores.lei}</span>
      </div>
    </div>

    <!-- TABS -->
    <div class="game-tabs">
      <button class="game-tab ${activeGameTab==='trivia'?'active':''}" onclick="switchGameTab('trivia')">🧠 Trivia</button>
      <button class="game-tab ${activeGameTab==='pictionary'?'active':''}" onclick="switchGameTab('pictionary')">🎨 Pictionary</button>
      <button class="game-tab ${activeGameTab==='verofalso'?'active':''}" onclick="switchGameTab('verofalso')">❓ V/F</button>
    </div>

    <!-- CREATE -->
    <button class="game-create-btn" onclick="${createFn}">
      + Crea sfida ${activeGameTab==='trivia'?'Trivia':activeGameTab==='pictionary'?'Pictionary':'Vero o Falso'}
    </button>

    <!-- LIST -->
    <div id="games-list">
      ${curGames.length === 0
        ? `<div class="games-empty"><div style="font-size:40px">${tabIcon}</div><p>Nessuna sfida ancora — creane una!</p></div>`
        : curGames.map(g => gameCard(g)).join('')}
    </div>
  `;
}

function switchGameTab(tab) {
  activeGameTab = tab;
  renderGames();
}

/* ════════════════════════════════════════════════
   GAME CARD ROUTER
════════════════════════════════════════════════ */
function gameCard(g) {
  const isMine    = g.createdBy === myRole;
  const otherRole = myRole === 'lui' ? 'lei' : 'lui';
  const isPending = g.status === 'pending';
  const isDone    = g.status === 'done';

  if (g.type === 'trivia')     return triviaCard(g, isMine, isPending, isDone, otherRole);
  if (g.type === 'pictionary') return pictionaryCard(g, isMine, isPending, isDone, otherRole);
  if (g.type === 'verofalso')  return veroFalsoCard(g, isMine, isPending, isDone, otherRole);
  return '';
}

/* ════════════════════════════════════════════════
   TRIVIA CARD
════════════════════════════════════════════════ */
function triviaCard(g, isMine, isPending, isDone, otherRole) {
  const canAnswer = !isMine && isPending;
  const ts = formatGameDate(g.createdAt);

  let statusLabel, statusClass;
  if (isDone)                    { statusLabel = 'Concluso';  statusClass = 'done'; }
  else if (canAnswer)            { statusLabel = 'Rispondi!'; statusClass = 'pending'; }
  else                           { statusLabel = 'In attesa'; statusClass = 'waiting'; }

  let bodyHtml = '';

  if (isDone) {
    const correctIdx = g.correctOption;
    const answerIdx  = g.answer;
    const correct    = answerIdx === correctIdx;
    const letters    = ['A','B','C','D'];
    bodyHtml = `
      <div class="trivia-options">
        ${(g.options||[]).map((opt,i) => `
          <div class="trivia-opt ${i===correctIdx?'correct':''}${i===answerIdx&&!correct?' wrong':''}" style="pointer-events:none">
            <span class="trivia-opt-letter">${letters[i]}</span>${esc(opt)}
          </div>`).join('')}
      </div>
      <div class="trivia-result ${correct?'correct-result':'wrong-result'}">
        ${correct
          ? `🎉 Esatto! +1 punto a ${esc(PEOPLE[g.answeredBy]||'')}`
          : `😅 Sbagliato. Risposta corretta: "${esc((g.options||[])[correctIdx]||'')}"`}
      </div>`;
  } else if (canAnswer) {
    const letters = ['A','B','C','D'];
    bodyHtml = `
      <div class="trivia-options">
        ${(g.options||[]).map((opt,i) => `
          <button class="trivia-opt" onclick="answerTrivia('${g.id}',${i})">
            <span class="trivia-opt-letter">${letters[i]}</span>${esc(opt)}
          </button>`).join('')}
      </div>`;
  } else if (isMine && isPending) {
    bodyHtml = `<div class="game-card-waiting">⏳ In attesa che ${esc(PEOPLE[otherRole])} risponda…</div>`;
  }

  return `
    <div class="game-card">
      <div class="game-card-meta">
        <span class="game-card-type">🧠 Trivia</span>
        <span class="game-card-by">${esc(PEOPLE[g.createdBy]||'')} · ${ts}</span>
        <span class="game-card-status ${statusClass}">${statusLabel}</span>
      </div>
      <div class="game-card-question">${esc(g.question)}</div>
      ${bodyHtml}
    </div>`;
}

/* ════════════════════════════════════════════════
   PICTIONARY CARD
════════════════════════════════════════════════ */
function pictionaryCard(g, isMine, isPending, isDone, otherRole) {
  const canGuess = !isMine && isPending && g.drawing;
  const ts = formatGameDate(g.createdAt);

  let statusLabel, statusClass;
  if (isDone)          { statusLabel = 'Concluso';  statusClass = 'done'; }
  else if (canGuess)   { statusLabel = 'Indovina!'; statusClass = 'pending'; }
  else                 { statusLabel = 'In attesa'; statusClass = 'waiting'; }

  let bodyHtml = '';

  if (isDone) {
    const correct = g.correct === true;
    bodyHtml = `
      ${g.drawing ? `<img class="pic-drawing" src="${g.drawing}" alt="disegno" style="margin-bottom:10px" />` : ''}
      <div class="trivia-result ${correct?'correct-result':'wrong-result'}">
        ${correct
          ? `🎉 Indovinato! Parola: "${esc(g.word)}" — +1 punto a ${esc(PEOPLE[g.answeredBy]||'')}`
          : `😅 Non indovinato. Parola: "${esc(g.word)}". Risposta: "${esc(g.guess||'')}"`}
      </div>`;
  } else if (canGuess) {
    bodyHtml = `
      ${g.drawing ? `<img class="pic-drawing" src="${g.drawing}" alt="disegno" style="margin-bottom:10px" />` : ''}
      <div class="pic-guess-wrap">
        <input class="pic-guess-input" type="text" id="guess-${g.id}" placeholder="Cos'è questo disegno?" autocomplete="off"
          onkeydown="if(event.key==='Enter')submitGuess('${g.id}')" />
        <button class="pic-guess-btn" onclick="submitGuess('${g.id}')">Invia</button>
      </div>`;
  } else if (isMine && isPending) {
    bodyHtml = `
      ${g.drawing ? `<img class="pic-drawing" src="${g.drawing}" alt="il tuo disegno" style="margin-bottom:10px" />` : ''}
      <div class="game-card-waiting">⏳ In attesa che ${esc(PEOPLE[otherRole])} indovini…</div>`;
  }

  return `
    <div class="game-card">
      <div class="game-card-meta">
        <span class="game-card-type">🎨 Pictionary</span>
        <span class="game-card-by">${esc(PEOPLE[g.createdBy]||'')} · ${ts}</span>
        <span class="game-card-status ${statusClass}">${statusLabel}</span>
      </div>
      ${bodyHtml}
    </div>`;
}

function formatGameDate(ts) {
  if (!ts) return '';
  const d = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
  return d.toLocaleDateString('it-IT', { day:'numeric', month:'short' });
}

/* ════════════════════════════════════════════════
   TRIVIA — CREATE
════════════════════════════════════════════════ */
function openTriviaModal() {
  document.getElementById('trivia-question').value = '';
  ['t-opt0','t-opt1','t-opt2','t-opt3'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const r = document.getElementById('tc0'); if (r) r.checked = true;
  document.getElementById('trivia-modal-overlay').style.display = 'flex';
  setTimeout(() => { const q = document.getElementById('trivia-question'); if(q) q.focus(); }, 80);
}

function closeTriviaModal() {
  document.getElementById('trivia-modal-overlay').style.display = 'none';
}

async function submitTrivia() {
  const question = document.getElementById('trivia-question').value.trim();
  const opts = [
    document.getElementById('t-opt0').value.trim(),
    document.getElementById('t-opt1').value.trim(),
    document.getElementById('t-opt2').value.trim(),
    document.getElementById('t-opt3').value.trim(),
  ];
  const radio = document.querySelector('input[name="trivia-correct"]:checked');
  const correctOpt = radio ? parseInt(radio.value) : 0;

  if (!question) { alert('Inserisci la domanda!'); return; }
  if (opts.filter(o => o).length < 2) { alert('Inserisci almeno 2 opzioni!'); return; }
  if (!opts[correctOpt]) { alert("L'opzione corretta non può essere vuota!"); return; }

  const btn = document.querySelector('#trivia-modal-overlay .btn-primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Invio…'; }

  try {
    await db.collection('couples').doc(COUPLE_ID).collection('games').add({
      type: 'trivia',
      question,
      options: opts,
      correctOption: correctOpt,
      createdBy: myRole,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    closeTriviaModal();
    activeGameTab = 'trivia';
    showPage('games');
  } catch(e) {
    alert('Errore: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✓ Invia sfida'; }
  }
}

/* ════════════════════════════════════════════════
   TRIVIA — ANSWER
════════════════════════════════════════════════ */
async function answerTrivia(gameId, optionIdx) {
  const game = gamesList.find(g => g.id === gameId);
  if (!game || game.status !== 'pending' || game.createdBy === myRole) return;

  const correct = optionIdx === game.correctOption;

  try {
    await db.collection('couples').doc(COUPLE_ID).collection('games').doc(gameId).update({
      status: 'done',
      answer: optionIdx,
      answeredBy: myRole,
      correct,
      answeredAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    if (correct) {
      const scores = (data._games && data._games.scores) || { lui:0, lei:0 };
      scores[myRole] = (scores[myRole] || 0) + 1;
      data._games = { ...data._games, scores };
      await pushData();
    }
  } catch(e) {
    alert('Errore: ' + e.message);
  }
}

/* ════════════════════════════════════════════════
   PICTIONARY — DRAW MODAL
════════════════════════════════════════════════ */
function openPicDrawModal() {
  currentPicWord = PIC_WORDS[Math.floor(Math.random() * PIC_WORDS.length)];
  document.getElementById('pic-draw-word').textContent = currentPicWord;
  document.getElementById('pic-draw-status').textContent = '';
  buildDrawToolbar();
  document.getElementById('pic-draw-modal-overlay').style.display = 'flex';
  setTimeout(() => initCanvas(), 60);
}

function closePicDrawModal() {
  document.getElementById('pic-draw-modal-overlay').style.display = 'none';
  teardownCanvas();
}

function buildDrawToolbar() {
  const colors = ['#7E57C2','#F48FB1','#81D4FA','#FFE082','#A5D6A7','#FF8A65','#FFFFFF','#111111'];
  const toolbar = document.getElementById('draw-toolbar');
  if (!toolbar) return;
  toolbar.innerHTML = `
    <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
      ${colors.map(c => `<button class="color-swatch ${c===drawColor?'active':''}" style="background:${c}"
        onclick="setDrawColor('${c}',this)" aria-label="${c}"></button>`).join('')}
      <span style="font-size:18px;margin-left:4px">🖌️</span>
      <input class="brush-slider" type="range" min="2" max="28" value="${drawBrush}"
        oninput="setDrawBrush(this.value)" style="width:80px" />
      <span id="brush-preview" style="width:${drawBrush}px;height:${drawBrush}px;border-radius:50%;
        background:${drawColor};display:inline-block;vertical-align:middle;flex-shrink:0;
        border:1px solid rgba(255,255,255,0.3)"></span>
    </div>
  `;
}

function setDrawColor(c, btn) {
  drawColor = c;
  document.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const bp = document.getElementById('brush-preview');
  if (bp) bp.style.background = c;
  if (drawCtx) drawCtx.strokeStyle = c;
}

function setDrawBrush(val) {
  drawBrush = parseInt(val);
  const bp = document.getElementById('brush-preview');
  if (bp) { bp.style.width = drawBrush+'px'; bp.style.height = drawBrush+'px'; }
  if (drawCtx) drawCtx.lineWidth = drawBrush;
}

function initCanvas() {
  drawCanvas = document.getElementById('draw-canvas');
  if (!drawCanvas) return;
  drawCtx = drawCanvas.getContext('2d');

  // Match canvas resolution to CSS display size
  const rect = drawCanvas.getBoundingClientRect();
  drawCanvas.width  = rect.width  || 520;
  drawCanvas.height = rect.height || 320;

  drawCtx.lineCap     = 'round';
  drawCtx.lineJoin    = 'round';
  drawCtx.strokeStyle = drawColor;
  drawCtx.lineWidth   = drawBrush;

  // White background for JPEG export
  drawCtx.fillStyle = '#ffffff';
  drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);

  drawHistory = [drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height)];

  drawCanvas.addEventListener('mousedown',  onDrawStart);
  drawCanvas.addEventListener('mousemove',  onDrawMove);
  drawCanvas.addEventListener('mouseup',    onDrawEnd);
  drawCanvas.addEventListener('mouseleave', onDrawEnd);
  drawCanvas.addEventListener('touchstart', onTouchStart, { passive:false });
  drawCanvas.addEventListener('touchmove',  onTouchMove,  { passive:false });
  drawCanvas.addEventListener('touchend',   onTouchEnd,   { passive:false });
}

function teardownCanvas() {
  if (!drawCanvas) return;
  drawCanvas.removeEventListener('mousedown',  onDrawStart);
  drawCanvas.removeEventListener('mousemove',  onDrawMove);
  drawCanvas.removeEventListener('mouseup',    onDrawEnd);
  drawCanvas.removeEventListener('mouseleave', onDrawEnd);
  drawCanvas.removeEventListener('touchstart', onTouchStart);
  drawCanvas.removeEventListener('touchmove',  onTouchMove);
  drawCanvas.removeEventListener('touchend',   onTouchEnd);
  drawHistory = [];
}

function getCanvasPos(e) {
  const rect = drawCanvas.getBoundingClientRect();
  const scaleX = drawCanvas.width  / rect.width;
  const scaleY = drawCanvas.height / rect.height;
  return { x:(e.clientX-rect.left)*scaleX, y:(e.clientY-rect.top)*scaleY };
}

function onDrawStart(e) {
  isDrawing = true;
  const p = getCanvasPos(e);
  drawCtx.beginPath();
  drawCtx.moveTo(p.x, p.y);
}
function onDrawMove(e) {
  if (!isDrawing) return;
  const p = getCanvasPos(e);
  drawCtx.lineTo(p.x, p.y);
  drawCtx.stroke();
}
function onDrawEnd() {
  if (!isDrawing) return;
  isDrawing = false;
  drawCtx.beginPath();
  drawHistory.push(drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height));
  if (drawHistory.length > 25) drawHistory.shift();
}

function onTouchStart(e) { e.preventDefault(); if (e.touches[0]) onDrawStart(e.touches[0]); }
function onTouchMove(e)  { e.preventDefault(); if (e.touches[0]) onDrawMove(e.touches[0]);  }
function onTouchEnd(e)   { e.preventDefault(); onDrawEnd(); }

function clearCanvas() {
  if (!drawCtx || !drawCanvas) return;
  drawCtx.fillStyle = '#ffffff';
  drawCtx.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
  drawHistory = [drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height)];
}

function undoCanvas() {
  if (!drawCtx || drawHistory.length < 2) return;
  drawHistory.pop();
  drawCtx.putImageData(drawHistory[drawHistory.length - 1], 0, 0);
}

/* ════════════════════════════════════════════════
   PICTIONARY — SUBMIT DRAWING
════════════════════════════════════════════════ */
async function submitDrawing() {
  if (!drawCanvas) return;
  const status = document.getElementById('pic-draw-status');
  const btn    = document.querySelector('#pic-draw-modal-overlay .draw-action-btn.primary');
  if (btn) { btn.disabled = true; btn.textContent = 'Invio…'; }
  if (status) status.textContent = 'Compressione…';

  try {
    const dataUrl = drawCanvas.toDataURL('image/jpeg', 0.65);
    if (status) status.textContent = 'Salvataggio…';

    await db.collection('couples').doc(COUPLE_ID).collection('games').add({
      type:      'pictionary',
      word:      currentPicWord,
      drawing:   dataUrl,
      createdBy: myRole,
      status:    'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    closePicDrawModal();
    activeGameTab = 'pictionary';
    showPage('games');
  } catch(e) {
    if (status) status.textContent = 'Errore: ' + e.message;
    if (btn) { btn.disabled = false; btn.textContent = '✓ Invia disegno'; }
  }
}

/* ════════════════════════════════════════════════
   PICTIONARY — GUESS
════════════════════════════════════════════════ */
async function submitGuess(gameId) {
  const game = gamesList.find(g => g.id === gameId);
  if (!game || game.status !== 'pending' || game.createdBy === myRole) return;

  const input = document.getElementById('guess-' + gameId);
  if (!input) return;
  const guess = input.value.trim();
  if (!guess) { input.focus(); return; }

  const correct = guess.toLowerCase() === (game.word || '').toLowerCase();

  try {
    await db.collection('couples').doc(COUPLE_ID).collection('games').doc(gameId).update({
      status:     'done',
      guess,
      answeredBy: myRole,
      correct,
      answeredAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    if (correct) {
      const scores = (data._games && data._games.scores) || { lui:0, lei:0 };
      scores[myRole] = (scores[myRole] || 0) + 1;
      data._games = { ...data._games, scores };
      await pushData();
    }
  } catch(e) {
    alert('Errore: ' + e.message);
  }
}

/* ════════════════════════════════════════════════
   VERO O FALSO — CARD
════════════════════════════════════════════════ */
function veroFalsoCard(g, isMine, isPending, isDone, otherRole) {
  const canAnswer = !isMine && isPending;
  const ts = formatGameDate(g.createdAt);

  let statusLabel, statusClass;
  if (isDone)        { statusLabel = 'Concluso';  statusClass = 'done'; }
  else if (canAnswer){ statusLabel = 'Rispondi!'; statusClass = 'pending'; }
  else               { statusLabel = 'In attesa'; statusClass = 'waiting'; }

  let bodyHtml = '';

  if (isDone) {
    const guessedRight = g.guess === g.answer;
    const answerLabel  = g.answer ? '✅ Vero' : '❌ Falso';
    const guessLabel   = g.guess  ? '✅ Vero' : '❌ Falso';
    bodyHtml = `
      <div class="vf-result-row">
        <span class="vf-result-item">Risposta vera: <b>${answerLabel}</b></span>
        <span class="vf-result-item">Ha detto: <b>${guessLabel}</b></span>
      </div>
      <div class="trivia-result ${guessedRight?'correct-result':'wrong-result'}">
        ${guessedRight
          ? `🎉 Indovinato! +1 punto a ${esc(PEOPLE[g.answeredBy]||'')}`
          : `😅 Sbagliato! La risposta era ${answerLabel}`}
      </div>`;
  } else if (canAnswer) {
    bodyHtml = `
      <div class="vf-btns">
        <button class="vf-btn vf-true"  onclick="answerVeroFalso('${g.id}',true)">✅ Vero</button>
        <button class="vf-btn vf-false" onclick="answerVeroFalso('${g.id}',false)">❌ Falso</button>
      </div>`;
  } else if (isMine && isPending) {
    bodyHtml = `<div class="game-card-waiting">⏳ In attesa che ${esc(PEOPLE[otherRole])} risponda…</div>`;
  }

  return `
    <div class="game-card">
      <div class="game-card-meta">
        <span class="game-card-type">❓ Vero o Falso</span>
        <span class="game-card-by">${esc(PEOPLE[g.createdBy]||'')} · ${ts}</span>
        <span class="game-card-status ${statusClass}">${statusLabel}</span>
      </div>
      <div class="game-card-question">${esc(g.statement)}</div>
      ${bodyHtml}
    </div>`;
}

/* ════════════════════════════════════════════════
   VERO O FALSO — CREATE
════════════════════════════════════════════════ */
function openVeroFalsoModal() {
  vfAnswer = true;
  const el = document.getElementById('vf-statement');
  if (el) el.value = '';
  document.getElementById('vf-pick-true').classList.add('active');
  document.getElementById('vf-pick-false').classList.remove('active');
  document.getElementById('vf-modal-overlay').style.display = 'flex';
  setTimeout(() => { const s = document.getElementById('vf-statement'); if(s) s.focus(); }, 80);
}

function closeVeroFalsoModal() {
  document.getElementById('vf-modal-overlay').style.display = 'none';
}

function setVfAnswer(val) {
  vfAnswer = val;
  document.getElementById('vf-pick-true').classList.toggle('active', val === true);
  document.getElementById('vf-pick-false').classList.toggle('active', val === false);
}

async function submitVeroFalso() {
  const statement = document.getElementById('vf-statement').value.trim();
  if (!statement) { alert("Inserisci un'affermazione!"); return; }

  const btn = document.querySelector('#vf-modal-overlay .btn-submit');
  if (btn) { btn.disabled = true; btn.textContent = 'Invio…'; }

  try {
    await db.collection('couples').doc(COUPLE_ID).collection('games').add({
      type:      'verofalso',
      statement,
      answer:    vfAnswer,
      createdBy: myRole,
      status:    'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    closeVeroFalsoModal();
    activeGameTab = 'verofalso';
    showPage('games');
  } catch(e) {
    alert('Errore: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Invia sfida'; }
  }
}

/* ════════════════════════════════════════════════
   VERO O FALSO — ANSWER
════════════════════════════════════════════════ */
async function answerVeroFalso(gameId, guess) {
  const game = gamesList.find(g => g.id === gameId);
  if (!game || game.status !== 'pending' || game.createdBy === myRole) return;

  const correct = guess === game.answer;

  try {
    await db.collection('couples').doc(COUPLE_ID).collection('games').doc(gameId).update({
      status:     'done',
      guess,
      answeredBy: myRole,
      correct,
      answeredAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    if (correct) {
      const scores2 = (data._games && data._games.scores) || { lui:0, lei:0 };
      scores2[myRole] = (scores2[myRole] || 0) + 1;
      data._games = { ...data._games, scores: scores2 };
      await pushData();
    }
  } catch(e) {
    alert('Errore: ' + e.message);
  }
}
