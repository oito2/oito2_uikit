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

// Public API of @oito2/ui-extras.

export {
	qrErrorLevels,
	qrModules,
	qrPath,
	qrQuietZone,
	type QrErrorLevel,
	type QrModules
} from './qr/qr.js';
export { default as QrCode } from './qr/QrCode.svelte';
export {
	SignatureController,
	paintStrokes,
	type SignatureImageOptions,
	type SignaturePoint,
	type SignatureSize
} from './signature/signature-controller.svelte.js';
export { default as SignaturePad } from './signature/SignaturePad.svelte';
export {
	CropController,
	loadCropImage,
	type CropImage,
	type CropOffset,
	type CropSize
} from './crop/crop-controller.svelte.js';
export { default as ImageCropper } from './crop/ImageCropper.svelte';
export { default as CropPreview } from './crop/CropPreview.svelte';
export { NavigationMenuState } from './navigation-menu/navigation-menu-state.svelte.js';
export * as NavigationMenu from './navigation-menu/navigation-menu/index.js';
