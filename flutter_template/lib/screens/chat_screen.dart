// =============================================================================
// PANTALLA: ChatScreen — Mensajes directos
// =============================================================================

import 'package:flutter/material.dart';
import '../theme.dart';
import '../services/auth_service.dart';

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    if (!AuthService().isLoggedIn) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('💬', style: TextStyle(fontSize: 48)),
            SizedBox(height: 12),
            Text('Iniciá sesión para ver tus mensajes',
                style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: BuscapetTheme.textMain)),
            SizedBox(height: 8),
            Text('Podés contactar a dueños de mascotas\nuna vez que tengas una cuenta.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: BuscapetTheme.textMuted)),
          ],
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('💬 Mensajes',
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: BuscapetTheme.textMain)),
        const SizedBox(height: 16),
        // Empty state
        Center(
          child: Column(
            children: [
              const SizedBox(height: 40),
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: BuscapetTheme.bgInput,
                  shape: BoxShape.circle,
                  border: Border.all(color: BuscapetTheme.border),
                ),
                child: const Icon(Icons.chat_bubble_outline_rounded,
                    size: 36, color: BuscapetTheme.textMuted),
              ),
              const SizedBox(height: 16),
              const Text('No tenés mensajes aún',
                  style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: BuscapetTheme.textMain)),
              const SizedBox(height: 8),
              const Text(
                  'Cuando contactes a alguien sobre\nuna mascota, aparecerá acá.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 12, color: BuscapetTheme.textMuted)),
            ],
          ),
        ),
      ],
    );
  }
}
