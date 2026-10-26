/* ═══════════════════════════════════════════════
   NOI DUE — Impostazioni
═══════════════════════════════════════════════ */
let installPrompt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; });

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

function renderImpostazioni() {
  const email = (auth.currentUser && auth.currentUser.email) || '';
  const row = (ic, title, sub, action, extra = '') => `<button class="set-row" onclick="${action}">
      <span class="set-ic">${icon(ic, 20)}</span>
      <span class="set-text"><b>${title}</b>${sub ? `<small>${sub}</small>` : ''}</span>
      ${extra || icon('chevR', 18, 'chev')}
    </button>`;

  let h = pageHead({ back:'oggi', eyebrow:`${esc(PEOPLE.lui)} & ${esc(PEOPLE.lei)}`, title:'Impostazioni' });

  h += `<section class="set-group">
    <h2 class="set-title">Voi due</h2>
    <div class="set-row static">
      <span class="set-ic">${icon('user', 20)}</span>
      <span class="set-text"><b>Su questo telefono sei</b><small>Serve per i bigliettini e i giochi</small></span>
    </div>
    <div class="seg full set-seg">
      <button class="${myRole === 'lui' ? 'on' : ''}" onclick="setMyRole('lui')">${esc(PEOPLE.lui)}</button>
      <button class="${myRole === 'lei' ? 'on' : ''}" onclick="setMyRole('lei')">${esc(PEOPLE.lei)}</button>
    </div>
    ${row('edit', 'Nomi', `${esc(PEOPLE.lui)} e ${esc(PEOPLE.lei)}`, 'openNamesSheet()')}
    ${row('userPlus', 'Collega un altro telefono', 'Link e codice del vostro spazio', 'openInviteSheet()')}
  </section>`;

  h += `<section class="set-group">
    <h2 class="set-title">I vostri dati</h2>
    <div class="set-note">${icon('shield', 18)}<span>Ogni giorno, alla prima apertura, Noi Due salva da solo una copia completa dei vostri dati. Potete anche scaricarne una sul telefono.</span></div>
    ${row('restore', 'Copie automatiche', 'Vedi le copie salvate e ripristina', 'openBackupsSheet()')}
    ${row('download', 'Scarica una copia', 'File con liste, ricordi, bigliettini, giochi e chat', 'exportBackup(this)')}
  </section>`;

  h += `<section class="set-group">
    <h2 class="set-title">App</h2>
    ${!isStandalone() ? row('home', 'Aggiungi alla schermata Home', 'Si apre a tutto schermo, come un\'app', 'openInstallSheet()') : ''}
    ${row('search', 'Cerca in tutto', '', 'openSearch()')}
  </section>`;

  h += `<section class="set-group">
    <h2 class="set-title">Account</h2>
    <div class="set-row static"><span class="set-ic">${icon('mail', 20)}</span><span class="set-text"><b>${esc(email || '—')}</b><small>Account con cui sei entrato</small></span></div>
    ${row('lock', 'Cambia password', 'Ti mandiamo un\'email per sceglierne una nuova', 'sendPasswordChange()')}
    ${row('logout', 'Esci', '', 'logout()', '')}
  </section>
  <p class="muted small center pad">Noi Due · spazio <code>${esc(COUPLE_ID)}</code></p>`;
  return h;
}

function openNamesSheet() {
  const el = openSheet(`<form class="form" id="names-form" novalidate>
    <h3 class="sheet-title">I vostri nomi</h3>
    <div class="grid2">
      <label class="field"><span>Lui</span><input class="input" name="lui" maxlength="20" value="${esc(PEOPLE.lui)}"></label>
      <label class="field"><span>Lei</span><input class="input" name="lei" maxlength="20" value="${esc(PEOPLE.lei)}"></label>
    </div>
    <div class="row-actions sticky"><button type="button" class="btn btn-ghost" onclick="closeTop()">Annulla</button><button class="btn btn-primary">Salva</button></div>
  </form>`, { cls:'sheet-form' });
  const f = el.querySelector('#names-form');
  f.addEventListener('submit', e => {
    e.preventDefault();
    const a = f.lui.value.trim(), b = f.lei.value.trim();
    closeTop();
    saveNames(a, b);
  });
}

function openInviteSheet() {
  const url = `${location.origin}${location.pathname}?code=${COUPLE_ID}`;
  const el = openSheet(`<div class="form">
    <h3 class="sheet-title">Collega un altro telefono</h3>
    <p class="muted">Apri questo link sull'altro telefono e accedi (o registrati): entrerà direttamente nel vostro spazio.</p>
    <div class="copy-box"><span class="ellipsis">${esc(url)}</span><button class="btn btn-primary sm" data-copy="${esc(url)}">${icon('copy', 16)} Copia</button></div>
    <p class="muted small">Oppure usa il codice dello spazio:</p>
    <div class="copy-box"><code>${esc(COUPLE_ID)}</code><button class="btn btn-ghost sm" data-copy="${esc(COUPLE_ID)}">${icon('copy', 16)} Copia</button></div>
    ${navigator.share ? `<button class="btn btn-cream wide" data-share>${icon('send', 18)} Condividi il link</button>` : ''}
  </div>`, { cls:'sheet-form' });
  el.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); toast('Copiato'); }
    catch (e) { toast('Copia non riuscita: tieni premuto sul testo'); }
  }));
  el.querySelector('[data-share]')?.addEventListener('click', () => navigator.share({ title:'Noi Due', text:'Entra nel nostro spazio', url }).catch(() => {}));
}

async function openBackupsSheet() {
  const el = openSheet(`<div class="form">
    <h3 class="sheet-title">Copie automatiche</h3>
    <p class="muted small">Ripristinare una copia riporta liste, ricordi, punteggi e nomi a quel giorno. Prima di farlo, salviamo comunque una copia dello stato attuale. Bigliettini e chat non vengono toccati.</p>
    <div class="backup-list"><div class="center pad"><span class="spinner"></span></div></div>
  </div>`, { cls:'sheet-tall' });
  const box = el.querySelector('.backup-list');
  try {
    const list = await listBackups();
    if (!list.length) { box.innerHTML = `<p class="muted center pad">Nessuna copia ancora: la prima viene creata oggi.</p>`; return; }
    box.innerHTML = list.map(b => `<div class="set-row static">
      <span class="set-ic">${icon(b._kind === 'auto' ? 'clock' : 'shield', 18)}</span>
      <span class="set-text"><b>${b._kind === 'auto' ? cap(fmtDate(b.id, { weekday:'short', day:'numeric', month:'long', year:'numeric' })) : 'Prima di un ripristino'}</b>
        <small>${new Date(b._backupAt).toLocaleString('it-IT', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })} · ${b._items ?? '?'} elementi · ${b._photos ?? '?'} ricordi</small></span>
      <button class="btn btn-ghost sm" data-restore="${esc(b.id)}">Ripristina</button>
    </div>`).join('');
    box.querySelectorAll('[data-restore]').forEach(btn => btn.addEventListener('click', async () => {
      const ok = await confirmSheet({ title:'Ripristinare questa copia?', text:'Le liste e i ricordi torneranno com\'erano in quel momento. Lo stato attuale viene salvato prima, quindi si può tornare indietro.', ok:'Ripristina' });
      if (!ok) return;
      try { await restoreBackup(btn.dataset.restore); closeAllLayers(() => toast('Copia ripristinata')); }
      catch (e) { toast('Ripristino non riuscito: ' + e.message); }
    }));
  } catch (e) {
    box.innerHTML = `<p class="muted center pad">Non riesco a leggere le copie (${esc(e.message)}).</p>`;
  }
}

function openInstallSheet() {
  if (installPrompt) {
    installPrompt.prompt();
    installPrompt.userChoice.finally(() => { installPrompt = null; });
    return;
  }
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  openSheet(`<div class="form">
    <h3 class="sheet-title">Noi Due sulla schermata Home</h3>
    ${ios
      ? `<ol class="steps"><li>Apri il sito con <b>Safari</b></li><li>Tocca il tasto <b>Condividi</b> (il quadrato con la freccia)</li><li>Scegli <b>Aggiungi alla schermata Home</b></li></ol>`
      : `<ol class="steps"><li>Apri il menu del browser (i tre puntini)</li><li>Scegli <b>Installa app</b> o <b>Aggiungi a schermata Home</b></li></ol>`}
    <p class="muted small">Da lì si apre a tutto schermo e resti sempre connesso.</p>
  </div>`, { cls:'sheet-small' });
}

async function sendPasswordChange() {
  const email = auth.currentUser && auth.currentUser.email;
  if (!email) return;
  try { await auth.sendPasswordResetEmail(email); toast(`Email inviata a ${email}`); }
  catch (e) { toast(authErrorMessage(e)); }
}
