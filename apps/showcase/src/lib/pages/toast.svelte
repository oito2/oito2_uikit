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
	import { Button, toast, type InfoType, type ToastHandle } from '@oito2/ui';
	import { onDestroy } from 'svelte';

	const types: InfoType[] = ['information', 'success', 'warning', 'danger', 'important'];

	let persistent = $state<ToastHandle | null>(null);
	let progressTimer: ReturnType<typeof setInterval> | undefined;
	let messages = 0;

	/** Shows a toast that waits on a promise that settles after 1.5 seconds. */
	function slowUpload() {
		void toast.promise(
			new Promise<number>((resolve, reject) =>
				setTimeout(
					() => (Math.random() > 0.3 ? resolve(3) : reject(new Error('offline'))),
					1500
				)
			),
			{
				loading: { title: 'Uploading 3 files…' },
				success: (n) => ({ title: `Uploaded ${n} files`, type: 'success' }),
				error: () => ({
					title: 'Upload failed',
					description: 'The server could not be reached.',
					type: 'danger',
					actionLabel: 'Retry',
					onAction: slowUpload
				})
			}
		);
	}

	/** Shows a toast that stays until dismissed, keeping its handle. */
	function showPersistent() {
		persistent?.dismiss();
		persistent = toast({
			title: 'Connected to the printer',
			description: 'This toast stays until it is closed.',
			duration: null
		});
	}

	/** Updates one toast with a progress count every half second, then marks it done. */
	function showProgress() {
		clearInterval(progressTimer);
		let percent = 0;
		const handle = toast({ title: 'Exporting… 0%', loading: true, duration: null });
		progressTimer = setInterval(() => {
			percent += 20;
			if (percent >= 100) {
				clearInterval(progressTimer);
				handle.update({ title: 'Export finished', type: 'success' });
			} else {
				handle.update({ title: `Exporting… ${percent}%`, loading: true, duration: null });
			}
		}, 500);
	}

	/** Shows five toasts at once; the ones past the visible limit wait their turn. */
	function showMany() {
		for (let i = 0; i < 5; i++) toast(`Message ${++messages}`);
	}

	onDestroy(() => clearInterval(progressTimer));
</script>

<main class="showcase-page">
	<p>
		<code>toast()</code> shows a short message in the app's <code>Toaster</code>, which this
		showcase renders once at the bottom end of the window. A toast closes after its
		<code>duration</code>; the timers pause while the pointer is over the toasts. The call
		returns a handle that updates or dismisses it.
	</p>

	<section aria-labelledby="toast-types">
		<h2 id="toast-types">Types</h2>
		<div class="row">
			<Button variant="tonal" onclick={() => toast('Settings saved')}>Plain</Button>
			{#each types as type (type)}
				<Button
					variant="outlined"
					onclick={() =>
						toast({
							title: `A ${type} message`,
							description: 'With a description.',
							type
						})}>{type}</Button
				>
			{/each}
		</div>
	</section>

	<section aria-labelledby="toast-action">
		<h2 id="toast-action">Action and persistence</h2>
		<p>
			An action button runs <code>onAction</code> and closes the toast. With
			<code>duration: null</code> a toast stays until closed, here from its handle.
		</p>
		<div class="row">
			<Button
				variant="tonal"
				onclick={() =>
					toast({
						title: 'Message deleted',
						actionLabel: 'Undo',
						onAction: () => toast({ title: 'Message restored', type: 'success' })
					})}>With an action</Button
			>
			<Button variant="tonal" onclick={showPersistent}>Persistent</Button>
			<Button
				variant="text"
				disabled={!persistent?.isActive}
				onclick={() => persistent?.dismiss()}>Close it</Button
			>
		</div>
	</section>

	<section aria-labelledby="toast-progress">
		<h2 id="toast-progress">Loading, promises and updates</h2>
		<p>
			<code>toast.promise</code> shows a loading toast until the promise settles, then its
			outcome; this upload fails three times in ten. <code>update</code> replaces a toast's content
			in place.
		</p>
		<div class="row">
			<Button variant="tonal" onclick={slowUpload}>Upload</Button>
			<Button variant="tonal" onclick={showProgress}>Export with progress</Button>
		</div>
	</section>

	<section aria-labelledby="toast-queue">
		<h2 id="toast-queue">Queue</h2>
		<p>
			The toaster shows a few toasts at a time; the rest wait their turn.
			<code>toast.dismissAll()</code> closes every toast, shown or waiting.
		</p>
		<div class="row">
			<Button variant="tonal" onclick={showMany}>Five at once</Button>
			<Button variant="outlined" onclick={() => toast.dismissAll()}>Dismiss all</Button>
		</div>
	</section>
</main>
