// =============================================================================
// BUSCAPET — MAIN APP BOOTSTRAPPER & EVENT ORCHESTRATOR
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {

  // 1. Inicializar Módulos
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
    const bg = type === 'success' ? '#10B981' : (type === 'error' ? '#EF4444' : '#1A1D27');
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
      border: 1.5px solid rgba(255,255,255,0.15);
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

  // 3. Alternador de Tema (Modo Claro / Modo Oscuro)
  const themeBtn = document.getElementById('btn-theme-toggle');
  let savedTheme = 'dark';
  try {
    if (window.SafeStorage) savedTheme = window.SafeStorage.getItem('buscapet_theme') || 'dark';
  } catch(e) {}

  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeBtn) themeBtn.innerHTML = '<i class="bi bi-moon-stars-fill" style="color:var(--primary);font-size:17px"></i>';
  }

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        if (window.SafeStorage) window.SafeStorage.setItem('buscapet_theme', next);
      } catch(e) {}

      if (next === 'light') {
        themeBtn.innerHTML = '<i class="bi bi-moon-stars-fill" style="color:var(--primary);font-size:17px"></i>';
        window.buscapetToast('☀️ Modo claro activado', 'info');
      } else {
        themeBtn.innerHTML = '<i class="bi bi-sun-fill" style="color:var(--warning);font-size:17px"></i>';
        window.buscapetToast('🌙 Modo oscuro activado', 'info');
      }
    });
  }

  // 4. Idiomas (ES, EN, PT)
  document.querySelectorAll('[data-lang]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = item.getAttribute('data-lang');
      if (window.BuscapetI18n) {
        window.BuscapetI18n.setLanguage(lang);
      }
    });
  });

  // 5. Módulo de Ubicación de las Américas y Detección por GPS
  window.BuscapetLocationsUI = {
    currentCountry: 'AR',
    currentState: '',
    currentCity: '',

    init() {
      const modalCountry = document.getElementById('modal-select-country');
      const modalState = document.getElementById('modal-select-state');
      const modalCity = document.getElementById('modal-select-city');

      const sideCountry = document.getElementById('filter-country');
      const sideState = document.getElementById('filter-state');
      const sideCity = document.getElementById('filter-city');

      if (!window.BuscapetLocations) return;
      const countries = window.BuscapetLocations.getCountries();

      const renderCountryOptions = (selectedCode) => {
        return countries.map(c => `
          <option value="${c.code}" ${c.code === selectedCode ? 'selected' : ''}>${c.flag} ${c.name}</option>
        `).join('');
      };

      if (modalCountry) modalCountry.innerHTML = renderCountryOptions('AR');
      if (sideCountry) sideCountry.innerHTML = renderCountryOptions('AR');

      const updateStatesFor = (cSelect, sSelect, ciSelect) => {
        if (!cSelect || !sSelect) return;
        const code = cSelect.value;
        const states = window.BuscapetLocations.getStates(code);
        sSelect.innerHTML = '<option value="">Todas las provincias / estados</option>' + states.map(s => `
          <option value="${s.name}">${s.name}</option>
        `).join('');
        if (ciSelect) ciSelect.innerHTML = '<option value="">Todas las ciudades</option>';
      };

      const updateCitiesFor = (cSelect, sSelect, ciSelect) => {
        if (!cSelect || !sSelect || !ciSelect) return;
        const code = cSelect.value;
        const stateName = sSelect.value;
        const cities = window.BuscapetLocations.getCities(code, stateName);
        ciSelect.innerHTML = '<option value="">Todas las ciudades</option>' + cities.map(c => `
          <option value="${c}">${c}</option>
        `).join('');
      };

      if (modalCountry) {
        modalCountry.addEventListener('change', () => updateStatesFor(modalCountry, modalState, modalCity));
      }
      if (modalState) {
        modalState.addEventListener('change', () => updateCitiesFor(modalCountry, modalState, modalCity));
      }

      if (sideCountry) {
        sideCountry.addEventListener('change', () => updateStatesFor(sideCountry, sideState, sideCity));
      }
      if (sideState) {
        sideState.addEventListener('change', () => updateCitiesFor(sideCountry, sideState, sideCity));
      }

      updateStatesFor(modalCountry, modalState, modalCity);
      updateStatesFor(sideCountry, sideState, sideCity);

      // Botón aplicar en barra lateral
      const btnApply = document.getElementById('btn-apply-filters');
      if (btnApply) {
        btnApply.addEventListener('click', () => {
          const cCode = sideCountry ? sideCountry.value : '';
          const st = sideState ? sideState.value : '';
          const ct = sideCity ? sideCity.value : '';
          this.applyLocation(cCode, st, ct, true);
        });
      }

      // Cargar ubicación previa si existe en almacenamiento seguro
      try {
        const storage = window.SafeStorage || window.localStorage;
        const saved = storage.getItem('buscapet_user_location');
        if (saved) {
          const loc = JSON.parse(saved);
          if (loc && loc.countryCode) {
            this.applyLocation(loc.countryCode, loc.state || '', loc.city || '', false);
          }
        }
      } catch (e) {}
    },

    openModal() {
      const modal = document.getElementById('location-modal');
      if (modal) {
        modal.classList.add('show');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
      }
    },

    closeModal() {
      const modal = document.getElementById('location-modal');
      if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
      }
    },

    applySelection() {
      const countryEl = document.getElementById('modal-select-country');
      const stateEl = document.getElementById('modal-select-state');
      const cityEl = document.getElementById('modal-select-city');

      const countryCode = countryEl ? countryEl.value : '';
      const state = stateEl ? stateEl.value : '';
      const city = cityEl ? cityEl.value : '';

      this.applyLocation(countryCode, state, city, true);
      this.closeModal();
    },

    applyLocation(countryCode, state, city, showToast = true) {
      this.currentCountry = countryCode;
      this.currentState = state;
      this.currentCity = city;

      const syncSelects = (cId, sId, ciId) => {
        const c = document.getElementById(cId);
        const s = document.getElementById(sId);
        const ci = document.getElementById(ciId);
        if (c && countryCode) {
          c.value = countryCode;
          const states = window.BuscapetLocations.getStates(countryCode);
          if (s) {
            s.innerHTML = '<option value="">Todas las provincias / estados</option>' + states.map(st => `
              <option value="${st.name}" ${st.name === state ? 'selected' : ''}>${st.name}</option>
            `).join('');
          }
          if (ci) {
            const cities = window.BuscapetLocations.getCities(countryCode, state);
            ci.innerHTML = '<option value="">Todas las ciudades</option>' + cities.map(ct => `
              <option value="${ct}" ${ct === city ? 'selected' : ''}>${ct}</option>
            `).join('');
          }
        }
      };

      syncSelects('modal-select-country', 'modal-select-state', 'modal-select-city');
      syncSelects('filter-country', 'filter-state', 'filter-city');

      if (window.BuscapetFeed) {
        window.BuscapetFeed.setLocationFilter(countryCode, state, city);
      }

      try {
        const storage = window.SafeStorage || window.localStorage;
        storage.setItem('buscapet_user_location', JSON.stringify({ countryCode, state, city }));
      } catch (e) {}

      if (showToast && window.buscapetToast) {
        const countryObj = window.BuscapetLocations ? window.BuscapetLocations.getCountryByCodeOrName(countryCode) : null;
        const cName = countryObj ? `${countryObj.flag} ${countryObj.name}` : countryCode;
        const locLabel = city ? `${city}, ${state || cName}` : (state ? `${state}, ${cName}` : cName);
        window.buscapetToast(`📍 Ubicación seleccionada: ${locLabel}`, 'success');
      }
    },

    clearFilter() {
      this.applyLocation('', '', '', false);
      if (window.BuscapetFeed) {
        window.BuscapetFeed.setLocationFilter('', '', '');
      }
      const locText = document.querySelector('.hero-location-text');
      if (locText) locText.textContent = '📍 Toda Latinoamérica';
      this.closeModal();
      if (window.buscapetToast) {
        window.buscapetToast('🌎 Mostrando mascotas de toda Latinoamérica', 'info');
      }
    },

    async detectGPS() {
      if (!navigator.geolocation) {
        alert('Tu navegador o dispositivo no soporta geolocalización.');
        return;
      }

      const modalBtn = document.getElementById('btn-modal-gps');
      const sideBtn = document.getElementById('btn-sidebar-gps');
      const prevModal = modalBtn ? modalBtn.innerHTML : '';
      const prevSide = sideBtn ? sideBtn.innerHTML : '';

      const loadingText = '<i class="spinner-border spinner-border-sm" style="width:14px;height:14px;"></i> Detectando GPS...';
      if (modalBtn) modalBtn.innerHTML = loadingText;
      if (sideBtn) sideBtn.innerHTML = loadingText;

      if (window.buscapetToast) window.buscapetToast('🛰️ Obteniendo coordenadas satelitales GPS...', 'info');

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`, {
              headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};
              const cCode = (addr.country_code || '').toUpperCase();
              const state = addr.state || addr.region || addr.province || '';
              const city = addr.city || addr.town || addr.municipality || addr.village || addr.suburb || '';

              this.applyLocation(cCode || 'AR', state, city, true);
              this.closeModal();
              if (modalBtn) modalBtn.innerHTML = prevModal;
              if (sideBtn) sideBtn.innerHTML = prevSide;
              return;
            }
          } catch (err) {
            console.warn('Nominatim reverse error:', err);
          }

          this.applyLocation('AR', 'Buenos Aires', 'CABA', true);
          this.closeModal();
          if (modalBtn) modalBtn.innerHTML = prevModal;
          if (sideBtn) sideBtn.innerHTML = prevSide;
        },
        (err) => {
          console.warn('Geolocation error:', err);
          if (modalBtn) modalBtn.innerHTML = prevModal;
          if (sideBtn) sideBtn.innerHTML = prevSide;
          alert('No se pudo obtener la ubicación GPS precisa. Puedes elegir tu país y ciudad manualmente en el selector.');
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    }
  };

  window.BuscapetLocationsUI.init();

  // 6. Búsqueda en Vivo
  const searchInput = document.getElementById('topbar-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (window.BuscapetFeed) {
        window.BuscapetFeed.setSearchQuery(e.target.value);
      }
    });
  }

  // 7. Botones del Banner Principal (Hero)
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
    btnChangeCity.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.BuscapetLocationsUI) {
        window.BuscapetLocationsUI.openModal();
      }
    });
  }

  // 8. Botones de Publicar y Anunciar
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

  // 9. Donaciones y Cafecito — Abre Checkout de Mercado Pago / Alias / PayPal
  document.querySelectorAll('.topbar-icon-coffee, .btn-cafecito, .sidebar-card-cafecito button, .mobile-card-cafecito button').forEach(btn => {
    btn.closest('button')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.BuscapetAds) {
        window.BuscapetAds.openDonationModal();
      }
    });
  });

  document.querySelectorAll('.btn-login, .avatar-initials').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.BuscapetFirebase) {
        window.BuscapetFirebase.openAuthModal();
      } else {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
          authModal.classList.add('show');
          authModal.style.display = 'block';
          document.body.classList.add('modal-open');
        }
      }
    });
  });

  // 10. Navegación Inferior (Móvil)
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
        if (window.BuscapetFirebase) {
          window.BuscapetFirebase.openAuthModal();
        } else {
          const authModal = document.getElementById('auth-modal');
          if (authModal) {
            authModal.classList.add('show');
            authModal.style.display = 'block';
            document.body.classList.add('modal-open');
          }
        }
      }
    });
  });

  // 11. Acceso a Panel OscarSoft
  const adminEntryBtn = document.getElementById('btn-admin-entry');
  if (adminEntryBtn) {
    adminEntryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.BuscapetAdmin) window.BuscapetAdmin.openModal();
    });
  }

});
