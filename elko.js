document.addEventListener('DOMContentLoaded', () => {
  // videos: always muted / inline / looped, resume when visible
  const prep = v => {
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
    if (v.paused) v.play().catch(() => {});
  };
  const playAll = () => document.querySelectorAll('video').forEach(prep);
  playAll();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) playAll(); });

  // heater pills: on touch devices the pill closest to the screen centre plays
  const pills = [...document.querySelectorAll('.pill')];
  if (pills.length && window.matchMedia('(hover: none)').matches) {
    let active = null;
    const check = () => {
      const mid = window.innerHeight / 2; let best = null, d = Infinity;
      pills.forEach(p => {
        const r = p.getBoundingClientRect(); const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < d && dist < window.innerHeight * 0.3) { d = dist; best = p; }
      });
      if (best !== active) {
        pills.forEach(p => p.classList.toggle('is-active', p === best));
        if (best) { const v = best.querySelector('video'); if (v) prep(v); }
        active = best;
      }
    };
    window.addEventListener('scroll', check, { passive: true });
    check();
  } else {
    pills.forEach(p => p.addEventListener('mouseenter', () => { const v = p.querySelector('video'); if (v) prep(v); }));
  }

  // "Прочети повече" toggle
  document.querySelectorAll('.more-btn').forEach(btn => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const label = btn.querySelector('.more-label');
    btn.addEventListener('click', () => {
      const open = panel.hidden;
      panel.hidden = !open;
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
      label.textContent = open ? 'Скрий' : 'Прочети повече';
    });
  });

  // Приложения grid: text opens full-width under the clicked tile's row
  const grid = document.querySelector('.app-grid');
  if (grid) {
    const tiles = [...grid.querySelectorAll('.tile')];
    const panel = grid.querySelector('.app-panel');
    let openTile = null;
    const place = () => {
      if (!openTile) return;
      const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
      const i = tiles.indexOf(openTile);
      const last = tiles[Math.min(Math.floor(i / cols) * cols + cols - 1, tiles.length - 1)];
      last.after(panel);
    };
    tiles.forEach(t => t.addEventListener('click', () => {
      const same = openTile === t;
      tiles.forEach(x => { x.classList.remove('open'); x.setAttribute('aria-expanded', 'false'); });
      if (same) { openTile = null; panel.hidden = true; return; }
      openTile = t;
      t.classList.add('open'); t.setAttribute('aria-expanded', 'true');
      panel.innerHTML = '';
      panel.appendChild(document.getElementById('tpl-' + t.dataset.id).content.cloneNode(true));
      panel.hidden = false;
      place();
    }));
    window.addEventListener('resize', place);
  }

  // Производство rows fade in on scroll
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.remove('reveal-pending'); io.unobserve(e.target); }
    }), { threshold: 0.15 });
    document.querySelectorAll('.spec').forEach(el => {
      if (el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('reveal-pending'); io.observe(el); }
    });
  }
});
