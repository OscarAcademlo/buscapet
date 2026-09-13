// =============================================================================
// BUSCAPET - FEED CONTROLLER (POSTS, CAROUSELS, FILTERS & INTERACTIONS)
// Basado en HomeScreen, PetCard y PetPost de Flutter
// =============================================================================

var BuscapetFeed = window.BuscapetFeed = {
  posts: [],
  activeFilter: 'all',
  selectedCountry: 'AR',
  selectedState: '',
  selectedCity: '',
  searchQuery: '',
  photoIndices: {},
  currentEditingPostId: null,

  initialPosts: [
    {
      id: 'post-1',
      type: 'lost',
      petName: 'Milo',
      species: 'Perro',
      breed: 'Golden Retriever',
      gender: 'Macho',
      photos: [
        'img/posts/demo/milo_1.jpg',
        'img/posts/demo/milo_2.jpg',
        'img/posts/demo/milo_3.jpg'
      ],
      description: 'Se extravió Milo cerca del Parque Centenario. Llevaba collar azul con chapita pero sin teléfono grabado. Es muy dócil, responde por su nombre y toma medicación.',
      hasCollar: true,
      collarDetails: 'Collar azul con chapita',
      location: {
        countryCode: 'AR',
        countryName: 'Argentina',
        stateName: 'CABA',
        cityName: 'Caballito',
        address: 'Av. Díaz Vélez & Campichuelo, Caballito, CABA',
        lat: -34.6062,
        lng: -58.4355
      },
      date: 'Hace 2 h',
      user: {
        id: 'usr-101',
        name: 'Nicolás Rossi',
        avatar: 'img/posts/demo/avatar_nicolas.jpg',
        phone: '+5491155554321'
      },
      likes: 24,
      liked: false,
      shares: 18,
      isResolved: false,
      comments: [
        {
          id: 'cmt-1',
          userName: 'Sofía Romero',
          userAvatar: 'img/posts/demo/avatar_sofia.jpg',
          text: '¡Lo compartí en el grupo de vecinos de Caballito! Ojalá aparezca pronto 🙏',
          time: 'Hace 1 h'
        }
      ]
    },
    {
      id: 'post-2',
      type: 'found',
      petName: 'Gatita rescatada',
      species: 'Gato',
      breed: 'Siamés mestizo',
      gender: 'Hembra',
      photos: [
        'img/posts/demo/gatita_1.jpg',
        'img/posts/demo/gatita_2.jpg'
      ],
      description: 'Encontré esta gatita asustada resguardándose de la lluvia en una estación de servicio. Tiene ojos celestes intensos y collar rosa sin identificación. La tengo en tránsito.',
      hasCollar: true,
      collarDetails: 'Collar rosa sin chapita',
      location: {
        countryCode: 'AR',
        countryName: 'Argentina',
        stateName: 'CABA',
        cityName: 'Palermo',
        address: 'Av. Santa Fe & Thames, Palermo, CABA',
        lat: -34.5815,
        lng: -58.4212
      },
      date: 'Hace 5 h',
      user: {
        id: 'usr-102',
        name: 'Martín Gómez',
        avatar: 'img/posts/demo/avatar_martin.jpg',
        phone: '+5491144449876'
      },
      likes: 42,
      liked: false,
      shares: 31,
      isResolved: false,
      comments: [
        {
          id: 'cmt-2',
          userName: 'Gonzalo Paz',
          userAvatar: 'img/posts/demo/avatar_gonzalo.jpg',
          text: 'Tiene carita de estar bien cuidada, seguro su familia la está buscando.',
          time: 'Hace 3 h'
        }
      ]
    },
    {
      id: 'post-3',
      type: 'adopt',
      petName: 'Luna',
      species: 'Perro',
      breed: 'Mestiza mediana',
      gender: 'Hembra',
      photos: [
        'img/posts/demo/luna_1.jpg',
        'img/posts/demo/luna_2.jpg'
      ],
      description: 'Luna tiene 6 meses, está desparasitada y con la primera vacuna. Es súper juguetona y sociable con otros animales y niños. Se entrega en adopción responsable con compromiso de castración.',
      hasCollar: false,
      collarDetails: '',
      location: {
        countryCode: 'AR',
        countryName: 'Argentina',
        stateName: 'Córdoba',
        cityName: 'Córdoba Capital',
        address: 'Zona Nueva Córdoba, Córdoba Capital',
        lat: -31.4284,
        lng: -64.1888
      },
      date: 'Hace 12 h',
      user: {
        id: 'usr-103',
        name: 'Valentina Díaz',
        avatar: 'img/posts/demo/avatar_valentina.jpg',
        phone: '+5493515551234'
      },
      likes: 65,
      liked: false,
      shares: 48,
      isResolved: false,
      comments: [
        {
          id: 'cmt-3',
          userName: 'Carla Méndez',
          userAvatar: 'img/posts/demo/avatar_carla.jpg',
          text: '¡Hermosa Luna! Ojalá encuentre un hogar lleno de amor. 🐾',
          time: 'Hace 8 h'
        }
      ]
    },
    {
      id: 'post-4',
      type: 'spotted',
      petName: 'Pastor Alemán visto en la costa',
      species: 'Perro',
      breed: 'Pastor Alemán',
      gender: 'Macho',
      photos: [
        'img/posts/demo/pastor_1.jpg'
      ],
      description: 'Vi este perro deambulando cerca de la costa del lago. Parece perdido y desorientado, tiene collar de cuero marrón pero no se deja agarrar. Anda por la zona del centro cívico.',
      hasCollar: true,
      collarDetails: 'Collar de cuero marrón',
      location: {
        countryCode: 'AR',
        countryName: 'Argentina',
        stateName: 'Río Negro',
        cityName: 'San Carlos de Bariloche',
        address: 'Av. 12 de Octubre y Costanera, Bariloche',
        lat: -41.1335,
        lng: -71.3103
      },
      date: 'Ayer',
      user: {
        id: 'usr-104',
        name: 'Federico Álvarez',
        avatar: 'img/posts/demo/avatar_federico.jpg',
        phone: '+5492944455667'
      },
      likes: 38,
      liked: false,
      shares: 27,
      isResolved: false,
      comments: []
    }
  ],

  init() {
    let saved = null;
    try {
      if (window.SafeStorage) saved = window.SafeStorage.getItem('buscapet_posts');
    } catch(e) {}
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.posts = parsed;
        } else {
          this.posts = [...this.initialPosts];
        }
      } catch (e) {
        this.posts = [...this.initialPosts];
      }
    } else {
      this.posts = [...this.initialPosts];
      this.save();
    }
    this.renderFeed();
  },

  save() {
    try {
      if (window.SafeStorage) window.SafeStorage.setItem('buscapet_posts', JSON.stringify(this.posts));
    } catch(e) {}
  },

  getMyPostIds() {
    try {
      const storage = window.SafeStorage || window.localStorage;
      if (!storage) return [];
      const stored = storage.getItem('buscapet_my_posts');
      return stored ? JSON.parse(stored) : [];
    } catch(e) {
      return [];
    }
  },

  isAuthor(post) {
    if (!post) return false;
    // 1. Si el Master Admin OscarSoft está autenticado
    if (window.BuscapetAdmin && window.BuscapetAdmin.authenticated) return true;

    // 2. Si el post fue creado en este navegador/dispositivo
    const myIds = this.getMyPostIds();
    if (myIds.includes(post.id)) return true;

    // 3. Si el usuario actual está logueado en Firebase y coincide UID o Email
    const curUser = window.BuscapetFirebase && window.BuscapetFirebase.currentUser;
    if (curUser) {
      if (curUser.uid && (post.authorUid === curUser.uid || post.user?.id === curUser.uid)) return true;
      if (curUser.email && (post.authorEmail === curUser.email || (post.user?.email && post.user.email.toLowerCase() === curUser.email.toLowerCase()))) return true;
    }

    return false;
  },

  setFilter(type) {
    this.activeFilter = type;
    document.querySelectorAll('.chip').forEach(c => {
      if (c.getAttribute('data-type') === type) {
        c.className = `chip active-${type}`;
      } else {
        c.className = 'chip';
      }
    });
    this.renderFeed();
  },

  setLocationFilter(country, state, city) {
    this.selectedCountry = country || '';
    this.selectedState = state || '';
    this.selectedCity = city || '';
    this.renderFeed();

    const locText = document.querySelector('.hero-location-text');
    if (locText) {
      if (city) locText.textContent = `📍 ${city}, ${state || country}`;
      else if (state) locText.textContent = `📍 ${state}, ${country}`;
      else if (country) locText.textContent = `📍 ${country}`;
      else locText.textContent = '📍 Toda Latinoamérica';
    }
  },

  setSearchQuery(q) {
    this.searchQuery = (q || '').toLowerCase().trim();
    this.renderFeed();
  },

  getFilteredPosts() {
    return this.posts.filter(post => {
      if (!post) return false;

      // Filtro de Categoría
      if (this.activeFilter !== 'all' && post.type !== this.activeFilter) {
        return false;
      }

      // Filtro de Ubicación
      if (this.selectedCountry && post.location) {
        const pCode = (post.location.countryCode || '').toLowerCase();
        const pName = (post.location.countryName || '').toLowerCase();
        const sCode = this.selectedCountry.toLowerCase();
        if (pCode && pCode !== sCode && !pName.includes(sCode)) {
          return false;
        }
      }
      if (this.selectedState && post.location && post.location.stateName) {
        if (!post.location.stateName.toLowerCase().includes(this.selectedState.toLowerCase())) {
          return false;
        }
      }
      if (this.selectedCity && post.location && post.location.cityName) {
        if (!post.location.cityName.toLowerCase().includes(this.selectedCity.toLowerCase())) {
          return false;
        }
      }

      // Búsqueda en vivo
      if (this.searchQuery) {
        const text = `${post.petName || ''} ${post.species || ''} ${post.breed || ''} ${post.description || ''} ${post.location?.cityName || ''} ${post.location?.address || ''}`.toLowerCase();
        if (!text.includes(this.searchQuery)) return false;
      }

      return true;
    });
  },

  renderFeed() {
    const container = document.getElementById('feed-posts-container');
    if (!container) return;

    const filtered = this.getFilteredPosts();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🐾</div>
          <div class="empty-state-title">No hay publicaciones con estos filtros</div>
          <div class="empty-state-sub">Probá cambiando la categoría o la ciudad seleccionada.</div>
          <button class="hero-btn hero-btn-lost" style="max-width:200px;margin:0 auto;" onclick="BuscapetFeed.setFilter('all');">Ver Todas</button>
        </div>
      `;
      return;
    }

    let html = '';

    filtered.forEach((post, idx) => {
      html += this.buildPostCardHtml(post);

      // Anuncios patrocinados intercalados de BuscapetAds
      if (window.BuscapetAds && (idx === 0 || idx === 2)) {
        const ad = window.BuscapetAds.getAdForIndex(idx);
        if (ad) html += this.buildAdCardHtml(ad);
      }
    });

    container.innerHTML = html;
  },

  buildPostCardHtml(post) {
    const photos = (post.photos && post.photos.length > 0) ? post.photos : ['img/posts/demo/milo_1.jpg'];
    const currentIdx = this.photoIndices[post.id] || 0;
    const currentPhoto = photos[currentIdx] || photos[0];
    const user = post.user || { name: 'Comunidad Buscapet', avatar: 'img/posts/demo/avatar_nicolas.jpg', phone: '+5491155554321' };
    const loc = post.location || { cityName: 'Argentina', stateName: '', address: 'Zona reportada' };

    let badgeClass = 'badge-lost';
    let badgeKey = 'badge_lost';
    let borderClass = 'border-lost';
    if (post.type === 'found') {
      badgeClass = 'badge-found';
      badgeKey = 'badge_found';
      borderClass = 'border-found';
    } else if (post.type === 'adopt') {
      badgeClass = 'badge-adopt';
      badgeKey = 'badge_adopt';
      borderClass = 'border-adopt';
    } else if (post.type === 'spotted') {
      badgeClass = 'badge-spotted';
      badgeKey = 'badge_spotted';
      borderClass = 'border-spotted';
    }

    const badgeText = (window.BuscapetI18n && window.BuscapetI18n.t(badgeKey)) || (post.type === 'found' ? '🟢 Encontrada' : post.type === 'adopt' ? '🟣 En Adopción' : post.type === 'spotted' ? '🟡 Avistamiento' : '🔴 Perdida');
    const bannerText = (window.BuscapetI18n && window.BuscapetI18n.t('active_post_banner')) || '⚠️ ✦ [ PUBLICACIÓN ACTIVA EN BUSCAPET ]';
    const collarText = post.hasCollar ? ((window.BuscapetI18n && window.BuscapetI18n.t('collar_yes')) || 'Lleva collar/chapita') : ((window.BuscapetI18n && window.BuscapetI18n.t('collar_no')) || 'Sin collar visible');
    const mapText = (window.BuscapetI18n && window.BuscapetI18n.t('view_map')) || 'Ver en Mapa';
    const chatText = (window.BuscapetI18n && window.BuscapetI18n.t('contact_chat')) || 'Chat Interno';
    const commentPlaceholder = (window.BuscapetI18n && window.BuscapetI18n.t('write_comment')) || 'Escribí un comentario...';

    // Traducción dinámica de descripción para posts demo
    let desc = post.description;
    if (window.BuscapetI18n) {
      if (post.id === 'post-1') desc = window.BuscapetI18n.t('milo_desc');
      else if (post.id === 'post-2') desc = window.BuscapetI18n.t('gatita_desc');
      else if (post.id === 'post-3') desc = window.BuscapetI18n.t('luna_desc');
      else if (post.id === 'post-4') desc = window.BuscapetI18n.t('pastor_desc');
    }

    // Traducción de especie y género
    let speciesLabel = post.species;
    let genderLabel = post.gender;
    if (window.BuscapetI18n && window.BuscapetI18n.currentLang === 'en') {
      if (post.species === 'Perro') speciesLabel = 'Dog';
      else if (post.species === 'Gato') speciesLabel = 'Cat';
      if (post.gender === 'Macho') genderLabel = 'Male';
      else if (post.gender === 'Hembra') genderLabel = 'Female';
    } else if (window.BuscapetI18n && window.BuscapetI18n.currentLang === 'pt') {
      if (post.species === 'Perro') speciesLabel = 'Cão';
      else if (post.species === 'Gato') speciesLabel = 'Gato';
      if (post.gender === 'Macho') genderLabel = 'Macho';
      else if (post.gender === 'Hembra') genderLabel = 'Fêmea';
    }

    const isResolved = !!post.isResolved;
    const resolvedLabel = post.type === 'adopt' ? (window.BuscapetI18n?.currentLang === 'en' ? 'SUCCESSFULLY ADOPTED!' : window.BuscapetI18n?.currentLang === 'pt' ? 'ADOTADO COM SUCESSO!' : '¡ADOPTADO CON ÉXITO!') : (window.BuscapetI18n?.currentLang === 'en' ? 'ALREADY REUNITED!' : window.BuscapetI18n?.currentLang === 'pt' ? 'JÁ FOI ENCONTRADO!' : '¡YA FUE ENCONTRADO!');
    const markResolvedBtnText = post.type === 'adopt' ? (window.BuscapetI18n?.currentLang === 'en' ? '🏠 Adopted!' : window.BuscapetI18n?.currentLang === 'pt' ? '🏠 Já foi adotado!' : '🏠 ¡Ya fue adoptado!') : (window.BuscapetI18n?.currentLang === 'en' ? '✅ Reunited!' : window.BuscapetI18n?.currentLang === 'pt' ? '✅ Já foi encontrado!' : '✅ ¡Ya fue encontrado!');
    const isAuthor = this.isAuthor(post);
    const isUserLoggedIn = !!(window.BuscapetFirebase && (typeof window.BuscapetFirebase.isLoggedIn === 'function' ? window.BuscapetFirebase.isLoggedIn() : window.BuscapetFirebase.currentUser));

    return `
      <article class="pet-card ${borderClass}" id="card-${post.id}" data-type="${post.type}">
        ${isResolved ? `
          <div style="background:linear-gradient(90deg,#22C55E,#16A34A);color:#fff;padding:7px 10px;font-size:12px;font-weight:900;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px;">
            <span>🎉</span> <span>${resolvedLabel}</span>
          </div>
        ` : `
          <div class="demo-banner">${bannerText}</div>
        `}

        <div class="card-header-row">
          <img class="card-avatar" src="${user.avatar || 'img/posts/demo/avatar_nicolas.jpg'}" alt="${user.name}">
          <div class="card-user-info">
            <div class="card-username">${user.name}</div>
            <div class="card-meta">${loc.cityName ? `${loc.cityName}, ${loc.stateName || ''}` : 'Argentina'} &bull; ${post.date}</div>
          </div>
          <div class="card-badges" style="display:flex;gap:5px;align-items:center;">
            ${isAuthor ? `<span class="badge" style="background:rgba(59,130,246,.15);color:#3B82F6;border:1px solid rgba(59,130,246,.4);font-size:10px;padding:3px 8px;border-radius:6px;font-weight:700;"><i class="bi bi-person-check-fill"></i> ${window.BuscapetI18n ? window.BuscapetI18n.t('your_post') : 'Tu aviso'}</span>` : ''}
            <span class="badge-type ${badgeClass}">${badgeText}</span>
          </div>
        </div>

        <div class="card-photo-wrap">
          <img src="${currentPhoto}" alt="${post.petName}">
          <div class="demo-badge-overlay">🐾 ${post.petName}</div>
          <span class="photo-counter">${currentIdx + 1}/${photos.length}</span>
          ${photos.length > 1 ? `
            <button class="photo-nav prev" style="${currentIdx === 0 ? 'display:none' : ''}" onclick="BuscapetFeed.prevPhoto('${post.id}')">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button class="photo-nav next" style="${currentIdx >= photos.length - 1 ? 'display:none' : ''}" onclick="BuscapetFeed.nextPhoto('${post.id}')">
              <i class="bi bi-chevron-right"></i>
            </button>
          ` : ''}
        </div>

        <div class="card-actions">
          <button class="action-btn ${post.liked ? 'liked' : ''}" onclick="BuscapetFeed.toggleLike('${post.id}')">
            <i class="bi ${post.liked ? 'bi-heart-fill' : 'bi-heart'}"></i>
            <span id="likes-${post.id}">${post.likes || 0}</span>
          </button>
          <button class="action-btn" onclick="BuscapetFeed.toggleComments('${post.id}')">
            <i class="bi bi-chat-dots"></i>
            <span>${(post.comments && post.comments.length) || 0}</span>
          </button>
          <button class="action-btn" onclick="BuscapetFeed.sharePost('${post.id}')">
            <i class="bi bi-share"></i>
            <span>${post.shares || 0}</span>
          </button>
          ${loc && loc.lat ? `
            <button class="action-btn" style="margin-left:auto;color:var(--primary);" onclick="BuscapetMap.openMapForPost('${post.id}')">
              <i class="bi bi-geo-alt-fill"></i> ${mapText}
            </button>
          ` : ''}
        </div>

        <div class="card-contact-btns">
          <a class="contact-btn contact-btn-found" href="https://wa.me/${(user.phone || '').replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(user.name)},%20te%20contacto%20desde%20Buscapet%20por%20${encodeURIComponent(post.petName)}" target="_blank">
            <i class="bi bi-whatsapp"></i> WhatsApp
          </a>
          <button class="contact-btn contact-btn-msg" onclick="BuscapetChat.openDirectChat('${post.id}', '${user.name}', '${post.petName}', '${user.avatar}')">
            <i class="bi bi-chat-dots"></i> ${chatText}
          </button>
        </div>

        <div class="card-details">
          <div class="card-pet-name">${post.petName}</div>
          <div class="card-species-tags">
            <span class="species-tag">🐾 ${speciesLabel}</span>
            <span class="species-tag">${post.breed}</span>
            <span class="species-tag">${genderLabel}</span>
            ${post.hasCollar ? `<span class="species-tag" style="border-color:var(--warning);color:var(--warning);">🏷️ ${collarText}</span>` : ''}
          </div>
          <div class="card-description">${desc}</div>
          ${loc ? `
            <div class="card-location-row" style="display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--text-muted);margin-top:6px;">
              <i class="bi bi-geo-alt-fill" style="color:var(--primary)"></i>
              <span>${loc.address || `${loc.cityName}, ${loc.stateName}`}</span>
            </div>
          ` : ''}

          <!-- Botón de Resolución y Modificación Exclusivo para el Autor -->
          <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
            ${isAuthor ? `
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <button class="hero-btn" style="font-size:11px;padding:6px 12px;background:rgba(34,197,94,.12);border:1px solid var(--success);color:var(--success);" onclick="BuscapetFeed.toggleResolved('${post.id}')">
                  <i class="bi bi-check-circle-fill"></i> ${isResolved ? (window.BuscapetI18n?.t('reopen_case') || 'Reabrir caso') : markResolvedBtnText}
                </button>
                <button class="hero-btn" style="font-size:11px;padding:6px 12px;background:rgba(59,130,246,.12);border:1px solid #3B82F6;color:#3B82F6;" onclick="BuscapetFeed.openEditModal('${post.id}')">
                  <i class="bi bi-pencil-square"></i> ${window.BuscapetI18n?.t('edit_post') || 'Modificar aviso'}
                </button>
              </div>
            ` : `
              <div style="font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:4px;">
                <i class="bi bi-shield-check" style="color:var(--primary);"></i> Aviso verificado
              </div>
            `}
            <span style="font-size:10.5px;color:var(--text-muted);">${post.date}</span>
          </div>
          <!-- Botón Destacado: Ver o agregar comentarios -->
          <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border);">
            <button type="button" class="btn btn-sm" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(255,107,0,.08);color:var(--primary);border:1px solid rgba(255,107,0,.3);border-radius:8px;font-weight:700;font-size:12px;padding:8px;" onclick="BuscapetFeed.toggleComments('${post.id}')">
              <i class="bi bi-chat-dots-fill"></i>
              <span>Ver o agregar comentarios (${(post.comments && post.comments.length) || 0})</span>
              <i class="bi bi-chevron-down" id="comments-chevron-${post.id}"></i>
            </button>
          </div>
        </div>

        <!-- Seccion de Comentarios Desplegable -->
        <div class="comments-section" id="comments-box-${post.id}" style="display:none;background:var(--bg-input);padding:12px 14px;border-top:1px solid var(--border);">
          <div style="font-size:12px;font-weight:800;color:var(--text-main);margin-bottom:8px;display:flex;align-items:center;gap:6px;">
            <i class="bi bi-chat-text-fill" style="color:var(--primary);"></i> Comentarios de la comunidad (${(post.comments && post.comments.length) || 0})
          </div>

          <div class="comments-list" id="comments-list-${post.id}" style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;">
            ${(post.comments && post.comments.length > 0) ? (post.comments.map(c => `
              <div style="display:flex;gap:8px;font-size:12px;">
                <img src="${c.userAvatar || 'img/posts/demo/avatar_nicolas.jpg'}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid var(--border);">
                <div style="background:var(--bg-card);padding:7px 11px;border-radius:10px;flex:1;border:1px solid var(--border);">
                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <strong style="color:var(--text-main);font-size:11.5px;">${c.userName}</strong>
                    <span style="font-size:9.5px;color:var(--text-muted);">${c.time}</span>
                  </div>
                  <div style="color:var(--text-sub);margin-top:2px;line-height:1.35;">${c.text}</div>
                </div>
              </div>
            `).join('')) : `
              <div style="font-size:11.5px;color:var(--text-muted);text-align:center;padding:10px 0;background:var(--bg-card);border-radius:8px;border:1px dashed var(--border);">
                🐾 Todavía no hay comentarios. ¡Sé el primero en dejar un mensaje o aportar datos sobre ${post.petName}!
              </div>
            `}
          </div>

          <!-- Formulario de Agregar Comentario (Restringido a usuarios logueados) -->
          ${isUserLoggedIn ? `
            <div style="background:var(--bg-card);padding:10px;border-radius:10px;border:1px solid var(--border);">
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;display:flex;align-items:center;gap:5px;">
                <i class="bi bi-person-check-fill" style="color:var(--success);"></i> Comentando como <strong>${(window.BuscapetFirebase.currentUser && window.BuscapetFirebase.currentUser.displayName) || 'Usuario'}</strong>
              </div>
              <div style="display:flex;gap:6px;">
                <input type="text" class="filter-select" style="margin:0;flex:1;background:var(--bg-input);" id="comment-input-${post.id}" placeholder="Escribe un mensaje de apoyo o información útil..." onkeydown="if(event.key==='Enter') BuscapetFeed.submitComment('${post.id}')">
                <button class="btn-filter-apply" style="width:auto;padding:6px 14px;background:var(--primary);color:#fff;border-radius:8px;font-weight:700;display:flex;align-items:center;gap:4px;" onclick="BuscapetFeed.submitComment('${post.id}')">
                  <i class="bi bi-send-fill"></i> Comentar
                </button>
              </div>
            </div>
          ` : `
            <div style="background:rgba(255,107,0,.08);border:1.5px dashed var(--primary);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--text-main);font-weight:700;">
                <i class="bi bi-lock-fill" style="color:var(--primary);font-size:16px;"></i>
                <span>Tenés que iniciar sesión para comentar</span>
              </div>
              <div style="font-size:11.5px;color:var(--text-sub);line-height:1.4;">
                Para comentar o aportar información sobre esta mascota, iniciá sesión de forma rápida y gratuita usando tu cuenta de <strong>Google</strong> o tu <strong>correo electrónico</strong>.
              </div>
              <button type="button" class="btn btn-sm btn-primary" style="align-self:flex-start;font-size:11.5px;font-weight:800;padding:6px 14px;border-radius:8px;display:flex;align-items:center;gap:6px;margin-top:2px;" onclick="BuscapetFirebase.openAuthModal()">
                <i class="bi bi-box-arrow-in-right"></i> Iniciar Sesión con Google o Correo
              </button>
            </div>
          `}
        </div>
      </article>
    `;
  },

  buildAdCardHtml(ad) {
    const isDemo = ad.isDemo !== false && (ad.id === 'ad-1' || ad.id === 'ad-2' || !ad.isPaid);
    const topBannerText = isDemo ? '📢 PUBLICIDAD DE DEMOSTRACIÓN' : '📢 PUBLICIDAD PATROCINADA';
    const tagText = isDemo ? 'DEMO' : 'DESTACADO';
    const icon = (ad.category && ad.category.toLowerCase().includes('pet')) ? '🐾' : '🏥';

    return `
      <article class="pet-card border-ad" style="border-color:rgba(245,158,11,.6);background:linear-gradient(135deg,#1c160e 0%,#151820 100%);">
        <div style="background:linear-gradient(90deg,#F59E0B,#D97706);color:#000;padding:4px 10px;font-size:10px;font-weight:900;letter-spacing:1px;display:flex;align-items:center;justify-content:space-between;">
          <span>${topBannerText}</span>
          <span style="background:#000;color:#F59E0B;padding:1px 6px;border-radius:4px;font-size:9px;">${tagText}</span>
        </div>
        <div class="card-header-row" style="padding:10px 12px 6px;">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(245,158,11,.2);border:1.5px solid var(--warning);display:flex;align-items:center;justify-content:center;font-size:18px;">
            ${icon}
          </div>
          <div class="card-user-info">
            <div class="card-username" style="color:var(--warning);font-size:13.5px;">${ad.businessName}</div>
            <div class="card-meta" style="color:var(--text-sub);">${ad.category} &bull; ${ad.city}</div>
          </div>
        </div>
        <div class="card-photo-wrap" style="cursor:default;">
          <img src="${ad.bannerUrl || 'img/posts/demo/ad_vet.jpg'}" alt="${ad.businessName}">
        </div>
        <div class="card-details" style="padding:10px 12px;">
          <div style="font-size:13px;color:var(--text-main);line-height:1.45;margin-bottom:8px;">${ad.promoText}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px;">
            <a class="contact-btn" style="background:#22C55E;color:#fff;" href="https://wa.me/${(ad.whatsapp || '').replace(/[^0-9]/g, '')}?text=Hola,%20los%20contacto%20desde%20el%20anuncio%20de%20Buscapet!" target="_blank">
              <i class="bi bi-whatsapp"></i> WhatsApp
            </a>
            <a class="contact-btn" style="background:linear-gradient(90deg,var(--warning),#D97706);color:#000;font-weight:900;" href="${ad.website || '#'}" target="_blank">
              <i class="bi bi-globe2"></i> Sitio Web
            </a>
          </div>
        </div>
      </article>
    `;
  },

  nextPhoto(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post || !post.photos || post.photos.length <= 1) return;
    const current = this.photoIndices[postId] || 0;
    if (current < post.photos.length - 1) {
      this.photoIndices[postId] = current + 1;
      this.renderFeed();
    }
  },

  prevPhoto(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post || !post.photos || post.photos.length <= 1) return;
    const current = this.photoIndices[postId] || 0;
    if (current > 0) {
      this.photoIndices[postId] = current - 1;
      this.renderFeed();
    }
  },

  toggleLike(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;
    post.liked = !post.liked;
    post.likes = (post.likes || 0) + (post.liked ? 1 : -1);
    this.save();
    this.renderFeed();
  },

  toggleComments(postId) {
    const box = document.getElementById(`comments-box-${postId}`);
    const chevron = document.getElementById(`comments-chevron-${postId}`);
    if (box) {
      const isHidden = box.style.display === 'none';
      box.style.display = isHidden ? 'block' : 'none';
      if (chevron) {
        chevron.className = isHidden ? 'bi bi-chevron-up' : 'bi bi-chevron-down';
      }
    }
  },

  submitComment(postId) {
    const isLoggedIn = !!(window.BuscapetFirebase && (typeof window.BuscapetFirebase.isLoggedIn === 'function' ? window.BuscapetFirebase.isLoggedIn() : window.BuscapetFirebase.currentUser));
    if (!isLoggedIn) {
      if (window.buscapetToast) {
        window.buscapetToast('🔒 Tenés que iniciar sesión con Google o Correo para comentar.', 'warning');
      } else {
        alert('Tenés que iniciar sesión con Google o Correo para comentar.');
      }
      if (window.BuscapetFirebase && typeof window.BuscapetFirebase.openAuthModal === 'function') {
        window.BuscapetFirebase.openAuthModal();
      }
      return;
    }

    const input = document.getElementById(`comment-input-${postId}`);
    if (!input || !input.value.trim()) return;

    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    const curUser = window.BuscapetFirebase.currentUser;
    const authorName = (curUser && curUser.displayName) || 'Usuario de Buscapet';
    const authorAvatar = (curUser && curUser.photoURL) || 'img/posts/demo/avatar_nicolas.jpg';

    if (!post.comments) post.comments = [];
    post.comments.push({
      id: 'cmt-' + Date.now(),
      userName: authorName,
      userAvatar: authorAvatar,
      text: input.value.trim(),
      time: 'Hace un momento'
    });

    input.value = '';
    this.save();
    this.renderFeed();

    // Mantener abierta la sección de comentarios después de enviar
    const box = document.getElementById(`comments-box-${postId}`);
    const chevron = document.getElementById(`comments-chevron-${postId}`);
    if (box) box.style.display = 'block';
    if (chevron) chevron.className = 'bi bi-chevron-up';

    if (window.buscapetToast) {
      window.buscapetToast('💬 ¡Comentario publicado con éxito!', 'success');
    }
  },

  toggleResolved(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    if (!this.isAuthor(post)) {
      const msg = window.BuscapetI18n ? window.BuscapetI18n.t('only_author_can_edit') : 'Solo la persona que publicó este aviso puede modificarlo o marcarlo como encontrado.';
      if (window.buscapetToast) {
        window.buscapetToast(`🔒 ${msg}`, 'warning');
      } else {
        alert(msg);
      }
      return;
    }

    post.isResolved = !post.isResolved;
    this.save();
    this.renderFeed();
    if (window.buscapetToast) {
      window.buscapetToast(post.isResolved ? '🎉 ¡Qué gran noticia! Mascota marcada como reencontrada' : 'Caso reabierto');
    }
  },

  openEditModal(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    if (!this.isAuthor(post)) {
      const msg = window.BuscapetI18n ? window.BuscapetI18n.t('only_author_can_edit') : 'Solo la persona que publicó este aviso puede modificarlo o marcarlo como encontrado.';
      if (window.buscapetToast) window.buscapetToast(`🔒 ${msg}`, 'warning');
      else alert(msg);
      return;
    }

    this.currentEditingPostId = postId;

    const modal = document.getElementById('edit-post-modal');
    if (!modal) return;

    const nameInput = document.getElementById('edit-pet-name');
    const speciesSelect = document.getElementById('edit-pet-species');
    const breedInput = document.getElementById('edit-pet-breed');
    const genderSelect = document.getElementById('edit-pet-gender');
    const descInput = document.getElementById('edit-pet-desc');
    const phoneInput = document.getElementById('edit-pet-phone');
    const hasCollarCheck = document.getElementById('edit-pet-collar');
    const collarDetailsInput = document.getElementById('edit-pet-collar-details');
    const resolvedCheck = document.getElementById('edit-pet-resolved');

    if (nameInput) nameInput.value = post.petName || '';
    if (speciesSelect) speciesSelect.value = post.species || 'Perro';
    if (breedInput) breedInput.value = post.breed || '';
    if (genderSelect) genderSelect.value = post.gender || 'Macho';
    if (descInput) descInput.value = post.description || '';
    if (phoneInput) phoneInput.value = (post.user && post.user.phone) || '';
    if (hasCollarCheck) {
      hasCollarCheck.checked = !!post.hasCollar;
      const detailsRow = document.getElementById('edit-collar-details-row');
      if (detailsRow) detailsRow.style.display = post.hasCollar ? 'block' : 'none';
    }
    if (collarDetailsInput) collarDetailsInput.value = post.collarDetails || '';
    if (resolvedCheck) resolvedCheck.checked = !!post.isResolved;

    modal.classList.add('show');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
  },

  closeEditModal() {
    const modal = document.getElementById('edit-post-modal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
    this.currentEditingPostId = null;
  },

  saveEditedPost(e) {
    if (e) e.preventDefault();
    if (!this.currentEditingPostId) return;

    const post = this.posts.find(p => p.id === this.currentEditingPostId);
    if (!post) return;

    if (!this.isAuthor(post)) {
      alert('No tienes permiso para modificar este aviso.');
      return;
    }

    const nameInput = document.getElementById('edit-pet-name');
    const speciesSelect = document.getElementById('edit-pet-species');
    const breedInput = document.getElementById('edit-pet-breed');
    const genderSelect = document.getElementById('edit-pet-gender');
    const descInput = document.getElementById('edit-pet-desc');
    const phoneInput = document.getElementById('edit-pet-phone');
    const hasCollarCheck = document.getElementById('edit-pet-collar');
    const collarDetailsInput = document.getElementById('edit-pet-collar-details');
    const resolvedCheck = document.getElementById('edit-pet-resolved');

    if (descInput && !descInput.value.trim()) {
      alert('La descripción no puede estar vacía.');
      return;
    }

    if (nameInput) post.petName = nameInput.value.trim() || post.petName;
    if (speciesSelect) post.species = speciesSelect.value;
    if (breedInput) post.breed = breedInput.value.trim() || 'Mestizo';
    if (genderSelect) post.gender = genderSelect.value;
    if (descInput) post.description = descInput.value.trim();
    if (hasCollarCheck) post.hasCollar = hasCollarCheck.checked;
    if (collarDetailsInput) post.collarDetails = collarDetailsInput.value.trim();
    if (phoneInput && post.user) post.user.phone = phoneInput.value.trim();
    if (resolvedCheck) post.isResolved = resolvedCheck.checked;

    this.save();
    this.renderFeed();
    this.closeEditModal();

    if (window.buscapetToast) {
      window.buscapetToast('✅ ¡Aviso modificado y actualizado con éxito!', 'success');
    }
  },

  deleteMyPost(postId) {
    const id = postId || this.currentEditingPostId;
    const post = this.posts.find(p => p.id === id);
    if (!post) return;

    if (!this.isAuthor(post)) {
      alert('Solo el autor puede eliminar este aviso.');
      return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este aviso de Buscapet?')) return;

    this.posts = this.posts.filter(p => p.id !== id);
    this.save();
    this.renderFeed();
    this.closeEditModal();

    if (window.buscapetToast) {
      window.buscapetToast('🗑️ Aviso eliminado correctamente.', 'info');
    }
  },

  sharePost(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    post.shares = (post.shares || 0) + 1;
    this.save();

    const shareUrl = `${window.location.origin}${window.location.pathname}#post-${postId}`;
    const shareText = `🐾 ¡Alerta en Buscapet! ${post.petName} (${post.species} ${post.breed}). Ayúdanos a difundir en ${post.location?.cityName || 'la zona'}: ${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: `Buscapet: ${post.petName}`,
        text: shareText,
        url: shareUrl
      }).catch(() => {});
    } else {
      const modal = document.getElementById('share-modal');
      const input = document.getElementById('share-url-input');
      const waBtn = document.getElementById('share-wa-btn');
      const fbBtn = document.getElementById('share-fb-btn');
      const twBtn = document.getElementById('share-tw-btn');

      if (input) input.value = shareUrl;
      if (waBtn) waBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      if (fbBtn) fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      if (twBtn) twBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

      if (modal) {
        modal.classList.add('show');
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
      }
    }
  },

  closeShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
  }
};
