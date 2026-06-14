import '../models/business_model.dart';

abstract class BusinessRepository {
  Future<BusinessModel?> getBusiness(String userId);
  Future<BusinessModel> createBusiness(CreateBusinessInput input);
  Future<BusinessModel> updateBusiness(BusinessModel business);
}
