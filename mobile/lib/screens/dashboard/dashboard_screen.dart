import 'package:flutter/material.dart';

import '../../models/shop.dart';
import '../../services/api_client.dart';
import '../../services/shop_service.dart';
import '../campaigns/campaigns_screen.dart';
import '../customers/customers_screen.dart';
import '../whatsapp/whatsapp_screen.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({required this.shop, required this.shops, required this.api, super.key});
  final Shop shop;
  final ShopService shops;
  final ApiClient api;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(shop.name)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              _Stat(label: 'Customers', value: shop.totalCustomers),
              const SizedBox(width: 8),
              _Stat(label: 'Campaigns', value: shop.totalCampaigns),
              const SizedBox(width: 8),
              _Stat(label: 'Members', value: shop.totalLoyaltyMembers),
            ],
          ),
          const SizedBox(height: 16),
          ListTile(leading: const Icon(Icons.qr_code_2), title: const Text('QR registration'), subtitle: const Text('Download or share customer QR'), onTap: () => _showQr(context)),
          ListTile(leading: const Icon(Icons.people), title: const Text('Customers'), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CustomersScreen(shop: shop, shops: shops)))),
          ListTile(leading: const Icon(Icons.whatsapp), title: const Text('WhatsApp'), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => WhatsappScreen(shop: shop, api: api)))),
          ListTile(leading: const Icon(Icons.campaign), title: const Text('Campaigns'), onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CampaignsScreen(shop: shop, api: api)))),
        ],
      ),
    );
  }

  Future<void> _showQr(BuildContext context) async {
    final qr = await shops.qr(shop.id);
    if (!context.mounted) return;
    showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Registration QR'),
        content: SelectableText(qr['registrationUrl'].toString()),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Close')),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value});
  final String label;
  final int value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('$value', style: Theme.of(context).textTheme.headlineSmall),
            Text(label),
          ]),
        ),
      ),
    );
  }
}
