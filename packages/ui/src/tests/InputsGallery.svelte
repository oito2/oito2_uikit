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

<!-- Test helper: the controls and entries of phase F8 at rest, for axe and goldens. -->
<script lang="ts">
	import AlignCenter from '@lucide/svelte/icons/align-center';
	import AlignLeft from '@lucide/svelte/icons/align-left';
	import Bold from '@lucide/svelte/icons/bold';
	import Heart from '@lucide/svelte/icons/heart';
	import Plus from '@lucide/svelte/icons/plus';
	import '../lib/styles/styles.css';
	import { ListCollection } from '../lib/collections/list-collection.js';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import type { IconComponent } from '../lib/components/icon.js';
	import * as Menu from '../lib/components/menu/menu/index.js';
	import ColorDisk from '../lib/components/controls/ColorDisk.svelte';
	import OptionButton from '../lib/components/controls/OptionButton.svelte';
	import SplitButton from '../lib/components/controls/SplitButton.svelte';
	import Swap from '../lib/components/controls/Swap.svelte';
	import * as ChoiceChipBar from '../lib/components/choice/choice-chip-bar/index.js';
	import * as SegmentGroup from '../lib/components/choice/segment-group/index.js';
	import * as ToggleGroup from '../lib/components/choice/toggle-group/index.js';
	import * as Combobox from '../lib/components/combobox/combobox/index.js';
	import AngleSlider from '../lib/components/rating/AngleSlider.svelte';
	import Rating from '../lib/components/rating/Rating.svelte';
	import CopyField from '../lib/components/text/CopyField.svelte';
	import EditableLabel from '../lib/components/text/EditableLabel.svelte';
	import HighlightedText from '../lib/components/text/HighlightedText.svelte';
	import PasswordField from '../lib/components/text/PasswordField.svelte';
	import PinEntry from '../lib/components/text/PinEntry.svelte';
	import SearchField from '../lib/components/text/SearchField.svelte';
	import TagsField from '../lib/components/text/TagsField.svelte';
	import DateEntry from '../lib/components/entries/DateEntry.svelte';
	import NumberEntry from '../lib/components/entries/NumberEntry.svelte';
	import SegmentedEntry from '../lib/components/entries/SegmentedEntry.svelte';
	import TimeEntry from '../lib/components/entries/TimeEntry.svelte';
	import type { ColorTheme } from '../lib/theme/color-theme.js';

	interface Props {
		mode?: 'light' | 'dark';
		highContrast?: boolean;
		theme?: ColorTheme;
	}

	let { mode = 'light', highContrast = false, theme }: Props = $props();

	const fruits = new ListCollection(['Apple', 'Banana']);
	const disks = ['#3584e4', '#2190a4', '#3a944a', '#c88800', '#ed5b00', '#e62d42', '#fafafa'];
	const icon = (component: unknown) => component as IconComponent;
</script>

<ThemeProvider {mode} {highContrast} accent="blue" light={theme} dark={theme} data-testid="gallery">
	<main class="gallery">
		<div class="row">
			<SplitButton menu={menuItems}>Save</SplitButton>
			<SplitButton variant="filled" menu={menuItems}>Send</SplitButton>
			<SplitButton variant="outlined" menu={menuItems}>Export</SplitButton>
			<OptionButton icon={icon(Plus)} label="Add" />
			<OptionButton color="#e62d42" label="Red" />
			<Swap swapped={false}>
				{#snippet off()}<Heart size={20} aria-hidden="true" />{/snippet}
				{#snippet on()}<Plus size={20} aria-hidden="true" />{/snippet}
			</Swap>
		</div>
		<div class="row">
			{#each disks as color, index (color)}
				<ColorDisk {color} label="Color {index + 1}" selected={index === 0} />
			{/each}
		</div>
		<div class="row">
			<ToggleGroup.Root defaultValue={['bold']} multiple aria-label="Format">
				<ToggleGroup.Item value="bold" icon={icon(Bold)} label="Bold" />
				<ToggleGroup.Item value="left" icon={icon(AlignLeft)} label="Left" />
				<ToggleGroup.Item value="center" icon={icon(AlignCenter)} label="Center" />
			</ToggleGroup.Root>
			<SegmentGroup.Root defaultValue="week" aria-label="Range">
				<SegmentGroup.Item value="day">Day</SegmentGroup.Item>
				<SegmentGroup.Item value="week">Week</SegmentGroup.Item>
				<SegmentGroup.Item value="month">Month</SegmentGroup.Item>
			</SegmentGroup.Root>
		</div>
		<ChoiceChipBar.Root defaultValue={['open']} multiple layout="wrap" aria-label="Filters">
			<ChoiceChipBar.Item value="new">New</ChoiceChipBar.Item>
			<ChoiceChipBar.Item value="open">Open</ChoiceChipBar.Item>
			<ChoiceChipBar.Item value="closed">Closed</ChoiceChipBar.Item>
		</ChoiceChipBar.Root>
		<div class="grid">
			<SearchField value="report" aria-label="Search" />
			<PasswordField value="secret" aria-label="Password" />
			<CopyField value="https://example.com/share" aria-label="Link" />
			<Combobox.Root collection={fruits} label="Fruit" defaultValue="Apple" />
			<TagsField value={['red', 'green']} label="Tags" clearable />
			<TagsField value={['draft']} label="Labels" variant="subtle" />
			<DateEntry value={new Date(2026, 1, 3)} aria-label="Date" />
			<TimeEntry value={{ hour: 21, minute: 30 }} aria-label="Time" />
			<NumberEntry value={42} aria-label="Amount" />
			<SegmentedEntry
				value={['192', '168', '0', '1']}
				segments={[{ length: 3 }, { length: 3 }, { length: 3 }, { length: 3 }]}
				aria-label="Address"
			/>
		</div>
		<div class="row">
			<PinEntry value="12" length={4} />
			<Rating value={3.5} allowHalf aria-label="Stars" />
			<Rating value={2} readonly />
			<AngleSlider value={45} size={72} aria-label="Angle" />
			<EditableLabel text="Rename me" onSubmit={() => {}} />
			<HighlightedText text="Configurações de ação" query="acao" />
		</div>
	</main>
</ThemeProvider>

{#snippet menuItems()}
	<Menu.Item>Save as…</Menu.Item>
	<Menu.Item>Save a copy</Menu.Item>
{/snippet}

<style>
	.gallery {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 800px;
		padding: 16px;
		background: var(--oito2-color-background);
		color: var(--oito2-color-on-surface);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
</style>
