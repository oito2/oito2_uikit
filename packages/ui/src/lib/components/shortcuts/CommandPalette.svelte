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

<!--
  @component
  A searchable list of commands in a dialog near the top of the window: type to filter
  (every word must match the label, description, group or keywords, ignoring case and
  accents), Up and Down move the highlight, Enter runs it, Escape closes. Each row shows
  the command's icon, label with the matches emphasized, group and description, and
  shortcut. It lists `commands`, or the commands available where it is placed (its
  `Commands` scopes). Bind `open`, or call `openCommandPalette()` for the palette without
  an `open` prop.
-->
<script lang="ts">
	import { tick } from 'svelte';
	import Portal from '../../internal/Portal.svelte';
	import { dismissableLayer } from '../../internal/dismissable-layer.js';
	import { focusScope } from '../../internal/focus-scope.js';
	import { Presence } from '../../internal/presence.svelte.js';
	import { useLocale } from '../../l10n/locale.js';
	import { useCommands, type Command } from '../../shortcuts/commands.js';
	import HighlightedText from '../text/HighlightedText.svelte';
	import SearchField from '../text/SearchField.svelte';
	import { commandPalette, rankCommands } from './command-palette.svelte.js';
	import ShortcutLabel from './ShortcutLabel.svelte';

	interface Props {
		/** Whether the palette is open. Defaults to the state `openCommandPalette()` sets. */
		open?: boolean;
		/** Called when the palette opens or closes. */
		onOpenChange?: (open: boolean) => void;
		/** The commands to list. Defaults to the ones available where the palette is. */
		commands?: readonly Command[];
	}

	let { open = $bindable(), onOpenChange, commands }: Props = $props();

	const id = $props.id();
	const locale = useLocale();
	const available = useCommands();
	let isOpen = $derived(open ?? commandPalette.open);
	const presence = new Presence(() => isOpen);
	let query = $state('');
	let highlight = $state(0);
	let list = $state<HTMLElement | null>(null);
	let matches = $derived(rankCommands(commands ?? available.available, query));

	function setOpen(next: boolean) {
		if (open === undefined) commandPalette.open = next;
		else open = next;
		onOpenChange?.(next);
		if (next) {
			query = '';
			highlight = 0;
		}
	}

	$effect(() => {
		if (isOpen) {
			query = '';
			highlight = 0;
		}
	});

	/**
	 * Closes the palette and runs `command` once the palette has let go of focus, so a
	 * dialog the command opens returns focus to where it was before the palette.
	 */
	async function run(command: Command | undefined) {
		if (!command) return;
		setOpen(false);
		await tick();
		command.onInvoke();
	}

	async function move(step: number) {
		if (matches.length === 0) return;
		highlight = (highlight + step + matches.length) % matches.length;
		await tick();
		list?.querySelector('[data-highlighted]')?.scrollIntoView({ block: 'nearest' });
	}
</script>

{#if presence.present}
	<Portal>
		<div
			class="oito2-command-palette-overlay"
			data-state={isOpen ? 'open' : 'closed'}
			{@attach presence.attach}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={locale.strings.commandPaletteHint}
				class="oito2-command-palette"
				data-state={isOpen ? 'open' : 'closed'}
				{@attach isOpen ? focusScope({ trap: true }) : undefined}
				{@attach isOpen
					? dismissableLayer({
							onDismiss: () => setOpen(false),
							closeOnEscape: false
						})
					: undefined}
			>
				<div class="search">
					<SearchField
						bind:value={query}
						role="combobox"
						aria-expanded={matches.length > 0}
						aria-controls="{id}-list"
						aria-activedescendant={matches.length > 0
							? `${id}-item-${highlight}`
							: undefined}
						placeholder={locale.strings.commandPaletteHint}
						aria-label={locale.strings.commandPaletteHint}
						data-autofocus=""
						onValueChange={() => (highlight = 0)}
						onEscape={() => setOpen(false)}
						onSubmit={() => void run(matches[highlight])}
						onkeydown={(event: KeyboardEvent) => {
							if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
								event.preventDefault();
								void move(event.key === 'ArrowDown' ? 1 : -1);
							}
						}}
					/>
				</div>
				{#if matches.length === 0}
					<p class="empty" role="status">{locale.strings.noCommandsFound}</p>
				{:else}
					<div class="list" id="{id}-list" role="listbox" bind:this={list}>
						{#each matches as command, index (command.id)}
							{@const Icon = command.icon}
							{@const subtitle = [command.group, command.description]
								.filter(Boolean)
								.join(' · ')}
							<div
								id="{id}-item-{index}"
								role="option"
								tabindex="-1"
								aria-selected={index === highlight}
								class="item"
								data-highlighted={index === highlight ? '' : undefined}
								onpointermove={() => (highlight = index)}
								onpointerdown={(event) => event.preventDefault()}
								onclick={() => void run(command)}
								onkeydown={() => {}}
							>
								{#if Icon}<span class="icon"
										><Icon size={20} aria-hidden="true" /></span
									>{/if}
								<span class="text">
									<HighlightedText text={command.label} {query} />
									{#if subtitle}<span class="subtitle">{subtitle}</span>{/if}
								</span>
								{#if command.shortcut}<ShortcutLabel
										shortcut={command.shortcut}
									/>{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</Portal>
{/if}

<style>
	@layer oito2 {
		.oito2-command-palette-overlay {
			position: fixed;
			inset: 0;
			z-index: 950;
			display: flex;
			align-items: flex-start;
			justify-content: center;
			padding: 12vh var(--oito2-space-lg) var(--oito2-space-lg);
			background: rgb(0 0 0 / 32%);
			animation: oito2-palette-fade 120ms ease-out;
		}

		.oito2-command-palette-overlay[data-state='closed'] {
			animation: oito2-palette-fade 100ms ease-in reverse forwards;
		}

		.oito2-command-palette {
			display: flex;
			flex-direction: column;
			box-sizing: border-box;
			width: min(560px, 100%);
			max-height: min(440px, 100%);
			overflow: hidden;
			border: 1px solid var(--oito2-color-outline-variant);
			border-radius: var(--oito2-radius-large);
			outline: none;
			background: var(--oito2-color-surface-container-high);
			color: var(--oito2-color-on-surface);
			box-shadow: 0 8px 24px color-mix(in srgb, var(--oito2-color-shadow) 30%, transparent);
		}

		.search {
			display: flex;
			flex-direction: column;
			padding: var(--oito2-space-md);
		}

		.empty {
			margin: 0;
			padding: var(--oito2-space-xl);
			color: var(--oito2-color-on-surface-variant);
		}

		.list {
			flex: 1;
			min-height: 0;
			overflow-y: auto;
			padding: 0 var(--oito2-space-sm) var(--oito2-space-sm);
		}

		.item {
			display: flex;
			align-items: center;
			gap: var(--oito2-space-md);
			min-height: 40px;
			padding: var(--oito2-space-xs) var(--oito2-space-md);
			border-radius: var(--oito2-radius-medium);
			cursor: pointer;
		}

		[data-highlighted] {
			background: var(--oito2-color-secondary-container);
			color: var(--oito2-color-on-secondary-container);
		}

		.icon {
			display: inline-flex;
			color: var(--oito2-color-on-surface-variant);
		}

		.text {
			display: flex;
			flex: 1;
			flex-direction: column;
			min-width: 0;
			font: var(--oito2-type-body-large);
		}

		.subtitle {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-medium);
		}

		@keyframes oito2-palette-fade {
			from {
				opacity: 0;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			.oito2-command-palette-overlay,
			.oito2-command-palette-overlay[data-state='closed'] {
				animation: none;
			}
		}
	}
</style>
