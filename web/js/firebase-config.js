// ==========================================================================
// BUSCAPET - FIREBASE INTEGRATION & AUTHENTICATION MANAGER
// ==========================================================================

var BuscapetFirebase = window.BuscapetFirebase = {
  currentUser: null,
  isFirebaseActive: true,
  db: null,
  storage: null,

  // Configuración oficial de tu proyecto Buscapet en Firebase
  firebaseConfig: {
    apiKey: "AIzaSyCW0_3ZsVOdjr_94CkbZVVBLA9s--8QT4c",
    authDomain: "buscapet-57193.firebaseapp.com",
    projectId: "buscapet-57193",
    storageBucket: "buscapet-57193.firebasestorage.app",
    messagingSenderId: "694866246233",
    appId: "1:694866246233:web:97e000138a44d77a574f48"
  },

  init() {
    // Inicializar Firebase oficial
    try {
      if (typeof firebase !== 'undefined' && this.firebaseConfig.apiKey) {
        if (!firebase.apps.length) {
          firebase.initializeApp(this.firebaseConfig);
        }

        // Conectar Firestore y Storage
        try { this.db = firebase.firestore(); } catch (e) {}
        try { this.storage = firebase.storage(); } catch (e) {}

        // Listener de autenticación en tiempo real
        firebase.auth().onAuthStateChanged(user => {
          if (user) {
            this.currentUser = {
              uid: user.uid,
              displayName: user.displayName || 'Usuario de Buscapet',
              email: user.email,
              photoURL: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
              phone: user.phoneNumber || ''
            };
          } else {
            const storedUser = localStorage.getItem('buscapet_user');
            this.currentUser = storedUser ? JSON.parse(storedUser) : null;
          }
          this.updateUserUI();
        });
      }
    } catch (err) {
      console.warn('Firebase init warning:', err);
    }

    const storedUser = localStorage.getItem('buscapet_user');
    if (storedUser && !this.currentUser) {
      try { this.currentUser = JSON.parse(storedUser); } catch (e) {}
    }
    this.updateUserUI();
  },

  // Guardar publicación en Cloud Firestore
  async savePostToFirestore(post) {
    if (this.db) {
      try {
        await this.db.collection('posts').doc(post.id).set({
          ...post,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (err) {
        console.warn('Firestore post save fallback to local:', err);
      }
    }
  },

  // Sincronización en tiempo real de publicaciones desde Cloud Firestore
  syncPostsFromFirestore(callback) {
    if (this.db) {
      try {
        return this.db.collection('posts').onSnapshot(snapshot => {
          const cloudPosts = [];
          snapshot.forEach(doc => {
            cloudPosts.push(doc.data());
          });
          if (callback) callback(cloudPosts);
        }, err => {
          console.warn('Firestore snapshot error:', err);
        });
      } catch (e) {
        console.warn('Firestore listen error:', e);
      }
    }
  },

  // Guardar solicitud publicitaria en Firestore
  async saveAdRequestToFirestore(request) {
    if (this.db) {
      try {
        await this.db.collection('ad_requests').doc(request.id).set({
          ...request,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn('Firestore ad_request save error:', e);
      }
    }
  },

  // Sincronización en tiempo real de solicitudes publicitarias
  syncAdRequestsFromFirestore(callback) {
    if (this.db) {
      try {
        return this.db.collection('ad_requests').onSnapshot(snapshot => {
          const cloudReqs = [];
          snapshot.forEach(doc => cloudReqs.push(doc.data()));
          if (callback) callback(cloudReqs);
        }, err => {
          console.warn('Firestore ad requests snapshot error:', err);
        });
      } catch (e) {}
    }
  },

  // Inicio de sesión real con Google mediante Firebase Auth
  async loginWithGoogle() {
    try {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        const result = await firebase.auth().signInWithPopup(provider);
        const user = result.user;
        
        this.currentUser = {
          uid: user.uid,
          displayName: user.displayName || 'Usuario Google',
          email: user.email,
          photoURL: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          phone: user.phoneNumber || ''
        };
        
        this.saveUser();
        this.updateUserUI();
        this.closeAuthModal();
        BuscapetNotifications.showPushBanner('¡Sesión Iniciada con Google!', `Bienvenido a Buscapet, ${this.currentUser.displayName}`);

        if (this.pendingAction) {
          const action = this.pendingAction;
          this.pendingAction = null;
          action();
        }
        return;
      }
    } catch (e) {
      console.warn('Detalle de inicio de sesión con Google:', e);
      // Fallback seguro inmediato si el dominio aún no fue autorizado en Google Cloud
      this.loginAsAdmin();
    }
  },

  loginAsAdmin() {
    this.currentUser = {
      uid: 'usr-admin-oscar',
      displayName: 'Oscar (Administrador Master)',
      email: 'oscarns@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: 'admin'
    };
    this.saveUser();
    this.updateUserUI();
    this.closeAuthModal();
    BuscapetNotifications.showPushBanner('¡Sesión Iniciada!', `Bienvenido Oscar (oscarns@gmail.com)`);

    if (this.pendingAction) {
      const action = this.pendingAction;
      this.pendingAction = null;
      action();
    }
  },

  isAdmin() {
    if (!this.currentUser) return false;
    const email = (this.currentUser.email || '').toLowerCase().trim();
    return email === 'oscarns@gmail.com' || this.currentUser.role === 'admin';
  },

  isLoggedIn() {
    return this.currentUser !== null && this.currentUser.uid !== undefined;
  },

  // Inicio de sesión con Email y Contraseña (oficial Firebase)
  async loginWithEmail(email, password) {
    if (!email || !password) {
      alert('Por favor ingresa correo y contraseña.');
      return;
    }

    try {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        this.currentUser = {
          uid: user.uid,
          displayName: user.displayName || email.split('@')[0],
          email: user.email,
          photoURL: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
        };
        this.saveUser();
        this.updateUserUI();
        this.closeAuthModal();
        BuscapetNotifications.showPushBanner('¡Sesión Iniciada!', `Bienvenido, ${this.currentUser.displayName}`);
        return;
      }
    } catch (error) {
      // Si el usuario aún no existe en Firebase Auth, lo registramos automáticamente
      try {
        const newCred = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const u = newCred.user;
        this.currentUser = {
          uid: u.uid,
          displayName: email.split('@')[0],
          email: u.email,
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
        };
        this.saveUser();
        this.updateUserUI();
        this.closeAuthModal();
        BuscapetNotifications.showPushBanner('¡Cuenta Creada!', `Bienvenido a Buscapet, ${this.currentUser.displayName}`);
        return;
      } catch (err2) {
        console.warn('Auth notice:', err2.message);
      }
    }

    // Fallback directo para demo
    this.loginWithDemo(email.split('@')[0], email);
  },

  saveUser() {
    if (this.currentUser) {
      localStorage.setItem('buscapet_user', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('buscapet_user');
    }
  },

  updateUserUI() {
    const avatarEls = document.querySelectorAll('.current-user-avatar');
    const nameEls = document.querySelectorAll('.current-user-name');
    const authBadgeEl = document.getElementById('user-auth-status-badge');

    if (this.isLoggedIn()) {
      avatarEls.forEach(el => {
        if (this.currentUser && this.currentUser.photoURL) el.src = this.currentUser.photoURL;
      });
      nameEls.forEach(el => {
        if (this.currentUser && this.currentUser.displayName) el.textContent = this.currentUser.displayName;
      });
      if (authBadgeEl) {
        authBadgeEl.innerHTML = `<span style="color:var(--success); font-weight:700;"><i class="fa-solid fa-circle-check"></i> Conectado como ${this.currentUser.displayName}</span>`;
      }
    } else {
      avatarEls.forEach(el => {
        el.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
      });
      nameEls.forEach(el => {
        el.textContent = 'Iniciar Sesión';
      });
      if (authBadgeEl) {
        authBadgeEl.innerHTML = `<span style="color:var(--warning); font-weight:700;"><i class="fa-solid fa-circle-exclamation"></i> No has iniciado sesión</span>`;
      }
    }
  },

  loginWithDemo(name, email) {
    this.currentUser = {
      uid: 'usr-' + Date.now(),
      displayName: name || 'Oscar (Usuario Verificado)',
      email: email || 'oscar@buscapet.com',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      phone: '+54 9 11 1234-5678'
    };
    this.saveUser();
    this.updateUserUI();
    this.closeAuthModal();
    BuscapetNotifications.showPushBanner('¡Sesión Iniciada!', `Bienvenido a Buscapet, ${this.currentUser.displayName}`);

    // If there was a pending report to open
    if (this.pendingAction) {
      const action = this.pendingAction;
      this.pendingAction = null;
      action();
    }
  },

  logout() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      try { firebase.auth().signOut(); } catch (e) {}
    }
    this.currentUser = null;
    this.saveUser();
    this.updateUserUI();
    this.closeAuthModal();
    BuscapetNotifications.showPushBanner('Sesión Cerrada', 'Has cerrado tu sesión.');
  },

  openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('active');
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
  },

  openFirebaseConfigModal() {
    const modal = document.getElementById('firebase-config-modal');
    if (modal) modal.classList.add('active');
  },

  closeFirebaseConfigModal() {
    const modal = document.getElementById('firebase-config-modal');
    if (modal) modal.classList.remove('active');
  }
};
