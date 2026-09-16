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
    if (!post) return;

    const loc = post.location || {};
    const lat = parseFloat(loc.lat) || -34.6037;
    const lng = parseFloat(loc.lng) || -58.3816;
    const address = loc.address || `${loc.cityName || ''}, ${loc.stateName || ''}`.trim() || 'Ubicación registrada';

    const modal = document.getElementById('map-modal');
    const title = document.getElementById('map-modal-title');
    const desc = document.getElementById('map-modal-desc');

    if (title) {
      const typeLabel = post.type === 'lost' ? '🔴 Perdido aquí' : (post.type === 'found' ? '🟢 Encontrado aquí' : (post.type === 'adopt' ? '🟣 En Adopción' : '🟡 Visto aquí'));
      title.innerHTML = `🐾 ${post.petName || 'Mascota'} &bull; <span style="font-size:13px;font-weight:700;">${typeLabel}</span>`;
    }
    if (desc) {
      desc.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;font-weight:700;margin-bottom:4px;">
          <i class="bi bi-geo-alt-fill" style="color:var(--primary);font-size:15px;"></i>
          <span>${address}</span>
        </div>
        <div style="font-size:11px;color:var(--text-muted);font-family:monospace;margin-bottom:8px;">
          Coordenadas GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
          <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="background:var(--primary);color:#fff;font-size:11.5px;font-weight:700;padding:6px 12px;border-radius:8px;text-decoration:none;display:inline-flex;align-items:center;gap:6px;font-family:'Outfit',sans-serif;">
            <i class="bi bi-compass"></i> Abrir en Google Maps / GPS
          </a>
          <button type="button" onclick="navigator.clipboard && navigator.clipboard.writeText('${lat}, ${lng}').then(() => { if(window.buscapetToast) window.buscapetToast('📋 Coordenadas copiadas al portapapeles'); })" style="background:var(--bg-card);border:1px solid var(--border);color:var(--text-main);font-size:11.5px;font-weight:700;padding:6px 12px;border-radius:8px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;font-family:'Outfit',sans-serif;">
            <i class="bi bi-clipboard"></i> Copiar Coordenadas
          </button>
        </div>
      `;
    }

    if (modal) {
      modal.classList.add('show');
      modal.style.display = 'block';
      document.body.classList.add('modal-open');
    }

    // Setup Leaflet map con reintentos para asegurar renderizado correcto
    setTimeout(() => {
      this.renderViewMap(lat, lng, post.petName, post.type);
    }, 150);
    setTimeout(() => {
      if (this.viewMap) this.viewMap.invalidateSize();
    }, 350);
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
      this.userHasSetLocation = true;
      if (window.BuscapetPublish) window.BuscapetPublish.hasGpsLocation = true;
      const addr = document.getElementById('publish-address');
      if (addr && !addr.value.trim()) {
        addr.value = `Punto en mapa (${position.lat.toFixed(4)}, ${position.lng.toFixed(4)})`;
      }
    });

    this.pickerMap.on('click', (e) => {
      this.currentPickedCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
      this.userHasSetLocation = true;
      if (window.BuscapetPublish) window.BuscapetPublish.hasGpsLocation = true;
      this.pickerMarker.setLatLng(e.latlng);
      const addr = document.getElementById('publish-address');
      if (addr && !addr.value.trim()) {
        addr.value = `Punto en mapa (${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)})`;
      }
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
