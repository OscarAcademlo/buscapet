import 'package:flutter/material.dart';

enum DeviceSimulatorType {
  responsive, // Vista fluida de escritorio / tamaño nativo
  iphone16Pro, // Marco iPhone 16 Pro (393 x 852)
  pixelAndroid, // Marco Google Pixel / Android (392 x 840)
}

class DeviceSimulatorFrame extends StatefulWidget {
  final Widget child;

  const DeviceSimulatorFrame({
    super.key,
    required this.child,
  });

  @override
  State<DeviceSimulatorFrame> createState() => _DeviceSimulatorFrameState();
}

class _DeviceSimulatorFrameState extends State<DeviceSimulatorFrame> {
  DeviceSimulatorType _selectedDevice = DeviceSimulatorType.iphone16Pro;

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;
    final isDesktop = screenSize.width >= 700;

    // Si la pantalla es pequeña (celular real o ventana reducida), mostrar nativo
    if (!isDesktop || _selectedDevice == DeviceSimulatorType.responsive) {
      return Stack(
        children: [
          widget.child,
          if (isDesktop)
            Positioned(
              top: 14,
              right: 14,
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  onTap: () {
                    setState(() {
                      _selectedDevice = DeviceSimulatorType.iphone16Pro;
                    });
                  },
                  borderRadius: BorderRadius.circular(20),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E2330).withOpacity(0.92),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFFF6B4A).withOpacity(0.5), width: 1.2),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.4),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.phone_iphone_rounded, color: Color(0xFFFF6B4A), size: 16),
                        SizedBox(width: 6),
                        Text(
                          'Abrir Simulador Móvil',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
        ],
      );
    }

    // Dimensiones y estilos según dispositivo
    final bool isIphone = _selectedDevice == DeviceSimulatorType.iphone16Pro;
    final double deviceWidth = isIphone ? 393.0 : 392.0;
    final double deviceHeight = isIphone ? 840.0 : 830.0;
    final double cornerRadius = isIphone ? 52.0 : 40.0;

    return Scaffold(
      backgroundColor: const Color(0xFF0B0E14),
      body: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Barra superior de control del simulador
            _buildTopControlBar(),

            // Área central con el marco del dispositivo
            Expanded(
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final totalNeededHeight = deviceHeight + 30;
                  final availableHeight = constraints.maxHeight - 16;
                  final scale = (availableHeight / totalNeededHeight).clamp(0.60, 1.0);

                  return Center(
                    child: Transform.scale(
                      scale: scale,
                      alignment: Alignment.center,
                      child: Container(
                        width: deviceWidth + 24,
                        height: deviceHeight + 24,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(cornerRadius + 12),
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: isIphone
                                ? [
                                    const Color(0xFF4A4E5A),
                                    const Color(0xFF1E212B),
                                    const Color(0xFF2B2F3D),
                                    const Color(0xFF151821),
                                  ]
                                : [
                                    const Color(0xFF3B404E),
                                    const Color(0xFF1A1C24),
                                    const Color(0xFF282B37),
                                    const Color(0xFF12141A),
                                  ],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFFFF6B4A).withOpacity(0.12),
                              blurRadius: 40,
                              spreadRadius: 2,
                              offset: const Offset(0, 10),
                            ),
                            BoxShadow(
                              color: Colors.black.withOpacity(0.7),
                              blurRadius: 30,
                              offset: const Offset(0, 15),
                            ),
                          ],
                        ),
                        padding: const EdgeInsets.all(12),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(cornerRadius),
                          child: Container(
                            color: Colors.black,
                            child: Stack(
                              children: [
                                // Aplicación contenida con MediaQuery forzado a móvil
                                Positioned.fill(
                                  child: MediaQuery(
                                    data: MediaQuery.of(context).copyWith(
                                      size: Size(deviceWidth, deviceHeight),
                                      padding: EdgeInsets.only(
                                        top: isIphone ? 44.0 : 28.0,
                                        bottom: isIphone ? 28.0 : 16.0,
                                      ),
                                      viewPadding: EdgeInsets.only(
                                        top: isIphone ? 44.0 : 28.0,
                                        bottom: isIphone ? 28.0 : 16.0,
                                      ),
                                    ),
                                    child: widget.child,
                                  ),
                                ),

                            // Dynamic Island (iPhone) o Punch Hole (Android)
                            if (isIphone)
                              Positioned(
                                top: 12,
                                left: 0,
                                right: 0,
                                child: Center(
                                  child: Container(
                                    width: 122,
                                    height: 32,
                                    decoration: BoxDecoration(
                                      color: Colors.black,
                                      borderRadius: BorderRadius.circular(20),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.white.withOpacity(0.06),
                                          blurRadius: 1,
                                          spreadRadius: 0.5,
                                        ),
                                      ],
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        const Padding(
                                          padding: EdgeInsets.only(left: 12),
                                          child: Icon(
                                            Icons.camera_alt_rounded,
                                            size: 11,
                                            color: Color(0xFF1E293B),
                                          ),
                                        ),
                                        Container(
                                          margin: const EdgeInsets.only(right: 12),
                                          width: 10,
                                          height: 10,
                                          decoration: const BoxDecoration(
                                            color: Color(0xFF101927),
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              )
                            else
                              Positioned(
                                top: 12,
                                left: 0,
                                right: 0,
                                child: Center(
                                  child: Container(
                                    width: 13,
                                    height: 13,
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF0A0C10),
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: const Color(0xFF252936),
                                        width: 1.5,
                                      ),
                                    ),
                                  ),
                                ),
                              ),

                            // Barra de gestos inferior (Home indicator)
                            Positioned(
                              bottom: 8,
                              left: 0,
                              right: 0,
                              child: Center(
                                child: Container(
                                  width: isIphone ? 134 : 100,
                                  height: 4.5,
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.4),
                                    borderRadius: BorderRadius.circular(3),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
          ],
        ),
      ),
    );
  }

  Widget _buildTopControlBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF121620),
        border: Border(
          bottom: BorderSide(
            color: Colors.white.withOpacity(0.08),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          // Logo e indicador
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFF6B4A).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Text('🐾', style: TextStyle(fontSize: 16)),
              ),
              const SizedBox(width: 10),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Simulador Buscapet',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      letterSpacing: -0.2,
                    ),
                  ),
                  Text(
                    'Entorno de prueba en vivo',
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 10.5,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ),

          const Spacer(),

          // Selector de Dispositivo
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFF1E2330),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Colors.white.withOpacity(0.06),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildDeviceButton(
                  type: DeviceSimulatorType.iphone16Pro,
                  icon: Icons.apple_rounded,
                  label: 'iPhone 16 Pro',
                ),
                const SizedBox(width: 4),
                _buildDeviceButton(
                  type: DeviceSimulatorType.pixelAndroid,
                  icon: Icons.android_rounded,
                  label: 'Pixel / Android',
                ),
                const SizedBox(width: 4),
                _buildDeviceButton(
                  type: DeviceSimulatorType.responsive,
                  icon: Icons.fullscreen_rounded,
                  label: 'Pantalla Completa',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceButton({
    required DeviceSimulatorType type,
    required IconData icon,
    required String label,
  }) {
    final isSelected = _selectedDevice == type;

    return InkWell(
      onTap: () {
        setState(() {
          _selectedDevice = type;
        });
      },
      borderRadius: BorderRadius.circular(8),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFFF6B4A) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFFFF6B4A).withOpacity(0.35),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 15,
              color: isSelected ? Colors.white : const Color(0xFF94A3B8),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : const Color(0xFFCBD5E1),
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
