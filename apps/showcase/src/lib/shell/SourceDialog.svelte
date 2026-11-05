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

<!-- The source of a showcase page in a code block, with a link to it on GitHub. -->
<script lang="ts">
	import { Button, Dialog } from '@oito2/ui';
	import { CodeBlock } from '@oito2/ui-syntax';
	import { loadSource, sourceUrl, type ShowcasePage } from '../catalog.js';

	interface Props {
		page: ShowcasePage;
		open: boolean;
	}

	let { page, open = $bindable() }: Props = $props();

	let source = $state('');
	$effect(() => {
		if (!open) return;
		let cancelled = false;
		void loadSource(page.slug).then((text) => {
			if (!cancelled) source = text;
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="showcase-source">
		<Dialog.TitleBar>{page.title} source</Dialog.TitleBar>
		<div class="code">
			<CodeBlock code={source} language="html" showLineNumbers label="{page.slug}.svelte" />
		</div>
		<Dialog.Actions>
			<Button variant="text" href={sourceUrl(page.slug)} target="_blank"
				>Open on GitHub</Button
			>
			<Dialog.Close>Close</Dialog.Close>
		</Dialog.Actions>
	</Dialog.Content>
</Dialog.Root>

<style>
	:global(.showcase-source) {
		width: min(960px, 100%);
	}

	.code {
		min-height: 0;
		max-height: 70vh;
		overflow: auto;
	}
</style>
