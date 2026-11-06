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

<!-- Test helper: built-in strings replaced through LocaleProvider, and form controls. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import LocaleProvider from '../lib/l10n/LocaleProvider.svelte';
	import { en } from '../lib/l10n/en.js';
	import CloseButton from '../lib/components/button/CloseButton.svelte';
	import DateEntry from '../lib/components/entries/DateEntry.svelte';
	import Checkbox from '../lib/components/toggles/Checkbox.svelte';
	import Switch from '../lib/components/toggles/Switch.svelte';
	import Slider from '../lib/components/slider/Slider.svelte';

	interface Props {
		show: 'strings' | 'form';
		disabled?: boolean;
	}

	let { show, disabled = false }: Props = $props();

	const german = { ...en, locale: 'de', close: 'Schließen', dateHelp: 'tt.mm.jjjj' };
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue">
	{#if show === 'strings'}
		<LocaleProvider locale="de" strings={german}>
			<CloseButton />
			<DateEntry aria-label="Due" />
		</LocaleProvider>
	{:else}
		<form id="settings" data-testid="form"></form>
		<Checkbox name="news" defaultChecked {disabled} form="settings" aria-label="News" />
		<Switch name="sync" defaultChecked {disabled} form="settings" aria-label="Sync" />
		<Slider name="volume" defaultValue={40} {disabled} form="settings" label="Volume" />
	{/if}
</ThemeProvider>
