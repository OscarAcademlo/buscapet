// =============================================================================
// BUSCAPET — THEME & COLORS (idéntico al diseño web)
// =============================================================================

import 'package:flutter/material.dart';

class BuscapetTheme {
  // Colores principales (mismo que --primary, --success, etc. del CSS)
  static const Color primary = Color(0xFFFF5A5F);
  static const Color secondary = Color(0xFF00A699);
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFFFAA00);
  static const Color danger = Color(0xFFEF4444);
  static const Color adopt = Color(0xFF8B5CF6);

  // Fondo y superficies
  static const Color bgMain = Color(0xFF12141C);
  static const Color bgCard = Color(0xFF1A1D27);
  static const Color bgInput = Color(0xFF22263A);
  static const Color border = Color(0xFF2A2F45);

  // Texto
  static const Color textMain = Color(0xFFECF0F1);
  static const Color textMuted = Color(0xFF7F8C9A);
  static const Color textLight = Color(0xFFB0BAC4);

  static ThemeData get theme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: bgMain,
        fontFamily: 'Outfit',
        colorScheme: const ColorScheme.dark(
          primary: primary,
          secondary: secondary,
          surface: bgCard,
          error: danger,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: bgCard,
          foregroundColor: textMain,
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            fontFamily: 'Outfit',
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: textMain,
          ),
        ),
        cardTheme: CardThemeData(
          color: bgCard,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: border),
          ),
          margin: const EdgeInsets.only(bottom: 12),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: bgInput,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: primary, width: 1.5),
          ),
          labelStyle: const TextStyle(color: textMuted, fontFamily: 'Outfit'),
          hintStyle: const TextStyle(color: textMuted, fontFamily: 'Outfit'),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: primary,
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            textStyle: const TextStyle(
              fontFamily: 'Outfit',
              fontWeight: FontWeight.w700,
              fontSize: 14,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: bgCard,
          selectedItemColor: primary,
          unselectedItemColor: textMuted,
          type: BottomNavigationBarType.fixed,
          selectedLabelStyle: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.w700, fontSize: 11),
          unselectedLabelStyle: TextStyle(fontFamily: 'Outfit', fontSize: 11),
        ),
        dividerTheme: const DividerThemeData(color: border, space: 1),
        chipTheme: ChipThemeData(
          backgroundColor: bgInput,
          labelStyle: const TextStyle(fontFamily: 'Outfit', color: textMain, fontSize: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          side: const BorderSide(color: border),
        ),
      );

  static ThemeData get lightTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF3F4F6),
        fontFamily: 'Outfit',
        colorScheme: const ColorScheme.light(
          primary: primary,
          secondary: secondary,
          surface: Colors.white,
          error: danger,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          foregroundColor: Color(0xFF1F2937),
          elevation: 0.5,
          centerTitle: false,
          titleTextStyle: TextStyle(
            fontFamily: 'Outfit',
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: Color(0xFF1F2937),
          ),
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFFE5E7EB)),
          ),
          margin: const EdgeInsets.only(bottom: 12),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFFF9FAFB),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: primary, width: 1.5),
          ),
          labelStyle: const TextStyle(color: Color(0xFF6B7280), fontFamily: 'Outfit'),
          hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontFamily: 'Outfit'),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: primary,
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            textStyle: const TextStyle(
              fontFamily: 'Outfit',
              fontWeight: FontWeight.w700,
              fontSize: 14,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Colors.white,
          selectedItemColor: primary,
          unselectedItemColor: Color(0xFF6B7280),
          type: BottomNavigationBarType.fixed,
          selectedLabelStyle: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.w700, fontSize: 11),
          unselectedLabelStyle: TextStyle(fontFamily: 'Outfit', fontSize: 11),
        ),
        dividerTheme: const DividerThemeData(color: Color(0xFFE5E7EB), space: 1),
      );
}

// Extensión para usar en widgets
extension BuscapetColors on BuildContext {
  Color get primaryColor => BuscapetTheme.primary;
  Color get cardColor => BuscapetTheme.bgCard;
  Color get inputColor => BuscapetTheme.bgInput;
  Color get borderColor => BuscapetTheme.border;
  Color get textMutedColor => BuscapetTheme.textMuted;
}
