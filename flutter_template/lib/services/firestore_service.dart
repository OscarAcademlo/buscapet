// =============================================================================
// SERVICIO: FirestoreService — Posts, Comentarios, Likes, etc.
// =============================================================================

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/pet_post.dart';
import '../models/sponsored_ad.dart';

class FirestoreService {
  static final FirestoreService _instance = FirestoreService._internal();
  factory FirestoreService() => _instance;
  FirestoreService._internal();

  final FirebaseFirestore _db = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  CollectionReference get _posts => _db.collection('posts');

  // ============ POSTS DE DEMOSTRACIÓN INICIALES ============
  static final List<PetPost> demoPosts = [
    PetPost(
      id: 'demo-1',
      type: 'lost',
      petName: 'Milo',
      species: 'Perro',
      breed: 'Golden Retriever',
      gender: 'Macho',
      photos: [
        'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80',
      ],
      description:
          'Se extravió Milo cerca del Parque Centenario. Llevaba collar azul con chapita pero sin teléfono. Es muy dócil, responde por su nombre y necesita medicación diaria.',
      location: PostLocation(
        country: 'AR',
        stateName: 'CABA',
        cityName: 'Caballito',
        address: 'Av. Díaz Vélez & Campichuelo, CABA (Última vez visto)',
        lat: -34.6062,
        lng: -58.4355,
      ),
      createdAt: DateTime.now().subtract(const Duration(hours: 2)),
      isSample: true,
      user: PostUser(
        id: 'usr-101',
        name: 'Nicolás Rossi',
        avatar:
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        email: 'nicolas.rossi@demo.com',
      ),
      likes: 24,
      shares: 18,
      comments: [
        PostComment(
          id: 'cmt-1',
          userName: 'Sofía Romero',
          userAvatar:
              'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
          userId: 'usr-104',
          text:
              '¡Lo compartí en el grupo de vecinos de Caballito! Ojalá aparezca pronto 🙏',
          createdAt: DateTime.now().subtract(const Duration(hours: 1)),
        ),
      ],
    ),
    PetPost(
      id: 'demo-2',
      type: 'found',
      petName: 'Gatita encontrada en estación',
      species: 'Gato',
      breed: 'Siamés mestizo',
      gender: 'Hembra',
      photos: [
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80',
      ],
      description:
          'Encontré esta gatita asustada resguardándose de la lluvia en una estación de servicio. Tiene ojos celestes intensos y collar rosa sin identificación. La tengo en tránsito.',
      location: PostLocation(
        country: 'AR',
        stateName: 'CABA',
        cityName: 'Palermo',
        address: 'Av. Santa Fe y Scalabrini Ortiz, CABA (Ubicación de la foto)',
        lat: -34.5833,
        lng: -58.4178,
      ),
      createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      isSample: true,
      user: PostUser(
        id: 'usr-102',
        name: 'Martín Gómez',
        avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        email: 'martin@demo.com',
      ),
      likes: 42,
      shares: 31,
      comments: [
        PostComment(
          id: 'cmt-2',
          userName: 'Gonzalo Paz',
          userAvatar:
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
          userId: 'usr-105',
          text:
              'Tiene carita de estar bien cuidada, seguro su familia la está buscando.',
          createdAt: DateTime.now().subtract(const Duration(hours: 3)),
        ),
      ],
    ),
    PetPost(
      id: 'demo-3',
      type: 'adopt',
      petName: 'Luna',
      species: 'Perro',
      breed: 'Mestiza mediana',
      gender: 'Hembra',
      photos: [
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
      ],
      description:
          'Luna tiene 6 meses, está desparasitada y con la primera vacuna. Es súper juguetona y sociable con otros animales y niños. Se entrega en adopción responsable con compromiso de castración.',
      location: PostLocation(
        country: 'AR',
        stateName: 'Córdoba',
        cityName: 'Córdoba Capital',
        address: 'Zona Nueva Córdoba, Córdoba Capital',
        lat: -31.4201,
        lng: -64.1888,
      ),
      createdAt: DateTime.now().subtract(const Duration(hours: 12)),
      isSample: true,
      user: PostUser(
        id: 'usr-103',
        name: 'Valentina Díaz',
        avatar:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        email: 'valentina@demo.com',
      ),
      likes: 65,
      shares: 48,
      comments: [
        PostComment(
          id: 'cmt-3',
          userName: 'Carla Méndez',
          userAvatar:
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          userId: 'usr-107',
          text: '¡Hermosa Luna! Ojalá encuentre un hogar lleno de amor.',
          createdAt: DateTime.now().subtract(const Duration(hours: 8)),
        ),
      ],
    ),
    PetPost(
      id: 'demo-4',
      type: 'spotted',
      petName: 'Pastor Alemán visto en la costa',
      species: 'Perro',
      breed: 'Pastor Alemán',
      gender: 'Macho',
      photos: [
        'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=800&q=80',
      ],
      description:
          'Vi este perro deambulando cerca de la costa del lago. Parece perdido y desorientado, tiene collar de cuero marrón pero no se deja agarrar. Anda por la zona del centro cívico.',
      location: PostLocation(
        country: 'AR',
        stateName: 'Río Negro',
        cityName: 'San Carlos de Bariloche',
        address: 'Av. 12 de Octubre y Costanera, Bariloche',
        lat: -41.1335,
        lng: -71.3103,
      ),
      createdAt: DateTime.now().subtract(const Duration(days: 1)),
      isSample: true,
      user: PostUser(
        id: 'usr-104',
        name: 'Federico Álvarez',
        avatar:
            'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
        email: 'federico@demo.com',
      ),
      likes: 38,
      shares: 22,
      comments: [],
    ),
  ];

  // ============ STREAM DE POSTS EN TIEMPO REAL ============
  Stream<List<PetPost>> postsStream({
    String? filterType,
    String? filterCountry,
    String? filterState,
    String? filterCity,
  }) {
    Query query = _posts.orderBy('createdAt', descending: true);

    return query.snapshots().map((snap) {
      final cloudPosts = snap.docs
          .map((doc) => PetPost.fromMap(
              doc.data() as Map<String, dynamic>, doc.id))
          .toList();

      // Mostrar posts de Firestore, o demos como muestra únicamente si la base está vacía
      var allPosts = cloudPosts.isNotEmpty ? cloudPosts : List<PetPost>.from(demoPosts);

      // Filtros en cliente
      if (filterType != null && filterType != 'all') {
        if (filterType == 'adopt' || filterType == 'adoption') {
          allPosts = allPosts.where((p) => p.type == 'adopt' || p.type == 'adoption').toList();
        } else {
          allPosts = allPosts.where((p) => p.type == filterType).toList();
        }
      }
      if (filterCountry != null && filterCountry.isNotEmpty) {
        allPosts = allPosts.where((p) => p.location.country == filterCountry).toList();
      }
      if (filterState != null && filterState.isNotEmpty) {
        allPosts = allPosts
            .where((p) => p.location.stateName
                .toLowerCase()
                .contains(filterState.toLowerCase()))
            .toList();
      }
      if (filterCity != null && filterCity.isNotEmpty) {
        allPosts = allPosts
            .where((p) => p.location.cityName
                .toLowerCase()
                .contains(filterCity.toLowerCase()))
            .toList();
      }

      return allPosts;
    }).handleError((_) {
      // Fallback si no hay conexión a Firestore: mostrar demo posts con filtros
      var posts = List<PetPost>.from(demoPosts);
      if (filterType != null && filterType != 'all') {
        if (filterType == 'adopt' || filterType == 'adoption') {
          posts = posts.where((p) => p.type == 'adopt' || p.type == 'adoption').toList();
        } else {
          posts = posts.where((p) => p.type == filterType).toList();
        }
      }
      return posts;
    });
  }

  // ============ CREAR POST ============
  Future<String> createPost(PetPost post) async {
    final doc = _posts.doc();
    final map = post.toMap();
    map['id'] = doc.id;
    await doc.set(map);
    return doc.id;
  }

  // ============ TOGGLE LIKE ============
  Future<void> toggleLike(String postId) async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return;

    final ref = _posts.doc(postId);
    final snap = await ref.get();
    if (!snap.exists) return;

    final data = snap.data() as Map<String, dynamic>;
    final likedBy = List<String>.from(data['likedBy'] ?? []);
    final liked = likedBy.contains(uid);

    if (liked) {
      likedBy.remove(uid);
    } else {
      likedBy.add(uid);
    }

    await ref.update({
      'likes': likedBy.length,
      'likedBy': likedBy,
    });
  }

  // ============ AGREGAR COMENTARIO ============
  Future<void> addComment(String postId, PostComment comment) async {
    final ref = _posts.doc(postId);
    await ref.update({
      'comments': FieldValue.arrayUnion([comment.toMap()]),
    });
  }

  // ============ MARCAR COMO ENCONTRADO (reunited) ============
  Future<void> markAsReunited(String postId) async {
    await _posts.doc(postId).update({
      'type': 'reunited',
      'reunited': true,
      'reunitedAt': FieldValue.serverTimestamp(),
    });
  }

  // ============ MARCAR COMO ADOPTADO ============
  Future<void> markAsAdopted(String postId) async {
    await _posts.doc(postId).update({
      'type': 'adopted',
      'adopted': true,
      'adoptedAt': FieldValue.serverTimestamp(),
    });
  }

  // ============ INCREMENTAR COMPARTIDOS ============
  Future<void> incrementShares(String postId) async {
    await _posts.doc(postId).update({
      'shares': FieldValue.increment(1),
    });
  }

  // ============ ELIMINAR POST (solo admin o dueño) ============
  Future<void> deletePost(String postId) async {
    await _posts.doc(postId).delete();
  }

  // ============ SOLICITUDES DE PUBLICIDAD ============
  Future<void> createAdRequest(Map<String, dynamic> data) async {
    await _db.collection('ad_requests').add({
      ...data,
      'createdAt': FieldValue.serverTimestamp(),
      'status': 'pending',
    });
  }

  Stream<List<Map<String, dynamic>>> adRequestsStream() {
    return _db
        .collection('ad_requests')
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snap) => snap.docs
            .map((d) => {'id': d.id, ...d.data()})
            .toList());
  }

  Future<void> updateAdRequestStatus(String id, String status) async {
    await _db.collection('ad_requests').doc(id).update({'status': status});
  }

  // ============ PUBLICIDADES PATROCINADAS (FEED) ============
  Future<void> createSponsoredAd(SponsoredAd ad) async {
    await _db.collection('sponsored_ads').doc(ad.id).set(ad.toMap());
  }

  Stream<List<SponsoredAd>> sponsoredAdsStream() {
    return _db
        .collection('sponsored_ads')
        .where('active', isEqualTo: true)
        .snapshots()
        .map((snap) {
          if (snap.docs.isEmpty) return List<SponsoredAd>.from(demoSponsoredAds);
          return snap.docs
              .map((d) => SponsoredAd.fromMap(d.data(), d.id))
              .toList();
        })
        .handleError((_) => List<SponsoredAd>.from(demoSponsoredAds));
  }
}
