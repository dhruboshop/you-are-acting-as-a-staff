import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/fake/fake_feedback_repository.dart';
import '../../../data/models/feedback_model.dart';
import '../../../data/repositories/feedback_repository.dart';
import '../../auth/providers/auth_provider.dart';

final feedbackRepositoryProvider = Provider<FeedbackRepository>((ref) {
  // FAKE: FakeFeedbackRepository
  return FakeFeedbackRepository();
});

final feedbackProvider = FutureProvider.autoDispose<FeedbackData>((ref) async {
  final business = await ref.watch(businessProvider.future);
  return ref.watch(feedbackRepositoryProvider).getFeedbackData(business?.id ?? 'biz_001');
});
