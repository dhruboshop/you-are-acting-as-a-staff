import 'package:flutter/material.dart';

import '../../models/customer.dart';
import '../../models/shop.dart';
import '../../services/shop_service.dart';

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({required this.shop, required this.shops, super.key});
  final Shop shop;
  final ShopService shops;

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  final _search = TextEditingController();
  late Future<List<Customer>> _future = widget.shops.customers(widget.shop.id);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Customers')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: SearchBar(
              controller: _search,
              hintText: 'Search customers',
              leading: const Icon(Icons.search),
              onSubmitted: (_) => setState(() => _future = widget.shops.customers(widget.shop.id, search: _search.text)),
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Customer>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) return const Center(child: CircularProgressIndicator());
                if (snapshot.hasError) return Center(child: Text(snapshot.error.toString()));
                final customers = snapshot.data ?? [];
                return ListView.separated(
                  itemCount: customers.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (_, index) {
                    final customer = customers[index];
                    return ListTile(
                      title: Text(customer.name),
                      subtitle: Text('${customer.whatsappNumber} • ${customer.loyaltyPoints} points'),
                      trailing: Wrap(spacing: 4, children: [
                        IconButton(onPressed: () => _points(customer, true), icon: const Icon(Icons.add), tooltip: 'Add points'),
                        IconButton(onPressed: () => _points(customer, false), icon: const Icon(Icons.remove), tooltip: 'Deduct points'),
                      ]),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _points(Customer customer, bool add) async {
    final points = add ? 10 : 5;
    if (add) {
      await widget.shops.addPoints(customer.id, points, 'Manual adjustment');
    } else {
      await widget.shops.deductPoints(customer.id, points, 'Manual adjustment');
    }
    setState(() => _future = widget.shops.customers(widget.shop.id, search: _search.text));
  }
}
