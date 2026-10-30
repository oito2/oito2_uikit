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

<!-- Test helper: a title bar of each kind inside a SystemScope, a WindowScope and a theme. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import SystemScope from '../lib/foundation/SystemScope.svelte';
	import type { SystemSettings } from '../lib/foundation/system-settings.js';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import DialogTitleBar from '../lib/window/DialogTitleBar.svelte';
	import HeaderBar from '../lib/window/HeaderBar.svelte';
	import TitleBar from '../lib/window/TitleBar.svelte';
	import WindowScope from '../lib/window/WindowScope.svelte';
	import WindowTitleBar from '../lib/window/WindowTitleBar.svelte';
	import type { WindowController } from '../lib/window/window-controller.js';

	interface Props {
		kind: 'title' | 'window' | 'dialog' | 'header';
		settings: SystemSettings;
		controller: WindowController | null;
		onClose?: () => void;
		searchActive?: boolean;
	}

	let { kind, settings, controller, onClose, searchActive = $bindable(false) }: Props = $props();
</script>

<ThemeProvider mode="light" highContrast={false} accent="blue">
	<SystemScope {settings}>
		<WindowScope {controller}>
			<div data-testid="bar">
				{#if kind === 'title'}
					<TitleBar title="Files">
						{#snippet trailing()}<button>Action</button>{/snippet}
					</TitleBar>
				{:else if kind === 'window'}
					<WindowTitleBar title="Files" />
				{:else if kind === 'dialog'}
					<DialogTitleBar title="Preferences" {onClose} />
				{:else}
					<HeaderBar
						title="Files"
						searchable
						bind:searchActive
						searchPlaceholder="Search files"
					/>
				{/if}
			</div>
		</WindowScope>
	</SystemScope>
</ThemeProvider>
