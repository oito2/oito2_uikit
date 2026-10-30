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
	import {
		Contrast,
		LocaleProvider,
		Platform,
		SystemScope,
		accentColors,
		fallbackSystemSettings,
		radius,
		sizes,
		spacing,
		typography
	} from '@oito2/ui';
	import FormatSample from './FormatSample.svelte';

	const platform = Platform.current();
	const settings = fallbackSystemSettings(platform);
	let locale = $state('en');
</script>

<main>
	<h1>Foundation</h1>

	<section>
		<h2>Platform</h2>
		<dl>
			<dt>Operating system</dt>
			<dd>{platform.os}</dd>
			<dt>Runs in</dt>
			<dd>{platform.isWeb ? 'a browser' : 'a Tauri webview'}</dd>
			<dt>Density</dt>
			<dd>{platform.density}</dd>
			<dt>Window controls</dt>
			<dd>
				{settings.windowControlStyle}
				({settings.windowButtonLayout.leading.join(', ') || '—'} | {settings.windowButtonLayout.trailing.join(
					', '
				) || '—'})
			</dd>
		</dl>
	</section>

	<section>
		<h2>Accent colors</h2>
		<ul class="swatches">
			{#each Object.entries(accentColors) as [name, color] (name)}
				<li style:--swatch={color} style:--on-swatch={Contrast.foregroundFor(color)}>
					<span>{name}</span>
					<code>{color}</code>
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<h2>Type scale</h2>
		{#each Object.entries(typography.scale) as [name, style] (name)}
			<p
				class="type-sample"
				style:font="{style.fontWeight}
				{style.fontSize}px / {style.lineHeight} var(--oito2-font-family)"
				style:letter-spacing="{style.letterSpacing}px"
			>
				{name} · {style.fontSize}/{Math.round(style.fontSize * style.lineHeight)}
			</p>
		{/each}
	</section>

	<section>
		<h2>Radius, spacing and sizes</h2>
		<div class="tokens">
			{#each Object.entries(radius) as [name, value] (name)}
				<div class="radius" style:border-radius="{value}px">radius.{name} · {value}</div>
			{/each}
		</div>
		<ul class="spacing">
			{#each Object.entries(spacing) as [name, value] (name)}
				<li><span style:width="{value}px"></span> spacing.{name} · {value}</li>
			{/each}
		</ul>
		<ul>
			{#each Object.entries(sizes) as [name, value] (name)}
				<li>sizes.{name} · {value}</li>
			{/each}
		</ul>
	</section>

	<section>
		<h2>Formatting and strings</h2>
		<label>
			Language
			<select bind:value={locale}>
				<option value="en">English</option>
				<option value="pt-BR">Português (Brasil)</option>
			</select>
		</label>
		<SystemScope {settings}>
			<LocaleProvider {locale}>
				<FormatSample />
			</LocaleProvider>
		</SystemScope>
	</section>
</main>

<style>
	main {
		padding: var(--oito2-space-page);
		display: grid;
		gap: var(--oito2-space-xl);
	}

	h1,
	h2 {
		margin: 0 0 var(--oito2-space-sm);
	}

	h1 {
		font: var(--oito2-type-headline-medium);
	}

	h2 {
		font: var(--oito2-type-title-large);
	}

	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: var(--oito2-space-xs) var(--oito2-space-lg);
		margin: 0;
	}

	dt {
		font-weight: var(--oito2-font-weight-emphasis);
	}

	dd {
		margin: 0;
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.swatches {
		display: flex;
		flex-wrap: wrap;
		gap: var(--oito2-space-sm);
	}

	.swatches li {
		display: grid;
		width: 120px;
		padding: var(--oito2-space-md);
		border-radius: var(--oito2-radius-medium);
		background: var(--swatch);
		color: var(--on-swatch);
	}

	.type-sample {
		margin: 0;
	}

	.tokens {
		display: flex;
		flex-wrap: wrap;
		gap: var(--oito2-space-md);
		margin-bottom: var(--oito2-space-lg);
	}

	.radius {
		padding: var(--oito2-space-lg);
		border: 2px solid color-mix(in srgb, CanvasText 40%, transparent);
	}

	.spacing li {
		display: flex;
		align-items: center;
		gap: var(--oito2-space-sm);
	}

	.spacing span {
		display: inline-block;
		height: 12px;
		background: var(--oito2-accent-blue);
	}
</style>
