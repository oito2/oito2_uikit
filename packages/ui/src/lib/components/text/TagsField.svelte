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
  A field of tags shown as chips, with a text input after them. Enter or a `delimiters`
  character adds the typed text, trimmed, as a tag; a pasted list is split on the
  delimiters. A tag is refused when it is empty, repeated (unless `allowDuplicates`), past
  `maxTags` or rejected by `validator`: a typed tag that is refused stays in the input to
  be fixed, the refused tags of a pasted list are dropped. Backspace in the empty input,
  or the start arrow at the start of the input, moves to the last tag; the arrows move
  between tags, and Backspace or Delete removes the focused one. With `suggestions`,
  matching items not yet added show below the input. With `clearable`, a button at the
  end removes every tag. Bind `value`.
-->
<script lang="ts" generics="T">
	import X from '@lucide/svelte/icons/x';
	import { tick } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ListCollection } from '../../collections/list-collection.js';
	import { directionOf } from '../../internal/keyboard.js';
	import { useLocale } from '../../l10n/locale.js';
	import IconButton from '../button/IconButton.svelte';
	import * as Combobox from '../combobox/combobox/index.js';
	import { describedBy, useField } from '../field/field-context.js';
	import type { IconComponent } from '../icon.js';
	import { addTags, splitTags } from './tags.js';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The tags, in order. */
		value?: readonly string[];
		/** Called with the new list after tags are added or removed. */
		onValueChange?: (value: readonly string[]) => void;
		/** The strings that end a tag while typing or pasting; when empty only Enter does. Defaults to a comma. */
		delimiters?: readonly string[];
		/** The largest number of tags; the input turns read-only once reached. */
		maxTags?: number;
		/** Decides whether a trimmed, non-empty tag is accepted. */
		validator?: (tag: string) => boolean;
		/** Whether the same tag can be added twice. */
		allowDuplicates?: boolean;
		/** The hint shown in the input while there are no tags. */
		placeholder?: string;
		/** Tags offered below the input while typing, without the ones already added. */
		suggestions?: ListCollection<T>;
		/** The look of the tags. Defaults to `filled`. */
		variant?: 'filled' | 'subtle';
		/** Whether a button at the end removes every tag. */
		clearable?: boolean;
		/** Whether the tags can't be changed. */
		disabled?: boolean;
		/** The accessible name of the input, when no `Field.Label` names it. */
		label?: string;
		/** The input element. */
		ref?: HTMLInputElement | null;
	}

	let {
		value = $bindable([]),
		onValueChange,
		delimiters = [','],
		maxTags,
		validator,
		allowDuplicates = false,
		placeholder,
		suggestions,
		variant = 'filled',
		clearable = false,
		disabled,
		label,
		ref = $bindable(null),
		class: className,
		...rest
	}: Props = $props();

	const locale = useLocale();
	const field = useField();
	const id = $props.id();
	let text = $state('');
	let root = $state<HTMLDivElement | null>(null);
	let off = $derived(disabled ?? field?.disabled ?? false);
	let full = $derived(maxTags !== undefined && value.length >= maxTags);

	function setTags(next: readonly string[]) {
		value = next;
		onValueChange?.(next);
	}

	/** Adds the accepted tags of `raw` and returns the refused texts. */
	function add(raw: Iterable<string>): string[] {
		if (off) return [...raw];
		const result = addTags(value, raw, { allowDuplicates, maxTags, validator });
		if (result.tags.length > value.length) setTags(result.tags);
		return result.refused;
	}

	/** Returns the tag elements, in order. */
	const tagElements = () => [...(root?.querySelectorAll<HTMLElement>('[data-tag]') ?? [])];

	/** Removes the tag at `index` and focuses the previous one, or the input. */
	async function remove(index: number) {
		if (off) return;
		setTags(value.filter((_, i) => i !== index));
		await tick();
		const previous = tagElements()[index - 1];
		if (previous) previous.focus();
		else ref?.focus();
	}

	function clear() {
		text = '';
		setTags([]);
		ref?.focus();
	}

	/** Turns every delimited part of the text into a tag, keeping the rest in the input. */
	function onTextInput(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		text = event.currentTarget.value;
		const split = splitTags(text, delimiters);
		if (!split) return;
		const refused = add(split.parts);
		// A single tag refused as its delimiter is typed stays to be fixed, as with Enter.
		text =
			split.parts.length === 1 && refused.length > 0 && split.rest === ''
				? (refused[0] ?? '')
				: split.rest;
		event.currentTarget.value = text;
	}

	function onInputKey(event: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) {
		if (event.defaultPrevented) return;
		const input = event.currentTarget;
		const atStart = input.selectionStart === 0 && input.selectionEnd === 0;
		const back = directionOf(input) === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
		if (event.key === 'Enter' && text.trim()) {
			event.preventDefault();
			if (add([text]).length === 0) text = '';
		} else if (
			value.length > 0 &&
			atStart &&
			(event.key === back || (event.key === 'Backspace' && text === ''))
		) {
			event.preventDefault();
			tagElements().at(-1)?.focus();
		}
	}

	function onTagKey(event: KeyboardEvent, index: number) {
		const rtl = directionOf(event.currentTarget as Element) === 'rtl';
		const back = rtl ? 'ArrowRight' : 'ArrowLeft';
		const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
		if (event.key === 'Backspace' || event.key === 'Delete') void remove(index);
		else if (event.key === back) tagElements()[index - 1]?.focus();
		else if (event.key === forward) (tagElements()[index + 1] ?? ref)?.focus();
		else return;
		event.preventDefault();
	}

	let inputProps = $derived({
		id: field?.controlId,
		placeholder: value.length === 0 ? placeholder : undefined,
		readonly: off || full,
		'aria-label': label,
		'aria-describedby': describedBy(field, undefined)
	});
</script>

<div
	bind:this={root}
	class={['oito2-tags-field', className]}
	data-variant={variant}
	data-disabled={off ? '' : undefined}
	data-oito2-combobox-anchor=""
	onpointerdown={(event) => {
		if (event.target === event.currentTarget) {
			event.preventDefault();
			ref?.focus();
		}
	}}
	{...rest}
>
	<span id="{id}-hint" hidden>{locale.strings.removeTagHint}</span>
	{#each value as tag, index (`${index}:${tag}`)}
		<!-- The remove button is for the pointer; Delete and Backspace remove a focused tag. -->
		<span class="tag">
			<span
				class="label"
				role="button"
				tabindex="-1"
				data-tag=""
				aria-describedby={off ? undefined : `${id}-hint`}
				onkeydown={(event) => onTagKey(event, index)}>{tag}</span
			>
			{#if !off}
				<button
					type="button"
					class="remove"
					tabindex="-1"
					aria-hidden="true"
					title={locale.strings.removeItem(tag)}
					onclick={() => void remove(index)}
				>
					<X size={14} aria-hidden="true" />
				</button>
			{/if}
		</span>
	{/each}
	{#if suggestions}
		<Combobox.Root
			collection={suggestions}
			bind:inputValue={text}
			exclude={value}
			onSelect={(item) => {
				add([suggestions.getLabel(item)]);
				text = '';
			}}
		>
			<Combobox.Input
				bare
				bind:ref
				class="input"
				{...inputProps}
				oninput={onTextInput}
				onkeydown={onInputKey}
			/>
			<Combobox.Content />
		</Combobox.Root>
	{:else}
		<input
			bind:this={ref}
			value={text}
			class="input"
			{...inputProps}
			oninput={onTextInput}
			onkeydown={onInputKey}
		/>
	{/if}
	{#if clearable && !off && value.length > 0}
		<IconButton
			class="oito2-field-button oito2-tags-clear"
			icon={X as IconComponent}
			label={locale.strings.clear}
			onclick={clear}
		/>
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-tags-field {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: var(--oito2-space-xs);
			box-sizing: border-box;
			min-width: 0;
			min-height: var(--oito2-control-height);
			padding: calc(var(--oito2-space-xs) + 1px) var(--oito2-space-sm);
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-surface-container-high);
			color: var(--oito2-color-on-surface);
			cursor: text;
		}

		.oito2-tags-field:focus-within {
			border-color: var(--oito2-color-primary-text);
			box-shadow: inset 0 0 0 1px var(--oito2-color-primary-text);
		}

		[data-disabled] {
			border-color: color-mix(in srgb, var(--oito2-color-on-surface) 12%, transparent);
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
			cursor: default;
		}

		.tag {
			display: inline-flex;
			align-items: center;
			min-height: 24px;
			padding-inline: var(--oito2-space-sm) var(--oito2-space-xxs);
			border-radius: var(--oito2-radius-small);
			background: var(--oito2-color-secondary-container);
			color: var(--oito2-color-on-secondary-container);
			font: var(--oito2-type-body-medium);
			letter-spacing: var(--oito2-type-body-medium-tracking);
			cursor: default;
		}

		[data-disabled] .tag {
			padding-inline-end: var(--oito2-space-sm);
		}

		[data-variant='subtle'] .tag {
			background: var(--oito2-color-surface-container-highest);
			color: var(--oito2-color-on-surface);
			font-weight: 500;
		}

		[data-variant='subtle'] .tag:has(.label:focus) {
			background: color-mix(in srgb, var(--oito2-color-primary-text) 12%, transparent);
			color: var(--oito2-color-on-primary-tint);
		}

		.label {
			outline: none;
		}

		.tag:has(.label:focus-visible) {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		.remove {
			display: inline-flex;
			margin: 0;
			padding: var(--oito2-space-xs);
			border: none;
			border-radius: 50%;
			background: none;
			color: inherit;
			cursor: pointer;
		}

		.remove:hover {
			background: color-mix(in srgb, currentColor 12%, transparent);
		}

		.oito2-tags-field :global(.input) {
			flex: 1;
			min-width: 80px;
			min-height: 24px;
			margin: 0;
			padding: 0 var(--oito2-space-xs);
			border: none;
			outline: none;
			background: none;
			color: inherit;
			caret-color: var(--oito2-color-primary-text);
			font: var(--oito2-type-body-large);
			letter-spacing: var(--oito2-type-body-large-tracking);
		}

		.oito2-tags-field :global(.input::placeholder) {
			color: var(--oito2-color-on-surface-variant);
			font: var(--oito2-type-body-medium);
			opacity: 1;
		}

		.oito2-tags-field > :global(.oito2-tags-clear) {
			margin-block: calc(-1 * var(--oito2-space-xs));
			margin-inline-start: auto;
		}
	}
</style>
