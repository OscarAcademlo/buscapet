// ==========================================================================
// BUSCAPET - FEED CONTROLLER (POSTS, CAROUSELS, FILTERS & INTERACTIONS)
// ==========================================================================

var BuscapetFeed = window.BuscapetFeed = {
  posts: [],
  activeFilter: 'all',
  selectedCountry: 'AR',
  selectedState: '',
  selectedCity: '',
  searchQuery: '',
  photoIndices: {},

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
      resolvedType: null, // 'reunited' | 'adopted'
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
      resolvedType: null,
      comments: [
        {
          id: 'cmt-2',
          userName: 'Gonzalo Paz',
          userAvatar: 'img/posts/demo/avatar_gonzalo.jpg',
          text: 'Tiene carita de estar bien cuidada, seguro su familia la está buscando desesperada.',
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
      vaccines: true,
      neutered: false,
      adoptionReqs: 'Seguimiento por fotos y compromiso de castración a los 8 meses.',
      location: {
        countryCode: 'AR',
        countryName: 'Argentina',
        stateName: 'CABA',
        cityName: 'Villa Urquiza',
        address: 'Plaza Echeverría, Villa Urquiza, CABA',
        lat: -34.5732,
        lng: -58.4877
      },
      date: 'Ayer',
      user: {
        id: 'usr-103',
        name: 'Valentina Díaz',
        avatar: 'img/posts/demo/avatar_valentina.jpg',
        phone: '+5491133332211'
      },
      likes: 65,
      liked: false,
      shares: 45,
      isResolved: false,
      resolvedType: null,
      comments: [
        {
          id: 'cmt-3',
          userName: 'Carla Méndez',
          userAvatar: 'img/posts/demo/avatar_carla.jpg',
          text: '¡Hermosa Luna! Ojalá encuentre un hogar lleno de amor.',
          time: 'Hace 8 h'
        }
      ]
    },
    {
      id: 'post-4',
      type: 'spotted',
      petName: 'Pastor Alemán desorientado',
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
        address: 'Centro Cívico, San Carlos de Bariloche, Río Negro',
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
      resolvedType: null,
      comments: []
    }
  ],

  init() {
    const saved = localStorage.getItem('buscapet_posts');
    if (saved) {
      try {
        this.posts = JSON.parse(saved);
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
    localStorage.setItem('buscapet_posts', JSON.stringify(this.posts));
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

    // Update location label in hero
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
      // Type filter
      if (this.activeFilter !== 'all' && post.type !== this.activeFilter) {
        return false;
      }

      // Location filter
      if (this.selectedCountry && post.location && post.location.countryCode !== this.selectedCountry && post.location.countryName !== this.selectedCountry) {
        // Allow pass if matching country name or code
      }
      if (this.selectedState && post.location && !post.location.stateName.toLowerCase().includes(this.selectedState.toLowerCase())) {
        return false;
      }
      if (this.selectedCity && post.location && !post.location.cityName.toLowerCase().includes(this.selectedCity.toLowerCase())) {
        return false;
      }

      // Search query
      if (this.searchQuery) {
        const text = `${post.petName} ${post.species} ${post.breed} ${post.description} ${post.location?.cityName || ''} ${post.location?.stateName || ''}`.toLowerCase();
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

      // Interleave sponsored ads from BuscapetAds
      if (window.BuscapetAds && (idx === 0 || idx === 2)) {
        const ad = window.BuscapetAds.getAdForIndex(idx);
        if (ad) html += window.BuscapetAds.buildAdCardHtml(ad);
      }
    });

    container.innerHTML = html;
  },

  buildPostCardHtml(post) {
    const t = window.BuscapetI18n ? window.BuscapetI18n.t.bind(window.BuscapetI18n) : (k => k);
    const photos = post.photos && post.photos.length > 0 ? post.photos : ['img/posts/demo/milo_1.jpg'];
    const currentIdx = this.photoIndices[post.id] || 0;
    const currentPhoto = photos[currentIdx] || photos[0];

    // Badge styling & labels
    let badgeClass = 'badge-lost';
    let badgeText = t('badge_lost');
    let borderClass = 'border-lost';
    if (post.type === 'found') {
      badgeClass = 'badge-found';
      badgeText = t('badge_found');
      borderClass = 'border-found';
    } else if (post.type === 'adopt') {
      badgeClass = 'badge-adopt';
      badgeText = t('badge_adopt');
      borderClass = 'border-adopt';
    } else if (post.type === 'spotted') {
      badgeClass = 'badge-spotted';
      badgeText = t('badge_spotted');
      borderClass = 'border-spotted';
    }

    // Resolved status (Final Feliz)
    const isResolved = !!post.isResolved;
    const resolvedLabel = post.type === 'adopt' ? t('badge_adopted') : t('badge_resolved');
    const markResolvedBtnText = post.type === 'adopt' ? t('mark_adopted') : t('mark_resolved');

    return `
      <article class="pet-card ${borderClass}" id="card-${post.id}" data-type="${post.type}">
        ${isResolved ? `
          <div style="background:linear-gradient(90deg,#22C55E,#16A34A);color:#fff;padding:7px 10px;font-size:12.5px;font-weight:900;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px;">
            <span>🎉</span> <span>${resolvedLabel}</span>
          </div>
        ` : `
          <div class="demo-banner">⚠️ ✦ [ PUBLICACIÓN ACTIVA EN BUSCAPET ]</div>
        `}

        <div class="card-header-row">
          <img class="card-avatar" src="${post.user.avatar || 'img/posts/demo/avatar_nicolas.jpg'}" alt="${post.user.name}">
          <div class="card-user-info">
            <div class="card-username">${post.user.name}</div>
            <div class="card-meta">${post.location ? `${post.location.cityName}, ${post.location.stateName}` : ''} &bull; ${post.date}</div>
          </div>
          <div class="card-badges">
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
          ${post.location && post.location.lat ? `
            <button class="action-btn" style="margin-left:auto;color:var(--primary);" onclick="BuscapetMap.openMapForPost('${post.id}')">
              <i class="bi bi-geo-alt-fill"></i> ${t('view_map')}
            </button>
          ` : ''}
        </div>

        <div class="card-contact-btns">
          <a class="contact-btn contact-btn-found" href="https://wa.me/${(post.user.phone || '').replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(post.user.name)},%20te%20contacto%20desde%20Buscapet%20por%20${encodeURIComponent(post.petName)}" target="_blank">
            <i class="bi bi-whatsapp"></i> ${t('contact_whatsapp')}
          </a>
          <button class="contact-btn contact-btn-msg" onclick="BuscapetChat.openDirectChat('${post.id}', '${post.user.name}', '${post.petName}', '${post.user.avatar}')">
            <i class="bi bi-chat-dots"></i> ${t('contact_chat')}
          </button>
        </div>

        <div class="card-details">
          <div class="card-pet-name">${post.petName}</div>
          <div class="card-species-tags">
            <span class="species-tag">${post.species}</span>
            <span class="species-tag">${post.breed}</span>
            <span class="species-tag">${post.gender}</span>
            ${post.hasCollar ? `<span class="species-tag" style="border-color:var(--warning);color:var(--warning);">🏷️ ${post.collarDetails || t('collar_yes')}</span>` : ''}
          </div>
          <div class="card-description">${post.description}</div>
          ${post.location ? `
            <div class="card-location-row" style="display:flex;align-items:center;gap:5px;font-size:11.5px;color:var(--text-muted);margin-top:6px;">
              <i class="bi bi-geo-alt-fill" style="color:var(--primary)"></i>
              <span>${post.location.address || `${post.location.cityName}, ${post.location.stateName}`}</span>
            </div>
          ` : ''}

          <!-- Botón de Resolución de Caso (Final Feliz) -->
          <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;">
            <button class="hero-btn" style="font-size:11px;padding:6px 12px;background:rgba(34,197,94,.12);border:1px solid var(--success);color:var(--success);" onclick="BuscapetFeed.toggleResolved('${post.id}')">
              <i class="bi bi-check-circle-fill"></i> ${isResolved ? 'Reabrir caso' : markResolvedBtnText}
            </button>
            <span style="font-size:10.5px;color:var(--text-muted);">${post.date}</span>
          </div>
        </div>

        <!-- Seccion de Comentarios Desplegable -->
        <div class="comments-section" id="comments-box-${post.id}" style="display:none;background:var(--bg-input);padding:10px 12px;border-top:1px solid var(--border);">
          <div class="comments-list" id="comments-list-${post.id}" style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;">
            ${(post.comments || []).map(c => `
              <div style="display:flex;gap:8px;font-size:12px;">
                <img src="${c.userAvatar || 'img/posts/demo/avatar_nicolas.jpg'}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;">
                <div style="background:var(--bg-card);padding:6px 10px;border-radius:8px;flex:1;">
                  <strong style="color:var(--text-main);font-size:11.5px;">${c.userName}</strong>
                  <div style="color:var(--text-sub);margin-top:2px;">${c.text}</div>
                  <div style="font-size:9.5px;color:var(--text-muted);margin-top:3px;">${c.time}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div style="display:flex;gap:6px;">
            <input type="text" class="filter-select" style="margin:0;flex:1;" id="comment-input-${post.id}" placeholder="${t('write_comment')}">
            <button class="btn-filter-apply" style="width:auto;padding:6px 14px;" onclick="BuscapetFeed.submitComment('${post.id}')">
              <i class="bi bi-send-fill"></i>
            </button>
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

    const countEl = document.getElementById(`likes-${postId}`);
    if (countEl) countEl.textContent = post.likes;

    const card = document.getElementById(`card-${postId}`);
    if (card) {
      const btn = card.querySelector('.card-actions .action-btn:first-child');
      if (btn) {
        btn.className = `action-btn ${post.liked ? 'liked' : ''}`;
        const icon = btn.querySelector('i');
        if (icon) icon.className = `bi ${post.liked ? 'bi-heart-fill' : 'bi-heart'}`;
      }
    }
  },

  toggleComments(postId) {
    const box = document.getElementById(`comments-box-${postId}`);
    if (box) {
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }
  },

  submitComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    if (!input || !input.value.trim()) return;

    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.comments) post.comments = [];
    post.comments.push({
      id: 'cmt-' + Date.now(),
      userName: 'Tú (Usuario)',
      userAvatar: 'img/posts/demo/avatar_nicolas.jpg',
      text: input.value.trim(),
      time: 'Hace un instante'
    });

    input.value = '';
    this.save();
    this.renderFeed();

    // Reopen comments box after rerender
    setTimeout(() => {
      const box = document.getElementById(`comments-box-${postId}`);
      if (box) box.style.display = 'block';
    }, 50);
  },

  toggleResolved(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    post.isResolved = !post.isResolved;
    this.save();
    this.renderFeed();

    if (post.isResolved) {
      alert(`🎉 ¡Excelente noticia! ${post.petName} fue marcado como caso resuelto. La comunidad de Buscapet celebra este reencuentro.`);
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
      // Open share modal
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
