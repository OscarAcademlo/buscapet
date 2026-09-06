// =============================================================================
// SERVICIO: AppSettings — Modo Claro/Oscuro e Idiomas (ES, EN, PT)
// =============================================================================

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppSettings {
  static final AppSettings _instance = AppSettings._internal();
  factory AppSettings() => _instance;
  AppSettings._internal();

  final ValueNotifier<ThemeMode> themeModeNotifier = ValueNotifier(ThemeMode.dark);
  final ValueNotifier<String> languageNotifier = ValueNotifier('es');

  // Datos de Cobro Dinámicos (Mercado Pago, PayPal, Precios)
  String mpAlias = 'oscar.stella.mp';
  String mpHolder = 'Oscar Nicolás Stella';
  String paypalEmail = 'oscarnicolasstella@yahoo.com.ar';
  double adPriceArs = 14000.0;
  String adPriceArsString = '\$14.000 ARS';

  bool get isDarkMode => themeModeNotifier.value == ThemeMode.dark;
  String get currentLanguage => languageNotifier.value;

  Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedLang = prefs.getString('buscapet_lang');
      if (savedLang != null && ['es', 'en', 'pt'].contains(savedLang)) {
        languageNotifier.value = savedLang;
      }
      final savedTheme = prefs.getString('buscapet_theme');
      if (savedTheme == 'light') {
        themeModeNotifier.value = ThemeMode.light;
      } else if (savedTheme == 'dark') {
        themeModeNotifier.value = ThemeMode.dark;
      }

      // Cargar configuraciones de pago
      mpAlias = prefs.getString('buscapet_mp_alias') ?? 'oscar.stella.mp';
      mpHolder = prefs.getString('buscapet_mp_holder') ?? 'Oscar Nicolás Stella';
      paypalEmail = prefs.getString('buscapet_paypal_email') ?? 'oscarnicolasstella@yahoo.com.ar';
      adPriceArs = prefs.getDouble('buscapet_ad_price') ?? 14000.0;
      adPriceArsString = '\$${adPriceArs.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')} ARS';
    } catch (_) {}
  }

  Future<void> savePaymentSettings({
    required String alias,
    required String holder,
    required String email,
    required double price,
  }) async {
    mpAlias = alias.trim();
    mpHolder = holder.trim();
    paypalEmail = email.trim();
    adPriceArs = price;
    adPriceArsString = '\$${adPriceArs.toInt().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')} ARS';

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('buscapet_mp_alias', mpAlias);
      await prefs.setString('buscapet_mp_holder', mpHolder);
      await prefs.setString('buscapet_paypal_email', paypalEmail);
      await prefs.setDouble('buscapet_ad_price', adPriceArs);
    } catch (_) {}
  }

  void toggleTheme() {
    final nextMode = themeModeNotifier.value == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    themeModeNotifier.value = nextMode;
    SharedPreferences.getInstance().then((p) => p.setString('buscapet_theme', nextMode.name)).catchError((_) => false);
  }

  void setLanguage(String lang) {
    if (['es', 'en', 'pt'].contains(lang)) {
      languageNotifier.value = lang;
      SharedPreferences.getInstance().then((p) => p.setString('buscapet_lang', lang)).catchError((_) => false);
    }
  }

  // Traductor central de strings
  static String tr(String key) {
    final lang = AppSettings().currentLanguage;
    final dict = _translations[key];
    if (dict != null && dict.containsKey(lang)) {
      return dict[lang]!;
    }
    return key;
  }

  static const Map<String, Map<String, String>> _translations = {
    'app_name': {'es': 'Buscapet', 'en': 'Buscapet', 'pt': 'Buscapet'},
    'home': {'es': 'Inicio', 'en': 'Home', 'pt': 'Início'},
    'search': {'es': 'Buscar', 'en': 'Search', 'pt': 'Buscar'},
    'publish': {'es': 'Publicar', 'en': 'Publish', 'pt': 'Publicar'},
    'messages': {'es': 'Mensajes', 'en': 'Messages', 'pt': 'Mensagens'},
    'profile': {'es': 'Perfil', 'en': 'Profile', 'pt': 'Perfil'},
    'guest': {'es': 'Invitado', 'en': 'Guest', 'pt': 'Convidado'},
    'guest_sub': {'es': 'Iniciá sesión para publicar', 'en': 'Log in to post and comment', 'pt': 'Entre para publicar'},
    'hero_title': {
      'es': 'Reuniendo Mascotas con sus Familias',
      'en': 'Reuniting Pets with their Families',
      'pt': 'Reunindo Pets com suas Famílias'
    },
    'report_my_lost': {
      'es': '🚨 Reportar mi perro perdido',
      'en': '🚨 Report my lost dog',
      'pt': '🚨 Reportar meu cão perdido'
    },
    'found_lost_street': {
      'es': '👀 Encontré perro perdido',
      'en': '👀 Found a lost dog',
      'pt': '👀 Encontrei cão perdido'
    },
    'see_adoptions': {
      'es': '💜 Ver Adopciones',
      'en': '💜 View Adoptions',
      'pt': '💜 Ver Adoções'
    },
    'give_adoption': {
      'es': '🏡 Ofrecer Adopción',
      'en': '🏡 Put up for Adoption',
      'pt': '🏡 Oferecer Adoção'
    },
    'ad_hero_btn': {
      'es': '📢 Publicitar mi Negocio o Veterinaria',
      'en': '📢 Advertise my Business or Vet Clinic',
      'pt': '📢 Anuncie sua Clínica ou Pet Shop'
    },
    'filter_location': {'es': '📍 Filtrar por Ubicación', 'en': '📍 Filter by Location', 'pt': '📍 Filtrar por Localização'},
    'country': {'es': 'País', 'en': 'Country', 'pt': 'País'},
    'province': {'es': 'Provincia / Estado', 'en': 'Province / State', 'pt': 'Província / Estado'},
    'city': {'es': 'Ciudad / Localidad', 'en': 'City / Locality', 'pt': 'Cidade / Localidade'},
    'all_countries': {'es': '🌎 Todos los países', 'en': '🌎 All countries', 'pt': '🌎 Todos os países'},
    'all_provinces': {'es': 'Todas las provincias', 'en': 'All provinces', 'pt': 'Todas as províncias'},
    'all_cities': {'es': 'Todas las ciudades', 'en': 'All cities', 'pt': 'Todas as cidades'},
    'all_pets': {'es': '🐾 Todas', 'en': '🐾 All', 'pt': '🐾 Todos'},
    'lost_pets': {'es': '🔴 Perdidas', 'en': '🔴 Lost', 'pt': '🔴 Perdidos'},
    'found_pets': {'es': '🟢 Encontradas', 'en': '🟢 Found', 'pt': '🟢 Encontrados'},
    'adopt_pets': {'es': '💜 Adopción', 'en': '💜 Adoption', 'pt': '💜 Adoção'},
    'spotted_pets': {'es': '👁️ Vistos en vía pública', 'en': '👁️ Spotted in public', 'pt': '👁️ Vistos na rua'},
    'contact': {'es': '💬 Contactar', 'en': '💬 Contact', 'pt': '💬 Contatar'},
    'already_found': {'es': '✔ ¡Ya fue encontrado!', 'en': '✔ Found!', 'pt': '✔ Já foi encontrado!'},
    'already_adopted': {'es': '🏡 ¡Ya fue adoptado!', 'en': '🏡 Adopted!', 'pt': '🏡 Já foi adotado!'},
    'comments': {'es': 'Comentarios', 'en': 'Comments', 'pt': 'Comentários'},
    'write_comment': {'es': 'Añadir un comentario...', 'en': 'Add a comment...', 'pt': 'Adicionar um comentário...'},
    'no_comments': {'es': 'Aún no hay comentarios. ¡Sé el primero!', 'en': 'No comments yet. Be the first!', 'pt': 'Ainda não há comentários. Seja o primeiro!'},
    'dark_mode': {'es': 'Modo Oscuro', 'en': 'Dark Mode', 'pt': 'Modo Escuro'},
    'light_mode': {'es': 'Modo Claro', 'en': 'Light Mode', 'pt': 'Modo Claro'},
    'theme_setting': {'es': 'Tema Visual', 'en': 'Visual Theme', 'pt': 'Tema Visual'},
    'language': {'es': 'Idioma', 'en': 'Language', 'pt': 'Idioma'},
    'logout': {'es': 'Cerrar Sesión', 'en': 'Log Out', 'pt': 'Sair'},
    'login': {'es': 'Iniciar Sesión', 'en': 'Log In', 'pt': 'Entrar'},
    'register': {'es': 'Registrarse', 'en': 'Sign Up', 'pt': 'Cadastrar-se'},
    'apply_filter': {'es': 'Aplicar Filtro', 'en': 'Apply Filter', 'pt': 'Aplicar Filtro'},
    'reset_filter': {'es': 'Restablecer', 'en': 'Reset', 'pt': 'Redefinir'},
    'see_world': {'es': 'Ver Todo el Mundo', 'en': 'View Worldwide', 'pt': 'Ver Todo o Mundo'},
    'community_impact': {'es': 'Impacto Comunitario', 'en': 'Community Impact', 'pt': 'Impacto Comunitário'},
    'search_tips': {'es': 'Consejos de Búsqueda', 'en': 'Search Tips', 'pt': 'Dicas de Busca'},
    'ad_title': {'es': '¿Tenés una Veterinaria o Pet Shop?', 'en': 'Do you own a Vet or Pet Shop?', 'pt': 'Tem uma Veterinária ou Pet Shop?'},
    'ad_desc': {'es': 'Anunciá en Buscapet para llegar a miles de familias.', 'en': 'Advertise on Buscapet to reach thousands of families.', 'pt': 'Anuncie no Buscapet para alcançar milhares de famílias.'},
    'no_posts': {'es': 'No hay publicaciones en esta ubicación', 'en': 'No posts in this location', 'pt': 'Não há publicações nesta localização'},
    'be_first_post': {'es': 'Sé el primero en reportar o publicar una mascota', 'en': 'Be the first to report or post a pet', 'pt': 'Seja o primeiro a reportar ou postar um pet'},
    'publish_pet': {'es': '📢 Publicar Mascota', 'en': '📢 Post a Pet', 'pt': '📢 Publicar Pet'},
    'change_city': {'es': 'Cambiar Ciudad ▾', 'en': 'Change City ▾', 'pt': 'Mudar Cidade ▾'},
    'get_app_title': {'es': 'Llevá Buscapet en tu celular', 'en': 'Get Buscapet on Mobile', 'pt': 'Baixe o Buscapet no celular'},
    'get_app_subtitle': {'es': 'Publicá reportes al instante con GPS desde la calle.', 'en': 'Post instant GPS reports right from the street.', 'pt': 'Publique relatos instantâneos com GPS direto da rua.'},
    'android_app_soon': {'es': '🤖 Android App (Próximamente)', 'en': '🤖 Android App (Coming Soon)', 'pt': '🤖 Android App (Em Breve)'},
    'ios_app_soon': {'es': '🍏 iOS App (Próximamente)', 'en': '🍏 iOS App (Coming Soon)', 'pt': '🍏 iOS App (Em Breve)'},
    'support_buscapet': {'es': 'Apoyar a Buscapet ☕', 'en': 'Support Buscapet ☕', 'pt': 'Apoie o Buscapet ☕'},
    'support_desc': {'es': 'Buscapet es 100% gratuita y sin fines de lucro. Tu cafecito nos ayuda a costear servidores.', 'en': 'Buscapet is 100% free and community-driven. Your coffee helps us cover servers and map costs.', 'pt': 'O Buscapet é 100% gratuito. Seu cafezinho nos ajuda a manter os servidores.'},
    'donate_coffee': {'es': 'Donar un Cafecito', 'en': 'Buy Us a Coffee', 'pt': 'Pagar um Cafezinho'},
    'my_posts': {'es': '📋 Mis Publicaciones', 'en': '📋 My Posts', 'pt': '📋 Minhas Publicações'},
    'no_my_posts': {'es': 'No tenés publicaciones aún.', 'en': 'You have no posts yet.', 'pt': 'Você ainda não tem publicações.'},
    'welcome_title': {'es': 'Bienvenido a Buscapet', 'en': 'Welcome to Buscapet', 'pt': 'Bem-vindo ao Buscapet'},
    'welcome_sub': {'es': 'Iniciá sesión para reportar y comentar', 'en': 'Sign in to report pets and comment', 'pt': 'Entre para reportar e comentar'},
    'login_with_google': {'es': 'Continuar con Google', 'en': 'Continue with Google', 'pt': 'Continuar com o Google'},
    'email_label': {'es': 'Correo electrónico', 'en': 'Email address', 'pt': 'E-mail'},
    'password_label': {'es': 'Contraseña', 'en': 'Password', 'pt': 'Senha'},
    'name_label': {'es': 'Nombre y Apellido', 'en': 'Full Name', 'pt': 'Nome Completo'},
    'phone_label': {'es': 'WhatsApp / Teléfono (opcional)', 'en': 'WhatsApp / Phone (optional)', 'pt': 'WhatsApp / Telefone (opcional)'},
    'request_ad': {'es': 'Solicitar Publicidad', 'en': 'Request Advertising', 'pt': 'Solicitar Publicidade'},
    'request_ad_desc': {'es': '¿Tenés una veterinaria, pet shop o servicio? Publicá tu anuncio en la app.', 'en': 'Do you own a vet clinic, pet shop or pet service? Place your sponsored banner here.', 'pt': 'Tem clínica veterinária ou pet shop? Divulgue seu anúncio aqui.'},
    'verified': {'es': 'Verificado ✔', 'en': 'Verified ✔', 'pt': 'Verificado ✔'},
    'share': {'es': 'Compartir', 'en': 'Share', 'pt': 'Compartilhar'},
    'website': {'es': 'Sitio Web', 'en': 'Website', 'pt': 'Site Oficial'},
    'sponsored_ad_badge': {'es': 'PUBLICIDAD PATROCINADA', 'en': 'SPONSORED AD', 'pt': 'PUBLICIDADE PATROCINADA'},
  };
}
