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

<!-- Test helper: toggles, labeled toggles, list tiles and sliders with bindable state. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import Checkbox from '../lib/components/toggles/Checkbox.svelte';
	import CheckButton from '../lib/components/toggles/CheckButton.svelte';
	import CheckboxListTile from '../lib/components/toggles/CheckboxListTile.svelte';
	import RadioButton from '../lib/components/toggles/RadioButton.svelte';
	import * as RadioGroup from '../lib/components/toggles/radio-group/index.js';
	import Switch from '../lib/components/toggles/Switch.svelte';
	import SwitchListTile from '../lib/components/toggles/SwitchListTile.svelte';
	import Slider from '../lib/components/slider/Slider.svelte';
	import type { CheckedState } from '../lib/components/toggles/toggle-state.js';

	interface Props {
		checked?: CheckedState;
		tristate?: boolean;
		on?: boolean;
		radio?: string | null;
		row?: CheckedState;
		tile?: boolean;
		volume?: number;
		range?: [number, number];
	}

	let {
		checked = $bindable(false),
		tristate = false,
		on = $bindable(false),
		radio = $bindable('b'),
		row = $bindable(false),
		tile = $bindable(false),
		volume = $bindable(0.5),
		range = $bindable([20, 60])
	}: Props = $props();
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue">
	<form data-testid="form">
		<Checkbox aria-label="Box" bind:checked {tristate} name="box" />
		<Switch aria-label="Power" bind:checked={on} />
		<RadioGroup.Root bind:value={radio} aria-label="Letters" name="letter">
			<RadioGroup.Item value="a" aria-label="A" />
			<RadioGroup.Item value="b" aria-label="B" />
			<RadioGroup.Item value="c" aria-label="C" disabled />
			<RadioButton value="d" title="D" />
		</RadioGroup.Root>
		<CheckButton title="Row" bind:checked={row} />
		<CheckboxListTile title="Tile box" />
		<SwitchListTile title="Tile switch" bind:checked={tile} />
		<Slider label="Volume" bind:value={volume} />
		<Slider min={0} max={100} divisions={10} bind:value={range} thumbLabels={['From', 'To']} />
	</form>
</ThemeProvider>
