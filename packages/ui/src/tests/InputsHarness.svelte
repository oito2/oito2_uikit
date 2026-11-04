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

<!-- Test helper: the controls and entries of phase F8 with bindable state. -->
<script lang="ts">
	import Bold from '@lucide/svelte/icons/bold';
	import Italic from '@lucide/svelte/icons/italic';
	import '../lib/styles/styles.css';
	import { ListCollection } from '../lib/collections/list-collection.js';
	import LocaleProvider from '../lib/l10n/LocaleProvider.svelte';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import type { IconComponent } from '../lib/components/icon.js';
	import * as ToggleGroup from '../lib/components/choice/toggle-group/index.js';
	import * as SegmentGroup from '../lib/components/choice/segment-group/index.js';
	import * as ChoiceChipBar from '../lib/components/choice/choice-chip-bar/index.js';
	import * as Combobox from '../lib/components/combobox/combobox/index.js';
	import SearchField from '../lib/components/text/SearchField.svelte';
	import PasswordField from '../lib/components/text/PasswordField.svelte';
	import EditableLabel from '../lib/components/text/EditableLabel.svelte';
	import PinEntry from '../lib/components/text/PinEntry.svelte';
	import TagsField from '../lib/components/text/TagsField.svelte';
	import DateEntry from '../lib/components/entries/DateEntry.svelte';
	import TimeEntry from '../lib/components/entries/TimeEntry.svelte';
	import SegmentedEntry from '../lib/components/entries/SegmentedEntry.svelte';
	import NumberEntry from '../lib/components/entries/NumberEntry.svelte';
	import Rating from '../lib/components/rating/Rating.svelte';
	import AngleSlider from '../lib/components/rating/AngleSlider.svelte';
	import type { TimeOfDay } from '../lib/components/entries/date-time.js';

	interface Props {
		locale?: string;
		toggles?: readonly string[];
		multiple?: boolean;
		segment?: string | null;
		chips?: readonly string[];
		search?: string;
		escapes?: number;
		password?: string;
		label?: string;
		pin?: string;
		onComplete?: (code: string) => void;
		tags?: readonly string[];
		date?: Date | null;
		onDateError?: (error: string | null) => void;
		time?: TimeOfDay | null;
		ip?: readonly string[];
		amount?: number;
		stars?: number;
		angle?: number;
		fruit?: string;
		onPick?: (item: string) => void;
	}

	let {
		locale = 'en',
		toggles = $bindable([]),
		multiple = false,
		segment = $bindable('day'),
		chips = $bindable([]),
		search = $bindable(''),
		escapes = $bindable(0),
		password = $bindable(''),
		label = $bindable('Report'),
		pin = $bindable(''),
		onComplete,
		tags = $bindable([]),
		date = $bindable(null),
		onDateError,
		time = $bindable(null),
		ip = $bindable([]),
		amount = $bindable(5),
		stars = $bindable(0),
		angle = $bindable(0),
		fruit = $bindable(''),
		onPick
	}: Props = $props();

	const fruits = new ListCollection(['Apple', 'Apricot', 'Banana', 'Cherry']);
	const colors = new ListCollection(['red', 'green', 'blue']);
</script>

<LocaleProvider {locale}>
	<ThemeProvider mode="light" highContrast={false} accent="blue">
		<div class="harness">
			<ToggleGroup.Root bind:value={toggles} {multiple} aria-label="Format">
				<ToggleGroup.Item value="bold" icon={Bold as IconComponent} label="Bold" />
				<ToggleGroup.Item value="italic" icon={Italic as IconComponent} label="Italic" />
				<ToggleGroup.Item value="code" disabled>Code</ToggleGroup.Item>
				<ToggleGroup.Item value="link">Link</ToggleGroup.Item>
			</ToggleGroup.Root>
			<SegmentGroup.Root bind:value={segment} aria-label="Range">
				<SegmentGroup.Item value="day">Day</SegmentGroup.Item>
				<SegmentGroup.Item value="week">Week</SegmentGroup.Item>
				<SegmentGroup.Item value="month">Month</SegmentGroup.Item>
			</SegmentGroup.Root>
			<ChoiceChipBar.Root bind:value={chips} multiple aria-label="Filters" layout="wrap">
				<ChoiceChipBar.Item value="new">New</ChoiceChipBar.Item>
				<ChoiceChipBar.Item value="open">Open</ChoiceChipBar.Item>
			</ChoiceChipBar.Root>
			<SearchField bind:value={search} onEscape={() => (escapes += 1)} />
			<PasswordField bind:value={password} aria-label="Password" />
			<EditableLabel text={label} onSubmit={(next) => (label = next)} />
			<PinEntry bind:value={pin} length={4} {onComplete} />
			<TagsField bind:value={tags} label="Tags" suggestions={colors} />
			<DateEntry
				bind:value={date}
				onErrorChange={onDateError}
				min={new Date(2020, 0, 1)}
				max={new Date(2030, 11, 31)}
				aria-label="Date"
			/>
			<TimeEntry bind:value={time} aria-label="Time" />
			<SegmentedEntry
				bind:value={ip}
				segments={[{ length: 3 }, { length: 3 }, { length: 3 }, { length: 3 }]}
				aria-label="Address"
			/>
			<NumberEntry bind:value={amount} min={0} max={10} aria-label="Amount" />
			<Rating bind:value={stars} allowHalf aria-label="Stars" />
			<AngleSlider bind:value={angle} step={15} aria-label="Angle" />
			<Combobox.Root
				collection={fruits}
				bind:inputValue={fruit}
				onSelect={onPick}
				label="Fruit"
			/>
		</div>
	</ThemeProvider>
</LocaleProvider>

<style>
	.harness {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 8px;
		width: 420px;
		padding: 8px;
	}
</style>
