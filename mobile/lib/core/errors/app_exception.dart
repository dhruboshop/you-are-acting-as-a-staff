enum AppExceptionType { network, auth, server, validation }

class AppException implements Exception {
  const AppException(this.message, {this.code, this.type = AppExceptionType.server});

  final String message;
  final String? code;
  final AppExceptionType type;

  @override
  String toString() => message;
}
