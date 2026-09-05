// =============================================================================
// SERVICIO: AuthService — Firebase Auth (Google + Email/Password)
// =============================================================================

import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final FirebaseAuth _auth = FirebaseAuth.instance;
  GoogleSignIn? _googleSignInInstance;
  GoogleSignIn get _googleSignIn => _googleSignInInstance ??= GoogleSignIn();
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  static const String adminEmail = 'oscarns@gmail.com';

  // Stream del usuario actual
  Stream<User?> get userStream => _auth.authStateChanges();

  // Usuario actual
  User? get currentUser => _auth.currentUser;

  // ¿Está logueado?
  bool get isLoggedIn => _auth.currentUser != null;

  // ¿Es el admin (Oscar)?
  bool get isAdmin => _auth.currentUser?.email == adminEmail;

  // ============ LOGIN CON GOOGLE ============
  Future<User?> signInWithGoogle() async {
    try {
      if (kIsWeb) {
        final GoogleAuthProvider googleProvider = GoogleAuthProvider();
        final UserCredential userCredential =
            await _auth.signInWithPopup(googleProvider);
        await _saveUserProfile(userCredential.user);
        return userCredential.user;
      } else {
        final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
        if (googleUser == null) return null;

        final GoogleSignInAuthentication googleAuth =
            await googleUser.authentication;

        final credential = GoogleAuthProvider.credential(
          accessToken: googleAuth.accessToken,
          idToken: googleAuth.idToken,
        );

        final UserCredential userCredential =
            await _auth.signInWithCredential(credential);

        await _saveUserProfile(userCredential.user);
        return userCredential.user;
      }
    } catch (e) {
      rethrow;
    }
  }

  // ============ LOGIN CON EMAIL ============
  Future<User?> signInWithEmail(String email, String password) async {
    try {
      final UserCredential credential = await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
      return credential.user;
    } catch (e) {
      rethrow;
    }
  }

  // ============ REGISTRO CON EMAIL ============
  Future<User?> registerWithEmail({
    required String name,
    required String email,
    required String password,
    String whatsapp = '',
  }) async {
    try {
      final UserCredential credential =
          await _auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );

      await credential.user?.updateDisplayName(name);
      await _saveUserProfile(credential.user, whatsapp: whatsapp);
      return credential.user;
    } catch (e) {
      rethrow;
    }
  }

  // ============ CERRAR SESIÓN ============
  Future<void> signOut() async {
    try {
      if (!kIsWeb && _googleSignInInstance != null) {
        await _googleSignInInstance?.signOut();
      }
      await _auth.signOut();
    } catch (_) {
      await _auth.signOut();
    }
  }

  // ============ GUARDAR PERFIL EN FIRESTORE ============
  Future<void> _saveUserProfile(User? user, {String whatsapp = ''}) async {
    if (user == null) return;
    try {
      await _db.collection('users').doc(user.uid).set({
        'uid': user.uid,
        'name': user.displayName ?? user.email?.split('@')[0] ?? 'Usuario',
        'email': user.email ?? '',
        'avatar': user.photoURL ??
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        'whatsapp': whatsapp,
        'isAdmin': user.email == adminEmail,
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    } catch (_) {}
  }

  // ============ OBTENER NOMBRE PARA MOSTRAR ============
  String get displayName {
    final user = currentUser;
    if (user == null) return 'Invitado';
    return user.displayName ?? user.email?.split('@')[0] ?? 'Usuario';
  }

  String get avatarUrl {
    return currentUser?.photoURL ??
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
  }

  // ============ TRADUCIR ERRORES FIREBASE ============
  static String translateError(dynamic e) {
    final code = e is FirebaseAuthException ? e.code : '';
    switch (code) {
      case 'user-not-found':
        return 'No existe una cuenta con ese email.';
      case 'wrong-password':
        return 'Contraseña incorrecta.';
      case 'email-already-in-use':
        return 'Ya existe una cuenta con ese email.';
      case 'weak-password':
        return 'La contraseña es muy débil (mínimo 6 caracteres).';
      case 'invalid-email':
        return 'El email ingresado no es válido.';
      case 'network-request-failed':
        return 'Error de red. Verificá tu conexión a internet.';
      default:
        return 'Error: ${e.toString()}';
    }
  }
}
