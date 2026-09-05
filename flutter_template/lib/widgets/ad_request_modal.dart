// =============================================================================
// WIDGET: AdRequestModal — Publicar Anuncio con Mercado Pago ($14.000 ARS ~ 10 USD)
// =============================================================================

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../theme.dart';
import '../models/sponsored_ad.dart';
import '../services/firestore_service.dart';
import '../services/storage_service.dart';
import '../services/mercadopago_service.dart';

class AdRequestModal extends StatefulWidget {
  const AdRequestModal({super.key});

  @override
  State<AdRequestModal> createState() => _AdRequestModalState();
}

class _AdRequestModalState extends State<AdRequestModal> {
  final _firestore = FirestoreService();
  final _storage = StorageService();
  final _formKey = GlobalKey<FormState>();

  int _currentStep = 0; // 0 = Datos del Anuncio, 1 = Pago con Mercado Pago

  final _businessNameCtrl = TextEditingController();
  final _contactNameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _websiteCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _messageCtrl = TextEditingController();
  final _paymentRefCtrl = TextEditingController();

  String _category = 'Veterinaria / Clínica 24h';
  Uint8List? _selectedImageBytes;
  String? _selectedImageName;
  bool _submitting = false;

  // Datos de cobro oficiales de Oscar en Mercado Pago
  static const String mpAlias = 'oscar.stella.mp';
  static const String mpTitular = 'Oscar Nicolas Stella';
  static const double adPriceArs = 14000.0; // Equivalente a 10 USD

  static const _categories = [
    'Veterinaria / Clínica 24h',
    'Pet Shop / Alimentos',
    'Paseador de Perros',
    'Guardería / Hotel Canino',
    'Peluquería Canina / Spa',
    'Adiestramiento / Conducta',
    'Servicios / Otro',
  ];

  @override
  void initState() {
    super.initState();
    final user = FirebaseAuth.instance.currentUser;
    if (user != null) {
      _contactNameCtrl.text = user.displayName ?? '';
      _emailCtrl.text = user.email ?? '';
    }
  }

  @override
  void dispose() {
    _businessNameCtrl.dispose();
    _contactNameCtrl.dispose();
    _phoneCtrl.dispose();
    _emailCtrl.dispose();
    _websiteCtrl.dispose();
    _cityCtrl.dispose();
    _messageCtrl.dispose();
    _paymentRefCtrl.dispose();
    super.dispose();
  }

  void _pickImage() async {
    try {
      final picker = ImagePicker();
      final picked = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1200,
        maxHeight: 800,
        imageQuality: 85,
      );
      if (picked != null) {
        final bytes = await picked.readAsBytes();
        setState(() {
          _selectedImageBytes = bytes;
          _selectedImageName = picked.name;
        });
      }
    } catch (e) {
      debugPrint('Error al seleccionar imagen: $e');
    }
  }

  void _copyAlias() {
    Clipboard.setData(const ClipboardData(text: mpAlias));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('📋 Alias "oscar.stella.mp" copiado al portapapeles'),
        backgroundColor: BuscapetTheme.success,
        duration: Duration(seconds: 2),
      ),
    );
  }

  void _openMercadoPagoCheckoutLink() async {
    final business = _businessNameCtrl.text.trim().isNotEmpty
        ? _businessNameCtrl.text.trim()
        : 'Anunciante';
    final email = _emailCtrl.text.trim();
    final name = _contactNameCtrl.text.trim();

    await MercadoPagoService().createAndOpenCheckout(
      title: 'Publicidad Buscapet (30 días) - $business',
      price: adPriceArs,
      description: 'Anuncio patrocinado en Buscapet para $business',
      payerEmail: email.isNotEmpty ? email : null,
      payerName: name.isNotEmpty ? name : null,
      externalReference: 'ad_${DateTime.now().millisecondsSinceEpoch}',
    );
  }

  void _openMercadoPagoApp() async {
    final uri = Uri.parse('https://link.mercadopago.com.ar/');
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
  }

  void _submitAndPublish() async {
    setState(() => _submitting = true);

    try {
      final user = FirebaseAuth.instance.currentUser;
      String? uploadedPhotoUrl;

      if (_selectedImageBytes != null) {
        try {
          uploadedPhotoUrl = await _storage.uploadPhoto(_selectedImageBytes!);
        } catch (e) {
          debugPrint('Error al subir banner publicitario: $e');
        }
      }

      final adId = 'ad-${DateTime.now().millisecondsSinceEpoch}';
      final sponsoredAd = SponsoredAd(
        id: adId,
        businessName: _businessNameCtrl.text.trim(),
        category: _category,
        description: _messageCtrl.text.trim(),
        photoUrl: uploadedPhotoUrl,
        whatsapp: _phoneCtrl.text.trim(),
        website: _websiteCtrl.text.trim(),
        city: _cityCtrl.text.trim(),
        paidAmount: adPriceArs,
        paymentRef: _paymentRefCtrl.text.trim(),
        createdAt: DateTime.now(),
        active: true,
      );

      // Guardar anuncio en Firestore para publicarse en el feed
      await _firestore.createSponsoredAd(sponsoredAd);

      // Guardar también en solicitudes para control administrativo
      await _firestore.createAdRequest({
        'adId': adId,
        'businessName': _businessNameCtrl.text.trim(),
        'contactName': _contactNameCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        'email': _emailCtrl.text.trim(),
        'website': _websiteCtrl.text.trim(),
        'city': _cityCtrl.text.trim(),
        'category': _category,
        'message': _messageCtrl.text.trim(),
        'photoUrl': uploadedPhotoUrl,
        'paidAmount': adPriceArs,
        'paymentRef': _paymentRefCtrl.text.trim(),
        'paymentMethod': 'Mercado Pago (Alias: $mpAlias)',
        'userId': user?.uid ?? 'guest',
        'status': 'active',
      });

      if (mounted) {
        Navigator.pop(context);
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            backgroundColor: BuscapetTheme.bgCard,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: Color(0xFFF59E0B)),
            ),
            title: const Row(
              children: [
                Icon(Icons.verified_rounded, color: Color(0xFFF59E0B), size: 26),
                SizedBox(width: 8),
                Text('¡Publicidad Activada! 🎉',
                    style: TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w800, color: BuscapetTheme.textMain)),
              ],
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Tu anuncio "${_businessNameCtrl.text.trim()}" ha sido registrado y ya se encuentra activo entre las publicaciones del feed.',
                  style: const TextStyle(fontSize: 13, color: BuscapetTheme.textLight, height: 1.4),
                ),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.3)),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 16),
                      SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Monto: \$14.000 ARS (10 USD) — Activo por 30 días.',
                          style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: Color(0xFFF59E0B)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            actions: [
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFF59E0B)),
                child: const Text('Ver en el Feed', style: TextStyle(fontWeight: FontWeight.w800)),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _submitting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al publicar anuncio: $e'),
            backgroundColor: BuscapetTheme.danger,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width > 600;

    return Dialog(
      backgroundColor: BuscapetTheme.bgCard,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: BuscapetTheme.border),
      ),
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Container(
        width: isDesktop ? 580 : double.infinity,
        constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.90),
        child: Column(
          children: [
            // Header con indicador de pasos
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(
                color: BuscapetTheme.bgInput,
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.campaign_rounded, color: Color(0xFFF59E0B), size: 20),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _currentStep == 0
                              ? 'Publicitar en Buscapet (Paso 1/2)'
                              : 'Pago con Mercado Pago (Paso 2/2)',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w800,
                            color: BuscapetTheme.textMain,
                          ),
                        ),
                        Text(
                          _currentStep == 0
                              ? 'Completa los datos de tu negocio y anuncio'
                              : 'Abona \$14.000 ARS (10 USD) para activar tu aviso',
                          style: const TextStyle(fontSize: 11, color: BuscapetTheme.textMuted),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, size: 20),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: BuscapetTheme.border),

            // Contenido según el paso
            Expanded(
              child: _currentStep == 0 ? _buildStep1Form() : _buildStep2Payment(),
            ),

            const Divider(height: 1, color: BuscapetTheme.border),

            // Botones inferiores de navegación
            Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  if (_currentStep == 1)
                    Expanded(
                      flex: 1,
                      child: OutlinedButton(
                        onPressed: () => setState(() => _currentStep = 0),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          side: const BorderSide(color: BuscapetTheme.border),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('Volver'),
                      ),
                    ),
                  if (_currentStep == 1) const SizedBox(width: 10),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      onPressed: _submitting
                          ? null
                          : () {
                              if (_currentStep == 0) {
                                if (_formKey.currentState!.validate()) {
                                  setState(() => _currentStep = 1);
                                }
                              } else {
                                _submitAndPublish();
                              }
                            },
                      icon: _submitting
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : Icon(
                              _currentStep == 0 ? Icons.arrow_forward_rounded : Icons.check_circle_rounded,
                              size: 18,
                            ),
                      label: Text(
                        _submitting
                            ? 'Activando Anuncio...'
                            : (_currentStep == 0
                                ? 'Continuar al Pago (\$14.000 ARS)'
                                : 'Confirmar Pago y Publicar'),
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF59E0B),
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============ PASO 1: FORMULARIO DEL ANUNCIO ============
  Widget _buildStep1Form() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Nombre del Negocio
            TextFormField(
              controller: _businessNameCtrl,
              style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
              decoration: const InputDecoration(
                labelText: 'Nombre del Negocio / Marca *',
                hintText: 'Ej: Veterinaria San Roque, Pet Shop Huellitas',
                prefixIcon: Icon(Icons.storefront_rounded, size: 18),
              ),
              validator: (v) => v == null || v.trim().isEmpty ? 'Ingresa el nombre del negocio' : null,
            ),
            const SizedBox(height: 12),

            // Rubro
            const Text(
              'Rubro o Categoría *',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: BuscapetTheme.textMain),
            ),
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: BuscapetTheme.bgInput,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: BuscapetTheme.border),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _category,
                  isExpanded: true,
                  dropdownColor: BuscapetTheme.bgCard,
                  items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontSize: 12.5)))).toList(),
                  onChanged: (v) => setState(() => _category = v!),
                ),
              ),
            ),
            const SizedBox(height: 12),

            // Imagen / Banner publicitario (Opcional)
            const Text(
              'Imagen / Banner del Anuncio (Opcional)',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: BuscapetTheme.textMain),
            ),
            const SizedBox(height: 6),
            if (_selectedImageBytes != null)
              Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: BuscapetTheme.bgInput,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.4)),
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.memory(_selectedImageBytes!, width: 64, height: 64, fit: BoxFit.cover),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('📸 Imagen cargada para el anuncio', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: BuscapetTheme.textMain)),
                          if (_selectedImageName != null)
                            Text(_selectedImageName!, style: const TextStyle(fontSize: 10.5, color: BuscapetTheme.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline_rounded, color: BuscapetTheme.danger),
                      onPressed: () => setState(() {
                        _selectedImageBytes = null;
                        _selectedImageName = null;
                      }),
                    ),
                  ],
                ),
              )
            else
              InkWell(
                borderRadius: BorderRadius.circular(10),
                onTap: _pickImage,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: BuscapetTheme.bgInput,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: BuscapetTheme.border, style: BorderStyle.solid),
                  ),
                  child: const Column(
                    children: [
                      Icon(Icons.add_photo_alternate_outlined, color: BuscapetTheme.primary, size: 28),
                      SizedBox(height: 4),
                      Text('Subir Foto o Banner promocional (opcional)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: BuscapetTheme.primary)),
                      Text('Formato JPG/PNG recomendado para lucir en el feed', style: TextStyle(fontSize: 10, color: BuscapetTheme.textMuted)),
                    ],
                  ),
                ),
              ),
            const SizedBox(height: 12),

            // Propuesta / Mensaje promocional
            TextFormField(
              controller: _messageCtrl,
              maxLines: 3,
              style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
              decoration: const InputDecoration(
                labelText: 'Texto Promocional / Oferta / Descripción *',
                hintText: 'Ej: 15% de descuento en vacunación mencionando Buscapet. Atención 24hs con guardia médica...',
                alignLabelWithHint: true,
              ),
              validator: (v) => v == null || v.trim().isEmpty ? 'Ingresa la descripción o promo' : null,
            ),
            const SizedBox(height: 12),

            // WhatsApp y Ciudad
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _phoneCtrl,
                    keyboardType: TextInputType.phone,
                    style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
                    decoration: const InputDecoration(
                      labelText: 'WhatsApp del Negocio *',
                      hintText: '+54 9 11 5555-5555',
                      prefixIcon: Icon(Icons.chat_bubble_outline_rounded, size: 18),
                    ),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Ingresa el WhatsApp' : null,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextFormField(
                    controller: _cityCtrl,
                    style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
                    decoration: const InputDecoration(
                      labelText: 'Ciudad / Barrio *',
                      hintText: 'Ej: Palermo, Bariloche, Córdoba',
                      prefixIcon: Icon(Icons.location_city_rounded, size: 18),
                    ),
                    validator: (v) => v == null || v.trim().isEmpty ? 'Ingresa la ciudad' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Web o Instagram
            TextFormField(
              controller: _websiteCtrl,
              style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
              decoration: const InputDecoration(
                labelText: 'Sitio Web o Instagram (opcional)',
                hintText: 'https://instagram.com/mi_veterinaria',
                prefixIcon: Icon(Icons.link_rounded, size: 18),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============ PASO 2: CHECKOUT MERCADO PAGO ============
  Widget _buildStep2Payment() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Resumen de precio y 10 USD equiv
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF009EE3), Color(0xFF007EBA)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF009EE3).withValues(alpha: 0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                  child: const Icon(Icons.payment_rounded, color: Color(0xFF009EE3), size: 24),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total a Pagar: \$14.000 ARS',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        'Equivalente a 10 USD por 30 días de publicación patrocinada.',
                        style: TextStyle(fontSize: 11, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          const Text(
            'Datos de la Cuenta Mercado Pago:',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: BuscapetTheme.textMain),
          ),
          const SizedBox(height: 8),

          // Tarjeta con Alias y Titular
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: BuscapetTheme.bgInput,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: BuscapetTheme.border),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    const Icon(Icons.account_balance_wallet_rounded, size: 18, color: Color(0xFF009EE3)),
                    const SizedBox(width: 8),
                    const Text('Alias Mercado Pago:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: BuscapetTheme.textMuted)),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: BuscapetTheme.bgCard,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: BuscapetTheme.primary.withValues(alpha: 0.4)),
                      ),
                      child: const Text(
                        mpAlias,
                        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: BuscapetTheme.primary),
                      ),
                    ),
                    const SizedBox(width: 6),
                    IconButton(
                      icon: const Icon(Icons.copy_rounded, size: 18, color: BuscapetTheme.primary),
                      tooltip: 'Copiar Alias',
                      onPressed: _copyAlias,
                    ),
                  ],
                ),
                const Divider(height: 16, color: BuscapetTheme.border),
                const Row(
                  children: [
                    Icon(Icons.person_outline_rounded, size: 18, color: BuscapetTheme.textMuted),
                    SizedBox(width: 8),
                    Text('Titular de la Cuenta:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: BuscapetTheme.textMuted)),
                    Spacer(),
                    Text(
                      mpTitular,
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: BuscapetTheme.textMain),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Botón Pagar con Tarjeta / Mercado Pago Link (mpago.la)
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _openMercadoPagoCheckoutLink,
              icon: const Icon(Icons.credit_card_rounded, size: 18, color: Colors.white),
              label: const Text(
                '💳 Pagar con Tarjeta (Débito/Crédito) o MP',
                style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF009EE3),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                elevation: 2,
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Botón alternativo para transferir por alias
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _openMercadoPagoApp,
              icon: const Icon(Icons.account_balance_rounded, size: 16, color: Color(0xFF009EE3)),
              label: const Text(
                'Transferir con Alias desde mi Banco / Billetera',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF009EE3)),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Color(0xFF009EE3)),
                padding: const EdgeInsets.symmetric(vertical: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Número de comprobante o referencia (opcional)
          TextField(
            controller: _paymentRefCtrl,
            style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
            decoration: const InputDecoration(
              labelText: 'N° de Comprobante / Referencia de Transferencia (opcional)',
              hintText: 'Ej: 1234567890 o tu nombre de usuario',
              prefixIcon: Icon(Icons.receipt_long_rounded, size: 18),
            ),
          ),
          const SizedBox(height: 12),

          // Nota de activación inmediata
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: BuscapetTheme.success.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: BuscapetTheme.success.withValues(alpha: 0.3)),
            ),
            child: const Row(
              children: [
                Icon(Icons.bolt_rounded, color: BuscapetTheme.success, size: 18),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '¡Tu aviso se publicará de inmediato en el feed y estará activo durante 30 días!',
                    style: TextStyle(fontSize: 11, color: BuscapetTheme.success, fontWeight: FontWeight.w700),
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
