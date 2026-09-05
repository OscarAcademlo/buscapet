// ==========================================================================
// BUSCAPET - DIRECT MESSAGING & RINGTONE ALERTS CONTROLLER
// ==========================================================================

var BuscapetChat = window.BuscapetChat = {
  activeChat: null,
  chats: [
    {
      id: 'chat-usr-101',
      petId: 'pet-1',
      userName: 'Camila Rossi',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      petName: 'Milo (Golden Retriever)',
      messages: [
        { sender: 'incoming', text: '¡Hola! Gracias por comunicarte por Milo. ¿Lo viste cerca de Parque Centenario?', time: '10:45 AM' },
        { sender: 'outgoing', text: 'Hola Camila, sí, vi a un perrito muy similar hace unos 40 minutos cruzando hacia Díaz Vélez.', time: '10:48 AM' },
        { sender: 'incoming', text: '¡Por favor! ¿Tenía collar azul? Estoy yendo para allá ahora mismo.', time: '10:50 AM' }
      ]
    },
    {
      id: 'chat-usr-102',
      petId: 'pet-2',
      userName: 'Martín Gómez',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      petName: 'Gatita rescatada',
      messages: [
        { sender: 'incoming', text: 'Hola, tengo a la gatita en tránsito en mi depto en Palermo. ¿Crees que es la tuya?', time: '09:15 AM' }
      ]
    }
  ],

  audioCtx: null,

  init() {
    const stored = localStorage.getItem('buscapet_chats');
    if (stored) {
      try { this.chats = JSON.parse(stored); } catch (e) {}
    }
  },

  save() {
    localStorage.setItem('buscapet_chats', JSON.stringify(this.chats));
  },

  // Synthesizes a native smartphone notification ringtone using Web Audio API
  playRingtone() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Bell chime 1 (High tone)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15); // E6
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Bell chime 2 (Major third harmonic)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1760, now + 0.12); // A6
      gain2.gain.setValueAtTime(0.2, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.6);

      // Vibrate if supported on device
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 150]);
      }
    } catch (e) {
      console.warn('Audio tone play error:', e);
    }
  },

  openDirectChat(petId, userName, petName, userAvatar) {
    // Solo usuarios logueados pueden contactar
    if (!window.BuscapetFirebase || !BuscapetFirebase.isLoggedIn()) {
      alert('Debes iniciar sesión para contactar al dueño.');
      BuscapetFirebase.openAuthModal();
      return;
    }

    let chat = this.chats.find(c => c.userName === userName || c.petId === petId);
    if (!chat) {
      chat = {
        id: 'chat-' + Date.now(),
        petId: petId,
        userName: userName,
        userAvatar: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        petName: petName,
        messages: [
          { sender: 'incoming', text: `¡Hola! Me alegra que te contactes sobre ${petName}. ¿Tienes novedades o información?`, time: 'Ahora' }
        ]
      };
      this.chats.unshift(chat);
      this.save();
    }

    this.activeChat = chat;
    this.showChatWindow(chat);
  },

  showChatWindow(chat) {
    const modal = document.getElementById('chat-modal');
    const headerTitle = document.getElementById('chat-modal-title');
    const headerSub = document.getElementById('chat-modal-sub');
    const headerAvatar = document.getElementById('chat-modal-avatar');

    if (headerTitle) headerTitle.textContent = chat.userName;
    if (headerSub) headerSub.textContent = `Sobre: ${chat.petName}`;
    if (headerAvatar) headerAvatar.src = chat.userAvatar;

    this.renderMessages();
    if (modal) modal.classList.add('active');
  },

  renderMessages() {
    const container = document.getElementById('chat-messages-box');
    if (!container || !this.activeChat) return;

    container.innerHTML = this.activeChat.messages.map(m => `
      <div class="chat-bubble ${m.sender}">
        <div>${m.text}</div>
        <div class="chat-time">${m.time}</div>
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
  },

  sendMessage() {
    const input = document.getElementById('chat-message-input');
    if (!input || !input.value.trim() || !this.activeChat) return;

    const text = input.value.trim();
    input.value = '';

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.activeChat.messages.push({
      sender: 'outgoing',
      text: text,
      time: timeStr
    });

    this.save();
    this.renderMessages();

    // Trigger simulated instant response and push notification ringtone after 2 seconds
    setTimeout(() => {
      this.simulateIncomingResponse();
    }, 2200);
  },

  simulateIncomingResponse() {
    if (!this.activeChat) return;

    const replies = [
      "¡Muchas gracias! Ya salgo para ese punto exacto.",
      "¿Está con alguien o sigue solo en la calle?",
      "¡Qué alivio! Por favor si puedes retenerlo te lo agradecería con el alma.",
      "Te llamo al teléfono para coordinar el encuentro ya mismo."
    ];

    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.activeChat.messages.push({
      sender: 'incoming',
      text: randomReply,
      time: timeStr
    });

    this.save();
    this.renderMessages();

    // Trigger ringtone and visual push notification
    this.playRingtone();
    BuscapetNotifications.showPushBanner(
      `Nuevo mensaje de ${this.activeChat.userName}`,
      randomReply,
      this.activeChat.userAvatar
    );
  },

  closeChatModal() {
    const modal = document.getElementById('chat-modal');
    if (modal) modal.classList.remove('active');
  }
};
