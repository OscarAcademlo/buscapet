// =============================================================================
// SERVICIO: MercadoPagoService — Checkout Pro Oficial de Mercado Pago (JavaScript)
// Credenciales oficiales de Producción
// =============================================================================

var MercadoPagoService = window.MercadoPagoService = {
  publicKey: 'APP_USR-0a741409-599f-434a-84ba-996c4eb0b958',
  accessToken: 'APP_USR-7254310245914481-090511-ea2d70cd02d87cc2e2a70c6833406a33-741894322',

  async createAndOpenCheckout({
    title,
    price,
    description = '',
    payerEmail = '',
    payerName = '',
    externalReference = ''
  }) {
    const loadingToast = window.buscapetToast ? window.buscapetToast('⏳ Conectando con Mercado Pago...', 'info') : null;

    try {
      const url = 'https://api.mercadopago.com/checkout/preferences';
      const body = {
        items: [
          {
            title: title,
            quantity: 1,
            currency_id: 'ARS',
            unit_price: Number(price),
            description: description || title
          }
        ],
        back_urls: {
          success: 'https://buscapet.click/?status=success',
          failure: 'https://buscapet.click/?status=failure',
          pending: 'https://buscapet.click/?status=pending'
        },
        auto_return: 'approved',
        statement_descriptor: 'BUSCAPET',
        external_reference: externalReference || ('buscapet_' + Date.now())
      };

      if (payerEmail || payerName) {
        body.payer = {};
        if (payerName) body.payer.name = payerName;
        if (payerEmail) body.payer.email = payerEmail;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        const initPoint = data.init_point;
        if (initPoint) {
          window.open(initPoint, '_blank');
          if (window.buscapetToast) window.buscapetToast('🚀 Pasarela de Mercado Pago abierta', 'success');
          return initPoint;
        }
      } else {
        const errorText = await response.text();
        console.warn('Respuesta de error de Mercado Pago:', errorText);
      }
    } catch (e) {
      console.warn('Excepción al crear preferencia en Mercado Pago:', e);
    }

    // En caso de bloqueo de red, abrir enlace de pago directo
    window.open('https://link.mercadopago.com.ar/', '_blank');
    return null;
  },

  openDonationCheckout(price = 2000) {
    return this.createAndOpenCheckout({
      title: 'Donación Solidaria a Buscapet ☕🐾',
      price: price,
      description: 'Aporte voluntario para mantener los servidores y mapas de Buscapet',
      externalReference: 'donacion_' + Date.now()
    });
  },

  openAdCheckout(businessName = 'Anunciante', price = 14000) {
    return this.createAndOpenCheckout({
      title: `Publicidad Buscapet (30 días) - ${businessName}`,
      price: price,
      description: `Anuncio patrocinado en Buscapet para ${businessName}`,
      externalReference: 'ad_' + Date.now()
    });
  }
};
