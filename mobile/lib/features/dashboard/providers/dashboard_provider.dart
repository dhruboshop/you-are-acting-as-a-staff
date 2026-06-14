import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/fake/fake_customer_repository.dart';
import '../../../data/fake/seed_data.dart';
import '../../../data/models/customer_model.dart';
import '../../../data/repositories/customer_repository.dart';
import '../../auth/providers/auth_provider.dart';

final dashboardProvider = FutureProvider.autoDispose<DashboardData>((ref) async {
  // FAKE: SeedData.dashboard
  await Future<void>.delayed(const Duration(milliseconds: 400));
  return SeedData.dashboard;
});

final customerRepositoryProvider = Provider<CustomerRepository>((ref) {
  // FAKE: FakeCustomerRepository
  return FakeCustomerRepository();
});

final upcomingBirthdaysProvider = FutureProvider.autoDispose<List<CustomerModel>>((ref) async {
  final business = await ref.watch(businessProvider.future);
  if (business == null) return [];
  return ref.watch(customerRepositoryProvider).getUpcomingBirthdays(business.id);
});

final recentCustomersProvider = FutureProvider.autoDispose<List<CustomerModel>>((ref) async {
  final business = await ref.watch(businessProvider.future);
  if (business == null) return [];
  return ref.watch(customerRepositoryProvider).getRecentCustomers(business.id);
});
