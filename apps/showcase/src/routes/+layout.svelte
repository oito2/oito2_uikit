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
	import {
		HeaderBar,
		IconButton,
		Platform,
		SystemScope,
		ThemeProvider,
		WindowScope,
		accentColors,
		fallbackSystemSettings,
		type AccentColor,
		type WindowController
	} from '@oito2/ui';
	import { presetTheme, themePresetNames, themePresets } from '@oito2/ui-themes';
	import { SystemSettingsScope } from '@oito2/ui-settings';
	import { WindowResizeHandles, initWindow, type NativeWindowController } from '@oito2/ui-window';
	import House from '@lucide/svelte/icons/house';
	import { isTauri } from '@tauri-apps/api/core';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';
	import { ShowcaseSettings, type SimulatedDesktop } from '#lib/showcase-settings.svelte.js';
	import { SimulatedWindowController, simulatedSettings } from '#lib/simulated-window.svelte.js';
	import { spikeRequest } from '#lib/spikes/bridge.js';

	let { children }: LayoutProps = $props();

	const settings = new ShowcaseSettings();
	const accents = Object.keys(accentColors) as AccentColor[];

	// A preset fixes the brightness; the base scheme follows the mode setting.
	let preset = $derived(settings.scheme === 'base' ? null : themePresets[settings.scheme]);
	let mode = $derived(preset ? (preset.isDark ? 'dark' : 'light') : settings.mode);
	let source = $derived(settings.scheme === 'base' ? undefined : presetTheme(settings.scheme));

	$effect(() => settings.save());

	const tauri = isTauri();
	const desktops: { value: SimulatedDesktop; label: string }[] = [
		{ value: 'system', label: 'Browser' },
		{ value: 'gnome', label: 'GNOME' },
		{ value: 'kde', label: 'KDE Plasma' },
		{ value: 'xfce', label: 'Xfce' },
		{ value: 'cosmic', label: 'COSMIC' },
		{ value: 'windows', label: 'Windows' },
		{ value: 'macos', label: 'macOS' }
	];

	// In Tauri the real window drives the title bar; the browser build can imitate a desktop.
	let native: NativeWindowController | null = $state(null);
	const simulated = new SimulatedWindowController();
	let simulating = $derived(!tauri && settings.desktop !== 'system');
	// Tauri reads the real settings (SystemSettingsScope); the browser uses the defaults or
	// the simulated desktop.
	let webSettings = $derived(
		simulating && settings.desktop !== 'system'
			? simulatedSettings(settings.desktop)
			: fallbackSystemSettings(Platform.current())
	);
	let controller: WindowController | null = $derived(native ?? (simulating ? simulated : null));

	onMount(() => {
		if (!tauri) return;
		// The Rust setup already applied the frame and showed the window.
		void initWindow({ show: false }).then((value) => (native = value));
		return () => native?.dispose();
	});

	// A Tauri debug build started with OITO2_SPIKE opens that spike page and reports back.
	onMount(async () => {
		const spike = await spikeRequest();
		if (spike) await goto(resolve(`/spikes/${spike}?report`));
	});
</script>

{#snippet app()}
	<ThemeProvider
		class="showcase"
		{mode}
		accent={settings.accent === 'system' ? undefined : settings.accent}
		highContrast={settings.highContrast}
		light={source}
		dark={source}
	>
		<WindowScope {controller}>
			<div class="frame">
				<HeaderBar title="oito2_uikit Showcase">
					{#snippet start()}
						<IconButton icon={House} label="Home" onclick={() => goto(resolve('/'))} />
					{/snippet}
				</HeaderBar>
				<header class="appearance">
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
							<option value="system">System</option>
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
								settings.highContrast =
									value === 'system' ? 'system' : value === 'true';
							}}
						>
							<option value="system">System</option>
							<option value="false">Normal</option>
							<option value="true">High</option>
						</select>
					</label>
					{#if !tauri}
						<label>
							Desktop
							<select bind:value={settings.desktop}>
								{#each desktops as desktop (desktop.value)}
									<option value={desktop.value}>{desktop.label}</option>
								{/each}
							</select>
						</label>
					{/if}
					{#if simulating && simulated.lastAction}
						<span class="action">Window action: {simulated.lastAction}</span>
					{/if}
				</header>
				<div class="content">{@render children()}</div>
			</div>
			<WindowResizeHandles controller={native} />
		</WindowScope>
	</ThemeProvider>
{/snippet}

{#if tauri}
	<SystemSettingsScope>{@render app()}</SystemSettingsScope>
{:else}
	<SystemScope settings={webSettings}>{@render app()}</SystemScope>
{/if}

<style>
	:global(html, body) {
		min-height: 100%;
	}

	:global(.showcase) {
		height: 100vh;
	}

	/* The title bar stays at the top; the page scrolls below it. */
	.frame {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.content {
		flex: 1;
		min-height: 0;
		overflow: auto;
	}

	.action {
		color: var(--oito2-color-on-surface-variant);
	}

	.appearance {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--oito2-space-md) var(--oito2-space-lg);
		padding: var(--oito2-space-sm) var(--oito2-space-page);
		background: var(--oito2-chrome-mainbar);
		border-bottom: 1px solid var(--oito2-color-outline-variant);
	}

	.appearance label {
		display: flex;
		align-items: center;
		gap: var(--oito2-space-xs);
	}
</style>
