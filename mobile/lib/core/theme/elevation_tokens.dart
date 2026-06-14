import 'package:flutter/material.dart';

class LPElevation {
  static const none = <BoxShadow>[];
  static const level1 = [BoxShadow(color: Color(0x14000000), blurRadius: 3, offset: Offset(0, 1))];
  static const level2 = [BoxShadow(color: Color(0x1a000000), blurRadius: 12, offset: Offset(0, 4))];
  static const level3 = [BoxShadow(color: Color(0x1f000000), blurRadius: 24, offset: Offset(0, 8))];
  static const level4 = [BoxShadow(color: Color(0x26000000), blurRadius: 60, offset: Offset(0, 20))];
}
