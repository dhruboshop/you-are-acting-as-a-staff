import '../models/feedback_model.dart';

abstract class FeedbackRepository {
  Future<FeedbackData> getFeedbackData(String businessId);
  Future<List<FeedbackModel>> getRecentFeedback(String businessId, {int limit = 20});
}
