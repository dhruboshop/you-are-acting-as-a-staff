import 'dart:async';

import '../models/user_model.dart';
import '../repositories/auth_repository.dart';
import 'seed_data.dart';

class FakeAuthRepository implements AuthRepository {
  final _controller = StreamController<AuthUser?>.broadcast();
  AuthUser? _user = SeedData.authUser;

  @override
  Stream<AuthUser?> get authStateStream async* {
    yield _user;
    yield* _controller.stream;
  }

  @override
  AuthUser? get currentUser => _user;

  @override
  Future<AuthUser?> signInWithGoogle() async {
    await Future<void>.delayed(const Duration(milliseconds: 500));
    _user = SeedData.authUser;
    _controller.add(_user);
    return _user;
  }

  @override
  Future<void> signOut() async {
    _user = null;
    _controller.add(null);
  }
}
