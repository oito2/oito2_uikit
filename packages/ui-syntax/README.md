# @oito2/ui-syntax

Syntax highlighting for `@oito2/ui`: code colored with the oito2 color schemes through highlight.js, plus a ready-made code block component.

[![npm](https://img.shields.io/npm/v/@oito2/ui-syntax?label=npm)](https://www.npmjs.com/package/@oito2/ui-syntax)
[![License](https://img.shields.io/badge/license-GPL--3.0-blue)](https://github.com/oito2/oito2_uikit/blob/main/LICENSE)

## Installation

```bash
pnpm add @oito2/ui-syntax @oito2/ui svelte
```

`svelte` (`^5.57.0`) is a peer dependency. Set up `@oito2/ui` first (its `styles.css` and a `ThemeProvider`): the code colors come from the `--oito2-syntax-*` roles of the enclosing theme, including the `@oito2/ui-themes` presets.

## Setup

Optionally import the bundled JetBrains Mono variable font (OFL-1.1); without it, code uses the system monospace fonts:

```js
import '@oito2/ui-syntax/fonts.css';
```

## Usage

`CodeBlock` renders read-only highlighted code with optional line numbers and a copy button:

```svelte
<script lang="ts">
	import { CodeBlock } from '@oito2/ui-syntax';

	const code = "const greeting = 'Hello'; // say hi";
</script>

<CodeBlock {code} language="ts" showLineNumbers label="greeting.ts" />
```

`Highlighter` splits code into runs with a syntax role each, for custom rendering:

```ts
import { Highlighter } from '@oito2/ui-syntax';

const { language, runs } = Highlighter.instance.highlight(source, { autoDetect: true });
```

Unregistered or missing languages render as plain text. To add one of the other highlight.js grammars, add `highlight.js` to the app (`pnpm add highlight.js`) and pass the grammar to a new `Highlighter` together with the defaults (only the grammars imported end up in the app):

```ts
import { Highlighter, defaultLanguages } from '@oito2/ui-syntax';
import lua from 'highlight.js/lib/languages/lua';

const highlighter = new Highlighter({ ...defaultLanguages, lua });
```

```svelte
<CodeBlock code={script} language="lua" {highlighter} />
```

## What's inside

| Export                                          | Purpose                                                                                                                                                                                                           |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CodeBlock`                                     | Highlighted code block: `code`, `language`, `autoDetect`, `showLineNumbers`, `showCopyButton`, `label`, `highlighter`                                                                                             |
| `Highlighter`                                   | highlight.js wrapper; `Highlighter.instance` is shared, `highlight()` returns `{ language, runs }`                                                                                                                |
| `defaultLanguages`                              | The 27 default grammars: bash, c, cpp, csharp, css, dart, diff, dockerfile, go, html, ini, java, javascript, json, kotlin, markdown, php, plaintext, python, rust, scss, shell, sql, swift, typescript, xml, yaml |
| `HighlighterTheme`, `roleOfScope`, `scopeRoles` | Mapping from highlight.js scopes to oito2 syntax roles                                                                                                                                                            |
| `SyntaxPalette`, `SyntaxRole` (types)           | Re-exported from `@oito2/ui/theme`                                                                                                                                                                                |

Language aliases such as `ts`, `js` or `yml` are accepted wherever a language name is.

## Links

- Live showcase: <https://oito2.github.io/oito2_uikit/>
- Repository: <https://github.com/oito2/oito2_uikit>

## License

GPL-3.0 — see [LICENSE](https://github.com/oito2/oito2_uikit/blob/main/LICENSE).
