/* ══════════════════════════════════════════════════════════
   VELVET SOUND STUDIO — app.js
   Luxury Personal Music Vault · No backend · GitHub Pages
══════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────
   STATE
────────────────────────────────────────────────────── */
const VSS = {
  playlists:       [],
  songs:           [],
  lyrics:          {},
  favorites:       JSON.parse(localStorage.getItem('vss_favorites') || '[]'),
  currentIndex:    -1,
  currentPlaylist: null,
  isPlaying:       false,
  shuffle:         false,
  repeat:          'none',   // 'none' | 'one' | 'all'
  shuffleQueue:    [],
  currentFilter:   'All',
  searchQuery:     '',
  volume:          parseFloat(localStorage.getItem('vss_volume') || '0.7'),
  isDraggingProgress: false,
  isDraggingVolume:   false,
  lyricsInterval:  null,
  lyricLines:      [],
};

/* ──────────────────────────────────────────────────────
   DOM CACHE
────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const DOM = {
  loadingScreen:  $('loading-screen'),
  navbar:         $('navbar'),
  navLinks:       $('nav-links'),
  hamburger:      $('nav-hamburger'),
  audio:          $('audio-engine'),
  playerCover:    $('player-cover'),
  playerTitle:    $('player-title'),
  playerArtist:   $('player-artist'),
  playerFavBtn:   $('player-fav-btn'),
  ctrlPlay:       $('ctrl-play'),
  ctrlPrev:       $('ctrl-prev'),
  ctrlNext:       $('ctrl-next'),
  ctrlShuffle:    $('ctrl-shuffle'),
  ctrlRepeat:     $('ctrl-repeat'),
  playerProgress: $('player-progress'),
  playerFill:     $('player-fill'),
  playerThumb:    $('player-thumb'),
  playerCurrent:  $('player-current'),
  playerDuration: $('player-duration'),
  playerVolume:   $('player-volume'),
  volumeFill:     $('volume-fill'),
  volumeThumb:    $('volume-thumb'),
  heroVinyl:      $('hero-vinyl'),
  playlistGrid:   $('playlist-grid'),
  songList:       $('song-list'),
  favoritesList:  $('favorites-list'),
  searchInput:    $('search-input'),
  filterWrap:     $('filter-wrap'),
  lyricsScroll:   $('lyrics-scroll'),
  lyricsLines:    $('lyrics-lines'),
  lyricsBanner:   $('lyrics-banner'),
  lyricsCover:    $('lyrics-cover'),
  lyricsTrackName: $('lyrics-track-name'),
  lyricsTrackArtist: $('lyrics-track-artist'),
  statSongs:      $('stat-songs'),
  statPlaylists:  $('stat-playlists'),
  statFavorites:  $('stat-favorites'),
  statHours:      $('stat-hours'),
  modalOverlay:   $('modal-overlay'),
  playlistModal:  $('playlist-modal'),
  modalClose:     $('modal-close'),
  modalCover:     $('modal-cover'),
  modalTitle:     $('modal-title'),
  modalDesc:      $('modal-desc'),
  modalTracks:    $('modal-tracks'),
  bgCanvas:       $('bg-particles'),
  loadCanvas:     $('loading-particles'),
};

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
async function init() {
  startLoadingParticles();
  await loadData();
  buildParticles();
  buildPlaylists();
  buildSongList();
  buildFavorites();
  buildStats();
  buildFilters();
  bindPlayerEvents();
  bindNavEvents();
  bindSearchEvents();
  bindModalEvents();
  bindScrollEvents();
  bindParallax();
  setVolume(VSS.volume);
  animateReveal();

  // Hide loading screen after animation
  setTimeout(() => {
    DOM.loadingScreen.classList.add('hidden');
  }, 2800);
}

/* ──────────────────────────────────────────────────────
   DATA LOADING
────────────────────────────────────────────────────── */
async function loadData() {
  try {
    const [plRes, lyRes] = await Promise.all([
      fetch('data/playlists.json'),
      fetch('data/lyrics.json'),
    ]);
    const plData = await plRes.json();
    const lyData = await lyRes.json();
    VSS.playlists = plData.playlists;
    VSS.songs     = plData.songs;
    VSS.lyrics    = lyData;
  } catch (e) {
    console.warn('VSS: Could not load data files. Using fallback demo data.', e);
    loadFallbackData();
  }
}

function loadFallbackData() {
  VSS.playlists = [
    { id: 'pl1', name: 'Midnight Drive', description: 'Dark roads and neon lights.', mood: 'Nocturnal', icon: '🌙', gradient: 'linear-gradient(135deg,#1a0a2e,#16213e)', songs: ['s1','s2','s3'] },
    { id: 'pl2', name: 'Luxury Nights', description: 'Silk and cognac vibes.', mood: 'Opulent', icon: '🥂', gradient: 'linear-gradient(135deg,#2c1810,#4a2820)', songs: ['s4','s5','s6'] },
    { id: 'pl3', name: 'Focus Mode', description: 'Deep concentration. Zero distractions.', mood: 'Focused', icon: '⚡', gradient: 'linear-gradient(135deg,#0a1628,#162848)', songs: ['s7','s8'] },
    { id: 'pl4', name: 'Rain Memories', description: 'Nostalgia on a grey afternoon.', mood: 'Melancholic', icon: '🌧️', gradient: 'linear-gradient(135deg,#0e1e30,#1a3040)', songs: ['s1','s4','s9'] },
    { id: 'pl5', name: 'Motivation Zone', description: 'Build. Push. Dominate.', mood: 'Driven', icon: '🔥', gradient: 'linear-gradient(135deg,#1a0a0a,#2e1010)', songs: ['s2','s5','s7'] },
  ];
  VSS.songs = [
    { id:'s1', title:'Obsidian Nights',    artist:'The Architects', genre:'Electronic', duration:'4:22', src:'' },
    { id:'s2', title:'Carbon Drive',       artist:'NOIR',           genre:'Electronic', duration:'3:58', src:'' },
    { id:'s3', title:'Velvet Underground', artist:'Glass Echo',     genre:'Ambient',    duration:'5:11', src:'' },
    { id:'s4', title:'Cognac & Rain',      artist:'Luna Grey',      genre:'Jazz',       duration:'4:44', src:'' },
    { id:'s5', title:'Gold Rush',          artist:'The Architects', genre:'Electronic', duration:'3:37', src:'' },
    { id:'s6', title:'Midnight Protocol',  artist:'NOIR',           genre:'Electronic', duration:'6:02', src:'' },
    { id:'s7', title:'Cipher',            artist:'Axon',           genre:'Electronic', duration:'4:15', src:'' },
    { id:'s8', title:'Deep Focus',        artist:'Orbital Drift',  genre:'Ambient',    duration:'7:30', src:'' },
    { id:'s9', title:'One Less Lonely Girl',   artist:'Luna Grey',      genre:'Soul',       duration:'4:08', src:'' },
  ];
  VSS.lyrics = {
    s1: { lines: [
      { time: 2,  text: 'The city sleeps beneath obsidian skies' },
      { time: 5,  text: 'A thousand lights dissolving in the rain' },
      { time: 9,  text: 'I drive alone on roads without a name' },
      { time: 13, text: 'Where shadows dance and silence never dies' },
      { time: 18, text: 'There is a place between the dark and dawn' },
      { time: 22, text: 'Where all the things I never said live on' },
      { time: 27, text: 'Obsidian — cold and still and vast' },
      { time: 31, text: 'A mirror holding everything I\'ve passed' },
    ]},
    s2: { lines: [
      { time: 2,  text: 'Carbon black on carbon black' },
      { time: 5,  text: 'Engine hum, no turning back' },
      { time: 9,  text: 'The highway bends toward morning light' },
      { time: 13, text: 'I am the driver, I am the night' },
      { time: 17, text: 'Speed is just another word for free' },
      { time: 21, text: 'The road knows what I cannot see' },
    ]},
  };
}

/* ══════════════════════════════════════════════════════
   PARTICLES — BACKGROUND
══════════════════════════════════════════════════════ */
function buildParticles() {
  const canvas = DOM.bgCanvas;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const count = Math.min(60, Math.floor(window.innerWidth / 20));
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,
      dx: (Math.random() - 0.5) * 0.18,
      dy: (Math.random() - 0.5) * 0.18,
      alpha: Math.random() * 0.4 + 0.1,
      gold: Math.random() < 0.3,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.gold
        ? `rgba(196,160,98,${p.alpha})`
        : `rgba(255,255,255,${p.alpha * 0.4})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

function startLoadingParticles() {
  const canvas = DOM.loadCanvas;
  const ctx = canvas.getContext('2d');
  let W, H;
  canvas.width  = W = window.innerWidth;
  canvas.height = H = window.innerHeight;
  const pts = [];
  for (let i = 0; i < 40; i++) {
    pts.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.2+0.2,
      dx: (Math.random()-0.5)*0.3, dy: (Math.random()-0.5)*0.3, alpha: Math.random()*0.4+0.05 });
  }
  let alive = true;
  DOM.loadingScreen.addEventListener('transitionend', () => { alive = false; }, { once: true });
  function draw() {
    if (!alive) return;
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(196,160,98,${p.alpha})`; ctx.fill();
      p.x+=p.dx; p.y+=p.dy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════
   PARALLAX
══════════════════════════════════════════════════════ */
function bindParallax() {
  const heroContent = document.querySelector('[data-parallax]');
  if (!heroContent) return;
  document.addEventListener('mousemove', e => {
    const x = (e.clientX / window.innerWidth  - 0.5) * 12;
    const y = (e.clientY / window.innerHeight - 0.5) * 8;
    heroContent.style.transform = `translate(${x}px, ${y}px)`;
  });
}

/* ══════════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════════ */
function bindNavEvents() {
  // Scroll highlight
  window.addEventListener('scroll', () => {
    DOM.navbar.classList.toggle('scrolled', window.scrollY > 40);
    highlightActiveNav();
  }, { passive: true });

  // Hamburger
  DOM.hamburger.addEventListener('click', () => {
    DOM.hamburger.classList.toggle('open');
    DOM.navLinks.classList.toggle('open');
  });

  // Close mobile nav on link click
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      DOM.hamburger.classList.remove('open');
      DOM.navLinks.classList.remove('open');
    });
  });
}

function highlightActiveNav() {
  const sections = document.querySelectorAll('.section, .hero-section');
  const navLinks = document.querySelectorAll('.nav-link');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === current));
}

/* ══════════════════════════════════════════════════════
   PLAYLISTS
══════════════════════════════════════════════════════ */
function buildPlaylists() {
  DOM.playlistGrid.innerHTML = '';
  VSS.playlists.forEach((pl, i) => {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.innerHTML = `
      <div class="playlist-cover">
        <div class="playlist-cover-gradient" style="background:${pl.gradient}"></div>
        <span class="playlist-cover-icon">${pl.icon}</span>
        <div class="playlist-play-overlay">
          <div class="playlist-play-btn"><i class="fa-solid fa-play"></i></div>
        </div>
      </div>
      <div class="playlist-info">
        <p class="playlist-name">${pl.name}</p>
        <p class="playlist-count">${pl.songs.length} track${pl.songs.length !== 1 ? 's' : ''}</p>
        <span class="playlist-mood">${pl.mood}</span>
      </div>
    `;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.playlist-play-btn')) {
        playPlaylist(pl.id);
      } else {
        openPlaylistModal(pl.id);
      }
    });
    DOM.playlistGrid.appendChild(card);
    // Staggered reveal
    setTimeout(() => card.classList.add('visible'), 80 * i);
  });
}

function playPlaylist(playlistId) {
  const pl = VSS.playlists.find(p => p.id === playlistId);
  if (!pl || !pl.songs.length) return;
  VSS.currentPlaylist = playlistId;
  const firstId = pl.songs[0];
  const idx = VSS.songs.findIndex(s => s.id === firstId);
  if (idx >= 0) loadTrack(idx, true);
}

/* ══════════════════════════════════════════════════════
   SONG LIST
══════════════════════════════════════════════════════ */
function buildSongList(filter = null) {
  let list = VSS.songs;

  if (VSS.searchQuery) {
    const q = VSS.searchQuery.toLowerCase();
    list = list.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.genre.toLowerCase().includes(q)
    );
  }
  if (VSS.currentFilter && VSS.currentFilter !== 'All') {
    list = list.filter(s => s.genre === VSS.currentFilter);
  }

  DOM.songList.innerHTML = '';
  if (!list.length) {
    DOM.songList.innerHTML = `<p class="song-empty">No tracks found.</p>`;
    return;
  }

  list.forEach((song, i) => {
    const globalIdx = VSS.songs.indexOf(song);
    DOM.songList.appendChild(buildSongRow(song, globalIdx, i + 1));
  });
}

function buildSongRow(song, globalIdx, displayNum) {
  const isFav  = VSS.favorites.includes(song.id);
  const isPlay = VSS.currentIndex === globalIdx && VSS.isPlaying;

  const item = document.createElement('div');
  item.className = `song-item${isPlay ? ' playing' : ''}`;
  item.dataset.idx = globalIdx;
  item.innerHTML = `
    <div class="song-num">
      ${isPlay
        ? `<div class="song-bars"><span></span><span></span><span></span></div>`
        : displayNum}
    </div>
    <div class="song-cover-sm"><i class="fa-solid fa-music"></i></div>
    <div class="song-meta">
      <p class="song-name">${song.title}</p>
      <p class="song-artist-genre">${song.artist} · ${song.genre}</p>
    </div>
    <span class="song-duration">${song.duration}</span>
    <button class="song-fav-btn${isFav ? ' active' : ''}" data-id="${song.id}" title="Favorite">
      <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
    </button>
  `;

  item.addEventListener('click', e => {
    if (e.target.closest('.song-fav-btn')) {
      toggleFavorite(song.id);
    } else {
      loadTrack(globalIdx, true);
    }
  });
  return item;
}

/* ──────────────────────────────────────────────────────
   FILTERS
────────────────────────────────────────────────────── */
function buildFilters() {
  const genres = ['All', ...new Set(VSS.songs.map(s => s.genre))];
  DOM.filterWrap.innerHTML = '';
  genres.forEach(g => {
    const btn = document.createElement('button');
    btn.className = `filter-pill${g === VSS.currentFilter ? ' active' : ''}`;
    btn.textContent = g;
    btn.addEventListener('click', () => {
      VSS.currentFilter = g;
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      buildSongList();
    });
    DOM.filterWrap.appendChild(btn);
  });
}

/* ──────────────────────────────────────────────────────
   SEARCH
────────────────────────────────────────────────────── */
function bindSearchEvents() {
  DOM.searchInput.addEventListener('input', e => {
    VSS.searchQuery = e.target.value.trim();
    buildSongList();
  });
}

/* ══════════════════════════════════════════════════════
   FAVORITES
══════════════════════════════════════════════════════ */
function toggleFavorite(songId) {
  const idx = VSS.favorites.indexOf(songId);
  if (idx === -1) {
    VSS.favorites.push(songId);
  } else {
    VSS.favorites.splice(idx, 1);
  }
  localStorage.setItem('vss_favorites', JSON.stringify(VSS.favorites));
  buildSongList();
  buildFavorites();
  buildStats();
  updatePlayerFavBtn();
}

function buildFavorites() {
  DOM.favoritesList.innerHTML = '';
  const favSongs = VSS.songs.filter(s => VSS.favorites.includes(s.id));
  if (!favSongs.length) {
    DOM.favoritesList.innerHTML = `<p class="song-empty">No favorites yet. Heart a track to save it here.</p>`;
    return;
  }
  favSongs.forEach((song, i) => {
    const globalIdx = VSS.songs.indexOf(song);
    DOM.favoritesList.appendChild(buildSongRow(song, globalIdx, i + 1));
  });
}

function updatePlayerFavBtn() {
  if (VSS.currentIndex < 0) return;
  const song = VSS.songs[VSS.currentIndex];
  if (!song) return;
  const isFav = VSS.favorites.includes(song.id);
  DOM.playerFavBtn.classList.toggle('active', isFav);
  DOM.playerFavBtn.querySelector('i').className = `fa-${isFav ? 'solid' : 'regular'} fa-heart`;
}

/* ══════════════════════════════════════════════════════
   STATS
══════════════════════════════════════════════════════ */
function buildStats() {
  animateCounter(DOM.statSongs,     VSS.songs.length);
  animateCounter(DOM.statPlaylists, VSS.playlists.length);
  animateCounter(DOM.statFavorites, VSS.favorites.length);

  // Estimate total hours
  let totalSecs = 0;
  VSS.songs.forEach(s => {
    const parts = s.duration.split(':').map(Number);
    totalSecs += (parts[0] || 0) * 60 + (parts[1] || 0);
  });
  const hours = (totalSecs / 3600).toFixed(1);
  animateCounter(DOM.statHours, hours, true);
}

function animateCounter(el, target, isFloat = false) {
  let start = 0;
  const t = parseFloat(target);
  const duration = 1200;
  const step = 16;
  const steps = duration / step;
  const increment = t / steps;
  const timer = setInterval(() => {
    start += increment;
    if (start >= t) { start = t; clearInterval(timer); }
    el.textContent = isFloat ? parseFloat(start).toFixed(1) : Math.floor(start);
  }, step);
}

/* ══════════════════════════════════════════════════════
   MUSIC PLAYER
══════════════════════════════════════════════════════ */
function loadTrack(index, autoplay = false) {
  if (index < 0 || index >= VSS.songs.length) return;
  VSS.currentIndex = index;
  const song = VSS.songs[index];

  // Update audio src
  if (song.src) {
    DOM.audio.src = song.src;
  } else {
    DOM.audio.src = '';
  }

  // Update player UI
  DOM.playerTitle.textContent  = song.title;
  DOM.playerArtist.textContent = song.artist;
  DOM.playerFill.style.width   = '0%';
  DOM.playerThumb.style.left   = '0%';
  DOM.playerCurrent.textContent = '0:00';
  DOM.playerDuration.textContent = song.duration;
  DOM.playerCover.innerHTML    = `<i class="fa-solid fa-music"></i>`;
  DOM.playerCover.classList.remove('has-image');

  // Vinyl
  DOM.heroVinyl.classList.remove('spinning');

  // Update lyrics section
  updateLyricsDisplay(song);
  loadLyrics(song.id);

  // Update song list highlight
  buildSongList();
  buildFavorites();
  updatePlayerFavBtn();

  if (autoplay) {
    if (song.src) {
      DOM.audio.play().then(() => setPlayState(true)).catch(() => setPlayState(false));
    } else {
      // Demo mode: simulate playback
      setPlayState(true);
      simulateDemoPlayback();
    }
  }
}

function simulateDemoPlayback() {
  // In demo mode (no audio files), simulate time progression for lyrics
  if (VSS._demoTimer) clearInterval(VSS._demoTimer);
  let elapsed = 0;
  const song = VSS.songs[VSS.currentIndex];
  const parts = song ? song.duration.split(':').map(Number) : [4,0];
  const total = (parts[0]||0)*60 + (parts[1]||0);

  VSS._demoTimer = setInterval(() => {
    if (!VSS.isPlaying) return;
    elapsed += 0.5;
    if (elapsed >= total) { elapsed = 0; handleTrackEnd(); return; }
    const pct = elapsed / total;
    DOM.playerFill.style.width = (pct * 100) + '%';
    DOM.playerThumb.style.left = (pct * 100) + '%';
    DOM.playerCurrent.textContent = formatTime(elapsed);
    syncLyrics(elapsed);
  }, 500);
}

function setPlayState(playing) {
  VSS.isPlaying = playing;
  DOM.ctrlPlay.innerHTML = playing
    ? `<i class="fa-solid fa-pause"></i>`
    : `<i class="fa-solid fa-play"></i>`;
  DOM.heroVinyl.classList.toggle('spinning', playing);
}

function bindPlayerEvents() {
  // Play/Pause
  DOM.ctrlPlay.addEventListener('click', () => {
    if (VSS.currentIndex < 0) { if (VSS.songs.length) loadTrack(0, true); return; }
    const song = VSS.songs[VSS.currentIndex];
    if (song && song.src) {
      if (VSS.isPlaying) { DOM.audio.pause(); setPlayState(false); }
      else { DOM.audio.play().then(() => setPlayState(true)); }
    } else {
      setPlayState(!VSS.isPlaying);
    }
  });

  // Previous
  DOM.ctrlPrev.addEventListener('click', () => {
    if (DOM.audio.currentTime > 3) { DOM.audio.currentTime = 0; return; }
    const prev = getPrevIndex();
    if (prev >= 0) loadTrack(prev, VSS.isPlaying);
  });

  // Next
  DOM.ctrlNext.addEventListener('click', () => {
    const next = getNextIndex();
    if (next >= 0) loadTrack(next, VSS.isPlaying);
  });

  // Shuffle
  DOM.ctrlShuffle.addEventListener('click', () => {
    VSS.shuffle = !VSS.shuffle;
    DOM.ctrlShuffle.classList.toggle('active', VSS.shuffle);
    if (VSS.shuffle) buildShuffleQueue();
  });

  // Repeat
  DOM.ctrlRepeat.addEventListener('click', () => {
    const modes = ['none', 'all', 'one'];
    const next = modes[(modes.indexOf(VSS.repeat) + 1) % modes.length];
    VSS.repeat = next;
    DOM.ctrlRepeat.classList.toggle('active', next !== 'none');
    DOM.ctrlRepeat.innerHTML = next === 'one'
      ? `<i class="fa-solid fa-repeat" style="font-size:11px;"></i><sup style="font-size:8px;color:var(--gold)">1</sup>`
      : `<i class="fa-solid fa-repeat"></i>`;
  });

  // Favorite from player
  DOM.playerFavBtn.addEventListener('click', () => {
    if (VSS.currentIndex < 0) return;
    toggleFavorite(VSS.songs[VSS.currentIndex].id);
  });

  // Audio events
  DOM.audio.addEventListener('timeupdate', onTimeUpdate);
  DOM.audio.addEventListener('ended', handleTrackEnd);
  DOM.audio.addEventListener('loadedmetadata', () => {
    DOM.playerDuration.textContent = formatTime(DOM.audio.duration);
  });

  // Progress bar drag
  setupSliderDrag(
    DOM.playerProgress,
    DOM.playerFill,
    DOM.playerThumb,
    pct => {
      const song = VSS.songs[VSS.currentIndex];
      if (!song) return;
      if (DOM.audio.duration) {
        DOM.audio.currentTime = pct * DOM.audio.duration;
      }
      DOM.playerCurrent.textContent = formatTime(pct * parseDuration(song.duration));
    }
  );

  // Volume drag
  setupSliderDrag(
    DOM.playerVolume,
    DOM.volumeFill,
    DOM.volumeThumb,
    pct => setVolume(pct)
  );
}

function onTimeUpdate() {
  if (VSS.isDraggingProgress) return;
  const cur = DOM.audio.currentTime;
  const dur = DOM.audio.duration || 1;
  const pct = cur / dur;
  DOM.playerFill.style.width = (pct * 100) + '%';
  DOM.playerThumb.style.left = (pct * 100) + '%';
  DOM.playerCurrent.textContent = formatTime(cur);
  syncLyrics(cur);
}

function handleTrackEnd() {
  if (VSS.repeat === 'one') {
    DOM.audio.currentTime = 0;
    DOM.audio.play().catch(() => {});
    return;
  }
  const next = getNextIndex();
  if (next >= 0) loadTrack(next, true);
  else setPlayState(false);
}

function getNextIndex() {
  if (VSS.songs.length === 0) return -1;
  if (VSS.shuffle) return getShuffleNext();
  if (VSS.currentIndex < VSS.songs.length - 1) return VSS.currentIndex + 1;
  if (VSS.repeat === 'all') return 0;
  return -1;
}

function getPrevIndex() {
  if (VSS.songs.length === 0) return -1;
  if (VSS.currentIndex > 0) return VSS.currentIndex - 1;
  if (VSS.repeat === 'all') return VSS.songs.length - 1;
  return -1;
}

function buildShuffleQueue() {
  VSS.shuffleQueue = [...VSS.songs.keys()]
    .filter(i => i !== VSS.currentIndex)
    .sort(() => Math.random() - 0.5);
}

function getShuffleNext() {
  if (!VSS.shuffleQueue.length) buildShuffleQueue();
  return VSS.shuffleQueue.shift() ?? 0;
}

function setVolume(v) {
  v = Math.max(0, Math.min(1, v));
  VSS.volume = v;
  DOM.audio.volume = v;
  DOM.volumeFill.style.width  = (v * 100) + '%';
  DOM.volumeThumb.style.left  = (v * 100) + '%';
  localStorage.setItem('vss_volume', v.toString());
}

/* ──────────────────────────────────────────────────────
   SLIDER DRAG UTILITY
────────────────────────────────────────────────────── */
function setupSliderDrag(track, fill, thumb, onUpdate) {
  function getPercent(e) {
    const rect = track.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }
  function onMove(e) {
    const pct = getPercent(e);
    fill.style.width = (pct * 100) + '%';
    thumb.style.left = (pct * 100) + '%';
    onUpdate(pct);
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
  }
  track.addEventListener('mousedown', e => {
    onMove(e);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
  track.addEventListener('touchstart', e => {
    onMove(e);
    document.addEventListener('touchmove', onMove);
    document.addEventListener('touchend', onUp);
  }, { passive: true });
  track.addEventListener('click', onMove);
}

/* ══════════════════════════════════════════════════════
   LYRICS
══════════════════════════════════════════════════════ */
function updateLyricsDisplay(song) {
  DOM.lyricsTrackName.textContent   = song.title;
  DOM.lyricsTrackArtist.textContent = song.artist;
  DOM.lyricsCover.innerHTML = `<i class="fa-solid fa-music"></i>`;
}

function loadLyrics(songId) {
  const data = VSS.lyrics[songId];
  DOM.lyricsLines.innerHTML = '';
  VSS.lyricLines = [];

  if (!data || !data.lines || !data.lines.length) {
    DOM.lyricsLines.innerHTML = `<p class="lyrics-placeholder">No lyrics available for this track.</p>`;
    return;
  }

  VSS.lyricLines = data.lines;
  data.lines.forEach((line, i) => {
    const el = document.createElement('p');
    el.className = 'lyric-line';
    el.textContent = line.text;
    el.dataset.time = line.time;
    el.dataset.idx = i;
    DOM.lyricsLines.appendChild(el);
  });
}

function syncLyrics(currentTime) {
  if (!VSS.lyricLines.length) return;
  const lines = DOM.lyricsLines.querySelectorAll('.lyric-line');
  if (!lines.length) return;

  let activeIdx = -1;
  VSS.lyricLines.forEach((line, i) => {
    if (currentTime >= line.time) activeIdx = i;
  });

  lines.forEach((el, i) => {
    el.classList.remove('active', 'past');
    if (i === activeIdx) el.classList.add('active');
    else if (i < activeIdx) el.classList.add('past');
  });

  // Auto-scroll
  if (activeIdx >= 0) {
    const activeLine = lines[activeIdx];
    const container  = DOM.lyricsScroll;
    const lineTop    = activeLine.offsetTop;
    const lineH      = activeLine.offsetHeight;
    const containerH = container.clientHeight;
    const targetY    = lineTop - containerH / 2 + lineH / 2;
    container.scrollTo({ top: targetY, behavior: 'smooth' });
  }
}

/* ══════════════════════════════════════════════════════
   MODAL
══════════════════════════════════════════════════════ */
function openPlaylistModal(playlistId) {
  const pl = VSS.playlists.find(p => p.id === playlistId);
  if (!pl) return;

  DOM.modalCover.style.background = pl.gradient;
  DOM.modalCover.innerHTML = `<span style="font-size:64px">${pl.icon}</span>`;
  DOM.modalTitle.textContent = pl.name;
  DOM.modalDesc.textContent  = pl.description;

  DOM.modalTracks.innerHTML = '';
  pl.songs.forEach((sid, i) => {
    const song = VSS.songs.find(s => s.id === sid);
    if (!song) return;
    const globalIdx = VSS.songs.indexOf(song);
    const item = document.createElement('div');
    item.className = 'modal-track-item';
    item.innerHTML = `
      <span class="modal-track-num">${i+1}</span>
      <div class="modal-track-info">
        <p class="modal-track-name">${song.title}</p>
        <p class="modal-track-artist">${song.artist}</p>
      </div>
      <span class="modal-track-dur">${song.duration}</span>
    `;
    item.addEventListener('click', () => {
      loadTrack(globalIdx, true);
      closeModal();
    });
    DOM.modalTracks.appendChild(item);
  });

  DOM.modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  DOM.modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

function bindModalEvents() {
  DOM.modalClose.addEventListener('click', closeModal);
  DOM.modalOverlay.addEventListener('click', e => {
    if (e.target === DOM.modalOverlay) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

/* ══════════════════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════════════════ */
function animateReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('revealed');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(t => obs.observe(t));
}

function bindScrollEvents() {
  // Smooth reveal for sections
  const sectionHeaders = document.querySelectorAll('.section-header, .about-text, .stat-card');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en, i) => {
      if (en.isIntersecting) {
        setTimeout(() => {
          en.target.style.opacity = '1';
          en.target.style.transform = 'none';
        }, i * 60);
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.1 });

  sectionHeaders.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.7s var(--ease-luxury), transform 0.7s var(--ease-luxury)';
    obs.observe(el);
  });
}

/* ══════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════ */
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function parseDuration(str) {
  if (!str) return 0;
  const parts = str.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

/* ══════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
══════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (e.code === 'Space') { e.preventDefault(); DOM.ctrlPlay.click(); }
  if (e.code === 'ArrowRight') { e.preventDefault(); DOM.ctrlNext.click(); }
  if (e.code === 'ArrowLeft')  { e.preventDefault(); DOM.ctrlPrev.click(); }
  if (e.code === 'ArrowUp')    { e.preventDefault(); setVolume(VSS.volume + 0.05); }
  if (e.code === 'ArrowDown')  { e.preventDefault(); setVolume(VSS.volume - 0.05); }
});

/* ══════════════════════════════════════════════════════
   START
══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', init);
