/* Facti, non parole · hub · animazioni guidate dallo scroll (vanilla JS, nessuna libreria) */
(() => {
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement, clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  // parole della sezione "Perché Factanza": una <span> per parola
  $$('.words').forEach(el => {
    const out = [];
    el.childNodes.forEach(n => {
      const hl = n.nodeType === 1 && n.tagName === 'EM';
      (n.textContent || '').split(/(\s+)/).forEach(t => {
        if (!t) return;
        if (/^\s+$/.test(t)) out.push(document.createTextNode(' '));
        else { const s = document.createElement('span'); s.className = 'w' + (hl ? ' hl' : ''); s.textContent = t; out.push(s); }
      });
    });
    el.replaceChildren(...out);
  });

  // comparsa con IntersectionObserver
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .18 });
  $$('.reveal, .closing').forEach(el => RM ? el.classList.add('in') : io.observe(el));

  // contatori
  const fmt = (v, d) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d).replace('.', ',');
  const counters = $$('.count').map(el => ({ el, to: parseFloat(el.dataset.to), d: +el.dataset.dec || 0 }));

  const trk0 = $('.track'); if (trk0) trk0.innerHTML += trk0.innerHTML;
  const pin = $('.pin'), steps = $('.steps'), bar = $('.progress span'), track = $('.track'), words = $$('.words .w');
  let vh = innerHeight, sy = scrollY, docH = 1, mx = 0, vel = 0, lastY = sy;
  const measure = () => { vh = innerHeight; docH = Math.max(1, root.scrollHeight - vh); };
  addEventListener('resize', measure, { passive: true }); addEventListener('load', measure); measure();
  addEventListener('scroll', () => { sy = scrollY; }, { passive: true });

  if (RM) { counters.forEach(c => c.el.textContent = fmt(c.to, c.d)); words.forEach(w => w.classList.add('on')); if (steps) steps.style.setProperty('--fill', 1); }

  function frame() {
    bar.style.transform = `scaleX(${clamp(sy / docH).toFixed(4)})`;
    if (!RM) {
      root.style.setProperty('--p', clamp(sy / (vh * .7)).toFixed(4));
      // sezione bloccata: progresso 0 → 1
      if (pin) {
        const r = pin.getBoundingClientRect(), e = clamp(-r.top / Math.max(1, r.height - vh));
        pin.style.setProperty('--e', e.toFixed(4));
        counters.forEach((c, i) => { const t = clamp((e - i * .3) * 4); const k = 1 - Math.pow(1 - t, 3); c.el.textContent = fmt(c.to * k, c.d); });
      }
      // linea del percorso che si riempie
      if (steps) { const r = steps.getBoundingClientRect(); steps.style.setProperty('--fill', clamp((vh * .6 - r.top) / r.height).toFixed(4)); }
      // parole che si accendono al 75% dello schermo
      const line = vh * .75;
      for (const w of words) { const on = w.getBoundingClientRect().top < line; if (on !== w._on) { w._on = on; w.classList.toggle('on', on); } }
      // striscia che scorre e accelera con lo scroll
      vel += ((sy - lastY) - vel) * .2; lastY = sy;
      if (track) { mx -= .7 + Math.abs(vel) * .3; const half = track.scrollWidth / 2; if (-mx > half) mx += half; track.style.transform = `translate3d(${mx}px,0,0)`; }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
