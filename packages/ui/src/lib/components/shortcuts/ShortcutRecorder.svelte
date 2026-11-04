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
  A field that records a keyboard shortcut. A click, Enter or Space starts recording; the
  next key with its modifiers becomes the shortcut (the platform's command modifier is
  stored as the primary one, so it is `Ctrl` or `⌘` wherever it runs). Escape cancels,
  Backspace or Delete clear it, and a button beside it clears it too. Bind `value`.
-->
<script lang="ts">
	import X from '@lucide/svelte/icons/x';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { OperatingSystem } from '../../foundation/platform.js';
	import { useSystemSettings } from '../../foundation/system-scope.js';
	import { useLocale } from '../../l10n/locale.js';
	import { KeyChord, Shortcut, usesCommandKey } from '../../shortcuts/shortcut.js';
	import IconButton from '../button/IconButton.svelte';
	import type { IconComponent } from '../icon.js';
	import ShortcutLabel from './ShortcutLabel.svelte';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		/** The recorded shortcut, or `null`. */
		value?: Shortcut | null;
		/** Called with each new shortcut, or `null` when cleared. */
		onValueChange?: (value: Shortcut | null) => void;
		/** Whether the shortcut can't be changed. */
		disabled?: boolean;
		/** The platform to record and label for. Defaults to the system's. */
		os?: OperatingSystem;
	}

	let {
		value = $bindable(null),
		onValueChange,
		disabled = false,
		os,
		class: className,
		'aria-label': ariaLabel,
		...rest
	}: Props = $props();

	const locale = useLocale();
	const system = useSystemSettings();
	let platform = $derived(os ?? system.current.platform.os);
	let recording = $state(false);

	function set(next: Shortcut | null) {
		value = next;
		onValueChange?.(next);
	}

	/** Stores the platform's command modifier of `chord` as the primary one. */
	function withPrimary(chord: KeyChord): KeyChord {
		const apple = usesCommandKey(platform);
		const isPrimary = apple ? chord.meta : chord.control;
		if (!isPrimary) return chord;
		return new KeyChord(chord.key, {
			primary: true,
			control: apple && chord.control,
			shift: chord.shift,
			alt: chord.alt,
			meta: !apple && chord.meta
		});
	}

	function onkeydown(event: KeyboardEvent) {
		if (!recording) {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				recording = !disabled;
			}
			return;
		}
		event.preventDefault();
		event.stopPropagation();
		const key = KeyChord.keyOf(event);
		if (KeyChord.isModifierKey(key)) return;
		const chord = KeyChord.fromEvent(event);
		const plain = !chord.hasCommandModifier && !chord.shift;
		recording = false;
		if (plain && key === 'Escape') return;
		if (plain && (key === 'Backspace' || key === 'Delete')) set(null);
		else set(new Shortcut([withPrimary(chord)]));
	}
</script>

<div class={['oito2-shortcut-recorder', className]} {...rest}>
	<button
		type="button"
		class="field"
		{disabled}
		data-recording={recording ? '' : undefined}
		onclick={() => (recording = !disabled)}
		{onkeydown}
		onblur={() => (recording = false)}
	>
		{#if ariaLabel}<span class="name">{ariaLabel}: </span>{/if}
		{#if recording}
			<span class="hint">{locale.strings.pressShortcut}</span>
		{:else if value}
			<ShortcutLabel shortcut={value} os={platform} />
		{:else}
			<span class="hint">{locale.strings.noShortcut}</span>
		{/if}
	</button>
	{#if value && !disabled}
		<IconButton
			icon={X as IconComponent}
			label={locale.strings.clearShortcut}
			onclick={() => set(null)}
		/>
	{/if}
</div>

<style>
	@layer oito2 {
		.oito2-shortcut-recorder {
			display: inline-flex;
			align-items: center;
			gap: var(--oito2-space-xs);
		}

		.field {
			display: inline-flex;
			align-items: center;
			box-sizing: border-box;
			min-width: 140px;
			height: var(--oito2-size-button-height);
			margin: 0;
			padding: 0 var(--oito2-space-md);
			border: 1px solid var(--oito2-color-outline);
			border-radius: var(--oito2-radius-medium);
			background: var(--oito2-color-surface-container-high);
			color: var(--oito2-color-on-surface);
			font: var(--oito2-type-body-medium);
			text-align: start;
			cursor: pointer;
		}

		.field:focus-visible {
			outline: var(--oito2-size-focus-border-width) solid var(--oito2-color-primary-text);
			outline-offset: 0;
		}

		[data-recording] {
			border-color: var(--oito2-color-primary-text);
			box-shadow: inset 0 0 0 1px var(--oito2-color-primary-text);
		}

		.field:disabled {
			opacity: 0.38;
			cursor: default;
		}

		/* The field's name for assistive technologies, read before its content. */
		.name {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}

		.hint {
			color: var(--oito2-color-on-surface-variant);
		}
	}
</style>
