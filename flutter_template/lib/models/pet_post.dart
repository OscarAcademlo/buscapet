// =============================================================================
// MODELO: PetPost — Mascota reportada (perdida, encontrada, adopción, visto)
// =============================================================================

class PetPost {
  final String id;
  final String type; // 'lost' | 'found' | 'adopt' | 'spotted' | 'reunited' | 'adopted'
  final String petName;
  final String species;
  final String breed;
  final String gender;
  final String description;
  final List<String> photos;
  final PostUser user;
  final PostLocation location;
  final int likes;
  final List<String> likedBy;
  final int shares;
  final List<PostComment> comments;
  final DateTime createdAt;
  final bool reunited;
  final bool adopted;
  final bool isSample;

  PetPost({
    required this.id,
    required this.type,
    required this.petName,
    required this.species,
    required this.breed,
    required this.gender,
    required this.description,
    required this.photos,
    required this.user,
    required this.location,
    this.likes = 0,
    this.likedBy = const [],
    this.shares = 0,
    this.comments = const [],
    required this.createdAt,
    this.reunited = false,
    this.adopted = false,
    this.isSample = false,
  });

  bool get isReunited => type == 'reunited' || reunited;
  bool get isAdopted => type == 'adopted' || adopted;

  String get timeAgo {
    final now = DateTime.now();
    final diff = now.difference(createdAt);
    if (diff.inMinutes < 1) return 'Recién publicado';
    if (diff.inMinutes < 60) return 'Hace ${diff.inMinutes} min';
    if (diff.inHours < 24) return 'Hace ${diff.inHours} h';
    if (diff.inDays == 1) return 'Ayer';
    if (diff.inDays < 7) return 'Hace ${diff.inDays} días';
    return '${createdAt.day}/${createdAt.month}/${createdAt.year}';
  }

  factory PetPost.fromMap(Map<String, dynamic> map, String docId) {
    return PetPost(
      id: docId,
      type: map['type'] ?? 'lost',
      petName: map['petName'] ?? 'Sin nombre',
      species: map['species'] ?? 'Perro',
      breed: map['breed'] ?? '',
      gender: map['gender'] ?? '',
      description: map['description'] ?? '',
      photos: List<String>.from(map['photos'] ?? []),
      user: PostUser.fromMap(Map<String, dynamic>.from(map['user'] ?? {})),
      location: PostLocation.fromMap(Map<String, dynamic>.from(map['location'] ?? {})),
      likes: map['likes'] ?? 0,
      likedBy: List<String>.from(map['likedBy'] ?? []),
      shares: map['shares'] ?? 0,
      comments: (map['comments'] as List<dynamic>? ?? [])
          .map((c) => PostComment.fromMap(Map<String, dynamic>.from(c)))
          .toList(),
      createdAt: map['createdAt'] != null
          ? (map['createdAt'] is int
              ? DateTime.fromMillisecondsSinceEpoch(map['createdAt'])
              : (map['createdAt'] is DateTime
                  ? map['createdAt']
                  : DateTime.now()))
          : DateTime.now(),
      reunited: map['reunited'] ?? false,
      adopted: map['adopted'] ?? false,
      isSample: map['isSample'] ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'type': type,
      'petName': petName,
      'species': species,
      'breed': breed,
      'gender': gender,
      'description': description,
      'photos': photos,
      'user': user.toMap(),
      'location': location.toMap(),
      'likes': likes,
      'likedBy': likedBy,
      'shares': shares,
      'comments': comments.map((c) => c.toMap()).toList(),
      'createdAt': createdAt.millisecondsSinceEpoch,
      'reunited': reunited,
      'adopted': adopted,
      'isSample': isSample,
    };
  }

  PetPost copyWith({
    String? type,
    int? likes,
    List<String>? likedBy,
    int? shares,
    List<PostComment>? comments,
    bool? reunited,
    bool? adopted,
  }) {
    return PetPost(
      id: id,
      type: type ?? this.type,
      petName: petName,
      species: species,
      breed: breed,
      gender: gender,
      description: description,
      photos: photos,
      user: user,
      location: location,
      likes: likes ?? this.likes,
      likedBy: likedBy ?? this.likedBy,
      shares: shares ?? this.shares,
      comments: comments ?? this.comments,
      createdAt: createdAt,
      reunited: reunited ?? this.reunited,
      adopted: adopted ?? this.adopted,
    );
  }
}

class PostUser {
  final String id;
  final String name;
  final String email;
  final String avatar;
  final String whatsapp;

  PostUser({
    required this.id,
    required this.name,
    required this.email,
    required this.avatar,
    this.whatsapp = '',
  });

  factory PostUser.fromMap(Map<String, dynamic> map) {
    return PostUser(
      id: map['id'] ?? '',
      name: map['name'] ?? 'Usuario',
      email: map['email'] ?? '',
      avatar: map['avatar'] ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      whatsapp: map['whatsapp'] ?? '',
    );
  }

  Map<String, dynamic> toMap() => {
    'id': id,
    'name': name,
    'email': email,
    'avatar': avatar,
    'whatsapp': whatsapp,
  };
}

class PostLocation {
  final String address;
  final String cityName;
  final String stateName;
  final String country;
  final double? lat;
  final double? lng;

  PostLocation({
    required this.address,
    required this.cityName,
    required this.stateName,
    required this.country,
    this.lat,
    this.lng,
  });

  factory PostLocation.fromMap(Map<String, dynamic> map) {
    return PostLocation(
      address: map['address'] ?? '',
      cityName: map['cityName'] ?? '',
      stateName: map['stateName'] ?? '',
      country: map['country'] ?? 'AR',
      lat: (map['lat'] as num?)?.toDouble(),
      lng: (map['lng'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toMap() => {
    'address': address,
    'cityName': cityName,
    'stateName': stateName,
    'country': country,
    if (lat != null) 'lat': lat,
    if (lng != null) 'lng': lng,
  };

  String get displayName {
    if (cityName.isNotEmpty && stateName.isNotEmpty) return '$cityName, $stateName';
    if (address.isNotEmpty) return address;
    return 'Ubicación no especificada';
  }
}

class PostComment {
  final String id;
  final String userName;
  final String userAvatar;
  final String userId;
  final String text;
  final String? photoUrl;
  final String? address;
  final double? lat;
  final double? lng;
  final DateTime createdAt;

  PostComment({
    required this.id,
    required this.userName,
    required this.userAvatar,
    required this.userId,
    required this.text,
    this.photoUrl,
    this.address,
    this.lat,
    this.lng,
    required this.createdAt,
  });

  String get formattedDateTime {
    final day = createdAt.day.toString().padLeft(2, '0');
    final month = createdAt.month.toString().padLeft(2, '0');
    final year = createdAt.year;
    final hour = createdAt.hour.toString().padLeft(2, '0');
    final minute = createdAt.minute.toString().padLeft(2, '0');
    return '$day/$month/$year $hour:$minute';
  }

  String get timeAgo {
    final diff = DateTime.now().difference(createdAt);
    if (diff.inMinutes < 1) return 'Recién';
    if (diff.inMinutes < 60) return 'Hace ${diff.inMinutes}m';
    if (diff.inHours < 24) return 'Hace ${diff.inHours}h';
    if (diff.inDays == 1) return 'Ayer';
    if (diff.inDays < 7) return 'Hace ${diff.inDays}d';
    return '${createdAt.day}/${createdAt.month}';
  }

  factory PostComment.fromMap(Map<String, dynamic> map) {
    return PostComment(
      id: map['id'] ?? '',
      userName: map['userName'] ?? 'Usuario',
      userAvatar: map['userAvatar'] ??
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      userId: map['userId'] ?? '',
      text: map['text'] ?? '',
      photoUrl: map['photoUrl'],
      address: map['address'],
      lat: (map['lat'] as num?)?.toDouble(),
      lng: (map['lng'] as num?)?.toDouble(),
      createdAt: map['createdAt'] != null
          ? (map['createdAt'] is int
              ? DateTime.fromMillisecondsSinceEpoch(map['createdAt'])
              : (map['createdAt'] is DateTime
                  ? map['createdAt']
                  : DateTime.now()))
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() => {
    'id': id,
    'userName': userName,
    'userAvatar': userAvatar,
    'userId': userId,
    'text': text,
    if (photoUrl != null && photoUrl!.isNotEmpty) 'photoUrl': photoUrl,
    if (address != null && address!.isNotEmpty) 'address': address,
    if (lat != null) 'lat': lat,
    if (lng != null) 'lng': lng,
    'createdAt': createdAt.millisecondsSinceEpoch,
  };
}
