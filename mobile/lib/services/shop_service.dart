import '../models/customer.dart';
import '../models/shop.dart';
import 'api_client.dart';

class ShopService {
  ShopService(this._api);
  final ApiClient _api;

  Future<List<Shop>> listShops() async {
    final data = await _api.get('/api/shops') as Map<String, dynamic>;
    return (data['shops'] as List<dynamic>).map((item) => Shop.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<Shop> createShop(String name, String? phone, String? address) async {
    final data = await _api.post('/api/shops', {'name': name, 'phone': phone, 'address': address}) as Map<String, dynamic>;
    return Shop.fromJson(data['shop'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> qr(String shopId) async {
    return await _api.get('/api/shops/$shopId/qr') as Map<String, dynamic>;
  }

  Future<List<Customer>> customers(String shopId, {String search = '', int page = 1}) async {
    final data = await _api.get('/api/customers/shops/$shopId', query: {'search': search, 'page': '$page'}) as Map<String, dynamic>;
    return (data['customers'] as List<dynamic>).map((item) => Customer.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<void> addPoints(String customerId, int points, String reason) {
    return _api.post('/api/loyalty/add', {'customerId': customerId, 'points': points, 'reason': reason});
  }

  Future<void> deductPoints(String customerId, int points, String reason) {
    return _api.post('/api/loyalty/deduct', {'customerId': customerId, 'points': points, 'reason': reason});
  }
}
