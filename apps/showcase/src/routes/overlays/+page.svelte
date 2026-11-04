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
	import Copy from '@lucide/svelte/icons/copy';
	import FileText from '@lucide/svelte/icons/file-text';
	import Save from '@lucide/svelte/icons/save';
	import Search from '@lucide/svelte/icons/search';
	import {
		Button,
		Calendar,
		ColorPicker,
		ColorPickerButton,
		CommandPalette,
		Commands,
		ContextMenu,
		DatePicker,
		FloatingPanel,
		HoverCard,
		KeyChord,
		Menu,
		Popover,
		Sheet,
		Shortcut,
		ShortcutLabel,
		ShortcutRecorder,
		TextField,
		Tour,
		TourController,
		openCommandPalette,
		toast,
		type Command,
		type DateRange,
		type SheetSide
	} from '@oito2/ui';

	let action = $state('none');
	let date = $state<Date | null>(new Date());
	let range = $state<DateRange | null>(null);
	let color = $state('#3584E4');
	let accent = $state('#E62D42');
	let side = $state<SheetSide>('end');
	let sheetOpen = $state(false);
	let panelOpen = $state(true);
	let shortcut = $state<Shortcut | null>(
		new Shortcut([new KeyChord('p', { primary: true, shift: true })])
	);
	const tour = new TourController([
		{
			title: 'Popovers',
			target: '#overlays-popover',
			description: 'Panels anchored to a button, for pickers and short forms.'
		},
		{
			title: 'Pickers',
			target: '#overlays-pickers',
			description: 'A calendar and a color picker.',
			placement: 'top'
		},
		{ title: 'That is all', description: 'The tour ends here.' }
	]);

	let commands: Command[] = $derived([
		{
			id: 'save',
			label: 'Save document',
			group: 'File',
			icon: Save,
			shortcut: new Shortcut([new KeyChord('s', { primary: true })]),
			onInvoke: () => toast({ title: 'Saved', type: 'success' })
		},
		{
			id: 'copy',
			label: 'Copy link',
			group: 'Edit',
			icon: Copy,
			onInvoke: () => toast('Link copied')
		},
		{
			id: 'find',
			label: 'Find in page',
			group: 'Edit',
			icon: Search,
			keywords: ['search'],
			shortcut: new Shortcut([new KeyChord('f', { primary: true })]),
			onInvoke: () => (action = 'find')
		},
		{
			id: 'palette',
			label: 'Show command palette',
			icon: FileText,
			shortcut: shortcut ?? undefined,
			onInvoke: () => openCommandPalette()
		}
	]);

	function slowUpload() {
		void toast.promise(
			new Promise<number>((resolve, reject) =>
				setTimeout(
					() => (Math.random() > 0.3 ? resolve(3) : reject(new Error('offline'))),
					1500
				)
			),
			{
				loading: { title: 'Uploading 3 files…' },
				success: (n) => ({ title: `Uploaded ${n} files`, type: 'success' }),
				error: () => ({
					title: 'Upload failed',
					type: 'danger',
					actionLabel: 'Retry',
					onAction: slowUpload
				})
			}
		);
	}
</script>

<Commands {commands}>
	<main>
		<h1>Overlays, pickers and shortcuts</h1>
		<p>The overlays, pickers and keyboard shortcut components of phase F9.</p>
		<div class="row">
			<Button onclick={() => tour.start()}>Take the tour</Button>
			<Button variant="tonal" onclick={() => openCommandPalette()}>Command palette</Button>
			{#if shortcut}<ShortcutLabel {shortcut} />{/if}
		</div>

		<section aria-labelledby="popovers" id="overlays-popover">
			<h2 id="popovers">Popover, hover card and context menu</h2>
			<div class="row">
				<Popover.Root>
					<Popover.Trigger>Rename</Popover.Trigger>
					<Popover.Content>
						<Popover.Arrow />
						<Popover.Title>Rename</Popover.Title>
						<div class="form">
							<TextField aria-label="New name" value="Report" />
							<Popover.Close variant="filled">Done</Popover.Close>
						</div>
					</Popover.Content>
				</Popover.Root>
				<Popover.Root>
					<Popover.Trigger variant="outlined">To the end</Popover.Trigger>
					<Popover.Content placement="end" alignment="center">
						<Popover.Arrow />
						A popover beside its button.
					</Popover.Content>
				</Popover.Root>
				<span>
					Made by
					<HoverCard.Root>
						<HoverCard.Trigger><a href="#popovers">@ana</a></HoverCard.Trigger>
						<HoverCard.Content>
							<strong>Ana Souza</strong><br />Designer, works on the oito2 identity.
						</HoverCard.Content>
					</HoverCard.Root>
				</span>
			</div>
			<ContextMenu.Root>
				<ContextMenu.Trigger>
					<div class="canvas" tabindex="0" role="button" aria-label="Canvas">
						Right click, long press or Shift+F10 here
					</div>
				</ContextMenu.Trigger>
				<ContextMenu.Content>
					<Menu.Item onSelect={() => (action = 'cut')}>Cut</Menu.Item>
					<Menu.Item onSelect={() => (action = 'copy')}>Copy</Menu.Item>
					<Menu.Item onSelect={() => (action = 'paste')}>Paste</Menu.Item>
				</ContextMenu.Content>
			</ContextMenu.Root>
			<p class="note">Last action: {action}</p>
		</section>

		<section aria-labelledby="pickers" id="overlays-pickers">
			<h2 id="pickers">Calendar and color</h2>
			<div class="row top">
				<Calendar bind:value={date} showWeekNumbers />
				<Calendar range bind:rangeValue={range} />
				<ColorPicker
					bind:value={color}
					swatches={['#3584E4', '#2190A4', '#3A944A', '#C88800', '#E62D42']}
				/>
			</div>
			<div class="row">
				<DatePicker bind:value={date} aria-label="Due date" />
				<DatePicker range bind:rangeValue={range} aria-label="Trip" />
				<ColorPickerButton bind:value={accent} label="Accent" />
			</div>
			<p class="note">
				Date: {date?.toLocaleDateString() ?? 'none'} · Range: {range
					? `${range.start.toLocaleDateString()} – ${range.end.toLocaleDateString()}`
					: 'none'} · Color: {color}
			</p>
		</section>

		<section aria-labelledby="sheets">
			<h2 id="sheets">Sheet and toasts</h2>
			<div class="row">
				{#each ['start', 'end', 'bottom'] as const as each (each)}
					<Button variant="outlined" onclick={() => ((side = each), (sheetOpen = true))}>
						Sheet from {each}
					</Button>
				{/each}
			</div>
			<Sheet.Root
				bind:open={sheetOpen}
				{side}
				snapPoints={side === 'bottom' ? [0.35, 0.7] : undefined}
			>
				<Sheet.Content>
					<Sheet.Handle />
					<Sheet.Header title="Filters" />
					<Sheet.Body>
						<p>
							Drag the handle toward the edge to close; on the bottom sheet it also
							snaps.
						</p>
						<TextField aria-label="Search filters" placeholder="Search filters" />
					</Sheet.Body>
				</Sheet.Content>
			</Sheet.Root>
			<div class="row">
				<Button variant="tonal" onclick={() => toast({ title: 'Saved', type: 'success' })}
					>Toast</Button
				>
				<Button
					variant="tonal"
					onclick={() =>
						toast({
							title: 'Message deleted',
							actionLabel: 'Undo',
							onAction: () => toast('Restored')
						})}>With action</Button
				>
				<Button variant="tonal" onclick={slowUpload}>Promise</Button>
			</div>
		</section>

		<section aria-labelledby="panel">
			<h2 id="panel">Floating panel</h2>
			<div class="stage">
				{#if panelOpen}
					<FloatingPanel title="Layers" onClose={() => (panelOpen = false)}>
						<p class="padded">
							Drag the title bar; Shift+arrows resize with the panel focused.
						</p>
					</FloatingPanel>
				{:else}
					<Button variant="text" onclick={() => (panelOpen = true)}>Show panel</Button>
				{/if}
			</div>
		</section>

		<section aria-labelledby="shortcuts">
			<h2 id="shortcuts">Shortcuts</h2>
			<div class="row">
				<ShortcutRecorder bind:value={shortcut} aria-label="Command palette shortcut" />
				<ShortcutLabel
					shortcut={new Shortcut([new KeyChord('k', { primary: true })])}
					os="macos"
				/>
				<ShortcutLabel
					shortcut={new Shortcut([new KeyChord('k', { primary: true })])}
					os="linux"
				/>
			</div>
		</section>
	</main>
	<CommandPalette />
	<Tour controller={tour} />
</Commands>

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
		gap: var(--oito2-space-md);
	}

	.top {
		align-items: flex-start;
	}

	.form {
		display: flex;
		gap: var(--oito2-space-sm);
	}

	.canvas {
		display: grid;
		height: 120px;
		place-items: center;
		border: 1px dashed var(--oito2-color-outline);
		border-radius: var(--oito2-radius-large);
		color: var(--oito2-color-on-surface-variant);
	}

	.note {
		color: var(--oito2-color-on-surface-variant);
		font: var(--oito2-type-body-small);
	}

	.stage {
		position: relative;
		height: 320px;
		border: 1px dashed var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
	}

	.padded {
		padding: var(--oito2-space-md);
	}
</style>
