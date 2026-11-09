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
	import {
		ListBox,
		ListCollection,
		SelectionController,
		Switch,
		TextArea,
		useTheme
	} from '@oito2/ui';
	import {
		CodeBlock,
		Highlighter,
		HighlighterTheme,
		defaultLanguages,
		type SyntaxRole
	} from '@oito2/ui-syntax';
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
	let detected = $state<string | null>(null);

	const terminal = '$ pnpm add @oito2/ui-syntax\nDone in 1.2s';

	const snippet = "const greeting = 'Hello'; // say hi";
	const runs = Highlighter.instance.highlight(snippet, { language: 'ts' }).runs;

	const theme = useTheme();
	const roles: SyntaxRole[] = [
		'foreground',
		'comment',
		'keyword',
		'string',
		'number',
		'function',
		'type',
		'tag',
		'attribute',
		'constant',
		'invalid'
	];
	let scopeStyles = $derived(HighlighterTheme.fromPalette(theme.current.syntax));
	const sampleScopes = ['keyword', 'string', 'comment', 'title.function', 'built_in', 'strong'];
</script>

<main class="showcase-page">
	<p>
		<code>CodeBlock</code> shows read-only, highlighted code: highlight.js grammars colored with the
		syntax roles of the active color scheme, in JetBrains Mono. The text can be selected, long lines
		scroll instead of wrapping, and a button copies the code.
	</p>

	<section aria-labelledby="code-block-languages">
		<h2 id="code-block-languages">Languages</h2>
		<p>Pick one of the {languages.length} default languages.</p>
		<div class="row">
			<label class="row">Line numbers <Switch bind:checked={showLineNumbers} /></label>
			<label class="row">Copy button <Switch bind:checked={showCopyButton} /></label>
		</div>
		<div class="code-block-layout">
			<ListBox.Root
				collection={languages}
				controller={picked}
				aria-label="Language"
				class="code-block-languages"
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

	<section aria-labelledby="code-block-detect">
		<h2 id="code-block-detect">Detecting the language</h2>
		<p>
			With <code>autoDetect</code> and no <code>language</code>, the block guesses the
			language among the registered ones. Paste some code to try it.
		</p>
		<label class="column code-block-field">
			Code
			<TextArea bind:value={pasted} rows={4} spellcheck="false" />
		</label>
		<p role="status">Detected: {detected ?? 'none'}</p>
		<CodeBlock
			code={pasted}
			autoDetect
			label="Detected code"
			onLanguageDetected={(language) => (detected = language)}
		/>
	</section>

	<section aria-labelledby="code-block-plain">
		<h2 id="code-block-plain">Plain text</h2>
		<p>Without a language, or with one that isn't registered, the code shows as plain text.</p>
		<CodeBlock
			code={terminal}
			language="console-log"
			showCopyButton={false}
			label="Terminal output"
		/>
	</section>

	<section aria-labelledby="code-block-highlighter">
		<h2 id="code-block-highlighter">Highlighter</h2>
		<p>
			<code>Highlighter</code> splits code into runs, each with a highlight.js scope and the
			palette role that colors it, for apps that draw code themselves.
			<code>Highlighter.instance</code> knows the default languages.
		</p>
		<CodeBlock
			code={snippet}
			language="ts"
			showCopyButton={false}
			label="Highlighted snippet"
		/>
		<ul class="code-block-runs">
			{#each runs as run, index (index)}
				<li>
					<code style:color="var(--oito2-syntax-{run.role})"
						>{JSON.stringify(run.text)}</code
					>
					<span class="note">{run.scope ?? 'plain'} → {run.role}</span>
				</li>
			{/each}
		</ul>
	</section>

	<section aria-labelledby="code-block-theme">
		<h2 id="code-block-theme">Syntax palette and highlighter theme</h2>
		<p>
			Every color scheme has a syntax palette; change the scheme of the showcase to see it
			change. <code>HighlighterTheme.fromPalette</code> turns a palette into highlight.js
			scope styles, for code highlighted outside a <code>CodeBlock</code>.
		</p>
		<ul class="code-block-palette">
			{#each roles as role (role)}
				<li>
					<span class="code-block-swatch" style:background="var(--oito2-syntax-{role})"
					></span>
					<span>{role}</span>
					<code class="note">{theme.current.syntax[role]}</code>
				</li>
			{/each}
		</ul>
		<ul class="code-block-runs">
			{#each sampleScopes as scope (scope)}
				{@const style = scopeStyles[scope]}
				<li>
					<code
						style:color={style?.color}
						style:font-style={style?.fontStyle}
						style:font-weight={style?.fontWeight}>{scope}</code
					>
					<span class="note">{JSON.stringify(style)}</span>
				</li>
			{/each}
		</ul>
	</section>
</main>

<style>
	.code-block-layout {
		display: grid;
		grid-template-columns: 180px minmax(0, 1fr);
		align-items: start;
		gap: var(--oito2-space-md);
	}

	.code-block-layout :global(.code-block-languages) {
		max-height: 420px;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-large);
		background: var(--oito2-color-surface-container-lowest);
	}

	.code-block-field {
		max-width: 640px;
	}

	.code-block-runs,
	.code-block-palette {
		display: grid;
		gap: var(--oito2-space-xs);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.code-block-runs li,
	.code-block-palette li {
		display: flex;
		align-items: center;
		gap: var(--oito2-space-md);
	}

	.code-block-palette {
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	}

	.code-block-swatch {
		width: 20px;
		height: 20px;
		border: 1px solid var(--oito2-color-outline-variant);
		border-radius: var(--oito2-radius-small);
	}
</style>
