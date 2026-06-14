import '../models/feedback_model.dart';
import '../repositories/feedback_repository.dart';
import 'seed_data.dart';

class FakeFeedbackRepository implements FeedbackRepository {
  @override
  Future<FeedbackData> getFeedbackData(String businessId) async => SeedData.feedbackData;

  @override
  Future<List<FeedbackModel>> getRecentFeedback(String businessId, {int limit = 20}) async => SeedData.feedbackData.recentFeedback.take(limit).toList();
}
