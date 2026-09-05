// =============================================================================
// SERVICIO: MercadoPagoService — Checkout Pro Oficial de Mercado Pago
// =============================================================================

import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

class MercadoPagoService {
  static final MercadoPagoService _instance = MercadoPagoService._internal();
  factory MercadoPagoService() => _instance;
  MercadoPagoService._internal();

  // Credenciales oficiales de Producción
  static const String publicKey = 'APP_USR-0a741409-599f-434a-84ba-996c4eb0b958';
  static const String accessToken =
      'APP_USR-7254310245914481-090511-ea2d70cd02d87cc2e2a70c6833406a33-741894322';

  /// Crea una preferencia de cobro en Mercado Pago y abre la pasarela oficial Checkout Pro
  Future<String?> createAndOpenCheckout({
    required String title,
    required double price,
    String? description,
    String? payerEmail,
    String? payerName,
    String? externalReference,
  }) async {
    try {
      final url = Uri.parse('https://api.mercadopago.com/checkout/preferences');
      final headers = {
        'Authorization': 'Bearer $accessToken',
        'Content-Type': 'application/json',
      };

      final body = jsonEncode({
        'items': [
          {
            'title': title,
            'quantity': 1,
            'currency_id': 'ARS',
            'unit_price': price,
            'description': description ?? title,
          }
        ],
        if (payerEmail != null || payerName != null)
          'payer': {
            if (payerName != null && payerName.isNotEmpty) 'name': payerName,
            if (payerEmail != null && payerEmail.isNotEmpty) 'email': payerEmail,
          },
        'back_urls': {
          'success': 'https://buscapet.click/?status=success',
          'failure': 'https://buscapet.click/?status=failure',
          'pending': 'https://buscapet.click/?status=pending',
        },
        'auto_return': 'approved',
        'statement_descriptor': 'BUSCAPET',
        if (externalReference != null) 'external_reference': externalReference,
      });

      final response = await http.post(url, headers: headers, body: body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final initPoint = data['init_point'] as String?;
        if (initPoint != null) {
          final uri = Uri.parse(initPoint);
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          } else {
            await launchUrl(uri);
          }
          return initPoint;
        }
      } else {
        debugPrint('Error Mercado Pago: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      debugPrint('Excepción creando preferencia Mercado Pago: $e');
    }
    return null;
  }
}
