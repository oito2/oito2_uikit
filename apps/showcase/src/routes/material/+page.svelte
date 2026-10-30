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
	import {
		AlertDialog,
		Dialog,
		Field,
		ListCollection,
		Menu,
		ScrollArea,
		Select,
		Shortcut,
		Slider,
		TextArea,
		TextField,
		Tooltip,
		Badge,
		Button,
		Card,
		CheckButton,
		Checkbox,
		CheckboxListTile,
		Chip,
		CircularProgress,
		CloseButton,
		BackButton,
		Fab,
		IconButton,
		LinearProgress,
		ListTile,
		RadioButton,
		RadioGroup,
		RadioListTile,
		Separator,
		Switch,
		SwitchButton,
		SwitchListTile
	} from '@oito2/ui';
	import Bell from '@lucide/svelte/icons/bell';
	import Heart from '@lucide/svelte/icons/heart';
	import Plus from '@lucide/svelte/icons/plus';
	import Star from '@lucide/svelte/icons/star';
	import Settings from '@lucide/svelte/icons/settings';
	import Folder from '@lucide/svelte/icons/folder';
	import Search from '@lucide/svelte/icons/search';
	import Copy from '@lucide/svelte/icons/copy';
	import Trash from '@lucide/svelte/icons/trash-2';
	import { resolve } from '$app/paths';

	const variants = ['filled', 'tonal', 'outlined', 'text', 'elevated'] as const;
	let favorite = $state(true);
	let tags = $state(['Svelte', 'Tauri', 'Rust']);
	let email = $state('ana@');
	let volume = $state(0.4);
	let range: [number, number] = $state([20, 80]);
	let confirmOpen = $state(false);
	let lastAction = $state('none');
	let showHidden = $state(true);
	let sort = $state<string | null>('name');
	const fruits = new ListCollection(
		[
			{ id: 'apple', name: 'Apple', group: 'Pome' },
			{ id: 'pear', name: 'Pear', group: 'Pome' },
			{ id: 'cherry', name: 'Cherry', group: 'Drupe' },
			{ id: 'plum', name: 'Plum', group: 'Drupe' },
			{ id: 'banana', name: 'Banana', group: 'Berry' }
		],
		{
			getValue: (f) => f.id,
			getLabel: (f) => f.name,
			getGroup: (f) => f.group,
			isDisabled: (f) => f.id === 'banana'
		}
	);
</script>

<main>
	<h1>Material theme</h1>
	<p>
		The Material 3 primitives restyled like the oito2_ui theme, with the active scheme. The
		<a href={resolve('/colors')}>colors</a> and the
		<a href={resolve('/foundation')}>fonts and tokens</a>
		have their own pages.
	</p>

	<section aria-labelledby="buttons">
		<h2 id="buttons">Buttons</h2>
		<div class="row">
			{#each variants as variant (variant)}
				<Button {variant}>{variant}</Button>
			{/each}
		</div>
		<div class="row">
			{#each variants as variant (variant)}
				<Button {variant} icon={Plus}>With icon</Button>
			{/each}
		</div>
		<div class="row">
			{#each variants as variant (variant)}
				<Button {variant} disabled>Disabled</Button>
			{/each}
		</div>
		<div class="row">
			<IconButton icon={Settings} label="Settings" />
			<IconButton
				icon={Heart}
				label="Favorite"
				selected={favorite}
				onclick={() => (favorite = !favorite)}
			/>
			<IconButton icon={Star} label="Disabled" disabled />
			<BackButton />
			<CloseButton />
			<Badge content={3}><IconButton icon={Bell} label="Notifications" /></Badge>
			<Badge><IconButton icon={Bell} label="New notifications" /></Badge>
			<Fab icon={Plus} label="Add" />
			<Fab icon={Plus} size="small" label="Add" />
			<Fab icon={Plus}>Create</Fab>
		</div>
	</section>

	<section aria-labelledby="toggles">
		<h2 id="toggles">Toggles</h2>
		<div class="row">
			<Checkbox aria-label="Unchecked" />
			<Checkbox aria-label="Checked" defaultChecked />
			<Checkbox aria-label="Mixed" defaultChecked="mixed" tristate />
			<Checkbox aria-label="Disabled" disabled defaultChecked />
			<Switch aria-label="Off" />
			<Switch aria-label="On" defaultChecked />
			<Switch aria-label="With shapes" onOffShapes />
			<Switch aria-label="With shapes on" onOffShapes defaultChecked />
			<Switch aria-label="Disabled" disabled />
		</div>
		<div class="row">
			<RadioGroup.Root defaultValue="b" orientation="horizontal" aria-label="Plain radios">
				<RadioGroup.Item value="a" aria-label="A" />
				<RadioGroup.Item value="b" aria-label="B" />
				<RadioGroup.Item value="c" aria-label="C" disabled />
			</RadioGroup.Root>
		</div>
		<div class="columns">
			<div class="column">
				<CheckButton title="Check button" subtitle="With a subtitle" defaultChecked />
				<SwitchButton title="Switch button" />
				<RadioGroup.Root defaultValue="one" aria-label="Radio buttons">
					<RadioButton value="one" title="First option" />
					<RadioButton
						value="two"
						title="Second option"
						subtitle="Also with a subtitle"
					/>
				</RadioGroup.Root>
			</div>
			<div class="column list">
				<CheckboxListTile
					title="Check box list tile"
					subtitle="Toggles anywhere"
					defaultChecked
				/>
				<SwitchListTile title="Switch list tile" />
				<RadioGroup.Root defaultValue="x" aria-label="Radio list tiles">
					<RadioListTile value="x" title="Radio list tile" />
					<RadioListTile value="y" title="Another one" />
				</RadioGroup.Root>
			</div>
		</div>
	</section>

	<section aria-labelledby="sliders">
		<h2 id="sliders">Sliders</h2>
		<div class="columns">
			<Slider
				label="Volume"
				bind:value={volume}
				valueText={(v) => `${Math.round(v * 100)}%`}
			/>
			<Slider
				label="Price range"
				min={0}
				max={100}
				divisions={10}
				bind:value={range}
				thumbLabels={['Minimum price', 'Maximum price']}
				valueText={(v) => `$${v}`}
				showValueIndicator
				marks={[
					{ value: 0, label: '0' },
					{ value: 50, label: '50' },
					{ value: 100, label: '100' }
				]}
			/>
			<Slider label="Disabled" defaultValue={0.3} disabled />
		</div>
	</section>

	<section aria-labelledby="menus">
		<h2 id="menus">Menus and selects</h2>
		<div class="row">
			<Menu.Root>
				<Menu.Trigger>Edit</Menu.Trigger>
				<Menu.Content>
					<Menu.Item icon={Copy} onSelect={() => (lastAction = 'copy')}>
						Copy
						{#snippet shortcut()}<Menu.Shortcut
								shortcut={Shortcut.parse('Mod+C')}
							/>{/snippet}
					</Menu.Item>
					<Menu.Item inset onSelect={() => (lastAction = 'paste')}>Paste</Menu.Item>
					<Menu.Item inset disabled>Disabled</Menu.Item>
					<Menu.Separator />
					<Menu.CheckboxItem bind:checked={showHidden}
						>Show hidden files</Menu.CheckboxItem
					>
					<Menu.Group label="Sort by">
						<Menu.RadioGroup bind:value={sort}>
							<Menu.RadioItem value="name">Name</Menu.RadioItem>
							<Menu.RadioItem value="date">Date</Menu.RadioItem>
						</Menu.RadioGroup>
					</Menu.Group>
					<Menu.Separator />
					<Menu.Sub>
						<Menu.SubTrigger inset>More</Menu.SubTrigger>
						<Menu.SubContent>
							<Menu.Item onSelect={() => (lastAction = 'duplicate')}
								>Duplicate</Menu.Item
							>
							<Menu.Item icon={Trash} onSelect={() => (lastAction = 'delete')}
								>Delete</Menu.Item
							>
						</Menu.SubContent>
					</Menu.Sub>
				</Menu.Content>
			</Menu.Root>
			<span>Last action: {lastAction}</span>
		</div>
		<div class="row">
			<Select.Root collection={fruits} defaultValue="cherry" placeholder="Choose a fruit" />
			<Select.Root collection={fruits} placeholder="Choose a fruit" />
			<Select.Root collection={fruits} placeholder="Disabled" disabled />
		</div>
	</section>

	<section aria-labelledby="fields">
		<h2 id="fields">Text fields</h2>
		<div class="columns">
			<Field.Root>
				<Field.Label>Name</Field.Label>
				<TextField placeholder="Your full name" />
				<Field.Helper>As it appears on your documents.</Field.Helper>
			</Field.Root>
			<Field.Root invalid={!email.includes('.')} required>
				<Field.Label>Email</Field.Label>
				<TextField type="email" bind:value={email} />
				<Field.Helper>We never share it.</Field.Helper>
				<Field.Error>Enter a complete email address.</Field.Error>
			</Field.Root>
			<Field.Root>
				<Field.Label>Search</Field.Label>
				<TextField placeholder="Search files">
					{#snippet leading()}<Search size={20} />{/snippet}
				</TextField>
			</Field.Root>
			<Field.Root disabled>
				<Field.Label>Disabled</Field.Label>
				<TextField value="Can't change" />
			</Field.Root>
			<Field.Root>
				<Field.Label>Notes</Field.Label>
				<TextArea placeholder="Grows with its text" autoGrow maxRows={6} />
			</Field.Root>
		</div>
	</section>

	<section aria-labelledby="overlays">
		<h2 id="overlays">Dialogs and tooltips</h2>
		<div class="row">
			<Dialog.Root>
				<Dialog.Trigger variant="tonal">Open dialog</Dialog.Trigger>
				<Dialog.Content>
					<Dialog.TitleBar>Rename file</Dialog.TitleBar>
					<Dialog.Description>Choose a new name for the file.</Dialog.Description>
					<Field.Root>
						<Field.Label>Name</Field.Label>
						<TextField value="report.pdf" />
					</Field.Root>
					<Dialog.Actions>
						<Dialog.Close>Cancel</Dialog.Close>
						<Dialog.Close variant="filled">Rename</Dialog.Close>
					</Dialog.Actions>
				</Dialog.Content>
			</Dialog.Root>
			<Button variant="outlined" onclick={() => (confirmOpen = true)}>Delete file…</Button>
			<AlertDialog
				bind:open={confirmOpen}
				title="Delete the file?"
				description="It moves to the trash, where you can still restore it."
				confirmLabel="Delete"
				cancelLabel="Cancel"
				onConfirm={() => (lastAction = 'deleted')}
			/>
			<Tooltip.Root>
				<Tooltip.Trigger>
					{#snippet child({ props })}<Button variant="text" {...props}>Hover me</Button
						>{/snippet}
				</Tooltip.Trigger>
				<Tooltip.Content>Tooltips show after half a second</Tooltip.Content>
			</Tooltip.Root>
		</div>
	</section>

	<section aria-labelledby="progress">
		<h2 id="progress">Progress</h2>
		<div class="row">
			<CircularProgress value={0.6} label="Sixty percent" />
			<CircularProgress label="Loading" />
			<div class="bars">
				<LinearProgress value={0.4} label="Forty percent" />
				<LinearProgress label="Loading" />
			</div>
		</div>
	</section>

	<section aria-labelledby="containers">
		<h2 id="containers">Containers</h2>
		<div class="row">
			{#each tags as tag (tag)}
				<Chip variant="input" onRemove={() => (tags = tags.filter((t) => t !== tag))}
					>{tag}</Chip
				>
			{/each}
			<Chip variant="filter" defaultSelected>Filter on</Chip>
			<Chip variant="filter">Filter off</Chip>
			<Chip icon={Star}>Assist</Chip>
			<Chip variant="suggestion">Suggestion</Chip>
			<Chip disabled>Disabled</Chip>
		</div>
		<Card.Root style="max-width: 360px">
			<Card.Header title="Card title" description="A short description">
				{#snippet actions()}<IconButton icon={Settings} label="Card settings" />{/snippet}
			</Card.Header>
			<Card.Content
				>Cards group related content on the surface color with an outline.</Card.Content
			>
			<Card.Footer>
				<Button variant="text">Cancel</Button>
				<Button>Save</Button>
			</Card.Footer>
		</Card.Root>
		<ScrollArea class="scroll" thumbVisibility>
			{#each Array.from({ length: 20 }, (_, i) => i + 1) as n (n)}
				<p>Scrollable line {n}</p>
			{/each}
		</ScrollArea>
		<div class="list">
			<ListTile title="List tile" subtitle="With a subtitle" onclick={() => {}}>
				{#snippet leading()}<Folder size={20} />{/snippet}
			</ListTile>
			<Separator />
			<ListTile title="Selected list tile" selected onclick={() => {}} />
			<ListTile title="Disabled list tile" disabled onclick={() => {}} />
			<ListTile title="Static list tile" />
		</div>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--oito2-space-xl);
		padding: var(--oito2-space-xl);
	}

	h1,
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

	.columns {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--oito2-space-lg);
	}

	.column {
		display: grid;
		align-content: start;
		justify-items: start;
	}

	.list {
		justify-items: stretch;
		max-width: 360px;
	}

	:global(.scroll) {
		height: 160px;
		max-width: 360px;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
	}

	.bars {
		display: grid;
		gap: var(--oito2-space-md);
		width: 240px;
	}
</style>
