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
	import { ListBox, ListCollection, SelectionController, Switch } from '@oito2/ui';
	import { CodeBlock, Highlighter, defaultLanguages } from '@oito2/ui-syntax';
	import { codeSamples } from '#lib/code-samples.js';

	const languages = new ListCollection(Object.keys(defaultLanguages).sort());
	const picked = new SelectionController(languages, {
		deselectable: false,
		initialValues: ['typescript']
	});
	let language = $derived(picked.firstSelectedValue ?? 'typescript');
	let showLineNumbers = $state(true);
	let showCopyButton = $state(true);

	let pasted = $state((codeSamples.rust ?? '').trimEnd());
	let guess = $derived(Highlighter.instance.highlight(pasted, { autoDetect: true }).language);
</script>

<main>
	<h1>Code</h1>
	<p>
		The code block of <code>@oito2/ui-syntax</code>: highlight.js grammars colored with the
		syntax roles of the active scheme, in JetBrains Mono.
	</p>

	<section aria-labelledby="languages">
		<h2 id="languages">Languages</h2>
		<div class="row">
			<label class="row">Line numbers <Switch bind:checked={showLineNumbers} /></label>
			<label class="row">Copy button <Switch bind:checked={showCopyButton} /></label>
		</div>
		<div class="layout">
			<ListBox.Root
				collection={languages}
				controller={picked}
				aria-label="Language"
				class="languages"
			/>
			<CodeBlock
				code={(codeSamples[language] ?? '').trimEnd()}
				{language}
				{showLineNumbers}
				{showCopyButton}
				label="{language} sample"
			/>
		</div>
	</section>

	<section aria-labelledby="detect">
		<h2 id="detect">Detecting the language</h2>
		<label class="field">
			Code
			<textarea bind:value={pasted} rows="4" spellcheck="false"></textarea>
		</label>
		<p>Detected: {guess ?? 'none'}</p>
		<CodeBlock code={pasted} autoDetect label="Detected code" />
	</section>
</main>

<style>
	main {
		display: grid;
		gap: var(--oito2-space-xl);
		padding: var(--oito2-space-xl);
	}

	h1,
	h2,
	p {
		margin: 0 0 var(--oito2-space-sm);
	}

	section {
		display: grid;
		gap: var(--oito2-space-md);
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--oito2-space-md);
	}

	.layout {
		display: grid;
		grid-template-columns: 180px minmax(0, 1fr);
		align-items: start;
		gap: var(--oito2-space-md);
	}

	.layout :global(.languages) {
		max-height: 420px;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
		background: var(--oito2-color-surface-container-lowest);
	}

	.field {
		display: grid;
		gap: var(--oito2-space-xs);
		max-width: 640px;
	}

	textarea {
		font-family: 'JetBrains Mono', monospace;
		font-size: 13px;
	}
</style>
