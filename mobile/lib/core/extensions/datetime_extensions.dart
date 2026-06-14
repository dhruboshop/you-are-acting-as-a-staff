import 'package:intl/intl.dart';

extension DateTimeExtensions on DateTime {
  String get formattedBirthday => DateFormat('d MMM').format(this);
  String get formattedDate => DateFormat('d MMM yyyy').format(this);
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  bool isSameDay(DateTime other) => year == other.year && month == other.month && day == other.day;

  int get daysUntilBirthday {
    final now = DateTime.now();
    var next = DateTime(now.year, month, day);
    if (next.isBefore(DateTime(now.year, now.month, now.day))) {
      next = DateTime(now.year + 1, month, day);
    }
    return next.difference(DateTime(now.year, now.month, now.day)).inDays;
  }
}
