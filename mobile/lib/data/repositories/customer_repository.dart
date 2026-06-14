import '../models/customer_model.dart';

abstract class CustomerRepository {
  Future<List<CustomerModel>> getCustomers(
    String businessId, {
    String? searchQuery,
    CustomerFilter? filter,
    CustomerSort? sort,
    int page = 1,
    int pageSize = 20,
  });
  Future<CustomerModel> getCustomerById(String id);
  Future<List<CustomerModel>> getUpcomingBirthdays(String businessId, {int days = 7});
  Future<List<CustomerModel>> getRecentCustomers(String businessId, {int limit = 5});
  Future<int> getTotalCount(String businessId);
}
