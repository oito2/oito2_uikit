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

import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env.CI;

/**
 * End-to-end tests of the built showcase: every catalogue page and the shell, in Chromium
 * (for WebView2) and WebKit (for WebKitGTK and WKWebView). Run `pnpm build` first; the
 * tests serve the build with `vite preview`.
 */
export default defineConfig({
	testDir: 'tests',
	testMatch: '*.spec.ts',
	fullyParallel: true,
	forbidOnly: ci,
	retries: ci ? 1 : 0,
	workers: ci ? 2 : 1,
	reporter: ci ? [['github'], ['list']] : 'list',
	timeout: 60_000,
	use: {
		baseURL: 'http://localhost:4173',
		locale: 'en-US',
		viewport: { width: 1280, height: 860 }
	},
	webServer: {
		command: 'pnpm preview --port 4173 --strictPort',
		url: 'http://localhost:4173',
		reuseExistingServer: !ci,
		timeout: 60_000
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 860 } }
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 860 } }
		}
	]
});
