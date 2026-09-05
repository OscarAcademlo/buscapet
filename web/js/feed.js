// ==========================================================================
// BUSCAPET - FEED CONTROLLER (MULTI-PHOTO CAROUSELS & FILTERS)
// ==========================================================================

var BuscapetFeed = window.BuscapetFeed = {
  posts: [],
  activeFilter: 'all', // 'all' | 'lost' | 'found' | 'spotted'
  selectedCountry: '', // Empty means show all by default
  selectedState: '',
  selectedCity: '',

  initialPosts: [
    {
      id: 'pet-1',
      type: 'lost', // 'lost' | 'found' | 'spotted'
      petName: 'Milo',
      species: 'Perro',
      breed: 'Golden Retriever',
      gender: 'Macho',
      photos: [
        'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Se extravió Milo cerca del Parque Centenario. Llevaba collar azul con chapita pero sin teléfono. Es muy dócil, responde por su nombre y necesita medicación diaria.',
      location: {
        countryCode: 'AR',
        countryName: 'Argentina',
        stateName: 'Ciudad Autónoma de Buenos Aires (CABA)',
        cityName: 'Caballito',
        address: 'Av. Díaz Vélez & Campichuelo, CABA',
        lat: -34.6062,
        lng: -58.4355
      },
      date: 'Hace 2 horas',
      isSample: true,
      user: {
        id: 'usr-101',
        name: 'Camila Rossi',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        phone: '+54 9 11 5555-4321'
      },
      likes: 24,
      liked: false,
      shares: 18,
      comments: [
        {
          id: 'cmt-1',
          userName: 'Sofía Romero',
          userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
          text: '¡Lo compartí en el grupo de vecinos de Caballito! Ojalá aparezca pronto 🙏',
          time: 'Hace 1 hora'
        }
      ]
    },
    {
      id: 'pet-2',
      type: 'found',
      petName: 'Gatita encontrada (Sin identificar)',
      species: 'Gato',
      breed: 'Siamés mestizo',
      gender: 'Hembra',
      photos: [
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Encontré esta gatita asustada resguardándose de la lluvia en una estación de servicio. Tiene ojos celestes intensos y collar rosa sin identificación. La tengo en tránsito.',
      location: {
        countryCode: 'AR',
        countryName: 'Argentina',
        stateName: 'Ciudad Autónoma de Buenos Aires (CABA)',
        cityName: 'Palermo',
        address: 'Av. Santa Fe y Scalabrini Ortiz, CABA',
        lat: -34.5833,
        lng: -58.4178
      },
      date: 'Hace 5 horas',
      isSample: true,
      user: {
        id: 'usr-102',
        name: 'Martín Gómez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        phone: '+54 9 11 6789-1234'
      },
      likes: 42,
      liked: false,
      shares: 31,
      comments: [
        {
          id: 'cmt-2',
          userName: 'Gonzalo Paz',
          userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          text: 'Tiene carita de estar bien cuidada, seguro su familia la está buscando.',
          time: 'Hace 3 horas'
        }
      ]
    },
    {
      id: 'pet-3',
      type: 'lost',
      petName: 'Rocky',
      species: 'Perro',
      breed: 'Bulldog Francés',
      gender: 'Macho',
      photos: [
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Buscamos desesperadamente a Rocky. Se asustó con unos truenos y escapó por el portón. Color vaquita (blanco y negro). Recompensa a quien lo devuelva o aporte datos certeros.',
      location: {
        countryCode: 'AR',
        countryName: 'Argentina',
        stateName: 'Buenos Aires',
        cityName: 'San Isidro',
        address: 'Zona Las Lomas, San Isidro',
        lat: -34.4716,
        lng: -58.5283
      },
      date: 'Ayer',
      isSample: true,
      user: {
        id: 'usr-103',
        name: 'Lucía Fernández',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        phone: '+54 9 11 3333-8899'
      },
      likes: 89,
      liked: true,
      shares: 64,
      comments: [
        {
          id: 'cmt-3',
          userName: 'Valeria Rivas',
          userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          text: 'Atentos en la zona de Las Lomas. ¡Compartido!',
          time: 'Ayer'
        }
      ]
    },
    {
      id: 'pet-4',
      type: 'spotted',
      petName: 'Perrito callejero visto',
      species: 'Perro',
      breed: 'Mestizo mediano',
      gender: 'Desconocido',
      photos: [
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Visto perrito mestizo marrón con pecho blanco caminando desorientado por la vereda. Parece bien cuidado, seguro tiene dueño buscando por esta zona.',
      location: {
        countryCode: 'CL',
        countryName: 'Chile',
        stateName: 'Región Metropolitana',
        cityName: 'Santiago',
        address: 'Parque Forestal, Santiago',
        lat: -33.4372,
        lng: -70.6472
      },
      date: 'Hace 1 día',
      isSample: true,
      user: {
        id: 'usr-104',
        name: 'Diego Morales',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        phone: '+56 9 8888-2222'
      },
      likes: 15,
      liked: false,
      shares: 12,
      comments: []
    },
    {
      id: 'pet-5',
      type: 'adopt',
      petName: 'Luna (Cachorrita en Adopción)',
      species: 'Perro',
      breed: 'Mestiza mediana (3 meses)',
      gender: 'Hembra',
      photos: [
        'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80'
      ],
      description: 'Hermosa cachorra rescatada busca una familia amorosa y responsable. Está desparasitada y con su primera vacuna. Se entrega con compromiso de castración a los 6 meses.',
      location: {
        countryCode: 'AR',
        countryName: 'Argentina',
        stateName: 'Ciudad Autónoma de Buenos Aires (CABA)',
        cityName: 'Belgrano',
        address: 'Av. Cabildo y Juramento, Belgrano, CABA',
        lat: -34.5615,
        lng: -58.4564
      },
      date: 'Hoy',
      isSample: true,
      user: {
        id: 'usr-105',
        name: 'Refugio Patitas Felices',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        phone: '+54 9 11 9988-7766'
      },
      likes: 56,
      liked: true,
      shares: 48,
      comments: [
        {
          id: 'cmt-5',
          userName: 'Esteban Conti',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          text: '¡Hermosa Luna! Ya mandé mensaje para consultar requisitos de adopción ❤️',
          time: 'Hace 40 min'
        }
      ]
    }
  ],

  init() {
    // Clear any stale/corrupted cache and load full initial demo posts
    try {
      const stored = localStorage.getItem('buscapet_posts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const userPosts = parsed.filter(p => !['pet-1', 'pet-2', 'pet-3', 'pet-4', 'pet-5'].includes(p.id));
          this.posts = [...userPosts, ...this.initialPosts];
        } else {
          this.posts = [...this.initialPosts];
        }
      } else {
        this.posts = [...this.initialPosts];
      }
    } catch (e) {
      this.posts = [...this.initialPosts];
    }

    // Auto-archive posts reunited or adopted for more than 7 days
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    this.posts = this.posts.filter(p => {
      if (p.reunited && p.reunitedAt) {
        return (Date.now() - p.reunitedAt) < SEVEN_DAYS_MS;
      }
      if (p.adopted && p.adoptedAt) {
        return (Date.now() - p.adoptedAt) < SEVEN_DAYS_MS;
      }
      return true;
    });

    this.activeFilter = 'all';
    this.selectedCountry = '';
    this.selectedState = '';
    this.selectedCity = '';
    this.save();
    this.render();

    // Subscribe to Firestore live cloud sync
    if (window.BuscapetFirebase && BuscapetFirebase.syncPostsFromFirestore) {
      BuscapetFirebase.syncPostsFromFirestore(cloudPosts => {
        if (cloudPosts && cloudPosts.length > 0) {
          const userCloudPosts = cloudPosts.filter(p => !['pet-1', 'pet-2', 'pet-3', 'pet-4', 'pet-5'].includes(p.id));
          this.posts = [...userCloudPosts, ...this.initialPosts];
          this.save();
          this.render();
        }
      });
    }
  },

  save() {
    try {
      localStorage.setItem('buscapet_posts', JSON.stringify(this.posts));
    } catch (e) {}
  },

  addPost(newPostData) {
    const post = {
      id: 'pet-' + Date.now(),
      ...newPostData,
      likes: 0,
      liked: false,
      shares: 0,
      comments: [],
      date: 'Recién publicado'
    };
    this.posts.unshift(post);
    this.save();
    this.render();

    // Persist to Cloud Firestore
    if (window.BuscapetFirebase && BuscapetFirebase.savePostToFirestore) {
      BuscapetFirebase.savePostToFirestore(post);
    }

    return post;
  },

  filterByType(type) {
    this.activeFilter = type || 'all';
    this.render();
  },

  filterByLocation(countryCode = '', stateName = '', cityName = '') {
    this.selectedCountry = countryCode || '';
    this.selectedState = stateName || '';
    this.selectedCity = cityName || '';
    this.render();
  },

  toggleLike(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      this.save();
      this.render();
    }
  },

  sharePost(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.shares += 1;
      this.save();
      if (navigator.share) {
        navigator.share({
          title: `Buscapet: ${post.petName} (${post.type === 'lost' ? 'Perdido' : 'Encontrado'})`,
          text: post.description,
          url: window.location.href
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(`${window.location.href}#${post.id}`);
        alert('¡Enlace de la publicación copiado al portapapeles!');
      }
      this.render();
    }
  },

  toggleComments(postId) {
    const section = document.getElementById(`comments-section-${postId}`);
    if (section) {
      const isHidden = section.style.display === 'none' || !section.style.display;
      section.style.display = isHidden ? 'block' : 'none';
      if (isHidden) {
        const input = document.getElementById(`comment-input-${postId}`);
        if (input) input.focus();
      }
    }
  },

  submitComment(postId) {
    // Solo usuarios logueados pueden comentar
    if (!window.BuscapetFirebase || !BuscapetFirebase.isLoggedIn()) {
      alert('Debes iniciar sesión para dejar un comentario.');
      BuscapetFirebase.openAuthModal();
      return;
    }

    const input = document.getElementById(`comment-input-${postId}`);
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    if (!Array.isArray(post.comments)) {
      post.comments = [];
    }

    const currentUser = window.BuscapetFirebase ? BuscapetFirebase.currentUser : null;
    const comment = {
      id: 'cmt-' + Date.now(),
      userName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Vecino Solidario',
      userAvatar: currentUser?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      text: text,
      time: 'Recién publicado'
    };

    post.comments.push(comment);
    input.value = '';
    this.save();

    if (window.BuscapetFirebase && BuscapetFirebase.savePostToFirestore) {
      BuscapetFirebase.savePostToFirestore(post);
    }

    // Append to UI list dynamically
    const list = document.getElementById(`comments-list-${postId}`);
    if (list) {
      const item = document.createElement('div');
      item.className = 'comment-item';
      item.innerHTML = `
        <img src="${comment.userAvatar}" alt="${comment.userName}" class="comment-avatar">
        <div class="comment-bubble">
          <div class="comment-author-time">
            <span class="comment-author">${comment.userName}</span>
            <span class="comment-time">${comment.time}</span>
          </div>
          <div class="comment-text">${comment.text}</div>
        </div>
      `;
      list.appendChild(item);
      list.scrollTop = list.scrollHeight;
    }

    // Update count span
    const countSpan = document.getElementById(`comment-count-${postId}`);
    if (countSpan) {
      countSpan.textContent = post.comments.length;
    }

    if (window.BuscapetNotifications) {
      BuscapetNotifications.showPushBanner('Comentario Publicado', `Tu comentario en "${post.petName}" fue agregado.`);
    }
  },

  render() {
    const container = document.getElementById('feed-posts-container');
    if (!container) return;

    if (!this.posts || this.posts.length === 0) {
      this.posts = [...this.initialPosts];
    }

    let filtered = [...this.posts];

    // Filter by type
    if (this.activeFilter && this.activeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === this.activeFilter);
    }

    // Filter by Country if selected
    if (this.selectedCountry) {
      filtered = filtered.filter(p => p.location && (p.location.countryCode === this.selectedCountry || p.location.countryName === this.selectedCountry));
    }

    // Filter by State if selected
    if (this.selectedState) {
      const s = this.selectedState.toLowerCase();
      filtered = filtered.filter(p => p.location && (
        (p.location.stateName && (p.location.stateName.toLowerCase().includes(s) || s.includes(p.location.stateName.toLowerCase()))) ||
        (p.location.address && p.location.address.toLowerCase().includes(s))
      ));
    }

    // Filter by City if selected
    if (this.selectedCity) {
      const c = this.selectedCity.toLowerCase();
      filtered = filtered.filter(p => p.location && (
        (p.location.cityName && (p.location.cityName.toLowerCase().includes(c) || c.includes(p.location.cityName.toLowerCase()))) ||
        (p.location.address && p.location.address.toLowerCase().includes(c))
      ));
    }

    if (filtered.length === 0) {
      const countryObj = BuscapetLocations.countries.find(c => c.code === this.selectedCountry);
      const locLabel = this.selectedCity || this.selectedState || (countryObj ? countryObj.name : 'esta ubicación');
      container.innerHTML = `
        <div class="empty-feed-card" style="text-align:center; padding:45px 20px; background:var(--bg-card); border-radius:var(--radius-lg); border:1px dashed var(--border); margin:16px 0;">
          <div style="font-size:42px; margin-bottom:12px;">🐾</div>
          <h3 style="font-size:17px; font-weight:800; color:var(--text-main); margin-bottom:6px;">No hay reportes en ${locLabel}</h3>
          <p style="font-size:13px; color:var(--text-muted); max-width:380px; margin:0 auto 18px; line-height:1.4;">
            No encontramos publicaciones con los filtros actuales. Sé el primero en crear un reporte solidario en esta zona o restablece los filtros.
          </p>
          <div style="display:flex; justify-content:center; gap:10px; flex-wrap:wrap;">
            <button class="btn-primary-action" style="width:auto; padding:9px 16px; font-size:12.5px; background:var(--bg-input); color:var(--text-main); border:1px solid var(--border);" onclick="BuscapetApp.resetLocationFilter()">
              <i class="fa-solid fa-earth-americas"></i> Ver Todas las Ubicaciones
            </button>
            <button class="btn-primary-action" style="width:auto; padding:9px 16px; font-size:12.5px; background:var(--primary);" onclick="BuscapetApp.openCreateModal('lost')">
              <i class="fa-solid fa-plus-circle"></i> Publicar Mascota
            </button>
          </div>
        </div>
      `;
      return;
    }

    let htmlContent = '';
    if (filtered.length === 1) {
      htmlContent += this.renderPostCard(filtered[0]);
      htmlContent += this.renderSponsoredAd();
    } else {
      filtered.forEach((post, index) => {
        htmlContent += this.renderPostCard(post);

        // Insert Demo Sponsored Ad after first post
        if (index === 0) {
          htmlContent += this.renderSponsoredAd();
        }
      });
    }

    container.innerHTML = htmlContent;
    this.initCarousels();
  },

  renderSponsoredAd() {
    const ad = this.customSponsoredAd || {
      title: 'Clínica Veterinaria San Roque 🩺',
      desc: 'Atención 24 hs, cirugías, ecografías y microchips en tu zona.',
      img: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=200&q=80',
      badge: 'Publicidad de Muestra (Demo)'
    };

    return `
      <div class="ad-card-sponsored">
        <div class="ad-banner-header">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">
            <i class="fa-solid fa-bullhorn"></i> Espacio Publicitario Patrocinado
          </span>
          <span class="ad-demo-badge" style="${this.customSponsoredAd ? 'background:#00A699; color:#fff;' : ''}">${ad.badge || 'Anuncio Activo'}</span>
        </div>
        <div class="ad-content">
          <img src="${ad.img}" alt="${ad.title}" class="ad-logo">
          <div class="ad-text-box">
            <h4 class="ad-title">${ad.title}</h4>
            <p class="ad-desc">${ad.desc}</p>
            <div style="display:flex; gap:10px; margin-top:8px;">
              <button class="btn-primary-action" style="padding: 6px 12px; font-size: 11px; width: auto; background: #00A699;" onclick="BuscapetApp.openAdvertisingModal()">
                <i class="fa-solid fa-rectangle-ad"></i> Quiero Publicitar ($10 USD)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  deletePost(postId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta publicación del sistema?')) {
      this.posts = this.posts.filter(p => p.id !== postId);
      this.save();
      this.render();
      if (window.BuscapetApp && BuscapetApp.renderAdminPostList) {
        BuscapetApp.renderAdminPostList();
      }
      BuscapetNotifications.showPushBanner('Publicación Eliminada', 'El reporte fue retirado por el Administrador.');
    }
  },

  renderPostCard(post) {
    const statusConfig = {
      lost: { text: 'Perdido', badgeClass: 'status-lost', icon: 'fa-circle-exclamation' },
      found: { text: 'Encontrado', badgeClass: 'status-found', icon: 'fa-circle-check' },
      spotted: { text: 'Visto', badgeClass: 'status-spotted', icon: 'fa-eye' },
      adopt: { text: 'En Adopción', badgeClass: 'status-adopt', icon: 'fa-heart' },
      reunited: { text: '¡Encontrado! 🎉', badgeClass: 'status-reunited', icon: 'fa-circle-check' },
      adopted: { text: '¡Adoptado! 🏡', badgeClass: 'status-reunited', icon: 'fa-house-heart' }
    };

    const isReunited = post.type === 'reunited' || post.reunited;
    const isAdopted = post.type === 'adopted' || post.adopted;
    const cfg = isReunited ? statusConfig.reunited : (isAdopted ? statusConfig.adopted : (statusConfig[post.type] || statusConfig.lost));
    const photos = post.photos && post.photos.length > 0 ? post.photos : ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'];
    const commentsList = Array.isArray(post.comments) ? post.comments : [];

    // Check if logged in user is the owner or admin
    const currentUser = window.BuscapetFirebase ? BuscapetFirebase.currentUser : null;
    const isOwner = currentUser && (currentUser.email === post.user?.email || currentUser.uid === post.user?.id || (window.BuscapetFirebase && BuscapetFirebase.isAdmin()));

    return `
      <article class="post-card ${isReunited || isAdopted ? 'post-card-reunited' : ''}" id="${post.id}">
        <!-- Header -->
        <div class="post-header">
          <div class="post-user">
            <img src="${post.user.avatar}" alt="${post.user.name}" class="avatar">
            <div class="user-meta">
              <span class="user-name">${post.user.name}</span>
              <span class="post-time-loc">
                <i class="fa-regular fa-clock"></i> ${post.date} &bull; ${post.location.cityName || post.location.stateName}
              </span>
            </div>
          </div>
          <div class="status-badge ${cfg.badgeClass}">
            <i class="fa-solid ${cfg.icon}"></i> ${cfg.text}
          </div>
        </div>

        ${isReunited ? `
          <div style="padding: 0 14px 8px;">
            <div class="reunited-banner">
              <i class="fa-solid fa-circle-check"></i>
              <div>
                <div class="reunited-title">¡Mascota Recuperada y con su Familia! 🥳</div>
                <div class="reunited-subtitle">Gracias a la solidaridad de la comunidad de Buscapet. Esta publicación se archivará en 7 días.</div>
              </div>
            </div>
          </div>
        ` : ''}

        ${isAdopted ? `
          <div style="padding: 0 14px 8px;">
            <div class="reunited-banner" style="border-color: #8B5CF6; background: rgba(139, 92, 246, 0.15);">
              <i class="fa-solid fa-house-chimney-heart" style="color: #8B5CF6;"></i>
              <div>
                <div class="reunited-title" style="color: #8B5CF6;">¡Mascota Adoptada con Éxito! 🏡💖</div>
                <div class="reunited-subtitle">Gracias a la comunidad de Buscapet por darle un hogar con amor. Esta publicación se archivará en 7 días.</div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Multi-photo Carousel -->
        <div class="post-media-wrapper" data-carousel-id="${post.id}">
          <div class="carousel-slides">
            ${photos.map((imgUrl, idx) => `
              <div class="carousel-slide">
                <img src="${imgUrl}" alt="${post.petName} foto ${idx + 1}" loading="lazy">
              </div>
            `).join('')}
          </div>

          ${photos.length > 1 ? `
            <button class="carousel-btn carousel-prev" onclick="BuscapetFeed.prevSlide('${post.id}')" aria-label="Foto anterior">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button class="carousel-btn carousel-next" onclick="BuscapetFeed.nextSlide('${post.id}')" aria-label="Foto siguiente">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
            <div class="carousel-indicators">
              ${photos.map((_, idx) => `<span class="carousel-dot ${idx === 0 ? 'active' : ''}"></span>`).join('')}
            </div>
            <div class="photo-counter">1/${photos.length}</div>
          ` : ''}
        </div>

        <!-- Post Action Bar -->
        <div class="post-actions">
          <div class="action-group-left">
            <button class="action-btn ${post.liked ? 'liked' : ''}" onclick="BuscapetFeed.toggleLike('${post.id}')" title="Me gusta / Apoyar">
              <i class="${post.liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}"></i>
              <span style="font-size: 13px;">${post.likes}</span>
            </button>
            <button class="action-btn" onclick="BuscapetFeed.toggleComments('${post.id}')" title="Ver comentarios">
              <i class="fa-regular fa-comment"></i>
              <span id="comment-count-${post.id}" style="font-size: 13px;">${commentsList.length}</span>
            </button>
            <button class="action-btn" onclick="BuscapetFeed.sharePost('${post.id}')" title="Compartir">
              <i class="fa-solid fa-share-nodes"></i>
              <span style="font-size: 13px;">${post.shares}</span>
            </button>
            <button class="btn-map-view" onclick="BuscapetMap.openMapForPost('${post.id}')" title="Ver ubicación en mapa">
              <i class="fa-solid fa-location-dot"></i> Mapa
            </button>
          </div>

          <div class="action-group-right">
            ${!isReunited && !isAdopted && isOwner && post.type !== 'adopt' ? `
              <button class="btn-primary-action" style="background:#10B981; font-size:11px; padding:6px 10px; width:auto;" onclick="BuscapetFeed.markAsReunited('${post.id}')" title="Marcar como Encontrado">
                <i class="fa-solid fa-circle-check"></i> ¡Ya fue encontrado!
              </button>
            ` : ''}

            ${!isAdopted && !isReunited && isOwner && post.type === 'adopt' ? `
              <button class="btn-primary-action" style="background:#8B5CF6; font-size:11px; padding:6px 10px; width:auto;" onclick="BuscapetFeed.markAsAdopted('${post.id}')" title="Marcar como Adoptado">
                <i class="fa-solid fa-house-chimney-heart"></i> ¡Ya fue adoptado!
              </button>
            ` : ''}

            <button class="btn-contact-owner" onclick="BuscapetChat.openDirectChat('${post.id}', '${post.user.name}', '${post.petName}', '${post.user.avatar}')">
              <i class="fa-solid fa-comment-dots"></i> Contactar
            </button>
          </div>
        </div>

        <!-- Post Details & Description -->
        <div class="post-details">
          <h4 class="pet-headline">${post.petName}</h4>
          <div class="pet-tags">
            <span class="pet-tag"><i class="fa-solid fa-paw"></i> ${post.species}</span>
            <span class="pet-tag">${post.breed}</span>
            <span class="pet-tag">${post.gender}</span>
          </div>
          <p class="post-caption">${post.description}</p>
          <div class="location-snippet">
            <i class="fa-solid fa-map-pin"></i> ${post.location.address || `${post.location.cityName}, ${post.location.stateName}`}
          </div>
        </div>

        <!-- Interactive Comments Section -->
        <div id="comments-section-${post.id}" class="comments-section" style="display: none;">
          <div class="comments-list" id="comments-list-${post.id}">
            ${commentsList.length === 0 ? `
              <div class="no-comments-msg" style="font-size:12px; color:var(--text-muted); text-align:center; padding:8px 0;">
                Sé el primero en dejar un comentario o aportar información sobre ${post.petName}.
              </div>
            ` : commentsList.map(c => `
              <div class="comment-item">
                <img src="${c.userAvatar}" alt="${c.userName}" class="comment-avatar">
                <div class="comment-bubble">
                  <div class="comment-author-time">
                    <span class="comment-author">${c.userName}</span>
                    <span class="comment-time">${c.time}</span>
                  </div>
                  <div class="comment-text">${c.text}</div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="comment-input-row">
            <input type="text" id="comment-input-${post.id}" class="comment-input" placeholder="Escribe un comentario..." onkeypress="if(event.key==='Enter') BuscapetFeed.submitComment('${post.id}')">
            <button class="btn-send-comment" onclick="BuscapetFeed.submitComment('${post.id}')" title="Enviar comentario">
              <i class="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  },

  markAsReunited(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    if (confirm(`¿Confirmas que ${post.petName} ya fue encontrado y está con su familia? 🎉`)) {
      post.type = 'reunited';
      post.reunited = true;
      post.reunitedAt = Date.now();
      this.save();
      this.render();

      BuscapetNotifications.showPushBanner(
        '¡Felicitaciones! 🎉🐾',
        `¡Qué gran alegría! ${post.petName} ha sido marcado como recuperado. La publicación permanecerá visible durante 7 días como testimonio y luego se archivará.`
      );
    }
  },

  markAsAdopted(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    if (confirm(`¿Confirmas que ${post.petName} ya fue adoptado/a y tiene un hogar? 🏡💖`)) {
      post.type = 'adopted';
      post.adopted = true;
      post.adoptedAt = Date.now();
      this.save();
      this.render();

      BuscapetNotifications.showPushBanner(
        '¡Final Feliz! 🏡💖',
        `¡Hermosa noticia! ${post.petName} ya tiene una familia responsable. La publicación permanecerá visible durante 7 días y luego se archivará.`
      );
    }
  },

  // Carousel control
  carouselsState: {},

  initCarousels() {
    document.querySelectorAll('.post-media-wrapper').forEach(wrapper => {
      const id = wrapper.getAttribute('data-carousel-id');
      if (!this.carouselsState[id]) {
        this.carouselsState[id] = { index: 0 };
      }
    });
  },

  nextSlide(postId) {
    const wrapper = document.querySelector(`[data-carousel-id="${postId}"]`);
    if (!wrapper) return;
    const slidesContainer = wrapper.querySelector('.carousel-slides');
    const slides = wrapper.querySelectorAll('.carousel-slide');
    const dots = wrapper.querySelectorAll('.carousel-dot');
    const counter = wrapper.querySelector('.photo-counter');

    if (slides.length <= 1) return;

    let state = this.carouselsState[postId] || { index: 0 };
    state.index = (state.index + 1) % slides.length;
    this.carouselsState[postId] = state;

    slidesContainer.style.transform = `translateX(-${state.index * 100}%)`;
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === state.index));
    if (counter) counter.textContent = `${state.index + 1}/${slides.length}`;
  },

  prevSlide(postId) {
    const wrapper = document.querySelector(`[data-carousel-id="${postId}"]`);
    if (!wrapper) return;
    const slidesContainer = wrapper.querySelector('.carousel-slides');
    const slides = wrapper.querySelectorAll('.carousel-slide');
    const dots = wrapper.querySelectorAll('.carousel-dot');
    const counter = wrapper.querySelector('.photo-counter');

    if (slides.length <= 1) return;

    let state = this.carouselsState[postId] || { index: 0 };
    state.index = (state.index - 1 + slides.length) % slides.length;
    this.carouselsState[postId] = state;

    slidesContainer.style.transform = `translateX(-${state.index * 100}%)`;
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === state.index));
    if (counter) counter.textContent = `${state.index + 1}/${slides.length}`;
  }
};

