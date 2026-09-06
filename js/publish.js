// ==========================================================================
// BUSCAPET - MULTI-TYPE POST PUBLISHER (LOST, FOUND 1-CLICK, ADOPT, SIGHTING)
// ==========================================================================

var BuscapetPublish = window.BuscapetPublish = {
  currentType: 'lost',
  uploadedPhotos: [],

  init() {
    // Setup file input listeners
    const fileInput = document.getElementById('publish-photo-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
    }
  },

  openModal(preselectedType = 'lost') {
    this.currentType = preselectedType;
    this.uploadedPhotos = [];
    this.renderPhotoPreviews();

    const modal = document.getElementById('publish-modal');
    if (!modal) return;

    this.selectTab(preselectedType);

    modal.classList.add('show');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');

    // Populate country/province selectors in publish modal if available
    this.populateLocationDropdowns();

    // Init picker map
    setTimeout(() => {
      if (window.BuscapetMap && typeof window.BuscapetMap.initPickerMap === 'function') {
        window.BuscapetMap.initPickerMap();
      }
    }, 250);
  },

  closeModal() {
    const modal = document.getElementById('publish-modal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  },

  selectTab(type) {
    this.currentType = type;
    document.querySelectorAll('.publish-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === type) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggle specific fields according to type
    const adoptFields = document.getElementById('publish-adopt-fields');
    const collarRow = document.getElementById('publish-collar-row');
    const fastGpsBtn = document.getElementById('publish-fast-gps-row');

    if (adoptFields) adoptFields.style.display = (type === 'adopt') ? 'block' : 'none';
    if (collarRow) collarRow.style.display = (type === 'adopt') ? 'none' : 'block';
    if (fastGpsBtn) fastGpsBtn.style.display = (type === 'found' || type === 'spotted') ? 'block' : 'none';
  },

  populateLocationDropdowns() {
    const countrySelect = document.getElementById('publish-country');
    const stateSelect = document.getElementById('publish-state');
    const citySelect = document.getElementById('publish-city');
    if (!countrySelect || !window.BuscapetLocations) return;

    const countries = window.BuscapetLocations.getCountries();
    countrySelect.innerHTML = countries.map(c => `
      <option value="${c.code}" ${c.code === 'AR' ? 'selected' : ''}>${c.flag} ${c.name}</option>
    `).join('');

    const updateStates = () => {
      const code = countrySelect.value;
      const states = window.BuscapetLocations.getStates(code);
      if (stateSelect) {
        stateSelect.innerHTML = '<option value="">Seleccionar Provincia / Estado</option>' + states.map(s => `
          <option value="${s.name}">${s.name}</option>
        `).join('');
      }
      if (citySelect) citySelect.innerHTML = '<option value="">Seleccionar Ciudad</option>';
    };

    const updateCities = () => {
      const code = countrySelect.value;
      const state = stateSelect ? stateSelect.value : '';
      const cities = window.BuscapetLocations.getCities(code, state);
      if (citySelect) {
        citySelect.innerHTML = '<option value="">Seleccionar Ciudad</option>' + cities.map(c => `
          <option value="${c}">${c}</option>
        `).join('');
      }
    };

    countrySelect.onchange = updateStates;
    if (stateSelect) stateSelect.onchange = updateCities;

    updateStates();
  },

  handlePhotoUpload(e) {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    files.slice(0, 5 - this.uploadedPhotos.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.uploadedPhotos.push(event.target.result);
        this.renderPhotoPreviews();
      };
      reader.readAsDataURL(file);
    });
  },

  renderPhotoPreviews() {
    const container = document.getElementById('publish-photo-previews');
    if (!container) return;

    container.innerHTML = this.uploadedPhotos.map((src, idx) => `
      <div style="position:relative;width:64px;height:64px;border-radius:8px;overflow:hidden;border:1px solid var(--border);">
        <img src="${src}" style="width:100%;height:100%;object-fit:cover;">
        <button type="button" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,.7);color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;" onclick="BuscapetPublish.removePhoto(${idx})">✕</button>
      </div>
    `).join('');
  },

  removePhoto(index) {
    this.uploadedPhotos.splice(index, 1);
    this.renderPhotoPreviews();
  },

  useGPS() {
    if (window.BuscapetMap && typeof window.BuscapetMap.useCurrentGPSLocation === 'function') {
      window.BuscapetMap.useCurrentGPSLocation((lat, lng) => {
        const addressInput = document.getElementById('publish-address');
        if (addressInput) {
          addressInput.value = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
        alert('📍 ¡Ubicación GPS capturada con éxito!');
      });
    }
  },

  submitPost(e) {
    if (e) e.preventDefault();

    const nameInput = document.getElementById('publish-name');
    const speciesSelect = document.getElementById('publish-species');
    const breedInput = document.getElementById('publish-breed');
    const genderSelect = document.getElementById('publish-gender');
    const descInput = document.getElementById('publish-desc');
    const phoneInput = document.getElementById('publish-phone');
    const addressInput = document.getElementById('publish-address');
    const countrySelect = document.getElementById('publish-country');
    const stateSelect = document.getElementById('publish-state');
    const citySelect = document.getElementById('publish-city');
    const hasCollarCheck = document.getElementById('publish-collar');
    const collarDetailsInput = document.getElementById('publish-collar-details');

    const petName = (nameInput ? nameInput.value.trim() : '') || (this.currentType === 'found' ? 'Mascota Encontrada' : 'Mascota');
    const description = (descInput ? descInput.value.trim() : '');

    if (!description) {
      alert('Por favor agrega una descripción con datos de la mascota.');
      return;
    }

    const coords = (window.BuscapetMap && window.BuscapetMap.currentPickedCoords) || { lat: -34.6037, lng: -58.3816 };

    const newPost = {
      id: 'post-' + Date.now(),
      type: this.currentType,
      petName: petName,
      species: speciesSelect ? speciesSelect.value : 'Perro',
      breed: (breedInput && breedInput.value.trim()) || 'Mestizo',
      gender: genderSelect ? genderSelect.value : 'Desconocido',
      photos: this.uploadedPhotos.length > 0 ? [...this.uploadedPhotos] : ['img/posts/demo/milo_1.jpg'],
      description: description,
      hasCollar: hasCollarCheck ? hasCollarCheck.checked : false,
      collarDetails: collarDetailsInput ? collarDetailsInput.value.trim() : '',
      location: {
        countryCode: countrySelect ? countrySelect.value : 'AR',
        countryName: countrySelect ? countrySelect.options[countrySelect.selectedIndex]?.text : 'Argentina',
        stateName: (stateSelect && stateSelect.value) || 'CABA',
        cityName: (citySelect && citySelect.value) || 'Caballito',
        address: (addressInput && addressInput.value.trim()) || 'Ubicación reportada',
        lat: coords.lat,
        lng: coords.lng
      },
      date: 'Hace un momento',
      user: {
        id: 'usr-current',
        name: 'Tú (Usuario)',
        avatar: 'img/posts/demo/avatar_nicolas.jpg',
        phone: (phoneInput && phoneInput.value.trim()) || '+5491155551234'
      },
      likes: 1,
      liked: true,
      shares: 0,
      isResolved: false,
      comments: []
    };

    if (window.BuscapetFeed && window.BuscapetFeed.posts) {
      window.BuscapetFeed.posts.unshift(newPost);
      window.BuscapetFeed.save();
      window.BuscapetFeed.renderFeed();
    }

    this.closeModal();
    alert(`🎉 ¡Reporte publicado con éxito! Ya está visible para toda la comunidad de Buscapet.`);
  }
};
