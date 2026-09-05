// =============================================================================
// WIDGET: UserAvatar — Avatar con soporte de caché, iniciales y fallback
// =============================================================================

import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../theme.dart';

class UserAvatar extends StatelessWidget {
  final String? photoUrl;
  final String? name;
  final double radius;
  final VoidCallback? onTap;

  const UserAvatar({
    super.key,
    this.photoUrl,
    this.name,
    this.radius = 16,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveName = (name != null && name!.trim().isNotEmpty) ? name!.trim() : 'U';
    final initial = effectiveName[0].toUpperCase();

    Widget avatarContent;
    if (photoUrl != null && photoUrl!.trim().isNotEmpty) {
      avatarContent = CachedNetworkImage(
        imageUrl: photoUrl!,
        width: radius * 2,
        height: radius * 2,
        fit: BoxFit.cover,
        placeholder: (_, __) => Container(
          width: radius * 2,
          height: radius * 2,
          color: BuscapetTheme.bgInput,
          child: Center(
            child: Text(
              initial,
              style: TextStyle(
                fontSize: radius * 0.9,
                fontWeight: FontWeight.w800,
                color: BuscapetTheme.primary,
              ),
            ),
          ),
        ),
        errorWidget: (_, __, ___) => Container(
          width: radius * 2,
          height: radius * 2,
          color: BuscapetTheme.primary.withValues(alpha: 0.2),
          child: Center(
            child: Text(
              initial,
              style: TextStyle(
                fontSize: radius * 0.9,
                fontWeight: FontWeight.w800,
                color: BuscapetTheme.primary,
              ),
            ),
          ),
        ),
      );
    } else {
      avatarContent = Container(
        width: radius * 2,
        height: radius * 2,
        color: BuscapetTheme.primary.withValues(alpha: 0.2),
        child: Center(
          child: Text(
            initial,
            style: TextStyle(
              fontSize: radius * 0.9,
              fontWeight: FontWeight.w800,
              color: BuscapetTheme.primary,
            ),
          ),
        ),
      );
    }

    final avatarWidget = ClipOval(child: avatarContent);

    if (onTap != null) {
      return GestureDetector(
        onTap: onTap,
        child: avatarWidget,
      );
    }
    return avatarWidget;
  }
}
