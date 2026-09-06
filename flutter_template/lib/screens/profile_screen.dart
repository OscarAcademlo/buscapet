// =============================================================================
// PANTALLA: ProfileScreen — Login, Registro y Perfil de usuario
// =============================================================================

import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../theme.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';
import '../services/app_settings.dart';
import '../widgets/user_avatar.dart';
import '../widgets/ad_request_modal.dart';
import '../widgets/donation_modal.dart';

class ProfileScreen extends StatefulWidget {
  final VoidCallback? onLoginSuccess;

  const ProfileScreen({super.key, this.onLoginSuccess});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen>
    with SingleTickerProviderStateMixin {
  final _auth = AuthService();
  final _settings = AppSettings();
  late TabController _tabController;

  final _emailController = TextEditingController();
  final _passController = TextEditingController();
  final _nameController = TextEditingController();
  final _regEmailController = TextEditingController();
  final _regPassController = TextEditingController();
  final _phoneController = TextEditingController();

  bool _loading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _emailController.dispose();
    _passController.dispose();
    _nameController.dispose();
    _regEmailController.dispose();
    _regPassController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        final user = snapshot.data;
        if (user != null) return _buildLoggedIn(user);
        return _buildGuest();
      },
    );
  }

  // ============ VISTA LOGUEADO ============
  Widget _buildLoggedIn(User user) {
    final isAdmin = _auth.isAdmin;
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          const SizedBox(height: 16),
          // Avatar
          UserAvatar(
            photoUrl: user.photoURL,
            name: user.displayName ?? user.email,
            radius: 44,
          ),
          const SizedBox(height: 12),
          if (isAdmin)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: BuscapetTheme.warning.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: BuscapetTheme.warning.withValues(alpha: 0.4)),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.shield_rounded, size: 13, color: BuscapetTheme.warning),
                  SizedBox(width: 4),
                  Text('Administrador Master',
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: BuscapetTheme.warning)),
                ],
              ),
            ),
          Text(
            user.displayName ?? user.email?.split('@')[0] ?? 'Usuario',
            style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: Theme.of(context).textTheme.bodyLarge?.color),
          ),
          const SizedBox(height: 4),
          Text(user.email ?? '',
              style: const TextStyle(
                  fontSize: 13, color: BuscapetTheme.textMuted)),
          const SizedBox(height: 16),

          // Configuración de Tema e Idioma
          _buildSettingsCard(),

          const SizedBox(height: 16),

          // Tarjeta Donar / Cafecito
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF262015), Color(0xFF1B1710)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.45)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text('☕', style: TextStyle(fontSize: 20)),
                    const SizedBox(width: 8),
                    Text(
                      AppSettings.tr('support_buscapet'),
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFFF59E0B),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  AppSettings.tr('support_desc'),
                  style: const TextStyle(fontSize: 11.5, color: BuscapetTheme.textLight, height: 1.35),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (_) => const DonationModal(),
                      );
                    },
                    icon: const Icon(Icons.coffee_rounded, size: 16, color: Colors.black87),
                    label: Text(AppSettings.tr('donate_coffee')),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF59E0B),
                      foregroundColor: Colors.black87,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Tarjeta Publicitar en Buscapet
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1E2235), Color(0xFF1A1D2B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: BuscapetTheme.warning.withValues(alpha: 0.35)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.campaign_rounded, color: BuscapetTheme.warning, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      '${AppSettings.tr('request_ad')} 📢',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: BuscapetTheme.textMain,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  AppSettings.tr('request_ad_desc'),
                  style: const TextStyle(fontSize: 11.5, color: BuscapetTheme.textLight, height: 1.35),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (_) => const AdRequestModal(),
                      );
                    },
                    icon: const Icon(Icons.add_business_rounded, size: 16),
                    label: Text('${AppSettings.tr('request_ad')} (${_settings.adPriceArsString})'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: BuscapetTheme.warning,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Mis publicaciones
          _sectionTitle(AppSettings.tr('my_posts')),
          const SizedBox(height: 10),
          _buildMyPosts(user),

          const SizedBox(height: 24),
          // Botón cerrar sesión
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _handleSignOut,
              icon: const Icon(Icons.logout_rounded, size: 16),
              label: Text(AppSettings.tr('logout')),
              style: OutlinedButton.styleFrom(
                foregroundColor: BuscapetTheme.danger,
                side: const BorderSide(color: BuscapetTheme.danger),
                padding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: BuscapetTheme.bgInput,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: BuscapetTheme.border),
      ),
      child: Column(
        children: [
          // Switch Tema Oscuro / Claro
          ValueListenableBuilder<ThemeMode>(
            valueListenable: _settings.themeModeNotifier,
            builder: (context, mode, _) {
              final isDark = mode == ThemeMode.dark;
              return Row(
                children: [
                  Icon(
                    isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                    color: isDark ? const Color(0xFFFBBF24) : BuscapetTheme.primary,
                    size: 20,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      isDark ? AppSettings.tr('dark_mode') : AppSettings.tr('light_mode'),
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: BuscapetTheme.textMain,
                      ),
                    ),
                  ),
                  Switch(
                    value: isDark,
                    activeColor: BuscapetTheme.primary,
                    onChanged: (_) {
                      _settings.toggleTheme();
                    },
                  ),
                ],
              );
            },
          ),
          const Divider(height: 14, color: BuscapetTheme.border),

          // Selector de Idioma (ES, EN, PT)
          ValueListenableBuilder<String>(
            valueListenable: _settings.languageNotifier,
            builder: (context, currentLang, _) {
              return Row(
                children: [
                  const Icon(Icons.language_rounded, color: BuscapetTheme.secondary, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      AppSettings.tr('language'),
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: BuscapetTheme.textMain,
                      ),
                    ),
                  ),
                  DropdownButton<String>(
                    value: currentLang,
                    dropdownColor: BuscapetTheme.bgInput,
                    underline: const SizedBox(),
                    items: const [
                      DropdownMenuItem(value: 'es', child: Text('🇦🇷 Español (ES)')),
                      DropdownMenuItem(value: 'en', child: Text('🇺🇸 English (EN)')),
                      DropdownMenuItem(value: 'pt', child: Text('🇧🇷 Português (PT)')),
                    ],
                    onChanged: (lang) {
                      if (lang != null) _settings.setLanguage(lang);
                    },
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMyPosts(User user) {
    return StreamBuilder(
      stream: FirestoreService().postsStream(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(
              child: CircularProgressIndicator(color: BuscapetTheme.primary));
        }
        final myPosts = snapshot.data!
            .where((p) =>
                p.user.id == user.uid || p.user.email == user.email)
            .toList();

        if (myPosts.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: BuscapetTheme.bgInput,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: BuscapetTheme.border),
            ),
            child: const Center(
              child: Text('No tenés publicaciones aún.',
                  style: TextStyle(
                      fontSize: 13, color: BuscapetTheme.textMuted)),
            ),
          );
        }

        return Column(
          children: myPosts.take(5).map((post) => Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: BuscapetTheme.bgInput,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: BuscapetTheme.border),
            ),
            child: Row(
              children: [
                if (post.photos.isNotEmpty)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(post.photos.first,
                        width: 50, height: 50, fit: BoxFit.cover),
                  )
                else
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: BuscapetTheme.border,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.pets_rounded, color: BuscapetTheme.textMuted),
                  ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(post.petName,
                          style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: BuscapetTheme.textMain)),
                      Text(post.location.displayName,
                          style: const TextStyle(
                              fontSize: 11, color: BuscapetTheme.textMuted)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _postTypeColor(post.type).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(post.type.toUpperCase(),
                      style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: _postTypeColor(post.type))),
                ),
              ],
            ),
          )).toList(),
        );
      },
    );
  }

  Color _postTypeColor(String type) {
    switch (type) {
      case 'lost': return BuscapetTheme.danger;
      case 'found': return BuscapetTheme.success;
      case 'adopt': return BuscapetTheme.adopt;
      case 'spotted': return BuscapetTheme.warning;
      case 'reunited': return BuscapetTheme.success;
      default: return BuscapetTheme.textMuted;
    }
  }

  // ============ VISTA INVITADO ============
  Widget _buildGuest() {
    return Column(
      children: [
        TabBar(
          controller: _tabController,
          indicatorColor: BuscapetTheme.primary,
          labelColor: BuscapetTheme.primary,
          unselectedLabelColor: BuscapetTheme.textMuted,
          labelStyle: const TextStyle(
              fontFamily: 'Outfit', fontWeight: FontWeight.w700, fontSize: 13),
          tabs: [Tab(text: AppSettings.tr('login')), Tab(text: AppSettings.tr('register'))],
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: [_buildLoginTab(), _buildRegisterTab()],
          ),
        ),
      ],
    );
  }

  Widget _buildLoginTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const SizedBox(height: 16),
          const Text('🐾', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 8),
          Text(AppSettings.tr('welcome_title'),
              style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: BuscapetTheme.textMain)),
          const SizedBox(height: 4),
          Text(AppSettings.tr('welcome_sub'),
              style: const TextStyle(fontSize: 12, color: BuscapetTheme.textMuted)),
          const SizedBox(height: 24),

          // Google Sign In
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _signInGoogle,
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
                foregroundColor: BuscapetTheme.textMain,
                side: const BorderSide(color: BuscapetTheme.border),
                backgroundColor: BuscapetTheme.bgInput,
              ),
              icon: const Text('G', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
              label: Text(AppSettings.tr('login_with_google')),
            ),
          ),
          const SizedBox(height: 12),

          const Row(children: [
            Expanded(child: Divider(color: BuscapetTheme.border)),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 10),
              child: Text('o', style: TextStyle(color: BuscapetTheme.textMuted, fontSize: 12)),
            ),
            Expanded(child: Divider(color: BuscapetTheme.border)),
          ]),
          const SizedBox(height: 12),

          // Email
          TextField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
            decoration: InputDecoration(
              labelText: AppSettings.tr('email_label'),
              prefixIcon: const Icon(Icons.email_outlined, size: 18),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _passController,
            obscureText: true,
            style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
            decoration: InputDecoration(
              labelText: AppSettings.tr('password_label'),
              prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18),
            ),
          ),
          const SizedBox(height: 12),

          if (_error != null)
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: BuscapetTheme.danger.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: BuscapetTheme.danger.withValues(alpha: 0.3)),
              ),
              child: Text(_error!,
                  style: const TextStyle(
                      fontSize: 12, color: BuscapetTheme.danger)),
            ),
          if (_error != null) const SizedBox(height: 10),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _loading ? null : _signInEmail,
              child: _loading
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : Text(AppSettings.tr('login')),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRegisterTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const SizedBox(height: 16),
          Text(AppSettings.tr('register'),
              style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: BuscapetTheme.textMain)),
          const SizedBox(height: 20),
          TextField(
            controller: _nameController,
            style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
            decoration: InputDecoration(
              labelText: AppSettings.tr('name_label'),
              prefixIcon: const Icon(Icons.person_outline_rounded, size: 18),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _regEmailController,
            keyboardType: TextInputType.emailAddress,
            style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
            decoration: InputDecoration(
              labelText: AppSettings.tr('email_label'),
              prefixIcon: const Icon(Icons.email_outlined, size: 18),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _regPassController,
            obscureText: true,
            style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
            decoration: InputDecoration(
              labelText: AppSettings.tr('password_label'),
              prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18),
            ),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
            decoration: InputDecoration(
              labelText: AppSettings.tr('phone_label'),
              prefixIcon: const Icon(Icons.phone_outlined, size: 18),
            ),
          ),
          const SizedBox(height: 16),

          if (_error != null)
            Container(
              padding: const EdgeInsets.all(10),
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(
                color: BuscapetTheme.danger.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: BuscapetTheme.danger.withValues(alpha: 0.3)),
              ),
              child: Text(_error!,
                  style: const TextStyle(
                      fontSize: 12, color: BuscapetTheme.danger)),
            ),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _loading ? null : _register,
              style: ElevatedButton.styleFrom(
                  backgroundColor: BuscapetTheme.secondary),
              child: _loading
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(
                          strokeWidth: 2, color: Colors.white))
                  : Text(AppSettings.tr('register')),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(text,
          style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: BuscapetTheme.textMain)),
    );
  }

  // ============ HANDLERS ============
  Future<void> _signInGoogle() async {
    setState(() { _loading = true; _error = null; });
    try {
      final user = await _auth.signInWithGoogle();
      if (user != null && mounted) {
        widget.onLoginSuccess?.call();
      }
    } catch (e) {
      setState(() => _error = AuthService.translateError(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _signInEmail() async {
    setState(() { _loading = true; _error = null; });
    try {
      final user = await _auth.signInWithEmail(
        _emailController.text, _passController.text);
      if (user != null && mounted) {
        widget.onLoginSuccess?.call();
      }
    } catch (e) {
      setState(() => _error = AuthService.translateError(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _register() async {
    setState(() { _loading = true; _error = null; });
    try {
      final user = await _auth.registerWithEmail(
        name: _nameController.text,
        email: _regEmailController.text,
        password: _regPassController.text,
        whatsapp: _phoneController.text,
      );
      if (user != null && mounted) {
        widget.onLoginSuccess?.call();
      }
    } catch (e) {
      setState(() => _error = AuthService.translateError(e));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _handleSignOut() async {
    setState(() => _loading = true);
    await _auth.signOut();
    if (mounted) {
      setState(() {
        _loading = false;
        _error = null;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppSettings.tr('logout')),
          backgroundColor: BuscapetTheme.primary,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }
}
