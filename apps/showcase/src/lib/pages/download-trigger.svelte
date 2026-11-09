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
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import { Button, TextArea } from '@oito2/ui';
	import { DownloadTrigger, Downloads } from '@oito2/ui-files';

	const encoder = new TextEncoder();

	let note = $state('Remember to water the plants.\n');
	let noteResult = $state('');

	const rows = [
		['Fruit', 'Color', 'Price'],
		['Apple', 'Red', '1.20'],
		['Banana', 'Yellow', '0.50'],
		['Plum', 'Purple', '2.10']
	];
	let csvResult = $state('');

	let slowResult = $state('');
	let failResult = $state('');
	let directResult = $state('');
	const supported = Downloads.isSupported();

	/** Builds a report after a pause, as a slow export would. */
	async function slowReport(): Promise<Uint8Array> {
		await new Promise((resolve) => setTimeout(resolve, 1500));
		return encoder.encode(`Report generated at ${new Date().toISOString()}\n`);
	}

	/** Fails, as an export whose source is unavailable would. */
	function failing(): Uint8Array {
		throw new Error('The report source is unavailable.');
	}

	/** Saves a JSON file through `Downloads`, without a trigger button. */
	async function saveJson() {
		try {
			const saved = await Downloads.save({
				fileName: 'settings.json',
				mimeType: 'application/json',
				bytes: encoder.encode(JSON.stringify({ theme: 'dark', density: 'touch' }, null, 2))
			});
			directResult = saved ? 'Saved.' : 'Canceled.';
		} catch (error) {
			directResult = `Failed: ${String(error)}`;
		}
	}

	/** Describes the outcome of a save. */
	const outcome = (saved: boolean) => (saved ? 'Saved.' : 'Canceled.');
</script>

<main class="showcase-page">
	<p>
		<code>DownloadTrigger</code> is a button that builds a file when clicked and saves it: a
		download in a browser, the “Save as” dialog in Tauri. While the content is being built it
		shows a spinner. <code>Downloads</code> saves bytes from code.
		{supported ? '' : 'Saving files is not supported here, so the buttons are disabled.'}
	</p>

	<section aria-labelledby="download-trigger-text">
		<h2 id="download-trigger-text">A file built from the page</h2>
		<label class="column download-trigger-field">
			Content
			<TextArea bind:value={note} rows={3} />
		</label>
		<div class="row">
			<DownloadTrigger
				fileName="note.txt"
				mimeType="text/plain"
				data={() => encoder.encode(note)}
				onSaved={(saved) => (noteResult = outcome(saved))}
			/>
			{#if noteResult}<span role="status">{noteResult}</span>{/if}
		</div>
	</section>

	<section aria-labelledby="download-trigger-label">
		<h2 id="download-trigger-label">Custom label</h2>
		<p>The children replace the localized “Download” label.</p>
		<div class="row">
			<DownloadTrigger
				fileName="fruits.csv"
				mimeType="text/csv"
				data={() => encoder.encode(rows.map((row) => row.join(',')).join('\n') + '\n')}
				onSaved={(saved) => (csvResult = outcome(saved))}
			>
				<FileSpreadsheet aria-hidden="true" size={18} />
				Export CSV
			</DownloadTrigger>
			{#if csvResult}<span role="status">{csvResult}</span>{/if}
		</div>
	</section>

	<section aria-labelledby="download-trigger-async">
		<h2 id="download-trigger-async">Slow content and failures</h2>
		<p>
			<code>data</code> can be asynchronous: the button waits for it. When building or saving
			fails, <code>onError</code> receives the error.
		</p>
		<div class="row">
			<DownloadTrigger
				fileName="report.txt"
				mimeType="text/plain"
				data={slowReport}
				onSaved={(saved) => (slowResult = outcome(saved))}>Slow report</DownloadTrigger
			>
			<DownloadTrigger
				fileName="broken.txt"
				data={failing}
				onSaved={(saved) => (failResult = outcome(saved))}
				onError={(error) =>
					(failResult = `Failed: ${error instanceof Error ? error.message : String(error)}`)}
				>Broken report</DownloadTrigger
			>
		</div>
		<p class="note" role="status">
			{[
				slowResult && `Slow report: ${slowResult}`,
				failResult && `Broken report: ${failResult}`
			]
				.filter(Boolean)
				.join(' ') || 'Nothing saved yet.'}
		</p>
	</section>

	<section aria-labelledby="download-trigger-disabled">
		<h2 id="download-trigger-disabled">Disabled</h2>
		<div class="row">
			<DownloadTrigger fileName="nothing.txt" data={() => new Uint8Array()} enabled={false} />
		</div>
	</section>

	<section aria-labelledby="download-trigger-downloads">
		<h2 id="download-trigger-downloads">Saving from code</h2>
		<p>
			<code>Downloads.save</code> resolves to whether the file was saved;
			<code>Downloads.isSupported</code> says whether the platform can save files.
		</p>
		<div class="row">
			<Button variant="tonal" disabled={!supported} onclick={saveJson}
				>Save settings.json</Button
			>
			{#if directResult}<span role="status">{directResult}</span>{/if}
		</div>
	</section>
</main>

<style>
	.download-trigger-field {
		max-width: 480px;
	}
</style>
