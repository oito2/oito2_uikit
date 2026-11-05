<!--
  Copyright (C) 2026  OITO2

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
-->

<!--
  @component
  A read-only block of highlighted code on the container surface, with optional line
  numbers and a copy button. The text can be selected; long lines scroll horizontally
  instead of wrapping, and the scrolling area takes the keyboard focus so the arrow keys
  scroll it.

  The colors come from the `--oito2-syntax-*` roles of the enclosing `ThemeProvider`. The
  code uses JetBrains Mono when the app imports `@oito2/ui-syntax/fonts.css`, and the
  system monospace fonts otherwise.
-->
<script lang="ts">
	import { CopyButton } from '@oito2/ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Highlighter } from './highlighter.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The source code. */
		code: string;
		/** The language name or alias, such as `ts`; missing or unregistered shows plain text. */
		language?: string | null;
		/** Whether a missing `language` is guessed among the registered ones. */
		autoDetect?: boolean;
		/** The highlighter; defaults to `Highlighter.instance`. */
		highlighter?: Highlighter;
		/** Whether line numbers show. */
		showLineNumbers?: boolean;
		/** Whether the copy button shows. Defaults to true. */
		showCopyButton?: boolean;
		/** The accessible name of the code area, such as the file name. */
		label?: string;
		/** The element. */
		ref?: HTMLDivElement | null;
	}

	let {
		code,
		language = null,
		autoDetect = false,
		highlighter = Highlighter.instance,
		showLineNumbers = false,
		showCopyButton = true,
		label,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	let highlighted = $derived(highlighter.highlight(code, { language, autoDetect }));
	let lineCount = $derived(code.split('\n').length);
</script>

<div
	bind:this={ref}
	class={['oito2-code-block', className]}
	data-language={highlighted.language ?? undefined}
	{...rest}
>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		class="oito2-code-block-scroll"
		tabindex="0"
		role={label ? 'region' : undefined}
		aria-label={label}
		data-copy-button={showCopyButton ? '' : undefined}
	>
		{#if showLineNumbers}
			<pre class="oito2-code-block-lines" aria-hidden="true">{Array.from(
					{ length: lineCount },
					(_, i) => i + 1
				).join('\n')}</pre>
		{/if}
		<pre class="oito2-code-block-code"><code
				>{#each highlighted.runs as run, index (index)}{#if run.role === 'foreground' && !run.italic && !run.bold}{run.text}{:else}<span
							style:color="var(--oito2-syntax-{run.role})"
							style:font-style={run.italic ? 'italic' : undefined}
							style:font-weight={run.bold ? 700 : undefined}>{run.text}</span
						>{/if}{/each}</code
			></pre>
	</div>
	{#if showCopyButton}
		<CopyButton text={code} class="oito2-code-block-copy" />
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-code-block {
			position: relative;
			box-sizing: border-box;
			min-width: 0;
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-surface-container);
			color: var(--oito2-syntax-foreground);
		}

		.oito2-code-block-scroll {
			display: flex;
			gap: var(--oito2-space-lg);
			overflow-x: auto;
			padding: var(--oito2-space-lg);
			border-radius: inherit;
			outline: none;
		}

		.oito2-code-block-scroll:focus-visible {
			outline: 2px solid var(--oito2-color-primary-text);
			outline-offset: -2px;
		}

		.oito2-code-block-scroll[data-copy-button] {
			padding-inline-end: calc(var(--oito2-space-lg) + var(--oito2-control-height));
		}

		pre {
			margin: 0;
			font-family:
				'JetBrains Mono', 'Cascadia Code', 'Fira Code', 'Ubuntu Mono', 'DejaVu Sans Mono',
				'Noto Sans Mono', 'Liberation Mono', Consolas, Menlo, monospace;
			font-size: 13px;
			line-height: 1.45;
			tab-size: 4;
			white-space: pre;
		}

		.oito2-code-block-lines {
			flex: none;
			color: var(--oito2-syntax-comment);
			text-align: end;
			user-select: none;
		}

		.oito2-code-block-code {
			flex: 1;
		}

		code {
			font: inherit;
		}

		.oito2-code-block :global(.oito2-code-block-copy) {
			position: absolute;
			top: var(--oito2-space-xs);
			inset-inline-end: var(--oito2-space-xs);
		}
	}
</style>
