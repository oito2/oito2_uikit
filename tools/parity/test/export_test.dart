// Copyright (C) 2026  OITO2
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// Writes the oito2_ui design data that oito2_uikit must reproduce as JSON
// fixtures. Run with `flutter test` from tools/parity; the output directory
// defaults to packages/ui/src/fixtures/parity and can be changed with the
// PARITY_OUT environment variable.

import 'dart:convert';
import 'dart:io';
import 'dart:ui' show Color;

import 'package:flutter_test/flutter_test.dart';
import 'package:oito2_ui/oito2_ui.dart';

/// Formats a color as `#RRGGBB`, or `#RRGGBBAA` when it is not opaque.
String hex(Color color) {
  final argb = color.toARGB32();
  final rgb = (argb & 0xFFFFFF).toRadixString(16).padLeft(6, '0');
  final alpha = (argb >>> 24) & 0xFF;
  final suffix = alpha == 0xFF ? '' : alpha.toRadixString(16).padLeft(2, '0');
  return '#$rgb$suffix'.toUpperCase();
}

Map<String, String> neutrals(Oito2NeutralPalette p) => {
  'surface': hex(p.surface),
  'surfaceContainerLowest': hex(p.surfaceContainerLowest),
  'surfaceContainerLow': hex(p.surfaceContainerLow),
  'surfaceContainer': hex(p.surfaceContainer),
  'surfaceContainerHigh': hex(p.surfaceContainerHigh),
  'surfaceContainerHighest': hex(p.surfaceContainerHighest),
  'titleBar': hex(p.titleBar),
  'onSurface': hex(p.onSurface),
  'onSurfaceVariant': hex(p.onSurfaceVariant),
  'outline': hex(p.outline),
  'outlineVariant': hex(p.outlineVariant),
};

Map<String, String> status(Oito2StatusPalette p) => {
  'success': hex(p.success),
  'warning': hex(p.warning),
  'error': hex(p.error),
  'info': hex(p.info),
  'link': hex(p.link),
};

void main() {
  test('exports the design tokens', () {
    final tokens = <String, Object>{
      'radius': {
        'check': Oito2Radius.check,
        'small': Oito2Radius.small,
        'medium': Oito2Radius.medium,
        'large': Oito2Radius.large,
        'window': Oito2Radius.window,
      },
      'spacing': {
        'xxs': Oito2Spacing.xxs,
        'xs': Oito2Spacing.xs,
        'sm': Oito2Spacing.sm,
        'md': Oito2Spacing.md,
        'lg': Oito2Spacing.lg,
        'page': Oito2Spacing.page,
        'xl': Oito2Spacing.xl,
        'xxl': Oito2Spacing.xxl,
        'xxxl': Oito2Spacing.xxxl,
      },
      'sizes': {
        'buttonHeight': Oito2Sizes.buttonHeight,
        'touchButtonHeight': Oito2Sizes.touchButtonHeight,
        'titleBarHeight': Oito2Sizes.titleBarHeight,
        'titleBarItemHeight': Oito2Sizes.titleBarItemHeight,
        'iconSize': Oito2Sizes.iconSize,
        'progressHeight': Oito2Sizes.progressHeight,
        'focusBorderWidth': Oito2Sizes.focusBorderWidth,
        'windowControlSize': Oito2Sizes.windowControlSize,
        'windowsWindowControlWidth': Oito2Sizes.windowsWindowControlWidth,
        'minPointerTarget': Oito2Sizes.minPointerTarget,
        'minTouchTarget': Oito2Sizes.minTouchTarget,
      },
      'accents': {
        for (final accent in Oito2AccentColor.values)
          accent.name: hex(accent.color),
      },
      'neutrals': {
        'light': neutrals(Oito2NeutralPalette.light),
        'dark': neutrals(Oito2NeutralPalette.dark),
      },
      'status': {
        'light': status(Oito2StatusPalette.light),
        'dark': status(Oito2StatusPalette.dark),
      },
      'typography': {
        'fontFamilyFallback': Oito2Typography.fontFamilyFallback,
        'bodyLargeSize': Oito2Typography.bodyLargeSize,
        'bodyMediumSize': Oito2Typography.bodyMediumSize,
        'bodySmallSize': Oito2Typography.bodySmallSize,
        'emphasisWeight': Oito2Typography.emphasisWeight.value,
      },
    };

    final out = Directory(
      Platform.environment['PARITY_OUT'] ??
          '../../packages/ui/src/fixtures/parity',
    )..createSync(recursive: true);
    final file = File('${out.path}/tokens.json')
      ..writeAsStringSync(
        '${const JsonEncoder.withIndent('\t').convert(tokens)}\n',
      );
    expect(file.existsSync(), isTrue);
  });
}
