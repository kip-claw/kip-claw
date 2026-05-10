import yaml from '@rollup/plugin-yaml';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [yaml(), sveltekit()]
});
