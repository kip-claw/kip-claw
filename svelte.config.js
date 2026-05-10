import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.md'],
			layout: join(__dirname, 'src/lib/BlogPostLayout.svelte')
		})
	],
	compilerOptions: {
		// Force runes mode for the project, except for mdsvex-generated files and libraries.
		runes: ({ filename }) => {
			if (filename.split(/[/\\]/).includes('node_modules')) return undefined;
			if (filename.endsWith('.md')) return false;
			return true;
		}
	},
	kit: { adapter: adapter() }
};

export default config;
