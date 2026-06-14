import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/models/customer_model.dart';
import '../../auth/providers/auth_provider.dart';
import '../../dashboard/providers/dashboard_provider.dart';

class CustomersState {
  const CustomersState({
    this.customers = const [],
    this.searchQuery = '',
    this.activeFilter = CustomerFilter.all,
    this.activeSort = CustomerSort.recent,
    this.isLoading = true,
    this.hasMore = false,
    this.page = 1,
  });

  final List<CustomerModel> customers;
  final String searchQuery;
  final CustomerFilter activeFilter;
  final CustomerSort activeSort;
  final bool isLoading;
  final bool hasMore;
  final int page;

  CustomersState copyWith({
    List<CustomerModel>? customers,
    String? searchQuery,
    CustomerFilter? activeFilter,
    CustomerSort? activeSort,
    bool? isLoading,
    bool? hasMore,
    int? page,
  }) {
    return CustomersState(
      customers: customers ?? this.customers,
      searchQuery: searchQuery ?? this.searchQuery,
      activeFilter: activeFilter ?? this.activeFilter,
      activeSort: activeSort ?? this.activeSort,
      isLoading: isLoading ?? this.isLoading,
      hasMore: hasMore ?? this.hasMore,
      page: page ?? this.page,
    );
  }
}

final customersProvider = StateNotifierProvider<CustomersNotifier, CustomersState>((ref) {
  return CustomersNotifier(ref)..refresh();
});

class CustomersNotifier extends StateNotifier<CustomersState> {
  CustomersNotifier(this._ref) : super(const CustomersState());
  final Ref _ref;

  Future<void> refresh() async {
    state = state.copyWith(isLoading: true, page: 1);
    final business = await _ref.read(businessProvider.future);
    if (business == null) {
      state = state.copyWith(isLoading: false, customers: []);
      return;
    }
    final customers = await _ref.read(customerRepositoryProvider).getCustomers(
          business.id,
          searchQuery: state.searchQuery,
          filter: state.activeFilter,
          sort: state.activeSort,
          page: 1,
        );
    state = state.copyWith(customers: customers, isLoading: false, hasMore: customers.length >= 20);
  }

  Future<void> search(String query) async {
    state = state.copyWith(searchQuery: query);
    await refresh();
  }

  Future<void> setFilter(CustomerFilter filter) async {
    state = state.copyWith(activeFilter: filter);
    await refresh();
  }
}

final customerDetailProvider = FutureProvider.family<CustomerModel, String>((ref, customerId) async {
  // FAKE: FakeCustomerRepository
  return ref.watch(customerRepositoryProvider).getCustomerById(customerId);
});
