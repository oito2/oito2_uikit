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

<!-- The appearance actions of the title bar: light, dark or system mode, the scheme and accent, and high contrast. -->
<script lang="ts">
	import Contrast from '@lucide/svelte/icons/contrast';
	import Monitor from '@lucide/svelte/icons/monitor';
	import Moon from '@lucide/svelte/icons/moon';
	import Palette from '@lucide/svelte/icons/palette';
	import Sun from '@lucide/svelte/icons/sun';
	import {
		IconButton,
		Menu,
		accentColors,
		type AccentColor,
		type IconComponent
	} from '@oito2/ui';
	import { themePresetNames, themePresets } from '@oito2/ui-themes';
	import {
		isAccentColor,
		isThemePreset,
		type ShowcaseSettings
	} from '../showcase-settings.svelte.js';

	let { settings }: { settings: ShowcaseSettings } = $props();

	const accents = Object.keys(accentColors) as AccentColor[];
	const modes = ['system', 'light', 'dark'] as const;
	const modeIcons = { system: Monitor, light: Sun, dark: Moon } as Record<string, IconComponent>;
	const modeLabels = { system: 'System', light: 'Light', dark: 'Dark' };

	let schemeValue = $derived(
		settings.scheme === 'base' ? `accent:${settings.accent}` : `preset:${settings.scheme}`
	);
	let highContrast = $derived(settings.highContrast === true);
</script>

<IconButton
	icon={modeIcons[settings.mode]}
	label="Theme mode: {modeLabels[settings.mode]}"
	disabled={settings.scheme !== 'base'}
	onclick={() =>
		(settings.mode = modes[(modes.indexOf(settings.mode) + 1) % modes.length] ?? 'system')}
/>
<Menu.Root>
	<Menu.Trigger>
		{#snippet child({ props })}
			<IconButton {...props} icon={Palette as IconComponent} label="Color scheme" />
		{/snippet}
	</Menu.Trigger>
	<Menu.Content class="showcase-schemes">
		<Menu.RadioGroup
			value={schemeValue}
			onValueChange={(value) => {
				// A value is `accent:<color>` or `preset:<name>`; anything else is ignored.
				const at = value.indexOf(':');
				const kind = value.slice(0, at);
				const name = value.slice(at + 1);
				if (kind === 'accent' && (name === 'system' || isAccentColor(name))) {
					settings.scheme = 'base';
					settings.accent = name;
				} else if (kind === 'preset' && isThemePreset(name)) {
					settings.scheme = name;
				}
			}}
		>
			<Menu.Label>oito2 accent</Menu.Label>
			<Menu.RadioItem value="accent:system">System</Menu.RadioItem>
			{#each accents as accent (accent)}
				<Menu.RadioItem value="accent:{accent}">
					<span class="swatch" style:background={accentColors[accent]}></span>
					{accent[0]?.toUpperCase()}{accent.slice(1)}
				</Menu.RadioItem>
			{/each}
			<Menu.Separator />
			<Menu.Label>Presets</Menu.Label>
			{#each themePresetNames as name (name)}
				<Menu.RadioItem value="preset:{name}">{themePresets[name].label}</Menu.RadioItem>
			{/each}
		</Menu.RadioGroup>
	</Menu.Content>
</Menu.Root>
<IconButton
	icon={Contrast as IconComponent}
	label="High contrast"
	selected={highContrast}
	onclick={() => (settings.highContrast = !highContrast)}
/>

<style>
	:global(.showcase-schemes) {
		max-height: 70vh;
	}

	.swatch {
		display: inline-block;
		width: 12px;
		height: 12px;
		margin-inline-end: var(--oito2-space-xs);
		border-radius: 50%;
		vertical-align: -1px;
	}
</style>
