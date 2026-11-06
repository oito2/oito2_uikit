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

<!-- Test helper: sliders, entries, text fields, a calendar and a chip bar, one at a time. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import LocaleProvider from '../lib/l10n/LocaleProvider.svelte';
	import Calendar from '../lib/components/calendar/Calendar.svelte';
	import * as ChoiceChipBar from '../lib/components/choice/choice-chip-bar/index.js';
	import DateEntry from '../lib/components/entries/DateEntry.svelte';
	import NumberEntry from '../lib/components/entries/NumberEntry.svelte';
	import SegmentedEntry from '../lib/components/entries/SegmentedEntry.svelte';
	import Slider from '../lib/components/slider/Slider.svelte';
	import EditableLabel from '../lib/components/text/EditableLabel.svelte';
	import PinEntry from '../lib/components/text/PinEntry.svelte';
	import TagsField from '../lib/components/text/TagsField.svelte';

	interface Props {
		show:
			| 'slider'
			| 'number'
			| 'date'
			| 'calendar'
			| 'segmented'
			| 'tags'
			| 'label'
			| 'pin'
			| 'chips';
		/** The slider's value. */
		value?: number;
		/** The segmented entry's value. */
		segments?: readonly string[];
		/** The pin entry's value. */
		pin?: string;
		disabled?: boolean;
		locale?: string;
		/** The number of chips in the chip bar. */
		chips?: number;
		/** What the components report, in order. */
		log?: string[];
	}

	let {
		show,
		value = $bindable(0),
		segments = $bindable([]),
		pin = $bindable(''),
		disabled = false,
		locale = 'en',
		chips = 1,
		log = []
	}: Props = $props();
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue">
	<LocaleProvider {locale}>
		{#if show === 'slider'}
			<Slider
				bind:value={value as number}
				{disabled}
				label="Level"
				onValueCommit={(next) => log.push(`commit ${String(next)}`)}
			/>
		{:else if show === 'number'}
			<form
				onsubmit={(event) => {
					event.preventDefault();
					log.push('submit');
				}}
			>
				<NumberEntry aria-label="Amount" defaultValue={1} />
				<button type="submit">Send</button>
			</form>
		{:else if show === 'date'}
			<DateEntry aria-label="Due" value={new Date(2026, 1, 3)} />
		{:else if show === 'calendar'}
			<Calendar defaultValue={new Date(2026, 2, 10)} min={new Date(2026, 1, 1)} />
		{:else if show === 'segmented'}
			<SegmentedEntry
				aria-label="Address"
				bind:value={segments}
				segments={[{ length: 3 }, { length: 3 }, { length: 3 }, { length: 3 }]}
			/>
		{:else if show === 'tags'}
			<TagsField label="Tags" defaultValue={['red', 'green']} {disabled} />
		{:else if show === 'label'}
			<EditableLabel text="Name" onSubmit={(text) => log.push(text)} />
		{:else if show === 'pin'}
			<PinEntry bind:value={pin} length={4} />
		{:else}
			<div style="width: 240px">
				<ChoiceChipBar.Root aria-label="Filters">
					{#each { length: chips }, index (index)}
						<ChoiceChipBar.Item value="chip-{index}">Chip {index}</ChoiceChipBar.Item>
					{/each}
				</ChoiceChipBar.Root>
			</div>
		{/if}
	</LocaleProvider>
</ThemeProvider>
