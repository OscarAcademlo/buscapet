// ==========================================================================
// BUSCAPET — MAIN APP BOOTSTRAPPER & EVENT ORCHESTRATOR
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialize Subsystems
  if (window.BuscapetI18n) window.BuscapetI18n.init();
  if (window.BuscapetAds) window.BuscapetAds.init();
  if (window.BuscapetFeed) window.BuscapetFeed.init();
  if (window.BuscapetChat) window.BuscapetChat.init();
  if (window.BuscapetPublish) window.BuscapetPublish.init();
  if (window.BuscapetAdmin) window.BuscapetAdmin.init();

  // 2. Global Toast Helper
  window.buscapetToast = (msg, type = 'info') => {
    const existing = document.querySelector('.buscapet-toast');
    if (existing) existing.remove();

    const t = document.createElement('div');
    t.className = 'buscapet-toast';
    const bg = type === 'success' ? '#16A34A' : (type === 'error' ? '#EF4444' : '#1E2330');
    t.style.cssText = `
      position: fixed;
      bottom: 85px;
      left: 50%;
      transform: translateX(-50%);
      background: ${bg};
      color: #ffffff;
      padding: 10px 22px;
      border-radius: 9999px;
      font-weight: 800;
      font-size: 13px;
      z-index: 999999;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.15);
      font-family: 'Outfit', sans-serif;
      text-align: center;
      white-space: nowrap;
      pointer-events: none;
      animation: fadeIn 0.25s ease;
    `;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.3s ease';
      setTimeout(() => t.remove(), 300);
    }, 2800);
  };

  // 3. Theme Toggle (Dark / Light)
  const themeBtn = document.getElementById('btn-theme-toggle');
  const savedTheme = localStorage.getItem('buscapet_theme') || 'dark';
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeBtn) themeBtn.innerHTML = '<i class="bi bi-moon-stars-fill" style="color:var(--primary);font-size:17px"></i>';
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('buscapet_theme', next);

      if (next === 'light') {
        themeBtn.innerHTML = '<i class="bi bi-moon-stars-fill" style="color:var(--primary);font-size:17px"></i>';
        window.buscapetToast('☀️ Modo claro activado', 'info');
      } else {
        themeBtn.innerHTML = '<i class="bi bi-sun-fill" style="color:var(--warning);font-size:17px"></i>';
        window.buscapetToast('🌙 Modo oscuro activado', 'info');
      }
    });
  }

  // 4. Multi-language Selectors
  document.querySelectorAll('[data-lang]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = item.getAttribute('data-lang');
      if (window.BuscapetI18n) {
        window.BuscapetI18n.setLanguage(lang);
      }
    });
  });

  // 5. Populate Location Filters (Sidebar)
  const countrySelect = document.getElementById('filter-country');
  const stateSelect = document.getElementById('filter-state');
  const citySelect = document.getElementById('filter-city');
  const btnApplyFilter = document.getElementById('btn-apply-filters');

  if (countrySelect && window.BuscapetLocations) {
    const countries = window.BuscapetLocations.getCountries();
    countrySelect.innerHTML = countries.map(c => `
      <option value="${c.code}" ${c.code === 'AR' ? 'selected' : ''}>${c.flag} ${c.name}</option>
    `).join('');

    const refreshStates = () => {
      const code = countrySelect.value;
      const states = window.BuscapetLocations.getStates(code);
      if (stateSelect) {
        stateSelect.innerHTML = '<option value="">Todas las provincias / estados</option>' + states.map(s => `
          <option value="${s.name}">${s.name}</option>
        `).join('');
      }
      if (citySelect) {
        citySelect.innerHTML = '<option value="">Todas las ciudades</option>';
      }
    };

    const refreshCities = () => {
      const code = countrySelect.value;
      const stateName = stateSelect ? stateSelect.value : '';
      const cities = window.BuscapetLocations.getCities(code, stateName);
      if (citySelect) {
        citySelect.innerHTML = '<option value="">Todas las ciudades</option>' + cities.map(c => `
          <option value="${c}">${c}</option>
        `).join('');
      }
    };

    countrySelect.addEventListener('change', refreshStates);
    if (stateSelect) stateSelect.addEventListener('change', refreshCities);

    refreshStates();
  }

  if (btnApplyFilter) {
    btnApplyFilter.addEventListener('click', () => {
      const countryCode = countrySelect ? countrySelect.value : '';
      const state = stateSelect ? stateSelect.value : '';
      const city = citySelect ? citySelect.value : '';
      if (window.BuscapetFeed) {
        window.BuscapetFeed.setLocationFilter(countryCode, state, city);
        window.buscapetToast('📍 Filtros de ubicación aplicados', 'success');
      }
    });
  }

  // 6. Live Search Bar
  const searchInput = document.getElementById('topbar-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (window.BuscapetFeed) {
        window.BuscapetFeed.setSearchQuery(e.target.value);
      }
    });
  }

  // 7. Hero Banner Action Buttons
  const btnHeroLost = document.getElementById('btn-hero-lost');
  const btnHeroFound = document.getElementById('btn-hero-found');
  const btnHeroAdopt = document.getElementById('btn-hero-adopt');
  const btnHeroOffer = document.getElementById('btn-hero-offer');
  const btnHeroAd = document.querySelector('.hero-ad-btn');
  const btnChangeCity = document.querySelector('.hero-location-change');

  if (btnHeroLost) {
    btnHeroLost.addEventListener('click', () => {
      if (window.BuscapetPublish) window.BuscapetPublish.openModal('lost');
    });
  }
  if (btnHeroFound) {
    btnHeroFound.addEventListener('click', () => {
      if (window.BuscapetPublish) window.BuscapetPublish.openModal('found');
    });
  }
  if (btnHeroAdopt) {
    btnHeroAdopt.addEventListener('click', () => {
      if (window.BuscapetFeed) window.BuscapetFeed.setFilter('adopt');
      window.buscapetToast('💜 Mostrando mascotas en adopción', 'info');
    });
  }
  if (btnHeroOffer) {
    btnHeroOffer.addEventListener('click', () => {
      if (window.BuscapetPublish) window.BuscapetPublish.openModal('adopt');
    });
  }
  if (btnHeroAd) {
    btnHeroAd.addEventListener('click', () => {
      if (window.BuscapetAds) window.BuscapetAds.openAdModal();
    });
  }
  if (btnChangeCity) {
    btnChangeCity.addEventListener('click', () => {
      if (countrySelect) {
        countrySelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
        countrySelect.focus();
        countrySelect.style.borderColor = 'var(--primary)';
        setTimeout(() => countrySelect.style.borderColor = '', 2000);
      }
    });
  }

  // 8. Topbar & Sidebar General Buttons
  document.querySelectorAll('.publish-btn, .btn-publish-big').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.BuscapetPublish) window.BuscapetPublish.openModal('lost');
    });
  });

  document.querySelectorAll('.topbar-icon-ad, .sidebar-card-ad .sidebar-btn-primary, .mobile-card-ad .sidebar-btn-primary').forEach(btn => {
    btn.closest('button')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.BuscapetAds) window.BuscapetAds.openAdModal();
    });
  });

  document.querySelectorAll('.topbar-icon-coffee, .btn-cafecito, .sidebar-card-cafecito button, .mobile-card-cafecito button').forEach(btn => {
    btn.closest('button')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('https://cafecito.app/buscapet', '_blank');
    });
  });

  document.querySelectorAll('.btn-login, .avatar-initials').forEach(btn => {
    btn.addEventListener('click', () => {
      const authModal = document.getElementById('auth-modal');
      if (authModal) {
        authModal.classList.add('show');
        authModal.style.display = 'block';
        document.body.classList.add('modal-open');
      } else {
        window.buscapetToast('👋 ¡Hola! Estás navegando como Invitado Solidario.');
      }
    });
  });

  // 9. Bottom Navigation Tabs
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item[data-tab]');
  bottomNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      bottomNavItems.forEach(b => b.classList.toggle('active', b === item));

      if (tab === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (window.BuscapetFeed) window.BuscapetFeed.setFilter('all');
      } else if (tab === 'search') {
        const topSearch = document.getElementById('topbar-search-input');
        if (topSearch) {
          topSearch.focus();
          window.buscapetToast('🔍 Escribí para buscar mascotas');
        }
      } else if (tab === 'publish') {
        if (window.BuscapetPublish) window.BuscapetPublish.openModal('lost');
      } else if (tab === 'messages') {
        if (window.BuscapetChat) window.BuscapetChat.openChatList();
      } else if (tab === 'profile') {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
          authModal.classList.add('show');
          authModal.style.display = 'block';
          document.body.classList.add('modal-open');
        } else {
          window.buscapetToast('👤 Perfil Solidario Buscapet');
        }
      }
    });
  });

  // 10. Sidebar Navigation Items
  document.querySelectorAll('.left-sidebar .nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.left-sidebar .nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      const text = item.textContent.trim().toLowerCase();
      if (text.includes('inicio')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (window.BuscapetFeed) window.BuscapetFeed.setFilter('all');
      } else if (text.includes('buscar')) {
        const topSearch = document.getElementById('topbar-search-input');
        if (topSearch) topSearch.focus();
      } else if (text.includes('mensajes')) {
        if (window.BuscapetChat) window.BuscapetChat.openChatList();
      } else if (text.includes('perfil')) {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
          authModal.classList.add('show');
          authModal.style.display = 'block';
          document.body.classList.add('modal-open');
        }
      }
    });
  });

  // 11. OscarSoft Admin Entrypoint (Footer / Admin Button)
  const adminEntryBtn = document.getElementById('btn-admin-entry');
  if (adminEntryBtn) {
    adminEntryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.BuscapetAdmin) window.BuscapetAdmin.openModal();
    });
  }

});
