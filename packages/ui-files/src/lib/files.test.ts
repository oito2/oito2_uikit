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

import { describe, expect, it } from 'vitest';
import type { FilesAdapter } from './adapters/adapter.js';
import { dialogFilters, dropPositionToCss } from './adapters/tauri.js';
import { Downloads } from './downloads.js';
import {
	acceptAttribute,
	baseName,
	extensionOf,
	extensionsForMimeType,
	fileMatchesTypes,
	isPreviewableImage,
	mimeTypeOf,
	type FileTypeGroup,
	type PickedFile
} from './files.js';
import { FileUploadController } from './upload-controller.svelte.js';

const images: FileTypeGroup = {
	label: 'Images',
	extensions: ['png', 'jpg'],
	mimeTypes: ['image/*']
};

/** Returns a fake file of `size` bytes whose size takes a moment to read. */
function file(
	name: string,
	size: number,
	options: { mimeType?: string | null; isDirectory?: boolean } = {}
): PickedFile {
	return {
		name,
		path: null,
		mimeType: options.mimeType ?? null,
		isDirectory: options.isDirectory ?? false,
		size: () => new Promise((resolve) => setTimeout(() => resolve(size), 1)),
		bytes: () => Promise.resolve(new Uint8Array(size))
	};
}

describe('file types', () => {
	it('matches extensions, MIME types and wildcards', () => {
		expect(fileMatchesTypes(file('a.PNG', 1), [images])).toBe(true);
		expect(fileMatchesTypes(file('a', 1, { mimeType: 'image/webp' }), [images])).toBe(true);
		expect(fileMatchesTypes(file('a.pdf', 1), [images])).toBe(false);
		expect(fileMatchesTypes(file('a.txt', 1), [{ extensions: ['.TXT'] }])).toBe(true);
		expect(
			fileMatchesTypes(file('a.pdf', 1, { mimeType: 'application/pdf' }), [
				{ mimeTypes: ['application/pdf'] }
			])
		).toBe(true);
	});

	it('accepts every file without groups, or with a group without filters', () => {
		expect(fileMatchesTypes(file('a.pdf', 1), [])).toBe(true);
		expect(fileMatchesTypes(file('a.pdf', 1), [{ label: 'All' }])).toBe(true);
	});

	it('builds the file input accept attribute and the dialog filters', () => {
		expect(acceptAttribute([images, { extensions: ['.pdf'] }])).toBe('.png,.jpg,image/*,.pdf');
		expect(acceptAttribute([])).toBeUndefined();
		expect(acceptAttribute([{ label: 'All' }, images])).toBeUndefined();
		expect(
			dialogFilters([
				{ label: 'Images', extensions: ['png', 'jpg'] },
				{ label: 'Docs', extensions: ['.pdf'] },
				{ mimeTypes: ['application/x-unknown'] }
			])
		).toEqual([
			{ name: 'Images', extensions: ['png', 'jpg'] },
			{ name: 'Docs', extensions: ['pdf'] }
		]);
		expect(dialogFilters([{ extensions: ['txt', 'md'] }])).toEqual([
			{ name: 'txt, md', extensions: ['txt', 'md'] }
		]);
		expect(dialogFilters([{ label: 'All' }, images])).toEqual([]);
	});

	it('maps MIME types to the extensions of the table, for the dialog filters too', () => {
		expect(extensionsForMimeType('application/pdf')).toEqual(['pdf']);
		expect(extensionsForMimeType('IMAGE/JPEG')).toEqual(['jpg', 'jpeg']);
		expect(extensionsForMimeType('audio/*')).toEqual(
			expect.arrayContaining(['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus'])
		);
		expect(extensionsForMimeType('application/x-unknown')).toEqual([]);
		expect(dialogFilters([{ mimeTypes: ['application/pdf'] }])).toEqual([
			{ name: 'pdf', extensions: ['pdf'] }
		]);
		expect(dialogFilters([{ label: 'Images', mimeTypes: ['image/*'] }])).toEqual([
			{ name: 'Images', extensions: extensionsForMimeType('image/*') }
		]);
		expect(extensionsForMimeType('image/*')).toEqual(
			expect.arrayContaining(['png', 'jpg', 'webp', 'tiff', 'heic', 'ico'])
		);
		const merged = dialogFilters([images])[0]?.extensions ?? [];
		expect(merged.slice(0, 2)).toEqual(['png', 'jpg']);
		expect(merged).toContain('webp');
		expect(new Set(merged).size).toBe(merged.length);
	});

	it('converts drop positions to CSS pixels on Windows only', () => {
		expect(dropPositionToCss({ x: 200, y: 100 }, true, 2)).toEqual({ x: 100, y: 50 });
		expect(dropPositionToCss({ x: 200, y: 100 }, true, 1)).toEqual({ x: 200, y: 100 });
		expect(dropPositionToCss({ x: 200, y: 100 }, true, 0)).toEqual({ x: 200, y: 100 });
		expect(dropPositionToCss({ x: 200, y: 100 }, false, 2)).toEqual({ x: 200, y: 100 });
		expect(dropPositionToCss({ x: 200, y: 100 }, false, 1)).toEqual({ x: 200, y: 100 });
	});

	it('reads names, extensions and MIME types', () => {
		expect(baseName('/home/ana/Fotos/praia.JPG')).toBe('praia.JPG');
		expect(baseName('C:\\Users\\ana\\nota.txt')).toBe('nota.txt');
		expect(extensionOf('praia.JPG')).toBe('jpg');
		expect(extensionOf('README')).toBeNull();
		expect(mimeTypeOf('praia.JPG')).toBe('image/jpeg');
		expect(mimeTypeOf('a.unknown')).toBeNull();
		expect(mimeTypeOf('a.toString')).toBeNull();
		expect(isPreviewableImage(file('a.png', 1))).toBe(true);
		expect(isPreviewableImage(file('a.svg', 1))).toBe(false);
		expect(isPreviewableImage(file('a', 1, { mimeType: 'image/gif' }))).toBe(true);
	});
});

describe('FileUploadController', () => {
	it('refuses files by type, size, count and directories', async () => {
		const controller = new FileUploadController({
			accept: [images],
			maxFiles: 2,
			maxFileSize: 100
		});
		await controller.add([
			file('a.png', 10),
			file('b.pdf', 10),
			file('c.png', 500),
			file('photos', 0, { isDirectory: true }),
			file('d.jpg', 10),
			file('e.png', 10)
		]);
		expect(controller.files.map((f) => f.name)).toEqual(['a.png', 'd.jpg']);
		expect(controller.rejected.map((r) => [r.file.name, r.reason])).toEqual([
			['b.pdf', 'type'],
			['c.png', 'size'],
			['photos', 'directory'],
			['e.png', 'count']
		]);
		expect(controller.canAddMore).toBe(false);
	});

	it('refuses a file whose size fails to read and checks the count before reading', async () => {
		const unreadable = (name: string): PickedFile => ({
			...file(name, 1),
			size: () => Promise.reject(new Error('stat failed'))
		});
		const controller = new FileUploadController({ maxFiles: 2, maxFileSize: 100 });
		await controller.add([unreadable('gone.txt'), file('a.txt', 1)]);
		expect(controller.files.map((f) => f.name)).toEqual(['a.txt']);
		expect(controller.rejected.map((r) => [r.file.name, r.reason])).toEqual([
			['gone.txt', 'unreadable']
		]);
		await controller.add([file('b.txt', 1), unreadable('over.txt')]);
		expect(controller.files.map((f) => f.name)).toEqual(['a.txt', 'b.txt']);
		expect(controller.rejected.map((r) => [r.file.name, r.reason])).toEqual([
			['over.txt', 'count']
		]);
	});

	it('removes, clears the refusals and clears everything', async () => {
		const controller = new FileUploadController({ accept: [images] });
		await controller.add([file('a.png', 1), file('b.pdf', 1)]);
		controller.remove(controller.files[0] as PickedFile);
		expect(controller.files).toEqual([]);
		controller.clearRejected();
		expect(controller.rejected).toEqual([]);
		await controller.add([file('c.png', 1), file('d.pdf', 1)]);
		controller.clear();
		expect(controller.files).toEqual([]);
		expect(controller.rejected).toEqual([]);
	});

	it('keeps the file limit across overlapping adds and replaces the refusals', async () => {
		const controller = new FileUploadController({ maxFiles: 1, maxFileSize: 100 });
		await Promise.all([
			controller.add([file('a.txt', 1), file('b.txt', 1)]),
			controller.add([file('c.txt', 1)])
		]);
		expect(controller.files.map((f) => f.name)).toEqual(['a.txt']);
		expect(controller.rejected.map((r) => r.file.name)).toEqual(['c.txt']);
		const later = new FileUploadController({ accept: [images] });
		await later.add([file('b.pdf', 1)]);
		await later.add([file('c.png', 1)]);
		expect(later.rejected).toEqual([]);
		expect(later.files.map((f) => f.name)).toEqual(['c.png']);
	});

	it('drops additions still being checked once disposed, and rejects bad limits', async () => {
		const controller = new FileUploadController();
		const adding = controller.add([file('a.txt', 1)]);
		controller.dispose();
		await adding;
		expect(controller.files).toEqual([]);
		expect(() => new FileUploadController({ maxFiles: 0 })).toThrow(RangeError);
		expect(() => new FileUploadController({ maxFileSize: -1 })).toThrow(RangeError);
	});
});

describe('Downloads', () => {
	it('saves through the adapter and refuses where saving is not supported', async () => {
		const saved: string[] = [];
		const adapter: FilesAdapter = {
			canDropFiles: false,
			canSaveFiles: true,
			openFiles: () => Promise.resolve([]),
			saveFile: ({ fileName }) => {
				saved.push(fileName);
				return Promise.resolve(fileName !== 'cancel.txt');
			},
			dropTarget: () => () => {}
		};
		const bytes = new Uint8Array([1, 2, 3]);
		expect(await Downloads.save({ fileName: 'a.txt', bytes }, adapter)).toBe(true);
		expect(await Downloads.save({ fileName: 'cancel.txt', bytes }, adapter)).toBe(false);
		expect(saved).toEqual(['a.txt', 'cancel.txt']);
		const unsupported = { ...adapter, canSaveFiles: false };
		expect(Downloads.isSupported(unsupported)).toBe(false);
		await expect(Downloads.save({ fileName: 'a.txt', bytes }, unsupported)).rejects.toThrow();
	});
});
