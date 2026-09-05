// =============================================================================
// MODELO: SponsoredAd — Publicidad Patrocinada en el Feed
// =============================================================================

class SponsoredAd {
  final String id;
  final String businessName;
  final String category;
  final String description;
  final String? photoUrl;
  final String whatsapp;
  final String website;
  final String city;
  final double paidAmount;
  final String paymentRef;
  final DateTime createdAt;
  final bool active;

  SponsoredAd({
    required this.id,
    required this.businessName,
    required this.category,
    required this.description,
    this.photoUrl,
    required this.whatsapp,
    this.website = '',
    required this.city,
    this.paidAmount = 14000.0, // Equivalente a 10 USD
    this.paymentRef = '',
    required this.createdAt,
    this.active = true,
  });

  factory SponsoredAd.fromMap(Map<String, dynamic> map, String id) {
    return SponsoredAd(
      id: id,
      businessName: map['businessName'] ?? 'Anunciante',
      category: map['category'] ?? 'Veterinaria',
      description: map['description'] ?? map['message'] ?? '',
      photoUrl: map['photoUrl'] ?? map['bannerUrl'],
      whatsapp: map['whatsapp'] ?? map['phone'] ?? '',
      website: map['website'] ?? '',
      city: map['city'] ?? 'Argentina',
      paidAmount: (map['paidAmount'] as num?)?.toDouble() ?? 14000.0,
      paymentRef: map['paymentRef'] ?? '',
      createdAt: map['createdAt'] != null
          ? DateTime.fromMillisecondsSinceEpoch(
              map['createdAt'] is int ? map['createdAt'] : 0)
          : DateTime.now(),
      active: map['active'] ?? (map['status'] == 'approved' || map['status'] == 'active' || map['status'] == 'pending'),
    );
  }

  Map<String, dynamic> toMap() => {
    'businessName': businessName,
    'category': category,
    'description': description,
    if (photoUrl != null) 'photoUrl': photoUrl,
    'whatsapp': whatsapp,
    'website': website,
    'city': city,
    'paidAmount': paidAmount,
    'paymentRef': paymentRef,
    'createdAt': createdAt.millisecondsSinceEpoch,
    'active': active,
  };
}

// Anuncios de muestra por defecto
final List<SponsoredAd> demoSponsoredAds = [
  SponsoredAd(
    id: 'ad-sample-1',
    businessName: 'Veterinaria & Urgencias 24h San Roque',
    category: '🏥 Veterinaria 24h',
    description:
        '🩺 Atención médica veterinaria, guardias 24 horas, ecografías, cirugías y vacunación completa para tus mascotas. ¡Mencionando Buscapet tenés un 15% de descuento en la primera consulta!',
    photoUrl:
        'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80',
    whatsapp: '+5491155550101',
    website: 'https://instagram.com',
    city: 'Palermo, CABA',
    createdAt: DateTime.now().subtract(const Duration(days: 1)),
  ),
  SponsoredAd(
    id: 'ad-sample-2',
    businessName: 'Pet Shop & Boutique Huellitas Felices',
    category: '🛍️ Pet Shop & Alimentos',
    description:
        '🍖 Alimento balanceado premium de todas las marcas con envío a domicilio sin cargo en el día. Snacks naturales, juguetes interactivos, camas ortopédicas y accesorios.',
    photoUrl:
        'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1200&q=80',
    whatsapp: '+5491155550202',
    website: 'https://instagram.com',
    city: 'San Carlos de Bariloche',
    createdAt: DateTime.now().subtract(const Duration(days: 2)),
  ),
];
