import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/color_tokens.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../core/theme/text_tokens.dart';
import '../../../shared/widgets/lp_button.dart';
import '../../../shared/widgets/lp_card.dart';
import '../providers/whatsapp_provider.dart';

class ConnectWhatsappScreen extends ConsumerStatefulWidget {
  const ConnectWhatsappScreen({super.key});

  @override
  ConsumerState<ConnectWhatsappScreen> createState() => _ConnectWhatsappScreenState();
}

class _ConnectWhatsappScreenState extends ConsumerState<ConnectWhatsappScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(whatsappConnectionProvider.notifier).startPairing());
  }

  @override
  Widget build(BuildContext context) {
    final connection = ref.watch(whatsappConnectionProvider);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Connect WhatsApp')),
      body: connection.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text(error.toString())),
        data: (state) {
          if (state.connected) {
            return Padding(
              padding: const EdgeInsets.all(LPSpacing.px24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Icon(Icons.check_circle, color: AppColors.success, size: 96),
                  const SizedBox(height: LPSpacing.px24),
                  const Text('WhatsApp Connected', style: LPTextStyle.headlineLarge, textAlign: TextAlign.center),
                  const SizedBox(height: LPSpacing.px8),
                  Text(state.instance?.phone ?? '', textAlign: TextAlign.center),
                  const SizedBox(height: LPSpacing.px32),
                  LPButton(label: 'Continue to Dashboard', onPressed: () => context.go(RouteNames.dashboard)),
                ],
              ),
            );
          }

          return ListView(
            padding: const EdgeInsets.all(LPSpacing.px24),
            children: [
              const Text('Pair your WhatsApp', style: LPTextStyle.headlineLarge),
              const SizedBox(height: LPSpacing.px8),
              const Text('Open WhatsApp on your phone and enter this pairing code. You can use QR instead if your device supports scanning.'),
              const SizedBox(height: LPSpacing.px24),
              LPCard(
                child: state.useQr
                    ? Center(child: QrImageView(data: state.qrData ?? '', size: 220))
                    : Column(
                        children: [
                          const Text('Pairing Code', style: LPTextStyle.labelMedium),
                          const SizedBox(height: LPSpacing.px12),
                          SelectableText(state.pairingCode ?? 'Generating...', style: LPTextStyle.displayLarge),
                        ],
                      ),
              ),
              const SizedBox(height: LPSpacing.px24),
              LPButton(label: 'I Have Connected', onPressed: () => ref.read(whatsappConnectionProvider.notifier).checkStatus()),
              const SizedBox(height: LPSpacing.px12),
              LPButton(label: 'Use QR Instead', variant: LPButtonVariant.secondary, onPressed: () => ref.read(whatsappConnectionProvider.notifier).useQrInstead()),
            ],
          );
        },
      ),
    );
  }
}
