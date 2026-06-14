import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/route_names.dart';
import '../../auth/providers/auth_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authUserProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(children: [
        const SwitchListTile(title: Text('Birthday reminders'), subtitle: Text('Get notified before customer birthdays'), value: true, onChanged: null),
        const SwitchListTile(title: Text('New customer alerts'), subtitle: Text('When a customer scans your QR'), value: true, onChanged: null),
        const ListTile(title: Text('Language'), trailing: Text('English')),
        ListTile(title: const Text('Email'), trailing: Text(user?.email ?? '')),
        ListTile(
          title: const Text('Sign Out', style: TextStyle(color: Colors.red)),
          onTap: () async {
            await ref.read(googleSignInProvider.notifier).signOut();
            if (context.mounted) context.go(RouteNames.welcome);
          },
        ),
      ]),
    );
  }
}
