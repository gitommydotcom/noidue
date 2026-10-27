/* ═══════════════════════════════════════════════
   NOI DUE — Canzoni nei bigliettini
   Cerca per titolo (catalogo iTunes: gratis, senza chiave) → copertina,
   artista e anteprima di 30 secondi che si ascolta dentro il bigliettino.
   Si può anche incollare un link di Spotify, YouTube o Apple Music.
   Nel bigliettino: link (come prima) + song { title, artist, cover, preview, apple }.
═══════════════════════════════════════════════ */

const ytId = url => { const m = String(url || '').match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/|music\.youtube\.com\/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})/); return m ? m[1] : null; };
const spRef = url => { const m = String(url || '').match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|episode|show)\/([A-Za-z0-9]+)/); return m ? { type: m[1], id: m[2] } : null; };
const isSongLink = v => /^https?:\/\/\S+$/i.test(String(v || '').trim());
const httpsOnly = u => (/^https:\/\//.test(u || '') ? u : '');

/* ───────── rete ───────── */
// JSONP: l'API di iTunes lo supporta e funziona anche dove le richieste dirette sarebbero bloccate
function jsonp(url, ms = 8000) {
  return new Promise((resolve, reject) => {
    const cb = '__ndSong' + Date.now() + Math.floor(Math.random() * 1e4);
    const s = document.createElement('script');
    const done = (err, res) => { clearTimeout(t); delete window[cb]; s.remove(); err ? reject(err) : resolve(res); };
    const t = setTimeout(() => done(new Error('timeout')), ms);
    window[cb] = res => done(null, res);
    s.onerror = () => done(new Error('rete'));
    s.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + cb;
    document.head.appendChild(s);
  });
}
async function fetchJson(url, ms = 6000) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try { const r = await fetch(url, { signal: c.signal }); return r.ok ? await r.json() : null; }
  catch (e) { return null; } finally { clearTimeout(t); }
}

function songFromItunes(x) {
  return {
    title: x.trackName || '', artist: x.artistName || '',
    cover: httpsOnly((x.artworkUrl100 || '').replace(/\/\d+x\d+bb\./, '/600x600bb.')),
    preview: httpsOnly(x.previewUrl || ''), apple: httpsOnly(x.trackViewUrl || ''),
  };
}

async function searchSongs(q) {
  const r = await jsonp(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&country=it&limit=8`);
  return (r.results || []).filter(x => x.trackName).map(songFromItunes);
}

const normSong = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\(.*?\)|\[.*?\]/g, '').replace(/official|video|audio|lyrics?|testo|videoclip|hd|4k/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

// Da un titolo trovato altrove (Spotify, YouTube) cerca la stessa canzone su iTunes per avere l'anteprima
async function matchOnItunes(title, artistHint = '') {
  const res = await searchSongs([title, artistHint].filter(Boolean).join(' ')).catch(() => []);
  const t = normSong(title), a = normSong(artistHint);
  return res.find(x => {
    const xt = normSong(x.title), xa = normSong(x.artist);
    return xt && (t.includes(xt) || xt.includes(t)) && (!a || a.includes(xa) || xa.includes(a) || t.includes(xa));
  }) || null;
}

// Prova a ricavare titolo, artista, copertina (e se possibile l'anteprima) da un link
async function lookupSongByLink(link) {
  const am = link.match(/music\.apple\.com\/.*[?&]i=(\d+)/) || link.match(/music\.apple\.com\/[^?#]*\/song\/(?:[^/]+\/)?(\d+)/);
  if (am) {
    const r = await jsonp(`https://itunes.apple.com/lookup?id=${am[1]}&country=it`).catch(() => null);
    const x = r && (r.results || []).find(y => y.trackName);
    return x ? songFromItunes(x) : null;
  }
  const sp = spRef(link), yt = ytId(link);
  if (!sp && !yt) return null;
  let meta = null;
  if (sp) {
    const o = await fetchJson('https://open.spotify.com/oembed?url=' + encodeURIComponent(link)) || await fetchJson('https://noembed.com/embed?url=' + encodeURIComponent(link));
    if (o && o.title) meta = { title: o.title, artist: '', cover: httpsOnly(o.thumbnail_url || '') };
  } else {
    const o = await fetchJson('https://noembed.com/embed?url=' + encodeURIComponent(link));
    if (o && o.title) {
      // "Artista - Titolo (Official Video)"
      const parts = o.title.split(/\s[-–—]\s/);
      meta = parts.length > 1 ? { title: parts.slice(1).join(' - ').replace(/\s*[\(\[].*?[\)\]]\s*/g, ' ').trim(), artist: parts[0].trim() }
                              : { title: o.title, artist: (o.author_name || '').replace(/\s*-\s*Topic$/, '') };
      meta.cover = `https://img.youtube.com/vi/${yt}/hqdefault.jpg`;
    }
  }
  // Spotify non dice l'artista: meglio non rischiare l'anteprima di un'altra versione, c'è già il suo player
  if (!meta || sp || !meta.artist) return meta;
  const hit = await matchOnItunes(meta.title, meta.artist);
  return hit ? { ...hit, cover: hit.cover || meta.cover } : meta;
}

/* ───────── interfaccia ───────── */
function songOf(n) {
  const s = n.song || {};
  return { title: s.title || '', artist: s.artist || '', cover: httpsOnly(s.cover), preview: httpsOnly(s.preview), apple: httpsOnly(s.apple) };
}

function songLinksHtml(n) {
  const s = songOf(n), link = n.link || '';
  const q = encodeURIComponent([s.title, s.artist].filter(Boolean).join(' '));
  const out = [];
  const sp = spRef(link) ? link : (q ? `https://open.spotify.com/search/${q}` : '');
  const yt = ytId(link) ? link : (q ? `https://www.youtube.com/results?search_query=${q}` : '');
  const am = s.apple || (/music\.apple\.com/.test(link) ? link : (q ? `https://music.apple.com/it/search?term=${q}` : ''));
  if (sp) out.push(`<a class="song-link" href="${esc(sp)}" target="_blank" rel="noopener">${icon('play', 13)} Spotify</a>`);
  if (yt) out.push(`<a class="song-link" href="${esc(yt)}" target="_blank" rel="noopener">${icon('play', 13)} YouTube</a>`);
  if (am) out.push(`<a class="song-link" href="${esc(am)}" target="_blank" rel="noopener">${icon('play', 13)} Apple Music</a>`);
  if (!out.length && isSongLink(link)) out.push(`<a class="song-link" href="${esc(link)}" target="_blank" rel="noopener">${icon('music', 13)} Ascolta</a>`);
  return out.length ? `<div class="song-links">${out.join('')}</div>` : '';
}

// Disco che esce dalla copertina e gira mentre suona
function vinylHtml(s) {
  const img = s.cover ? `<img src="${esc(s.cover)}" alt="" loading="lazy">` : `<span class="vinyl-blank">${icon('music', 40)}</span>`;
  return `<div class="vinyl">
    <div class="vinyl-disc"><div class="vinyl-spin">${s.cover ? `<img src="${esc(s.cover)}" alt="">` : ''}<i></i></div></div>
    <div class="vinyl-sleeve">${img}</div>
  </div>`;
}

function songCardHtml(n) {
  const s = songOf(n), link = n.link || '';
  const sp = spRef(link), yt = ytId(link);
  const meta = s.title ? `<div class="song-meta"><b>${esc(s.title)}</b>${s.artist ? `<small>${esc(s.artist)}</small>` : ''}</div>` : '';

  // anteprima ascoltabile qui dentro
  if (s.preview) {
    return `<div class="song" data-preview="${esc(s.preview)}">
      ${vinylHtml(s)}
      <div class="song-row">${meta}<button type="button" class="song-play" aria-label="Ascolta">${icon('play', 22)}</button></div>
      <div class="song-bar"><i></i></div>
      ${songLinksHtml(n)}
    </div>`;
  }
  // player del servizio (mostra già titolo e copertina)
  if (sp) {
    return `<div class="song">
      <div class="song-embed sp"><iframe src="https://open.spotify.com/embed/${sp.type}/${sp.id}?utm_source=generator" width="100%" height="152" frameborder="0" loading="eager" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></div>
      ${songLinksHtml(n)}
    </div>`;
  }
  if (yt) {
    return `<div class="song">
      <div class="song-embed yt"><iframe src="https://www.youtube-nocookie.com/embed/${yt}?playsinline=1&rel=0" frameborder="0" loading="eager" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>
      ${songLinksHtml(n)}
    </div>`;
  }
  let domain = ''; try { domain = new URL(link).hostname.replace(/^www\./, ''); } catch (e) {}
  return `<div class="song">
    ${vinylHtml(s)}
    ${meta || `<div class="song-meta"><b>Una canzone per te</b>${domain ? `<small>${esc(domain)}</small>` : ''}</div>`}
    ${songLinksHtml(n)}
  </div>`;
}

function songMiniHtml(n) {
  const s = songOf(n);
  return `<div class="note-song-mini">
    ${s.cover ? `<img src="${esc(s.cover)}" alt="" loading="lazy">` : `<span class="nsm-ic">${icon('music', 18)}</span>`}
    <span><b>${esc(s.title || 'Una canzone per te')}</b>${s.artist ? `<small>${esc(s.artist)}</small>` : ''}</span>
  </div>`;
}

/* ───────── riproduzione (una canzone alla volta) ───────── */
let songAudio = null, songEl = null;
function stopSong() {
  if (songAudio) { songAudio.pause(); songAudio.src = ''; }
  if (songEl) { songEl.classList.remove('playing'); const b = songEl.querySelector('.song-play'); if (b) b.innerHTML = icon('play', 22); const bar = songEl.querySelector('.song-bar i'); if (bar) bar.style.width = '0%'; }
  songAudio = null; songEl = null;
}
function bindSongPlayers(root) {
  root.querySelectorAll('.song[data-preview]').forEach(el => {
    const btn = el.querySelector('.song-play'); if (!btn || btn._bound) return;
    btn._bound = true;
    const toggle = e => {
      e.stopPropagation();
      if (songEl === el) { stopSong(); return; }
      stopSong();
      const a = new Audio(el.dataset.preview);
      songAudio = a; songEl = el;
      el.classList.add('playing'); btn.innerHTML = icon('pause', 22);
      const bar = el.querySelector('.song-bar i');
      a.addEventListener('timeupdate', () => { if (bar && a.duration) bar.style.width = (a.currentTime / a.duration * 100) + '%'; });
      a.addEventListener('ended', stopSong);
      a.play().catch(() => { stopSong(); toast('Non riesco a farla partire: prova dai pulsanti qui sotto'); });
    };
    btn.addEventListener('click', toggle);
    const v = el.querySelector('.vinyl'); if (v) v.addEventListener('click', toggle);
  });
}

/* ───────── scelta della canzone (nel form del bigliettino) ───────── */
function songPickerHtml() {
  return `<div class="song-pick">
    <label class="song-search">${icon('search', 18)}<input class="song-input" name="link" type="search" enterkeyhint="search" autocomplete="off" placeholder="Cerca titolo o artista, o incolla un link"></label>
    <div class="song-results"></div>
    <div class="song-chosen"></div>
  </div>`;
}

// restituisce () => { link, song } della canzone scelta (o null)
function bindSongPicker(root) {
  const input = root.querySelector('.song-input');
  const results = root.querySelector('.song-results');
  const chosenBox = root.querySelector('.song-chosen');
  let chosen = null, timer = 0, seq = 0, found = [];

  const showChosen = () => {
    stopSong();
    chosenBox.innerHTML = chosen ? songCardHtml({ link: chosen.link, song: chosen.song }) : '';
    bindSongPlayers(chosenBox);
  };
  const choose = (link, song) => { chosen = { link: link || '', song: song || null }; results.innerHTML = ''; showChosen(); };

  const run = async () => {
    const v = input.value.trim();
    const my = ++seq;
    if (!v) { results.innerHTML = ''; return; }
    if (isSongLink(v)) {
      choose(v, null);
      const meta = await lookupSongByLink(v).catch(() => null);
      if (my === seq && meta && chosen && chosen.link === v) { chosen.song = meta; showChosen(); }
      return;
    }
    if (v.length < 2) return;
    results.innerHTML = `<p class="song-msg">Cerco…</p>`;
    try {
      found = await searchSongs(v);
      if (my !== seq) return;
      results.innerHTML = found.length
        ? found.map((s, i) => `<button type="button" class="song-res" data-i="${i}">
            ${s.cover ? `<img src="${esc(s.cover.replace('600x600bb', '120x120bb'))}" alt="" loading="lazy">` : `<span class="nsm-ic">${icon('music', 18)}</span>`}
            <span><b>${esc(s.title)}</b><small>${esc(s.artist)}</small></span>
            ${icon('plus', 18, 'chev')}
          </button>`).join('')
        : `<p class="song-msg">Nessuna canzone trovata. Puoi anche incollare il link da Spotify o YouTube.</p>`;
    } catch (e) {
      if (my === seq) results.innerHTML = `<p class="song-msg">Non riesco a cercare adesso. Incolla il link della canzone da Spotify, YouTube o Apple Music.</p>`;
    }
  };
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, isSongLink(input.value.trim()) ? 0 : 450); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(timer); run(); input.blur(); } });
  results.addEventListener('click', e => {
    const b = e.target.closest('.song-res'); if (!b) return;
    const s = found[+b.dataset.i]; if (s) choose(s.apple, s);
  });

  return () => {
    if (chosen) return chosen;
    const v = input.value.trim();
    return isSongLink(v) ? { link: v, song: null } : null;
  };
}
