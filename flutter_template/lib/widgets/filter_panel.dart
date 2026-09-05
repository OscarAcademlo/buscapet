// =============================================================================
// WIDGET: FilterPanel — Filtros de ubicación (País, Provincia, Ciudad con Select)
// =============================================================================

import 'package:flutter/material.dart';
import '../theme.dart';

class FilterPanel extends StatefulWidget {
  final String country;
  final String state;
  final String city;
  final Function(String country, String state, String city) onApply;
  final VoidCallback onReset;

  const FilterPanel({
    super.key,
    required this.country,
    required this.state,
    required this.city,
    required this.onApply,
    required this.onReset,
  });

  @override
  State<FilterPanel> createState() => _FilterPanelState();
}

class _FilterPanelState extends State<FilterPanel> {
  String _country = 'AR';
  String _state = '';
  String _city = '';
  bool _customCity = false;
  final _customCityController = TextEditingController();

  // Países disponibles
  static const _countries = [
    ('', '🌎 Todos los Países'),
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
    '',
    'Buenos Aires',
    'CABA',
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

  // Ciudades / Barrios de Argentina por Provincia
  static const Map<String, List<String>> _argCities = {
    'CABA': [
      '',
      'Palermo',
      'Caballito',
      'Belgrano',
      'Recoleta',
      'Villa Urquiza',
      'Flores',
      'Almagro',
      'San Telmo',
      'Núñez',
      'Villa Crespo',
      'Barracas',
      'Balvanera',
      'Colegiales',
      'Villa Devoto',
      'Saavedra',
      'Mataderos',
      'Boedo',
      'Chacarita',
      'Puerto Madero',
    ],
    'Buenos Aires': [
      '',
      'La Plata',
      'San Isidro',
      'Vicente López',
      'Tigre',
      'San Fernando',
      'Quilmes',
      'Lomas de Zamora',
      'Lanús',
      'Avellaneda',
      'Morón',
      'San Martín',
      'Tres de Febrero',
      'Pilar',
      'Escobar',
      'Mar del Plata',
      'Bahía Blanca',
      'Tandil',
      'Olavarría',
      'Zárate',
      'Campana',
      'Pergamino',
      'Junín',
      'Necochea',
    ],
    'Córdoba': [
      '',
      'Córdoba Capital',
      'Villa Carlos Paz',
      'Río Cuarto',
      'Villa María',
      'Alta Gracia',
      'San Francisco',
      'Jesús María',
      'La Falda',
      'Cosquín',
      'Río Ceballos',
    ],
    'Santa Fe': [
      '',
      'Rosario',
      'Santa Fe Capital',
      'Rafaela',
      'Venado Tuerto',
      'Reconquista',
      'Santo Tomé',
      'Esperanza',
      'Villa Gobernador Gálvez',
      'Granadero Baigorria',
      'San Lorenzo',
    ],
    'Mendoza': [
      '',
      'Mendoza Capital',
      'Godoy Cruz',
      'Guaymallén',
      'Las Heras',
      'San Rafael',
      'Luján de Cuyo',
      'Maipú',
      'San Martín',
      'Rivadavia',
    ],
    'Río Negro': [
      '',
      'San Carlos de Bariloche',
      'General Roca',
      'Cipolletti',
      'Viedma',
      'Villa Regina',
      'Cinco Saltos',
      'Catriel',
      'El Bolsón',
      'San Antonio Oeste',
      'Las Grutas',
      'Choele Choel',
    ],
    'Neuquén': [
      '',
      'Neuquén Capital',
      'San Martín de los Andes',
      'Villa La Angostura',
      'Cutral Có',
      'Plottier',
      'Centenario',
      'Zapala',
      'Chos Malal',
      'Junín de los Andes',
    ],
    'Salta': [
      '',
      'Salta Capital',
      'San Ramón de la Nueva Orán',
      'Tartagal',
      'Cafayate',
      'General Güemes',
      'Rosario de la Frontera',
    ],
    'Tucumán': [
      '',
      'San Miguel de Tucumán',
      'Yerba Buena',
      'Tafí Viejo',
      'Concepción',
      'Aguilares',
      'Monteros',
      'Banda del Río Salí',
    ],
    'Entre Ríos': [
      '',
      'Paraná',
      'Concordia',
      'Gualeguaychú',
      'Concepción del Uruguay',
      'Gualeguay',
      'Villaguay',
      'Chajarí',
    ],
    'Chubut': [
      '',
      'Comodoro Rivadavia',
      'Trelew',
      'Puerto Madryn',
      'Esquel',
      'Rawson',
      'Rada Tilly',
    ],
    'Misiones': [
      '',
      'Posadas',
      'Puerto Iguazú',
      'Oberá',
      'Eldorado',
      'Apóstoles',
      'San Vicente',
    ],
    'Corrientes': [
      '',
      'Corrientes Capital',
      'Goya',
      'Paso de los Libres',
      'Curuzú Cuatiá',
      'Mercedes',
      'Bella Vista',
    ],
    'San Juan': [
      '',
      'San Juan Capital',
      'Rawson',
      'Rivadavia',
      'Chimbas',
      'Santa Lucía',
      'Caucete',
    ],
    'San Luis': [
      '',
      'San Luis Capital',
      'Villa Mercedes',
      'Merlo',
      'Juana Koslay',
      'La Punta',
    ],
    'Jujuy': [
      '',
      'San Salvador de Jujuy',
      'Palpalá',
      'San Pedro de Jujuy',
      'Libertador General San Martín',
      'Perico',
    ],
    'Chaco': [
      '',
      'Resistencia',
      'Presidencia Roque Sáenz Peña',
      'Barranqueras',
      'Fontana',
      'Villa Ángela',
    ],
    'Santiago del Estero': [
      '',
      'Santiago del Estero Capital',
      'La Banda',
      'Termas de Río Hondo',
      'Añatuya',
      'Frías',
    ],
    'Tierra del Fuego': [
      '',
      'Ushuaia',
      'Río Grande',
      'Tolhuin',
    ],
    'Santa Cruz': [
      '',
      'Río Gallegos',
      'Caleta Olivia',
      'El Calafate',
      'Pico Truncado',
      'Puerto Deseado',
    ],
    'La Pampa': [
      '',
      'Santa Rosa',
      'General Pico',
      'Toay',
      'Realicó',
    ],
    'Catamarca': [
      '',
      'San Fernando del Valle de Catamarca',
      'Valle Viejo',
      'Andalgalá',
      'Tinogasta',
    ],
    'La Rioja': [
      '',
      'La Rioja Capital',
      'Chilecito',
      'Aimogasta',
      'Chamical',
    ],
    'Formosa': [
      '',
      'Formosa Capital',
      'Clorinda',
      'Pirané',
      'El Colorado',
    ],
  };

  @override
  void initState() {
    super.initState();
    _country = widget.country;
    _state = widget.state;
    _city = widget.city;
    if (_city.isNotEmpty && _getCurrentCities().contains(_city) == false) {
      _customCity = true;
      _customCityController.text = _city;
    }
  }

  @override
  void dispose() {
    _customCityController.dispose();
    super.dispose();
  }

  List<String> _getCurrentCities() {
    if (_state.isEmpty) {
      return ['', 'Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'Bariloche', 'La Plata', 'Mar del Plata'];
    }
    return _argCities[_state] ?? ['', 'Centro', 'Norte', 'Sur'];
  }

  @override
  Widget build(BuildContext context) {
    final availableCities = _getCurrentCities();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          _sectionTitle('📍 Ubicación Geográfica'),
          const SizedBox(height: 12),

          // País
          _label('País:'),
          const SizedBox(height: 4),
          _buildDropdown(
            value: _country,
            items: _countries
                .map((c) => DropdownMenuItem(value: c.$1, child: Text(c.$2)))
                .toList(),
            onChanged: (val) => setState(() {
              _country = val ?? '';
              _state = '';
              _city = '';
              _customCity = false;
            }),
          ),
          const SizedBox(height: 12),

          // Provincia / Estado
          if (_country == 'AR') ...[
            _label('Provincia / Estado:'),
            const SizedBox(height: 4),
            _buildDropdown(
              value: _argProvinces.contains(_state) ? _state : '',
              items: _argProvinces
                  .map((p) => DropdownMenuItem(
                      value: p,
                      child: Text(p.isEmpty ? 'Todas las provincias' : p)))
                  .toList(),
              onChanged: (val) => setState(() {
                _state = val ?? '';
                _city = '';
                _customCity = false;
              }),
            ),
            const SizedBox(height: 12),
          ],

          // Ciudad (Select Dropdown)
          _label('Ciudad / Localidad:'),
          const SizedBox(height: 4),
          if (!_customCity) ...[
            _buildDropdown(
              value: availableCities.contains(_city) ? _city : '',
              items: [
                ...availableCities.map((c) => DropdownMenuItem(
                      value: c,
                      child: Text(c.isEmpty ? 'Todas las ciudades' : c),
                    )),
                const DropdownMenuItem(
                  value: '__custom__',
                  child: Text('✏️ Otra ciudad (escribir)...'),
                ),
              ],
              onChanged: (val) {
                if (val == '__custom__') {
                  setState(() {
                    _customCity = true;
                    _city = '';
                  });
                } else {
                  setState(() {
                    _city = val ?? '';
                  });
                }
              },
            ),
          ] else ...[
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _customCityController,
                    style: const TextStyle(fontSize: 13, color: BuscapetTheme.textMain),
                    decoration: InputDecoration(
                      hintText: 'Ingresá el nombre de tu ciudad...',
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.close_rounded, size: 16),
                        onPressed: () => setState(() {
                          _customCity = false;
                          _customCityController.clear();
                          _city = '';
                        }),
                      ),
                    ),
                    onChanged: (val) => _city = val.trim(),
                  ),
                ),
              ],
            ),
          ],

          const SizedBox(height: 20),

          // Botón Aplicar
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () {
                final finalCity = _customCity ? _customCityController.text.trim() : _city;
                widget.onApply(_country, _state, finalCity);
              },
              icon: const Icon(Icons.check_rounded, size: 16),
              label: const Text('Aplicar Filtro'),
            ),
          ),
          const SizedBox(height: 8),

          // Botón Ver todo
          SizedBox(
            width: double.infinity,
            child: TextButton.icon(
              onPressed: () {
                setState(() {
                  _country = '';
                  _state = '';
                  _city = '';
                  _customCity = false;
                  _customCityController.clear();
                });
                widget.onReset();
              },
              icon: const Icon(Icons.public_rounded, size: 14),
              label: const Text('Ver Todo el Mundo'),
              style: TextButton.styleFrom(
                foregroundColor: BuscapetTheme.textMuted,
                padding: const EdgeInsets.symmetric(vertical: 10),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w800,
        color: BuscapetTheme.textMain,
      ),
    );
  }

  Widget _label(String text) {
    return Text(
      text,
      style: const TextStyle(
        fontSize: 11.5,
        fontWeight: FontWeight.w600,
        color: BuscapetTheme.textMuted,
      ),
    );
  }

  Widget _buildDropdown({
    required String value,
    required List<DropdownMenuItem<String>> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: BuscapetTheme.bgInput,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: BuscapetTheme.border),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          isExpanded: true,
          dropdownColor: BuscapetTheme.bgInput,
          style: const TextStyle(
            fontSize: 13,
            color: BuscapetTheme.textMain,
            fontWeight: FontWeight.w600,
          ),
          icon: const Icon(Icons.keyboard_arrow_down_rounded,
              color: BuscapetTheme.textMuted, size: 20),
          items: items,
          onChanged: onChanged,
        ),
      ),
    );
  }
}
