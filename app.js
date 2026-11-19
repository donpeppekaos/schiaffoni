(() => {
  'use strict';
  const d = document;
  d.documentElement.classList.add('js');
  const h = d.querySelector('.site-header'), t = d.querySelector('.nav-toggle'), n = d.getElementById('main-nav');
  const secs = [...d.querySelectorAll('main > section, footer')];
  const update = () => {
    h.classList.toggle('scrolled', window.scrollY > 40);
    const y = h.offsetHeight / 2;
    let tone = 'light';
    for (const s of secs) {
      const r = s.getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { tone = s.dataset.tone || 'light'; break; }
    }
    if (d.body.dataset.tone !== tone) d.body.dataset.tone = tone;
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
