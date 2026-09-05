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

    // Renderizar las ranuras de foto iniciales para que el botón "Añadir" funcione
    this.renderPhotoUploadSlots();
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
  // =========================================================================
  // LOCATION SELECTOR & CASCADING DROPDOWNS
  // =========================================================================

  populateCountrySelects() {
    if (typeof BuscapetLocations === 'undefined' || !BuscapetLocations.getCountries) {
      console.warn('BuscapetLocations not ready yet');
      return;
    }

    const countries = BuscapetLocations.getCountries();
    const sidebarCountrySelect = document.getElementById('sidebar-country-select');
    const sidebarStateSelect = document.getElementById('sidebar-state-select');
    const sidebarCitySelect = document.getElementById('sidebar-city-select');
    const reportCountrySelect = document.getElementById('report-country');

    const filterOptionsHtml = `
      <option value="">🌎 Todos los Países (Todo el mundo)</option>
      ${countries.map(c => `<option value="${c.code}" ${c.code === 'AR' ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('')}
    `;

    const reportOptionsHtml = `
      <option value="">Seleccionar País...</option>
      ${countries.map(c => `<option value="${c.code}" ${c.code === 'AR' ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('')}
    `;

    if (sidebarCountrySelect) {
      sidebarCountrySelect.innerHTML = filterOptionsHtml;
      sidebarCountrySelect.value = 'AR'; // Argentina por defecto para mostrar provincias
      sidebarCountrySelect.onchange = () => this.onSidebarCountryChange();
      this.onSidebarCountryChange(); // Llena las provincias de inmediato
    }

    if (sidebarStateSelect) {
      sidebarStateSelect.onchange = () => this.onSidebarStateChange();
    }

    if (reportCountrySelect) {
      reportCountrySelect.innerHTML = reportOptionsHtml;
      reportCountrySelect.value = 'AR';
      reportCountrySelect.onchange = () => this.onReportCountryChange();
      this.onReportCountryChange();
    }
  },

  onSidebarCountryChange() {
    const sidebarCountry = document.getElementById('sidebar-country-select');
    const countryCode = sidebarCountry ? sidebarCountry.value : '';
    const stateSelect = document.getElementById('sidebar-state-select');
    const citySelect = document.getElementById('sidebar-city-select');

    if (!stateSelect || !citySelect) return;

    if (!countryCode) {
      stateSelect.innerHTML = '<option value="">Todos los Estados/Provincias</option>';
      citySelect.innerHTML = '<option value="">Todas las Ciudades</option>';
      return;
    }

    const states = BuscapetLocations.getStatesByCountryCode(countryCode);
    stateSelect.innerHTML = `
      <option value="">Todos los Estados/Provincias (${states.length})</option>
      ${states.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
    `;
    citySelect.innerHTML = '<option value="">Todas las Ciudades</option>';
  },

  onSidebarStateChange() {
    const sidebarCountry = document.getElementById('sidebar-country-select');
    const countryCode = sidebarCountry ? sidebarCountry.value : 'AR';
    const stateSelect = document.getElementById('sidebar-state-select');
    const citySelect = document.getElementById('sidebar-city-select');

    if (!stateSelect || !citySelect) return;

    const stateName = stateSelect.value;
    if (!stateName) {
      citySelect.innerHTML = '<option value="">Todas las Ciudades</option>';
      return;
    }

    const cities = BuscapetLocations.getCitiesByState(countryCode, stateName);
    citySelect.innerHTML = `
      <option value="">Todas las Ciudades (${cities.length})</option>
      ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
    `;
  },

  applySidebarLocationFilter() {
    const countrySelect = document.getElementById('sidebar-country-select');
    const stateSelect = document.getElementById('sidebar-state-select');
    const citySelect = document.getElementById('sidebar-city-select');

    const country = countrySelect ? countrySelect.value : '';
    const state = stateSelect ? stateSelect.value : '';
    const city = citySelect ? citySelect.value : '';

    BuscapetFeed.filterByLocation(country, state, city);

    let label = '🌎 Todas las ubicaciones';
    if (city) {
      label = `📍 ${city}`;
    } else if (state) {
      label = `📍 ${state}`;
    } else if (country) {
      const cObj = BuscapetLocations.countries.find(c => c.code === country);
      label = cObj ? `${cObj.flag} ${cObj.name}` : `📍 ${country}`;
    }

    const pill = document.getElementById('header-location-pill');
    if (pill) pill.textContent = label;

    BuscapetNotifications.showPushBanner('Filtro de Ubicación Aplicado', `Mostrando reportes de: ${label}`);
  },

  resetSidebarLocationFilter() {
    const countrySelect = document.getElementById('sidebar-country-select');
    const stateSelect = document.getElementById('sidebar-state-select');
    const citySelect = document.getElementById('sidebar-city-select');

    if (countrySelect) {
      countrySelect.value = '';
      this.onSidebarCountryChange();
    }
    if (stateSelect) stateSelect.innerHTML = '<option value="">Todos los Estados/Provincias</option>';
    if (citySelect) citySelect.innerHTML = '<option value="">Todas las Ciudades</option>';

    BuscapetFeed.filterByLocation('', '', '');
    BuscapetNotifications.showPushBanner('Filtro Restablecido', 'Mostrando reportes de todo el mundo.');
  },

  onFilterCountryChange() {
    const filterCountry = document.getElementById('filter-country-select');
    const countryCode = filterCountry ? filterCountry.value : '';
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
    stateSelect.onchange = () => this.onFilterStateChange();
  },

  onFilterStateChange() {
    const filterCountry = document.getElementById('filter-country-select');
    const countryCode = filterCountry ? filterCountry.value : '';
    const stateSelect = document.getElementById('filter-state-select');
    const citySelect = document.getElementById('filter-city-select');

    if (!stateSelect || !citySelect) return;

    const stateName = stateSelect.value;
    if (!stateName) {
      citySelect.innerHTML = '<option value="">Todas las Ciudades</option>';
      return;
    }

    const cities = BuscapetLocations.getCitiesByState(countryCode, stateName);
    citySelect.innerHTML = `
      <option value="">Todas las Ciudades</option>
      ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
    `;
  },

  onReportCountryChange() {
    const reportCountry = document.getElementById('report-country');
    const countryCode = reportCountry ? reportCountry.value : 'AR';
    const stateSelect = document.getElementById('report-state');
    const citySelect = document.getElementById('report-city');

    if (!stateSelect || !citySelect) return;

    const states = BuscapetLocations.getStatesByCountryCode(countryCode);
    stateSelect.innerHTML = `
      <option value="">Seleccionar Estado/Provincia...</option>
      ${states.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
    `;
    citySelect.innerHTML = '<option value="">Seleccionar Ciudad...</option>';
    stateSelect.onchange = () => this.onReportStateChange();
  },

  onReportStateChange() {
    const reportCountry = document.getElementById('report-country');
    const countryCode = reportCountry ? reportCountry.value : 'AR';
    const stateSelect = document.getElementById('report-state');
    const citySelect = document.getElementById('report-city');

    if (!stateSelect || !citySelect) return;

    const stateName = stateSelect.value;
    if (!stateName) {
      citySelect.innerHTML = '<option value="">Seleccionar Ciudad...</option>';
      return;
    }

    const cities = BuscapetLocations.getCitiesByState(countryCode, stateName);
    citySelect.innerHTML = `
      <option value="">Seleccionar Ciudad...</option>
      ${cities.map(c => `<option value="${c}">${c}</option>`).join('')}
    `;
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
      resultsContainer.innerHTML = '<div style="font-size:12px; color:var(--text-muted); padding:8px 0;">No se encontraron ubicaciones para esa búsqueda.</div>';
      return;
    }

    resultsContainer.innerHTML = matches.map(m => `
      <div class="chat-thread-item" style="padding:8px 12px; margin-bottom:4px; cursor:pointer;" onclick="BuscapetApp.selectQuickLocation('${m.countryCode}', '${m.stateName.replace(/'/g, "\\'")}', '${m.cityName.replace(/'/g, "\\'")}')">
        <i class="fa-solid fa-location-dot" style="color:var(--primary);"></i>
        <span style="font-size:13px; font-weight:600;">${m.cityName}, ${m.stateName} (${m.flag} ${m.countryName})</span>
      </div>
    `).join('');
  },

  showLost() {
    BuscapetFeed.filterByType('lost');
    document.querySelectorAll('.category-tabs .tab-pill, .filter-category-list .filter-cat-btn, .nav-center-menu .nav-link-btn').forEach(b => {
      b.classList.remove('active');
      if (b.classList.contains('pill-lost') || b.textContent.includes('Perdidos')) {
        b.classList.add('active');
      }
    });
  },

  showAdoptions() {
    BuscapetFeed.filterByType('adopt');
    document.querySelectorAll('.category-tabs .tab-pill, .filter-category-list .filter-cat-btn, .nav-center-menu .nav-link-btn').forEach(b => {
      b.classList.remove('active');
      if (b.classList.contains('pill-adopt') || b.textContent.includes('Adopciones')) {
        b.classList.add('active');
      }
    });
  },

  selectQuickLocation(countryCode, stateName, cityName) {
    // Sync dropdowns in modal
    const filterCountry = document.getElementById('filter-country-select');
    if (filterCountry) {
      filterCountry.value = countryCode;
      this.onFilterCountryChange();
    }
    const filterState = document.getElementById('filter-state-select');
    if (filterState) {
      filterState.value = stateName;
      if (filterState.onchange) filterState.onchange();
    }
    const filterCity = document.getElementById('filter-city-select');
    if (filterCity) {
      filterCity.value = cityName;
    }

    this.applyLocationFilter(countryCode, stateName, cityName);
    this.closeLocationModal();
  },

  applyLocationFilter(countryCode, stateName, cityName) {
    const country = countryCode !== undefined ? countryCode : (document.getElementById('filter-country-select')?.value || '');
    const state = stateName !== undefined ? stateName : (document.getElementById('filter-state-select')?.value || '');
    const city = cityName !== undefined ? cityName : (document.getElementById('filter-city-select')?.value || '');

    BuscapetFeed.filterByLocation(country, state, city);

    // Update Header and Sidebar Location Pills
    const pills = document.querySelectorAll('#header-location-pill');
    const countryObj = BuscapetLocations.countries.find(c => c.code === country);
    const flag = countryObj ? countryObj.flag : '🌎';
    let pillLabel = '🌎 Todas las ubicaciones';
    if (city) {
      pillLabel = `${flag} ${city}`;
    } else if (state) {
      pillLabel = `${flag} ${state}`;
    } else if (countryObj) {
      pillLabel = `${flag} ${countryObj.name}`;
    }

    pills.forEach(pill => {
      pill.textContent = pillLabel;
    });

    this.closeLocationModal();
  },

  resetLocationFilter() {
    const filterCountry = document.getElementById('filter-country-select');
    const filterState = document.getElementById('filter-state-select');
    const filterCity = document.getElementById('filter-city-select');
    const searchInput = document.getElementById('location-search-input');
    const searchResults = document.getElementById('location-search-results');

    if (filterCountry) filterCountry.value = '';
    if (filterState) filterState.innerHTML = '<option value="">Todos los Estados/Provincias</option>';
    if (filterCity) filterCity.innerHTML = '<option value="">Todas las Ciudades</option>';
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';

    BuscapetFeed.filterByLocation('', '', '');
    document.querySelectorAll('#header-location-pill').forEach(pill => {
      pill.textContent = '🌎 Todas las ubicaciones';
    });
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
    const modal = document.getElementById('photo-source-modal');
    if (modal) {
      modal.classList.add('active');
    } else {
      this.openGallery();
    }
  },

  closePhotoSourceModal() {
    const modal = document.getElementById('photo-source-modal');
    if (modal) modal.classList.remove('active');
  },

  openCamera() {
    this.closePhotoSourceModal();
    const cameraInput = document.getElementById('hidden-camera-input');
    if (cameraInput) {
      cameraInput.click();
    }
  },

  openGallery() {
    this.closePhotoSourceModal();
    const galleryInput = document.getElementById('hidden-gallery-input');
    if (galleryInput) {
      galleryInput.click();
    }
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

      // Intentar leer GPS del EXIF de la primera foto
      if (file === filesToRead[0]) {
        this._tryReadExifLocation(file);
      }
    });

    event.target.value = ''; // Reset file input
  },

  _tryReadExifLocation(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const view = new DataView(e.target.result);
        // Verificar que sea JPEG
        if (view.getUint16(0, false) !== 0xFFD8) return;

        let offset = 2;
        while (offset < view.byteLength - 2) {
          const marker = view.getUint16(offset, false);
          offset += 2;
          if (marker === 0xFFE1) { // APP1 / EXIF
            const length = view.getUint16(offset, false);
            const exifData = new DataView(e.target.result, offset + 2, length - 2);
            const gps = this._parseExifGPS(exifData);
            if (gps) {
              this._showPhotoLocationBtn(gps.lat, gps.lng);
            }
            return;
          }
          if (offset + 2 > view.byteLength) break;
          offset += view.getUint16(offset, false);
        }
      } catch (err) {
        // Sin EXIF, no importa
      }
    };
    reader.readAsArrayBuffer(file);
  },

  _parseExifGPS(exif) {
    try {
      // Verificar header Exif
      const header = String.fromCharCode(
        exif.getUint8(0), exif.getUint8(1),
        exif.getUint8(2), exif.getUint8(3)
      );
      if (!header.startsWith('Exif')) return null;

      const littleEndian = exif.getUint16(6) === 0x4949;
      const ifdOffset = exif.getUint32(10, littleEndian) + 6;
      const numEntries = exif.getUint16(ifdOffset, littleEndian);

      let gpsIFDOffset = null;
      for (let i = 0; i < numEntries; i++) {
        const entryOffset = ifdOffset + 2 + i * 12;
        const tag = exif.getUint16(entryOffset, littleEndian);
        if (tag === 0x8825) { // GPSInfoIFDPointer
          gpsIFDOffset = exif.getUint32(entryOffset + 8, littleEndian) + 6;
          break;
        }
      }
      if (!gpsIFDOffset) return null;

      const gpsEntries = exif.getUint16(gpsIFDOffset, littleEndian);
      const gps = {};
      for (let i = 0; i < gpsEntries; i++) {
        const entryOffset = gpsIFDOffset + 2 + i * 12;
        const tag = exif.getUint16(entryOffset, littleEndian);
        const valOffset = exif.getUint32(entryOffset + 8, littleEndian) + 6;

        if (tag === 0x0001) gps.latRef = String.fromCharCode(exif.getUint8(entryOffset + 8));
        if (tag === 0x0003) gps.lngRef = String.fromCharCode(exif.getUint8(entryOffset + 8));
        if (tag === 0x0002) {
          // 3 rationals: deg, min, sec
          const d = exif.getUint32(valOffset, littleEndian) / exif.getUint32(valOffset + 4, littleEndian);
          const m = exif.getUint32(valOffset + 8, littleEndian) / exif.getUint32(valOffset + 12, littleEndian);
          const s = exif.getUint32(valOffset + 16, littleEndian) / exif.getUint32(valOffset + 20, littleEndian);
          gps.lat = d + m / 60 + s / 3600;
        }
        if (tag === 0x0004) {
          const d = exif.getUint32(valOffset, littleEndian) / exif.getUint32(valOffset + 4, littleEndian);
          const m = exif.getUint32(valOffset + 8, littleEndian) / exif.getUint32(valOffset + 12, littleEndian);
          const s = exif.getUint32(valOffset + 16, littleEndian) / exif.getUint32(valOffset + 20, littleEndian);
          gps.lng = d + m / 60 + s / 3600;
        }
      }

      if (!gps.lat || !gps.lng) return null;
      if (gps.latRef === 'S') gps.lat = -gps.lat;
      if (gps.lngRef === 'W') gps.lng = -gps.lng;

      return { lat: gps.lat, lng: gps.lng };
    } catch (e) {
      return null;
    }
  },

  _showPhotoLocationBtn(lat, lng) {
    // Remover botón previo si existía
    const existing = document.getElementById('photo-location-btn');
    if (existing) existing.remove();

    const grid = document.getElementById('photo-uploader-grid');
    if (!grid) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'photo-location-btn';
    btn.innerHTML = `<i class="fa-solid fa-location-dot"></i> 📍 Usar ubicación de la foto`;
    btn.style.cssText = `
      width: 100%; margin-top: 8px; padding: 9px 14px;
      background: linear-gradient(135deg, #00C9A7 0%, #0097A7 100%);
      color: #fff; border: none; border-radius: var(--radius-sm);
      font-size: 12.5px; font-weight: 700; font-family: inherit;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      cursor: pointer; box-shadow: 0 3px 10px rgba(0,201,167,0.35);
      animation: fadeIn 0.3s ease;
    `;
    btn.onclick = () => {
      // Hacer geocodificación inversa con Nominatim
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then(r => r.json())
        .then(data => {
          const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          const addrInput = document.getElementById('report-address');
          if (addrInput) {
            addrInput.value = addr;
            addrInput.style.borderColor = '#00C9A7';
            setTimeout(() => addrInput.style.borderColor = '', 2000);
          }
          btn.innerHTML = `<i class="fa-solid fa-check"></i> ✅ Ubicación aplicada`;
          btn.style.background = 'linear-gradient(135deg, #27ae60 0%, #1a8a45 100%)';
          setTimeout(() => btn.remove(), 3000);
        })
        .catch(() => {
          // Si falla Nominatim, poner coordenadas directamente
          const addrInput = document.getElementById('report-address');
          if (addrInput) addrInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        });
    };

    grid.parentNode.insertBefore(btn, grid.nextSibling);
  },


  removePhoto(index) {
    this.uploadedPhotos.splice(index, 1);
    this.renderPhotoUploadSlots();
  },

  renderPhotoUploadSlots() {
    const grid = document.getElementById('photo-uploader-grid');
    if (!grid) return;

    const countBadge = document.getElementById('photo-count-badge');
    if (countBadge) {
      countBadge.textContent = `${this.uploadedPhotos.length}/4 fotos`;
    }

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
    alias: 'oscar.stella.mp',
    holder: 'Oscar Nicolás Stella',
    arsAmount: '$14.000 ARS',
    paypalEmail: 'oscarnicolasstella@yahoo.com.ar',
    publicKey: 'APP_USR-0a741409-599f-434a-84ba-996c4eb0b958',
    accessToken: 'APP_USR-7254310245914481-090511-ea2d70cd02d87cc2e2a70c6833406a33-741894322'
  },

  loadPaymentSettings() {
    try {
      const stored = localStorage.getItem('buscapet_payment_settings');
      if (stored) {
        this.paymentSettings = { ...this.paymentSettings, ...JSON.parse(stored) };
      }
    } catch (e) {}
    // Ensure accurate defaults
    if (!this.paymentSettings.paypalEmail || this.paymentSettings.paypalEmail === 'oscarns@gmail.com') {
      this.paymentSettings.paypalEmail = 'oscarnicolasstella@yahoo.com.ar';
    }
    if (!this.paymentSettings.alias || this.paymentSettings.alias === 'buscapet.oscarsoft') {
      this.paymentSettings.alias = 'oscar.stella.mp';
    }
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

    if (window.BuscapetFirebase && BuscapetFirebase.db) {
      try {
        BuscapetFirebase.db.collection('settings').doc('payment').set(this.paymentSettings);
      } catch (e) {}
    }

    BuscapetNotifications.showPushBanner(
      '¡Configuración Guardada! ✅',
      `Alias "${this.paymentSettings.alias}" y datos de cobro guardados con éxito.`
    );
    alert(`¡Datos guardados con éxito!\n\nAlias: ${this.paymentSettings.alias}\nTitular: ${this.paymentSettings.holder}\nPayPal: ${this.paymentSettings.paypalEmail}`);
  },

  updateDynamicPaymentUI() {
    // Update Donation Modal
    const mpAliasText = document.getElementById('mp-alias-text');
    if (mpAliasText) mpAliasText.textContent = this.paymentSettings.alias;

    const mpHolderText = document.getElementById('mp-holder-text');
    if (mpHolderText) mpHolderText.textContent = this.paymentSettings.holder;

    const paypalEmailText = document.getElementById('paypal-email-text');
    if (paypalEmailText) paypalEmailText.textContent = this.paymentSettings.paypalEmail;

    // Update Advertising Modal Alias Box
    const adAliasBox = document.getElementById('ad-alias-info-box');
    if (adAliasBox) {
      adAliasBox.innerHTML = `
        <div style="font-size: 11.5px; font-weight: 800; color: #009EE3; display: flex; justify-content: space-between; align-items: center;">
          <span><i class="fa-solid fa-building-columns"></i> O Transferir por Alias / CBU:</span>
          <button class="btn-copy-sm" style="background:var(--bg-card); color:var(--text-main); border:1px solid var(--border); padding:3px 8px; border-radius:4px; font-size:10.5px; cursor:pointer;" onclick="BuscapetApp.copyDonationData('${this.paymentSettings.alias}', 'Alias')">
            <i class="fa-regular fa-copy"></i> Copiar
          </button>
        </div>
        <div style="font-size: 12.5px; margin-top: 4px;"><strong>Alias:</strong> <code style="color:#009EE3; font-weight:bold; font-size:13px;">${this.paymentSettings.alias}</code></div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Titular: ${this.paymentSettings.holder} &bull; Monto: ${this.paymentSettings.arsAmount} / mes (~10 USD)</div>
      `;
    }
  },

  async payAdWithMercadoPago() {
    const businessName = document.getElementById('ad-biz-name')?.value.trim() || 'Publicidad Buscapet';
    const desc = document.getElementById('ad-biz-desc')?.value.trim() || 'Anuncio destacado en Buscapet';
    const price = 14000;
    const btn = document.getElementById('btn-mp-ad-pay');
    
    try {
      if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando Mercado Pago...';
      
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.paymentSettings.accessToken}`
        },
        body: JSON.stringify({
          items: [
            {
              title: `Publicidad Buscapet (30 días) - ${businessName}`,
              description: desc.substring(0, 120),
              quantity: 1,
              unit_price: price,
              currency_id: 'ARS'
            }
          ],
          back_urls: {
            success: window.location.href,
            failure: window.location.href,
            pending: window.location.href
          },
          auto_return: 'approved'
        })
      });
      
      const data = await response.json();
      if (data && data.init_point) {
        window.open(data.init_point, '_blank');
      } else {
        alert(`No se pudo generar el link directo. Puedes transferir $14.000 ARS al Alias: ${this.paymentSettings.alias}`);
      }
    } catch (err) {
      console.error('Error MP Preference:', err);
      alert(`Puedes abonar con transferencia de $14.000 ARS al Alias: ${this.paymentSettings.alias}`);
    } finally {
      if (btn) btn.innerHTML = '<i class="fa-solid fa-credit-card"></i> Pagar $14.000 ARS con Mercado Pago / Tarjetas';
    }
  },

  async donateWithMercadoPago(amount = 2000) {
    const btn = document.getElementById('btn-mp-donate');
    try {
      if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Conectando Mercado Pago...';
      
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.paymentSettings.accessToken}`
        },
        body: JSON.stringify({
          items: [
            {
              title: 'Donación Solidaria Cafecito - Buscapet Mascotas',
              description: 'Apoyo al mantenimiento y servidores de Buscapet',
              quantity: 1,
              unit_price: amount,
              currency_id: 'ARS'
            }
          ],
          back_urls: {
            success: window.location.href,
            failure: window.location.href,
            pending: window.location.href
          },
          auto_return: 'approved'
        })
      });
      
      const data = await response.json();
      if (data && data.init_point) {
        window.open(data.init_point, '_blank');
      } else {
        alert(`Puedes donar transfiriendo al Alias: ${this.paymentSettings.alias}`);
      }
    } catch (err) {
      console.error('Error MP Donación:', err);
      alert(`Puedes donar transfiriendo al Alias: ${this.paymentSettings.alias}`);
    } finally {
      if (btn) btn.innerHTML = `<i class="fa-solid fa-credit-card"></i> Donar $${amount.toLocaleString('es-AR')} ARS con Mercado Pago / Tarjeta`;
    }
  },

  toggleLocationFilter() {
    const collapseEl = document.getElementById('location-filter-collapse');
    const iconEl = document.getElementById('loc-toggle-icon');
    if (collapseEl) {
      collapseEl.classList.toggle('open');
      if (iconEl) {
        iconEl.innerHTML = collapseEl.classList.contains('open') 
          ? '<i class="fa-solid fa-chevron-up"></i>' 
          : '<i class="fa-solid fa-chevron-down"></i>';
      }
    }
  },
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

// Initialize app when DOM is ready (supports fast cache & dynamic loads)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    BuscapetApp.init();
  });
} else {
  BuscapetApp.init();
}
