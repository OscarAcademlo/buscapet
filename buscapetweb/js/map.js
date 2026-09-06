// ==========================================================================
// BUSCAPET - MAP & GEOLOCATION CONTROLLER (LEAFLET + OPENSTREETMAP)
// ==========================================================================

var BuscapetMap = window.BuscapetMap = {
  viewMap: null,
  viewMarker: null,
  pickerMap: null,
  pickerMarker: null,
  currentPickedCoords: null,

  init() {
    // Lazy initialized
  },

  openMapForPost(postId) {
    let post = null;
    if (window.BuscapetFeed && window.BuscapetFeed.posts) {
      post = window.BuscapetFeed.posts.find(p => p.id === postId);
    }
    if (!post || !post.location) return;

    const modal = document.getElementById('map-modal');
    const title = document.getElementById('map-modal-title');
    const desc = document.getElementById('map-modal-desc');

    if (title) {
      const typeLabel = post.type === 'lost' ? '🔴 Perdido aquí' : (post.type === 'found' ? '🟢 Encontrado aquí' : (post.type === 'adopt' ? '🟣 En Adopción' : '🟡 Visto aquí'));
      title.innerHTML = `🐾 ${post.petName || 'Mascota'} &bull; <span style="font-size:13px;font-weight:700;">${typeLabel}</span>`;
    }
    if (desc) {
      desc.textContent = post.location.address || `${post.location.cityName || ''}, ${post.location.stateName || ''}, ${post.location.countryName || ''}`;
    }

    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
    }

    // Setup Leaflet map
    setTimeout(() => {
      this.renderViewMap(post.location.lat, post.location.lng, post.petName, post.type);
    }, 200);
  },

  renderViewMap(lat, lng, petName, type) {
    const container = document.getElementById('map-modal-container');
    if (!container) return;

    if (this.viewMap) {
      this.viewMap.remove();
      this.viewMap = null;
    }

    this.viewMap = L.map('map-modal-container', {
      zoomControl: true
    }).setView([lat, lng], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
    }).addTo(this.viewMap);

    const markerColor = type === 'lost' ? '#EF4444' : (type === 'found' ? '#22C55E' : (type === 'adopt' ? '#A855F7' : '#F59E0B'));

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          background: ${markerColor};
          width: 38px;
          height: 38px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.45);
          border: 2px solid white;
        ">
          <span style="transform: rotate(45deg); font-size: 16px;">🐾</span>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38]
    });

    this.viewMarker = L.marker([lat, lng], { icon: customIcon }).addTo(this.viewMap);
    this.viewMarker.bindPopup(`<b>${petName || 'Mascota'}</b><br>Ubicación registrada`).openPopup();

    // Circle radius
    L.circle([lat, lng], {
      color: markerColor,
      fillColor: markerColor,
      fillOpacity: 0.18,
      radius: 250
    }).addTo(this.viewMap);

    this.viewMap.invalidateSize();
  },

  closeMapModal() {
    const modal = document.getElementById('map-modal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  },

  // Map picker inside Create Report form
  initPickerMap(defaultLat = -34.6037, defaultLng = -58.3816) {
    const container = document.getElementById('form-map-picker');
    if (!container) return;

    if (this.pickerMap) {
      this.pickerMap.remove();
      this.pickerMap = null;
    }

    this.currentPickedCoords = { lat: defaultLat, lng: defaultLng };

    this.pickerMap = L.map('form-map-picker', {
      zoomControl: true
    }).setView([defaultLat, defaultLng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(this.pickerMap);

    const customIcon = L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div style="
          background: #FF5A5F;
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        ">
          <span style="transform: rotate(45deg); font-size: 13px;">📍</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    this.pickerMarker = L.marker([defaultLat, defaultLng], {
      icon: customIcon,
      draggable: true
    }).addTo(this.pickerMap);

    this.pickerMarker.on('dragend', (e) => {
      const position = e.target.getLatLng();
      this.currentPickedCoords = { lat: position.lat, lng: position.lng };
    });

    this.pickerMap.on('click', (e) => {
      this.currentPickedCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
      this.pickerMarker.setLatLng(e.latlng);
    });

    this.pickerMap.invalidateSize();
  },

  useCurrentGPSLocation(callback) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          this.currentPickedCoords = { lat, lng };
          if (this.pickerMap && this.pickerMarker) {
            this.pickerMap.setView([lat, lng], 15);
            this.pickerMarker.setLatLng([lat, lng]);
          }
          if (typeof callback === 'function') callback(lat, lng);
        },
        (err) => {
          alert('No se pudo acceder a tu GPS. Podés mover el pin directamente en el mapa.');
        }
      );
    } else {
      alert('La geolocalización no está soportada en tu navegador.');
    }
  }
};
