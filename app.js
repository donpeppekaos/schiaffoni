(() => {
  'use strict';
  const d = document;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.documentElement.classList.add('js');

  /* titoli animati lettera per lettera */
  d.querySelectorAll('[data-split]').forEach(el => {
    const txt = el.textContent.trim();
    el.setAttribute('aria-label', txt);
    el.textContent = '';
    let i = 0;
    txt.split(' ').forEach((word, wi, arr) => {
      const wd = d.createElement('span');
      wd.className = 'wd';
      wd.setAttribute('aria-hidden', 'true');
      [...word].forEach(c => {
        const s = d.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        s.style.setProperty('--i', i++);
        wd.appendChild(s);
      });
      el.appendChild(wd);
      if (wi < arr.length - 1) el.appendChild(d.createTextNode(' '));
    });
  });

  /* frase che si accende parola per parola */
  d.querySelectorAll('[data-words]').forEach(el => {
    const ws = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    ws.forEach((w, i) => {
      const s = d.createElement('span');
      s.className = 'rw';
      s.textContent = w;
      el.appendChild(s);
      if (i < ws.length - 1) el.appendChild(d.createTextNode(' '));
    });
  });

  /* foto e didascalie: si gestiscono tutte da foto.js (con ?fotodebug in fondo all'indirizzo si vede cosa non va) */
  const F = window.FOTO || {};
  const report = [];
  let render = () => {};
  d.querySelectorAll('[data-slot]').forEach(el => {
    const slot = el.dataset.slot, c = F[slot];
    const row = { slot, src: c && c.src ? c.src : '', st: c ? (c.src ? 'in corso' : 'nessuna foto indicata') : 'spazio non presente in foto.js' };
    report.push(row);
    if (!c) return;
    const cap = el.querySelector('.cap');
    if (cap) {
      const b = cap.querySelector('b'), s = cap.querySelector('span');
      if (b && typeof c.title === 'string') b.textContent = c.title;
      if (s && typeof c.text === 'string') s.textContent = c.text;
      if (!(c.title || c.text)) cap.remove();
    }
    if (c.src) {
      const host = el.querySelector('.shot') || el;
      const isV = /\.(mp4|webm)$/i.test(c.src);
      const m = d.createElement(isV ? 'video' : 'img');
      m.className = 'm';
      if (isV) {
        m.muted = true; m.loop = true; m.autoplay = true;
        m.setAttribute('playsinline', '');
      } else {
        m.alt = c.alt || c.title || '';
        m.loading = 'lazy';
        m.decoding = 'async';
      }
      if (c.pos) m.style.objectPosition = c.pos;
      m.addEventListener('error', () => { row.st = 'NON TROVATA'; m.remove(); host.classList.remove('has-art'); render(); });
      m.addEventListener(isV ? 'loadeddata' : 'load', () => { row.st = 'OK'; render(); });
      m.src = 'assets/img/' + c.src;
      host.appendChild(m);
      host.classList.add('has-art');
      if (isV) { const p = m.play(); if (p && p.catch) p.catch(() => {}); }
    }
  });
  if (new URLSearchParams(window.location.search).has('fotodebug')) {
    const p = d.createElement('div');
    p.className = 'fdbg';
    d.body.appendChild(p);
    render = () => {
      p.textContent = '';
      const add = (t, bold) => { const e = d.createElement('p'); e.textContent = t; if (bold) e.style.fontWeight = '700'; p.appendChild(e); };
      add(window.FOTO ? 'foto.js letto correttamente (' + Object.keys(F).length + ' spazi).' : 'ERRORE: foto.js non letto. Di solito c’è un errore di scrittura (virgolette “ ” al posto di " ", una virgola mancante) oppure il file non è stato caricato.', true);
      report.forEach(r => {
        let t = r.slot + ': ' + r.st;
        if (r.st === 'NON TROVATA') {
          t += ' — assets/img/' + r.src + '. ' + (/\.(heic|heif)$/i.test(r.src)
            ? 'Il formato HEIC (iPhone) non si legge sul web: convertila in .jpg.'
            : 'Controlla che il file sia nella cartella assets/img/ e che nome e maiuscole/minuscole siano identici.');
        }
        add(t);
      });
    };
    render();
  }

  const h = d.querySelector('.site-header'), t = d.querySelector('.nav-toggle'), n = d.getElementById('main-nav');
  const secs = [...d.querySelectorAll('main > section, footer')];
  const hero = d.querySelector('.hero');
  const fades = [...d.querySelectorAll('.hero h1, .ph h1, .ph .lead')];
  const st = d.querySelector('[data-words]');
  const rws = [...d.querySelectorAll('.rw')];
  if (reduce) rws.forEach(w => w.classList.add('on'));

  const update = () => {
    const hh = h.offsetHeight, vh = window.innerHeight;
    h.classList.toggle('scrolled', window.scrollY > 40);
    let tone = 'light';
    for (const s of secs) {
      const r = s.getBoundingClientRect();
      if (r.top <= hh / 2 && r.bottom > hh / 2) { tone = s.dataset.tone || 'light'; break; }
    }
    if (d.body.dataset.tone !== tone) d.body.dataset.tone = tone;
    if (hero && !reduce) hero.style.setProperty('--p', Math.min(window.scrollY / vh, 1).toFixed(3));
    /* i titoli restano pieni finché si leggono: sfumano solo quando stanno uscendo sotto la barra */
    fades.forEach(el => {
      const r = el.getBoundingClientRect();
      const k = Math.min(Math.max((r.bottom - hh - 12) / (r.height * 0.7), 0), 1);
      el.style.setProperty('--f', k.toFixed(3));
    });
    if (st && !reduce) {
      const r = st.getBoundingClientRect();
      const p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
      const k = Math.round(p * rws.length);
      rws.forEach((w, i) => w.classList.toggle('on', i < k));
    }
  };
  let tick = false;
  const onScroll = () => {
    if (tick) return;
    tick = true;
    requestAnimationFrame(() => { tick = false; update(); });
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  const setNav = o => {
    n.classList.toggle('open', o);
    t.classList.toggle('on', o);
    t.setAttribute('aria-expanded', String(o));
    d.body.classList.toggle('lock', o);
  };
  t.addEventListener('click', () => setNav(!n.classList.contains('open')));
  n.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setNav(false)));
  d.addEventListener('keydown', e => { if (e.key === 'Escape') setNav(false); });

  /* le foto si aprono quando il loro contenitore entra nello schermo (il riquadro stesso parte "chiuso") */
  const els = [...d.querySelectorAll('.rv')];
  const watch = new Map();
  els.forEach(e => watch.set(e.classList.contains('shot') ? e.parentElement : e, e));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { watch.get(e.target).classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    watch.forEach((_, k) => io.observe(k));
  } else els.forEach(e => e.classList.add('in'));

  /* slide scorrevoli: dito, trackpad, mouse (trascinando) e frecce */
  const track = d.querySelector('.track');
  if (track) {
    const slides = [...track.children], cnt = d.querySelector('.s-count');
    const two = n => String(n).padStart(2, '0');
    let cur = -1;
    const mark = () => {
      const k = Math.min(slides.length - 1, Math.max(0, Math.round(track.scrollLeft / track.clientWidth)));
      if (k === cur) return;
      cur = k;
      slides.forEach((s, i) => s.classList.toggle('on', i === k));
      if (cnt) cnt.textContent = two(k + 1) + ' / ' + two(slides.length);
    };
    const go = k => track.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, k)) * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
    track.addEventListener('scroll', () => requestAnimationFrame(mark), { passive: true });
    d.querySelector('.s-prev').addEventListener('click', () => go(cur - 1));
    d.querySelector('.s-next').addEventListener('click', () => go(cur + 1));
    track.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });
    let down = false, sx = 0, sl = 0;
    track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = track.scrollLeft; track.classList.add('drag'); });
    window.addEventListener('pointermove', e => { if (down) track.scrollLeft = sl - (e.clientX - sx); });
    window.addEventListener('pointerup', () => { if (!down) return; down = false; track.classList.remove('drag'); go(Math.round(track.scrollLeft / track.clientWidth)); });
    window.addEventListener('resize', () => go(cur));
    mark();
  }

  const v = d.querySelector('.hero video');
  if (v) { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
})();
