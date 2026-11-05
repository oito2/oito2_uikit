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
	import AlignCenter from '@lucide/svelte/icons/align-center';
	import AlignLeft from '@lucide/svelte/icons/align-left';
	import AlignRight from '@lucide/svelte/icons/align-right';
	import Bold from '@lucide/svelte/icons/bold';
	import Copy from '@lucide/svelte/icons/copy';
	import Check from '@lucide/svelte/icons/check';
	import Italic from '@lucide/svelte/icons/italic';
	import Plus from '@lucide/svelte/icons/plus';
	import Underline from '@lucide/svelte/icons/underline';
	import {
		AngleSlider,
		Button,
		ChoiceChipBar,
		ColorDisk,
		Combobox,
		CopyButton,
		CopyField,
		DateEntry,
		DateTimeEntry,
		EditableLabel,
		HeaderBar,
		HighlightedText,
		ListCollection,
		Menu,
		NumberEntry,
		OptionButton,
		PasswordField,
		PinEntry,
		Rating,
		SearchField,
		SearchTitleField,
		SegmentGroup,
		SegmentedEntry,
		SplitButton,
		Swap,
		TagsField,
		TimeEntry,
		ToggleGroup,
		type IconComponent,
		type TimeOfDay
	} from '@oito2/ui';

	const icon = (component: unknown) => component as IconComponent;
	const accents = [
		{ name: 'Blue', color: '#3584e4' },
		{ name: 'Teal', color: '#2190a4' },
		{ name: 'Green', color: '#3a944a' },
		{ name: 'Yellow', color: '#c88800' },
		{ name: 'Orange', color: '#ed5b00' },
		{ name: 'Red', color: '#e62d42' },
		{ name: 'Pink', color: '#d56199' },
		{ name: 'Purple', color: '#9141ac' },
		{ name: 'Slate', color: '#6f8396' }
	];
	const countries = new ListCollection([
		'Argentina',
		'Brasil',
		'Canadá',
		'Chile',
		'Colômbia',
		'Equador',
		'México',
		'Paraguai',
		'Peru',
		'Uruguai'
	]);
	const languages = new ListCollection(['svelte', 'rust', 'typescript', 'dart', 'css']);
	const filters = ['All', 'Unread', 'Starred', 'Drafts', 'Sent', 'Archived', 'Spam', 'Trash'];

	let action = $state('none');
	let accent = $state('Blue');
	let format = $state<readonly string[]>(['bold']);
	let align = $state<readonly string[]>(['left']);
	let range = $state<string | null>('week');
	let chosen = $state<readonly string[]>(['All']);
	let liked = $state(false);
	let query = $state('');
	let titleSearch = $state(false);
	let password = $state('');
	let name = $state('Quarterly report');
	let code = $state('');
	let tags = $state<readonly string[]>(['svelte', 'tauri']);
	let country = $state('');
	let date = $state<Date | null>(new Date());
	let time = $state<TimeOfDay | null>({ hour: 9, minute: 30 });
	let meeting = $state<Date | null>(null);
	let address = $state<readonly string[]>(['192', '168', '0', '1']);
	let amount = $state(12.5);
	let stars = $state(3.5);
	let angle = $state(45);
	let highlight = $state('acao config');
</script>

<main>
	<p>The advanced controls and inputs of phase F8.</p>

	<section aria-labelledby="buttons">
		<h2 id="buttons">Buttons</h2>
		<div class="row">
			<SplitButton onclick={() => (action = 'save')}>
				Save
				{#snippet menu()}
					<Menu.Item onSelect={() => (action = 'save as')}>Save as…</Menu.Item>
					<Menu.Item onSelect={() => (action = 'save a copy')}>Save a copy</Menu.Item>
				{/snippet}
			</SplitButton>
			<SplitButton variant="filled" onclick={() => (action = 'send')}>
				Send
				{#snippet menu()}
					<Menu.Item onSelect={() => (action = 'schedule')}>Schedule…</Menu.Item>
				{/snippet}
			</SplitButton>
			<OptionButton icon={icon(Plus)} label="Add" onclick={() => (action = 'add')} />
			<OptionButton color="#e62d42" label="Red" onclick={() => (action = 'red')} />
			<CopyButton text="Copied from the showcase" />
			<Button variant="text" onclick={() => (liked = !liked)}>
				<Swap swapped={liked} effect="scale">
					{#snippet off()}<Copy size={18} aria-hidden="true" />{/snippet}
					{#snippet on()}<Check size={18} aria-hidden="true" />{/snippet}
				</Swap>
				Swap
			</Button>
		</div>
		<p class="note">Last action: {action}</p>
		<div class="row" role="group" aria-label="Accent">
			{#each accents as each (each.name)}
				<ColorDisk
					color={each.color}
					label={each.name}
					selected={accent === each.name}
					onclick={() => (accent = each.name)}
				/>
			{/each}
		</div>
	</section>

	<section aria-labelledby="groups">
		<h2 id="groups">Groups</h2>
		<div class="row">
			<ToggleGroup.Root bind:value={format} multiple aria-label="Text style">
				<ToggleGroup.Item value="bold" icon={icon(Bold)} label="Bold" />
				<ToggleGroup.Item value="italic" icon={icon(Italic)} label="Italic" />
				<ToggleGroup.Item value="underline" icon={icon(Underline)} label="Underline" />
			</ToggleGroup.Root>
			<ToggleGroup.Root bind:value={align} deselectable={false} aria-label="Alignment">
				<ToggleGroup.Item value="left" icon={icon(AlignLeft)} label="Left" />
				<ToggleGroup.Item value="center" icon={icon(AlignCenter)} label="Center" />
				<ToggleGroup.Item value="right" icon={icon(AlignRight)} label="Right" />
			</ToggleGroup.Root>
			<SegmentGroup.Root bind:value={range} aria-label="Range">
				<SegmentGroup.Item value="day">Day</SegmentGroup.Item>
				<SegmentGroup.Item value="week">Week</SegmentGroup.Item>
				<SegmentGroup.Item value="month">Month</SegmentGroup.Item>
			</SegmentGroup.Root>
		</div>
		<div class="chips">
			<ChoiceChipBar.Root bind:value={chosen} aria-label="Folders">
				{#each filters as filter (filter)}
					<ChoiceChipBar.Item value={filter}>{filter}</ChoiceChipBar.Item>
				{/each}
			</ChoiceChipBar.Root>
		</div>
	</section>

	<section aria-labelledby="text">
		<h2 id="text">Text fields</h2>
		<div class="grid">
			<SearchField bind:value={query} aria-label="Search the showcase" />
			<PasswordField bind:value={password} aria-label="Password" />
			<CopyField value="https://oito2.github.io/oito2_uikit/" aria-label="Link" />
			<CopyField value="token-1234567890" obscure aria-label="Token" />
			<TagsField
				bind:value={tags}
				label="Languages"
				suggestions={languages}
				placeholder="Add a language"
				clearable
			/>
			<Combobox.Root
				collection={countries}
				bind:inputValue={country}
				label="Country"
				placeholder="Type a country"
			/>
		</div>
		<HeaderBar>
			{#snippet title()}
				<SearchTitleField
					title="Documents"
					bind:searchActive={titleSearch}
					placeholder="Search documents"
				/>
			{/snippet}
		</HeaderBar>
		<div class="row">
			<EditableLabel text={name} onSubmit={(next) => (name = next)} />
			<span class="note">Double click, Enter or F2 to rename.</span>
		</div>
		<div class="row">
			<PinEntry bind:value={code} length={6} />
			<span class="note">Code: {code || '(empty)'}</span>
		</div>
		<label class="row">
			Highlight
			<input class="plain" bind:value={highlight} />
		</label>
		<HighlightedText text="Configurações de ação e configuração de acesso" query={highlight} />
	</section>

	<section aria-labelledby="entries">
		<h2 id="entries">Entries</h2>
		<div class="grid">
			<DateEntry bind:value={date} aria-label="Date" />
			<TimeEntry bind:value={time} aria-label="Time" />
			<DateTimeEntry bind:value={meeting} />
			<SegmentedEntry
				bind:value={address}
				segments={[{ length: 3 }, { length: 3 }, { length: 3 }, { length: 3 }]}
				aria-label="IP address"
			/>
			<NumberEntry
				bind:value={amount}
				min={0}
				max={100}
				step={0.5}
				decimals={1}
				aria-label="Amount"
			/>
		</div>
		<p class="note">
			Date: {date?.toLocaleDateString() ?? 'none'} · Time: {time
				? `${time.hour}:${String(time.minute).padStart(2, '0')}`
				: 'none'} · Meeting: {meeting?.toLocaleString() ?? 'none'} · Address: {address.join(
				'.'
			)} · Amount: {amount}
		</p>
	</section>

	<section aria-labelledby="pickers">
		<h2 id="pickers">Rating and angle</h2>
		<div class="row">
			<Rating bind:value={stars} allowHalf aria-label="Rating" />
			<span class="note">{stars}</span>
			<AngleSlider bind:value={angle} step={5} aria-label="Rotation" />
		</div>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--oito2-space-xl);
		padding: var(--oito2-space-xl);
	}

	h2,
	p {
		margin: 0 0 var(--oito2-space-sm);
	}

	section {
		display: grid;
		gap: var(--oito2-space-md);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--oito2-space-sm);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--oito2-space-md);
	}

	.chips {
		max-width: 420px;
	}

	.note {
		color: var(--oito2-color-on-surface-variant);
		font: var(--oito2-type-body-small);
	}

	.plain {
		padding: var(--oito2-space-xs);
	}
</style>
