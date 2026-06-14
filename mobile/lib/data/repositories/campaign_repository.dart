import '../models/campaign_model.dart';
import '../models/customer_model.dart';

class SendCampaignInput {
  const SendCampaignInput({required this.businessId, required this.message, required this.recipientIds});
  final String businessId;
  final String message;
  final List<String> recipientIds;
}

class SendFestivalInput extends SendCampaignInput {
  const SendFestivalInput({required super.businessId, required super.message, required super.recipientIds, required this.festivalName});
  final String festivalName;
}

abstract class CampaignRepository {
  Future<CampaignDashboardData> getDashboardData(String businessId);
  Future<List<CustomerModel>> getUpcomingBirthdays(String businessId);
  Future<List<CustomerModel>> getUpcomingAnniversaries(String businessId);
  Future<CampaignSendModel> sendBirthdayCampaign(SendCampaignInput input);
  Future<CampaignSendModel> sendAnniversaryCampaign(SendCampaignInput input);
  Future<CampaignSendModel> sendFestivalCampaign(SendFestivalInput input);
  Future<List<CampaignSendModel>> getCampaignHistory(String businessId, {int page = 1, int pageSize = 20});
  Future<void> updateAutoSend(String businessId, CampaignType type, bool enabled);
}
