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
    let chat = this.chats.find(c => c.userName === userName || (c.petId === petId && petId));
    if (!chat) {
      chat = {
        id: 'chat-' + Date.now(),
        petId: petId,
        userName: userName || 'Usuario de Buscapet',
        userAvatar: userAvatar || 'img/posts/demo/avatar_nicolas.jpg',
        petName: petName || 'Mascota',
        unreadCount: 0,
        messages: []
      };
      this.chats.unshift(chat);
      this.save();
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

    modal.classList.add('show');
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
  },

  closeChatModal() {
    const modal = document.getElementById('chat-modal');
    if (modal) {
      modal.classList.remove('show');
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
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
            No tenés mensajes aún. Cuando te comuniques por una mascota o alguien te escriba, tus conversaciones reales aparecerán acá.
          </div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = this.chats.map(c => {
      const isActive = this.activeChat && this.activeChat.id === c.id;
      const lastMsg = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1].text : 'Sin mensajes aún';
      return `
        <div class="chat-inbox-item ${isActive ? 'active' : ''}" onclick="BuscapetChat.selectChat('${c.id}')">
          <img src="${c.userAvatar}" class="chat-inbox-avatar" alt="${c.userName}">
          <div class="chat-inbox-info">
            <div class="chat-inbox-name">${c.userName}</div>
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
            <div style="font-size:11px;margin-top:6px;color:var(--text-sub);">Escribí tu mensaje abajo para coordinar directamente.</div>
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
  }
};
