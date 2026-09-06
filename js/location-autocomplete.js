// =============================================================================
// SERVICIO: LocationAutocompleteService — Búsqueda de calles, autocompletado y GPS
// Basado fielmente en LocationAutocompleteService de Flutter (Nominatim OpenStreetMap)
// =============================================================================

var LocationAutocompleteService = window.LocationAutocompleteService = {
  fallbackStreets: [
    {
      displayName: 'Av. San Martín 1540, Bariloche',
      street: 'Av. San Martín',
      houseNumber: '1540',
      city: 'Bariloche',
      lat: -41.1335,
      lng: -71.3103
    },
    {
      displayName: 'Av. Rivadavia 2450, Buenos Aires',
      street: 'Av. Rivadavia',
      houseNumber: '2450',
      city: 'CABA',
      lat: -34.6095,
      lng: -58.4012
    },
    {
      displayName: 'Av. Santa Fe 1820, Buenos Aires',
      street: 'Av. Santa Fe',
      houseNumber: '1820',
      city: 'CABA',
      lat: -34.5952,
      lng: -58.3934
    },
    {
      displayName: 'Av. Bustillo Km 5, Bariloche',
      street: 'Av. Exequiel Bustillo',
      houseNumber: 'Km 5',
      city: 'Bariloche',
      lat: -41.1278,
      lng: -71.3621
    },
    {
      displayName: 'Av. Corrientes 3200, Buenos Aires',
      street: 'Av. Corrientes',
      houseNumber: '3200',
      city: 'CABA',
      lat: -34.6037,
      lng: -58.4116
    },
    {
      displayName: 'Av. Belgrano 850, Buenos Aires',
      street: 'Av. Belgrano',
      houseNumber: '850',
      city: 'CABA',
      lat: -34.6133,
      lng: -58.3792
    },
    {
      displayName: 'Mitre 124, Bariloche',
      street: 'Calle Mitre',
      houseNumber: '124',
      city: 'Bariloche',
      lat: -41.1338,
      lng: -71.3092
    },
    {
      displayName: 'Calle 25 de Mayo 350, Córdoba',
      street: 'Calle 25 de Mayo',
      houseNumber: '350',
      city: 'Córdoba',
      lat: -31.4168,
      lng: -64.1834
    }
  ],

  debounceTimer: null,

  async searchAddress(query, countryCode = 'ar') {
    const cleanQuery = (query || '').trim();
    if (cleanQuery.length < 2) {
      return this.fallbackStreets.slice(0, 4);
    }

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&countrycodes=${countryCode}&addressdetails=1&limit=6`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return data.map(item => {
            const addr = item.address || {};
            const road = addr.road || addr.pedestrian || addr.street || addr.suburb || '';
            const houseNumber = addr.house_number || '';
            const city = addr.city || addr.town || addr.village || addr.state || '';
            return {
              displayName: item.display_name,
              street: road || cleanQuery,
              houseNumber: houseNumber,
              city: city,
              lat: parseFloat(item.lat) || 0.0,
              lng: parseFloat(item.lon) || 0.0
            };
          });
        }
      }
    } catch (e) {
      console.warn('Error en Nominatim search:', e);
    }

    return this.fallbackStreets.filter(s =>
      s.displayName.toLowerCase().includes(cleanQuery.toLowerCase())
    );
  },

  attachAutocomplete(inputEl, suggestionsBoxEl, onSelectCallback) {
    if (!inputEl || !suggestionsBoxEl) return;

    inputEl.addEventListener('input', (e) => {
      const val = e.target.value;
      clearTimeout(this.debounceTimer);

      if (val.trim().length < 2) {
        suggestionsBoxEl.style.display = 'none';
        suggestionsBoxEl.innerHTML = '';
        return;
      }

      this.debounceTimer = setTimeout(async () => {
        const suggestions = await this.searchAddress(val);
        if (suggestions.length === 0) {
          suggestionsBoxEl.style.display = 'none';
          return;
        }

        suggestionsBoxEl.innerHTML = suggestions.map((s, idx) => `
          <div class="address-sugg-item" data-idx="${idx}" style="padding:8px 12px;font-size:12px;cursor:pointer;border-bottom:1px solid var(--border);color:var(--text-main);background:var(--bg-input);">
            <div style="font-weight:700;"><i class="bi bi-geo-alt" style="color:var(--primary);margin-right:4px;"></i>${s.street} ${s.houseNumber}</div>
            <div style="font-size:10.5px;color:var(--text-muted);">${s.displayName}</div>
          </div>
        `).join('');

        suggestionsBoxEl.style.display = 'block';

        suggestionsBoxEl.querySelectorAll('.address-sugg-item').forEach(item => {
          item.addEventListener('click', () => {
            const idx = parseInt(item.getAttribute('data-idx'));
            const selected = suggestions[idx];
            inputEl.value = `${selected.street} ${selected.houseNumber ? selected.houseNumber + ', ' : ''}${selected.city}`;
            suggestionsBoxEl.style.display = 'none';
            if (typeof onSelectCallback === 'function') {
              onSelectCallback(selected);
            }
          });
        });
      }, 300);
    });

    document.addEventListener('click', (e) => {
      if (!inputEl.contains(e.target) && !suggestionsBoxEl.contains(e.target)) {
        suggestionsBoxEl.style.display = 'none';
      }
    });
  }
};
