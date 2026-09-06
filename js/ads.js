// =============================================================================
// BUSCAPET - MONETIZATION, ADS & DONATIONS (MERCADO PAGO CHECKOUT PRO & PAYPAL)
// Basado en AppSettings, DonationModal y AdRequestModal de Flutter
// =============================================================================

var BuscapetAds = window.BuscapetAds = {
  activeAds: [
    {
      id: 'ad-1',
      businessName: 'Veterinaria & Urgencias 24h San Roque',
      category: 'Veterinaria 24h · Guardias y Cirugías',
      city: 'Palermo, CABA',
      bannerUrl: 'img/posts/demo/ad_vet.jpg',
      promoText: 'Atención de emergencias veterinarias las 24 hs, cirugías, ecografías y vacunación completa. Mencionando a Buscapet obtenés 15% de descuento.',
      phone: '+5491155550024',
      whatsapp: '5491155550024',
      website: 'https://instagram.com/veterinaria_sanroque',
      badge: 'VETERINARIA 24H',
      active: true
    },
    {
      id: 'ad-2',
      businessName: 'Pet Shop & Boutique Huellitas Felices',
      category: 'Pet Shop · Alimentos Balanceados',
      city: 'Bariloche, Río Negro',
      bannerUrl: 'img/posts/demo/ad_petshop.jpg',
      promoText: 'Envíos a domicilio en el día sin cargo. Alimentos balanceados premium de todas las marcas, accesorios, correas reforzadas y antiparasitarios.',
      phone: '+5492944550055',
      whatsapp: '5492944550055',
      website: 'https://instagram.com/huellitas_felices_pet',
      badge: 'PET SHOP DESTACADO',
      active: true
    }
  ],

  // Credenciales y datos oficiales de Oscar Nicolás Stella (idénticos a AppSettings Flutter)
  paymentSettings: {
    mpAlias: 'oscar.stella.mp',
    mpHolder: 'Oscar Nicolás Stella',
    paypalEmail: 'oscarnicolasstella@yahoo.com.ar',
    paypalLink: 'https://www.paypal.com/paypalme/oscarns',
    priceArs: 14000,
    priceUsd: 15,
    donationPriceArs: 2000
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

    const heroAdText = document.querySelector('.hero-ad-btn span');
    if (heroAdText) {
      heroAdText.textContent = `📢 Anunciá tu Veterinaria o Negocio (${formattedArs})`;
    }

    // Actualizar Alias y Titular en modales
    const aliasElements = document.querySelectorAll('.dynamic-mp-alias');
    aliasElements.forEach(el => { el.textContent = this.paymentSettings.mpAlias; });

    const holderElements = document.querySelectorAll('.dynamic-mp-holder');
    holderElements.forEach(el => { el.textContent = this.paymentSettings.mpHolder; });

    const paypalElements = document.querySelectorAll('.dynamic-paypal-email');
    paypalElements.forEach(el => { el.textContent = this.paymentSettings.paypalEmail; });
  },

  // ============ MODAL DE DONACIÓN / CAFECITO ============
  openDonationModal() {
    const modal = document.getElementById('donation-modal');
    if (!modal) return;
    this.updatePriceDisplays();
    modal.classList.add('show');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
  },

  closeDonationModal() {
    const modal = document.getElementById('donation-modal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  },

  payDonationWithMercadoPago(amount = 2000) {
    if (window.MercadoPagoService) {
      window.MercadoPagoService.openDonationCheckout(amount);
    } else {
      window.open('https://link.mercadopago.com.ar/', '_blank');
    }
  },

  openPayPalDonation() {
    window.open(this.paymentSettings.paypalLink || 'https://www.paypal.com/paypalme/oscarns', '_blank');
  },

  copyAlias(btnId = 'btn-copy-alias') {
    navigator.clipboard.writeText(this.paymentSettings.mpAlias).then(() => {
      if (window.buscapetToast) window.buscapetToast(`📋 Alias copiado: ${this.paymentSettings.mpAlias}`, 'success');
      const btn = document.getElementById(btnId);
      if (btn) {
        const prev = btn.textContent;
        btn.textContent = '¡COPIADO!';
        setTimeout(() => { btn.textContent = prev; }, 2000);
      }
    });
  },

  copyPayPal(btnId = 'btn-copy-paypal') {
    navigator.clipboard.writeText(this.paymentSettings.paypalEmail).then(() => {
      if (window.buscapetToast) window.buscapetToast(`📋 PayPal copiado: ${this.paymentSettings.paypalEmail}`, 'success');
      const btn = document.getElementById(btnId);
      if (btn) {
        const prev = btn.textContent;
        btn.textContent = '¡COPIADO!';
        setTimeout(() => { btn.textContent = prev; }, 2000);
      }
    });
  },

  // ============ MODAL DE PUBLICIDAD ============
  openAdModal() {
    const modal = document.getElementById('ad-modal');
    if (!modal) return;

    this.uploadedBanner = null;

    const formView = document.getElementById('ad-form-view');
    const paymentView = document.getElementById('ad-payment-view');
    if (formView) formView.style.display = 'block';
    if (paymentView) paymentView.style.display = 'none';

    this.updatePriceDisplays();

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
      alert('Por favor completa el nombre del negocio, WhatsApp y texto del anuncio.');
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

    const pendingList = JSON.parse(localStorage.getItem('buscapet_pending_ads') || '[]');
    pendingList.push(pendingAd);
    localStorage.setItem('buscapet_pending_ads', JSON.stringify(pendingList));

    // Pasar al paso de pago
    const formView = document.getElementById('ad-form-view');
    const paymentView = document.getElementById('ad-payment-view');
    if (formView) formView.style.display = 'none';
    if (paymentView) paymentView.style.display = 'block';
  },

  payAdWithMercadoPago() {
    const name = document.getElementById('ad-req-name')?.value.trim() || 'Anunciante';
    if (window.MercadoPagoService) {
      window.MercadoPagoService.openAdCheckout(name, this.paymentSettings.priceArs);
    } else {
      window.open('https://link.mercadopago.com.ar/', '_blank');
    }
  },

  sendProofWhatsApp() {
    const name = document.getElementById('ad-req-name')?.value.trim() || 'mi negocio';
    const text = encodeURIComponent(`Hola OscarSoft / Buscapet, acabo de transferir la pauta publicitaria para ${name}. Adjunto mi comprobante para la activación.`);
    window.open(`https://wa.me/5491155554321?text=${text}`, '_blank');
  }
};
