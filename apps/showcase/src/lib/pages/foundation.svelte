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
		ListCollection,
		LocaleProvider,
		Platform,
		Select,
		SystemScope,
		accentColors,
		fallbackSystemSettings,
		radius,
		sizes,
		spacing,
		typography,
		useSystemSettings
	} from '@oito2/ui';
	import FormatSample from './parts/FormatSample.svelte';

	const platform = Platform.current();
	const settings = fallbackSystemSettings(platform);
	// The settings of the system the showcase runs on (the platform defaults in a browser).
	const system = useSystemSettings();
	const locales = new ListCollection(
		[
			{ value: 'en', label: 'English' },
			{ value: 'pt-BR', label: 'Português (Brasil)' }
		],
		{ getValue: (choice) => choice.value, getLabel: (choice) => choice.label }
	);
	let locale = $state('en');
</script>

<main class="showcase-page">
	<section aria-labelledby="foundation-platform">
		<h2 id="foundation-platform">Platform</h2>
		<dl>
			<dt>Operating system</dt>
			<dd>{platform.os}</dd>
			<dt>Runs in</dt>
			<dd>{platform.isWeb ? 'a browser' : 'a Tauri webview'}</dd>
			<dt>Density</dt>
			<dd>{platform.density}</dd>
			<dt>Desktop environment</dt>
			<dd>{system.current.desktopEnvironment ?? '—'}</dd>
			<dt>Window controls</dt>
			<dd>
				{system.current.windowControlStyle}
				({system.current.windowButtonLayout.leading.join(', ') || '—'} | {system.current.windowButtonLayout.trailing.join(
					', '
				) || '—'})
			</dd>
			<dt>Accent color</dt>
			<dd>{system.current.accentColor ?? '—'}</dd>
			<dt>Color scheme</dt>
			<dd>{system.current.colorScheme ?? 'no preference'}</dd>
			<dt>High contrast</dt>
			<dd>{system.current.highContrast ? 'on' : 'off'}</dd>
		</dl>
	</section>

	<section aria-labelledby="foundation-accents">
		<h2 id="foundation-accents">Accent colors</h2>
		<ul class="swatches">
			{#each Object.entries(accentColors) as [name, color] (name)}
				<li style:--swatch={color} style:--on-swatch={Contrast.foregroundFor(color)}>
					<span>{name}</span>
					<code>{color}</code>
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="foundation-type">
		<h2 id="foundation-type">Type scale</h2>
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

	<section aria-labelledby="foundation-tokens">
		<h2 id="foundation-tokens">Radius, spacing and sizes</h2>
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

	<section aria-labelledby="foundation-format">
		<h2 id="foundation-format">Formatting and strings</h2>
		<div class="row">
			<span>Locale</span>
			<Select.Root
				collection={locales}
				label="Locale"
				value={locale}
				onValueChange={(value) => {
					if (value) locale = value;
				}}
			/>
		</div>
		<SystemScope {settings}>
			<LocaleProvider {locale}>
				<FormatSample />
			</LocaleProvider>
		</SystemScope>
	</section>
</main>

<style>
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
