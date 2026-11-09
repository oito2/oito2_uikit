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

<script lang="ts">
	import Menu from '@lucide/svelte/icons/menu';
	import PanelLeft from '@lucide/svelte/icons/panel-left';
	import Search from '@lucide/svelte/icons/search';
	import {
		Dialog,
		DialogTitleBar,
		IconButton,
		Platform,
		SegmentGroup,
		Switch,
		SystemScope,
		TitleBar,
		WindowButtonLayout,
		WindowControl,
		WindowControls,
		WindowScope,
		WindowTitleBar,
		fallbackSystemSettings,
		windowControlStyles,
		type IconComponent,
		type SystemSettings
	} from '@oito2/ui';
	import { CodeBlock } from '@oito2/ui-syntax';
	import { SimulatedWindowController, simulatedSettings } from '#lib/simulated-window.svelte.js';

	const icon = (component: unknown) => component as IconComponent;

	const styles = windowControlStyles.filter((style) => style !== 'none');
	// Each sample bar has its own window, so maximizing one changes only its glyph.
	const controllers = Object.fromEntries(
		styles.map((style) => [style, new SimulatedWindowController()])
	);

	const content = new SimulatedWindowController();
	let centerTitle = $state(true);
	let bordered = $state(true);

	const presented = new SimulatedWindowController();
	let barStyle = $state<'normal' | 'undecorated' | 'hidden'>('normal');
	let active = $state(true);

	const desktops = [
		'gnome',
		'kde',
		'xfce',
		'cosmic',
		'windows',
		'macos',
		'web',
		'android'
	] as const;
	type Desktop = (typeof desktops)[number];
	let desktop = $state<Desktop>('gnome');
	const platformWindow = new SimulatedWindowController();
	let settings: SystemSettings = $derived(
		desktop === 'web'
			? fallbackSystemSettings(new Platform({ os: 'linux', isWeb: true }))
			: desktop === 'android'
				? fallbackSystemSettings(new Platform({ os: 'android', isWeb: false }))
				: simulatedSettings(desktop)
	);

	const types = ['minimize', 'maximize', 'restore', 'close'] as const;
	const controlsWindow = new SimulatedWindowController();

	// The closing script tag is split so it doesn't end this component's script.
	const scriptEnd = '</' + 'script>';
	const resizeSample = `<script lang="ts">
  import { WindowScope, WindowTitleBar } from '@oito2/ui';
  import { WindowResizeHandles, initWindow, type NativeWindowController } from '@oito2/ui-window';

  let native: NativeWindowController | null = $state(null);
  initWindow().then((controller) => (native = controller));
${scriptEnd}

<WindowScope controller={native}>
  <WindowTitleBar title="My app" />
  <WindowResizeHandles controller={native} thickness={6} />
</WindowScope>`;
</script>

<main class="showcase-page">
	<p>
		Title bars replace the system frame of a Tauri window: a title, content on both sides and
		window controls drawn in the look of the desktop. <code>TitleBar</code> takes every choice
		as a prop; <code>WindowTitleBar</code> takes them from the system; and
		<code>DialogTitleBar</code> is the bar of a dialog. The window comes from the closest
		<code>WindowScope</code>; here, outside a native window, each bar gets a simulated one.
	</p>

	<section aria-labelledby="title-bar-styles">
		<h2 id="title-bar-styles">Window control styles</h2>
		<p>Hover the buttons, and maximize to see the restore glyph.</p>
		<div class="title-bar-bars">
			{#each styles as style (style)}
				<div class="title-bar-frame">
					<TitleBar
						title={style}
						controlStyle={style}
						buttonLayout={WindowButtonLayout.defaultFor(style)}
						controller={controllers[style]}
					/>
				</div>
				<p class="note">Last action: {controllers[style]?.lastAction || 'none'}</p>
			{/each}
		</div>
	</section>

	<section aria-labelledby="title-bar-content">
		<h2 id="title-bar-content">Content and title</h2>
		<p>
			<code>leading</code> and <code>trailing</code> hold controls beside the window buttons. The
			title can sit at the start, and the bottom line can go.
		</p>
		<div class="row">
			<label class="row">Centered title <Switch bind:checked={centerTitle} /></label>
			<label class="row">Bottom line <Switch bind:checked={bordered} /></label>
		</div>
		<div class="title-bar-frame">
			<TitleBar title="Documents" controller={content} {centerTitle} {bordered}>
				{#snippet leading()}
					<IconButton icon={icon(PanelLeft)} label="Show sidebar" />
				{/snippet}
				{#snippet trailing()}
					<IconButton icon={icon(Search)} label="Search" />
					<IconButton icon={icon(Menu)} label="Main menu" />
				{/snippet}
			</TitleBar>
		</div>
		<p class="note">Last action: {content.lastAction || 'none'}</p>
	</section>

	<section aria-labelledby="title-bar-presentation">
		<h2 id="title-bar-presentation">Presentation and window state</h2>
		<p>
			<code>undecorated</code> hides the window controls, <code>hidden</code> the whole bar. An
			inactive window greys out the macOS traffic lights.
		</p>
		<div class="row">
			<SegmentGroup.Root bind:value={barStyle} aria-label="Bar style">
				<SegmentGroup.Item value="normal">Normal</SegmentGroup.Item>
				<SegmentGroup.Item value="undecorated">Undecorated</SegmentGroup.Item>
				<SegmentGroup.Item value="hidden">Hidden</SegmentGroup.Item>
			</SegmentGroup.Root>
			<label class="row">
				Window active
				<Switch
					bind:checked={active}
					onCheckedChange={(isActive) =>
						(presented.state = { ...presented.state, isActive })}
				/>
			</label>
		</div>
		<div class="title-bar-frame title-bar-presented">
			<TitleBar
				title="My app"
				{barStyle}
				controlStyle="macos"
				buttonLayout={WindowButtonLayout.defaultFor('macos')}
				controller={presented}
			/>
		</div>
	</section>

	<section aria-labelledby="title-bar-window">
		<h2 id="title-bar-window">Window title bar</h2>
		<p>
			<code>WindowTitleBar</code> follows the platform of the closest
			<code>SystemScope</code>: the desktop's controls and button layout on Linux and Windows,
			room for the traffic lights on macOS, no controls in a browser and a taller app bar on
			touch platforms.
		</p>
		<SegmentGroup.Root bind:value={desktop} aria-label="Platform">
			{#each desktops as option (option)}
				<SegmentGroup.Item value={option}>{option}</SegmentGroup.Item>
			{/each}
		</SegmentGroup.Root>
		<SystemScope {settings}>
			<WindowScope controller={platformWindow}>
				<div class="title-bar-frame">
					<WindowTitleBar title="My app" />
				</div>
			</WindowScope>
		</SystemScope>
		<p class="note">Last action: {platformWindow.lastAction || 'none'}</p>
	</section>

	<section aria-labelledby="title-bar-controls">
		<h2 id="title-bar-controls">Window controls</h2>
		<p>
			<code>WindowControl</code> draws one button; <code>WindowControls</code> a row wired to a
			window. Like native ones, they stay out of the Tab order.
		</p>
		<div class="title-bar-grid">
			{#each styles as style (style)}
				<span class="note">{style}</span>
				<div class="row">
					{#each types as type (type)}
						<WindowControl {type} controlStyle={style} />
					{/each}
					{#if style === 'macos'}
						<span class="note">inactive:</span>
						{#each types as type (type)}
							<WindowControl {type} controlStyle={style} active={false} />
						{/each}
					{/if}
				</div>
			{/each}
		</div>
		<div class="row">
			<WindowControls
				buttons={['minimize', 'maximize', 'close']}
				controlStyle="breeze"
				controller={controlsWindow}
			/>
			<span class="note">Last action: {controlsWindow.lastAction || 'none'}</span>
		</div>
	</section>

	<section aria-labelledby="title-bar-dialog">
		<h2 id="title-bar-dialog">Dialog title bar</h2>
		<p>
			A title and only a close button, on the side and in the style of the desktop. Inside a
			<code>Dialog</code> the button closes it.
		</p>
		<div class="row">
			<Dialog.Root>
				<Dialog.Trigger variant="tonal">Open preferences</Dialog.Trigger>
				<Dialog.Content class="title-bar-dialog">
					<DialogTitleBar title="Preferences" />
					<Dialog.Description>
						The close button sits where the desktop puts it, in its style.
					</Dialog.Description>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</section>

	<section aria-labelledby="title-bar-resize">
		<h2 id="title-bar-resize">Resize handles</h2>
		<p>
			An undecorated Linux window has no system frame to resize it. <code
				>WindowResizeHandles</code
			>
			of <code>@oito2/ui-window</code> adds invisible handles along the edges and corners, which
			resize the native window when dragged. They show only without a system frame and while the
			window isn't maximized or full screen, so they need a real Tauri window and do nothing here.
		</p>
		<CodeBlock code={resizeSample} language="html" label="Resize handles setup" />
	</section>
</main>

<style>
	.title-bar-bars {
		display: grid;
		gap: var(--oito2-space-xs);
		max-width: 640px;
	}

	.title-bar-frame {
		max-width: 640px;
		overflow: hidden;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-medium);
		background: var(--oito2-color-surface);
	}

	.title-bar-presented {
		min-height: 48px;
	}

	.title-bar-grid {
		display: grid;
		grid-template-columns: max-content 1fr;
		align-items: center;
		gap: var(--oito2-space-sm) var(--oito2-space-md);
	}

	:global(.title-bar-dialog) {
		padding: 0 0 var(--oito2-space-xl);
	}

	:global(.title-bar-dialog) > :global(p) {
		padding: 0 var(--oito2-space-xl);
	}
</style>
