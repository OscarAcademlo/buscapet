// =============================================================================
// WIDGET: SponsoredAdCard — Tarjeta de Publicación Patrocinada en el Feed
// =============================================================================

import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import '../theme.dart';
import '../models/sponsored_ad.dart';

class SponsoredAdCard extends StatelessWidget {
  final SponsoredAd ad;

  const SponsoredAdCard({super.key, required this.ad});

  void _openWhatsApp(BuildContext context) async {
    final cleanPhone = ad.whatsapp.replaceAll(RegExp(r'[^\d+]'), '');
    final uri = Uri.parse('https://wa.me/$cleanPhone?text=${Uri.encodeComponent('Hola! Vi su anuncio en Buscapet sobre ${ad.businessName} y me gustaría consultar información.')}');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        await launchUrl(uri);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('📱 WhatsApp: ${ad.whatsapp}'),
            backgroundColor: BuscapetTheme.success,
          ),
        );
      }
    }
  }

  void _openWebsite(BuildContext context) async {
    if (ad.website.trim().isEmpty) return;
    String url = ad.website.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://$url';
    }
    final uri = Uri.parse(url);
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
  }

  void _showFullscreenImage(BuildContext context, String imageUrl) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.black.withValues(alpha: 0.92),
        insetPadding: const EdgeInsets.all(12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Stack(
          alignment: Alignment.topRight,
          children: [
            Center(
              child: InteractiveViewer(
                minScale: 0.5,
                maxScale: 4.0,
                child: CachedNetworkImage(
                  imageUrl: imageUrl,
                  fit: BoxFit.contain,
                  placeholder: (_, __) => const Center(
                    child: CircularProgressIndicator(color: BuscapetTheme.warning),
                  ),
                  errorWidget: (_, __, ___) => const Center(
                    child: Icon(Icons.broken_image_rounded, color: Colors.white70, size: 48),
                  ),
                ),
              ),
            ),
            Positioned(
              top: 10,
              right: 10,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white, size: 24),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: BuscapetTheme.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: const Color(0xFFF59E0B).withValues(alpha: 0.45),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFF59E0B).withValues(alpha: 0.08),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner superior de anuncio patrocinado
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
            decoration: BoxDecoration(
              color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
              border: const Border(
                bottom: BorderSide(color: Color(0xFFF59E0B), width: 1.2),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.stars_rounded, size: 15, color: Color(0xFFF59E0B)),
                const SizedBox(width: 6),
                const Text(
                  'PUBLICIDAD PATROCINADA',
                  style: TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.6,
                    color: Color(0xFFF59E0B),
                  ),
                ),
                const Spacer(),
                if (ad.city.isNotEmpty)
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.place_rounded, size: 12, color: BuscapetTheme.textMuted),
                      const SizedBox(width: 3),
                      Text(
                        ad.city,
                        style: const TextStyle(fontSize: 10.5, color: BuscapetTheme.textMuted, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
              ],
            ),
          ),

          // Header del Anunciante
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
            child: Row(
              children: [
                // Logo o Inicial del Negocio
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                    ),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Center(
                    child: Icon(Icons.storefront_rounded, color: Colors.white, size: 22),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        ad.businessName,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: BuscapetTheme.textMain,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: BuscapetTheme.bgInput,
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: BuscapetTheme.border),
                            ),
                            child: Text(
                              ad.category,
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: BuscapetTheme.primary,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'Verificado ✔',
                            style: TextStyle(fontSize: 10, color: BuscapetTheme.success, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.share_outlined, size: 18, color: BuscapetTheme.textMuted),
                  tooltip: 'Compartir anuncio',
                  onPressed: () {
                    Share.share('Mirá este servicio recomendado en Buscapet: ${ad.businessName} - ${ad.description}');
                  },
                ),
              ],
            ),
          ),

          // Texto promocional
          if (ad.description.isNotEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
              child: Text(
                ad.description,
                style: const TextStyle(
                  fontSize: 13,
                  color: BuscapetTheme.textLight,
                  height: 1.4,
                ),
              ),
            ),

          // Imagen / Banner opcional
          if (ad.photoUrl != null && ad.photoUrl!.isNotEmpty) ...[
            const SizedBox(height: 8),
            GestureDetector(
              onTap: () => _showFullscreenImage(context, ad.photoUrl!),
              child: ClipRRect(
                child: AspectRatio(
                  aspectRatio: 16 / 9,
                  child: CachedNetworkImage(
                    imageUrl: ad.photoUrl!,
                    fit: BoxFit.cover,
                    placeholder: (_, __) => Container(
                      color: BuscapetTheme.bgInput,
                      child: const Center(
                        child: CircularProgressIndicator(color: Color(0xFFF59E0B), strokeWidth: 2),
                      ),
                    ),
                    errorWidget: (_, __, ___) => Container(
                      color: BuscapetTheme.bgInput,
                      child: const Center(
                        child: Icon(Icons.broken_image_rounded, color: BuscapetTheme.textMuted),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],

          const SizedBox(height: 10),

          // Botones de acción directa (WhatsApp, Web, Contacto)
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            child: Row(
              children: [
                // Botón WhatsApp
                if (ad.whatsapp.isNotEmpty)
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _openWhatsApp(context),
                      icon: const Icon(Icons.chat_rounded, size: 16, color: Colors.white),
                      label: const Text(
                        'WhatsApp',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Colors.white),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF25D366),
                        padding: const EdgeInsets.symmetric(vertical: 9),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
                if (ad.whatsapp.isNotEmpty && ad.website.isNotEmpty)
                  const SizedBox(width: 8),

                // Botón Sitio Web / Instagram
                if (ad.website.isNotEmpty)
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _openWebsite(context),
                      icon: const Icon(Icons.public_rounded, size: 16, color: BuscapetTheme.primary),
                      label: const Text(
                        'Sitio Web',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: BuscapetTheme.primary),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: BuscapetTheme.primary),
                        padding: const EdgeInsets.symmetric(vertical: 9),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
