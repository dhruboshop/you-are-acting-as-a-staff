import 'package:flutter/material.dart';

import '../../models/shop.dart';
import '../../services/api_client.dart';

class WhatsappScreen extends StatefulWidget {
  const WhatsappScreen({required this.shop, required this.api, super.key});
  final Shop shop;
  final ApiClient api;

  @override
  State<WhatsappScreen> createState() => _WhatsappScreenState();
}

class _WhatsappScreenState extends State<WhatsappScreen> {
  String _status = 'loading';

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('WhatsApp')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          ListTile(leading: const Icon(Icons.info_outline), title: const Text('Connection status'), subtitle: Text(_status)),
          FilledButton.icon(onPressed: _connect, icon: const Icon(Icons.link), label: const Text('Connect or reconnect')),
          const SizedBox(height: 8),
          OutlinedButton.icon(onPressed: _disconnect, icon: const Icon(Icons.link_off), label: const Text('Disconnect')),
        ],
      ),
    );
  }

  Future<void> _refresh() async {
    final data = await widget.api.get('/api/whatsapp/shops/${widget.shop.id}/status') as Map<String, dynamic>;
    if (mounted) setState(() => _status = data['status'].toString());
  }

  Future<void> _connect() async {
    await widget.api.post('/api/whatsapp/connect', {'shopId': widget.shop.id, 'instanceName': 'shop_${widget.shop.id.replaceAll('-', '').substring(0, 12)}'});
    await _refresh();
  }

  Future<void> _disconnect() async {
    await widget.api.post('/api/whatsapp/shops/${widget.shop.id}/disconnect', {});
    await _refresh();
  }
}
