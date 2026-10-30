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
  The title bar of a dialog window or panel: a title and only a close button, on the side
  where the desktop puts its close button, in the desktop's style (GNOME's on macOS and in
  a browser). It is transparent and doesn't move the window. Inside a `Dialog` the close
  button closes it.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { WindowButtonLayout } from '../foundation/window-button-layout.js';
	import { useSystemSettings } from '../foundation/system-scope.js';
	import { maybeDialog } from '../components/dialog/dialog-state.svelte.js';
	import TitleBar from './TitleBar.svelte';
	import type { WindowControlLabels } from './window-control.js';

	interface Props {
		/** The title. */
		title?: string | Snippet;
		/** Content at the start. */
		leading?: Snippet;
		/** Called by the close button. Defaults to closing the enclosing `Dialog`. */
		onClose?: () => void;
		/** Label overrides for the close button. */
		labels?: WindowControlLabels;
	}

	let { title, leading, onClose, labels }: Props = $props();

	const system = useSystemSettings();
	const dialog = maybeDialog();
	let style = $derived(
		system.current.windowControlStyle === 'none' ||
			system.current.windowControlStyle === 'macos'
			? 'gnome'
			: system.current.windowControlStyle
	);
	let closeLeading = $derived(system.current.windowButtonLayout.leading.includes('close'));
	let buttonLayout = $derived(
		closeLeading
			? new WindowButtonLayout({ leading: ['close'] })
			: new WindowButtonLayout({ trailing: ['close'] })
	);
</script>

<TitleBar
	class="oito2-dialog-title-bar"
	{title}
	{leading}
	controller={null}
	controlStyle={style}
	{buttonLayout}
	{labels}
	onClose={onClose ?? (() => dialog && (dialog.open = false))}
	draggable={false}
	bordered={false}
/>

<style>
	@layer oito2 {
		:global(.oito2-dialog-title-bar.oito2-title-bar) {
			background: transparent;
		}
	}
</style>
