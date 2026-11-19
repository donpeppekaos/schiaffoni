(() => {
  'use strict';
  const d = document;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.documentElement.classList.add('js');

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

  const h = d.querySelector('.site-header'), t = d.querySelector('.nav-toggle'), n = d.getElementById('main-nav');
  const secs = [...d.querySelectorAll('main > section, footer')];
  const hero = d.querySelector('.hero, .ph');
  const pxs = [...d.querySelectorAll('.px')];
  const st = d.querySelector('[data-words]');
  const rws = [...d.querySelectorAll('.rw')];
  if (reduce) rws.forEach(w => w.classList.add('on'));

  const update = () => {
    const y = h.offsetHeight / 2, vh = window.innerHeight;
    h.classList.toggle('scrolled', window.scrollY > 40);
    let tone = 'light';
    for (const s of secs) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { tone = s.dataset.tone || 'light'; break; }
    }
    if (d.body.dataset.tone !== tone) d.body.dataset.tone = tone;
    if (hero && !reduce) hero.style.setProperty('--p', Math.min(window.scrollY / vh, 1).toFixed(3));
    if (!reduce) pxs.forEach(e => {
      const r = e.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) return;
      const base = r.top + r.height / 2 - (e._py || 0);
      e._py = (base - vh / 2) * -parseFloat(e.dataset.speed);
      e.style.setProperty('--py', e._py.toFixed(1));
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

  const els = d.querySelectorAll('.rv');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    els.forEach(e => io.observe(e));
  } else els.forEach(e => e.classList.add('in'));

  const v = d.querySelector('.hero video');
  if (v) { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
})();
