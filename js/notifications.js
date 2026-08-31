// ==========================================================================
// BUSCAPET - NOTIFICATIONS & PUSH CONTROLLER
// ==========================================================================

var BuscapetNotifications = window.BuscapetNotifications = {
  permissionGranted: false,

  init() {
    if ('Notification' in window && Notification.permission === 'granted') {
      this.permissionGranted = true;
    }
  },

  requestWebPushPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.permissionGranted = true;
          this.showPushBanner(
            '¡Notificaciones activadas!',
            'Recibirás alertas instantáneas cuando alguien reporte o comente sobre una mascota.',
            'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80'
          );
        }
      });
    }
  },

  showPushBanner(title, message, iconUrl) {
    const banner = document.getElementById('push-notif-banner');
    const titleEl = document.getElementById('push-notif-title');
    const msgEl = document.getElementById('push-notif-msg');
    const iconEl = document.getElementById('push-notif-icon-img');

    if (!banner) return;

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (iconEl && iconUrl) iconEl.src = iconUrl;

    // Trigger ringtone sound
    if (window.BuscapetChat) {
      BuscapetChat.playRingtone();
    }

    // Smartphone container vibration effect
    const phoneContainer = document.querySelector('.smartphone-container');
    if (phoneContainer) {
      phoneContainer.classList.add('ringtone-active');
      setTimeout(() => phoneContainer.classList.remove('ringtone-active'), 1200);
    }

    banner.classList.add('show');

    // Also send actual browser notification if permitted
    if (this.permissionGranted && 'Notification' in window) {
      try {
        new Notification(title, {
          body: message,
          icon: iconUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80'
        });
      } catch (e) {}
    }

    // Auto hide after 5 seconds
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => {
      banner.classList.remove('show');
    }, 5000);
  },

  hideBanner() {
    const banner = document.getElementById('push-notif-banner');
    if (banner) banner.classList.remove('show');
  }
};
