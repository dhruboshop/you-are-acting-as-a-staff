import '../models/campaign_model.dart';
import '../models/customer_model.dart';
import '../repositories/campaign_repository.dart';
import 'seed_data.dart';

class FakeCampaignRepository implements CampaignRepository {
  final List<CampaignSendModel> _history = [...SeedData.campaignHistory];
  bool _birthdayAuto = true;
  bool _anniversaryAuto = false;

  @override
  Future<CampaignDashboardData> getDashboardData(String businessId) async {
    await Future<void>.delayed(const Duration(milliseconds: 450));
    return CampaignDashboardData(
      birthdayAutoSend: _birthdayAuto,
      birthdayTotalSent: _history.where((send) => send.type == CampaignType.birthday).length,
      anniversaryAutoSend: _anniversaryAuto,
      anniversaryTotalSent: _history.where((send) => send.type == CampaignType.anniversary).length,
      recentSends: _history.take(5).toList(),
    );
  }

  @override
  Future<List<CustomerModel>> getUpcomingBirthdays(String businessId) async => SeedData.customers.where((customer) => customer.daysUntilBirthday <= 7).toList();

  @override
  Future<List<CustomerModel>> getUpcomingAnniversaries(String businessId) async => SeedData.customers.where((customer) => (customer.daysUntilAnniversary ?? 99) <= 30).toList();

  @override
  Future<CampaignSendModel> sendBirthdayCampaign(SendCampaignInput input) => _send(input, CampaignType.birthday);

  @override
  Future<CampaignSendModel> sendAnniversaryCampaign(SendCampaignInput input) => _send(input, CampaignType.anniversary);

  @override
  Future<CampaignSendModel> sendFestivalCampaign(SendFestivalInput input) async {
    final send = await _send(input, CampaignType.festival, festivalName: input.festivalName);
    return send;
  }

  Future<CampaignSendModel> _send(SendCampaignInput input, CampaignType type, {String? festivalName}) async {
    await Future<void>.delayed(const Duration(seconds: 1));
    final send = CampaignSendModel(
      id: 'send_${DateTime.now().millisecondsSinceEpoch}',
      businessId: input.businessId,
      type: type,
      message: input.message,
      recipientIds: input.recipientIds,
      recipientCount: input.recipientIds.length,
      deliveredCount: input.recipientIds.length,
      failedCount: 0,
      sentAt: DateTime.now(),
      festivalName: festivalName,
      status: CampaignSendStatus.completed,
    );
    _history.insert(0, send);
    return send;
  }

  @override
  Future<List<CampaignSendModel>> getCampaignHistory(String businessId, {int page = 1, int pageSize = 20}) async => _history.skip((page - 1) * pageSize).take(pageSize).toList();

  @override
  Future<void> updateAutoSend(String businessId, CampaignType type, bool enabled) async {
    if (type == CampaignType.birthday) _birthdayAuto = enabled;
    if (type == CampaignType.anniversary) _anniversaryAuto = enabled;
  }
}
