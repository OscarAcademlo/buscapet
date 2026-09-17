// ==========================================================================
// BUSCAPET - DIRECT MESSAGING & RINGTONE ALERTS (LOCALSTORAGE + WEB AUDIO)
// ==========================================================================

var BuscapetChat = window.BuscapetChat = {
  activeChat: null,
  chats: [],

  audioCtx: null,

  init() {
    let stored = null;
    try {
      if (window.SafeStorage) stored = window.SafeStorage.getItem('buscapet_chats');
    } catch(e) {}

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Filtrar y eliminar cualquier mensaje demo inexistente heredado (chat-1 y chat-2)
        if (Array.isArray(parsed)) {
          this.chats = parsed.filter(c => c.id !== 'chat-1' && c.id !== 'chat-2');
        } else {
          this.chats = [];
        }
      } catch (e) {
        this.chats = [];
      }
    } else {
      this.chats = [];
    }

    this.save();
    this.updateBadge();
    this.updatePushUI();

    // Sincronización en tiempo real entre pestañas
    window.addEventListener('storage', (e) => {
      if (e.key === 'buscapet_chats') {
        this.loadFromStorage();
      }
    });

    // Cerrar al hacer clic en el backdrop oscuro
    const modal = document.getElementById('chat-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeChatModal();
        }
      });
    }

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const m = document.getElementById('chat-modal');
        if (m && m.classList.contains('show')) {
          this.closeChatModal();
        }
      }
    });
  },

  loadFromStorage() {
    try {
      if (window.SafeStorage) {
        const stored = window.SafeStorage.getItem('buscapet_chats');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            this.chats = parsed.filter(c => c.id !== 'chat-1' && c.id !== 'chat-2');
            this.updateBadge();
            if (this.activeChat) {
              const found = this.chats.find(c => c.id === this.activeChat.id);
              if (found) {
                this.activeChat = found;
                this.renderActiveConversation();
              }
            }
            this.renderChatList();
          }
        }
      }
    } catch(e) {}
  },

  save() {
    try {
      if (window.SafeStorage) window.SafeStorage.setItem('buscapet_chats', JSON.stringify(this.chats));
    } catch(e) {}
    this.updateBadge();
  },

  updateBadge() {
    const desktopBadge = document.getElementById('nav-chat-badge');
    const mobileBadge = document.getElementById('bottom-nav-chat-badge');

    // Contar sólo mensajes reales no leídos (o chats si los hay)
    let count = 0;
    this.chats.forEach(c => {
      if (c.unreadCount) count += c.unreadCount;
    });

    const display = count > 0 ? 'inline-block' : 'none';
    const text = count > 0 ? count : '';

    if (desktopBadge) {
      desktopBadge.textContent = text;
      desktopBadge.style.display = display;
    }
    if (mobileBadge) {
      mobileBadge.textContent = text;
      mobileBadge.style.display = display;
    }
  },

  requestPushPermission() {
    if (!('Notification' in window)) {
      if (window.buscapetToast) window.buscapetToast('Tu navegador no soporta notificaciones push.', 'warning');
      else alert('Tu navegador no soporta notificaciones push.');
      return;
    }

    Notification.requestPermission().then(permission => {
      this.updatePushUI();
      if (permission === 'granted') {
        if (window.buscapetToast) {
          window.buscapetToast('🔔 ¡Notificaciones push activadas correctamente!', 'success');
        }
        this.sendPushNotification(
          '🐾 Notificaciones Buscapet Activas',
          'Recibirás alertas instantáneas cuando recibas un mensaje de otro usuario.',
          'favicon.png'
        );
      } else if (permission === 'denied') {
        if (window.buscapetToast) {
          window.buscapetToast('Las notificaciones fueron bloqueadas en tu navegador.', 'info');
        }
      }
    });
  },

  updatePushUI() {
    const btn = document.getElementById('btn-chat-push-toggle');
    if (!btn) return;

    if (!('Notification' in window)) {
      btn.style.display = 'none';
      return;
    }

    if (Notification.permission === 'granted') {
      btn.innerHTML = '<i class="bi bi-bell-fill"></i> Push Activadas';
      btn.style.background = 'rgba(34,197,94,.15)';
      btn.style.borderColor = 'rgba(34,197,94,.4)';
      btn.style.color = '#22C55E';
    } else {
      btn.innerHTML = '<i class="bi bi-bell"></i> Activar Notificaciones Push';
      btn.style.background = 'rgba(255,107,0,.1)';
      btn.style.borderColor = 'rgba(255,107,0,.3)';
      btn.style.color = 'var(--primary)';
    }
  },

  sendPushNotification(title, message, iconUrl) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: message,
          icon: iconUrl || 'favicon.png',
          badge: 'favicon.png'
        });
        notif.onclick = () => {
          window.focus();
          this.openChatList();
        };
      } catch (e) {
        console.warn('Native push notification error:', e);
      }
    }
    // Disparar sonido y vibración
    this.playRingtone();
  },

  playRingtone() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Bell chime 1 (High tone)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Bell chime 2 (Harmony)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1760, now + 0.12);
      gain2.gain.setValueAtTime(0.2, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);

      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  },

  openDirectChat(petId, userName, petName, userAvatar) {
    // 1. Resolver datos automáticamente si sólo se pasó el petId o faltan campos
    if (!userName || !petName) {
      if (window.BuscapetFeed && Array.isArray(window.BuscapetFeed.posts)) {
        const found = window.BuscapetFeed.posts.find(p => p.id === petId);
        if (found) {
          userName = userName || (found.user && found.user.name);
          petName = petName || found.petName;
          userAvatar = userAvatar || (found.user && found.user.avatar);
        }
      }
      if ((!userName || !petName) && window.BuscapetAds && Array.isArray(window.BuscapetAds.activeAds)) {
        const foundAd = window.BuscapetAds.activeAds.find(a => a.id === petId);
        if (foundAd) {
          userName = userName || foundAd.businessName;
          petName = petName || 'Consulta Comercial';
          userAvatar = userAvatar || foundAd.bannerUrl;
        }
      }
      // Demos conocidos como fallback
      if (petId === 'post-1') {
        userName = userName || 'Nicolás Rossi';
        petName = petName || 'Milo';
        userAvatar = userAvatar || 'img/posts/demo/avatar_nicolas.jpg';
      } else if (petId === 'post-2') {
        userName = userName || 'Martín Gómez';
        petName = petName || 'Gatita rescatada';
        userAvatar = userAvatar || 'img/posts/demo/avatar_martin.jpg';
      } else if (petId === 'post-3') {
        userName = userName || 'Valentina Díaz';
        petName = petName || 'Luna';
        userAvatar = userAvatar || 'img/posts/demo/avatar_valentina.jpg';
      } else if (petId === 'post-4') {
        userName = userName || 'Federico Álvarez';
        petName = petName || 'Pastor Alemán';
        userAvatar = userAvatar || 'img/posts/demo/avatar_federico.jpg';
      } else if (petId === 'ad-1') {
        userName = userName || 'Veterinaria & Urgencias 24h San Roque';
        petName = petName || 'Consulta Veterinaria';
        userAvatar = userAvatar || 'img/posts/demo/ad_vet.jpg';
      } else if (petId === 'ad-2') {
        userName = userName || 'Pet Shop & Boutique Huellitas Felices';
        petName = petName || 'Consulta Pet Shop';
        userAvatar = userAvatar || 'img/posts/demo/ad_petshop.jpg';
      }
    }

    userName = userName || 'Usuario de Buscapet';
    petName = petName || 'Mascota';
    userAvatar = userAvatar || 'img/posts/demo/avatar_nicolas.jpg';

    let chat = this.chats.find(c => (petId && c.petId === petId) || c.userName === userName);
    if (!chat) {
      chat = {
        id: 'chat-' + (petId ? petId : Date.now()),
        petId: petId || null,
        userName: userName,
        userAvatar: userAvatar,
        petName: petName,
        unreadCount: 0,
        messages: []
      };
      this.chats.unshift(chat);
      this.save();
    } else {
      chat.petName = petName;
      if (userAvatar) chat.userAvatar = userAvatar;
    }

    chat.unreadCount = 0;
    this.activeChat = chat;
    this.save();
    this.showChatModal();
  },

  openChatList() {
    if (this.chats.length > 0 && !this.activeChat) {
      this.activeChat = this.chats[0];
    }
    this.showChatModal();
  },

  showChatModal() {
    const modal = document.getElementById('chat-modal');
    if (!modal) return;

    this.renderChatList();
    this.renderActiveConversation();
    this.updatePushUI();

    const dialog = modal.querySelector('.chat-dialog');
    const backBtn = document.getElementById('chat-mobile-back-btn');

    if (dialog) {
      if (this.activeChat) {
        dialog.classList.remove('in-inbox');
        dialog.classList.add('in-conversation');
        if (backBtn && window.innerWidth <= 600) backBtn.style.display = 'inline-flex';
      } else {
        dialog.classList.remove('in-conversation');
        dialog.classList.add('in-inbox');
        if (backBtn) backBtn.style.display = 'none';
      }
    }

    modal.classList.add('show');
    if (modal.style && modal.style.setProperty) {
      modal.style.setProperty('display', 'flex', 'important');
    } else if (modal.style) {
      modal.style.display = 'flex';
    }
    document.body.classList.add('modal-open');
  },

  closeChatModal() {
    const modal = document.getElementById('chat-modal');
    if (modal) {
      modal.classList.remove('show');
      if (modal.style && modal.style.setProperty) {
        modal.style.setProperty('display', 'none', 'important');
      } else if (modal.style) {
        modal.style.display = 'none';
      }
      document.body.classList.remove('modal-open');
    }
  },

  backToInbox() {
    this.activeChat = null;
    const modal = document.getElementById('chat-modal');
    const dialog = modal ? modal.querySelector('.chat-dialog') : null;
    const backBtn = document.getElementById('chat-mobile-back-btn');
    if (dialog) {
      dialog.classList.remove('in-conversation');
      dialog.classList.add('in-inbox');
    }
    if (backBtn) backBtn.style.display = 'none';
    this.renderChatList();
    this.renderActiveConversation();
  },

  renderChatList() {
    const listContainer = document.getElementById('chat-inbox-list');
    if (!listContainer) return;

    if (this.chats.length === 0) {
      listContainer.innerHTML = `
        <div style="padding:40px 16px;text-align:center;color:var(--text-muted);font-size:12px;">
          <div style="font-size:28px;margin-bottom:6px;">💬</div>
          <strong style="color:var(--text-main);font-size:12.5px;">Bandeja vacía</strong>
          <div style="font-size:11px;margin-top:4px;line-height:1.4;">
            No tenés mensajes aún. Al comunicarte desde un aviso de mascota o publicidad, tus conversaciones reales aparecerán acá.
          </div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = this.chats.map(c => {
      const isActive = this.activeChat && this.activeChat.id === c.id;
      const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].text : 'Sin mensajes aún';
      const unreadBadge = (c.unreadCount && c.unreadCount > 0)
        ? `<span style="background:var(--primary);color:#fff;font-size:9.5px;font-weight:800;border-radius:10px;padding:1px 6px;margin-left:auto;">${c.unreadCount}</span>`
        : '';

      return `
        <div class="chat-inbox-item ${isActive ? 'active' : ''}" onclick="BuscapetChat.selectChat('${c.id}')">
          <img src="${c.userAvatar}" class="chat-inbox-avatar" alt="${c.userName}">
          <div class="chat-inbox-info" style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;justify-content:space-between;">
              <span class="chat-inbox-name">${c.userName}</span>
              ${unreadBadge}
            </div>
            <div class="chat-inbox-preview">${c.petName}: ${lastMsg}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  selectChat(chatId) {
    const found = this.chats.find(c => c.id === chatId);
    if (found) {
      found.unreadCount = 0;
      this.activeChat = found;
      this.save();

      const modal = document.getElementById('chat-modal');
      const dialog = modal ? modal.querySelector('.chat-dialog') : null;
      const backBtn = document.getElementById('chat-mobile-back-btn');
      if (dialog) {
        dialog.classList.remove('in-inbox');
        dialog.classList.add('in-conversation');
      }
      if (backBtn && window.innerWidth <= 600) {
        backBtn.style.display = 'inline-flex';
      }

      this.renderChatList();
      this.renderActiveConversation();
    }
  },

  renderActiveConversation() {
    const headerTitle = document.getElementById('chat-active-title');
    const headerSub = document.getElementById('chat-active-sub');
    const headerAvatar = document.getElementById('chat-active-avatar');
    const messagesBox = document.getElementById('chat-messages-box');

    if (!this.activeChat) {
      if (headerTitle) headerTitle.textContent = 'Mensajes Directos';
      if (headerSub) headerSub.textContent = 'Bandeja de entrada';
      if (headerAvatar) headerAvatar.src = 'img/posts/demo/avatar_nicolas.jpg';
      if (messagesBox) messagesBox.innerHTML = `
        <div style="padding:50px 20px;text-align:center;color:var(--text-muted);font-size:13px;">
          <div style="font-size:32px;margin-bottom:8px;">💬</div>
          <div style="font-weight:700;color:var(--text-main);">Sin conversación seleccionada</div>
          <div style="font-size:11.5px;margin-top:4px;">Iniciá un chat desde cualquier aviso de mascota para comunicarte de forma directa y segura.</div>
        </div>
      `;
      return;
    }

    if (headerTitle) headerTitle.textContent = this.activeChat.userName;
    if (headerSub) headerSub.textContent = `🐾 ${this.activeChat.petName}`;
    if (headerAvatar) headerAvatar.src = this.activeChat.userAvatar;

    if (messagesBox) {
      if (!this.activeChat.messages || this.activeChat.messages.length === 0) {
        messagesBox.innerHTML = `
          <div style="padding:40px 20px;text-align:center;color:var(--text-muted);font-size:12px;">
            <div style="font-size:24px;margin-bottom:6px;">🐾</div>
            <div>Iniciaste contacto por <strong>${this.activeChat.petName}</strong> con <strong>${this.activeChat.userName}</strong>.</div>
            <div style="font-size:11px;margin-top:6px;color:var(--text-sub);">Escribí tu mensaje abajo para comunicarte directamente.</div>
          </div>
        `;
      } else {
        messagesBox.innerHTML = this.activeChat.messages.map(m => `
          <div class="chat-bubble ${m.sender}">
            <div class="chat-bubble-text">${m.text}</div>
            <div class="chat-bubble-time">${m.time}</div>
          </div>
        `).join('');
      }
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }
  },

  sendMessage() {
    const input = document.getElementById('chat-input-field');
    if (!input || !input.value.trim() || !this.activeChat) return;

    const text = input.value.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!this.activeChat.messages) this.activeChat.messages = [];
    this.activeChat.messages.push({
      sender: 'outgoing',
      text: text,
      time: time
    });

    input.value = '';
    this.save();
    this.renderActiveConversation();
    this.renderChatList();

    const messagesBox = document.getElementById('chat-messages-box');
    if (messagesBox) messagesBox.scrollTop = messagesBox.scrollHeight;

    // Simulación de respuesta interactiva en tiempo real tras 1.2 segundos
    const currentChat = this.activeChat;
    setTimeout(() => {
      const targetChat = this.chats.find(c => c.id === currentChat.id);
      if (!targetChat) return;

      let replyText = '';
      const pName = (targetChat.petName || '').toLowerCase();
      const uName = (targetChat.userName || '').toLowerCase();

      if (targetChat.petId === 'post-1' || pName.includes('milo')) {
        replyText = '¡Hola! Muchas gracias por avisarme. ¿Por qué zona de Belgrano lo viste a Milo? Mi familia está muy atenta buscándolo.';
      } else if (targetChat.petId === 'post-2' || pName.includes('gatita')) {
        replyText = '¡Hola! Sigue con nosotros en tránsito en Palermo, está muy bien y mimosa. ¿Estás interesado en adoptarla o creés que es de algún conocido?';
      } else if (targetChat.petId === 'post-3' || pName.includes('luna')) {
        replyText = '¡Hola! Gracias por comunicarte. Luna se perdió cerca de Plaza Francia. ¿Tenés alguna foto reciente o viste en qué dirección se fue?';
      } else if (targetChat.petId === 'post-4' || pName.includes('pastor')) {
        replyText = '¡Hola! El perrito continúa en guarda temporal. Si te interesa la adopción responsable, podemos coordinar una visita.';
      } else if (targetChat.petId === 'ad-1' || uName.includes('veterinaria') || uName.includes('san roque')) {
        replyText = '¡Hola! Gracias por escribir a Veterinaria & Urgencias San Roque. Tenemos guardia médica las 24 hs. ¿En qué podemos ayudarte con tu mascota?';
      } else if (targetChat.petId === 'ad-2' || uName.includes('pet shop') || uName.includes('huellitas')) {
        replyText = '¡Hola! Gracias por comunicarte con Huellitas Felices. Tenemos envíos sin cargo en el día. ¿Qué alimento o accesorio estás buscando?';
      } else {
        replyText = `¡Hola! Muchas gracias por tu mensaje sobre ${targetChat.petName}. En breve te responderé por acá o coordinamos por WhatsApp.`;
      }

      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      targetChat.messages.push({
        sender: 'incoming',
        text: replyText,
        time: replyTime
      });

      const modal = document.getElementById('chat-modal');
      const isChatVisible = modal && modal.classList.contains('show') && this.activeChat && this.activeChat.id === targetChat.id;

      if (!isChatVisible) {
        targetChat.unreadCount = (targetChat.unreadCount || 0) + 1;
      }

      this.save();
      this.playRingtone();
      this.sendPushNotification(targetChat.userName, replyText, targetChat.userAvatar);

      if (isChatVisible) {
        this.renderActiveConversation();
      }
      this.renderChatList();
    }, 1200);
  }
};
