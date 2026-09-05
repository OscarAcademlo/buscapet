// =============================================================================
// SERVICIO: StorageService — Subir fotos a Firebase Storage
// =============================================================================

import 'dart:io';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:uuid/uuid.dart';
import 'package:flutter/foundation.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  final FirebaseStorage _storage = FirebaseStorage.instance;
  final _uuid = const Uuid();

  // Subir una foto y retornar la URL pública
  Future<String> uploadPhoto(dynamic imageFile) async {
    final uid = FirebaseAuth.instance.currentUser?.uid ?? 'anonymous';
    final photoId = _uuid.v4();
    final ref = _storage.ref('posts/$uid/$photoId.jpg');

    UploadTask task;
    if (kIsWeb) {
      // En web, imageFile es Uint8List
      task = ref.putData(imageFile as Uint8List,
          SettableMetadata(contentType: 'image/jpeg'));
    } else {
      // En móvil, imageFile es File
      task = ref.putFile(imageFile as File);
    }

    final snapshot = await task;
    return await snapshot.ref.getDownloadURL();
  }

  // Subir múltiples fotos
  Future<List<String>> uploadPhotos(List<dynamic> imageFiles) async {
    final urls = <String>[];
    for (final file in imageFiles) {
      final url = await uploadPhoto(file);
      urls.add(url);
    }
    return urls;
  }
}
