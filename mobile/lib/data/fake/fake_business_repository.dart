import '../models/business_model.dart';
import '../repositories/business_repository.dart';
import 'seed_data.dart';

class FakeBusinessRepository implements BusinessRepository {
  BusinessModel? _business = SeedData.business;

  @override
  Future<BusinessModel?> getBusiness(String userId) async {
    await Future<void>.delayed(const Duration(milliseconds: 450));
    return _business;
  }

  @override
  Future<BusinessModel> createBusiness(CreateBusinessInput input) async {
    await Future<void>.delayed(const Duration(milliseconds: 650));
    _business = BusinessModel(
      id: 'biz_001',
      ownerId: input.ownerId,
      name: input.name,
      category: input.category,
      phone: input.phone,
      city: input.city,
      qrTagline: 'Scan to get exclusive birthday & festival offers',
      themeType: input.themeType,
      registrationUrl: 'https://app.zappy.local/r/biz_001',
      createdAt: DateTime.now(),
    );
    return _business!;
  }

  @override
  Future<BusinessModel> updateBusiness(BusinessModel business) async {
    _business = business;
    return business;
  }
}
