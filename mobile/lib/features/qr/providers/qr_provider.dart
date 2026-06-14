import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/fake/seed_data.dart';
import '../../../data/models/customer_model.dart';

final qrDataProvider = FutureProvider.autoDispose<QrData>((ref) async {
  // FAKE: SeedData.qrData
  await Future<void>.delayed(const Duration(milliseconds: 400));
  return SeedData.qrData;
});
