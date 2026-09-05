// =============================================================================
// MODAL: DonationModal — Donar / Cafecito con Mercado Pago y PayPal
// =============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme.dart';
import '../services/mercadopago_service.dart';
import '../services/app_settings.dart';

class DonationModal extends StatelessWidget {
  const DonationModal({super.key});

  String get mpAlias => AppSettings().mpAlias;
  String get mpHolder => AppSettings().mpHolder;
  String get paypalEmail => AppSettings().paypalEmail;
  String get paypalLink => 'https://www.paypal.com/paypalme/oscarns';

  void _copyToClipboard(BuildContext context, String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Text('¡$label copiado al portapapeles! ($text)'),
          ],
        ),
        backgroundColor: BuscapetTheme.success,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _openMercadoPagoLink() async {
    await MercadoPagoService().createAndOpenCheckout(
      title: 'Donación Solidaria a Buscapet ☕🐾',
      price: 2000.0,
      description: 'Aporte voluntario para mantener los servidores y mapas de Buscapet',
      externalReference: 'donacion_${DateTime.now().millisecondsSinceEpoch}',
    );
  }

  void _openPayPal() async {
    final uri = Uri.parse(paypalLink);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(uri);
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >= 600;

    return Dialog(
      backgroundColor: BuscapetTheme.bgCard,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: Color(0xFFF59E0B), width: 1.5),
      ),
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: ConstrainedBox(
        constraints: BoxConstraints(
          maxWidth: isDesktop ? 480 : double.infinity,
          maxHeight: MediaQuery.of(context).size.height * 0.88,
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text('☕', style: TextStyle(fontSize: 24)),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Invitanos un Cafecito',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: BuscapetTheme.textMain,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Apoyar y Donar a Buscapet',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFFF59E0B),
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: BuscapetTheme.textMuted),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Mensaje Explicativo
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: BuscapetTheme.bgInput,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: BuscapetTheme.border),
                ),
                child: const Text(
                  '🐾 Buscapet es una plataforma 100% comunitaria, solidaria y gratuita. Tu donación nos ayuda a costear servidores, mapas en tiempo real y mantener el servicio online para que ninguna mascota quede sin volver a su hogar.',
                  style: TextStyle(
                    fontSize: 12,
                    color: BuscapetTheme.textLight,
                    height: 1.45,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // 🇦🇷 CAJA MERCADO PAGO / BANCO (ARGENTINA)
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: BuscapetTheme.bgInput,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF009EE3).withValues(alpha: 0.5)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.account_balance_rounded, size: 16, color: Color(0xFF009EE3)),
                        SizedBox(width: 6),
                        Text(
                          '🇦🇷 Argentina — Mercado Pago / Banco',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF009EE3),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Alias Mercado Pago / CVU:',
                              style: TextStyle(fontSize: 11, color: BuscapetTheme.textMuted),
                            ),
                            const SizedBox(height: 2),
                            SelectableText(
                              mpAlias,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: BuscapetTheme.textMain,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                        ElevatedButton.icon(
                          onPressed: () => _copyToClipboard(context, mpAlias, 'Alias'),
                          icon: const Icon(Icons.copy_rounded, size: 14),
                          label: const Text('Copiar'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF009EE3),
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Text(
                          'Titular: ',
                          style: TextStyle(fontSize: 11, color: BuscapetTheme.textMuted),
                        ),
                        Text(
                          mpHolder,
                          style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: BuscapetTheme.textMain),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _openMercadoPagoLink,
                        icon: const Icon(Icons.credit_card_rounded, size: 15, color: Colors.white),
                        label: const Text('Donar con Tarjeta / Mercado Pago (Link)'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF009EE3),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          textStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // 🌎 CAJA PAYPAL / INTERNACIONAL
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: BuscapetTheme.bgInput,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF0079C1).withValues(alpha: 0.5)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.public_rounded, size: 16, color: Color(0xFF0079C1)),
                        SizedBox(width: 6),
                        Text(
                          '🌎 Internacional — PayPal',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0079C1),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Email PayPal:',
                              style: TextStyle(fontSize: 11, color: BuscapetTheme.textMuted),
                            ),
                            const SizedBox(height: 2),
                            SelectableText(
                              paypalEmail,
                              style: const TextStyle(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w800,
                                color: BuscapetTheme.textMain,
                              ),
                            ),
                          ],
                        ),
                        OutlinedButton.icon(
                          onPressed: () => _copyToClipboard(context, paypalEmail, 'Email de PayPal'),
                          icon: const Icon(Icons.copy_rounded, size: 14, color: Color(0xFF0079C1)),
                          label: const Text('Copiar'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF0079C1),
                            side: const BorderSide(color: Color(0xFF0079C1)),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            textStyle: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _openPayPal,
                        icon: const Icon(Icons.open_in_new_rounded, size: 15, color: Colors.white),
                        label: const Text('Donar directo con PayPal.me'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0079C1),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          textStyle: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Botón Final Agradecimiento
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text(
                    '¡Muchas gracias por tu apoyo! ❤️',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: BuscapetTheme.textMuted,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
