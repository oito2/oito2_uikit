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

<!-- Test helper: the main controls of @oito2/ui under a preset theme, for goldens and axe. -->
<script lang="ts">
	import '@oito2/ui/styles.css';
	import {
		Button,
		Card,
		CheckButton,
		Checkbox,
		Chip,
		Field,
		LinearProgress,
		ListTile,
		Slider,
		Switch,
		SwitchListTile,
		TextField,
		ThemeProvider,
		type ColorTheme
	} from '@oito2/ui';

	let { theme }: { theme: ColorTheme } = $props();
</script>

<ThemeProvider mode={theme.brightness} light={theme} dark={theme} data-testid="gallery">
	<main class="gallery">
		<div class="row">
			<Button>Filled</Button>
			<Button variant="tonal">Tonal</Button>
			<Button variant="outlined">Outlined</Button>
			<Button variant="text">Text</Button>
			<Button disabled>Disabled</Button>
		</div>
		<div class="row">
			<Checkbox aria-label="Off" />
			<Checkbox aria-label="On" defaultChecked />
			<Switch aria-label="Switch off" />
			<Switch aria-label="Switch on" defaultChecked />
			<CheckButton title="Check button" defaultChecked />
			<Chip variant="filter" defaultSelected>Filter</Chip>
			<Chip>Assist</Chip>
		</div>
		<div class="columns">
			<Field.Root>
				<Field.Label>Name</Field.Label>
				<TextField value="Ana" />
				<Field.Helper>Helper text</Field.Helper>
			</Field.Root>
			<div class="stack">
				<Slider label="Volume" defaultValue={0.4} />
				<LinearProgress value={0.6} label="Download" />
			</div>
		</div>
		<div class="columns">
			<Card.Root>
				<Card.Header title="Card" description="Description" />
				<Card.Footer><Button>Save</Button></Card.Footer>
			</Card.Root>
			<div>
				<ListTile title="Selected" selected onclick={() => {}} />
				<SwitchListTile title="Switch tile" defaultChecked />
			</div>
		</div>
	</main>
</ThemeProvider>

<style>
	.gallery {
		display: grid;
		gap: 16px;
		width: 640px;
		padding: 16px;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}

	.columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.stack {
		display: grid;
		gap: 16px;
	}
</style>
