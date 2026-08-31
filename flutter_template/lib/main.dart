// ==========================================================================
// BUSCAPET - FLUTTER NATIVE APP STARTER
// Integración con Firebase Auth, Firestore, Cloud Messaging & Geolocalización
// ==========================================================================

import 'package:flutter/material.dart';

void main() {
  runApp(const BuscapetApp());
}

class BuscapetApp extends StatelessWidget {
  const BuscapetApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Buscapet',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF12141C),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFFF5A5F),
          secondary: Color(0xFF00A699),
          surface: Color(0xFF1A1D27),
        ),
        fontFamily: 'Outfit',
        useMaterial3: true,
      ),
      home: const BuscapetHomeScreen(),
    );
  }
}

class BuscapetHomeScreen extends StatefulWidget {
  const BuscapetHomeScreen({super.key});

  @override
  State<BuscapetHomeScreen> createState() => _BuscapetHomeScreenState();
}

class _BuscapetHomeScreenState extends State<BuscapetHomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: const [
            Text('🐾', style: TextStyle(fontSize: 24)),
            SizedBox(width: 8),
            Text(
              'Buscapet',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                color: Color(0xFFFF5A5F),
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1A1D27),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_active_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.location_on_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: Center(
        child: Text(
          'Buscapet Feed - Pestaña $_currentIndex',
          style: const TextStyle(fontSize: 16, color: Colors.white70),
        ),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) => setState(() => _currentIndex = index),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), label: 'Inicio'),
          NavigationDestination(icon: Icon(Icons.search), label: 'Perdidos'),
          NavigationDestination(icon: Icon(Icons.add_circle, color: Color(0xFFFF5A5F), size: 36), label: 'Reportar'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), label: 'Mensajes'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Perfil'),
        ],
      ),
    );
  }
}
