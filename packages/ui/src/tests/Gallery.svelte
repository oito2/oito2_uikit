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

<!-- Test helper: every control of phase F4 at rest, inside a ThemeProvider, for axe and goldens. -->
<script lang="ts">
	import Plus from '@lucide/svelte/icons/plus';
	import Settings from '@lucide/svelte/icons/settings';
	import '../lib/styles/styles.css';
	import BackButton from '../lib/components/button/BackButton.svelte';
	import Button from '../lib/components/button/Button.svelte';
	import CloseButton from '../lib/components/button/CloseButton.svelte';
	import Fab from '../lib/components/button/Fab.svelte';
	import IconButton from '../lib/components/button/IconButton.svelte';
	import * as Field from '../lib/components/field/field/index.js';
	import TextField from '../lib/components/field/TextField.svelte';
	import ListTile from '../lib/components/list/ListTile.svelte';
	import CircularProgress from '../lib/components/progress/CircularProgress.svelte';
	import LinearProgress from '../lib/components/progress/LinearProgress.svelte';
	import * as Select from '../lib/components/select/select/index.js';
	import Slider from '../lib/components/slider/Slider.svelte';
	import Badge from '../lib/components/surfaces/Badge.svelte';
	import * as Card from '../lib/components/surfaces/card/index.js';
	import Chip from '../lib/components/surfaces/Chip.svelte';
	import Separator from '../lib/components/surfaces/Separator.svelte';
	import Checkbox from '../lib/components/toggles/Checkbox.svelte';
	import CheckButton from '../lib/components/toggles/CheckButton.svelte';
	import * as RadioGroup from '../lib/components/toggles/radio-group/index.js';
	import Switch from '../lib/components/toggles/Switch.svelte';
	import SwitchListTile from '../lib/components/toggles/SwitchListTile.svelte';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import type { ColorTheme } from '../lib/theme/color-theme.js';
	import { ListCollection } from '../lib/collections/list-collection.js';

	interface Props {
		mode?: 'light' | 'dark';
		highContrast?: boolean;
		theme?: ColorTheme;
	}

	let { mode = 'light', highContrast = false, theme }: Props = $props();

	const variants = ['filled', 'tonal', 'outlined', 'text', 'elevated'] as const;
	const fruits = new ListCollection(['Apple', 'Cherry']);
</script>

<ThemeProvider {mode} {highContrast} accent="blue" light={theme} dark={theme} data-testid="gallery">
	<main class="gallery">
		<div class="row">
			{#each variants as variant (variant)}<Button {variant}>{variant}</Button>{/each}
		</div>
		<div class="row">
			<Button icon={Plus}>Add</Button>
			<Button disabled>Disabled</Button>
			<IconButton icon={Settings} label="Settings" />
			<IconButton icon={Settings} label="Selected" selected />
			<BackButton />
			<CloseButton />
			<Badge content={4}><IconButton icon={Settings} label="Alerts" /></Badge>
			<Fab icon={Plus} label="New" size="small" />
		</div>
		<div class="row">
			<Checkbox aria-label="Off" />
			<Checkbox aria-label="On" defaultChecked />
			<Checkbox aria-label="Mixed" defaultChecked="mixed" />
			<Switch aria-label="Switch off" />
			<Switch aria-label="Switch on" defaultChecked />
			<Switch aria-label="Shapes" onOffShapes defaultChecked />
			<RadioGroup.Root defaultValue="a" orientation="horizontal" aria-label="Radios">
				<RadioGroup.Item value="a" aria-label="A" />
				<RadioGroup.Item value="b" aria-label="B" />
			</RadioGroup.Root>
			<CheckButton title="Check button" defaultChecked />
		</div>
		<div class="row">
			<Chip>Assist</Chip>
			<Chip variant="filter" defaultSelected>Filter</Chip>
			<Chip variant="input" onRemove={() => {}}>Input</Chip>
			<CircularProgress value={0.7} label="Progress" />
			<div class="bar"><LinearProgress value={0.5} label="Download" /></div>
		</div>
		<div class="columns">
			<Field.Root>
				<Field.Label>Name</Field.Label>
				<TextField value="Ana" />
				<Field.Helper>Helper text</Field.Helper>
			</Field.Root>
			<Field.Root invalid>
				<Field.Label>Email</Field.Label>
				<TextField value="ana@" />
				<Field.Error>Invalid address</Field.Error>
			</Field.Root>
			<Slider label="Volume" defaultValue={0.4} />
			<div>
				<Select.Root
					collection={fruits}
					defaultValue="Cherry"
					placeholder="Fruit"
					label="Fruit"
				/>
			</div>
		</div>
		<div class="columns">
			<Card.Root>
				<Card.Header title="Card" description="Description" />
				<Card.Content>Content of the card.</Card.Content>
				<Card.Footer
					><Button variant="text">Cancel</Button><Button>Save</Button></Card.Footer
				>
			</Card.Root>
			<div>
				<ListTile title="List tile" subtitle="Subtitle" onclick={() => {}} />
				<Separator />
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
		width: 760px;
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

	.bar {
		width: 160px;
	}
</style>
