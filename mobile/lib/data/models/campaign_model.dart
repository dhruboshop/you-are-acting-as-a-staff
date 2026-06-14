enum CampaignType { birthday, anniversary, festival, custom }
enum CampaignSendStatus { pending, sending, completed, failed }

class Festival {
  const Festival({required this.id, required this.name, required this.emoji, this.month});

  final String id;
  final String name;
  final String emoji;
  final int? month;
}

class CampaignDashboardData {
  const CampaignDashboardData({
    required this.birthdayAutoSend,
    required this.birthdayTotalSent,
    required this.anniversaryAutoSend,
    required this.anniversaryTotalSent,
    required this.recentSends,
  });

  final bool birthdayAutoSend;
  final int birthdayTotalSent;
  final bool anniversaryAutoSend;
  final int anniversaryTotalSent;
  final List<CampaignSendModel> recentSends;
}

class CampaignSendModel {
  const CampaignSendModel({
    required this.id,
    required this.businessId,
    required this.type,
    required this.message,
    required this.recipientIds,
    required this.recipientCount,
    required this.deliveredCount,
    required this.failedCount,
    required this.sentAt,
    this.festivalName,
    required this.status,
  });

  final String id;
  final String businessId;
  final CampaignType type;
  final String message;
  final List<String> recipientIds;
  final int recipientCount;
  final int deliveredCount;
  final int failedCount;
  final DateTime sentAt;
  final String? festivalName;
  final CampaignSendStatus status;
}
