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

/** An image a `CropController` can draw: a loaded image, a canvas or a bitmap. */
export type CropImage = HTMLImageElement | HTMLCanvasElement | ImageBitmap | OffscreenCanvas;

/** A size in pixels. */
export interface CropSize {
	readonly width: number;
	readonly height: number;
}

/** A pan in the crop box's pixels. */
export interface CropOffset {
	readonly x: number;
	readonly y: number;
}

/** Returns the pixel size of `image`. */
function sizeOf(image: CropImage): CropSize {
	return typeof HTMLImageElement !== 'undefined' && image instanceof HTMLImageElement
		? { width: image.naturalWidth, height: image.naturalHeight }
		: { width: image.width, height: image.height };
}

/**
 * The zoom, pan, rotation and flip of an `ImageCropper`, and the crop itself.
 *
 * Its state is reactive. The pan is in the crop box's pixels and is kept so the image
 * always covers the box.
 */
export class CropController {
	/** The largest zoom, as a multiple of the zoom that just covers the box. */
	readonly maxZoom: number;

	#image: CropImage | null = $state.raw(null);
	#box: CropSize = $state.raw({ width: 0, height: 0 });
	#zoom = $state(1);
	#offset: CropOffset = $state.raw({ x: 0, y: 0 });
	#quarterTurns = $state(0);
	#flipped = $state(false);

	/** Creates a crop controller that zooms up to `maxZoom`. Throws a `RangeError` when it is below 1. */
	constructor(options: { maxZoom?: number } = {}) {
		const maxZoom = options.maxZoom ?? 5;
		if (!(maxZoom >= 1)) throw new RangeError(`maxZoom must be at least 1: ${maxZoom}`);
		this.maxZoom = maxZoom;
	}

	/** The loaded image, or `null` while it loads. */
	get image(): CropImage | null {
		return this.#image;
	}

	/** The crop box size in pixels, set by the cropper's layout. */
	get boxSize(): CropSize {
		return this.#box;
	}

	/** The zoom, from 1 (the image just covers the box) to `maxZoom`. */
	get zoom(): number {
		return this.#zoom;
	}

	/** Sets the zoom, clamped from 1 to `maxZoom`, keeping the image over the box. */
	set zoom(value: number) {
		const next = Math.min(this.maxZoom, Math.max(1, value));
		if (next === this.#zoom) return;
		this.#zoom = next;
		this.#clampOffset();
	}

	/** The pan of the image center from the box center. */
	get offset(): CropOffset {
		return this.#offset;
	}

	/** The clockwise quarter turns applied to the image before the flip, from 0 to 3. */
	get quarterTurns(): number {
		return this.#quarterTurns;
	}

	/** Whether the image is mirrored horizontally. */
	get flipped(): boolean {
		return this.#flipped;
	}

	/** Multiplies the zoom by `factor`. */
	zoomBy(factor: number): void {
		this.zoom = this.#zoom * factor;
	}

	/** Moves the image by `dx` and `dy`, as far as the image still covers the box. */
	panBy(dx: number, dy: number): void {
		this.#offset = { x: this.#offset.x + dx, y: this.#offset.y + dy };
		this.#clampOffset();
	}

	/** Turns the image a quarter clockwise on screen. */
	rotateRight(): void {
		this.#turn(true);
	}

	/** Turns the image a quarter counterclockwise on screen. */
	rotateLeft(): void {
		this.#turn(false);
	}

	/**
	 * Turns the image a quarter `clockwise` or counterclockwise as seen on screen, and turns
	 * the pan with it. The turns apply before the flip, so a flipped image takes the
	 * opposite turn to look turned the requested way.
	 */
	#turn(clockwise: boolean): void {
		const step = clockwise !== this.#flipped ? 1 : 3;
		this.#quarterTurns = (this.#quarterTurns + step) % 4;
		const { x, y } = this.#offset;
		this.#offset = clockwise ? { x: -y, y: x } : { x: y, y: -x };
		this.#clampOffset();
	}

	/** Mirrors the image horizontally. */
	flipHorizontally(): void {
		this.#flipped = !this.#flipped;
		this.#offset = { x: -this.#offset.x, y: this.#offset.y };
	}

	/** Restores the zoom, pan, rotation and flip. */
	reset(): void {
		this.#zoom = 1;
		this.#offset = { x: 0, y: 0 };
		this.#quarterTurns = 0;
		this.#flipped = false;
	}

	/** Sets the image to crop; with `reset`, the zoom, pan, rotation and flip start over, as for a new picture. */
	setImage(image: CropImage | null, options: { reset?: boolean } = {}): void {
		this.#image = image;
		if (options.reset) this.reset();
		this.#clampOffset();
	}

	/** Sets the crop box size, as the cropper's layout measures it. */
	setBoxSize(box: CropSize): void {
		if (box.width === this.#box.width && box.height === this.#box.height) return;
		this.#box = { width: box.width, height: box.height };
		this.#clampOffset();
	}

	/** The image size after the quarter turns. */
	get #turnedImage(): CropSize {
		const size = sizeOf(this.#image as CropImage);
		return this.#quarterTurns % 2 === 1 ? { width: size.height, height: size.width } : size;
	}

	/** The image pixels to box pixels scale: the zoom times the scale at which the turned image just covers the box. */
	get #scale(): number {
		const turned = this.#turnedImage;
		const cover = Math.max(this.#box.width / turned.width, this.#box.height / turned.height);
		return cover * this.#zoom;
	}

	/** Limits the pan so the image still covers the box. */
	#clampOffset(): void {
		if (!this.#image || this.#box.width <= 0 || this.#box.height <= 0) return;
		const turned = this.#turnedImage;
		const scale = this.#scale;
		const maxX = Math.max(0, (turned.width * scale - this.#box.width) / 2);
		const maxY = Math.max(0, (turned.height * scale - this.#box.height) / 2);
		const x = Math.min(maxX, Math.max(-maxX, this.#offset.x));
		const y = Math.min(maxY, Math.max(-maxY, this.#offset.y));
		if (x !== this.#offset.x || y !== this.#offset.y) this.#offset = { x, y };
	}

	/** Paints the image as it shows in the crop box, with the box's top-left corner at the origin of `context`. */
	paintCrop(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D): void {
		const image = this.#image;
		const box = this.#box;
		if (!image || box.width <= 0 || box.height <= 0) return;
		const size = sizeOf(image);
		const scale = this.#scale;
		context.save();
		context.translate(box.width / 2 + this.#offset.x, box.height / 2 + this.#offset.y);
		context.scale(scale, scale);
		if (this.#flipped) context.scale(-1, 1);
		context.rotate((this.#quarterTurns * Math.PI) / 2);
		context.imageSmoothingQuality = 'medium';
		context.drawImage(image, -size.width / 2, -size.height / 2);
		context.restore();
	}

	/**
	 * Returns a new canvas with the crop at the image's resolution, or `width` pixels wide
	 * when given, cut to a circle when `circle` is set; `null` before the image loads or the
	 * box is laid out.
	 */
	crop(options: { width?: number; circle?: boolean } = {}): HTMLCanvasElement | null {
		const box = this.#box;
		if (!this.#image || box.width <= 0 || box.height <= 0) return null;
		const ratio = options.width !== undefined ? options.width / box.width : 1 / this.#scale;
		const canvas = document.createElement('canvas');
		canvas.width = Math.max(1, Math.round(box.width * ratio));
		canvas.height = Math.max(1, Math.round(box.height * ratio));
		const context = canvas.getContext('2d');
		if (!context) return null;
		context.scale(canvas.width / box.width, canvas.height / box.height);
		if (options.circle) {
			context.beginPath();
			context.ellipse(
				box.width / 2,
				box.height / 2,
				box.width / 2,
				box.height / 2,
				0,
				0,
				Math.PI * 2
			);
			context.clip();
		}
		this.paintCrop(context);
		return canvas;
	}

	/** Returns the crop encoded as `type` (PNG by default), or `null` when there is none; see `crop`. */
	cropBlob(
		options: { width?: number; circle?: boolean; type?: string; quality?: number } = {}
	): Promise<Blob | null> {
		const canvas = this.crop(options);
		if (!canvas) return Promise.resolve(null);
		return new Promise((resolve) =>
			canvas.toBlob(resolve, options.type ?? 'image/png', options.quality)
		);
	}
}

/**
 * Loads the image at `src` and, when its longest side is above `maxDimension`, scales it
 * down onto a canvas, keeping its aspect ratio, to bound the memory it takes. Set
 * `crossOrigin` to load an image of another origin with CORS, which the crop exports need:
 * a canvas painted with an image of another origin loaded without it can't be read, so
 * `CropController.cropBlob()` rejects.
 */
export async function loadCropImage(
	src: string,
	maxDimension: number | null,
	options: { crossOrigin?: 'anonymous' | 'use-credentials' | null } = {}
): Promise<CropImage> {
	const image = new Image();
	image.decoding = 'async';
	if (options.crossOrigin != null) image.crossOrigin = options.crossOrigin;
	image.src = src;
	await image.decode();
	const longest = Math.max(image.naturalWidth, image.naturalHeight);
	if (maxDimension === null || longest <= maxDimension) return image;
	const scale = maxDimension / longest;
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
	canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
	canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
	return canvas;
}
