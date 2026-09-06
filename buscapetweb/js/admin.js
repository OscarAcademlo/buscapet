// =============================================================================
// BUSCAPET — OSCARSOFT ADMIN CONTROL PANEL (PIN: oscar2026)
// Basado en AdminScreen de Flutter (OscarSoft Master Admin)
// =============================================================================

var BuscapetAdmin = window.BuscapetAdmin = {
  authenticated: false,
  adminPin: 'oscar2026',

  init() {
    try {
      if (window.SafeSessionStorage && window.SafeSessionStorage.getItem('buscapet_admin_auth') === 'true') {
        this.authenticated = true;
      }
    } catch(e) {}
  },

  openModal() {
    const modal = document.getElementById('admin-modal');
    if (!modal) return;

    if (!this.authenticated) {
      this.showPinScreen();
    } else {
      this.showDashboardScreen();
    }

    modal.classList.add('show');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
  },

  closeModal() {
    const modal = document.getElementById('admin-modal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  },

  showPinScreen() {
    const pinBox = document.getElementById('admin-pin-view');
    const dashBox = document.getElementById('admin-dash-view');
    const errEl = document.getElementById('admin-pin-error');

    if (pinBox) pinBox.style.display = 'block';
    if (dashBox) dashBox.style.display = 'none';
    if (errEl) errEl.style.display = 'none';

    const input = document.getElementById('admin-pin-input');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 150);
    }
  },

  verifyPin(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('admin-pin-input');
    const errEl = document.getElementById('admin-pin-error');
    const pin = input ? input.value.trim() : '';

    if (pin === this.adminPin) {
      this.authenticated = true;
      try {
        if (window.SafeSessionStorage) window.SafeSessionStorage.setItem('buscapet_admin_auth', 'true');
      } catch(e) {}
      this.showDashboardScreen();
    } else {
      if (errEl) {
        errEl.textContent = '❌ PIN incorrecto. Acceso exclusivo OscarSoft.';
        errEl.style.display = 'block';
      }
    }
  },

  showDashboardScreen() {
    const pinBox = document.getElementById('admin-pin-view');
    const dashBox = document.getElementById('admin-dash-view');

    if (pinBox) pinBox.style.display = 'none';
    if (dashBox) dashBox.style.display = 'block';

    this.selectTab('settings');
    this.populateSettings();
    this.renderPendingAds();
    this.renderActiveAds();
    this.renderPetsList();
  },

  selectTab(tabKey) {
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
    });

    const settingsPanel = document.getElementById('admin-panel-settings');
    const pendingPanel = document.getElementById('admin-panel-pending');
    const activePanel = document.getElementById('admin-panel-active');
    const petsPanel = document.getElementById('admin-panel-pets');

    if (settingsPanel) settingsPanel.style.display = (tabKey === 'settings') ? 'block' : 'none';
    if (pendingPanel) pendingPanel.style.display = (tabKey === 'pending') ? 'block' : 'none';
    if (activePanel) activePanel.style.display = (tabKey === 'active') ? 'block' : 'none';
    if (petsPanel) petsPanel.style.display = (tabKey === 'pets') ? 'block' : 'none';

    if (tabKey === 'pending') this.renderPendingAds();
    if (tabKey === 'active') this.renderActiveAds();
    if (tabKey === 'pets') this.renderPetsList();
  },

  populateSettings() {
    if (!window.BuscapetAds) return;
    const s = window.BuscapetAds.paymentSettings;

    const mpAlias = document.getElementById('admin-mp-alias');
    const mpHolder = document.getElementById('admin-mp-holder');
    const paypalEmail = document.getElementById('admin-paypal-email');
    const priceArs = document.getElementById('admin-price-ars');
    const donationArs = document.getElementById('admin-donation-ars');

    if (mpAlias) mpAlias.value = s.mpAlias || 'oscar.stella.mp';
    if (mpHolder) mpHolder.value = s.mpHolder || 'Oscar Nicolás Stella';
    if (paypalEmail) paypalEmail.value = s.paypalEmail || 'oscarnicolasstella@yahoo.com.ar';
    if (priceArs) priceArs.value = s.priceArs || 14000;
    if (donationArs) donationArs.value = s.donationPriceArs || 2000;
  },

  saveSettings(e) {
    if (e) e.preventDefault();
    if (!window.BuscapetAds) return;

    const mpAlias = document.getElementById('admin-mp-alias')?.value.trim() || 'oscar.stella.mp';
    const mpHolder = document.getElementById('admin-mp-holder')?.value.trim() || 'Oscar Nicolás Stella';
    const paypalEmail = document.getElementById('admin-paypal-email')?.value.trim() || 'oscarnicolasstella@yahoo.com.ar';
    const priceArs = Number(document.getElementById('admin-price-ars')?.value) || 14000;
    const donationPriceArs = Number(document.getElementById('admin-donation-ars')?.value) || 2000;

    window.BuscapetAds.paymentSettings = {
      ...window.BuscapetAds.paymentSettings,
      mpAlias,
      mpHolder,
      paypalEmail,
      priceArs,
      donationPriceArs
    };

    window.BuscapetAds.save();
    if (window.buscapetToast) {
      window.buscapetToast('✅ Configuración de cobros guardada correctamente', 'success');
    } else {
      alert('Configuración guardada.');
    }
  },

  renderPendingAds() {
    const container = document.getElementById('admin-pending-list');
    if (!container) return;

    let pendingList = [];
    try {
      if (window.SafeStorage) {
        pendingList = JSON.parse(window.SafeStorage.getItem('buscapet_pending_ads') || '[]');
      }
    } catch(e) {}

    if (pendingList.length === 0) {
      container.innerHTML = `
        <div style="padding:24px;text-align:center;color:var(--text-muted);font-size:12.5px;">
          No hay solicitudes de publicidad pendientes de revisión.
        </div>
      `;
      return;
    }

    container.innerHTML = pendingList.map(ad => `
      <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px;">
        <div style="display:flex;gap:10px;align-items:center;">
          <img src="${ad.bannerUrl}" style="width:70px;height:50px;object-fit:cover;border-radius:6px;border:1px solid var(--border);">
          <div style="flex:1;min-width:0;">
            <div style="font-weight:800;font-size:14px;color:var(--warning);">${ad.businessName}</div>
            <div style="font-size:11.5px;color:var(--text-sub);">${ad.category} &bull; ${ad.city}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">📱 ${ad.phone}</div>
          </div>
        </div>
        <p style="font-size:12px;color:var(--text-main);margin:8px 0;line-height:1.35;">${ad.promoText}</p>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-sm btn-outline-danger" style="font-size:11.5px;padding:4px 10px;" onclick="BuscapetAdmin.rejectAd('${ad.id}')">
            ❌ Rechazar
          </button>
          <button class="btn btn-sm btn-success" style="font-size:11.5px;font-weight:800;padding:4px 12px;background:#22C55E;border-color:#22C55E;" onclick="BuscapetAdmin.approveAd('${ad.id}')">
            ✅ Aprobar y Publicar
          </button>
        </div>
      </div>
    `).join('');
  },

  approveAd(adId) {
    let pendingList = [];
    try {
      if (window.SafeStorage) pendingList = JSON.parse(window.SafeStorage.getItem('buscapet_pending_ads') || '[]');
    } catch(e) {}
    const ad = pendingList.find(a => a.id === adId);
    if (!ad) return;

    pendingList = pendingList.filter(a => a.id !== adId);
    try {
      if (window.SafeStorage) window.SafeStorage.setItem('buscapet_pending_ads', JSON.stringify(pendingList));
    } catch(e) {}

    ad.active = true;
    if (window.BuscapetAds) {
      window.BuscapetAds.activeAds.unshift(ad);
      window.BuscapetAds.save();
    }

    if (window.BuscapetFeed) window.BuscapetFeed.renderFeed();

    this.renderPendingAds();
    this.renderActiveAds();
    if (window.buscapetToast) window.buscapetToast('🎉 Anuncio aprobado y publicado en el feed!', 'success');
  },

  rejectAd(adId) {
    if (!confirm('¿Seguro que deseas rechazar esta solicitud publicitaria?')) return;
    let pendingList = [];
    try {
      if (window.SafeStorage) pendingList = JSON.parse(window.SafeStorage.getItem('buscapet_pending_ads') || '[]');
    } catch(e) {}
    pendingList = pendingList.filter(a => a.id !== adId);
    try {
      if (window.SafeStorage) window.SafeStorage.setItem('buscapet_pending_ads', JSON.stringify(pendingList));
    } catch(e) {}
    this.renderPendingAds();
  },

  renderActiveAds() {
    const container = document.getElementById('admin-active-list');
    if (!container || !window.BuscapetAds) return;

    const ads = window.BuscapetAds.activeAds;

    if (ads.length === 0) {
      container.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);">No hay anuncios activos.</div>';
      return;
    }

    container.innerHTML = ads.map(ad => `
      <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:10px;display:flex;align-items:center;gap:10px;">
        <img src="${ad.bannerUrl}" style="width:60px;height:45px;object-fit:cover;border-radius:6px;">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:13px;color:var(--text-main);">${ad.businessName}</div>
          <div style="font-size:11px;color:var(--text-muted);">${ad.category} &bull; ${ad.city}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button class="btn btn-sm ${ad.active ? 'btn-outline-warning' : 'btn-outline-success'}" style="font-size:11px;padding:3px 8px;" onclick="BuscapetAdmin.toggleAdStatus('${ad.id}')">
            ${ad.active ? 'Pausar' : 'Activar'}
          </button>
          <button class="btn btn-sm btn-outline-danger" style="font-size:11px;padding:3px 8px;" onclick="BuscapetAdmin.deleteAd('${ad.id}')">
            Eliminar
          </button>
        </div>
      </div>
    `).join('');
  },

  toggleAdStatus(adId) {
    if (!window.BuscapetAds) return;
    const ad = window.BuscapetAds.activeAds.find(a => a.id === adId);
    if (ad) {
      ad.active = !ad.active;
      window.BuscapetAds.save();
      if (window.BuscapetFeed) window.BuscapetFeed.renderFeed();
      this.renderActiveAds();
    }
  },

  deleteAd(adId) {
    if (!confirm('¿Eliminar este anuncio permanentemente?')) return;
    if (!window.BuscapetAds) return;
    window.BuscapetAds.activeAds = window.BuscapetAds.activeAds.filter(a => a.id !== adId);
    window.BuscapetAds.save();
    if (window.BuscapetFeed) window.BuscapetFeed.renderFeed();
    this.renderActiveAds();
  },

  renderPetsList() {
    const container = document.getElementById('admin-pets-list');
    if (!container || !window.BuscapetFeed) return;

    const posts = window.BuscapetFeed.posts || [];
    container.innerHTML = posts.map(p => `
      <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:8px;display:flex;align-items:center;gap:10px;">
        <img src="${(p.photos && p.photos[0]) || 'img/posts/demo/milo_1.jpg'}" style="width:45px;height:45px;border-radius:6px;object-fit:cover;">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:12.5px;color:var(--text-main);">${p.petName} (${p.species})</div>
          <div style="font-size:11px;color:var(--text-muted);">${p.location?.cityName || ''} &bull; ${p.isResolved ? '✅ Reencontrado' : '🔴 Activo'}</div>
        </div>
        <button class="btn btn-sm btn-outline-danger" style="font-size:10.5px;padding:3px 8px;" onclick="BuscapetAdmin.deletePost('${p.id}')">
          Eliminar
        </button>
      </div>
    `).join('');
  },

  deletePost(postId) {
    if (!confirm('¿Eliminar esta publicación?')) return;
    if (!window.BuscapetFeed) return;
    window.BuscapetFeed.posts = window.BuscapetFeed.posts.filter(p => p.id !== postId);
    window.BuscapetFeed.save();
    window.BuscapetFeed.renderFeed();
    this.renderPetsList();
  }
};
