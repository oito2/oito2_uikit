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

// Smoke test of the desktop showcase through tauri-driver: starts the debug build, waits for the
// catalogue, opens the Button page and checks that the Tauri bridge is present. Speaks plain W3C
// WebDriver over HTTP, so it needs no client library.
//
// Usage: node smoke/webdriver.ts <application> [tauri-driver arguments...]
// The TAURI_DRIVER environment variable overrides the tauri-driver executable.

import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const [application, ...driverArgs] = process.argv.slice(2);
if (!application) {
	console.error('usage: node smoke/webdriver.ts <application> [tauri-driver arguments...]');
	process.exit(2);
}

const server = 'http://127.0.0.1:4444';

// Sends a WebDriver command and returns its value, throwing on a WebDriver error.
async function command(method: string, path: string, body?: unknown): Promise<unknown> {
	const response = await fetch(`${server}${path}`, {
		method,
		headers: { 'content-type': 'application/json' },
		body: body === undefined ? undefined : JSON.stringify(body)
	});
	const json = (await response.json()) as { value: unknown };
	if (!response.ok) throw new Error(`${method} ${path}: ${JSON.stringify(json.value)}`);
	return json.value;
}

// Calls `probe` until it returns a value other than undefined, or throws after `timeout` ms.
async function poll<T>(
	what: string,
	probe: () => Promise<T | undefined>,
	timeout = 30_000
): Promise<T> {
	const end = Date.now() + timeout;
	let last: unknown;
	while (Date.now() < end) {
		try {
			const value = await probe();
			if (value !== undefined) return value;
		} catch (error) {
			last = error;
		}
		await new Promise((done) => setTimeout(done, 250));
	}
	throw new Error(`timed out waiting for ${what}`, { cause: last });
}

const driver = spawn(process.env.TAURI_DRIVER ?? 'tauri-driver', driverArgs, { stdio: 'inherit' });
let session: string | undefined;

try {
	await poll('tauri-driver', async () => ((await command('GET', '/status')) ? true : undefined));
	const created = (await command('POST', '/session', {
		capabilities: {
			alwaysMatch: {
				browserName: 'wry',
				// webviewOptions makes msedgedriver drive the app's WebView2 instead of starting
				// the app as the Edge browser; other platforms ignore it.
				'tauri:options': { application: resolve(application), webviewOptions: {} }
			}
		}
	})) as { sessionId: string };
	session = created.sessionId;

	// Evaluates `script` in the main window.
	const run = (script: string) =>
		command('POST', `/session/${session}/execute/sync`, { script, args: [] });

	// Clicks the Button link from the page script once the catalogue has rendered:
	// WebKitWebDriver does not find the link by selector.
	await poll('the catalogue', async () =>
		(await run(
			'const link = document.querySelector(\'a[href$="/button"]\'); link?.click(); return link ? true : null;'
		)) === true
			? true
			: undefined
	);
	if (!(await run("return '__TAURI_INTERNALS__' in window;"))) {
		throw new Error('the Tauri bridge is missing');
	}
	// The title bar is the first level-one heading; the page title is another one.
	const heading = await poll('the Button page', async () =>
		(await run(
			"return [...document.querySelectorAll('h1')].some((h) => h.textContent.trim() === 'Button');"
		)) === true
			? 'Button'
			: undefined
	);
	console.log(`smoke test passed: opened the ${heading} page`);
} catch (error) {
	console.error(error);
	if (session) {
		const state = await command('POST', `/session/${session}/execute/sync`, {
			script: 'return [location.href, document.body?.innerText.slice(0, 500)];',
			args: []
		}).catch((reason: unknown) => reason);
		console.error('page state:', state);
	}
	process.exitCode = 1;
} finally {
	if (session) await command('DELETE', `/session/${session}`).catch(() => {});
	driver.kill();
}
