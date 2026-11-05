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
	import '#lib/showcase.css';
	import {
		Button,
		HeaderBar,
		IconButton,
		LocaleProvider,
		MasterDetail,
		NavigationRail,
		Platform,
		SearchField,
		SystemScope,
		ThemeProvider,
		Toaster,
		WindowScope,
		fallbackSystemSettings,
		pageTransition,
		type IconComponent,
		type WindowController
	} from '@oito2/ui';
	import { presetTheme, themePresets } from '@oito2/ui-themes';
	import { SystemSettingsScope } from '@oito2/ui-settings';
	import { WindowResizeHandles, initWindow, type NativeWindowController } from '@oito2/ui-window';
	import Code from '@lucide/svelte/icons/code';
	import Settings from '@lucide/svelte/icons/settings';
	import { isTauri } from '@tauri-apps/api/core';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';
	import { findPage, searchPages, showcasePages, type ShowcaseGroup } from '#lib/catalog.js';
	import { ShowcaseSettings } from '#lib/showcase-settings.svelte.js';
	import { SimulatedWindowController, simulatedSettings } from '#lib/simulated-window.svelte.js';
	import SettingsDialog from '#lib/shell/SettingsDialog.svelte';
	import SourceDialog from '#lib/shell/SourceDialog.svelte';
	import ThemeActions from '#lib/shell/ThemeActions.svelte';
	import { spikeRequest } from '#lib/spikes/bridge.js';

	let { children }: LayoutProps = $props();

	const settings = new ShowcaseSettings();

	// A preset fixes the brightness; the base scheme follows the mode setting.
	let preset = $derived(settings.scheme === 'base' ? null : themePresets[settings.scheme]);
	let mode = $derived(preset ? (preset.isDark ? 'dark' : 'light') : settings.mode);
	let source = $derived(settings.scheme === 'base' ? undefined : presetTheme(settings.scheme));

	$effect(() => settings.save());

	const tauri = isTauri();

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

	// The page the address selects, and whether the address is a spike page outside the shell.
	let spike = $derived(page.route.id?.startsWith('/spikes') ?? false);
	let slug = $derived(page.params.slug ?? null);
	let current = $derived(findPage(slug));

	let query = $state('');
	let found = $derived(searchPages(query));
	const groups: ShowcaseGroup[] = ['Components', 'Theme'];

	// The compact rail shows longer labels as the window widens.
	let windowWidth = $state(1280);
	let railStyle = $derived(
		windowWidth >= 1000 ? 'labelledExtended' : windowWidth >= 500 ? 'labelled' : 'compact'
	) as 'labelledExtended' | 'labelled' | 'compact';

	let settingsOpen = $state(false);
	let sourceOpen = $state(false);

	/** Shows the page `next`, or the start page for `null`. */
	function select(next: string | null): void {
		if (next === slug) return;
		void goto(next === null ? resolve('/') : resolve('/[slug]', { slug: next }));
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

{#snippet detail()}
	<!-- The page scrolls here; it takes the focus so the keyboard can scroll pages without controls. -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div class="content" tabindex="0">
		{#key page.url.pathname}
			<div class="page" in:pageTransition>{@render children()}</div>
		{/key}
	</div>
{/snippet}

{#snippet sourceAction()}
	{#if current}
		<IconButton
			icon={Code as IconComponent}
			label="View source"
			onclick={() => (sourceOpen = true)}
		/>
	{/if}
{/snippet}

{#snippet app()}
	<LocaleProvider locale={settings.locale}>
		<ThemeProvider
			class="showcase"
			{mode}
			accent={settings.accent === 'system' ? undefined : settings.accent}
			highContrast={settings.highContrast}
			light={source}
			dark={source}
			dir={settings.rtl ? 'rtl' : 'ltr'}
			data-oito2-density={settings.density === 'auto' ? undefined : settings.density}
		>
			<WindowScope {controller}>
				<div class="frame">
					<HeaderBar title="oito2_uikit">
						{#snippet end()}
							<ThemeActions {settings} />
							{#if settings.compact}
								<IconButton
									icon={Settings as IconComponent}
									label="Settings"
									onclick={() => (settingsOpen = true)}
								/>
							{/if}
						{/snippet}
					</HeaderBar>
					{#if spike}
						<div class="content">{@render children()}</div>
					{:else if settings.compact}
						<div class="compact">
							<NavigationRail.Root
								value={slug ?? undefined}
								onValueChange={(next) => select(next)}
								{railStyle}
							>
								{#each showcasePages as entry (entry.slug)}
									<NavigationRail.Item
										value={entry.slug}
										label={entry.title}
										icon={entry.icon}
									/>
								{/each}
							</NavigationRail.Root>
							<div class="compact-page">
								{#if current}
									<div class="compact-header">
										<h1>{current.title}</h1>
										{@render sourceAction()}
									</div>
								{/if}
								{@render detail()}
							</div>
						</div>
					{:else}
						<MasterDetail.Root
							value={slug}
							onValueChange={select}
							defaultPaneSize={280}
							minPaneSize={175}
							class="shell"
						>
							<MasterDetail.Master>
								<MasterDetail.MasterHeader>
									<div class="search">
										<SearchField
											bind:value={query}
											placeholder="Search"
											aria-label="Search pages"
										/>
									</div>
								</MasterDetail.MasterHeader>
								<MasterDetail.List>
									{#each groups as group (group)}
										{@const entries = found.filter(
											(entry) => entry.group === group
										)}
										{#if entries.length > 0}
											<li class="group">{group}</li>
											{#each entries as entry (entry.slug)}
												<MasterDetail.Tile
													value={entry.slug}
													title={entry.title}
												>
													{#snippet leading()}<entry.icon
															aria-hidden="true"
														/>{/snippet}
												</MasterDetail.Tile>
											{/each}
										{/if}
									{/each}
									{#snippet empty()}<p class="none">
											No page matches “{query}”.
										</p>{/snippet}
								</MasterDetail.List>
								<MasterDetail.MasterFooter>
									<div class="footer">
										<Button
											variant="text"
											icon={Settings as IconComponent}
											onclick={() => (settingsOpen = true)}>Settings</Button
										>
									</div>
								</MasterDetail.MasterFooter>
							</MasterDetail.Master>
							<MasterDetail.Detail>
								<MasterDetail.DetailHeader
									title={current?.title ?? 'oito2_uikit'}
									level={1}
								>
									{#snippet actions()}{@render sourceAction()}{/snippet}
								</MasterDetail.DetailHeader>
								{@render detail()}
							</MasterDetail.Detail>
						</MasterDetail.Root>
					{/if}
				</div>
				<SettingsDialog {settings} bind:open={settingsOpen} {tauri} />
				{#if current}<SourceDialog page={current} bind:open={sourceOpen} />{/if}
				<Toaster placement="bottom-end" />
				<WindowResizeHandles controller={native} />
			</WindowScope>
		</ThemeProvider>
	</LocaleProvider>
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

	/* The title bar stays at the top; the shell fills the rest of the window. */
	.frame {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.frame > :global(.shell),
	.compact {
		flex: 1;
		min-height: 0;
	}

	/* Hides the horizontal overflow of the page transition's slide. */
	.content {
		flex: 1;
		min-height: 0;
		overflow: auto;
		overflow-x: hidden;
	}

	.page {
		min-width: 0;
	}

	.content:focus-visible {
		outline: 2px solid var(--oito2-color-primary-text);
		outline-offset: -2px;
	}

	.search {
		padding: var(--oito2-space-sm);
	}

	.group {
		padding: var(--oito2-space-sm) var(--oito2-space-sm) var(--oito2-space-xxs);
		color: var(--oito2-color-on-surface-variant);
		font: var(--oito2-type-label-medium);
		letter-spacing: var(--oito2-type-label-medium-tracking);
		list-style: none;
	}

	.none {
		margin: 0;
		padding: var(--oito2-space-md);
		color: var(--oito2-color-on-surface-variant);
	}

	.footer {
		padding: var(--oito2-space-xs) var(--oito2-space-sm);
	}

	.compact {
		display: flex;
	}

	.compact-page {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 0;
	}

	.compact-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--oito2-space-sm) var(--oito2-space-xl) 0;
	}

	.compact-header h1 {
		margin: 0;
		font: var(--oito2-type-title-large);
	}
</style>
