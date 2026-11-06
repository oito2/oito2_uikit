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
  A row of short text fields joined by a `delimiter`, for values like IP addresses or
  license keys. Focus moves to the next segment when one fills up or when the first
  visible character of the delimiter is typed in a segment with text, and back to the previous one on Backspace
  in an empty segment or on the arrow toward the start at its start; the arrow toward the
  end at the end of a segment moves to the next. A pasted value that doesn't fit one
  segment fills it and the ones after it, split on the delimiter or by length. Bind
  `value`, one string per segment, or set `defaultValue` and listen to `onValueChange`.
-->
<script lang="ts">
	import { tick } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Controllable } from '../../internal/controllable.svelte.js';
	import { directionOf } from '../../internal/keyboard.js';
	import { useLocale } from '../../l10n/locale.js';

	/** One part of a `SegmentedEntry`. */
	interface EntrySegment {
		/** The number of characters the segment holds. */
		length: number;
		/** The placeholder, such as `000`. */
		hint?: string;
		/** Whether only digits are accepted. Defaults to true. */
		numeric?: boolean;
		/** The accessible name. Defaults to "Part 2 of 4". */
		label?: string;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'defaultValue'> {
		/** The segments, in order. */
		segments: readonly EntrySegment[];
		/** The text drawn between segments. Defaults to `.`. */
		delimiter?: string;
		/** The text of each segment. */
		value?: readonly string[];
		/** The text of each segment of an uncontrolled entry at first. Defaults to none. */
		defaultValue?: readonly string[];
		/** Called with the text of every segment whenever one changes. */
		onValueChange?: (value: readonly string[]) => void;
		/** Whether every segment can't be used. */
		disabled?: boolean;
	}

	let {
		segments,
		delimiter = '.',
		value = $bindable(),
		defaultValue = [],
		onValueChange,
		disabled = false,
		class: className,
		...rest
	}: Props = $props();

	const model = new Controllable<readonly string[]>({
		value: () => value,
		defaultValue: () => defaultValue,
		onChange: (next) => {
			value = next;
			onValueChange?.(next);
		}
	});

	const locale = useLocale();
	let inputs = $state<(HTMLInputElement | null)[]>([]);
	// The character that advances focus: the first visible one of the delimiter.
	let advance = $derived(delimiter.trim().charAt(0) || delimiter.charAt(0));

	function textOf(index: number): string {
		return model.current[index] ?? '';
	}

	/** Keeps the allowed characters of `text` for segment `index`, without cutting them. */
	function allowed(text: string, index: number): string {
		const segment = segments[index];
		if (!segment) return text;
		return (segment.numeric ?? true) ? text.replace(/\D/g, '') : text.split(advance).join('');
	}

	/** Keeps the allowed characters of `text` for segment `index`. */
	function clean(text: string, index: number): string {
		const segment = segments[index];
		return segment ? allowed(text, index).slice(0, segment.length) : text;
	}

	/**
	 * Spreads a pasted value that doesn't fit segment `index` over it and the segments after
	 * it: split on the delimiter when it has one, cut by the segment lengths otherwise.
	 * Focus moves to the segment after the last one filled.
	 */
	function onPaste(event: ClipboardEvent & { currentTarget: HTMLInputElement }, index: number) {
		const pasted = (event.clipboardData?.getData('text/plain') ?? '').trim();
		const segment = segments[index];
		if (
			!segment ||
			(!pasted.includes(advance) && allowed(pasted, index).length <= segment.length)
		)
			return;
		event.preventDefault();
		const next = segments.map((_, i) => textOf(i));
		let at = index;
		if (pasted.includes(advance)) {
			for (const part of pasted.split(advance)) {
				if (at >= segments.length) break;
				next[at] = clean(part.trim(), at);
				at++;
			}
		} else {
			let rest = allowed(pasted, index);
			while (rest && at < segments.length) {
				const piece = clean(rest, at);
				next[at] = piece;
				rest = rest.slice(piece.length);
				at++;
			}
		}
		model.current = next;
		void focus(Math.min(at, segments.length - 1));
	}

	/** Focuses segment `index` with the caret at `caret` (its end by default). */
	async function focus(index: number, caret?: number) {
		await tick();
		const input = inputs[index];
		if (!input) return;
		input.focus();
		const at = caret ?? input.value.length;
		input.setSelectionRange(at, at);
	}

	function onInput(event: Event & { currentTarget: HTMLInputElement }, index: number) {
		const text = clean(event.currentTarget.value, index);
		model.current = segments.map((_, i) => (i === index ? text : textOf(i)));
		// Shows the segment's current text, which stays the same while a parent that
		// controls the value hasn't accepted the change.
		const shown = textOf(index);
		event.currentTarget.value = shown;
		if (shown.length >= (segments[index]?.length ?? Infinity)) void focus(index + 1);
	}

	function onKey(event: KeyboardEvent & { currentTarget: HTMLInputElement }, index: number) {
		const input = event.currentTarget;
		const collapsed = input.selectionStart === input.selectionEnd;
		const atStart = collapsed && input.selectionStart === 0;
		const atEnd = collapsed && input.selectionEnd === input.value.length;
		const rtl = directionOf(input) === 'rtl';
		const back = rtl ? 'ArrowRight' : 'ArrowLeft';
		const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
		const last = index === segments.length - 1;
		if (event.key === 'Backspace' && input.value === '' && index > 0) void focus(index - 1);
		else if (event.key === back && atStart && index > 0) void focus(index - 1);
		else if (event.key === forward && atEnd && !last) void focus(index + 1, 0);
		// The delimiter advances from a segment with text; in an empty one, such as right
		// after a full segment moved the focus here, it is ignored. It is never typed.
		else if (event.key === advance) {
			if (!last && input.value !== '') void focus(index + 1);
		} else return;
		event.preventDefault();
	}
</script>

<div role="group" class={['oito2-segmented-entry', className]} {...rest}>
	{#each segments as segment, index (index)}
		{#if index > 0}<span class="delimiter" aria-hidden="true">{delimiter}</span>{/if}
		<input
			bind:this={inputs[index]}
			value={textOf(index)}
			class="segment"
			style:--oito2-segment-length={segment.length}
			placeholder={segment.hint}
			maxlength={segment.length}
			inputmode={(segment.numeric ?? true) ? 'numeric' : 'text'}
			autocomplete="off"
			{disabled}
			aria-label={segment.label ?? locale.strings.partOf(index + 1, segments.length)}
			oninput={(event) => onInput(event, index)}
			onpaste={(event) => onPaste(event, index)}
			onkeydown={(event) => onKey(event, index)}
		/>
	{/each}
</div>

<style>
	@layer oito2 {
		.oito2-segmented-entry {
			display: inline-flex;
			align-items: center;
		}

		.delimiter {
			padding: 0 var(--oito2-space-xs);
			color: var(--oito2-color-on-surface);
		}

		.segment {
			box-sizing: content-box;
			width: calc(var(--oito2-segment-length) * 1ch);
			min-height: calc(var(--oito2-control-height) - 2px);
			margin: 0;
			padding: 0 var(--oito2-space-md);
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-medium);
			outline: none;
			background: var(--oito2-color-surface-container-high);
			color: var(--oito2-color-on-surface);
			caret-color: var(--oito2-color-primary-text);
			font: var(--oito2-type-body-large);
			font-variant-numeric: tabular-nums;
			letter-spacing: var(--oito2-type-body-large-tracking);
			text-align: center;
		}

		.segment:focus {
			border-color: var(--oito2-color-primary-text);
			box-shadow: inset 0 0 0 1px var(--oito2-color-primary-text);
		}

		.segment::placeholder {
			color: var(--oito2-color-on-surface-variant);
			opacity: 1;
		}

		.segment:disabled {
			border-color: color-mix(in srgb, var(--oito2-color-on-surface) 12%, transparent);
			color: color-mix(in srgb, var(--oito2-color-on-surface) 38%, transparent);
		}
	}
</style>
