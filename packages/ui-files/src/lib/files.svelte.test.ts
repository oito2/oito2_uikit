// Copyright (C) 2026  OITO2
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { emit } from '@tauri-apps/api/event';
import { clearMocks, mockIPC, mockWindows } from '@tauri-apps/api/mocks';
import axe from 'axe-core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import FilesHarness from '../tests/FilesHarness.svelte';
import type { FilesAdapter } from './adapters/adapter.js';
import { tauriFilesAdapter } from './adapters/tauri.js';
import { webFilesAdapter } from './adapters/web.js';
import { webFile, type PickedFile } from './files.js';
import { FileUploadController } from './upload-controller.svelte.js';

const el = (locator: { element(): Element }) => locator.element() as HTMLElement;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** A one-pixel red PNG. */
const png = Uint8Array.from(
	atob(
		'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=='
	),
	(char) => char.charCodeAt(0)
);

/** Returns a browser file named `name` with `bytes`. */
const browserFile = (name: string, bytes: BlobPart, type = '') => new File([bytes], name, { type });

/** Returns an adapter that hands `files` to the chooser and records the saves. */
function fakeAdapter(files: PickedFile[], saves: string[] = [], canSaveFiles = true): FilesAdapter {
	return {
		canDropFiles: true,
		canSaveFiles,
		openFiles: () => Promise.resolve(files),
		saveFile: async ({ fileName, bytes }) => {
			saves.push(`${fileName}:${new TextDecoder().decode(bytes)}`);
			return true;
		},
		dropTarget: webFilesAdapter().dropTarget
	};
}

beforeEach(async () => {
	await userEvent.unhover(document.body);
});

afterEach(() => {
	clearMocks();
});

describe('web adapter', () => {
	it('opens the file chooser with the accepted types and reads the chosen files', async () => {
		const adapter = webFilesAdapter();
		const picked = adapter.openFiles({
			accept: [{ label: 'Images', extensions: ['png'], mimeTypes: ['image/*'] }],
			multiple: true
		});
		const input = document.querySelector<HTMLInputElement>('input[data-oito2-file-input]');
		expect(input?.accept).toBe('.png,image/*');
		expect(input?.multiple).toBe(true);
		const transfer = new DataTransfer();
		transfer.items.add(browserFile('a.png', png, 'image/png'));
		transfer.items.add(browserFile('notes.txt', 'hello'));
		(input as HTMLInputElement).files = transfer.files;
		input?.dispatchEvent(new Event('change'));
		const files = await picked;
		expect(files.map((file) => [file.name, file.mimeType, file.path])).toEqual([
			['a.png', 'image/png', null],
			['notes.txt', 'text/plain', null]
		]);
		expect(await files[1]?.size()).toBe(5);
		expect(new TextDecoder().decode(await files[1]?.bytes())).toBe('hello');
		expect(document.querySelector('input[data-oito2-file-input]')).toBeNull();

		const cancelled = adapter.openFiles({ accept: [], multiple: false });
		document.querySelector('input[data-oito2-file-input]')?.dispatchEvent(new Event('cancel'));
		expect(await cancelled).toEqual([]);
	});

	it('saves through a download link', async () => {
		const clicks: { name: string; href: string }[] = [];
		const click = HTMLAnchorElement.prototype.click;
		HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
			clicks.push({ name: this.download, href: this.href });
		};
		try {
			const saved = await webFilesAdapter().saveFile({
				fileName: 'report.txt',
				bytes: new TextEncoder().encode('hello'),
				mimeType: 'text/plain'
			});
			expect(saved).toBe(true);
			expect(clicks).toHaveLength(1);
			expect(clicks[0]?.name).toBe('report.txt');
			const blob = await (await fetch(clicks[0]?.href as string)).blob();
			expect([blob.type, await blob.text()]).toEqual(['text/plain', 'hello']);
		} finally {
			HTMLAnchorElement.prototype.click = click;
		}
	});

	it('lights the drop zone while files are dragged over it and hands over the drop', async () => {
		const props = $state({
			show: 'zone',
			adapter: webFilesAdapter(),
			dropped: [] as PickedFile[]
		});
		render(FilesHarness, props);
		const zone = el(page.getByTestId('zone'));
		await expect
			.element(page.getByTestId('zone'))
			.toHaveAccessibleName(/^Drop files here\s*Choose files$/);
		await expect.element(page.getByTestId('zone')).toHaveAccessibleDescription('PNG or PDF');
		const transfer = new DataTransfer();
		transfer.items.add(browserFile('a.png', png, 'image/png'));
		const drag = (type: string) =>
			zone.dispatchEvent(
				new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: transfer })
			);
		drag('dragenter');
		await expect.element(page.getByTestId('zone')).toHaveAttribute('data-dragging', '');
		drag('dragover');
		drag('dragleave');
		await expect.element(page.getByTestId('zone')).not.toHaveAttribute('data-dragging');
		drag('dragenter');
		drag('drop');
		await expect.element(page.getByTestId('zone')).not.toHaveAttribute('data-dragging');
		await expect.poll(() => props.dropped.map((file) => file.name)).toEqual(['a.png']);
	});
});

describe('Tauri adapter', () => {
	/** Mocks the dialog, fs and path commands, recording each call. */
	function mockTauri(calls: string[], options: { saveTo?: string | null } = {}) {
		mockWindows('main');
		mockIPC(
			(cmd, args) => {
				const payload = args as Record<string, unknown>;
				calls.push(cmd);
				switch (cmd) {
					case 'plugin:dialog|open':
						return ['/home/ana/Pictures/a.png', '/home/ana/notes.txt'];
					case 'plugin:dialog|save':
						return options.saveTo === undefined
							? '/home/ana/Downloads/report.txt'
							: options.saveTo;
					case 'plugin:fs|stat':
						return {
							isFile: !String(payload.path).endsWith('photos'),
							isDirectory: String(payload.path).endsWith('photos'),
							isSymlink: false,
							size: 42,
							mtime: null,
							atime: null,
							birthtime: null,
							readonly: false,
							fileAttributes: null,
							dev: null,
							ino: null,
							mode: null,
							nlink: null,
							uid: null,
							gid: null,
							rdev: null,
							blksize: null,
							blocks: null
						};
					case 'plugin:fs|read_file':
						return [1, 2, 3];
					case 'plugin:fs|write_file':
						return null;
					case 'plugin:path|resolve_directory':
						return '/home/ana/Downloads';
					case 'plugin:path|join':
						return (payload.paths as string[]).join('/');
					default:
						return null;
				}
			},
			{ shouldMockEvents: true }
		);
	}

	it('opens the dialog with the filters and reads the chosen paths', async () => {
		const calls: string[] = [];
		mockTauri(calls);
		const files = await tauriFilesAdapter().openFiles({
			accept: [{ label: 'Images', extensions: ['png'] }],
			multiple: true
		});
		expect(files.map((file) => [file.name, file.path, file.mimeType])).toEqual([
			['a.png', '/home/ana/Pictures/a.png', 'image/png'],
			['notes.txt', '/home/ana/notes.txt', 'text/plain']
		]);
		expect(await files[0]?.size()).toBe(42);
		expect([...((await files[0]?.bytes()) ?? [])]).toEqual([1, 2, 3]);
		expect(calls).toEqual(['plugin:dialog|open', 'plugin:fs|stat', 'plugin:fs|read_file']);
	});

	it('saves in the place the dialog returns and reports a cancel', async () => {
		const calls: string[] = [];
		mockTauri(calls);
		const bytes = new TextEncoder().encode('hello');
		expect(await tauriFilesAdapter().saveFile({ fileName: 'report.txt', bytes })).toBe(true);
		expect(calls).toContain('plugin:dialog|save');
		expect(calls.at(-1)).toBe('plugin:fs|write_file');
		clearMocks();
		const cancelled: string[] = [];
		mockTauri(cancelled, { saveTo: null });
		expect(await tauriFilesAdapter().saveFile({ fileName: 'report.txt', bytes })).toBe(false);
		expect(cancelled).not.toContain('plugin:fs|write_file');
	});

	it('takes drops over the element and marks folders', async () => {
		const calls: string[] = [];
		mockTauri(calls);
		const element = document.createElement('div');
		element.style.cssText = 'position: fixed; left: 0; top: 0; width: 200px; height: 100px';
		document.body.append(element);
		const hovers: boolean[] = [];
		const drops: PickedFile[][] = [];
		const stop = tauriFilesAdapter().dropTarget(element, {
			onHover: (dragging) => hovers.push(dragging),
			onDrop: (files) => drops.push(files)
		});
		await wait(50);
		const ratio = window.devicePixelRatio || 1;
		const at = (x: number, y: number) => ({ x: x * ratio, y: y * ratio });
		await emit('tauri://drag-over', { position: at(50, 50) });
		await emit('tauri://drag-over', { position: at(400, 50) });
		await emit('tauri://drag-drop', { paths: ['/tmp/a.png'], position: at(400, 50) });
		await emit('tauri://drag-drop', {
			paths: ['/tmp/b.pdf', '/tmp/photos'],
			position: at(20, 20)
		});
		await expect.poll(() => drops.length).toBe(1);
		expect(drops[0]?.map((file) => [file.name, file.isDirectory])).toEqual([
			['b.pdf', false],
			['photos', true]
		]);
		expect(hovers).toEqual([true, false]);
		stop();
		element.remove();
	});
});

describe('FileUpload', () => {
	it('lists the chosen files with size and preview, refuses the others and removes them', async () => {
		const controller = new FileUploadController({
			accept: [{ label: 'Images', extensions: ['png'] }],
			maxFiles: 2,
			maxFileSize: 1000
		});
		const adapter = fakeAdapter([
			webFile(browserFile('a.png', png, 'image/png')),
			webFile(browserFile('b.pdf', 'pdf')),
			webFile(browserFile('c.png', new Uint8Array(2000), 'image/png')),
			webFile(browserFile('d.png', png, 'image/png'))
		]);
		render(FilesHarness, { show: 'upload', controller, adapter });
		const zone = page.getByRole('button', { name: /Choose files/ });
		await expect
			.element(zone)
			.toHaveAccessibleDescription(/^Accepted: Images · Up to .+ each$/);
		await zone.click();
		await expect.element(page.getByText('a.png')).toBeVisible();
		await expect.element(page.getByText('d.png')).toBeVisible();
		await expect.element(page.getByText('b.pdf: this file type is not accepted')).toBeVisible();
		await expect.element(page.getByText(/^c\.png: larger than/)).toBeVisible();
		await expect.element(page.getByText('70 B').first()).toBeVisible();
		await expect
			.poll(() => document.querySelector('li img')?.getAttribute('src'))
			.toMatch(/^blob:/);
		await expect.element(zone).toBeDisabled();
		await page.getByRole('button', { name: 'Close' }).click();
		expect(controller.rejected).toEqual([]);
		await page.getByRole('button', { name: 'Remove a.png' }).click();
		expect(controller.files.map((file) => file.name)).toEqual(['d.png']);
		await expect.element(zone).toBeEnabled();
	});
});

describe('DownloadTrigger', () => {
	it('builds and saves the file, and is disabled where saving is not supported', async () => {
		const saves: string[] = [];
		const props = $state({
			show: 'download',
			adapter: fakeAdapter([], saves),
			log: [] as string[]
		});
		render(FilesHarness, props);
		await page.getByRole('button', { name: 'Download' }).click();
		await expect.poll(() => props.log).toEqual(['saved:true']);
		expect(saves).toEqual(['report.txt:hello']);
		props.adapter = fakeAdapter([], saves, false);
		await expect.element(page.getByRole('button', { name: 'Download' })).toBeDisabled();
	});
});

const schemes = [
	{ name: 'light', mode: 'light', highContrast: false },
	{ name: 'dark', mode: 'dark', highContrast: false },
	{ name: 'light-hc', mode: 'light', highContrast: true }
] as const;

describe('files gallery', () => {
	beforeEach(async () => {
		await page.viewport(620, 640);
	});

	for (const scheme of schemes) {
		/** Renders the gallery with two accepted files and one refusal. */
		async function show() {
			const controller = new FileUploadController({
				accept: [{ label: 'Images', extensions: ['png'] }],
				maxFileSize: 1000
			});
			await controller.add([
				webFile(browserFile('holiday.png', png, 'image/png')),
				webFile(browserFile('screenshot.png', png, 'image/png')),
				webFile(browserFile('report.pdf', 'pdf'))
			]);
			render(FilesHarness, {
				show: 'gallery',
				mode: scheme.mode,
				highContrast: scheme.highContrast,
				controller,
				adapter: fakeAdapter([])
			});
			await document.fonts.ready;
			await expect
				.poll(() => document.querySelectorAll('li img[src^="blob:"]').length)
				.toBe(2);
			await wait(300);
		}

		it(`has no axe violations in ${scheme.name}`, async () => {
			await show();
			const result = await axe.run(page.getByTestId('gallery').element());
			const violations = result.violations.map(
				(v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
			);
			expect(violations).toEqual([]);
		});

		it(`matches the golden in ${scheme.name}`, async () => {
			await show();
			await expect(page.getByTestId('gallery')).toMatchScreenshot(`files-${scheme.name}`);
		});
	}
});
