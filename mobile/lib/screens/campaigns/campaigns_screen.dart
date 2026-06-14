import 'package:flutter/material.dart';

import '../../models/shop.dart';
import '../../services/api_client.dart';

class CampaignsScreen extends StatefulWidget {
  const CampaignsScreen({required this.shop, required this.api, super.key});
  final Shop shop;
  final ApiClient api;

  @override
  State<CampaignsScreen> createState() => _CampaignsScreenState();
}

class _CampaignsScreenState extends State<CampaignsScreen> {
  String _template = 'diwali';
  final _message = TextEditingController(text: 'Happy Diwali from {{shopName}}! Thank you, {{customerName}}, for shopping with us.');
  bool _sending = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Campaigns')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          DropdownButtonFormField<String>(
            value: _template,
            decoration: const InputDecoration(labelText: 'Festival template'),
            items: const [
              DropdownMenuItem(value: 'durga_puja', child: Text('Durga Puja')),
              DropdownMenuItem(value: 'diwali', child: Text('Diwali')),
              DropdownMenuItem(value: 'eid', child: Text('Eid')),
              DropdownMenuItem(value: 'christmas', child: Text('Christmas')),
              DropdownMenuItem(value: 'new_year', child: Text('New Year')),
            ],
            onChanged: (value) => setState(() => _template = value ?? _template),
          ),
          const SizedBox(height: 12),
          TextField(controller: _message, maxLines: 5, decoration: const InputDecoration(labelText: 'Message')),
          const SizedBox(height: 16),
          FilledButton.icon(onPressed: _sending ? null : _send, icon: const Icon(Icons.send), label: Text(_sending ? 'Sending' : 'Send')),
        ],
      ),
    );
  }

  Future<void> _send() async {
    setState(() => _sending = true);
    try {
      final created = await widget.api.post('/api/campaigns', {
        'shopId': widget.shop.id,
        'templateKey': _template,
        'title': 'Festival greeting',
        'message': _message.text,
        'target': 'all',
      }) as Map<String, dynamic>;
      await widget.api.post('/api/campaigns/${created['campaign']['id']}/send', {});
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Campaign sent')));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }
}
