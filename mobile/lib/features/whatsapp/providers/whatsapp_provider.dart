import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/whatsapp_instance_model.dart';
import '../../../data/services/evolution_service.dart';
import '../../auth/providers/auth_provider.dart';

final evolutionServiceProvider = Provider<EvolutionService>((ref) => EvolutionService());

final whatsappConnectionProvider = StateNotifierProvider<WhatsappConnectionNotifier, AsyncValue<WhatsappConnectionState>>((ref) {
  return WhatsappConnectionNotifier(ref);
});

class WhatsappConnectionState {
  const WhatsappConnectionState({this.instance, this.pairingCode, this.qrData, this.useQr = false});

  final WhatsappInstanceModel? instance;
  final String? pairingCode;
  final String? qrData;
  final bool useQr;

  bool get connected => instance?.connected ?? false;

  WhatsappConnectionState copyWith({WhatsappInstanceModel? instance, String? pairingCode, String? qrData, bool? useQr}) {
    return WhatsappConnectionState(
      instance: instance ?? this.instance,
      pairingCode: pairingCode ?? this.pairingCode,
      qrData: qrData ?? this.qrData,
      useQr: useQr ?? this.useQr,
    );
  }
}

class WhatsappConnectionNotifier extends StateNotifier<AsyncValue<WhatsappConnectionState>> {
  WhatsappConnectionNotifier(this._ref) : super(const AsyncData(WhatsappConnectionState()));

  final Ref _ref;

  Future<void> startPairing() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final business = await _ref.read(businessProvider.future);
      final service = _ref.read(evolutionServiceProvider);
      final instance = await service.createInstance(business?.id ?? 'biz_001');
      final code = await service.getPairingCode(instance.instanceId);
      return WhatsappConnectionState(instance: instance, pairingCode: code);
    });
  }

  Future<void> useQrInstead() async {
    final current = state.valueOrNull;
    final instance = current?.instance;
    if (instance == null) return;
    final qr = await _ref.read(evolutionServiceProvider).getQr(instance.instanceId);
    state = AsyncData(current!.copyWith(qrData: qr, useQr: true));
  }

  Future<void> checkStatus() async {
    final current = state.valueOrNull;
    final instance = current?.instance;
    if (instance == null) return;
    final updated = await _ref.read(evolutionServiceProvider).checkStatus(instance.instanceId);
    state = AsyncData(current!.copyWith(instance: updated));
  }
}
