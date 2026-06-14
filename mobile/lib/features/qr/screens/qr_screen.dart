import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_gallery_saver/image_gallery_saver.dart';
import 'package:path_provider/path_provider.dart';
import 'package:printing/printing.dart';
import 'package:share_plus/share_plus.dart';

import '../../../core/router/route_names.dart';
import '../../../core/theme/business_theme.dart';
import '../../../core/theme/color_tokens.dart';
import '../../../core/theme/spacing_tokens.dart';
import '../../../shared/widgets/lp_button.dart';
import '../../../shared/widgets/lp_error_state.dart';
import '../../../shared/widgets/lp_metric_tile.dart';
import '../../../shared/widgets/lp_qr_card.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/qr_provider.dart';

class QrScreen extends ConsumerStatefulWidget {
  const QrScreen({super.key});

  @override
  ConsumerState<QrScreen> createState() => _QrScreenState();
}

class _QrScreenState extends ConsumerState<QrScreen> {
  final _qrKey = GlobalKey();

  @override
  Widget build(BuildContext context) {
    final qr = ref.watch(qrDataProvider);
    final business = ref.watch(businessProvider).valueOrNull;
    final theme = LPBusinessTheme.fromType(business?.themeType ?? BusinessThemeType.luxury);
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Your QR Code'), actions: [TextButton(onPressed: () {}, child: const Text('Edit'))]),
      body: qr.when(
        data: (data) => SingleChildScrollView(
          padding: const EdgeInsets.all(LPSpacing.px24),
          child: Column(
            children: [
              GestureDetector(
                onTap: () => context.push(RouteNames.qrFullscreen),
                child: RepaintBoundary(
                  key: _qrKey,
                  child: LPQrCard(qrData: data.registrationUrl, businessName: business?.name ?? 'Radha Jewels', tagline: business?.qrTagline ?? '', size: LPQrCardSize.standard, theme: theme),
                ),
              ),
              const SizedBox(height: LPSpacing.px24),
              Row(children: [
                Expanded(child: LPMetricTile(label: 'Total Scans', value: '${data.totalScans}')),
                Expanded(child: LPMetricTile(label: 'This Week', value: '${data.scansThisWeek}')),
              ]),
              const SizedBox(height: LPSpacing.px32),
              LPButton(label: 'Download PNG', variant: LPButtonVariant.secondary, leadingIcon: Icons.download, onPressed: _downloadQr),
              const SizedBox(height: LPSpacing.px12),
              LPButton(label: 'Print Layout', variant: LPButtonVariant.secondary, leadingIcon: Icons.print, onPressed: _printQr),
              const SizedBox(height: LPSpacing.px12),
              LPButton(label: 'Share via WhatsApp', variant: LPButtonVariant.whatsapp, leadingIcon: Icons.share, onPressed: _shareQr),
              const SizedBox(height: 80),
            ],
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, __) => LPErrorState(type: LPErrorType.qrFailed, onRetry: () => ref.invalidate(qrDataProvider)),
      ),
    );
  }

  Future<Uint8List?> _capture() async {
    final boundary = _qrKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
    final image = await boundary?.toImage(pixelRatio: 3);
    final bytes = await image?.toByteData(format: ui.ImageByteFormat.png);
    return bytes?.buffer.asUint8List();
  }

  Future<void> _downloadQr() async {
    final bytes = await _capture();
    if (bytes == null) return;
    await ImageGallerySaver.saveImage(bytes);
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('QR saved to your gallery')));
  }

  Future<void> _shareQr() async {
    final bytes = await _capture();
    if (bytes == null) return;
    final file = File('${(await getTemporaryDirectory()).path}/loyaltypilot_qr.png');
    await file.writeAsBytes(bytes);
    await Share.shareXFiles([XFile(file.path)], text: 'Register with my business');
  }

  Future<void> _printQr() async {
    final bytes = await _capture();
    if (bytes == null) return;
    await Printing.layoutPdf(onLayout: (_) async => bytes);
  }
}
