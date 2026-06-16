import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/business_theme.dart';
import '../../../shared/widgets/lp_qr_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/qr_provider.dart';

class QrFullscreenScreen extends ConsumerWidget {
  const QrFullscreenScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final data = ref.watch(qrDataProvider).valueOrNull;
    final business = ref.watch(businessProvider).valueOrNull;
    final theme = LPBusinessTheme.fromType(business?.themeType ?? BusinessThemeType.luxury);
    return GestureDetector(
      onTap: () => Navigator.of(context).pop(),
      child: Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: LPQrCard(qrData: data?.registrationUrl ?? '', businessName: business?.name ?? 'Zappy Demo Shop', tagline: business?.qrTagline ?? '', size: LPQrCardSize.fullscreen, theme: theme),
          ),
        ),
      ),
    );
  }
}
