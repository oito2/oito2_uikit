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

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte()],
	test: {
		expect: { requireAssertions: true },
		// Its modules import each other without file extensions, which only a bundler
		// resolves, so Vitest must process it instead of loading it through Node.
		server: { deps: { inline: ['@material/material-color-utilities'] } },
		passWithNoTests: true,
		projects: [
			{
				extends: true,
				test: {
					name: 'browser',
					include: ['src/**/*.svelte.{test,spec}.ts', 'src/**/*.browser.{test,spec}.ts'],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright(),
						// Chromium stands in for WebView2, WebKit for WebKitGTK and WKWebView.
						instances: [{ browser: 'chromium' }, { browser: 'webkit' }],
						expect: {
							toMatchScreenshot: {
								comparatorName: 'pixelmatch',
								// Font rasterization differs slightly between Linux machines; up to 0.5% of
								// the pixels may differ before a golden fails.
								comparatorOptions: { allowedMismatchedPixelRatio: 0.005 }
							}
						}
					}
				}
			},
			{
				extends: true,
				test: {
					name: 'node',
					environment: 'node',
					include: ['src/**/*.{test,spec}.ts'],
					exclude: ['src/**/*.svelte.{test,spec}.ts', 'src/**/*.browser.{test,spec}.ts']
				}
			}
		]
	}
});
