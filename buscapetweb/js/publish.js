// =============================================================================
// BUSCAPET - MULTI-TYPE POST PUBLISHER (LOST, FOUND 1-CLICK, ADOPT, SIGHTING)
// Basado fielmente en ReportScreen de Flutter
// =============================================================================

var BuscapetPublish = window.BuscapetPublish = {
  currentType: 'lost',
  uploadedPhotos: [],

  init() {
    const fileInput = document.getElementById('publish-photo-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
    }

    // Configurar autocompletado de calles OpenStreetMap Nominatim
    const addressInput = document.getElementById('publish-address');
    const suggestionsBox = document.getElementById('publish-address-suggestions');
    if (addressInput && suggestionsBox && window.LocationAutocompleteService) {
      window.LocationAutocompleteService.attachAutocomplete(addressInput, suggestionsBox, (selected) => {
        if (window.BuscapetMap && window.BuscapetMap.pickerMap && selected.lat && selected.lng) {
          window.BuscapetMap.pickerMap.setView([selected.lat, selected.lng], 16);
          if (window.BuscapetMap.pickerMarker) {
            window.BuscapetMap.pickerMarker.setLatLng([selected.lat, selected.lng]);
          }
          window.BuscapetMap.currentPickedCoords = { lat: selected.lat, lng: selected.lng };
        }
      });
    }

    // Cerrar modal al hacer clic en el fondo oscuro
    const modal = document.getElementById('publish-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal();
        }
      });
    }
  },

  openModal(preselectedType = 'lost') {
    this.currentType = preselectedType;
    this.uploadedPhotos = [];
    this.hasGpsLocation = false;
    this.renderPhotoPreviews();

    const modal = document.getElementById('publish-modal');
    if (!modal) return;

    this.selectTab(preselectedType);

    modal.classList.add('show');
    modal.style.setProperty('display', 'flex', 'important');
    document.body.classList.add('modal-open');

    this.populateLocationDropdowns();

    // Pre-llenar teléfono si el usuario está conectado en Firebase
    if (window.BuscapetFirebase && window.BuscapetFirebase.currentUser) {
      const phoneInput = document.getElementById('publish-phone');
      if (phoneInput && !phoneInput.value && window.BuscapetFirebase.currentUser.phone) {
        phoneInput.value = window.BuscapetFirebase.currentUser.phone;
      }
    }

    // Inicializar mapa de Leaflet en el formulario
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
      modal.style.setProperty('display', 'none', 'important');
      modal.style.display = 'none';
    }
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
      authModal.classList.remove('show');
      authModal.style.setProperty('display', 'none', 'important');
      authModal.style.display = 'none';
    }
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.paddingRight = '';
  },

  selectTab(type) {
    this.currentType = type;
    document.querySelectorAll('.publish-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === type);
    });

    const adoptFields = document.getElementById('publish-adopt-fields');
    const collarRow = document.getElementById('publish-collar-row');
    const fastGpsBtn = document.getElementById('publish-fast-gps-row');

    if (adoptFields) adoptFields.style.display = (type === 'adopt') ? 'block' : 'none';
    if (collarRow) collarRow.style.display = (type === 'adopt') ? 'none' : 'block';
    if (fastGpsBtn) fastGpsBtn.style.display = 'block'; // Siempre visible para perdidas y encontradas
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
          <option value="${s.name}" ${s.name === 'CABA' ? 'selected' : ''}>${s.name}</option>
        `).join('');
      }
      updateCities();
    };

    const updateCities = () => {
      const code = countrySelect.value;
      const state = (stateSelect && stateSelect.value) || 'CABA';
      const cities = window.BuscapetLocations.getCities(code, state);
      if (citySelect) {
        citySelect.innerHTML = '<option value="">Seleccionar Ciudad / Barrio</option>' + cities.map(c => `
          <option value="${c}" ${c === 'Palermo' ? 'selected' : ''}>${c}</option>
        `).join('');
      }
    };

    countrySelect.onchange = updateStates;
    if (stateSelect) stateSelect.onchange = updateCities;

    updateStates();
  },

  async compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.75) {
    let processFile = file;
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif' ||
      (file.name && (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')));
    if (isHeic && window.heic2any) {
      try {
        const convertedBlob = await window.heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: quality
        });
        processFile = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      } catch (heicErr) {
        console.warn('Error convirtiendo HEIC a JPEG:', heicErr);
      }
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        };
        img.onerror = () => {
          console.warn('No se pudo decodificar la imagen en canvas');
          resolve(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(processFile);
    });
  },

  async handlePhotoUpload(e) {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    const availableSlots = 5 - this.uploadedPhotos.length;
    const selectedFiles = files.slice(0, availableSlots);

    for (const file of selectedFiles) {
      try {
        const compressed = await this.compressImage(file, 800, 800, 0.75);
        if (compressed) {
          const photoIndex = this.uploadedPhotos.length;
          this.uploadedPhotos.push(compressed);
          this.renderPhotoPreviews();

          // Subir en segundo plano a la carpeta img/posts/uploads/
          this.uploadPhotoToServer(compressed).then((serverUrl) => {
            if (serverUrl && serverUrl.startsWith('img/')) {
              if (this.uploadedPhotos[photoIndex] === compressed) {
                this.uploadedPhotos[photoIndex] = serverUrl;
              }
            }
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('Error procesando foto:', err);
      }
    }
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
    if (navigator.geolocation) {
      if (window.buscapetToast) window.buscapetToast('📍 Obteniendo GPS...', 'info');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          this.hasGpsLocation = true;
          if (window.BuscapetMap) window.BuscapetMap.userHasSetLocation = true;

          const addressInput = document.getElementById('publish-address');
          if (addressInput) {
            addressInput.value = `Ubicación GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            addressInput.style.border = '2px solid #22c55e';
            setTimeout(() => { addressInput.style.border = ''; }, 2000);
          }
          if (window.BuscapetMap && window.BuscapetMap.pickerMap) {
            window.BuscapetMap.pickerMap.setView([lat, lng], 16);
            if (window.BuscapetMap.pickerMarker) {
              window.BuscapetMap.pickerMarker.setLatLng([lat, lng]);
            }
            window.BuscapetMap.currentPickedCoords = { lat, lng };
          }
          if (window.buscapetToast) window.buscapetToast('✅ ¡GPS capturado con éxito!', 'success');
        },
        (err) => {
          alert('No se pudo acceder al GPS. Podés mover el pin directamente en el mapa o escribir la calle.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert('Tu navegador no soporta geolocalización GPS.');
    }
  },

  validatePost() {
    // 1. VALIDACIÓN FOTO (Obligatorio para perdida, encontrada y demás)
    if (!this.uploadedPhotos || this.uploadedPhotos.length === 0) {
      this.showValidationError('📸 Debes subir al menos una foto de la mascota.', 'publish-photo-input');
      return false;
    }

    // 2. VALIDACIÓN UBICACIÓN (Manual o vía GPS, una de las dos obligatoria)
    const addressInput = document.getElementById('publish-address');
    const addressVal = (addressInput ? addressInput.value.trim() : '');
    const hasGps = this.hasGpsLocation || (addressVal && addressVal.toLowerCase().includes('gps')) || (window.BuscapetMap && window.BuscapetMap.userHasSetLocation);
    const hasManual = addressVal.length > 0;

    if (!hasManual && !hasGps) {
      this.showValidationError('📍 Debes indicar la ubicación (escribiendo la calle/zona o usando el botón GPS).', 'publish-address');
      return false;
    }

    // 3. VALIDACIÓN TELÉFONO (Obligatorio)
    const phoneInput = document.getElementById('publish-phone');
    const phoneVal = (phoneInput ? phoneInput.value.trim() : '');
    if (!phoneVal || phoneVal.length < 6) {
      this.showValidationError('📞 Debes ingresar un teléfono o WhatsApp de contacto válido.', 'publish-phone');
      return false;
    }

    return true;
  },

  showValidationError(msg, inputId) {
    if (window.buscapetToast) {
      window.buscapetToast(msg, 'error');
    } else {
      alert(msg);
    }

    if (inputId === 'publish-photo-input') {
      const container = document.getElementById('publish-photo-previews');
      const btn = container ? container.previousElementSibling : null;
      if (btn) {
        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        btn.classList.add('shake-highlight');
        setTimeout(() => btn.classList.remove('shake-highlight'), 2500);
      }
    } else if (inputId) {
      const el = document.getElementById(inputId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
        el.classList.add('shake-highlight');
        setTimeout(() => el.classList.remove('shake-highlight'), 2500);
      }
    }
  },

  resetForm() {
    const ids = ['publish-name', 'publish-desc', 'publish-breed', 'publish-address', 'publish-collar-details'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const collar = document.getElementById('publish-collar');
    if (collar) collar.checked = false;

    const fileInput = document.getElementById('publish-photo-input');
    if (fileInput) fileInput.value = '';

    this.uploadedPhotos = [];
    this.hasGpsLocation = false;
    if (window.BuscapetMap) window.BuscapetMap.userHasSetLocation = false;
    this.renderPhotoPreviews();
  },

  async uploadPhotoToServer(photoData) {
    if (!photoData || typeof photoData !== 'string') return 'img/posts/demo/milo_1.jpg';
    if (photoData.startsWith('img/') || photoData.startsWith('http://') || photoData.startsWith('https://')) {
      return photoData; // Ya es una ruta de servidor
    }

    let payload = photoData.trim();
    if (!payload.startsWith('data:image')) {
      payload = 'data:image/jpeg;base64,' + payload;
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);

      const res = await fetch('upload.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: payload }),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.url) {
          return data.url; // Retorna ej: 'img/posts/uploads/pet_1726...jpg'
        }
      }
    } catch (err) {
      console.warn('Subida a upload.php omitida o timeout, usando foto local:', err);
    }
    return payload;
  },

  async submitPost(e) {
    if (e) e.preventDefault();

    // 1. VALIDAR CAMPOS OBLIGATORIOS (FOTO, UBICACIÓN MANUAL/GPS, TELÉFONO)
    if (!this.validatePost()) {
      return;
    }

    const submitBtn = document.getElementById('btn-publish-submit') || (e && e.target);
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : '🐾 Publicar Mascota Ahora';

    let createdPost = null;

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" style="width:14px;height:14px;border-width:2px;margin-right:6px;"></span> Guardando imagen en img/...';
      }

      // 2. Subir cada foto al servidor (carpeta img/posts/uploads/)
      const finalPhotos = [];
      for (let i = 0; i < this.uploadedPhotos.length; i++) {
        const photo = this.uploadedPhotos[i];
        if (submitBtn && this.uploadedPhotos.length > 1) {
          submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" style="width:14px;height:14px;border-width:2px;margin-right:6px;"></span> Guardando foto en img/ (${i + 1}/${this.uploadedPhotos.length})...`;
        }
        const serverUrl = await this.uploadPhotoToServer(photo);
        finalPhotos.push(serverUrl);
      }

      if (submitBtn) {
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" style="width:14px;height:14px;border-width:2px;margin-right:6px;"></span> Publicando reporte...';
      }

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

      const petName = (nameInput ? nameInput.value.trim() : '') || (this.currentType === 'found' ? 'Mascota Encontrada' : (this.currentType === 'lost' ? 'Mascota Perdida' : 'Mascota'));
      let description = (descInput ? descInput.value.trim() : '');

      if (!description) {
        description = (this.currentType === 'lost')
          ? 'Mascota perdida. Por favor si alguien la vio o tiene información comunicarse urgente.'
          : (this.currentType === 'found')
          ? 'Mascota encontrada en la zona. Contactar para coordinar reencuentro con su familia.'
          : 'Publicación de mascota registrada en la comunidad Buscapet.';
      }

      const picked = window.BuscapetMap && window.BuscapetMap.currentPickedCoords;
      const lat = (picked && parseFloat(picked.lat)) || -34.5889;
      const lng = (picked && parseFloat(picked.lng)) || -58.4305;

      const authorUid = (window.BuscapetFirebase && window.BuscapetFirebase.currentUser && window.BuscapetFirebase.currentUser.uid) || ('usr-anon-' + Date.now());
      const authorEmail = (window.BuscapetFirebase && window.BuscapetFirebase.currentUser && window.BuscapetFirebase.currentUser.email) || '';
      const authorName = (window.BuscapetFirebase && window.BuscapetFirebase.currentUser && window.BuscapetFirebase.currentUser.displayName) || 'Tú (Usuario)';
      const authorAvatar = (window.BuscapetFirebase && window.BuscapetFirebase.currentUser && window.BuscapetFirebase.currentUser.photoURL) || 'img/posts/demo/avatar_nicolas.jpg';

      createdPost = {
        id: 'post-' + Date.now(),
        type: this.currentType || 'lost',
        petName: petName,
        species: speciesSelect ? speciesSelect.value : 'Perro',
        breed: (breedInput && breedInput.value.trim()) || 'Mestizo',
        gender: genderSelect ? genderSelect.value : 'Desconocido',
        photos: finalPhotos,
        description: description,
        hasCollar: hasCollarCheck ? hasCollarCheck.checked : false,
        collarDetails: collarDetailsInput ? collarDetailsInput.value.trim() : '',
        location: {
          countryCode: countrySelect ? countrySelect.value : 'AR',
          countryName: countrySelect ? countrySelect.options[countrySelect.selectedIndex]?.text : 'Argentina',
          stateName: (stateSelect && stateSelect.value) || 'CABA',
          cityName: (citySelect && citySelect.value) || 'Palermo',
          address: (addressInput && addressInput.value.trim()) || 'Ubicación reportada',
          lat: lat,
          lng: lng
        },
        date: 'Hace un momento',
        authorUid: authorUid,
        authorEmail: authorEmail,
        user: {
          id: authorUid,
          name: authorName,
          avatar: authorAvatar,
          phone: (phoneInput && phoneInput.value.trim()) || '+5491155551234',
          email: authorEmail
        },
        likes: 1,
        liked: true,
        shares: 0,
        isResolved: false,
        isNew: true,
        comments: []
      };

      // Sincronizar en servidor (api_posts.php) en segundo plano
      try {
        fetch('api_posts.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createdPost)
        }).catch(err => console.warn('Error guardando en api_posts.php:', err));
      } catch(err) {}

      // Registrar autoría y respaldo persistente local
      try {
        const storage = window.SafeStorage || window.localStorage;
        if (storage) {
          const myPosts = JSON.parse(storage.getItem('buscapet_my_posts') || '[]');
          if (!myPosts.includes(createdPost.id)) {
            myPosts.push(createdPost.id);
            storage.setItem('buscapet_my_posts', JSON.stringify(myPosts));
          }
          const createdList = JSON.parse(storage.getItem('buscapet_user_created_posts') || '[]');
          if (!createdList.some(p => p.id === createdPost.id)) {
            createdList.unshift(createdPost);
            storage.setItem('buscapet_user_created_posts', JSON.stringify(createdList));
          }
        }
      } catch (err) {
        console.warn('Error guardando autoría del post:', err);
      }

      // Insertar en el feed y asegurar visibilidad
      if (window.BuscapetFeed) {
        if (!Array.isArray(window.BuscapetFeed.posts)) {
          window.BuscapetFeed.posts = [];
        }
        window.BuscapetFeed.posts.unshift(createdPost);
        try { window.BuscapetFeed.save(); } catch(e) {}

        // Ajustar filtro para que la publicación aparezca de inmediato en pantalla
        window.BuscapetFeed.activeFilter = 'all';
        document.querySelectorAll('.chip').forEach(c => {
          c.className = (c.getAttribute('data-type') === 'all') ? 'chip active-all' : 'chip';
        });
        window.BuscapetFeed.selectedCountry = '';
        window.BuscapetFeed.selectedState = '';
        window.BuscapetFeed.selectedCity = '';
        window.BuscapetFeed.searchQuery = '';

        try { window.BuscapetFeed.renderFeed(); } catch(e) { console.error('Error en renderFeed:', e); }
      }

      // 3. CERRAR EL MODAL DE FORMA INMEDIATA E INCONDICIONAL
      this.closeModal();

      // 4. Resetear formulario
      this.resetForm();

      // 5. NAVEGAR A LA PUBLICACIÓN Y RESALTARLA
      const targetPostId = createdPost.id;
      setTimeout(() => {
        const targetCard = document.getElementById('card-' + targetPostId);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetCard.classList.add('new-post-highlight');
          setTimeout(() => {
            targetCard.classList.remove('new-post-highlight');
          }, 3500);
        } else {
          const feedContainer = document.getElementById('feed-posts-container');
          if (feedContainer) {
            feedContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }

        if (window.buscapetToast) {
          window.buscapetToast('🎉 ¡Publicada con éxito! Ya podés ver tu reporte.', 'success');
        } else {
          alert('🎉 ¡Publicada con éxito!');
        }
      }, 180);

    } catch (err) {
      console.error('Error durante submitPost:', err);
      // ASEGURAR QUE EL MODAL SE CIERRE AUNQUE HUBIERA UN ERROR INTERNO
      this.closeModal();
      this.resetForm();
      alert('Tu publicación fue enviada pero ocurrió un detalle menor al actualizar la vista.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml || '🐾 Publicar Mascota Ahora';
      }
    }
  }
};
