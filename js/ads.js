// ==========================================================================
// BUSCAPET - MONETIZATION & SPONSORED ADS CONTROLLER (MERCADO PAGO & PAYPAL)
// ==========================================================================

var BuscapetAds = window.BuscapetAds = {
  activeAds: [
    {
      id: 'ad-1',
      businessName: 'Veterinaria & Urgencias 24h San Martín',
      category: 'Veterinaria 24h · Guardias y Cirugías',
      city: 'Palermo, CABA',
      bannerUrl: 'img/posts/demo/ad_vet.jpg',
      promoText: 'Atención de emergencias las 24 hs. Quirófano, internación y ambulancia veterinaria. 15% de descuento mencionando a Buscapet.',
      phone: '+5491155550024',
      whatsapp: '5491155550024',
      website: 'https://veterinaria-demo.com',
      badge: 'VETERINARIA 24H',
      active: true
    },
    {
      id: 'ad-2',
      businessName: 'Pet Shop & Alimentos Huellitas',
      category: 'Pet Shop · Alimentos Balanceados',
      city: 'Caballito, CABA',
      bannerUrl: 'img/posts/demo/ad_petshop.jpg',
      promoText: 'Envíos a domicilio sin cargo en el día. Todas las marcas premium, accesorios, correas reforzadas y antiparasitarios.',
      phone: '+5491144440055',
      whatsapp: '5491144440055',
      website: 'https://petshop-demo.com',
      badge: 'PET SHOP DESTACADO',
      active: true
    }
  ],

  paymentSettings: {
    mpAlias: 'buscapet.oficial.mp',
    mpHolder: 'Oscar Nicolás Stella',
    paypalEmail: 'pagos@buscapet.click',
    priceArs: 14000,
    priceUsd: 15
  },

  uploadedBanner: null,

  init() {
    const savedAds = localStorage.getItem('buscapet_active_ads');
    if (savedAds) {
      try { this.activeAds = JSON.parse(savedAds); } catch (e) {}
    }

    const savedSettings = localStorage.getItem('buscapet_payment_settings');
    if (savedSettings) {
      try { this.paymentSettings = { ...this.paymentSettings, ...JSON.parse(savedSettings) }; } catch (e) {}
    }

    this.updatePriceDisplays();
  },

  save() {
    localStorage.setItem('buscapet_active_ads', JSON.stringify(this.activeAds));
    localStorage.setItem('buscapet_payment_settings', JSON.stringify(this.paymentSettings));
    this.updatePriceDisplays();
  },

  updatePriceDisplays() {
    const formattedArs = `$${Number(this.paymentSettings.priceArs).toLocaleString('es-AR')} ARS`;
    document.querySelectorAll('.ad-price-display').forEach(el => {
      el.textContent = formattedArs;
    });

    const bannerBtnText = document.querySelector('.hero-ad-btn span');
    if (bannerBtnText) {
      bannerBtnText.textContent = `📢 Anunciá tu Veterinaria o Negocio (${formattedArs})`;
    }
  },

  getAdForIndex(feedIndex) {
    const active = this.activeAds.filter(a => a.active);
    if (active.length === 0) return null;
    const idx = feedIndex % active.length;
    return active[idx];
  },

  buildAdCardHtml(ad) {
    return `
      <article class="pet-card border-ad" style="border-color:rgba(245,158,11,.6);background:linear-gradient(135deg,#1c160e 0%,#151820 100%);">
        <div style="background:linear-gradient(90deg,#F59E0B,#D97706);color:#000;padding:4px 10px;font-size:10px;font-weight:900;letter-spacing:1px;display:flex;align-items:center;justify-content:space-between;">
          <span>📢 PUBLICIDAD PATROCINADA</span>
          <span style="background:#000;color:#F59E0B;padding:1px 6px;border-radius:4px;font-size:9px;">DESTACADO</span>
        </div>

        <div class="card-header-row" style="padding:10px 12px 6px;">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(245,158,11,.2);border:1.5px solid var(--warning);display:flex;align-items:center;justify-content:center;font-size:18px;">
            🏥
          </div>
          <div class="card-user-info">
            <div class="card-username" style="color:var(--warning);font-size:13.5px;">${ad.businessName}</div>
            <div class="card-meta" style="color:var(--text-sub);">${ad.category} &bull; ${ad.city}</div>
          </div>
        </div>

        <div class="card-photo-wrap" style="cursor:default;">
          <img src="${ad.bannerUrl}" alt="${ad.businessName}">
        </div>

        <div class="card-details" style="padding:10px 12px;">
          <div style="font-size:13px;color:var(--text-main);line-height:1.45;margin-bottom:8px;">${ad.promoText}</div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;">
            <a class="contact-btn" style="background:#22C55E;color:#fff;" href="https://wa.me/${ad.whatsapp}?text=Hola,%20los%20contacto%20desde%20el%20anuncio%20de%20Buscapet!" target="_blank">
              <i class="bi bi-whatsapp"></i> WhatsApp
            </a>
            <a class="contact-btn" style="background:linear-gradient(90deg,var(--warning),#D97706);color:#000;font-weight:900;" href="tel:${ad.phone}">
              <i class="bi bi-telephone-fill"></i> Llamar
            </a>
          </div>
        </div>
      </article>
    `;
  },

  openAdModal() {
    const modal = document.getElementById('ad-modal');
    if (!modal) return;

    this.uploadedBanner = null;

    // Reset view to form
    const formView = document.getElementById('ad-form-view');
    const paymentView = document.getElementById('ad-payment-view');
    if (formView) formView.style.display = 'block';
    if (paymentView) paymentView.style.display = 'none';

    // Populate payment data
    const aliasEl = document.getElementById('ad-modal-alias');
    const holderEl = document.getElementById('ad-modal-holder');
    const paypalEl = document.getElementById('ad-modal-paypal');
    const priceEl = document.getElementById('ad-modal-price');

    if (aliasEl) aliasEl.textContent = this.paymentSettings.mpAlias;
    if (holderEl) holderEl.textContent = this.paymentSettings.mpHolder;
    if (paypalEl) paypalEl.textContent = this.paymentSettings.paypalEmail;
    if (priceEl) priceEl.textContent = `$${Number(this.paymentSettings.priceArs).toLocaleString('es-AR')} ARS (o $${this.paymentSettings.priceUsd} USD)`;

    modal.classList.add('show');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
  },

  closeAdModal() {
    const modal = document.getElementById('ad-modal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  },

  handleBannerUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      this.uploadedBanner = event.target.result;
      const preview = document.getElementById('ad-banner-preview');
      if (preview) {
        preview.src = this.uploadedBanner;
        preview.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  },

  submitAdRequest(e) {
    if (e) e.preventDefault();

    const name = document.getElementById('ad-req-name')?.value.trim();
    const category = document.getElementById('ad-req-category')?.value.trim();
    const city = document.getElementById('ad-req-city')?.value.trim();
    const promo = document.getElementById('ad-req-promo')?.value.trim();
    const phone = document.getElementById('ad-req-phone')?.value.trim();
    const website = document.getElementById('ad-req-web')?.value.trim();

    if (!name || !promo || !phone) {
      alert('Por favor completa el nombre del negocio, teléfono y texto del anuncio.');
      return;
    }

    const pendingAd = {
      id: 'ad-' + Date.now(),
      businessName: name,
      category: category || 'Comercio / Veterinaria',
      city: city || 'Zona local',
      bannerUrl: this.uploadedBanner || 'img/posts/demo/ad_vet.jpg',
      promoText: promo,
      phone: phone,
      whatsapp: phone.replace(/[^0-9]/g, ''),
      website: website || '',
      date: new Date().toLocaleDateString(),
      active: false
    };

    // Store in pending ads
    const pendingList = JSON.parse(localStorage.getItem('buscapet_pending_ads') || '[]');
    pendingList.push(pendingAd);
    localStorage.setItem('buscapet_pending_ads', JSON.stringify(pendingList));

    // Show Step 2: Payment screen
    const formView = document.getElementById('ad-form-view');
    const paymentView = document.getElementById('ad-payment-view');
    if (formView) formView.style.display = 'none';
    if (paymentView) paymentView.style.display = 'block';
  },

  copyAlias() {
    navigator.clipboard.writeText(this.paymentSettings.mpAlias).then(() => {
      const btn = document.getElementById('btn-copy-alias');
      if (btn) {
        btn.textContent = '¡COPIADO!';
        setTimeout(() => { btn.textContent = 'COPIAR ALIAS'; }, 2000);
      }
    });
  },

  copyPaypal() {
    navigator.clipboard.writeText(this.paymentSettings.paypalEmail).then(() => {
      const btn = document.getElementById('btn-copy-paypal');
      if (btn) {
        btn.textContent = '¡COPIADO!';
        setTimeout(() => { btn.textContent = 'COPIAR PAYPAL'; }, 2000);
      }
    });
  },

  sendProofWhatsApp() {
    const text = encodeURIComponent(`Hola OscarSoft / Buscapet, acabo de transferir la pauta publicitaria. Adjunto mi comprobante para la activación.`);
    window.open(`https://wa.me/5491155554321?text=${text}`, '_blank');
  }
};
