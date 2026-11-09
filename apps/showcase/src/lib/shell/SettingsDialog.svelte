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

<!-- The showcase settings: compact layout, reading direction, language, control size and, in the browser build, the simulated desktop. -->
<script lang="ts">
	import { Dialog, Field, ListCollection, Select, SwitchListTile } from '@oito2/ui';
	import type {
		ShowcaseDensity,
		ShowcaseLanguage,
		ShowcaseSettings,
		SimulatedDesktop
	} from '../showcase-settings.svelte.js';

	interface Props {
		settings: ShowcaseSettings;
		open: boolean;
		/** Whether the showcase runs in Tauri, where the real desktop is used. */
		tauri: boolean;
	}

	let { settings, open = $bindable(), tauri }: Props = $props();

	interface Choice<T extends string> {
		value: T;
		label: string;
	}

	const options = <T extends string>(choices: Choice<T>[]) =>
		new ListCollection(choices, {
			getValue: (choice) => choice.value,
			getLabel: (choice) => choice.label
		});

	const languages = options<ShowcaseLanguage>([
		{ value: 'system', label: 'System' },
		{ value: 'en', label: 'English' },
		{ value: 'pt-BR', label: 'Português (Brasil)' }
	]);
	const densities = options<ShowcaseDensity>([
		{ value: 'auto', label: 'Automatic' },
		{ value: 'pointer', label: 'Desktop' },
		{ value: 'touch', label: 'Touch' }
	]);
	const desktops = options<SimulatedDesktop>([
		{ value: 'system', label: 'Browser' },
		{ value: 'gnome', label: 'GNOME' },
		{ value: 'kde', label: 'KDE Plasma' },
		{ value: 'xfce', label: 'Xfce' },
		{ value: 'cosmic', label: 'COSMIC' },
		{ value: 'windows', label: 'Windows' },
		{ value: 'macos', label: 'macOS' }
	]);
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="showcase-settings">
		<Dialog.TitleBar>Settings</Dialog.TitleBar>
		<SwitchListTile
			title="Compact layout"
			subtitle="A navigation rail instead of the list"
			bind:checked={settings.compact}
		/>
		<SwitchListTile
			title="Right to left"
			subtitle="Lays the components out for right-to-left text"
			bind:checked={settings.rtl}
		/>
		<!-- Each select is the control of a field, so its label names it. -->
		<Field.Root class="showcase-settings-field">
			<Field.Label>Language</Field.Label>
			<Select.Root
				collection={languages}
				value={settings.language}
				onValueChange={(value) => {
					if (value) settings.language = value as ShowcaseLanguage;
				}}
			/>
		</Field.Root>
		<Field.Root class="showcase-settings-field">
			<Field.Label>Control size</Field.Label>
			<Select.Root
				collection={densities}
				value={settings.density}
				onValueChange={(value) => {
					if (value) settings.density = value as ShowcaseDensity;
				}}
			/>
		</Field.Root>
		{#if !tauri}
			<Field.Root class="showcase-settings-field">
				<Field.Label>Desktop</Field.Label>
				<Select.Root
					collection={desktops}
					value={settings.desktop}
					onValueChange={(value) => {
						if (value) settings.desktop = value as SimulatedDesktop;
					}}
				/>
			</Field.Root>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<style>
	:global(.showcase-settings) {
		width: min(440px, 100%);
	}

	/* The label and the select share a row, unlike a field's default column. */
	:global(.showcase-settings-field) {
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: var(--oito2-space-md);
		padding: 0 var(--oito2-space-md);
	}
</style>
