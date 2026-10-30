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

import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';

// GitHub Pages serves the web build under /oito2_uikit; Tauri serves it from the root.
const base = (process.env.BASE_PATH ?? '') as '' | `/${string}`;

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Runes mode for the showcase sources; dependencies decide for themselves.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Single-page app: every route falls back to index.html.
			adapter: adapter({ fallback: 'index.html' }),
			paths: { base }
		})
	],
	// Tauri expects a fixed port and must see Rust errors in the terminal.
	clearScreen: false,
	server: {
		port: 5173,
		strictPort: true,
		watch: { ignored: ['**/src-tauri/**'] },
		// The workspace packages are linked from outside the app, and their fonts are served
		// from their own folders.
		fs: { allow: [searchForWorkspaceRoot(process.cwd())] }
	}
});
