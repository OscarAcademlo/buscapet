import 'dart:typed_data';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:image_picker/image_picker.dart';
import '../theme.dart';
import '../models/pet_post.dart';
import '../services/firestore_service.dart';
import '../services/auth_service.dart';
import '../services/storage_service.dart';
import '../services/location_autocomplete_service.dart';
import 'map_modal.dart';

class PetCard extends StatefulWidget {
  final PetPost post;
  final VoidCallback onRefresh;

  const PetCard({super.key, required this.post, required this.onRefresh});

  @override
  State<PetCard> createState() => _PetCardState();
}

class _PetCardState extends State<PetCard> {
  final _firestore = FirestoreService();
  int _photoIndex = 0;
  late int _likesCount;
  late bool _liked;
  late List<PostComment> _commentsList;

  PetPost get post => widget.post;

  // Solo quien realmente creó la publicación (NO administradores de forma automática)
  bool get isOwner {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) return false;
    if (user.uid == post.user.id) return true;
    if (user.email != null && user.email!.isNotEmpty && user.email == post.user.email) return true;
    return false;
  }

  bool get isLiked => _liked;

  @override
  void initState() {
    super.initState();
    _likesCount = post.likes;
    final uid = FirebaseAuth.instance.currentUser?.uid ?? '';
    _liked = post.likedBy.contains(uid);
    _commentsList = List<PostComment>.from(post.comments);
  }

  @override
  void didUpdateWidget(PetCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.post != widget.post) {
      _likesCount = widget.post.likes;
      final uid = FirebaseAuth.instance.currentUser?.uid ?? '';
      _liked = widget.post.likedBy.contains(uid);
      _commentsList = List<PostComment>.from(widget.post.comments);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: BuscapetTheme.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _getStatusBorderColor()),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (post.isSample) _buildDemoBanner(),
          _buildHeader(),
          _buildStatusBadge(),
          _buildPhotos(),
          _buildActions(),
          _buildDetails(),
        ],
      ),
    );
  }

  Widget _buildDemoBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF59E0B).withValues(alpha: 0.16),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        border: const Border(bottom: BorderSide(color: Color(0xFFF59E0B), width: 1.5)),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.warning_amber_rounded, size: 14, color: Color(0xFFF59E0B)),
          SizedBox(width: 6),
          Text(
            '⚠️ [ PUBLICACIÓN DE MUESTRA / DEMO ]',
            style: TextStyle(
              fontSize: 10.5,
              fontWeight: FontWeight.w900,
              color: Color(0xFFF59E0B),
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusBorderColor() {
    if (post.isReunited || post.isAdopted) return BuscapetTheme.success.withOpacity(0.5);
    switch (post.type) {
      case 'lost': return BuscapetTheme.danger.withOpacity(0.3);
      case 'found': return BuscapetTheme.success.withOpacity(0.3);
      case 'adopt': return BuscapetTheme.adopt.withOpacity(0.3);
      default: return BuscapetTheme.border;
    }
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundImage: NetworkImage(post.user.avatar),
            backgroundColor: BuscapetTheme.border,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        post.user.name,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: BuscapetTheme.textMain,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '• ${post.timeAgo}',
                      style: const TextStyle(
                        fontSize: 11,
                        color: BuscapetTheme.textMuted,
                      ),
                    ),
                  ],
                ),
                Text(post.location.displayName,
                    style: const TextStyle(
                        fontSize: 11, color: BuscapetTheme.textMuted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (post.isSample) ...[
                Container(
                  margin: const EdgeInsets.only(right: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                  ),
                  child: const Text('DEMO',
                      style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w800,
                          color: BuscapetTheme.textMuted)),
                ),
              ],
              _buildTypeBadge(),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTypeBadge() {
    String label;
    Color color;
    if (post.isReunited) {
      label = '✅ Encontrado';
      color = BuscapetTheme.success;
    } else if (post.isAdopted) {
      label = '🏡 Adoptado';
      color = BuscapetTheme.success;
    } else {
      switch (post.type) {
        case 'lost':
          label = '🔴 Perdido';
          color = BuscapetTheme.danger;
          break;
        case 'found':
          label = '🟢 Encontrado';
          color = BuscapetTheme.success;
          break;
        case 'adopt':
          label = '💜 Adopción';
          color = BuscapetTheme.adopt;
          break;
        case 'spotted':
          label = '👁️ Visto';
          color = BuscapetTheme.warning;
          break;
        default:
          label = post.type;
          color = BuscapetTheme.textMuted;
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(label,
          style: TextStyle(
              fontSize: 11, fontWeight: FontWeight.w700, color: color)),
    );
  }

  Widget _buildStatusBadge() {
    if (!post.isReunited && !post.isAdopted) return const SizedBox();
    final label = post.isReunited
        ? '🎉 ¡Esta mascota fue encontrada y está con su familia!'
        : '🏡 ¡Esta mascota ya fue adoptada!';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      color: BuscapetTheme.success.withOpacity(0.1),
      child: Text(label,
          textAlign: TextAlign.center,
          style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: BuscapetTheme.success)),
    );
  }

  Widget _buildPhotos() {
    if (post.photos.isEmpty) return const SizedBox();

    return Stack(
      children: [
        AspectRatio(
          aspectRatio: 4 / 3,
          child: ClipRRect(
            child: CachedNetworkImage(
              imageUrl: post.photos[_photoIndex],
              fit: BoxFit.cover,
              placeholder: (context, url) => Container(
                color: BuscapetTheme.bgInput,
                child: const Center(
                  child: SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(strokeWidth: 2, color: BuscapetTheme.primary),
                  ),
                ),
              ),
              errorWidget: (context, url, error) => Container(
                color: BuscapetTheme.bgInput,
                child: const Center(
                  child: Icon(Icons.pets_rounded, size: 48, color: BuscapetTheme.textMuted),
                ),
              ),
            ),
          ),
        ),
        // Franja / Badge DEMO en la esquina superior izquierda
        if (post.isSample)
          Positioned(
            top: 10,
            left: 10,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4.5),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFF5A5F), Color(0xFFFF8C69)],
                ),
                borderRadius: BorderRadius.circular(6),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.55),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.flag_rounded, size: 12, color: Colors.white),
                  SizedBox(width: 4),
                  Text(
                    'DEMO',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
            ),
          ),
        // Indicador de múltiples fotos
        if (post.photos.length > 1)
          Positioned(
            bottom: 8,
            right: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.6),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text('${_photoIndex + 1}/${post.photos.length}',
                  style: const TextStyle(
                      fontSize: 11,
                      color: Colors.white,
                      fontWeight: FontWeight.w700)),
            ),
          ),
        // Flechas de navegación
        if (post.photos.length > 1) ...[
          if (_photoIndex > 0)
            Positioned(
              left: 8,
              top: 0,
              bottom: 0,
              child: Center(
                child: GestureDetector(
                  onTap: () => setState(() => _photoIndex--),
                  child: _photoNavBtn(Icons.chevron_left_rounded),
                ),
              ),
            ),
          if (_photoIndex < post.photos.length - 1)
            Positioned(
              right: 8,
              top: 0,
              bottom: 0,
              child: Center(
                child: GestureDetector(
                  onTap: () => setState(() => _photoIndex++),
                  child: _photoNavBtn(Icons.chevron_right_rounded),
                ),
              ),
            ),
        ],
      ],
    );
  }

  Widget _photoNavBtn(IconData icon) {
    return Container(
      width: 32,
      height: 32,
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.5),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: Colors.white, size: 20),
    );
  }

  Widget _buildActions() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      child: Column(
        children: [
          // Fila 1: Like, Comentar, Compartir, Mapa
          Row(
            children: [
              _actionBtn(
                icon: _liked ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                label: '$_likesCount',
                color: _liked ? BuscapetTheme.danger : BuscapetTheme.textMuted,
                onTap: _handleLike,
              ),
              const SizedBox(width: 8),
              _actionBtn(
                icon: Icons.chat_bubble_outline_rounded,
                label: '${_commentsList.length}',
                color: BuscapetTheme.textMuted,
                onTap: _openInstagramCommentsSheet,
              ),
              const SizedBox(width: 8),
              _actionBtn(
                icon: Icons.share_outlined,
                label: '${post.shares}',
                onTap: _handleShare,
              ),
              const SizedBox(width: 8),
              _actionBtn(
                icon: Icons.location_on_outlined,
                label: 'Mapa',
                onTap: _handleMap,
              ),
            ],
          ),
          const SizedBox(height: 8),
          // Fila 2: Botones de acción principales
          Row(
            children: [
              if (!post.isReunited && !post.isAdopted && post.type != 'adopt')
                Expanded(
                  child: _bigBtn(
                    label: '✔ ¡Ya fue encontrado!',
                    color: BuscapetTheme.success,
                    onTap: _handleMarkReunited,
                  ),
                ),
              if (!post.isAdopted && !post.isReunited && post.type == 'adopt')
                Expanded(
                  child: _bigBtn(
                    label: '🏡 ¡Ya fue adoptado!',
                    color: BuscapetTheme.adopt,
                    onTap: _handleMarkAdopted,
                  ),
                ),
              if (!post.isReunited && !post.isAdopted) ...[
                const SizedBox(width: 8),
                Expanded(
                  child: _bigBtn(
                    label: '💬 Contactar',
                    color: BuscapetTheme.secondary,
                    onTap: _handleContact,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _actionBtn({
    required IconData icon,
    required String label,
    Color color = BuscapetTheme.textMuted,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
        decoration: BoxDecoration(
          color: BuscapetTheme.bgInput,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: BuscapetTheme.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 4),
            Text(label,
                style: TextStyle(
                    fontSize: 11, color: color, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }

  Widget _bigBtn({
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: color.withValues(alpha: 0.4)),
        ),
        child: Text(label,
            textAlign: TextAlign.center,
            style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: color)),
      ),
    );
  }

  Widget _buildDetails() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(post.petName,
              style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                  color: BuscapetTheme.textMain)),
          const SizedBox(height: 4),
          Wrap(
            spacing: 6,
            children: [
              _tag('🐾 ${post.species}'),
              if (post.breed.isNotEmpty) _tag(post.breed),
              if (post.gender.isNotEmpty) _tag(post.gender),
            ],
          ),
          if (post.description.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(post.description,
                style: const TextStyle(
                    fontSize: 12,
                    color: BuscapetTheme.textLight,
                    height: 1.4),
                maxLines: 3,
                overflow: TextOverflow.ellipsis),
          ],
          const SizedBox(height: 8),
          // Bloque de ubicación contextual (Mascota perdida vs encontrada)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            decoration: BoxDecoration(
              color: BuscapetTheme.bgInput,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: BuscapetTheme.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      post.type == 'lost'
                          ? Icons.location_history_rounded
                          : (post.type == 'found' || post.type == 'spotted'
                              ? Icons.camera_alt_outlined
                              : Icons.location_on_rounded),
                      size: 14,
                      color: post.type == 'lost'
                          ? BuscapetTheme.danger
                          : (post.type == 'found'
                              ? BuscapetTheme.success
                              : BuscapetTheme.primary),
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            post.type == 'lost'
                                ? 'Última vez visto (Ubicación manual):'
                                : (post.type == 'found' || post.type == 'spotted'
                                    ? 'Ubicación del reporte (Donde se tomó la foto):'
                                    : 'Ubicación:'),
                            style: const TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w700,
                              color: BuscapetTheme.textMuted,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            post.location.address.isNotEmpty
                                ? post.location.address
                                : post.location.displayName,
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: BuscapetTheme.textMain,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                GestureDetector(
                  onTap: _handleMap,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                    decoration: BoxDecoration(
                      color: BuscapetTheme.bgCard,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: BuscapetTheme.border),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.map_rounded,
                            size: 12, color: BuscapetTheme.secondary),
                        const SizedBox(width: 4),
                        Text(
                          post.type == 'lost'
                              ? '📍 Ver ubicación aproximada'
                              : '📍 Ver ubicación de la foto',
                          style: const TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                            color: BuscapetTheme.secondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _tag(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: BuscapetTheme.bgInput,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: BuscapetTheme.border),
      ),
      child: Text(label,
          style: const TextStyle(
              fontSize: 10,
              color: BuscapetTheme.textMuted,
              fontWeight: FontWeight.w600)),
    );
  }



  void _showFullscreenImage(String imageUrl) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.black.withValues(alpha: 0.92),
        insetPadding: const EdgeInsets.all(12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Stack(
          alignment: Alignment.topRight,
          children: [
            Center(
              child: InteractiveViewer(
                minScale: 0.5,
                maxScale: 4.0,
                child: CachedNetworkImage(
                  imageUrl: imageUrl,
                  fit: BoxFit.contain,
                  placeholder: (_, __) => const Center(
                    child: CircularProgressIndicator(color: BuscapetTheme.primary),
                  ),
                  errorWidget: (_, __, ___) => const Center(
                    child: Icon(Icons.broken_image_rounded, color: Colors.white70, size: 48),
                  ),
                ),
              ),
            ),
            Positioned(
              top: 10,
              right: 10,
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: IconButton(
                  icon: const Icon(Icons.close_rounded, color: Colors.white, size: 24),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _openInstagramCommentsSheet() {
    final commentTextController = TextEditingController();
    final addressController = TextEditingController();
    Uint8List? selectedImageBytes;
    String? selectedImageName;
    String? selectedAddress;
    double? selectedLat;
    double? selectedLng;
    bool isGpsLoading = false;
    bool isSubmitting = false;
    bool showAddressInput = false;
    bool isSearchingAddress = false;
    List<AddressSuggestion> addressSuggestions = [];
    Timer? debounceTimer;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (sheetContext, setSheetState) {
            void onAddressQueryChanged(String query) {
              debounceTimer?.cancel();
              if (query.trim().length < 3) {
                setSheetState(() {
                  addressSuggestions = [];
                  isSearchingAddress = false;
                });
                return;
              }
              setSheetState(() {
                isSearchingAddress = true;
              });
              debounceTimer = Timer(const Duration(milliseconds: 350), () async {
                final results = await LocationAutocompleteService().searchAddress(query);
                setSheetState(() {
                  addressSuggestions = results;
                  isSearchingAddress = false;
                });
              });
            }

            void onPickPhoto() async {
              try {
                final picker = ImagePicker();
                final picked = await picker.pickImage(
                  source: ImageSource.gallery,
                  maxWidth: 1200,
                  maxHeight: 1200,
                  imageQuality: 85,
                );
                if (picked != null) {
                  final bytes = await picked.readAsBytes();
                  setSheetState(() {
                    selectedImageBytes = bytes;
                    selectedImageName = picked.name;
                  });
                }
              } catch (e) {
                debugPrint('Error seleccionando imagen: $e');
              }
            }

            void onGetLiveGps() async {
              setSheetState(() {
                isGpsLoading = true;
              });
              final position = await LocationAutocompleteService().getCurrentLiveGps();
              if (position != null) {
                final revAddress = await LocationAutocompleteService().reverseGeocode(
                  position.latitude,
                  position.longitude,
                );
                setSheetState(() {
                  selectedLat = position.latitude;
                  selectedLng = position.longitude;
                  selectedAddress = revAddress?.shortLabel ??
                      revAddress?.displayName ??
                      'Ubicación GPS (${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)})';
                  isGpsLoading = false;
                  showAddressInput = false;
                  addressSuggestions = [];
                });
              } else {
                setSheetState(() {
                  isGpsLoading = false;
                });
                if (sheetContext.mounted) {
                  ScaffoldMessenger.of(sheetContext).showSnackBar(
                    const SnackBar(
                      content: Text('⚠️ No se pudo obtener la ubicación GPS.'),
                      backgroundColor: BuscapetTheme.warning,
                    ),
                  );
                }
              }
            }

            void submitComment() async {
              final cleanText = commentTextController.text.trim();
              if (cleanText.isEmpty && selectedImageBytes == null && selectedAddress == null) {
                return;
              }

              if (!AuthService().isLoggedIn) {
                Navigator.pop(sheetContext);
                _showLoginRequired('comentar');
                return;
              }

              final currentUser = FirebaseAuth.instance.currentUser!;
              setSheetState(() {
                isSubmitting = true;
              });

              String? uploadedPhotoUrl;
              if (selectedImageBytes != null) {
                try {
                  uploadedPhotoUrl = await StorageService().uploadPhoto(selectedImageBytes!);
                } catch (e) {
                  debugPrint('Error subiendo foto de comentario: $e');
                }
              }

              final newComment = PostComment(
                id: 'cmt-${DateTime.now().millisecondsSinceEpoch}',
                userName: currentUser.displayName?.isNotEmpty == true
                    ? currentUser.displayName!
                    : (currentUser.email?.split('@').first ?? 'Usuario'),
                userAvatar: currentUser.photoURL?.isNotEmpty == true
                    ? currentUser.photoURL!
                    : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
                userId: currentUser.uid,
                text: cleanText,
                photoUrl: uploadedPhotoUrl,
                address: selectedAddress,
                lat: selectedLat,
                lng: selectedLng,
                createdAt: DateTime.now(),
              );

              setState(() {
                _commentsList.add(newComment);
              });

              setSheetState(() {
                isSubmitting = false;
                selectedImageBytes = null;
                selectedImageName = null;
                selectedAddress = null;
                selectedLat = null;
                selectedLng = null;
                showAddressInput = false;
                addressSuggestions = [];
                commentTextController.clear();
                addressController.clear();
              });

              try {
                await _firestore.addComment(post.id, newComment);
              } catch (e) {
                debugPrint('Error guardando comentario en Firestore: $e');
              }
            }

            final bool isLoggedIn = AuthService().isLoggedIn;

            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(sheetContext).viewInsets.bottom,
              ),
              child: Container(
                height: MediaQuery.of(sheetContext).size.height * 0.82,
                decoration: BoxDecoration(
                  color: Theme.of(sheetContext).cardColor,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Column(
                  children: [
                    // Barra superior estilo Instagram
                    Container(
                      margin: const EdgeInsets.only(top: 8, bottom: 4),
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey.withValues(alpha: 0.4),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: Row(
                        children: [
                          const Icon(Icons.forum_rounded, size: 20, color: BuscapetTheme.primary),
                          const SizedBox(width: 8),
                          Text(
                            'Comentarios (${_commentsList.length})',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: Theme.of(sheetContext).textTheme.bodyLarge?.color,
                            ),
                          ),
                          const Spacer(),
                          IconButton(
                            icon: const Icon(Icons.close_rounded, size: 20),
                            onPressed: () => Navigator.pop(sheetContext),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1),

                    // Lista de comentarios
                    Expanded(
                      child: _commentsList.isEmpty
                          ? Center(
                              child: Padding(
                                padding: const EdgeInsets.all(24.0),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(16),
                                      decoration: BoxDecoration(
                                        color: BuscapetTheme.primary.withValues(alpha: 0.12),
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(Icons.chat_bubble_outline_rounded,
                                          size: 38, color: BuscapetTheme.primary),
                                    ),
                                    const SizedBox(height: 12),
                                    Text(
                                      'Sé el primero en comentar sobre ${post.petName}',
                                      textAlign: TextAlign.center,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        color: BuscapetTheme.textMain,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    const Text(
                                      'Puedes compartir información, fotos de avistamiento o ubicación.',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: BuscapetTheme.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                              itemCount: _commentsList.length,
                              separatorBuilder: (_, __) => const Padding(
                                padding: EdgeInsets.symmetric(vertical: 4),
                                child: Divider(height: 1, color: BuscapetTheme.border),
                              ),
                              itemBuilder: (_, index) {
                                final c = _commentsList[index];
                                return Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 8),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      CircleAvatar(
                                        radius: 18,
                                        backgroundImage: NetworkImage(c.userAvatar),
                                        backgroundColor: BuscapetTheme.border,
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            // Nombre + Fecha y Hora completa
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    c.userName,
                                                    style: const TextStyle(
                                                      fontSize: 13,
                                                      fontWeight: FontWeight.w800,
                                                      color: BuscapetTheme.textMain,
                                                    ),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                                ),
                                                const SizedBox(width: 6),
                                                Container(
                                                  padding: const EdgeInsets.symmetric(
                                                      horizontal: 6, vertical: 2),
                                                  decoration: BoxDecoration(
                                                    color: BuscapetTheme.bgInput,
                                                    borderRadius: BorderRadius.circular(4),
                                                  ),
                                                  child: Row(
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: [
                                                      const Icon(Icons.access_time_rounded,
                                                          size: 10, color: BuscapetTheme.textMuted),
                                                      const SizedBox(width: 3),
                                                      Text(
                                                        c.formattedDateTime,
                                                        style: const TextStyle(
                                                          fontSize: 10,
                                                          fontWeight: FontWeight.w600,
                                                          color: BuscapetTheme.textMuted,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            if (c.text.isNotEmpty)
                                              Text(
                                                c.text,
                                                style: const TextStyle(
                                                  fontSize: 13,
                                                  color: BuscapetTheme.textLight,
                                                  height: 1.35,
                                                ),
                                              ),

                                            // Ubicación adjunta
                                            if (c.address != null && c.address!.isNotEmpty) ...[
                                              const SizedBox(height: 6),
                                              InkWell(
                                                borderRadius: BorderRadius.circular(8),
                                                onTap: () {
                                                  if (c.lat != null && c.lng != null) {
                                                    showDialog(
                                                      context: context,
                                                      builder: (_) => MapModal(
                                                        post: PetPost(
                                                          id: 'comment-loc',
                                                          type: post.type,
                                                          petName: 'Avistamiento de ${post.petName}',
                                                          species: post.species,
                                                          breed: post.breed,
                                                          gender: post.gender,
                                                          description: 'Comentario de ${c.userName}: ${c.text}',
                                                          photos: c.photoUrl != null
                                                              ? [c.photoUrl!]
                                                              : post.photos,
                                                          user: post.user,
                                                          location: PostLocation(
                                                            address: c.address ?? '',
                                                            cityName: '',
                                                            stateName: '',
                                                            country: 'AR',
                                                            lat: c.lat,
                                                            lng: c.lng,
                                                          ),
                                                          likes: 0,
                                                          likedBy: [],
                                                          shares: 0,
                                                          comments: [],
                                                          createdAt: c.createdAt,
                                                        ),
                                                      ),
                                                    );
                                                  }
                                                },
                                                child: Container(
                                                  padding: const EdgeInsets.symmetric(
                                                      horizontal: 8, vertical: 4),
                                                  decoration: BoxDecoration(
                                                    color: BuscapetTheme.primary.withValues(alpha: 0.1),
                                                    borderRadius: BorderRadius.circular(6),
                                                    border: Border.all(
                                                      color: BuscapetTheme.primary.withValues(alpha: 0.3),
                                                    ),
                                                  ),
                                                  child: Row(
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: [
                                                      const Icon(Icons.location_on_rounded,
                                                          size: 13, color: BuscapetTheme.primary),
                                                      const SizedBox(width: 4),
                                                      Flexible(
                                                        child: Text(
                                                          c.address!,
                                                          style: const TextStyle(
                                                            fontSize: 11,
                                                            fontWeight: FontWeight.w600,
                                                            color: BuscapetTheme.primary,
                                                          ),
                                                          maxLines: 1,
                                                          overflow: TextOverflow.ellipsis,
                                                        ),
                                                      ),
                                                      if (c.lat != null && c.lng != null) ...[
                                                        const SizedBox(width: 4),
                                                        const Icon(Icons.open_in_new_rounded,
                                                            size: 11, color: BuscapetTheme.primary),
                                                      ],
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ],

                                            // Foto adjunta
                                            if (c.photoUrl != null && c.photoUrl!.isNotEmpty) ...[
                                              const SizedBox(height: 8),
                                              GestureDetector(
                                                onTap: () => _showFullscreenImage(c.photoUrl!),
                                                child: ClipRRect(
                                                  borderRadius: BorderRadius.circular(10),
                                                  child: Stack(
                                                    children: [
                                                      CachedNetworkImage(
                                                        imageUrl: c.photoUrl!,
                                                        height: 140,
                                                        width: 180,
                                                        fit: BoxFit.cover,
                                                        placeholder: (_, __) => Container(
                                                          height: 140,
                                                          width: 180,
                                                          color: BuscapetTheme.bgInput,
                                                          child: const Center(
                                                            child: SizedBox(
                                                              width: 20,
                                                              height: 20,
                                                              child: CircularProgressIndicator(
                                                                strokeWidth: 2,
                                                                color: BuscapetTheme.primary,
                                                              ),
                                                            ),
                                                          ),
                                                        ),
                                                        errorWidget: (_, __, ___) => Container(
                                                          height: 140,
                                                          width: 180,
                                                          color: BuscapetTheme.bgInput,
                                                          child: const Center(
                                                            child: Icon(Icons.broken_image_rounded,
                                                                color: BuscapetTheme.textMuted),
                                                          ),
                                                        ),
                                                      ),
                                                      Positioned(
                                                        right: 6,
                                                        bottom: 6,
                                                        child: Container(
                                                          padding: const EdgeInsets.all(4),
                                                          decoration: BoxDecoration(
                                                            color: Colors.black.withOpacity(0.65),
                                                            borderRadius: BorderRadius.circular(4),
                                                          ),
                                                          child: const Icon(
                                                            Icons.fullscreen_rounded,
                                                            size: 14,
                                                            color: Colors.white,
                                                          ),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              },
                            ),
                    ),

                    const Divider(height: 1),

                    // Área inferior: Formulario para usuarios registrados O aviso de login
                    SafeArea(
                      child: !isLoggedIn
                          ? Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                              color: BuscapetTheme.bgInput,
                              child: Row(
                                children: [
                                  const Icon(Icons.lock_outline_rounded,
                                      color: BuscapetTheme.warning, size: 24),
                                  const SizedBox(width: 12),
                                  const Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Text(
                                          'Inicia sesión para comentar',
                                          style: TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w700,
                                            color: BuscapetTheme.textMain,
                                          ),
                                        ),
                                        Text(
                                          'Solo usuarios registrados pueden aportar información, fotos o ubicación.',
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: BuscapetTheme.textMuted,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  ElevatedButton(
                                    onPressed: () async {
                                      final user = await AuthService().signInWithGoogle();
                                      if (user != null) {
                                        setSheetState(() {});
                                        setState(() {});
                                      }
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: BuscapetTheme.primary,
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 12, vertical: 8),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                    child: const Text('Entrar',
                                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                                  ),
                                ],
                              ),
                            )
                          : Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              color: BuscapetTheme.bgInput,
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  // Previsualización de imagen adjunta
                                  if (selectedImageBytes != null)
                                    Container(
                                      margin: const EdgeInsets.only(bottom: 8),
                                      padding: const EdgeInsets.all(6),
                                      decoration: BoxDecoration(
                                        color: BuscapetTheme.bgCard,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: BuscapetTheme.border),
                                      ),
                                      child: Row(
                                        children: [
                                          ClipRRect(
                                            borderRadius: BorderRadius.circular(6),
                                            child: Image.memory(
                                              selectedImageBytes!,
                                              width: 48,
                                              height: 48,
                                              fit: BoxFit.cover,
                                            ),
                                          ),
                                          const SizedBox(width: 10),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                const Text(
                                                  '📸 Foto adjunta lista para enviar',
                                                  style: TextStyle(
                                                      fontSize: 12,
                                                      fontWeight: FontWeight.w700,
                                                      color: BuscapetTheme.textMain),
                                                ),
                                                if (selectedImageName != null)
                                                  Text(
                                                    selectedImageName!,
                                                    style: const TextStyle(
                                                        fontSize: 10,
                                                        color: BuscapetTheme.textMuted),
                                                    maxLines: 1,
                                                    overflow: TextOverflow.ellipsis,
                                                  ),
                                              ],
                                            ),
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.close_rounded,
                                                size: 18, color: BuscapetTheme.danger),
                                            onPressed: () {
                                              setSheetState(() {
                                                selectedImageBytes = null;
                                                selectedImageName = null;
                                              });
                                            },
                                          ),
                                        ],
                                      ),
                                    ),

                                  // Badge de ubicación adjunta (por GPS o manual)
                                  if (selectedAddress != null)
                                    Container(
                                      margin: const EdgeInsets.only(bottom: 8),
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 10, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: BuscapetTheme.primary.withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                            color: BuscapetTheme.primary.withValues(alpha: 0.3)),
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(Icons.location_on_rounded,
                                              size: 16, color: BuscapetTheme.primary),
                                          const SizedBox(width: 6),
                                          Expanded(
                                            child: Text(
                                              selectedAddress!,
                                              style: const TextStyle(
                                                fontSize: 11.5,
                                                fontWeight: FontWeight.w600,
                                                color: BuscapetTheme.primary,
                                              ),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          InkWell(
                                            onTap: () {
                                              setSheetState(() {
                                                selectedAddress = null;
                                                selectedLat = null;
                                                selectedLng = null;
                                              });
                                            },
                                            child: const Icon(Icons.close_rounded,
                                                size: 16, color: BuscapetTheme.primary),
                                          ),
                                        ],
                                      ),
                                    ),

                                  // Campo de autocompletar dirección si está abierto
                                  if (showAddressInput) ...[
                                    Container(
                                      margin: const EdgeInsets.only(bottom: 8),
                                      decoration: BoxDecoration(
                                        color: BuscapetTheme.bgCard,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: BuscapetTheme.border),
                                      ),
                                      child: Column(
                                        children: [
                                          TextField(
                                            controller: addressController,
                                            autofocus: true,
                                            style: const TextStyle(
                                                fontSize: 12.5, color: BuscapetTheme.textMain),
                                            decoration: InputDecoration(
                                              hintText: 'Ingresa calle y altura (ej: San Martín 500)',
                                              hintStyle: const TextStyle(
                                                  fontSize: 11.5, color: BuscapetTheme.textMuted),
                                              prefixIcon: const Icon(Icons.search_rounded,
                                                  size: 18, color: BuscapetTheme.primary),
                                              suffixIcon: isSearchingAddress
                                                  ? const Padding(
                                                      padding: EdgeInsets.all(10),
                                                      child: SizedBox(
                                                        width: 14,
                                                        height: 14,
                                                        child: CircularProgressIndicator(
                                                            strokeWidth: 2,
                                                            color: BuscapetTheme.primary),
                                                      ),
                                                    )
                                                  : IconButton(
                                                      icon: const Icon(Icons.close_rounded, size: 16),
                                                      onPressed: () {
                                                        setSheetState(() {
                                                          showAddressInput = false;
                                                          addressSuggestions = [];
                                                        });
                                                      },
                                                    ),
                                              contentPadding:
                                                  const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                                              isDense: true,
                                              border: InputBorder.none,
                                            ),
                                            onChanged: onAddressQueryChanged,
                                          ),
                                          if (addressSuggestions.isNotEmpty)
                                            Container(
                                              constraints: const BoxConstraints(maxHeight: 120),
                                              decoration: const BoxDecoration(
                                                border: Border(
                                                    top: BorderSide(color: BuscapetTheme.border)),
                                              ),
                                              child: ListView.builder(
                                                shrinkWrap: true,
                                                itemCount: addressSuggestions.length,
                                                itemBuilder: (_, sIdx) {
                                                  final suggestion = addressSuggestions[sIdx];
                                                  return ListTile(
                                                    dense: true,
                                                    visualDensity: VisualDensity.compact,
                                                    leading: const Icon(Icons.place_outlined,
                                                        size: 16, color: BuscapetTheme.primary),
                                                    title: Text(
                                                      suggestion.displayName,
                                                      style: const TextStyle(
                                                          fontSize: 11.5,
                                                          color: BuscapetTheme.textMain),
                                                      maxLines: 1,
                                                      overflow: TextOverflow.ellipsis,
                                                    ),
                                                    onTap: () {
                                                      setSheetState(() {
                                                        selectedAddress = suggestion.displayName;
                                                        selectedLat = suggestion.lat;
                                                        selectedLng = suggestion.lng;
                                                        showAddressInput = false;
                                                        addressSuggestions = [];
                                                        addressController.clear();
                                                      });
                                                    },
                                                  );
                                                },
                                              ),
                                            ),
                                        ],
                                      ),
                                    ),
                                  ],

                                  // Fila principal: Avatar + Input de texto + Botones de acción
                                  Row(
                                    children: [
                                      CircleAvatar(
                                        radius: 16,
                                        backgroundImage: NetworkImage(AuthService().avatarUrl),
                                        backgroundColor: BuscapetTheme.border,
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: TextField(
                                          controller: commentTextController,
                                          style: const TextStyle(
                                              fontSize: 13, color: BuscapetTheme.textMain),
                                          decoration: const InputDecoration(
                                            hintText: 'Añadir un comentario...',
                                            hintStyle: TextStyle(
                                                fontSize: 12, color: BuscapetTheme.textMuted),
                                            contentPadding:
                                                EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                                            isDense: true,
                                          ),
                                          onSubmitted: (_) => submitComment(),
                                        ),
                                      ),
                                      const SizedBox(width: 4),

                                      // Botón: Subir Foto
                                      IconButton(
                                        tooltip: 'Adjuntar foto',
                                        icon: Icon(
                                          selectedImageBytes != null
                                              ? Icons.image_rounded
                                              : Icons.add_photo_alternate_outlined,
                                          color: selectedImageBytes != null
                                              ? BuscapetTheme.primary
                                              : BuscapetTheme.textMuted,
                                          size: 20,
                                        ),
                                        onPressed: onPickPhoto,
                                      ),

                                      // Botón: Ingresar dirección manual con autocompletar
                                      IconButton(
                                        tooltip: 'Ingresar calle y número',
                                        icon: Icon(
                                          showAddressInput
                                              ? Icons.edit_location_rounded
                                              : Icons.edit_location_alt_outlined,
                                          color: showAddressInput || (selectedAddress != null && selectedLat == null)
                                              ? BuscapetTheme.primary
                                              : BuscapetTheme.textMuted,
                                          size: 20,
                                        ),
                                        onPressed: () {
                                          setSheetState(() {
                                            showAddressInput = !showAddressInput;
                                            if (!showAddressInput) {
                                              addressSuggestions = [];
                                            }
                                          });
                                        },
                                      ),

                                      // Botón: Ubicación GPS en vivo
                                      IconButton(
                                        tooltip: 'Compartir mi ubicación GPS actual',
                                        icon: isGpsLoading
                                            ? const SizedBox(
                                                width: 16,
                                                height: 16,
                                                child: CircularProgressIndicator(
                                                  strokeWidth: 2,
                                                  color: BuscapetTheme.primary,
                                                ),
                                              )
                                            : Icon(
                                                Icons.my_location_rounded,
                                                color: selectedLat != null
                                                    ? BuscapetTheme.primary
                                                    : BuscapetTheme.textMuted,
                                                size: 20,
                                              ),
                                        onPressed: isGpsLoading ? null : onGetLiveGps,
                                      ),

                                      // Botón: Enviar
                                      isSubmitting
                                          ? const Padding(
                                              padding: EdgeInsets.symmetric(horizontal: 8),
                                              child: SizedBox(
                                                width: 18,
                                                height: 18,
                                                child: CircularProgressIndicator(
                                                  strokeWidth: 2,
                                                  color: BuscapetTheme.primary,
                                                ),
                                              ),
                                            )
                                          : IconButton(
                                              tooltip: 'Enviar comentario',
                                              icon: const Icon(Icons.send_rounded,
                                                  color: BuscapetTheme.primary, size: 20),
                                              onPressed: submitComment,
                                            ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  // ============ HANDLERS ============

  void _handleLike() async {
    if (!AuthService().isLoggedIn) {
      _showLoginRequired('dar me gusta');
      return;
    }
    setState(() {
      _liked = !_liked;
      _likesCount += _liked ? 1 : -1;
    });
    await _firestore.toggleLike(post.id);
  }

  void _handleShare() async {
    await _firestore.incrementShares(post.id);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('🔗 Enlace copiado al portapapeles'),
          backgroundColor: BuscapetTheme.secondary,
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  void _handleMap() {
    showDialog(
      context: context,
      builder: (_) => MapModal(post: post),
    );
  }

  void _handleMarkReunited() async {
    // Si no es el dueño ni admin, mostrar modal explicativo
    if (!isOwner) {
      _showRestrictedActionModal('marcar a ${post.petName} como encontrado/a');
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: BuscapetTheme.bgCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: BuscapetTheme.border),
        ),
        title: const Text('¿Confirmar final feliz? 🎉',
            style: TextStyle(
                color: BuscapetTheme.textMain, fontWeight: FontWeight.w800, fontSize: 16)),
        content: Text(
            '¿Confirmas que ${post.petName} ya fue encontrado y está a salvo con su familia? La publicación quedará destacada con estado de éxito.',
            style: const TextStyle(color: BuscapetTheme.textLight, fontSize: 13)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancelar',
                  style: TextStyle(color: BuscapetTheme.textMuted))),
          ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(
                  backgroundColor: BuscapetTheme.success),
              child: const Text('¡Sí, fue encontrado!')),
        ],
      ),
    );

    if (confirm == true) {
      await _firestore.markAsReunited(post.id);
      widget.onRefresh();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🎉 ¡Felicitaciones! Marcado como encontrado.'),
            backgroundColor: BuscapetTheme.success,
          ),
        );
      }
    }
  }

  void _handleMarkAdopted() async {
    if (!isOwner) {
      _showRestrictedActionModal('marcar a ${post.petName} como adoptado/a');
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: BuscapetTheme.bgCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: BuscapetTheme.border),
        ),
        title: const Text('¿Confirmar adopción? 🏡💖',
            style: TextStyle(
                color: BuscapetTheme.textMain, fontWeight: FontWeight.w800, fontSize: 16)),
        content: Text(
            '¿Confirmas que ${post.petName} ya fue adoptado/a por una familia responsable?',
            style: const TextStyle(color: BuscapetTheme.textLight, fontSize: 13)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancelar',
                  style: TextStyle(color: BuscapetTheme.textMuted))),
          ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(
                  backgroundColor: BuscapetTheme.adopt),
              child: const Text('¡Sí, fue adoptado!')),
        ],
      ),
    );

    if (confirm == true) {
      await _firestore.markAsAdopted(post.id);
      widget.onRefresh();
    }
  }

  void _showRestrictedActionModal(String action) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: BuscapetTheme.bgCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: BuscapetTheme.border),
        ),
        title: const Row(
          children: [
            Icon(Icons.shield_outlined, color: BuscapetTheme.warning, size: 22),
            SizedBox(width: 8),
            Text('Acción Restringida',
                style: TextStyle(
                    color: BuscapetTheme.textMain,
                    fontWeight: FontWeight.w800,
                    fontSize: 16)),
          ],
        ),
        content: Text(
          'Solo el autor original de la publicación (${post.user.name}) o el administrador pueden $action para garantizar la veracidad y seguridad de la comunidad.',
          style: const TextStyle(
              color: BuscapetTheme.textLight, fontSize: 13, height: 1.4),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(backgroundColor: BuscapetTheme.primary),
            child: const Text('Entendido'),
          ),
        ],
      ),
    );
  }

  void _handleContact() {
    if (!AuthService().isLoggedIn) {
      _showLoginRequired('contactar al dueño');
      return;
    }

    final messageController = TextEditingController();

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: BuscapetTheme.bgCard,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: BuscapetTheme.border),
        ),
        title: Row(
          children: [
            const Icon(Icons.comment_rounded, color: BuscapetTheme.secondary, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text('Contactar a ${post.user.name}',
                  style: const TextStyle(
                      color: BuscapetTheme.textMain, fontWeight: FontWeight.w800, fontSize: 15)),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: BuscapetTheme.secondary.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: BuscapetTheme.secondary.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.notifications_active_rounded, size: 16, color: BuscapetTheme.secondary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Se enviará un mensaje y notificación push en segundo plano a ${post.user.name}.',
                      style: const TextStyle(fontSize: 11, color: BuscapetTheme.secondary, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: messageController,
              maxLines: 3,
              style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
              decoration: InputDecoration(
                hintText: 'Hola ${post.user.name}, tengo novedades sobre ${post.petName}...',
                hintStyle: const TextStyle(fontSize: 12),
                alignLabelWithHint: true,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancelar', style: TextStyle(color: BuscapetTheme.textMuted)),
          ),
          ElevatedButton.icon(
            onPressed: () {
              final msg = messageController.text.trim();
              if (msg.isEmpty) return;
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('🔔 Notificación push enviada en segundo plano a ${post.user.name}: "$msg"'),
                  backgroundColor: BuscapetTheme.success,
                  duration: const Duration(seconds: 4),
                ),
              );
            },
            icon: const Icon(Icons.send_rounded, size: 14),
            label: const Text('Enviar Mensaje'),
            style: ElevatedButton.styleFrom(backgroundColor: BuscapetTheme.secondary),
          ),
        ],
      ),
    );
  }

  void _showLoginRequired(String action) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('🔐 Debes iniciar sesión para $action'),
        backgroundColor: BuscapetTheme.warning,
      ),
    );
  }
}
