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

<script lang="ts">
	import { Contrast, colorSchemeRoles, syntaxRoles, useTheme } from '@oito2/ui';

	const theme = useTheme();

	// Contrast of a color against the page background, to one decimal.
	const ratio = (color: string) => Contrast.ratio(color, theme.current.background).toFixed(1);
</script>

<main>
	<h1>Colors</h1>
	<p>
		{theme.current.brightness}{theme.current.highContrast ? ', high contrast' : ''}. Ratios are
		against the page background.
	</p>

	{#snippet swatches(title: string, colors: [string, string][])}
		<section>
			<h2>{title}</h2>
			<ul>
				{#each colors as [name, color] (name)}
					<li>
						<span class="chip" style:background={color}></span>
						<span class="name">{name}</span>
						<code>{color}</code>
						<span class="ratio">{ratio(color)}:1</span>
					</li>
				{/each}
			</ul>
		</section>
	{/snippet}

	{@render swatches('Semantic', Object.entries(theme.current.semantic) as [string, string][])}
	{@render swatches('Chrome', Object.entries(theme.current.chrome) as [string, string][])}
	{@render swatches(
		'Material roles',
		colorSchemeRoles.map((role) => [role, theme.current.colorScheme[role]] as [string, string])
	)}
	{@render swatches(
		'Syntax',
		syntaxRoles.map((role) => [role, theme.current.syntax[role]] as [string, string])
	)}

	<section>
		<h2>Text samples</h2>
		<p class="sample" style:color="var(--oito2-color-primary-text)">Primary text and links</p>
		<p class="sample" style:color="var(--oito2-color-error-text)">An error message</p>
		<p class="sample" style:color="var(--oito2-color-on-surface-variant)">Secondary text</p>
		<pre class="code"><span style:color="var(--oito2-syntax-keyword)">const</span> <span
				style:color="var(--oito2-syntax-function)">greet</span
			> = (<span style:color="var(--oito2-syntax-attribute)">name</span>) =&gt; <span
				style:color="var(--oito2-syntax-string)">`Hello, {'${name}'}`</span
			>; <span style:color="var(--oito2-syntax-comment)">// 42</span></pre>
	</section>
</main>

<style>
	main {
		padding: var(--oito2-space-page);
	}

	h1 {
		font: var(--oito2-type-headline-medium);
		margin: 0;
	}

	h2 {
		font: var(--oito2-type-title-medium);
		margin: var(--oito2-space-xl) 0 var(--oito2-space-sm);
	}

	ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--oito2-space-xs) var(--oito2-space-lg);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: grid;
		grid-template-columns: 24px 1fr auto auto;
		align-items: center;
		gap: var(--oito2-space-sm);
	}

	.chip {
		width: 24px;
		height: 24px;
		border-radius: var(--oito2-radius-small);
		border: 1px solid var(--oito2-color-outline-variant);
	}

	.ratio {
		color: var(--oito2-color-on-surface-variant);
		font: var(--oito2-type-label-medium);
	}

	.sample {
		margin: var(--oito2-space-xs) 0;
	}

	.code {
		padding: var(--oito2-space-md);
		border-radius: var(--oito2-radius-medium);
		background: var(--oito2-color-surface-container);
		font-family: 'JetBrains Mono', monospace;
	}
</style>
