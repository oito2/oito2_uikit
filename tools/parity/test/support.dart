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

// Helpers shared by the parity exporters.

import 'dart:convert';
import 'dart:io';
import 'dart:ui' show Color;

/// Formats a color as `#RRGGBB`, or `#RRGGBBAA` when it is not opaque.
String hex(Color color) {
  final argb = color.toARGB32();
  final rgb = (argb & 0xFFFFFF).toRadixString(16).padLeft(6, '0');
  final alpha = (argb >>> 24) & 0xFF;
  final suffix = alpha == 0xFF ? '' : alpha.toRadixString(16).padLeft(2, '0');
  return '#$rgb$suffix'.toUpperCase();
}

/// Parses `#RRGGBB` into an opaque color.
Color color(String value) =>
    Color(0xFF000000 | int.parse(value.substring(1), radix: 16));

/// Writes [data] as tab-indented JSON to [name] in the output directory,
/// which defaults to packages/ui/src/fixtures/parity and can be changed
/// with the PARITY_OUT environment variable. Returns the written file.
File writeFixture(String name, Object data) {
  final out = Directory(
    Platform.environment['PARITY_OUT'] ??
        '../../packages/ui/src/fixtures/parity',
  )..createSync(recursive: true);
  return File(
    '${out.path}/$name',
  )..writeAsStringSync('${const JsonEncoder.withIndent('\t').convert(data)}\n');
}
