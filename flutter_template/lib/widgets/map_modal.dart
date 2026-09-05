// =============================================================================
// WIDGET: MapModal — Mapa Interactivo 100% Gratuito (OpenStreetMap + FlutterMap)
// =============================================================================

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../theme.dart';
import '../models/pet_post.dart';

class MapModal extends StatefulWidget {
  final PetPost post;

  const MapModal({super.key, required this.post});

  @override
  State<MapModal> createState() => _MapModalState();
}

class _MapModalState extends State<MapModal> {
  final MapController _mapController = MapController();
  double _currentZoom = 15.0;

  PetPost get post => widget.post;

  @override
  Widget build(BuildContext context) {
    final double lat = post.location.lat ?? -34.6037;
    final double lng = post.location.lng ?? -58.3816;
    final center = LatLng(lat, lng);

    final bool isLost = post.type == 'lost';
    final Color badgeColor = isLost ? BuscapetTheme.danger : BuscapetTheme.success;
    final size = MediaQuery.of(context).size;
    final isDesktop = size.width > 700;

    return Dialog(
      backgroundColor: BuscapetTheme.bgCard,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: BuscapetTheme.border),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: SizedBox(
          width: isDesktop ? 750 : double.infinity,
          height: isDesktop ? 580 : 480,
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                color: BuscapetTheme.bgInput,
                child: Row(
                  children: [
                    Icon(
                      isLost ? Icons.location_history_rounded : Icons.camera_alt_outlined,
                      color: badgeColor,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isLost
                                ? 'Ubicación Aproximada (Última vez visto)'
                                : 'Ubicación donde se tomó la foto',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: BuscapetTheme.textMain,
                            ),
                          ),
                          Text(
                            post.petName,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: badgeColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 20),
                      color: BuscapetTheme.textMuted,
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
              ),

              // OpenStreetMap View con Gestos de Zoom, Rotación y Nitidez
              Expanded(
                child: Stack(
                  children: [
                    FlutterMap(
                      mapController: _mapController,
                      options: MapOptions(
                        initialCenter: center,
                        initialZoom: _currentZoom,
                        minZoom: 3.0,
                        maxZoom: 19.0,
                        interactionOptions: const InteractionOptions(
                          flags: InteractiveFlag.all, // Zoom 2 dedos, rotar pellizcando, arrastrar y scroll
                        ),
                      ),
                      children: [
                        TileLayer(
                          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          userAgentPackageName: 'com.buscapet.app',
                          retinaMode: RetinaMode.isHighDensity(context),
                          maxZoom: 19,
                          maxNativeZoom: 19,
                        ),
                        // Círculo de área aproximada
                        CircleLayer(
                          circles: [
                            CircleMarker(
                              point: center,
                              radius: 120,
                              useRadiusInMeter: true,
                              color: badgeColor.withValues(alpha: 0.18),
                              borderColor: badgeColor,
                              borderStrokeWidth: 2,
                            ),
                          ],
                        ),
                        // Marcador con foto o pin
                        MarkerLayer(
                          markers: [
                            Marker(
                              point: center,
                              width: 50,
                              height: 50,
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  Container(
                                    width: 44,
                                    height: 44,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: badgeColor,
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.4),
                                          blurRadius: 8,
                                          offset: const Offset(0, 3),
                                        ),
                                      ],
                                      border: Border.all(color: Colors.white, width: 2),
                                    ),
                                    child: ClipOval(
                                      child: post.photos.isNotEmpty
                                          ? Image.network(
                                              post.photos.first,
                                              fit: BoxFit.cover,
                                              errorBuilder: (_, __, ___) => const Icon(
                                                Icons.pets_rounded,
                                                color: Colors.white,
                                                size: 20,
                                              ),
                                            )
                                          : const Icon(
                                              Icons.pets_rounded,
                                              color: Colors.white,
                                              size: 20,
                                            ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),

                    // Controles flotantes de Zoom y Brújula (+ / - / Reset Norte)
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Column(
                        children: [
                          _mapControlBtn(
                            icon: Icons.add_rounded,
                            onTap: () {
                              _currentZoom = (_mapController.camera.zoom + 1).clamp(3.0, 19.0);
                              _mapController.move(_mapController.camera.center, _currentZoom);
                            },
                          ),
                          const SizedBox(height: 6),
                          _mapControlBtn(
                            icon: Icons.remove_rounded,
                            onTap: () {
                              _currentZoom = (_mapController.camera.zoom - 1).clamp(3.0, 19.0);
                              _mapController.move(_mapController.camera.center, _currentZoom);
                            },
                          ),
                          const SizedBox(height: 6),
                          _mapControlBtn(
                            icon: Icons.explore_rounded,
                            onTap: () {
                              _mapController.rotate(0);
                            },
                          ),
                        ],
                      ),
                    ),

                    // Cartel informativo flotante
                    Positioned(
                      bottom: 12,
                      left: 12,
                      right: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: BuscapetTheme.bgCard.withValues(alpha: 0.92),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: BuscapetTheme.border),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.4),
                              blurRadius: 6,
                            ),
                          ],
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.info_outline_rounded,
                                size: 16, color: BuscapetTheme.secondary),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                post.location.address.isNotEmpty
                                    ? post.location.address
                                    : post.location.displayName,
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w600,
                                  color: BuscapetTheme.textMain,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
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
        ),
      ),
    );
  }

  Widget _mapControlBtn({required IconData icon, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          color: BuscapetTheme.bgCard.withValues(alpha: 0.9),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: BuscapetTheme.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 4,
            ),
          ],
        ),
        child: Icon(icon, size: 18, color: BuscapetTheme.textMain),
      ),
    );
  }
}
