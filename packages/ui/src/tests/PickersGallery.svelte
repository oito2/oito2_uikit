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

<!-- Test helper: the pickers and overlays of phase F9 at rest, for axe and goldens. -->
<script lang="ts">
	import '../lib/styles/styles.css';
	import ThemeProvider from '../lib/theme/ThemeProvider.svelte';
	import type { ColorTheme } from '../lib/theme/color-theme.js';
	import Calendar from '../lib/components/calendar/Calendar.svelte';
	import DatePicker from '../lib/components/calendar/DatePicker.svelte';
	import ColorPicker from '../lib/components/color-picker/ColorPicker.svelte';
	import ColorPickerButton from '../lib/components/color-picker/ColorPickerButton.svelte';
	import FloatingPanel from '../lib/components/floating-panel/FloatingPanel.svelte';
	import * as Popover from '../lib/components/popover/popover/index.js';
	import ShortcutLabel from '../lib/components/shortcuts/ShortcutLabel.svelte';
	import ShortcutRecorder from '../lib/components/shortcuts/ShortcutRecorder.svelte';
	import Toaster from '../lib/components/toast/Toaster.svelte';
	import { ToasterStore } from '../lib/components/toast/toaster.svelte.js';
	import { KeyChord, Shortcut } from '../lib/shortcuts/shortcut.js';

	interface Props {
		mode?: 'light' | 'dark';
		highContrast?: boolean;
		theme?: ColorTheme;
	}

	let { mode = 'light', highContrast = false, theme }: Props = $props();

	const store = new ToasterStore();
	store.show({ title: 'File saved', type: 'success', duration: null });
	store.show({
		title: 'Upload failed',
		description: 'Try again later.',
		type: 'danger',
		actionLabel: 'Retry',
		onAction: () => {},
		duration: null
	});
	const save = new Shortcut([new KeyChord('s', { primary: true, shift: true })]);
</script>

<ThemeProvider {mode} {highContrast} accent="blue" light={theme} dark={theme} data-testid="gallery">
	<main class="gallery">
		<div class="row">
			<Calendar
				value={new Date(2026, 10, 12)}
				today={new Date(2026, 10, 4)}
				showWeekNumbers
				aria-label="Calendar"
			/>
			<Calendar
				range
				rangeValue={{ start: new Date(2026, 10, 9), end: new Date(2026, 10, 13) }}
				today={new Date(2026, 10, 4)}
				aria-label="Range calendar"
			/>
		</div>
		<div class="row">
			<ColorPicker value="#3584E4" swatches={['#E62D42', '#3A944A', '#C88800']} />
			<div class="column">
				<DatePicker value={new Date(2026, 10, 4)} aria-label="Due date" />
				<ColorPickerButton value="#E62D42CC" label="Accent" />
				<ShortcutLabel shortcut={save} />
				<ShortcutLabel shortcut={save} os="macos" />
				<ShortcutRecorder value={save} aria-label="Save shortcut" />
				<Popover.Root defaultOpen>
					<Popover.Trigger>Details</Popover.Trigger>
					<Popover.Content placement="end" focusOnOpen={false}>
						<Popover.Arrow />
						<Popover.Title>Details</Popover.Title>
						A short popover.
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>
		<div class="stage">
			<FloatingPanel
				title="Layers"
				rect={{ x: 16, y: 16, width: 300, height: 150 }}
				onClose={() => {}}
			>
				<p class="panel">Panel content</p>
			</FloatingPanel>
		</div>
		<Toaster {store} placement="bottom-end" />
	</main>
</ThemeProvider>

<style>
	.gallery {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 800px;
		min-height: 960px;
		padding: 16px;
		background: var(--oito2-color-background);
		color: var(--oito2-color-on-surface);
	}

	.row {
		display: flex;
		gap: 24px;
	}

	.column {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
	}

	.stage {
		position: relative;
		width: 400px;
		height: 190px;
		border: 1px dashed var(--oito2-color-outline-variant);
	}

	.panel {
		margin: 0;
		padding: 12px;
	}
</style>
