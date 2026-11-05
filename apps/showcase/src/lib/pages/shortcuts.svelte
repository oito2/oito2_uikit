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
	import { resolve } from '$app/paths';
	import {
		KeyChord,
		Shortcut,
		ShortcutLabel,
		ShortcutRecorder,
		TextField,
		type OperatingSystem
	} from '@oito2/ui';

	const systems: OperatingSystem[] = ['linux', 'windows', 'macos'];

	const examples: { name: string; shortcut: Shortcut }[] = [
		{ name: 'Command palette', shortcut: Shortcut.primary('p', { shift: true }) },
		{ name: 'Close tab', shortcut: new Shortcut([new KeyChord('w', { primary: true })]) },
		{ name: 'Switch window', shortcut: Shortcut.parse('Alt+Tab') },
		{ name: 'Rename', shortcut: Shortcut.parse('F2') },
		{ name: 'Go to home', shortcut: Shortcut.parse('G H') },
		{ name: 'Move line up', shortcut: Shortcut.parse('Alt+Shift+Up') }
	];

	let recorded = $state<Shortcut | null>(Shortcut.parse('Mod+Shift+K'));
	let empty = $state<Shortcut | null>(null);

	let text = $state('Ctrl+Alt+Delete');
	let parsed = $derived.by(() => {
		try {
			return { shortcut: Shortcut.parse(text), error: null };
		} catch (error) {
			return {
				shortcut: null,
				error: error instanceof Error ? error.message : String(error)
			};
		}
	});
</script>

<main class="showcase-page">
	<p>
		A <code>KeyChord</code> is a key with the modifiers held while it is pressed; a
		<code>Shortcut</code> is one chord or a sequence of chords pressed in order.
		<code>ShortcutLabel</code> draws a shortcut as key caps in the platform's form, and
		<code>ShortcutRecorder</code> records one from the keyboard. The
		<a href={resolve('/[slug]', { slug: 'command-palette' })}>command palette</a> runs commands with
		them.
	</p>

	<section aria-labelledby="shortcuts-labels">
		<h2 id="shortcuts-labels">Labels on each platform</h2>
		<p>
			The <code>primary</code> modifier is Command on Apple systems and Control elsewhere.
			Without
			<code>os</code>, the label follows the closest <code>SystemScope</code>.
		</p>
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<div class="shortcut-scroll" tabindex="0" role="region" aria-label="Shortcuts by platform">
			<table class="shortcut-table">
				<caption class="note">The same shortcuts on this system and on three others</caption
				>
				<thead>
					<tr>
						<th scope="col">Action</th>
						<th scope="col">This system</th>
						{#each systems as os (os)}<th scope="col">{os}</th>{/each}
					</tr>
				</thead>
				<tbody>
					{#each examples as example (example.name)}
						<tr>
							<th scope="row">{example.name}</th>
							<td><ShortcutLabel shortcut={example.shortcut} /></td>
							{#each systems as os (os)}
								<td><ShortcutLabel shortcut={example.shortcut} {os} /></td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section aria-labelledby="shortcuts-recorder">
		<h2 id="shortcuts-recorder">Recorder</h2>
		<p>
			A click, Enter or Space starts recording and the next key with its modifiers becomes the
			shortcut. Escape cancels; Backspace, Delete or the clear button empty it.
		</p>
		<div class="row">
			<ShortcutRecorder bind:value={recorded} aria-label="Open the inspector" />
			<ShortcutRecorder bind:value={empty} aria-label="Toggle the sidebar" />
			<ShortcutRecorder value={Shortcut.parse('Mod+Q')} disabled aria-label="Quit (fixed)" />
		</div>
		<p class="note">
			Recorded: {recorded?.toString() ?? 'none'} · Second: {empty?.toString() ?? 'none'}
		</p>
	</section>

	<section aria-labelledby="shortcuts-parse">
		<h2 id="shortcuts-parse">Parsing</h2>
		<p>
			<code>Shortcut.parse</code> reads names such as <code>Mod+K</code>,
			<code>Ctrl+Shift+P</code> or the sequence <code>G H</code>, and throws on an unknown
			name.
		</p>
		<div class="row">
			<TextField bind:value={text} aria-label="Shortcut text" />
			{#if parsed.shortcut}
				<ShortcutLabel shortcut={parsed.shortcut} />
			{:else}
				<span class="note" role="status">{parsed.error}</span>
			{/if}
		</div>
	</section>
</main>

<style>
	.shortcut-scroll {
		overflow-x: auto;
	}

	.shortcut-table {
		border-collapse: collapse;
	}

	.shortcut-table caption {
		text-align: start;
		padding-block-end: var(--oito2-space-sm);
	}

	.shortcut-table th,
	.shortcut-table td {
		padding: var(--oito2-space-xs) var(--oito2-space-md) var(--oito2-space-xs) 0;
		text-align: start;
		white-space: nowrap;
	}

	.shortcut-table th[scope='col'] {
		color: var(--oito2-color-on-surface-variant);
		font: var(--oito2-type-label-large);
	}

	.shortcut-table th[scope='row'] {
		font-weight: normal;
	}
</style>
