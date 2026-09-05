// =============================================================================
// SERVICIO: LocationAutocompleteService — Búsqueda de calles, autocompletado y GPS
// =============================================================================

import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';

class AddressSuggestion {
  final String displayName;
  final String street;
  final String houseNumber;
  final String city;
  final double lat;
  final double lng;

  const AddressSuggestion({
    required this.displayName,
    required this.street,
    required this.houseNumber,
    required this.city,
    required this.lat,
    required this.lng,
  });

  String get shortLabel {
    if (street.isNotEmpty && houseNumber.isNotEmpty) {
      return '$street $houseNumber${city.isNotEmpty ? ', $city' : ''}';
    }
    if (street.isNotEmpty) {
      return '$street${city.isNotEmpty ? ', $city' : ''}';
    }
    return displayName.split(',').take(2).join(',').trim();
  }
}

class LocationAutocompleteService {
  static final LocationAutocompleteService _instance =
      LocationAutocompleteService._internal();
  factory LocationAutocompleteService() => _instance;
  LocationAutocompleteService._internal();

  // Sugerencias populares de respaldo
  static const List<AddressSuggestion> _fallbackStreets = [
    AddressSuggestion(
      displayName: 'Av. San Martín 1540, Bariloche',
      street: 'Av. San Martín',
      houseNumber: '1540',
      city: 'Bariloche',
      lat: -41.1335,
      lng: -71.3103,
    ),
    AddressSuggestion(
      displayName: 'Av. Rivadavia 2450, Buenos Aires',
      street: 'Av. Rivadavia',
      houseNumber: '2450',
      city: 'CABA',
      lat: -34.6095,
      lng: -58.4012,
    ),
    AddressSuggestion(
      displayName: 'Av. Santa Fe 1820, Buenos Aires',
      street: 'Av. Santa Fe',
      houseNumber: '1820',
      city: 'CABA',
      lat: -34.5952,
      lng: -58.3934,
    ),
    AddressSuggestion(
      displayName: 'Av. Bustillo Km 5, Bariloche',
      street: 'Av. Exequiel Bustillo',
      houseNumber: 'Km 5',
      city: 'Bariloche',
      lat: -41.1278,
      lng: -71.3621,
    ),
    AddressSuggestion(
      displayName: 'Av. Corrientes 3200, Buenos Aires',
      street: 'Av. Corrientes',
      houseNumber: '3200',
      city: 'CABA',
      lat: -34.6037,
      lng: -58.4116,
    ),
    AddressSuggestion(
      displayName: 'Av. Belgrano 850, Buenos Aires',
      street: 'Av. Belgrano',
      houseNumber: '850',
      city: 'CABA',
      lat: -34.6133,
      lng: -58.3792,
    ),
    AddressSuggestion(
      displayName: 'Mitre 124, Bariloche',
      street: 'Calle Mitre',
      houseNumber: '124',
      city: 'Bariloche',
      lat: -41.1338,
      lng: -71.3092,
    ),
    AddressSuggestion(
      displayName: 'Calle 25 de Mayo 350, Córdoba',
      street: 'Calle 25 de Mayo',
      houseNumber: '350',
      city: 'Córdoba',
      lat: -31.4168,
      lng: -64.1834,
    ),
  ];

  // ============ BÚSQUEDA Y AUTOCOMPLETADO DE DIRECCIONES ============
  Future<List<AddressSuggestion>> searchAddress(String query,
      {String countryCode = 'ar'}) async {
    final cleanQuery = query.trim();
    if (cleanQuery.length < 2) {
      return _fallbackStreets.take(4).toList();
    }

    try {
      final url = Uri.parse(
          'https://nominatim.openstreetmap.org/search?format=json&q=${Uri.encodeComponent(cleanQuery)}&countrycodes=$countryCode&addressdetails=1&limit=6');

      final response = await http.get(
        url,
        headers: {
          'User-Agent': 'BuscapetApp/1.0 (contacto@buscapet.app)',
        },
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        if (data.isNotEmpty) {
          return data.map((item) {
            final address = item['address'] as Map<String, dynamic>? ?? {};
            final road = address['road'] ??
                address['pedestrian'] ??
                address['street'] ??
                address['suburb'] ??
                '';
            final houseNumber = address['house_number'] ?? '';
            final city = address['city'] ??
                address['town'] ??
                address['village'] ??
                address['state'] ??
                '';

            final lat = double.tryParse(item['lat']?.toString() ?? '') ?? 0.0;
            final lng = double.tryParse(item['lon']?.toString() ?? '') ?? 0.0;

            return AddressSuggestion(
              displayName: item['display_name'] ?? cleanQuery,
              street: road.isNotEmpty ? road : cleanQuery,
              houseNumber: houseNumber,
              city: city,
              lat: lat,
              lng: lng,
            );
          }).toList();
        }
      }
    } catch (e) {
      debugPrint('Error en Nominatim search: $e');
    }

    // Filtrar sugerencias locales si falla o no hay conexión
    return _fallbackStreets
        .where((s) => s.displayName.toLowerCase().contains(cleanQuery.toLowerCase()))
        .toList();
  }

  // ============ OBTENER UBICACIÓN GPS REAL DEL DISPOSITIVO ============
  Future<Position?> getCurrentLiveGps() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        return null;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        return null;
      }

      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 6),
        ),
      );
    } catch (e) {
      debugPrint('Error al capturar GPS: $e');
      return null;
    }
  }

  // ============ GEOCODIFICACIÓN INVERSA (GPS -> Calle y Número) ============
  Future<AddressSuggestion?> reverseGeocode(double lat, double lng) async {
    try {
      final url = Uri.parse(
          'https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lng&zoom=18&addressdetails=1');

      final response = await http.get(
        url,
        headers: {
          'User-Agent': 'BuscapetApp/1.0 (contacto@buscapet.app)',
        },
      ).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final address = data['address'] as Map<String, dynamic>? ?? {};
        final road = address['road'] ??
            address['pedestrian'] ??
            address['street'] ??
            address['neighbourhood'] ??
            '';
        final houseNumber = address['house_number'] ?? '';
        final city = address['city'] ??
            address['town'] ??
            address['village'] ??
            address['state'] ??
            '';

        return AddressSuggestion(
          displayName: data['display_name'] ?? 'Ubicación actual',
          street: road.isNotEmpty ? road : 'Calle detectada',
          houseNumber: houseNumber,
          city: city,
          lat: lat,
          lng: lng,
        );
      }
    } catch (e) {
      debugPrint('Error en reverse geocoding: $e');
    }

    return AddressSuggestion(
      displayName: 'Coordenadas: ${lat.toStringAsFixed(4)}, ${lng.toStringAsFixed(4)}',
      street: 'Ubicación GPS',
      houseNumber: '',
      city: '',
      lat: lat,
      lng: lng,
    );
  }
}
