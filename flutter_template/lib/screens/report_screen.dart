// =============================================================================
// PANTALLA: ReportScreen — Publicación Rápida (1 Clic en la calle) y Estándar
// =============================================================================

import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:uuid/uuid.dart';
import '../theme.dart';
import '../models/pet_post.dart';
import '../services/firestore_service.dart';
import '../services/storage_service.dart';

class ReportScreen extends StatefulWidget {
  final String initialType;
  const ReportScreen({super.key, this.initialType = 'lost'});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> with SingleTickerProviderStateMixin {
  final _firestore = FirestoreService();
  final _storage = StorageService();
  final _picker = ImagePicker();
  final _uuid = const Uuid();
  final MapController _miniMapController = MapController();

  late TabController _tabModeController;
  int _currentMode = 0; // 0 = Rápida (1 Clic en la calle), 1 = Estándar (Formulario Completo)

  String _type = 'found'; // 'lost', 'found', 'adopt', 'spotted'
  final _petNameCtrl = TextEditingController();
  String _species = 'Perro';
  String _breed = '';
  String _gender = 'Desconocido';
  final _descCtrl = TextEditingController();
  final _tagInfoCtrl = TextEditingController(); // Información de la chapita
  final _addressCtrl = TextEditingController();

  String _country = 'AR';
  String _stateVal = 'CABA';
  String _cityVal = 'Palermo';
  bool _customCity = false;
  final _customCityCtrl = TextEditingController();

  LatLng _currentCoordinates = const LatLng(-34.5889, -58.4305);
  bool _isUsingGpsCamera = true;

  // 3 Slots de Fotos (Índice 0, 1, 2)
  final List<dynamic> _photoSlots = [null, null, null];
  bool _loading = false;

  // Países
  static const _countries = [
    ('AR', '🇦🇷 Argentina'),
    ('CL', '🇨🇱 Chile'),
    ('UY', '🇺🇾 Uruguay'),
    ('MX', '🇲🇽 México'),
    ('CO', '🇨🇴 Colombia'),
    ('PE', '🇵🇪 Perú'),
    ('BR', '🇧🇷 Brasil'),
    ('ES', '🇪🇸 España'),
    ('US', '🇺🇸 Estados Unidos'),
  ];

  // Provincias de Argentina
  static const _argProvinces = [
    'CABA',
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego',
    'Tucumán',
  ];

  // Ciudades por Provincia
  static const Map<String, List<String>> _argCities = {
    'CABA': [
      'Palermo', 'Caballito', 'Belgrano', 'Recoleta', 'Villa Urquiza',
      'Flores', 'Almagro', 'San Telmo', 'Núñez', 'Villa Crespo',
      'Barracas', 'Balvanera', 'Colegiales', 'Villa Devoto', 'Saavedra'
    ],
    'Buenos Aires': [
      'La Plata', 'San Isidro', 'Vicente López', 'Tigre', 'San Fernando',
      'Quilmes', 'Lomas de Zamora', 'Lanús', 'Avellaneda', 'Morón',
      'San Martín', 'Tres de Febrero', 'Pilar', 'Escobar', 'Mar del Plata',
      'Bahía Blanca', 'Tandil', 'Olavarría', 'Zárate', 'Campana', 'Pergamino'
    ],
    'Córdoba': [
      'Córdoba Capital', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María',
      'Alta Gracia', 'San Francisco', 'Jesús María', 'La Falda', 'Cosquín'
    ],
    'Santa Fe': [
      'Rosario', 'Santa Fe Capital', 'Rafaela', 'Venado Tuerto',
      'Reconquista', 'Santo Tomé', 'Esperanza', 'Villa Gobernador Gálvez'
    ],
    'Mendoza': [
      'Mendoza Capital', 'Godoy Cruz', 'Guaymallén', 'Las Heras',
      'San Rafael', 'Luján de Cuyo', 'Maipú', 'San Martín'
    ],
    'Río Negro': [
      'San Carlos de Bariloche', 'General Roca', 'Cipolletti', 'Viedma',
      'Villa Regina', 'Cinco Saltos', 'Catriel', 'El Bolsón', 'Las Grutas'
    ],
    'Neuquén': [
      'Neuquén Capital', 'San Martín de los Andes', 'Villa La Angostura',
      'Cutral Có', 'Plottier', 'Centenario', 'Zapala'
    ],
    'Salta': [
      'Salta Capital', 'San Ramón de la Nueva Orán', 'Tartagal', 'Cafayate'
    ],
    'Tucumán': [
      'San Miguel de Tucumán', 'Yerba Buena', 'Tafí Viejo', 'Concepción'
    ],
    'Entre Ríos': [
      'Paraná', 'Concordia', 'Gualeguaychú', 'Concepción del Uruguay'
    ],
    'Chubut': [
      'Comodoro Rivadavia', 'Trelew', 'Puerto Madryn', 'Esquel', 'Rawson'
    ],
    'Misiones': [
      'Posadas', 'Puerto Iguazú', 'Oberá', 'Eldorado', 'Apóstoles'
    ],
    'Corrientes': [
      'Corrientes Capital', 'Goya', 'Paso de los Libres', 'Curuzú Cuatiá'
    ],
    'San Juan': [
      'San Juan Capital', 'Rawson', 'Rivadavia', 'Chimbas'
    ],
    'San Luis': [
      'San Luis Capital', 'Villa Mercedes', 'Merlo', 'Juana Koslay'
    ],
    'Jujuy': [
      'San Salvador de Jujuy', 'Palpalá', 'San Pedro de Jujuy'
    ],
    'Chaco': [
      'Resistencia', 'Presidencia Roque Sáenz Peña', 'Barranqueras'
    ],
    'Santiago del Estero': [
      'Santiago del Estero Capital', 'La Banda', 'Termas de Río Hondo'
    ],
    'Tierra del Fuego': [
      'Ushuaia', 'Río Grande', 'Tolhuin'
    ],
    'Santa Cruz': [
      'Río Gallegos', 'Caleta Olivia', 'El Calafate'
    ],
    'La Pampa': [
      'Santa Rosa', 'General Pico', 'Toay'
    ],
    'Catamarca': [
      'San Fernando del Valle de Catamarca', 'Valle Viejo'
    ],
    'La Rioja': [
      'La Rioja Capital', 'Chilecito'
    ],
    'Formosa': [
      'Formosa Capital', 'Clorinda'
    ],
  };

  // Coordenadas aproximadas por ciudad / provincia
  static const Map<String, LatLng> _cityCoordinates = {
    'CABA': LatLng(-34.6037, -58.3816),
    'Palermo': LatLng(-34.5889, -58.4305),
    'Caballito': LatLng(-34.6200, -58.4400),
    'Belgrano': LatLng(-34.5627, -58.4564),
    'Recoleta': LatLng(-34.5875, -58.3974),
    'Buenos Aires': LatLng(-34.9214, -57.9545),
    'La Plata': LatLng(-34.9214, -57.9545),
    'Mar del Plata': LatLng(-38.0055, -57.5562),
    'Córdoba': LatLng(-31.4201, -64.1888),
    'Córdoba Capital': LatLng(-31.4201, -64.1888),
    'Santa Fe': LatLng(-31.6333, -60.7000),
    'Rosario': LatLng(-32.9587, -60.6930),
    'Mendoza': LatLng(-32.8895, -68.8458),
    'Mendoza Capital': LatLng(-32.8895, -68.8458),
    'Río Negro': LatLng(-41.1335, -71.3103),
    'San Carlos de Bariloche': LatLng(-41.1335, -71.3103),
    'Neuquén': LatLng(-38.9516, -68.0591),
    'Salta': LatLng(-24.7821, -65.4232),
    'Tucumán': LatLng(-26.8083, -65.2176),
    'Ushuaia': LatLng(-54.8019, -68.3030),
  };

  // Sugerencias de calles y números
  static const _streetSuggestions = [
    'Av. San Martín 1540',
    'Av. Rivadavia 2400',
    'Av. Corrientes 3200',
    'Av. Santa Fe 1820',
    'Av. Belgrano 850',
    'Av. 9 de Julio 1200',
    'Av. Libertador 4500',
    'Av. Colón 1100',
    'Av. Pellegrini 1650',
    'Av. Bustillo Km 5',
    'Calle 25 de Mayo 350',
    'Calle San Juan 840',
    'Plaza Principal (Frente a la fuente)',
    'Plaza San Martín',
    'Parque Central',
  ];

  @override
  void initState() {
    super.initState();
    _type = widget.initialType;
    _currentMode = (_type == 'found' || _type == 'spotted') ? 0 : 1;
    _tabModeController = TabController(length: 2, vsync: this, initialIndex: _currentMode);
    _tabModeController.addListener(() {
      if (!_tabModeController.indexIsChanging) {
        setState(() => _currentMode = _tabModeController.index);
      }
    });
    _updateCityForState(_stateVal);
    // Obtener la ubicación GPS real del dispositivo del usuario
    _fetchLiveDeviceLocation();
  }

  Future<void> _fetchLiveDeviceLocation({bool showFeedback = false}) async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (showFeedback && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('⚠️ El servicio de ubicación / GPS está desactivado.')),
          );
        }
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (showFeedback && mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('⚠️ Permiso de ubicación denegado.')),
            );
          }
          return;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        if (showFeedback && mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('⚠️ Permiso de ubicación bloqueado permanentemente en el navegador/dispositivo.')),
          );
        }
        return;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );

      if (mounted) {
        setState(() {
          _currentCoordinates = LatLng(position.latitude, position.longitude);
          _isUsingGpsCamera = true;
        });
        try {
          _miniMapController.move(_currentCoordinates, 15.5);
        } catch (_) {}

        if (showFeedback) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('🎯 ¡Ubicación GPS real detectada con éxito!'),
              backgroundColor: BuscapetTheme.success,
            ),
          );
        }
      }
    } catch (e) {
      debugPrint('Error al obtener GPS: $e');
    }
  }

  void _updateCityForState(String state) {
    final cities = _argCities[state] ?? ['Centro'];
    _cityVal = cities.first;
    _customCity = false;
    _updateCoordinatesForLocation();
  }

  void _updateCoordinatesForLocation() {
    LatLng? target = _cityCoordinates[_cityVal] ?? _cityCoordinates[_stateVal];
    if (target != null) {
      setState(() {
        _currentCoordinates = target;
      });
      try {
        _miniMapController.move(_currentCoordinates, 14.5);
      } catch (_) {}
    }
  }

  @override
  void dispose() {
    _tabModeController.dispose();
    _petNameCtrl.dispose();
    _descCtrl.dispose();
    _tagInfoCtrl.dispose();
    _addressCtrl.dispose();
    _customCityCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentUser = FirebaseAuth.instance.currentUser;

    if (currentUser == null) {
      return Scaffold(
        backgroundColor: BuscapetTheme.bgMain,
        appBar: AppBar(
          title: const Text('📢 Publicar Mascota'),
          backgroundColor: BuscapetTheme.bgCard,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.lock_rounded, size: 54, color: BuscapetTheme.warning),
                const SizedBox(height: 16),
                const Text('Inicio de Sesión Requerido',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: BuscapetTheme.textMain)),
                const SizedBox(height: 8),
                const Text(
                  'Para publicar una mascota y poder recibir mensajes o avisos en tiempo real, necesitás ingresar a tu cuenta.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: BuscapetTheme.textMuted),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Ir a Iniciar Sesión'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    String screenTitle;
    if (_type == 'lost') {
      screenTitle = '🚨 Reportar mi perro perdido';
    } else if (_type == 'found') {
      screenTitle = '👀 Encontré perro / mascota';
    } else if (_type == 'adopt') {
      screenTitle = '🏡 Ofrecer en Adopción';
    } else {
      screenTitle = '👁️ Mascota en Vía Pública';
    }

    return Scaffold(
      backgroundColor: BuscapetTheme.bgMain,
      appBar: AppBar(
        title: Text(screenTitle, style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.w800)),
        backgroundColor: BuscapetTheme.bgCard,
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(42),
          child: Container(
            color: BuscapetTheme.bgCard,
            child: TabBar(
              controller: _tabModeController,
              indicatorColor: BuscapetTheme.primary,
              indicatorWeight: 3,
              labelColor: BuscapetTheme.primary,
              unselectedLabelColor: BuscapetTheme.textMuted,
              labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
              tabs: const [
                Tab(text: '⚡ Reporte Rápido (1 Clic)'),
                Tab(text: '📝 Formulario Estándar'),
              ],
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: _currentMode == 0 ? _buildQuickReportView() : _buildStandardReportView(),
      ),
    );
  }

  // ============ ⚡ VISTA 1: PUBLICACIÓN RÁPIDA (1 Clic en la calle) ============
  Widget _buildQuickReportView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Cartel explicativo
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: BuscapetTheme.primary.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: BuscapetTheme.primary.withValues(alpha: 0.3)),
          ),
          child: const Row(
            children: [
              Icon(Icons.bolt_rounded, color: BuscapetTheme.primary, size: 22),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  '¡Modo Rápido! Si vas caminando o en transporte público, tomá la foto y publicá de inmediato con la ubicación automática del mapa.',
                  style: TextStyle(fontSize: 11.5, color: BuscapetTheme.textLight, height: 1.3),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Tipo de publicación rápida
        _sectionTitle('¿Qué mascota viste?'),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildFormDropdown(
                label: 'Tipo de Mascota',
                value: _species,
                options: ['Perro', 'Gato', 'Ave', 'Otro'],
                onChanged: (v) => setState(() => _species = v!),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildFormDropdown(
                label: 'Situación',
                value: _type,
                options: ['found', 'spotted', 'lost'],
                customLabels: {
                  'found': '🟢 La tengo en resguardo',
                  'spotted': '👁️ Vista en la calle',
                  'lost': '🔴 Mi perro perdido',
                },
                onChanged: (v) => setState(() => _type = v!),
              ),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // 3 SLOTS DE FOTOS (Foto 1, Foto 2, Foto 3)
        _buildThreePhotoSlots(isQuick: true),

        const SizedBox(height: 16),

        // Campo opcional de chapita / collar
        TextField(
          controller: _tagInfoCtrl,
          style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
          decoration: const InputDecoration(
            labelText: '🏷️ ¿Tiene collar o chapita? ¿Qué dice? (Opcional)',
            hintText: 'Ej: Chapita roja que dice Toby, o sin collar...',
            prefixIcon: Icon(Icons.badge_outlined, size: 18),
          ),
        ),

        const SizedBox(height: 16),

        // Ubicación Automática y Mapa en Vivo
        _sectionTitle('📍 Ubicación Automática del Reporte'),
        const SizedBox(height: 6),
        _buildLiveMiniMap(isLost: _type == 'lost'),

        const SizedBox(height: 24),

        // Botón de Publicación Rápida
        SizedBox(
          width: double.infinity,
          child: ElevatedButton.icon(
            onPressed: _loading ? null : _submitQuick,
            icon: const Icon(Icons.bolt_rounded, size: 20),
            label: const Text('⚡ Publicar Reporte Rápido Ya',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 15),
              backgroundColor: BuscapetTheme.primary,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ),
        const SizedBox(height: 30),
      ],
    );
  }

  // ============ 📝 VISTA 2: PUBLICACIÓN ESTÁNDAR (Formulario Completo) ============
  Widget _buildStandardReportView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildTypeSelector(),
        const SizedBox(height: 16),
        _buildThreePhotoSlots(isQuick: false),
        const SizedBox(height: 16),
        _sectionTitle('🐾 Datos de la Mascota'),
        const SizedBox(height: 10),
        _buildPetForm(),
        const SizedBox(height: 16),
        _sectionTitle('📍 Ubicación Geográfica y Mapa'),
        const SizedBox(height: 10),
        _buildLocationForm(),
        const SizedBox(height: 24),
        _buildSubmitButton(),
        const SizedBox(height: 40),
      ],
    );
  }

  // ============ 3 SLOTS DE FOTOS (Foto 1, Foto 2, Foto 3) ============
  Widget _buildThreePhotoSlots({required bool isQuick}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _sectionTitle(isQuick ? '📸 Fotos (Foto 1 obligatoria)' : '📸 Fotos de la Mascota (3 fotos)'),
            Text(
              '${_photoSlots.where((p) => p != null).length}/3 fotos',
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: BuscapetTheme.primary),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: List.generate(3, (index) {
            final slotFile = _photoSlots[index];
            final bool isMain = index == 0;
            return Expanded(
              child: Container(
                height: 105,
                margin: EdgeInsets.only(right: index < 2 ? 8 : 0),
                decoration: BoxDecoration(
                  color: BuscapetTheme.bgInput,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: slotFile != null
                        ? BuscapetTheme.primary
                        : (isMain ? BuscapetTheme.primary.withValues(alpha: 0.5) : BuscapetTheme.border),
                    width: slotFile != null ? 1.5 : 1,
                  ),
                ),
                child: slotFile != null
                    ? Stack(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(11),
                            child: SizedBox.expand(
                              child: kIsWeb
                                  ? Image.memory(slotFile as Uint8List, fit: BoxFit.cover)
                                  : Image.file(slotFile as File, fit: BoxFit.cover),
                            ),
                          ),
                          Positioned(
                            top: 4,
                            right: 4,
                            child: GestureDetector(
                              onTap: () => setState(() => _photoSlots[index] = null),
                              child: Container(
                                width: 22,
                                height: 22,
                                decoration: const BoxDecoration(
                                  color: BuscapetTheme.danger,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(Icons.close_rounded, size: 14, color: Colors.white),
                              ),
                            ),
                          ),
                          Positioned(
                            bottom: 4,
                            left: 4,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.7),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text('Foto ${index + 1}',
                                  style: const TextStyle(fontSize: 9, color: Colors.white, fontWeight: FontWeight.w700)),
                            ),
                          ),
                        ],
                      )
                    : InkWell(
                        onTap: () => _showPhotoSourceDialog(index),
                        borderRadius: BorderRadius.circular(12),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              index == 0
                                  ? Icons.add_a_photo_rounded
                                  : (index == 1 ? Icons.badge_outlined : Icons.add_photo_alternate_rounded),
                              size: 26,
                              color: isMain ? BuscapetTheme.primary : BuscapetTheme.textMuted,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              index == 0 ? '+ Foto 1' : (index == 1 ? '+ Foto 2 (Chapita)' : '+ Foto 3'),
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: isMain ? BuscapetTheme.primary : BuscapetTheme.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
              ),
            );
          }),
        ),
      ],
    );
  }

  void _showPhotoSourceDialog(int slotIndex) {
    showModalBottomSheet(
      context: context,
      backgroundColor: BuscapetTheme.bgCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('📷 Foto ${slotIndex + 1}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: BuscapetTheme.textMain)),
              const SizedBox(height: 4),
              const Text('¿Cómo querés agregar la foto?',
                  style: TextStyle(fontSize: 12, color: BuscapetTheme.textMuted)),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    _pickPhotoForSlot(slotIndex, ImageSource.camera);
                  },
                  icon: const Icon(Icons.camera_alt_rounded),
                  label: const Text('Tomar Foto con la Cámara'),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: BuscapetTheme.primary,
                      padding: const EdgeInsets.symmetric(vertical: 12)),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pop(context);
                    _pickPhotoForSlot(slotIndex, ImageSource.gallery);
                  },
                  icon: const Icon(Icons.photo_library_rounded),
                  label: const Text('Elegir de la Galería'),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: BuscapetTheme.bgInput,
                      foregroundColor: BuscapetTheme.textMain,
                      padding: const EdgeInsets.symmetric(vertical: 12)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickPhotoForSlot(int slotIndex, ImageSource source) async {
    try {
      final picked = await _picker.pickImage(
        source: source,
        maxWidth: 1200,
        maxHeight: 1200,
        imageQuality: 82,
      );
      if (picked == null) return;

      if (source == ImageSource.camera) {
        _isUsingGpsCamera = true;
      } else {
        _isUsingGpsCamera = false;
      }

      if (kIsWeb) {
        final bytes = await picked.readAsBytes();
        setState(() {
          _photoSlots[slotIndex] = bytes;
        });
      } else {
        setState(() {
          _photoSlots[slotIndex] = File(picked.path);
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al capturar foto: $e'), backgroundColor: BuscapetTheme.danger),
        );
      }
    }
  }

  // ============ MAPA EN VIVO ============
  Widget _buildLiveMiniMap({required bool isLost}) {
    final Color badgeColor = isLost ? BuscapetTheme.danger : BuscapetTheme.success;

    return Container(
      height: 190,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: BuscapetTheme.border),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            FlutterMap(
              mapController: _miniMapController,
              options: MapOptions(
                initialCenter: _currentCoordinates,
                initialZoom: 14.5,
                minZoom: 3.0,
                maxZoom: 19.0,
                interactionOptions: const InteractionOptions(flags: InteractiveFlag.all),
                onTap: (tapPosition, point) {
                  setState(() {
                    _currentCoordinates = point;
                  });
                },
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.buscapet.app',
                  retinaMode: RetinaMode.isHighDensity(context),
                  maxZoom: 19,
                ),
                CircleLayer(
                  circles: [
                    CircleMarker(
                      point: _currentCoordinates,
                      radius: 120,
                      useRadiusInMeter: true,
                      color: badgeColor.withValues(alpha: 0.22),
                      borderColor: badgeColor,
                      borderStrokeWidth: 2,
                    ),
                  ],
                ),
                MarkerLayer(
                  markers: [
                    Marker(
                      point: _currentCoordinates,
                      width: 44,
                      height: 44,
                      child: Container(
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: badgeColor,
                          border: Border.all(color: Colors.white, width: 2),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withValues(alpha: 0.4), blurRadius: 6, offset: const Offset(0, 2)),
                          ],
                        ),
                        child: const Icon(Icons.pets_rounded, color: Colors.white, size: 20),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            Positioned(
              top: 6,
              right: 6,
              child: InkWell(
                onTap: () => _fetchLiveDeviceLocation(showFeedback: true),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: BuscapetTheme.primary,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.my_location_rounded, size: 14, color: Colors.white),
                      SizedBox(width: 4),
                      Text('🎯 Mi GPS Actual',
                          style: TextStyle(fontSize: 10.5, color: Colors.white, fontWeight: FontWeight.w800)),
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 6,
              left: 6,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: BuscapetTheme.bgCard.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: BuscapetTheme.border),
                ),
                child: Text(
                  _isUsingGpsCamera
                      ? '📷 Ubicación Cámara (GPS Automático)'
                      : '📍 Lat: ${_currentCoordinates.latitude.toStringAsFixed(4)}, Lng: ${_currentCoordinates.longitude.toStringAsFixed(4)}',
                  style: const TextStyle(fontSize: 10, color: BuscapetTheme.textMain, fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeSelector() {
    final types = [
      ('lost', '🔴 Mascota Perdida (Busco a mi mascota)', BuscapetTheme.danger),
      ('found', '🟢 Mascota Encontrada (La tengo en resguardo)', BuscapetTheme.success),
      ('adopt', '💜 Dar en Adopción Responsable', BuscapetTheme.adopt),
      ('spotted', '👁️ Mascota Vista en la calle (Sin retener)', BuscapetTheme.warning),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle('¿Qué querés publicar?'),
        const SizedBox(height: 8),
        ...types.map((t) => GestureDetector(
              onTap: () => setState(() => _type = t.$1),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: _type == t.$1 ? t.$3.withValues(alpha: 0.15) : BuscapetTheme.bgCard,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: _type == t.$1 ? t.$3 : BuscapetTheme.border, width: _type == t.$1 ? 1.5 : 1),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: _type == t.$1 ? t.$3 : BuscapetTheme.border, width: 2),
                        color: _type == t.$1 ? t.$3 : Colors.transparent,
                      ),
                      child: _type == t.$1 ? const Icon(Icons.check_rounded, size: 10, color: Colors.white) : null,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(t.$2,
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _type == t.$1 ? t.$3 : BuscapetTheme.textMain)),
                    ),
                  ],
                ),
              ),
            )),
      ],
    );
  }

  Widget _buildPetForm() {
    return Column(
      children: [
        TextField(
          controller: _petNameCtrl,
          style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
          decoration: const InputDecoration(labelText: 'Nombre de la mascota *', hintText: 'Ej: Milo, Luna, Desconocido...'),
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: _buildFormDropdown(
                label: 'Especie',
                value: _species,
                options: ['Perro', 'Gato', 'Ave', 'Otro'],
                onChanged: (v) => setState(() => _species = v!),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _buildFormDropdown(
                label: 'Género',
                value: _gender,
                options: ['Macho', 'Hembra', 'Desconocido'],
                onChanged: (v) => setState(() => _gender = v!),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        TextField(
          style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
          decoration: const InputDecoration(labelText: 'Raza (opcional)', hintText: 'Ej: Mestizo, Labrador, Siamés...'),
          onChanged: (v) => _breed = v,
        ),
        const SizedBox(height: 10),
        TextField(
          controller: _descCtrl,
          maxLines: 3,
          style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
          decoration: const InputDecoration(
            labelText: 'Descripción detallada *',
            hintText: 'Color del pelaje, collar, tamaño, comportamiento, señas particulares...',
            alignLabelWithHint: true,
          ),
        ),
      ],
    );
  }

  Widget _buildLocationForm() {
    final availableCities = _argCities[_stateVal] ?? ['Centro', 'Norte', 'Sur'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildFormDropdown(
          label: 'País *',
          value: _country,
          options: _countries.map((c) => c.$1).toList(),
          customLabels: Map.fromEntries(_countries.map((c) => MapEntry(c.$1, c.$2))),
          onChanged: (v) {
            if (v != null) setState(() => _country = v);
          },
        ),
        const SizedBox(height: 10),
        if (_country == 'AR') ...[
          _buildFormDropdown(
            label: 'Provincia / Estado *',
            value: _argProvinces.contains(_stateVal) ? _stateVal : _argProvinces.first,
            options: _argProvinces,
            onChanged: (v) {
              if (v != null) {
                setState(() {
                  _stateVal = v;
                  _updateCityForState(v);
                });
              }
            },
          ),
          const SizedBox(height: 10),
          _buildFormDropdown(
            label: 'Ciudad / Localidad *',
            value: !_customCity && availableCities.contains(_cityVal) ? _cityVal : '__custom__',
            options: [...availableCities, '__custom__'],
            customLabels: {'__custom__': '✏️ Otra ciudad (escribir)...'},
            onChanged: (v) {
              if (v == '__custom__') {
                setState(() {
                  _customCity = true;
                  _cityVal = '';
                });
              } else if (v != null) {
                setState(() {
                  _customCity = false;
                  _cityVal = v;
                  _updateCoordinatesForLocation();
                });
              }
            },
          ),
          if (_customCity) ...[
            const SizedBox(height: 8),
            TextField(
              controller: _customCityCtrl,
              style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
              decoration: const InputDecoration(labelText: 'Nombre de tu Ciudad / Localidad', hintText: 'Ingresá tu ciudad o barrio...'),
              onChanged: (v) => _cityVal = v.trim(),
            ),
          ],
          const SizedBox(height: 12),
        ],

        const Text('Calle y Número / Esquina / Plaza *', style: TextStyle(fontSize: 11.5, color: BuscapetTheme.textMuted)),
        const SizedBox(height: 4),
        Autocomplete<String>(
          optionsBuilder: (TextEditingValue textEditingValue) {
            if (textEditingValue.text.isEmpty) return const Iterable<String>.empty();
            return _streetSuggestions.where((s) => s.toLowerCase().contains(textEditingValue.text.toLowerCase()));
          },
          onSelected: (String selection) {
            _addressCtrl.text = selection;
          },
          fieldViewBuilder: (context, controller, focusNode, onFieldSubmitted) {
            if (_addressCtrl.text.isNotEmpty && controller.text.isEmpty) {
              controller.text = _addressCtrl.text;
            }
            return TextField(
              controller: controller,
              focusNode: focusNode,
              style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
              decoration: InputDecoration(
                hintText: _type == 'lost' ? 'Ej: Av. San Martín 1540 (o esquina Moreno)...' : 'Ej: Plaza Central, Calle 25 de Mayo 350...',
                prefixIcon: const Icon(Icons.location_on_outlined, size: 18),
              ),
              onChanged: (v) => _addressCtrl.text = v,
            );
          },
        ),

        const SizedBox(height: 14),
        _buildLiveMiniMap(isLost: _type == 'lost'),
      ],
    );
  }

  Widget _buildFormDropdown({
    required String label,
    required String value,
    required List<String> options,
    Map<String, String>? customLabels,
    required Function(String?) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11.5, color: BuscapetTheme.textMuted)),
        const SizedBox(height: 4),
        Container(
          decoration: BoxDecoration(
            color: BuscapetTheme.bgInput,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: BuscapetTheme.border),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: DropdownButton<String>(
            value: options.contains(value) ? value : options.first,
            items: options.map((o) => DropdownMenuItem(value: o, child: Text(customLabels?[o] ?? o))).toList(),
            onChanged: onChanged,
            isExpanded: true,
            underline: const SizedBox(),
            dropdownColor: BuscapetTheme.bgInput,
            style: const TextStyle(fontFamily: 'Outfit', fontSize: 13, color: BuscapetTheme.textMain),
          ),
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: _loading ? null : _submitStandard,
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          backgroundColor: BuscapetTheme.primary,
        ),
        child: _loading
            ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : const Text('📢 Publicar Mascota', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800)),
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Text(text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: BuscapetTheme.textMain));
  }

  // ============ ENVÍO RÁPIDO ============
  Future<void> _submitQuick() async {
    final validPhotos = _photoSlots.where((p) => p != null).toList();
    if (validPhotos.isEmpty) {
      _showError('Debes agregar al menos la Foto 1 de la mascota.');
      return;
    }

    setState(() => _loading = true);
    try {
      final user = FirebaseAuth.instance.currentUser!;

      // Subir fotos
      final photoUrls = await _storage.uploadPhotos(validPhotos);

      final tagText = _tagInfoCtrl.text.trim();
      final String petTitle = 'Encontré este $_species en esta ubicación';
      final String desc = tagText.isNotEmpty
          ? 'Mascota vista en la vía pública. Identificación: $tagText.'
          : 'Mascota vista en la vía pública sin identificación visible. Publicado rápidamente desde la app.';

      final post = PetPost(
        id: _uuid.v4(),
        type: _type,
        petName: petTitle,
        species: _species,
        breed: 'Mestizo / Sin identificar',
        gender: _gender,
        description: desc,
        photos: photoUrls,
        user: PostUser(
          id: user.uid,
          name: user.displayName ?? user.email?.split('@')[0] ?? 'Usuario',
          email: user.email ?? '',
          avatar: user.photoURL ??
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        ),
        location: PostLocation(
          address: 'Ubicación de la cámara (Vía pública)',
          cityName: _cityVal,
          stateName: _stateVal,
          country: _country,
          lat: _currentCoordinates.latitude,
          lng: _currentCoordinates.longitude,
        ),
        createdAt: DateTime.now(),
      );

      await _firestore.createPost(post);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('⚡ ¡Reporte Rápido publicado con éxito!'),
            backgroundColor: BuscapetTheme.success,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      _showError('Error al publicar reporte rápido: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  // ============ ENVÍO ESTÁNDAR ============
  Future<void> _submitStandard() async {
    if (_petNameCtrl.text.trim().isEmpty) {
      _showError('El nombre de la mascota es obligatorio');
      return;
    }
    if (_descCtrl.text.trim().isEmpty) {
      _showError('La descripción es obligatoria');
      return;
    }
    if (_addressCtrl.text.trim().isEmpty) {
      _showError('La calle y número es obligatoria');
      return;
    }

    final finalCity = _customCity ? _customCityCtrl.text.trim() : _cityVal;
    if (finalCity.isEmpty) {
      _showError('Debes seleccionar o ingresar una ciudad');
      return;
    }

    final validPhotos = _photoSlots.where((p) => p != null).toList();

    setState(() => _loading = true);
    try {
      final user = FirebaseAuth.instance.currentUser!;

      List<String> photoUrls = [];
      if (validPhotos.isNotEmpty) {
        photoUrls = await _storage.uploadPhotos(validPhotos);
      }

      final post = PetPost(
        id: _uuid.v4(),
        type: _type,
        petName: _petNameCtrl.text.trim(),
        species: _species,
        breed: _breed,
        gender: _gender,
        description: _descCtrl.text.trim(),
        photos: photoUrls,
        user: PostUser(
          id: user.uid,
          name: user.displayName ?? user.email?.split('@')[0] ?? 'Usuario',
          email: user.email ?? '',
          avatar: user.photoURL ??
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        ),
        location: PostLocation(
          address: _addressCtrl.text.trim(),
          cityName: finalCity,
          stateName: _stateVal,
          country: _country,
          lat: _currentCoordinates.latitude,
          lng: _currentCoordinates.longitude,
        ),
        createdAt: DateTime.now(),
      );

      await _firestore.createPost(post);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('🎉 ¡Publicación creada exitosamente!'),
            backgroundColor: BuscapetTheme.success,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      _showError('Error al publicar: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: BuscapetTheme.danger),
    );
  }
}
