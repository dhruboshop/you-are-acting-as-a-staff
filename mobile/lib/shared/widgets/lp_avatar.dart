import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../../core/extensions/string_extensions.dart';
import '../../core/theme/color_tokens.dart';

class LPAvatar extends StatelessWidget {
  const LPAvatar({required this.name, this.imageUrl, this.size = 40, this.backgroundColor, this.textColor, this.showBorder = false, this.onTap, super.key});

  final String name;
  final String? imageUrl;
  final double size;
  final Color? backgroundColor;
  final Color? textColor;
  final bool showBorder;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colors = [AppColors.info, AppColors.success, AppColors.warning, AppColors.error, Theme.of(context).colorScheme.primary, Theme.of(context).colorScheme.secondary];
    final bg = backgroundColor ?? colors[name.hashCode.abs() % colors.length];
    final avatar = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, color: bg, border: showBorder ? Border.all(color: AppColors.white, width: 2) : null),
      clipBehavior: Clip.antiAlias,
      child: imageUrl == null
          ? Center(child: Text(name.initials, style: TextStyle(color: textColor ?? AppColors.white, fontWeight: FontWeight.w700)))
          : CachedNetworkImage(imageUrl: imageUrl!, fit: BoxFit.cover),
    );
    return GestureDetector(onTap: onTap, child: avatar);
  }
}
