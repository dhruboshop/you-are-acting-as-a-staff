import '../models/user_model.dart';

abstract class AuthRepository {
  Stream<AuthUser?> get authStateStream;
  AuthUser? get currentUser;
  Future<AuthUser?> signInWithGoogle();
  Future<void> signOut();
}
