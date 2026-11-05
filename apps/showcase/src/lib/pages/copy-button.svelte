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
	import { CopyButton, CopyField, Field } from '@oito2/ui';

	let status = $state('Nothing copied yet.');
	let copies = $state(0);
</script>

<main class="showcase-page">
	<p>
		<code>CopyButton</code> is an icon button that copies <code>text</code> to the clipboard.
		After a copy the icon turns into a check mark and the label into "Copied", and screen
		readers hear it; when the platform refuses the copy it shows a cross and "Couldn't copy".
		<code>CopyField</code> is a read-only field with a copy button at its end.
	</p>

	<section aria-labelledby="copy-button-basic">
		<h2 id="copy-button-basic">Copy button</h2>
		<p>
			<code>onCopied</code> runs after each copy and <code>onError</code> receives the error when
			the copy fails, such as in a browser without clipboard permission.
		</p>
		<div class="row">
			<code class="snippet">pnpm add @oito2/ui</code>
			<CopyButton
				text="pnpm add @oito2/ui"
				label="Copy the install command"
				onCopied={() => {
					copies++;
					status = 'The install command was copied.';
				}}
				onError={() => (status = "The browser didn't allow the copy.")}
			/>
		</div>
		<p class="note" aria-live="polite">{status} Copies: {copies}.</p>
	</section>

	<section aria-labelledby="copy-button-feedback">
		<h2 id="copy-button-feedback">Feedback duration and disabled</h2>
		<p>
			<code>feedbackDuration</code> sets how long the check mark shows, 1500 milliseconds by default.
		</p>
		<div class="row">
			<CopyButton text="Short feedback" label="Copy, short feedback" feedbackDuration={500} />
			<CopyButton text="Long feedback" label="Copy, long feedback" feedbackDuration={4000} />
			<CopyButton text="Unavailable" label="Copy (disabled)" disabled />
		</div>
	</section>

	<section aria-labelledby="copy-button-field">
		<h2 id="copy-button-field">Copy field</h2>
		<p>
			<code>CopyField</code> shows a value, such as a link or a token, ready to copy. With
			<code>obscure</code> the value shows as dots, for a secret; inside a
			<code>Field.Root</code>
			it takes the field's label.
		</p>
		<div class="fields">
			<CopyField value="https://oito2.github.io/oito2_uikit/" aria-label="Share link" />
			<Field.Root>
				<Field.Label>API token</Field.Label>
				<CopyField value="token-1234567890" obscure />
				<Field.Helper>Keep it secret: anyone with it can use your account.</Field.Helper>
			</Field.Root>
			<Field.Root disabled>
				<Field.Label>Old token</Field.Label>
				<CopyField value="token-revoked" disabled />
			</Field.Root>
		</div>
	</section>
</main>

<style>
	.snippet {
		padding: var(--oito2-space-xs) var(--oito2-space-sm);
		border-radius: var(--oito2-radius-small);
		background: var(--oito2-color-surface-container-high);
	}

	.fields {
		display: grid;
		gap: var(--oito2-space-md);
		max-width: 360px;
	}
</style>
