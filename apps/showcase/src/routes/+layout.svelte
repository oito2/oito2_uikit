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
	import '@oito2/ui/styles.css';
	import '@oito2/ui-syntax/fonts.css';
	import { ThemeProvider, accentColors, type AccentColor } from '@oito2/ui';
	import { presetTheme, themePresetNames, themePresets } from '@oito2/ui-themes';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';
	import { ShowcaseSettings } from '#lib/showcase-settings.svelte.js';
	import { spikeRequest } from '#lib/spikes/bridge.js';

	let { children }: LayoutProps = $props();

	const settings = new ShowcaseSettings();
	const accents = Object.keys(accentColors) as AccentColor[];

	// A preset fixes the brightness; the base scheme follows the mode setting.
	let preset = $derived(settings.scheme === 'base' ? null : themePresets[settings.scheme]);
	let mode = $derived(preset ? (preset.isDark ? 'dark' : 'light') : settings.mode);
	let source = $derived(settings.scheme === 'base' ? undefined : presetTheme(settings.scheme));

	$effect(() => settings.save());

	// A Tauri debug build started with OITO2_SPIKE opens that spike page and reports back.
	onMount(async () => {
		const spike = await spikeRequest();
		if (spike) await goto(resolve(`/spikes/${spike}?report`));
	});
</script>

<ThemeProvider
	class="showcase"
	{mode}
	accent={settings.accent}
	highContrast={settings.highContrast}
	light={source}
	dark={source}
>
	<header class="appearance">
		<a href={resolve('/')}>oito2_uikit</a>
		<label>
			Scheme
			<select bind:value={settings.scheme}>
				<option value="base">oito2</option>
				{#each themePresetNames as name (name)}
					<option value={name}>{themePresets[name].label}</option>
				{/each}
			</select>
		</label>
		<label>
			Mode
			<select bind:value={settings.mode} disabled={preset !== null}>
				<option value="system">System</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</label>
		<label>
			Accent
			<select bind:value={settings.accent} disabled={preset !== null}>
				{#each accents as accent (accent)}
					<option value={accent}>{accent}</option>
				{/each}
			</select>
		</label>
		<label>
			Contrast
			<select
				value={String(settings.highContrast)}
				onchange={(event) => {
					const value = event.currentTarget.value;
					settings.highContrast = value === 'system' ? 'system' : value === 'true';
				}}
			>
				<option value="system">System</option>
				<option value="false">Normal</option>
				<option value="true">High</option>
			</select>
		</label>
	</header>
	{@render children()}
</ThemeProvider>

<style>
	:global(html, body) {
		min-height: 100%;
	}

	:global(.showcase) {
		min-height: 100vh;
	}

	.appearance {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--oito2-space-md) var(--oito2-space-lg);
		padding: var(--oito2-space-sm) var(--oito2-space-page);
		background: var(--oito2-chrome-title-bar);
		border-bottom: 1px solid var(--oito2-color-outline-variant);
	}

	.appearance a {
		margin-right: auto;
		font-weight: var(--oito2-font-weight-emphasis);
		color: var(--oito2-color-on-surface);
		text-decoration: none;
	}

	.appearance label {
		display: flex;
		align-items: center;
		gap: var(--oito2-space-xs);
	}
</style>
