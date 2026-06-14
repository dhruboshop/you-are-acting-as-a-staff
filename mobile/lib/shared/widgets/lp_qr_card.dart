import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../core/theme/business_theme.dart';
import '../../core/theme/radius_tokens.dart';
import '../../core/theme/spacing_tokens.dart';
import 'lp_card.dart';

enum LPQrCardSize { standard, fullscreen }

class LPQrCard extends StatelessWidget {
  const LPQrCard({required this.qrData, required this.businessName, this.logoUrl, required this.tagline, required this.size, required this.theme, super.key});
  final String qrData;
  final String businessName;
  final String? logoUrl;
  final String tagline;
  final LPQrCardSize size;
  final LPBusinessTheme theme;

  @override
  Widget build(BuildContext context) {
    final qrSize = size == LPQrCardSize.fullscreen ? 280.0 : 220.0;
    return LPCard(
      borderRadius: BorderRadius.circular(LPRadius.xl),
      padding: const EdgeInsets.all(LPSpacing.px24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(backgroundColor: theme.colors.primary, child: const Icon(Icons.store, color: Colors.white)),
          const SizedBox(height: LPSpacing.px8),
          Text(businessName, style: Theme.of(context).textTheme.headlineMedium, textAlign: TextAlign.center),
          const SizedBox(height: LPSpacing.px20),
          QrImageView(data: qrData, size: qrSize, eyeStyle: QrEyeStyle(color: theme.colors.primary), dataModuleStyle: QrDataModuleStyle(color: theme.colors.primaryDark)),
          const SizedBox(height: LPSpacing.px12),
          Text(tagline, textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
