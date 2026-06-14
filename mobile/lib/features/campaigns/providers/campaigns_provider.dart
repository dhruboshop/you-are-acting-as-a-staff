import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/fake/fake_campaign_repository.dart';
import '../../../data/fake/seed_data.dart';
import '../../../data/models/campaign_model.dart';
import '../../../data/models/customer_model.dart';
import '../../../data/repositories/campaign_repository.dart';
import '../../auth/providers/auth_provider.dart';

final campaignRepositoryProvider = Provider<CampaignRepository>((ref) {
  // FAKE: FakeCampaignRepository
  return FakeCampaignRepository();
});

final campaignDashboardProvider = FutureProvider.autoDispose<CampaignDashboardData>((ref) async {
  final business = await ref.watch(businessProvider.future);
  return ref.watch(campaignRepositoryProvider).getDashboardData(business?.id ?? SeedData.business.id);
});

class SmartCampaignState {
  const SmartCampaignState({this.customers = const [], required this.message, this.autoSendEnabled = false, this.isSending = false, this.sendResult});
  final List<CustomerModel> customers;
  final String message;
  final bool autoSendEnabled;
  final bool isSending;
  final CampaignSendModel? sendResult;

  SmartCampaignState copyWith({List<CustomerModel>? customers, String? message, bool? autoSendEnabled, bool? isSending, CampaignSendModel? sendResult}) {
    return SmartCampaignState(
      customers: customers ?? this.customers,
      message: message ?? this.message,
      autoSendEnabled: autoSendEnabled ?? this.autoSendEnabled,
      isSending: isSending ?? this.isSending,
      sendResult: sendResult ?? this.sendResult,
    );
  }
}

final birthdayCampaignProvider = StateNotifierProvider<BirthdayCampaignNotifier, SmartCampaignState>((ref) {
  return BirthdayCampaignNotifier(ref)..load();
});

class BirthdayCampaignNotifier extends StateNotifier<SmartCampaignState> {
  BirthdayCampaignNotifier(this._ref)
      : super(const SmartCampaignState(message: 'Happy Birthday, {name}! Visit us this week for a special birthday surprise.'));
  final Ref _ref;

  Future<void> load() async {
    final business = await _ref.read(businessProvider.future);
    state = state.copyWith(customers: await _ref.read(campaignRepositoryProvider).getUpcomingBirthdays(business?.id ?? SeedData.business.id));
  }

  void toggleAutoSend() => state = state.copyWith(autoSendEnabled: !state.autoSendEnabled);
  void updateMessage(String message) => state = state.copyWith(message: message);

  Future<void> send() async {
    state = state.copyWith(isSending: true);
    final business = await _ref.read(businessProvider.future);
    final result = await _ref.read(campaignRepositoryProvider).sendBirthdayCampaign(
          SendCampaignInput(businessId: business?.id ?? SeedData.business.id, message: state.message, recipientIds: state.customers.map((c) => c.id).toList()),
        );
    state = state.copyWith(isSending: false, sendResult: result);
  }
}

final festivalCampaignProvider = StateNotifierProvider<FestivalCampaignNotifier, FestivalCampaignState>((ref) {
  return FestivalCampaignNotifier();
});

class FestivalCampaignState {
  const FestivalCampaignState({this.festivals = SeedData.festivals, this.selectedFestival, this.message = '', this.recipientCount = 0, this.isSending = false});
  final List<Festival> festivals;
  final Festival? selectedFestival;
  final String message;
  final int recipientCount;
  final bool isSending;
  FestivalCampaignState copyWith({Festival? selectedFestival, String? message, int? recipientCount, bool? isSending}) {
    return FestivalCampaignState(festivals: festivals, selectedFestival: selectedFestival ?? this.selectedFestival, message: message ?? this.message, recipientCount: recipientCount ?? this.recipientCount, isSending: isSending ?? this.isSending);
  }
}

class FestivalCampaignNotifier extends StateNotifier<FestivalCampaignState> {
  FestivalCampaignNotifier() : super(const FestivalCampaignState(recipientCount: 10));
  void selectFestival(Festival festival) => state = state.copyWith(selectedFestival: festival, message: 'Wishing you a joyful ${festival.name} from Radha Jewels.');
  void updateMessage(String message) => state = state.copyWith(message: message);
}

final campaignHistoryProvider = FutureProvider.autoDispose<List<CampaignSendModel>>((ref) async {
  final business = await ref.watch(businessProvider.future);
  return ref.watch(campaignRepositoryProvider).getCampaignHistory(business?.id ?? SeedData.business.id);
});
