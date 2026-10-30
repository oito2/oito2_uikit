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
  A compact element for an action, a filter, an entry or a suggestion, as high as a
  button, with an outline and medium rounded corners:
  - `assist`: an action, with an optional leading icon;
  - `filter`: a toggle; while `selected` it fills with the secondary container color and
    shows a check mark;
  - `input`: an entry such as a tag, with a remove button when `onRemove` is set;
  - `suggestion`: a suggested reply or query.
-->
<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { Controllable } from '../../internal/controllable.svelte.js';
	import { useLocale } from '../../l10n/locale.js';
	import type { IconComponent } from '../icon.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		/** The kind of chip. Defaults to `assist`. */
		variant?: 'assist' | 'filter' | 'input' | 'suggestion';
		/** An icon before the label. */
		icon?: IconComponent;
		/** Whether a filter chip is on. */
		selected?: boolean;
		/** The state of an uncontrolled filter chip. Defaults to `false`. */
		defaultSelected?: boolean;
		/** Called with each new state of a filter chip. */
		onSelectedChange?: (selected: boolean) => void;
		/** Called when the remove button of an input chip is clicked. */
		onRemove?: () => void;
		/** The accessible name of the remove button. Defaults to "Dismiss". */
		removeLabel?: string;
		/** The chip element. */
		ref?: HTMLElement | null;
		/** The label. */
		children: Snippet;
	}

	let {
		variant = 'assist',
		icon: Icon,
		selected = $bindable(),
		defaultSelected = false,
		onSelectedChange,
		onRemove,
		removeLabel,
		disabled = false,
		ref = $bindable(null),
		class: className,
		onclick,
		children,
		...rest
	}: Props = $props();

	const locale = useLocale();
	const state = new Controllable<boolean>({
		value: () => selected,
		defaultValue: () => defaultSelected,
		onChange: (next) => {
			selected = next;
			onSelectedChange?.(next);
		}
	});
	let on = $derived(variant === 'filter' && state.current);
	let removable = $derived(variant === 'input' && onRemove !== undefined);
	let LeadingIcon = $derived(on ? Check : Icon);
</script>

{#snippet label()}
	{#if LeadingIcon}<LeadingIcon size={18} aria-hidden="true" class="oito2-chip-icon" />{/if}
	<span class="oito2-chip-label">{@render children()}</span>
{/snippet}

{#if removable}
	<span
		bind:this={ref}
		class={['oito2-chip', className]}
		data-variant={variant}
		data-disabled={disabled ? '' : undefined}
		data-removable=""
	>
		{#if onclick}
			<button type="button" class="oito2-chip-main" {disabled} {onclick} {...rest}
				>{@render label()}</button
			>
		{:else}
			<span class="oito2-chip-main">{@render label()}</span>
		{/if}
		<button
			type="button"
			class="oito2-chip-remove"
			aria-label={removeLabel ?? locale.strings.dismiss}
			{disabled}
			onclick={() => onRemove?.()}
		>
			<X size={18} aria-hidden="true" />
		</button>
	</span>
{:else}
	<button
		bind:this={ref}
		type="button"
		class={['oito2-chip', 'oito2-chip-main', className]}
		{disabled}
		aria-pressed={variant === 'filter' ? on : undefined}
		data-variant={variant}
		data-state={variant === 'filter' ? (on ? 'on' : 'off') : undefined}
		data-disabled={disabled ? '' : undefined}
		onclick={(event) => {
			onclick?.(event);
			if (!event.defaultPrevented && variant === 'filter') state.current = !state.current;
		}}
		{...rest}
	>
		{@render label()}
	</button>
{/if}

<style>
	@layer oito2 {
		.oito2-chip {
			position: relative;
			display: inline-flex;
			align-items: center;
			box-sizing: border-box;
			height: var(--oito2-control-height);
			margin: 0;
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-surface);
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-label-large);
			letter-spacing: var(--oito2-type-label-large-tracking);
			white-space: nowrap;
			-webkit-tap-highlight-color: transparent;
		}

		.oito2-chip-main {
			display: inline-flex;
			align-items: center;
			gap: var(--oito2-space-sm);
			padding: 0 var(--oito2-space-md);
		}

		/* The main part of a removable chip sits inside the outlined chip. */
		.oito2-chip > .oito2-chip-main {
			height: 100%;
			margin: 0;
			border: none;
			border-radius: inherit;
			background: none;
			color: inherit;
			font: inherit;
			letter-spacing: inherit;
		}

		button.oito2-chip-main {
			cursor: pointer;
		}

		/* With an icon the padding before it is narrower. */
		.oito2-chip-main:has(:global(.oito2-chip-icon)) {
			padding-inline-start: var(--oito2-space-xs);
		}

		[data-removable] .oito2-chip-main {
			padding-inline-end: var(--oito2-space-xxs);
		}

		.oito2-chip :global(.oito2-chip-icon) {
			flex: none;
			margin-inline-start: var(--oito2-space-xs);
			color: var(--oito2-color-primary-text);
		}

		[data-state='on'] {
			border-color: transparent;
			background: var(--oito2-color-secondary-container);
			color: var(--oito2-color-on-secondary-container);
		}

		[data-state='on'] :global(.oito2-chip-icon) {
			color: var(--oito2-color-on-secondary-container);
		}

		button.oito2-chip-main::before,
		.oito2-chip-remove::before {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: currentColor;
			opacity: 0;
			pointer-events: none;
		}

		button.oito2-chip-main:not(:disabled):hover::before,
		.oito2-chip-remove:not(:disabled):hover::before {
			opacity: 0.08;
		}

		button.oito2-chip-main:not(:disabled):active::before,
		.oito2-chip-remove:not(:disabled):active::before {
			opacity: 0.1;
		}

		button.oito2-chip-main:focus-visible,
		.oito2-chip-remove:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.oito2-chip-remove {
			position: relative;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: 24px;
			height: 24px;
			margin: 0 var(--oito2-space-xs) 0 0;
			padding: 0;
			border: none;
			border-radius: var(--oito2-radius-small);
			background: none;
			color: var(--oito2-color-on-surface-variant);
			cursor: pointer;
		}

		[data-disabled] {
			border-color: color-mix(in srgb, var(--oito2-color-on-surface) 12%, transparent);
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
		}

		[data-disabled] :global(.oito2-chip-icon),
		[data-disabled] .oito2-chip-remove {
			color: inherit;
		}

		.oito2-chip :disabled {
			cursor: default;
		}
	}
</style>
