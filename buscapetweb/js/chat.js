// ==========================================================================
// BUSCAPET - DIRECT MESSAGING & RINGTONE ALERTS (LOCALSTORAGE + WEB AUDIO)
// ==========================================================================

var BuscapetChat = window.BuscapetChat = {
  activeChat: null,
  chats: [
    {
      id: 'chat-1',
      petId: 'pet-1',
      userName: 'Nicolás Rossi',
      userAvatar: 'img/posts/demo/avatar_nicolas.jpg',
      petName: 'Milo (Golden Retriever)',
      messages: [
        { sender: 'incoming', text: '¡Hola! Gracias por comunicarte por Milo. ¿Lo viste cerca de Parque Centenario?', time: '10:45 AM' },
        { sender: 'outgoing', text: 'Hola Nicolás, sí, vi a un perrito muy similar hace unos 40 minutos cruzando hacia Díaz Vélez.', time: '10:48 AM' },
        { sender: 'incoming', text: '¡Por favor! ¿Tenía collar azul? Estoy yendo para allá ahora mismo.', time: '10:50 AM' }
      ]
    },
    {
      id: 'chat-2',
      petId: 'pet-2',
      userName: 'Martín Gómez',
      userAvatar: 'img/posts/demo/avatar_martin.jpg',
      petName: 'Gatita encontrada',
      messages: [
        { sender: 'incoming', text: 'Hola, tengo a la gatita en tránsito en mi departamento. ¿Crees que es la tuya?', time: '09:15 AM' }
      ]
    }
  ],

  audioCtx: null,

  init() {
    const stored = localStorage.getItem('buscapet_chats');
    if (stored) {
      try { this.chats = JSON.parse(stored); } catch (e) {}
    }
    this.updateBadge();
  },

  save() {
    localStorage.setItem('buscapet_chats', JSON.stringify(this.chats));
    this.updateBadge();
  },

  updateBadge() {
    const badge = document.getElementById('nav-chat-badge');
    if (badge) {
      const count = this.chats.length;
      badge.textContent = count > 0 ? count : '';
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
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
        messages: [
          { sender: 'incoming', text: `¡Hola! Gracias por comunicarte por ${petName || 'la mascota'}. ¿En qué podemos coordinar?`, time: 'Ahora' }
        ]
      };
      this.chats.unshift(chat);
      this.save();
    }

    this.activeChat = chat;
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
      listContainer.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:12px;">No tienes conversaciones aún.</div>';
      return;
    }

    listContainer.innerHTML = this.chats.map(c => {
      const isActive = this.activeChat && this.activeChat.id === c.id;
      const lastMsg = c.messages.length > 0 ? c.messages[c.messages.length - 1].text : '';
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
      this.activeChat = found;
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
      if (headerTitle) headerTitle.textContent = 'Mensajes';
      if (headerSub) headerSub.textContent = 'Selecciona una conversación';
      if (messagesBox) messagesBox.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:13px;">Selecciona una conversación para leer y responder.</div>';
      return;
    }

    if (headerTitle) headerTitle.textContent = this.activeChat.userName;
    if (headerSub) headerSub.textContent = `🐾 ${this.activeChat.petName}`;
    if (headerAvatar) headerAvatar.src = this.activeChat.userAvatar;

    if (messagesBox) {
      messagesBox.innerHTML = this.activeChat.messages.map(m => `
        <div class="chat-bubble ${m.sender}">
          <div class="chat-bubble-text">${m.text}</div>
          <div class="chat-bubble-time">${m.time}</div>
        </div>
      `).join('');
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }
  },

  sendMessage() {
    const input = document.getElementById('chat-input-field');
    if (!input || !input.value.trim() || !this.activeChat) return;

    const text = input.value.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.activeChat.messages.push({
      sender: 'outgoing',
      text: text,
      time: time
    });

    input.value = '';
    this.save();
    this.renderActiveConversation();
    this.renderChatList();

    // Auto-reply simulation for testing
    setTimeout(() => {
      if (this.activeChat) {
        this.activeChat.messages.push({
          sender: 'incoming',
          text: '¡Entendido! Muchas gracias por el aviso, te mantengo al tanto.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        this.save();
        this.renderActiveConversation();
        this.renderChatList();
        this.playRingtone();
      }
    }, 1500);
  }
};
