import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/business_theme.dart';
import '../../../data/fake/fake_auth_repository.dart';
import '../../../data/fake/fake_business_repository.dart';
import '../../../data/models/business_model.dart';
import '../../../data/models/user_model.dart';
import '../../../data/repositories/auth_repository.dart';
import '../../../data/repositories/business_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  // FAKE: FakeAuthRepository
  return FakeAuthRepository();
});

final businessRepositoryProvider = Provider<BusinessRepository>((ref) {
  // FAKE: FakeBusinessRepository
  return FakeBusinessRepository();
});

final authStateProvider = StreamProvider<AuthUser?>((ref) {
  return ref.watch(authRepositoryProvider).authStateStream;
});

final authUserProvider = Provider<AuthUser?>((ref) {
  return ref.watch(authStateProvider).valueOrNull;
});

final businessProvider = FutureProvider<BusinessModel?>((ref) async {
  // FAKE: FakeBusinessRepository
  final user = ref.watch(authUserProvider);
  if (user == null) return null;
  return ref.watch(businessRepositoryProvider).getBusiness(user.id);
});

final googleSignInProvider = StateNotifierProvider<GoogleSignInNotifier, AsyncValue<void>>((ref) {
  return GoogleSignInNotifier(ref.watch(authRepositoryProvider), ref);
});

class GoogleSignInNotifier extends StateNotifier<AsyncValue<void>> {
  GoogleSignInNotifier(this._repo, this._ref) : super(const AsyncData(null));

  final AuthRepository _repo;
  final Ref _ref;

  Future<void> signIn() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      await _repo.signInWithGoogle();
      _ref.invalidate(authStateProvider);
      _ref.invalidate(businessProvider);
    });
  }

  Future<void> signOut() async {
    await _repo.signOut();
    _ref.invalidate(authStateProvider);
    _ref.invalidate(businessProvider);
  }
}

final businessThemeProvider = StateNotifierProvider<BusinessThemeNotifier, LPBusinessTheme>((ref) {
  return BusinessThemeNotifier();
});

class BusinessThemeNotifier extends StateNotifier<LPBusinessTheme> {
  BusinessThemeNotifier() : super(LPBusinessTheme.luxury);

  void setTheme(BusinessThemeType type) {
    state = LPBusinessTheme.fromType(type);
  }
}
