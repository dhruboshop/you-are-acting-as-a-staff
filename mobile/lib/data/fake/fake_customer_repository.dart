import '../models/customer_model.dart';
import '../repositories/customer_repository.dart';
import 'seed_data.dart';

class FakeCustomerRepository implements CustomerRepository {
  @override
  Future<List<CustomerModel>> getCustomers(
    String businessId, {
    String? searchQuery,
    CustomerFilter? filter,
    CustomerSort? sort,
    int page = 1,
    int pageSize = 20,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 450));
    var data = SeedData.customers.where((customer) => customer.businessId == businessId).toList();
    if (searchQuery != null && searchQuery.isNotEmpty) {
      final query = searchQuery.toLowerCase();
      data = data.where((customer) => customer.name.toLowerCase().contains(query) || customer.phone.contains(query)).toList();
    }
    if (filter == CustomerFilter.soonBirthdays) {
      data = data.where((customer) => customer.daysUntilBirthday <= 7).toList();
    } else if (filter == CustomerFilter.lowRating) {
      data = data.where((customer) => customer.rating < 4).toList();
    } else if (filter == CustomerFilter.thisMonth) {
      final now = DateTime.now();
      data = data.where((customer) => customer.registeredAt.month == now.month && customer.registeredAt.year == now.year).toList();
    }
    if (sort == CustomerSort.name) data.sort((a, b) => a.name.compareTo(b.name));
    if (sort == CustomerSort.rating) data.sort((a, b) => b.rating.compareTo(a.rating));
    return data.skip((page - 1) * pageSize).take(pageSize).toList();
  }

  @override
  Future<CustomerModel> getCustomerById(String id) async => SeedData.customers.firstWhere((customer) => customer.id == id);

  @override
  Future<List<CustomerModel>> getUpcomingBirthdays(String businessId, {int days = 7}) async {
    final data = await getCustomers(businessId);
    return data.where((customer) => customer.daysUntilBirthday <= days).toList();
  }

  @override
  Future<List<CustomerModel>> getRecentCustomers(String businessId, {int limit = 5}) async {
    final data = await getCustomers(businessId);
    data.sort((a, b) => b.registeredAt.compareTo(a.registeredAt));
    return data.take(limit).toList();
  }

  @override
  Future<int> getTotalCount(String businessId) async => SeedData.customers.where((customer) => customer.businessId == businessId).length;
}
