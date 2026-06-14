extension StringExtensions on String {
  String get initials {
    final words = trim().split(RegExp(r'\s+')).where((word) => word.isNotEmpty).toList();
    if (words.isEmpty) return '?';
    if (words.length == 1) return words.first.substring(0, words.first.length >= 2 ? 2 : 1).toUpperCase();
    return '${words.first[0]}${words.last[0]}'.toUpperCase();
  }

  String get capitalizeFirst => isEmpty ? this : '${this[0].toUpperCase()}${substring(1)}';
  bool get isValidPhone => RegExp(r'^\+?[0-9]{10,15}$').hasMatch(replaceAll(RegExp(r'\s+'), ''));
}
