// ==========================================================================
// BUSCAPET - MAIN APP CONTROLLER & WORKFLOWS
// ==========================================================================

var BuscapetApp = window.BuscapetApp = {
  currentTab: 'feed',
  uploadedPhotos: [],
  selectedReportType: 'lost', // 'lost' | 'found'

  init() {
    // Initialize components
    BuscapetFirebase.init();
    BuscapetFeed.init();
    BuscapetChat.init();
    BuscapetNotifications.init();
    this.loadPaymentSettings();
    this.loadAdRequests();

    // Populate country dropdowns in Location Selector and Report Form
    this.populateCountrySelects();

    // Setup character counter for description
    const descInput = document.getElementById('report-desc');
    const charCount = document.getElementById('desc-char-count');
    if (descInput && charCount) {
      descInput.addEventListener('input', () => {
        charCount.textContent = `${descInput.value.length}/200 caracteres`;
      });
    }

    // Live search for locations
    const searchInput = document.getElementById('location-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleLocationSearch(e.target.value));
    }

    // Street autocomplete listener
    const streetInput = document.getElementById('report-address');
    if (streetInput) {
      let debounceTimer;
      streetInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => this.handleStreetAutocomplete(e.target.value), 350);
      });
    }

    // Explicitly ensure feed is rendered
    BuscapetFeed.render();
  },

  // Street autocomplete using OpenStreetMap Nominatim
  async handleStreetAutocomplete(query) {
    const dropdown = document.getElementById('street-autocomplete-dropdown');
    if (!dropdown) return;

    if (!query || query.trim().length < 3) {
      dropdown.classList.remove('active');
      dropdown.innerHTML = '';
      return;
    }

    const countryCode = document.getElementById('report-country')?.value || 'AR';
    const stateName = document.getElementById('report-state')?.value || '';
    const cityName = document.getElementById('report-city')?.value || '';

    const searchQuery = `${query}, ${cityName} ${stateName}`;

    try {
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchQuery)}&limit=5`);
      const data = await response.json();

      if (data && data.features && data.features.length > 0) {
        dropdown.innerHTML = data.features.map(f => {
          const props = f.properties;
          const label = [props.name, props.street, props.housenumber, props.city || cityName, props.country].filter(Boolean).join(', ');
          const lng = f.geometry.coordinates[0];
          const lat = f.geometry.coordinates[1];
          return `
            <div class="autocomplete-item" onclick="BuscapetApp.selectStreetOption('${label.replace(/'/g, "\\'")}', ${lat}, ${lng})">
              <i class="fa-solid fa-map-pin" style="color:var(--primary);"></i>
              <span>${label}</span>
            </div>
          `;
        }).join('');
        dropdown.classList.add('active');
      } else {
        dropdown.innerHTML = '<div class="autocomplete-item" style="color:var(--text-muted);">Sin sugerencias automáticas. Puedes fijar el punto en el mapa.</div>';
        dropdown.classList.add('active');
      }
    } catch (err) {
      dropdown.classList.remove('active');
    }
  },

  selectStreetOption(label, lat, lng) {
    const streetInput = document.getElementById('report-address');
    const dropdown = document.getElementById('street-autocomplete-dropdown');
    if (streetInput) streetInput.value = label;
    if (dropdown) dropdown.classList.remove('active');

    // Update map pin and center
    BuscapetMap.currentPickedCoords = { lat, lng };
    if (BuscapetMap.pickerMap && BuscapetMap.pickerMarker) {
      BuscapetMap.pickerMap.setView([lat, lng], 16);
      BuscapetMap.pickerMarker.setLatLng([lat, lng]);
    }
  },

  // =========================================================================
  // LOCATION SELECTOR & CASCADING DROPDOWNS
  // =========================================================================

  populateCountrySelects() {
    const countries = BuscapetLocations.getCountries();
    const filterCountrySelect = document.getElementById('filter-country-select');
    const reportCountrySelect = document.getElementById('report-country');

    const optionsHtml = `
      <option value="">Seleccionar País...</option>
      ${countries.map(c => `<option value="${c.code}" ${c.code === 'AR' ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('')}
    `;

    if (filterCountrySelect) {
      filterCountrySelect.innerHTML = optionsHtml;
      filterCountrySelect.addEventListener('change', () => this.onFilterCountryChange());
      this.onFilterCountryChange(); // Trigger initial
    }

    if (reportCountrySelect) {
      reportCountrySelect.innerHTML = optionsHtml;
      reportCountrySelect.addEventListener('change', () => this.onReportCountryChange());
      this.onReportCountryChange();
    }
  },

  onFilterCountryChange() {
    const countryCode = document.getElementById('filter-country-select').value;
    const stateSelect = document.getElementById('filter-state-select');
    const citySelect = document.getElementById('filter-city-select');

    if (!stateSelect || !citySelect) return;

    if (!countryCode) {
      stateSelect.innerHTML = '<option value="">Todos los Estados/Provincias</option>';
      citySelect.innerHTML = '<option value="">Todas las Ciudades</option>';
      return;
    }

    const states = BuscapetLocations.getStatesByCountryCode(countryCode);
    stateSelect.innerHTML = `
      <option value="">Todos los Estados/Provincias</option>
      ${states.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
    `;
    citySelect.innerHTML = '<option value="">Todas las Ciudades</option>';

    stateSelect.onchange = () => {
      const stateName = stateSelect.value;
      const cities = BuscapetLocations.getCitiesByState(countryCode, stateName);
      citySelect.innerHTML = `
        <option value="">Todas las Ciudades</option>
        ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
      `;
    };
  },

  onReportCountryChange() {
    const countryCode = document.getElementById('report-country').value;
    const stateSelect = document.getElementById('report-state');
    const citySelect = document.getElementById('report-city');

    if (!stateSelect || !citySelect) return;

    const states = BuscapetLocations.getStatesByCountryCode(countryCode);
    stateSelect.innerHTML = `
      <option value="">Seleccionar Estado/Provincia...</option>
      ${states.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
    `;
    citySelect.innerHTML = '<option value="">Seleccionar Ciudad...</option>';

    stateSelect.onchange = () => {
      const stateName = stateSelect.value;
      const cities = BuscapetLocations.getCitiesByState(countryCode, stateName);
      citySelect.innerHTML = `
        <option value="">Seleccionar Ciudad...</option>
        ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
      `;
    };
  },

  handleLocationSearch(query) {
    const resultsContainer = document.getElementById('location-search-results');
    if (!resultsContainer) return;

    if (!query || query.length < 2) {
      resultsContainer.innerHTML = '';
      return;
    }

    const matches = BuscapetLocations.searchLocation(query);
    if (matches.length === 0) {
      resultsContainer.innerHTML = '<div style="font-size:12px; color:var(--text-muted); padding:8px 0;">No se encontraron ubicaciones.</div>';
      return;
    }

    resultsContainer.innerHTML = matches.map(m => `
      <div class="chat-thread-item" style="padding:8px 12px; margin-bottom:4px;" onclick="BuscapetApp.selectQuickLocation('${m.countryCode}', '${m.stateName}', '${m.cityName}')">
        <i class="fa-solid fa-location-dot" style="color:var(--primary);"></i>
        <span style="font-size:13px; font-weight:600;">${m.cityName}, ${m.stateName} (${m.flag} ${m.countryName})</span>
      </div>
    `).join('');
  },

  showLost() {
    BuscapetFeed.filterByType('lost');
    document.querySelectorAll('.category-tabs .tab-pill').forEach(b => {
      b.classList.toggle('active', b.classList.contains('pill-lost'));
    });
    this.openLocationModal();
  },

  showAdoptions() {
    BuscapetFeed.filterByType('adopt');
    document.querySelectorAll('.category-tabs .tab-pill').forEach(b => {
      b.classList.toggle('active', b.classList.contains('pill-adopt'));
    });
    this.openLocationModal();
  },

  selectQuickLocation(countryCode, stateName, cityName) {
    this.applyLocationFilter(countryCode, stateName, cityName);
    this.closeLocationModal();
  },

  applyLocationFilter(countryCode, stateName, cityName) {
    const country = countryCode || document.getElementById('filter-country-select')?.value;
    const state = stateName !== undefined ? stateName : document.getElementById('filter-state-select')?.value;
    const city = cityName !== undefined ? cityName : document.getElementById('filter-city-select')?.value;

    BuscapetFeed.filterByLocation(country, state, city);

    // Update Header Location Pill
    const pill = document.getElementById('header-location-pill');
    if (pill) {
      const countryObj = BuscapetLocations.countries.find(c => c.code === country);
      const flag = countryObj ? countryObj.flag : '🌎';
      if (city) {
        pill.textContent = `${flag} ${city}`;
      } else if (state) {
        pill.textContent = `${flag} ${state}`;
      } else if (countryObj) {
        pill.textContent = `${flag} ${countryObj.name}`;
      } else {
        pill.textContent = '🌎 Todo el mundo';
      }
    }

    this.closeLocationModal();
  },

  resetLocationFilter() {
    BuscapetFeed.filterByLocation('', '', '');
    const pill = document.getElementById('header-location-pill');
    if (pill) pill.textContent = '🌎 Todo el mundo';
    this.closeLocationModal();
  },

  openLocationModal() {
    const modal = document.getElementById('location-modal');
    if (modal) modal.classList.add('active');
  },

  closeLocationModal() {
    const modal = document.getElementById('location-modal');
    if (modal) modal.classList.remove('active');
  },

  // =========================================================================
  // CREATE PET REPORT WORKFLOW (REQUIRES AUTH & MANDATORY GEOLOCATION)
  // =========================================================================

  openCreateModal(defaultType = 'lost') {
    // Condition: User must be logged in to post
    if (!BuscapetFirebase.isLoggedIn()) {
      BuscapetFirebase.pendingAction = () => this.openCreateModal(defaultType);
      BuscapetFirebase.openAuthModal();
      BuscapetNotifications.showPushBanner(
        'Iniciar Sesión Requerido',
        'Por seguridad y confianza de la comunidad, debes iniciar sesión para reportar una mascota.',
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80'
      );
      return;
    }

    this.setReportType(defaultType);
    this.uploadedPhotos = [];
    this.renderPhotoUploadSlots();

    const modal = document.getElementById('create-report-modal');
    if (modal) modal.classList.add('active');

    // Set default datetime to right now
    const dtInput = document.getElementById('report-datetime');
    if (dtInput) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dtInput.value = now.toISOString().slice(0, 16);
    }

    // Init picker map and request GPS immediately
    setTimeout(() => {
      BuscapetMap.initPickerMap(-34.6037, -58.3816);
      BuscapetMap.useCurrentGPSLocation();
    }, 250);
  },

  closeCreateModal() {
    const modal = document.getElementById('create-report-modal');
    if (modal) modal.classList.remove('active');
  },

  setReportType(type) {
    this.selectedReportType = type;
    const btnLost = document.getElementById('btn-type-lost');
    const btnFound = document.getElementById('btn-type-found');
    const btnAdopt = document.getElementById('btn-type-adopt');

    if (btnLost) btnLost.classList.toggle('active', type === 'lost');
    if (btnFound) btnFound.classList.toggle('active', type === 'found');
    if (btnAdopt) btnAdopt.classList.toggle('active', type === 'adopt');

    const titleEl = document.getElementById('create-modal-title');
    if (titleEl) {
      if (type === 'lost') {
        titleEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:var(--danger)"></i> Reportar Mascota Perdida';
      } else if (type === 'found') {
        titleEl.innerHTML = '<i class="fa-solid fa-shield-heart" style="color:var(--success)"></i> Reportar Mascota Encontrada';
      } else if (type === 'adopt') {
        titleEl.innerHTML = '<i class="fa-solid fa-heart" style="color:#8B5CF6"></i> Publicar Mascota en Adopción';
      }
    }
  },

  triggerPhotoPicker() {
    if (this.uploadedPhotos.length >= 4) {
      alert('Máximo 4 fotos por publicación.');
      return;
    }
    const input = document.getElementById('hidden-photo-input');
    if (input) input.click();
  },

  handlePhotoSelected(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const availableSlots = 4 - this.uploadedPhotos.length;
    if (availableSlots <= 0) {
      alert('Ya has alcanzado el límite máximo de 4 fotos.');
      return;
    }

    const filesToRead = files.slice(0, availableSlots);

    filesToRead.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.uploadedPhotos.length < 4) {
          this.uploadedPhotos.push(e.target.result);
          this.renderPhotoUploadSlots();
        }
      };
      reader.readAsDataURL(file);
    });

    event.target.value = ''; // Reset file input
  },

  removePhoto(index) {
    this.uploadedPhotos.splice(index, 1);
    this.renderPhotoUploadSlots();
  },

  renderPhotoUploadSlots() {
    const grid = document.getElementById('photo-uploader-grid');
    if (!grid) return;

    let slotsHtml = '';

    // Render uploaded photos
    this.uploadedPhotos.forEach((photoUrl, idx) => {
      slotsHtml += `
        <div class="photo-slot">
          <img src="${photoUrl}" alt="Foto ${idx + 1}">
          <button type="button" class="remove-photo-btn" onclick="BuscapetApp.removePhoto(${idx})">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;
    });

    // Render remaining empty slots
    const remaining = 4 - this.uploadedPhotos.length;
    for (let i = 0; i < remaining; i++) {
      slotsHtml += `
        <div class="photo-slot" onclick="BuscapetApp.triggerPhotoPicker()">
          <i class="fa-solid fa-camera" style="font-size:20px;"></i>
          <span>${i === 0 && this.uploadedPhotos.length === 0 ? 'Añadir' : `Foto ${this.uploadedPhotos.length + i + 1}`}</span>
        </div>
      `;
    }

    grid.innerHTML = slotsHtml;
  },

  submitPetReport() {
    // Check auth
    if (!BuscapetFirebase.isLoggedIn()) {
      alert('Debes iniciar sesión para publicar.');
      BuscapetFirebase.openAuthModal();
      return;
    }

    const name = document.getElementById('report-name')?.value.trim() || (this.selectedReportType === 'lost' ? 'Mascota Perdida' : 'Mascota Encontrada');
    const species = document.getElementById('report-species')?.value || 'Perro';
    const breed = document.getElementById('report-breed')?.value.trim() || 'Mestizo / Sin definir';
    const gender = document.getElementById('report-gender')?.value || 'Macho';
    const description = document.getElementById('report-desc')?.value.trim();
    const countryCode = document.getElementById('report-country')?.value || 'AR';
    const stateName = document.getElementById('report-state')?.value || 'Buenos Aires';
    const cityName = document.getElementById('report-city')?.value || 'Ciudad';
    const address = document.getElementById('report-address')?.value.trim() || `${cityName}, ${stateName}`;

    if (!description) {
      alert('Por favor agrega una descripción con datos de contacto o detalles de la mascota.');
      return;
    }

    // Ensure at least one photo
    if (this.uploadedPhotos.length === 0) {
      alert('Por favor sube al menos 1 foto clara de la mascota.');
      return;
    }

    const coords = BuscapetMap.currentPickedCoords || { lat: -34.6037, lng: -58.3816 };
    const countryObj = BuscapetLocations.countries.find(c => c.code === countryCode);

    const rawDateTime = document.getElementById('report-datetime')?.value;
    let formattedDate = 'Recién publicado';
    if (rawDateTime) {
      const d = new Date(rawDateTime);
      formattedDate = `${d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs`;
    }

    const newPost = {
      type: this.selectedReportType,
      petName: name,
      species: species,
      breed: breed,
      gender: gender,
      photos: this.uploadedPhotos,
      description: description,
      date: formattedDate,
      isSample: false,
      location: {
        countryCode: countryCode,
        countryName: countryObj ? countryObj.name : 'Argentina',
        stateName: stateName,
        cityName: cityName,
        address: address,
        lat: coords.lat,
        lng: coords.lng
      },
      user: {
        id: BuscapetFirebase.currentUser.uid,
        name: BuscapetFirebase.currentUser.displayName,
        avatar: BuscapetFirebase.currentUser.photoURL
      }
    };

    BuscapetFeed.addPost(newPost);
    this.closeCreateModal();

    // Show celebratory push banner & sound
    BuscapetNotifications.showPushBanner(
      '¡Mascota Reportada con Geolocalización!',
      `El reporte de ${name} ya está visible con su mapa de ubicación exacto.`,
      this.uploadedPhotos[0]
    );

    // Scroll to top
    const scrollView = document.querySelector('.screen-scroll-view');
    if (scrollView) scrollView.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // =========================================================================
  // DONATION / CAFECITO / MERCADO PAGO / PAYPAL MODAL
  // =========================================================================

  openDonationModal() {
    const modal = document.getElementById('donation-modal');
    if (modal) modal.classList.add('active');
  },

  closeDonationModal() {
    const modal = document.getElementById('donation-modal');
    if (modal) modal.classList.remove('active');
  },

  copyDonationData(text, type) {
    navigator.clipboard.writeText(text);
    BuscapetNotifications.showPushBanner(
      '¡Copiado!',
      `${type} (${text}) copiado al portapapeles. ¡Muchas gracias por tu apoyo!`
    );
  },

  // =========================================================================
  // ADMIN PANEL CONTROLLER (OSCARSOFT ADMIN)
  // =========================================================================

  openAdminPanel() {
    const modal = document.getElementById('admin-panel-modal');
    if (modal) {
      modal.classList.add('active');
      this.renderAdminPostList();
      this.renderAdminAdRequests();

      // Populate current payment settings in the Admin form
      const aliasInput = document.getElementById('admin-setting-alias');
      const holderInput = document.getElementById('admin-setting-holder');
      const arsInput = document.getElementById('admin-setting-ars');
      const paypalInput = document.getElementById('admin-setting-paypal');

      if (aliasInput) aliasInput.value = this.paymentSettings.alias;
      if (holderInput) holderInput.value = this.paymentSettings.holder;
      if (arsInput) arsInput.value = this.paymentSettings.arsAmount;
      if (paypalInput) paypalInput.value = this.paymentSettings.paypalEmail;
    }
  },

  closeAdminPanel() {
    const modal = document.getElementById('admin-panel-modal');
    if (modal) modal.classList.remove('active');
  },

  // Dynamic Payment Settings Management
  paymentSettings: {
    alias: 'buscapet.oscarsoft',
    holder: 'Oscar Nicolás Stella',
    arsAmount: '$12.000 ARS',
    paypalEmail: 'oscarns@gmail.com'
  },

  loadPaymentSettings() {
    try {
      const stored = localStorage.getItem('buscapet_payment_settings');
      if (stored) {
        this.paymentSettings = { ...this.paymentSettings, ...JSON.parse(stored) };
      }
    } catch (e) {}
    this.updateDynamicPaymentUI();
  },

  savePaymentSettings() {
    const alias = document.getElementById('admin-setting-alias')?.value.trim();
    const holder = document.getElementById('admin-setting-holder')?.value.trim();
    const arsAmount = document.getElementById('admin-setting-ars')?.value.trim();
    const paypalEmail = document.getElementById('admin-setting-paypal')?.value.trim();

    if (alias) this.paymentSettings.alias = alias;
    if (holder) this.paymentSettings.holder = holder;
    if (arsAmount) this.paymentSettings.arsAmount = arsAmount;
    if (paypalEmail) this.paymentSettings.paypalEmail = paypalEmail;

    localStorage.setItem('buscapet_payment_settings', JSON.stringify(this.paymentSettings));
    this.updateDynamicPaymentUI();

    BuscapetNotifications.showPushBanner(
      '¡Configuración Guardada!',
      `Alias "${this.paymentSettings.alias}" y datos de cobro actualizados en toda la app.`
    );
  },

  updateDynamicPaymentUI() {
    // Update Donation Modal
    const mpAliasText = document.getElementById('mp-alias-text');
    if (mpAliasText) mpAliasText.textContent = this.paymentSettings.alias;

    const paypalEmailText = document.getElementById('paypal-email-text');
    if (paypalEmailText) paypalEmailText.textContent = this.paymentSettings.paypalEmail;

    // Update Advertising Modal Alias Box
    const adAliasBox = document.getElementById('ad-alias-info-box');
    if (adAliasBox) {
      adAliasBox.innerHTML = `
        <div style="font-size: 11.5px; font-weight: 800; color: #00D084;">
          <i class="fa-solid fa-building-columns"></i> Datos de Transferencia Directa (Mercado Pago / Banco):
        </div>
        <div style="font-size: 12px; color: var(--text-main); margin-top: 4px;">
          <strong>Alias:</strong> <code style="background:var(--bg-main); padding:2px 6px; border-radius:4px; font-weight:bold; color:var(--primary);">${this.paymentSettings.alias}</code>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
          Titular: ${this.paymentSettings.holder} &bull; Monto: ${this.paymentSettings.arsAmount} / mes
        </div>
      `;
    }
  },

  renderAdminPostList() {
    const container = document.getElementById('admin-posts-list-box');
    const totalCountEl = document.getElementById('admin-stat-total');
    const lostCountEl = document.getElementById('admin-stat-lost');
    const foundCountEl = document.getElementById('admin-stat-found');

    const posts = BuscapetFeed.posts;

    if (totalCountEl) totalCountEl.textContent = posts.length;
    if (lostCountEl) lostCountEl.textContent = posts.filter(p => p.type === 'lost').length;
    if (foundCountEl) foundCountEl.textContent = posts.filter(p => p.type === 'found').length;

    if (!container) return;

    if (posts.length === 0) {
      container.innerHTML = '<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:20px;">No hay reportes para moderar.</div>';
      return;
    }

    container.innerHTML = posts.map(post => `
      <div class="admin-post-item">
        <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
          <img src="${post.photos[0] || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=100&q=80'}" style="width:36px; height:36px; border-radius:6px; object-fit:cover;">
          <div style="font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            <div style="font-weight:700; color:var(--text-main);">${post.petName} (${post.type === 'lost' ? 'Perdido' : 'Encontrado'})</div>
            <div style="font-size:11px; color:var(--text-muted);">${post.location.cityName || post.location.stateName} &bull; ${post.user.name}</div>
          </div>
        </div>
        <button class="btn-admin-delete" onclick="BuscapetFeed.deletePost('${post.id}')" title="Eliminar publicación">
          <i class="fa-solid fa-trash"></i> Eliminar
        </button>
      </div>
    `).join('');
  },

  sendAdminBroadcast() {
    const msg = prompt('Escribe el mensaje de alerta general para todos los usuarios de Buscapet:');
    if (msg && msg.trim()) {
      BuscapetNotifications.showPushBanner(
        '📢 Comunicado Oficial de Buscapet',
        msg.trim()
      );
    }
  },

  // =========================================================================
  // ADVERTISING & SPONSORSHIP MODAL (WITH RECEIPT UPLOAD & ADMIN APPROVAL)
  // =========================================================================

  uploadedAdReceipt: null,
  adRequests: [],

  loadAdRequests() {
    try {
      const stored = localStorage.getItem('buscapet_ad_requests');
      if (stored) {
        this.adRequests = JSON.parse(stored);
      } else {
        // Sample pending request for demonstration
        this.adRequests = [
          {
            id: 'ad-req-101',
            businessName: 'Veterinaria & Pet Shop Palermo',
            category: 'Veterinaria',
            desc: 'Guardia 24hs, ecografías y vacunas. 15% de descuento presentando la app.',
            city: 'Palermo, CABA',
            contact: '+54 9 11 4455-6677',
            img: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=200&q=80',
            payMethod: 'Transferencia / Mercado Pago (Alias)',
            receiptImg: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=300&q=80',
            receiptCode: 'OP-7892154',
            status: 'pending', // 'pending' | 'approved' | 'rejected'
            date: 'Hoy, 11:45'
          }
        ];
        this.saveAdRequests();
      }
    } catch (e) {
      this.adRequests = [];
    }

    // Subscribe to Firestore live ad requests sync
    if (window.BuscapetFirebase && BuscapetFirebase.syncAdRequestsFromFirestore) {
      BuscapetFirebase.syncAdRequestsFromFirestore(cloudReqs => {
        if (cloudReqs && cloudReqs.length > 0) {
          this.adRequests = cloudReqs;
          this.saveAdRequests();
          this.renderAdminAdRequests();
        }
      });
    }
  },

  saveAdRequests() {
    try {
      localStorage.setItem('buscapet_ad_requests', JSON.stringify(this.adRequests));
    } catch (e) {}
  },

  openAdvertisingModal() {
    const modal = document.getElementById('advertising-modal');
    if (modal) modal.classList.add('active');
    this.updateAdPreview();
  },

  closeAdvertisingModal() {
    const modal = document.getElementById('advertising-modal');
    if (modal) modal.classList.remove('active');
  },

  handleAdReceiptUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedAdReceipt = e.target.result;
        const previewBox = document.getElementById('ad-receipt-preview-box');
        const previewImg = document.getElementById('ad-receipt-preview-img');
        if (previewBox && previewImg) {
          previewImg.src = this.uploadedAdReceipt;
          previewBox.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    }
  },

  updateAdPreview() {
    const name = document.getElementById('ad-biz-name')?.value.trim() || 'Tu Negocio Aquí';
    const category = document.getElementById('ad-biz-category')?.value || 'Veterinaria';
    const desc = document.getElementById('ad-biz-desc')?.value.trim() || 'Tu descripción aparecerá aquí para todos los usuarios de tu zona.';
    const city = document.getElementById('ad-biz-city')?.value.trim() || 'Tu Ciudad';
    const imgUrl = document.getElementById('ad-biz-img')?.value.trim() || 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=200&q=80';

    const titleEl = document.getElementById('preview-ad-title');
    const descEl = document.getElementById('preview-ad-desc');
    const imgEl = document.getElementById('preview-ad-img');

    if (titleEl) titleEl.textContent = `${name} (${category}) 🩺`;
    if (descEl) descEl.textContent = `${desc} • ${city}`;
    if (imgEl) imgEl.src = imgUrl;
  },

  submitAdInquiry() {
    const businessName = document.getElementById('ad-biz-name')?.value.trim();
    const contact = document.getElementById('ad-biz-contact')?.value.trim();
    const city = document.getElementById('ad-biz-city')?.value.trim();
    const desc = document.getElementById('ad-biz-desc')?.value.trim();
    const category = document.getElementById('ad-biz-category')?.value || 'Veterinaria';
    const imgUrl = document.getElementById('ad-biz-img')?.value.trim() || 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=200&q=80';
    const payMethod = document.querySelector('input[name="ad-pay-method"]:checked')?.value || 'alias';
    const receiptCode = document.getElementById('ad-receipt-url')?.value.trim() || 'Comprobante adjunto';

    if (!businessName || !contact || !desc || !city) {
      alert('Por favor completa el nombre de tu negocio, descripción, ciudad y teléfono de contacto.');
      return;
    }

    let methodLabel = 'Transferencia / Mercado Pago (Alias: buscapet.oscarsoft)';
    if (payMethod === 'stores') methodLabel = 'Suscripción Play Store / App Store ($10 USD)';
    if (payMethod === 'paypal') methodLabel = 'PayPal ($10 USD)';

    const newRequest = {
      id: 'ad-req-' + Date.now(),
      businessName: businessName,
      category: category,
      desc: desc,
      city: city,
      contact: contact,
      img: imgUrl,
      payMethod: methodLabel,
      receiptImg: this.uploadedAdReceipt || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=300&q=80',
      receiptCode: receiptCode,
      status: 'pending',
      date: 'Recién enviado'
    };

    this.adRequests.unshift(newRequest);
    this.saveAdRequests();
    this.closeAdvertisingModal();

    // Persist to Cloud Firestore
    if (window.BuscapetFirebase && BuscapetFirebase.saveAdRequestToFirestore) {
      BuscapetFirebase.saveAdRequestToFirestore(newRequest);
    }

    // Notify user
    BuscapetNotifications.showPushBanner(
      '¡Comprobante y Solicitud Enviados!',
      `Gracias ${businessName}. El Administrador revisará el pago y activará tu anuncio en ${city}.`
    );

    // Notify admin
    setTimeout(() => {
      BuscapetNotifications.showPushBanner(
        '🔔 Alerta de Administrador (OscarSoft)',
        `Nueva solicitud publicitaria recibida de "${businessName}". Entra al Panel Admin para verificar el comprobante y aprobar.`
      );
    }, 1800);
  },

  contactViaWhatsApp(phone, businessName, isRenewal = false, daysLeft = 0) {
    if (!phone) {
      alert('Este anunciante no ingresó un número de teléfono válido.');
      return;
    }

    // Clean phone number
    let cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('549') || cleanPhone.startsWith('54')) {
        cleanPhone = '+' + cleanPhone;
      } else if (cleanPhone.startsWith('11') || cleanPhone.startsWith('15') || cleanPhone.length === 10) {
        cleanPhone = '+549' + cleanPhone.replace(/^15/, '');
      } else {
        cleanPhone = '+' + cleanPhone;
      }
    }

    let msg = `¡Hola ${businessName}! Te contactamos desde el equipo de Buscapet 🐾 sobre tu solicitud de publicidad.`;
    if (isRenewal) {
      msg = `¡Hola ${businessName}! Te escribimos de Buscapet 🐾. Te recordamos que tu período publicitario de 30 días ${daysLeft <= 0 ? 'ha vencido' : `vence en ${daysLeft} días`}. ¿Deseas renovar tu anuncio por otro mes ($10 USD / ${this.paymentSettings.arsAmount}) para seguir destacándote en tu zona?`;
    }

    const waUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  },

  renderAdminAdRequests() {
    const container = document.getElementById('admin-ad-requests-list-box');
    const badge = document.getElementById('admin-ad-requests-badge');
    if (!container) return;

    const pending = this.adRequests.filter(r => r.status === 'pending');
    const approved = this.adRequests.filter(r => r.status === 'approved');

    if (badge) badge.textContent = `${pending.length} Pendientes / ${approved.length} Activos`;

    if (pending.length === 0 && approved.length === 0) {
      container.innerHTML = '<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:16px;">No hay solicitudes ni anuncios activos.</div>';
      return;
    }

    let html = '';

    // 1. Pending requests
    if (pending.length > 0) {
      html += `<div style="font-size:11px; font-weight:800; color:#FFAA00; text-transform:uppercase; margin:4px 0 8px;"><i class="fa-solid fa-clock"></i> Solicitudes Pendientes con Comprobante:</div>`;
      html += pending.map(req => `
        <div style="background:var(--bg-main); border:1.5px solid rgba(255,170,0,0.4); border-radius:8px; padding:10px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
              <div style="font-size:13px; font-weight:800; color:var(--text-main);">${req.businessName} (${req.category})</div>
              <div style="font-size:11px; color:var(--text-muted);">${req.city} &bull; WhatsApp: <strong>${req.contact}</strong></div>
              <div style="font-size:11px; color:#00A699; font-weight:600; margin-top:2px;">
                <i class="fa-solid fa-credit-card"></i> ${req.payMethod}
              </div>
              <div style="font-size:11px; color:var(--text-muted);">Ref: ${req.receiptCode}</div>
            </div>
            <div style="text-align:right;">
              <img src="${req.receiptImg}" alt="Comprobante" style="width:52px; height:52px; border-radius:6px; object-fit:cover; border:1px solid var(--border);" title="Comprobante de Pago">
            </div>
          </div>
          <p style="font-size:11.5px; color:var(--text-main); margin:8px 0 10px; background:var(--bg-card); padding:6px; border-radius:4px;">
            "${req.desc}"
          </p>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button class="btn-primary-action" style="background:#00D084; color:#000; font-size:11px; font-weight:800; padding:6px 10px; width:auto;" onclick="BuscapetApp.approveAdRequest('${req.id}')">
              <i class="fa-solid fa-check"></i> Aprobar y Publicar
            </button>
            <button class="btn-primary-action" style="background:#25D366; color:#fff; font-size:11px; font-weight:800; padding:6px 10px; width:auto;" onclick="BuscapetApp.contactViaWhatsApp('${req.contact}', '${req.businessName}', false)">
              <i class="fa-brands fa-whatsapp"></i> WhatsApp
            </button>
            <button class="btn-admin-delete" style="font-size:11px; padding:6px 8px;" onclick="BuscapetApp.rejectAdRequest('${req.id}')">
              <i class="fa-solid fa-xmark"></i> Rechazar
            </button>
          </div>
        </div>
      `).join('');
    }

    // 2. Approved & Active 30-Day Ads
    if (approved.length > 0) {
      html += `<div style="font-size:11px; font-weight:800; color:#00D084; text-transform:uppercase; margin:12px 0 8px;"><i class="fa-solid fa-circle-check"></i> Anuncios Activos (Período 30 Días):</div>`;
      html += approved.map(ad => {
        const now = Date.now();
        const expiresAt = ad.expiresAt || (now + 30 * 24 * 60 * 60 * 1000);
        const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
        const isExpired = daysLeft <= 0;

        return `
          <div style="background:var(--bg-main); border:1px solid ${isExpired ? 'var(--danger)' : 'rgba(0,208,132,0.4)'}; border-radius:8px; padding:10px; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:12.5px; font-weight:800; color:var(--text-main);">${ad.businessName} (${ad.city})</div>
                <div style="font-size:11px; color:${isExpired ? 'var(--danger)' : '#00D084'}; font-weight:700;">
                  <i class="fa-regular fa-calendar-check"></i> ${isExpired ? '🔴 VENCIDO' : `🟢 ACTIVO (${daysLeft} días restantes)`}
                </div>
              </div>
              <button class="btn-primary-action" style="background:#25D366; color:#fff; font-size:11px; font-weight:800; padding:6px 10px; width:auto;" onclick="BuscapetApp.contactViaWhatsApp('${ad.contact}', '${ad.businessName}', true, ${daysLeft})">
                <i class="fa-brands fa-whatsapp"></i> Renovar ($10)
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    container.innerHTML = html;
  },

  approveAdRequest(reqId) {
    const req = this.adRequests.find(r => r.id === reqId);
    if (!req) return;

    req.status = 'approved';
    req.approvedAt = Date.now();
    req.expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000);
    this.saveAdRequests();

    // Activate the ad in the feed
    if (window.BuscapetFeed) {
      BuscapetFeed.customSponsoredAd = {
        title: `${req.businessName} (${req.category})`,
        desc: `${req.desc} • Contacto: ${req.contact}`,
        city: req.city,
        img: req.img,
        badge: 'Publicidad Aprobada'
      };
      BuscapetFeed.render();
    }

    this.renderAdminAdRequests();

    BuscapetNotifications.showPushBanner(
      '¡Publicidad Aprobada y Activada!',
      `El anuncio de "${req.businessName}" ha sido verificado y ya se encuentra visible en el feed por 30 días.`
    );
  },

  rejectAdRequest(reqId) {
    if (confirm('¿Deseas rechazar esta solicitud publicitaria?')) {
      this.adRequests = this.adRequests.filter(r => r.id !== reqId);
      this.saveAdRequests();
      this.renderAdminAdRequests();
      BuscapetNotifications.showPushBanner('Solicitud Rechazada', 'La solicitud fue descartada.');
    }
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-tab') === tabName);
    });

    if (tabName === 'feed') {
      BuscapetFeed.filterByType('all');
    } else if (tabName === 'lost') {
      BuscapetFeed.filterByType('lost');
    } else if (tabName === 'found') {
      BuscapetFeed.filterByType('found');
    } else if (tabName === 'chats') {
      if (BuscapetChat.chats.length > 0) {
        BuscapetChat.showChatWindow(BuscapetChat.chats[0]);
      }
    } else if (tabName === 'profile') {
      BuscapetFirebase.openAuthModal();
    }
  },

  setDeviceMode(mode) {
    const container = document.querySelector('.smartphone-container');
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-device') === mode);
    });

    if (!container) return;
    container.classList.remove('mode-android', 'mode-fullscreen');

    if (mode === 'android') {
      container.classList.add('mode-android');
    } else if (mode === 'fullscreen') {
      container.classList.add('mode-fullscreen');
    }
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  BuscapetApp.init();
});
