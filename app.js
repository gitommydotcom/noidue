/* ═══════════════════════════════════════════════
   FIREBASE CONFIG
═══════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey: "AIzaSyDPoiUbg2goDaHjpz5tgNPEXXLuzWJmzcM",
  authDomain: "noi-due-c4940.firebaseapp.com",
  projectId: "noi-due-c4940",
  storageBucket: "noi-due-c4940.firebasestorage.app",
  messagingSenderId: "346277614319",
  appId: "1:346277614319:web:42ffeb68c48f1ec5be411a"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});

/* ═══════════════════════════════════════════════
   SEZIONI
═══════════════════════════════════════════════ */
const SECTIONS = {
  places:       { label:'Posti',        icon:'📍', showMap:true,  showRating:true,  recurring:false, cats:['🏙️ Città','🌿 Natura','🎨 Museo & Cultura','🏖️ Mare & Spiaggia','⛰️ Montagna','🏘️ Borgo medievale','🌃 Vita notturna','🎡 Parco & Giardino','🏛️ Sito storico','🛤️ Sentiero & Trekking','🎭 Teatro & Spettacolo','🍷 Cantina & Degustazione','🌋 Paesaggio naturale'] },
  trips:        { label:'Viaggi',       icon:'✈️', showMap:true,  showRating:true,  recurring:false, cats:['🇮🇹 Italia','🇪🇺 Europa','🌍 Fuori Europa','🚗 Road trip','🚂 In treno','🏕️ Camping','🛥️ Crociera','✈️ Lungo raggio','🚲 In bici','🥾 Trekking','🌊 Mare & Isole','🏔️ Montagna & Neve','🏙️ City break','🎒 Zaino in spalla','🚐 Camper','💑 Romantico'] },
  movies:       { label:'Film & Serie', icon:'🎬', showMap:false, showRating:true,  recurring:false, cats:['🎬 Film','📺 Serie TV','📽️ Documentario','🎭 Animazione','😂 Commedia','😱 Horror','💕 Romantico','🔍 Thriller & Giallo','🚀 Fantascienza','🧙 Fantasy','🥊 Azione','🎸 Musical','🕵️ Crime','🌍 Storico','🎞️ Classico','🇯🇵 Anime','🇰🇷 K-drama'] },
  books:        { label:'Libri',        icon:'📚', showMap:false, showRating:true,  recurring:false, cats:['📖 Romanzo','🔍 Giallo & Noir','💭 Saggio','🧪 Fantascienza','❤️ Romance','🎨 Graphic novel','📰 Biografia','🌍 Storico','🧘 Crescita personale','🧙 Fantasy','😂 Umorismo','🌿 Natura & Viaggi','🕵️ Thriller','🎭 Classico','💡 Filosofia'] },
  restaurants:  { label:'Ristoranti',   icon:'🍽️', showMap:true,  showRating:true,  recurring:false, cats:['🍕 Italiano','🍣 Giapponese','🌮 Messicano','🥘 Etnico','🍔 Burger & Fast casual','🍷 Fine dining','🥂 Cocktail bar','☕ Caffè & Brunch','🍦 Gelateria','🥐 Pasticceria','🍜 Asiatico','🌿 Vegetariano','🍖 Grill & BBQ','🐟 Pesce'] },
  projects:     { label:'Progetti',     icon:'🛠️', showMap:false, showRating:false, recurring:false, cats:['🏠 Casa & Arredo','🎨 Creativo','💻 Tech','🌿 Giardino','📚 Studio','💪 Sport','🍳 Cucina','✈️ Viaggio','🎉 Evento','💰 Finanza','🎭 Cultura','🐾 Animali','🤝 Volontariato','🌱 Sostenibilità'] },
  dreams:       { label:'Sogni',        icon:'💭', showMap:false, showRating:false, recurring:false, cats:['✈️ Viaggio dei sogni','🏠 Casa ideale','💼 Carriera','❤️ Famiglia','🎨 Creatività','💪 Salute','📚 Cultura','💰 Libertà finanziaria','🌍 Impatto','🎉 Esperienze','🌟 Traguardi','🤝 Comunità','🎭 Avventure','🌿 Stile di vita'] },
  anniversaries:{ label:'Date',         icon:'🎂', showMap:true,  showRating:false, recurring:true,  cats:['💑 Anniversario','🎂 Compleanno','🎉 Festa','⭐ Momento speciale','💒 Matrimonio','🥂 Ricorrenza','🌹 Primo appuntamento','💌 Primo bacio','🏠 Prima casa','✈️ Primo viaggio','🎓 Laurea','🌟 Giorno speciale','🕯️ Ricordo'] },
};

/* ═══════════════════════════════════════════════
   STATO GLOBALE
═══════════════════════════════════════════════ */
let COUPLE_ID = '';
let myRole    = 'lei';
let joinRole  = 'lei';
let PEOPLE    = { lui:'Lui', lei:'Lei' };

let data = { _gallery:[], _games:{ scores:{lui:0,lei:0} } };
Object.keys(SECTIONS).forEach(s => data[s] = []);

let chatMessages = [];
let gamesList    = [];

let dataLoaded = false;
let isSaving   = false;

// UI state
let currentSection = null, currentEditId = null, currentWho = null;
let selectedCats = {}, currentRating = {}, activeFilter = {}, viewMode = {};
Object.keys(SECTIONS).forEach(s => { selectedCats[s]=[]; currentRating[s]=0; activeFilter[s]=null; viewMode[s]='grid'; });

// Gallery state
let galleryEditIdx = null, gImgFileData = '';
let heroItems = [], heroSlideIndex = 0, heroTimer = null, heroBuilt = false, heroGalleryCount = 0;
let gfsIndex = 0, focalPoint = {x:50,y:50}, focalDragging = false;
let gallerySortBy = 'postDate';      // postDate | uploadDate
let gallerySortReverse = false;      // false: newest first, true: oldest first
const GALLERY_SORT_LS_KEY = 'nd_gallery_sort_v1';

// Emoji picker state
let emojiPickerTarget = null; // { msgId }
let emojiCurrentCat   = 0;

// Listeners
let mainUnsub = null, chatUnsub = null, gamesUnsub = null;
let heroShownThisSession = false;

/* ═══════════════════════════════════════════════
   EMOJI DATA
═══════════════════════════════════════════════ */
const EMOJI_CATS = [
  { label:'😀', name:'Faccine', keys:['faccia','viso','emozione','felice','triste','ridere','piangere','arrabbiato','paura','sorpresa','sorriso','pianto','amore','occhiali','robot','fantasma','diavolo'], emojis:['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','🥱','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','🥴','😠','😡','🤬','😷','🤒','🤕','🤢','🤮','🤧','😇','🥳','🥸','🤠','🤡','🥺','🤥','🤫','🤭','🧐','😈','👿','👹','👺','💀','👻','👽','👾','🤖'] },
  { label:'❤️', name:'Amore',   keys:['cuore','amore','bacio','romantico','coppia','kiss','heart','rosso','innamorato'], emojis:['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💕','💞','💓','💗','💖','💘','💝','💟','❣️','💔','❤️‍🔥','❤️‍🩹','💋','💌','🫶','💏','💑','👫','😍','🥰','😘','💌'] },
  { label:'👋', name:'Gesti',   keys:['mano','gesto','pollice','saluto','applauso','prego','muscolo','forza','sos','ok'], emojis:['👋','🤚','🖐️','✋','🖖','🤙','💪','🦾','✌️','🤞','🤟','🤘','🤙','👌','🤌','🤏','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🙏','✍️','💅','🤳','🦶','🦵','👃','👂','🫦','🤜','🤛','🤝'] },
  { label:'🌸', name:'Natura',  keys:['fiore','albero','pianta','sole','luna','neve','pioggia','fuoco','fulmine','acqua','vento','arcobaleno','farfalla','ape','animale','foresta','montagna','mare'], emojis:['🌸','🌺','🌹','🌷','🌻','🌼','💐','🪷','🌱','🌿','🍀','🍃','🍂','🍁','🍄','🌾','🌵','🌴','🌳','🌲','🪨','🌊','🌈','☀️','🌤️','⛅','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','💨','🌬️','🌀','🌪️','⚡','🔥','💧','💦','🌙','⭐','🌟','💫','✨','☄️','🌍','🌑','🦋','🐝','🦅'] },
  { label:'🍕', name:'Cibo',    keys:['mangiare','bere','pizza','pasta','sushi','dolce','torta','gelato','frutta','verdura','vino','birra','caffe','pranzo','cena','colazione','cucina','drink'], emojis:['🍕','🍝','🍣','🍜','🍔','🌮','🌯','🥙','🥚','🍳','🥘','🍲','🥗','🍿','🧈','🥞','🧇','🥓','🍱','🍛','🍠','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍩','🍪','🌰','🍞','🥐','🥖','🧀','🍷','🍾','🥂','🍻','🍺','🧃','🥤','☕','🍵','🧋','🫖'] },
  { label:'⚽', name:'Sport',   keys:['sport','calcio','basket','tennis','nuoto','musica','gioco','pallone','giocare','allenamento','danza','arte'], emojis:['⚽','🏀','🏈','⚾','🥎','🏐','🏉','🥏','🎾','🪃','🏓','🏸','🥊','🥋','🎽','🛹','⛸️','🤸','🏊','🚴','🧘','🏋️','🤼','🤺','🎯','🎱','🎮','🕹️','🎲','🎭','🎨','🎬','🎤','🎵','🎶','🎸','🎹','🎺','🎻','🥁','🪘','🎷','🎙️'] },
  { label:'✈️', name:'Viaggi',  keys:['viaggio','aereo','treno','macchina','barca','vacanza','spiaggia','castello','mappa','valigia','trasporto','giro','tour'], emojis:['✈️','🚀','🛸','🚁','🛻','🚗','🚕','🚙','🏎️','🚓','🚑','🚒','🚌','🚎','🏍️','🛵','🚲','🛴','🚄','🚅','🚆','🚇','🚊','🚝','🚞','🚋','🚃','🚢','⛴️','🛥️','🚤','⛵','🚣','🛶','🏖️','🏝️','🗺️','🧳','⛺','🏕️','🗼','🏰','🏯','🗽','🗿'] },
  { label:'💡', name:'Oggetti', keys:['oggetto','chiave','telefono','computer','soldi','attrezzo','lucchetto','fotocamera','luce','candela','telefonino'], emojis:['💡','🔦','🕯️','🧯','💰','💵','💳','💎','⚖️','🔧','🪛','🔨','⚒️','🛠️','🪚','🔩','🪤','🧲','🔑','🗝️','🔓','🔐','🔒','📱','💻','⌨️','🖥️','🖨️','🖱️','📷','📸','📹','📺','📻','🎙️','🔋','🔌','💾','💿','📀','📡','🔭','🔬','📞','📟','📠'] },
  { label:'🎉', name:'Simboli', keys:['festa','regalo','trofeo','palloncino','fuochi','segno','numero','colore','simbolo','celebrazione','vincere','premio'], emojis:['🎉','🎊','🎈','🎁','🎀','🪄','🔮','💈','🏆','🥇','🥈','🥉','🎖️','🎗️','🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🖼️','🎠','🎡','🎢','💝','✨','🌟','⚡','🔥','❓','❗','💯','🆗','🆙','🆒','🆕','🆓','🔝','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','♥️','♦️','♣️','♠️'] },
];

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
window.onload = () => {
  loadGallerySortPrefs();
  const p = new URLSearchParams(location.search);
  const code = p.get('code');
  if (code) {
    const jc = document.getElementById('join-code');
    if (jc) jc.value = code;
  }

  showLoading(true, 'Connessione...');
  auth.onAuthStateChanged(async user => {
    if (!user) {
      hideAllScreens();
      document.getElementById('auth-screen').style.display = 'flex';
      showLoading(false);
      return;
    }
    try {
      await routeAfterLogin(user);
    } catch(e) {
      console.error(e);
      showAuthErr('Errore: ' + (e.message || 'riprova'));
      hideAllScreens();
      document.getElementById('auth-screen').style.display = 'flex';
    }
    showLoading(false);
  });
};

function hideAllScreens() {
  ['auth-screen','setup-screen','app-screen'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

async function routeAfterLogin(user) {
  // 1. Try user profile doc → has coupleId + role?
  let coupleId = null;
  try {
    const uSnap = await db.collection('users').doc(user.uid).get();
    if (uSnap.exists) {
      const ud = uSnap.data();
      if (ud.coupleId) coupleId = ud.coupleId;
      if (ud.role === 'lui' || ud.role === 'lei') myRole = ud.role;
    }
  } catch(e) {}

  // 2. Fallback: localStorage from old version
  if (!coupleId) {
    const saved = localStorage.getItem('noidueFirebase');
    if (saved) {
      try {
        const c = JSON.parse(saved);
        if (c.id) {
          coupleId = c.id;
          if (c.r) myRole = c.r;
          if (c.p) PEOPLE = c.p;
        }
      } catch(e) {}
    }
  }

  if (!coupleId) {
    // Brand new user — show setup
    hideAllScreens();
    document.getElementById('setup-screen').style.display = 'flex';
    return;
  }

  // Try claim/load existing couple
  COUPLE_ID = coupleId;
  const ok = await ensureMembership(user.uid);
  if (!ok) {
    // Couple doesn't exist or full — show setup, clear stored id
    COUPLE_ID = '';
    localStorage.removeItem('noidueFirebase');
    hideAllScreens();
    document.getElementById('setup-screen').style.display = 'flex';
    return;
  }

  // Linked successfully — save user→couple mapping for next time
  try {
    await db.collection('users').doc(user.uid).set({ coupleId: COUPLE_ID, role: myRole }, { merge:true });
  } catch(e) {}
  saveSession();
  hideAllScreens();
  startApp();
}

// Reads couples/{COUPLE_ID}, ensures my uid is in _members. Returns true if membership ok.
async function ensureMembership(uid) {
  const ref = db.collection('couples').doc(COUPLE_ID);
  const snap = await ref.get();
  if (!snap.exists) return false;
  const d = snap.data();
  const members = Array.isArray(d._members) ? d._members : [];
  if (members.includes(uid)) return true;
  if (members.length >= 2) return false; // full
  // add self
  await ref.update({ _members: firebase.firestore.FieldValue.arrayUnion(uid) });
  return true;
}

window.addEventListener('resize', () => {
  const heroEl = document.getElementById('gallery-hero');
  if(!heroEl || !heroEl.classList.contains('has-photos')) return;
  if(window.innerWidth <= 720) {
    const top = heroEl.getBoundingClientRect().top;
    heroEl.style.height = Math.max(220, window.innerHeight - top - 52) + 'px';
  } else {
    heroEl.style.height = '';
  }
});

/* ═══════════════════════════════════════════════
   SETUP
═══════════════════════════════════════════════ */
function genCoupleId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'nd-';
  for (let i=0;i<8;i++) id += chars[Math.floor(Math.random()*chars.length)];
  return id;
}

async function createCouple() {
  const user = auth.currentUser;
  if (!user) { showErr('Devi prima accedere.'); return; }
  const nameLui = document.getElementById('name-lui').value.trim() || 'Lui';
  const nameLei = document.getElementById('name-lei').value.trim() || 'Lei';
  PEOPLE = { lui: nameLui, lei: nameLei };
  COUPLE_ID = genCoupleId();
  myRole = 'lui';
  showLoading(true, 'Creazione spazio...');
  try {
    const initial = {};
    Object.keys(SECTIONS).forEach(s => initial[s] = []);
    initial._gallery = [];
    initial._games   = { scores: { lui:0, lei:0 } };
    initial._people  = PEOPLE;
    initial._members = [user.uid];
    await db.collection('couples').doc(COUPLE_ID).set(initial);
    await db.collection('users').doc(user.uid).set({ coupleId: COUPLE_ID, role: myRole }, { merge:true });
    saveSession();
    hideAllScreens();
    startApp();
  } catch(e) {
    showErr('Errore di rete. Riprova.');
    COUPLE_ID = '';
  }
  showLoading(false);
}

async function joinCouple() {
  const user = auth.currentUser;
  if (!user) { showErr('Devi prima accedere.'); return; }
  const code = document.getElementById('join-code').value.trim().toLowerCase();
  if (!code) { showErr('Inserisci il codice coppia!'); return; }
  COUPLE_ID = code; myRole = joinRole;
  showLoading(true, 'Connessione...');
  try {
    const snap = await db.collection('couples').doc(COUPLE_ID).get();
    if (!snap.exists) { showErr('Codice non trovato.'); COUPLE_ID=''; showLoading(false); return; }
    const d = snap.data();
    const members = Array.isArray(d._members) ? d._members : [];
    if (!members.includes(user.uid)) {
      if (members.length >= 2) {
        showErr('Spazio già pieno (2 membri).'); COUPLE_ID=''; showLoading(false); return;
      }
      await db.collection('couples').doc(COUPLE_ID).update({
        _members: firebase.firestore.FieldValue.arrayUnion(user.uid)
      });
    }
    if (d._people) PEOPLE = d._people;
    await db.collection('users').doc(user.uid).set({ coupleId: COUPLE_ID, role: myRole }, { merge:true });
    saveSession();
    hideAllScreens();
    startApp();
  } catch(e) {
    showErr('Connessione fallita. Riprova.');
    COUPLE_ID = '';
  }
  showLoading(false);
}

/* ═══════════════════════════════════════════════
   AUTH UI
═══════════════════════════════════════════════ */
function switchAuthTab(which) {
  document.getElementById('auth-tab-login').classList.toggle('active', which==='login');
  document.getElementById('auth-tab-signup').classList.toggle('active', which==='signup');
  document.getElementById('auth-panel-login').classList.toggle('active', which==='login');
  document.getElementById('auth-panel-signup').classList.toggle('active', which==='signup');
  showAuthErr('');
}

function showAuthErr(m) {
  const e = document.getElementById('auth-error');
  if (!e) return;
  e.textContent = m || '';
  if (m) setTimeout(()=>{ if(e.textContent===m) e.textContent=''; }, 6000);
}

function authErrorMessage(e) {
  const code = (e && e.code) || '';
  if (code === 'auth/invalid-email')          return 'Email non valida.';
  if (code === 'auth/missing-password')       return 'Inserisci la password.';
  if (code === 'auth/weak-password')          return 'Password troppo corta (min 6 caratteri).';
  if (code === 'auth/email-already-in-use')   return 'Email già registrata. Prova ad accedere.';
  if (code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential' ||
      code === 'auth/invalid-login-credentials') return 'Email o password errate.';
  if (code === 'auth/user-not-found')         return 'Nessun account con questa email.';
  if (code === 'auth/too-many-requests')      return 'Troppi tentativi. Riprova tra poco.';
  if (code === 'auth/network-request-failed') return 'Connessione assente.';
  return e.message || 'Errore. Riprova.';
}

async function doSignup() {
  const email = document.getElementById('signup-email').value.trim();
  const pw    = document.getElementById('signup-password').value;
  if (!email || !pw) { showAuthErr('Email e password obbligatorie.'); return; }
  showLoading(true, 'Creazione account...');
  try {
    await auth.createUserWithEmailAndPassword(email, pw);
    // onAuthStateChanged routes the rest
  } catch(e) {
    showAuthErr(authErrorMessage(e));
    showLoading(false);
  }
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pw    = document.getElementById('login-password').value;
  if (!email || !pw) { showAuthErr('Email e password obbligatorie.'); return; }
  showLoading(true, 'Accesso...');
  try {
    await auth.signInWithEmailAndPassword(email, pw);
  } catch(e) {
    showAuthErr(authErrorMessage(e));
    showLoading(false);
  }
}

async function doResetPassword() {
  const email = document.getElementById('login-email').value.trim();
  if (!email) { showAuthErr('Inserisci la tua email qui sopra, poi clicca di nuovo.'); return; }
  try {
    await auth.sendPasswordResetEmail(email);
    showAuthErr('✓ Email di recupero inviata a ' + email);
  } catch(e) {
    showAuthErr(authErrorMessage(e));
  }
}

function saveSession() {
  localStorage.setItem('noidueFirebase', JSON.stringify({ id:COUPLE_ID, r:myRole, p:PEOPLE }));
}

function setJoinRole(role) {
  joinRole = role;
  document.getElementById('join-role-lui').className = 'who-btn' + (role==='lui'?' active-lui':'');
  document.getElementById('join-role-lei').className = 'who-btn' + (role==='lei'?' active-lei':'');
}

function setMyRole(role) {
  myRole = role; saveSession(); updateRoleUI();
  const user = auth.currentUser;
  if (user) {
    db.collection('users').doc(user.uid).set({ role }, { merge:true }).catch(()=>{});
  }
  const msg = document.getElementById('role-msg');
  msg.textContent = `✓ Sei ${PEOPLE[role]}`;
  setTimeout(() => msg.textContent='', 2500);
}

function updateRoleUI() {
  const btnLui = document.getElementById('settings-role-lui');
  const btnLei = document.getElementById('settings-role-lei');
  if(btnLui) btnLui.className = 'who-btn' + (myRole==='lui'?' active-lui':'');
  if(btnLei) btnLei.className = 'who-btn' + (myRole==='lei'?' active-lei':'');
  const ll = document.getElementById('settings-role-lbl-lui'); if(ll) ll.textContent = PEOPLE.lui;
  const le = document.getElementById('settings-role-lbl-lei'); if(le) le.textContent = PEOPLE.lei;
}

function logout() {
  if (mainUnsub) mainUnsub(); if (chatUnsub) chatUnsub(); if (gamesUnsub) gamesUnsub();
  mainUnsub = chatUnsub = gamesUnsub = null;
  localStorage.removeItem('noidueFirebase');
  COUPLE_ID=''; dataLoaded=false;
  Object.keys(SECTIONS).forEach(s => data[s]=[]);
  data._gallery=[]; data._games={scores:{lui:0,lei:0}};
  chatMessages=[]; gamesList=[];
  heroBuilt=false; heroGalleryCount=0;
  auth.signOut().catch(()=>{});
  // onAuthStateChanged will route to auth screen
  hideAllScreens();
  document.getElementById('auth-screen').style.display='flex';
}

function showErr(m) { const e=document.getElementById('setup-error'); e.textContent=m; setTimeout(()=>e.textContent='',5000); }
function showLoading(v, m='') { const o=document.getElementById('loading-overlay'); o.style.display=v?'flex':'none'; if(m) document.getElementById('loading-msg').textContent=m; }

/* ═══════════════════════════════════════════════
   START APP + FIRESTORE LISTENERS
═══════════════════════════════════════════════ */
function startApp() {
  document.getElementById('setup-screen').style.display='none';
  document.getElementById('app-screen').style.display='block';
  // Pre-open hero pre-screen as black cover so home doesn't flash before data arrives
  if (!heroShownThisSession) {
    const heroEl = document.getElementById('hero-screen');
    if (heroEl) {
      heroEl.classList.add('open');
      const stories = document.getElementById('hero-stories');
      if (stories) stories.innerHTML = '';
      document.body.style.overflow = 'hidden';
    }
  }
  applyNames();
  updateShareLink();
  loadCloudNameUI();
  setSyncStatus('saving','Connessione...');
  startListeners();
}

function startListeners() {
  // 1. Main data listener
  mainUnsub = db.collection('couples').doc(COUPLE_ID).onSnapshot(snap => {
    if (!snap.exists) return;
    const d = snap.data();
    Object.keys(SECTIONS).forEach(s => { data[s] = d[s] || []; });
    data._gallery = d._gallery || [];
    data._games   = d._games   || { scores:{lui:0,lei:0} };
    if (d._people) { PEOPLE = d._people; applyNames(); saveSession(); }
    dataLoaded = true;
    setSyncStatus('live','Sincronizzato ✓');
    renderAll();
    if (!heroShownThisSession) {
      heroShownThisSession = true;
      showHeroScreen();
    }
  }, err => {
    setSyncStatus('err','Connessione persa...');
  });

  // 2. Messages listener (subcollection, ordered by ts)
  chatUnsub = db.collection('couples').doc(COUPLE_ID).collection('messages')
    .orderBy('ts','asc').limitToLast(100)
    .onSnapshot(snap => {
      chatMessages = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      renderChat();
    }, () => {});

  // 3. Games listener
  let _prevGames = null;
  gamesUnsub = db.collection('couples').doc(COUPLE_ID).collection('games')
    .orderBy('createdAt','desc').limit(30)
    .onSnapshot(snap => {
      const newList = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      if (_prevGames !== null) {
        newList.forEach(g => {
          if (g.status === 'done' && g.answeredBy && g.answeredBy !== myRole) {
            const prev = _prevGames.find(p => p.id === g.id);
            if (prev && prev.status === 'pending') {
              const who = PEOPLE[g.answeredBy] || g.answeredBy;
              const type = g.type === 'trivia' ? 'Trivia' : g.type === 'pictionary' ? 'Pictionary' : 'Vero o Falso';
              showToast(`${who} ha risposto alla sfida di ${type}! 🎉`);
            }
          }
        });
      }
      _prevGames = newList;
      gamesList = newList;
      renderGamesIfVisible();
      updateGamesBadge();
    }, () => {});
}

async function pushData() {
  if (!dataLoaded || isSaving) return;
  isSaving = true; setSyncStatus('saving','Salvataggio...');
  try {
    const payload = {};
    Object.keys(SECTIONS).forEach(s => payload[s] = data[s] || []);
    payload._gallery = data._gallery || [];
    payload._games   = data._games   || { scores:{lui:0,lei:0} };
    payload._people  = PEOPLE;
    await db.collection('couples').doc(COUPLE_ID).update(payload);
    setSyncStatus('live','Sincronizzato ✓');
  } catch(e) { setSyncStatus('err','Errore salvataggio'); }
  isSaving = false;
}

function setSyncStatus(s, l) {
  ['sync-dot','sync-dot-m'].forEach(id => {
    const d=document.getElementById(id); if(!d) return;
    d.className='sync-dot';
    if(s==='live')   d.classList.add('live');
    if(s==='saving') d.classList.add('saving');
    if(s==='err')    d.classList.add('err');
  });
  const lbl=document.getElementById('sync-label'); if(lbl) lbl.textContent=l;
}

/* ═══════════════════════════════════════════════
   NOMI & CONDIVISIONE
═══════════════════════════════════════════════ */
function applyNames() {
  const sub=document.getElementById('sidebar-subtitle'); if(sub) sub.textContent=`${PEOPLE.lui} & ${PEOPLE.lei}`;
  const wll=document.getElementById('who-lbl-lui'); if(wll) wll.textContent=PEOPLE.lui;
  const wle=document.getElementById('who-lbl-lei'); if(wle) wle.textContent=PEOPLE.lei;
  const snl=document.getElementById('settings-name-lui'); if(snl) snl.value=PEOPLE.lui;
  const sne=document.getElementById('settings-name-lei'); if(sne) sne.value=PEOPLE.lei;
  const jrl=document.getElementById('join-role-lui'); if(jrl) jrl.innerHTML=`💙 ${PEOPLE.lui}`;
  const jre=document.getElementById('join-role-lei'); if(jre) jre.innerHTML=`🩷 ${PEOPLE.lei}`;
  updateRoleUI();
}

function saveNames() {
  const nl=document.getElementById('settings-name-lui').value.trim()||'Lui';
  const ne=document.getElementById('settings-name-lei').value.trim()||'Lei';
  PEOPLE={lui:nl,lei:ne}; applyNames(); saveSession(); pushData();
  const msg=document.getElementById('names-msg');
  msg.textContent='✓ Nomi aggiornati'; setTimeout(()=>msg.textContent='',2500);
}

function updateShareLink() {
  const url=`${location.origin}${location.pathname}?code=${COUPLE_ID}`;
  const el=document.getElementById('share-link'); if(el) el.value=url;
}

function copyLink() {
  const el=document.getElementById('share-link'); if(!el) return;
  navigator.clipboard.writeText(el.value).catch(()=>{el.select();document.execCommand('copy');});
  const m=document.getElementById('copy-msg'); m.textContent='✓ Link copiato!'; setTimeout(()=>m.textContent='',2500);
}

function loadCloudNameUI() {
  const cn=localStorage.getItem('cloudName')||'';
  const el=document.getElementById('cloudname-input'); if(el) el.value=cn;
}

function saveCloudName() {
  const v=document.getElementById('cloudname-input').value.trim();
  localStorage.setItem('cloudName',v);
  const m=document.getElementById('cloudname-msg'); m.textContent='✓ Cloud name salvato'; setTimeout(()=>m.textContent='',2500);
}

function exportBackup() {
  const backup = { ...data, _chat: chatMessages, _gamesList: gamesList };
  const json=JSON.stringify(backup,null,2);
  const blob=new Blob([json],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download='noidue_backup_'+new Date().toISOString().slice(0,10)+'.json';
  a.click(); URL.revokeObjectURL(a.href);
}

/* ═══════════════════════════════════════════════
   MIGRAZIONE DA JSONBIN
═══════════════════════════════════════════════ */
async function migrateFromJsonBin() {
  const binId = document.getElementById('mig-bin').value.trim();
  const apiKey = document.getElementById('mig-key').value.trim();
  if (!binId) { setMigMsg('Inserisci il BIN ID!','var(--lei)'); return; }
  if (!dataLoaded) { setMigMsg('Attendi il caricamento dell\'app...','var(--lei)'); return; }

  const prog = document.getElementById('mig-progress');
  const fill  = document.getElementById('mig-progress-fill');
  prog.style.display = 'block'; fill.style.width='10%';
  setMigMsg('Recupero dati da JSONBin...','var(--text-dim)');

  try {
    const h = {}; if(apiKey) h['X-Master-Key'] = apiKey;
    const r = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`,{headers:h});
    if(!r.ok) throw new Error('BIN non trovato o accesso negato');
    const j = await r.json();
    const remote = j.record;
    fill.style.width='40%';

    // Migra sezioni
    Object.keys(SECTIONS).forEach(s => {
      if (remote[s] && Array.isArray(remote[s])) {
        data[s] = remote[s];
      }
    });
    if(remote._gallery) data._gallery = remote._gallery;
    if(remote._people)  PEOPLE = remote._people;
    fill.style.width='70%';

    // Migra messaggi vecchi come chat
    if(remote._messages) {
      const msgs = remote._messages;
      const migMsgs = [];
      if(msgs.lui) migMsgs.push({ who:'lui', text:msgs.lui, ts:msgs.luiTs||Date.now()-2000, reactions:{} });
      if(msgs.lei) migMsgs.push({ who:'lei', text:msgs.lei, ts:msgs.leiTs||Date.now()-1000, reactions:{} });
      for (const m of migMsgs) {
        await db.collection('couples').doc(COUPLE_ID).collection('messages').add(m);
      }
    }
    fill.style.width='90%';

    await pushData();
    applyNames(); saveSession();
    fill.style.width='100%';
    setMigMsg('✓ Migrazione completata! Tutti i dati sono stati importati.','var(--green)');
  } catch(e) {
    setMigMsg('Errore: '+e.message,'var(--lei)');
  }
  setTimeout(()=>{ prog.style.display='none'; fill.style.width='0%'; },3000);
}

function setMigMsg(t,c) {
  const el=document.getElementById('mig-msg'); if(el){ el.textContent=t; el.style.color=c; }
}

/* ═══════════════════════════════════════════════
   NAVIGAZIONE
═══════════════════════════════════════════════ */
function showPage(p) {
  const alreadyActive = document.getElementById('page-'+p)?.classList.contains('active');
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  const pg=document.getElementById('page-'+p); if(pg) pg.classList.add('active');
  const ni=document.querySelector(`.nav-item[data-page="${p}"]`); if(ni) ni.classList.add('active');
  closeSidebar();
  // Always scroll to top on page switch; if already on same page scroll to top too
  window.scrollTo({top:0, behavior: alreadyActive ? 'smooth' : 'instant'});
  if(p==='calendar')  renderCalendar();
  if(p==='gallery')   renderGalleryPage();
  if(p==='games')     renderGames();
  if(p==='settings')  applyNames();
}

function toggleSidebar()  { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('mobile-overlay').classList.toggle('show'); }
function closeSidebar()   { document.getElementById('sidebar').classList.remove('open'); document.getElementById('mobile-overlay').classList.remove('show'); }
function setView(s,v,btn) {
  viewMode[s]=v;
  btn.closest('.view-toggle').querySelectorAll('.view-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const g=document.getElementById('list-'+s);
  if(v==='list') g.classList.add('list-view'); else g.classList.remove('list-view');
}

/* ═══════════════════════════════════════════════
   RENDER ALL
═══════════════════════════════════════════════ */
function renderAll() {
  updateGreeting();
  Object.keys(SECTIONS).forEach(s=>renderSection(s));
  renderDashboard();
  renderHero();
  const calPage=document.getElementById('page-calendar');
  if(calPage&&calPage.classList.contains('active')) renderCalendar();
  const galPage=document.getElementById('page-gallery');
  if(galPage&&galPage.classList.contains('active')) renderGalleryPage();
  document.getElementById('nb-gallery').textContent=(data._gallery||[]).length;
}

function renderGamesIfVisible() {
  const pg=document.getElementById('page-games');
  if(pg&&pg.classList.contains('active')) renderGames();
}

function updateGamesBadge() {
  const pending = gamesList.filter(g => g.status==='pending' && g.createdBy!==myRole).length;
  const nb=document.getElementById('nb-games');
  if(nb) nb.textContent = pending>0?`${pending} 🔔`:'';
  renderGamesNotify();
}

function renderGamesNotify() {
  const el = document.getElementById('games-notify');
  if (!el) return;
  const pending = gamesList.filter(g => g.status==='pending' && g.createdBy!==myRole);
  if (!pending.length) { el.innerHTML=''; return; }
  const icon  = { trivia:'🧠', pictionary:'🎨', verofalso:'❓' };
  const label = { trivia:'Trivia', pictionary:'Pictionary', verofalso:'Vero o Falso' };
  el.innerHTML = `
    <div class="games-notify-card" onclick="showPage('games')">
      <div class="games-notify-head">
        <span class="games-notify-pulse">🎮</span>
        <span class="games-notify-title">${pending.length===1?'1 sfida ti aspetta!':`${pending.length} sfide ti aspettano!`}</span>
        <span class="games-notify-cta">Gioca →</span>
      </div>
      <div class="games-notify-list">
        ${pending.map(g=>`<span class="games-notify-pill">${icon[g.type]||'🎮'} ${label[g.type]||'Sfida'} da <b>${esc(PEOPLE[g.createdBy]||g.createdBy)}</b></span>`).join('')}
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════
   GREETING
═══════════════════════════════════════════════ */
function updateGreeting() {
  const h=new Date().getHours();
  const name = myRole==='lui' ? PEOPLE.lui : PEOPLE.lei;
  const other = myRole==='lui' ? PEOPLE.lei : PEOPLE.lui;
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  // Build paired (greet, sub, emoji) bundles per time slot — the second phrase
  // continues the tone of the first instead of being random.
  let bundles;
  if (h>=5 && h<12) {
    bundles = [
      { greet: `Buongiorno, ${name}`, sub: `Inizia la giornata insieme a ${other}.`, emoji: '☀️' },
      { greet: `Bella giornata, ${name}`, sub: `Un nuovo giorno tutto per voi due.`, emoji: '🌅' },
      { greet: `Ehi ${name}, buongiorno`, sub: `${other} ti aspetta. Pronti a costruire?`, emoji: '☕' },
      { greet: `Su su, ${name}!`, sub: `La mattina è il momento giusto per pensare a ${other}.`, emoji: '🌤️' },
      { greet: `Pronto/a, ${name}?`, sub: `Una nuova giornata per voi due.`, emoji: '🌅' }
    ];
  } else if (h>=12 && h<15) {
    bundles = [
      { greet: `Buon pranzo, ${name}`, sub: `Anche ${other} sta facendo una pausa, magari.`, emoji: '🍝' },
      { greet: `Pausa pranzo, ${name}?`, sub: `Un attimo per voi prima di riprendere.`, emoji: '🥗' },
      { greet: `Mezzogiorno già, ${name}`, sub: `Il tempo vola — ma per ${other} ce n'è sempre.`, emoji: '🍕' },
      { greet: `Ciao ${name}`, sub: `Una pausa per pensare a ${other}.`, emoji: '😋' }
    ];
  } else if (h>=15 && h<18) {
    bundles = [
      { greet: `Buon pomeriggio, ${name}`, sub: `Un attimo di calma per voi due.`, emoji: '🌤️' },
      { greet: `Come va, ${name}?`, sub: `${other} è sempre con te, almeno qui.`, emoji: '☕' },
      { greet: `Ehi ${name}`, sub: `Un piccolo momento dedicato a voi.`, emoji: '🛋️' },
      { greet: `Pomeriggio, ${name}`, sub: `Riprendi fiato, poi torna a costruire con ${other}.`, emoji: '🎵' }
    ];
  } else if (h>=18 && h<22) {
    bundles = [
      { greet: `Buonasera, ${name}`, sub: `La sera è il momento perfetto per pensare a ${other}.`, emoji: '🌆' },
      { greet: `Bella serata, ${name}`, sub: `Un brindisi a voi due.`, emoji: '🍷' },
      { greet: `Finalmente sera, ${name}`, sub: `Tempo per voi, tempo per ${other}.`, emoji: '🌃' },
      { greet: `Rilassati, ${name}`, sub: `${other} è qui, anche solo nei vostri ricordi.`, emoji: '✨' },
      { greet: `Com'è andata, ${name}?`, sub: `Una serata da raccontare a ${other}.`, emoji: '🌙' }
    ];
  } else {
    bundles = [
      { greet: `Buonanotte, ${name}`, sub: `Dormi sereno/a, ${other} è nei tuoi pensieri.`, emoji: '🌙' },
      { greet: `Notte, ${name}`, sub: `I sogni più belli si fanno in due.`, emoji: '🌟' },
      { greet: `Già tardi, ${name}`, sub: `Domani un'altra giornata con ${other}.`, emoji: '😴' },
      { greet: `Ehi nottambulo/a, ${name}`, sub: `Anche stanotte ${other} è il tuo pensiero.`, emoji: '🌛' }
    ];
  }

  // Day-of-week flavor: weekend / friday tweaks the closing tone but keeps coherence.
  const day = new Date().getDay();
  const b = pick(bundles);
  let { greet, sub, emoji } = b;
  if (day === 5) {
    // Friday — weekend incoming
    sub = pick([
      `${sub} Il weekend è dietro l'angolo.`,
      `Venerdì: il weekend con ${other} è vicino.`,
      `Quasi weekend — qualche piano con ${other}?`
    ]);
    emoji = pick(['🎉','🥳','🎊']);
  } else if (day === 6 || day === 0) {
    // Weekend
    sub = pick([
      `Weekend con ${other}: godetevelo.`,
      `${sub} Oggi siete solo voi due.`,
      `Un weekend tutto per voi.`
    ]);
    emoji = pick(['🥰','❤️','😍','💑']);
  }

  const el = document.getElementById('dash-greeting');
  if (el) el.innerHTML = `${greet} <span style="display:inline-block;animation:hb 2.4s ease-in-out infinite">${emoji}</span><div style="font-size:13px;font-weight:400;color:var(--text-dim);margin-top:2px">${sub}</div>`;
}

/* ═══════════════════════════════════════════════
   RENDER SEZIONE
═══════════════════════════════════════════════ */
function renderSection(s) {
  const items=data[s]||[];
  const nb=document.getElementById('nb-'+s); if(nb) nb.textContent=items.length;
  if(s!=='anniversaries') {
    const prog=document.getElementById('progress-'+s);
    if(prog) {
      if(items.length>0){
        const done=items.filter(i=>i.done).length;
        const pct=Math.round(done/items.length*100);
        prog.innerHTML=`<div class="progress-wrap"><div class="progress-fill" style="width:${pct}%"></div></div><div class="progress-label">${done} / ${items.length} completati${done===items.length&&items.length>0?' 🎉':''}</div>`;
      } else prog.innerHTML='';
    }
  }
  if(s!=='anniversaries') renderFilterBar(s,items);
  const list=document.getElementById('list-'+s); if(!list) return;
  const doneContainer=document.getElementById('done-list-'+s);
  if(!items.length){
    list.innerHTML=`<div class="empty"><div class="empty-icon">${SECTIONS[s].icon}</div><h3>Ancora vuoto</h3><p>Aggiungi il primo elemento!</p></div>`;
    if(doneContainer) doneContainer.innerHTML='';
    return;
  }
  const filtered=activeFilter[s]?items.filter(i=>{const cats=Array.isArray(i.cats)&&i.cats.length?i.cats:(i.cat?[i.cat]:[]);return cats.some(c=>c===activeFilter[s]);}):items;
  const todo=filtered.filter(i=>!i.done);
  const done=filtered.filter(i=>i.done);
  let h='';
  todo.forEach(i=>h+=itemCard(s,i));
  if(!filtered.length) h=`<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🔍</div><h3>Nessun risultato</h3><p>Prova a togliere il filtro.</p></div>`;
  list.innerHTML=h;
  if(doneContainer){
    if(done.length){
      let dh=`<div class="done-label">— già fatti (${done.length}) —</div><div class="done-grid">`;
      done.forEach(i=>dh+=itemCard(s,i));
      dh+=`</div>`;
      doneContainer.innerHTML=dh;
    } else {
      doneContainer.innerHTML='';
    }
  }
}

function renderFilterBar(s,items) {
  const el=document.getElementById('fb-'+s); if(!el) return;
  const usedCats=new Set();
  items.forEach(i=>{const cats=Array.isArray(i.cats)&&i.cats.length?i.cats:(i.cat?[i.cat]:[]);cats.forEach(c=>usedCats.add(c));});
  if(usedCats.size===0){el.innerHTML='';return;}
  let h='';
  usedCats.forEach(c=>{h+=`<button class="filter-pill${activeFilter[s]===c?' active':''}" onclick="toggleFilter('${s}','${c.replace(/'/g,"\\'")}')">  ${esc(c)}</button>`;});
  if(activeFilter[s]) h+=`<button class="filter-clear" onclick="toggleFilter('${s}',null)">✕ Rimuovi filtro</button>`;
  el.innerHTML=h;
}

function toggleFilter(s,cat) { activeFilter[s]=cat; renderSection(s); }

/* ═══════════════════════════════════════════════
   ITEM CARD
═══════════════════════════════════════════════ */
function itemCard(s,item) {
  const hasImg=item.img&&item.img.trim();
  const stars=item.rating?'⭐'.repeat(item.rating):'';
  const cats=Array.isArray(item.cats)&&item.cats.length?item.cats:(item.cat?[item.cat]:[]);
  const whoClass=item.who==='lui'?'by-lui':item.who==='lei'?'by-lei':'';
  const whoLabel=item.who==='lui'?`💙 ${PEOPLE.lui}`:item.who==='lei'?`🩷 ${PEOPLE.lei}`:'';
  let countdownBadge='';
  if(SECTIONS[s].recurring&&item.date){
    const cd=daysToNextOccurrence(item.date);
    if(cd!==null) countdownBadge=`<span class="meta-pill countdown">📅 ${cd===0?'Oggi! 🎉':cd===1?'Domani ✨':`Tra ${cd} giorni`}</span>`;
  } else if(item.date){
    const dateStr=parseLocalDate(item.date).toLocaleDateString('it-IT',{day:'numeric',month:'short'});
    countdownBadge=`<span class="meta-pill date">📅 ${dateStr}</span>`;
  }
  return `<div class="item-card${item.done?' done':''}">
    <div onclick="openDetail('${s}',${item.id})" style="cursor:pointer">
      <div class="card-img-wrap">
        ${hasImg?`<img class="card-img" src="${esc(item.img)}" alt="" onerror="this.parentNode.innerHTML='<div class=card-placeholder>${SECTIONS[s].icon}</div>'">`:`<div class="card-placeholder">${SECTIONS[s].icon}</div>`}
        ${stars?`<div class="card-rating-overlay">${stars}</div>`:''}
      </div>
      <div class="card-body">
        <div class="card-title">${esc(item.title)}</div>
        ${item.note?`<div class="card-note">${esc(item.note)}</div>`:''}
        <div class="card-meta">
          ${cats.map(c=>`<span class="meta-pill">${esc(c)}</span>`).join('')}
          ${countdownBadge}
          ${item.map?`<span class="meta-pill map">📍 ${esc(item.map).substring(0,18)}${item.map.length>18?'...':''}</span>`:''}
          ${whoLabel?`<span class="meta-pill ${whoClass}">${whoLabel}</span>`:''}
          ${item.link?`<a class="meta-pill link" href="${esc(item.link)}" target="_blank" onclick="event.stopPropagation()">🔗 Link</a>`:''}
        </div>
      </div>
    </div>
    <div class="card-body" style="padding-top:0;padding-bottom:9px">
      <div class="card-actions">
        ${s!=='anniversaries'?`<button class="check-btn" onclick="toggleDone('${s}',${item.id})">${item.done?'✓':''}</button>`:''}
        <span class="spacer"></span>
        <button class="icon-btn" onclick="openModal('${s}',${item.id})">✏️</button>
        <button class="icon-btn" onclick="deleteItem('${s}',${item.id})">🗑️</button>
      </div>
    </div>
  </div>`;
}

function daysToNextOccurrence(dateStr) {
  if(!dateStr) return null;
  const d=parseLocalDate(dateStr);
  const now=new Date(); now.setHours(0,0,0,0);
  let next=new Date(now.getFullYear(),d.getMonth(),d.getDate());
  if(next<now) next.setFullYear(now.getFullYear()+1);
  return Math.round((next-now)/(1000*60*60*24));
}

function parseLocalDate(str) {
  if(!str) return new Date();
  const parts=str.split('-');
  return new Date(parseInt(parts[0]),parseInt(parts[1])-1,parseInt(parts[2]));
}

/* ═══════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════ */
function renderDashboard() {
  const tg=document.getElementById('type-grid');
  if(tg) {
    tg.innerHTML=Object.keys(SECTIONS).map(s=>{
      const items=data[s]||[];
      const total=items.length,done=items.filter(i=>i.done).length,todo=total-done;
      return `<div class="type-card" onclick="showPage('${s}')">
        <div class="type-card-icon">${SECTIONS[s].icon}</div>
        <div class="type-card-label">${SECTIONS[s].label}</div>
        <div class="type-card-num">${total}</div>
        <div class="type-card-sub">
          ${todo>0?`<span style="color:var(--glicine)">${todo} da fare</span>`:''}
          ${todo>0&&done>0?' · ':''}
          ${done>0?`<span style="color:var(--green)">${done} ✓</span>`:''}
          ${total===0?'<span>vuoto</span>':''}
        </div>
      </div>`;
    }).join('');
  }
  renderUpcoming();
  const allItems=[];
  Object.keys(SECTIONS).forEach(s=>(data[s]||[]).forEach(i=>allItems.push({...i,_s:s})));
  const todo=allItems.filter(i=>!i.done).sort((a,b)=>{
    if(a.date&&b.date) return new Date(a.date)-new Date(b.date);
    if(a.date) return -1; if(b.date) return 1; return b.id-a.id;
  });
  const doneItems=allItems.filter(i=>i.done).sort((a,b)=>b.id-a.id);
  const dr=document.getElementById('dash-recent'); if(!dr) return;
  const dd=document.getElementById('dash-done');
  if(!todo.length&&!doneItems.length){ dr.innerHTML='<div class="empty"><p>Inizia ad aggiungere qualcosa! 🌟</p></div>'; if(dd) dd.innerHTML=''; return; }
  function recentCardHtml(i){
    const hasImg=i.img&&i.img.trim();
    const dateStr=i.date?parseLocalDate(i.date).toLocaleDateString('it-IT',{day:'numeric',month:'short'}):'';
    const stars=i.rating?'⭐'.repeat(i.rating):'';
    return `<div class="recent-card${i.done?' done':''}" onclick="openDetail('${i._s}',${i.id})">
      <div style="position:relative">
        ${hasImg?`<img class="recent-card-img" src="${esc(i.img)}" alt="" onerror="this.style.display='none'">`:
                 `<div class="recent-card-placeholder">${SECTIONS[i._s].icon}</div>`}
        ${stars?`<div class="card-rating-overlay">${stars}</div>`:''}
        ${i.done?`<div class="recent-card-done-badge">✓</div>`:''}
      </div>
      <div class="recent-card-body">
        <div class="recent-card-title">${esc(i.title)}</div>
        <div class="recent-card-meta">${i.note?esc(i.note).substring(0,45)+(i.note.length>45?'...':''):''}</div>
        <div class="recent-card-tags">
          <span class="recent-card-section">${SECTIONS[i._s].label}</span>
          ${dateStr?`<span style="font-size:9px;color:var(--text-dim)">📅 ${dateStr}</span>`:''}
        </div>
      </div>
    </div>`;
  }
  let html='';
  todo.forEach(i=>html+=recentCardHtml(i));
  dr.innerHTML=html;
  if(dd){
    if(doneItems.length){
      let dh=`<div class="done-label">— già fatti (${doneItems.length}) —</div><div class="done-recent-grid">`;
      doneItems.forEach(i=>dh+=recentCardHtml(i));
      dh+=`</div>`;
      dd.innerHTML=dh;
    } else {
      dd.innerHTML='';
    }
  }
}

function renderUpcoming() {
  const el=document.getElementById('dash-upcoming'); if(!el) return;
  const today=new Date(); today.setHours(0,0,0,0);
  const allItems=[];
  Object.keys(SECTIONS).forEach(s=>(data[s]||[]).forEach(i=>{if(i.date&&!i.done) allItems.push({...i,_s:s});}));
  const upcoming=[];
  allItems.forEach(i=>{
    if(SECTIONS[i._s].recurring){
      const days=daysToNextOccurrence(i.date);
      if(days!==null&&days<=365) upcoming.push({...i,_daysLeft:days});
    } else {
      const d=parseLocalDate(i.date); d.setHours(0,0,0,0);
      if(d>=today) upcoming.push({...i,_daysLeft:Math.round((d-today)/(1000*60*60*24))});
    }
  });
  upcoming.sort((a,b)=>a._daysLeft-b._daysLeft);
  if(!upcoming.length){ el.innerHTML='<div class="upcoming-list"><div style="color:var(--text-dim);font-size:13px;padding:6px 0">Nessun evento in programma. Aggiungine uno con una data! 📅</div></div>'; return; }
  const visible=upcoming.slice(0,3);
  let html='';
  visible.forEach(i=>{
    const dl=i._daysLeft;
    const diffStr=dl===0?'Oggi 🎉':dl===1?'Domani ✨':`Tra ${dl} giorni`;
    const badgeClass=dl===0?'today':dl<=7?'soon':'normal';
    const dateStr=parseLocalDate(i.date).toLocaleDateString('it-IT',{day:'numeric',month:'short'});
    html+=`<div class="upcoming-row" onclick="openDetail('${i._s}',${i.id})">
      <div class="upcoming-icon">${SECTIONS[i._s].icon}</div>
      <div class="upcoming-body">
        <div class="upcoming-title">${esc(i.title)}</div>
        <div class="upcoming-sub">${SECTIONS[i._s].label} · ${dateStr}${SECTIONS[i._s].recurring?' (ricorrente)':''}</div>
      </div>
      <div class="upcoming-badge ${badgeClass}">${diffStr}</div>
    </div>`;
  });
  if(upcoming.length>3) html+=`<button class="upcoming-more" onclick="showPage('calendar')">+ altri ${upcoming.length-3} eventi → vai al calendario</button>`;
  el.innerHTML=html;
}

/* ═══════════════════════════════════════════════
   CHAT — LINK PREVIEW
═══════════════════════════════════════════════ */
function linkifyText(text) {
  return text.split(/(https?:\/\/[^\s]+)/g).map((part,i)=>
    i%2===1
      ? `<a href="${part.replace(/"/g,'%22')}" target="_blank" rel="noopener" class="chat-link">${esc(part)}</a>`
      : esc(part)
  ).join('');
}

function buildLinkPreview(text) {
  const m = text.match(/(https?:\/\/[^\s]+)/);
  if(!m) return '';
  const url = m[1];

  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  if(yt) {
    const id = yt[1];
    return `<a href="${url.replace(/"/g,'%22')}" target="_blank" rel="noopener" class="link-preview yt-preview">
      <img src="https://img.youtube.com/vi/${id}/hqdefault.jpg" class="yt-thumb" alt="">
      <div class="yt-play">▶</div>
    </a>`;
  }

  // Spotify
  const sp = url.match(/open\.spotify\.com\/(track|playlist|album|episode|show)\/([A-Za-z0-9]+)/);
  if(sp) {
    const [,kind,id] = sp;
    const h = kind==='track'||kind==='episode' ? 80 : 152;
    return `<div class="link-preview sp-preview">
      <iframe src="https://open.spotify.com/embed/${kind}/${id}?utm_source=generator&theme=0"
        width="100%" height="${h}" frameborder="0" loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
    </div>`;
  }

  // Generic link card
  let domain=''; try{ domain=new URL(url).hostname.replace(/^www\./,''); }catch(e){}
  return `<a href="${url.replace(/"/g,'%22')}" target="_blank" rel="noopener" class="link-preview gen-preview">
    <span class="gen-link-icon">🔗</span>
    <span class="gen-link-domain">${esc(domain||url)}</span>
  </a>`;
}

/* ═══════════════════════════════════════════════
   CHAT
═══════════════════════════════════════════════ */
function renderChat() {
  const list=document.getElementById('chat-messages-list'); if(!list) return;
  const count=document.getElementById('chat-count');

  if(!chatMessages.length){
    list.innerHTML='<div class="chat-empty">Nessun messaggio ancora.<br>Scrivi il primo! 💬</div>';
    if(count) count.textContent='';
    return;
  }

  if(count) count.textContent=`${chatMessages.length} messaggi`;

  list.innerHTML=chatMessages.map(msg=>{
    const who=msg.who||'lui';
    const name=PEOPLE[who]||who;
    const time=msg.ts?new Date(msg.ts).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}):'';
    const reactions=msg.reactions||{};

    // Build reaction pills
    let reactHtml='';
    Object.entries(reactions).forEach(([emoji,users])=>{
      if(!users||users.length===0) return;
      const isMine=users.includes(myRole);
      reactHtml+=`<button class="chat-reaction-pill${isMine?' mine':''}" onclick="toggleChatReaction('${msg.id}','${emoji}')" title="${users.map(u=>PEOPLE[u]||u).join(', ')}">${emoji}<span class="chat-reaction-count">${users.length}</span></button>`;
    });
    reactHtml+=`<button class="chat-add-react" onclick="openEmojiPicker('${msg.id}',this)">+ 😊</button>`;

    const preview = buildLinkPreview(msg.text);
    const isOwn = who === myRole;
    const nameEl = isOwn
      ? `<div class="chat-msg-name own-name" onclick="openMsgMenu('${msg.id}',this)">${esc(name)} <span class="name-edit-hint">···</span></div>`
      : `<div class="chat-msg-name">${esc(name)}</div>`;

    return `<div class="chat-msg ${who}" id="cmsg-${msg.id}">
      ${nameEl}
      <div class="chat-msg-bubble">
        <div class="chat-msg-text">${linkifyText(msg.text)}</div>
        ${preview}
      </div>
      <div class="chat-msg-time">${time}</div>
      <div class="chat-msg-foot">${reactHtml}</div>
    </div>`;
  }).join('');

  // Scroll to bottom
  list.scrollTop=list.scrollHeight;
}

/* ── Message edit/delete menu ── */
let _msgMenuOpen = null;

function openMsgMenu(msgId, triggerEl) {
  closeMsgMenu();
  _msgMenuOpen = msgId;
  const menu = document.createElement('div');
  menu.id = 'msg-ctx-menu';
  menu.innerHTML = `
    <button onclick="startEditMsg('${msgId}')">✏️ Modifica</button>
    <button class="del" onclick="deleteChatMsg('${msgId}')">🗑️ Elimina</button>`;
  document.body.appendChild(menu);

  const r = triggerEl.getBoundingClientRect();
  let left = r.left;
  if(left + 160 > window.innerWidth) left = window.innerWidth - 168;
  menu.style.left = Math.max(8, left) + 'px';
  menu.style.top = (r.bottom + 4) + 'px';

  setTimeout(() => document.addEventListener('click', _closeMsgMenuOutside), 0);
}

function _closeMsgMenuOutside(e) {
  if(!document.getElementById('msg-ctx-menu')?.contains(e.target)) closeMsgMenu();
}

function closeMsgMenu() {
  document.getElementById('msg-ctx-menu')?.remove();
  document.removeEventListener('click', _closeMsgMenuOutside);
  _msgMenuOpen = null;
}

function startEditMsg(msgId) {
  closeMsgMenu();
  const msg = chatMessages.find(m => m.id === msgId); if(!msg) return;
  const msgEl = document.getElementById('cmsg-' + msgId); if(!msgEl) return;
  const bubble = msgEl.querySelector('.chat-msg-bubble');
  bubble.innerHTML = `
    <textarea class="chat-edit-input" id="edit-ta-${msgId}">${esc(msg.text)}</textarea>
    <div class="chat-edit-actions">
      <button class="chat-edit-cancel" onclick="renderChat()">Annulla</button>
      <button class="chat-edit-save" onclick="saveEditMsg('${msgId}')">Salva</button>
    </div>`;
  const ta = document.getElementById('edit-ta-' + msgId);
  ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
}

async function saveEditMsg(msgId) {
  const ta = document.getElementById('edit-ta-' + msgId); if(!ta) return;
  const newText = ta.value.trim(); if(!newText) return;
  // Update local cache instantly so UI resets without waiting for Firestore
  const msg = chatMessages.find(m => m.id === msgId);
  if(msg) msg.text = newText;
  renderChat();
  try {
    await db.collection('couples').doc(COUPLE_ID).collection('messages').doc(msgId).update({ text: newText });
  } catch(e) { console.error(e); }
}

async function deleteChatMsg(msgId) {
  closeMsgMenu();
  try {
    await db.collection('couples').doc(COUPLE_ID).collection('messages').doc(msgId).delete();
  } catch(e) { console.error(e); }
}

async function sendChatMsg() {
  const input=document.getElementById('chat-input');
  const text=input.value.trim(); if(!text) return;
  input.value=''; input.style.height='';

  try {
    await db.collection('couples').doc(COUPLE_ID).collection('messages').add({
      who: myRole,
      text,
      ts: Date.now(),
      reactions: {}
    });
    // Auto-trim: keep at most 200 messages, delete oldest when exceeded
    if(chatMessages.length>=200) {
      const toDelete=chatMessages.slice(0, chatMessages.length-199);
      toDelete.forEach(m => {
        db.collection('couples').doc(COUPLE_ID).collection('messages').doc(m.id).delete().catch(()=>{});
      });
    }
  } catch(e) { console.error('Send msg error',e); }
}

async function toggleChatReaction(msgId, emoji) {
  const msg=chatMessages.find(m=>m.id===msgId); if(!msg) return;
  // Build a fresh copy of the entire reactions map (avoid dot-notation with emoji in field paths)
  const reactions={...(msg.reactions||{})};
  const users=reactions[emoji]||[];
  if(users.includes(myRole)) {
    reactions[emoji]=users.filter(u=>u!==myRole);
    if(reactions[emoji].length===0) delete reactions[emoji];
  } else {
    reactions[emoji]=[...users,myRole];
  }
  try {
    await db.collection('couples').doc(COUPLE_ID).collection('messages').doc(msgId).update({reactions});
  } catch(e) { console.error('reaction error',e); }
}

/* ═══════════════════════════════════════════════
   GALLERY REACTIONS
═══════════════════════════════════════════════ */
function galleryReactionsHtml(g) {
  const reactions = g.reactions || {};
  let html = '';
  Object.entries(reactions).forEach(([emoji, users]) => {
    if(!users || !users.length) return;
    const isMine = users.includes(myRole);
    const tooltip = users.map(u => PEOPLE[u]||u).join(', ');
    html += `<button class="gallery-reaction-pill${isMine?' mine':''}" onclick="event.stopPropagation();toggleGalleryReaction('${g.id}','${emoji}')" title="${tooltip}">${emoji}<span class="gallery-reaction-count">${users.length}</span></button>`;
  });
  html += `<button class="gallery-add-react" onclick="event.stopPropagation();openGalleryEmojiPicker('${g.id}',this)" title="Aggiungi reazione">+ 😊</button>`;
  return html;
}

async function toggleGalleryReaction(galleryId, emoji) {
  try {
    const coupleRef = db.collection('couples').doc(COUPLE_ID);
    const updatedGallery = await db.runTransaction(async tx => {
      const snap = await tx.get(coupleRef);
      if(!snap.exists) return null;
      const remote = snap.data() || {};
      const gallery = [...(remote._gallery || [])];
      const idx = gallery.findIndex(g => String(g.id) === String(galleryId));
      if(idx < 0) return null;
      const g = gallery[idx];
      const reactions = {...(g.reactions || {})};
      const users = reactions[emoji] || [];
      if(users.includes(myRole)) {
        reactions[emoji] = users.filter(u => u !== myRole);
        if(!reactions[emoji].length) delete reactions[emoji];
      } else {
        reactions[emoji] = [...users, myRole];
      }
      gallery[idx] = {...g, reactions};
      tx.update(coupleRef, { _gallery: gallery });
      return gallery;
    });
    if(!updatedGallery) return;
    data._gallery = updatedGallery;
    renderGalleryPage();
    const fs = document.getElementById('gallery-fs-overlay');
    if(fs && fs.classList.contains('open')) {
      const nowIdx = (data._gallery||[]).findIndex(g => String(g.id) === String(galleryId));
      if(nowIdx >= 0) { gfsIndex = nowIdx; showGFS(nowIdx); }
    }
  } catch(e) { console.error('gallery reaction error', e); }
}

function openGalleryEmojiPicker(galleryId, triggerEl) {
  closeEmojiPicker();
  emojiPickerTarget = {galleryId};
  const bar = document.getElementById('quick-react-bar');
  bar.innerHTML = QUICK_EMOJIS.map(e =>
    `<button class="qr-btn" onclick="pickEmoji('${e}')">${e}</button>`
  ).join('') + `<button class="qr-more-btn" onclick="openFullPicker()">＋</button>`;
  const bd = document.getElementById('quick-react-backdrop');
  bd.style.display = 'block';
  bar.style.display = 'flex';
  bar.style.width = 'auto';
  if(triggerEl) {
    bar.style.left = '-9999px';
    bar.style.top = '-9999px';
    requestAnimationFrame(() => {
      const bw = bar.offsetWidth;
      const r = triggerEl.getBoundingClientRect();
      let left = r.left + r.width / 2 - bw / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - bw - 8));
      const top = r.top - bar.offsetHeight - 8;
      bar.style.left = left + 'px';
      bar.style.top = Math.max(8, top) + 'px';
    });
  }
}

function autoResizeChatInput(el) {
  el.style.height='auto';
  el.style.height=Math.min(el.scrollHeight,110)+'px';
}

/* ═══════════════════════════════════════════════
   EMOJI PICKER (full)
═══════════════════════════════════════════════ */
const QUICK_EMOJIS = ['❤️','😍','😂','🥰','👍','🎉','🔥','😭'];

function openEmojiPicker(msgId, triggerEl) {
  closeEmojiPicker();
  emojiPickerTarget = {msgId};
  const bar = document.getElementById('quick-react-bar');
  bar.innerHTML = QUICK_EMOJIS.map(e =>
    `<button class="qr-btn" onclick="pickEmoji('${e}')">${e}</button>`
  ).join('') + `<button class="qr-more-btn" onclick="openFullPicker()">＋</button>`;

  const bd = document.getElementById('quick-react-backdrop');
  bd.style.display = 'block';
  bar.style.display = 'flex';
  bar.style.width = 'auto';

  if(triggerEl) {
    // Temporarily show to measure actual width
    bar.style.left = '-9999px';
    bar.style.top = '-9999px';
    requestAnimationFrame(() => {
      const bw = bar.offsetWidth;
      const r = triggerEl.getBoundingClientRect();
      let left = r.left + r.width / 2 - bw / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - bw - 8));
      const top = r.top - bar.offsetHeight - 8;
      bar.style.left = left + 'px';
      bar.style.top = Math.max(8, top) + 'px';
    });
  }
}

function closeQuickReact() {
  emojiPickerTarget = null;
  document.getElementById('quick-react-bar').style.display = 'none';
  document.getElementById('quick-react-backdrop').style.display = 'none';
}

function openFullPicker() {
  const target = emojiPickerTarget;
  closeQuickReact();
  if(!target) return;
  emojiPickerTarget = {...target};
  document.getElementById('emoji-picker-backdrop').classList.add('open');
  document.getElementById('emoji-picker').classList.add('open');
  document.getElementById('emoji-search').value='';
  buildEmojiCats();
  showEmojiCat(0);
}

function closeEmojiPicker() {
  emojiPickerTarget=null;
  document.getElementById('emoji-picker-backdrop').classList.remove('open');
  document.getElementById('emoji-picker').classList.remove('open');
}

function buildEmojiCats() {
  const el=document.getElementById('emoji-picker-cats');
  el.innerHTML=EMOJI_CATS.map((c,i)=>
    `<button class="emoji-cat-tab${i===0?' active':''}" onclick="showEmojiCat(${i})" title="${c.name}">${c.label}</button>`
  ).join('');
}

function showEmojiCat(idx) {
  emojiCurrentCat=idx;
  document.querySelectorAll('.emoji-cat-tab').forEach((b,i)=>b.classList.toggle('active',i===idx));
  renderEmojiGrid(EMOJI_CATS[idx].emojis);
}

function renderEmojiGrid(emojis) {
  document.getElementById('emoji-picker-grid').innerHTML=emojis.map(e=>
    `<button class="emoji-grid-btn" onclick="pickEmoji('${e}')" title="${e}">${e}</button>`
  ).join('');
}

function filterEmojis(q) {
  if(!q.trim()){ showEmojiCat(emojiCurrentCat); return; }
  const ql=q.toLowerCase().trim();
  const matched=EMOJI_CATS.filter(c=>
    c.name.toLowerCase().includes(ql) ||
    (c.keys||[]).some(k=>k.includes(ql))
  );
  const results = matched.length
    ? matched.flatMap(c=>c.emojis)
    : EMOJI_CATS.flatMap(c=>c.emojis).slice(0,120);
  renderEmojiGrid(results);
}

async function pickEmoji(emoji) {
  const target = emojiPickerTarget; // capture BEFORE closeEmojiPicker nulls it
  closeEmojiPicker();
  if(!target) return;
  if(target.msgId) await toggleChatReaction(target.msgId, emoji);
  else if(target.galleryId) await toggleGalleryReaction(target.galleryId, emoji);
}

/* ═══════════════════════════════════════════════
   RICERCA GLOBALE
═══════════════════════════════════════════════ */
function onSearchInput() {
  const q=document.getElementById('global-search').value.trim();
  const clearBtn=document.getElementById('search-clear');
  const resultsEl=document.getElementById('search-results');
  clearBtn.style.display=q?'block':'none';
  if(!q){resultsEl.classList.remove('visible');resultsEl.innerHTML='';return;}
  const ql=q.toLowerCase();
  const matches=[];

  // Sezioni
  Object.keys(SECTIONS).forEach(s=>{
    (data[s]||[]).forEach(i=>{
      if((i.title||'').toLowerCase().includes(ql)||(i.note||'').toLowerCase().includes(ql))
        matches.push({_type:'section',_s:s,...i});
    });
  });

  // Galleria
  (data._gallery||[]).forEach((g,idx)=>{
    if((g.title||'').toLowerCase().includes(ql)||(g.caption||'').toLowerCase().includes(ql))
      matches.push({_type:'gallery',_idx:idx,title:g.title||'Foto',note:g.caption||''});
  });

  // Messaggi
  chatMessages.forEach(m=>{
    if((m.text||'').toLowerCase().includes(ql))
      matches.push({_type:'message',_who:m.who,title:m.text.substring(0,60),note:''});
  });

  if(!matches.length){
    resultsEl.innerHTML=`<div style="padding:20px;color:var(--text-dim);text-align:center">Nessun risultato per "<b>${esc(q)}</b>"</div>`;
    resultsEl.classList.add('visible'); return;
  }
  resultsEl.innerHTML=`<div class="search-results-inner">
    <div class="search-results-header">
      <span>🔍 ${matches.length} risultat${matches.length===1?'o':'i'} per "<b>${esc(q)}</b>"</span>
      <button onclick="clearSearch()">✕ Chiudi</button>
    </div>
    ${matches.slice(0,12).map(i=>{
      if(i._type==='gallery')
        return `<div class="search-result-item" onclick="clearSearch();showPage('gallery')">
          <div class="search-result-icon">🖼️</div>
          <div class="search-result-body">
            <div class="search-result-title">${highlight(esc(i.title),q)}</div>
            <div class="search-result-sub">Galleria${i.note?' · '+highlight(esc(i.note.substring(0,50)),q):''}</div>
          </div></div>`;
      if(i._type==='message')
        return `<div class="search-result-item" onclick="clearSearch();showPage('dashboard')">
          <div class="search-result-icon">${i._who==='lui'?'💙':'🩷'}</div>
          <div class="search-result-body">
            <div class="search-result-title">${highlight(esc(i.title),q)}</div>
            <div class="search-result-sub">Messaggio di ${esc(PEOPLE[i._who]||i._who)}</div>
          </div></div>`;
      return `<div class="search-result-item" onclick="clearSearch();openDetail('${i._s}',${i.id})">
        <div class="search-result-icon">${SECTIONS[i._s].icon}</div>
        <div class="search-result-body">
          <div class="search-result-title">${highlight(esc(i.title),q)}</div>
          <div class="search-result-sub">${SECTIONS[i._s].label}${i.note?' · '+highlight(esc(i.note.substring(0,50)),q):''}</div>
        </div></div>`;
    }).join('')}
    ${matches.length>12?`<div style="padding:10px 16px;font-size:12px;color:var(--text-dim)">+ altri ${matches.length-12} — affina la ricerca</div>`:''}
  </div>`;
  resultsEl.classList.add('visible');
}

function clearSearch() {
  const gi=document.getElementById('global-search');
  if(gi) gi.value='';
  const sc=document.getElementById('search-clear');
  if(sc) sc.style.display='none';
  const re=document.getElementById('search-results');
  if(re){re.classList.remove('visible');re.innerHTML='';}
  closeSidebar();
}

function highlight(text,q) {
  const re=new RegExp('('+q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
  return text.replace(re,'<span class="search-highlight">$1</span>');
}


/* ═══════════════════════════════════════════════
   MODAL ADD/EDIT
═══════════════════════════════════════════════ */
function openModal(s,editId=null) {
  currentSection=s; currentEditId=editId; currentWho=null;
  imgFileData='';
  document.getElementById('modal-title').textContent=editId?'Modifica':`+ ${SECTIONS[s].label}`;
  const catsEl=document.getElementById('f-cats');
  catsEl.innerHTML=''; selectedCats[s]=[]; currentRating[s]=0;
  SECTIONS[s].cats.forEach(c=>{
    const b=document.createElement('button'); b.className='cat-pill'; b.textContent=c; b.dataset.c=c;
    b.onclick=()=>{
      const idx=selectedCats[s].indexOf(c);
      if(idx>-1){selectedCats[s].splice(idx,1);b.classList.remove('selected');}
      else{selectedCats[s].push(c);b.classList.add('selected');}
    };
    catsEl.appendChild(b);
  });
  document.getElementById('f-map-row').style.display=SECTIONS[s].showMap?'flex':'none';
  document.getElementById('f-rating-row').style.display=SECTIONS[s].showRating?'flex':'none';
  document.getElementById('who-lui').className='who-btn';
  document.getElementById('who-lei').className='who-btn';
  const item=editId?(data[s]||[]).find(i=>i.id===editId):null;
  document.getElementById('f-title').value=item?.title||'';
  document.getElementById('f-note').value=item?.note||'';
  document.getElementById('f-date').value=item?.date||'';
  document.getElementById('f-link').value=item?.link||'';
  document.getElementById('f-img').value=item?.img||'';
  document.getElementById('f-map').value=item?.map||'';
  const existingCats=Array.isArray(item?.cats)&&item.cats.length?item.cats:(item?.cat?[item.cat]:[]);
  selectedCats[s]=existingCats.slice();
  catsEl.querySelectorAll('.cat-pill').forEach(b=>{if(existingCats.includes(b.dataset.c)) b.classList.add('selected');});
  if(item?.rating){currentRating[s]=item.rating;setStar(item.rating);}else setStar(0);
  if(item?.who) setWho(item.who);
  switchImgTab('url');
  const prev=document.getElementById('f-img-preview'); prev.src=''; prev.style.display='none';
  document.getElementById('f-img-file').value='';
  document.getElementById('img-file-label-text').textContent="Clicca per scegliere un'immagine";
  document.getElementById('img-upload-status').textContent='';
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('f-title').focus(),100);
}

let imgFileData='';

function setWho(w) {
  currentWho=w;
  document.getElementById('who-lui').className='who-btn'+(w==='lui'?' active-lui':'');
  document.getElementById('who-lei').className='who-btn'+(w==='lei'?' active-lei':'');
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }

function setStar(v) {
  currentRating[currentSection]=v;
  document.querySelectorAll('#f-stars .star-btn').forEach(b=>b.classList.toggle('on',parseInt(b.dataset.v)<=v));
}

function saveItem() {
  const title=document.getElementById('f-title').value.trim(); if(!title) return;
  const s=currentSection; if(!data[s]) data[s]=[];
  const imgUrl=document.getElementById('f-img').value.trim();
  const imgVal=imgFileData||imgUrl;
  const cats=selectedCats[s]||[];
  const payload={
    title,note:document.getElementById('f-note').value.trim(),
    cats,cat:cats[0]||'',
    date:document.getElementById('f-date').value,
    link:document.getElementById('f-link').value.trim(),
    img:imgVal,map:document.getElementById('f-map').value.trim(),
    rating:currentRating[s]||0,who:currentWho||null,done:false
  };
  if(currentEditId){
    const idx=data[s].findIndex(i=>i.id===currentEditId);
    if(idx>-1){payload.id=currentEditId;payload.done=data[s][idx].done;data[s][idx]=payload;}
  } else {
    payload.id=Date.now(); data[s].unshift(payload);
  }
  renderSection(s); renderDashboard(); pushData(); closeModal();
}

function toggleDone(s,id) {
  const i=(data[s]||[]).find(x=>x.id===id); if(i) i.done=!i.done;
  renderSection(s); renderDashboard(); pushData();
}

function deleteItem(s,id) {
  if(!confirm('Eliminare?')) return;
  data[s]=(data[s]||[]).filter(i=>i.id!==id);
  renderSection(s); renderDashboard(); pushData();
}

function switchImgTab(tab) {
  document.getElementById('img-tab-url').classList.toggle('active',tab==='url');
  document.getElementById('img-tab-file').classList.toggle('active',tab==='file');
  document.getElementById('img-panel-url').classList.toggle('active',tab==='url');
  document.getElementById('img-panel-file').classList.toggle('active',tab==='file');
  if(tab==='url') imgFileData='';
}

/* ═══════════════════════════════════════════════
   UPLOAD IMMAGINI (Cloudinary)
═══════════════════════════════════════════════ */
async function handleImgFile(e,context) {
  const file=e.target.files[0]; if(!file) return;
  const cloudName=localStorage.getItem('cloudName')||'';
  const statusId=context==='gallery'?'gimg-upload-status':'img-upload-status';
  const previewId=context==='gallery'?'gf-img-preview':'f-img-preview';
  const labelTxtId=context==='gallery'?'gimg-file-label-text':'img-file-label-text';
  const status=document.getElementById(statusId);
  const preview=document.getElementById(previewId);
  const labelTx=document.getElementById(labelTxtId);
  const reader=new FileReader(); reader.onload=ev=>{
    preview.src=ev.target.result; preview.style.display='block';
    if(context==='gallery') showFocalPicker(ev.target.result,{x:50,y:50});
  }; reader.readAsDataURL(file);
  if(!cloudName){
    status.style.color='var(--lei)';
    status.textContent='⚠️ Configura il Cloud Name nelle Impostazioni per caricare foto.';
    return;
  }
  status.style.color='var(--text-dim)'; status.textContent='⏳ Caricamento...';
  if(labelTx) labelTx.textContent='Caricamento...';
  try {
    const fd=new FormData(); fd.append('file',file); fd.append('upload_preset','ml_default');
    const r=await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{method:'POST',body:fd});
    const j=await r.json();
    if(!j.secure_url) throw new Error(j.error?.message||'Upload fallito');
    const url=j.secure_url;
    if(context==='gallery'){gImgFileData=url;preview.src=url;showFocalPicker(url,focalPoint);}
    else{imgFileData=url;preview.src=url;}
    status.style.color='var(--green)'; status.textContent='✓ Caricata!';
    if(labelTx) labelTx.textContent='✓ '+file.name;
  } catch(err) {
    if(context==='gallery') gImgFileData=''; else imgFileData='';
    status.style.color='var(--lei)'; status.textContent='⚠️ '+err.message;
    if(labelTx) labelTx.textContent='Riprova';
  }
}

/* ═══════════════════════════════════════════════
   DETAIL MODAL
═══════════════════════════════════════════════ */
function openDetail(s,id) {
  const item=(data[s]||[]).find(i=>i.id===id); if(!item) return;
  const hasImg=item.img&&item.img.trim();
  const stars=item.rating?'⭐'.repeat(item.rating):'';
  const dateStr=item.date?parseLocalDate(item.date).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'}):'';
  const whoClass=item.who==='lui'?'by-lui':item.who==='lei'?'by-lei':'';
  const whoLabel=item.who==='lui'?`💙 ${PEOPLE.lui}`:item.who==='lei'?`🩷 ${PEOPLE.lei}`:'';
  const cats=Array.isArray(item.cats)&&item.cats.length?item.cats:(item.cat?[item.cat]:[]);
  document.getElementById('detail-modal-media').innerHTML=hasImg
    ?`<img class="detail-modal-img" src="${esc(item.img)}" alt="" onerror="this.style.display='none'">`
    :`<div class="detail-modal-placeholder">${SECTIONS[s].icon}</div>`;
  document.getElementById('detail-modal-title').textContent=item.title||'';
  const locEl=document.getElementById('detail-modal-location');
  const locParts=[];
  if(item.map) locParts.push(`📍 <a href="https://maps.google.com/?q=${encodeURIComponent(item.map)}" target="_blank" style="color:var(--lei);text-decoration:underline">${esc(item.map)}</a>`);
  if(dateStr) locParts.push(`📅 ${dateStr}`);
  if(SECTIONS[s].recurring&&item.date){const cd=daysToNextOccurrence(item.date);if(cd!==null) locParts.push(`🔄 ${cd===0?'Oggi!':cd===1?'Domani':'Tra '+cd+' giorni'}`);}
  if(locParts.length){locEl.style.display='block';locEl.innerHTML=locParts.join(' &nbsp;·&nbsp; ');}else locEl.style.display='none';
  const noteEl=document.getElementById('detail-modal-note');
  noteEl.textContent=item.note||''; noteEl.style.display=item.note?'block':'none';
  let metaHtml=cats.map(c=>`<span class="meta-pill">${esc(c)}</span>`).join('');
  if(stars) metaHtml+=`<span class="meta-pill rating">${stars}</span>`;
  if(whoLabel) metaHtml+=`<span class="meta-pill ${whoClass}">${whoLabel}</span>`;
  if(item.link) metaHtml+=`<a class="meta-pill link" href="${esc(item.link)}" target="_blank">🔗 Apri link</a>`;
  document.getElementById('detail-modal-meta').innerHTML=metaHtml;
  document.getElementById('detail-edit-btn').onclick=()=>{closeDetail();openModal(s,id);};
  document.getElementById('detail-modal-overlay').classList.add('open');
}

function closeDetail() { document.getElementById('detail-modal-overlay').classList.remove('open'); }

/* ═══════════════════════════════════════════════
   GALLERIA
═══════════════════════════════════════════════ */
function renderHero() {
  const el=document.getElementById('gallery-hero'); if(!el) return;
  const gall=(data._gallery||[]).filter(g=>g.img);
  if(!gall.length){el.classList.remove('has-photos');el.innerHTML='';clearInterval(heroTimer);return;}
  if(heroBuilt&&gall.length===heroGalleryCount) return;
  heroBuilt=true; heroGalleryCount=gall.length;
  heroItems=gall;
  heroSlideIndex=Math.floor(Math.random()*gall.length);
  clearInterval(heroTimer);
  let html='';
  gall.forEach((g,i)=>{
    const focusCss=g.heroFocus?`object-position:${g.heroFocus.x}% ${g.heroFocus.y}%`:'';
    const dateStr=g.date?parseLocalDate(g.date).toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'}):'';
    const realIdx=(data._gallery||[]).indexOf(g);
    const gid=String(g.id||'');
    html+=`<div class="hero-slide${i===heroSlideIndex?' active':''}">
      <img src="${esc(g.img)}" alt="" style="${focusCss};cursor:pointer" onerror="this.style.display='none'" onclick="openGFS(${realIdx})">
      <button class="hero-slide-prescreen-btn" onclick="event.stopPropagation();openInPreScreen('${gid}')" title="Apri in pre-screen">🌙</button>
      <div class="hero-slide-overlay" style="pointer-events:none">
        <div class="hero-slide-title">${esc(g.title||'')}</div>
        ${g.caption?`<div class="hero-slide-caption">${esc(g.caption)}</div>`:''}
        <div class="hero-slide-meta">
          ${dateStr?`<span class="hero-pill date">📅 ${dateStr}</span>`:''}
          ${g.location?`<span class="hero-pill loc">📍 ${esc(g.location)}</span>`:''}
        </div>
      </div>
    </div>`;
  });
  if(gall.length>1) html+=`<div class="hero-counter"><span id="hero-cur">1</span>/${gall.length}</div>`;
  el.innerHTML=html; el.classList.add('has-photos');
  // Mobile: fill remaining viewport height
  if(window.innerWidth<=720){
    requestAnimationFrame(()=>{
      const top=el.getBoundingClientRect().top;
      el.style.height=Math.max(220,window.innerHeight-top-52)+'px';
    });
  } else {
    el.style.height='';
  }
  // Touch swipe
  let _tx=0;
  el.addEventListener('touchstart',e=>{_tx=e.touches[0].clientX;},{passive:true});
  el.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-_tx;
    if(Math.abs(dx)>45) heroManual((heroSlideIndex+(dx<0?1:-1)+heroItems.length)%heroItems.length);
  },{passive:true});
  if(gall.length>1) heroTimer=setInterval(()=>goHero((heroSlideIndex+1)%heroItems.length),10000);
}

function heroManual(idx){clearInterval(heroTimer);goHero(idx);if(heroItems.length>1) heroTimer=setInterval(()=>goHero((heroSlideIndex+1)%heroItems.length),10000);}
function goHero(idx){
  const el=document.getElementById('gallery-hero');if(!el)return;
  const slides=el.querySelectorAll('.hero-slide');if(!slides.length)return;
  idx=((idx%slides.length)+slides.length)%slides.length;heroSlideIndex=idx;
  slides.forEach((s,i)=>s.classList.toggle('active',i===idx));
  const cur=document.getElementById('hero-cur');if(cur) cur.textContent=idx+1;
}

function getGalleryTimestamp(g, mode) {
  if(!g) return 0;
  if(mode === 'postDate' && g.date) {
    const d = parseLocalDate(g.date);
    return d ? d.getTime() : 0;
  }
  // uploadDate fallback: id is created with Date.now()
  const idNum = Number(g.id);
  return Number.isFinite(idNum) ? idNum : 0;
}

function getSortedGalleryEntries(gallery) {
  const entries = (gallery || []).map((item, index) => ({ item, index }));
  entries.sort((a, b) => {
    const ta = getGalleryTimestamp(a.item, gallerySortBy);
    const tb = getGalleryTimestamp(b.item, gallerySortBy);
    const cmp = tb - ta; // newest first
    if(cmp !== 0) return cmp;
    return b.index - a.index; // stable fallback
  });
  if(gallerySortReverse) entries.reverse();
  return entries;
}

function loadGallerySortPrefs() {
  try {
    const raw = localStorage.getItem(GALLERY_SORT_LS_KEY);
    if(!raw) return;
    const prefs = JSON.parse(raw);
    gallerySortBy = prefs?.sortBy === 'uploadDate' ? 'uploadDate' : 'postDate';
    gallerySortReverse = !!prefs?.reverse;
  } catch(e) {}
}

function saveGallerySortPrefs() {
  try {
    localStorage.setItem(GALLERY_SORT_LS_KEY, JSON.stringify({
      sortBy: gallerySortBy,
      reverse: gallerySortReverse
    }));
  } catch(e) {}
}

function refreshGallerySortUI() {
  const select = document.getElementById('gallery-sort-select');
  if(select) select.value = gallerySortBy;
  const reverseBtn = document.getElementById('gallery-sort-reverse-btn');
  if(reverseBtn) reverseBtn.classList.toggle('active', gallerySortReverse);
}

function onGallerySortChange(value) {
  gallerySortBy = value === 'uploadDate' ? 'uploadDate' : 'postDate';
  saveGallerySortPrefs();
  renderGalleryPage();
}

function toggleGallerySortReverse() {
  gallerySortReverse = !gallerySortReverse;
  saveGallerySortPrefs();
  renderGalleryPage();
}

function reopenPreScreen() {
  closeGalleryFS();
  showHeroScreen();
}

function renderGalleryPage() {
  const gallery=data._gallery||[];
  refreshGallerySortUI();
  document.getElementById('nb-gallery').textContent=gallery.length;
  const el=document.getElementById('gallery-grid');if(!el)return;
  if(!gallery.length){el.innerHTML=`<div class="empty" style="grid-column:1/-1"><div class="empty-icon">🖼️</div><h3>Nessuna foto ancora</h3><p>Aggiungi i vostri momenti più belli!</p></div>`;return;}
  const sorted = getSortedGalleryEntries(gallery);
  el.innerHTML=sorted.map(({ item: g, index: i })=>{
    const dateStr=g.date?parseLocalDate(g.date).toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'}):'';
    return `<div class="gallery-card">
      <div onclick="openGFS(${i})">
        ${g.img?`<img class="gallery-card-img" src="${esc(g.img)}" alt="" onerror="this.parentNode.innerHTML='<div class=gallery-card-no-img>🖼️</div>'">`:`<div class="gallery-card-no-img">🖼️</div>`}
        <div class="gallery-card-body">
          <div class="gallery-card-title">${esc(g.title||'')}</div>
          ${g.caption?`<div class="gallery-card-caption">${esc(g.caption)}</div>`:''}
          <div class="gallery-card-meta">
            ${dateStr?`<span class="meta-pill date" style="font-size:9px">📅 ${dateStr}</span>`:''}
            ${g.location?`<span class="meta-pill map" style="font-size:9px">📍 ${esc(g.location)}</span>`:''}
          </div>
        </div>
      </div>
      <div class="gallery-reactions">${galleryReactionsHtml(g)}</div>
      <div class="gallery-card-actions">
        <button class="gallery-action-btn" onclick="openInPreScreen('${g.id}')">👁️ Apri</button>
        <button class="gallery-action-btn" onclick="openGalleryModal(${i})">✏️ Modifica</button>
        <button class="gallery-action-btn del" onclick="deleteGalleryItem(${i})">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function openGalleryModal(editIdx=null) {
  galleryEditIdx=editIdx; gImgFileData='';
  document.getElementById('gallery-modal-title').textContent=editIdx!==null?'✏️ Modifica foto':'📸 Aggiungi foto';
  const g=editIdx!==null?(data._gallery||[])[editIdx]:null;
  document.getElementById('gf-title').value=g?.title||'';
  document.getElementById('gf-caption').value=g?.caption||'';
  document.getElementById('gf-date').value=g?.date||'';
  document.getElementById('gf-location').value=g?.location||'';
  document.getElementById('gf-img').value=g?.img||'';
  switchGImgTab('url');
  document.getElementById('gf-img-preview').src=''; document.getElementById('gf-img-preview').style.display='none';
  document.getElementById('gf-img-file').value='';
  document.getElementById('gimg-file-label-text').textContent="Clicca per scegliere un'immagine";
  document.getElementById('gimg-upload-status').textContent='';
  focalPoint=g?.heroFocus?{...g.heroFocus}:{x:50,y:50};
  if(g?.img) showFocalPicker(g.img,focalPoint); else hideFocalPicker();
  document.getElementById('gallery-modal-overlay').classList.add('open');
  setTimeout(()=>document.getElementById('gf-title').focus(),100);
}

function closeGalleryModal(){document.getElementById('gallery-modal-overlay').classList.remove('open');}

function saveGalleryItem(){
  const title=document.getElementById('gf-title').value.trim();if(!title)return;
  if(!data._gallery) data._gallery=[];
  const imgVal=gImgFileData||document.getElementById('gf-img').value.trim();
  const existing=galleryEditIdx!==null?data._gallery[galleryEditIdx]:null;
  const payload={
    id:existing?.id||Date.now(),
    title,caption:document.getElementById('gf-caption').value.trim(),
    date:document.getElementById('gf-date').value,
    location:document.getElementById('gf-location').value.trim(),
    img:imgVal,heroFocus:imgVal?{...focalPoint}:null,
    reactions:existing?.reactions||{}
  };
  if(galleryEditIdx!==null) data._gallery[galleryEditIdx]=payload;
  else data._gallery.unshift(payload);
  heroBuilt=false;
  closeGalleryModal();renderGalleryPage();renderHero();pushData();
  document.getElementById('nb-gallery').textContent=(data._gallery||[]).length;
}

function deleteGalleryItem(idx){
  if(!confirm('Eliminare questa foto?'))return;
  data._gallery.splice(idx,1);heroBuilt=false;
  renderGalleryPage();renderHero();pushData();
}

function switchGImgTab(tab){
  document.getElementById('gimgtab-url').classList.toggle('active',tab==='url');
  document.getElementById('gimgtab-file').classList.toggle('active',tab==='file');
  document.getElementById('gimg-panel-url').classList.toggle('active',tab==='url');
  document.getElementById('gimg-panel-file').classList.toggle('active',tab==='file');
  if(tab==='url') gImgFileData='';
}

function onGImgUrlInput(){const url=document.getElementById('gf-img').value.trim();if(url) showFocalPicker(url,focalPoint);else hideFocalPicker();}

function openGFS(idx){if(idx<0||idx>=(data._gallery||[]).length)return;gfsIndex=idx;showGFS(idx);document.getElementById('gallery-fs-overlay').classList.add('open');document.addEventListener('keydown',gfsKeyHandler);}
function showGFS(idx){const g=(data._gallery||[])[idx];if(!g)return;const total=(data._gallery||[]).length;document.getElementById('gfs-prev').style.display=idx>0?'flex':'none';document.getElementById('gfs-next').style.display=idx<total-1?'flex':'none';const imgEl=document.getElementById('gfs-img');if(g.img){imgEl.src=g.img;imgEl.style.display='block';document.getElementById('gfs-no-img').style.display='none';}else{imgEl.style.display='none';document.getElementById('gfs-no-img').style.display='flex';}document.getElementById('gfs-title').textContent=g.title||'';document.getElementById('gfs-caption').textContent=g.caption||'';const ds=g.date?parseLocalDate(g.date).toLocaleDateString('it-IT',{day:'numeric',month:'long',year:'numeric'}):'';let m='';if(ds)m+=`<span class="meta-pill date">📅 ${ds}</span>`;if(g.location)m+=`<span class="meta-pill map">📍 ${esc(g.location)}</span>`;document.getElementById('gfs-meta').innerHTML=m;const rxEl=document.getElementById('gfs-reactions');if(rxEl)rxEl.innerHTML=galleryReactionsHtml(g);bumpViewLocal(g.id);}
function navigateGFS(dir){const total=(data._gallery||[]).length;gfsIndex=Math.max(0,Math.min(total-1,gfsIndex+dir));showGFS(gfsIndex);}
function gfsKeyHandler(e){if(e.key==='ArrowLeft')navigateGFS(-1);if(e.key==='ArrowRight')navigateGFS(1);if(e.key==='Escape')closeGalleryFS();}
function closeGalleryFS(){document.getElementById('gallery-fs-overlay').classList.remove('open');document.removeEventListener('keydown',gfsKeyHandler);}

function showFocalPicker(imgSrc,fp){const wrap=document.getElementById('focal-picker-wrap');const img=document.getElementById('focal-picker-img');const hint=document.getElementById('focal-hint');img.src=imgSrc;wrap.classList.add('visible');hint.style.display='block';focalPoint=fp||{x:50,y:50};moveCrosshair(focalPoint.x,focalPoint.y);initFocalEvents();}
function hideFocalPicker(){document.getElementById('focal-picker-wrap').classList.remove('visible');document.getElementById('focal-hint').style.display='none';}
function moveCrosshair(px,py){const ch=document.getElementById('focal-crosshair');ch.style.left=px+'%';ch.style.top=py+'%';}
function getFocalFromEvent(e,wrap){const rect=wrap.getBoundingClientRect();const cx=e.touches?e.touches[0].clientX:e.clientX;const cy=e.touches?e.touches[0].clientY:e.clientY;const px=Math.max(0,Math.min(100,((cx-rect.left)/rect.width)*100));const py=Math.max(0,Math.min(100,((cy-rect.top)/rect.height)*100));return{x:Math.round(px),y:Math.round(py)};}
function initFocalEvents(){const wrap=document.getElementById('focal-picker-wrap');const fresh=wrap.cloneNode(true);wrap.parentNode.replaceChild(fresh,wrap);const onDown=e=>{e.preventDefault();focalDragging=true;const fp=getFocalFromEvent(e,fresh);focalPoint=fp;moveCrosshair(fp.x,fp.y);};const onMove=e=>{if(!focalDragging)return;e.preventDefault();const fp=getFocalFromEvent(e,fresh);focalPoint=fp;moveCrosshair(fp.x,fp.y);};const onUp=()=>{focalDragging=false;};fresh.addEventListener('mousedown',onDown,{passive:false});fresh.addEventListener('touchstart',onDown,{passive:false});document.addEventListener('mousemove',onMove,{passive:false});document.addEventListener('touchmove',onMove,{passive:false});document.addEventListener('mouseup',onUp);document.addEventListener('touchend',onUp);}

/* ═══════════════════════════════════════════════
   CALENDARIO
═══════════════════════════════════════════════ */
let calYear=new Date().getFullYear(), calMonth=new Date().getMonth();

function renderCalendar() {
  const el=document.getElementById('calendar-view');if(!el)return;
  const allItems=[];
  Object.keys(SECTIONS).forEach(s=>(data[s]||[]).forEach(i=>{if(i.date) allItems.push({...i,_s:s});}));
  const today=new Date();today.setHours(0,0,0,0);
  const firstDay=new Date(calYear,calMonth,1);
  const lastDay=new Date(calYear,calMonth+1,0);
  const startDow=(firstDay.getDay()+6)%7;
  const monthName=firstDay.toLocaleDateString('it-IT',{month:'long',year:'numeric'});
  const cells=[];
  for(let i=0;i<startDow;i++) cells.push(null);
  for(let d=1;d<=lastDay.getDate();d++) cells.push(d);
  while(cells.length%7!==0) cells.push(null);
  const eventsByDay={};
  allItems.forEach(i=>{
    const eventDate=parseLocalDate(i.date);
    let showDay=null;
    if(SECTIONS[i._s].recurring){if(eventDate.getMonth()===calMonth) showDay=eventDate.getDate();}
    else{if(eventDate.getFullYear()===calYear&&eventDate.getMonth()===calMonth) showDay=eventDate.getDate();}
    if(showDay){if(!eventsByDay[showDay]) eventsByDay[showDay]=[];eventsByDay[showDay].push(i);}
  });
  const weekdays=['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
  let gridHtml=`<div class="cal-nav">
    <button class="cal-nav-btn" onclick="calNav(-1)">‹</button>
    <div class="cal-month-label">${monthName.charAt(0).toUpperCase()+monthName.slice(1)}</div>
    <button class="cal-nav-btn" onclick="calNav(1)">›</button>
    <button class="cal-nav-btn" onclick="calToday()" style="font-size:12px;padding:6px 10px">Oggi</button>
  </div>
  <div class="cal-grid">
    ${weekdays.map(w=>`<div class="cal-weekday">${w}</div>`).join('')}
    ${cells.map(d=>{
      if(!d) return `<div class="cal-day other-month"></div>`;
      const cellDate=new Date(calYear,calMonth,d);
      const isToday=cellDate.getTime()===today.getTime();
      const events=eventsByDay[d]||[];
      const visible=events.slice(0,3);
      const more=events.length-3;
      return `<div class="cal-day${isToday?' today':''}">
        <div class="cal-day-num">${d}</div>
        ${visible.map(i=>`<span class="cal-event-dot${SECTIONS[i._s].recurring?' anniversary':''}" onclick="openDetail('${i._s}',${i.id})" title="${esc(i.title)}">${SECTIONS[i._s].icon} <span class="cal-dot-text">${esc(i.title.substring(0,8)+(i.title.length>8?'…':''))}</span></span>`).join('')}
        ${more>0?`<div class="cal-more">+${more}</div>`:''}
      </div>`;
    }).join('')}
  </div>`;
  const futureItems=[],pastItems=[];
  allItems.forEach(i=>{
    if(SECTIONS[i._s].recurring){const days=daysToNextOccurrence(i.date);if(days!==null) futureItems.push({...i,_daysLeft:days});}
    else{const d=parseLocalDate(i.date);d.setHours(0,0,0,0);const diff=Math.round((d-today)/(1000*60*60*24));if(diff>=0) futureItems.push({...i,_daysLeft:diff});else pastItems.push({...i,_daysLeft:diff});}
  });
  futureItems.sort((a,b)=>a._daysLeft-b._daysLeft);
  pastItems.sort((a,b)=>b._daysLeft-a._daysLeft);
  let timelineHtml='';
  if(futureItems.length){timelineHtml+=`<div class="timeline-section-label">Prossimi (${futureItems.length})</div><div class="timeline">`;futureItems.forEach((i,idx)=>{timelineHtml+=timelineCard(i,idx===0);});timelineHtml+='</div>';}
  if(pastItems.length){timelineHtml+=`<div class="timeline-section-label">Già vissuti (${pastItems.length})</div><div class="timeline">`;pastItems.forEach(i=>{timelineHtml+=timelineCardPast(i);});timelineHtml+='</div>';}
  if(!futureItems.length&&!pastItems.length) timelineHtml=`<div class="empty"><div class="empty-icon">📅</div><h3>Nessun evento con data</h3><p>Aggiungi date ai tuoi elementi!</p></div>`;
  el.innerHTML=gridHtml+timelineHtml;
}

function calNav(dir){calMonth+=dir;if(calMonth>11){calMonth=0;calYear++;}if(calMonth<0){calMonth=11;calYear--;}renderCalendar();}
function calToday(){calYear=new Date().getFullYear();calMonth=new Date().getMonth();renderCalendar();}

function timelineCard(i,highlight){
  const dateStr=parseLocalDate(i.date).toLocaleDateString('it-IT',{weekday:'short',day:'numeric',month:'long',year:'numeric'});
  const dl=i._daysLeft;
  const diffStr=dl===0?'Oggi 🎉':dl===1?'Domani ✨':`Tra ${dl} giorni`;
  const cats=Array.isArray(i.cats)&&i.cats.length?i.cats:(i.cat?[i.cat]:[]);
  const isRecurring=SECTIONS[i._s].recurring;
  return `<div class="timeline-item${highlight?' highlight':''}">
    <div class="timeline-dot"></div>
    <div class="timeline-card" onclick="openDetail('${i._s}',${i.id})">
      <div class="timeline-card-head">
        <div><div class="timeline-card-title">${esc(i.title)}</div><div class="timeline-card-sub">${SECTIONS[i._s].icon} ${SECTIONS[i._s].label} · ${dateStr}${isRecurring?' 🔄':''}</div></div>
        <span class="timeline-badge">${diffStr}</span>
      </div>
      ${i.note?`<div class="timeline-card-note">${esc(i.note)}</div>`:''}
      <div style="display:flex;flex-wrap:wrap;gap:4px">${cats.map(c=>`<span class="meta-pill">${esc(c)}</span>`).join('')}${i.map?`<span class="meta-pill map">📍 ${esc(i.map).substring(0,18)}</span>`:''}</div>
    </div>
  </div>`;
}

function timelineCardPast(i){
  const dateStr=parseLocalDate(i.date).toLocaleDateString('it-IT',{weekday:'short',day:'numeric',month:'long',year:'numeric'});
  const dl=Math.abs(i._daysLeft);
  const diffStr=dl===0?'Oggi':dl===1?'Ieri':`${dl} giorni fa`;
  const cats=Array.isArray(i.cats)&&i.cats.length?i.cats:(i.cat?[i.cat]:[]);
  return `<div class="timeline-item muted">
    <div class="timeline-dot"></div>
    <div class="timeline-card" onclick="openDetail('${i._s}',${i.id})">
      <div class="timeline-card-head">
        <div><div class="timeline-card-title">${esc(i.title)}</div><div class="timeline-card-sub">${SECTIONS[i._s].icon} ${SECTIONS[i._s].label} · ${dateStr}</div></div>
        <span class="timeline-badge past">${diffStr}</span>
      </div>
      ${i.note?`<div class="timeline-card-note">${esc(i.note)}</div>`:''}
      <div style="display:flex;flex-wrap:wrap;gap:4px">${cats.map(c=>`<span class="meta-pill">${esc(c)}</span>`).join('')}</div>
    </div>
  </div>`;
}

/* ═══════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════ */
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  t.onclick = () => t.remove();
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 350); }, 4000);
}

/* ═══════════════════════════════════════════════
   UTILITY
═══════════════════════════════════════════════ */
function esc(s) {
  if(!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

/* ═══════════════════════════════════════════════
   HERO PRE-SCREEN — opens every app launch
═══════════════════════════════════════════════ */
function bumpViewLocal(galleryId) {
  if(!galleryId || !COUPLE_ID) return;
  const key = `nd_views_${COUPLE_ID}`;
  let map = {};
  try { map = JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) {}
  map[galleryId] = { ts: Date.now(), count: (map[galleryId]?.count || 0) + 1 };
  try { localStorage.setItem(key, JSON.stringify(map)); } catch(e) {}
}
function getViewLocal(galleryId) {
  if(!galleryId || !COUPLE_ID) return null;
  const key = `nd_views_${COUPLE_ID}`;
  try {
    const map = JSON.parse(localStorage.getItem(key) || '{}');
    return map[galleryId] || null;
  } catch(e) { return null; }
}

function pickHeroGreeting() {
  const name = PEOPLE[myRole] || '';
  const h = new Date().getHours();
  let greets;
  if (h>=5 && h<12)       greets = [`Ciao ${name}`, `Buongiorno ${name}`, `Ehi ${name}`];
  else if (h>=12 && h<18) greets = [`Ciao ${name}`, `Ehi ${name}`, `Eccoti ${name}`];
  else if (h>=18 && h<23) greets = [`Buonasera ${name}`, `Ciao ${name}`, `Ehi ${name}`];
  else                    greets = [`Notte ${name}`, `Ehi ${name}`, `Ancora sveglio/a, ${name}`];
  return greets[Math.floor(Math.random() * greets.length)];
}

const HERO_RANDOM_TONES = ['cool', 'warm', 'green', 'amber', 'rose', 'sky', 'sunset', 'mint'];
function pickRandomHeroTone() {
  return HERO_RANDOM_TONES[Math.floor(Math.random() * HERO_RANDOM_TONES.length)];
}
function pickRandom(arr) {
  if(!arr || !arr.length) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickText(arr, fallback='') {
  return pickRandom(arr) || fallback;
}

/* Build a phrase + reason chip tailored to a specific photo's actual data. */
function buildPhotoStory(g, ctx) {
  const today = ctx.today;
  const locCount = (ctx.locMap[(g.location||'').trim()] || []).length;
  const view = getViewLocal(g.id);
  const daysSinceView = view && view.ts ? Math.floor((Date.now() - view.ts) / 86400000) : null;
  const photoDate = g.date ? parseLocalDate(g.date) : null;
  const isSameDay = photoDate &&
    photoDate.getMonth() === today.getMonth() &&
    photoDate.getDate() === today.getDate() &&
    photoDate.getFullYear() < today.getFullYear();
  const yearsAgo = isSameDay ? today.getFullYear() - photoDate.getFullYear() : null;

  const candidates = [];

  // SAME-DAY ANNIVERSARY (very strong: only fires when MM-DD matches)
  if (yearsAgo) {
    const yTxt = yearsAgo === 1 ? 'un anno fa' : `${yearsAgo} anni fa`;
    candidates.push({
      reason: pickText([`✨ Oggi, ${yTxt}`, `📸 Esattamente ${yTxt}`, `🕰️ Stesso giorno`], `✨ Oggi, ${yTxt}`),
      phrase: pickText([
        `<em>${yTxt}</em>,<br>oggi.`,
        `stesso giorno,<br><em>${yTxt}</em>.`,
        `era proprio<br><em>${yTxt}</em>.`
      ], `<em>${yTxt}</em>,<br>oggi.`),
      tone: 'warm', priority: 100
    });
  }

  // PLACE FREQUENCY — only trigger if photo HAS a location and there are ≥2 photos there
  if (g.location && locCount >= 2) {
    const locTxt = esc(g.location.trim());
    if (locCount >= 4) {
      candidates.push({
        reason: pickText([`📍 Il vostro posto`, `📍 Coordinate del cuore`, `📍 Base ufficiale`], `📍 Il vostro posto`),
        phrase: pickText([
          `siete tornati a <em>${locTxt}</em><br><em>${locCount} volte</em>.`,
          `<em>${locCount} ricordi</em><br>nello stesso angolo.`,
          `<em>${locTxt}</em>:<br>il vostro rifugio.`
        ], `siete tornati qui<br><em>${locCount} volte</em>.`),
        tone: 'cool', priority: 70
      });
    } else {
      candidates.push({
        reason: pickText([`📍 ${locTxt}`, `🗺️ Stesso posto`, `📍 Già stati qui`], `📍 ${locTxt}`),
        phrase: pickText([
          `un altro momento<br>a <em>${locTxt}</em>.`,
          `<em>${locTxt}</em>,<br>di nuovo.`,
          `qui ci siete tornati<br><em>${locCount} volte</em>.`
        ], `<em>${locTxt}</em>,<br>di nuovo.`),
        tone: 'cool', priority: 60
      });
    }
  } else if (g.location) {
    // Single visit to that location
    const locTxt = esc(g.location.trim());
    candidates.push({
      reason: pickText([`📍 ${locTxt}`, `🗺️ Quel giorno a…`, `📍 Coordinate`], `📍 ${locTxt}`),
      phrase: pickText([
        `un attimo<br>a <em>${locTxt}</em>.`,
        `<em>${locTxt}</em>,<br>quel giorno.`,
        `eravate a<br><em>${locTxt}</em>.`
      ], `un attimo<br>a <em>${locTxt}</em>.`),
      tone: 'sky', priority: 50
    });
  }

  // FORGOTTEN — based on actual view data
  if (daysSinceView !== null && daysSinceView > 30) {
    candidates.push({
      reason: pickText([`💭 Ricordo dimenticato`, `🕰️ È passato un po'`, `📷 Tornaci sopra`], `💭 Ricordo dimenticato`),
      phrase: pickText([
        `Non l'apri da<br><em>${daysSinceView} giorni</em>.`,
        `<em>${daysSinceView} giorni</em><br>che non la guardavi.`,
        `Sospesa lì da<br><em>${daysSinceView} giorni</em>.`
      ], `Non l'apri da<br><em>${daysSinceView} giorni</em>.`),
      tone: 'amber', priority: 65
    });
  } else if (daysSinceView !== null && daysSinceView > 7) {
    candidates.push({
      reason: pickText([`💭 Mini rewind`, `📷 Memoria in pausa`, `✨ Te la ricordavi?`], `💭 Mini rewind`),
      phrase: pickText([
        `<em>${daysSinceView} giorni</em><br>che era ferma qui.`,
        `Te la ricordavi?<br><em>${daysSinceView} giorni</em> fa.`,
        `Riapertura dopo<br><em>${daysSinceView} giorni</em>.`
      ], `Te la ricordavi?<br><em>${daysSinceView} giorni</em> fa.`),
      tone: 'amber', priority: 45
    });
  } else if (daysSinceView === null) {
    candidates.push({
      reason: pickText([`💭 Mai aperta`, `📷 In attesa`, `🫣 Inedita per te`], `💭 Mai aperta`),
      phrase: pickText([
        `Aspetta solo<br>un tuo sguardo.`,
        `Mai aperta<br>fino ad ora.`,
        `Ferma qui,<br>in silenzio.`
      ], `Aspetta solo<br>un tuo sguardo.`),
      tone: 'mint', priority: 40
    });
  }

  // OLD PHOTO (date in the past, not same-day)
  if (photoDate && !yearsAgo) {
    const diffDays = Math.floor((today - photoDate) / 86400000);
    if (diffDays >= 365) {
      const years = Math.floor(diffDays / 365);
      const yTxt = years === 1 ? 'un anno fa' : `${years} anni fa`;
      candidates.push({
        reason: pickText([`🕰️ ${yTxt}`, `📸 Tempo fa`, `✨ Memoria d'archivio`], `🕰️ ${yTxt}`),
        phrase: pickText([
          `era <em>${yTxt}</em>.`,
          `<em>${yTxt}</em>,<br>vi ricordate?`,
          `un pezzo di<br><em>${yTxt}</em>.`
        ], `era <em>${yTxt}</em>.`),
        tone: 'sunset', priority: 35
      });
    } else if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      const mTxt = months === 1 ? 'un mese fa' : `${months} mesi fa`;
      candidates.push({
        reason: pickText([`📅 ${mTxt}`, `🕰️ Qualche mese fa`, `📸 Tempo recente`], `📅 ${mTxt}`),
        phrase: pickText([
          `<em>${mTxt}</em>,<br>esattamente.`,
          `era <em>${mTxt}</em>.`,
          `solo <em>${mTxt}</em>:<br>vi ricordate?`
        ], `era <em>${mTxt}</em>.`),
        tone: 'rose', priority: 30
      });
    } else if (diffDays >= 1) {
      const dTxt = diffDays === 1 ? 'ieri' : `${diffDays} giorni fa`;
      candidates.push({
        reason: pickText([`📅 ${dTxt}`, `📸 Recente`, `✨ Fresco fresco`], `📅 ${dTxt}`),
        phrase: pickText([
          `<em>${dTxt}</em>.`,
          `solo <em>${dTxt}</em>.`,
          `era <em>${dTxt}</em>.`
        ], `era <em>${dTxt}</em>.`),
        tone: 'mint', priority: 25
      });
    }
  }

  // CAPTION-DRIVEN — use the actual caption text if it's short and meaningful
  if (g.caption && g.caption.trim().length > 0 && g.caption.trim().length < 80) {
    candidates.push({
      reason: pickText([`💬 Le tue parole`, `✍️ Come l'hai descritta`, `📝 Dalla didascalia`], `💬 Le tue parole`),
      phrase: `<em>"${esc(g.caption.trim())}"</em>`,
      tone: 'rose', priority: 28
    });
  }

  // TITLE-DRIVEN — use the actual title
  if (g.title && g.title.trim()) {
    const t = esc(g.title.trim());
    candidates.push({
      reason: pickText([`✨ ${t}`, `📷 Quel momento`, `💫 Da rivedere`], `✨ Un ricordo`),
      phrase: pickText([
        `<em>${t}</em>.`,
        `ti ricordi<br><em>${t}</em>?`,
        `riapriamo<br><em>${t}</em>.`
      ], `<em>${t}</em>.`),
      tone: pickRandomHeroTone(), priority: 20
    });
  }

  // GENERIC FALLBACK — always available
  candidates.push({
    reason: pickText([`🌙 Un attimo`, `✨ Un ricordo`, `📷 Per voi due`, `💫 Solo voi`], `🌙 Un ricordo`),
    phrase: pickText([
      `un frammento<br>di <em>voi due</em>.`,
      `un attimo<br>che avete tenuto.`,
      `da rivedere<br><em>insieme</em>.`,
      `un piccolo<br><em>per sempre</em>.`
    ], `un frammento<br>di <em>voi due</em>.`),
    tone: pickRandomHeroTone(), priority: 10
  });

  // Pick weighted by priority — pick the highest priority bucket then random within bucket.
  // To keep variety across launches, mix top-2 buckets if available.
  candidates.sort((a, b) => b.priority - a.priority);
  const top = candidates[0];
  const second = candidates.find(c => c.priority < top.priority);
  // 70% chance highest, 30% chance second-highest (if exists) — adds variation per launch
  const chosen = (second && Math.random() < 0.3) ? second : top;
  return chosen;
}

function pickHeroMemories() {
  const gallery = (data._gallery || []).filter(g => g.img);
  if (!gallery.length) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build a location → photos map once, used by buildPhotoStory
  const locMap = {};
  gallery.forEach(g => {
    if (g.location) {
      const k = g.location.trim();
      if (!locMap[k]) locMap[k] = [];
      locMap[k].push(g);
    }
  });

  // Weighted random selection — boost less-recently-viewed photos so the rotation
  // doesn't always favor the same image. Each photo gets a weight; we sample
  // without replacement until we have up to 6 (or all of them).
  const now = Date.now();
  const weighted = gallery.map(g => {
    const v = getViewLocal(g.id);
    let w;
    if (!v) {
      w = 5; // never opened → strong boost
    } else {
      const daysSince = (now - v.ts) / 86400000;
      // 1 base + up to 4 boost as days grow, minus penalty for high view count
      w = 1 + Math.min(4, daysSince / 7) - Math.min(0.7, (v.count || 0) * 0.1);
      w = Math.max(0.3, w);
    }
    return { g, w };
  });

  function sampleWeighted(pool) {
    const total = pool.reduce((s, x) => s + x.w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].w;
      if (r <= 0) return i;
    }
    return pool.length - 1;
  }

  const picked = [];
  const pool = weighted.slice();
  const target = Math.min(6, gallery.length);
  while (picked.length < target && pool.length) {
    const i = sampleWeighted(pool);
    picked.push(pool[i].g);
    pool.splice(i, 1);
  }

  const ctx = { today, locMap };
  return picked.map(g => {
    const story = buildPhotoStory(g, ctx);
    return {
      kind: 'photo',
      item: g,
      reason: story.reason,
      phrase: story.phrase,
      tone: story.tone || 'cool'
    };
  });
}

function buildMemoryPills(m) {
  const pills = [];
  const item = m.item;
  if (!item) return pills;
  if (item.date) {
    const d = parseLocalDate(item.date);
    if (d) pills.push(`📅 ${d.toLocaleDateString('it-IT',{day:'numeric',month:'short',year:'numeric'})}`);
  }
  if (item.location) pills.push(`📍 ${esc(item.location)}`);
  const reactions = item.reactions || {};
  const totalRx = Object.values(reactions).reduce((s, arr) => s + (arr?.length || 0), 0);
  if (totalRx > 0) {
    const emojis = Object.keys(reactions).slice(0,3).join('');
    pills.push(`${emojis} ${totalRx} reazion${totalRx===1?'e':'i'}`);
  }
  const v = getViewLocal(item.id);
  if (v && v.count > 1) pills.push(`👁️ vista ${v.count} volte`);
  return pills;
}

function renderHeroMemory(m, i, total) {
  const item = m.item;
  const photoBg = item?.img
    ? `background-image:url('${esc(item.img)}')${item.heroFocus?`;background-position:${item.heroFocus.x}% ${item.heroFocus.y}%`:''}`
    : '';
  const greeting = pickHeroGreeting();
  const pills = buildMemoryPills(m).map(p => `<span class="hero-pill">${p}</span>`).join('');
  const captionHtml = item?.caption
    ? `<div class="hero-caption">"${esc(item.caption)}"</div><div class="hero-caption-author">— ${esc(item.title || '')}</div>`
    : item?.title
      ? `<div class="hero-caption-author" style="margin-top:0">${esc(item.title)}</div>`
      : '';
  const railDots = Array.from({length: total}, (_, k) =>
    `<span class="hero-rail-dot${k===i?' active':''}"></span>`
  ).join('');
  const isLast = i === total - 1;
  const swipeHint = isLast ? '' : `<div class="hero-swipe-hint"><span class="arrow"></span> swipe</div>`;
  const itemId = item?.id ? `'${item.id}'` : 'null';
  const ctaLabel = isLast ? 'Entra in Noi Due' : (item ? 'Apri ricordo' : 'Avanti');
  const ctaAction = isLast
    ? `dismissHero()`
    : item ? `dismissHeroAndOpen(${itemId})` : `dismissHero()`;

  return `<section class="hero-memory" data-tone="${m.tone || 'cool'}">
    ${item?.img ? `<div class="hero-photo" style="${photoBg}"></div>` : `<div class="hero-photo hero-photo-empty"></div>`}
    <div class="hero-memory-top">
      <span class="hero-reason-chip">${m.reason}</span>
      <div class="hero-top-actions">
        <span class="hero-counter">${i+1} / ${total}</span>
      </div>
    </div>
    <div class="hero-rail">${railDots}</div>
    <div class="hero-greet-wrap">
      <div class="hero-hello">${esc(greeting)},</div>
      <div class="hero-phrase">${m.phrase}</div>
    </div>
    <div class="hero-bottom">
      ${captionHtml}
      ${pills ? `<div class="hero-pills">${pills}</div>` : ''}
    </div>
    ${swipeHint}
    <div class="hero-enter-bar">
      <button class="hero-enter-btn" onclick="${ctaAction}">${ctaLabel} →</button>
      <button class="hero-icon-btn" onclick="dismissHero()" title="Chiudi">✕</button>
    </div>
  </section>`;
}

function renderHeroEmpty() {
  const name = PEOPLE[myRole] || '';
  return `<section class="hero-memory" data-tone="cool">
    <div class="hero-photo hero-photo-empty"></div>
    <div class="hero-memory-top"><span class="hero-reason-chip">🌙 Inizia qui</span><span class="hero-counter">1 / 1</span></div>
    <div class="hero-greet-wrap">
      <div class="hero-hello">Ciao ${esc(name)},</div>
      <div class="hero-phrase">il vostro spazio<br>è <em>nuovo</em>.</div>
    </div>
    <div class="hero-bottom">
      <div class="hero-caption-author" style="margin-top:0">Aggiungete la prima foto per riempire questa schermata di ricordi.</div>
    </div>
    <div class="hero-enter-bar">
      <button class="hero-enter-btn" onclick="dismissHero();showPage('gallery');">Aggiungi una foto →</button>
      <button class="hero-icon-btn" onclick="dismissHero()" title="Chiudi">✕</button>
    </div>
  </section>`;
}

function buildSinglePhotoMemory(g) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const locMap = {};
  (data._gallery || []).forEach(x => {
    if (x.location) {
      const k = x.location.trim();
      if (!locMap[k]) locMap[k] = [];
      locMap[k].push(x);
    }
  });
  const story = buildPhotoStory(g, { today, locMap });
  return { kind: 'photo', item: g, reason: story.reason, phrase: story.phrase, tone: story.tone || 'cool' };
}

function openInPreScreen(galleryId) {
  const gallery = (data._gallery || []).filter(g => g.img);
  const g = gallery.find(x => String(x.id) === String(galleryId));
  if (!g) return;
  const memories = [buildSinglePhotoMemory(g)];
  const screen = document.getElementById('hero-screen');
  const stories = document.getElementById('hero-stories');
  if (!screen || !stories) return;
  stories.innerHTML = memories.map((m, i) => renderHeroMemory(m, i, memories.length)).join('');
  stories.scrollTop = 0;
  screen.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showHeroScreen() {
  const screen = document.getElementById('hero-screen');
  const stories = document.getElementById('hero-stories');
  if (!screen || !stories) return;
  const memories = pickHeroMemories();
  if (!memories.length) {
    stories.innerHTML = renderHeroEmpty();
  } else {
    stories.innerHTML = memories.map((m, i) => renderHeroMemory(m, i, memories.length)).join('');
  }
  stories.scrollTop = 0;
  screen.classList.add('open');
  document.body.style.overflow = 'hidden';
  // Track active rail dot on scroll
  const memEls = stories.querySelectorAll('.hero-memory');
  const update = () => {
    const h = stories.clientHeight;
    const idx = Math.round(stories.scrollTop / h);
    memEls.forEach((el, i) => {
      el.querySelectorAll('.hero-rail-dot').forEach((d, k) => d.classList.toggle('active', k === idx));
    });
  };
  stories.addEventListener('scroll', update, { passive: true });
}

function dismissHero() {
  const screen = document.getElementById('hero-screen');
  if (!screen) return;
  screen.classList.add('closing');
  setTimeout(() => {
    screen.classList.remove('open', 'closing');
    document.body.style.overflow = '';
  }, 320);
}

function dismissHeroAndOpen(galleryId) {
  const idx = (data._gallery || []).findIndex(g => String(g.id) === String(galleryId));
  dismissHero();
  if (idx >= 0) setTimeout(() => openGFS(idx), 380);
}
