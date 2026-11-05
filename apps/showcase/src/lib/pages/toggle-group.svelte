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
	import Bold from '@lucide/svelte/icons/bold';
	import Eraser from '@lucide/svelte/icons/eraser';
	import Highlighter from '@lucide/svelte/icons/highlighter';
	import Italic from '@lucide/svelte/icons/italic';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Strikethrough from '@lucide/svelte/icons/strikethrough';
	import TextAlignCenter from '@lucide/svelte/icons/text-align-center';
	import TextAlignEnd from '@lucide/svelte/icons/text-align-end';
	import TextAlignJustify from '@lucide/svelte/icons/text-align-justify';
	import TextAlignStart from '@lucide/svelte/icons/text-align-start';
	import Underline from '@lucide/svelte/icons/underline';
	import { ToggleGroup } from '@oito2/ui';

	let format = $state<readonly string[]>(['bold']);
	let align = $state<readonly string[]>(['start']);
	let size = $state<readonly string[]>([]);
	let tool = $state<readonly string[]>(['pen']);
</script>

<main class="showcase-page">
	<p>
		<code>ToggleGroup</code> is a joined row (or column) of buttons that turn on and off, such as
		text formatting or alignment buttons. Items that are on are raised from the track. The group is
		one Tab stop: the arrow keys move between the enabled items and Space or Enter toggles the focused
		one.
	</p>

	<section aria-labelledby="toggle-group-multiple">
		<h2 id="toggle-group-multiple">Several on at once</h2>
		<p>
			With <code>multiple</code> each item turns on and off by itself. Items with only an
			<code>icon</code> take a <code>label</code> as their name and tooltip.
		</p>
		<ToggleGroup.Root bind:value={format} multiple aria-label="Text style">
			<ToggleGroup.Item value="bold" icon={Bold} label="Bold" />
			<ToggleGroup.Item value="italic" icon={Italic} label="Italic" />
			<ToggleGroup.Item value="underline" icon={Underline} label="Underline" />
			<ToggleGroup.Item value="strike" icon={Strikethrough} label="Strikethrough" />
		</ToggleGroup.Root>
		<p
			class="sample"
			style:font-weight={format.includes('bold') ? 'bold' : undefined}
			style:font-style={format.includes('italic') ? 'italic' : undefined}
			style:text-decoration={[
				format.includes('underline') ? 'underline' : '',
				format.includes('strike') ? 'line-through' : ''
			]
				.join(' ')
				.trim() || undefined}
		>
			The quick brown fox jumps over the lazy dog.
		</p>
	</section>

	<section aria-labelledby="toggle-group-single">
		<h2 id="toggle-group-single">One on at a time</h2>
		<p>
			Without <code>multiple</code>, turning one item on turns the others off.
			<code>deselectable=&#123;false&#125;</code> keeps one item always on; by default the item
			that is on can be turned off.
		</p>
		<div class="row">
			<ToggleGroup.Root bind:value={align} deselectable={false} aria-label="Alignment">
				<ToggleGroup.Item value="start" icon={TextAlignStart} label="Align start" />
				<ToggleGroup.Item value="center" icon={TextAlignCenter} label="Center" />
				<ToggleGroup.Item value="end" icon={TextAlignEnd} label="Align end" />
				<ToggleGroup.Item value="justify" icon={TextAlignJustify} label="Justify" />
			</ToggleGroup.Root>
			<ToggleGroup.Root bind:value={size} aria-label="Size">
				<ToggleGroup.Item value="small">Small</ToggleGroup.Item>
				<ToggleGroup.Item value="medium">Medium</ToggleGroup.Item>
				<ToggleGroup.Item value="large">Large</ToggleGroup.Item>
			</ToggleGroup.Root>
		</div>
		<p class="note">
			Alignment: {align.join(', ') || 'none'} · Size: {size.join(', ') || 'none'}
		</p>
	</section>

	<section aria-labelledby="toggle-group-vertical">
		<h2 id="toggle-group-vertical">Vertical, icons with text</h2>
		<p>
			With <code>orientation="vertical"</code> the items stack; children show next to the icon.
		</p>
		<ToggleGroup.Root
			bind:value={tool}
			orientation="vertical"
			deselectable={false}
			aria-label="Tool"
		>
			<ToggleGroup.Item value="pen" icon={Pencil}>Pen</ToggleGroup.Item>
			<ToggleGroup.Item value="marker" icon={Highlighter}>Marker</ToggleGroup.Item>
			<ToggleGroup.Item value="eraser" icon={Eraser}>Eraser</ToggleGroup.Item>
		</ToggleGroup.Root>
		<p class="note">Tool: {tool.join(', ')}</p>
	</section>

	<section aria-labelledby="toggle-group-disabled">
		<h2 id="toggle-group-disabled">Disabled</h2>
		<p>A single item, or the whole group, can be disabled; the arrows skip disabled items.</p>
		<div class="row">
			<ToggleGroup.Root
				defaultValue={['bold']}
				multiple
				aria-label="Style with a disabled item"
			>
				<ToggleGroup.Item value="bold" icon={Bold} label="Bold" />
				<ToggleGroup.Item value="italic" icon={Italic} label="Italic" disabled />
				<ToggleGroup.Item value="underline" icon={Underline} label="Underline" />
			</ToggleGroup.Root>
			<ToggleGroup.Root
				defaultValue={['bold']}
				multiple
				disabled
				aria-label="Style (disabled)"
			>
				<ToggleGroup.Item value="bold" icon={Bold} label="Bold" />
				<ToggleGroup.Item value="italic" icon={Italic} label="Italic" />
				<ToggleGroup.Item value="underline" icon={Underline} label="Underline" />
			</ToggleGroup.Root>
		</div>
	</section>
</main>

<style>
	.sample {
		margin: 0;
		font: var(--oito2-type-body-large);
	}
</style>
