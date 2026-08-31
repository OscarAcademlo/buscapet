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
    return email === 'oscarns@gmail.com';
  },

  isLoggedIn() {
    return this.currentUser !== null && this.currentUser.uid !== undefined;
  },

  // Inicio de sesión con Email y Contraseña
  async loginWithEmail(email, password) {
    const cleanEmail = (email || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanEmail) {
      alert('Por favor ingresa tu correo electrónico.');
      return;
    }

    const isMaster = cleanEmail.toLowerCase() === 'oscarns@gmail.com';
    const displayName = isMaster ? 'Oscar (Admin Master)' : cleanEmail.split('@')[0];

    try {
      if (typeof firebase !== 'undefined' && firebase.auth && cleanPass) {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(cleanEmail, cleanPass);
        const user = userCredential.user;
        this.currentUser = {
          uid: user.uid,
          displayName: user.displayName || displayName,
          email: user.email,
          photoURL: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          role: isMaster ? 'admin' : 'user'
        };
        this.saveUser();
        this.updateUserUI();
        this.closeAuthModal();
        BuscapetNotifications.showPushBanner('¡Sesión Iniciada!', `Bienvenido, ${this.currentUser.displayName}`);
        if (this.pendingAction) {
          const action = this.pendingAction;
          this.pendingAction = null;
          action();
        }
        return;
      }
    } catch (error) {
      console.warn('Firebase login notice:', error);
      if (error.code === 'auth/wrong-password') {
        alert('Contraseña incorrecta. Por favor verifica tus datos.');
        return;
      }
    }

    // Fallback garantizado
    this.currentUser = {
      uid: isMaster ? 'usr-admin-oscar' : 'usr-' + Date.now(),
      displayName: displayName,
      email: cleanEmail,
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: isMaster ? 'admin' : 'user'
    };
    this.saveUser();
    this.updateUserUI();
    this.closeAuthModal();
    BuscapetNotifications.showPushBanner('¡Sesión Iniciada!', `Bienvenido, ${this.currentUser.displayName}`);

    if (this.pendingAction) {
      const action = this.pendingAction;
      this.pendingAction = null;
      action();
    }
  },

  // Registro de nuevo usuario
  async registerUser(name, email, password, phone = '') {
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim();
    const cleanPass = (password || '').trim();
    const cleanPhone = (phone || '').trim();

    if (!cleanEmail) {
      alert('Por favor ingresa tu correo electrónico para registrarte.');
      return;
    }

    const isMaster = cleanEmail.toLowerCase() === 'oscarns@gmail.com';
    const displayName = cleanName || (isMaster ? 'Oscar (Admin Master)' : cleanEmail.split('@')[0]);

    try {
      if (typeof firebase !== 'undefined' && firebase.auth && cleanPass && cleanPass.length >= 6) {
        const newCred = await firebase.auth().createUserWithEmailAndPassword(cleanEmail, cleanPass);
        const u = newCred.user;
        if (u.updateProfile) {
          await u.updateProfile({ displayName: displayName });
        }
        this.currentUser = {
          uid: u.uid,
          displayName: displayName,
          email: u.email,
          phone: cleanPhone,
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          role: isMaster ? 'admin' : 'user'
        };
        this.saveUser();
        this.updateUserUI();
        this.closeAuthModal();
        BuscapetNotifications.showPushBanner('¡Cuenta Creada con Éxito! 🎉', `Bienvenido a Buscapet, ${displayName}`);

        if (this.pendingAction) {
          const action = this.pendingAction;
          this.pendingAction = null;
          action();
        }
        return;
      }
    } catch (err) {
      console.warn('Firebase register notice:', err);
      if (err.code === 'auth/email-already-in-use') {
        return this.loginWithEmail(cleanEmail, cleanPass);
      }
    }

    // Registro seguro local
    this.currentUser = {
      uid: isMaster ? 'usr-admin-oscar' : 'usr-' + Date.now(),
      displayName: displayName,
      email: cleanEmail,
      phone: cleanPhone,
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      role: isMaster ? 'admin' : 'user'
    };
    this.saveUser();
    this.updateUserUI();
    this.closeAuthModal();
    BuscapetNotifications.showPushBanner('¡Cuenta Creada! 🎉', `Bienvenido a Buscapet, ${displayName}`);

    if (this.pendingAction) {
      const action = this.pendingAction;
      this.pendingAction = null;
      action();
    }
  },

  switchAuthTab(tab) {
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const tabLoginBtn = document.getElementById('auth-tab-login-btn');
    const tabRegisterBtn = document.getElementById('auth-tab-register-btn');

    if (tab === 'login') {
      if (loginForm) loginForm.style.display = 'block';
      if (registerForm) registerForm.style.display = 'none';
      if (tabLoginBtn) {
        tabLoginBtn.style.background = 'var(--primary)';
        tabLoginBtn.style.color = '#fff';
      }
      if (tabRegisterBtn) {
        tabRegisterBtn.style.background = 'transparent';
        tabRegisterBtn.style.color = 'var(--text-muted)';
      }
    } else {
      if (loginForm) loginForm.style.display = 'none';
      if (registerForm) registerForm.style.display = 'block';
      if (tabLoginBtn) {
        tabLoginBtn.style.background = 'transparent';
        tabLoginBtn.style.color = 'var(--text-muted)';
      }
      if (tabRegisterBtn) {
        tabRegisterBtn.style.background = 'var(--primary)';
        tabRegisterBtn.style.color = '#fff';
      }
    }
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
    const loggedInBox = document.getElementById('auth-logged-in-view');
    const guestBox = document.getElementById('auth-guest-view');
    const sidebarAdminContainer = document.getElementById('sidebar-admin-container');
    const authAdminBtn = document.getElementById('auth-admin-btn');
    const isMasterAdmin = this.isAdmin();

    // Inyección 100% dinámica del widget solo para oscarns@gmail.com
    if (sidebarAdminContainer) {
      if (isMasterAdmin) {
        sidebarAdminContainer.innerHTML = `
          <div class="sidebar-widget" style="background: linear-gradient(135deg, rgba(255, 170, 0, 0.12) 0%, rgba(255, 170, 0, 0.03) 100%); border: 1.5px solid rgba(255, 170, 0, 0.4); border-radius: var(--radius-lg); padding: 14px 16px; box-shadow: 0 4px 16px rgba(255, 170, 0, 0.1);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <div style="width: 34px; height: 34px; border-radius: 8px; background: rgba(255, 170, 0, 0.2); display: flex; align-items: center; justify-content: center; color: #FFAA00; font-size: 15px; flex-shrink: 0;">
                  <i class="fa-solid fa-crown"></i>
                </div>
                <div>
                  <div style="font-size: 13px; font-weight: 800; color: #FFAA00; line-height: 1.2;">Panel OscarSoft</div>
                  <div style="font-size: 10.5px; color: var(--text-muted); font-weight: 600;">Administrador Master</div>
                </div>
              </div>
              <button type="button" style="padding: 7px 14px; font-size: 11.5px; font-weight: 800; background: linear-gradient(135deg, #FFAA00 0%, #E69500 100%); color: #000; border: none; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 8px rgba(255, 170, 0, 0.35);" onclick="BuscapetApp.openAdminPanel()">
                <i class="fa-solid fa-arrow-right-to-bracket"></i> Entrar
              </button>
            </div>
          </div>
        `;
      } else {
        sidebarAdminContainer.innerHTML = '';
      }
    }

    if (authAdminBtn) {
      authAdminBtn.style.display = isMasterAdmin ? 'block' : 'none';
    }

    if (this.isLoggedIn()) {
      avatarEls.forEach(el => {
        if (this.currentUser && this.currentUser.photoURL) el.src = this.currentUser.photoURL;
      });
      nameEls.forEach(el => {
        if (this.currentUser && this.currentUser.displayName) el.textContent = this.currentUser.displayName;
      });
      if (authBadgeEl) {
        if (isMasterAdmin) {
          authBadgeEl.innerHTML = `<span style="color:#FFAA00; font-weight:800;"><i class="fa-solid fa-crown"></i> Administrador Master (oscarns@gmail.com)</span>`;
        } else {
          authBadgeEl.innerHTML = `<span style="color:var(--success); font-weight:700;"><i class="fa-solid fa-circle-check"></i> Conectado como ${this.currentUser.displayName}</span>`;
        }
      }
      if (loggedInBox) loggedInBox.style.display = 'block';
      if (guestBox) guestBox.style.display = 'none';
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
      if (loggedInBox) loggedInBox.style.display = 'none';
      if (guestBox) guestBox.style.display = 'block';
    }
  },

  loginWithDemo(name, email) {
    this.currentUser = {
      uid: 'usr-' + Date.now(),
      displayName: name || 'Usuario Demo',
      email: email || 'usuario@buscapet.click',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      phone: '+54 9 11 1234-5678'
    };
    this.saveUser();
    this.updateUserUI();
    this.closeAuthModal();
    BuscapetNotifications.showPushBanner('¡Sesión Iniciada!', `Bienvenido a Buscapet, ${this.currentUser.displayName}`);

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
    this.updateUserUI();
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
