// =============================================================================
// PANTALLA PRINCIPAL — HomeScreen (Responsive: Escritorio estilo Facebook/Instagram + Móvil)
// =============================================================================

import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../theme.dart';
import '../services/firestore_service.dart';
import '../services/auth_service.dart';
import '../services/app_settings.dart';
import '../models/pet_post.dart';
import '../models/sponsored_ad.dart';
import '../widgets/pet_card.dart';
import '../widgets/sponsored_ad_card.dart';
import '../widgets/filter_panel.dart';
import '../widgets/ad_request_modal.dart';
import '../widgets/donation_modal.dart';
import '../widgets/user_avatar.dart';
import 'report_screen.dart';
import 'profile_screen.dart';
import 'chat_screen.dart';
import 'admin_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _auth = AuthService();
  final _firestore = FirestoreService();
  final _settings = AppSettings();

  int _currentTab = 0;
  String _filterType = 'all';
  String _filterCountry = 'AR';
  String _filterState = '';
  String _filterCity = '';

  final List<_NavItem> _navItems = const [
    _NavItem(icon: Icons.home_rounded, label: 'home'),
    _NavItem(icon: Icons.search_rounded, label: 'search'),
    _NavItem(icon: Icons.add_circle_rounded, label: 'publish', isAction: true),
    _NavItem(icon: Icons.chat_bubble_outline_rounded, label: 'messages'),
    _NavItem(icon: Icons.person_outline_rounded, label: 'profile'),
  ];

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<String>(
      valueListenable: _settings.languageNotifier,
      builder: (context, currentLang, _) {
        final screenWidth = MediaQuery.of(context).size.width;
        final isDesktop = screenWidth >= 850;

        return Scaffold(
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          appBar: _buildAppBar(isDesktop),
          body: isDesktop ? _buildDesktopLayout() : _buildMobileLayout(),
          bottomNavigationBar: isDesktop ? null : _buildBottomNav(),
        );
      },
    );
  }

  // ============ APPBAR ============
  PreferredSizeWidget _buildAppBar(bool isDesktop) {
    return AppBar(
      backgroundColor: Theme.of(context).appBarTheme.backgroundColor ?? BuscapetTheme.bgCard,
      elevation: 0.5,
      titleSpacing: 12,
      title: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('🐾', style: TextStyle(fontSize: 19)),
          const SizedBox(width: 4),
          Text(
            'Buscapet',
            style: TextStyle(
              fontFamily: 'Outfit',
              fontWeight: FontWeight.w800,
              fontSize: 18,
              foreground: Paint()
                ..shader = const LinearGradient(colors: [
                  BuscapetTheme.primary,
                  Color(0xFFFF8C69),
                ]).createShader(const Rect.fromLTWH(0, 0, 100, 20)),
            ),
          ),
          if (isDesktop) ...[
            const SizedBox(width: 20),
            Container(
              width: 240,
              height: 36,
              padding: const EdgeInsets.symmetric(horizontal: 10),
              decoration: BoxDecoration(
                color: BuscapetTheme.bgInput,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: BuscapetTheme.border),
              ),
              child: Row(
                children: [
                  const Icon(Icons.search_rounded, size: 16, color: BuscapetTheme.textMuted),
                  const SizedBox(width: 8),
                  Text(AppSettings.tr('search'),
                      style: const TextStyle(fontSize: 12, color: BuscapetTheme.textMuted)),
                ],
              ),
            ),
          ],
        ],
      ),
      actions: [
        // Selector de Idioma en Header
        ValueListenableBuilder<String>(
          valueListenable: _settings.languageNotifier,
          builder: (context, lang, _) {
            return PopupMenuButton<String>(
              tooltip: AppSettings.tr('language'),
              offset: const Offset(0, 40),
              color: BuscapetTheme.bgInput,
              padding: EdgeInsets.zero,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      lang == 'en' ? '🇺🇸' : (lang == 'pt' ? '🇧🇷' : '🇦🇷'),
                      style: const TextStyle(fontSize: 14),
                    ),
                    const Icon(Icons.arrow_drop_down, size: 14, color: BuscapetTheme.textMuted),
                  ],
                ),
              ),
              onSelected: (val) {
                _settings.setLanguage(val);
                setState(() {});
              },
              itemBuilder: (_) => const [
                PopupMenuItem(value: 'es', child: Text('🇦🇷 Español (ES)', style: TextStyle(fontSize: 13))),
                PopupMenuItem(value: 'en', child: Text('🇺🇸 English (EN)', style: TextStyle(fontSize: 13))),
                PopupMenuItem(value: 'pt', child: Text('🇧🇷 Português (PT)', style: TextStyle(fontSize: 13))),
              ],
            );
          },
        ),

        // Switch Modo Oscuro / Claro en Header
        ValueListenableBuilder<ThemeMode>(
          valueListenable: _settings.themeModeNotifier,
          builder: (context, mode, _) {
            final isDark = mode == ThemeMode.dark;
            return IconButton(
              padding: const EdgeInsets.all(4),
              constraints: const BoxConstraints(),
              icon: Icon(
                isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                color: isDark ? const Color(0xFFFBBF24) : BuscapetTheme.primary,
                size: 19,
              ),
              tooltip: isDark ? AppSettings.tr('light_mode') : AppSettings.tr('dark_mode'),
              onPressed: () => _settings.toggleTheme(),
            );
          },
        ),
        const SizedBox(width: 4),

        // Botón Admin (para Oscar) o Botón Publicar en escritorio
        StreamBuilder<User?>(
          stream: FirebaseAuth.instance.authStateChanges(),
          builder: (context, snap) {
            final user = snap.data;
            if (user?.email == AuthService.adminEmail) {
              return IconButton(
                padding: const EdgeInsets.all(4),
                constraints: const BoxConstraints(),
                icon: const Icon(Icons.shield_rounded, size: 20, color: BuscapetTheme.warning),
                tooltip: 'Panel Admin',
                onPressed: () => _openAdmin(),
              );
            } else if (isDesktop) {
              return TextButton.icon(
                onPressed: () => _openReport('lost'),
                icon: const Icon(Icons.add_circle_outline_rounded, size: 14, color: BuscapetTheme.primary),
                label: Text(AppSettings.tr('publish'),
                    style: const TextStyle(
                        color: BuscapetTheme.primary,
                        fontWeight: FontWeight.w800,
                        fontSize: 11)),
                style: TextButton.styleFrom(
                  backgroundColor: BuscapetTheme.primary.withValues(alpha: 0.12),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              );
            } else {
              return const SizedBox.shrink();
            }
          },
        ),
        const SizedBox(width: 4),

        // Botón Donar / Cafecito
        IconButton(
          padding: const EdgeInsets.all(4),
          constraints: const BoxConstraints(),
          icon: const Icon(Icons.coffee_rounded, size: 22, color: Color(0xFFF59E0B)),
          tooltip: 'Invitanos un Cafecito (Donar)',
          onPressed: _openDonationModal,
        ),
        const SizedBox(width: 4),

        // Botón Publicidad en Barra Superior
        IconButton(
          padding: const EdgeInsets.all(4),
          constraints: const BoxConstraints(),
          icon: const Icon(Icons.campaign_outlined, size: 22, color: BuscapetTheme.warning),
          tooltip: 'Publicitar Negocio',
          onPressed: _openAdRequest,
        ),
        const SizedBox(width: 6),

        // Avatar usuario
        StreamBuilder<User?>(
          stream: FirebaseAuth.instance.authStateChanges(),
          builder: (context, snap) {
            final user = snap.data;
            if (user == null) {
              return IconButton(
                padding: const EdgeInsets.all(4),
                constraints: const BoxConstraints(),
                icon: const Icon(Icons.account_circle_outlined, size: 22),
                onPressed: () => _goToProfile(),
              );
            }
            return Padding(
              padding: const EdgeInsets.only(right: 10, left: 2),
              child: UserAvatar(
                photoUrl: user.photoURL,
                name: user.displayName ?? user.email,
                radius: 14,
                onTap: () => _goToProfile(),
              ),
            );
          },
        ),
      ],
    );
  }

  // ============ LAYOUT ESCRITORIO ============
  Widget _buildDesktopLayout() {
    final screenWidth = MediaQuery.of(context).size.width;
    final showRightSidebar = screenWidth >= 1100;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Columna Izquierda: Sidebar de Navegación + Filtros (270px)
        SizedBox(
          width: 270,
          child: _buildDesktopLeftSidebar(),
        ),

        const VerticalDivider(width: 1, color: BuscapetTheme.border),

        // Columna Central: Feed Principal (~680px centrado)
        Expanded(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 680),
              child: _currentTab == 0 ? _buildFeedBody() : _buildTabBody(),
            ),
          ),
        ),

        // Columna Derecha: Apoyo / Cafecito / App Móvil / Tips (290px)
        if (showRightSidebar) ...[
          const VerticalDivider(width: 1, color: BuscapetTheme.border),
          SizedBox(
            width: 290,
            child: _buildDesktopRightSidebar(),
          ),
        ],
      ],
    );
  }

  // ============ LAYOUT MÓVIL ============
  Widget _buildMobileLayout() {
    return _currentTab == 0 ? _buildFeedBody() : _buildTabBody();
  }

  // ============ SIDEBAR IZQUIERDO ============
  Widget _buildDesktopLeftSidebar() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Perfil usuario mini
          StreamBuilder<User?>(
            stream: FirebaseAuth.instance.authStateChanges(),
            builder: (context, snap) {
              final user = snap.data;
              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: BuscapetTheme.bgInput,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: BuscapetTheme.border),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundImage: user?.photoURL != null ? NetworkImage(user!.photoURL!) : null,
                      backgroundColor: BuscapetTheme.border,
                      child: user?.photoURL == null
                          ? const Icon(Icons.person_rounded, size: 20, color: BuscapetTheme.textMuted)
                          : null,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.displayName ?? (user != null ? AppSettings.tr('profile') : 'Invitado'),
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: BuscapetTheme.textMain,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            user?.email ?? 'Iniciá sesión para publicar',
                            style: const TextStyle(fontSize: 11, color: BuscapetTheme.textMuted),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 16),

          // Botón destacado Publicar Mascota
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _openReport('lost'),
              icon: const Icon(Icons.add_circle_outline_rounded, size: 18),
              label: Text(AppSettings.tr('publish_pet')),
              style: ElevatedButton.styleFrom(
                backgroundColor: BuscapetTheme.primary,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Menú de Navegación Vertical
          _desktopNavItem(icon: Icons.home_rounded, label: AppSettings.tr('home'), index: 0),
          _desktopNavItem(icon: Icons.search_rounded, label: AppSettings.tr('search'), index: 1),
          _desktopNavItem(icon: Icons.chat_bubble_outline_rounded, label: AppSettings.tr('messages'), index: 3),
          _desktopNavItem(icon: Icons.person_outline_rounded, label: AppSettings.tr('profile'), index: 4),

          const SizedBox(height: 10),

          // Botón destacado Donar un Cafecito
          InkWell(
            onTap: _openDonationModal,
            borderRadius: BorderRadius.circular(10),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFFF59E0B).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.35)),
              ),
              child: const Row(
                children: [
                  Text('☕', style: TextStyle(fontSize: 16)),
                  SizedBox(width: 12),
                  Text(
                    'Donar un Cafecito',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFFF59E0B),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 16),
          const Divider(height: 1),
          const SizedBox(height: 14),

          // Filtros de Ubicación
          Text(AppSettings.tr('filter_location'),
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: BuscapetTheme.textMain)),
          const SizedBox(height: 8),
          FilterPanel(
            country: _filterCountry,
            state: _filterState,
            city: _filterCity,
            onApply: (country, state, city) {
              setState(() {
                _filterCountry = country;
                _filterState = state;
                _filterCity = city;
                _currentTab = 0;
              });
            },
            onReset: () {
              setState(() {
                _filterCountry = 'AR';
                _filterState = '';
                _filterCity = '';
                _currentTab = 0;
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _desktopNavItem({required IconData icon, required String label, required int index}) {
    final isSelected = _currentTab == index;
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: InkWell(
        onTap: () => setState(() => _currentTab = index),
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? BuscapetTheme.primary.withValues(alpha: 0.15) : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            border: isSelected ? Border.all(color: BuscapetTheme.primary.withValues(alpha: 0.3)) : null,
          ),
          child: Row(
            children: [
              Icon(icon, size: 20, color: isSelected ? BuscapetTheme.primary : BuscapetTheme.textMuted),
              const SizedBox(width: 12),
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  color: isSelected ? BuscapetTheme.primary : BuscapetTheme.textLight,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }



  // ============ FEED BODY ===========  // ============ HERO BANNER CON LOS 4 BOTONES Y SELECTOR DE UBICACIÓN INTEGRADO ============
  Widget _buildHeroBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            BuscapetTheme.bgCard,
            BuscapetTheme.bgMain.withValues(alpha: 0.95),
          ],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            AppSettings.tr('hero_title'),
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: BuscapetTheme.textMain,
            ),
          ),
          const SizedBox(height: 8),

          // 4 BOTONES SIMÉTRICOS CON INMEDIATA RESPUESTA AL TACTO (INSTANT TAP)
          Row(
            children: [
              Expanded(
                child: _heroBtn(
                  AppSettings.tr('report_my_lost'),
                  BuscapetTheme.danger,
                  () => _openReport('lost'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _heroBtn(
                  AppSettings.tr('found_lost_street'),
                  BuscapetTheme.success,
                  () => _openReport('found'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: _heroBtn(
                  AppSettings.tr('see_adoptions'),
                  BuscapetTheme.adopt,
                  () => setState(() => _filterType = 'adopt'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _heroBtn(
                  AppSettings.tr('give_adoption'),
                  const Color(0xFF10B981),
                  () => _openReport('adopt'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // BOTÓN DESTACADO: PUBLICAR PUBLICIDAD / ANUNCIAR NEGOCIO
          Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(10),
              onTap: _openAdRequest,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFF59E0B), Color(0xFFD97706)],
                  ),
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFF59E0B).withValues(alpha: 0.35),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.campaign_rounded, size: 17, color: Colors.white),
                    SizedBox(width: 8),
                    Text(
                      '📢 Publicitar mi Negocio o Veterinaria (\$14.000 ARS)',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                      ),
                    ),
                    SizedBox(width: 6),
                    Icon(Icons.arrow_forward_ios_rounded, size: 10, color: Colors.white70),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: 8),

          // SELECTOR DE UBICACIÓN RÁPIDO INTEGRADO EN EL BANNER
          Material(
            color: Colors.transparent,
            child: InkWell(
              borderRadius: BorderRadius.circular(10),
              onTap: () => _showFilterSheet(),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                decoration: BoxDecoration(
                  color: BuscapetTheme.bgInput,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: BuscapetTheme.border),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.place_rounded, size: 16, color: BuscapetTheme.primary),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        _filterCity.isNotEmpty
                            ? '📍 $_filterCity, $_filterState'
                            : (_filterState.isNotEmpty
                                ? '📍 $_filterState, ${_filterCountry.toUpperCase()}'
                                : (_filterCountry.isNotEmpty ? '📍 ${_filterCountry.toUpperCase()}' : '🌎 Todo el mundo')),
                        style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: BuscapetTheme.textMain),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(
                      AppSettings.tr('change_city'),
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.primary),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _heroBtn(String label, Color color, VoidCallback onTap) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 9, horizontal: 8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: color.withValues(alpha: 0.35)),
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 11.5,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryChips() {
    final categories = [
      ('all', AppSettings.tr('all_pets'), Colors.white),
      ('lost', AppSettings.tr('lost_pets'), BuscapetTheme.danger),
      ('found', AppSettings.tr('found_pets'), BuscapetTheme.success),
      ('adopt', AppSettings.tr('adopt_pets'), BuscapetTheme.adopt),
      ('spotted', AppSettings.tr('spotted_pets'), BuscapetTheme.warning),
    ];

    return Container(
      color: Theme.of(context).cardColor,
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        child: Row(
          children: categories.map((cat) {
            final isSelected = _filterType == cat.$1;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () => setState(() => _filterType = cat.$1),
                  borderRadius: BorderRadius.circular(20),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: isSelected ? cat.$3.withValues(alpha: 0.2) : BuscapetTheme.bgInput,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected ? cat.$3 : BuscapetTheme.border,
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: Text(
                      cat.$2,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                        color: isSelected ? cat.$3 : BuscapetTheme.textMuted,
                      ),
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }         ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildFeed() {
    return StreamBuilder<List<PetPost>>(
      stream: _firestore.postsStream(
        filterType: _filterType == 'all' ? null : _filterType,
        filterCountry: _filterCountry.isEmpty ? null : _filterCountry,
        filterState: _filterState.isEmpty ? null : _filterState,
        filterCity: _filterCity.isEmpty ? null : _filterCity,
      ),
      builder: (context, snapshot) {
        final isLoading = snapshot.connectionState == ConnectionState.waiting;
        final hasError = snapshot.hasError;
        final posts = snapshot.data ?? [];

        return StreamBuilder<List<SponsoredAd>>(
          stream: _firestore.sponsoredAdsStream(),
          builder: (context, adSnapshot) {
            final adsFromDb = adSnapshot.data ?? [];
            final ads = adsFromDb.isNotEmpty ? adsFromDb : demoSponsoredAds;

            final List<Widget> items = [];

            // 0. Hero Banner
            items.add(_buildHeroBanner());

            // 1. Chips de Categorías
            items.add(
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildCategoryChips(),
                  const Divider(height: 1),
                  const SizedBox(height: 8),
                ],
              ),
            );

            // 2. Estados de Carga / Error / Vacío
            if (isLoading) {
              items.add(
                Padding(
                  padding: const EdgeInsets.only(top: 30),
                  child: _buildLoading(),
                ),
              );
            } else if (hasError) {
              items.add(
                Padding(
                  padding: const EdgeInsets.only(top: 30),
                  child: _buildError(snapshot.error.toString()),
                ),
              );
            } else if (posts.isEmpty) {
              items.add(
                Padding(
                  padding: const EdgeInsets.only(top: 20),
                  child: _buildEmpty(),
                ),
              );
              if (ads.isNotEmpty) {
                items.add(
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    child: SponsoredAdCard(ad: ads[0]),
                  ),
                );
              }
            } else {
              // 3. Posts intercalados con SponsoredAdCard cada 3 publicaciones
              for (int i = 0; i < posts.length; i++) {
                items.add(
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: PetCard(
                      post: posts[i],
                      onRefresh: () => setState(() {}),
                    ),
                  ),
                );

                if ((i + 1) % 3 == 0 || (posts.length <= 2 && i == 0)) {
                  final adIndex = ((i + 1) ~/ 3) % ads.length;
                  items.add(
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: SponsoredAdCard(ad: ads[adIndex]),
                    ),
                  );
                }
              }
            }

            return ListView.builder(
              padding: EdgeInsets.zero,
              itemCount: items.length,
              itemBuilder: (context, index) => items[index],
            );
          },
        );
      },
    );
  }


  void _openDonationModal() {
    showDialog(
      context: context,
      builder: (_) => const DonationModal(),
    );
  }

  void _openAdRequest() {
    showDialog(
      context: context,
      builder: (_) => const AdRequestModal(),
    );
  }

  // ============ SIDEBAR DERECHO ============
  Widget _buildDesktopRightSidebar() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ☕ TARJETA CAFECITO / APOYAR A BUSCAPET (MERCADO PAGO / PAYPAL)
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF262015), Color(0xFF1B1710)],
              ),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.5)),
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
                const Row(
                  children: [
                    Text('☕', style: TextStyle(fontSize: 18)),
                    SizedBox(width: 8),
                    Text(
                      'Apoyar a Buscapet',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFFF59E0B),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Buscapet es 100% gratuita y sin fines de lucro. Tu cafecito nos ayuda a costear servidores y mapas online.',
                  style: TextStyle(fontSize: 11.5, color: BuscapetTheme.textMuted, height: 1.35),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _openDonationModal,
                    icon: const Icon(Icons.coffee_rounded, size: 16, color: Colors.black87),
                    label: const Text(
                      'Donar un Cafecito',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.black87),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF59E0B),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Tarjeta Descargar App Móvil
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1E2433), Color(0xFF181C28)],
              ),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: BuscapetTheme.primary.withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.phone_iphone_rounded, size: 16, color: BuscapetTheme.primary),
                    const SizedBox(width: 6),
                    Text(AppSettings.tr('get_app_title'),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: BuscapetTheme.textMain)),
                  ],
                ),
                const SizedBox(height: 6),
                Text(AppSettings.tr('get_app_subtitle'),
                    style: const TextStyle(fontSize: 11, color: BuscapetTheme.textMuted)),
                const SizedBox(height: 10),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('📲 Google Play Store'),
                          backgroundColor: BuscapetTheme.primary,
                        ),
                      );
                    },
                    icon: const Icon(Icons.android_rounded, size: 16, color: Color(0xFF10B981)),
                    label: Text(AppSettings.tr('android_app_soon'),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      side: const BorderSide(color: Color(0xFF10B981)),
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('🍏 Apple App Store'),
                          backgroundColor: BuscapetTheme.secondary,
                        ),
                      );
                    },
                    icon: const Icon(Icons.apple_rounded, size: 16, color: Colors.white),
                    label: Text(AppSettings.tr('ios_app_soon'),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      side: const BorderSide(color: Colors.white60),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Impacto Comunitario
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: BuscapetTheme.bgInput,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: BuscapetTheme.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.volunteer_activism_rounded, size: 16, color: BuscapetTheme.primary),
                    const SizedBox(width: 6),
                    Text(AppSettings.tr('community_impact'),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: BuscapetTheme.textMain)),
                  ],
                ),
                const SizedBox(height: 10),
                const Text('🎉 +120 Mascotas Reunidas',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: BuscapetTheme.success)),
                const SizedBox(height: 4),
                const Text('🏡 +85 Adopciones Felices',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: BuscapetTheme.adopt)),
                const SizedBox(height: 4),
                const Text('❤️ Red 100% Solidaria y Gratuita',
                    style: TextStyle(fontSize: 11, color: BuscapetTheme.textMuted)),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Consejos de Búsqueda
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: BuscapetTheme.bgInput,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: BuscapetTheme.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.lightbulb_outline_rounded, size: 16, color: BuscapetTheme.warning),
                    const SizedBox(width: 6),
                    Text(AppSettings.tr('search_tips'),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: BuscapetTheme.textMain)),
                  ],
                ),
                const SizedBox(height: 8),
                const Text('1. Publicá fotos claras y de cuerpo entero.',
                    style: TextStyle(fontSize: 11.5, color: BuscapetTheme.textLight)),
                const SizedBox(height: 4),
                const Text('2. Indicá referencias exactas (esquinas, plazas).',
                    style: TextStyle(fontSize: 11.5, color: BuscapetTheme.textLight)),
                const SizedBox(height: 4),
                const Text('3. Compartí la publicación en redes vecinales.',
                    style: TextStyle(fontSize: 11.5, color: BuscapetTheme.textLight)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoading() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Column(
        children: List.generate(
          3,
          (_) => Container(
            height: 240,
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: BuscapetTheme.bgCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: BuscapetTheme.border),
            ),
            child: const Center(
              child: CircularProgressIndicator(color: BuscapetTheme.primary),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('🐾', style: TextStyle(fontSize: 48)),
          const SizedBox(height: 12),
          Text(AppSettings.tr('no_posts'),
              style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: BuscapetTheme.textMain)),
          const SizedBox(height: 8),
          Text(AppSettings.tr('be_first_post'),
              style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMuted)),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () => _openReport('lost'),
            child: Text(AppSettings.tr('publish_pet')),
          ),
        ],
      ),
    );
  }

  Widget _buildError(String error) {
    return Center(
      child: Text('Error: $error',
          style: const TextStyle(color: BuscapetTheme.danger)),
    );
  }

  Widget _buildTabBody() {
    switch (_currentTab) {
      case 1:
        return _buildSearchTab();
      case 3:
        return const ChatScreen();
      case 4:
        return ProfileScreen(
          onLoginSuccess: () {
            setState(() {
              _currentTab = 0;
            });
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('🎉 ¡Bienvenido a Buscapet!'),
                backgroundColor: BuscapetTheme.success,
                duration: Duration(seconds: 3),
              ),
            );
          },
        );
      default:
        return const SizedBox();
    }
  }

  Widget _buildSearchTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(AppSettings.tr('search'),
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: BuscapetTheme.textMain)),
          const SizedBox(height: 12),
          FilterPanel(
            country: _filterCountry,
            state: _filterState,
            city: _filterCity,
            onApply: (country, state, city) {
              setState(() {
                _filterCountry = country;
                _filterState = state;
                _filterCity = city;
                _currentTab = 0;
              });
            },
            onReset: () => setState(() {
              _filterCountry = 'AR';
              _filterState = '';
              _filterCity = '';
              _currentTab = 0;
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    final navLabels = [
      AppSettings.tr('home'),
      AppSettings.tr('search'),
      AppSettings.tr('publish'),
      AppSettings.tr('messages'),
      AppSettings.tr('profile'),
    ];

    return Container(
      decoration: const BoxDecoration(
        color: BuscapetTheme.bgCard,
        border: Border(top: BorderSide(color: BuscapetTheme.border)),
      ),
      child: SafeArea(
        child: Row(
          children: List.generate(_navItems.length, (i) {
            final item = _navItems[i];
            if (item.isAction) {
              return Expanded(
                child: GestureDetector(
                  onTap: () => _openReport('lost'),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        margin: const EdgeInsets.symmetric(vertical: 6),
                        width: 46,
                        height: 46,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: [BuscapetTheme.primary, Color(0xFFFF8C69)],
                          ),
                        ),
                        child: const Icon(Icons.add_rounded,
                            color: Colors.white, size: 28),
                      ),
                      Text(navLabels[i],
                          style: const TextStyle(
                              fontSize: 10,
                              color: BuscapetTheme.primary,
                              fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
              );
            }
            final isSelected = _currentTab == i;
            return Expanded(
              child: GestureDetector(
                onTap: () => setState(() => _currentTab = i),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Icon(item.icon,
                          size: 22,
                          color: isSelected
                              ? BuscapetTheme.primary
                              : BuscapetTheme.textMuted),
                    ),
                    Text(navLabels[i],
                        style: TextStyle(
                            fontSize: 10,
                            color: isSelected
                                ? BuscapetTheme.primary
                                : BuscapetTheme.textMuted,
                            fontWeight: isSelected
                                ? FontWeight.w700
                                : FontWeight.w500)),
                  ],
                ),
              ),
            );
          }),
        ),
      ),
    );
  }

  void _openReport(String type) {
    if (!_auth.isLoggedIn) {
      _goToProfile();
      return;
    }
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => ReportScreen(initialType: type)),
    );
  }

  void _goToProfile() {
    setState(() => _currentTab = 4);
  }

  void _openAdmin() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const AdminScreen()),
    );
  }

  void _showFilterSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: BuscapetTheme.bgCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => DraggableScrollableSheet(
        initialChildSize: 0.65,
        maxChildSize: 0.92,
        expand: false,
        builder: (_, controller) => FilterPanel(
          country: _filterCountry,
          state: _filterState,
          city: _filterCity,
          onApply: (country, state, city) {
            setState(() {
              _filterCountry = country;
              _filterState = state;
              _filterCity = city;
            });
            Navigator.pop(context);
          },
          onReset: () {
            setState(() {
              _filterCountry = 'AR';
              _filterState = '';
              _filterCity = '';
            });
            Navigator.pop(context);
          },
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final String label;
  final bool isAction;
  const _NavItem({required this.icon, required this.label, this.isAction = false});
}
