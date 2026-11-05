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

<!-- Test helper: code blocks in a theme, for the interaction tests, axe and goldens. -->
<script lang="ts">
	import '@oito2/ui/styles.css';
	import '../lib/styles/fonts.css';
	import { ThemeProvider } from '@oito2/ui';
	import CodeBlock from '../lib/CodeBlock.svelte';

	interface Props {
		mode?: 'light' | 'dark';
		highContrast?: boolean;
		code?: string;
		language?: string | null;
		showLineNumbers?: boolean;
		gallery?: boolean;
	}

	let {
		mode = 'light',
		highContrast = false,
		code = 'const x = 1;',
		language = 'typescript',
		showLineNumbers = false,
		gallery = false
	}: Props = $props();

	const svelte =
		`<script lang="ts">
	let count = $state(0);
</` +
		`script>

<!-- A counter -->
<button class="counter" onclick={() => count++}>
	Clicked {count} times
</button>`;

	const rust = `// Moves a point.
#[derive(Debug)]
pub struct Point { x: i32, label: &'static str }

impl Point {
    pub fn moved(&self, dx: i32) -> Self {
        Self { x: self.x + dx, label: "moved" } // 0x1F
    }
}`;

	const diff = `@@ -1,3 +1,3 @@
 unchanged
-removed line
+added line`;
</script>

<ThemeProvider {mode} {highContrast} accent="blue" data-testid="gallery">
	<main class="gallery" class:still={gallery}>
		{#if gallery}
			<CodeBlock code={rust} language="rust" showLineNumbers label="point.rs" />
			<div class="row">
				<CodeBlock code={svelte} language="html" label="Counter.svelte" />
				<CodeBlock code={diff} language="diff" showCopyButton={false} label="Changes" />
			</div>
			<CodeBlock
				code="A plain block with a line much longer than the space it has, so it scrolls sideways instead of wrapping."
				label="Plain text"
			/>
		{:else}
			<CodeBlock {code} {language} {showLineNumbers} label="Snippet" data-testid="block" />
		{/if}
	</main>
</ThemeProvider>

<style>
	.gallery {
		display: grid;
		gap: 16px;
		width: 720px;
		padding: 16px;
		background: var(--oito2-color-background);
		color: var(--oito2-color-on-surface);
	}

	/* Keeps a pointer left over from earlier tests from hovering the copy buttons in the golden. */
	.still {
		pointer-events: none;
	}

	.row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
</style>
