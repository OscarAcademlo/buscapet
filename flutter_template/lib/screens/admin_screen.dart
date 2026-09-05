// =============================================================================
// PANTALLA: AdminScreen — Panel de administración (Solo oscarns@gmail.com)
// =============================================================================

import 'package:flutter/material.dart';
import '../theme.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';

class AdminScreen extends StatelessWidget {
  const AdminScreen({super.key});

  @override
  Widget build(BuildContext context) {
    if (!AuthService().isAdmin) {
      return Scaffold(
        backgroundColor: BuscapetTheme.bgMain,
        appBar: AppBar(title: const Text('Admin'), backgroundColor: BuscapetTheme.bgCard),
        body: const Center(
          child: Text('⛔ Acceso denegado',
              style: TextStyle(color: BuscapetTheme.danger, fontSize: 18, fontWeight: FontWeight.w800)),
        ),
      );
    }

    return Scaffold(
      backgroundColor: BuscapetTheme.bgMain,
      appBar: AppBar(
        backgroundColor: BuscapetTheme.bgCard,
        title: const Row(
          children: [
            Icon(Icons.shield_rounded, color: BuscapetTheme.warning, size: 20),
            SizedBox(width: 8),
            Text('Panel Admin',
                style: TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                    color: BuscapetTheme.warning)),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Admin
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    BuscapetTheme.warning.withOpacity(0.12),
                    BuscapetTheme.warning.withOpacity(0.04),
                  ],
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                    color: BuscapetTheme.warning.withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.shield_rounded, color: BuscapetTheme.warning, size: 30),
                  SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('OscarSoft Admin',
                          style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: BuscapetTheme.warning)),
                      Text('oscarns@gmail.com — Administrador Master',
                          style: TextStyle(
                              fontSize: 11, color: BuscapetTheme.textMuted)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            _sectionTitle('📢 Solicitudes de Publicidad'),
            const SizedBox(height: 10),
            _buildAdRequests(),

            const SizedBox(height: 24),
            _sectionTitle('📋 Últimas Publicaciones'),
            const SizedBox(height: 10),
            _buildRecentPosts(context),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Text(text,
        style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w800,
            color: BuscapetTheme.textMain));
  }

  Widget _buildAdRequests() {
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: FirestoreService().adRequestsStream(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(
              child: CircularProgressIndicator(color: BuscapetTheme.primary));
        }
        final requests = snapshot.data!;
        if (requests.isEmpty) {
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: BuscapetTheme.bgCard,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: BuscapetTheme.border),
            ),
            child: const Text('No hay solicitudes pendientes.',
                style: TextStyle(
                    fontSize: 12, color: BuscapetTheme.textMuted)),
          );
        }

        return Column(
          children: requests.map((req) => Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: BuscapetTheme.bgCard,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: BuscapetTheme.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(req['businessName'] ?? 'Sin nombre',
                          style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: BuscapetTheme.textMain)),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: _statusColor(req['status'] ?? 'pending').withOpacity(0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text((req['status'] ?? 'pending').toUpperCase(),
                          style: TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: _statusColor(req['status'] ?? 'pending'))),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text('${req['email'] ?? ''} • ${req['phone'] ?? ''}',
                    style: const TextStyle(
                        fontSize: 11, color: BuscapetTheme.textMuted)),
                if (req['message'] != null && req['message'].isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Text(req['message'],
                        style: const TextStyle(
                            fontSize: 11, color: BuscapetTheme.textLight)),
                  ),
                if (req['status'] == 'pending') ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => FirestoreService()
                              .updateAdRequestStatus(req['id'], 'approved'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: BuscapetTheme.success,
                            side: const BorderSide(color: BuscapetTheme.success),
                            padding: const EdgeInsets.symmetric(vertical: 6),
                          ),
                          child: const Text('✔ Aprobar', style: TextStyle(fontSize: 11)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => FirestoreService()
                              .updateAdRequestStatus(req['id'], 'rejected'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: BuscapetTheme.danger,
                            side: const BorderSide(color: BuscapetTheme.danger),
                            padding: const EdgeInsets.symmetric(vertical: 6),
                          ),
                          child: const Text('✗ Rechazar', style: TextStyle(fontSize: 11)),
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          )).toList(),
        );
      },
    );
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'approved': return BuscapetTheme.success;
      case 'rejected': return BuscapetTheme.danger;
      default: return BuscapetTheme.warning;
    }
  }

  Widget _buildRecentPosts(BuildContext context) {
    return StreamBuilder(
      stream: FirestoreService().postsStream(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(
              child: CircularProgressIndicator(color: BuscapetTheme.primary));
        }
        final posts = snapshot.data!.take(10).toList();
        return Column(
          children: posts.map((post) => Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: BuscapetTheme.bgCard,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: BuscapetTheme.border),
            ),
            child: Row(
              children: [
                if (post.photos.isNotEmpty)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(post.photos.first,
                        width: 44, height: 44, fit: BoxFit.cover),
                  )
                else
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: BuscapetTheme.bgInput,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.pets_rounded,
                        color: BuscapetTheme.textMuted, size: 20),
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
                      Text('${post.user.name} · ${post.location.displayName}',
                          style: const TextStyle(
                              fontSize: 10, color: BuscapetTheme.textMuted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.delete_outline_rounded,
                      color: BuscapetTheme.danger, size: 18),
                  onPressed: () async {
                    final ok = await showDialog<bool>(
                      context: context,
                      builder: (_) => AlertDialog(
                        backgroundColor: BuscapetTheme.bgCard,
                        title: const Text('¿Eliminar post?',
                            style: TextStyle(color: BuscapetTheme.textMain)),
                        actions: [
                          TextButton(
                              onPressed: () => Navigator.pop(context, false),
                              child: const Text('Cancelar')),
                          ElevatedButton(
                              onPressed: () => Navigator.pop(context, true),
                              style: ElevatedButton.styleFrom(
                                  backgroundColor: BuscapetTheme.danger),
                              child: const Text('Eliminar')),
                        ],
                      ),
                    );
                    if (ok == true) {
                      await FirestoreService().deletePost(post.id);
                    }
                  },
                ),
              ],
            ),
          )).toList(),
        );
      },
    );
  }
}
