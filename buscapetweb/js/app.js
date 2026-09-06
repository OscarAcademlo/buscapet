// ============================================================
// BUSCAPET — app.js  (UI only, no backend logic)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Photo carousel ────────────────────────────────────────
  document.querySelectorAll('.card-photo-wrap').forEach(wrap => {
    const imgs = wrap.querySelectorAll('img[data-photo]');
    const counter = wrap.querySelector('.photo-counter');
    const prev = wrap.querySelector('.photo-nav.prev');
    const next = wrap.querySelector('.photo-nav.next');
    if (!imgs.length) return;

    let idx = 0;
    const show = (i) => {
      imgs.forEach((img, n) => img.style.display = n === i ? 'block' : 'none');
      if (counter) counter.textContent = `${i + 1}/${imgs.length}`;
      if (prev) prev.style.display = i > 0 ? 'flex' : 'none';
      if (next) next.style.display = i < imgs.length - 1 ? 'flex' : 'none';
    };
    show(0);
    if (prev) prev.addEventListener('click', (e) => { e.stopPropagation(); if (idx > 0) show(--idx); });
    if (next) next.addEventListener('click', (e) => { e.stopPropagation(); if (idx < imgs.length - 1) show(++idx); });
  });

  // ── Category chips filter ─────────────────────────────────
  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => { c.className = 'chip'; });
      const type = chip.dataset.type;
      chip.classList.add(`active-${type}`);

      document.querySelectorAll('.pet-card[data-type]').forEach(card => {
        if (type === 'all' || card.dataset.type === type) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ── Bottom nav tabs ───────────────────────────────────────
  const navItems = document.querySelectorAll('.bottom-nav-item[data-tab]');
  const tabPanels = document.querySelectorAll('[data-panel]');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      navItems.forEach(n => n.classList.toggle('active', n.dataset.tab === tab));
      tabPanels.forEach(p => p.style.display = p.dataset.panel === tab ? '' : 'none');
    });
  });

  // ── Like toggle (UI only) ─────────────────────────────────
  document.querySelectorAll('.action-btn[data-action="like"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const liked = btn.classList.toggle('liked');
      const span = btn.querySelector('.like-count');
      if (span) {
        let n = parseInt(span.textContent) || 0;
        span.textContent = liked ? n + 1 : Math.max(0, n - 1);
      }
    });
  });

  // ── Toast helper ──────────────────────────────────────────
  window.buscapetToast = (msg, type = 'info') => {
    const t = document.createElement('div');
    t.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:${type === 'success' ? '#22C55E' : type === 'error' ? '#EF4444' : '#1E2330'};
      color:#fff;padding:10px 20px;border-radius:10px;font-weight:700;font-size:13px;
      z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.4);font-family:'Outfit',sans-serif`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2800);
  };

  // ── Button click feedback (no logic) ─────────────────────
  document.querySelectorAll('.hero-btn, .contact-btn, .ad-btn-wa').forEach(btn => {
    btn.addEventListener('click', () => {
      window.buscapetToast('🔒 Iniciá sesión para continuar');
    });
  });

});
