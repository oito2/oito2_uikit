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
  Renders its content somewhere else in the document: into `to` when given, else into the
  portal target of the closest `ThemeProvider` (so the content keeps the theme), else into
  `document.body`. The content keeps the contexts of the place where `Portal` is used.
-->
<script lang="ts">
	import { getAllContexts, mount, unmount, type Snippet } from 'svelte';
	import PortalContent from './PortalContent.svelte';
	import { usePortalTarget } from './portal.js';

	interface Props {
		/** The element, or a selector of the element, to render into. */
		to?: HTMLElement | string;
		/** Whether the content renders in place instead. */
		disabled?: boolean;
		/** The content. */
		children: Snippet;
	}

	let { to, disabled = false, children }: Props = $props();

	const target = usePortalTarget();
	const context = getAllContexts();

	$effect(() => {
		if (disabled) return;
		const host =
			(typeof to === 'string' ? document.querySelector<HTMLElement>(to) : to) ??
			target.current ??
			document.body;
		const instance = mount(PortalContent, { target: host, props: { children }, context });
		return () => {
			void unmount(instance);
		};
	});
</script>

{#if disabled}
	{@render children()}
{/if}
