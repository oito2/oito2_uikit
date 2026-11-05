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

// A short sample of every default language of @oito2/ui-syntax, for the code page.

/** The sample code of each language, by language name. */
export const codeSamples: Readonly<Record<string, string>> = {
	bash: '#!/bin/bash\n# Greets everyone\nNAME="world"\nfor i in 1 2 3; do\n  echo "Hello, $NAME #$i" > /dev/null\ndone\nif [ -f ~/.bashrc ]; then source ~/.bashrc; fi\n',
	c: '#include <stdio.h>\n/* Entry point */\nint main(int argc, char **argv) {\n  const double ratio = 0.5;\n  printf("%d args\\n", argc);\n  return 0;\n}\n',
	cpp: '#include <vector>\nnamespace demo {\ntemplate <typename T>\nclass Box : public Base {\n public:\n  explicit Box(T value) : value_(value) {}\n  auto get() const -> T { return value_; } // getter\n private:\n  T value_ = nullptr;\n};\n}\n',
	csharp: 'using System;\n// A greeter\n[Serializable]\npublic sealed class Greeter : IGreeter {\n  public string Name { get; init; } = "world";\n  public async Task<int> RunAsync() => await Task.FromResult(42);\n  private bool _ready = true;\n}\n',
	css: '/* Layout */\n@media (min-width: 600px) {\n  .card > h1#title:hover, a[href^="https"] {\n    color: #3584e4;\n    margin: 0 auto !important;\n    font-family: "Inter", sans-serif;\n  }\n}\n',
	dart: "// A comment\n@override\nclass Greeter extends Base {\n  final int count = 42;\n  String greet(String name) => 'Hello, $name';\n  bool get ready => true;\n}\n",
	diff: 'diff --git a/a.txt b/a.txt\n--- a/a.txt\n+++ b/a.txt\n@@ -1,3 +1,3 @@\n unchanged\n-removed line\n+added line\n',
	dockerfile:
		'# Build stage\nFROM node:24-alpine AS build\nWORKDIR /app\nCOPY package.json ./\nRUN npm ci && npm run build\nENV NODE_ENV=production\nEXPOSE 8080\nCMD ["node", "dist/index.js"]\n',
	go: 'package main\n\nimport "fmt"\n\n// Point is a position.\ntype Point struct{ X, Y int }\n\nfunc (p *Point) Move(dx int) error {\n\tp.X += dx\n\tfmt.Println("moved", true, nil, 3.14)\n\treturn nil\n}\n',
	html: '<!DOCTYPE html>\n<html lang="en">\n<!-- A page -->\n<head><style>body { color: red; }</style></head>\n<body class="main" data-id=\'7\'>\n  <p>Hello &amp; welcome</p>\n  <script>const x = 1;</script>\n</body>\n</html>\n',
	ini: '; Settings\n[server]\nhost = "localhost"\nport = 8080\nenabled = true\npath = /var/www\n',
	java: 'package demo;\nimport java.util.List;\n/** A greeter. */\n@FunctionalInterface\npublic class Greeter<T> extends Base implements Runnable {\n  private static final int MAX = 10;\n  public String greet(String name) { return "Hi " + name; }\n  @Override public void run() { if (MAX > 0L) throw new IllegalStateException(); }\n}\n',
	javascript:
		"// Greets\nimport { readFile } from 'node:fs/promises';\nexport async function greet(name = 'world') {\n  const re = /^h(i|ello)$/gi;\n  let count = 0x1f + 1.5e3;\n  console.log(`Hello, ${name}!`, null, undefined, true);\n  return new Map([[1, 'a']]);\n}\nclass Thing extends Base { static #secret = 1; get value() { return this.x; } }\n",
	json: '{\n  "name": "oito2",\n  "version": 1.5,\n  "private": true,\n  "tags": ["ui", null],\n  "nested": { "a": -2e3 }\n}\n',
	kotlin: 'package demo\n// A data class\n@JvmInline\ndata class Point(val x: Int, var y: Double = 0.0) : Shape {\n  fun move(dx: Int): Point = copy(x = x + dx)\n  override fun toString() = "Point($x, ${y})"\n}\nval ok = true && null == null\n',
	markdown:
		'# Title\n\nSome *emphasis*, **strong** and `code`.\n\n- item one\n- [a link](https://example.com)\n\n> A quote\n\n```dart\nvoid main() {}\n```\n',
	php: "<?php\nnamespace App;\n// A controller\n#[Route('/home')]\nfinal class Home extends Controller {\n  public function index(int $id = 0): string {\n    $name = \"user {$id}\";\n    return sprintf('%s', $name) ?? null;\n  }\n}\n",
	plaintext: 'Just some plain text, with "quotes" and 42 numbers.\n',
	python: '# A comment\n@dataclass\nclass Point(Base):\n    """A point."""\n    x: int = 0\n\n    def move(self, dx: float) -> "Point":\n        ready = True and None is None\n        return f"moved {dx}" if ready else 0x1F\n',
	rust: '// A point\n#[derive(Debug, Clone)]\npub struct Point<\'a> { x: i32, name: &\'a str }\n\nimpl Point<\'_> {\n    pub fn new(x: i32) -> Self { Self { x, name: "p" } }\n}\n\nfn main() { let v: Vec<u8> = vec![1, 2]; println!("{:?} {}", v, true); }\n',
	scss: '// Variables\n$primary: #3584e4;\n@mixin card($radius: 8px) { border-radius: $radius; }\n.card {\n  &:hover { color: darken($primary, 10%); }\n  @include card(12px);\n}\n',
	shell: '$ npm install --save-dev vitest\nadded 1 package in 2s\n$ echo "done"\ndone\n',
	sql: "-- Active users\nSELECT u.id, COUNT(*) AS total\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE u.active = TRUE AND u.name LIKE 'A%' AND o.total > 10.5\nGROUP BY u.id\nORDER BY total DESC NULLS LAST;\n",
	swift: 'import Foundation\n// A shape\n@MainActor\nstruct Circle: Shape {\n  let radius: Double = 1.5\n  func area() -> Double { return .pi * radius * radius }\n  var label: String { "r=\\(radius)" }\n}\nlet ok = true, none: Int? = nil\n',
	typescript:
		"// Types\ninterface User { readonly id: number; name?: string }\ntype Id = string | number;\nexport enum Mode { Light = 'light', Dark = 'dark' }\nexport function find<T extends User>(users: T[], id: Id): T | undefined {\n  return users.find((u) => u.id === id) as T;\n}\n@Component({ selector: 'app' }) class App { private count = 0; }\n",
	xml: '<?xml version="1.0" encoding="UTF-8"?>\n<!-- Config -->\n<config xmlns:x="urn:x" enabled="true">\n  <item id="1">Value &lt; 10</item>\n  <![CDATA[raw <text>]]>\n</config>\n',
	yaml: '# Settings\nname: oito2\nversion: 1.5\nenabled: true\ntags: [ui, "svelte"]\nnested:\n  key: &anchor value\n  other: *anchor\n  empty: null\n'
};
