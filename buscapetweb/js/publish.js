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
      modal.style.display = 'none';
    }
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
      authModal.classList.remove('show');
      authModal.style.display = 'none';
    }
    document.body.classList.remove('modal-open');
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

  compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.75) {
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
        img.onerror = () => resolve(event.target.result);
        img.src = event.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
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
          this.uploadedPhotos.push(compressed);
          this.renderPhotoPreviews();
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
          const addressInput = document.getElementById('publish-address');
          if (addressInput) {
            addressInput.value = `Ubicación GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
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
          alert('No se pudo acceder al GPS. Podés mover el pin directamente en el mapa.');
        }
      );
    }
  },

  async uploadPhotoToServer(photoData) {
    if (!photoData || typeof photoData !== 'string' || !photoData.startsWith('data:image')) {
      return photoData; // Si ya es una ruta relativa (ej: img/posts/...), devolverla
    }
    try {
      const res = await fetch('upload.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: photoData })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.url) {
          return data.url; // Retorna ej: 'img/posts/uploads/pet_1726...jpg'
        }
      }
    } catch (err) {
      console.warn('Servidor upload.php offline o no disponible, usando base64:', err);
    }
    return photoData;
  },

  async submitPost(e) {
    if (e) e.preventDefault();

    const submitBtn = document.getElementById('btn-publish-submit') || (e && e.target);
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" style="width:14px;height:14px;border-width:2px;margin-right:6px;"></span> Guardando imagen en img/...';
    }

    // 1. Subir cada foto al servidor (carpeta img/posts/uploads/)
    const finalPhotos = [];
    if (this.uploadedPhotos.length > 0) {
      for (let i = 0; i < this.uploadedPhotos.length; i++) {
        const photo = this.uploadedPhotos[i];
        if (submitBtn && this.uploadedPhotos.length > 1) {
          submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" style="width:14px;height:14px;border-width:2px;margin-right:6px;"></span> Guardando imagen en img/ (${i + 1}/${this.uploadedPhotos.length})...`;
        }
        const serverUrl = await this.uploadPhotoToServer(photo);
        finalPhotos.push(serverUrl);
      }
    } else {
      finalPhotos.push('img/posts/demo/milo_1.jpg');
    }

    if (submitBtn) {
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" style="width:14px;height:14px;border-width:2px;margin-right:6px;"></span> Publicando mascota...';
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

    // Fallback inteligente si la descripción está vacía para evitar bloqueos
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

    const newPost = {
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
        phone: (phoneInput && phoneInput.value.trim()) || (window.BuscapetFirebase && window.BuscapetFirebase.currentUser && window.BuscapetFirebase.currentUser.phone) || '+5491155551234',
        email: authorEmail
      },
      likes: 1,
      liked: true,
      shares: 0,
      isResolved: false,
      isNew: true,
      comments: []
    };

    // Sincronizar con el servidor (api_posts.php) para persistencia total y multiusuario
    try {
      fetch('api_posts.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      }).catch(err => console.warn('Error guardando en api_posts.php:', err));
    } catch(err) {}

    // Registrar autoría y respaldo persistente de la publicación
    try {
      const storage = window.SafeStorage || window.localStorage;
      if (storage) {
        const myPosts = JSON.parse(storage.getItem('buscapet_my_posts') || '[]');
        if (!myPosts.includes(newPost.id)) {
          myPosts.push(newPost.id);
          storage.setItem('buscapet_my_posts', JSON.stringify(myPosts));
        }
        const createdList = JSON.parse(storage.getItem('buscapet_user_created_posts') || '[]');
        if (!createdList.some(p => p.id === newPost.id)) {
          createdList.unshift(newPost);
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
      window.BuscapetFeed.posts.unshift(newPost);
      window.BuscapetFeed.save();

      // Ajustar filtro para que la publicación aparezca de inmediato en pantalla
      if (window.BuscapetFeed.activeFilter !== 'all' && window.BuscapetFeed.activeFilter !== newPost.type) {
        window.BuscapetFeed.activeFilter = 'all';
        document.querySelectorAll('.chip').forEach(c => {
          c.className = (c.getAttribute('data-type') === 'all') ? 'chip active-all' : 'chip';
        });
      }
      window.BuscapetFeed.selectedCountry = '';
      window.BuscapetFeed.selectedState = '';
      window.BuscapetFeed.selectedCity = '';
      window.BuscapetFeed.searchQuery = '';

      window.BuscapetFeed.renderFeed();
    }

    // Cerrar modal de inmediato
    this.closeModal();

    // Resetear formulario para futuros reportes
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (breedInput) breedInput.value = '';
    if (addressInput) addressInput.value = '';
    if (collarDetailsInput) collarDetailsInput.value = '';
    if (hasCollarCheck) hasCollarCheck.checked = false;
    this.uploadedPhotos = [];
    this.renderPhotoPreviews();

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origBtnHtml || '🐾 Publicar Mascota Ahora';
    }

    // Desplazar la pantalla suavemente hasta la nueva publicación y mostrar mensaje de éxito
    setTimeout(() => {
      const targetCard = document.getElementById('card-' + newPost.id);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.add('new-post-highlight');
        setTimeout(() => {
          targetCard.classList.remove('new-post-highlight');
        }, 3500);
      }
      if (window.buscapetToast) {
        window.buscapetToast('🎉 ¡Publicada con éxito! Ya podés ver tu reporte.', 'success');
      } else {
        alert('🎉 ¡Publicada con éxito!');
      }
    }, 200);
  }
};
