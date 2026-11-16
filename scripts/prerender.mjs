import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectRoot, 'dist');
const serverEntry = path.join(projectRoot, 'dist-ssr', 'entry-server.js');
const rootMarker = '<div id="root"></div>';

const template = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');

if (!template.includes(rootMarker)) {
	throw new Error(`Prerender failed: ${rootMarker} not found in dist/index.html`);
}

const { render } = await import(pathToFileURL(serverEntry).href);
const appHtml = render('/');

await fs.writeFile(path.join(distDir, 'app.html'), template);
await fs.writeFile(path.join(distDir, 'index.html'), template.replace(rootMarker, `<div id="root">${appHtml}</div>`));

console.log(`Prerendered / (${(appHtml.length / 1024).toFixed(1)} kB of HTML)`);
process.exit(0);
