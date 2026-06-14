import 'package:flutter/material.dart';

import '../../models/shop.dart';
import '../../services/api_client.dart';
import '../../services/auth_service.dart';
import '../../services/shop_service.dart';
import '../../widgets/empty_state.dart';
import '../dashboard/dashboard_screen.dart';

class ShopsScreen extends StatefulWidget {
  const ShopsScreen({required this.auth, required this.shops, required this.api, super.key});
  final AuthService auth;
  final ShopService shops;
  final ApiClient api;

  @override
  State<ShopsScreen> createState() => _ShopsScreenState();
}

class _ShopsScreenState extends State<ShopsScreen> {
  late Future<List<Shop>> _future = widget.shops.listShops();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shops'),
        actions: [
          IconButton(onPressed: widget.auth.signOut, icon: const Icon(Icons.logout), tooltip: 'Logout'),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(onPressed: _createShop, icon: const Icon(Icons.add_business), label: const Text('Create')),
      body: FutureBuilder<List<Shop>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) return const Center(child: CircularProgressIndicator());
          if (snapshot.hasError) return EmptyState(title: 'Could not load shops', message: snapshot.error.toString());
          final shops = snapshot.data ?? [];
          if (shops.isEmpty) return const EmptyState(title: 'Create your first shop', message: 'A shop is required before generating QR codes or campaigns.');
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: shops.length,
            separatorBuilder: (_, __) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final shop = shops[index];
              return Card(
                child: ListTile(
                  leading: const CircleAvatar(child: Icon(Icons.storefront)),
                  title: Text(shop.name),
                  subtitle: Text('${shop.totalCustomers} customers • ${shop.totalCampaigns} campaigns'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => DashboardScreen(shop: shop, shops: widget.shops, api: widget.api))),
                ),
              );
            },
          );
        },
      ),
    );
  }

  Future<void> _createShop() async {
    final controller = TextEditingController();
    final name = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create shop'),
        content: TextField(controller: controller, decoration: const InputDecoration(labelText: 'Shop name'), autofocus: true),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Create')),
        ],
      ),
    );
    if (name == null || name.length < 2) return;
    await widget.shops.createShop(name, null, null);
    setState(() => _future = widget.shops.listShops());
  }
}
