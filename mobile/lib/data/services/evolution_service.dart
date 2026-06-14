import 'dart:math';

import '../models/whatsapp_instance_model.dart';

class EvolutionService {
  WhatsappInstanceModel? _instance;

  Future<WhatsappInstanceModel> createInstance(String businessId) async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    _instance = WhatsappInstanceModel(
      instanceId: 'wp_${businessId}_${Random().nextInt(9999)}',
      connected: false,
      connectionStatus: 'pairing_required',
      lastConnectionCheck: DateTime.now(),
    );
    return _instance!;
  }

  Future<void> deleteInstance(String instanceId) async {
    _instance = null;
  }

  Future<String> getQr(String instanceId) async {
    await Future<void>.delayed(const Duration(milliseconds: 300));
    return 'evolution://qr/$instanceId';
  }

  Future<String> getPairingCode(String instanceId) async {
    await Future<void>.delayed(const Duration(milliseconds: 300));
    return '482-913';
  }

  Future<WhatsappInstanceModel> checkStatus(String instanceId) async {
    await Future<void>.delayed(const Duration(milliseconds: 450));
    _instance = (_instance ?? WhatsappInstanceModel(instanceId: instanceId, connected: false, connectionStatus: 'pairing_required', lastConnectionCheck: DateTime.now()))
        .copyWith(connected: true, phone: '+919876543210', connectionStatus: 'connected', lastConnectionCheck: DateTime.now());
    return _instance!;
  }

  Future<void> sendMessage(String phone, String message) async {}
  Future<void> sendMedia(String phone, String mediaUrl, String caption) async {}
  Future<void> disconnect(String instanceId) async {
    _instance = _instance?.copyWith(connected: false, connectionStatus: 'disconnected', lastConnectionCheck: DateTime.now());
  }
}
