class FeedbackModel {
  const FeedbackModel({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.rating,
    this.text,
    required this.submittedAt,
  });

  final String id;
  final String customerId;
  final String customerName;
  final double rating;
  final String? text;
  final DateTime submittedAt;
}

class FeedbackData {
  const FeedbackData({required this.averageRating, required this.distribution, required this.recentFeedback});

  final double averageRating;
  final Map<int, int> distribution;
  final List<FeedbackModel> recentFeedback;
}
