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
  The element a tooltip describes. Pass `child` to render your own element with the props
  it receives (the handlers, `aria-describedby` and an attachment), so the tooltip binds to
  a button directly; otherwise `children` are wrapped in an inline element. The wrapper
  opens the tooltip when the keyboard focuses the first focusable element inside it, which
  the tooltip then describes, or takes the focus itself when there is none, such as around
  text or a disabled button.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { tabbables } from '../../internal/focus.js';
	import { useTooltip } from './tooltip-state.svelte.js';

	interface Props {
		/** Renders the trigger element with the props to spread on it. */
		child?: Snippet<[{ props: Record<string | symbol, unknown> }]>;
		/** The content to wrap when there is no `child`. */
		children?: Snippet;
	}

	let { child, children }: Props = $props();

	const tooltip = useTooltip();

	/**
	 * Lets the keyboard reach the wrapped content: the first focusable element inside gets
	 * the tooltip as its description while it is open; without one, the wrapper itself takes
	 * the focus.
	 */
	const reach: Attachment<HTMLElement> = (wrapper) => {
		const inner = tabbables(wrapper)[0];
		if (!inner) {
			wrapper.tabIndex = 0;
			return () => wrapper.removeAttribute('tabindex');
		}
		if (!tooltip.open) return;
		const tokens = (inner.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
		if (tokens.includes(tooltip.id)) return;
		inner.setAttribute('aria-describedby', [...tokens, tooltip.id].join(' '));
		return () => {
			const left = (inner.getAttribute('aria-describedby') ?? '')
				.split(/\s+/)
				.filter((token) => token && token !== tooltip.id);
			if (left.length > 0) inner.setAttribute('aria-describedby', left.join(' '));
			else inner.removeAttribute('aria-describedby');
		};
	};
</script>

{#if child}
	{@render child({ props: tooltip.triggerProps })}
{:else}
	<span
		class="oito2-tooltip-trigger"
		{...tooltip.triggerProps}
		onfocusin={(event) => {
			if ((event.target as HTMLElement).matches(':focus-visible')) tooltip.show(0);
		}}
		onfocusout={() => tooltip.hide()}
		{@attach reach}>{@render children?.()}</span
	>
{/if}

<style>
	@layer oito2 {
		.oito2-tooltip-trigger {
			display: inline-flex;
		}
	}
</style>
